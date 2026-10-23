import { NextResponse } from "next/server";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { gravarLead } from "@/lib/leads-server";
import { PAPEIS_DEMO, papelDemoValido } from "@/lib/demo";
import { abrirSessaoDemo } from "@/lib/demo-sessao";

/**
 * Entrada da demonstração (onda 44): grava o cadastro curto como contato (lead) e abre a sessão de visitante
 * na Escola Demo, no papel escolhido. Rota pública: "/api/public/" está liberada no proxy.ts.
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.FORM_PUBLIC); if (rl) return rl; // SCRUM-229
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Não foi possível ler o formulário." }, { status: 400 }); }
  const papel = body.papel;
  if (!papelDemoValido(papel)) return NextResponse.json({ error: "Escolha com qual papel quer entrar.", erros: { papel: "Escolha um papel." } }, { status: 400 });
  try {
    const r = await gravarLead(req, { ...body, origem: "demonstracao", papel_demo: PAPEIS_DEMO[papel].rotulo });
    if (!r.ok) return NextResponse.json({ error: r.error, erros: r.erros }, { status: r.status });
    if (r.robo) return NextResponse.json({ ok: true, redirect: "/" });
    const destino = await abrirSessaoDemo(papel, r.id);
    return NextResponse.json({ ok: true, redirect: destino });
  } catch (err) {
    logger.error({ err }, "POST /api/public/demonstracao");
    return NextResponse.json({ error: "Não conseguimos abrir a demonstração agora. Tente de novo em alguns minutos." }, { status: 500 });
  }
}
