/**
 * Testes de Integração — API /api/students/[id]/diario
 *
 * PATCH: Atualiza registros do Diário de Bordo
 *
 * Cenários:
 * - Rejeita sem autenticação
 * - Rejeita sem permissão can_diario
 * - Atualiza registros com sucesso
 * - Trata erro do service layer
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Session ────────────────────────────────────────────────────────────────

const defaultSession = {
    workspace_id: "ws-test",
    workspace_name: "Escola Teste",
    usuario_nome: "Prof. Ana",
    user_role: "member" as const,
    is_platform_admin: false,
    terms_accepted: true,
    exp: Date.now() / 1000 + 3600,
    can_diario: true,
};

let sessionToReturn: typeof defaultSession | null = defaultSession;

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(() => Promise.resolve(sessionToReturn)),
}));

// ─── Mock Permissions ────────────────────────────────────────────────────────────

vi.mock("@/lib/permissions", () => ({
    requirePermission: vi.fn((session: Record<string, unknown>, perm: string) => {
        if (!session[perm]) {
            return new Response(
                JSON.stringify({ error: `Permissão '${perm}' requerida` }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }
        return null;
    }),
}));

// ─── Mock Students Service ───────────────────────────────────────────────────────

let mockUpdateResult = { success: true, error: null as string | null };

vi.mock("@/lib/students", () => ({
    updateStudentDailyLogs: vi.fn(() => Promise.resolve(mockUpdateResult)),
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

import { PATCH } from "@/app/api/students/[id]/diario/route";

// ─── Tests ───────────────────────────────────────────────────────────────────────

describe("API /api/students/[id]/diario", () => {
    beforeEach(() => {
        sessionToReturn = { ...defaultSession };
        mockUpdateResult = { success: true, error: null };
        vi.clearAllMocks();
    });

    it("retorna 401 sem autenticação", async () => {
        sessionToReturn = null;

        const req = new Request("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({ daily_logs: [] }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(401);
    });

    it("retorna 403 sem permissão can_diario", async () => {
        sessionToReturn = { ...defaultSession, can_diario: false as unknown as true };

        const req = new Request("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({ daily_logs: [] }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(403);
    });

    it("atualiza Diário de Bordo com sucesso", async () => {
        const logs = [
            {
                date: "2026-03-06",
                content: "Estudante participou bem da atividade de grupo.",
                tags: ["participação", "socialização"],
            },
        ];

        const req = new Request("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({ daily_logs: logs }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.ok).toBe(true);
    });

    it("retorna 500 quando service falha", async () => {
        mockUpdateResult = { success: false, error: "Erro ao salvar" };

        const req = new Request("http://localhost", {
            method: "PATCH",
            body: JSON.stringify({ daily_logs: [{ date: "2026-03-06", content: "..." }] }),
            headers: { "Content-Type": "application/json" },
        });

        const response = await PATCH(req, { params: Promise.resolve({ id: "s1" }) });
        expect(response.status).toBe(500);
    });
});
