import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { ehRobo, validarLead } from "@/lib/leads";

/**
 * Pedido de contato da home de vendas (onda 39). Rota pública (sem login): está em PUBLIC_PATHS no proxy.ts.
 * Proteções: armadilha para robôs (campo "site"), limite de 5 pedidos por hora por IP e o limitador geral do proxy.
 */
const LIMITE_POR_HORA = 5;

function hashDoIp(req: Request): string | null {
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "").split(",")[0].trim();
  if (!ip) return null;
  return createHash("sha256").update(`omnisfera-leads:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o formulário." }, { status: 400 });
  }

  // robô: responde como se tivesse dado certo, sem gravar
  if (ehRobo(body)) return NextResponse.json({ ok: true });

  const r = validarLead(body);
  if (!r.ok) return NextResponse.json({ error: "Confira os campos marcados.", erros: r.erros }, { status: 400 });

  const ip_hash = hashDoIp(req);
  try {
    const sb = getSupabase();
    if (ip_hash) {
      const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await sb.from("leads").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", desde);
      if ((count || 0) >= LIMITE_POR_HORA) {
        return NextResponse.json({ error: "Recebemos vários pedidos deste endereço. Tente de novo em uma hora." }, { status: 429 });
      }
    }
    const { data, error } = await sb
      .from("leads")
      .insert({ ...r.lead, ip_hash, consentimento_em: new Date().toISOString() })
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    logger.error({ err }, "POST /api/public/contato");
    return NextResponse.json({ error: "Não conseguimos registrar agora. Tente de novo em alguns minutos." }, { status: 500 });
  }
}
