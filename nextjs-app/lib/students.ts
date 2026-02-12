import { getSupabase } from "./supabase";
import { logger } from "./logger";

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
  paee_data?: Record<string, unknown> | null;
  daily_logs?: unknown[];
  created_at?: string;
};

export async function listStudents(workspaceId: string): Promise<Student[]> {
  if (!workspaceId) {
    logger.error("listStudents: workspaceId ausente");
    return [];
  }

  const sb = getSupabase();
  logger.debug("listStudents: buscando estudantes", { workspaceId });
  
  const { data, error } = await sb
    .from("students")
    .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("listStudents: erro ao buscar", { 
      workspaceId,
      errorMessage: error.message,
      errorCode: error.code
    });
    return [];
  }
  
  logger.debug("listStudents: encontrados", { 
    count: data?.length || 0,
    workspaceId
  });
  
  return (data || []) as Student[];
}

export async function getStudent(
  workspaceId: string,
  studentId: string
): Promise<Student | null> {
  try {
    if (!workspaceId || !studentId) {
      logger.error("getStudent: workspaceId ou studentId ausente");
      return null;
    }

    const sb = getSupabase();
    
    logger.debug("getStudent: buscando", { workspaceId, studentId });
    
    // Normalizar IDs (remover espaços e garantir formato correto)
    const normalizedWorkspaceId = workspaceId.trim();
    const normalizedStudentId = studentId.trim();
    
    const { data, error } = await sb
      .from("students")
      .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, paee_data, daily_logs, created_at")
      .eq("workspace_id", normalizedWorkspaceId)
      .eq("id", normalizedStudentId)
      .maybeSingle();

    if (error) {
      // Melhorar o tratamento de erro para garantir que sempre mostre informações úteis
      let errorMessage = "Erro desconhecido";
      let errorDetails = "Sem detalhes";
      let errorHint = "Sem dica";
      let errorCode = "Sem código";
      
      try {
        // Tentar extrair informações do erro de forma segura
        if (error && typeof error === 'object') {
          errorMessage = (error as any)?.message || String(error) || "Sem mensagem";
          errorDetails = (error as any)?.details || "Sem detalhes";
          errorHint = (error as any)?.hint || "Sem dica";
          errorCode = (error as any)?.code || "Sem código";
        } else {
          errorMessage = String(error);
        }
      } catch (e) {
        errorMessage = "Erro ao processar informações do erro";
      }
      
      const errorInfo = {
        workspaceId: normalizedWorkspaceId, 
        studentId: normalizedStudentId,
        errorMessage,
        errorDetails,
        errorHint,
        errorCode,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name || "Unknown"
      };
      
      logger.error("getStudent: erro ao buscar", { 
        errorCode,
        errorMessage 
      });
      
      return null;
    }
    
    if (!data) {
      logger.debug("getStudent: estudante não encontrado");
      return null;
    }
    
    logger.debug("getStudent: encontrado", { studentId: data.id });
    
    return data as Student;
  } catch (err) {
    // Capturar qualquer erro inesperado que possa ocorrer
    let errorMessage = "Erro desconhecido";
    let errorStack: string | undefined = undefined;
    
    try {
      if (err instanceof Error) {
        errorMessage = err.message || "Erro sem mensagem";
        errorStack = err.stack;
      } else {
        errorMessage = String(err);
      }
    } catch (e) {
      errorMessage = "Erro ao processar exceção";
    }
    
    const errorInfo = {
      workspaceId: workspaceId || "NULL",
      studentId: studentId || "NULL",
      errorType: typeof err,
      errorMessage,
      errorStack: errorStack?.substring(0, 200) // Limitar tamanho do stack trace
    };
    
    logger.error("getStudent: erro inesperado", { errorMessage });
    return null;
  }
}

export async function updateStudent(
  workspaceId: string,
  studentId: string,
  updates: {
    name?: string;
    grade?: string | null;
    class_group?: string | null;
    diagnosis?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.grade !== undefined) payload.grade = updates.grade;
  if (updates.class_group !== undefined) payload.class_group = updates.class_group;
  if (updates.diagnosis !== undefined) payload.diagnosis = updates.diagnosis;

  const { error } = await sb
    .from("students")
    .update(payload)
    .eq("id", studentId)
    .eq("workspace_id", workspaceId);

  if (error) return { success: false, error: error.message };
  return { success: true };
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
    paee_data?: Record<string, unknown> | null;
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
  if (extra?.paee_data !== undefined) payload.paee_data = extra.paee_data;

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

export async function deleteStudent(
  workspaceId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  if (!workspaceId || !studentId) {
    return { success: false, error: "workspaceId e studentId são obrigatórios" };
  }

  const sb = getSupabase();
  const { error } = await sb
    .from("students")
    .delete()
    .eq("id", studentId)
    .eq("workspace_id", workspaceId);

  if (error) {
    logger.error("deleteStudent: erro", { workspaceId, studentId, errorCode: error.code });
    return { success: false, error: error.message };
  }

  logger.debug("deleteStudent: estudante excluído", { studentId, workspaceId });
  return { success: true };
}
