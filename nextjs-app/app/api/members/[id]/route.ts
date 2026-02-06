import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import {
  updateMember,
  deactivateMember,
  reactivateMember,
  deleteMember,
  getClassAssignments,
  getStudentLinks,
} from "@/lib/members";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

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

  // Validar que só pode atribuir permissões de módulos liberados pelo admin
  const sb = getSupabase();
  const { data: workspace } = await sb
    .from("workspaces")
    .select("enabled_modules")
    .eq("id", session.workspace_id)
    .single();

  const enabledModules = (workspace?.enabled_modules as string[]) || [];
  
  // Filtrar permissões para incluir apenas módulos liberados
  // Estudantes sempre disponível (não precisa estar em enabled_modules)
  const filteredPerms: Record<string, boolean | undefined> = {
    can_estudantes: body.can_estudantes,
  };
  if (enabledModules.includes("pei")) filteredPerms.can_pei = body.can_pei;
  if (enabledModules.includes("paee")) filteredPerms.can_paee = body.can_paee;
  if (enabledModules.includes("hub")) filteredPerms.can_hub = body.can_hub;
  if (enabledModules.includes("diario")) filteredPerms.can_diario = body.can_diario;
  if (enabledModules.includes("avaliacao")) filteredPerms.can_avaliacao = body.can_avaliacao;
  // Gestão sempre disponível para master (não precisa estar em enabled_modules)
  filteredPerms.can_gestao = body.can_gestao;

  const result = await updateMember(id, {
    nome: body.nome,
    email: body.email,
    password: body.password,
    telefone: body.telefone,
    cargo: body.cargo,
    ...filteredPerms,
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

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const ok = await deleteMember(id);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
}
