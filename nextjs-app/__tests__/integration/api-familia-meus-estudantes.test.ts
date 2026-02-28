/**
 * Testes de Integração - API /api/familia/meus-estudantes
 *
 * GET: Retorna estudantes vinculados ao responsável (apenas family role)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockLinksData: { student_id: string }[] = [];
let mockStudentsData: { id: string; name: string; grade?: string; class_group?: string }[] = [];

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "family_student_links") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({ data: mockLinksData, error: null })
            ),
          })),
        };
      }
      if (table === "students") {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({ data: mockStudentsData, error: null })
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
  family_responsible_id?: string;
} | null = null;

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));

import { GET } from "@/app/api/familia/meus-estudantes/route";

describe("API /api/familia/meus-estudantes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      workspace_id: "ws-1",
      user_role: "family",
      family_responsible_id: "resp-1",
    };
    mockLinksData = [{ student_id: "est-1" }, { student_id: "est-2" }];
    mockStudentsData = [
      { id: "est-1", name: "João", grade: "1º ano", class_group: "A" },
      { id: "est-2", name: "Maria", grade: "2º ano", class_group: "B" },
    ];
  });

  it("retorna 401 quando não autenticado", async () => {
    mockSession = null;

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("retorna 401 quando user_role não é family", async () => {
    mockSession = {
      workspace_id: "ws-1",
      user_role: "master",
      family_responsible_id: undefined,
    };

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("retorna 401 quando family_responsible_id ausente", async () => {
    mockSession = {
      workspace_id: "ws-1",
      user_role: "family",
      family_responsible_id: undefined,
    };

    const res = await GET();

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Sessão inválida");
  });

  it("retorna lista de estudantes vinculados", async () => {
    const res = await GET();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.estudantes).toHaveLength(2);
    expect(data.estudantes[0].name).toBe("João");
    expect(data.estudantes[1].name).toBe("Maria");
  });

  it("retorna array vazio quando sem vínculos", async () => {
    mockLinksData = [];

    const res = await GET();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.estudantes).toEqual([]);
  });
});
