import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  updateMember,
  deactivateMember,
  reactivateMember,
  deleteMember,
  getClassAssignments,
  getStudentLinks,
} from "@/lib/members";
import { requirePermission } from "@/lib/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const denied = requirePermission(session, "can_gestao");
  if (denied) return denied;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const body = await request.json();
  const action = body?.action;

  if (action === "deactivate") {
    const ok = await deactivateMember(id);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Erro ao desativar" }, { status: 500 });
  }
  if (action === "reactivate") {
    const ok = await reactivateMember(id);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Erro ao reativar" }, { status: 500 });
  }
  if (action === "assignments") {
    const [assignments, studentIds] = await Promise.all([
      getClassAssignments(id),
      getStudentLinks(id),
    ]);
    return NextResponse.json({ assignments, student_ids: studentIds });
  }

  const result = await updateMember(id, {
    nome: body.nome,
    email: body.email,
    password: body.password,
    telefone: body.telefone,
    cargo: body.cargo,
    can_estudantes: body.can_estudantes,
    can_pei: body.can_pei,
    can_paee: body.can_paee,
    can_hub: body.can_hub,
    can_diario: body.can_diario,
    can_avaliacao: body.can_avaliacao,
    can_gestao: body.can_gestao,
    link_type: body.link_type,
    teacher_assignments: body.teacher_assignments,
    student_ids: body.student_ids,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const denied2 = requirePermission(session, "can_gestao");
  if (denied2) return denied2;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const ok = await deleteMember(id);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
}
