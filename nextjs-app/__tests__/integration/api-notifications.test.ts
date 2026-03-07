/**
 * Testes de Integração — API Notifications (/api/notifications)
 *
 * Testa notificações inteligentes da plataforma:
 * - Platform admin recebe lista vazia
 * - Requer auth
 * - Workspace user recebe notificações com estrutura correta
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSession = {
    id: "u1",
    workspace_id: "w1",
    is_platform_admin: false,
    user_role: "professor",
    usuario_nome: "Prof. Ana",
};

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({
        id: "u1",
        workspace_id: "w1",
        is_platform_admin: false,
        user_role: "professor",
        usuario_nome: "Prof. Ana",
    }),
}));

// Proxy-based chainable Supabase
function chainResult(result: Record<string, unknown>) {
    const handler: ProxyHandler<Record<string, unknown>> = {
        get(target, prop) {
            if (prop === "then") return undefined;
            if (["count", "data", "error"].includes(prop as string)) return result[prop as string];
            return () => new Proxy(result, handler);
        },
    };
    return new Proxy(result, handler);
}

vi.mock("@/lib/supabase", () => ({
    getSupabase: () => ({
        from: () => chainResult({ count: 0, data: [], error: null }),
    }),
}));

vi.mock("@/lib/rate-limit", () => ({
    rateLimitResponse: vi.fn().mockReturnValue(null),
    RATE_LIMITS: { notifications: { maxRequests: 30, windowMs: 60000 } },
}));

import { GET } from "@/app/api/notifications/route";

describe("API Notifications", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("retorna lista vazia para platform_admin", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ...mockSession,
            is_platform_admin: true,
            workspace_id: null,
        });

        const res = await GET();
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.notifications).toBeDefined();
        expect(data.notifications).toHaveLength(0);
        expect(data.total).toBe(0);
    });

    it("retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const res = await GET();
        expect(res.status).toBe(401);
    });

    it("retorna estrutura correta para workspace user", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockSession);

        const res = await GET();
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.notifications).toBeDefined();
        expect(Array.isArray(data.notifications)).toBe(true);
        expect(typeof data.total).toBe("number");
    });
});
