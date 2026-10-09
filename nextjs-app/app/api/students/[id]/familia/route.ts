/**
 * O que a família enviou e a conversa com ela, para a ficha do estudante (10/10/2026).
 * GET: laudos, mudanças de medicação, responsáveis e mensagens (abrir marca as mensagens da família como lidas).
 * PATCH { visto: true }: marca como visto tudo o que a família enviou.
 * POST { texto }: mensagem da escola para a família.
 */
import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { logger } from "@/lib/logger";
import {
  negadoCaixaFamilia, itensDaFamilia, mensagensDoEstudante, marcarMensagensLidas, validarTextoMensagem, cifrar, LIMITE_MENSAGEM,
} from "@/lib/familia-caixa";

type Ctx = { params: Promise<{ id: string }> };

async function guarda(id: string) {
  const session = await getSession();
  const negado = negadoCaixaFamilia(session);
  if (negado) return { negado };
  const fora = await negadoForaDoVinculo(session, id);
  if (fora) return { negado: fora };
  const { data: est } = await getSupabase().from("students").select("id").eq("id", id).eq("workspace_id", session!.workspace_id).maybeSingle();
  if (!est) return { negado: NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 }) };
  return { session: session! };
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guarda(id);
  if (g.negado) return g.negado;
  const ws = g.session.workspace_id as string;
  const sb = getSupabase();
  const [{ itens, semMigracao: s1 }, { mensagens, semMigracao: s2 }, links] = await Promise.all([
    itensDaFamilia(id),
    mensagensDoEstudante(ws, id),
    sb.from("family_student_links").select("vinculo_tipo, family_responsibles(nome, parentesco, email, active)").eq("student_id", id),
  ]);
  if (!s2) await marcarMensagensLidas(ws, id, "familia");
  const responsaveis = ((links.data || []) as unknown as Array<{ vinculo_tipo: string | null; family_responsibles: { nome: string; parentesco: string | null; email: string | null; active: boolean } | null }>)
    .map((l) => l.family_responsibles).filter(Boolean)
    .map((r) => ({ nome: r!.nome, parentesco: r!.parentesco, ativo: r!.active !== false }));
  return NextResponse.json({ itens, mensagens, responsaveis, semMigracao: s1 || s2 });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guarda(id);
  if (g.negado) return g.negado;
  const body = await req.json().catch(() => ({}));
  if (!body?.visto) return NextResponse.json({ error: "Nada para marcar." }, { status: 400 });
  const agora = new Date().toISOString();
  const quem = memberIdDaSessao(g.session) || null;
  const sb = getSupabase();
  const r = await Promise.all(["family_laudos", "family_medicacao_updates"].map((t) =>
    sb.from(t).update({ visto_em: agora, visto_por: quem }).eq("student_id", id).is("visto_em", null)));
  const erro = r.find((x) => x.error)?.error;
  if (erro) {
    logger.warn({ err: erro.message }, "[students/familia] marcar visto");
    return NextResponse.json({ error: "Falta rodar a atualização do banco da família." }, { status: 409 });
  }
  return NextResponse.json({ ok: true, visto_em: agora });
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guarda(id);
  if (g.negado) return g.negado;
  const body = await req.json().catch(() => ({}));
  const texto = validarTextoMensagem(body?.texto);
  if (!texto) return NextResponse.json({ error: `Escreva a mensagem (até ${LIMITE_MENSAGEM} caracteres).` }, { status: 400 });
  const s = g.session;
  const { data, error } = await getSupabase().from("family_mensagens").insert({
    workspace_id: s.workspace_id, student_id: id, autor: "escola",
    member_id: memberIdDaSessao(s) || null,
    autor_nome: s.simulating_member_name || s.usuario_nome || "Escola",
    texto: cifrar(texto),
  }).select("id, created_at").single();
  if (error) {
    logger.warn({ err: error.message }, "[students/familia] mensagem");
    return NextResponse.json({ error: "Falta rodar a atualização do banco da família." }, { status: 409 });
  }
  return NextResponse.json({ mensagem: { id: data.id, autor: "escola", autor_nome: s.simulating_member_name || s.usuario_nome, texto, lida_em: null, created_at: data.created_at } });
}
