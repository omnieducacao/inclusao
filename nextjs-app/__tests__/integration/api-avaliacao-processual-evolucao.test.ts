/**
 * Testes de Integração - API GET /api/avaliacao-processual/evolucao
 *
 * Retorna evolução por estudante e disciplina
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockSession: { workspace_id: string } | null = null;
let mockData: unknown[] = [];
let mockError: unknown = null;

const createChain = () => {
  const promise = Promise.resolve({ data: mockData, error: mockError });
  const chain = {
    eq: vi.fn(() => chain),
    order: vi.fn(() => {
      const p = Promise.resolve({ data: mockData, error: mockError });
      (p as Promise<{ data: unknown; error: unknown }> & { eq: () => typeof p }).eq = () => p;
      return p;
    }),
  };
  return chain;
};

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => createChain()),
    })),
  })),
}));

import { GET } from "@/app/api/avaliacao-processual/evolucao/route";

describe("API GET /api/avaliacao-processual/evolucao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = { workspace_id: "ws-1" };
    mockData = [
      {
        id: "r1",
        student_id: "est-1",
        disciplina: "Matemática",
        bimestre: 1,
        habilidades: [{ nivel_atual: 2 }],
        created_at: "2024-01-01",
      },
    ];
    mockError = null;
  });

  it("retorna 401 quando não autenticado", async () => {
    mockSession = null;

    const req = new Request("http://localhost/api/avaliacao-processual/evolucao");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Não autenticado");
  });

  it("retorna 400 quando studentId ausente", async () => {
    const req = new Request("http://localhost/api/avaliacao-processual/evolucao");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("studentId");
  });

  it("retorna 200 com evolucao e resumo quando studentId presente", async () => {
    const req = new Request(
      "http://localhost/api/avaliacao-processual/evolucao?studentId=est-1"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.evolucao).toBeDefined();
    expect(Array.isArray(data.evolucao)).toBe(true);
    expect(data.resumo).toBeDefined();
    expect(data.resumo.total_registros).toBeDefined();
    expect(data.resumo.disciplinas).toBeDefined();
  });

  it("aceita disciplina como filtro", async () => {
    const req = new Request(
      "http://localhost/api/avaliacao-processual/evolucao?studentId=est-1&disciplina=Matemática"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});
