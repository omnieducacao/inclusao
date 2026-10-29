import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · onda 102: a escola cliente dentro do app (espelho do modo família do site) e o resumo do período. */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));
vi.mock("@/lib/familia-caixa", async (orig) => ({
  ...(await orig<typeof import("@/lib/familia-caixa")>()),
  mensagensDoEstudante: vi.fn(async () => ({ mensagens: [{ id: "x1", autor: "escola", autor_nome: "Coordenação", texto: "Bom dia!", lida_em: null, created_at: "2026-10-27T10:00:00Z" }], semMigracao: false })),
  marcarMensagensLidas: vi.fn(async () => {}),
  cifrar: (s: string) => `cifrado:${s}`,
}));
vi.mock("@/lib/missoes-servidor", () => ({
  CAMPOS_MISSAO: "id, titulo, status",
  listarMissoes: vi.fn(async () => ({ missoes: [{ id: "mi1", titulo: "Guardar a mochila", status: "aprovada" }], semMigracao: false })),
}));

const MAE = "11111111-1111-4111-8111-111111111111";
const OUTRA = "22222222-2222-4222-8222-222222222222";
const WS = "99999999-9999-4999-8999-999999999999";
const ALUNO = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

function base() {
  return criarFakeDb({
    pessoas: [{ id: MAE, nome: "Patrícia", ativo: true }, { id: OUTRA, nome: "Outra", ativo: true }],
    workspaces: [{ id: WS, name: "Colégio Modelo" }],
    family_responsibles: [{ id: "fr-escola", workspace_id: WS, pessoa_id: MAE, parentesco: "mãe", active: true }],
    family_student_links: [{ family_responsible_id: "fr-escola", student_id: ALUNO }],
    students: [{ id: ALUNO, workspace_id: WS, name: "Pedro Alves", grade: "1º ano", class_group: "A", pei_data: { resumo_familia: { texto: "Pedro avança com rotina visual.", liberado_em: "2026-10-20" }, vigencia: { versao: 2 } }, paee_ciclos: [], planejamento_ativo: null }],
    family_pei_acknowledgments: [],
    family_mensagens: [],
    estudante_missoes: [{ id: "mi1", student_id: ALUNO, workspace_id: WS, status: "aprovada" }],
    familias: [],
    familia_responsaveis: [],
    criancas: [],
    crianca_escolas: [],
    rede_membros: [],
    rede_permissoes: [],
    consentimentos: [],
    workspace_members: [],
    registros: [],
    app_sessoes: [],
  }, { uuid: true });
}

async function chamar(rota: { [k: string]: unknown }, metodo: string, pessoa: string | null, corpo?: unknown, params?: Record<string, string>, query = "") {
  const s = await import("@/lib/app/sessao");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (pessoa) headers.authorization = `Bearer ${await s.emitirAcesso(pessoa)}`;
  const req = new Request(`https://omnisfera.net/api/app/v1/x${query}`, { method: metodo, headers, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  const r = await (rota[metodo] as (r: Request, c?: unknown) => Promise<Response>)(req, params ? { params: Promise.resolve(params) } : undefined);
  return { status: r.status, json: (await r.json()) as Record<string, unknown> };
}

beforeEach(async () => {
  db = base();
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres");
  (await import("@/lib/app/sessao"))._esquecerSegredo();
});

describe("família da escola entra no app", () => {
  it("/eu cria a criança, a família e põe a escola na rede; rodar de novo não duplica", async () => {
    const eu = await import("@/app/api/app/v1/eu/route");
    const r1 = await chamar(eu, "GET", MAE);
    expect(r1.status).toBe(200);
    // (o banco de mentira não resolve tabelas embutidas; conferimos o que foi criado)
    expect(db.tabelas.familias).toHaveLength(1);
    expect(db.tabelas.familias[0]).toMatchObject({ origem: "escola", plano: "escola", nome: "Família de Pedro" });
    expect(db.tabelas.criancas).toHaveLength(1);
    expect(db.tabelas.criancas[0]).toMatchObject({ nome: "Pedro Alves", familia_id: db.tabelas.familias[0].id });
    expect(db.tabelas.familia_responsaveis[0]).toMatchObject({ pessoa_id: MAE, familia_id: db.tabelas.familias[0].id, principal: true });
    expect(db.tabelas.crianca_escolas).toHaveLength(1);
    expect(db.tabelas.crianca_escolas[0]).toMatchObject({ student_id: ALUNO, workspace_id: WS, status: "ativo" });
    expect(db.tabelas.rede_membros[0]).toMatchObject({ tipo: "escola", workspace_id: WS, nome: "Colégio Modelo", status: "ativo" });
    expect(db.tabelas.rede_permissoes.find((p) => p.categoria === "eventos_escola")).toMatchObject({ pode_ver: true, pode_escrever: true });
    expect(db.tabelas.consentimentos).toHaveLength(1);

    await chamar(eu, "GET", MAE);
    expect(db.tabelas.criancas).toHaveLength(1);
    expect(db.tabelas.familia_responsaveis).toHaveLength(1);
    expect(db.tabelas.rede_membros).toHaveLength(1);
  });

  it("quem não é responsável na escola não vê a escola da criança", async () => {
    const eu = await import("@/app/api/app/v1/eu/route");
    await chamar(eu, "GET", MAE);
    const criancaId = String(db.tabelas.criancas[0].id);
    const escola = await import("@/app/api/app/v1/criancas/[id]/escola/route");
    expect((await chamar(escola, "GET", OUTRA, undefined, { id: criancaId })).status).toBe(403);
    // outra pessoa que a família pôs como responsável (ex.: pai sem cadastro na escola) vê a criança, mas sem a escola
    db.tabelas.familia_responsaveis.push({ id: "fr2", familia_id: db.tabelas.familias[0].id, pessoa_id: OUTRA, principal: false });
    const r = await chamar(escola, "GET", OUTRA, undefined, { id: criancaId });
    expect(r.status).toBe(200);
    expect(r.json.escola).toBeNull();
  });

  it("a escola da criança: plano, ciência, evolução, missões e mensagens novas", async () => {
    const eu = await import("@/app/api/app/v1/eu/route");
    await chamar(eu, "GET", MAE);
    const criancaId = String(db.tabelas.criancas[0].id);
    const escola = await import("@/app/api/app/v1/criancas/[id]/escola/route");
    const r = await chamar(escola, "GET", MAE, undefined, { id: criancaId });
    expect(r.status).toBe(200);
    expect(r.json.escola).toMatchObject({
      nome: "Colégio Modelo",
      turma: "1º ano · A",
      plano: { resumo: "Pedro avança com rotina visual.", versao: 2 },
      ciencia_pei: { acknowledged: false },
      missoes: [{ id: "mi1" }],
      mensagens_novas: 1,
    });

    const ciencia = await import("@/app/api/app/v1/criancas/[id]/escola/ciencia-pei/route");
    expect((await chamar(ciencia, "POST", MAE, {}, { id: criancaId })).json).toMatchObject({ acknowledged: true, ja: false });
    expect(db.tabelas.family_pei_acknowledgments[0]).toMatchObject({ family_responsible_id: "fr-escola", student_id: ALUNO });
    expect((await chamar(ciencia, "POST", MAE, {}, { id: criancaId })).json).toMatchObject({ ja: true });

    const mensagens = await import("@/app/api/app/v1/criancas/[id]/escola/mensagens/route");
    expect((await chamar(mensagens, "POST", MAE, { texto: "" }, { id: criancaId })).status).toBe(400);
    const m = await chamar(mensagens, "POST", MAE, { texto: "Obrigada pelo retorno!" }, { id: criancaId });
    expect(m.status).toBe(201);
    expect(db.tabelas.family_mensagens[0]).toMatchObject({ autor: "familia", workspace_id: WS, student_id: ALUNO, family_responsible_id: "fr-escola", texto: "cifrado:Obrigada pelo retorno!" });

    const missoes = await import("@/app/api/app/v1/criancas/[id]/escola/missoes/route");
    const feita = await chamar(missoes, "POST", MAE, { id: "mi1", nota: "Guardou sozinho" }, { id: criancaId });
    expect(feita.status).toBe(200);
    expect(db.tabelas.estudante_missoes[0]).toMatchObject({ status: "feita", nota_familia: "Guardou sozinho" });
    expect((await chamar(missoes, "POST", MAE, { id: "mi1" }, { id: criancaId })).status).toBe(400);
  });
});

describe("resumo do período", () => {
  it("conta crises por semana, faixas do dia, gatilhos e o que ajudou; respeita o que a pessoa vê", async () => {
    const { resumir } = await import("@/lib/app/resumo");
    const agora = new Date("2026-10-28T12:00:00Z");
    const d = (dias: number, hora: number) => new Date(agora.getTime() - dias * 864e5 + (hora - 12) * 3600e3).toISOString();
    const r = resumir([
      { tipo: "evento", categoria: "eventos_escola", subtipo: "crise", quando: d(1, 10), duracao: "20 min", gatilho: "barulho alto", local: "escola", dados: { ajudou: "fone abafador" } },
      { tipo: "evento", categoria: "eventos_casa", subtipo: "crise", quando: d(9, 18), duracao: "12 min", gatilho: "Barulho alto", local: "casa", dados: { ajudou: "cantinho da calma" } },
      { tipo: "evento", categoria: "eventos_casa", subtipo: "agitacao", quando: d(2, 15), duracao: null, gatilho: "troca de atividade", local: "casa", dados: {} },
      { tipo: "evento", categoria: "eventos_casa", subtipo: "sono", quando: d(1, 21), duracao: null, gatilho: null, local: "casa", dados: {} },
      { tipo: "dose", categoria: "medicacao", subtipo: "dada", quando: d(1, 7), duracao: null, gatilho: null, local: "casa", dados: {} },
      { tipo: "dose", categoria: "medicacao", subtipo: "dada", quando: d(2, 7), duracao: null, gatilho: null, local: "casa", dados: {} },
      { tipo: "evento", categoria: "eventos_escola", subtipo: "avanco", quando: d(3, 9), duracao: null, gatilho: null, local: "escola", dados: {} },
      { tipo: "evento", categoria: "eventos_casa", subtipo: "crise", quando: d(40, 9), duracao: "30 min", gatilho: "fora do período", local: "casa", dados: {} },
    ], 30, agora);
    expect(r.crises.total).toBe(2);
    expect(r.crises.duracao_media_min).toBe(16);
    expect(r.crises.por_semana.reduce((a, s) => a + s.crises, 0)).toBe(2);
    expect(r.gatilhos[0]).toEqual({ texto: "barulho alto", total: 2 });
    expect(r.ajudou.map((a) => a.texto)).toEqual(["fone abafador", "cantinho da calma"]);
    expect(r.medicacao).toEqual({ doses_dadas: 2, doses_nao_dadas: 0, dias_com_dose: 2 });
    expect(r.avancos).toBe(1);
    expect(r.faixas.reduce((a, f) => a + f.total, 0)).toBe(3);

    const MAEID = MAE;
    const FONO = "33333333-3333-4333-8333-333333333333";
    const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    db.tabelas.criancas = [{ id: PEDRO, familia_id: "fam1", nome: "Pedro", modo: "crianca", adolescente_pessoa_id: null, adolescente_pausado: false }];
    db.tabelas.familia_responsaveis = [{ id: "fr1", familia_id: "fam1", pessoa_id: MAEID }];
    db.tabelas.rede_membros = [{ id: "m-fono", crianca_id: PEDRO, pessoa_id: FONO, workspace_id: null, status: "ativo", acesso_ate: null }];
    db.tabelas.rede_permissoes = [{ membro_id: "m-fono", categoria: "eventos_casa", pode_ver: true, pode_escrever: false }];
    db.tabelas.registros = [{ id: "r1", crianca_id: PEDRO, tipo: "evento", categoria: "eventos_casa", subtipo: "crise", quando: new Date().toISOString(), duracao: "5 min", gatilho: null, local: "casa", dados: {}, apagado_em: null }];
    const rota = await import("@/app/api/app/v1/criancas/[id]/resumo/route");
    expect((await chamar(rota, "GET", FONO, undefined, { id: PEDRO }, "?dias=30")).status).toBe(403);
    db.tabelas.rede_permissoes.push({ membro_id: "m-fono", categoria: "resumo", pode_ver: true, pode_escrever: false });
    const ok = await chamar(rota, "GET", FONO, undefined, { id: PEDRO }, "?dias=14");
    expect(ok.status).toBe(200);
    expect((ok.json.resumo as { dias: number; crises: { total: number } }).dias).toBe(14);
    expect((ok.json.resumo as { crises: { total: number } }).crises.total).toBe(1);
  });

  it("registro guarda o que ajudou", async () => {
    const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    db.tabelas.criancas = [{ id: PEDRO, familia_id: "fam1", nome: "Pedro", modo: "crianca", adolescente_pessoa_id: null, adolescente_pausado: false }];
    db.tabelas.familia_responsaveis = [{ id: "fr1", familia_id: "fam1", pessoa_id: MAE }];
    const reg = await import("@/app/api/app/v1/criancas/[id]/registros/route");
    const r = await chamar(reg, "POST", MAE, { tipo: "evento", subtipo: "crise", local: "casa", ajudou: "abraço firme" }, { id: PEDRO });
    expect(r.status).toBe(201);
    expect(db.tabelas.registros.at(-1)).toMatchObject({ dados: { ajudou: "abraço firme" } });
  });
});
