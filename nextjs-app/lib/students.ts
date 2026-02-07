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
  paee_data?: Record<string, unknown> | null;
  daily_logs?: unknown[];
  created_at?: string;
};

export async function listStudents(workspaceId: string): Promise<Student[]> {
  if (!workspaceId) {
    console.error("❌ listStudents: workspaceId ausente");
    return [];
  }

  const sb = getSupabase();
  console.log("🔍 listStudents: buscando estudantes", { workspaceId });
  
  const { data, error } = await sb
    .from("students")
    .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ listStudents error:", error, { 
      workspaceId,
      errorMessage: error.message,
      errorDetails: error.details
    });
    return [];
  }
  
  if (data) {
    console.log(`✅ listStudents: encontrados ${data.length} estudantes para workspace ${workspaceId}`, {
      studentIds: data.map(s => s.id),
      studentNames: data.map(s => s.name)
    });
  } else {
    console.warn("⚠️ listStudents: nenhum estudante encontrado", { workspaceId });
  }
  
  return (data || []) as Student[];
}

export async function getStudent(
  workspaceId: string,
  studentId: string
): Promise<Student | null> {
  try {
    if (!workspaceId || !studentId) {
      console.error("❌ getStudent: workspaceId ou studentId ausente", { 
        workspaceId: workspaceId || "NULL", 
        studentId: studentId || "NULL",
        workspaceIdType: typeof workspaceId,
        studentIdType: typeof studentId
      });
      return null;
    }

    const sb = getSupabase();
    
    // Log da query que será executada
    console.log("🔍 getStudent: buscando estudante", { 
      workspaceId, 
      studentId,
      workspaceIdLength: workspaceId?.length,
      studentIdLength: studentId?.length,
      workspaceIdTrimmed: workspaceId?.trim(),
      studentIdTrimmed: studentId?.trim()
    });
    
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
      const errorInfo = {
        workspaceId: normalizedWorkspaceId, 
        studentId: normalizedStudentId,
        errorMessage: error?.message || "Sem mensagem de erro",
        errorDetails: error?.details || "Sem detalhes",
        errorHint: error?.hint || "Sem dica",
        errorCode: error?.code || "Sem código",
        errorString: JSON.stringify(error, null, 2),
        errorKeys: error ? Object.keys(error) : [],
        errorType: typeof error,
        errorConstructor: error?.constructor?.name || "Unknown"
      };
      console.error("❌ getStudent error:", errorInfo);
      return null;
    }
    
    if (!data) {
      console.error("⚠️ getStudent: estudante não encontrado com filtros workspace_id + id", { 
        workspaceId: normalizedWorkspaceId, 
        studentId: normalizedStudentId,
        originalWorkspaceId: workspaceId,
        originalStudentId: studentId
      });
      
      // Tentar buscar sem filtro de workspace para debug
      const { data: debugData, error: debugError } = await sb
        .from("students")
        .select("id, workspace_id, name")
        .eq("id", normalizedStudentId)
        .maybeSingle();
        
      if (debugError) {
        console.error("❌ getStudent: erro ao buscar estudante para debug", { 
          error: debugError,
          studentId: normalizedStudentId 
        });
      } else if (debugData) {
        console.error("⚠️ getStudent: estudante EXISTE mas com workspace_id DIFERENTE", {
          estudante_workspace: debugData.workspace_id,
          sessao_workspace: normalizedWorkspaceId,
          studentId: normalizedStudentId,
          studentName: debugData.name,
          mismatch: debugData.workspace_id !== normalizedWorkspaceId,
          workspaceIdsEqual: debugData.workspace_id === normalizedWorkspaceId,
          workspaceIdTypes: {
            estudante: typeof debugData.workspace_id,
            sessao: typeof normalizedWorkspaceId
          }
        });
      } else {
        console.error("❌ getStudent: estudante NÃO EXISTE no banco de dados", { 
          studentId: normalizedStudentId,
          originalStudentId: studentId
        });
      }
      
      return null;
    }
    
    console.log("✅ getStudent: estudante encontrado", { 
      studentId: data.id, 
      name: data.name,
      workspaceId: data.workspace_id 
    });
    
    return data as Student;
  } catch (err) {
    // Capturar qualquer erro inesperado que possa ocorrer
    const errorInfo = {
      workspaceId: workspaceId || "NULL",
      studentId: studentId || "NULL",
      errorType: typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
      errorString: JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
    };
    console.error("❌ getStudent: erro inesperado capturado:", errorInfo);
    return null;
  }
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
    console.error("❌ deleteStudent error:", error, { workspaceId, studentId });
    return { success: false, error: error.message };
  }

  console.log("✅ deleteStudent: estudante excluído", { studentId, workspaceId });
  return { success: true };
}
