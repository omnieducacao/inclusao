import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, ehUuid } from "@/lib/app/acesso";
import { lerMedicacao } from "@/lib/app/medicacao";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · PATCH /api/app/v1/criancas/:id/medicacoes/:medId — a família edita (campos enviados)
 * ou encerra {encerrar: true}. O remédio encerrado sai da lista do dia mas fica no histórico.
 */
type Ctx = { params: Promise<{ id: string; medId: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, medId } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família muda a medicação." }, { status: 403 });
  if (!ehUuid(medId)) return NextResponse.json({ error: "Remédio não encontrado." }, { status: 404 });
  const sb = getSupabase();
  const { data: med } = await sb.from("medicacoes").select("id").eq("id", medId).eq("crianca_id", id).maybeSingle();
  if (!med) return NextResponse.json({ error: "Remédio não encontrado." }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const agora = new Date().toISOString();
  if (b.encerrar === true) {
    await sb.from("medicacoes").update({ ativa: false, fim: agora.slice(0, 10), lembrete: false, updated_at: agora }).eq("id", medId);
    await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "update", resourceType: "medicacao", resourceId: medId, metadata: { acao: "encerrou" }, req });
    return NextResponse.json({ ok: true });
  }
  const dados = lerMedicacao(b, true);
  if ("erro" in dados) return NextResponse.json({ error: dados.erro }, { status: 400 });
  if (!Object.keys(dados).length) return NextResponse.json({ error: "Nada para mudar." }, { status: 400 });
  await sb.from("medicacoes").update({ ...dados, updated_at: agora }).eq("id", medId);
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "update", resourceType: "medicacao", resourceId: medId, metadata: { campos: Object.keys(dados) }, req });
  return NextResponse.json({ ok: true });
}
