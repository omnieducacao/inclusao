/**
 * Testes de Integração — API /api/plano-curso
 *
 * GET:    Lista planos de curso (filtra por componente/série)
 * POST:   Cria ou atualiza plano de curso
 * DELETE: Remove plano de curso
 *
 * Cenários:
 * - Auth: rejeita sem autenticação (GET, POST, DELETE)
 * - GET: retorna lista de planos
 * - POST: valida campos obrigatórios (componente, serie)
 * - POST: cria plano com sucesso
 * - DELETE: requer id
 * - DELETE: remove com sucesso
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Session ────────────────────────────────────────────────────────────────

const defaultSession = {
    workspace_id: "ws-test",
    workspace_name: "Escola Teste",
    usuario_nome: "Prof. Maria",
    user_role: "master" as const,
    is_platform_admin: false,
    terms_accepted: true,
    exp: Date.now() / 1000 + 3600,
    member: { id: "member-1" },
};

let sessionToReturn: typeof defaultSession | null = defaultSession;

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(() => Promise.resolve(sessionToReturn)),
}));

// ─── Mock Supabase ───────────────────────────────────────────────────────────────

const mockPlano = {
    id: "plan-1",
    workspace_id: "ws-test",
    disciplina: "Matemática",
    ano_serie: "3º Ano",
    bimestre: "1º Bimestre",
    conteudo: JSON.stringify({ blocos: [] }),
    habilidades_bncc: ["EF03MA01"],
    professor_nome: "Prof. Maria",
    professor_id: "member-1",
    updated_at: "2026-03-06T00:00:00.000Z",
};

let mockQueryData: unknown[] | unknown = [mockPlano];
let mockQueryError: { message: string } | null = null;
let mockDeleteError: { message: string } | null = null;

function createPlanoChain(returnData: unknown = mockQueryData, returnError: unknown = mockQueryError) {
    const chain: Record<string, unknown> = {};
    const methods = ["select", "eq", "ilike", "or", "is", "neq", "not", "in", "order", "limit", "insert", "update", "delete"];
    methods.forEach(m => {
        chain[m] = vi.fn(() => chain);
    });
    chain.maybeSingle = vi.fn(() => Promise.resolve({ data: returnData, error: returnError }));
    chain.single = vi.fn(() => Promise.resolve({ data: returnData, error: returnError }));
    // Allow the chain to resolve as a Promise (for queries that end without .single())
    chain.then = vi.fn((cb: (v: { data: unknown; error: unknown }) => void) =>
        Promise.resolve({ data: returnData, error: returnError }).then(cb));
    return chain;
}

vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn((table: string) => {
            if (table === "workspace_members") {
                return createPlanoChain({ id: "member-1" });
            }
            if (table === "planos_ensino") {
                return createPlanoChain(mockQueryData, mockQueryError);
            }
            return createPlanoChain(null);
        }),
    })),
}));

// ─── Import after mocks ──────────────────────────────────────────────────────────

import { GET, POST, DELETE } from "@/app/api/plano-curso/route";

// ─── Tests ───────────────────────────────────────────────────────────────────────

describe("API /api/plano-curso", () => {
    beforeEach(() => {
        sessionToReturn = { ...defaultSession };
        mockQueryData = [mockPlano];
        mockQueryError = null;
        mockDeleteError = null;
        vi.clearAllMocks();
    });

    // ──── Auth ───────────────────────────────────────────────────────────────

    describe("autenticação", () => {
        it("GET retorna 401 sem sessão", async () => {
            sessionToReturn = null;
            const req = new Request("http://localhost/api/plano-curso");
            const res = await GET(req);
            expect(res.status).toBe(401);
        });

        it("POST retorna 401 sem sessão", async () => {
            sessionToReturn = null;
            const req = new Request("http://localhost/api/plano-curso", {
                method: "POST",
                body: JSON.stringify({ componente: "Matemática", serie: "3º Ano" }),
                headers: { "Content-Type": "application/json" },
            });
            const res = await POST(req);
            expect(res.status).toBe(401);
        });

        it("DELETE retorna 401 sem sessão", async () => {
            sessionToReturn = null;
            const req = new Request("http://localhost/api/plano-curso?id=plan-1");
            const res = await DELETE(req);
            expect(res.status).toBe(401);
        });
    });

    // ──── GET ────────────────────────────────────────────────────────────────

    describe("GET", () => {
        it("retorna lista de planos", async () => {
            const req = new Request("http://localhost/api/plano-curso?componente=Matemática&serie=3º Ano");
            const res = await GET(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toHaveProperty("planos");
        });

        it("retorna plano por ID", async () => {
            mockQueryData = mockPlano; // Single object
            const req = new Request("http://localhost/api/plano-curso?id=plan-1");
            const res = await GET(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toHaveProperty("plano");
        });
    });

    // ──── POST ───────────────────────────────────────────────────────────────

    describe("POST", () => {
        it("retorna 400 sem componente", async () => {
            const req = new Request("http://localhost/api/plano-curso", {
                method: "POST",
                body: JSON.stringify({ serie: "3º Ano" }),
                headers: { "Content-Type": "application/json" },
            });
            const res = await POST(req);
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data.error).toContain("obrigatório");
        });

        it("retorna 400 sem serie", async () => {
            const req = new Request("http://localhost/api/plano-curso", {
                method: "POST",
                body: JSON.stringify({ componente: "Matemática" }),
                headers: { "Content-Type": "application/json" },
            });
            const res = await POST(req);
            expect(res.status).toBe(400);
        });

        it("cria plano com dados completos", async () => {
            mockQueryData = mockPlano;
            const req = new Request("http://localhost/api/plano-curso", {
                method: "POST",
                body: JSON.stringify({
                    componente: "Matemática",
                    serie: "3º Ano",
                    bimestre: "1º Bimestre",
                    conteudo: JSON.stringify({ blocos: [] }),
                    habilidades_bncc: ["EF03MA01"],
                }),
                headers: { "Content-Type": "application/json" },
            });
            const res = await POST(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
            expect(data.plano).toBeDefined();
        });
    });

    // ──── DELETE ──────────────────────────────────────────────────────────────

    describe("DELETE", () => {
        it("retorna 400 sem id", async () => {
            const req = new Request("http://localhost/api/plano-curso");
            const res = await DELETE(req);
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data.error).toContain("id");
        });

        it("remove plano com sucesso", async () => {
            const req = new Request("http://localhost/api/plano-curso?id=plan-1");
            const res = await DELETE(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.ok).toBe(true);
        });
    });
});
