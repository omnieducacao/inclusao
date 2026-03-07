/**
 * Testes de Integração — API /api/ai-engines/available
 *
 * GET: Lista motores de IA disponíveis (sem erros de configuração)
 *
 * Cenários:
 * - Retorna lista de motores disponíveis
 * - Filtra motores com erros
 * - Sempre retorna array
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock AI Engines ─────────────────────────────────────────────────────────────

let engineErrors: Record<string, string | null> = {};

vi.mock("@/lib/ai-engines", () => ({
    getEngineError: vi.fn((engine: string) => engineErrors[engine] || null),
}));

// ─── Import after mocks ──────────────────────────────────────────────────────────

import { GET } from "@/app/api/ai-engines/available/route";

// ─── Tests ───────────────────────────────────────────────────────────────────────

describe("API /api/ai-engines/available", () => {
    beforeEach(() => {
        engineErrors = {};
        vi.clearAllMocks();
    });

    it("retorna todos os 5 motores quando todos estão configurados", async () => {
        const res = await GET();
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.available).toEqual(["red", "blue", "green", "yellow", "orange"]);
    });

    it("filtra motores com API key faltando", async () => {
        engineErrors = {
            red: "DEEPSEEK_API_KEY not configured",
            yellow: "KIMI_API_KEY not configured",
        };

        const res = await GET();
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.available).toEqual(["blue", "green", "orange"]);
        expect(data.available).not.toContain("red");
        expect(data.available).not.toContain("yellow");
    });

    it("retorna array vazio quando nenhum motor está disponível", async () => {
        engineErrors = {
            red: "error", blue: "error", green: "error",
            yellow: "error", orange: "error",
        };

        const res = await GET();
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.available).toEqual([]);
    });
});
