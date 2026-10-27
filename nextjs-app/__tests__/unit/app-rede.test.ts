import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · rede de apoio: convite, aceite, permissões, revogação; família direta e cadastro. */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));
vi.mock("@/lib/senha-regras", () => ({
  checarSenhaNova: vi.fn(async (s: string) => (s && s.length >= 8 ? null : "A senha precisa ter pelo menos 8 caracteres.")),
}));
vi.mock("@/lib/auth", () => ({ findUserByEmail: vi.fn(async (e: string) => (e === "da.escola@x.com" ? { role: "family" } : null)) }));

const MAE = "11111111-1111-4111-8111-111111111111";
const FONO = "33333333-3333-4333-8333-333333333333";
const ESTRANHO = "55555555-5555-4555-8555-555555555555";
const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const FAM = "ffffffff-ffff-4fff-8fff-ffffffffffff";

function base() {
  return criarFakeDb({
    pessoas: [{ id: MAE, nome: "Patrícia Alves", email: "mae@x.com", ativo: true }, { id: FONO, nome: "Dra. Lúcia", email: "fono@x.com", ativo: true }],
    criancas: [{ id: PEDRO, familia_id: FAM, nome: "Pedro Alves", adolescente_pessoa_id: null, adolescente_pausado: false }],
    familias: [{ id: FAM, nome: "Família Alves" }],
    familia_responsaveis: [{ id: "fr1", familia_id: FAM, pessoa_id: MAE }],
    workspace_members: [],
    rede_membros: [],
    rede_permissoes: [],
    consentimentos: [],
    app_sessoes: [],
  });
}

async function token(pessoa: string) {
  const s = await import("@/lib/app/sessao");
  return s.emitirAcesso(pessoa);
}
async function chamar(rota: { [k: string]: unknown }, metodo: string, pessoa: string | null, corpo?: unknown, params?: Record<string, string>) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (pessoa) headers.authorization = `Bearer ${await token(pessoa)}`;
  const req = new Request("https://omnisfera.net/api/app/v1/x", { method: metodo, headers, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  const fn = rota[metodo] as (r: Request, c?: unknown) => Promise<Response>;
  const r = await fn(req, params ? { params: Promise.resolve(params) } : undefined);
  return { status: r.status, json: (await r.json()) as Record<string, unknown> };
}
const tokenDoLink = (link: unknown) => String(link).split("#")[1];

beforeEach(async () => {
  db = base();
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres");
  (await import("@/lib/app/sessao"))._esquecerSegredo();
});

describe("regras da rede", () => {
  it("humor nunca vai para a rede; escrever implica ver; cada tipo escreve só no que é dele", async () => {
    const { normalizarPermissoes, PADRAO_POR_TIPO } = await import("@/lib/app/rede");
    const p = normalizarPermissoes("professor", [
      { categoria: "humor", ver: true, escrever: true },
      { categoria: "laudos", ver: false, escrever: true },
      { categoria: "missoes", escrever: true },
      { categoria: "resumo", ver: true, escrever: true },
      { categoria: "inventada", ver: true },
    ]);
    expect(p).toEqual([
      { categoria: "missoes", ver: true, escrever: true },
      { categoria: "resumo", ver: true, escrever: false },
    ]);
    expect(normalizarPermissoes("profissional", undefined)).toEqual(PADRAO_POR_TIPO.profissional);
    expect(normalizarPermissoes("profissional", [{ categoria: "laudos", escrever: true }])).toEqual([{ categoria: "laudos", ver: true, escrever: true }]);
  });

  it("acesso: 1 ano por padrão, nunca no passado nem além de 2 anos", async () => {
    const { acessoAte } = await import("@/lib/app/rede");
    const agora = new Date("2026-10-27T12:00:00Z");
    expect(acessoAte(undefined, agora)).toBe("2027-10-27");
    expect(acessoAte("2026-12-01", agora)).toBe("2026-12-01");
    expect(acessoAte("2026-10-01", agora)).toBeNull();
    expect(acessoAte("2029-01-01", agora)).toBeNull();
    expect(acessoAte("amanhã", agora)).toBeNull();
  });

  it("dados da criança: nome obrigatório, nascimento válido", async () => {
    const { dadosDaCrianca } = await import("@/lib/app/familia");
    const agora = new Date("2026-10-27T12:00:00Z");
    expect(dadosDaCrianca({ nome: "  Pedro   Alves " }, agora)).toEqual({ nome: "Pedro Alves", nascimento: null });
    expect(dadosDaCrianca({ nome: "P" }, agora)).toHaveProperty("erro");
    expect(dadosDaCrianca({ nome: "Pedro", nascimento: "2030-01-01" }, agora)).toHaveProperty("erro");
    expect(dadosDaCrianca({ nome: "Pedro", nascimento: "2021-03-04" }, agora)).toEqual({ nome: "Pedro", nascimento: "2021-03-04" });
  });
});

describe("convite → aceite → acesso", () => {
  it("só a família convida, e com consentimento", async () => {
    const rede = await import("@/app/api/app/v1/criancas/[id]/rede/route");
    expect((await chamar(rede, "POST", null, {}, { id: PEDRO })).status).toBe(401);
    expect((await chamar(rede, "POST", ESTRANHO, { tipo: "profissional", nome: "X", consentimento: true }, { id: PEDRO })).status).toBe(403);
    expect((await chamar(rede, "POST", MAE, { tipo: "profissional", nome: "Dra. Lúcia" }, { id: PEDRO })).status).toBe(400);
    expect((await chamar(rede, "POST", MAE, { tipo: "terapeuta", nome: "Dra. Lúcia", consentimento: true }, { id: PEDRO })).status).toBe(400);
  });

  it("fluxo completo: convida, a fono vê, aceita, passa a ver; o link vale uma vez", async () => {
    const rede = await import("@/app/api/app/v1/criancas/[id]/rede/route");
    const ver = await import("@/app/api/app/v1/convites/ver/route");
    const aceitar = await import("@/app/api/app/v1/convites/aceitar/route");
    const { acessoACrianca } = await import("@/lib/app/acesso");
    const { hashToken } = await import("@/lib/app/sessao");

    const c = await chamar(rede, "POST", MAE, { tipo: "profissional", nome: "Dra. Lúcia", especialidade: "fonoaudióloga", consentimento: true }, { id: PEDRO });
    expect(c.status).toBe(201);
    expect(String(c.json.link)).toMatch(/^https:\/\/omnisfera\.net\/app\/convite#[A-Za-z0-9_-]{32}$/);
    const tk = tokenDoLink(c.json.link);
    const membro = db.tabelas.rede_membros[0];
    expect(membro.status).toBe("convidado");
    expect(membro.convite_token_hash).toBe(hashToken(tk));
    expect(JSON.stringify(db.tabelas.rede_membros)).not.toContain(tk); // o token em si não fica no banco
    expect(db.tabelas.rede_permissoes.some((p) => p.categoria === "humor")).toBe(false);
    expect(db.tabelas.consentimentos[0]).toMatchObject({ acao: "concedeu", autorizado_por: MAE, versao_termo: "rede-v1-2026-10" });
    expect(await acessoACrianca(FONO, PEDRO)).toBeNull();

    const v = await chamar(ver, "POST", FONO, { token: tk });
    expect(v.status).toBe(200);
    expect(v.json.convite).toMatchObject({ crianca: "Pedro", convidado_por: "Patrícia Alves", tipo: "profissional" });

    expect((await chamar(aceitar, "POST", MAE, { token: tk })).status).toBe(409); // a mãe não entra como membro
    const a = await chamar(aceitar, "POST", FONO, { token: tk });
    expect(a.status).toBe(200);
    const acesso = await acessoACrianca(FONO, PEDRO);
    expect(acesso?.papel).toBe("membro");
    expect(acesso?.escrever.has("orientacoes")).toBe(true);
    expect(acesso?.ver.has("humor")).toBe(false);
    expect((await chamar(aceitar, "POST", ESTRANHO, { token: tk })).status).toBe(404);
    expect((await chamar(ver, "POST", ESTRANHO, { token: tk })).status).toBe(404);
  });

  it("convite vencido não vale; reenviar gera link novo e o antigo morre", async () => {
    const rede = await import("@/app/api/app/v1/criancas/[id]/rede/route");
    const membro = await import("@/app/api/app/v1/criancas/[id]/rede/[membroId]/route");
    const aceitar = await import("@/app/api/app/v1/convites/aceitar/route");
    const c = await chamar(rede, "POST", MAE, { tipo: "professor", nome: "Prof. Ana", consentimento: true }, { id: PEDRO });
    const antigo = tokenDoLink(c.json.link);
    const m = db.tabelas.rede_membros[0];
    m.id = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    m.convite_expira_em = "2020-01-01T00:00:00Z";
    expect((await chamar(aceitar, "POST", FONO, { token: antigo })).status).toBe(404);
    const g = await chamar(rede, "GET", MAE, undefined, { id: PEDRO });
    expect((g.json.membros as { status: string }[])[0].status).toBe("convite_vencido");

    const r = await chamar(membro, "PATCH", MAE, { acao: "reenviar" }, { id: PEDRO, membroId: m.id as string });
    expect(r.status).toBe(200);
    const novo = tokenDoLink(r.json.link);
    expect(novo).not.toBe(antigo);
    expect((await chamar(aceitar, "POST", FONO, { token: antigo })).status).toBe(404);
    expect((await chamar(aceitar, "POST", FONO, { token: novo })).status).toBe(200);
  });

  it("a família muda permissões, pausa e revoga; cada passo fica registrado", async () => {
    const membro = await import("@/app/api/app/v1/criancas/[id]/rede/[membroId]/route");
    const { acessoACrianca } = await import("@/lib/app/acesso");
    const MID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    db.tabelas.rede_membros.push({ id: MID, crianca_id: PEDRO, tipo: "profissional", pessoa_id: FONO, workspace_id: null, status: "ativo", acesso_ate: "2099-01-01" });
    db.tabelas.rede_permissoes.push({ membro_id: MID, categoria: "eventos_casa", pode_ver: true, pode_escrever: false });

    expect((await chamar(membro, "PATCH", FONO, { acao: "revogar" }, { id: PEDRO, membroId: MID })).status).toBe(403);
    const p = await chamar(membro, "PATCH", MAE, { acao: "permissoes", consentimento: true, permissoes: [{ categoria: "medicacao", ver: true }] }, { id: PEDRO, membroId: MID });
    expect(p.status).toBe(200);
    let a = await acessoACrianca(FONO, PEDRO);
    expect([...a!.ver]).toEqual(["medicacao"]);

    expect((await chamar(membro, "PATCH", MAE, { acao: "pausar" }, { id: PEDRO, membroId: MID })).status).toBe(200);
    expect(await acessoACrianca(FONO, PEDRO)).toBeNull();
    expect((await chamar(membro, "PATCH", MAE, { acao: "retomar" }, { id: PEDRO, membroId: MID })).status).toBe(200);
    a = await acessoACrianca(FONO, PEDRO);
    expect(a?.papel).toBe("membro");

    expect((await chamar(membro, "PATCH", MAE, { acao: "revogar" }, { id: PEDRO, membroId: MID })).status).toBe(200);
    expect(await acessoACrianca(FONO, PEDRO)).toBeNull();
    expect(db.tabelas.rede_permissoes.filter((x) => x.membro_id === MID)).toEqual([]);
    expect(db.tabelas.consentimentos.map((x) => x.acao)).toEqual(["alterou", "revogou"]);
    expect((await chamar(membro, "PATCH", MAE, { acao: "retomar" }, { id: PEDRO, membroId: MID })).status).toBe(404);
  });
});

describe("família direta e cadastro", () => {
  it("cria a família, o responsável principal e a primeira criança", async () => {
    const familias = await import("@/app/api/app/v1/familias/route");
    const criancas = await import("@/app/api/app/v1/familias/[id]/criancas/route");
    expect((await chamar(familias, "POST", FONO, { crianca: { nome: "" } })).status).toBe(400);
    const r = await chamar(familias, "POST", FONO, { parentesco: "mãe", crianca: { nome: "Lia Souza", nascimento: "2019-05-02" } });
    expect(r.status).toBe(201);
    const fam = db.tabelas.familias.find((f) => f.id === r.json.familia_id)!;
    expect(fam).toMatchObject({ nome: "Família de Lia", origem: "direto", plano: "teste" });
    expect(db.tabelas.familia_responsaveis.some((x) => x.familia_id === fam.id && x.pessoa_id === FONO && x.principal)).toBe(true);

    expect((await chamar(criancas, "POST", MAE, { nome: "Outra" }, { id: FAM })).status).toBe(201);
    expect((await chamar(criancas, "POST", FONO, { nome: "Intrusa" }, { id: FAM })).status).toBe(403);
  });

  it("cadastro: termos, senha, e-mail já usado (aqui ou na escola)", async () => {
    const cad = await import("@/app/api/app/v1/auth/cadastrar/route");
    const ok = { nome: "Carla", email: "carla@x.com", senha: "uma-senha-boa", termos: true };
    expect((await chamar(cad, "POST", null, { ...ok, termos: false })).status).toBe(400);
    expect((await chamar(cad, "POST", null, { ...ok, senha: "123" })).status).toBe(400);
    expect((await chamar(cad, "POST", null, { ...ok, email: "mae@x.com" })).status).toBe(409);
    expect((await chamar(cad, "POST", null, { ...ok, email: "da.escola@x.com" })).status).toBe(409);
    const r = await chamar(cad, "POST", null, ok);
    expect(r.status).toBe(201);
    expect(r.json.acesso).toBeTruthy();
    const nova = db.tabelas.pessoas.find((p) => p.email === "carla@x.com")!;
    expect(String(nova.password_hash)).toMatch(/^\$2[aby]\$/);
    expect(nova.termos_aceitos_em).toBeTruthy();
  });
});
