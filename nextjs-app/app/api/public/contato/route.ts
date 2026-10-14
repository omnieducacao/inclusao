import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { gravarLead } from "@/lib/leads-server";

/**
 * Pedido de contato da página inicial (onda 39). Rota pública (sem login): está em PUBLIC_PATHS no proxy.ts.
 * Proteções: armadilha para robôs (campo "site"), limite de 5 pedidos por hora por IP e o limitador geral do proxy.
 */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Não foi possível ler o formulário." }, { status: 400 }); }
  try {
    const r = await gravarLead(req, body);
    if (!r.ok) return NextResponse.json({ error: r.error, erros: r.erros }, { status: r.status });
    return NextResponse.json({ ok: true, id: r.id });
  } catch (err) {
    logger.error({ err }, "POST /api/public/contato");
    return NextResponse.json({ error: "Não conseguimos registrar agora. Tente de novo em alguns minutos." }, { status: 500 });
  }
}
