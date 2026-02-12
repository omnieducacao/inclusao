import { parseBody, studentPatchDataSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getStudent,
  updateStudentPeiData,
} from "@/lib/students";
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
    student: { id: student.id, name: student.name, grade: student.grade, class_group: student.class_group },
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

  const denied = requirePermission(session, "can_pei");
  if (denied) return denied;

  const { id } = await params;
  const parsed = await parseBody(req, studentPatchDataSchema);

  if (parsed.error) return parsed.error;

  const body = parsed.data;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const ok = await updateStudentPeiData(
    session.workspace_id,
    id,
    body as Record<string, unknown>
  );
  if (!ok) {
    return NextResponse.json(
      { error: "Erro ao salvar PEI." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
