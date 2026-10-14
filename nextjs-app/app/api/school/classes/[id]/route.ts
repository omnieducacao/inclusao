import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { deleteClass } from "@/lib/school";
import { requirePermission } from "@/lib/permissions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // só a gestão remove turma, e só da própria escola (antes: qualquer sessão, qualquer escola)
  const denied = requirePermission(session, "can_gestao");
  if (denied) return denied;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const ok = await deleteClass(id, session.workspace_id);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Erro ao remover turma" }, { status: 500 });
}
