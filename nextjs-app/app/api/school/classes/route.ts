import { NextRequest, NextResponse } from "next/server";
import { parseBody, createClassSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";
import { listClasses, createClass } from "@/lib/school";
import { requirePermission } from "@/lib/permissions";

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

  const denied = requirePermission(session, "can_config");
  if (denied) return denied;

  const parsed = await parseBody(request, createClassSchema);
  if (parsed.error) return parsed.error;
  const { school_year_id, grade_id, class_group } = parsed.data;

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
