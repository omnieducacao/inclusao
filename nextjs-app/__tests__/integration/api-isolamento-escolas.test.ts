/**
 * Isolamento entre escolas (SCRUM-67): a escola A nunca alcança estudante ou membro da escola B
 * trocando o id na URL ou no corpo. Cada rota corrigida deve responder 404 e não gravar nada.
 *
 * Usa um banco falso em memória que aplica de verdade os filtros .eq()/.in(): se uma rota
 * esquecer o `workspace_id`, a linha da outra escola aparece e o teste falha.
 * Cada rota também tem um controle positivo (a própria escola passa), para o teste não ser vazio.
 * Os estudantes e membros são fictícios.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

const sessaoEscolaA = {
  workspace_id: "ws-A",
  workspace_name: "Escola A (fictícia)",
  usuario_nome: "Coordenadora A",
  user_role: "master" as const,
  is_platform_admin: false,
  terms_accepted: true,
  exp: Date.now() / 1000 + 3600,
};

let db: FakeDb;

vi.mock("@/lib/session", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/session")>();
  return { ...real, getSession: vi.fn(() => Promise.resolve(sessaoEscolaA)) };
});
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/rate-limit")>();
  return { ...real, rateLimitResponse: () => null };
});
const chatCompletionText = vi.fn();
vi.mock("@/lib/ai-engines", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/ai-engines")>();
  return { ...real, chatCompletionText: (...a: unknown[]) => chatCompletionText(...a), getEngineError: () => null };
});

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (corpo: unknown) =>
  new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
const get = () => new Request("http://localhost/api");

beforeEach(() => {
  chatCompletionText.mockReset();
  db = criarFakeDb({
    students: [
      { id: "est-A", workspace_id: "ws-A", name: "Estudante A Fictícia", grade: "5º ano", pei_data: { diagnostico: "A" }, daily_logs: [], paee_ciclos: [] },
      { id: "est-B", workspace_id: "ws-B", name: "Estudante B Fictícia", grade: "5º ano", pei_data: { diagnostico: "SEGREDO-B" }, daily_logs: [{ data_sessao: "2026-01-01", atividade_principal: "SEGREDO-B" }], paee_ciclos: [] },
    ],
    workspace_members: [
      { id: "mem-A", workspace_id: "ws-A", nome: "Professora A", email: "a@escola-a.test", active: true },
      { id: "mem-B", workspace_id: "ws-B", nome: "Professora B", email: "b@escola-b.test", active: true },
    ],
    pei_disciplinas: [{ id: "pd-B", workspace_id: "ws-B", student_id: "est-B", nota: "SEGREDO-B" }],
    avaliacoes_diagnosticas: [],
    avaliacao_processual: [],
    monitoring_assessments: [],
    teacher_student_links: [],
    teacher_assignments: [],
    audit_log: [],
  });
});

describe("Isolamento entre escolas: estudante da escola B pedido pela escola A", () => {
  it("students/[id]/export: 404, sem dados da escola B", async () => {
    const { GET } = await import("@/app/api/students/[id]/export/route");
    const res = await GET(get(), params("est-B"));
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain("SEGREDO-B");
  });

  it("students/[id]/export: controle positivo, a própria escola exporta", async () => {
    const { GET } = await import("@/app/api/students/[id]/export/route");
    const res = await GET(get(), params("est-A"));
    expect(res.status).toBe(200);
  });

  it("students/[id]/pei-data GET: 404, sem dados da escola B", async () => {
    const { GET } = await import("@/app/api/students/[id]/pei-data/route");
    const res = await GET(get(), params("est-B"));
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain("SEGREDO-B");
  });

  it("students/[id]/pei-data GET: controle positivo", async () => {
    const { GET } = await import("@/app/api/students/[id]/pei-data/route");
    const res = await GET(get(), params("est-A"));
    expect(res.status).toBe(200);
    expect((await res.json()).pei_data).toEqual({ diagnostico: "A" });
  });

  it("paee/relatorio-ciclo: 404 e a IA nem é chamada", async () => {
    const { POST } = await import("@/app/api/paee/relatorio-ciclo/route");
    const res = await POST(post({ studentId: "est-B", ciclo: { nome: "Ciclo 1" }, engine: "red" }));
    expect(res.status).toBe(404);
    expect(chatCompletionText).not.toHaveBeenCalled();
  });

  it("pei/avaliacao-diagnostica/salvar: 404 e não grava", async () => {
    const { POST } = await import("@/app/api/pei/avaliacao-diagnostica/salvar/route");
    const res = await POST(post({ studentId: "est-B", disciplina: "Matemática", questoes_geradas: [] }));
    expect(res.status).toBe(404);
    expect(db.inserts).toHaveLength(0);
  });

  it("pei/avaliacao-diagnostica/salvar: controle positivo grava na escola da sessão", async () => {
    const { POST } = await import("@/app/api/pei/avaliacao-diagnostica/salvar/route");
    const res = await POST(post({ studentId: "est-A", disciplina: "Matemática", questoes_geradas: [] }));
    expect(res.status).toBe(200);
    expect(db.inserts).toHaveLength(1);
    expect(db.inserts[0].linha.workspace_id).toBe("ws-A");
  });

  it("monitoring/assessment: 404 e não grava", async () => {
    const { POST } = await import("@/app/api/monitoring/assessment/route");
    const res = await POST(post({ student_id: "est-B", rubric_data: {}, observation: "x" }) as never);
    expect(res.status).toBe(404);
    expect(db.inserts).toHaveLength(0);
  });

  it("monitoring/assessment: controle positivo", async () => {
    const { POST } = await import("@/app/api/monitoring/assessment/route");
    const res = await POST(post({ student_id: "est-A", rubric_data: {}, observation: "x" }) as never);
    expect(res.status).toBe(200);
    expect(db.inserts).toHaveLength(1);
  });
});

describe("Isolamento entre escolas: membro da escola B pedido pela escola A", () => {
  it("members/[id]/export: 404, sem dados do membro B", async () => {
    const { GET } = await import("@/app/api/members/[id]/export/route");
    const res = await GET(get(), params("mem-B"));
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain("b@escola-b.test");
  });

  it("members/[id]/export: controle positivo", async () => {
    const { GET } = await import("@/app/api/members/[id]/export/route");
    const res = await GET(get(), params("mem-A"));
    expect(res.status).toBe(200);
  });

  it("members/[id]/delete-data: 404 e o membro B continua intacto", async () => {
    const { POST } = await import("@/app/api/members/[id]/delete-data/route");
    const res = await POST(post({}), params("mem-B"));
    expect(res.status).toBe(404);
    expect(db.updates).toHaveLength(0);
    const b = db.tabelas.workspace_members.find((m) => m.id === "mem-B");
    expect(b?.email).toBe("b@escola-b.test");
    expect(b?.active).toBe(true);
  });

  it("members/[id]/delete-data: a anonimização não grava nome nem e-mail no log de auditoria", async () => {
    const { POST } = await import("@/app/api/members/[id]/delete-data/route");
    const res = await POST(post({}), params("mem-A"));
    expect(res.status).toBe(200);
    const logs = db.inserts.filter((i) => i.tabela === "audit_log");
    const texto = JSON.stringify(logs);
    expect(texto).not.toContain("Professora A");
    expect(texto).not.toContain("a@escola-a.test");
  });
});
