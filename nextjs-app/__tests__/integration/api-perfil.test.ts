/**
 * Testes de Integração — API Perfil (/api/perfil)
 *
 * Testa o perfil do usuário logado:
 * - GET retorna dados do perfil
 * - GET requer auth
 * - PATCH requer campos obrigatórios
 * - PATCH rejeita senha curta
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({
        id: "u1",
        workspace_id: "w1",
        usuario_nome: "Prof. Ana",
        workspace_name: "Escola Modelo",
        user_role: "professor",
        member: { id: "m1" },
    }),
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
        from: () => chainResult({
            data: {
                id: "m1",
                nome: "Prof. Ana",
                email: "ana@escola.br",
                cargo: "Professor",
                can_pei: true,
                can_hub: true,
                can_estudantes: true,
                can_paee: false,
                can_pei_professor: true,
                can_diario: true,
                can_avaliacao: true,
                can_gestao: false,
            },
            error: null,
        }),
    }),
}));

import { GET, PATCH } from "@/app/api/perfil/route";

describe("API Perfil", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("GET retorna perfil com sessão válida", async () => {
        const res = await GET();
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.nome).toBe("Prof. Ana");
        expect(data.workspace_name).toBe("Escola Modelo");
        expect(data.user_role).toBe("professor");
    });

    it("GET retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const res = await GET();
        expect(res.status).toBe(401);
    });

    it("PATCH rejeita sem campos obrigatórios", async () => {
        const req = new Request("http://localhost/api/perfil", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const res = await PATCH(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain("obrigatórias");
    });

    it("PATCH rejeita senha menor que 4 caracteres", async () => {
        const req = new Request("http://localhost/api/perfil", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha_atual: "old123", nova_senha: "ab" }),
        });
        const res = await PATCH(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain("mínimo 4");
    });

    it("PATCH retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/perfil", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha_atual: "old", nova_senha: "new123" }),
        });
        const res = await PATCH(req);
        expect(res.status).toBe(401);
    });
});
