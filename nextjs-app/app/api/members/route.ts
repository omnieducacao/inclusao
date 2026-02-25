import { NextRequest, NextResponse } from "next/server";
import { parseBody, createMemberSchema } from "@/lib/validation";
import { getSession } from "@/lib/session";
import {
  listMembers,
  createMember,
  getWorkspaceMaster,
  createWorkspaceMaster,
} from "@/lib/members";
import { requirePermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const master = searchParams.get("master");

  if (master === "1") {
    const m = await getWorkspaceMaster(workspaceId);
    return NextResponse.json({ master: m });
  }

  const members = await listMembers(workspaceId);
  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const denied = requirePermission(session, "can_gestao");
  if (denied) return denied;

  const body = await request.json();

  if (body?.action === "create_master") {
    const { nome, email, password, telefone, cargo } = body;
    if (!nome?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      );
    }
    const result = await createWorkspaceMaster(
      workspaceId,
      email.trim(),
      password,
      nome.trim(),
      { telefone, cargo }
    );
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    await createMember(workspaceId, {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      password,
      telefone: telefone ?? "",
      cargo: cargo ?? "",
      can_estudantes: true,
      can_pei: true,
      can_pei_professor: true,
      can_paee: true,
      can_hub: true,
      can_diario: true,
      can_avaliacao: true,
      can_gestao: true,
      link_type: "todos",
    });
    return NextResponse.json({ ok: true });
  }

  const result = await createMember(workspaceId, {
    nome: body.nome ?? "",
    email: body.email ?? "",
    password: body.password ?? "",
    telefone: body.telefone ?? "",
    cargo: body.cargo ?? "",
    can_estudantes: body.can_estudantes ?? false,
    can_pei: body.can_pei ?? false,
    can_pei_professor: body.can_pei_professor ?? false,
    can_paee: body.can_paee ?? false,
    can_hub: body.can_hub ?? false,
    can_diario: body.can_diario ?? false,
    can_avaliacao: body.can_avaliacao ?? false,
    can_gestao: body.can_gestao ?? false,
    link_type: body.link_type ?? "todos",
    teacher_assignments: body.teacher_assignments,
    student_ids: body.student_ids,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ member: result.member });
}
