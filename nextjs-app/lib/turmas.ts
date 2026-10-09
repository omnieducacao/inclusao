/**
 * Turmas e vínculos (onda 1 · fundação).
 *
 * - O estudante passa a ter class_id (turma cadastrada em Configuração da escola).
 *   Para quem ainda não tem, a ligação é deduzida da série e da turma digitadas, com uma
 *   regra única (antes cada tela comparava só o número da série, e "Educação Infantil (5 anos)"
 *   batia com o "5º Ano").
 * - Cada professor vê os estudantes do seu vínculo:
 *     todos  → toda a escola;
 *     turma  → as turmas em que ele dá aula (teacher_assignments);
 *     tutor  → os estudantes ligados a ele um a um (teacher_student_links).
 *   Coordenação (master) e admin veem todos.
 */
import { NextResponse } from "next/server";
import { getSupabase } from "./supabase";
import type { SessionPayload } from "./session";
import { memberIdDaSessao } from "./session";

export type Segmento = "EI" | "EFAI" | "EFAF" | "EM";

/** Segmento escrito na série do estudante: "7º Ano (EFAF)" → EFAF; "Educação Infantil (4 anos)" → EI. */
export function segmentoDaSerie(serie: string | null | undefined): Segmento | null {
  const s = (serie || "").toLowerCase();
  if (!s) return null;
  if (s.includes("infantil")) return "EI";
  if (s.includes("(efai)")) return "EFAI";
  if (s.includes("(efaf)")) return "EFAF";
  if (s.includes("(em)") || s.includes("série") || s.includes("serie")) return "EM";
  const n = Number((s.match(/\d+/) || [""])[0]);
  if (s.includes("ano") && n >= 1 && n <= 5) return "EFAI";
  if (s.includes("ano") && n >= 6 && n <= 9) return "EFAF";
  return null;
}

function numero(txt: string | null | undefined): string {
  return ((txt || "").match(/\d+/) || [""])[0];
}

/** A série da turma cadastrada (grades) é a mesma série escrita no estudante? */
export function serieCombina(
  grade: { code?: string | null; label?: string | null; segment_id?: string | null },
  serieEstudante: string | null | undefined
): boolean {
  const n = numero(serieEstudante);
  if (!n) return false;
  const nTurma = numero(grade.code) || numero(grade.label);
  if (nTurma !== n) return false;
  const seg = segmentoDaSerie(serieEstudante);
  // Se os dois lados dizem o segmento, ele precisa bater (EI 5 anos ≠ 5º ano).
  if (seg && grade.segment_id && seg !== grade.segment_id) return false;
  return true;
}

/** Turma "A" do estudante combina com a turma "A" cadastrada? (vazio de um dos lados aceita) */
export function turmaCombina(turmaCadastrada: string | null | undefined, turmaEstudante: string | null | undefined): boolean {
  const a = (turmaCadastrada || "").trim().toLowerCase();
  const b = (turmaEstudante || "").trim().toLowerCase();
  if (!a || !b) return true;
  return a === b;
}

type EstudanteMin = { id: string; grade?: string | null; class_group?: string | null; class_id?: string | null };
type TurmaMin = { id: string; class_group?: string | null; grade?: { code?: string | null; label?: string | null; segment_id?: string | null } | null };

/** O estudante está nesta turma? Usa class_id quando existe; senão, série + turma escritas. */
export function estudanteNaTurma(est: EstudanteMin, turma: TurmaMin): boolean {
  if (est.class_id) return est.class_id === turma.id;
  if (!turma.grade) return false;
  return serieCombina(turma.grade, est.grade) && turmaCombina(turma.class_group, est.class_group);
}

/** Turmas cadastradas da escola, com a série (para comparar com estudantes sem class_id). */
export async function turmasDaEscola(workspaceId: string, ids?: string[]): Promise<TurmaMin[]> {
  let q = getSupabase()
    .from("classes")
    .select("id, class_group, grade:grades(code, label, segment_id)")
    .eq("workspace_id", workspaceId);
  if (ids) {
    if (ids.length === 0) return [];
    q = q.in("id", ids);
  }
  const { data } = await q;
  return ((data || []) as unknown as Array<TurmaMin & { grade: TurmaMin["grade"] | TurmaMin["grade"][] }>).map((t) => ({
    ...t,
    grade: Array.isArray(t.grade) ? t.grade[0] ?? null : t.grade,
  }));
}

export type Vinculo = { tipo: "todos" } | { tipo: "turmas"; turmas: TurmaMin[] } | { tipo: "estudantes"; ids: Set<string> };

/** Qual parte da escola esta sessão enxerga. */
export async function vinculoDaSessao(session: Partial<SessionPayload> | null | undefined): Promise<Vinculo> {
  if (!session?.workspace_id) return { tipo: "estudantes", ids: new Set() };
  // Simulando um professor, vale o vínculo dele mesmo para admin/coordenação
  const simulandoMembro = Boolean(session.simulating_member_id) && session.user_role === "member";
  if (!simulandoMembro && (session.is_platform_admin || session.user_role === "master")) return { tipo: "todos" };
  if (session.user_role !== "member") return { tipo: "estudantes", ids: new Set() };

  const member = (session.member || {}) as { link_type?: string };
  const tipo = member.link_type || "todos";
  if (tipo === "todos") return { tipo: "todos" };

  const memberId = memberIdDaSessao(session);
  if (!memberId) return { tipo: "estudantes", ids: new Set() };
  const sb = getSupabase();

  if (tipo === "tutor") {
    const { data } = await sb.from("teacher_student_links").select("student_id").eq("workspace_member_id", memberId);
    return { tipo: "estudantes", ids: new Set((data || []).map((l: { student_id: string }) => l.student_id)) };
  }

  // turma
  const { data } = await sb.from("teacher_assignments").select("class_id").eq("workspace_member_id", memberId);
  const ids = [...new Set((data || []).map((a: { class_id: string }) => a.class_id))];
  return { tipo: "turmas", turmas: await turmasDaEscola(session.workspace_id, ids) };
}

export function vinculoInclui(v: Vinculo, est: EstudanteMin): boolean {
  if (v.tipo === "todos") return true;
  if (v.tipo === "estudantes") return v.ids.has(est.id);
  return v.turmas.some((t) => estudanteNaTurma(est, t));
}

export function filtrarPorVinculo<T extends EstudanteMin>(v: Vinculo, lista: T[]): T[] {
  if (v.tipo === "todos") return lista;
  return lista.filter((e) => vinculoInclui(v, e));
}

/**
 * Para rotas /api/students/[id]/…: devolve 404 quando o estudante está fora do vínculo de
 * quem pediu (professor de outra turma), ou null quando pode seguir.
 */
export async function negadoForaDoVinculo(
  session: Partial<SessionPayload> | null | undefined,
  studentId: string
): Promise<NextResponse | null> {
  const v = await vinculoDaSessao(session);
  if (v.tipo === "todos") return null;
  const { data } = await getSupabase()
    .from("students")
    .select("id, grade, class_group, class_id")
    .eq("id", studentId)
    .eq("workspace_id", session?.workspace_id || "")
    .maybeSingle();
  if (data && vinculoInclui(v, data as EstudanteMin)) return null;
  return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });
}

/**
 * Acha a turma cadastrada que corresponde à série + turma escritas no PEI do estudante.
 * Devolve o id quando há exatamente uma turma possível (no ano letivo ativo, se houver); senão null.
 */
export async function resolverTurma(
  workspaceId: string,
  serie: string | null | undefined,
  turma: string | null | undefined
): Promise<string | null> {
  if (!serie || !turma) return null;
  const { data } = await getSupabase()
    .from("classes")
    .select("id, class_group, school_year:school_years(active), grade:grades(code, label, segment_id)")
    .eq("workspace_id", workspaceId);
  type Linha = TurmaMin & { school_year?: { active?: boolean } | { active?: boolean }[] | null };
  const um = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);
  const turmas = ((data || []) as unknown as Linha[]).map((t) => ({
    ...t,
    grade: um(t.grade as TurmaMin["grade"] | TurmaMin["grade"][]),
    ativo: um(t.school_year)?.active ?? true,
  }));
  const candidatas = turmas.filter(
    (t) => t.grade && serieCombina(t.grade, serie) && (t.class_group || "").trim().toLowerCase() === turma.trim().toLowerCase()
  );
  const ativas = candidatas.filter((t) => t.ativo);
  const lista = ativas.length > 0 ? ativas : candidatas;
  return lista.length === 1 ? lista[0].id : null;
}

/**
 * Onda 2: profissionais (não coordenação/direção) que têm este estudante no vínculo —
 * quem deve ler e dar ciência do PEI.
 */
export async function membrosDoEstudante(
  workspaceId: string,
  est: EstudanteMin
): Promise<Array<{ id: string; nome: string }>> {
  const sb = getSupabase();
  const { data: membros } = await sb
    .from("workspace_members")
    .select("id, nome, link_type, papel, active")
    .eq("workspace_id", workspaceId);
  const ativos = ((membros || []) as Array<{ id: string; nome: string; link_type: string; papel?: string; active?: boolean }>).filter(
    (m) => m.active !== false && m.papel !== "coordenacao" && m.papel !== "direcao"
  );
  if (ativos.length === 0) return [];
  const ids = ativos.map((m) => m.id);
  const [{ data: links }, { data: atribs }] = await Promise.all([
    sb.from("teacher_student_links").select("workspace_member_id").eq("student_id", est.id).in("workspace_member_id", ids),
    sb.from("teacher_assignments").select("workspace_member_id, class_id").in("workspace_member_id", ids),
  ]);
  const tutores = new Set((links || []).map((l: { workspace_member_id: string }) => l.workspace_member_id));
  const classIds = [...new Set((atribs || []).map((a: { class_id: string }) => a.class_id))];
  const turmas = await turmasDaEscola(workspaceId, classIds);
  const turmasDoEst = new Set(turmas.filter((t) => estudanteNaTurma(est, t)).map((t) => t.id));
  const porTurma = new Set(
    (atribs || [])
      .filter((a: { class_id: string }) => turmasDoEst.has(a.class_id))
      .map((a: { workspace_member_id: string }) => a.workspace_member_id)
  );
  return ativos
    .filter((m) => (m.link_type === "tutor" ? tutores.has(m.id) : m.link_type === "turma" ? porTurma.has(m.id) : false))
    .map((m) => ({ id: m.id, nome: m.nome }));
}
