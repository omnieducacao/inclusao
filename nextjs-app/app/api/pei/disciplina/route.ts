import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/pei/disciplina?studentId=xxx&disciplina=xxx
 * Busca PEI de disciplina específica.
 *
 * POST /api/pei/disciplina
 * Salva/atualiza dados do PEI por disciplina.
 * Body: { studentId, disciplina, pei_disciplina_data, plano_ensino_id?, avaliacao_diagnostica_id? }
 *
 * PATCH /api/pei/disciplina
 * Atualiza status do PEI por disciplina.
 * Body: { id, fase_status, feedback_professor? } | { id, devolutiva } (coordenação) | { id, devolutiva_lida: true }
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const disciplina = url.searchParams.get("disciplina");

    if (!studentId) {
        return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();

    let query = sb
        .from("pei_disciplinas")
        .select("*")
        .eq("student_id", studentId)
        .eq("workspace_id", session.workspace_id);

    if (disciplina) {
        query = query.eq("disciplina", disciplina);
        const { data, error } = await query.single();
        if (error && error.code !== "PGRST116") {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ pei_disciplina: data || null });
    }

    const { data, error } = await query.order("disciplina");
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ pei_disciplinas: data || [] });
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
        pei_disciplina_data,
        plano_ensino_id,
        avaliacao_diagnostica_id,
    } = body as {
        studentId: string;
        disciplina: string;
        pei_disciplina_data?: Record<string, unknown>;
        plano_ensino_id?: string;
        avaliacao_diagnostica_id?: string;
    };

    if (!studentId || !disciplina) {
        return NextResponse.json(
            { error: "studentId e disciplina são obrigatórios" },
            { status: 400 }
        );
    }

    const sb = getSupabase();

    // Buscar registro existente
    const { data: existing } = await sb
        .from("pei_disciplinas")
        .select("id, pei_disciplina_data")
        .eq("student_id", studentId)
        .eq("disciplina", disciplina)
        .eq("workspace_id", session.workspace_id)
        .single();

    if (!existing) {
        return NextResponse.json(
            { error: "PEI de disciplina não encontrado. Envie para regentes primeiro." },
            { status: 404 }
        );
    }

    // Merge data (preservando dados existentes)
    const mergedData = {
        ...((existing.pei_disciplina_data || {}) as Record<string, unknown>),
        ...(pei_disciplina_data || {}),
    };

    const updateFields: Record<string, unknown> = {
        pei_disciplina_data: mergedData,
        updated_at: new Date().toISOString(),
    };

    if (plano_ensino_id) updateFields.plano_ensino_id = plano_ensino_id;
    if (avaliacao_diagnostica_id) updateFields.avaliacao_diagnostica_id = avaliacao_diagnostica_id;

    const { data, error } = await sb
        .from("pei_disciplinas")
        .update(updateFields)
        .eq("id", existing.id)
        .select()
        .single();

    if (error) {
        logger.error({ err: error }, "POST /api/pei/disciplina:");
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pei_disciplina: data });
}

export async function PATCH(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, fase_status, feedback_professor, devolutiva, devolutiva_lida } = body as {
        id: string;
        fase_status?: string;
        feedback_professor?: string;
        /** Onda 16: devolutiva da coordenação, em campo próprio */
        devolutiva?: string;
        /** Onda 16: o professor abriu a devolutiva */
        devolutiva_lida?: boolean;
    };

    if (!id) {
        return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }

    const agora = new Date().toISOString();
    const updateFields: Record<string, unknown> = { updated_at: agora };

    if (devolutiva_lida) {
        updateFields.devolutiva_lida_em = agora;
        delete updateFields.updated_at;
    } else if (devolutiva !== undefined) {
        // Só quem coordena o PEI devolve uma disciplina
        const m = (session.member || {}) as Record<string, unknown>;
        const coordena = session.is_platform_admin || session.user_role === "master" || !!m.can_pei;
        if (!coordena) return NextResponse.json({ error: "Só a coordenação do PEI pode devolver uma disciplina." }, { status: 403 });
        const texto = String(devolutiva || "").trim().slice(0, 2000);
        if (!texto) return NextResponse.json({ error: "Escreva o que precisa ser revisto." }, { status: 400 });
        Object.assign(updateFields, {
            fase_status: "pei_disciplina",
            devolutiva: texto,
            devolutiva_em: agora,
            devolutiva_por: session.usuario_nome || null,
            devolutiva_lida_em: null,
        });
    } else {
        const validStatuses = ["plano_ensino", "diagnostica", "pei_disciplina", "concluido"];
        if (!fase_status || !validStatuses.includes(fase_status)) {
            return NextResponse.json(
                { error: `fase_status inválido. Valores aceitos: ${validStatuses.join(", ")}` },
                { status: 400 }
            );
        }
        updateFields.fase_status = fase_status;
        // Observação do professor ao concluir a parte dele
        if (feedback_professor !== undefined) {
            updateFields.feedback_professor = feedback_professor;
            updateFields.data_devolucao = agora;
        }
    }

    const sb = getSupabase();
    const atualizar = (campos: Record<string, unknown>) => {
        let q = sb.from("pei_disciplinas").update(campos).eq("id", id).eq("workspace_id", session.workspace_id);
        // A devolutiva só conta como lida quando quem abre é o professor da disciplina
        if (devolutiva_lida) q = q.eq("professor_regente_id", memberIdDaSessao(session) || "00000000-0000-0000-0000-000000000000");
        return q.select().maybeSingle();
    };
    let { data, error } = await atualizar(updateFields);

    // Antes da migração da onda 16 as colunas da devolutiva não existem: grava do jeito antigo
    if (error && /devolutiva/.test(error.message || "")) {
        if (devolutiva_lida) return NextResponse.json({ ok: true, semMigracao: true });
        if (devolutiva !== undefined) {
            ({ data, error } = await atualizar({ fase_status: "pei_disciplina", feedback_professor: updateFields.devolutiva, data_devolucao: agora, updated_at: agora }));
        }
    }

    if (error) {
        logger.error({ err: error }, "PATCH /api/pei/disciplina:");
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pei_disciplina: data });
}

/**
 * DELETE /api/pei/disciplina?id=xxx
 * Remove PEI de disciplina. Avaliações vinculadas serão órfãs
 * (mas como student_id tem CASCADE, ao deletar estudante tudo limpa).
 */
export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();
    const { error } = await sb
        .from("pei_disciplinas")
        .delete()
        .eq("id", id)
        .eq("workspace_id", session.workspace_id);

    if (error) {
        logger.error({ err: error }, "DELETE /api/pei/disciplina:");
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
