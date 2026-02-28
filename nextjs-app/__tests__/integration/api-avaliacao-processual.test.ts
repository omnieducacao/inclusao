/**
 * Testes de Integração - API /api/avaliacao-processual
 *
 * GET: Lista registros (com filtros studentId, disciplina, bimestre)
 * POST: Cria registro de avaliação processual
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockRegistros: Record<string, unknown>[] = [];
let mockExisting: Record<string, unknown> | null = null;
let mockInsertError: unknown = null;

const createChain = () => {
  const chain = {
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    then: (fn: (r: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve(fn({ data: mockRegistros, error: null })),
  };
  return chain;
};
const createExistingChain = () => ({
  eq: vi.fn(() => ({
    maybeSingle: vi.fn(() =>
      Promise.resolve({ data: mockExisting, error: null })
    ),
  })),
});

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "avaliacao_processual") {
        return {
          select: vi.fn(() => createChain()),
          insert: vi.fn(() =>
            Promise.resolve({
              data: { id: "reg-1" },
              error: mockInsertError,
            })
          ),
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

import { GET, POST } from "@/app/api/avaliacao-processual/route";

describe("API /api/avaliacao-processual", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      workspace_id: "ws-1",
      user_role: "member",
      member: { id: "member-1" },
    };
    mockRegistros = [
      {
        id: "reg-1",
        student_id: "est-1",
        disciplina: "Matemática",
        bimestre: 1,
        habilidades: [],
      },
    ];
    mockExisting = null;
    mockInsertError = null;
  });

  describe("GET", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const req = new Request("http://localhost/api/avaliacao-processual");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Não autenticado");
    });

    it("retorna lista de registros", async () => {
      const req = new Request("http://localhost/api/avaliacao-processual");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.registros).toBeDefined();
      expect(Array.isArray(data.registros)).toBe(true);
    });

    it("aceita studentId como filtro na URL", async () => {
      const req = new Request(
        "http://localhost/api/avaliacao-processual?studentId=est-1"
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.registros).toBeDefined();
    });
  });

  describe("POST", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const req = new Request("http://localhost/api/avaliacao-processual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "est-1",
          disciplina: "Matemática",
          bimestre: 1,
          habilidades: [],
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it("retorna 400 quando studentId, disciplina ou bimestre faltando", async () => {
      const req = new Request("http://localhost/api/avaliacao-processual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "est-1",
          disciplina: "Matemática",
          // bimestre faltando
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("obrigatórios");
    });
  });
});
