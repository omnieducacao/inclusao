/**
 * Cache LRU com TTL para respostas de IA.
 * Reduz custos evitando chamadas duplicadas com mesmos prompts.
 * Funciona in-memory (sem dependência externa).
 * Para escalar, substituir por Upstash Redis.
 *
 * SCRUM-73: a chave é o SHA-256 de (escola + motor + mensagens). Antes era um hash de 32 bits sem a
 * escola; uma colisão podia devolver a resposta de um pedido para outro. Agora cada escola tem o seu cache.
 */
import { createHash } from "node:crypto";

interface CacheEntry {
    value: string;
    expiresAt: number;
}

const MAX_CACHE_SIZE = 200;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

class AICache {
    private cache = new Map<string, CacheEntry>();

    private chave(engine: string, messages: Array<{ role: string; content: string }>, workspaceId?: string | null): string {
        const h = createHash("sha256").update(JSON.stringify([workspaceId || null, engine, messages])).digest("hex");
        return `ai_${h}`;
    }

    /** Busca valor no cache. Retorna null se expirado ou inexistente. */
    get(engine: string, messages: Array<{ role: string; content: string }>, workspaceId?: string | null): string | null {
        const key = this.chave(engine, messages, workspaceId);
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    /** Armazena valor no cache com TTL. */
    set(
        engine: string,
        messages: Array<{ role: string; content: string }>,
        value: string,
        ttlMs: number = DEFAULT_TTL_MS,
        workspaceId?: string | null,
    ): void {
        // Não cachear respostas vazias
        if (!value || value.length < 50) return;

        const key = this.chave(engine, messages, workspaceId);

        // Eviction: se atingiu o tamanho máximo, remove a entrada mais antiga
        if (this.cache.size >= MAX_CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }

    /** Limpa entradas expiradas. */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /** Retorna estatísticas do cache. */
    stats(): { size: number; maxSize: number } {
        return { size: this.cache.size, maxSize: MAX_CACHE_SIZE };
    }
}

/** Instância global do cache de IA. */
export const aiCache = new AICache();
