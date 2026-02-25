import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/pei/consolidar?studentId=xxx
 * Consolida todos os PEIs de disciplina concluídos para um estudante,
 * gerando a visão unificada para o Dashboard.
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    if (!studentId) {
        return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();

    // 1. Buscar PEI base (Fase 1)
    const { data: student } = await sb
        .from("students")
        .select("id, name, grade, diagnosis, pei_data")
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id)
        .single();

    if (!student) {
        return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
    }

    // 2. Buscar todos os PEIs de disciplina
    const { data: peiDisciplinas } = await sb
        .from("pei_disciplinas")
        .select("*")
        .eq("student_id", studentId)
        .eq("workspace_id", session.workspace_id)
        .order("disciplina");

    // 3. Buscar avaliações diagnósticas
    const { data: avaliacoes } = await sb
        .from("avaliacoes_diagnosticas")
        .select("*")
        .eq("student_id", studentId)
        .eq("workspace_id", session.workspace_id)
        .order("disciplina");

    // 4. Calcular estatísticas de consolidação
    const disciplinas = peiDisciplinas || [];
    const totalDisciplinas = disciplinas.length;
    const concluidas = disciplinas.filter((d) => d.fase_status === "concluido").length;
    const emAndamento = disciplinas.filter(
        (d) => d.fase_status !== "concluido" && d.fase_status !== "plano_ensino"
    ).length;
    const pendentes = disciplinas.filter((d) => d.fase_status === "plano_ensino").length;

    // 5. Resumo por disciplina
    const resumo = disciplinas.map((d) => {
        const avaliacao = (avaliacoes || []).find(
            (a) => a.disciplina === d.disciplina
        );
        const data = (d.pei_disciplina_data || {}) as Record<string, unknown>;

        return {
            disciplina: d.disciplina,
            professor_regente: d.professor_regente_nome,
            fase_status: d.fase_status,
            tem_plano_ensino: !!d.plano_ensino_id,
            tem_avaliacao: !!avaliacao,
            nivel_omnisfera: avaliacao?.nivel_omnisfera_identificado ?? null,
            metas_smart: Array.isArray(data.metas_smart) ? data.metas_smart.length : 0,
            adaptacoes: !!data.adaptacoes,
            updated_at: d.updated_at,
        };
    });

    // 6. Verificar se consolidação é possível
    const podeConsolidar = totalDisciplinas > 0 && concluidas === totalDisciplinas;

    return NextResponse.json({
        estudante: {
            id: student.id,
            nome: student.name,
            serie: student.grade,
            diagnostico: student.diagnosis,
            fase_pei: ((student.pei_data || {}) as Record<string, unknown>).fase_pei || "fase_1",
        },
        consolidacao: {
            total_disciplinas: totalDisciplinas,
            concluidas,
            em_andamento: emAndamento,
            pendentes,
            progresso_percentual: totalDisciplinas > 0
                ? Math.round((concluidas / totalDisciplinas) * 100)
                : 0,
            pode_consolidar: podeConsolidar,
        },
        resumo_disciplinas: resumo,
        pei_disciplinas: disciplinas,
        avaliacoes: avaliacoes || [],
    });
}
