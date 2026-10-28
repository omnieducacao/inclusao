import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, ehUuid } from "@/lib/app/acesso";
import { HORARIO } from "@/lib/app/medicacao";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · POST /api/app/v1/criancas/:id/medicacoes/:medId/doses {dada: true|false, horario?, quando?, observacao?, id_local?}
 * Marca que a dose do horário foi dada (ou não). A família marca qualquer remédio; a escola e quem
 * da rede vê a medicação marca só os que a família indicou como "na escola". É a ponte do remédio:
 * a família vê no celular que a escola deu a dose do meio-dia.
 */
type Ctx = { params: Promise<{ id: string; medId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, medId } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel === "adolescente") return NextResponse.json({ error: "Sem acesso." }, { status: 403 });
  if (!ehUuid(medId)) return NextResponse.json({ error: "Remédio não encontrado." }, { status: 404 });
  const sb = getSupabase();
  const { data } = await sb.from("medicacoes").select("id, na_escola, ativa").eq("id", medId).eq("crianca_id", id).maybeSingle();
  const med = data as { id: string; na_escola: boolean; ativa: boolean } | null;
  if (!med || !med.ativa) return NextResponse.json({ error: "Remédio não encontrado." }, { status: 404 });
  const podeMarcar = acesso.papel === "responsavel" || (acesso.ver.has("medicacao") && med.na_escola);
  if (!podeMarcar) return NextResponse.json({ error: "Você não marca doses deste remédio." }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof b.dada !== "boolean") return NextResponse.json({ error: "Diga se a dose foi dada." }, { status: 400 });
  const horario = typeof b.horario === "string" && HORARIO.test(b.horario) ? b.horario : null;
  const quando = typeof b.quando === "string" && !Number.isNaN(Date.parse(b.quando)) ? new Date(b.quando) : new Date();
  if (quando.getTime() > Date.now() + 5 * 60_000) return NextResponse.json({ error: "A data não pode ser no futuro." }, { status: 400 });
  const idLocal = typeof b.id_local === "string" && b.id_local.trim() ? b.id_local.trim().slice(0, 64) : null;
  if (idLocal) {
    const { data: ja } = await sb.from("registros").select("id").eq("crianca_id", id).eq("id_local", idLocal).maybeSingle();
    if (ja) return NextResponse.json({ ok: true, id: (ja as { id: string }).id, repetido: true });
  }
  // onda 101: dose marcada pelo adesivo do armário (Omniband) sai com origem "pulseira"
  let origem = "app";
  if (ehUuid(b.objeto_id)) {
    const { data: obj } = await sb.from("omniband_objetos").select("id").eq("id", b.objeto_id).eq("crianca_id", id).maybeSingle();
    if (obj) origem = "pulseira";
  }
  const { data: r, error } = await sb.from("registros").insert({
    crianca_id: id,
    tipo: "dose",
    categoria: "medicacao",
    subtipo: b.dada ? "dada" : "nao_dada",
    quando: quando.toISOString(),
    local: acesso.papel === "responsavel" ? "casa" : "escola",
    texto: typeof b.observacao === "string" && b.observacao.trim() ? b.observacao.trim().slice(0, 300) : null,
    dados: origem === "pulseira" ? { medicacao_id: medId, horario, objeto_id: b.objeto_id } : { medicacao_id: medId, horario },
    autor_pessoa_id: pessoaId,
    autor_membro_id: acesso.membroId || null,
    origem,
    id_local: idLocal,
  }).select("id").single();
  if (error || !r) return NextResponse.json({ error: "Não deu para marcar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "create", resourceType: "dose", resourceId: (r as { id: string }).id, metadata: { dada: b.dada }, req });
  return NextResponse.json({ ok: true, id: (r as { id: string }).id }, { status: 201 });
}
