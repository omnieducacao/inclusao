import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, ehUuid } from "@/lib/app/acesso";
import { avaliarConquistas, terminouEm, type Etapa } from "@/lib/app/conquistas";
import { avisarEscolaQueFez } from "@/lib/app/jornada";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · PATCH /api/app/v1/criancas/:id/missoes/:missaoId
 *   {acao: "etapa", indice, feita}  marca ou desmarca uma etapa (quem escreve "missoes");
 *                                   todas marcadas → a missão fica "feita"
 *   {acao: "confirmar"}             um adulto confirma (família ou rede; o adolescente não confirma a própria)
 *   {acao: "arquivar"}              a família ou quem criou
 * Ao terminar ou confirmar, as conquistas automáticas são conferidas e as novas voltam na resposta.
 * Onda 103: missão que veio do PEI (origem "pei") avisa a escola ao terminar; quem confirma ou
 * arquiva essa missão é a escola, na Omnisfera.
 */
type Ctx = { params: Promise<{ id: string; missaoId: string }> };
type Missao = { id: string; status: string; etapas: Etapa[] | null; criada_por: string | null; origem: string | null; estudante_missao_id: string | null };

export async function PATCH(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, missaoId } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.escrever.has("missoes")) return NextResponse.json({ error: "Você não mexe nas missões desta criança." }, { status: 403 });
  if (!ehUuid(missaoId)) return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
  const sb = getSupabase();
  const { data } = await sb.from("app_missoes").select("id, status, etapas, criada_por, origem, estudante_missao_id").eq("id", missaoId).eq("crianca_id", id).maybeSingle();
  const m = data as Missao | null;
  if (!m || m.status === "arquivada") return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const agora = new Date().toISOString();
  const registrar = (acao: string) =>
    logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "update", resourceType: "missao", resourceId: missaoId, metadata: { acao }, req });

  if (b.acao === "etapa") {
    const etapas = [...(m.etapas || [])];
    const i = b.indice;
    if (typeof i !== "number" || !Number.isInteger(i) || i < 0 || i >= etapas.length || typeof b.feita !== "boolean") {
      return NextResponse.json({ error: "Etapa inválida." }, { status: 400 });
    }
    if (m.status === "confirmada") return NextResponse.json({ error: "Missão já confirmada." }, { status: 400 });
    const statusAntes = m.status;
    etapas[i] = { ...etapas[i], feita_em: b.feita ? agora : null };
    const status = terminouEm(etapas) ? "feita" : "ativa";
    await sb.from("app_missoes").update({ etapas, status, updated_at: agora }).eq("id", missaoId);
    await registrar(b.feita ? "marcou_etapa" : "desmarcou_etapa");
    if (status === "feita" && statusAntes !== "feita" && m.estudante_missao_id) await avisarEscolaQueFez(m.estudante_missao_id, agora);
    const novas = status === "feita" && statusAntes !== "feita" ? await avaliarConquistas(id) : [];
    return NextResponse.json({ ok: true, status, conquistas_novas: novas });
  }
  if ((b.acao === "confirmar" || b.acao === "arquivar") && m.origem === "pei") {
    return NextResponse.json({ error: "Esta missão veio do plano da escola: quem confirma ou arquiva é a escola." }, { status: 403 });
  }
  if (b.acao === "confirmar") {
    if (acesso.papel === "adolescente") return NextResponse.json({ error: "Um adulto da família ou da rede confirma a missão." }, { status: 403 });
    if (m.status !== "feita") return NextResponse.json({ error: "A missão ainda não terminou." }, { status: 400 });
    await sb.from("app_missoes").update({ status: "confirmada", confirmada_por: pessoaId, confirmada_em: agora, updated_at: agora }).eq("id", missaoId);
    await registrar("confirmou");
    return NextResponse.json({ ok: true, status: "confirmada", conquistas_novas: await avaliarConquistas(id) });
  }
  if (b.acao === "arquivar") {
    if (acesso.papel !== "responsavel" && m.criada_por !== pessoaId) {
      return NextResponse.json({ error: "Só a família ou quem criou arquiva a missão." }, { status: 403 });
    }
    await sb.from("app_missoes").update({ status: "arquivada", updated_at: agora }).eq("id", missaoId);
    await registrar("arquivou");
    return NextResponse.json({ ok: true, status: "arquivada" });
  }
  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
