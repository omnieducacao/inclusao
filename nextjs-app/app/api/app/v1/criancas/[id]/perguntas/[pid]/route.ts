import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { SUBTIPO_PERGUNTA } from "@/lib/app/perguntas";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 112 · uma pergunta para a consulta. Só a família.
 * PATCH  → { respondida: true|false, resposta? } marca (ou desmarca) como respondida
 * DELETE → apaga (de forma reversível, apagado_em)
 */
type Ctx = { params: Promise<{ id: string; pid: string }> };

async function abrir(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id, pid } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") return { erro: NextResponse.json({ error: "As perguntas para a consulta são só da família." }, { status: 403 }) };
  const sb = getSupabase();
  const { data } = await sb.from("registros").select("id, dados, apagado_em").eq("id", pid).eq("crianca_id", id).eq("subtipo", SUBTIPO_PERGUNTA).maybeSingle();
  const r = data as { id: string; dados: Record<string, unknown> | null; apagado_em: string | null } | null;
  if (!r || r.apagado_em) return { erro: NextResponse.json({ error: "Pergunta não encontrada." }, { status: 404 }) };
  return { pessoaId, acesso, sb, r, pid };
}

export async function PATCH(req: Request, ctx: Ctx) {
  const a = await abrir(req, ctx);
  if ("erro" in a) return a.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof b.respondida !== "boolean") return NextResponse.json({ error: "Diga se foi respondida." }, { status: 400 });
  const resposta = typeof b.resposta === "string" && b.resposta.trim() ? b.resposta.trim().slice(0, 300) : null;
  const dados = { ...(a.r.dados || {}), reservado: true, respondida_em: b.respondida ? new Date().toISOString() : null, resposta: b.respondida ? resposta : null };
  const { error } = await a.sb.from("registros").update({ dados }).eq("id", a.pid);
  if (error) return NextResponse.json({ error: "Não deu para salvar agora." }, { status: 500 });
  await logAction({ actorId: a.pessoaId, actorRole: a.acesso.papel, action: "update", resourceType: "pergunta", resourceId: a.pid, req });
  return NextResponse.json({ ok: true, respondida_em: dados.respondida_em });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const a = await abrir(req, ctx);
  if ("erro" in a) return a.erro;
  const { error } = await a.sb.from("registros").update({ apagado_em: new Date().toISOString() }).eq("id", a.pid);
  if (error) return NextResponse.json({ error: "Não deu para apagar agora." }, { status: 500 });
  await logAction({ actorId: a.pessoaId, actorRole: a.acesso.papel, action: "delete", resourceType: "pergunta", resourceId: a.pid, req });
  return NextResponse.json({ ok: true });
}
