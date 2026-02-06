import { getSupabase } from "./supabase";

export type Student = {
  id: string;
  workspace_id: string;
  name: string;
  grade: string | null;
  class_group: string | null;
  diagnosis: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: unknown[];
  planejamento_ativo?: string | null;
  daily_logs?: unknown[];
  created_at?: string;
};

export async function listStudents(workspaceId: string): Promise<Student[]> {
  if (!workspaceId) return [];

  const sb = getSupabase();
  const { data, error } = await sb
    .from("students")
    .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listStudents error:", error);
    return [];
  }
  return (data || []) as Student[];
}

export async function getStudent(
  workspaceId: string,
  studentId: string
): Promise<Student | null> {
  if (!workspaceId || !studentId) return null;

  const sb = getSupabase();
  const { data, error } = await sb
    .from("students")
    .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, daily_logs, created_at")
    .eq("workspace_id", workspaceId)
    .eq("id", studentId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Student;
}

export async function updateStudentPeiData(
  workspaceId: string,
  studentId: string,
  peiData: Record<string, unknown>
): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb
    .from("students")
    .update({
      pei_data: peiData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId)
    .eq("workspace_id", workspaceId);

  return !error;
}

export async function updateStudentPaeeCiclos(
  workspaceId: string,
  studentId: string,
  paeeCiclos: unknown[],
  planejamentoAtivo?: string | null,
  extra?: {
    status_planejamento?: string;
    data_inicio_ciclo?: string | null;
    data_fim_ciclo?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  const payload: Record<string, unknown> = {
    paee_ciclos: paeeCiclos,
    updated_at: new Date().toISOString(),
  };
  if (planejamentoAtivo !== undefined) payload.planejamento_ativo = planejamentoAtivo;
  if (extra?.status_planejamento !== undefined) payload.status_planejamento = extra.status_planejamento;
  if (extra?.data_inicio_ciclo !== undefined) payload.data_inicio_ciclo = extra.data_inicio_ciclo;
  if (extra?.data_fim_ciclo !== undefined) payload.data_fim_ciclo = extra.data_fim_ciclo;

  const { error } = await sb
    .from("students")
    .update(payload)
    .eq("id", studentId)
    .eq("workspace_id", workspaceId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateStudentDailyLogs(
  workspaceId: string,
  studentId: string,
  dailyLogs: unknown[]
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  const { error } = await sb
    .from("students")
    .update({
      daily_logs: dailyLogs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId)
    .eq("workspace_id", workspaceId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
