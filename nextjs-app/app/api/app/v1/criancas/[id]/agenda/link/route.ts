import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashToken, pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 105 · o link do calendário (iCal) que a pessoa assina no Google, no iPhone ou no Outlook.
 * GET    → { tem_link } (o endereço não é guardado: só o hash do segredo)
 * POST   → cria um link novo e desliga o anterior desta pessoa para esta criança; devolve o endereço uma vez
 * DELETE → desliga o link
 * Cada pessoa tem o seu link e vê no calendário só o que já veria no app.
 */
type Ctx = { params: Promise<{ id: string }> };
const BASE = "https://www.omnisfera.net/api/app/v1/calendario";

async function quem(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return { erro: NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 }) };
  return { pessoaId, id, papel: acesso.papel };
}

export async function GET(req: Request, ctx: Ctx) {
  const q = await quem(req, ctx);
  if ("erro" in q) return q.erro;
  const { data, error } = await getSupabase().from("app_agenda_links").select("id, created_at, ultimo_acesso_em").eq("pessoa_id", q.pessoaId).eq("crianca_id", q.id).is("revogado_em", null);
  if (error) return NextResponse.json({ error: "A agenda chega em breve.", em_breve: true }, { status: 503 });
  const l = ((data as { created_at: string; ultimo_acesso_em: string | null }[] | null) || [])[0];
  return NextResponse.json({ tem_link: !!l, criado_em: l?.created_at ?? null, ultimo_acesso_em: l?.ultimo_acesso_em ?? null });
}

export async function POST(req: Request, ctx: Ctx) {
  const q = await quem(req, ctx);
  if ("erro" in q) return q.erro;
  const sb = getSupabase();
  const agora = new Date().toISOString();
  const { error } = await sb.from("app_agenda_links").update({ revogado_em: agora }).eq("pessoa_id", q.pessoaId).eq("crianca_id", q.id).is("revogado_em", null);
  if (error) return NextResponse.json({ error: "A agenda chega em breve.", em_breve: true }, { status: 503 });
  const segredo = randomBytes(24).toString("base64url");
  await sb.from("app_agenda_links").insert({ pessoa_id: q.pessoaId, crianca_id: q.id, token_hash: hashToken(`agenda:${segredo}`), created_at: agora });
  await logAction({ actorId: q.pessoaId, actorRole: q.papel, action: "create", resourceType: "agenda_link", resourceId: q.id, req });
  return NextResponse.json({ ok: true, url: `${BASE}/${segredo}.ics` }, { status: 201 });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const q = await quem(req, ctx);
  if ("erro" in q) return q.erro;
  await getSupabase().from("app_agenda_links").update({ revogado_em: new Date().toISOString() }).eq("pessoa_id", q.pessoaId).eq("crianca_id", q.id).is("revogado_em", null);
  await logAction({ actorId: q.pessoaId, actorRole: q.papel, action: "delete", resourceType: "agenda_link", resourceId: q.id, req });
  return NextResponse.json({ ok: true });
}
