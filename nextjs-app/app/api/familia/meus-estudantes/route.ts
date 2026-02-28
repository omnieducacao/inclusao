import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/familia/meus-estudantes
 * Retorna os estudantes vinculados ao responsável logado.
 * Apenas para user_role === "family".
 */
export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role !== "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const familyId = session.family_responsible_id;
  if (!familyId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const sb = getSupabase();

  const { data: links, error: linksError } = await sb
    .from("family_student_links")
    .select("student_id")
    .eq("family_responsible_id", familyId);

  if (linksError || !links?.length) {
    return NextResponse.json({ estudantes: [] });
  }

  const studentIds = links.map((l) => l.student_id);

  const { data: students, error: studentsError } = await sb
    .from("students")
    .select("id, name, grade, class_group")
    .in("id", studentIds)
    .eq("workspace_id", session.workspace_id);

  if (studentsError) {
    return NextResponse.json({ error: studentsError.message }, { status: 500 });
  }

  return NextResponse.json({
    estudantes: (students || []).map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      class_group: s.class_group,
    })),
  });
}
