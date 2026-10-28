import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { TOKEN_EXPO } from "@/lib/app/avisos";

/**
 * Frente 6 · aparelho que recebe avisos (notificação push da Expo).
 * POST   { token, plataforma } → liga este aparelho a quem está logado (troca de dono se o aparelho mudou de mãos)
 * DELETE { token }             → para de avisar neste aparelho (ao sair do app)
 */
const PLATAFORMAS = new Set(["ios", "android", "web"]);

export async function POST(req: Request) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const token = typeof b.token === "string" ? b.token.trim() : "";
  if (!TOKEN_EXPO.test(token)) return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  const plataforma = typeof b.plataforma === "string" && PLATAFORMAS.has(b.plataforma) ? b.plataforma : null;
  const sb = getSupabase();
  const agora = new Date().toISOString();
  const { data: ja } = await sb.from("app_dispositivos").select("id").eq("token", token).maybeSingle();
  const { error } = ja
    ? await sb.from("app_dispositivos").update({ pessoa_id: pessoaId, plataforma, ativo: true, updated_at: agora }).eq("token", token)
    : await sb.from("app_dispositivos").insert({ pessoa_id: pessoaId, token, plataforma, ativo: true });
  if (error) return NextResponse.json({ error: "Não deu para ligar os avisos agora." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const token = typeof b.token === "string" ? b.token.trim() : "";
  await getSupabase().from("app_dispositivos").update({ ativo: false, updated_at: new Date().toISOString() }).eq("token", token).eq("pessoa_id", pessoaId);
  return NextResponse.json({ ok: true });
}
