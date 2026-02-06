import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

// Verificar se é admin da plataforma
async function checkAdmin() {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado. Apenas administradores da plataforma." }, { status: 403 });
  }
  return null;
}

// Gerar PIN aleatório de 6 dígitos
function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET() {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  try {
    const sb = getSupabase();
    const { data, error } = await sb.from("workspaces").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar workspaces:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workspaces: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar workspaces." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const { name, segments, ai_engines } = body;

    if (!name?.trim()) {
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
        active: true,
        plan: "basic",
        enabled_modules: ["pei", "paee", "hub", "diario", "avaliacao"],
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar workspace:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workspace: data, pin });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar workspace." },
      { status: 500 }
    );
  }
}
