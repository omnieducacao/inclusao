/**
 * Testes de Integração - API /api/familia/estudante/[id]
 *
 * GET: Retorna dados do estudante para responsável (apenas se vinculado)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockLinkData: { id: string } | null = { id: "link-1" };
let mockStudentData: Record<string, unknown> | null = {
  id: "est-1",
  name: "João",
  grade: "1º ano",
  class_group: "A",
  pei_data: { ia_sugestao: "Resumo PEI" },
  paee_data: null,
  paee_ciclos: [],
  planejamento_ativo: null,
};
let mockProcessualData: { disciplina: string; bimestre: number; habilidades?: unknown[] }[] = [];

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "family_student_links") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({ data: mockLinkData, error: null })
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
                  Promise.resolve({
                    data: mockStudentData,
                    error: mockStudentData ? null : { message: "Not found" },
                  })
                ),
              })),
            })),
          })),
        };
      }
      if (table === "avaliacao_processual") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({ data: mockProcessualData, error: null })
                ),
              })),
            })),
          })),
        };
      }
      if (table === "family_pei_acknowledgments") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() =>
                  Promise.resolve({ data: null, error: null })
                ),
              })),
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
  family_responsible_id?: string;
} | null = null;

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));

import { GET } from "@/app/api/familia/estudante/[id]/route";

describe("API /api/familia/estudante/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      workspace_id: "ws-1",
      user_role: "family",
      family_responsible_id: "resp-1",
    };
    mockLinkData = { id: "link-1" };
    mockStudentData = {
      id: "est-1",
      name: "João",
      grade: "1º ano",
      class_group: "A",
      pei_data: { ia_sugestao: "Resumo PEI" },
      paee_data: null,
      paee_ciclos: [],
      planejamento_ativo: null,
    };
    mockProcessualData = [];
  });

  it("retorna 401 quando não autenticado", async () => {
    mockSession = null;

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "est-1" }),
    });

    expect(res.status).toBe(401);
  });

  it("retorna 401 quando user_role não é family", async () => {
    mockSession = {
      workspace_id: "ws-1",
      user_role: "master",
      family_responsible_id: undefined,
    };

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "est-1" }),
    });

    expect(res.status).toBe(401);
  });

  it("retorna 403 quando estudante não vinculado", async () => {
    mockLinkData = null;

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "est-1" }),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("não vinculado");
  });

  it("retorna dados do estudante quando vinculado", async () => {
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "est-1" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.estudante).toBeDefined();
    expect(data.estudante.name).toBe("João");
    expect(data.pei_resumo).toBeDefined();
    expect(data.ciencia_pei).toBeDefined();
    expect(data.ciencia_pei.acknowledged).toBe(false);
  });
});
