import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

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

/**
 * Main Rate Limiting Firewall helper function to be imported directly into Next.js App Router API Handlers.
 * In development, or if Redis is not configured, it fails open to prevent local blockage.
 */
export async function checkRateLimit(ip: string, type: 'global' | 'ai' = 'global') {
    if (process.env.NODE_ENV === 'development' || !process.env.UPSTASH_REDIS_REST_URL) {
        return { success: true, limit: 100, remaining: 100, reset: 0 };
    }

    try {
        const limiter = type === 'ai' ? aiRateLimit : globalRateLimit;
        return await limiter.limit(ip);
    } catch (error) {
        console.warn("[Upstash RateLimit Error - Falling Back to Open]:", error);
        return { success: true, limit: 100, remaining: 100, reset: 0 };
    }
}
