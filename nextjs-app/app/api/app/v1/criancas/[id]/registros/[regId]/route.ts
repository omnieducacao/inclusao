import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 102 · DELETE: "desfazer" um registro feito há pouco (a ficha rápida do toque
 * registra em um toque; errou, desfaz). Apaga de forma reversível (apagado_em).
 * Quem registrou pode desfazer nos primeiros 15 minutos; a família, a qualquer hora.
 */
type Ctx = { params: Promise<{ id: string; regId: string }> };
export const JANELA_DESFAZER_MS = 15 * 60_000;

export async function DELETE(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, regId } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  const sb = getSupabase();
  const { data } = await sb.from("registros").select("id, autor_pessoa_id, created_at, apagado_em").eq("id", regId).eq("crianca_id", id).maybeSingle();
  const r = data as { id: string; autor_pessoa_id: string | null; created_at: string; apagado_em: string | null } | null;
  if (!r || r.apagado_em) return NextResponse.json({ error: "Registro não encontrado." }, { status: 404 });
  const meu = r.autor_pessoa_id === pessoaId;
  const criado = Date.parse(r.created_at || "");
  const recente = Number.isNaN(criado) || Date.now() - criado <= JANELA_DESFAZER_MS;
  if (!(acesso.papel === "responsavel" || (meu && recente))) {
    return NextResponse.json({ error: "Só quem registrou pode desfazer, e nos primeiros 15 minutos." }, { status: 403 });
  }
  const { error } = await sb.from("registros").update({ apagado_em: new Date().toISOString() }).eq("id", regId);
  if (error) return NextResponse.json({ error: "Não deu para desfazer agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "delete", resourceType: "registro", resourceId: regId, metadata: { desfazer: true }, req });
  return NextResponse.json({ ok: true });
}
