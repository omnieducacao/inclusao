import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { resumoParaFamilia } from "@/lib/familia-resumo";

/**
 * GET /api/familia/estudante/[id]
 * Retorna dados do estudante para o responsável (apenas se vinculado).
 * Dados limitados: básicos, resumo PEI, evolução processual (cálculo em lib/familia-resumo, o mesmo do app).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role !== "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const familyId = session.family_responsible_id;
  if (!familyId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const { id: studentId } = await params;

  const sb = getSupabase();

  // Verificar vínculo
  const { data: link, error: linkError } = await sb
    .from("family_student_links")
    .select("id")
    .eq("family_responsible_id", familyId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (linkError) {
    logger.error({ err: linkError.message }, "[familia/estudante] link query error:");
    return NextResponse.json({ error: "Erro ao verificar vínculo" }, { status: 500 });
  }

  if (!link) {
    return NextResponse.json({ error: "Estudante não vinculado" }, { status: 403 });
  }

  let resumo;
  try {
    resumo = await resumoParaFamilia({ studentId, workspaceId: session.workspace_id, familyId });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar estudante" }, { status: 500 });
  }
  if (!resumo) {
    return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
  }
  return NextResponse.json(resumo);
}
