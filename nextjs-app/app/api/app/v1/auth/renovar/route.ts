import { NextResponse } from "next/server";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { renovarSessao } from "@/lib/app/sessao";

/** Frente 6 · POST /api/app/v1/auth/renovar {renovacao} → par novo (o antigo é revogado). */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH_IP); if (rl) return rl;
  const body = (await req.json().catch(() => ({}))) as { renovacao?: unknown };
  const par = await renovarSessao(typeof body.renovacao === "string" ? body.renovacao : "");
  if (!par) return NextResponse.json({ error: "Sua sessão terminou. Entre de novo." }, { status: 401 });
  return NextResponse.json({ ok: true, ...par });
}
