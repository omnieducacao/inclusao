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

export async function listStudents(
  workspaceId: string,
  filters?: {
    link_type?: "todos" | "turma" | "tutor";
    member_id?: string;
    component_id?: string; // Para filtrar por disciplina quando necessário
  }
): Promise<Student[]> {
  if (!workspaceId) return [];

  const sb = getSupabase();
  let query = sb
    .from("students")
    .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, created_at")
    .eq("workspace_id", workspaceId);

  // Aplicar filtros baseados no vínculo do professor
  if (filters?.link_type === "turma" && filters?.member_id) {
    // Professor vinculado a turmas: buscar suas turmas e filtrar estudantes
    const { getClassAssignments } = await import("./members");
    const assignments = await getClassAssignments(filters.member_id);
    
    if (assignments.length > 0) {
      // Extrair class_group e grade das turmas do professor
      const classGroups = new Set<string>();
      const grades = new Set<string>();
      
      for (const a of assignments) {
        if (a.class_group) classGroups.add(a.class_group);
        if (a.grade) grades.add(a.grade);
      }
      
      const classGroupsArray = Array.from(classGroups);
      const gradesArray = Array.from(grades);
      
      // Filtrar estudantes que estão nas mesmas turmas/séries do professor
      // IMPORTANTE: Estudante deve ter PEI criado (PEI é o centro de tudo)
      query = query.not("pei_data", "is", null);
      
      if (classGroupsArray.length > 0 && gradesArray.length > 0) {
        // Filtrar por turma E série (ambos devem corresponder)
        query = query.in("class_group", classGroupsArray).in("grade", gradesArray);
      } else if (classGroupsArray.length > 0) {
        query = query.in("class_group", classGroupsArray);
      } else if (gradesArray.length > 0) {
        query = query.in("grade", gradesArray);
      } else {
        // Sem turmas/séries válidas, retorna vazio
        return [];
      }
    } else {
      // Professor sem turmas vinculadas, retorna vazio
      return [];
    }
  } else if (filters?.link_type === "tutor" && filters?.member_id) {
    // Professor tutor: só vê estudantes vinculados diretamente
    const { getStudentLinks } = await import("./members");
    const studentIds = await getStudentLinks(filters.member_id);
    
    if (studentIds.length > 0) {
      query = query.in("id", studentIds);
    } else {
      // Sem vínculos, retorna vazio
      return [];
    }
  }
  // Se link_type === "todos" ou não especificado, retorna todos (sem filtro)

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("listStudents error:", error);
    return [];
  }
  
  let students = (data || []) as Student[];

  // Filtro adicional: se é vínculo por turma, garantir que o estudante tem PEI válido
  if (filters?.link_type === "turma") {
    students = students.filter((s) => {
      if (!s.pei_data || Object.keys(s.pei_data).length === 0) return false;
      
      // Se há filtro por disciplina, verificar se o PEI tem habilidades dessa disciplina
      if (filters?.component_id) {
        const pei = s.pei_data as Record<string, unknown>;
        const habilidades = (pei.habilidades_bncc_selecionadas || []) as Array<{ disciplina?: string }>;
        return habilidades.some((h) => h.disciplina === filters.component_id);
      }
      
      return true;
    });
  }

  return students;
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

export async function createStudent(
  workspaceId: string,
  data: {
    name: string;
    grade?: string | null;
    class_group?: string | null;
    diagnosis?: string | null;
    birth_date?: string | null;
    pei_data?: Record<string, unknown>;
  }
): Promise<Student | null> {
  if (!workspaceId || !data.name?.trim()) return null;

  const sb = getSupabase();
  const payload: Record<string, unknown> = {
    workspace_id: workspaceId,
    name: data.name.trim(),
    grade: data.grade || null,
    class_group: data.class_group || null,
    diagnosis: data.diagnosis || null,
    birth_date: data.birth_date || null,
    pei_data: data.pei_data || {},
  };

  const { data: student, error } = await sb
    .from("students")
    .insert(payload)
    .select()
    .single();

  if (error || !student) {
    console.error("createStudent error:", error);
    return null;
  }
  return student as Student;
}

export async function updateStudentPeiData(
  workspaceId: string,
  studentId: string,
  peiData: Record<string, unknown>
): Promise<boolean> {
  const sb = getSupabase();
  
  // Atualiza também os campos básicos se estiverem no peiData
  const updatePayload: Record<string, unknown> = {
    pei_data: peiData,
    updated_at: new Date().toISOString(),
  };
  
  // Se o peiData tem nome, série, turma, diagnóstico, atualiza também na tabela
  if (peiData.nome) updatePayload.name = peiData.nome;
  if (peiData.serie !== undefined) updatePayload.grade = peiData.serie || null;
  if (peiData.turma !== undefined) updatePayload.class_group = peiData.turma || null;
  if (peiData.diagnostico !== undefined) updatePayload.diagnosis = peiData.diagnostico || null;
  if (peiData.nasc) updatePayload.birth_date = peiData.nasc;

  const { error } = await sb
    .from("students")
    .update(updatePayload)
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
