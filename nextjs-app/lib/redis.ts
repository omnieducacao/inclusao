import { Redis } from '@upstash/redis'

// The URL and Token are securely injected from the environment variables by Vercel
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || 'https://dummy-fallback.upstash.io'
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy-token'

/**
 * Global Redis connection instance using Upstash HTTP REST.
 * This ensures edge-compatible connection without persistent socket exhaustion.
 */
export const redis = new Redis({
    url: redisUrl,
    token: redisToken,
})
