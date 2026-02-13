import { describe, it, expect, vi } from "vitest";
import { requirePermission } from "@/lib/permissions";
import type { SessionPayload } from "@/lib/session";

// Mock getSession since permissions.ts imports from session
vi.mock("@/lib/session", () => ({
    getSession: vi.fn(),
}));

function makeSession(overrides: Partial<SessionPayload> = {}): SessionPayload {
    return {
        workspace_id: "ws-123",
        workspace_name: "Escola Teste",
        user_email: "test@test.com",
        user_name: "Teste",
        user_role: "member",
        is_platform_admin: false,
        member: null,
        ...overrides,
    } as SessionPayload;
}

describe("permissions", () => {
    describe("requirePermission", () => {
        it("platform admin sempre tem acesso", () => {
            const session = makeSession({ is_platform_admin: true, user_role: "member" });
            const result = requirePermission(session, "can_pei");
            expect(result).toBeNull();
        });

        it("master sempre tem acesso", () => {
            const session = makeSession({ user_role: "master" });
            const result = requirePermission(session, "can_hub");
            expect(result).toBeNull();
        });

        it("member com permissão → autorizado", () => {
            const session = makeSession({
                user_role: "member",
                member: { can_pei: true } as Record<string, unknown>,
            });
            const result = requirePermission(session, "can_pei");
            expect(result).toBeNull();
        });

        it("member sem permissão → 403", () => {
            const session = makeSession({
                user_role: "member",
                member: { can_pei: false, can_hub: false } as Record<string, unknown>,
            });
            const result = requirePermission(session, "can_pei");
            expect(result).not.toBeNull();
            expect(result!.status).toBe(403);
        });

        it("member sem campo member → 403", () => {
            const session = makeSession({
                user_role: "member",
                member: null,
            });
            const result = requirePermission(session, "can_hub");
            expect(result).not.toBeNull();
            expect(result!.status).toBe(403);
        });

        it("verifica diferentes permissões independentemente", () => {
            const session = makeSession({
                user_role: "member",
                member: {
                    can_pei: true,
                    can_hub: false,
                    can_diario: true,
                } as Record<string, unknown>,
            });
            expect(requirePermission(session, "can_pei")).toBeNull();
            expect(requirePermission(session, "can_hub")).not.toBeNull();
            expect(requirePermission(session, "can_diario")).toBeNull();
        });
    });
});
