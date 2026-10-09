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
        // onda 1: rota pública com resposta mínima (sem detalhes do servidor)
        it("retorna 200 com status, banco e tempo", async () => {
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.status).toBe("healthy");
            expect(data.banco).toBe("ok");
            expect(typeof data.ms).toBe("number");
        });

        it("não expõe detalhes internos", async () => {
            const data = await (await GET()).json();
            expect(data).not.toHaveProperty("checks");
            expect(data).not.toHaveProperty("environment");
            expect(data).not.toHaveProperty("uptime");
        });
    });

    describe("HEAD", () => {
        it("retorna status 200 sem body", async () => {
            const response = await HEAD();
            expect(response.status).toBe(200);
        });
    });
});
