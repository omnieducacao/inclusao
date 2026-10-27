import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · base do app da família: login do app, quem vê o quê e a linha do tempo. */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));

const MAE = "11111111-1111-4111-8111-111111111111";
const TEEN = "22222222-2222-4222-8222-222222222222";
const FONO = "33333333-3333-4333-8333-333333333333";
const PROF = "44444444-4444-4444-8444-444444444444";
const ESTRANHO = "55555555-5555-4555-8555-555555555555";
const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ESCOLA = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function base() {
  return criarFakeDb({
    criancas: [{ id: PEDRO, familia_id: "fam1", adolescente_pessoa_id: TEEN, adolescente_pausado: false }],
    familia_responsaveis: [{ id: "fr1", familia_id: "fam1", pessoa_id: MAE }],
    workspace_members: [{ id: "wm1", workspace_id: ESCOLA, pessoa_id: PROF }],
    rede_membros: [
      { id: "m-fono", crianca_id: PEDRO, pessoa_id: FONO, workspace_id: null, status: "ativo", acesso_ate: "2099-12-31" },
      { id: "m-escola", crianca_id: PEDRO, pessoa_id: null, workspace_id: ESCOLA, status: "ativo", acesso_ate: null },
    ],
    rede_permissoes: [
      { membro_id: "m-fono", categoria: "eventos_casa", pode_ver: true, pode_escrever: false },
      { membro_id: "m-fono", categoria: "orientacoes", pode_ver: true, pode_escrever: true },
      { membro_id: "m-escola", categoria: "eventos_escola", pode_ver: true, pode_escrever: true },
    ],
    registros: [
      { id: "r1", crianca_id: PEDRO, tipo: "evento", categoria: "eventos_casa", quando: "2026-10-20T10:00:00Z", apagado_em: null },
      { id: "r2", crianca_id: PEDRO, tipo: "humor", categoria: "humor", texto: "hoje foi difícil", autor_pessoa_id: TEEN, quando: "2026-10-21T10:00:00Z", apagado_em: null },
      { id: "r3", crianca_id: PEDRO, tipo: "evento", categoria: "eventos_escola", quando: "2026-10-22T10:00:00Z", apagado_em: null },
    ],
    app_sessoes: [],
  });
}

beforeEach(() => {
  db = base();
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres");
});

describe("sessão do app", () => {
  it("o token do app vale só no app e expira", async () => {
    const s = await import("@/lib/app/sessao");
    s._esquecerSegredo();
    const t = await s.emitirAcesso(MAE);
    expect(await s.verificarAcesso(t)).toBe(MAE);
    expect(await s.verificarAcesso(t + "x")).toBeNull();
    // um JWT do site (assinado com o SESSION_SECRET direto) não entra no app
    const { SignJWT } = await import("jose");
    const doSite = await new SignJWT({ user_role: "family" }).setProtectedHeader({ alg: "HS256" }).setSubject(MAE)
      .setAudience("omnisfera-app").setExpirationTime("10m").sign(new TextEncoder().encode(process.env.SESSION_SECRET));
    expect(await s.verificarAcesso(doSite)).toBeNull();
    const req = new Request("https://x/api/app/v1/eu", { headers: { authorization: `Bearer ${t}` } });
    expect(await s.pessoaDoPedido(req)).toBe(MAE);
    expect(await s.pessoaDoPedido(new Request("https://x"))).toBeNull();
  });

  it("renovação troca o token e, se o antigo voltar, encerra todas as sessões", async () => {
    const s = await import("@/lib/app/sessao");
    const par = await s.abrirSessao(MAE, "iPhone");
    expect(db.tabelas.app_sessoes[0].token_hash).toBe(s.hashToken(par.renovacao));
    expect(JSON.stringify(db.tabelas.app_sessoes)).not.toContain(par.renovacao);
    const novo = await s.renovarSessao(par.renovacao);
    expect(novo).not.toBeNull();
    expect(novo!.renovacao).not.toBe(par.renovacao);
    expect(await s.renovarSessao(par.renovacao)).toBeNull(); // reuso
    expect(db.tabelas.app_sessoes.every((l) => l.revogada_em)).toBe(true);
    expect(await s.renovarSessao("inventado")).toBeNull();
  });
});

describe("quem vê o quê", () => {
  it("responsável vê tudo e não escreve o humor do adolescente", async () => {
    const { acessoACrianca } = await import("@/lib/app/acesso");
    const a = await acessoACrianca(MAE, PEDRO);
    expect(a?.papel).toBe("responsavel");
    expect(a?.ver.has("laudos")).toBe(true);
    expect(a?.escrever.has("humor")).toBe(false);
  });
  it("adolescente vê só o que é dele; pausado não entra", async () => {
    const { acessoACrianca } = await import("@/lib/app/acesso");
    const a = await acessoACrianca(TEEN, PEDRO);
    expect(a?.papel).toBe("adolescente");
    expect(a?.ver.has("laudos")).toBe(false);
    expect(a?.escrever.has("humor")).toBe(true);
    db.tabelas.criancas[0].adolescente_pausado = true;
    expect(await acessoACrianca(TEEN, PEDRO)).toBeNull();
  });
  it("membro da rede vê só as categorias liberadas, até a data", async () => {
    const { acessoACrianca } = await import("@/lib/app/acesso");
    const a = await acessoACrianca(FONO, PEDRO);
    expect([...a!.ver].sort()).toEqual(["eventos_casa", "orientacoes"]);
    expect([...a!.escrever]).toEqual(["orientacoes"]);
    db.tabelas.rede_membros[0].acesso_ate = "2020-01-01";
    expect(await acessoACrianca(FONO, PEDRO)).toBeNull();
  });
  it("professor da escola cliente entra pela escola; estranho e revogado não entram", async () => {
    const { acessoACrianca } = await import("@/lib/app/acesso");
    expect([...(await acessoACrianca(PROF, PEDRO))!.ver]).toEqual(["eventos_escola"]);
    expect(await acessoACrianca(ESTRANHO, PEDRO)).toBeNull();
    db.tabelas.rede_membros[1].status = "revogado";
    expect(await acessoACrianca(PROF, PEDRO)).toBeNull();
    expect(await acessoACrianca("nao-e-uuid", PEDRO)).toBeNull();
  });
});

describe("linha do tempo (/api/app/v1/criancas/[id]/registros)", () => {
  async function pedir(pessoa: string | null, metodo = "GET", corpo?: unknown) {
    const s = await import("@/lib/app/sessao");
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (pessoa) headers.authorization = `Bearer ${await s.emitirAcesso(pessoa)}`;
    const rota = await import("@/app/api/app/v1/criancas/[id]/registros/route");
    const req = new Request(`https://x/api/app/v1/criancas/${PEDRO}/registros`, { method: metodo, headers, body: corpo ? JSON.stringify(corpo) : undefined });
    const ctx = { params: Promise.resolve({ id: PEDRO }) };
    return metodo === "GET" ? rota.GET(req, ctx) : rota.POST(req, ctx);
  }

  it("sem login 401, sem acesso 403", async () => {
    expect((await pedir(null)).status).toBe(401);
    expect((await pedir(ESTRANHO)).status).toBe(403);
  });
  it("a fono só recebe as categorias liberadas", async () => {
    const r = await pedir(FONO);
    const ids = (await r.json()).registros.map((x: { id: string }) => x.id);
    expect(ids).toEqual(["r1"]);
  });
  it("a mãe vê o humor do adolescente sem a frase", async () => {
    const regs = (await (await pedir(MAE)).json()).registros as { id: string; texto?: string | null }[];
    expect(regs.find((x) => x.id === "r2")?.texto).toBeNull();
  });
  it("registra evento, recusa categoria sem permissão e não duplica no reenvio", async () => {
    const ok = await pedir(MAE, "POST", { tipo: "evento", subtipo: "crise", intensidade: 4, local: "casa", id_local: "cel-1" });
    expect(ok.status).toBe(201);
    const de_novo = await (await pedir(MAE, "POST", { tipo: "evento", subtipo: "crise", local: "casa", id_local: "cel-1" })).json();
    expect(de_novo.repetido).toBe(true);
    expect(db.tabelas.registros.filter((r) => r.id_local === "cel-1")).toHaveLength(1);
    expect((await pedir(FONO, "POST", { tipo: "evento", subtipo: "crise", local: "casa" })).status).toBe(403);
    expect((await pedir(MAE, "POST", { tipo: "evento", subtipo: "inventado" })).status).toBe(400);
    expect((await pedir(MAE, "POST", { tipo: "evento", subtipo: "crise", quando: "2099-01-01T00:00:00Z" })).status).toBe(400);
  });
});
