import { parseBody, updateMemberSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  updateMember,
  deactivateMember,
  reactivateMember,
  deleteMember,
  getMemberPedagogicalImpact,
  getClassAssignments,
  getStudentLinks,
  membroDaEscola,
} from "@/lib/members";
import { requirePermission } from "@/lib/permissions";
import { auditar } from "@/lib/audit";

/** SCRUM-70: campos que mudam o que a pessoa pode abrir (entram como mudança de permissão). */
const CAMPOS_DE_ACESSO = ["papel", "can_estudantes", "can_pei", "can_pei_professor", "can_paee", "can_hub", "can_diario", "can_avaliacao", "can_gestao", "link_type", "teacher_assignments", "student_ids"] as const;

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

  if (!(await membroDaEscola(session.workspace_id, id))) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }

  const parsed = await parseBody(request, updateMemberSchema);


  if (parsed.error) return parsed.error;


  const body = parsed.data;
  const action = body?.action;

  if (action === "deactivate") {
    const ok = await deactivateMember(id);
    if (ok) await auditar(session, request, { action: "permission_change", resourceType: "membro", resourceId: id, metadata: { acao: "desativar" } });
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Erro ao desativar" }, { status: 500 });
  }
  if (action === "reactivate") {
    const ok = await reactivateMember(id);
    if (ok) await auditar(session, request, { action: "permission_change", resourceType: "membro", resourceId: id, metadata: { acao: "reativar" } });
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
  if (action === "impact") {
    const impact = await getMemberPedagogicalImpact(id);
    return NextResponse.json(impact);
  }

  const result = await updateMember(id, {
    nome: body.nome,
    email: body.email,
    password: body.password,
    telefone: body.telefone,
    cargo: body.cargo,
    papel: body.papel,
    can_estudantes: body.can_estudantes,
    can_pei: body.can_pei,
    can_pei_professor: body.can_pei_professor,
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
  // Só o nome dos campos e os valores de acesso (sim/não, papel); nunca nome, e-mail ou senha.
  const mudouAcesso = CAMPOS_DE_ACESSO.filter((c) => body[c] !== undefined);
  const outros = ["nome", "email", "password", "telefone", "cargo"].filter((c) => body[c as keyof typeof body] !== undefined);
  if (mudouAcesso.length) {
    const valores = Object.fromEntries(
      mudouAcesso.filter((c) => typeof body[c] === "boolean" || c === "papel" || c === "link_type").map((c) => [c, body[c]])
    );
    await auditar(session, request, { action: "permission_change", resourceType: "membro", resourceId: id, metadata: { campos: mudouAcesso.join(","), ...valores } });
  }
  if (outros.length) {
    await auditar(session, request, { action: "update", resourceType: "membro", resourceId: id, metadata: { campos: outros.map((c) => c === "password" ? "senha" : c).join(",") } });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
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

  if (!(await membroDaEscola(session.workspace_id, id))) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }

  const result = await deleteMember(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Erro ao excluir. Verifique se não há dados vinculados." },
      { status: 500 }
    );
  }
  await auditar(session, request, { action: "delete", resourceType: "membro", resourceId: id });
  return NextResponse.json({ ok: true });
}
