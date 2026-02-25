import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/pei/plano-ensino
 * Cria ou atualiza o plano de ensino de um professor regente.
 *
 * Body: { disciplina, ano_serie, conteudo?, arquivo_url?, habilidades_bncc?, bimestre?, professor_nome? }
 *
 * GET /api/pei/plano-ensino?disciplina=xxx&ano_serie=xxx
 * Busca plano de ensino existente.
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const disciplina = url.searchParams.get("disciplina");
    const anoSerie = url.searchParams.get("ano_serie");
    const id = url.searchParams.get("id");

    const sb = getSupabase();

    // Buscar por ID específico
    if (id) {
        const { data, error } = await sb
            .from("planos_ensino")
            .select("*")
            .eq("id", id)
            .eq("workspace_id", session.workspace_id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ plano: data });
    }

    // Buscar por disciplina + ano
    if (!disciplina) {
        // Listar todos os planos do workspace
        const { data, error } = await sb
            .from("planos_ensino")
            .select("*")
            .eq("workspace_id", session.workspace_id)
            .order("disciplina");

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ planos: data || [] });
    }

    let query = sb
        .from("planos_ensino")
        .select("*")
        .eq("workspace_id", session.workspace_id)
        .eq("disciplina", disciplina);

    if (anoSerie) {
        query = query.eq("ano_serie", anoSerie);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ planos: data || [] });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        id,
        disciplina,
        ano_serie,
        conteudo,
        arquivo_url,
        habilidades_bncc,
        bimestre,
        professor_nome,
    } = body as {
        id?: string;
        disciplina: string;
        ano_serie: string;
        conteudo?: unknown;
        arquivo_url?: string;
        habilidades_bncc?: string[];
        bimestre?: string;
        professor_nome?: string;
    };

    if (!disciplina || !ano_serie) {
        return NextResponse.json(
            { error: "disciplina e ano_serie são obrigatórios" },
            { status: 400 }
        );
    }

    const sb = getSupabase();

    // Resolve professor_id from session
    let professorId = (session.member as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!professorId) {
        const { data: m } = await sb
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", session.workspace_id)
            .eq("nome", session.usuario_nome)
            .maybeSingle();
        professorId = m?.id || undefined;
    }

    // Ensure conteudo is always a string (it may come as a parsed JSON object)
    const conteudoStr = conteudo
        ? (typeof conteudo === "string" ? conteudo : JSON.stringify(conteudo))
        : null;

    const record = {
        workspace_id: session.workspace_id,
        disciplina,
        ano_serie,
        conteudo: conteudoStr,
        arquivo_url: arquivo_url || null,
        habilidades_bncc: habilidades_bncc || [],
        bimestre: bimestre || null,
        professor_nome: professor_nome || session.usuario_nome,
        professor_id: professorId || null,
        updated_at: new Date().toISOString(),
    };

    // Atualizar existente
    if (id) {
        const { data, error } = await sb
            .from("planos_ensino")
            .update(record)
            .eq("id", id)
            .eq("workspace_id", session.workspace_id)
            .select()
            .single();

        if (error) {
            console.error("POST /api/pei/plano-ensino (update):", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ ok: true, plano: data });
    }

    // Criar novo
    const { data, error } = await sb
        .from("planos_ensino")
        .insert(record)
        .select()
        .single();

    if (error) {
        console.error("POST /api/pei/plano-ensino (create):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plano: data });
}
