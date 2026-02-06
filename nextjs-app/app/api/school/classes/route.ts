import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listClasses, createClass } from "@/lib/school";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const schoolYearId = searchParams.get("school_year_id") || undefined;
  const gradeId = searchParams.get("grade_id") || undefined;

  const classes = await listClasses(workspaceId, schoolYearId, gradeId);
  return NextResponse.json({ classes });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { school_year_id, grade_id, class_group } = body ?? {};
  if (
    typeof school_year_id !== "string" ||
    typeof grade_id !== "string" ||
    !school_year_id ||
    !grade_id
  ) {
    return NextResponse.json(
      { error: "school_year_id e grade_id são obrigatórios" },
      { status: 400 }
    );
  }

  const result = await createClass(
    workspaceId,
    school_year_id,
    grade_id,
    class_group ?? "A"
  );
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
