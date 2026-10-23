/**
 * In-memory rate limiter for API routes.
 * 
 * Uses a sliding window approach per key (IP or workspace ID).
 * Suitable for single-instance deployments (MVP).
 * For multi-instance, migrate to Upstash Redis.
 */
import { createHash } from "crypto";
import { logger } from "@/lib/logger";
import { getSession } from "@/lib/session";

type RateLimitEntry = {
    timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of store.entries()) {
        // Remove entries older than the window
        entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
        if (entry.timestamps.length === 0) {
            store.delete(key);
        }
    }
}

export type RateLimitConfig = {
    /** Maximum requests allowed within the window */
    maxRequests: number;
    /** Window duration in milliseconds */
    windowMs: number;
};

export type RateLimitResult = {
    success: boolean;
    remaining: number;
    limit: number;
    resetMs: number;
};

/**
 * Check if a request is within rate limits.
 * 
 * @param key - Unique identifier (e.g., IP address, workspace ID)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and remaining quota
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    cleanup(config.windowMs);

    let entry = store.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs);

    const remaining = Math.max(0, config.maxRequests - entry.timestamps.length);
    const resetMs = entry.timestamps.length > 0
        ? entry.timestamps[0] + config.windowMs - now
        : config.windowMs;

    if (entry.timestamps.length >= config.maxRequests) {
        return { success: false, remaining: 0, limit: config.maxRequests, resetMs };
    }

    entry.timestamps.push(now);
    return { success: true, remaining: remaining - 1, limit: config.maxRequests, resetMs };
}

/**
 * Limites prontos. Cada um tem um nome, e o nome entra na chave: login, IA e formulários não
 * dividem o mesmo balde (SCRUM-229: antes todos usavam só o IP, e gerar material gastava as
 * tentativas de login). Os limites "por IP" são tetos largos, porque numa escola todos os
 * professores costumam sair pelo mesmo IP; o limite fino é por pessoa (IA) ou por e-mail (login).
 */
export const RATE_LIMITS = {
    /** Geração com IA: 30 por hora por pessoa */
    AI_GENERATION: { maxRequests: 30, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
    /** Geração de imagem: 10 por hora por pessoa (mais cara) */
    AI_IMAGE: { maxRequests: 10, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
    /** Teto de IA por IP (a escola inteira atrás de um IP): 300 por hora */
    AI_IP: { maxRequests: 300, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
    /** Login: 10 tentativas a cada 15 min para o mesmo e-mail no mesmo IP (força bruta) */
    AUTH: { maxRequests: 10, windowMs: 15 * 60 * 1000 } as RateLimitConfig,
    /** Teto de login por IP: 60 a cada 15 min (início do turno numa escola) */
    AUTH_IP: { maxRequests: 60, windowMs: 15 * 60 * 1000 } as RateLimitConfig,
    /** Formulários públicos (contato, demonstração, certificado): 5 a cada 10 min por IP */
    FORM_PUBLIC: { maxRequests: 5, windowMs: 10 * 60 * 1000 } as RateLimitConfig,
    /** Medição de desempenho do navegador: 60 a cada 10 min por IP */
    VITALS: { maxRequests: 60, windowMs: 10 * 60 * 1000 } as RateLimitConfig,
};

/** Nome do limite (para a chave e para o log). Configuração solta vira "n/janela". */
function nomeDoLimite(config: RateLimitConfig): string {
    const achado = Object.entries(RATE_LIMITS).find(([, c]) => c === config);
    return achado ? achado[0] : `${config.maxRequests}/${config.windowMs}`;
}

/** IP de quem chamou (primeiro do X-Forwarded-For). */
export function ipDaRequisicao(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Extract a rate limit key from a request.
 * Uses X-Forwarded-For, then falls back to a generic key.
 */
export function getRateLimitKey(req: Request, prefix: string = ""): string {
    return `${prefix}:${ipDaRequisicao(req)}`;
}

/** Resumo curto e irreversível do identificador, para o log não guardar IP nem e-mail. */
function resumo(texto: string): string {
    return createHash("sha256").update(texto).digest("hex").slice(0, 12);
}

function resposta429(resetMs: number, limite: number): Response {
    const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));
    return new Response(
        JSON.stringify({
            error: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
            retryAfterSeconds: retryAfterSec,
        }),
        {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfterSec),
                "X-RateLimit-Limit": String(limite),
                "X-RateLimit-Remaining": "0",
            },
        }
    );
}

/**
 * Confere um limite para uma chave qualquer (ex.: "auth:ip:email"). Devolve 429 ou null.
 * Quando barra, registra no log o nome do limite e um resumo da chave (nunca o valor).
 */
export function limitarPorChave(chave: string, config: RateLimitConfig, nome = nomeDoLimite(config)): Response | null {
    const result = checkRateLimit(`${nome}:${chave}`, config);
    if (result.success) return null;
    logger.warn({ limite: nome, chave: resumo(chave), maximo: config.maxRequests, janelaMs: config.windowMs }, "Limite de requisições atingido");
    return resposta429(result.resetMs, result.limit);
}

/**
 * Returns a 429 Response if rate limited, or null if allowed.
 * Drop-in helper for API routes. A chave é o IP, separada por tipo de limite.
 */
export function rateLimitResponse(
    req: Request,
    config: RateLimitConfig = RATE_LIMITS.AI_GENERATION,
    prefix: string = ""
): Response | null {
    return limitarPorChave(ipDaRequisicao(req), config, prefix || nomeDoLimite(config));
}

/**
 * Limite das rotas de IA: por pessoa logada (o professor não gasta a cota do colega da mesma
 * escola) e um teto largo por IP. Sem sessão, cai só no IP.
 */
export async function rateLimitIA(req: Request, config: RateLimitConfig = RATE_LIMITS.AI_GENERATION): Promise<Response | null> {
    const ip = ipDaRequisicao(req);
    const porIp = limitarPorChave(ip, RATE_LIMITS.AI_IP);
    if (porIp) return porIp;

    const session = await getSession().catch(() => null);
    const membro = session?.simulating_member_id || ((session?.member as { id?: unknown } | undefined)?.id as string | undefined);
    const pessoa = session?.workspace_id
        ? `${session.workspace_id}:${membro || `${session.user_role}:${session.usuario_nome}`}`
        : `ip:${ip}`;
    return limitarPorChave(pessoa, config);
}
