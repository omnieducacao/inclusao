import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/pei-professor
 * Retorna a lista de estudantes e disciplinas vinculados ao professor logado.
 * Junta: teacher_assignments → classes → students → pei_disciplinas
 */
export async function GET() {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const workspaceId = session.workspace_id;
    const sb = getSupabase();

    // Resolve member ID: simulation > session.member > fallback by name
    let memberId = (session.simulating_member_id as string) || (session.member?.id as string) || "";
    if (!memberId && session.usuario_nome) {
        const { data: m } = await sb
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", workspaceId)
            .eq("nome", session.usuario_nome)
            .maybeSingle();
        memberId = m?.id || "";
    }
    if (!memberId) {
        return NextResponse.json({ error: "Membro não identificado" }, { status: 401 });
    }

    // 1. Buscar assignments do professor
    const { data: assignments, error: assignErr } = await sb
        .from("teacher_assignments")
        .select("class_id, component_id")
        .eq("workspace_member_id", memberId);

    if (assignErr || !assignments?.length) {
        return NextResponse.json({ estudantes: [], error: assignErr?.message || null });
    }

    // 2. Buscar nomes dos componentes
    const componentIds = [...new Set(assignments.map(a => a.component_id).filter(Boolean))];
    const { data: components } = componentIds.length > 0
        ? await sb.from("components").select("id, label").in("id", componentIds)
        : { data: [] };
    const componentMap = new Map((components || []).map(c => [c.id, c.label as string]));

    // 3. Buscar turmas vinculadas
    const classIds = [...new Set(assignments.map(a => a.class_id))];
    const { data: classes } = await sb
        .from("classes")
        .select("id, grade_id, class_group")
        .in("id", classIds);

    const gradeIds = [...new Set((classes || []).map(c => c.grade_id).filter(Boolean))];
    const { data: grades } = gradeIds.length > 0
        ? await sb.from("grades").select("id, code, label").in("id", gradeIds)
        : { data: [] };
    const gradeMap = new Map((grades || []).map(g => [g.id, { code: g.code || "", label: g.label || "" }]));

    // 4. Buscar todos os estudantes do workspace que tenham PEI em fase_2
    const { data: students } = await sb
        .from("students")
        .select("id, name, grade, class_group, pei_data, diagnosis")
        .eq("workspace_id", workspaceId);

    // 5. Match: estudantes cuja grade/class_group bate com as turmas do professor
    const matchedStudents: Array<{
        id: string;
        name: string;
        grade: string;
        class_group: string;
        diagnosis: string | null;
        disciplinas: string[];
        pei_data: Record<string, unknown>;
    }> = [];

    for (const student of (students || [])) {
        const studentGrade = student.grade || "";
        const studentClass = student.class_group || "";
        const peiData = (student.pei_data || {}) as Record<string, unknown>;

        // Só mostrar estudantes com PEI em fase_2 (enviado para regentes)
        if (peiData.fase_pei !== "fase_2") continue;

        const studentNum = (studentGrade.match(/\d+/) || [""])[0];
        if (!studentNum) continue;

        const discsForStudent: string[] = [];

        for (const assign of assignments) {
            const cls = (classes || []).find(c => c.id === assign.class_id);
            if (!cls) continue;
            const g = gradeMap.get(cls.grade_id);
            if (!g) continue;

            // Match grade number
            const codeNum = (g.code.match(/\d+/) || [""])[0];
            const labelNum = (g.label.includes(":") ? (g.label.split(":").pop() || "").match(/\d+/) || [""] : g.label.match(/\d+/) || [""])[0];
            const gradeMatches = (codeNum && codeNum === studentNum) || (labelNum && labelNum === studentNum);
            if (!gradeMatches) continue;

            // Match class_group (flexível)
            const classMatches = !studentClass || !cls.class_group ||
                cls.class_group.toLowerCase().includes(studentClass.toLowerCase()) ||
                studentClass.toLowerCase().includes(cls.class_group.toLowerCase());
            if (!classMatches) continue;

            const componentName = componentMap.get(assign.component_id) || "Geral";
            if (!discsForStudent.includes(componentName)) {
                discsForStudent.push(componentName);
            }
        }

        if (discsForStudent.length > 0) {
            matchedStudents.push({
                id: student.id,
                name: student.name,
                grade: studentGrade,
                class_group: studentClass,
                diagnosis: student.diagnosis,
                disciplinas: discsForStudent,
                pei_data: peiData,
            });
        }
    }

    // 6. Para cada estudante+disciplina, buscar status em pei_disciplinas
    const studentIds = matchedStudents.map(s => s.id);
    let peiDiscs: Array<{
        student_id: string;
        disciplina: string;
        fase_status: string;
        pei_disciplina_data: Record<string, unknown> | null;
    }> = [];

    if (studentIds.length > 0) {
        const { data } = await sb
            .from("pei_disciplinas")
            .select("student_id, disciplina, fase_status, pei_disciplina_data")
            .in("student_id", studentIds)
            .eq("workspace_id", workspaceId);
        peiDiscs = (data || []) as typeof peiDiscs;
    }

    // 7. Montar resultado
    const result = matchedStudents.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        class_group: s.class_group,
        diagnosis: s.diagnosis,
        pei_resumo: typeof (s.pei_data as Record<string, unknown>).ia_sugestao === "string"
            ? ((s.pei_data as Record<string, unknown>).ia_sugestao as string).substring(0, 300)
            : null,
        disciplinas: s.disciplinas.map(disc => {
            const pd = peiDiscs.find(p => p.student_id === s.id && p.disciplina === disc);
            return {
                disciplina: disc,
                fase_status: pd?.fase_status || "plano_ensino",
                pei_disciplina_data: pd?.pei_disciplina_data || null,
            };
        }),
    }));

    return NextResponse.json({ estudantes: result });
}
