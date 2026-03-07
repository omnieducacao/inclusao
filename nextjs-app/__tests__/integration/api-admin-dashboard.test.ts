/**
 * Testes de Integração — API /api/admin/dashboard
 *
 * GET: Retorna KPIs do painel admin (somente platform_admin)
 *
 * Cenários:
 * - Rejeita sem autenticação de admin
 * - Retorna KPIs para platform_admin
 * - Inclui school_breakdown
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Session ────────────────────────────────────────────────────────────────

const defaultSession = {
    workspace_id: "ws-admin",
    workspace_name: "Admin",
    usuario_nome: "Admin Master",
    user_role: "master" as const,
    is_platform_admin: true,
    terms_accepted: true,
    exp: Date.now() / 1000 + 3600,
};

let sessionToReturn: typeof defaultSession | null = defaultSession;

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(() => Promise.resolve(sessionToReturn)),
}));

// ─── Mock Supabase ───────────────────────────────────────────────────────────────

function createChain(data: unknown = [], count: number | null = null) {
    const chain: Record<string, unknown> = {};
    const methods = ["select", "eq", "not", "is", "gte", "order", "ilike", "neq", "in"];
    methods.forEach(m => {
        chain[m] = vi.fn(() => chain);
    });
    chain.then = vi.fn((cb: (v: { data: unknown; count: unknown; error: null }) => void) =>
        Promise.resolve({ data, count, error: null }).then(cb));
    return chain;
}

vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn((table: string) => {
            switch (table) {
                case "workspaces":
                    return createChain([
                        { id: "ws-1", name: "Escola A", active: true, created_at: "2026-01-01" },
                        { id: "ws-2", name: "Escola B", active: false, created_at: "2026-02-01" },
                    ]);
                case "workspace_members":
                    return createChain([
                        { id: "m1", workspace_id: "ws-1", nome: "Prof A", role: "master", active: true },
                        { id: "m2", workspace_id: "ws-1", nome: "Prof B", role: "member", active: true },
                        { id: "m3", workspace_id: "ws-2", nome: "Prof C", role: "master", active: false },
                    ]);
                case "students":
                    return createChain([{ workspace_id: "ws-1" }, { workspace_id: "ws-1" }], 2);
                case "usage_events":
                    return createChain([], 15);
                default:
                    return createChain();
            }
        }),
    })),
}));

// ─── Import after mocks ──────────────────────────────────────────────────────────

import { GET } from "@/app/api/admin/dashboard/route";

// ─── Tests ───────────────────────────────────────────────────────────────────────

describe("API /api/admin/dashboard", () => {
    beforeEach(() => {
        sessionToReturn = { ...defaultSession };
        vi.clearAllMocks();
    });

    it("retorna 403 para não-admin", async () => {
        sessionToReturn = { ...defaultSession, is_platform_admin: false };

        const res = await GET();
        expect(res.status).toBe(403);

        const data = await res.json();
        expect(data.error).toContain("negado");
    });

    it("retorna 403 sem sessão", async () => {
        sessionToReturn = null;

        const res = await GET();
        expect(res.status).toBe(403);
    });

    it("retorna KPIs para platform_admin", async () => {
        const res = await GET();
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.kpis).toBeDefined();
        expect(data.kpis.total_schools).toBeGreaterThanOrEqual(0);
        expect(data.kpis.total_users).toBeGreaterThanOrEqual(0);
        expect(data.kpis.total_students).toBeGreaterThanOrEqual(0);
    });

    it("inclui school_breakdown", async () => {
        const res = await GET();
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.school_breakdown).toBeDefined();
        expect(Array.isArray(data.school_breakdown)).toBe(true);
    });
});
