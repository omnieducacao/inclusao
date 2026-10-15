import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { resumirSite, type LinhaEvento } from "@/lib/site-metricas";

/** Números do site para a aba "Site e funil" (onda 57). Só o admin da plataforma. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.is_platform_admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const dias = Math.min(Math.max(Number(new URL(req.url).searchParams.get("dias")) || 30, 1), 180);
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  try {
    const sb = getSupabase();
    const linhas: LinhaEvento[] = [];
    for (let de = 0; de < 100000; de += 1000) {
      const { data, error } = await sb.from("site_eventos").select("criado_em, tipo, pagina, alvo, origem, visitante, dispositivo")
        .gte("criado_em", desde).order("id", { ascending: true }).range(de, de + 999);
      if (error) throw error;
      linhas.push(...((data || []) as LinhaEvento[]));
      if (!data || data.length < 1000) break;
    }
    const [dem, con, cer] = await Promise.all([
      sb.from("leads").select("id", { count: "exact", head: true }).eq("origem", "demonstracao").gte("created_at", desde),
      sb.from("leads").select("id", { count: "exact", head: true }).eq("origem", "contato").gte("created_at", desde),
      sb.from("certificados").select("id", { count: "exact", head: true }).gte("emitido_em", desde),
    ]);
    return NextResponse.json(resumirSite(linhas, { demonstracoes: dem.count || 0, contatos: con.count || 0, certificados: cer.count || 0 }, dias));
  } catch (err) {
    logger.error({ err }, "GET /api/admin/site");
    return NextResponse.json({ error: "Não foi possível carregar os números do site." }, { status: 500 });
  }
}
