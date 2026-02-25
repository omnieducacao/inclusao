import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/pei-regente/meus-alunos
 *
 * Retorna os estudantes em Fase 2 vinculados ao professor logado,
 * com status de cada disciplina atribuída.
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

    // 1. Identificar o membro logado
    const memberId = (session as Record<string, unknown>).member_id as string | undefined;
    let memberIdResolved = memberId;

    // Se não tiver member_id na sessão, buscar pelo nome do usuário
    if (!memberIdResolved) {
        const { data: memberData } = await sb
            .from("workspace_members")
            .select("id, name")
            .eq("workspace_id", session.workspace_id)
            .eq("name", session.usuario_nome)
            .maybeSingle();

        if (memberData) {
            memberIdResolved = memberData.id;
        }
    }

    // Para master: retornar TODOS os estudantes em fase_2 com seus pei_disciplinas
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

    if (!disciplinas?.length) {
        return NextResponse.json({
            professor: { id: memberIdResolved, name: session.usuario_nome, is_master: isMaster },
            alunos: [],
        });
    }

    // 3. Buscar dados dos estudantes
    const studentIds = [...new Set(disciplinas.map(d => d.student_id))];
    const { data: students } = await sb
        .from("students")
        .select("id, name, grade, class_group, diagnosis, pei_data")
        .in("id", studentIds)
        .eq("workspace_id", session.workspace_id);

    // 4. Buscar planos de ensino existentes
    const { data: planos } = await sb
        .from("planos_ensino")
        .select("id, disciplina, student_id")
        .in("student_id", studentIds)
        .eq("workspace_id", session.workspace_id);

    // 5. Buscar avaliações diagnósticas existentes
    const { data: avaliacoes } = await sb
        .from("avaliacoes_diagnosticas")
        .select("id, disciplina, student_id, nivel_omnisfera_identificado, status")
        .in("student_id", studentIds)
        .eq("workspace_id", session.workspace_id);

    // 6. Montar resposta agrupada por aluno
    const studentsMap = new Map((students || []).map(s => [s.id, s]));
    const planosMap = new Map<string, boolean>();
    (planos || []).forEach(p => {
        planosMap.set(`${p.student_id}:${p.disciplina}`, true);
    });
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

    for (const d of disciplinas) {
        const student = studentsMap.get(d.student_id);
        if (!student) continue;

        if (!alunosMap.has(d.student_id)) {
            const peiData = (student.pei_data || {}) as Record<string, unknown>;
            alunosMap.set(d.student_id, {
                id: student.id,
                name: student.name,
                grade: student.grade || "",
                class_group: student.class_group || "",
                diagnostico: student.diagnosis || "",
                fase_pei: (peiData.fase_pei as string) || "fase_1",
                disciplinas: [],
            });
        }

        const key = `${d.student_id}:${d.disciplina}`;
        const avData = avaliacoesMap.get(key);

        alunosMap.get(d.student_id)!.disciplinas.push({
            id: d.id,
            disciplina: d.disciplina,
            professor_regente_nome: d.professor_regente_nome,
            fase_status: d.fase_status || "plano_ensino",
            has_plano: planosMap.has(key),
            has_avaliacao: !!avData,
            nivel_omnisfera: avData?.nivel || null,
            avaliacao_status: avData?.status || "pendente",
        });
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
