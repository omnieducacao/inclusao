import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, ehUuid } from "@/lib/app/acesso";
import { lerCompromisso } from "@/lib/app/agenda";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 105 · um compromisso da agenda (só a família muda).
 * PATCH {campos…} muda a série toda; {acao: "pular", data: "AAAA-MM-DD"} tira só aquele dia da série;
 *       {acao: "voltar", data} desfaz o pulo.
 * DELETE cancela (a série toda); fica guardado, não aparece mais.
 */
type Ctx = { params: Promise<{ id: string; compromissoId: string }> };
const DATA = /^\d{4}-\d{2}-\d{2}$/;

async function carregar(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id, compromissoId } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return { erro: NextResponse.json({ error: "Só a família muda a agenda." }, { status: 403 }) };
  if (!ehUuid(compromissoId)) return { erro: NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 }) };
  const { data } = await getSupabase().from("app_compromissos").select("id, pulos, inicio").eq("id", compromissoId).eq("crianca_id", id).is("cancelado_em", null).maybeSingle();
  if (!data) return { erro: NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 }) };
  return { pessoaId, id, compromissoId, atual: data as { id: string; pulos: string[] | null; inicio: string } };
}

export async function PATCH(req: Request, ctx: Ctx) {
  const r = await carregar(req, ctx);
  if ("erro" in r) return r.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const sb = getSupabase();
  const agora = new Date().toISOString();
  if (b.acao === "pular" || b.acao === "voltar") {
    if (typeof b.data !== "string" || !DATA.test(b.data)) return NextResponse.json({ error: "Informe o dia." }, { status: 400 });
    const pulos = new Set(r.atual.pulos || []);
    if (b.acao === "pular") pulos.add(b.data); else pulos.delete(b.data);
    if (pulos.size > 200) return NextResponse.json({ error: "Dias demais pulados nesta série." }, { status: 400 });
    await sb.from("app_compromissos").update({ pulos: [...pulos].sort(), updated_at: agora }).eq("id", r.compromissoId);
    await logAction({ actorId: r.pessoaId, actorRole: "responsavel", action: "update", resourceType: "compromisso", resourceId: r.compromissoId, metadata: { acao: b.acao }, req });
    return NextResponse.json({ ok: true });
  }
  const dados = lerCompromisso(b, true);
  if ("erro" in dados) return NextResponse.json({ error: dados.erro }, { status: 400 });
  if (!Object.keys(dados).length) return NextResponse.json({ error: "Nada para mudar." }, { status: 400 });
  if (dados.repete_ate && dados.repete_ate < (dados.inicio || r.atual.inicio).slice(0, 10)) {
    return NextResponse.json({ error: "A repetição não pode terminar antes de começar." }, { status: 400 });
  }
  if (dados.membro_id) {
    const { data: m } = await sb.from("rede_membros").select("id").eq("id", dados.membro_id).eq("crianca_id", r.id).maybeSingle();
    if (!m) return NextResponse.json({ error: "Essa pessoa não está na rede desta criança." }, { status: 400 });
  }
  await sb.from("app_compromissos").update({ ...dados, updated_at: agora }).eq("id", r.compromissoId);
  await logAction({ actorId: r.pessoaId, actorRole: "responsavel", action: "update", resourceType: "compromisso", resourceId: r.compromissoId, metadata: { campos: Object.keys(dados) }, req });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const r = await carregar(req, ctx);
  if ("erro" in r) return r.erro;
  const agora = new Date().toISOString();
  await getSupabase().from("app_compromissos").update({ cancelado_em: agora, updated_at: agora }).eq("id", r.compromissoId);
  await logAction({ actorId: r.pessoaId, actorRole: "responsavel", action: "delete", resourceType: "compromisso", resourceId: r.compromissoId, req });
  return NextResponse.json({ ok: true });
}
