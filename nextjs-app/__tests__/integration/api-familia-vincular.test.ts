/**
 * Testes de Integração - API /api/familia/vincular
 *
 * POST: Vincula ou desvincula responsável a estudante
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockRespData: { id: string } | null = { id: "resp-1" };
let mockStudentData: { id: string } | null = { id: "est-1" };
let mockUpsertError: unknown = null;
let mockDeleteError: unknown = null;

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "family_responsibles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: mockRespData, error: null })
                ),
              })),
            })),
          })),
        };
      }
      if (table === "students") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: mockStudentData, error: null })
                ),
              })),
            })),
          })),
        };
      }
      if (table === "family_student_links") {
        return {
          upsert: vi.fn(() =>
            Promise.resolve({ error: mockUpsertError })
          ),
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({ error: mockDeleteError })
              ),
            })),
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

import { POST } from "@/app/api/familia/vincular/route";

describe("API /api/familia/vincular", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      workspace_id: "ws-1",
      user_role: "master",
      member: null,
    };
    mockRespData = { id: "resp-1" };
    mockStudentData = { id: "est-1" };
    mockUpsertError = null;
    mockDeleteError = null;
  });

  it("retorna 401 quando não autenticado", async () => {
    mockSession = null;

    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-1",
        acao: "vincular",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("retorna 401 quando user_role é family", async () => {
    mockSession = { workspace_id: "ws-1", user_role: "family", member: null };

    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-1",
        acao: "vincular",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("retorna 403 quando member sem permissão", async () => {
    mockSession = {
      workspace_id: "ws-1",
      user_role: "member",
      member: { can_gestao: false, can_estudantes: false },
    };

    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-1",
        acao: "vincular",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it("retorna 400 para body inválido ou campos faltando", async () => {
    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-1",
        acao: "",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("retorna 404 quando responsável não encontrado", async () => {
    mockRespData = null;

    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-inexistente",
        student_id: "est-1",
        acao: "vincular",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("Responsável");
  });

  it("retorna 404 quando estudante não encontrado", async () => {
    mockStudentData = null;

    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-inexistente",
        acao: "vincular",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("Estudante");
  });

  it("vincula com sucesso", async () => {
    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-1",
        acao: "vincular",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.mensagem).toContain("Vinculado");
  });

  it("desvincula com sucesso", async () => {
    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-1",
        acao: "desvincular",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.mensagem).toContain("Desvinculado");
  });

  it("retorna 400 para acao inválida", async () => {
    const req = new Request("http://localhost/api/familia/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_responsible_id: "resp-1",
        student_id: "est-1",
        acao: "invalido",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
