/**
 * Testes de Integração - API /api/members
 *
 * GET: Lista membros ou master (master=1)
 * POST: Cria membro ou master (action=create_master)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockSession: { workspace_id: string } | null = null;
const mockListMembers = vi.fn();
const mockGetWorkspaceMaster = vi.fn();
const mockCreateMember = vi.fn();
const mockCreateWorkspaceMaster = vi.fn();
const mockRequirePermission = vi.fn();

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));

vi.mock("@/lib/members", () => ({
  listMembers: (...args: unknown[]) => mockListMembers(...args),
  getWorkspaceMaster: (...args: unknown[]) => mockGetWorkspaceMaster(...args),
  createMember: (...args: unknown[]) => mockCreateMember(...args),
  createWorkspaceMaster: (...args: unknown[]) => mockCreateWorkspaceMaster(...args),
}));

vi.mock("@/lib/permissions", () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}));

import { GET, POST } from "@/app/api/members/route";

describe("API /api/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = { workspace_id: "ws-1" };
    mockListMembers.mockResolvedValue([
      { id: "m1", nome: "Professor A", email: "a@escola.com" },
    ]);
    mockGetWorkspaceMaster.mockResolvedValue({
      workspace_id: "ws-1",
      email: "master@escola.com",
      nome: "Master",
    });
    mockCreateMember.mockResolvedValue({ member: { id: "m-new", nome: "Novo" } });
    mockCreateWorkspaceMaster.mockResolvedValue({ error: null });
    mockRequirePermission.mockReturnValue(null);
  });

  describe("GET", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const req = new Request("http://localhost/api/members");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Não autorizado");
    });

    it("retorna lista de membros", async () => {
      const req = new Request("http://localhost/api/members");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.members).toBeDefined();
      expect(Array.isArray(data.members)).toBe(true);
      expect(mockListMembers).toHaveBeenCalledWith("ws-1");
    });

    it("retorna master quando master=1", async () => {
      const req = new Request("http://localhost/api/members?master=1");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.master).toBeDefined();
      expect(data.master.nome).toBe("Master");
      expect(mockGetWorkspaceMaster).toHaveBeenCalledWith("ws-1");
    });
  });

  describe("POST", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const req = new Request("http://localhost/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Novo",
          email: "novo@escola.com",
          password: "1234",
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it("retorna 403 sem can_gestao", async () => {
      mockRequirePermission.mockReturnValue(
        new Response(JSON.stringify({ error: "Permissão negada" }), { status: 403 })
      );

      const req = new Request("http://localhost/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Novo",
          email: "novo@escola.com",
          password: "1234",
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(403);
    });

    it("cria membro com dados válidos", async () => {
      const req = new Request("http://localhost/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Novo Membro",
          email: "novo@escola.com",
          password: "1234",
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.member).toBeDefined();
      expect(mockCreateMember).toHaveBeenCalled();
    });

    it("retorna 400 quando create_master sem nome/email/senha", async () => {
      const req = new Request("http://localhost/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_master",
          nome: "",
          email: "master@escola.com",
          password: "1234",
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("obrigatórios");
    });

    it("cria master quando action=create_master", async () => {
      const req = new Request("http://localhost/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_master",
          nome: "Novo Master",
          email: "master@escola.com",
          password: "1234",
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(mockCreateWorkspaceMaster).toHaveBeenCalled();
      expect(mockCreateMember).toHaveBeenCalled();
    });
  });
});
