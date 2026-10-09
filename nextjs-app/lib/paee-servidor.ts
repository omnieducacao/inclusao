/**
 * Onda 16: o que toda rota de IA do PAEE faz antes de gerar — confere se quem pede atende o
 * estudante (vínculo com a turma) e lê do banco as metas, barreiras e níveis de suporte do PEI.
 */
import type { NextResponse } from "next/server";
import type { SessionPayload } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { contextoEstruturadoDoPei } from "@/lib/pei-metas";

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
  return { negado: null, contexto: contextoEstruturadoDoPei((data?.pei_data || null) as Record<string, unknown> | null) };
}
