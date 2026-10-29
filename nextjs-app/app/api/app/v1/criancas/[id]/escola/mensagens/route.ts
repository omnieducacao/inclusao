import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { escolaDaCrianca } from "@/lib/app/escola";
import { LIMITE_MENSAGEM, cifrar, marcarMensagensLidas, mensagensDoEstudante, validarTextoMensagem } from "@/lib/familia-caixa";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";

/**
 * Frente 6 · onda 102 · a conversa da família com a escola, pelo app (mesma caixa do site).
 * GET → a conversa (abrir marca as mensagens da escola como lidas) · POST { texto } → mensagem da família.
 */
type Ctx = { params: Promise<{ id: string }> };

async function abrir(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") return { erro: NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 }) };
  const escola = await escolaDaCrianca(pessoaId, id);
  if (!escola) return { erro: NextResponse.json({ error: "Esta criança não está ligada a uma escola." }, { status: 404 }) };
  return { pessoaId, criancaId: id, escola };
}

export async function GET(req: Request, ctx: Ctx) {
  const a = await abrir(req, ctx);
  if ("erro" in a) return a.erro;
  const { mensagens, semMigracao } = await mensagensDoEstudante(a.escola.workspace_id, a.escola.student_id);
  if (!semMigracao) await marcarMensagensLidas(a.escola.workspace_id, a.escola.student_id, "escola");
  return NextResponse.json({ mensagens, escola: a.escola.nome, semMigracao });
}

export async function POST(req: Request, ctx: Ctx) {
  const a = await abrir(req, ctx);
  if ("erro" in a) return a.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const texto = validarTextoMensagem(b.texto);
  if (!texto) return NextResponse.json({ error: `Escreva a mensagem (até ${LIMITE_MENSAGEM} caracteres).` }, { status: 400 });
  const { data: p } = await getSupabase().from("pessoas").select("nome").eq("id", a.pessoaId).maybeSingle();
  const { data, error } = await getSupabase()
    .from("family_mensagens")
    .insert({
      workspace_id: a.escola.workspace_id,
      student_id: a.escola.student_id,
      autor: "familia",
      family_responsible_id: a.escola.family_responsible_id,
      autor_nome: (p as { nome: string } | null)?.nome || "Família",
      texto: cifrar(texto),
    })
    .select("id, created_at")
    .single();
  if (error) {
    logger.warn({ err: error.message }, "[app/escola/mensagens] insert");
    return NextResponse.json({ error: "As mensagens ainda não estão ligadas nesta escola." }, { status: 409 });
  }
  await logAction({ actorId: a.pessoaId, actorRole: "responsavel", action: "create", resourceType: "mensagem_familia", resourceId: (data as { id: string }).id, metadata: { canal: "app" }, req });
  return NextResponse.json({ mensagem: { id: (data as { id: string }).id, autor: "familia", autor_nome: (p as { nome: string } | null)?.nome || "Família", texto, lida_em: null, created_at: (data as { created_at: string }).created_at } }, { status: 201 });
}
