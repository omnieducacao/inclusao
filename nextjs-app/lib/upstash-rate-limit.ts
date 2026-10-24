import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import { logger } from "@/lib/logger";

// Global limiter: 100 requests per 10 seconds per IP (general navigation/health)
export const globalRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "10 s"),
    analytics: true,
    ephemeralCache: new Map(),
});

// AI specific limiter: 15 requests per minute per IP to prevent burning quotas
export const aiRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "1 m"),
    analytics: true,
    ephemeralCache: new Map(),
});

type TipoLimite = 'global' | 'ai';

/**
 * Onda 89: limites do plano B em memória, por IP. Mais folgados que os do Redis porque a escola inteira sai
 * pelo mesmo IP público: 15 gerações por minuto bloqueariam professores legítimos gerando ao mesmo tempo.
 * O limite por pessoa continua nas rotas (lib/rate-limit.ts).
 */
export const LIMITES_MEMORIA: Record<TipoLimite, { max: number; janelaMs: number }> = {
    global: { max: 300, janelaMs: 10_000 },
    ai: { max: 60, janelaMs: 60_000 },
};

interface Janela { count: number; resetAt: number }
const memoria = new Map<string, Janela>();
const MAX_CHAVES_MEMORIA = 20_000;

/** IP só aparece no log mascarado (dado pessoal). */
function ipMascarado(ip: string): string {
    return ip.includes(".") ? `${ip.split(".").slice(0, 2).join(".")}.x.x` : `${ip.slice(0, 6)}…`;
}

/**
 * Plano B quando não há Redis (ou o Redis falha): contagem em memória, por instância. Antes, sem Redis o limite
 * por IP não existia (falhava aberto). Com mais de uma instância o limite fica por instância.
 */
export function limiteEmMemoria(ip: string, type: TipoLimite, agora = Date.now()) {
    const { max, janelaMs } = LIMITES_MEMORIA[type];
    const chave = `${type}:${ip}`;
    let w = memoria.get(chave);
    if (!w || agora >= w.resetAt) w = { count: 0, resetAt: agora + janelaMs };
    w.count += 1;
    memoria.set(chave, w);
    if (memoria.size > MAX_CHAVES_MEMORIA) {
        for (const [k, v] of memoria) if (agora >= v.resetAt) memoria.delete(k);
    }
    const success = w.count <= max;
    if (!success && w.count === max + 1) {
        logger.warn({ tipo: type, ip: ipMascarado(ip), max, janelaMs }, "[RateLimit] limite por IP excedido (memória)");
    }
    return { success, limit: max, remaining: Math.max(0, max - w.count), reset: w.resetAt };
}

/** Só para teste. */
export function zerarLimiteEmMemoria() { memoria.clear(); }

/**
 * Limite por IP usado pelo proxy. Em desenvolvimento libera tudo. Sem Redis, ou se o Redis falhar, usa o plano B
 * em memória (Onda 89: antes falhava aberto).
 */
export async function checkRateLimit(ip: string, type: TipoLimite = 'global') {
    if (process.env.NODE_ENV === 'development') {
        return { success: true, limit: 100, remaining: 100, reset: 0 };
    }
    if (!process.env.UPSTASH_REDIS_REST_URL) {
        return limiteEmMemoria(ip, type);
    }

    try {
        const limiter = type === 'ai' ? aiRateLimit : globalRateLimit;
        return await limiter.limit(ip);
    } catch (error) {
        logger.warn({ err: error }, "[Upstash RateLimit Error - usando limite em memória]");
        return limiteEmMemoria(ip, type);
    }
}
