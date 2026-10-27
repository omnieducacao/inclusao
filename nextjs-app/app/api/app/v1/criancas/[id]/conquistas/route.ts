import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { FIGURAS } from "@/lib/app/conquistas";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · conquistas da criança (badges).
 * GET  → quem vê "missoes"
 * POST → conquista especial entregue por um adulto (família ou rede que escreve "missoes"):
 *        {nome?, frase, figura?, meta_ref?}. Conquista só se ganha: não há como tirar.
 */
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.ver.has("missoes")) return NextResponse.json({ error: "Sem acesso." }, { status: 403 });
  const { data } = await getSupabase()
    .from("conquistas")
    .select("id, nome, frase, figura, meta_ref, created_at")
    .eq("crianca_id", id)
    .order("created_at", { ascending: false });
  return NextResponse.json({ conquistas: data || [] });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.escrever.has("missoes") || acesso.papel === "adolescente") {
    return NextResponse.json({ error: "Só um adulto da família ou da rede entrega conquistas." }, { status: 403 });
  }
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const frase = typeof b.frase === "string" ? b.frase.trim().slice(0, 140) : "";
  if (frase.length < 3) return NextResponse.json({ error: "Escreva uma frase para acompanhar a conquista." }, { status: 400 });
  const sb = getSupabase();
  const { data: cat } = await sb.from("conquistas_catalogo").select("id, nome, figura").eq("codigo", "concedida").maybeSingle();
  const c = cat as { id: string; nome: string; figura: string | null } | null;
  const nome = typeof b.nome === "string" && b.nome.trim() ? b.nome.trim().slice(0, 60) : c?.nome || "Conquista especial";
  const figura = typeof b.figura === "string" && (FIGURAS as readonly string[]).includes(b.figura) ? b.figura : c?.figura || "medalha";
  const { data, error } = await sb.from("conquistas").insert({
    crianca_id: id, catalogo_id: c?.id || null, nome, frase, figura,
    meta_ref: typeof b.meta_ref === "string" ? b.meta_ref.trim().slice(0, 80) || null : null,
    concedida_por: pessoaId,
  }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Não deu para entregar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "create", resourceType: "conquista", resourceId: (data as { id: string }).id, req });
  return NextResponse.json({ ok: true, id: (data as { id: string }).id }, { status: 201 });
}
