import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { avaliarConquistas, lerEtapas } from "@/lib/app/conquistas";
import { sincronizarMissoesDaEscola } from "@/lib/app/jornada";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · missões em etapas.
 * GET  → quem vê "missoes" (?arquivadas=1 inclui as arquivadas). Onda 103: antes, traz as missões
 *        que a escola tirou do PEI (origem "pei"); as que a escola confirmou rendem conquistas.
 * POST → quem escreve "missoes" (família, adolescente, professor convidado)
 *        {titulo, etapas: [{texto, figura?}], onde?, ate?, trilha?, meta_ref?}
 */
type Ctx = { params: Promise<{ id: string }> };
const ONDE = new Set(["casa", "escola", "terapia", "casa e escola"]);
const CAMPOS = "id, titulo, etapas, origem, meta_ref, trilha, onde, ate, status, criada_por, confirmada_em, created_at";

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.ver.has("missoes")) return NextResponse.json({ error: "Sem acesso às missões desta criança." }, { status: 403 });
  const { confirmadas } = await sincronizarMissoesDaEscola(id);
  const conquistas_novas = confirmadas ? await avaliarConquistas(id) : [];
  let q = getSupabase().from("app_missoes").select(CAMPOS).eq("crianca_id", id).order("created_at", { ascending: false }).limit(100);
  if (new URL(req.url).searchParams.get("arquivadas") !== "1") q = q.in("status", ["ativa", "feita", "confirmada"]);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Não deu para carregar as missões." }, { status: 500 });
  return NextResponse.json({ missoes: data || [], conquistas_novas });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.escrever.has("missoes")) return NextResponse.json({ error: "Você não cria missões para esta criança." }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const titulo = typeof b.titulo === "string" ? b.titulo.trim().slice(0, 100) : "";
  if (titulo.length < 2) return NextResponse.json({ error: "Dê um nome à missão." }, { status: 400 });
  const etapas = lerEtapas(b.etapas);
  if (!etapas) return NextResponse.json({ error: "A missão precisa de 1 a 8 etapas." }, { status: 400 });
  const ate = typeof b.ate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.ate) ? b.ate : null;
  const sb = getSupabase();
  const { data: ativas } = await sb.from("app_missoes").select("id").eq("crianca_id", id).eq("status", "ativa");
  if (((ativas as unknown[] | null) || []).length >= 30) return NextResponse.json({ error: "Muitas missões abertas. Termine ou arquive algumas." }, { status: 400 });

  const { data, error } = await sb.from("app_missoes").insert({
    crianca_id: id,
    titulo,
    etapas,
    origem: acesso.papel === "membro" ? "escola" : "familia",
    meta_ref: typeof b.meta_ref === "string" ? b.meta_ref.trim().slice(0, 80) || null : null,
    trilha: typeof b.trilha === "string" ? b.trilha.trim().slice(0, 60) || null : null,
    onde: typeof b.onde === "string" && ONDE.has(b.onde) ? b.onde : "casa",
    ate,
    status: "ativa",
    criada_por: pessoaId,
  }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Não deu para criar a missão agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "create", resourceType: "missao", resourceId: (data as { id: string }).id, req });
  return NextResponse.json({ ok: true, id: (data as { id: string }).id }, { status: 201 });
}
