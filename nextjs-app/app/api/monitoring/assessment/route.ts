import { NextRequest, NextResponse } from "next/server";
import { parseBody, assessmentSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/permissions";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const workspaceId = session?.workspace_id;
    if (!workspaceId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const denied = requirePermission(session, "can_monitoramento");
    if (denied) return denied;

    const parsed = await parseBody(request, assessmentSchema);
    if (parsed.error) return parsed.error;
    const { student_id, rubric_data, observation } = parsed.data;

    const sb = getSupabase();
    const { data, error } = await sb
      .from("monitoring_assessments")
      .insert({
        workspace_id: workspaceId,
        student_id,
        evaluator_id:
          (session?.member as { id?: string })?.id ??
          session?.usuario_nome ??
          "anon",
        rubric_data: rubric_data ?? {},
        observation: observation ?? null,
      })
      .select("id")
      .single();

    if (error) {
      logger.error({ err: error }, "monitoring_assessments insert:");
      return NextResponse.json(
        { error: error.message || "Erro ao salvar avaliação" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    logger.error({ err: err }, "POST /api/monitoring/assessment:");
    return NextResponse.json(
      { error: "Erro interno ao salvar avaliação" },
      { status: 500 }
    );
  }
}
