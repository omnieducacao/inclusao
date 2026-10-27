import { NextResponse } from "next/server";
import { encerrarSessao } from "@/lib/app/sessao";

/** Frente 6 · POST /api/app/v1/auth/sair {renovacao}: encerra a sessão deste celular. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { renovacao?: unknown };
  await encerrarSessao(typeof body.renovacao === "string" ? body.renovacao : "");
  return NextResponse.json({ ok: true });
}
