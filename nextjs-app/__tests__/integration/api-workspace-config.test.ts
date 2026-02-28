/**
 * Testes de Integração - API /api/workspace/config
 *
 * GET: Retorna family_module_enabled
 * PATCH: Atualiza family_module_enabled
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockWorkspaceData: { family_module_enabled?: boolean; allow_avaliacao_fase_1?: boolean } | null = {
  family_module_enabled: true,
  allow_avaliacao_fase_1: false,
};
let mockUpdateError: unknown = null;

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "workspaces") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: mockWorkspaceData,
                  error: mockWorkspaceData ? null : { message: "Error" },
                })
              ),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({ error: mockUpdateError })
            ),
          })),
        };
      }
      return {};
    }),
  })),
}));

let mockSession: {
  workspace_id: string;
  user_role: string;
  member: Record<string, unknown> | null;
} | null = null;

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));

import { GET, PATCH } from "@/app/api/workspace/config/route";

describe("API /api/workspace/config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      workspace_id: "ws-1",
      user_role: "master",
      member: null,
    };
    mockWorkspaceData = { family_module_enabled: true };
    mockUpdateError = null;
  });

  describe("GET", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const res = await GET();

      expect(res.status).toBe(401);
    });

    it("retorna 401 quando user_role é family", async () => {
      mockSession = {
        workspace_id: "ws-1",
        user_role: "family",
        member: null,
      };

      const res = await GET();

      expect(res.status).toBe(401);
    });

    it("retorna 403 quando member sem can_gestao", async () => {
      mockSession = {
        workspace_id: "ws-1",
        user_role: "member",
        member: { can_gestao: false },
      };

      const res = await GET();

      expect(res.status).toBe(403);
    });

    it("retorna family_module_enabled quando master", async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.family_module_enabled).toBe(true);
    });

    it("retorna false quando módulo desabilitado", async () => {
      mockWorkspaceData = { family_module_enabled: false, allow_avaliacao_fase_1: false };

      const res = await GET();

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.family_module_enabled).toBe(false);
    });

    it("retorna allow_avaliacao_fase_1", async () => {
      mockWorkspaceData = { family_module_enabled: true, allow_avaliacao_fase_1: true };

      const res = await GET();

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.allow_avaliacao_fase_1).toBe(true);
    });
  });

  describe("PATCH", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const req = new Request("http://localhost/api/workspace/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_module_enabled: false }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(401);
    });

    it("retorna 403 quando member sem can_gestao", async () => {
      mockSession = {
        workspace_id: "ws-1",
        user_role: "member",
        member: { can_gestao: false },
      };

      const req = new Request("http://localhost/api/workspace/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_module_enabled: false }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(403);
    });

    it("retorna 400 para body inválido", async () => {
      const req = new Request("http://localhost/api/workspace/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: "invalid",
      });
      const res = await PATCH(req);

      expect(res.status).toBe(400);
    });

    it("retorna 400 quando nenhuma alteração enviada", async () => {
      const req = new Request("http://localhost/api/workspace/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("alteração");
    });

    it("atualiza family_module_enabled com sucesso", async () => {
      const req = new Request("http://localhost/api/workspace/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_module_enabled: false }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    it("atualiza allow_avaliacao_fase_1 com sucesso", async () => {
      const req = new Request("http://localhost/api/workspace/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allow_avaliacao_fase_1: true }),
      });
      const res = await PATCH(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });
  });
});
