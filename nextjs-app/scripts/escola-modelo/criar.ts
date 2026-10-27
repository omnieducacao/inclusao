/**
 * SCRUM-275 · Colégio Modelo: cria a escola fictícia completa na Omnisfera (personas de personas.ts).
 *
 * Grava pelas funções do próprio app (lib/members, lib/school, lib/encryption e o cliente de
 * lib/supabase), para que nomes, e-mails e campos sensíveis do PEI fiquem cifrados como os de
 * qualquer escola e o login ache cada pessoa pelo índice do e-mail.
 *
 * Quem roda é o Rodrigo, no Mac, com as chaves do .env.local (nunca em argumento):
 *   node --env-file=.env.local scripts/escola-modelo.mjs            simulação: mostra o plano, não grava
 *   node --env-file=.env.local scripts/escola-modelo.mjs --criar    cria a escola e mostra os logins
 *   node --env-file=.env.local scripts/escola-modelo.mjs --apagar   apaga o Colégio Modelo inteiro
 *   node --env-file=.env.local scripts/escola-modelo.mjs --guardar  guarda o estado atual (para resetar depois)
 *   node --env-file=.env.local scripts/escola-modelo.mjs --restaurar volta a escola ao estado guardado
 *
 * As senhas são geradas aqui e aparecem só no Terminal. Não ficam em arquivo nem no repositório.
 */
import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { createWorkspaceMaster, createMember } from "@/lib/members";
import { createSchoolYear, setWorkspaceGrades, createClass } from "@/lib/school";
import { encryptField, encryptSensitivePeiFields } from "@/lib/encryption";
import { PAPEIS } from "@/lib/papeis";
import { guardar, restaurar } from "./estado";
import { ESCOLA, DIRETORA, EQUIPE, ESTUDANTES, FAMILIAS, DOMINIO, type ChaveTurma } from "./personas";

type Login = { persona: string; papel: string; email: string; senha: string };

const MODULOS = ["pei", "paee", "hub", "diario", "avaliacao"];
const MOTORES = ["red", "blue", "green", "yellow", "orange"];

/** Senha forte e legível: 4 blocos de letras/números, sem caracteres ambíguos. */
export function gerarSenha(): string {
  const alfabeto = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bloco = () => Array.from({ length: 4 }, () => alfabeto[randomInt(alfabeto.length)]).join("");
  return `${bloco()}-${bloco()}-${bloco()}`;
}

export const emailDe = (login: string) => `${login}@${DOMINIO}`;

/** Monta o pei_data de um estudante (em texto) a partir da persona. */
export function peiDaPersona(e: (typeof ESTUDANTES)[number]): Record<string, unknown> {
  const turma = ESCOLA.turmas.find((t) => t.chave === e.turma)!;
  return {
    ...e.pei,
    nome: e.nome,
    nasc: e.nasc,
    serie: turma.serie,
    turma: turma.grupo,
    status_validacao_pei: "rascunho",
    fase_pei: "fase_1",
  };
}

function falhou(etapa: string, erro: unknown): never {
  const msg = erro instanceof Error ? erro.message : typeof erro === "string" ? erro : JSON.stringify(erro);
  throw new Error(`${etapa}: ${msg}`);
}

async function acharEscola() {
  const { data, error } = await getSupabase().from("workspaces").select("id, name").eq("name", ESCOLA.nome);
  if (error) falhou("procurar a escola", error.message);
  return (data || []) as { id: string; name: string }[];
}

function plano() {
  console.log(`\n${ESCOLA.nome} · ano letivo ${ESCOLA.ano}`);
  console.log(`  turmas: ${ESCOLA.turmas.map((t) => `${t.serie} ${t.grupo}`).join(" · ")}`);
  console.log(`  direção: ${DIRETORA.nome} (${emailDe(DIRETORA.login)})`);
  for (const p of EQUIPE) console.log(`  ${p.papel.padEnd(11)} ${p.nome} (${emailDe(p.login)})`);
  for (const e of ESTUDANTES) console.log(`  estudante   ${e.nome} · ${e.turma} · ${e.diagnostico}`);
  for (const f of FAMILIAS) console.log(`  família     ${f.nome} (${emailDe(f.login)}) → ${f.estudantes.join(", ")}`);
  // confere que tudo cifra antes de gravar qualquer coisa
  for (const e of ESTUDANTES) {
    const cifrado = encryptSensitivePeiFields(peiDaPersona(e));
    if (!String(cifrado.nome || "").startsWith("enc:")) falhou("cifrar o PEI", `nome de ${e.chave} não foi cifrado`);
  }
  console.log("  cifra: ok (nomes e campos sensíveis do PEI saem cifrados)\n");
}

async function criar(): Promise<Login[]> {
  const sb = getSupabase();
  const logins: Login[] = [];

  // 1. Escola
  const pin = String(randomInt(10_000_000, 99_999_999));
  const { data: ws, error: errWs } = await sb
    .from("workspaces")
    .insert({
      name: ESCOLA.nome,
      pin_hash: bcrypt.hashSync(pin, 10),
      segments: ["EI", "EF_AI"],
      ai_engines: MOTORES,
      plan: "robusto",
      credits_limit: 100,
      enabled_modules: MODULOS,
      active: true,
      family_module_enabled: true,
      modo: "completo",
    })
    .select("id")
    .single();
  if (errWs || !ws) falhou("criar a escola", errWs?.message);
  const wsId = ws.id as string;
  console.log(`escola criada: ${wsId}`);

  // 2. Direção (conta principal)
  const senhaDir = gerarSenha();
  const m = await createWorkspaceMaster(wsId, emailDe(DIRETORA.login), senhaDir, DIRETORA.nome, { cargo: DIRETORA.cargo });
  if (m.error) falhou("criar a direção", m.error);
  logins.push({ persona: DIRETORA.nome, papel: "direção (conta principal)", email: emailDe(DIRETORA.login), senha: senhaDir });

  // 3. Ano letivo, séries e turmas
  const ano = await createSchoolYear(wsId, ESCOLA.ano, String(ESCOLA.ano));
  if (ano.error || !ano.id) falhou("criar o ano letivo", ano.error);
  const { data: grades, error: errG } = await sb.from("grades").select("id, code").in("code", ESCOLA.turmas.map((t) => t.grade_code));
  if (errG) falhou("ler as séries", errG.message);
  const gradeId = new Map((grades || []).map((g: { id: string; code: string }) => [g.code, g.id]));
  const ws_grades = ESCOLA.turmas.map((t) => gradeId.get(t.grade_code)).filter(Boolean) as string[];
  if (ws_grades.length !== ESCOLA.turmas.length) falhou("ler as séries", "alguma série não existe na tabela grades");
  const g = await setWorkspaceGrades(wsId, ws_grades);
  if (g.error) falhou("ligar as séries", g.error);
  const turmaId = new Map<ChaveTurma, string>();
  for (const t of ESCOLA.turmas) {
    const c = await createClass(wsId, ano.id!, gradeId.get(t.grade_code)!, t.grupo);
    if (c.error || !c.id) falhou(`criar a turma ${t.serie}`, c.error);
    turmaId.set(t.chave, c.id!);
  }
  console.log(`turmas: ${turmaId.size}`);

  // 4. Estudantes (nome, diagnóstico e campos sensíveis do PEI cifrados)
  const estudanteId = new Map<string, string>();
  for (const e of ESTUDANTES) {
    const turma = ESCOLA.turmas.find((t) => t.chave === e.turma)!;
    const { data, error } = await sb
      .from("students")
      .insert({
        workspace_id: wsId,
        class_id: turmaId.get(e.turma),
        name: e.nome,
        grade: turma.serie,
        class_group: turma.grupo,
        diagnosis: encryptField(e.diagnostico),
        pei_data: encryptSensitivePeiFields(peiDaPersona(e)),
        privacy_consent_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !data) falhou(`criar o estudante ${e.chave}`, error?.message);
    estudanteId.set(e.chave, data.id as string);
  }
  console.log(`estudantes: ${estudanteId.size}`);

  // 5. Equipe, com as permissões sugeridas para cada papel
  for (const p of EQUIPE) {
    const papel = PAPEIS.find((x) => x.id === p.papel)!;
    const senha = gerarSenha();
    const r = await createMember(wsId, {
      nome: p.nome,
      email: emailDe(p.login),
      password: senha,
      cargo: p.cargo,
      papel: p.papel,
      ...papel.permissoes,
      link_type: papel.vinculo,
      teacher_assignments: (p.turmas || []).map((k) => ({
        class_id: turmaId.get(k)!,
        component_id: ESCOLA.turmas.find((t) => t.chave === k)!.componente,
      })),
      student_ids: (p.estudantes || []).map((k) => estudanteId.get(k)!).filter(Boolean),
    });
    if (r.error) falhou(`criar ${p.nome}`, r.error);
    logins.push({ persona: p.nome, papel: papel.nome, email: emailDe(p.login), senha });
  }
  console.log(`equipe: ${EQUIPE.length}`);

  // 6. Famílias (e-mail cifrado e com índice pelo cliente do app)
  for (const f of FAMILIAS) {
    const senha = gerarSenha();
    const { data, error } = await sb
      .from("family_responsibles")
      .insert({
        workspace_id: wsId,
        nome: f.nome,
        email: emailDe(f.login),
        parentesco: f.parentesco,
        password_hash: bcrypt.hashSync(senha, 10),
        active: true,
        terms_accepted: false,
      })
      .select("id")
      .single();
    if (error || !data) falhou(`criar a família ${f.login}`, error?.message);
    const links = f.estudantes.map((k) => ({ family_responsible_id: data.id, student_id: estudanteId.get(k), vinculo_tipo: "responsavel_legal" }));
    const { error: errL } = await sb.from("family_student_links").insert(links);
    if (errL) falhou(`ligar a família ${f.login}`, errL.message);
    logins.push({ persona: f.nome, papel: `família (${f.parentesco.toLowerCase()})`, email: emailDe(f.login), senha });
  }
  console.log(`famílias: ${FAMILIAS.length}`);
  return logins;
}

/** Tabelas com workspace_id que o Colégio Modelo pode ter preenchido (inclui o que for gerado pelo app). */
const TABELAS_DA_ESCOLA = [
  "avaliacao_processual", "avaliacoes_diagnosticas", "avaliacao_provas", "avaliacao_resultado", "avaliacao",
  "pei_disciplinas", "pei_ciencias", "planos_ensino", "hub_generated_content", "estudante_missoes",
  "monitoring_assessments", "family_mensagens", "family_pei_acknowledgments", "family_laudos", "family_medicacao_updates",
  "announcement_views", "ia_usage", "usage_events", "acessos", "ai_feedback",
];

async function apagar() {
  const sb = getSupabase();
  const escolas = await acharEscola();
  if (escolas.length === 0) { console.log("Não há Colégio Modelo para apagar."); return; }
  for (const { id } of escolas) {
    const { data: membros } = await sb.from("workspace_members").select("id").eq("workspace_id", id);
    const idsMembros = (membros || []).map((x: { id: string }) => x.id);
    const { data: fams } = await sb.from("family_responsibles").select("id").eq("workspace_id", id);
    const idsFam = (fams || []).map((x: { id: string }) => x.id);
    for (const t of TABELAS_DA_ESCOLA) await sb.from(t).delete().eq("workspace_id", id); // tabela sem a coluna: ignora
    if (idsFam.length) await sb.from("family_student_links").delete().in("family_responsible_id", idsFam);
    if (idsMembros.length) {
      await sb.from("teacher_assignments").delete().in("workspace_member_id", idsMembros);
      await sb.from("teacher_student_links").delete().in("workspace_member_id", idsMembros);
    }
    for (const t of ["family_responsibles", "students", "workspace_members", "workspace_masters", "classes", "workspace_grades", "school_years"]) {
      const { error } = await sb.from(t).delete().eq("workspace_id", id);
      if (error) falhou(`apagar ${t}`, error.message);
    }
    const { error } = await sb.from("workspaces").delete().eq("id", id);
    if (error) falhou("apagar a escola", error.message);
    console.log(`Colégio Modelo apagado: ${id}`);
  }
}

export async function main(args: string[]) {
  if (args.includes("--apagar")) { await apagar(); return; }
  if (args.includes("--guardar")) { await guardar(); return; }
  if (args.includes("--restaurar")) { await restaurar(apagar); return; }
  plano();
  const existentes = await acharEscola();
  if (existentes.length) {
    console.log(`Já existe uma escola "${ESCOLA.nome}" (${existentes.map((x) => x.id).join(", ")}). Nada foi criado.`);
    console.log("Para recriar do zero: rode com --apagar e depois com --criar.");
    return;
  }
  if (!args.includes("--criar")) { console.log("Simulação: nada foi gravado. Para criar, rode de novo com --criar."); return; }
  const logins = await criar();
  console.log("\nLOGINS (anote agora; as senhas não ficam salvas em lugar nenhum)\n");
  for (const l of logins) console.log(`  ${l.papel.padEnd(28)} ${l.persona.padEnd(24)} ${l.email.padEnd(44)} ${l.senha}`);
  console.log("\nEntrar em https://omnisfera.net/login com o e-mail e a senha.\n");
}
