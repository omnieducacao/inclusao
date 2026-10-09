import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getClassAssignments, membroDaEscola } from "@/lib/members";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await membroDaEscola(session.workspace_id, id))) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }
  const assignments = await getClassAssignments(id);
  return NextResponse.json({ assignments });
}
