import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · onda 112: perguntas para a consulta e "o que mudou" no resumo. */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));

const MAE = "11111111-1111-4111-8111-111111111111";
const TEEN = "22222222-2222-4222-8222-222222222222";
const FONO = "33333333-3333-4333-8333-333333333333";
const NEURO = "44444444-4444-4444-8444-444444444444";
const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function base() {
  return criarFakeDb({
    pessoas: [{ id: MAE, nome: "Patrícia", ativo: true }],
    criancas: [{ id: PEDRO, familia_id: "fam1", nome: "Pedro Alves", nascimento: "2013-05-01", modo: "adolescente", adolescente_pessoa_id: TEEN, adolescente_pausado: false }],
    familia_responsaveis: [{ id: "fr1", familia_id: "fam1", pessoa_id: MAE }],
    workspace_members: [],
    rede_membros: [
      { id: "m-fono", crianca_id: PEDRO, pessoa_id: FONO, workspace_id: null, status: "ativo", acesso_ate: null },
      { id: "m-neuro", crianca_id: PEDRO, pessoa_id: NEURO, workspace_id: null, status: "ativo", acesso_ate: null },
    ],
    rede_permissoes: [],
    app_compromissos: [],
    app_agenda_links: [],
    app_sessoes: [],
    registros: [],
    app_missoes: [],
  }, { uuid: true });
}

async function chamar(rota: { [k: string]: unknown }, metodo: string, pessoa: string | null, corpo?: unknown, params?: Record<string, string>, url = "https://omnisfera.net/api/app/v1/x") {
  const s = await import("@/lib/app/sessao");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (pessoa) headers.authorization = `Bearer ${await s.emitirAcesso(pessoa)}`;
  const req = new Request(url, { method: metodo, headers, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  const r = await (rota[metodo] as (r: Request, c?: unknown) => Promise<Response>)(req, params ? { params: Promise.resolve(params) } : undefined);
  const txt = await r.text();
  let json: Record<string, unknown> = {};
  try { json = JSON.parse(txt); } catch { /* .ics */ }
  return { status: r.status, json, txt };
}

beforeEach(async () => {
  db = base();
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres");
  (await import("@/lib/app/sessao"))._esquecerSegredo();
});


const P = { id: PEDRO };
const DIA = 864e5;
const ev = (subtipo: string, diasAtras: number, extra: Record<string, unknown> = {}) => ({ tipo: "evento", categoria: "eventos_casa", subtipo, quando: new Date(Date.now() - diasAtras * DIA).toISOString(), duracao: null, gatilho: null, local: "casa", dados: null, ...extra });

describe("perguntas para a consulta", () => {
  it("a família anota, lista, marca como respondida e apaga", async () => {
    const lista = await import("@/app/api/app/v1/criancas/[id]/perguntas/route");
    const uma = await import("@/app/api/app/v1/criancas/[id]/perguntas/[pid]/route");
    expect((await chamar(lista, "POST", MAE, { texto: "a" }, P)).status).toBe(400);
    const r = await chamar(lista, "POST", MAE, { texto: "A dose da noite pode ser mais cedo?", para: "consulta" }, P);
    expect(r.status).toBe(201);
    const pid = r.json.id as string;
    const reg = db.tabelas.registros.find((x) => x.id === pid)!;
    expect(reg).toMatchObject({ subtipo: "pergunta", dados: { reservado: true, para: "consulta" } });

    let g = await chamar(lista, "GET", MAE, undefined, P);
    expect(g.json.abertas).toHaveLength(1);
    expect((g.json.abertas as { texto: string }[])[0].texto).toMatch(/dose da noite/);

    expect((await chamar(uma, "PATCH", MAE, { respondida: true, resposta: "Pode, às 19h." }, { id: PEDRO, pid })).status).toBe(200);
    g = await chamar(lista, "GET", MAE, undefined, P);
    expect(g.json.abertas).toHaveLength(0);
    expect((g.json.respondidas as { resposta: string }[])[0].resposta).toBe("Pode, às 19h.");

    expect((await chamar(uma, "DELETE", MAE, undefined, { id: PEDRO, pid })).status).toBe(200);
    g = await chamar(lista, "GET", MAE, undefined, P);
    expect(g.json.respondidas).toHaveLength(0);
  });

  it("só a família: a rede e o adolescente não veem nem anotam", async () => {
    const lista = await import("@/app/api/app/v1/criancas/[id]/perguntas/route");
    expect((await chamar(lista, "GET", FONO, undefined, P)).status).toBe(403);
    expect((await chamar(lista, "POST", FONO, { texto: "Posso perguntar?" }, P)).status).toBe(403);
    expect((await chamar(lista, "GET", TEEN, undefined, P)).status).toBe(403);
  });

  it("não aparecem na linha do tempo nem nas contas do resumo", async () => {
    const lista = await import("@/app/api/app/v1/criancas/[id]/perguntas/route");
    await chamar(lista, "POST", MAE, { texto: "Pergunta reservada?" }, P);
    const registros = await import("@/app/api/app/v1/criancas/[id]/registros/route");
    const linha = await chamar(registros, "GET", MAE, undefined, P);
    expect((linha.json.registros as { subtipo: string }[]).some((x) => x.subtipo === "pergunta")).toBe(false);
    const { resumir } = await import("@/lib/app/resumo");
    const r = resumir([ev("pergunta", 1), ev("crise", 2)], 30);
    expect(r.eventos_por_tipo).toEqual([{ subtipo: "crise", total: 1 }]);
  });
});

describe("o que mudou", () => {
  it("compara com o período anterior só com números, até três frases", async () => {
    const { resumir } = await import("@/lib/app/resumo");
    const regs = [
      ev("crise", 2), ev("crise", 5), ev("crise", 40), ev("crise", 41), ev("crise", 42), ev("crise", 43), ev("crise", 44),
      ev("avanco", 3), ev("avanco", 4), ev("avanco", 6), ev("avanco", 35),
      ev("leitura", 1, { dados: { minutos: 20 } }), ev("leitura", 50, { dados: { minutos: 20 } }),
    ];
    const r = resumir(regs, 30);
    expect(r.o_que_mudou.length).toBeLessThanOrEqual(3);
    expect(r.o_que_mudou).toContain("Crises: 2 neste período e 5 no anterior.");
    expect(r.o_que_mudou[0]).toMatch(/^Crises/); // as crises vêm primeiro quando mudaram
    expect(r.o_que_mudou).toContain("Avanços registrados: 3 neste período e 1 no anterior.");
    expect(r.o_que_mudou.join(" ")).not.toMatch(/Leitura/); // igual nos dois períodos
    expect(r.o_que_mudou.join(" ")).not.toMatch(/melhor|pior/i);
    expect(r.crises.total).toBe(2); // o período anterior não entra nas contas do período
  });

  it("1 contra 0 não passa na frente de uma mudança maior", async () => {
    const { oQueMudou } = await import("@/lib/app/resumo");
    const atual = [ev("calma", 1), ...Array.from({ length: 8 }, (_, i) => ev("avanco", i + 1))];
    const anterior = [ev("palavra", 40), ev("avanco", 40), ev("avanco", 41)];
    expect(oQueMudou(atual, anterior)[0]).toMatch(/^Avanços/);
  });

  it("sem registro no período anterior, não compara", async () => {
    const { resumir } = await import("@/lib/app/resumo");
    expect(resumir([ev("crise", 2)], 30).o_que_mudou).toEqual([]);
  });
});
