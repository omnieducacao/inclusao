import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { classificarOrigem, dispositivoDe, ehRoboUA, validarEvento, visitanteDoDia } from "@/lib/site-eventos";

const VAZIO = () => new Response(null, { status: 204 });

/**
 * Recebe os eventos do site (onda 57): visita, clique e marco. Rota pública (PUBLIC_PATHS no proxy.ts).
 * O site manda por navigator.sendBeacon (texto com JSON). Sem cookie e sem guardar IP: veja lib/site-eventos.ts.
 * Sempre responde 204, mesmo quando descarta, para não dar pista a robôs.
 */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  if (ehRoboUA(ua)) return VAZIO();
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "").split(",")[0].trim() || "sem-ip";
  const dia = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const visitante = visitanteDoDia(ip, ua, dia);
  if (!checkRateLimit(`evento:${visitante}`, { maxRequests: 120, windowMs: 10 * 60 * 1000 }).success) return VAZIO();
  let body: unknown;
  try { body = JSON.parse(await req.text()); } catch { return VAZIO(); }
  const ev = validarEvento(body);
  if (!ev) return VAZIO();
  try {
    const { error } = await getSupabase().from("site_eventos").insert({
      ...ev, visitante, dispositivo: dispositivoDe(ua),
      origem: ev.tipo === "visita" ? classificarOrigem(ev.ref_host, ev.utm_source) : null,
    });
    if (error) throw error;
  } catch (err) {
    logger.warn({ err }, "POST /api/public/evento");
  }
  return VAZIO();
}
