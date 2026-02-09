import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStudentLinks } from "@/lib/members";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const studentIds = await getStudentLinks(id);
  return NextResponse.json({ student_ids: studentIds });
}
