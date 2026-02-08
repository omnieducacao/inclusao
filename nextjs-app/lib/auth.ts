import bcrypt from "bcryptjs";
import { getSupabase } from "./supabase";

export type UserRole = "master" | "member" | "platform_admin";

export type Member = {
  id: string;
  workspace_id: string;
  nome: string;
  email: string;
  can_estudantes: boolean;
  can_pei: boolean;
  can_paee: boolean;
  can_hub: boolean;
  can_diario: boolean;
  can_avaliacao: boolean;
  can_gestao: boolean;
  link_type: "todos" | "turma" | "tutor";
};

export type FindUserResult = {
  workspace_id: string;
  workspace_name: string;
  role: "master" | "member";
  user: Record<string, unknown>;
};

async function getWorkspaceName(workspaceId: string): Promise<string> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();
  return (data?.name as string) || "";
}

export async function findUserByEmail(email: string): Promise<FindUserResult | null> {
  const emailVal = (email || "").trim().toLowerCase();
  if (!emailVal) return null;

  const sb = getSupabase();

  const { data: master } = await sb
    .from("workspace_masters")
    .select("workspace_id, email, password_hash, nome")
    .eq("email", emailVal)
    .maybeSingle();

  if (master) {
    const wsName = await getWorkspaceName(master.workspace_id);
    return {
      workspace_id: master.workspace_id,
      workspace_name: wsName,
      role: "master",
      user: master,
    };
  }

  const { data: member } = await sb
    .from("workspace_members")
    .select(
      "id, workspace_id, nome, email, telefone, can_estudantes, can_pei, can_paee, can_hub, can_diario, can_avaliacao, can_gestao, link_type, terms_accepted"
    )
    .eq("email", emailVal)
    .eq("active", true)
    .maybeSingle();

  if (member) {
    const wsName = await getWorkspaceName(member.workspace_id);
    return {
      workspace_id: member.workspace_id,
      workspace_name: wsName,
      role: "member",
      user: member,
    };
  }

  return null;
}

export function verifyPassword(plain: string, hash: string): boolean {
  if (!plain || !hash) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export async function verifyWorkspaceMaster(
  workspaceId: string,
  email: string,
  password: string
): Promise<boolean> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workspace_masters")
    .select("email, password_hash")
    .eq("workspace_id", workspaceId)
    .eq("email", (email || "").trim().toLowerCase())
    .maybeSingle();

  if (!data?.password_hash) return false;
  return verifyPassword(password, data.password_hash);
}

export async function verifyMemberPassword(
  workspaceId: string,
  email: string,
  password: string
): Promise<boolean> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workspace_members")
    .select("password_hash")
    .eq("workspace_id", workspaceId)
    .eq("email", (email || "").trim().toLowerCase())
    .eq("active", true)
    .maybeSingle();

  if (!data?.password_hash) return true;
  return verifyPassword(password, data.password_hash);
}

export async function verifyPlatformAdmin(
  email: string,
  password: string
): Promise<boolean> {
  const sb = getSupabase();
  const { data } = await sb
    .from("platform_admins")
    .select("password_hash, active")
    .eq("email", (email || "").trim().toLowerCase())
    .maybeSingle();

  if (!data?.active || !data?.password_hash) return false;
  return verifyPassword(password, data.password_hash);
}
