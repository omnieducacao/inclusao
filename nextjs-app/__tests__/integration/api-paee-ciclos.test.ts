/**
 * Testes de Integração — API /api/students/[id]/paee-ciclos
 *
 * PATCH: Atualiza ciclos PAEE de um estudante
 *
 * Cenários:
 * - Rejeita sem autenticação
 * - Rejeita payload inválido (não-array)
 * - Atualiza ciclos com sucesso
 * - Scoped por workspace_id
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Session ────────────────────────────────────────────────────────────────

const defaultSession = {
    workspace_id: "ws-test",
    workspace_name: "Escola Teste",
    usuario_nome: "Prof. João",
    user_role: "master" as const,
    is_platform_admin: false,
    terms_accepted: true,
    exp: Date.now() / 1000 + 3600,
};

let sessionToReturn: typeof defaultSession | null = defaultSession;

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(() => Promise.resolve(sessionToReturn)),
}));

// ─── Mock Supabase ───────────────────────────────────────────────────────────────

let mockUpdateError: { message: string } | null = null;

const mockUpdate = vi.fn(() => ({
    eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: mockUpdateError })),
    })),
}));

vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn(() => ({
            update: mockUpdate,
        })),
    })),
}));

// ─── Mock Validation ─────────────────────────────────────────────────────────────

vi.mock("@/lib/validation", () => ({
    parseBody: vi.fn(async (req: Request) => {
        try {
            const body = await req.json();
            return { data: body, error: null };
        } catch {
            return {
                data: null,
                error: new Response(JSON.stringify({ error: "Invalid JSON" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }),
            };
        }
    }),
    studentPatchDataSchema: {},
}));

// ─── Import after mocks ──────────────────────────────────────────────────────────

import { PATCH } from "@/app/api/students/[id]/paee-ciclos/route";

// ─── Tests ───────────────────────────────────────────────────────────────────────

describe("API /api/students/[id]/paee-ciclos", () => {
    beforeEach(() => {
        sessionToReturn = { ...defaultSession };
        mockUpdateError = null;
        vi.clearAllMocks();
    });

    it("retorna 401 sem autenticação", async () => {
        sessionToReturn = null;

        const req = new Request("http://localhost/api/students/s1/paee-ciclos", {
            method: "PATCH",
            body: JSON.stringify({ paee_ciclos: [] }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(401);
    });

    it("retorna 400 quando paee_ciclos não é array", async () => {
        const req = new Request("http://localhost/api/students/s1/paee-ciclos", {
            method: "PATCH",
            body: JSON.stringify({ paee_ciclos: "invalid" }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toContain("array");
    });

    it("atualiza ciclos PAEE com sucesso", async () => {
        const ciclos = [
            {
                id: "ciclo-1",
                titulo: "Ciclo 1",
                inicio: "2026-01-01",
                metas: ["Meta 1"],
                status: "em_andamento",
            },
        ];

        const req = new Request("http://localhost/api/students/s1/paee-ciclos", {
            method: "PATCH",
            body: JSON.stringify({ paee_ciclos: ciclos }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.ok).toBe(true);
    });

    it("retorna 500 quando Supabase falha", async () => {
        mockUpdateError = { message: "DB error" };

        const req = new Request("http://localhost/api/students/s1/paee-ciclos", {
            method: "PATCH",
            body: JSON.stringify({ paee_ciclos: [{ id: "c1" }] }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(500);
    });
});
