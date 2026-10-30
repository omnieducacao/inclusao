import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { APOIO_PADRAO, lerApoio } from "@/lib/app/apoio";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 108 · GET/PUT /api/app/v1/criancas/:id/apoio — o que acompanhar.
 * GET: quem tem acesso à criança lê (o app ajusta as telas); sem escolha, vem o padrão.
 * PUT {apoio: [...]}: só a família muda.
 * Sem a migração no banco: o GET devolve o padrão e o PUT responde 503 "em breve".
 */
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await acessoACrianca(pessoaId, id))) return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  const { data, error } = await getSupabase().from("criancas").select("apoio").eq("id", id).maybeSingle();
  const lista = !error ? lerApoio((data as { apoio?: unknown } | null)?.apoio) : null;
  return NextResponse.json({ apoio: lista && lista.length ? lista : APOIO_PADRAO, escolhido: !!(lista && lista.length), em_breve: !!error });
}

export async function PUT(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família escolhe o que acompanhar." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const apoio = lerApoio(b.apoio);
  if (!apoio) return NextResponse.json({ error: "Escolha o que acompanhar na lista." }, { status: 400 });
  const { error } = await getSupabase().from("criancas").update({ apoio, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: "Esta parte chega em breve.", em_breve: true }, { status: 503 });
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "update", resourceType: "crianca_apoio", resourceId: id, metadata: { apoio }, req });
  return NextResponse.json({ ok: true, apoio });
}
