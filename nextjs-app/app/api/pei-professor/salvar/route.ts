import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/pei-professor/salvar
 * Salva/atualiza o PEI da disciplina editado pelo professor.
 *
 * Body: { student_id, disciplina, pei_disciplina_data, fase_status? }
 */
export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id || !session.member?.id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { student_id, disciplina, pei_disciplina_data, fase_status } = body as {
        student_id: string;
        disciplina: string;
        pei_disciplina_data: Record<string, unknown>;
        fase_status?: string;
    };

    if (!student_id || !disciplina || !pei_disciplina_data) {
        return NextResponse.json(
            { error: "student_id, disciplina e pei_disciplina_data obrigatórios" },
            { status: 400 }
        );
    }

    const sb = getSupabase();

    // Verificar que o registro existe
    const { data: existing } = await sb
        .from("pei_disciplinas")
        .select("id, fase_status")
        .eq("student_id", student_id)
        .eq("disciplina", disciplina)
        .eq("workspace_id", session.workspace_id)
        .maybeSingle();

    if (!existing) {
        return NextResponse.json({ error: "Registro de disciplina não encontrado" }, { status: 404 });
    }

    // Atualizar
    const updatePayload: Record<string, unknown> = {
        pei_disciplina_data: {
            ...pei_disciplina_data,
            editado_por: session.member.id,
            editado_em: new Date().toISOString(),
        },
    };

    if (fase_status) {
        updatePayload.fase_status = fase_status;
    }

    const { error } = await sb
        .from("pei_disciplinas")
        .update(updatePayload)
        .eq("id", existing.id);

    if (error) {
        console.error("[pei-professor/salvar] error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
