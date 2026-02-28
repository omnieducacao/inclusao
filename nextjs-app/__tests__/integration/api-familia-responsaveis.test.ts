/**
 * Testes de Integração - API /api/familia/responsaveis
 *
 * GET: Lista responsáveis do workspace (com ?studentId para indicar vínculo)
 * POST: Cria responsável e opcionalmente vincula a estudantes
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockResponsaveis: Record<string, unknown>[] = [];
const mockLinks: { family_responsible_id: string }[] = [];
let mockInsert: ReturnType<typeof vi.fn>;
let mockOrder: ReturnType<typeof vi.fn>;

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => {
    const chain = (data: unknown, err: unknown = null) => ({
      then: (fn: (r: { data: unknown; error: unknown }) => unknown) =>
        Promise.resolve(fn({ data, error: err })),
    });
    return {
      from: vi.fn((table: string) => {
        if (table === "family_responsibles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: mockOrder,
                single: vi.fn(() => chain({ id: "resp-1", nome: "Test", email: "test@test.com" })),
              })),
            })),
            insert: mockInsert,
          };
        }
        if (table === "family_student_links") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => chain(mockLinks)),
            })),
            insert: vi.fn(() => chain(undefined)),
          };
        }
        if (table === "workspaces") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => chain({ family_module_enabled: true })),
              })),
            })),
          };
        }
        return { select: vi.fn(() => ({ eq: vi.fn(() => chain(null)) })) };
      }),
    };
  }),
}));

let mockSession: {
  workspace_id: string;
  user_role: string;
  member: Record<string, unknown> | null;
} | null = null;

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));

vi.mock("bcryptjs", () => ({
  default: { hashSync: vi.fn(() => "$2a$10$hashed") },
}));

import { GET, POST } from "@/app/api/familia/responsaveis/route";

describe("API /api/familia/responsaveis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = {
      workspace_id: "ws-1",
      user_role: "master",
      member: null,
    };
    mockResponsaveis.length = 0;
    mockLinks.length = 0;
    mockOrder = vi.fn(() =>
      Promise.resolve({ data: mockResponsaveis, error: null })
    );
    mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() =>
          Promise.resolve({
            data: { id: "resp-new", nome: "Novo", email: "novo@test.com", created_at: "2025-01-01" },
            error: null,
          })
        ),
      })),
    }));
  });

  describe("GET", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const req = new Request("http://localhost/api/familia/responsaveis");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain("Não autorizado");
    });

    it("retorna 401 quando user_role é family", async () => {
      mockSession = { workspace_id: "ws-1", user_role: "family", member: null };

      const req = new Request("http://localhost/api/familia/responsaveis");
      const res = await GET(req);

      expect(res.status).toBe(401);
    });

    it("retorna lista de responsáveis", async () => {
      mockResponsaveis.push(
        { id: "r1", nome: "Maria", email: "maria@test.com" },
        { id: "r2", nome: "João", email: "joao@test.com" }
      );

      const req = new Request("http://localhost/api/familia/responsaveis");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.responsaveis).toHaveLength(2);
    });

    it("inclui vinculado quando studentId é passado", async () => {
      mockResponsaveis.push(
        { id: "r1", nome: "Maria", email: "maria@test.com" },
        { id: "r2", nome: "João", email: "joao@test.com" }
      );
      mockLinks.push({ family_responsible_id: "r1" });

      const req = new Request("http://localhost/api/familia/responsaveis?studentId=est-1");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.responsaveis).toHaveLength(2);
      const maria = data.responsaveis.find((r: { id: string }) => r.id === "r1");
      const joao = data.responsaveis.find((r: { id: string }) => r.id === "r2");
      expect(maria.vinculado).toBe(true);
      expect(joao.vinculado).toBe(false);
    });
  });

  describe("POST", () => {
    it("retorna 401 quando não autenticado", async () => {
      mockSession = null;

      const req = new Request("http://localhost/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Test", email: "test@test.com", senha: "123456" }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it("retorna 403 quando member sem can_gestao/can_estudantes", async () => {
      mockSession = {
        workspace_id: "ws-1",
        user_role: "member",
        member: { can_gestao: false, can_estudantes: false },
      };

      const req = new Request("http://localhost/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Test", email: "test@test.com", senha: "123456" }),
      });
      const res = await POST(req);

      expect(res.status).toBe(403);
    });

    it("retorna 400 para body inválido", async () => {
      const req = new Request("http://localhost/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid",
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it("retorna 400 quando nome, email ou senha faltando", async () => {
      const req = new Request("http://localhost/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "", email: "test@test.com", senha: "123456" }),
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("obrigatórios");
    });

    it("cria responsável com sucesso quando master", async () => {
      mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: {
                id: "resp-new",
                nome: "Maria Responsável",
                email: "maria@familia.com",
                created_at: "2025-01-01",
              },
              error: null,
            })
          ),
        })),
      }));

      const req = new Request("http://localhost/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Maria Responsável",
          email: "maria@familia.com",
          senha: "senha123",
          parentesco: "Mãe",
        }),
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.responsavel).toBeDefined();
      expect(data.responsavel.nome).toBe("Maria Responsável");
      expect(data.responsavel.email).toBe("maria@familia.com");
    });
  });
});
