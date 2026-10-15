import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { resumirAcessos, type LeadResumo, type LinhaAcesso } from "@/lib/acessos-resumo";

/** Logins e visitas à demonstração para a aba "Acessos" (onda 57). Só o admin da plataforma. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.is_platform_admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const dias = Math.min(Math.max(Number(new URL(req.url).searchParams.get("dias")) || 30, 1), 365);
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  try {
    const sb = getSupabase();
    const { data, error } = await sb.from("acessos")
      .select("criado_em, tipo, workspace_id, workspace_nome, usuario_nome, papel, lead_id, rota, modulo")
      .gte("criado_em", desde).order("criado_em", { ascending: false }).limit(10000);
    if (error) throw error;
    const linhas = (data || []) as LinhaAcesso[];
    const ids = [...new Set(linhas.map((l) => l.lead_id).filter(Boolean))] as string[];
    let leads: LeadResumo[] = [];
    if (ids.length) {
      const { data: ld } = await sb.from("leads").select("id, nome, escola, email").in("id", ids.slice(0, 500));
      leads = (ld || []) as LeadResumo[];
    }
    return NextResponse.json({ dias, ...resumirAcessos(linhas, leads) });
  } catch (err) {
    logger.error({ err }, "GET /api/admin/acessos");
    return NextResponse.json({ error: "Não foi possível carregar os acessos." }, { status: 500 });
  }
}
