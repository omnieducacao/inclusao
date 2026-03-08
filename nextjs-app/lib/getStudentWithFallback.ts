/**
 * Omnisfera — Student Fallback Helper (Server-Side)
 *
 * Consolidates the repeated student lookup + fallback pattern
 * used in PEI, PAEE, Hub, Diário, and Monitoramento pages.
 *
 * When getStudent() fails (e.g., RLS policy edge case), this helper
 * tries to find the student in the already-fetched list, then
 * performs a direct Supabase query as a last resort.
 */

import { getStudent, listStudents, type Student } from "@/lib/students";
import { getSupabase } from "@/lib/supabase";

const STUDENT_SELECT = "id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, paee_data, daily_logs, created_at";

/**
 * Fetches students for a workspace and resolves a specific student with fallback.
 *
 * @returns { students, student } — the list and the resolved student (or null)
 */
export async function getStudentsWithFallback(
    workspaceId: string | null | undefined,
    studentId: string | null | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    moduleName: string = "Module"
): Promise<{
    students: Student[];
    student: Student | null;
}> {
    if (!workspaceId) {
        return { students: [], student: null };
    }

    const students = await listStudents(workspaceId);

    if (!studentId) {
        return { students, student: null };
    }

    // Primary path: direct lookup
    let student = await getStudent(workspaceId, studentId);

    if (student) {
        return { students, student };
    }

    // Fallback: student exists in list but getStudent failed (RLS edge case)
    const studentFromList = students.find((s) => s.id === studentId);

    if (!studentFromList) {
        // Student genuinely not found
        return { students, student: null };
    }

    // Try direct Supabase query without workspace filter
    try {
        const sb = getSupabase();
        const { data: fullData } = await sb
            .from("students")
            .select(STUDENT_SELECT)
            .eq("id", studentId)
            .maybeSingle();

        if (fullData && fullData.workspace_id === workspaceId) {
            return { students, student: fullData as Student };
        }
    } catch {
        // Silent — use list data as last resort
    }

    // Last resort: use basic data from list
    return { students, student: studentFromList };
}
