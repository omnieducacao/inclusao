import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

async function checkAdmin() {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("platform_issues")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Erro ao listar issues:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issues: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar issues." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;
  
  const session = await getSession();

  try {
    const body = await req.json();
    const { title, description, severity, workspace_id, source, created_by } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from("platform_issues")
      .insert({
        title: title.trim(),
        description: description || "",
        severity: severity || "média",
        workspace_id: workspace_id || null,
        source: source || "",
        created_by: created_by || session?.usuario_nome || "Admin",
        status: "aberto",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ issue: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar issue." },
      { status: 500 }
    );
  }
}
