import { parseBody, adminPlatformConfigSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || "terms_of_use";

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("platform_config")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar platform_config:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ value: data?.value || "" });
  } catch (err) {
    console.error("GET /api/admin/platform-config:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar configuração." },
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
    const parsed = await parseBody(req, adminPlatformConfigSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json({ error: "key e value são obrigatórios." }, { status: 400 });
    }

    const sb = getSupabase();
    // Upsert usando merge-duplicates
    const { error } = await sb
      .from("platform_config")
      .upsert({ key, value: String(value).trim() }, { onConflict: "key" });

    if (error) {
      console.error("Erro ao salvar platform_config:", error);
      return NextResponse.json({ error: error.message || "Erro ao salvar configuração." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/platform-config:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao salvar configuração." },
      { status: 500 }
    );
  }
}
