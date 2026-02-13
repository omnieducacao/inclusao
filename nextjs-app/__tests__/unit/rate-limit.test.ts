import { describe, it, expect, beforeEach } from "vitest";
import {
    checkRateLimit,
    getRateLimitKey,
    rateLimitResponse,
    RATE_LIMITS,
    type RateLimitConfig,
} from "@/lib/rate-limit";

// We need to reset the internal store between tests.
// Since the store is module-scoped, we clear it by exhausting and testing fresh keys.

function uniqueKey() {
    return `test:${Math.random().toString(36).slice(2)}`;
}

describe("rate-limit", () => {
    describe("checkRateLimit", () => {
        const config: RateLimitConfig = { maxRequests: 3, windowMs: 60_000 };

        it("permite requests dentro do limite", () => {
            const key = uniqueKey();
            const r1 = checkRateLimit(key, config);
            expect(r1.success).toBe(true);
            expect(r1.remaining).toBe(2);
            expect(r1.limit).toBe(3);
        });

        it("decrementa remaining a cada request", () => {
            const key = uniqueKey();
            checkRateLimit(key, config);
            const r2 = checkRateLimit(key, config);
            expect(r2.success).toBe(true);
            expect(r2.remaining).toBe(1);

            const r3 = checkRateLimit(key, config);
            expect(r3.success).toBe(true);
            expect(r3.remaining).toBe(0);
        });

        it("bloqueia após exceder o limite", () => {
            const key = uniqueKey();
            checkRateLimit(key, config);
            checkRateLimit(key, config);
            checkRateLimit(key, config);

            const r4 = checkRateLimit(key, config);
            expect(r4.success).toBe(false);
            expect(r4.remaining).toBe(0);
        });

        it("retorna resetMs positivo", () => {
            const key = uniqueKey();
            const r = checkRateLimit(key, config);
            expect(r.resetMs).toBeGreaterThan(0);
            expect(r.resetMs).toBeLessThanOrEqual(config.windowMs);
        });

        it("chaves diferentes são independentes", () => {
            const k1 = uniqueKey();
            const k2 = uniqueKey();
            checkRateLimit(k1, config);
            checkRateLimit(k1, config);
            checkRateLimit(k1, config);

            const r = checkRateLimit(k2, config);
            expect(r.success).toBe(true);
            expect(r.remaining).toBe(2);
        });
    });

    describe("getRateLimitKey", () => {
        it("extrai IP do header x-forwarded-for", () => {
            const req = new Request("http://localhost/test", {
                headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
            });
            const key = getRateLimitKey(req, "auth");
            expect(key).toBe("auth:192.168.1.1");
        });

        it("usa 'unknown' quando não há header", () => {
            const req = new Request("http://localhost/test");
            const key = getRateLimitKey(req, "api");
            expect(key).toBe("api:unknown");
        });

        it("funciona sem prefixo", () => {
            const req = new Request("http://localhost/test");
            const key = getRateLimitKey(req);
            expect(key).toBe(":unknown");
        });
    });

    describe("rateLimitResponse", () => {
        it("retorna null quando dentro do limite", () => {
            const req = new Request("http://localhost/test", {
                headers: { "x-forwarded-for": uniqueKey() },
            });
            const config: RateLimitConfig = { maxRequests: 5, windowMs: 60_000 };
            const res = rateLimitResponse(req, config, "test-ok");
            expect(res).toBeNull();
        });

        it("retorna Response 429 quando excede o limite", () => {
            const ip = uniqueKey();
            const config: RateLimitConfig = { maxRequests: 1, windowMs: 60_000 };

            const req1 = new Request("http://localhost/test", {
                headers: { "x-forwarded-for": ip },
            });
            rateLimitResponse(req1, config, "test-429");

            const req2 = new Request("http://localhost/test", {
                headers: { "x-forwarded-for": ip },
            });
            const res = rateLimitResponse(req2, config, "test-429");
            expect(res).not.toBeNull();
            expect(res!.status).toBe(429);
            expect(res!.headers.get("Retry-After")).toBeTruthy();
            expect(res!.headers.get("X-RateLimit-Remaining")).toBe("0");
        });
    });

    describe("RATE_LIMITS constants", () => {
        it("define AI_GENERATION", () => {
            expect(RATE_LIMITS.AI_GENERATION.maxRequests).toBe(30);
            expect(RATE_LIMITS.AI_GENERATION.windowMs).toBe(3_600_000);
        });

        it("define AI_IMAGE com limite menor", () => {
            expect(RATE_LIMITS.AI_IMAGE.maxRequests).toBe(10);
        });

        it("define AUTH com janela de 15 minutos", () => {
            expect(RATE_LIMITS.AUTH.windowMs).toBe(15 * 60 * 1000);
        });
    });
});
