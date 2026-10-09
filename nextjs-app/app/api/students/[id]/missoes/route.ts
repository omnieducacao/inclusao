/**
 * Missões do estudante, lado da escola (10/10/2026).
 * GET: todas as missões. POST { titulo, passos, meta, onde }: cria já aprovada (a escola revisou).
 * PATCH { id, acao: confirmar | reabrir | arquivar } ou { id, editar: { titulo, passos, meta, onde } }.
 */
import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { logger } from "@/lib/logger";
import { normalizarMissao, proximoStatus, type StatusMissao } from "@/lib/missoes";
import { negadoMissoes, listarMissoes, CAMPOS_MISSAO } from "@/lib/missoes-servidor";

type Ctx = { params: Promise<{ id: string }> };

async function guarda(id: string) {
  const session = await getSession();
  const negado = negadoMissoes(session);
  if (negado) return { negado };
  const fora = await negadoForaDoVinculo(session, id);
  if (fora) return { negado: fora };
  const { data } = await getSupabase().from("students").select("id").eq("id", id).eq("workspace_id", session!.workspace_id).maybeSingle();
  if (!data) return { negado: NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 }) };
  return { session: session!, ws: session!.workspace_id as string };
}

const SEM_MIGRACAO = NextResponse.json({ error: "Falta rodar a atualização do banco das missões." }, { status: 409 });

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guarda(id);
  if (g.negado) return g.negado;
  return NextResponse.json(await listarMissoes(g.ws, id));
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guarda(id);
  if (g.negado) return g.negado;
  const m = normalizarMissao(await req.json().catch(() => null));
  if (!m) return NextResponse.json({ error: "Dê um título para a missão." }, { status: 400 });
  const { data, error } = await getSupabase().from("estudante_missoes").insert({
    workspace_id: g.ws, student_id: id, titulo: m.titulo, passos: m.passos, meta: m.meta || null, onde: m.onde,
    status: "aprovada", criada_por: memberIdDaSessao(g.session) || null,
  }).select(CAMPOS_MISSAO).single();
  if (error) { logger.warn({ err: error.message }, "[missoes] insert"); return SEM_MIGRACAO; }
  return NextResponse.json({ missao: data });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guarda(id);
  if (g.negado) return g.negado;
  const body = await req.json().catch(() => ({}));
  if (typeof body?.id !== "string") return NextResponse.json({ error: "Missão não informada." }, { status: 400 });
  const sb = getSupabase();
  const { data: atual, error: e1 } = await sb.from("estudante_missoes").select("status").eq("id", body.id).eq("student_id", id).eq("workspace_id", g.ws).maybeSingle();
  if (e1) return SEM_MIGRACAO;
  if (!atual) return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
  const agora = new Date().toISOString();
  let mudanca: Record<string, unknown>;
  if (body.editar) {
    const m = normalizarMissao(body.editar);
    if (!m) return NextResponse.json({ error: "Dê um título para a missão." }, { status: 400 });
    mudanca = { titulo: m.titulo, passos: m.passos, meta: m.meta || null, onde: m.onde };
  } else {
    const novo = proximoStatus(atual.status as StatusMissao, String(body.acao || ""), "escola");
    if (!novo) return NextResponse.json({ error: "Essa mudança não vale para a missão agora." }, { status: 400 });
    mudanca = { status: novo };
    if (novo === "confirmada") { mudanca.confirmada_em = agora; mudanca.confirmada_por = memberIdDaSessao(g.session) || null; }
    if (novo === "aprovada") { mudanca.feita_em = null; mudanca.confirmada_em = null; mudanca.confirmada_por = null; }
  }
  const { data, error } = await sb.from("estudante_missoes").update({ ...mudanca, updated_at: agora }).eq("id", body.id).select(CAMPOS_MISSAO).single();
  if (error) { logger.warn({ err: error.message }, "[missoes] update"); return SEM_MIGRACAO; }
  return NextResponse.json({ missao: data });
}
