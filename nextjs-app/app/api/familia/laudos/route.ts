import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/familia/laudos?student_id=xxx
 * Lista laudos enviados pela família para o estudante.
 *
 * POST /api/familia/laudos
 * Body: FormData com "file" (PDF/imagem) + "student_id"
 * Transcreve via /api/pei/transcrever-laudo e salva na tabela.
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

    // Listar laudos
    try {
        const { data: laudos, error } = await sb
            .from("family_laudos")
            .select("id, transcricao, nome_arquivo, created_at")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[familia/laudos] GET error:", error.message);
            return NextResponse.json({ laudos: [] });
        }

        return NextResponse.json({ laudos: laudos || [] });
    } catch {
        return NextResponse.json({ laudos: [] });
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
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const studentId = formData.get("student_id") as string | null;

        if (!file || !file.size) {
            return NextResponse.json({ error: "Envie um arquivo (PDF ou imagem)." }, { status: 400 });
        }
        if (!studentId) {
            return NextResponse.json({ error: "student_id obrigatório." }, { status: 400 });
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

        // Transcrever via API interna
        const transcreverForm = new FormData();
        transcreverForm.append("file", file);

        const origin = new URL(req.url).origin;
        const transcreverRes = await fetch(`${origin}/api/pei/transcrever-laudo`, {
            method: "POST",
            body: transcreverForm,
            headers: {
                cookie: req.headers.get("cookie") || "",
            },
        });

        if (!transcreverRes.ok) {
            const errBody = await transcreverRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errBody.error || "Erro ao transcrever documento." },
                { status: 500 }
            );
        }

        const { transcricao } = await transcreverRes.json();

        if (!transcricao) {
            return NextResponse.json({ error: "Não foi possível transcrever o documento." }, { status: 500 });
        }

        // Salvar na tabela
        const { data: laudo, error: insertError } = await sb
            .from("family_laudos")
            .insert({
                student_id: studentId,
                family_responsible_id: familyId,
                transcricao,
                nome_arquivo: file.name || null,
            })
            .select("id, transcricao, nome_arquivo, created_at")
            .single();

        if (insertError) {
            console.error("[familia/laudos] INSERT error:", insertError.message);
            return NextResponse.json({ error: "Erro ao salvar laudo." }, { status: 500 });
        }

        return NextResponse.json({ laudo }, { status: 201 });
    } catch (err) {
        console.error("[familia/laudos] POST error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao processar laudo." },
            { status: 500 }
        );
    }
}
