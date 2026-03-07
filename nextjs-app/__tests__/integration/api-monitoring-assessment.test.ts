/**
 * Testes de Integração — API Monitoring Assessment (/api/monitoring/assessment)
 *
 * Testa criação de avaliações de monitoramento:
 * - POST cria assessment com sucesso
 * - POST requer auth
 * - POST requer permissão can_monitoramento
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({
        id: "u1",
        workspace_id: "w1",
        usuario_nome: "Prof. Ana",
        member: { id: "m1" },
    }),
}));

vi.mock("@/lib/permissions", () => ({
    requirePermission: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/validation", () => ({
    parseBody: vi.fn().mockResolvedValue({
        data: {
            student_id: "s1",
            rubric_data: { atencao: 3, participacao: 4 },
            observation: "Boa evolução nas últimas semanas",
        },
        error: null,
    }),
    assessmentSchema: {},
}));

// Proxy chainable mock
function chainResult(result: Record<string, unknown>) {
    const handler: ProxyHandler<Record<string, unknown>> = {
        get(target, prop) {
            if (prop === "then") return undefined;
            if (["data", "error", "count"].includes(prop as string)) return result[prop as string];
            return () => new Proxy(result, handler);
        },
    };
    return new Proxy(result, handler);
}

vi.mock("@/lib/supabase", () => ({
    getSupabase: () => ({
        from: () => chainResult({ data: { id: "assess-1" }, error: null }),
    }),
}));

import { POST } from "@/app/api/monitoring/assessment/route";

describe("API Monitoring Assessment", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("POST cria avaliação com sucesso", async () => {
        const req = new Request("http://localhost/api/monitoring/assessment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: "s1", rubric_data: { atencao: 3 } }),
        });
        const res = await POST(req as never);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.id).toBe("assess-1");
    });

    it("POST retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/monitoring/assessment", {
            method: "POST",
            body: JSON.stringify({}),
        });
        const res = await POST(req as never);
        expect(res.status).toBe(401);
    });

    it("POST bloqueia quando permissão negada", async () => {
        const { requirePermission } = await import("@/lib/permissions");
        (requirePermission as ReturnType<typeof vi.fn>).mockReturnValueOnce(
            new Response(JSON.stringify({ error: "Sem permissão" }), { status: 403, headers: { "Content-Type": "application/json" } })
        );

        const req = new Request("http://localhost/api/monitoring/assessment", {
            method: "POST",
            body: JSON.stringify({}),
        });
        const res = await POST(req as never);
        expect(res.status).toBe(403);
    });
});
