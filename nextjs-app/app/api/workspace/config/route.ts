import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("workspaces")
      .select("enabled_modules, ai_engines")
      .eq("id", session.workspace_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      enabled_modules: data?.enabled_modules || [],
      ai_engines: data?.ai_engines || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar configurações." },
      { status: 500 }
    );
  }
}
