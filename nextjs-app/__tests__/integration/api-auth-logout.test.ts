/**
 * Testes de Integração - API POST /api/auth/logout
 *
 * Redireciona para /login após deletar sessão
 */

import { describe, it, expect, vi } from "vitest";

const { mockDeleteSession } = vi.hoisted(() => ({
  mockDeleteSession: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  deleteSession: mockDeleteSession,
}));

import { POST } from "@/app/api/auth/logout/route";

describe("API POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteSession.mockResolvedValue(undefined);
  });

  it("chama deleteSession", async () => {
    const res = await POST();

    expect(mockDeleteSession).toHaveBeenCalledTimes(1);
  });

  it("redireciona para /login", async () => {
    const res = await POST();

    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/login");
  });
});
