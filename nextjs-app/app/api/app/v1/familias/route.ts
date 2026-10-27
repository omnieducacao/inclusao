import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { dadosDaCrianca } from "@/lib/app/familia";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · POST /api/app/v1/familias {nome?, parentesco?, crianca: {nome, nascimento?}}
 * A família que chega direto, sem escola: cria a conta da família (dona dos dados da criança),
 * põe quem cadastrou como responsável principal e cria a primeira criança.
 * O prazo do teste grátis fica em aberto (teste_ate vazio) até a decisão de preço.
 */
export async function POST(req: Request) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const crianca = dadosDaCrianca(b.crianca);
  if ("erro" in crianca) return NextResponse.json({ error: crianca.erro }, { status: 400 });

  const sb = getSupabase();
  const { data: ja } = await sb.from("familia_responsaveis").select("id").eq("pessoa_id", pessoaId);
  if (((ja as unknown[] | null) || []).length >= 3) {
    return NextResponse.json({ error: "Você já participa de 3 famílias. Para mais, fale com a gente." }, { status: 400 });
  }

  const nome = typeof b.nome === "string" && b.nome.trim() ? b.nome.trim().slice(0, 80) : `Família de ${crianca.nome.split(" ")[0]}`;
  const { data: fam, error } = await sb.from("familias").insert({ nome, origem: "direto", plano: "teste" }).select("id").single();
  if (error || !fam) return NextResponse.json({ error: "Não deu para criar a família agora." }, { status: 500 });
  const familiaId = (fam as { id: string }).id;
  const parentesco = typeof b.parentesco === "string" ? b.parentesco.trim().slice(0, 40) || null : null;
  await sb.from("familia_responsaveis").insert({ familia_id: familiaId, pessoa_id: pessoaId, parentesco, principal: true });
  const { data: c } = await sb.from("criancas").insert({ familia_id: familiaId, ...crianca }).select("id").single();

  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "create", resourceType: "familia", resourceId: familiaId, metadata: { origem: "direto" }, req });
  return NextResponse.json({ ok: true, familia_id: familiaId, crianca_id: (c as { id: string } | null)?.id ?? null }, { status: 201 });
}
