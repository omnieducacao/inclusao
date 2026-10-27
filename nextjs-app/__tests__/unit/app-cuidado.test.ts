import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · medicação (e a ponte da dose na escola), missões, conquistas e modo adolescente. */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));

const MAE = "11111111-1111-4111-8111-111111111111";
const FONO = "33333333-3333-4333-8333-333333333333";
const PROF = "44444444-4444-4444-8444-444444444444";
const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MED_CASA = "c1111111-1111-4111-8111-111111111111";
const MED_ESCOLA = "c2222222-2222-4222-8222-222222222222";

function base() {
  return criarFakeDb({
    pessoas: [{ id: MAE, nome: "Patrícia", ativo: true }],
    criancas: [{ id: PEDRO, familia_id: "fam1", nome: "Pedro Alves", nascimento: "2013-03-10", modo: "crianca", adolescente_pessoa_id: null, adolescente_pausado: false }],
    familia_responsaveis: [{ id: "fr1", familia_id: "fam1", pessoa_id: MAE }],
    workspace_members: [],
    rede_membros: [
      { id: "m-fono", crianca_id: PEDRO, pessoa_id: FONO, workspace_id: null, status: "ativo", acesso_ate: null },
      { id: "m-prof", crianca_id: PEDRO, pessoa_id: PROF, workspace_id: null, status: "ativo", acesso_ate: null },
    ],
    rede_permissoes: [
      { membro_id: "m-fono", categoria: "medicacao", pode_ver: true, pode_escrever: false },
      { membro_id: "m-prof", categoria: "medicacao", pode_ver: true, pode_escrever: false },
      { membro_id: "m-prof", categoria: "missoes", pode_ver: true, pode_escrever: true },
    ],
    medicacoes: [
      { id: MED_CASA, crianca_id: PEDRO, nome: "Remédio A", ativa: true, na_escola: false },
      { id: MED_ESCOLA, crianca_id: PEDRO, nome: "Remédio B", ativa: true, na_escola: true },
    ],
    registros: [],
    app_missoes: [],
    conquistas: [],
    conquistas_catalogo: [
      { id: "k1", codigo: "primeira-missao", nome: "Primeira missão", figura: "estrela", tipo: "automatica", regra: { missoes_total: 1 }, ativa: true },
      { id: "k2", codigo: "cinco-na-semana", nome: "5 na semana", figura: "foguete", tipo: "automatica", regra: { missoes_semana: 5 }, ativa: true },
      { id: "k4", codigo: "dez-dias-sentindo", nome: "10 dias me ouvindo", figura: "coracao", tipo: "automatica", regra: { humor_dias: 10 }, ativa: true },
      { id: "k5", codigo: "concedida", nome: "Conquista especial", figura: "medalha", tipo: "concedida", regra: null, ativa: true },
    ],
    adolescente_codigos: [],
    consentimentos: [],
    app_sessoes: [],
  }, { uuid: true });
}

async function chamar(rota: { [k: string]: unknown }, metodo: string, pessoa: string | null, corpo?: unknown, params?: Record<string, string>) {
  const s = await import("@/lib/app/sessao");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (pessoa) headers.authorization = `Bearer ${await s.emitirAcesso(pessoa)}`;
  const req = new Request("https://omnisfera.net/api/app/v1/x", { method: metodo, headers, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  const r = await (rota[metodo] as (r: Request, c?: unknown) => Promise<Response>)(req, params ? { params: Promise.resolve(params) } : undefined);
  return { status: r.status, json: (await r.json()) as Record<string, unknown> };
}

beforeEach(async () => {
  db = base();
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres");
  (await import("@/lib/app/sessao"))._esquecerSegredo();
});

describe("medicação", () => {
  it("só a família cadastra; horários validados; a rede só vê", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/medicacoes/route");
    expect((await chamar(rota, "POST", FONO, { nome: "X" }, { id: PEDRO })).status).toBe(403);
    expect((await chamar(rota, "POST", MAE, { nome: "Remédio C", horarios: ["7h"] }, { id: PEDRO })).status).toBe(400);
    const ok = await chamar(rota, "POST", MAE, { nome: "Remédio C", dose: "conforme receita", horarios: ["19:00", "07:00"], na_escola: false }, { id: PEDRO });
    expect(ok.status).toBe(201);
    expect(db.tabelas.medicacoes.at(-1)).toMatchObject({ horarios: ["07:00", "19:00"] });
    const lista = await chamar(rota, "GET", FONO, undefined, { id: PEDRO });
    expect((lista.json.medicacoes as unknown[]).length).toBe(3);
  });

  it("a escola marca a dose só do remédio 'na escola'; a família marca qualquer um", async () => {
    const doses = await import("@/app/api/app/v1/criancas/[id]/medicacoes/[medId]/doses/route");
    expect((await chamar(doses, "POST", PROF, { dada: true }, { id: PEDRO, medId: MED_CASA })).status).toBe(403);
    const r = await chamar(doses, "POST", PROF, { dada: true, horario: "12:00", id_local: "abc" }, { id: PEDRO, medId: MED_ESCOLA });
    expect(r.status).toBe(201);
    expect(db.tabelas.registros[0]).toMatchObject({ tipo: "dose", categoria: "medicacao", subtipo: "dada", local: "escola", autor_membro_id: "m-prof" });
    expect((await chamar(doses, "POST", PROF, { dada: true, id_local: "abc" }, { id: PEDRO, medId: MED_ESCOLA })).json.repetido).toBe(true);
    expect((await chamar(doses, "POST", MAE, { dada: false }, { id: PEDRO, medId: MED_CASA })).status).toBe(201);
    expect((await chamar(doses, "POST", MAE, {}, { id: PEDRO, medId: MED_CASA })).status).toBe(400);
  });

  it("encerrar tira da lista do dia", async () => {
    const um = await import("@/app/api/app/v1/criancas/[id]/medicacoes/[medId]/route");
    const lista = await import("@/app/api/app/v1/criancas/[id]/medicacoes/route");
    expect((await chamar(um, "PATCH", FONO, { encerrar: true }, { id: PEDRO, medId: MED_CASA })).status).toBe(403);
    expect((await chamar(um, "PATCH", MAE, { encerrar: true }, { id: PEDRO, medId: MED_CASA })).status).toBe(200);
    expect((await chamar(lista, "GET", MAE, undefined, { id: PEDRO })).json.medicacoes).toHaveLength(1);
  });
});

describe("missões e conquistas", () => {
  it("regras automáticas: 5 na semana, trilha completa", async () => {
    const { quaisRegrasCumpridas } = await import("@/lib/app/conquistas");
    const agora = new Date("2026-10-27T12:00:00Z");
    const feita = (d: string, trilha: string | null = null) => ({ id: d, status: "feita", trilha, etapas: [{ texto: "x", feita_em: d }] });
    const cat = [
      { id: "a", codigo: "s", nome: "5", figura: null, tipo: "automatica", regra: { missoes_semana: 5 } },
      { id: "b", codigo: "t", nome: "T", figura: null, tipo: "automatica", regra: { trilha_completa: true } },
    ];
    const quatro = ["2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25"].map((d) => feita(d + "T10:00:00Z"));
    expect(quaisRegrasCumpridas(quatro, 0, cat, agora)).toEqual([]);
    expect(quaisRegrasCumpridas([...quatro, feita("2026-10-26T10:00:00Z")], 0, cat, agora).map((c) => c.id)).toEqual(["a"]);
    const trilha = [feita("2026-01-01T00:00:00Z", "rotina"), feita("2026-01-02T00:00:00Z", "rotina")];
    expect(quaisRegrasCumpridas(trilha, 0, cat, agora).map((c) => c.id)).toEqual(["b"]);
    expect(quaisRegrasCumpridas([...trilha, { id: "z", status: "ativa", trilha: "rotina", etapas: [] }], 0, cat, agora)).toEqual([]);
  });

  it("cria, marca as etapas, termina, ganha a primeira conquista; o adulto confirma", async () => {
    const lista = await import("@/app/api/app/v1/criancas/[id]/missoes/route");
    const uma = await import("@/app/api/app/v1/criancas/[id]/missoes/[missaoId]/route");
    expect((await chamar(lista, "POST", FONO, { titulo: "X", etapas: ["a"] }, { id: PEDRO })).status).toBe(403);
    expect((await chamar(lista, "POST", MAE, { titulo: "Arrumar a mochila", etapas: [] }, { id: PEDRO })).status).toBe(400);
    const c = await chamar(lista, "POST", PROF, { titulo: "Arrumar a mochila", etapas: [{ texto: "Caderno", figura: "livro" }, "Estojo"], onde: "escola" }, { id: PEDRO });
    expect(c.status).toBe(201);
    const m = db.tabelas.app_missoes[0];
    expect(m).toMatchObject({ origem: "escola", status: "ativa" });
    const MID = m.id as string;

    let r = await chamar(uma, "PATCH", MAE, { acao: "etapa", indice: 0, feita: true }, { id: PEDRO, missaoId: MID });
    expect(r.json).toMatchObject({ status: "ativa", conquistas_novas: [] });
    expect((await chamar(uma, "PATCH", MAE, { acao: "confirmar" }, { id: PEDRO, missaoId: MID })).status).toBe(400);
    r = await chamar(uma, "PATCH", MAE, { acao: "etapa", indice: 1, feita: true }, { id: PEDRO, missaoId: MID });
    expect(r.json.status).toBe("feita");
    expect(r.json.conquistas_novas).toEqual([{ nome: "Primeira missão", figura: "estrela" }]);
    r = await chamar(uma, "PATCH", PROF, { acao: "confirmar" }, { id: PEDRO, missaoId: MID });
    expect(r.json).toMatchObject({ status: "confirmada", conquistas_novas: [] }); // não ganha de novo
    expect((await chamar(uma, "PATCH", MAE, { acao: "etapa", indice: 0, feita: false }, { id: PEDRO, missaoId: MID })).status).toBe(400);
    expect((await chamar(uma, "PATCH", PROF, { acao: "arquivar" }, { id: PEDRO, missaoId: MID })).status).toBe(200); // quem criou arquiva
  });

  it("conquista especial: adulto entrega com frase; a lista aparece para quem vê missões", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/conquistas/route");
    expect((await chamar(rota, "POST", MAE, { frase: "" }, { id: PEDRO })).status).toBe(400);
    expect((await chamar(rota, "POST", FONO, { frase: "Muito bem" }, { id: PEDRO })).status).toBe(403);
    expect((await chamar(rota, "POST", MAE, { frase: "Foi ao dentista sem chorar!", figura: "sol" }, { id: PEDRO })).status).toBe(201);
    expect(db.tabelas.conquistas[0]).toMatchObject({ nome: "Conquista especial", figura: "sol", concedida_por: MAE, catalogo_id: "k5" });
    expect((await chamar(rota, "GET", PROF, undefined, { id: PEDRO })).json.conquistas).toHaveLength(1);
  });
});

describe("modo adolescente", () => {
  it("a família gera o código; o filho ativa sem e-mail nem senha; o código vale uma vez", async () => {
    const familia = await import("@/app/api/app/v1/criancas/[id]/adolescente/route");
    const ativar = await import("@/app/api/app/v1/auth/adolescente/route");
    const { acessoACrianca } = await import("@/lib/app/acesso");
    expect((await chamar(familia, "POST", PROF, { acao: "gerar" }, { id: PEDRO })).status).toBe(403);
    const g = await chamar(familia, "POST", MAE, { acao: "gerar" }, { id: PEDRO });
    expect(g.status).toBe(200);
    const codigo = String(g.json.codigo);
    expect(codigo).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(JSON.stringify(db.tabelas.adolescente_codigos)).not.toContain(codigo.replace("-", ""));

    expect((await chamar(ativar, "POST", null, { codigo: "AAAA-AAAA" })).status).toBe(401);
    const a = await chamar(ativar, "POST", null, { codigo: codigo.toLowerCase().replace("-", " ") });
    expect(a.status).toBe(200);
    expect(a.json.acesso).toBeTruthy();
    const teen = (a.json.pessoa as { id: string }).id;
    const nova = db.tabelas.pessoas.find((p) => p.id === teen)!;
    expect(nova).toMatchObject({ nome: "Pedro" });
    expect(nova.email).toBeUndefined();
    expect(db.tabelas.criancas[0]).toMatchObject({ modo: "adolescente", adolescente_pessoa_id: teen });
    expect(db.tabelas.consentimentos[0]).toMatchObject({ acao: "ativou_adolescente", autorizado_por: MAE });
    expect((await acessoACrianca(teen, PEDRO))?.papel).toBe("adolescente");
    expect((await chamar(ativar, "POST", null, { codigo })).status).toBe(401);

    // celular novo: outro código, mesma pessoa, o aparelho antigo cai
    const g2 = await chamar(familia, "POST", MAE, { acao: "gerar" }, { id: PEDRO });
    const a2 = await chamar(ativar, "POST", null, { codigo: g2.json.codigo });
    expect((a2.json.pessoa as { id: string }).id).toBe(teen);
    expect(db.tabelas.app_sessoes.filter((s) => s.pessoa_id === teen && !s.revogada_em)).toHaveLength(1);

    // pausar, retomar, encerrar
    expect((await chamar(familia, "POST", MAE, { acao: "pausar" }, { id: PEDRO })).status).toBe(200);
    expect(await acessoACrianca(teen, PEDRO)).toBeNull();
    expect((await chamar(familia, "POST", MAE, { acao: "retomar" }, { id: PEDRO })).status).toBe(200);
    expect((await chamar(familia, "POST", MAE, { acao: "encerrar" }, { id: PEDRO })).status).toBe(200);
    expect(await acessoACrianca(teen, PEDRO)).toBeNull();
    expect(db.tabelas.criancas[0]).toMatchObject({ modo: "crianca", adolescente_pessoa_id: null });
    expect(db.tabelas.app_sessoes.filter((s) => s.pessoa_id === teen && !s.revogada_em)).toHaveLength(0);
  });

  it("idade mínima e data de nascimento", async () => {
    const familia = await import("@/app/api/app/v1/criancas/[id]/adolescente/route");
    db.tabelas.criancas[0].nascimento = "2020-01-01";
    expect((await chamar(familia, "POST", MAE, { acao: "gerar" }, { id: PEDRO })).status).toBe(400);
    db.tabelas.criancas[0].nascimento = null;
    expect((await chamar(familia, "POST", MAE, { acao: "gerar" }, { id: PEDRO })).json.error).toMatch(/nascimento/);
    const { idadeEm } = await import("@/lib/app/adolescente");
    expect(idadeEm("2015-10-28", new Date("2026-10-27T12:00:00Z"))).toBe(10);
    expect(idadeEm("2015-10-27", new Date("2026-10-27T12:00:00Z"))).toBe(11);
  });

  it("o humor do adolescente em 10 dias rende a conquista", async () => {
    const reg = await import("@/app/api/app/v1/criancas/[id]/registros/route");
    const TEEN = "22222222-2222-4222-8222-222222222222";
    db.tabelas.criancas[0].adolescente_pessoa_id = TEEN;
    for (let d = 1; d <= 9; d++) db.tabelas.registros.push({ id: `h${d}`, crianca_id: PEDRO, tipo: "humor", quando: `2026-10-${String(d).padStart(2, "0")}T10:00:00Z`, apagado_em: null });
    const r = await chamar(reg, "POST", TEEN, { tipo: "humor", subtipo: "bom", texto: "dia legal" }, { id: PEDRO });
    expect(r.status).toBe(201);
    expect(r.json.conquistas_novas).toEqual([{ nome: "10 dias me ouvindo", figura: "coracao" }]);
  });
});
