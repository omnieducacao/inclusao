import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const workspaceId = session?.workspace_id;
    if (!workspaceId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, rubric_data, observation } = body as {
      student_id?: string;
      rubric_data?: Record<string, string>;
      observation?: string;
    };

    if (!student_id) {
      return NextResponse.json(
        { error: "student_id obrigatório" },
        { status: 400 }
      );
    }

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
      console.error("monitoring_assessments insert:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao salvar avaliação" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("POST /api/monitoring/assessment:", err);
    return NextResponse.json(
      { error: "Erro interno ao salvar avaliação" },
      { status: 500 }
    );
  }
}
