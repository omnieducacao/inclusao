import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · onda 104: Insígnias do Encontro e os três anéis da semana (decisões de 29/10/2026). */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));

const MAE = "11111111-1111-4111-8111-111111111111";
const FONO = "33333333-3333-4333-8333-333333333333";
const ANA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const CAT = [
  ["comunicacao-semente", "Primeira palavra", "comunicacao", "semente", { dominio: "comunicacao", missoes: 1 }, 1],
  ["comunicacao-broto", "Conversa boa", "comunicacao", "broto", { dominio: "comunicacao", missoes: 5 }, 2],
  ["comunicacao-momento", "Pedi ajuda", "comunicacao", "momento", { dominio: "comunicacao" }, 4],
  ["autonomia-semente", "Primeiro passo", "autonomia", "semente", { dominio: "autonomia", missoes: 1 }, 5],
  ["primeira-missao", "Primeira missão", null, "especial", { missoes_total: 1 }, 25],
  ["semana-do-encontro", "Semana do Encontro", null, "especial", { aneis_fechados: true }, 26],
  ["encontro-completo", "Encontro completo", null, "especial", { seis_cores: true }, 27],
  ["mao-dada", "Mão dada", null, "especial", { pei_confirmada: 1 }, 28],
].map(([codigo, nome, dominio, nivel, regra, ordem], i) => ({
  id: `k${i}`, codigo, nome, dominio, nivel, regra, ordem, figura: codigo, ativa: true,
  tipo: nivel === "momento" ? "concedida" : "automatica",
}));

function base() {
  return criarFakeDb({
    pessoas: [{ id: MAE, nome: "Patrícia", ativo: true }],
    criancas: [{ id: ANA, familia_id: "fam1", nome: "Ana Souza", nascimento: "2022-05-01", modo: "crianca", adolescente_pessoa_id: null, adolescente_pausado: false }],
    familia_responsaveis: [{ id: "fr1", familia_id: "fam1", pessoa_id: MAE }],
    workspace_members: [],
    rede_membros: [{ id: "m-fono", crianca_id: ANA, pessoa_id: FONO, workspace_id: null, status: "ativo", acesso_ate: null }],
    rede_permissoes: [{ membro_id: "m-fono", categoria: "missoes", pode_ver: true, pode_escrever: false }],
    registros: [],
    app_missoes: [],
    conquistas: [],
    conquistas_catalogo: CAT,
    app_aneis_metas: [],
    app_semanas_fechadas: [],
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

describe("lógica das insígnias e dos anéis", () => {
  it("a semana começa na segunda, em Brasília", async () => {
    const { inicioDaSemana } = await import("@/lib/app/insignias");
    // quinta, 29/10/2026, 15h em Brasília
    expect(inicioDaSemana(new Date("2026-10-29T18:00:00Z")).dia).toBe("2026-10-26");
    // domingo, 01/11/2026, 23h em Brasília (já é segunda em UTC): ainda é a semana de 26/10
    expect(inicioDaSemana(new Date("2026-11-02T02:00:00Z")).dia).toBe("2026-10-26");
    // segunda, 02/11/2026, 00h30 em Brasília
    expect(inicioDaSemana(new Date("2026-11-02T03:30:00Z")).dia).toBe("2026-11-02");
  });

  it("Fazer conta etapas, Sentir conta calma e humor (remédio não), Junto conta missões confirmadas", async () => {
    const { progressoDosAneis } = await import("@/lib/app/insignias");
    const agora = new Date("2026-10-29T18:00:00Z");
    const missoes = [
      { status: "confirmada", origem: "familia", dominio: "autonomia", etapas: [{ feita_em: "2026-10-27T10:00:00Z" }, { feita_em: "2026-10-28T10:00:00Z" }], confirmada_em: "2026-10-28T10:00:00Z" },
      { status: "ativa", origem: "familia", dominio: null, etapas: [{ feita_em: "2026-10-20T10:00:00Z" }, { feita_em: null }] },
      { status: "arquivada", origem: "familia", dominio: null, etapas: [{ feita_em: "2026-10-27T10:00:00Z" }] },
    ];
    const registros = [
      { tipo: "evento", subtipo: "calma", quando: "2026-10-27T12:00:00Z" },
      { tipo: "humor", subtipo: "bom", quando: "2026-10-28T12:00:00Z" },
      { tipo: "dose", subtipo: null, quando: "2026-10-28T12:00:00Z" },
      { tipo: "evento", subtipo: "crise", quando: "2026-10-28T12:00:00Z" },
    ];
    const a = progressoDosAneis(missoes, registros, { fazer: 2, sentir: 3, junto: 1 }, agora);
    expect(a.semana).toBe("2026-10-26");
    expect(a.fazer).toEqual({ feitas: 2, meta: 2, fechado: true });
    expect(a.sentir).toEqual({ feitas: 2, meta: 3, fechado: false });
    expect(a.junto).toEqual({ feitas: 1, meta: 1, fechado: true });
    expect(a.fechados).toBe(false);
  });

  it("metas pequenas e válidas; o que não vier fica como estava", async () => {
    const { lerMetas } = await import("@/lib/app/insignias");
    expect(lerMetas({ fazer: 3 })).toEqual({ fazer: 3, sentir: 3, junto: 2 });
    expect(lerMetas({ junto: 0 })).toBeNull();
    expect(lerMetas({ sentir: 2.5 })).toBeNull();
    expect(lerMetas({ fazer: 51 })).toBeNull();
  });

  it("Semente, Broto e as especiais seguem as regras; o Momento nunca é automático", async () => {
    const { situacaoDaCrianca, insigniasCumpridas, proximoNivel } = await import("@/lib/app/insignias");
    const m = (dominio: string, origem = "familia") => ({ status: "confirmada", origem, dominio, etapas: [] });
    const cinco = [1, 2, 3, 4, 5].map(() => m("comunicacao"));
    const s = situacaoDaCrianca([...cinco, m("autonomia", "pei")], 0, null);
    const codigos = insigniasCumpridas(s, CAT as never).map((c) => c.codigo);
    expect(codigos).toEqual(["comunicacao-semente", "comunicacao-broto", "autonomia-semente", "primeira-missao", "mao-dada"]);
    expect(proximoNivel(0)).toEqual({ nivel: "semente", faltam: 1 });
    expect(proximoNivel(4)).toEqual({ nivel: "broto", faltam: 1 });
    expect(proximoNivel(15)).toBeNull();
  });
});

describe("rotas das insígnias", () => {
  it("a mãe marca, a missão fica confirmada, a cor acende e o painel mostra a faixa infantil", async () => {
    const lista = await import("@/app/api/app/v1/criancas/[id]/missoes/route");
    const uma = await import("@/app/api/app/v1/criancas/[id]/missoes/[missaoId]/route");
    const rota = await import("@/app/api/app/v1/criancas/[id]/insignias/route");
    expect((await chamar(lista, "POST", MAE, { titulo: "Pedir água", etapas: ["Pedir"], dominio: "comunicacao" }, { id: ANA })).status).toBe(201);
    const MID = db.tabelas.app_missoes[0].id as string;
    expect(db.tabelas.app_missoes[0]).toMatchObject({ dominio: "comunicacao" });
    const r = await chamar(uma, "PATCH", MAE, { acao: "etapa", indice: 0, feita: true }, { id: ANA, missaoId: MID });
    expect(r.json.status).toBe("confirmada");
    expect((r.json.conquistas_novas as { codigo: string }[]).map((c) => c.codigo)).toEqual(["comunicacao-semente", "primeira-missao"]);

    const p = await chamar(rota, "GET", MAE, undefined, { id: ANA });
    expect(p.status).toBe(200);
    expect(p.json).toMatchObject({ faixa: "infantil", ganhas: 2, cores_acesas: ["comunicacao"], novas: [], pode_entregar: true });
    expect((p.json.colecao as unknown[]).length).toBe(CAT.length);
    expect((p.json.aneis as { fazer: { feitas: number } }).fazer.feitas).toBe(1);
    expect(p.json.proximas).toContainEqual({ dominio: "comunicacao", nome: "Conversa boa", faltam: 4 });
  });

  it("a família muda as metas; a rede não", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/insignias/route");
    expect((await chamar(rota, "PUT", FONO, { fazer: 3 }, { id: ANA })).status).toBe(403);
    expect((await chamar(rota, "PUT", MAE, { junto: 99 }, { id: ANA })).status).toBe(400);
    expect((await chamar(rota, "PUT", MAE, { fazer: 3 }, { id: ANA })).json).toMatchObject({ metas: { fazer: 3, sentir: 3, junto: 2 } });
    expect((await chamar(rota, "PUT", MAE, { sentir: 1 }, { id: ANA })).json).toMatchObject({ metas: { fazer: 3, sentir: 1, junto: 2 } });
    expect(db.tabelas.app_aneis_metas.length).toBe(1);
  });

  it("o Momento: um adulto entrega com a frase; cada vez é uma história", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/insignias/route");
    expect((await chamar(rota, "POST", FONO, { dominio: "comunicacao", frase: "Pediu ajuda" }, { id: ANA })).status).toBe(403);
    expect((await chamar(rota, "POST", MAE, { dominio: "azul", frase: "Pediu ajuda" }, { id: ANA })).status).toBe(400);
    expect((await chamar(rota, "POST", MAE, { dominio: "comunicacao", frase: "" }, { id: ANA })).status).toBe(400);
    const r = await chamar(rota, "POST", MAE, { dominio: "comunicacao", frase: "Pediu ajuda no mercado" }, { id: ANA });
    expect(r.status).toBe(201);
    expect(r.json.novas).toMatchObject([{ codigo: "comunicacao-momento", nivel: "momento" }]);
    await chamar(rota, "POST", MAE, { dominio: "comunicacao", frase: "Pediu ajuda de novo" }, { id: ANA });
    const p = await chamar(rota, "GET", MAE, undefined, { id: ANA });
    const momento = (p.json.colecao as { codigo: string; momentos?: unknown[] }[]).find((c) => c.codigo === "comunicacao-momento");
    expect(momento?.momentos?.length).toBe(2);
  });

  it("calma registrada enche o Sentir; os três anéis fechados rendem a Semana do Encontro uma vez", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/insignias/route");
    const reg = await import("@/app/api/app/v1/criancas/[id]/registros/route");
    await chamar(rota, "PUT", MAE, { fazer: 1, sentir: 1, junto: 1 }, { id: ANA });
    const agora = new Date().toISOString();
    db.tabelas.app_missoes.push({ id: "m1", crianca_id: ANA, status: "confirmada", origem: "familia", dominio: "autonomia", etapas: [{ texto: "a", feita_em: agora }], confirmada_em: agora });
    const r = await chamar(reg, "POST", MAE, { tipo: "evento", subtipo: "calma", local: "casa" }, { id: ANA });
    expect(r.status).toBe(201);
    expect((r.json.conquistas_novas as { codigo: string }[]).map((c) => c.codigo)).toContain("semana-do-encontro");
    expect(db.tabelas.app_semanas_fechadas.length).toBe(1);
    const p = await chamar(rota, "GET", MAE, undefined, { id: ANA });
    expect(p.json.novas).toEqual([]);
    expect(db.tabelas.app_semanas_fechadas.length).toBe(1);
  });
});
