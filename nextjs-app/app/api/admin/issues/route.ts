import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "200");

  try {
    const sb = getSupabase();
    let query = sb
      .from("platform_issues")
      .select("id, workspace_id, title, description, severity, status, source, created_by, ai_insight, resolution_notes, resolved_at, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.max(1, limit));

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao listar issues:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issues: data || [] });
  } catch (err) {
    console.error("GET /api/admin/issues:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar bugs." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, severity, workspace_id, source, created_by, ai_insight } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
    }

    const sb = getSupabase();
    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: (description || "").trim(),
      severity: severity || "média",
      source: (source || "").trim(),
      created_by: (created_by || session.usuario_nome || "Admin").trim(),
      status: "aberto",
    };

    if (workspace_id) {
      payload.workspace_id = workspace_id;
    }
    if (ai_insight) {
      payload.ai_insight = ai_insight.trim();
    }

    const { data, error } = await sb.from("platform_issues").insert(payload).select().single();

    if (error) {
      console.error("Erro ao criar issue:", error);
      return NextResponse.json({ error: error.message || "Erro ao registrar bug." }, { status: 500 });
    }

    return NextResponse.json({ issue: data });
  } catch (err) {
    console.error("POST /api/admin/issues:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao registrar bug." },
      { status: 500 }
    );
  }
}
