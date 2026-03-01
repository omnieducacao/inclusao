import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * Match flexível entre a série do estudante (ex: "7º Ano (EFAF)") e o
 * label/code da grade no banco (ex: code="7ano", label="EF - Anos Finais (6º ao 9º): 7º Ano").
 *
 * Estratégia:
 * 1. Extrair número do code da grade ("7ano" → 7)
 * 2. Extrair número da série do estudante ("7º Ano (EFAF)" → 7)
 * 3. Comparar os números
 */
function gradeMatches(gradeCode: string, gradeLabel: string, studentGrade: string): boolean {
    if (!studentGrade) return false;
    // Extrair número da série do estudante: "7º Ano (EFAF)" → "7"
    const studentNum = (studentGrade.match(/\d+/) || [""])[0];
    if (!studentNum) return false;
    // Primeiro tentar pelo code que é mais confiável (ex: "7ano")
    if (gradeCode) {
        const codeNum = (gradeCode.match(/\d+/) || [""])[0];
        if (codeNum && codeNum === studentNum) return true;
    }
    // Fallback: pelo label — pegar a parte após ':' se existir
    if (gradeLabel) {
        const afterColon = gradeLabel.includes(":") ? gradeLabel.split(":").pop() || "" : gradeLabel;
        const labelNum = (afterColon.match(/\d+/) || [""])[0];
        if (labelNum && labelNum === studentNum) return true;
    }
    return false;
}

/**
 * POST /api/pei/enviar-regentes
 * Marca o PEI como Fase 2 e cria registros de pei_disciplinas.
 *
 * Modos:
 * 1. Com disciplinas explícitas:
 *    Body: { studentId, disciplinas: [{ disciplina, professor_regente_nome }] }
 *
 * 2. Automático via vínculos (teacher_assignments):
 *    Body: { studentId, auto: true }
 *    Busca todos os professores vinculados à turma do estudante e cria
 *    um pei_disciplinas por componente curricular atribuído.
 *
 * GET /api/pei/enviar-regentes?studentId=xxx
 * Lista disciplinas e status de envio para um estudante.
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const preview = url.searchParams.get("preview");

    // Modo preview: retornar professores que correspondem à série/turma
    if (preview === "1") {
        const grade = url.searchParams.get("grade") || "";
        const classGroup = url.searchParams.get("classGroup") || "";

        if (!grade) {
            return NextResponse.json({ teachers: [] });
        }

        const sb = getSupabase();

        const { data: classes } = await sb
            .from("classes")
            .select("id, grade_id, class_group")
            .eq("workspace_id", session.workspace_id);

        const { data: grades } = await sb
            .from("grades")
            .select("id, code, label");

        const gradeMap = new Map((grades || []).map(g => [g.id, { code: g.code || "", label: g.label || "" }]));
        const matchingClassIds = (classes || [])
            .filter(c => {
                const g = gradeMap.get(c.grade_id);
                if (!g) return false;
                const gMatch = gradeMatches(g.code, g.label, grade);
                const classMatch = !classGroup || (c.class_group || "").toLowerCase().includes(classGroup.toLowerCase());
                return gMatch && classMatch;
            })
            .map(c => c.id);

        if (matchingClassIds.length === 0) {
            return NextResponse.json({ teachers: [] });
        }

        const { data: assignments } = await sb
            .from("teacher_assignments")
            .select("workspace_member_id, component_id")
            .in("class_id", matchingClassIds);

        if (!assignments?.length) {
            return NextResponse.json({ teachers: [] });
        }

        const memberIds = [...new Set(assignments.map(a => a.workspace_member_id))];
        const componentIds = [...new Set(assignments.map(a => a.component_id).filter(Boolean))];

        const { data: members } = await sb
            .from("workspace_members")
            .select("id, nome")
            .in("id", memberIds);

        const { data: components } = componentIds.length > 0
            ? await sb.from("components").select("id, label").in("id", componentIds)
            : { data: [] };

        const memberMap = new Map((members || []).map(m => [m.id, m.nome]));
        const componentMap = new Map((components || []).map(c => [c.id, c.label]));

        const teachers = assignments.map(a => ({
            name: memberMap.get(a.workspace_member_id) || "Professor",
            component: componentMap.get(a.component_id) || "Geral",
        }));

        return NextResponse.json({ teachers });
    }

    // Modo normal: listar disciplinas de um estudante
    const studentId = url.searchParams.get("studentId");
    if (!studentId) {
        return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();
    const { data, error } = await sb
        .from("pei_disciplinas")
        .select("*")
        .eq("student_id", studentId)
        .eq("workspace_id", session.workspace_id)
        .order("disciplina");

    if (error) {
        console.error("GET /api/pei/enviar-regentes:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ disciplinas: data || [] });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, disciplinas, auto } = body as {
        studentId: string;
        disciplinas?: Array<{ disciplina: string; professor_regente_nome: string; professor_regente_id?: string }>;
        auto?: boolean;
    };

    if (!studentId) {
        return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();

    // Buscar dados do estudante
    const { data: studentData } = await sb
        .from("students")
        .select("pei_data, grade, class_group")
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id)
        .single();

    if (!studentData) {
        return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
    }

    let records: Array<{
        student_id: string;
        workspace_id: string;
        disciplina: string;
        professor_regente_nome: string;
        professor_regente_id: string | null;
        fase_status: string;
        pei_disciplina_data: Record<string, unknown>;
    }> = [];

    if (auto) {
        // Modo automático: buscar teacher_assignments vinculados à turma do estudante
        const studentGrade = studentData.grade || "";
        const studentClass = studentData.class_group || "";

        // Buscar classes que correspondem à turma do estudante
        const { data: classes } = await sb
            .from("classes")
            .select("id, grade_id, class_group")
            .eq("workspace_id", session.workspace_id);

        const { data: grades } = await sb
            .from("grades")
            .select("id, code, label");

        // Encontrar class_ids que correspondem ao estudante
        const gradeMap = new Map((grades || []).map(g => [g.id, { code: g.code || "", label: g.label || "" }]));
        const matchingClassIds = (classes || [])
            .filter(c => {
                const g = gradeMap.get(c.grade_id);
                if (!g) return false;
                const gMatch = gradeMatches(g.code, g.label, studentGrade);
                const classMatch = !studentClass || (c.class_group || "").toLowerCase().includes(studentClass.toLowerCase());
                return gMatch && classMatch;
            })
            .map(c => c.id);

        if (matchingClassIds.length === 0) {
            return NextResponse.json({
                error: "Nenhuma turma encontrada para o estudante. Verifique a série/turma.",
                studentGrade,
                studentClass,
            }, { status: 400 });
        }

        // Buscar teacher_assignments dessas turmas
        const { data: assignments } = await sb
            .from("teacher_assignments")
            .select("workspace_member_id, class_id, component_id")
            .in("class_id", matchingClassIds);

        if (!assignments?.length) {
            return NextResponse.json({
                error: "Nenhum professor vinculado a esta turma. Cadastre professores em Gestão de Usuários.",
            }, { status: 400 });
        }

        // Buscar nomes dos membros e componentes
        const memberIds = [...new Set(assignments.map(a => a.workspace_member_id))];
        const componentIds = [...new Set(assignments.map(a => a.component_id).filter(Boolean))];

        const { data: members } = await sb
            .from("workspace_members")
            .select("id, nome")
            .in("id", memberIds);

        const { data: components } = componentIds.length > 0
            ? await sb.from("components").select("id, label").in("id", componentIds)
            : { data: [] };

        const memberMap = new Map((members || []).map(m => [m.id, m.nome]));
        const componentMap = new Map((components || []).map(c => [c.id, c.label]));

        // Criar registros: um por (professor, componente curricular)
        for (const a of assignments) {
            const componentName = componentMap.get(a.component_id) || "Geral";
            const memberName = memberMap.get(a.workspace_member_id) || "Professor";
            records.push({
                student_id: studentId,
                workspace_id: session.workspace_id,
                disciplina: componentName,
                professor_regente_nome: memberName,
                professor_regente_id: a.workspace_member_id,
                fase_status: "plano_ensino",
                pei_disciplina_data: {},
            });
        }
    } else {
        // Modo manual: disciplinas explícitas
        if (!disciplinas?.length) {
            return NextResponse.json(
                { error: "disciplinas são obrigatórias (ou use auto: true)" },
                { status: 400 }
            );
        }
        records = disciplinas.map((d) => ({
            student_id: studentId,
            workspace_id: session.workspace_id!,
            disciplina: d.disciplina,
            professor_regente_nome: d.professor_regente_nome,
            professor_regente_id: d.professor_regente_id || null,
            fase_status: "plano_ensino",
            pei_disciplina_data: {},
        }));
    }

    if (records.length === 0) {
        return NextResponse.json({ error: "Nenhuma disciplina para enviar" }, { status: 400 });
    }

    // Marcar o PEI como fase_2
    const peiData = (studentData.pei_data || {}) as Record<string, unknown>;
    await sb
        .from("students")
        .update({ pei_data: { ...peiData, fase_pei: "fase_2" } })
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id);

    // Criar registros de pei_disciplinas (upsert para evitar duplicatas)
    // Deduplicar por disciplina (pode haver 2 profs com mesmo componente)
    const seen = new Set<string>();
    const deduped = records.filter(r => {
        const key = `${r.student_id}::${r.disciplina}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const { data: inserted, error } = await sb
        .from("pei_disciplinas")
        .upsert(deduped, { onConflict: "student_id,disciplina" })
        .select();

    if (error) {
        console.error("POST /api/pei/enviar-regentes:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, disciplinas: inserted, count: inserted?.length || 0 });
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, studentId } = body as { id: string; studentId: string };

    if (!id || !studentId) {
        return NextResponse.json({ error: "id e studentId obrigatórios" }, { status: 400 });
    }

    const sb = getSupabase();
    const { error } = await sb
        .from("pei_disciplinas")
        .delete()
        .eq("id", id)
        .eq("student_id", studentId)
        .eq("workspace_id", session.workspace_id);

    if (error) {
        console.error("DELETE /api/pei/enviar-regentes:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
