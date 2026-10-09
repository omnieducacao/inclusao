/** Acesso ao banco das missões (servidor). Sem a migração, devolve semMigracao em vez de quebrar. */
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { SessionPayload } from "@/lib/session";
import type { Missao } from "@/lib/missoes";

export const CAMPOS_MISSAO = "id, titulo, passos, meta, onde, status, feita_em, nota_familia, confirmada_em, created_at";

/** Quem da escola cuida das missões: direção, coordenação do PEI, AEE e professores do estudante. */
export function negadoMissoes(session: Partial<SessionPayload> | null | undefined): NextResponse | null {
  if (!session?.workspace_id || session.user_role === "family") return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  if (session.is_platform_admin || session.user_role === "master") return null;
  const m = (session.member || {}) as Record<string, unknown>;
  if (m.can_pei || m.can_paee || m.can_pei_professor) return null;
  return NextResponse.json({ error: "Sem permissão para as missões." }, { status: 403 });
}

export async function listarMissoes(workspaceId: string, studentId: string, status?: string[]): Promise<{ missoes: Missao[]; semMigracao: boolean }> {
  let q = getSupabase().from("estudante_missoes").select(CAMPOS_MISSAO).eq("workspace_id", workspaceId).eq("student_id", studentId);
  if (status?.length) q = q.in("status", status);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) return { missoes: [], semMigracao: true };
  return { missoes: (data || []) as unknown as Missao[], semMigracao: false };
}
