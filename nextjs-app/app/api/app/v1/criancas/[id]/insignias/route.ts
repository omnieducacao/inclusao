import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { avaliarConquistas, entregarMomento, painelDeInsignias } from "@/lib/app/conquistas";
import { faixaEtaria, idadeEm } from "@/lib/app/adolescente";
import { lerDominio, lerMetas, METAS_PADRAO, type Metas } from "@/lib/app/insignias";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 104: a aba Insígnias.
 * GET  → quem vê "missoes": {faixa, aneis, metas, colecao (30), ganhas, cores_acesas, proximas, novas}
 *        (faixa decide o desenho no app: infantil até 5, crianca de 6 a 11, adolescente a partir de 12)
 * PUT  → a família muda a meta dos anéis: {fazer?, sentir?, junto?}
 * POST → um adulto entrega o Momento de uma cor: {dominio, frase}. O adolescente não entrega a si mesmo.
 * Sem a migração 104 no banco, GET responde 503 com "em breve" (o app esconde a aba).
 */
type Ctx = { params: Promise<{ id: string }> };

async function faixaDa(criancaId: string) {
  const { data } = await getSupabase().from("criancas").select("nascimento").eq("id", criancaId).maybeSingle();
  const nascimento = (data as { nascimento: string | null } | null)?.nascimento ?? null;
  return faixaEtaria(idadeEm(nascimento)) ?? "crianca";
}

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.ver.has("missoes")) return NextResponse.json({ error: "Sem acesso." }, { status: 403 });
  const novas = await avaliarConquistas(id);
  const painel = await painelDeInsignias(id);
  if (!painel) return NextResponse.json({ error: "As insígnias chegam em breve.", em_breve: true }, { status: 503 });
  return NextResponse.json({ faixa: await faixaDa(id), ...painel, novas, pode_entregar: acesso.papel !== "adolescente" && acesso.escrever.has("missoes") });
}

export async function PUT(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família muda a meta dos anéis." }, { status: 403 });
  const sb = getSupabase();
  const { data: atual } = await sb.from("app_aneis_metas").select("fazer, sentir, junto").eq("crianca_id", id).maybeSingle();
  const metas = lerMetas(await req.json().catch(() => null), (atual as Metas | null) || METAS_PADRAO);
  if (!metas) return NextResponse.json({ error: "Escolha metas pequenas: Fazer de 1 a 50, Sentir de 1 a 21 e Junto de 1 a 14." }, { status: 400 });
  const linha = { ...metas, atualizada_por: pessoaId, updated_at: new Date().toISOString() };
  const { error } = atual
    ? await sb.from("app_aneis_metas").update(linha).eq("crianca_id", id)
    : await sb.from("app_aneis_metas").insert({ crianca_id: id, ...linha });
  if (error) return NextResponse.json({ error: "Não deu para salvar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "update", resourceType: "aneis_metas", resourceId: id, metadata: metas, req });
  return NextResponse.json({ ok: true, metas });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.escrever.has("missoes") || acesso.papel === "adolescente") {
    return NextResponse.json({ error: "Só um adulto da família ou da rede entrega um Momento." }, { status: 403 });
  }
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const dominio = lerDominio(b.dominio);
  if (!dominio) return NextResponse.json({ error: "Escolha a cor do Momento." }, { status: 400 });
  const frase = typeof b.frase === "string" ? b.frase.trim().slice(0, 140) : "";
  if (frase.length < 3) return NextResponse.json({ error: "Conte em uma frase o que você viu." }, { status: 400 });
  const entregue = await entregarMomento(id, dominio, frase, pessoaId);
  if (!entregue) return NextResponse.json({ error: "Não deu para entregar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "create", resourceType: "conquista", resourceId: id, metadata: { momento: dominio }, req });
  return NextResponse.json({ ok: true, novas: [...entregue, ...(await avaliarConquistas(id))] }, { status: 201 });
}
