import bcrypt from "bcryptjs";
import { getSupabase } from "./supabase";

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  cargo?: string | null;
  can_estudantes: boolean;
  can_pei: boolean;
  can_paee: boolean;
  can_hub: boolean;
  can_diario: boolean;
  can_avaliacao: boolean;
  can_gestao: boolean;
  link_type: "todos" | "turma" | "tutor";
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type WorkspaceMaster = {
  workspace_id: string;
  email: string;
  nome: string;
  telefone?: string | null;
  cargo?: string | null;
};

export type CreateMemberInput = {
  nome: string;
  email: string;
  password: string;
  telefone?: string;
  cargo?: string;
  can_estudantes?: boolean;
  can_pei?: boolean;
  can_paee?: boolean;
  can_hub?: boolean;
  can_diario?: boolean;
  can_avaliacao?: boolean;
  can_gestao?: boolean;
  link_type?: "todos" | "turma" | "tutor";
  teacher_assignments?: { class_id: string; component_id: string }[];
  student_ids?: string[];
};

export type UpdateMemberInput = Partial<CreateMemberInput> & {
  password?: string; // vazio = não alterar
};

function hashPassword(plain: string): string | null {
  if (!plain || plain.length < 4) return null;
  try {
    return bcrypt.hashSync(plain, 10);
  } catch {
    return null;
  }
}

export async function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (!workspaceId) return [];

  const sb = getSupabase();
  const { data, error } = await sb
    .from("workspace_members")
    .select(
      "id,workspace_id,nome,email,telefone,cargo,can_estudantes,can_pei,can_paee,can_hub,can_diario,can_avaliacao,can_gestao,link_type,active,created_at,updated_at"
    )
    .eq("workspace_id", workspaceId)
    .order("nome", { ascending: true });

  if (error) {
    console.error("listMembers:", error);
    return [];
  }
  return (data || []) as WorkspaceMember[];
}

export async function getWorkspaceMaster(
  workspaceId: string
): Promise<WorkspaceMaster | null> {
  if (!workspaceId) return null;

  const sb = getSupabase();
  const { data, error } = await sb
    .from("workspace_masters")
    .select("workspace_id,email,nome,telefone,cargo")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) return null;
  return data as WorkspaceMaster;
}

export async function createWorkspaceMaster(
  workspaceId: string,
  email: string,
  password: string,
  nome: string,
  opts?: { telefone?: string; cargo?: string }
): Promise<{ error?: string }> {
  const ph = hashPassword(password);
  if (!ph || password.length < 4) {
    return { error: "Senha deve ter no mínimo 4 caracteres." };
  }

  const sb = getSupabase();
  const { error } = await sb.from("workspace_masters").insert({
    workspace_id: workspaceId,
    email: (email || "").trim().toLowerCase(),
    password_hash: ph,
    nome: (nome || "").trim(),
    telefone: (opts?.telefone || "").trim() || null,
    cargo: (opts?.cargo || "").trim() || null,
  });

  if (error) return { error: error.message };
  return {};
}

export async function createMember(
  workspaceId: string,
  input: CreateMemberInput
): Promise<{ member?: WorkspaceMember; error?: string }> {
  const { nome, email, password, link_type = "todos" } = input;
  if (!nome?.trim() || !email?.trim()) {
    return { error: "Nome e email são obrigatórios." };
  }
  if (!password || password.length < 4) {
    return { error: "Senha obrigatória com no mínimo 4 caracteres." };
  }

  const ph = hashPassword(password);
  if (!ph) return { error: "Erro ao gerar hash da senha." };

  const sb = getSupabase();
  const row = {
    workspace_id: workspaceId,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: (input.telefone || "").trim() || null,
    cargo: (input.cargo || "").trim() || null,
    password_hash: ph,
    can_estudantes: input.can_estudantes ?? false,
    can_pei: input.can_pei ?? false,
    can_paee: input.can_paee ?? false,
    can_hub: input.can_hub ?? false,
    can_diario: input.can_diario ?? false,
    can_avaliacao: input.can_avaliacao ?? false,
    can_gestao: input.can_gestao ?? false,
    link_type,
  };

  const { data, error } = await sb
    .from("workspace_members")
    .insert(row)
    .select("id,workspace_id,nome,email,telefone,cargo,can_estudantes,can_pei,can_paee,can_hub,can_diario,can_avaliacao,can_gestao,link_type,active,created_at,updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Este email já está em uso no workspace." };
    }
    return { error: error.message };
  }

  const member = data as WorkspaceMember;
  const memberId = member?.id;

  if (memberId && link_type === "turma" && input.teacher_assignments?.length) {
    for (const a of input.teacher_assignments) {
      if (a.class_id && a.component_id) {
        await sb.from("teacher_assignments").insert({
          workspace_member_id: memberId,
          class_id: a.class_id,
          component_id: a.component_id,
        });
      }
    }
  }
  if (memberId && link_type === "tutor" && input.student_ids?.length) {
    for (const sid of input.student_ids) {
      if (sid) {
        await sb.from("teacher_student_links").insert({
          workspace_member_id: memberId,
          student_id: sid,
        });
      }
    }
  }

  return { member };
}

export async function updateMember(
  memberId: string,
  input: UpdateMemberInput
): Promise<{ error?: string }> {
  const updates: Record<string, unknown> = {};

  if (input.nome != null) updates.nome = input.nome.trim();
  if (input.email != null) updates.email = input.email.trim().toLowerCase();
  if (input.telefone != null) updates.telefone = (input.telefone || "").trim() || null;
  if (input.cargo != null) updates.cargo = (input.cargo || "").trim() || null;
  if (input.can_estudantes != null) updates.can_estudantes = input.can_estudantes;
  if (input.can_pei != null) updates.can_pei = input.can_pei;
  if (input.can_paee != null) updates.can_paee = input.can_paee;
  if (input.can_hub != null) updates.can_hub = input.can_hub;
  if (input.can_diario != null) updates.can_diario = input.can_diario;
  if (input.can_avaliacao != null) updates.can_avaliacao = input.can_avaliacao;
  if (input.can_gestao != null) updates.can_gestao = input.can_gestao;
  if (input.link_type != null) updates.link_type = input.link_type;

  if (input.password && input.password.length >= 4) {
    const ph = hashPassword(input.password);
    if (ph) updates.password_hash = ph;
  }

  if (Object.keys(updates).length > 0) {
    const sb = getSupabase();
    const { error } = await sb
      .from("workspace_members")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", memberId);

    if (error) {
      if (error.code === "23505") return { error: "Este email já está em uso." };
      return { error: error.message };
    }
  }

  if (input.link_type === "turma" && input.teacher_assignments !== undefined) {
    const sb = getSupabase();
    await sb.from("teacher_assignments").delete().eq("workspace_member_id", memberId);
    for (const a of input.teacher_assignments) {
      if (a?.class_id && a?.component_id) {
        await sb.from("teacher_assignments").insert({
          workspace_member_id: memberId,
          class_id: a.class_id,
          component_id: a.component_id,
        });
      }
    }
  }
  if (input.link_type === "tutor" && input.student_ids !== undefined) {
    const sb = getSupabase();
    await sb.from("teacher_student_links").delete().eq("workspace_member_id", memberId);
    for (const sid of input.student_ids) {
      if (sid) {
        await sb.from("teacher_student_links").insert({
          workspace_member_id: memberId,
          student_id: sid,
        });
      }
    }
  }

  return {};
}

export async function deactivateMember(memberId: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb
    .from("workspace_members")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", memberId);
  return !error;
}

export async function reactivateMember(memberId: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb
    .from("workspace_members")
    .update({ active: true, updated_at: new Date().toISOString() })
    .eq("id", memberId);
  return !error;
}

export async function deleteMember(memberId: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb.from("workspace_members").delete().eq("id", memberId);
  return !error;
}

export async function getClassAssignments(memberId: string): Promise<
  { grade?: string; grade_label?: string; class_group?: string; class_id?: string }[]
> {
  const sb = getSupabase();
  const { data } = await sb
    .from("teacher_assignments")
    .select("class_id, component_id, classes(class_group, grades(code, label))")
    .eq("workspace_member_id", memberId);

  if (!Array.isArray(data)) return [];
  const pairs: { grade?: string; grade_label?: string; class_group?: string; class_id?: string }[] = [];
  const seen = new Set<string>();
  for (const row of data) {
    const r = row as {
      class_id?: string;
      component_id?: string;
      classes?: { class_group?: string; grades?: { code?: string; label?: string } };
    };
    const cls = r.classes ?? {};
    const gr = cls.grades ?? {};
    const code = String(gr?.code ?? "").trim();
    const label = String(gr?.label ?? "").trim();
    const cg = String(cls?.class_group ?? "").trim();
    const classId = r.class_id ?? "";
    if ((code || label) && cg) {
      const key = `${classId}-${r.component_id ?? ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ grade: code, grade_label: label, class_group: cg, class_id: classId });
      }
    }
  }
  return pairs;
}

export async function getStudentLinks(memberId: string): Promise<string[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("teacher_student_links")
    .select("student_id")
    .eq("workspace_member_id", memberId);

  if (!Array.isArray(data)) return [];
  return (data as { student_id?: string }[])
    .map((x) => x.student_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}
