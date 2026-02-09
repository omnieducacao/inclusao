import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb.from("workspaces").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar workspaces:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalizar dados (compatível com Streamlit)
    const workspaces = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name || "",
      pin: row.pin || row.pin_code || row.code || "",
      segments: row.segments || [],
      ai_engines: row.ai_engines || [],
      enabled_modules: row.enabled_modules,
      active: row.active !== false,
      plan: row.plan || "basic",
      credits_limit: row.credits_limit || null,
      created_at: row.created_at,
    }));

    return NextResponse.json({ workspaces });
  } catch (err) {
    console.error("GET /api/admin/workspaces:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar escolas." },
      { status: 500 }
    );
  }
}

function generatePin(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${p1}-${p2}`;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, segments, ai_engines } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome da escola é obrigatório." }, { status: 400 });
    }

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos um segmento." }, { status: 400 });
    }

    if (!ai_engines || !Array.isArray(ai_engines) || ai_engines.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos um motor de IA." }, { status: 400 });
    }

    const pin = generatePin();
    const sb = getSupabase();

    const { data, error } = await sb
      .from("workspaces")
      .insert({
        name: name.trim(),
        pin,
        segments,
        ai_engines,
        enabled_modules: null, // null = todos habilitados por padrão
        active: true,
        plan: "basic",
        credits_limit: null,
      })
      .select("id, name, pin, segments, ai_engines, enabled_modules, active, plan, credits_limit, created_at")
      .single();

    if (error) {
      console.error("Erro ao criar workspace:", error);
      return NextResponse.json({ error: error.message || "Erro ao criar escola." }, { status: 500 });
    }

    return NextResponse.json({ workspace: data, pin });
  } catch (err) {
    console.error("POST /api/admin/workspaces:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar escola." },
      { status: 500 }
    );
  }
}
