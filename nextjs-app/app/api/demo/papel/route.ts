import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { papelDemoValido } from "@/lib/demo";
import { abrirSessaoDemo } from "@/lib/demo-sessao";
import { logger } from "@/lib/logger";

/** Na demonstração, troca o papel do visitante (AEE, regente, coordenação) sem pedir o cadastro de novo. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.is_demo) return NextResponse.json({ error: "Só na demonstração." }, { status: 403 });
  const { papel } = (await req.json().catch(() => ({}))) as { papel?: string };
  if (!papelDemoValido(papel)) return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  try {
    const destino = await abrirSessaoDemo(papel, session.demo_lead_id ?? null, "demo_papel");
    return NextResponse.json({ ok: true, redirect: destino });
  } catch (err) {
    logger.error({ err }, "POST /api/demo/papel");
    return NextResponse.json({ error: "Não foi possível trocar de papel." }, { status: 500 });
  }
}
