import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/plano-curso?componente=xxx&serie=xxx
 * Lista planos de curso do professor logado.
 * Filtra por componente e/ou série se fornecidos.
 *
 * POST /api/plano-curso
 * Cria ou atualiza plano de curso.
 * Body: { id?, componente, serie, serie_code?, bimestre, conteudo, habilidades_bncc? }
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const componente = url.searchParams.get("componente");
    const serie = url.searchParams.get("serie");
    const id = url.searchParams.get("id");

    const sb = getSupabase();

    // Resolve member_id
    let memberId = (session.member as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!memberId) {
        const { data: m } = await sb
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", session.workspace_id)
            .eq("nome", session.usuario_nome)
            .maybeSingle();
        memberId = m?.id || undefined;
    }

    // Fetch by ID
    if (id) {
        const { data, error } = await sb
            .from("planos_ensino")
            .select("*")
            .eq("id", id)
            .eq("workspace_id", session.workspace_id)
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ plano: data });
    }

    // Fetch by filters
    let query = sb
        .from("planos_ensino")
        .select("*")
        .eq("workspace_id", session.workspace_id);

    if (componente) query = query.eq("disciplina", componente);
    if (serie) query = query.eq("ano_serie", serie);

    // Only show own plans (unless master)
    const isMaster = !!(session.member as Record<string, boolean> | undefined)?.is_master ||
        session.is_platform_admin;
    if (!isMaster && memberId) {
        query = query.eq("professor_id", memberId);
    }

    const { data, error } = await query.order("disciplina").order("ano_serie").order("bimestre");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ planos: data || [] });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        id, componente, serie, serie_code,
        bimestre, conteudo, habilidades_bncc,
    } = body as {
        id?: string;
        componente: string;
        serie: string;
        serie_code?: string;
        bimestre?: string;
        conteudo?: string;
        habilidades_bncc?: string[];
    };

    if (!componente || !serie) {
        return NextResponse.json({ error: "componente e serie obrigatórios" }, { status: 400 });
    }

    const sb = getSupabase();

    // Resolve member_id
    let memberId = (session.member as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!memberId) {
        const { data: m } = await sb
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", session.workspace_id)
            .eq("nome", session.usuario_nome)
            .maybeSingle();
        memberId = m?.id || undefined;
    }

    const record = {
        workspace_id: session.workspace_id,
        disciplina: componente,
        ano_serie: serie,
        bimestre: bimestre || null,
        conteudo: conteudo || null,
        habilidades_bncc: habilidades_bncc || [],
        professor_nome: session.usuario_nome || "Professor",
        professor_id: memberId,
        updated_at: new Date().toISOString(),
    };

    if (id) {
        const { data, error } = await sb
            .from("planos_ensino")
            .update(record)
            .eq("id", id)
            .eq("workspace_id", session.workspace_id)
            .select()
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, plano: data });
    }

    const { data, error } = await sb
        .from("planos_ensino")
        .insert(record)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, plano: data });
}
