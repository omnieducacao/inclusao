import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { decryptField } from "@/lib/encryption";

/**
 * GET /api/pei-regente/meus-alunos
 *
 * Retorna os estudantes vinculados ao professor logado,
 * com status de cada disciplina atribuída.
 * 
 * Inclui TAMBÉM estudantes com PEI gerado que estão nas mesmas turmas
 * (grade + class_group) dos alunos já vinculados, garantindo que todo
 * estudante com PEI apareça na Diagnóstica do professor.
 *
 * Response: {
 *   professor: { id, name, components },
 *   alunos: [{
 *     id, name, grade, class_group, diagnostico,
 *     disciplinas: [{ id, disciplina, fase_status, has_plano, has_avaliacao, nivel_omnisfera }]
 *   }]
 * }
 */
export async function GET() {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const sb = getSupabase();

    // 0. Verificar se workspace permite avaliação de estudantes em Fase 1
    const { data: wsData } = await sb
        .from("workspaces")
        .select("allow_avaliacao_fase_1")
        .eq("id", session.workspace_id)
        .maybeSingle();
    const allowAvaliacaoFase1 = Boolean((wsData as { allow_avaliacao_fase_1?: boolean } | null)?.allow_avaliacao_fase_1);

    // 1. Identificar o membro logado
    const memberId = (session as Record<string, unknown>).member_id as string | undefined;
    let memberIdResolved = memberId;

    // Se não tiver member_id na sessão, buscar pelo nome do usuário
    if (!memberIdResolved) {
        const { data: memberData } = await sb
            .from("workspace_members")
            .select("id, nome")
            .eq("workspace_id", session.workspace_id)
            .eq("nome", session.usuario_nome)
            .maybeSingle();

        if (memberData) {
            memberIdResolved = memberData.id;
        }
    }

    // Para master: retornar TODOS os estudantes com pei_disciplinas
    const isMaster = session.user_role === "master" || !memberIdResolved;

    // 2. Buscar pei_disciplinas do professor (ou todos se master)
    let query = sb
        .from("pei_disciplinas")
        .select("*")
        .eq("workspace_id", session.workspace_id);

    if (!isMaster && memberIdResolved) {
        query = query.eq("professor_regente_id", memberIdResolved);
    }

    const { data: disciplinas, error: discError } = await query.order("disciplina");

    if (discError) {
        console.error("GET /api/pei-regente/meus-alunos (disciplinas):", discError);
        return NextResponse.json({ error: discError.message }, { status: 500 });
    }

    // 3. Buscar dados dos estudantes vinculados via pei_disciplinas
    const studentIds = [...new Set((disciplinas || []).map(d => d.student_id))];
    const { data: students } = studentIds.length > 0
        ? await sb
            .from("students")
            .select("id, name, grade, class_group, diagnosis, pei_data")
            .in("id", studentIds)
            .eq("workspace_id", session.workspace_id)
        : { data: [] };

    // 4. Coletar turmas (grade+class_group) desses alunos e disciplinas do professor
    const classGroups = new Set<string>();
    const profDisciplinas = new Set<string>();
    (students || []).forEach(s => {
        if (s.grade && s.class_group) classGroups.add(`${s.grade}|${s.class_group}`);
    });
    (disciplinas || []).forEach(d => profDisciplinas.add(d.disciplina));

    // 5. Buscar turmas do professor via teacher_assignments (quando classGroups vazio)
    if (classGroups.size === 0 && memberIdResolved && allowAvaliacaoFase1) {
        const { data: assignments } = await sb
            .from("teacher_assignments")
            .select("class_id")
            .eq("workspace_member_id", memberIdResolved);
        if (assignments?.length) {
            const classIds = [...new Set(assignments.map((a: { class_id: string }) => a.class_id))];
            const { data: classes } = await sb
                .from("classes")
                .select("class_group, grades(code, label)")
                .in("id", classIds);
            (classes || []).forEach((c: { class_group?: string; grades?: { code?: string; label?: string } | null }) => {
                const label = c.grades && typeof c.grades === "object" ? (c.grades.label || c.grades.code || "") : "";
                if (label && c.class_group) classGroups.add(`${label}|${c.class_group}`);
            });
        }
    }

    // 6. Buscar TODOS os estudantes com PEI das mesmas turmas (que o professor NÃO tem em pei_disciplinas)
    let extraStudents: typeof students = [];
    if (classGroups.size > 0) {
        // Buscar todos estudantes do workspace com pei_data
        const { data: allStudents } = await sb
            .from("students")
            .select("id, name, grade, class_group, diagnosis, pei_data")
            .eq("workspace_id", session.workspace_id)
            .not("pei_data", "is", null);

        if (allStudents) {
            const existingIds = new Set(studentIds);
            extraStudents = allStudents.filter(s => {
                if (existingIds.has(s.id)) return false; // já incluído
                if (!s.grade || !s.class_group) return false;
                const key = `${s.grade}|${s.class_group}`;
                if (!classGroups.has(key)) return false;
                // Incluir fase_1 quando allow_avaliacao_fase_1; senão só fase_2 ou PEI com dados
                const peiData = (s.pei_data || {}) as Record<string, unknown>;
                const fasePei = peiData.fase_pei as string || "fase_1";
                return allowAvaliacaoFase1 || (fasePei !== "fase_1" || Object.keys(peiData).length > 2);
            });
        }
    }

    // Combinar todos os IDs
    const allStudentIds = [...studentIds, ...(extraStudents || []).map(s => s.id)];

    // 6. has_plano vem de pei_disciplinas.plano_ensino_id (não de planos_ensino por estudante)
    // planos_ensino não tem student_id; o vínculo é pei_disciplinas.plano_ensino_id → planos_ensino.id

    // 7. Buscar avaliações diagnósticas existentes
    const { data: avaliacoes } = allStudentIds.length > 0
        ? await sb
            .from("avaliacoes_diagnosticas")
            .select("id, disciplina, student_id, nivel_omnisfera_identificado, status")
            .in("student_id", allStudentIds)
            .eq("workspace_id", session.workspace_id)
        : { data: [] };

    // 8. Montar resposta agrupada por aluno
    const studentsMap = new Map((students || []).map(s => [s.id, s]));
    (extraStudents || []).forEach(s => studentsMap.set(s.id, s));

    const avaliacoesMap = new Map<string, { nivel: number | null; status: string }>();
    (avaliacoes || []).forEach(a => {
        avaliacoesMap.set(`${a.student_id}:${a.disciplina}`, {
            nivel: a.nivel_omnisfera_identificado,
            status: a.status || "pendente",
        });
    });

    // Agrupar disciplinas por estudante
    const alunosMap = new Map<string, {
        id: string;
        name: string;
        grade: string;
        class_group: string;
        diagnostico: string;
        fase_pei: string;
        disciplinas: Array<{
            id: string;
            disciplina: string;
            professor_regente_nome: string;
            fase_status: string;
            has_plano: boolean;
            has_avaliacao: boolean;
            nivel_omnisfera: number | null;
            avaliacao_status: string;
        }>;
    }>();

    // Adicionar alunos com pei_disciplinas (lógica existente)
    for (const d of (disciplinas || [])) {
        const student = studentsMap.get(d.student_id);
        if (!student) continue;

        if (!alunosMap.has(d.student_id)) {
            const peiData = (student.pei_data || {}) as Record<string, unknown>;
            alunosMap.set(d.student_id, {
                id: student.id,
                name: decryptField(student.name || ""),
                grade: student.grade || "",
                class_group: student.class_group || "",
                diagnostico: decryptField(student.diagnosis || ""),
                fase_pei: (peiData.fase_pei as string) || "fase_1",
                disciplinas: [],
            });
        }

        const key = `${d.student_id}:${d.disciplina}`;
        const avData = avaliacoesMap.get(key);
        const hasPlano = !!d.plano_ensino_id;

        alunosMap.get(d.student_id)!.disciplinas.push({
            id: d.id,
            disciplina: d.disciplina,
            professor_regente_nome: d.professor_regente_nome,
            fase_status: d.fase_status || "plano_ensino",
            has_plano: hasPlano,
            has_avaliacao: !!avData,
            nivel_omnisfera: avData?.nivel || null,
            avaliacao_status: avData?.status || "pendente",
        });
    }

    // Adicionar alunos extras com PEI (das mesmas turmas) com disciplinas virtuais
    for (const s of (extraStudents || [])) {
        if (alunosMap.has(s.id)) continue;
        const peiData = (s.pei_data || {}) as Record<string, unknown>;
        const entry = {
            id: s.id,
            name: decryptField(s.name || ""),
            grade: s.grade || "",
            class_group: s.class_group || "",
            diagnostico: decryptField(s.diagnosis || ""),
            fase_pei: (peiData.fase_pei as string) || "fase_1",
            disciplinas: [] as Array<{
                id: string;
                disciplina: string;
                professor_regente_nome: string;
                fase_status: string;
                has_plano: boolean;
                has_avaliacao: boolean;
                nivel_omnisfera: number | null;
                avaliacao_status: string;
            }>,
        };

        // Criar entradas virtuais para cada disciplina do professor (alunos extras não têm pei_disciplinas; has_plano = false)
        for (const disc of profDisciplinas) {
            const key = `${s.id}:${disc}`;
            const avData = avaliacoesMap.get(key);
            entry.disciplinas.push({
                id: `virtual_${s.id}_${disc}`,
                disciplina: disc,
                professor_regente_nome: session.usuario_nome || "Professor",
                fase_status: "diagnostica",
                has_plano: false,
                has_avaliacao: !!avData,
                nivel_omnisfera: avData?.nivel || null,
                avaliacao_status: avData?.status || "pendente",
            });
        }

        if (entry.disciplinas.length > 0) {
            alunosMap.set(s.id, entry);
        }
    }

    return NextResponse.json({
        professor: {
            id: memberIdResolved,
            name: session.usuario_nome,
            is_master: isMaster,
        },
        alunos: Array.from(alunosMap.values()),
    });
}
