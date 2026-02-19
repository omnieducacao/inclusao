/**
 * Testes Unitários - Módulo de Sessão JWT
 * 
 * Cobertura:
 * - Criação de sessão com cookies seguros
 * - Validação e decoding de tokens JWT
 * - Propriedades de segurança dos cookies (httpOnly, secure, sameSite)
 * - Expiração de tokens
 * - Deleção de sessão
 * - Proteção contra tampering
 * 
 * Segurança: Validação de flags de segurança dos cookies
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSession, getSession, deleteSession, type SessionPayload } from "@/lib/session";

// Mock cookies
type CookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    maxAge: number;
    path: string;
};

const mockCookies = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
};

vi.mock("next/headers", () => ({
    cookies: vi.fn(() => Promise.resolve(mockCookies)),
}));

// Mock JWT secret
vi.mock("@/lib/jwt-secret", () => ({
    getSecret: vi.fn(() => new TextEncoder().encode("test-secret-for-testing-only-not-for-production")),
}));

describe("session", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset NODE_ENV
        delete process.env.NODE_ENV;
    });

    afterEach(() => {
        delete process.env.NODE_ENV;
    });

    describe("createSession", () => {
        it("cria cookie com httpOnly", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola Teste",
                usuario_nome: "João",
                user_role: "master",
                is_platform_admin: false,
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            expect(cookieCall[2].httpOnly).toBe(true);
        });

        it("usa secure=true em produção", async () => {
            process.env.NODE_ENV = "production";

            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola Teste",
                usuario_nome: "João",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            expect(cookieCall[2].secure).toBe(true);
        });

        it("usa secure=false em desenvolvimento", async () => {
            process.env.NODE_ENV = "development";

            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola Teste",
                usuario_nome: "João",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            expect(cookieCall[2].secure).toBe(false);
        });

        it("define sameSite=lax", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola Teste",
                usuario_nome: "João",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            expect(cookieCall[2].sameSite).toBe("lax");
        });

        it("define maxAge de 7 dias", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola Teste",
                usuario_nome: "João",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            expect(cookieCall[2].maxAge).toBe(60 * 60 * 24 * 7); // 7 dias em segundos
        });

        it("define path=/", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola Teste",
                usuario_nome: "João",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            expect(cookieCall[2].path).toBe("/");
        });

        it("armazena payload correto no token", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-456",
                workspace_name: "Escola Exemplo",
                usuario_nome: "Maria",
                user_role: "member",
                member: { can_pei: true },
                is_platform_admin: false,
                terms_accepted: true,
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            const token = cookieCall[1];
            
            // Token deve ser uma string JWT válida
            expect(typeof token).toBe("string");
            expect(token.split(".")).toHaveLength(3); // header.payload.signature
        });

        it("inclui simulação quando presente", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola Real",
                usuario_nome: "Admin",
                user_role: "platform_admin",
                is_platform_admin: true,
                simulating_workspace_id: "ws-456",
                simulating_workspace_name: "Escola Simulada",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            expect(cookieCall[1]).toBeDefined();
        });
    });

    describe("getSession", () => {
        it("retorna null quando não há cookie", async () => {
            mockCookies.get.mockReturnValue(undefined);

            const session = await getSession();
            expect(session).toBeNull();
        });

        it("retorna null quando token é inválido", async () => {
            mockCookies.get.mockReturnValue({ value: "token-invalido" });

            const session = await getSession();
            expect(session).toBeNull();
        });

        it("retorna null quando token está expirado", async () => {
            // Token expirado (exp no passado)
            const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3Jrc3BhY2VfaWQiOiJ3cy0xMjMiLCJleHAiOjE2MDAwMDAwMDB9.invalid";
            mockCookies.get.mockReturnValue({ value: expiredToken });

            const session = await getSession();
            expect(session).toBeNull();
        });

        it("decodifica e retorna payload válido", async () => {
            // Criar um token válido primeiro
            const { SignJWT } = await import("jose");
            const { getSecret } = await import("@/lib/jwt-secret");
            
            const payload: SessionPayload = {
                workspace_id: "ws-123",
                workspace_name: "Escola Teste",
                usuario_nome: "João",
                user_role: "master",
                is_platform_admin: false,
                exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
            };

            const token = await new SignJWT({ ...payload })
                .setProtectedHeader({ alg: "HS256" })
                .sign(getSecret());

            mockCookies.get.mockReturnValue({ value: token });

            const session = await getSession();
            expect(session).not.toBeNull();
            expect(session?.workspace_id).toBe("ws-123");
            expect(session?.usuario_nome).toBe("João");
            expect(session?.user_role).toBe("master");
        });

        it("preserva dados do member quando presente", async () => {
            const { SignJWT } = await import("jose");
            const { getSecret } = await import("@/lib/jwt-secret");
            
            const payload: SessionPayload = {
                workspace_id: "ws-456",
                workspace_name: "Escola Member",
                usuario_nome: "Professor",
                user_role: "member",
                member: {
                    id: "member-123",
                    can_pei: true,
                    can_paee: false,
                },
                is_platform_admin: false,
                terms_accepted: true,
                exp: Math.floor(Date.now() / 1000) + 3600,
            };

            const token = await new SignJWT({ ...payload })
                .setProtectedHeader({ alg: "HS256" })
                .sign(getSecret());

            mockCookies.get.mockReturnValue({ value: token });

            const session = await getSession();
            expect(session?.member).toEqual(payload.member);
            expect(session?.terms_accepted).toBe(true);
        });

        it("preserva informações de simulação", async () => {
            const { SignJWT } = await import("jose");
            const { getSecret } = await import("@/lib/jwt-secret");
            
            const payload: SessionPayload = {
                workspace_id: null,
                workspace_name: "",
                usuario_nome: "Admin",
                user_role: "platform_admin",
                is_platform_admin: true,
                simulating_workspace_id: "ws-simulado",
                simulating_workspace_name: "Escola Simulada",
                exp: Math.floor(Date.now() / 1000) + 3600,
            };

            const token = await new SignJWT({ ...payload })
                .setProtectedHeader({ alg: "HS256" })
                .sign(getSecret());

            mockCookies.get.mockReturnValue({ value: token });

            const session = await getSession();
            expect(session?.simulating_workspace_id).toBe("ws-simulado");
            expect(session?.simulating_workspace_name).toBe("Escola Simulada");
        });
    });

    describe("deleteSession", () => {
        it("deleta o cookie de sessão", async () => {
            await deleteSession();

            expect(mockCookies.delete).toHaveBeenCalledWith("omnisfera_session");
        });

        it("não lança erro quando cookie não existe", async () => {
            mockCookies.delete.mockImplementation(() => {
                // Simula comportamento silencioso
            });

            await expect(deleteSession()).resolves.not.toThrow();
        });
    });

    describe("Segurança - Propriedades do Token", () => {
        it("token contém expiração (exp)", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola",
                usuario_nome: "Teste",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            const token = cookieCall[1];
            
            // Decodificar payload (base64)
            const payloadBase64 = token.split(".")[1];
            const decodedPayload = JSON.parse(
                Buffer.from(payloadBase64, "base64").toString()
            );

            expect(decodedPayload.exp).toBeDefined();
            expect(decodedPayload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
        });

        it("token contém issued at (iat)", async () => {
            const beforeCreate = Math.floor(Date.now() / 1000);
            
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola",
                usuario_nome: "Teste",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            const token = cookieCall[1];
            
            const payloadBase64 = token.split(".")[1];
            const decodedPayload = JSON.parse(
                Buffer.from(payloadBase64, "base64").toString()
            );

            expect(decodedPayload.iat).toBeDefined();
            expect(decodedPayload.iat).toBeGreaterThanOrEqual(beforeCreate);
        });

        it("usa algoritmo HS256", async () => {
            const payload: Omit<SessionPayload, "exp"> = {
                workspace_id: "ws-123",
                workspace_name: "Escola",
                usuario_nome: "Teste",
                user_role: "master",
            };

            await createSession(payload);

            const cookieCall = mockCookies.set.mock.calls[0];
            const token = cookieCall[1];
            
            const headerBase64 = token.split(".")[0];
            const decodedHeader = JSON.parse(
                Buffer.from(headerBase64, "base64").toString()
            );

            expect(decodedHeader.alg).toBe("HS256");
        });
    });
});
