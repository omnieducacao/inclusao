import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · Omniband (onda 101): chip, toque no app, página de ajuda, localização e avisos. */
let db: FakeDb;
vi.mock("@/lib/supabase", () => ({ getSupabase: () => criarFakeSupabase(db) }));
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(async () => {}) }));

const MAE = "11111111-1111-4111-8111-111111111111";
const FONO = "33333333-3333-4333-8333-333333333333";
const ESTRANHO = "55555555-5555-4555-8555-555555555555";
const PEDRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TOKEN_MAE = "ExponentPushToken[abcdefghijklmnop]";

// NXP AN12196: PICCData e CMAC de exemplo com as chaves de fábrica (zeros): UID 04DE5F1EACC040, contador 61
const P_AN = "EF963FF7828658A599F3041510671E88";
const C_AN = "94EED9EE65337086";

function base() {
  return criarFakeDb({
    pessoas: [{ id: MAE, nome: "Patrícia", ativo: true }],
    criancas: [{ id: PEDRO, familia_id: "fam1", nome: "Pedro Alves", nascimento: "2021-03-10", modo: "crianca", adolescente_pessoa_id: null, adolescente_pausado: false }],
    familia_responsaveis: [{ id: "fr1", familia_id: "fam1", pessoa_id: MAE }],
    workspace_members: [],
    rede_membros: [{ id: "m-fono", crianca_id: PEDRO, pessoa_id: FONO, workspace_id: null, status: "ativo", acesso_ate: null }],
    rede_permissoes: [{ membro_id: "m-fono", categoria: "eventos_casa", pode_ver: true, pode_escrever: false }],
    omniband_objetos: [],
    omniband_leituras: [],
    paginas_ajuda: [],
    app_dispositivos: [{ id: "d1", pessoa_id: MAE, token: TOKEN_MAE, plataforma: "ios", ativo: true }],
    registros: [],
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

let pushes: Array<Array<{ to: string; title: string; body: string }>>;

beforeEach(async () => {
  db = base();
  pushes = [];
  vi.stubEnv("SESSION_SECRET", "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres");
  vi.stubEnv("OMNIBAND_SDM_META_KEY", "");
  vi.stubEnv("OMNIBAND_SDM_FILE_KEY_MASTER", "");
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: { body?: string }) => {
    pushes.push(JSON.parse(init?.body || "[]"));
    return new Response("{}", { status: 200 });
  }));
  (await import("@/lib/app/sessao"))._esquecerSegredo();
});

describe("chip NTAG 424 DNA (SUN)", () => {
  it("AES-CMAC confere com a RFC 4493", async () => {
    const { aesCmac } = await import("@/lib/app/sun");
    const k = Buffer.from("2b7e151628aed2a6abf7158809cf4f3c", "hex");
    expect(aesCmac(k, Buffer.alloc(0)).toString("hex")).toBe("bb1d6929e95937287fa37d129b756746");
    expect(aesCmac(k, Buffer.from("6bc1bee22e409f96e93d7e117393172a", "hex")).toString("hex")).toBe("070a16b46b4d4144f79bdd9dd04a287c");
  });

  it("abre o exemplo da NXP e recusa link adulterado", async () => {
    const { conferirSun } = await import("@/lib/app/sun");
    const zero = Buffer.alloc(16);
    expect(conferirSun(P_AN, C_AN, zero, () => zero)).toEqual({ uid: "04DE5F1EACC040", contador: 61 });
    expect(conferirSun(P_AN, "94EED9EE65337087", zero, () => zero)).toBeNull();
    expect(conferirSun(P_AN, C_AN, Buffer.alloc(16, 1), () => zero)).toBeNull();
    expect(conferirSun("xyz", C_AN, zero, () => zero)).toBeNull();
  });
});

describe("link do chip", () => {
  it("só aceita o domínio da Omnisfera e o formato /t/…", async () => {
    const { lerLinkDoChip } = await import("@/lib/app/omniband");
    expect(lerLinkDoChip("https://omnisfera.net/t/abcd2345ef")).toEqual({ codigo: "abcd2345ef" });
    expect(lerLinkDoChip(`https://omnisfera.net/t/n?p=${P_AN}&c=${C_AN}`)).toEqual({ codigo: "n", p: P_AN, c: C_AN });
    expect(lerLinkDoChip("https://golpe.com/t/abcd2345ef")).toBeNull();
    expect(lerLinkDoChip("https://omnisfera.net/t/ABC")).toBeNull();
    expect(lerLinkDoChip("javascript:alert(1)")).toBeNull();
  });
});

describe("ligar uma Omniband", () => {
  it("só a família liga; adesivo precisa de rotina; chip simples devolve o link para gravar", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/omniband/route");
    expect((await chamar(rota, "POST", FONO, { tipo: "pulseira" }, { id: PEDRO })).status).toBe(403);
    expect((await chamar(rota, "POST", MAE, { tipo: "adesivo" }, { id: PEDRO })).status).toBe(400);
    const ok = await chamar(rota, "POST", MAE, { tipo: "adesivo", rotina: "medicamento", linha: "joaninha" }, { id: PEDRO });
    expect(ok.status).toBe(201);
    expect(String(ok.json.gravar)).toMatch(/^https:\/\/omnisfera\.net\/t\/[2-9a-hjkmnp-z]{10}$/);
    const lista = await chamar(rota, "GET", MAE, undefined, { id: PEDRO });
    const objetos = lista.json.objetos as Record<string, unknown>[];
    expect(objetos).toHaveLength(1);
    expect(objetos[0]).not.toHaveProperty("uid_hash");
  });

  it("NTAG 424: confere a assinatura, guarda só a impressão do UID e não liga o mesmo chip duas vezes", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/omniband/route");
    const link = `https://omnisfera.net/t/n?p=${P_AN}&c=${C_AN}`;
    expect((await chamar(rota, "POST", MAE, { tipo: "pulseira", chip: "ntag424", link: link.replace(C_AN, "0000000000000000") }, { id: PEDRO })).status).toBe(400);
    const ok = await chamar(rota, "POST", MAE, { tipo: "pulseira", chip: "ntag424", link }, { id: PEDRO });
    expect(ok.status).toBe(201);
    const o = db.tabelas.omniband_objetos[0];
    expect(o.uid_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(o)).not.toContain("04DE5F1EACC040");
    expect(o.contador).toBe(61);
    expect((await chamar(rota, "POST", MAE, { tipo: "cordao", chip: "ntag424", link }, { id: PEDRO })).status).toBe(409);
  });
});

async function ligarSimples(rotina: string | null = "dormir") {
  const rota = await import("@/app/api/app/v1/criancas/[id]/omniband/route");
  const r = await chamar(rota, "POST", MAE, { tipo: rotina ? "adesivo" : "pulseira", rotina }, { id: PEDRO });
  return { link: String(r.json.gravar), id: String((r.json.objeto as Record<string, unknown>).id) };
}

describe("toque no app", () => {
  it("a família abre o registro da rotina; quem não é da rede vê a página de ajuda", async () => {
    const { link } = await ligarSimples("dormir");
    const toque = await import("@/app/api/app/v1/omniband/toque/route");
    const mae = await chamar(toque, "POST", MAE, { link });
    expect(mae.json).toMatchObject({ estado: "ok", crianca: { id: PEDRO, nome: "Pedro Alves" }, sugestao: { tela: "registrar", subtipo: "sono" } });
    expect((await chamar(toque, "POST", ESTRANHO, { link })).json.estado).toBe("sem_acesso");
    expect((await chamar(toque, "POST", MAE, { link: "https://omnisfera.net/t/zzzzzzzzzz" })).status).toBe(404);
    expect(db.tabelas.omniband_leituras.map((l) => l.quem)).toEqual(["responsavel"]);
  });

  it("desativada: a família fica sabendo; para a rede, é como se não existisse", async () => {
    const { link, id } = await ligarSimples("calma");
    const obj = await import("@/app/api/app/v1/criancas/[id]/omniband/[objetoId]/route");
    expect((await chamar(obj, "PATCH", FONO, { acao: "desativar" }, { id: PEDRO, objetoId: id })).status).toBe(403);
    expect((await chamar(obj, "PATCH", MAE, { acao: "desativar" }, { id: PEDRO, objetoId: id })).json.status).toBe("desativado");
    const toque = await import("@/app/api/app/v1/omniband/toque/route");
    expect((await chamar(toque, "POST", MAE, { link })).json.estado).toBe("desativada");
    expect((await chamar(toque, "POST", FONO, { link })).status).toBe(404);
  });

  it("registro feito a partir do toque sai com origem 'pulseira'", async () => {
    const { id } = await ligarSimples("banho");
    const reg = await import("@/app/api/app/v1/criancas/[id]/registros/route");
    const r = await chamar(reg, "POST", MAE, { tipo: "evento", subtipo: "banho", local: "casa", objeto_id: id }, { id: PEDRO });
    expect(r.status).toBe(201);
    expect(db.tabelas.registros.at(-1)).toMatchObject({ subtipo: "banho", origem: "pulseira", dados: { objeto_id: id } });
  });
});

describe("página de ajuda e quem encontrou", () => {
  it("a família escreve; telefone confere; contatos guardados juntos", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/pagina-ajuda/route");
    expect((await chamar(rota, "PUT", MAE, { contatos: [{ nome: "Mãe", telefone: "123" }] }, { id: PEDRO })).status).toBe(400);
    expect((await chamar(rota, "PUT", FONO, { apelido: "Pedro" }, { id: PEDRO })).status).toBe(403);
    const ok = await chamar(rota, "PUT", MAE, { apelido: "Pedro", mensagem: "Fale devagar.", contatos: [{ nome: "Patrícia", telefone: "(16) 99999-0000" }] }, { id: PEDRO });
    expect(ok.status).toBe(200);
    expect(JSON.parse(String(db.tabelas.paginas_ajuda[0].contatos))).toEqual([{ nome: "Patrícia", telefone: "+5516999990000" }]);
    const lida = await chamar(rota, "GET", MAE, undefined, { id: PEDRO });
    expect(lida.json.pagina).toMatchObject({ apelido: "Pedro", contatos: [{ nome: "Patrícia" }] });
  });

  it("leitura sem conta avisa a família uma vez, entra na linha do tempo e abre o convite da localização", async () => {
    const { link } = await ligarSimples(null);
    const { lerParaAjuda, lerLinkDoChip, receberLocalizacao } = await import("@/lib/app/omniband");
    const t0 = new Date();
    const primeira = await lerParaAjuda(lerLinkDoChip(link)!, t0);
    expect(primeira.estado).toBe("ok");
    expect(pushes).toHaveLength(1);
    expect(pushes[0][0]).toMatchObject({ to: TOKEN_MAE });
    expect(JSON.stringify(pushes[0])).not.toContain("Pedro");
    expect(db.tabelas.registros.filter((r) => r.subtipo === "leitura_ajuda")).toHaveLength(1);

    const segunda = await lerParaAjuda(lerLinkDoChip(link)!, new Date(t0.getTime() + 60_000));
    expect(segunda.estado).toBe("ok");
    expect(pushes).toHaveLength(1); // dentro de 3 minutos: sem aviso repetido
    expect(db.tabelas.registros.filter((r) => r.subtipo === "leitura_ajuda")).toHaveLength(1);

    const token = (primeira as { token: string }).token;
    expect(await receberLocalizacao("token-que-nao-existe-123456", -21.2, -47.8, 10)).toBe("invalido");
    expect(await receberLocalizacao(token, 200, -47.8, 10)).toBe("invalido");
    expect(await receberLocalizacao(token, -21.17, -47.81, 12.4, new Date(t0.getTime() + 5 * 60_000))).toBe("ok");
    const loc = db.tabelas.registros.find((r) => r.subtipo === "localizacao");
    expect(loc).toMatchObject({ tipo: "sinal", categoria: "sinais", texto: "-21.170000,-47.810000 (±12 m)" });
    expect(pushes).toHaveLength(2);
    expect(await receberLocalizacao(token, -21.17, -47.81, 12, new Date(t0.getTime() + 6 * 60_000))).toBe("expirado");
  });

  it("convite da localização vence em 30 minutos; Omniband desativada não mostra nada", async () => {
    const { link, id } = await ligarSimples(null);
    const { lerParaAjuda, lerLinkDoChip, receberLocalizacao } = await import("@/lib/app/omniband");
    const t0 = new Date();
    const r = (await lerParaAjuda(lerLinkDoChip(link)!, t0)) as { token: string };
    expect(await receberLocalizacao(r.token, -21, -47, 5, new Date(t0.getTime() + 31 * 60_000))).toBe("expirado");
    db.tabelas.omniband_objetos.find((o) => o.id === id)!.status = "desativado";
    expect((await lerParaAjuda(lerLinkDoChip(link)!)).estado).toBe("desativada");
  });

  it("link NTAG 424 copiado (contador repetido) mostra a página mas não avisa de novo", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/omniband/route");
    const link = `https://omnisfera.net/t/n?p=${P_AN}&c=${C_AN}`;
    await chamar(rota, "POST", MAE, { tipo: "pulseira", chip: "ntag424", link }, { id: PEDRO });
    const { lerParaAjuda, lerLinkDoChip } = await import("@/lib/app/omniband");
    expect((await lerParaAjuda(lerLinkDoChip(link)!)).estado).toBe("ok");
    expect(pushes).toHaveLength(0);
  });
});

describe("aparelhos para avisos", () => {
  it("só aceita token da Expo e liga ao dono atual", async () => {
    const rota = await import("@/app/api/app/v1/dispositivos/route");
    expect((await chamar(rota, "POST", MAE, { token: "qualquer-coisa" })).status).toBe(400);
    expect((await chamar(rota, "POST", FONO, { token: TOKEN_MAE, plataforma: "ios" })).status).toBe(200);
    expect(db.tabelas.app_dispositivos[0]).toMatchObject({ pessoa_id: FONO, ativo: true });
    expect((await chamar(rota, "DELETE", FONO, { token: TOKEN_MAE })).status).toBe(200);
    expect(db.tabelas.app_dispositivos[0].ativo).toBe(false);
  });
});
