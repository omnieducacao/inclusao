import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { moduloDaRota } from "@/lib/demo-modulos";

/** Guarda no contato (lead) quais módulos o visitante abriu na demonstração, para a equipe saber o que mais interessou. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.is_demo || !session.demo_lead_id) return NextResponse.json({ ok: true });
  const { rota } = (await req.json().catch(() => ({}))) as { rota?: string };
  const modulo = moduloDaRota(rota || "");
  if (!modulo) return NextResponse.json({ ok: true });
  const sb = getSupabase();
  const { data } = await sb.from("leads").select("modulos_vistos").eq("id", session.demo_lead_id).maybeSingle();
  const vistos: string[] = Array.isArray(data?.modulos_vistos) ? (data!.modulos_vistos as string[]) : [];
  if (!vistos.includes(modulo)) {
    await sb.from("leads").update({ modulos_vistos: [...vistos, modulo].slice(0, 30), updated_at: new Date().toISOString() }).eq("id", session.demo_lead_id);
  }
  return NextResponse.json({ ok: true });
}
