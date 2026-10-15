import { createHash } from "crypto";
import { getSupabase } from "@/lib/supabase";
import { ehRobo, validarLead } from "@/lib/leads";

const LIMITE_POR_HORA = 5;

export function hashDoIp(req: Request): string | null {
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "").split(",")[0].trim();
  if (!ip) return null;
  return createHash("sha256").update(`omnisfera-leads:${ip}`).digest("hex").slice(0, 32);
}

export type ResultadoGravacao =
  | { ok: true; id: string | null; robo?: boolean }
  | { ok: false; status: number; error: string; erros?: Record<string, string> };

/** Valida e grava um contato (lead). Usado pelo formulário de contato e pela entrada da demonstração. */
export async function gravarLead(req: Request, body: unknown): Promise<ResultadoGravacao> {
  if (ehRobo(body)) return { ok: true, id: null, robo: true };
  const r = validarLead(body);
  if (!r.ok) return { ok: false, status: 400, error: "Confira os campos marcados.", erros: r.erros };
  const sb = getSupabase();
  const ip_hash = hashDoIp(req);
  if (ip_hash) {
    const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await sb.from("leads").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", desde);
    if ((count || 0) >= LIMITE_POR_HORA) return { ok: false, status: 429, error: "Recebemos vários pedidos deste endereço. Tente de novo em uma hora." };
  }
  const { data, error } = await sb.from("leads").insert({ ...r.lead, ip_hash, consentimento_em: new Date().toISOString() }).select("id").single();
  if (error) throw error;
  return { ok: true, id: (data?.id as string) ?? null };
}
