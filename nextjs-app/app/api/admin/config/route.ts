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

export async function GET(req: Request) {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Parâmetro 'key' é obrigatório." }, { status: 400 });
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("platform_config")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar config:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ value: data?.value || "" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar configuração." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Chave é obrigatória." }, { status: 400 });
    }

    const sb = getSupabase();
    
    // Tentar atualizar primeiro
    const { data: existing } = await sb
      .from("platform_config")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      const { error } = await sb
        .from("platform_config")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await sb
        .from("platform_config")
        .insert({ key, value, created_at: new Date().toISOString() });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao salvar configuração." },
      { status: 500 }
    );
  }
}
