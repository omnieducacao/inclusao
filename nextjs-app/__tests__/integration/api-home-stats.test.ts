/**
 * Testes de Integração — API Home Stats (/api/home/stats)
 *
 * Testa KPIs do dashboard:
 * - Retorna zeros para platform_admin
 * - Retorna KPIs para workspace user
 * - Requer autenticação
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSession = {
    id: "u1",
    workspace_id: "w1",
    is_platform_admin: false,
};

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({
        id: "u1",
        workspace_id: "w1",
        is_platform_admin: false,
    }),
}));

// Chainable supabase mock — returns count for head queries, data for data queries
function chainResult(result: Record<string, unknown>) {
    const handler: ProxyHandler<Record<string, unknown>> = {
        get(target, prop) {
            if (prop === "then") return undefined; // not thenable itself
            if (["count", "data", "error"].includes(prop as string)) return result[prop as string];
            return () => new Proxy(result, handler);
        },
    };
    return new Proxy(result, handler);
}

vi.mock("@/lib/supabase", () => ({
    getSupabase: () => ({
        from: () => chainResult({
            count: 5,
            data: [
                { id: "s1", updated_at: new Date().toISOString() },
                { id: "s2", updated_at: new Date(Date.now() - 100 * 86400000).toISOString() },
            ],
            error: null,
        }),
    }),
}));

import { GET } from "@/app/api/home/stats/route";

describe("API Home Stats", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("retorna zeros para platform_admin", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ...mockSession,
            is_platform_admin: true,
            workspace_id: null,
        });

        const res = await GET();
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.kpis).toBeDefined();
        expect(data.kpis.total_students).toBe(0);
        expect(data.kpis.students_with_pei).toBe(0);
    });

    it("retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const res = await GET();
        expect(res.status).toBe(401);
    });

    it("retorna KPIs com estrutura correta para workspace user", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockSession);

        const res = await GET();
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.kpis).toBeDefined();
        const keys = Object.keys(data.kpis);
        expect(keys).toContain("total_students");
        expect(keys).toContain("students_with_pei");
        expect(keys).toContain("recent_diario_entries");
        expect(keys).toContain("pei_up_to_date");
        expect(keys).toContain("pei_stale");
        // All values should be numbers
        for (const k of keys) {
            expect(typeof data.kpis[k]).toBe("number");
        }
    });
});
