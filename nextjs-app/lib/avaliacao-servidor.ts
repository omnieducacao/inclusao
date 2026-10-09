/**
 * Onda 17: regras comuns das avaliações (diagnóstica e processual) no servidor.
 * Aplicam os dois: a coordenação/AEE (qualquer estudante do vínculo) e o professor (os estudantes
 * das turmas dele). A família nunca.
 */
import { NextResponse } from "next/server";
import type { SessionPayload } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { lerSerie, type SerieLida } from "@/lib/matriz-avaliacao";

export function podeAvaliar(session: Partial<SessionPayload> | null | undefined): boolean {
  if (!session?.workspace_id || session.user_role === "family") return false;
  if (session.is_platform_admin || session.user_role === "master") return true;
  const m = (session.member || {}) as Record<string, unknown>;
  return !!(m.can_avaliacao || m.can_pei || m.can_pei_professor || m.can_paee);
}

/** Confere permissão e vínculo e devolve o estudante (nome e série). */
export async function estudanteParaAvaliar(
  session: SessionPayload | null,
  studentId: string | null | undefined
): Promise<{ erro: NextResponse } | { estudante: { id: string; name: string; grade: string | null; pei_data: Record<string, unknown> | null }; serie: SerieLida }> {
  if (!session?.workspace_id) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  if (!podeAvaliar(session)) return { erro: NextResponse.json({ error: "Sem permissão para avaliar." }, { status: 403 }) };
  if (!studentId) return { erro: NextResponse.json({ error: "Escolha o estudante." }, { status: 400 }) };
  const fora = await negadoForaDoVinculo(session, studentId);
  if (fora) return { erro: fora };
  const { data } = await getSupabase()
    .from("students")
    .select("id, name, grade, pei_data")
    .eq("id", studentId)
    .eq("workspace_id", session.workspace_id)
    .maybeSingle();
  if (!data) return { erro: NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 }) };
  return { estudante: data as { id: string; name: string; grade: string | null; pei_data: Record<string, unknown> | null }, serie: lerSerie(data.grade as string | null) };
}

export const semMigracaoAvaliacao = (msg?: string) => /matriz|descritores|ano_referencia|concluida_em|diagnostica_id|confronto_matriz/.test(msg || "");

/** Para o PAEE e o PEI: descritores com nível 0–2 nas diagnósticas concluídas do estudante. */
export async function pontosDeAtencaoDaDiagnostica(workspaceId: string, studentId: string): Promise<Array<{ disciplina: string; codigo: string; descritor: string; nivel: number }>> {
  const { data, error } = await getSupabase()
    .from("avaliacoes_diagnosticas")
    .select("disciplina, descritores, matriz, concluida_em")
    .eq("workspace_id", workspaceId)
    .eq("student_id", studentId)
    .neq("matriz", "legado")
    .not("concluida_em", "is", null)
    .order("concluida_em", { ascending: false });
  if (error || !data) return [];
  const vistos = new Set<string>();
  const lista: Array<{ disciplina: string; codigo: string; descritor: string; nivel: number }> = [];
  for (const av of data as Array<{ disciplina: string; descritores: Array<{ codigo: string; descritor: string; nivel: number | null }> }>) {
    if (vistos.has(av.disciplina)) continue; // só a mais recente de cada disciplina
    vistos.add(av.disciplina);
    for (const d of av.descritores || []) {
      if (typeof d.nivel === "number" && d.nivel <= 2) lista.push({ disciplina: av.disciplina, codigo: d.codigo, descritor: d.descritor, nivel: d.nivel });
    }
  }
  return lista.sort((a, b) => a.nivel - b.nivel).slice(0, 20);
}
