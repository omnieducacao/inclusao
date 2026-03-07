/**
 * Testes de Integração — API PAEE Diagnóstico Barreiras (/api/paee/diagnostico-barreiras)
 *
 * Testa geração de diagnóstico de barreiras LBI:
 * - POST gera diagnóstico com sucesso
 * - POST requer auth
 * - POST valida body
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/permissions", () => ({
    requireAuth: vi.fn().mockResolvedValue({ error: null, session: { id: "u1" } }),
}));

vi.mock("@/lib/rate-limit", () => ({
    rateLimitResponse: vi.fn().mockReturnValue(null),
    RATE_LIMITS: { AI_GENERATION: { maxRequests: 10, windowMs: 60000 } },
}));

vi.mock("@/lib/validation", () => ({
    parseBody: vi.fn().mockResolvedValue({
        data: {
            observacoes: "Dificuldade de atenção e interação social",
            studentId: "s1",
            studentName: "João",
            diagnosis: "TEA",
            contextoPei: "Nível 2 de suporte",
            engine: "red",
        },
        error: null,
    }),
    diagnosticoBarreirasSchema: {},
}));

vi.mock("@/lib/ai-anonymize", () => ({
    anonymizeMessages: vi.fn().mockImplementation((msgs: Array<{ role: string; content: string }>, _name: string) => ({
        anonymized: msgs,
        restore: (text: string) => text,
    })),
}));

vi.mock("@/lib/ai-engines", () => ({
    chatCompletionText: vi.fn().mockResolvedValue(
        "BARREIRAS COMUNICACIONAIS\n\nDescrição: Dificuldade na comunicação verbal...\n\nSugestões de Intervenção:\n- Utilizar CAA\n- Apoio visual"
    ),
}));

import { POST } from "@/app/api/paee/diagnostico-barreiras/route";

describe("API PAEE Diagnóstico Barreiras", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("POST gera diagnóstico com sucesso", async () => {
        const req = new Request("http://localhost/api/paee/diagnostico-barreiras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ observacoes: "test", engine: "red" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.diagnostico).toBeDefined();
        expect(data.diagnostico).toContain("BARREIRAS");
    });

    it("POST retorna 401 sem auth", async () => {
        const { requireAuth } = await import("@/lib/permissions");
        (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            error: new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { "Content-Type": "application/json" } }),
        });
        const req = new Request("http://localhost/api/paee/diagnostico-barreiras", {
            method: "POST",
            body: JSON.stringify({}),
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it("POST retorna erro quando parseBody falha", async () => {
        const { parseBody } = await import("@/lib/validation");
        (parseBody as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            data: null,
            error: new Response(JSON.stringify({ error: "Campo obrigatório" }), { status: 400, headers: { "Content-Type": "application/json" } }),
        });
        const req = new Request("http://localhost/api/paee/diagnostico-barreiras", {
            method: "POST",
            body: JSON.stringify({}),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });
});
