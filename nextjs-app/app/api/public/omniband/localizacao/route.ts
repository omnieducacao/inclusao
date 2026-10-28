import { NextResponse } from "next/server";
import { receberLocalizacao } from "@/lib/app/omniband";

/**
 * Frente 6 · Omniband · quem encontrou a criança decidiu enviar a localização (botão na página de ajuda).
 * Pública: quem encontra não tem conta. Só vale com o convite (token) gerado quando a página abriu,
 * uma vez, por 30 minutos. A posição fica cifrada no registro da criança; a família recebe o aviso.
 */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const r = await receberLocalizacao(b.token, b.lat, b.lng, b.precisao);
  if (r === "ok") return NextResponse.json({ ok: true });
  if (r === "expirado") return NextResponse.json({ error: "Este pedido expirou. Encoste o celular na Omniband de novo." }, { status: 410 });
  return NextResponse.json({ error: "Não deu para enviar." }, { status: 400 });
}
