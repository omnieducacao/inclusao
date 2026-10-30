import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · onda 122: o avatar e a família montada, iguais em todos os celulares da casa. */
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
const AV = { pele: "#ffc738", cabelo: "#b26836", estilo: "afro", roupa: "#4bb3fd", calca: "#3f6fb8" };
const corpo = (em: string, extra: Record<string, unknown> = {}) => ({
  avatar: AV,
  familia: [
    { id: "a1", nome: "Mãe", porte: "adulto", avatar: { ...AV, estilo: "longo" } },
    { id: "a2", nome: "Mãe", fala: "Mamãe Lu", porte: "adulto", avatar: { ...AV, estilo: "curto" } },
  ],
  em,
  ...extra,
});

describe("aparência (avatar e família)", () => {
  it("a família grava e lê; o adolescente lê; a rede não vê", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/aparencia/route");
    let g = await chamar(rota, "GET", MAE, undefined, P);
    expect(g.status).toBe(200);
    expect(g.json.aparencia).toBeNull();
    const em = new Date(Date.now() - 1000).toISOString();
    const r = await chamar(rota, "PUT", MAE, corpo(em), P);
    expect(r.status).toBe(200);
    const linha = db.tabelas.criancas.find((c) => c.id === PEDRO)!;
    expect(typeof linha.aparencia).toBe("string");
    g = await chamar(rota, "GET", TEEN, undefined, P);
    expect(g.status).toBe(200);
    expect((g.json.aparencia as { familia: unknown[] }).familia).toHaveLength(2);
    expect((g.json.aparencia as { avatar: { estilo: string } }).avatar.estilo).toBe("afro");
    expect((await chamar(rota, "GET", FONO, undefined, P)).status).toBe(403);
    expect((await chamar(rota, "PUT", TEEN, corpo(em), P)).status).toBe(403);
    expect((await chamar(rota, "PUT", FONO, corpo(em), P)).status).toBe(403);
    expect((await chamar(rota, "GET", null, undefined, P)).status).toBe(401);
  });

  it("recusa o que não é só aparência do desenho", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/aparencia/route");
    const em = new Date().toISOString();
    expect((await chamar(rota, "PUT", MAE, corpo(em, { avatar: { ...AV, pele: "parda" } }), P)).status).toBe(400);
    expect((await chamar(rota, "PUT", MAE, corpo(em, { avatar: { ...AV, estilo: "x" } }), P)).status).toBe(400);
    const muitos = Array.from({ length: 13 }, (_, i) => ({ id: `p${i}`, nome: "Tia", porte: "adulto", avatar: AV }));
    expect((await chamar(rota, "PUT", MAE, corpo(em, { familia: muitos }), P)).status).toBe(400);
    const repetido = [{ id: "a", nome: "Vó", porte: "adulto", avatar: AV }, { id: "a", nome: "Vô", porte: "adulto", avatar: AV }];
    expect((await chamar(rota, "PUT", MAE, corpo(em, { familia: repetido }), P)).status).toBe(400);
    const { lerAparencia } = await import("@/lib/app/aparencia");
    const comFala = lerAparencia({ avatar: null, familia: [{ id: "a", nome: "Vó", fala: "", porte: "adulto", avatar: AV }, { id: "b", nome: "Vô", fala: "Vô Zé, vem brincar comigo agora no quintal", porte: "adulto", avatar: AV }] });
    expect(comFala!.familia[0].fala).toBeUndefined();
    expect(comFala!.familia[1].fala).toMatch(/quintal/);
    const ok = lerAparencia({ avatar: AV, familia: [{ id: "a", nome: "Pai", porte: "adulto", avatar: AV, raca: "x", genero: "y" }] });
    expect(Object.keys(ok!.familia[0]).sort()).toEqual(["avatar", "id", "nome", "porte"]);
  });

  it("vence a mudança mais recente; a mais antiga recebe a guardada", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/aparencia/route");
    const novo = new Date(Date.now() - 1000).toISOString();
    const velho = new Date(Date.now() - 60_000).toISOString();
    expect((await chamar(rota, "PUT", MAE, corpo(novo), P)).status).toBe(200);
    const r = await chamar(rota, "PUT", MAE, corpo(velho, { familia: [] }), P);
    expect(r.status).toBe(409);
    expect((r.json.aparencia as { familia: unknown[] }).familia).toHaveLength(2);
    // relógio adiantado: a data volta para agora
    const futuro = new Date(Date.now() + 864e5).toISOString();
    const f = await chamar(rota, "PUT", MAE, corpo(futuro), P);
    expect(f.status).toBe(200);
    expect(Date.parse(f.json.em as string)).toBeLessThanOrEqual(Date.now());
  });
});
