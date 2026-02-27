import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { chatCompletionText } from "@/lib/ai-engines";
import {
    buildContextoAluno,
    buildPromptCompleto,
    templateQuestoesDiagnosticas,
} from "@/lib/omnisfera-prompts";
import type {
    PerfilAluno,
    HabilidadeBNCC,
    NivelOmnisfera,
    PerfilNEE,
} from "@/lib/omnisfera-types";

/**
 * POST /api/pei/avaliacao-diagnostica
 * Gera avaliação diagnóstica via IA contextualizada ao plano de ensino.
 *
 * Body: {
 *   studentId, disciplina, habilidades_bncc: HabilidadeBNCC[],
 *   nivel_omnisfera_estimado: number,
 *   observacao_professor?: string,
 *   plano_ensino_contexto?: string,
 *   quantidade?: number
 * }
 *
 * GET /api/pei/avaliacao-diagnostica?studentId=xxx&disciplina=xxx
 * Busca avaliações existentes.
 *
 * PATCH /api/pei/avaliacao-diagnostica
 * Registra resultados (respostas e nível identificado).
 * Body: { id, resultados, nivel_omnisfera_identificado }
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const disciplina = url.searchParams.get("disciplina");
    const id = url.searchParams.get("id");

    const sb = getSupabase();

    if (id) {
        const { data, error } = await sb
            .from("avaliacoes_diagnosticas")
            .select("*")
            .eq("id", id)
            .eq("workspace_id", session.workspace_id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ avaliacao: data });
    }

    // all=true: return all assessments for the workspace (used by Gabarito tab)
    const all = url.searchParams.get("all");
    if (all === "true") {
        const { data, error } = await sb
            .from("avaliacoes_diagnosticas")
            .select("*")
            .eq("workspace_id", session.workspace_id)
            .order("created_at", { ascending: false })
            .limit(50);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ avaliacoes: data || [] });
    }

    if (!studentId) {
        return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });
    }

    let query = sb
        .from("avaliacoes_diagnosticas")
        .select("*")
        .eq("student_id", studentId)
        .eq("workspace_id", session.workspace_id);

    if (disciplina) {
        query = query.eq("disciplina", disciplina);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ avaliacoes: data || [] });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        studentId,
        disciplina,
        habilidades_bncc,
        nivel_omnisfera_estimado,
        observacao_professor,
        plano_ensino_contexto,
        plano_ensino_id,
        quantidade,
        perfil_nee,
        perfil_aluno,
    } = body as {
        studentId: string;
        disciplina: string;
        habilidades_bncc: HabilidadeBNCC[];
        nivel_omnisfera_estimado: number;
        observacao_professor?: string;
        plano_ensino_contexto?: string;
        plano_ensino_id?: string;
        quantidade?: number;
        perfil_nee?: PerfilNEE;
        perfil_aluno?: PerfilAluno;
    };

    if (!studentId || !disciplina || !habilidades_bncc?.length) {
        return NextResponse.json(
            { error: "studentId, disciplina e habilidades_bncc são obrigatórios" },
            { status: 400 }
        );
    }

    // Buscar dados do estudante
    const sb = getSupabase();
    const { data: student } = await sb
        .from("students")
        .select("name, grade, diagnosis, pei_data")
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id)
        .single();

    if (!student) {
        return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
    }

    const nivelAluno = (nivel_omnisfera_estimado || 1) as NivelOmnisfera;
    const nee = perfil_nee || "SEM_NEE";

    // Construir perfil do aluno a partir dos dados
    const aluno: PerfilAluno = perfil_aluno || {
        id: studentId,
        nome_primeiro: student.name?.split(" ")[0] || "Estudante",
        ano_matricula: student.grade || "6º Ano",
        ano_referencia_pei: student.grade || "6º Ano",
        perfil_nee_primario: nee,
        canal_comunicacao: "verbal",
        recursos_assistivos: [],
        suporte_atual: "S2",
    };

    // Usar a primeira habilidade para o contexto principal
    const habilidadePrincipal = habilidades_bncc[0];

    // Montar prompt usando novo motor V3 (named params)
    const contexto = buildContextoAluno({
        nome: aluno.nome_primeiro,
        serie: aluno.ano_matricula,
        diagnostico: nee as string,
        nivel_omnisfera_estimado: nivelAluno,
        observacao_professor: observacao_professor || "Avaliação diagnóstica inicial",
    });

    const tarefa = templateQuestoesDiagnosticas({
        habilidades: habilidades_bncc.map((h: HabilidadeBNCC) => ({
            codigo: h.codigo,
            disciplina: h.disciplina,
            unidade_tematica: h.unidade_tematica,
            objeto_conhecimento: h.objeto_conhecimento,
            habilidade: h.habilidade,
            nivel_cognitivo_saeb: h.nivel_cognitivo_saeb,
        })),
        quantidade: quantidade || 4,
        tipo_questao: "Objetiva",
        nivel_omnisfera_estimado: nivelAluno,
        plano_ensino_contexto: plano_ensino_contexto || undefined,
    });

    const { system, user } = buildPromptCompleto(
        contexto,
        tarefa,
    );

    try {
        // Chamar IA
        const messages = [
            { role: "system" as const, content: system },
            { role: "user" as const, content: user },
        ];

        const aiResponse = await chatCompletionText(
            "red",
            messages,
            { temperature: 0.4, source: "pei-avaliacao-diagnostica" },
        );

        // Tentar parsear JSON da resposta
        let questoesGeradas: unknown = null;
        try {
            // Limpar possível markdown wrapper
            let cleanResponse = aiResponse;
            const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                cleanResponse = jsonMatch[1];
            }
            questoesGeradas = JSON.parse(cleanResponse);
        } catch {
            // Se não for JSON válido, salvar como texto bruto
            questoesGeradas = { raw_response: aiResponse };
        }

        // Salvar no banco
        const { data: avaliacao, error } = await sb
            .from("avaliacoes_diagnosticas")
            .insert({
                student_id: studentId,
                workspace_id: session.workspace_id,
                disciplina,
                plano_ensino_id: plano_ensino_id || null,
                habilidades_bncc: habilidades_bncc.map((h) => h.codigo),
                questoes_geradas: questoesGeradas,
                modelo_ia: "omni-red",
                status: "gerada",
                criada_por: null,
            })
            .select()
            .single();

        if (error) {
            console.error("POST /api/pei/avaliacao-diagnostica (save):", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, avaliacao });
    } catch (err) {
        console.error("POST /api/pei/avaliacao-diagnostica (AI):", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar avaliação" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, resultados, nivel_omnisfera_identificado, status } = body as {
        id: string;
        resultados?: Record<string, unknown>;
        nivel_omnisfera_identificado?: number;
        status?: string;
    };

    if (!id) {
        return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();
    const updateFields: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (resultados) updateFields.resultados = resultados;
    if (nivel_omnisfera_identificado !== undefined) {
        updateFields.nivel_omnisfera_identificado = nivel_omnisfera_identificado;
    }
    if (status) updateFields.status = status;

    const { data, error } = await sb
        .from("avaliacoes_diagnosticas")
        .update(updateFields)
        .eq("id", id)
        .eq("workspace_id", session.workspace_id)
        .select()
        .single();

    if (error) {
        console.error("PATCH /api/pei/avaliacao-diagnostica:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, avaliacao: data });
}

export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();
    const { error } = await sb
        .from("avaliacoes_diagnosticas")
        .delete()
        .eq("id", id)
        .eq("workspace_id", session.workspace_id);

    if (error) {
        console.error("DELETE /api/pei/avaliacao-diagnostica:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
