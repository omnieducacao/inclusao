import { getSupabase } from "./supabase";

export const SEGMENTS = [
  { id: "EI", label: "Educação Infantil" },
  { id: "EFAI", label: "EF - Anos Iniciais (1º ao 5º)" },
  { id: "EFAF", label: "EF - Anos Finais (6º ao 9º)" },
  { id: "EM", label: "Ensino Médio" },
] as const;

export type SchoolYear = { id: string; year: number; name: string; active?: boolean };
export type Grade = { id: string; code: string; label: string; segment_id?: string };
export type ClassRow = {
  id: string;
  class_group: string;
  grade_id?: string;
  school_year_id?: string;
  grades?: { code?: string; label?: string };
};
export type Component = { id: string; label: string };

export async function listSchoolYears(workspaceId: string): Promise<SchoolYear[]> {
  if (!workspaceId) return [];
  const sb = getSupabase();
  const { data } = await sb
    .from("school_years")
    .select("id, year, name, active")
    .eq("workspace_id", workspaceId)
    .order("year", { ascending: false });
  return (data || []) as SchoolYear[];
}

export async function createSchoolYear(
  workspaceId: string,
  year: number,
  name?: string
): Promise<{ id?: string; error?: string }> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("school_years")
    .insert({
      workspace_id: workspaceId,
      year,
      name: name || String(year),
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data?.id };
}

export async function listWorkspaceGrades(workspaceId: string): Promise<string[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("workspace_grades")
    .select("grade_id")
    .eq("workspace_id", workspaceId);
  if (!Array.isArray(data)) return [];
  return (data as { grade_id?: string }[])
    .map((x) => x.grade_id)
    .filter((id): id is string => typeof id === "string");
}

export async function setWorkspaceGrades(
  workspaceId: string,
  gradeIds: string[]
): Promise<{ error?: string }> {
  const sb = getSupabase();
  await sb.from("workspace_grades").delete().eq("workspace_id", workspaceId);
  if (gradeIds.length > 0) {
    const { error } = await sb.from("workspace_grades").insert(
      gradeIds.map((grade_id) => ({ workspace_id: workspaceId, grade_id }))
    );
    if (error) return { error: error.message };
  }
  return {};
}

export async function listGrades(segmentId?: string): Promise<Grade[]> {
  const sb = getSupabase();
  let q = sb.from("grades").select("id, code, label, segment_id").order("sort_order", { ascending: true });
  if (segmentId) q = q.eq("segment_id", segmentId);
  const { data } = await q;
  return (data || []) as Grade[];
}

export async function listGradesForWorkspace(
  workspaceId: string,
  segmentId?: string
): Promise<Grade[]> {
  const all = await listGrades(segmentId);
  const wsIds = new Set(await listWorkspaceGrades(workspaceId));
  if (wsIds.size === 0) return all;
  return all.filter((g) => wsIds.has(g.id));
}

export async function listClasses(
  workspaceId: string,
  schoolYearId?: string,
  gradeId?: string
): Promise<ClassRow[]> {
  if (!workspaceId) return [];
  const sb = getSupabase();
  let q = sb
    .from("classes")
    .select("id, class_group, grade_id, school_year_id, grades(code, label)")
    .eq("workspace_id", workspaceId)
    .order("class_group", { ascending: true });
  if (schoolYearId) q = q.eq("school_year_id", schoolYearId);
  if (gradeId) q = q.eq("grade_id", gradeId);
  const { data } = await q;
  const rows = (data || []) as ClassRow[];
  for (const r of rows) {
    if ("grades" in r && !("grade" in r)) (r as unknown as { grade?: unknown }).grade = r.grades;
  }
  return rows;
}

export async function createClass(
  workspaceId: string,
  schoolYearId: string,
  gradeId: string,
  classGroup: string
): Promise<{ id?: string; error?: string }> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("classes")
    .insert({
      workspace_id: workspaceId,
      school_year_id: schoolYearId,
      grade_id: gradeId,
      class_group: String(classGroup || "A").trim().toUpperCase(),
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data?.id };
}

export async function deleteClass(classId: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb.from("classes").delete().eq("id", classId);
  return !error;
}

export async function listComponents(): Promise<Component[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("components")
    .select("id, label")
    .order("sort_order", { ascending: true });
  return (data || []) as Component[];
}
