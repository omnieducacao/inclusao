/**
 * Mensagens da família com a escola, por estudante (10/10/2026).
 * GET ?student_id=…: a conversa (abrir marca as mensagens da escola como lidas).
 * POST { student_id, texto }: mensagem da família para a escola.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { mensagensDoEstudante, marcarMensagensLidas, validarTextoMensagem, cifrar, LIMITE_MENSAGEM } from "@/lib/familia-caixa";

async function guarda(studentId: string | null) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role !== "family" || !session.family_responsible_id) {
    return { negado: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  }
  if (!studentId) return { negado: NextResponse.json({ error: "student_id obrigatório" }, { status: 400 }) };
  const { data: link } = await getSupabase().from("family_student_links").select("id")
    .eq("family_responsible_id", session.family_responsible_id).eq("student_id", studentId).maybeSingle();
  if (!link) return { negado: NextResponse.json({ error: "Estudante não vinculado" }, { status: 403 }) };
  return { session };
}

export async function GET(req: Request) {
  const studentId = new URL(req.url).searchParams.get("student_id");
  const g = await guarda(studentId);
  if (g.negado) return g.negado;
  const { mensagens, semMigracao } = await mensagensDoEstudante(g.session!.workspace_id as string, studentId!);
  if (!semMigracao) await marcarMensagensLidas(g.session!.workspace_id as string, studentId!, "escola");
  return NextResponse.json({ mensagens, semMigracao });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const g = await guarda(typeof body?.student_id === "string" ? body.student_id : null);
  if (g.negado) return g.negado;
  const texto = validarTextoMensagem(body?.texto);
  if (!texto) return NextResponse.json({ error: `Escreva a mensagem (até ${LIMITE_MENSAGEM} caracteres).` }, { status: 400 });
  const s = g.session!;
  const { data, error } = await getSupabase().from("family_mensagens").insert({
    workspace_id: s.workspace_id, student_id: body.student_id, autor: "familia",
    family_responsible_id: s.family_responsible_id, autor_nome: s.usuario_nome || "Família",
    texto: cifrar(texto),
  }).select("id, created_at").single();
  if (error) {
    logger.warn({ err: error.message }, "[familia/mensagens] insert");
    return NextResponse.json({ error: "As mensagens ainda não estão ligadas nesta escola." }, { status: 409 });
  }
  return NextResponse.json({ mensagem: { id: data.id, autor: "familia", autor_nome: s.usuario_nome, texto, lida_em: null, created_at: data.created_at } });
}
