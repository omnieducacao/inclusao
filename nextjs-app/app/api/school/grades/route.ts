import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  listGrades,
  listWorkspaceGrades,
  listGradesForWorkspace,
  setWorkspaceGrades,
} from "@/lib/school";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const segmentId = searchParams.get("segment_id") || undefined;
  const forWorkspace = searchParams.get("for_workspace") === "1";

  if (forWorkspace) {
    const grades = await listGradesForWorkspace(workspaceId, segmentId);
    const selectedIds = await listWorkspaceGrades(workspaceId);
    return NextResponse.json({ grades, selected_ids: selectedIds });
  }

  const grades = await listGrades(segmentId);
  const selectedIds = await listWorkspaceGrades(workspaceId);
  return NextResponse.json({ grades, selected_ids: selectedIds });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const gradeIds = Array.isArray(body?.grade_ids) ? body.grade_ids : [];
  const valid = gradeIds.filter((id: unknown) => typeof id === "string");

  const result = await setWorkspaceGrades(workspaceId, valid);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
