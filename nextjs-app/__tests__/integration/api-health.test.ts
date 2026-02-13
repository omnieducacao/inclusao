import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before importing the route
vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                limit: vi.fn(() => ({
                    data: [{ id: "test-ws" }],
                    error: null,
                })),
            })),
        })),
    })),
}));

import { GET, HEAD } from "@/app/api/health/route";

describe("API /api/health", () => {
    describe("GET", () => {
        it("retorna status 200 com estrutura correta", async () => {
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveProperty("status");
            expect(data).toHaveProperty("timestamp");
            expect(data).toHaveProperty("uptime");
            expect(data).toHaveProperty("responseTime");
            expect(data).toHaveProperty("checks");
            expect(data).toHaveProperty("environment");
        });

        it("contém check de memory", async () => {
            const response = await GET();
            const data = await response.json();

            expect(data.checks).toHaveProperty("memory");
            expect(data.checks.memory.status).toBeTruthy();
        });

        it("contém check de database", async () => {
            const response = await GET();
            const data = await response.json();

            expect(data.checks).toHaveProperty("database");
        });

        it("timestamp é ISO válido", async () => {
            const response = await GET();
            const data = await response.json();

            const d = new Date(data.timestamp);
            expect(isNaN(d.getTime())).toBe(false);
        });

        it("responseTime é número positivo", async () => {
            const response = await GET();
            const data = await response.json();

            expect(typeof data.responseTime).toBe("number");
            expect(data.responseTime).toBeGreaterThanOrEqual(0);
        });
    });

    describe("HEAD", () => {
        it("retorna status 200 sem body", async () => {
            const response = await HEAD();
            expect(response.status).toBe(200);
        });
    });
});
