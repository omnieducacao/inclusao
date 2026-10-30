import { describe, it, expect, vi, beforeEach } from "vitest";
import { criarFakeDb, criarFakeSupabase, type FakeDb } from "../helpers/fake-supabase";

/** Frente 6 · onda 105: a agenda da criança, o calendário assinável e o estoque da medicação. */
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

describe("lerCompromisso", () => {
  it("pede título e hora, aceita repetição semanal e lembretes conhecidos", async () => {
    const { lerCompromisso } = await import("@/lib/app/agenda");
    expect(lerCompromisso({ tipo: "terapia", inicio: "2026-11-03T14:00:00-03:00" })).toMatchObject({ erro: expect.stringMatching(/nome curto/) });
    expect(lerCompromisso({ titulo: "Fono" })).toMatchObject({ erro: expect.stringMatching(/dia e a hora/) });
    expect(lerCompromisso({ titulo: "Fono", tipo: "festa", inicio: "2026-11-03T14:00:00-03:00" })).toMatchObject({ erro: expect.any(String) });
    expect(lerCompromisso({ titulo: "Fono", inicio: "2026-11-03T14:00:00-03:00", lembrar_min: [7] })).toMatchObject({ erro: expect.any(String) });
    const ok = lerCompromisso({ titulo: " Fono ", tipo: "terapia", inicio: "2026-11-03T14:00:00-03:00", repete: "semanal", lembrar_min: [60, 1440] });
    expect(ok).toMatchObject({ titulo: "Fono", tipo: "terapia", inicio: "2026-11-03T17:00:00.000Z", repete: "semanal", lembrar_min: [1440, 60] });
    expect(lerCompromisso({ titulo: "Fono", inicio: "2026-11-03T14:00:00-03:00", repete_ate: "2026-10-01" })).toMatchObject({ erro: expect.stringMatching(/terminar antes/) });
  });
});

describe("ocorrencias", () => {
  it("abre a série semanal dentro da janela, respeita os pulos e o fim", async () => {
    const { ocorrencias } = await import("@/lib/app/agenda");
    const c = {
      id: "c1", crianca_id: PEDRO, tipo: "terapia" as const, titulo: "Fono", inicio: "2026-10-06T17:00:00.000Z", duracao_min: 50, dia_inteiro: false,
      local: null, levar: null, quem_leva: null, observacao: null, repete: "semanal" as const, repete_ate: "2026-11-24", pulos: ["2026-11-10"],
      membro_id: null, lembrar_min: null, cancelado_em: null,
    };
    const o = ocorrencias([c], "2026-11-01", "2026-12-31");
    expect(o.map((x) => x.data)).toEqual(["2026-11-03", "2026-11-17", "2026-11-24"]);
    expect(o[0]).toMatchObject({ inicio: "2026-11-03T17:00:00.000Z", fim: "2026-11-03T17:50:00.000Z" });
    expect(ocorrencias([{ ...c, cancelado_em: "2026-10-30T00:00:00Z" }], "2026-11-01", "2026-12-31")).toEqual([]);
    expect(ocorrencias([{ ...c, repete: "nao" }], "2026-11-01", "2026-12-31")).toEqual([]);
  });
});

describe("rotas da agenda", () => {
  it("a família marca; cada membro da rede vê só os dele; o adolescente vê todos", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/agenda/route");
    const p = { id: PEDRO };
    const fono = await chamar(rota, "POST", MAE, { titulo: "Fono", tipo: "terapia", inicio: "2026-11-03T14:00:00-03:00", repete: "semanal", membro_id: "m-fono", observacao: "levar o caderno de figuras", quem_leva: "Vó Ana" }, p);
    expect(fono.status).toBe(201);
    const neuro = await chamar(rota, "POST", MAE, { titulo: "Neuro", tipo: "consulta", inicio: "2026-11-05T09:00:00-03:00", membro_id: "m-neuro" }, p);
    expect(neuro.status).toBe(201);
    // onda 106: quem é da rede não marca, propõe (com ele mesmo, sem os campos da família)
    const prop = await chamar(rota, "POST", FONO, { titulo: "Fono extra", inicio: "2026-11-04T14:00:00-03:00", membro_id: "m-neuro", observacao: "x" }, p);
    expect(prop.status).toBe(201);
    expect(db.tabelas.app_compromissos.at(-1)).toMatchObject({ status: "proposto", membro_id: "m-fono" });
    expect(db.tabelas.app_compromissos.at(-1)!.observacao).toBeUndefined();
    expect((await chamar(rota, "POST", MAE, { titulo: "Fono", inicio: "2026-11-04T14:00:00-03:00", membro_id: "m-outro" }, p)).status).toBe(400);

    const url = "https://omnisfera.net/api/app/v1/x?de=2026-11-01&ate=2026-11-30";
    const daMae = await chamar(rota, "GET", MAE, undefined, p, url);
    expect((daMae.json.compromissos as unknown[]).length).toBe(3);
    expect((daMae.json.ocorrencias as unknown[]).length).toBe(1 + 4 + 1);
    expect(daMae.json.pode_editar).toBe(true);

    const daFono = await chamar(rota, "GET", FONO, undefined, p, url);
    const lf = daFono.json.compromissos as Record<string, unknown>[];
    expect(lf.map((c) => c.titulo)).toEqual(["Fono", "Fono extra"]);
    expect(lf[0].observacao).toBeUndefined();
    expect(lf[0].quem_leva).toBeUndefined();
    expect(daFono.json.pode_editar).toBe(false);

    // o adolescente não vê proposta ainda não confirmada
    const doTeen = await chamar(rota, "GET", TEEN, undefined, p, url);
    expect((doTeen.json.compromissos as unknown[]).length).toBe(2);
  });

  it("pular um dia, mudar e cancelar a série", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/agenda/route");
    const um = await import("@/app/api/app/v1/criancas/[id]/agenda/[compromissoId]/route");
    const novo = await chamar(rota, "POST", MAE, { titulo: "Fono", tipo: "terapia", inicio: "2026-11-03T14:00:00-03:00", repete: "semanal" }, { id: PEDRO });
    const cid = novo.json.id as string;
    const p = { id: PEDRO, compromissoId: cid };
    expect((await chamar(um, "PATCH", MAE, { acao: "pular", data: "2026-11-10" }, p)).status).toBe(200);
    expect((await chamar(um, "PATCH", FONO, { acao: "pular", data: "2026-11-17" }, p)).status).toBe(403);
    expect((await chamar(um, "PATCH", MAE, { local: "Clínica Fala" }, p)).status).toBe(200);
    const url = "https://omnisfera.net/api/app/v1/x?de=2026-11-01&ate=2026-11-30";
    const g = await chamar(rota, "GET", MAE, undefined, { id: PEDRO }, url);
    expect((g.json.ocorrencias as { data: string }[]).map((o) => o.data)).toEqual(["2026-11-03", "2026-11-17", "2026-11-24"]);
    expect((g.json.compromissos as { local: string }[])[0].local).toBe("Clínica Fala");
    expect((await chamar(um, "DELETE", MAE, undefined, p)).status).toBe(200);
    const g2 = await chamar(rota, "GET", MAE, undefined, { id: PEDRO }, url);
    expect(g2.json.compromissos).toEqual([]);
  });
});

describe("propostas do profissional (onda 106)", () => {
  it("propor, confirmar, remarcar e recusar", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/agenda/route");
    const um = await import("@/app/api/app/v1/criancas/[id]/agenda/[compromissoId]/route");
    const novo = await chamar(rota, "POST", FONO, { titulo: "Fono", tipo: "terapia", inicio: "2026-11-03T14:00:00-03:00", repete: "semanal" }, { id: PEDRO });
    const p = { id: PEDRO, compromissoId: novo.json.id as string };
    // o neuro não mexe na proposta da fono; a fono não confirma a própria proposta
    expect((await chamar(um, "PATCH", NEURO, { acao: "remarcar", inicio: "2026-11-04T14:00:00-03:00" }, p)).status).toBe(403);
    expect((await chamar(um, "PATCH", FONO, { acao: "confirmar" }, p)).status).toBe(403);
    expect((await chamar(um, "PATCH", MAE, { acao: "confirmar" }, p)).status).toBe(200);
    expect(db.tabelas.app_compromissos[0].status).toBe("confirmado");
    // remarcar um confirmado vira proposta; a família aceita e o horário muda
    expect((await chamar(um, "PATCH", FONO, { acao: "remarcar", inicio: "2026-11-05T10:00:00-03:00" }, p)).status).toBe(200);
    expect(db.tabelas.app_compromissos[0]).toMatchObject({ proposta_inicio: "2026-11-05T13:00:00.000Z", inicio: "2026-11-03T17:00:00.000Z" });
    expect((await chamar(um, "PATCH", MAE, { acao: "confirmar" }, p)).status).toBe(200);
    expect(db.tabelas.app_compromissos[0]).toMatchObject({ inicio: "2026-11-05T13:00:00.000Z", proposta_inicio: null });
    expect((await chamar(um, "PATCH", MAE, { acao: "confirmar" }, p)).status).toBe(400);
    // outra proposta, recusada: some para todos
    const outro = await chamar(rota, "POST", FONO, { titulo: "Sessão extra", inicio: "2026-11-06T10:00:00-03:00" }, { id: PEDRO });
    expect((await chamar(um, "PATCH", MAE, { acao: "recusar" }, { id: PEDRO, compromissoId: outro.json.id as string })).status).toBe(200);
    const g = await chamar(rota, "GET", FONO, undefined, { id: PEDRO }, "https://omnisfera.net/api/app/v1/x?de=2026-11-01&ate=2026-11-30");
    expect((g.json.compromissos as { titulo: string }[]).map((c) => c.titulo)).toEqual(["Fono"]);
  });
});

describe("registro de sessão (onda 106)", () => {
  it("a fono registra a sessão e a tarefa da semana vira missão em casa", async () => {
    db.tabelas.rede_membros[0].especialidade = "Fonoaudióloga";
    db.tabelas.rede_permissoes.push({ membro_id: "m-fono", categoria: "orientacoes", pode_ver: true, pode_escrever: true });
    db.tabelas.registros = []; db.tabelas.app_missoes = [];
    const rota = await import("@/app/api/app/v1/criancas/[id]/sessoes/route");
    const g = await chamar(rota, "GET", FONO, undefined, { id: PEDRO });
    expect(g.json).toMatchObject({ area: "fono", pode_registrar: true, rotulos: { tarefa: "Exercício da semana" } });
    expect((await chamar(rota, "POST", FONO, { como_foi: "" }, { id: PEDRO })).status).toBe(400);
    const r = await chamar(rota, "POST", FONO, { como_foi: "Pediu ajuda com a frase inteira.", trabalhado: "Pedir ajuda", resposta: "bem", tarefa: { titulo: "Pedir água com a frase", etapas: ["Mostrar a figura", "Esperar a frase"] } }, { id: PEDRO });
    expect(r.status).toBe(201);
    expect(db.tabelas.registros[0]).toMatchObject({ tipo: "terapia", categoria: "orientacoes", subtipo: "fono", dados: { sessao: true, resposta: "bem", reservado: false } });
    expect(db.tabelas.app_missoes[0]).toMatchObject({ origem: "orientacao", onde: "casa", meta_ref: "Exercício da semana · Fonoaudiologia" });
    // o neuro, sem permissão de escrever orientações, não registra sessão
    expect((await chamar(rota, "POST", NEURO, { como_foi: "Consulta de rotina." }, { id: PEDRO })).status).toBe(403);
  });

  it("a sessão da psicologia é reservada: a família e a autora veem, o resto da rede não", async () => {
    db.tabelas.rede_membros[1].especialidade = "Psicóloga";
    db.tabelas.rede_permissoes.push(
      { membro_id: "m-neuro", categoria: "orientacoes", pode_ver: true, pode_escrever: true },
      { membro_id: "m-fono", categoria: "orientacoes", pode_ver: true, pode_escrever: false },
    );
    db.tabelas.registros = [];
    const rota = await import("@/app/api/app/v1/criancas/[id]/sessoes/route");
    const linha = await import("@/app/api/app/v1/criancas/[id]/registros/route");
    expect((await chamar(rota, "POST", NEURO, { como_foi: "Falamos da escola nova." }, { id: PEDRO })).status).toBe(201);
    expect(db.tabelas.registros[0].dados).toMatchObject({ area: "psicologia", reservado: true });
    const daMae = await chamar(linha, "GET", MAE, undefined, { id: PEDRO });
    const daPsi = await chamar(linha, "GET", NEURO, undefined, { id: PEDRO });
    const daFono = await chamar(linha, "GET", FONO, undefined, { id: PEDRO });
    expect((daMae.json.registros as unknown[]).length).toBe(1);
    expect((daPsi.json.registros as unknown[]).length).toBe(1);
    expect((daFono.json.registros as unknown[]).length).toBe(0);
  });

  it("a área sai da especialidade escrita pela família", async () => {
    const { areaDoMembro } = await import("@/lib/app/sessoes");
    expect(areaDoMembro("profissional", "Fonoaudióloga")).toBe("fono");
    expect(areaDoMembro("profissional", "Psicopedagoga")).toBe("psicopedagogia");
    expect(areaDoMembro("profissional", "psicólogo")).toBe("psicologia");
    expect(areaDoMembro("profissional", "TO")).toBe("to");
    expect(areaDoMembro("profissional", "Neurologista")).toBe("medicina");
    expect(areaDoMembro("professor", null)).toBe("professor");
    expect(areaDoMembro("profissional", "Musicoterapeuta")).toBe("outra");
  });
});

describe("calendário assinável", () => {
  it("o link mostra só título · primeiro nome, hora e local, e para quando é desligado", async () => {
    const rota = await import("@/app/api/app/v1/criancas/[id]/agenda/route");
    const link = await import("@/app/api/app/v1/criancas/[id]/agenda/link/route");
    const cal = await import("@/app/api/app/v1/calendario/[token]/route");
    const agora = new Date(Date.now() + 2 * 86_400_000).toISOString();
    await chamar(rota, "POST", MAE, { titulo: "Fono", tipo: "terapia", inicio: agora, local: "Clínica Fala", observacao: "segredo de saúde", membro_id: "m-fono" }, { id: PEDRO });
    await chamar(rota, "POST", MAE, { titulo: "Neuro", tipo: "consulta", inicio: agora, membro_id: "m-neuro" }, { id: PEDRO });

    const criado = await chamar(link, "POST", FONO, undefined, { id: PEDRO });
    expect(criado.status).toBe(201);
    const segredo = String(criado.json.url).split("/").pop()!;
    expect(db.tabelas.app_agenda_links[0].token_hash).not.toContain(segredo.replace(".ics", ""));

    const ics = await chamar(cal, "GET", null, undefined, { token: segredo });
    expect(ics.status).toBe(200);
    expect(ics.txt).toContain("BEGIN:VCALENDAR");
    expect(ics.txt).toContain("SUMMARY:Fono · Pedro");
    expect(ics.txt).toContain("LOCATION:Clínica Fala");
    expect(ics.txt).not.toContain("Neuro");
    expect(ics.txt).not.toContain("segredo de saúde");
    expect(ics.txt).not.toContain("Alves");

    expect((await chamar(link, "GET", FONO, undefined, { id: PEDRO })).json.tem_link).toBe(true);
    await chamar(link, "DELETE", FONO, undefined, { id: PEDRO });
    expect((await chamar(cal, "GET", null, undefined, { token: segredo })).status).toBe(404);
    expect((await chamar(cal, "GET", null, undefined, { token: "curto" })).status).toBe(404);
  });

  it("quem sai da rede deixa de ver o calendário pelo link antigo", async () => {
    const link = await import("@/app/api/app/v1/criancas/[id]/agenda/link/route");
    const cal = await import("@/app/api/app/v1/calendario/[token]/route");
    const criado = await chamar(link, "POST", FONO, undefined, { id: PEDRO });
    const segredo = String(criado.json.url).split("/").pop()!;
    db.tabelas.rede_membros[0].status = "revogado";
    expect((await chamar(cal, "GET", null, undefined, { token: segredo })).status).toBe(404);
  });
});

describe("previsão da medicação", () => {
  it("conta o estoque pelos horários e avisa com 7 dias, e a receita com 15", async () => {
    const { previsaoDaMedicacao, lerMedicacao } = await import("@/lib/app/medicacao");
    const agora = Date.parse("2026-11-01T12:00:00-03:00");
    const p = previsaoDaMedicacao({ estoque: 30, estoque_em: "2026-11-01T12:00:00-03:00", por_dose: 1, horarios: ["07:00", "19:00"], receita_vence: "2026-12-31" }, agora);
    expect(p).toMatchObject({ dias_restantes: 15, acaba_em: "2026-11-16", avisar: false });
    const dez = previsaoDaMedicacao({ estoque: 30, estoque_em: "2026-10-22T12:00:00-03:00", por_dose: 1, horarios: ["07:00", "19:00"] }, agora);
    expect(dez).toMatchObject({ dias_restantes: 5, avisar: true });
    expect(previsaoDaMedicacao({ horarios: ["07:00"], receita_vence: "2026-11-10" }, agora)).toMatchObject({ dias_restantes: null, receita_dias: 9, avisar: true });
    expect(lerMedicacao({ estoque: -1 }, true)).toMatchObject({ erro: expect.any(String) });
    expect(lerMedicacao({ estoque: "28", por_dose: 0.5, receita_vence: "2027-01-10" }, true)).toMatchObject({ estoque: 28, por_dose: 0.5, receita_vence: "2027-01-10" });
  });
});
