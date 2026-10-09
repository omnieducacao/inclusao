/**
 * Onda 16: o que toda rota de IA do PAEE faz antes de gerar — confere se quem pede atende o
 * estudante (vínculo com a turma) e lê do banco as metas, barreiras e níveis de suporte do PEI.
 */
import type { NextResponse } from "next/server";
import type { SessionPayload } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { contextoEstruturadoDoPei } from "@/lib/pei-metas";
import { pontosDeAtencaoDaDiagnostica } from "@/lib/avaliacao-servidor";

export async function prepararPaee(
  session: SessionPayload,
  studentId: unknown
): Promise<{ negado: NextResponse | null; contexto: string }> {
  if (typeof studentId !== "string" || !studentId || !session.workspace_id) return { negado: null, contexto: "" };
  const negado = await negadoForaDoVinculo(session, studentId);
  if (negado) return { negado, contexto: "" };
  const { data } = await getSupabase()
    .from("students")
    .select("pei_data")
    .eq("id", studentId)
    .eq("workspace_id", session.workspace_id)
    .maybeSingle();
  let contexto = contextoEstruturadoDoPei((data?.pei_data || null) as Record<string, unknown> | null);
  // Onda 17: o que a avaliação diagnóstica mostrou, descritor por descritor
  const pontos = await pontosDeAtencaoDaDiagnostica(session.workspace_id, studentId).catch(() => []);
  if (pontos.length) {
    contexto += `${contexto ? "\n\n" : ""}AVALIAÇÃO DIAGNÓSTICA (descritores com nível 0 a 2):\n${pontos.slice(0, 12).map((p) => `- ${p.disciplina}: ${p.descritor} (nível ${p.nivel})`).join("\n")}`;
  }
  return { negado: null, contexto };
}
