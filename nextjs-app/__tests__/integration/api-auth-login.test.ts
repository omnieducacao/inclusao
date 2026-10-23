import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth - permite testar fluxo family e master
const mockFindUserByEmail = vi.fn();
const mockVerifyFamilyPassword = vi.fn();
const mockVerifyWorkspaceMaster = vi.fn();
const mockCompararSenhaFicticia = vi.fn();
vi.mock("@/lib/auth", () => ({
  findUserByEmail: (...args: unknown[]) => mockFindUserByEmail(...args),
  verifyWorkspaceMaster: (...args: unknown[]) => mockVerifyWorkspaceMaster(...args),
  verifyMemberPassword: vi.fn(),
  verifyFamilyPassword: (...args: unknown[]) => mockVerifyFamilyPassword(...args),
  compararSenhaFicticia: (...args: unknown[]) => mockCompararSenhaFicticia(...args),
}));

// Mock Supabase (fallback para outros imports)
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
    beforeEach(() => {
      vi.clearAllMocks();
      mockFindUserByEmail.mockReset();
      mockVerifyFamilyPassword.mockReset();
      mockVerifyWorkspaceMaster.mockReset();
    });

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
        mockFindUserByEmail.mockResolvedValue({
          workspace_id: "ws-123",
          workspace_name: "Escola",
          role: "master",
          user: { email: "master@escola.com" },
        });
        mockVerifyWorkspaceMaster.mockResolvedValue(false);

        const req = makeRequest({ email: "master@escola.com", password: "senhaerrada" });
        const res = await POST(req);

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error).toContain("E-mail ou senha incorretos");
    });

    it("e-mail sem conta responde igual à senha errada e gasta o tempo da conferência (SCRUM-229)", async () => {
        mockFindUserByEmail.mockResolvedValue({
          workspace_id: "ws-123", workspace_name: "Escola", role: "master", user: { email: "master@escola.com" },
        });
        mockVerifyWorkspaceMaster.mockResolvedValue(false);
        const senhaErrada = await POST(makeRequest({ email: "master@escola.com", password: "senhaerrada" }));

        mockFindUserByEmail.mockResolvedValue(null);
        const semConta = await POST(makeRequest({ email: "ninguem@escola.com", password: "senhaerrada" }));

        expect(semConta.status).toBe(senhaErrada.status);
        expect(await semConta.json()).toEqual(await senhaErrada.json());
        expect(mockCompararSenhaFicticia).toHaveBeenCalledWith("senhaerrada");
    });

    it("resposta de erro contém campo 'error'", async () => {
        const req = makeRequest({ email: "", password: "" });
        const res = await POST(req);
        const data = await res.json();
        expect(data).toHaveProperty("error");
    });

    it("retorna redirect /familia quando login família com sucesso", async () => {
      mockFindUserByEmail.mockResolvedValue({
        workspace_id: "ws-1",
        workspace_name: "Escola Teste",
        role: "family",
        user: { id: "resp-1", nome: "Maria Responsável", email: "maria@familia.com" },
      });
      mockVerifyFamilyPassword.mockResolvedValue(true);

      const req = makeRequest({ email: "maria@familia.com", password: "senha123" });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.redirect).toBe("/familia");
      expect(data.usuario_nome).toBe("Maria Responsável");
    });

    it("retorna 401 quando senha incorreta (família)", async () => {
      mockFindUserByEmail.mockResolvedValue({
        workspace_id: "ws-1",
        workspace_name: "Escola",
        role: "family",
        user: { id: "resp-1", nome: "Maria", email: "maria@familia.com" },
      });
      mockVerifyFamilyPassword.mockResolvedValue(false);

      const req = makeRequest({ email: "maria@familia.com", password: "senhaerrada" });
      const res = await POST(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("E-mail ou senha incorretos");
    });

    // SCRUM-229: limite fino por e-mail (força bruta) e teto largo por IP (escola atrás de um IP só)
    function tentativa(ip: string, email: string): Request {
        return new Request("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
            body: JSON.stringify({ email, password: "senha-errada" }),
        });
    }

    it("rate limiting: a 11ª tentativa no mesmo e-mail e IP é barrada (429)", async () => {
        mockFindUserByEmail.mockResolvedValue(null);
        const ip = `rate-test-${Math.random().toString(36).slice(2)}`;
        for (let i = 0; i < 10; i++) expect((await POST(tentativa(ip, "alvo@escola.test"))).status).toBe(401);
        const res = await POST(tentativa(ip, "alvo@escola.test"));
        expect(res.status).toBe(429);
        expect(res.headers.get("Retry-After")).toBeTruthy();
    });

    it("rate limiting: outro professor da mesma escola (mesmo IP) continua conseguindo entrar", async () => {
        mockFindUserByEmail.mockResolvedValue(null);
        const ip = `rate-test-${Math.random().toString(36).slice(2)}`;
        for (let i = 0; i < 11; i++) await POST(tentativa(ip, "alvo@escola.test"));
        expect((await POST(tentativa(ip, "colega@escola.test"))).status).toBe(401); // não é 429
    });

    it("rate limiting: teto por IP de 60 tentativas a cada 15 min, mesmo com e-mails diferentes", async () => {
        mockFindUserByEmail.mockResolvedValue(null);
        const ip = `rate-test-${Math.random().toString(36).slice(2)}`;
        for (let i = 0; i < 60; i++) await POST(tentativa(ip, `p${i}@escola.test`));
        expect((await POST(tentativa(ip, "p-novo@escola.test"))).status).toBe(429);
    });
});
