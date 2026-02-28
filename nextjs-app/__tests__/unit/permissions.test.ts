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

        it("can_estudantes, can_paee, can_avaliacao, can_gestao", () => {
            const comTodas = makeSession({
                user_role: "member",
                member: {
                    can_estudantes: true,
                    can_paee: true,
                    can_avaliacao: true,
                    can_gestao: true,
                } as Record<string, unknown>,
            });
            expect(requirePermission(comTodas, "can_estudantes")).toBeNull();
            expect(requirePermission(comTodas, "can_paee")).toBeNull();
            expect(requirePermission(comTodas, "can_avaliacao")).toBeNull();
            expect(requirePermission(comTodas, "can_gestao")).toBeNull();

            const semNenhuma = makeSession({
                user_role: "member",
                member: {
                    can_estudantes: false,
                    can_paee: false,
                    can_avaliacao: false,
                    can_gestao: false,
                } as Record<string, unknown>,
            });
            expect(requirePermission(semNenhuma, "can_gestao")).not.toBeNull();
        });

        it("can_pei_professor", () => {
            const session = makeSession({
                user_role: "member",
                member: { can_pei_professor: true } as Record<string, unknown>,
            });
            expect(requirePermission(session, "can_pei_professor")).toBeNull();
        });

        it("family role sem can_gestao não acessa gestão", () => {
            const session = makeSession({
                user_role: "family",
                member: null,
            });
            expect(requirePermission(session, "can_gestao")).not.toBeNull();
        });
    });
});
