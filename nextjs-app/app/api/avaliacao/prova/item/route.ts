import { NextResponse } from "next/server";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { estudanteParaAvaliar } from "@/lib/avaliacao-servidor";
import { itemPorCodigo } from "@/lib/matriz-avaliacao-servidor";
import { gerarItensDaProva } from "@/lib/prova-servidor";
import type { ItemProva } from "@/lib/prova";

/** POST { id, itemId } → a IA troca um item (mesmo descritor e mesma ordem) e grava a prova. */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const session = await getSession();
  const body = (await req.json().catch(() => ({}))) as { id?: string; itemId?: string };
  const sb = getSupabase();
  const { data: prova } = await sb.from("avaliacao_provas").select("*").eq("id", body.id || "-").eq("workspace_id", session?.workspace_id || "-").maybeSingle();
  if (!prova) return NextResponse.json({ error: "Prova não encontrada." }, { status: 404 });
  const r = await estudanteParaAvaliar(session, prova.student_id as string);
  if ("erro" in r) return r.erro;
  const itens = (prova.itens as ItemProva[]) || [];
  const alvo = itens.find((i) => i.id === body.itemId);
  if (!alvo) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  const anoNum = Number(/(\d)/.exec((prova.ano_referencia as string) || "")?.[1]) || r.serie.ano;
  const item = await itemPorCodigo(alvo.codigo, prova.disciplina as string, r.serie.etapa, anoNum);
  if (!item) return NextResponse.json({ error: "Descritor não encontrado na matriz." }, { status: 400 });
  try {
    const [novo] = await gerarItensDaProva({ estudante: r.estudante, disciplina: prova.disciplina as string, ano: prova.ano_referencia as string, itens: [item], workspaceId: session!.workspace_id as string, soItem: { codigo: alvo.codigo, ordem: alvo.ordem } });
    if (!novo) throw new Error("vazio");
    const trocado: ItemProva = { ...novo, id: alvo.id, codigo: alvo.codigo, ordem: alvo.ordem };
    const novos = itens.map((i) => (i.id === alvo.id ? trocado : i));
    const respostas = { ...((prova.respostas as Record<string, unknown>) || {}) };
    delete respostas[alvo.id];
    const { error } = await sb.from("avaliacao_provas").update({ itens: novos, respostas, updated_at: new Date().toISOString() }).eq("id", prova.id);
    if (error) throw error;
    return NextResponse.json({ item: trocado });
  } catch (e) {
    logger.error({ err: e }, "POST /api/avaliacao/prova/item");
    return NextResponse.json({ error: "Não deu para trocar a questão agora. Tente de novo." }, { status: 502 });
  }
}
