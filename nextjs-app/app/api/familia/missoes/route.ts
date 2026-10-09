/**
 * Missões vistas pela família (10/10/2026): o estudante vê as missões aprovadas pela escola,
 * marca "consegui" (com um recado opcional) e acompanha as conquistas confirmadas.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { proximoStatus, LIMITES, type StatusMissao } from "@/lib/missoes";
import { listarMissoes, CAMPOS_MISSAO } from "@/lib/missoes-servidor";

async function guarda(studentId: string | null) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role !== "family" || !session.family_responsible_id) {
    return { negado: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  }
  if (!studentId) return { negado: NextResponse.json({ error: "student_id obrigatório" }, { status: 400 }) };
  const { data: link } = await getSupabase().from("family_student_links").select("id")
    .eq("family_responsible_id", session.family_responsible_id).eq("student_id", studentId).maybeSingle();
  if (!link) return { negado: NextResponse.json({ error: "Estudante não vinculado" }, { status: 403 }) };
  return { ws: session.workspace_id as string };
}

export async function GET(req: Request) {
  const studentId = new URL(req.url).searchParams.get("student_id");
  const g = await guarda(studentId);
  if (g.negado) return g.negado;
  return NextResponse.json(await listarMissoes(g.ws!, studentId!, ["aprovada", "feita", "confirmada"]));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const g = await guarda(typeof body?.student_id === "string" ? body.student_id : null);
  if (g.negado) return g.negado;
  if (typeof body?.id !== "string") return NextResponse.json({ error: "Missão não informada." }, { status: 400 });
  const sb = getSupabase();
  const { data: atual } = await sb.from("estudante_missoes").select("status").eq("id", body.id).eq("student_id", body.student_id).eq("workspace_id", g.ws!).maybeSingle();
  if (!atual) return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
  const novo = proximoStatus(atual.status as StatusMissao, "feita", "familia");
  if (!novo) return NextResponse.json({ error: "Essa missão já foi marcada." }, { status: 400 });
  const nota = typeof body.nota === "string" ? body.nota.trim().slice(0, LIMITES.nota) : "";
  const agora = new Date().toISOString();
  const { data, error } = await sb.from("estudante_missoes")
    .update({ status: novo, feita_em: agora, nota_familia: nota || null, updated_at: agora })
    .eq("id", body.id).select(CAMPOS_MISSAO).single();
  if (error) { logger.warn({ err: error.message }, "[familia/missoes]"); return NextResponse.json({ error: "Não deu para marcar agora." }, { status: 500 }); }
  return NextResponse.json({ missao: data });
}
