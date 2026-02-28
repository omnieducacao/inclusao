/**
 * Testes de Integração - API POST /api/auth/admin-login
 *
 * Login de administrador da plataforma
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockVerifyPlatformAdmin,
  mockCreateSession,
  mockParseBody,
  mockRateLimitResponse,
} = vi.hoisted(() => ({
  mockVerifyPlatformAdmin: vi.fn(),
  mockCreateSession: vi.fn(),
  mockParseBody: vi.fn(),
  mockRateLimitResponse: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  verifyPlatformAdmin: mockVerifyPlatformAdmin,
}));

vi.mock("@/lib/session", () => ({
  createSession: mockCreateSession,
}));

vi.mock("@/lib/validation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/validation")>();
  return { ...actual, parseBody: mockParseBody };
});

vi.mock("@/lib/rate-limit", () => ({
  rateLimitResponse: mockRateLimitResponse,
  RATE_LIMITS: { AUTH: "auth" },
}));

const mockMaybeSingle = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => mockMaybeSingle()),
        })),
      })),
    })),
  })),
}));

import { POST } from "@/app/api/auth/admin-login/route";

describe("API POST /api/auth/admin-login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimitResponse.mockReturnValue(null);
    mockMaybeSingle.mockResolvedValue({ data: { nome: "Admin Teste" }, error: null });
  });

  it("retorna 401 quando credenciais inválidas", async () => {
    mockParseBody.mockResolvedValue({
      data: { email: "admin@x.com", password: "senha" },
    });
    mockVerifyPlatformAdmin.mockResolvedValue(false);

    const req = new Request("http://localhost/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@x.com", password: "senha" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Credenciais inválidas");
  });

  it("retorna 200 e cria sessão quando credenciais válidas", async () => {
    mockParseBody.mockResolvedValue({
      data: { email: "admin@x.com", password: "senha123" },
    });
    mockVerifyPlatformAdmin.mockResolvedValue(true);

    const req = new Request("http://localhost/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@x.com", password: "senha123" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.usuario_nome).toBeDefined();
    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        user_role: "platform_admin",
        is_platform_admin: true,
      })
    );
  });

  it("retorna erro de parseBody quando dados inválidos", async () => {
    const errorRes = new Response(JSON.stringify({ error: "Dados inválidos" }), {
      status: 400,
    });
    mockParseBody.mockResolvedValue({ error: errorRes });

    const req = new Request("http://localhost/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalido" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("retorna rate limit quando aplicável", async () => {
    const rlRes = new Response(JSON.stringify({ error: "Muitas tentativas" }), {
      status: 429,
    });
    mockRateLimitResponse.mockReturnValue(rlRes);

    const req = new Request("http://localhost/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@x.com", password: "senha" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(429);
  });
});
