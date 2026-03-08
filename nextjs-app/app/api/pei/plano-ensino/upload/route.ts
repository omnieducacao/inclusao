import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * POST /api/pei/plano-ensino/upload
 * Upload de PDF do plano de ensino para Supabase Storage.
 * FormData: { file: File, disciplina: string, ano_serie: string }
 *
 * Returns: { ok: true, arquivo_url: string, plano: { ... } }
 */
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const disciplina = formData.get("disciplina") as string;
    const anoSerie = formData.get("ano_serie") as string;

    if (!file || file.size === 0) {
        return NextResponse.json({ error: "Arquivo é obrigatório" }, { status: 400 });
    }

    if (!disciplina || !anoSerie) {
        return NextResponse.json({ error: "disciplina e ano_serie são obrigatórios" }, { status: 400 });
    }

    // Validate file type and size
    if (!file.type.includes("pdf")) {
        return NextResponse.json({ error: "Apenas arquivos PDF são aceitos" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Arquivo deve ter no máximo 10MB" }, { status: 400 });
    }

    const sb = getSupabase();

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `${session.workspace_id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `planos-ensino/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await sb.storage
        .from("omnisfera-docs")
        .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        logger.error({ err: uploadError }, "[plano-ensino/upload] Storage error:");
        return NextResponse.json(
            { error: `Erro no upload: ${uploadError.message}` },
            { status: 500 }
        );
    }

    const { data: urlData } = sb.storage
        .from("omnisfera-docs")
        .getPublicUrl(filePath);

    const arquivoUrl = urlData.publicUrl;

    // Save plano_ensino record
    const { data: plano, error: dbError } = await sb
        .from("planos_ensino")
        .insert({
            workspace_id: session.workspace_id,
            disciplina,
            ano_serie: anoSerie,
            conteudo: null,
            arquivo_url: arquivoUrl,
            habilidades_bncc: [],
            professor_nome: session.usuario_nome || "Professor",
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (dbError) {
        logger.error({ err: dbError }, "[plano-ensino/upload] DB error:");
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, arquivo_url: arquivoUrl, plano });
}
