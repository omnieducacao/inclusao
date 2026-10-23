import { parseBody, studentPatchDataSchema } from "@/lib/validation";
import { negadoForaDoVinculo, resolverTurma } from "@/lib/turmas";
import { NextResponse } from "next/server";
import { auditar } from "@/lib/audit";
import { getSession } from "@/lib/session";
import { getStudent, deleteStudent, updateStudent } from "@/lib/students";
import { requirePermission, requireStaff } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const soEquipe = requireStaff(session);
  if (soEquipe) return soEquipe;

  const { id } = await params;
  const foraDoVinculo = await negadoForaDoVinculo(session, id);
  if (foraDoVinculo) return foraDoVinculo;
  const student = await getStudent(session.workspace_id, id);
  if (!student) {
    return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });
  }

  await auditar(session, req, { action: "view", resourceType: "pei", resourceId: id });
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
  const foraDoVinculo = await negadoForaDoVinculo(session, id);
  if (foraDoVinculo) return foraDoVinculo;
  const parsed = await parseBody(req, studentPatchDataSchema);

  if (parsed.error) return parsed.error;

  const body = parsed.data;
  const grade = body.grade as string | null | undefined;
  const classGroup = body.class_group as string | null | undefined;

  // Onda 1: se mudou série ou turma, religa o estudante à turma cadastrada
  let class_id: string | null | undefined;
  if (grade !== undefined || classGroup !== undefined) {
    const atual = await getStudent(session.workspace_id, id);
    class_id = await resolverTurma(
      session.workspace_id,
      grade !== undefined ? grade : atual?.grade,
      classGroup !== undefined ? classGroup : atual?.class_group
    );
  }

  const result = await updateStudent(session.workspace_id, id, {
    name: body.name as string | undefined,
    grade,
    class_group: classGroup,
    class_id,
    diagnosis: body.diagnosis as string | null | undefined,
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
  const foraDoVinculo = await negadoForaDoVinculo(session, id);
  if (foraDoVinculo) return foraDoVinculo;
  const result = await deleteStudent(session.workspace_id, id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Erro ao excluir estudante." },
      { status: 500 }
    );
  }

  await auditar(session, req, { action: "delete", resourceType: "estudante", resourceId: id });
  return NextResponse.json({ ok: true });
}
