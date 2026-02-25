import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

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
 * Body: { id, fase_status }
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
        console.error("POST /api/pei/disciplina:", error);
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
    const { id, fase_status } = body as {
        id: string;
        fase_status: string;
    };

    if (!id || !fase_status) {
        return NextResponse.json(
            { error: "id e fase_status são obrigatórios" },
            { status: 400 }
        );
    }

    const validStatuses = ["plano_ensino", "diagnostica", "pei_disciplina", "concluido"];
    if (!validStatuses.includes(fase_status)) {
        return NextResponse.json(
            { error: `fase_status inválido. Valores aceitos: ${validStatuses.join(", ")}` },
            { status: 400 }
        );
    }

    const sb = getSupabase();
    const { data, error } = await sb
        .from("pei_disciplinas")
        .update({
            fase_status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("workspace_id", session.workspace_id)
        .select()
        .single();

    if (error) {
        console.error("PATCH /api/pei/disciplina:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pei_disciplina: data });
}
