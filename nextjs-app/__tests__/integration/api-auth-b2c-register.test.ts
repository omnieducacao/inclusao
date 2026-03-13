import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the absolute essential dependencies before importing the route
vi.mock("@/lib/supabase", () => {
    return {
        getSupabase: vi.fn(() => ({
            from: vi.fn(),
        })),
    };
});
vi.mock("@/lib/auth", () => ({
    findUserByEmail: vi.fn(),
}));
vi.mock("@/lib/session", () => ({
    createSession: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));
vi.mock("@/lib/rate-limit", () => ({
    rateLimitResponse: vi.fn(() => null),
    RATE_LIMITS: { AUTH: "auth_limit" },
}));
vi.mock("bcryptjs", () => ({
    default: {
        genSalt: vi.fn(async () => "mocked-salt"),
        hash: vi.fn(async () => "mocked-hash"),
    },
}));

import { POST } from "@/app/api/auth/register/route";
import * as auth from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { createSession } from "@/lib/session";

describe("API B2C Register (/api/auth/register)", () => {
    let mockReq: Request;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createMockRequest = (body: Record<string, any>) => {
        return new Request("http://localhost/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    };

    it("should block registration if email already exists", async () => {
        // Arrange: User exists
        vi.mocked(auth.findUserByEmail).mockResolvedValueOnce({
            workspace_id: "ws-123",
            workspace_name: "Escola XYZ",
            role: "member",
            user: { id: "u-123" },
        });

        mockReq = createMockRequest({
            nome: "Professor Teste",
            email: "teste@escola.com",
            password: "password123",
        });

        // Act
        const response = await POST(mockReq);
        const json = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(json.error).toBe("Este e-mail já está cadastrado na nossa base.");
    });

    it("should successfully create a B2C Workspace and Master account", async () => {
        // Arrange: User does NOT exist
        vi.mocked(auth.findUserByEmail).mockResolvedValueOnce(null);

        const mockSb = {
            from: vi.fn((table: string) => {
                if (table === "workspaces") {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { id: "new-ws-123", name: "Workspace de Professor Teste" },
                            error: null,
                        }),
                    };
                }
                if (table === "workspace_masters") {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { id: "new-master-123", nome: "Professor Teste", email: "teste@escola.com" },
                            error: null,
                        }),
                    };
                }
                return { insert: vi.fn(), select: vi.fn(), single: vi.fn() };
            }),
        };

        vi.mocked(getSupabase).mockReturnValue(mockSb as any);

        mockReq = createMockRequest({
            nome: "Professor Teste",
            email: "teste@escola.com",
            password: "password123",
        });

        // Act
        const response = await POST(mockReq);
        const json = await response.json();

        // Assert Success Response
        expect(json.ok).toBe(true);
        expect(json.workspace_name).toBe("Workspace de Professor Teste");
        expect(json.usuario_nome).toBe("Professor Teste");
        expect(json.redirect).toBe("/");

        // Assert Database orchestration calls (1 for Workspaces, 1 for Masters)
        expect(mockSb.from).toHaveBeenCalledWith("workspaces");
        expect(mockSb.from).toHaveBeenCalledWith("workspace_masters");

        // Assert Auto-login Session Creation
        expect(createSession).toHaveBeenCalledWith(
            expect.objectContaining({
                workspace_id: "new-ws-123",
                workspace_name: "Workspace de Professor Teste",
                usuario_nome: "Professor Teste",
                user_role: "master",
                is_platform_admin: false,
            })
        );
    });
});
