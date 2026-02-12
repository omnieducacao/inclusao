/**
 * In-memory rate limiter for API routes.
 * 
 * Uses a sliding window approach per key (IP or workspace ID).
 * Suitable for single-instance deployments (MVP).
 * For multi-instance, migrate to Upstash Redis.
 */

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

/** Pre-configured rate limits */
export const RATE_LIMITS = {
    /** AI generation routes: 30 requests per hour per key */
    AI_GENERATION: { maxRequests: 30, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
    /** Image generation: 10 per hour (more expensive) */
    AI_IMAGE: { maxRequests: 10, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
    /** Auth routes: 10 attempts per 15 minutes */
    AUTH: { maxRequests: 10, windowMs: 15 * 60 * 1000 } as RateLimitConfig,
};

/**
 * Extract a rate limit key from a request.
 * Uses X-Forwarded-For, then falls back to a generic key.
 */
export function getRateLimitKey(req: Request, prefix: string = ""): string {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    return `${prefix}:${ip}`;
}

/**
 * Returns a 429 Response if rate limited, or null if allowed.
 * Drop-in helper for API routes.
 */
export function rateLimitResponse(
    req: Request,
    config: RateLimitConfig = RATE_LIMITS.AI_GENERATION,
    prefix: string = ""
): Response | null {
    const key = getRateLimitKey(req, prefix);
    const result = checkRateLimit(key, config);

    if (!result.success) {
        const retryAfterSec = Math.ceil(result.resetMs / 1000);
        return new Response(
            JSON.stringify({
                error: "Limite de requisições excedido. Tente novamente em alguns minutos.",
                retryAfterSeconds: retryAfterSec,
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "Retry-After": String(retryAfterSec),
                    "X-RateLimit-Limit": String(result.limit),
                    "X-RateLimit-Remaining": "0",
                },
            }
        );
    }

    return null;
}
