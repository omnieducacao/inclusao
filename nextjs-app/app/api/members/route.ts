import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import {
  listMembers,
  createMember,
  getWorkspaceMaster,
  createWorkspaceMaster,
} from "@/lib/members";

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
      can_paee: true,
      can_hub: true,
      can_diario: true,
      can_avaliacao: true,
      can_gestao: true,
      link_type: "todos",
    });
    return NextResponse.json({ ok: true });
  }

  // Validar que só pode atribuir permissões de módulos liberados pelo admin
  const sb = getSupabase();
  const { data: workspace } = await sb
    .from("workspaces")
    .select("enabled_modules")
    .eq("id", workspaceId)
    .single();

  const enabledModules = (workspace?.enabled_modules as string[]) || [];
  
  // Filtrar permissões para incluir apenas módulos liberados
  // Estudantes sempre disponível (não precisa estar em enabled_modules)
  const filteredPerms: Record<string, boolean> = {
    can_estudantes: body.can_estudantes ?? false,
  };
  if (enabledModules.includes("pei")) filteredPerms.can_pei = body.can_pei ?? false;
  if (enabledModules.includes("paee")) filteredPerms.can_paee = body.can_paee ?? false;
  if (enabledModules.includes("hub")) filteredPerms.can_hub = body.can_hub ?? false;
  if (enabledModules.includes("diario")) filteredPerms.can_diario = body.can_diario ?? false;
  if (enabledModules.includes("avaliacao")) filteredPerms.can_avaliacao = body.can_avaliacao ?? false;
  // Gestão sempre disponível para master (não precisa estar em enabled_modules)
  filteredPerms.can_gestao = body.can_gestao ?? false;

  const result = await createMember(workspaceId, {
    nome: body.nome ?? "",
    email: body.email ?? "",
    password: body.password ?? "",
    telefone: body.telefone ?? "",
    cargo: body.cargo ?? "",
    ...filteredPerms,
    link_type: body.link_type ?? "todos",
    teacher_assignments: body.teacher_assignments,
    student_ids: body.student_ids,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ member: result.member });
}
