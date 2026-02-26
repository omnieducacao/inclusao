import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/pei/avaliacao-diagnostica/salvar
 * Salva uma avaliação gerada SEM re-gerar via IA.
 * Usado quando a avaliação já foi gerada via /api/hub/criar-itens.
 *
 * Body: { studentId, disciplina, questoes_geradas, habilidades_bncc?, plano_ensino_id? }
 */
export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        studentId,
        disciplina,
        questoes_geradas,
        habilidades_bncc,
        plano_ensino_id,
    } = body as {
        studentId: string;
        disciplina: string;
        questoes_geradas: unknown;
        habilidades_bncc?: string[];
        plano_ensino_id?: string;
    };

    if (!studentId || !disciplina) {
        return NextResponse.json(
            { error: "studentId e disciplina são obrigatórios" },
            { status: 400 }
        );
    }

    const sb = getSupabase();

    const { data: avaliacao, error } = await sb
        .from("avaliacoes_diagnosticas")
        .insert({
            student_id: studentId,
            workspace_id: session.workspace_id,
            disciplina,
            plano_ensino_id: plano_ensino_id || null,
            habilidades_bncc: habilidades_bncc || [],
            questoes_geradas: questoes_geradas || null,
            modelo_ia: "hub-criar-itens",
            status: "gerada",
            criada_por: null,
        })
        .select()
        .single();

    if (error) {
        console.error("POST /api/pei/avaliacao-diagnostica/salvar:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, avaliacao });
}
