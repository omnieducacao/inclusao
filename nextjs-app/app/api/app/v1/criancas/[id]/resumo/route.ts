import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { resumir, type RegistroResumo } from "@/lib/app/resumo";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 102 · GET ?dias=30 (7 a 90): o resumo do período, para levar à consulta.
 * Conta só o que esta pessoa pode ver (as categorias liberadas). Quem é da rede precisa da
 * categoria "resumo" liberada pela família; a família sempre vê.
 */
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 });
  if (acesso.papel === "membro" && !acesso.ver.has("resumo")) return NextResponse.json({ error: "A família não liberou o resumo para você." }, { status: 403 });

  const url = new URL(req.url);
  const pedido = Number(url.searchParams.get("dias") || 30);
  const dias = Number.isFinite(pedido) ? Math.min(90, Math.max(7, Math.round(pedido))) : 30;
  // onda 112: o dobro do período, para comparar com o período anterior ("o que mudou")
  const desde = new Date(Date.now() - 2 * dias * 864e5).toISOString();
  const categorias = [...acesso.ver].filter((c) => c !== "resumo");
  const { data, error } = await getSupabase()
    .from("registros")
    .select("tipo, categoria, subtipo, quando, duracao, gatilho, local, dados")
    .eq("crianca_id", id)
    .is("apagado_em", null)
    .in("categoria", categorias)
    .gte("quando", desde)
    .order("quando", { ascending: false })
    .limit(4000);
  if (error) return NextResponse.json({ error: "Não deu para montar o resumo." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "view", resourceType: "resumo_periodo", resourceId: id, metadata: { dias }, req });
  return NextResponse.json({ resumo: resumir((data as RegistroResumo[] | null) || [], dias) });
}
