/**
 * Testes de Integração — API PGI (/api/pgi)
 *
 * Testa GET e PATCH do Plano de Gestão para Inclusão:
 * - GET retorna dados do PGI
 * - GET requer auth (workspace_id)
 * - PATCH requer permissão can_pgi
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({
        id: "u1",
        workspace_id: "w1",
        user_role: "professor",
        permissions: { can_pgi: true },
    }),
}));

vi.mock("@/lib/permissions", () => ({
    requirePermission: vi.fn().mockReturnValue(null), // null = allowed
}));

vi.mock("@/lib/pgi", () => ({
    getPGIData: vi.fn().mockResolvedValue({
        acoes: [
            { id: "a1", titulo: "Formação Docente", responsavel: "Coordenador", prazo: "2026-06-30" },
        ],
        dimensionamento: { professores_aee: 2, sala_recursos: true },
    }),
    updatePGIData: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/lib/validation", () => ({
    parseBody: vi.fn().mockResolvedValue({
        data: {
            acoes: [{ id: "a1", titulo: "Formação Docente Atualizada", responsavel: "Vice", prazo: "2026-08-30" }],
        },
        error: null,
    }),
    pgiPatchSchema: {},
}));

import { GET, PATCH } from "@/app/api/pgi/route";

describe("API PGI", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("GET retorna dados do PGI", async () => {
        const res = await GET();
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.acoes).toBeDefined();
        expect(data.acoes).toHaveLength(1);
        expect(data.acoes[0].titulo).toBe("Formação Docente");
        expect(data.dimensionamento).toBeDefined();
    });

    it("GET retorna 401 sem workspace_id", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: "u1" });

        const res = await GET();
        expect(res.status).toBe(401);
    });

    it("PATCH atualiza dados do PGI", async () => {
        const req = new Request("http://localhost/api/pgi", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ acoes: [{ id: "a1", titulo: "Novo" }] }),
        });
        // Cast to NextRequest
        const res = await PATCH(req as never);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.ok).toBe(true);
    });

    it("PATCH retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/pgi", {
            method: "PATCH",
            body: JSON.stringify({}),
        });
        const res = await PATCH(req as never);
        expect(res.status).toBe(401);
    });
});
