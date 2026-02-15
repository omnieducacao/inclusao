/**
 * Cache LRU com TTL para respostas de IA.
 * Reduz custos evitando chamadas duplicadas com mesmos prompts.
 * Funciona in-memory (sem dependência externa).
 * Para escalar, substituir por Upstash Redis.
 */

interface CacheEntry {
    value: string;
    expiresAt: number;
}

const MAX_CACHE_SIZE = 200;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

class AICache {
    private cache = new Map<string, CacheEntry>();

    /**
     * Gera hash simples para usar como chave de cache.
     * Baseado em djb2 — rápido e suficiente para chaves de cache.
     */
    private hash(input: string): string {
        let h = 5381;
        for (let i = 0; i < input.length; i++) {
            h = ((h << 5) + h + input.charCodeAt(i)) | 0;
        }
        return `ai_${(h >>> 0).toString(36)}`;
    }

    /** Busca valor no cache. Retorna null se expirado ou inexistente. */
    get(engine: string, messages: Array<{ role: string; content: string }>): string | null {
        const key = this.hash(`${engine}:${JSON.stringify(messages)}`);
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
        ttlMs: number = DEFAULT_TTL_MS
    ): void {
        // Não cachear respostas vazias
        if (!value || value.length < 50) return;

        const key = this.hash(`${engine}:${JSON.stringify(messages)}`);

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
