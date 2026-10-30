import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { CAMPOS_105, CAMPOS_MEDICACAO, CAMPOS_MEDICACAO_105, lerMedicacao, previsaoDaMedicacao } from "@/lib/app/medicacao";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · lista viva da medicação da criança.
 * GET  → quem vê "medicacao" (?todas=1 inclui as encerradas)
 * POST → só a família cadastra {nome, dose?, horarios?, na_escola?, prescrito_por?, inicio?, fim?, lembrete?}
 * Só registro: o app nunca sugere nem calcula dose.
 */
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso?.ver.has("medicacao")) return NextResponse.json({ error: "Sem acesso à medicação desta criança." }, { status: 403 });
  const todas = new URL(req.url).searchParams.get("todas") === "1";
  const consulta = (campos: string) => {
    let q = getSupabase().from("medicacoes").select(campos).eq("crianca_id", id).order("created_at", { ascending: true });
    if (!todas) q = q.eq("ativa", true);
    return q;
  };
  // onda 105: estoque e receita; sem a migração, cai nas colunas de antes
  let { data, error } = await consulta(CAMPOS_MEDICACAO_105);
  if (error) ({ data, error } = await consulta(CAMPOS_MEDICACAO));
  if (error) return NextResponse.json({ error: "Não deu para carregar a medicação." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: acesso.papel, action: "view", resourceType: "medicacoes", resourceId: id, req });
  const lista = ((data as unknown as Record<string, unknown>[] | null) || []).map((m) => ({ ...m, previsao: previsaoDaMedicacao(m as Parameters<typeof previsaoDaMedicacao>[0]) }));
  return NextResponse.json({ medicacoes: lista });
}

export async function POST(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família cadastra a medicação." }, { status: 403 });
  const dados = lerMedicacao((await req.json().catch(() => ({}))) as Record<string, unknown>);
  if ("erro" in dados) return NextResponse.json({ error: dados.erro }, { status: 400 });
  const sb = getSupabase();
  const { data: ativas } = await sb.from("medicacoes").select("id").eq("crianca_id", id).eq("ativa", true);
  if (((ativas as unknown[] | null) || []).length >= 20) return NextResponse.json({ error: "Limite de medicações ativas." }, { status: 400 });
  let { data, error } = await sb.from("medicacoes").insert({ crianca_id: id, ativa: true, ...dados }).select("id").single();
  if (error && CAMPOS_105.some((c) => c in dados)) {
    const antigos = Object.fromEntries(Object.entries(dados).filter(([k]) => !(CAMPOS_105 as readonly string[]).includes(k)));
    ({ data, error } = await sb.from("medicacoes").insert({ crianca_id: id, ativa: true, ...antigos }).select("id").single());
  }
  if (error || !data) return NextResponse.json({ error: "Não deu para salvar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "create", resourceType: "medicacao", resourceId: (data as { id: string }).id, req });
  return NextResponse.json({ ok: true, id: (data as { id: string }).id }, { status: 201 });
}
