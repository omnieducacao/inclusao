import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/familia/medicacao?student_id=xxx
 * Lista alterações de medicação registradas pela família.
 *
 * POST /api/familia/medicacao
 * Body: { student_id, medicamento, dosagem?, tipo_alteracao, observacao? }
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id || session.user_role !== "family") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const familyId = session.family_responsible_id;
    if (!familyId) {
        return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const url = new URL(req.url);
    const studentId = url.searchParams.get("student_id");
    if (!studentId) {
        return NextResponse.json({ error: "student_id obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();

    // Verificar vínculo
    const { data: link } = await sb
        .from("family_student_links")
        .select("id")
        .eq("family_responsible_id", familyId)
        .eq("student_id", studentId)
        .maybeSingle();

    if (!link) {
        return NextResponse.json({ error: "Estudante não vinculado" }, { status: 403 });
    }

    try {
        const { data: registros, error } = await sb
            .from("family_medicacao_updates")
            .select("id, medicamento, dosagem, tipo_alteracao, observacao, created_at")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[familia/medicacao] GET error:", error.message);
            return NextResponse.json({ registros: [] });
        }

        return NextResponse.json({ registros: registros || [] });
    } catch {
        return NextResponse.json({ registros: [] });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id || session.user_role !== "family") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const familyId = session.family_responsible_id;
    if (!familyId) {
        return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { student_id, medicamento, dosagem, tipo_alteracao, observacao } = body;

        if (!student_id || !medicamento?.trim() || !tipo_alteracao?.trim()) {
            return NextResponse.json(
                { error: "student_id, medicamento e tipo_alteracao são obrigatórios." },
                { status: 400 }
            );
        }

        const validTypes = ["inicio", "suspensao", "mudanca_dose"];
        if (!validTypes.includes(tipo_alteracao)) {
            return NextResponse.json(
                { error: `tipo_alteracao deve ser: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        const sb = getSupabase();

        // Verificar vínculo
        const { data: link } = await sb
            .from("family_student_links")
            .select("id")
            .eq("family_responsible_id", familyId)
            .eq("student_id", student_id)
            .maybeSingle();

        if (!link) {
            return NextResponse.json({ error: "Estudante não vinculado" }, { status: 403 });
        }

        const { data: registro, error: insertError } = await sb
            .from("family_medicacao_updates")
            .insert({
                student_id,
                family_responsible_id: familyId,
                medicamento: medicamento.trim(),
                dosagem: dosagem?.trim() || null,
                tipo_alteracao,
                observacao: observacao?.trim() || null,
            })
            .select("id, medicamento, dosagem, tipo_alteracao, observacao, created_at")
            .single();

        if (insertError) {
            console.error("[familia/medicacao] INSERT error:", insertError.message);
            return NextResponse.json({ error: "Erro ao salvar registro." }, { status: 500 });
        }

        return NextResponse.json({ registro }, { status: 201 });
    } catch (err) {
        console.error("[familia/medicacao] POST error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao registrar medicação." },
            { status: 500 }
        );
    }
}
