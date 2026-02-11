import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStudent, deleteStudent, updateStudent } from "@/lib/students";
import { requirePermission } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const student = await getStudent(session.workspace_id, id);
  if (!student) {
    return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    id: student.id,
    name: student.name,
    grade: student.grade,
    class_group: student.class_group,
    pei_data: (student.pei_data as Record<string, unknown>) || {},
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const denied = requirePermission(session, "can_estudantes");
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();
  const { name, grade, class_group, diagnosis } = body;

  const result = await updateStudent(session.workspace_id, id, {
    name,
    grade,
    class_group,
    diagnosis,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Erro ao atualizar estudante." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const denied = requirePermission(session, "can_estudantes");
  if (denied) return denied;

  const { id } = await params;
  const result = await deleteStudent(session.workspace_id, id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Erro ao excluir estudante." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
