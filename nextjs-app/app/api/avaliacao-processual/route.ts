import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

// ── Avaliação Processual Bimestral ────────────────────────────────────
// Registered every semester by the regente teacher per discipline.
// Tracks student evolution on Omnisfera scale (0-4) per BNCC skill.

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const disciplina = searchParams.get("disciplina");
    const bimestre = searchParams.get("bimestre");

    const supabase = getSupabase();

    let query = supabase
        .from("avaliacao_processual")
        .select("*")
        .eq("workspace_id", session.workspace_id)
        .order("created_at", { ascending: false });

    if (studentId) query = query.eq("student_id", studentId);
    if (disciplina) query = query.eq("disciplina", disciplina);
    if (bimestre) query = query.eq("bimestre", parseInt(bimestre));

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ registros: data || [] });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const professorId = (session as Record<string, unknown>).member_id as string || session.workspace_id;

    const body = await req.json();
    const {
        studentId,
        disciplina,
        bimestre,
        ano_letivo,
        habilidades,       // Array<{ codigo_bncc, nivel_atual, nivel_anterior?, observacao }>
        observacao_geral,
        dimensoes_nee,      // Array<{ dimensao_id, nivel, observacao }>
    } = body;

    if (!studentId || !disciplina || !bimestre) {
        return NextResponse.json({
            error: "Campos obrigatórios: studentId, disciplina, bimestre",
        }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check if record already exists for this student/discipline/bimestre/year
    const { data: existing } = await supabase
        .from("avaliacao_processual")
        .select("id")
        .eq("workspace_id", session.workspace_id)
        .eq("student_id", studentId)
        .eq("disciplina", disciplina)
        .eq("bimestre", bimestre)
        .eq("ano_letivo", ano_letivo || new Date().getFullYear())
        .maybeSingle();

    const record = {
        workspace_id: session.workspace_id,
        student_id: studentId,
        professor_id: professorId,
        disciplina,
        bimestre: parseInt(bimestre),
        ano_letivo: ano_letivo || new Date().getFullYear(),
        habilidades: habilidades || [],
        dimensoes_nee: dimensoes_nee || [],
        observacao_geral: observacao_geral || "",
        updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
        // Update existing
        const { error } = await supabase
            .from("avaliacao_processual")
            .update(record)
            .eq("id", existing.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, id: existing.id, action: "updated" });
    }

    // Create new
    const { data: inserted, error } = await supabase
        .from("avaliacao_processual")
        .insert({ ...record, created_at: new Date().toISOString() })
        .select("id")
        .single();

    if (error) {
        // If table doesn't exist, return helpful message
        if (error.message.includes("relation") || error.code === "42P01") {
            return NextResponse.json({
                error: "Tabela avaliacao_processual ainda não criada",
                sql_sugerido: `CREATE TABLE avaliacao_processual (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    student_id UUID NOT NULL REFERENCES students(id),
    professor_id UUID NOT NULL,
    disciplina TEXT NOT NULL,
    bimestre INTEGER NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
    ano_letivo INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    habilidades JSONB DEFAULT '[]',
    dimensoes_nee JSONB DEFAULT '[]',
    observacao_geral TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, student_id, disciplina, bimestre, ano_letivo)
);`,
            }, { status: 500 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: inserted?.id, action: "created" });
}
