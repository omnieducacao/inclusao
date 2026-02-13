import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn((table: string) => {
            if (table === "workspace_masters") {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            maybeSingle: vi.fn(() => ({
                                data: {
                                    workspace_id: "ws-123",
                                    email: "master@escola.com",
                                    password_hash: "$2a$10$test",
                                    nome: "Master Teste",
                                },
                                error: null,
                            })),
                            eq: vi.fn(() => ({
                                maybeSingle: vi.fn(() => ({
                                    data: {
                                        workspace_id: "ws-123",
                                        email: "master@escola.com",
                                        password_hash: "$2a$10$test",
                                        nome: "Master Teste",
                                    },
                                    error: null,
                                })),
                            })),
                        })),
                    })),
                };
            }
            if (table === "workspace_members") {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                maybeSingle: vi.fn(() => ({
                                    data: null,
                                    error: null,
                                })),
                            })),
                            maybeSingle: vi.fn(() => ({
                                data: null,
                                error: null,
                            })),
                        })),
                    })),
                };
            }
            if (table === "workspaces") {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn(() => ({
                                data: { name: "Escola Teste" },
                                error: null,
                            })),
                        })),
                    })),
                };
            }
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({ data: null, error: null })),
                })),
            };
        }),
    })),
}));

// Mock session (cookies-based, can't run in test)  
vi.mock("@/lib/session", () => ({
    createSession: vi.fn(() => Promise.resolve()),
    getSession: vi.fn(() => Promise.resolve(null)),
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
    default: {
        compareSync: vi.fn(() => false),
    },
}));

import { POST } from "@/app/api/auth/login/route";

function makeRequest(body: Record<string, unknown>): Request {
    return new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("API /api/auth/login", () => {
    it("retorna 400 para body vazio", async () => {
        const req = new Request("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("retorna 400 para email inválido", async () => {
        const req = makeRequest({ email: "", password: "123456" });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("retorna 401 para senha incorreta", async () => {
        const req = makeRequest({ email: "master@escola.com", password: "senhaerrada" });
        const res = await POST(req);
        // Will get 401 because bcrypt mock returns false
        expect(res.status).toBe(401);
    });

    it("resposta de erro contém campo 'error'", async () => {
        const req = makeRequest({ email: "", password: "" });
        const res = await POST(req);
        const data = await res.json();
        expect(data).toHaveProperty("error");
    });

    it("rate limiting funciona após muitas requests", async () => {
        // AUTH rate limit: 10 per 15min
        // Use a unique IP per test to avoid conflicts
        const ip = `rate-test-${Math.random().toString(36).slice(2)}`;

        for (let i = 0; i < 10; i++) {
            const req = new Request("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-forwarded-for": ip,
                },
                body: JSON.stringify({ email: "test@test.com", password: "123" }),
            });
            await POST(req);
        }

        // 11th request should be rate limited
        const req = new Request("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-forwarded-for": ip,
            },
            body: JSON.stringify({ email: "test@test.com", password: "123" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(429);
    });
});
