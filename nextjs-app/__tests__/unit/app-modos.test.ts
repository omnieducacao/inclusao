import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/**
 * Frente 6 · onda 103: os modos do app (SCRUM-309), o combo escola + plano da família (SCRUM-311)
 * e a jornada em que o PEI vira missões e as missões viram conquistas (SCRUM-310).
 */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));

const MAE = "11111111-1111-4111-8111-111111111111";
const TEEN = "44444444-4444-4444-8444-444444444444";
const WS = "99999999-9999-4999-8999-999999999999";
const ALUNO = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MI_APROVADA = "eeeeeeee-eeee-4eee-8eee-000000000001";
const MI_CONFIRMADA = "eeeeeeee-eeee-4eee-8eee-000000000002";

function base(extra: Record<string, Record<string, unknown>[]> = {}) {
  return criarFakeDb({
    pessoas: [{ id: MAE, nome: "Patrícia", ativo: true }, { id: TEEN, nome: "Pedro", ativo: true }],
    workspaces: [{ id: WS, name: "Colégio Modelo" }],
    family_responsibles: [{ id: "fr-escola", workspace_id: WS, pessoa_id: MAE, parentesco: "mãe", active: true }],
    family_student_links: [{ family_responsible_id: "fr-escola", student_id: ALUNO }],
    students: [{ id: ALUNO, workspace_id: WS, name: "Pedro Alves" }],
    familias: [],
    familia_responsaveis: [],
    criancas: [],
    crianca_escolas: [],
    rede_membros: [],
    rede_permissoes: [],
    consentimentos: [],
    workspace_members: [],
    registros: [],
    app_missoes: [],
    estudante_missoes: [],
    conquistas: [],
    conquistas_catalogo: [
      { id: "cat-1", codigo: "primeira-missao", nome: "Primeira missão", figura: "estrela", tipo: "automatica", regra: { missoes_total: 1 }, ativa: true },
    ],
    app_sessoes: [],
    ...extra,
  }, { uuid: true });
}

/** Família que assinou direto (plano "teste") e já acompanha o Pedro no app, sem escola ligada. */
function familiaDireta() {
  db.tabelas.familias.push({ id: "fam-direta", nome: "Família Alves", origem: "direto", plano: "teste" });
  db.tabelas.familia_responsaveis.push({ id: "fr-direta", familia_id: "fam-direta", pessoa_id: MAE, parentesco: "mãe", principal: true });
  db.tabelas.criancas.push({ id: PEDRO, familia_id: "fam-direta", nome: "Pedro", modo: "crianca", adolescente_pessoa_id: null, adolescente_pausado: false });
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

describe("modos do app", () => {
  it("cada configuração libera o seu pedaço, e o adolescente é uma camada por cima", async () => {
    const { montarRecursos, nomeDoModo } = await import("@/lib/app/recursos");
    const soEscola = montarRecursos({ plano: "escola", escola: "Colégio Modelo", adolescente: false });
    expect(soEscola).toMatchObject({ escola: { nome: "Colégio Modelo" }, cuidado: false, jornada: true });
    expect(nomeDoModo(soEscola)).toBe("Escola");
    const direta = montarRecursos({ plano: "assinatura", escola: null, adolescente: false });
    expect(direta).toMatchObject({ escola: null, cuidado: true, jornada: true });
    expect(nomeDoModo(montarRecursos({ plano: "teste", escola: "Colégio Modelo", adolescente: true }))).toBe("Escola e plano da família");
    expect(montarRecursos({ plano: "encerrado", escola: null, adolescente: false })).toMatchObject({ cuidado: false, jornada: false });
    expect(montarRecursos({ plano: "escola", escola: "Colégio Modelo", adolescente: true }).adolescente).toBe(true);
  });

  it("recursos por criança: família da escola, família direta e combo", async () => {
    familiaDireta();
    const eu = await import("@/app/api/app/v1/eu/route");
    const r = await chamar(eu, "GET", MAE);
    // a mãe já acompanha o Pedro no plano da família: o aluno da escola não vira outra criança sozinho
    expect(db.tabelas.criancas).toHaveLength(1);
    expect(r.json.escola_pendente).toEqual([{ student_id: ALUNO, escola: "Colégio Modelo", aluno: "Pedro Alves", opcoes: [{ id: PEDRO, nome: "Pedro" }] }]);
    const { recursosDasCriancas } = await import("@/lib/app/recursos");
    expect((await recursosDasCriancas([PEDRO]))[PEDRO]).toMatchObject({ escola: null, cuidado: true });

    // "é o mesmo Pedro": a escola entra na criança que a família já acompanha (combo)
    const ligar = await import("@/app/api/app/v1/escola/ligar/route");
    const ok = await chamar(ligar, "POST", MAE, { student_id: ALUNO, crianca_id: PEDRO });
    expect(ok.status).toBe(200);
    expect(db.tabelas.crianca_escolas).toEqual([expect.objectContaining({ crianca_id: PEDRO, student_id: ALUNO, status: "ativo", aceito_por: MAE })]);
    expect(db.tabelas.rede_membros[0]).toMatchObject({ crianca_id: PEDRO, tipo: "escola", workspace_id: WS });
    expect((await recursosDasCriancas([PEDRO]))[PEDRO]).toMatchObject({ escola: { nome: "Colégio Modelo" }, cuidado: true, plano: "teste" });
    expect(db.tabelas.familias).toHaveLength(1); // nada duplicado

    // de novo: nada pendente, nada criado
    const r2 = await chamar(eu, "GET", MAE);
    expect(r2.json.escola_pendente).toEqual([]);
    expect(db.tabelas.criancas).toHaveLength(1);
    expect((await chamar(ligar, "POST", MAE, { student_id: ALUNO, crianca_id: PEDRO })).status).toBe(409);
  });

  it("é outra criança: o aluno vira uma criança nova, só com a escola", async () => {
    familiaDireta();
    const ligar = await import("@/app/api/app/v1/escola/ligar/route");
    const r = await chamar(ligar, "POST", MAE, { student_id: ALUNO, crianca_id: null });
    expect(r.status).toBe(200);
    expect(db.tabelas.criancas).toHaveLength(2);
    const nova = String(r.json.crianca_id);
    expect(nova).not.toBe(PEDRO);
    const { recursosDasCriancas } = await import("@/lib/app/recursos");
    expect((await recursosDasCriancas([nova]))[nova]).toMatchObject({ escola: { nome: "Colégio Modelo" }, cuidado: false, plano: "escola" });
    // não dá para ligar a criança de outra família nem um aluno que não é seu
    expect((await chamar(ligar, "POST", MAE, { student_id: "dddddddd-dddd-4ddd-8ddd-000000000000", crianca_id: null })).status).toBe(404);
  });

  it("sem plano da família, o aluno da escola continua virando criança sozinho (como na onda 102)", async () => {
    const eu = await import("@/app/api/app/v1/eu/route");
    const r = await chamar(eu, "GET", MAE);
    expect(r.json.escola_pendente).toEqual([]);
    expect(db.tabelas.criancas).toHaveLength(1);
    expect(db.tabelas.familias[0]).toMatchObject({ origem: "escola", plano: "escola" });
  });
});

describe("jornada: o PEI vira missões, as missões viram conquistas", () => {
  function comEscolaEMissoes() {
    familiaDireta();
    db.tabelas.criancas[0].adolescente_pessoa_id = TEEN;
    db.tabelas.criancas[0].modo = "adolescente";
    db.tabelas.crianca_escolas.push({ id: "ce1", crianca_id: PEDRO, workspace_id: WS, student_id: ALUNO, status: "ativo" });
    db.tabelas.estudante_missoes.push(
      { id: MI_APROVADA, student_id: ALUNO, workspace_id: WS, titulo: "Guardar a mochila sozinho", passos: ["Tirar a lancheira", "Pendurar no gancho"], meta: "Autonomia na rotina", onde: "casa", status: "aprovada", confirmada_em: null },
      { id: MI_CONFIRMADA, student_id: ALUNO, workspace_id: WS, titulo: "Pedir água com palavras", passos: [], meta: "Comunicação", onde: "casa", status: "confirmada", confirmada_em: "2026-10-20T10:00:00Z" },
      { id: "eeeeeeee-eeee-4eee-8eee-000000000003", student_id: ALUNO, workspace_id: WS, titulo: "Rascunho que a escola não aprovou", passos: [], meta: null, onde: "casa", status: "rascunho", confirmada_em: null },
    );
  }

  it("as missões da escola entram na jornada do adolescente; a confirmada já rende conquista", async () => {
    comEscolaEMissoes();
    const missoes = await import("@/app/api/app/v1/criancas/[id]/missoes/route");
    const r = await chamar(missoes, "GET", TEEN, undefined, { id: PEDRO });
    expect(r.status).toBe(200);
    const doPei = db.tabelas.app_missoes.filter((m) => m.origem === "pei");
    expect(doPei).toHaveLength(2);
    expect(doPei.find((m) => m.estudante_missao_id === MI_APROVADA)).toMatchObject({ status: "ativa", meta_ref: "Autonomia na rotina", etapas: [{ texto: "Tirar a lancheira" }, { texto: "Pendurar no gancho" }] });
    expect(doPei.find((m) => m.estudante_missao_id === MI_CONFIRMADA)).toMatchObject({ status: "confirmada", etapas: [{ texto: "Pedir água com palavras" }] });
    expect(r.json.conquistas_novas).toEqual([{ nome: "Primeira missão", figura: "estrela" }]);
    // sincronizar de novo não duplica nem dá a conquista outra vez
    const r2 = await chamar(missoes, "GET", TEEN, undefined, { id: PEDRO });
    expect(db.tabelas.app_missoes).toHaveLength(2);
    expect(r2.json.conquistas_novas).toEqual([]);
  });

  it("o adolescente faz as etapas; a escola fica sabendo e é ela quem confirma", async () => {
    comEscolaEMissoes();
    const missoes = await import("@/app/api/app/v1/criancas/[id]/missoes/route");
    await chamar(missoes, "GET", TEEN, undefined, { id: PEDRO });
    const m = db.tabelas.app_missoes.find((x) => x.estudante_missao_id === MI_APROVADA)!;
    const rota = await import("@/app/api/app/v1/criancas/[id]/missoes/[missaoId]/route");
    const p = { id: PEDRO, missaoId: String(m.id) };
    expect((await chamar(rota, "PATCH", TEEN, { acao: "etapa", indice: 0, feita: true }, p)).json).toMatchObject({ status: "ativa" });
    const fim = await chamar(rota, "PATCH", TEEN, { acao: "etapa", indice: 1, feita: true }, p);
    expect(fim.json).toMatchObject({ status: "feita" });
    expect(db.tabelas.estudante_missoes.find((x) => x.id === MI_APROVADA)).toMatchObject({ status: "feita" });

    // a família não confirma nem arquiva missão do PEI: é a escola
    expect((await chamar(rota, "PATCH", MAE, { acao: "confirmar" }, p)).status).toBe(403);
    expect((await chamar(rota, "PATCH", MAE, { acao: "arquivar" }, p)).status).toBe(403);

    // a escola confirma na Omnisfera → na próxima abertura, a missão aparece confirmada no app
    db.tabelas.estudante_missoes.find((x) => x.id === MI_APROVADA)!.status = "confirmada";
    await chamar(missoes, "GET", MAE, undefined, { id: PEDRO });
    expect(db.tabelas.app_missoes.find((x) => x.id === m.id)).toMatchObject({ status: "confirmada" });

    // e se a escola reabrir, as etapas voltam para fazer de novo
    db.tabelas.estudante_missoes.find((x) => x.id === MI_APROVADA)!.status = "aprovada";
    await chamar(missoes, "GET", MAE, undefined, { id: PEDRO });
    const reaberta = db.tabelas.app_missoes.find((x) => x.id === m.id)!;
    expect(reaberta.status).toBe("ativa");
    expect((reaberta.etapas as { feita_em: string | null }[]).every((e) => e.feita_em === null)).toBe(true);
  });

  it("criança que veio da escola sem nascimento: a família informa ao gerar o código do adolescente", async () => {
    familiaDireta();
    db.tabelas.adolescente_codigos = [];
    const rota = await import("@/app/api/app/v1/criancas/[id]/adolescente/route");
    expect((await chamar(rota, "POST", MAE, { acao: "gerar" }, { id: PEDRO })).status).toBe(400);
    expect((await chamar(rota, "POST", MAE, { acao: "gerar", nascimento: "2050-01-01" }, { id: PEDRO })).status).toBe(400);
    const ok = await chamar(rota, "POST", MAE, { acao: "gerar", nascimento: "2013-05-10" }, { id: PEDRO });
    expect(ok.status).toBe(200);
    expect(db.tabelas.criancas[0].nascimento).toBe("2013-05-10");
    expect(String(ok.json.codigo)).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it("estados da escola → estado no app", async () => {
    const { statusNoApp, etapasDaEscola } = await import("@/lib/app/jornada");
    expect(statusNoApp("aprovada", null)).toBe("ativa");
    expect(statusNoApp("aprovada", "ativa")).toBeNull();
    expect(statusNoApp("aprovada", "feita")).toBeNull();
    expect(statusNoApp("feita", "ativa")).toBe("feita");
    expect(statusNoApp("confirmada", "feita")).toBe("confirmada");
    expect(statusNoApp("arquivada", "ativa")).toBe("arquivada");
    expect(etapasDaEscola({ titulo: "Missão", passos: [] })).toEqual([{ texto: "Missão", figura: null, feita_em: null }]);
  });
});
