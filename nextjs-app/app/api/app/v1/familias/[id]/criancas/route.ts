import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { ehResponsavelDaFamilia, dadosDaCrianca } from "@/lib/app/familia";
import { logAction } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

/** Frente 6 · POST /api/app/v1/familias/:id/criancas {nome, nascimento?} → mais uma criança na família. */
export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  if (!(await ehResponsavelDaFamilia(pessoaId, id))) return NextResponse.json({ error: "Sem acesso a esta família." }, { status: 403 });

  const crianca = dadosDaCrianca((await req.json().catch(() => ({}))) as unknown);
  if ("erro" in crianca) return NextResponse.json({ error: crianca.erro }, { status: 400 });
  const sb = getSupabase();
  const { data: ja } = await sb.from("criancas").select("id").eq("familia_id", id);
  if (((ja as unknown[] | null) || []).length >= 8) return NextResponse.json({ error: "Limite de crianças nesta família." }, { status: 400 });
  const { data, error } = await sb.from("criancas").insert({ familia_id: id, ...crianca }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Não deu para cadastrar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "create", resourceType: "crianca", resourceId: (data as { id: string }).id, req });
  return NextResponse.json({ ok: true, id: (data as { id: string }).id }, { status: 201 });
}
