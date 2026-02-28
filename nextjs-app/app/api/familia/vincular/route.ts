import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/familia/vincular
 * Vincula ou desvincula responsável a estudante.
 * Body: { family_responsible_id, student_id, acao: "vincular" | "desvincular" }
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = session.member as Record<string, unknown> | undefined;
  const canGestao = session.user_role === "master" || member?.can_gestao || member?.can_estudantes;
  if (!canGestao) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let body: { family_responsible_id: string; student_id: string; acao: "vincular" | "desvincular" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { family_responsible_id, student_id, acao } = body;
  if (!family_responsible_id || !student_id || !acao) {
    return NextResponse.json({ error: "family_responsible_id, student_id e acao são obrigatórios" }, { status: 400 });
  }

  const sb = getSupabase();

  const { data: resp } = await sb
    .from("family_responsibles")
    .select("id")
    .eq("id", family_responsible_id)
    .eq("workspace_id", session.workspace_id)
    .single();

  if (!resp) {
    return NextResponse.json({ error: "Responsável não encontrado" }, { status: 404 });
  }

  const { data: student } = await sb
    .from("students")
    .select("id")
    .eq("id", student_id)
    .eq("workspace_id", session.workspace_id)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
  }

  if (acao === "vincular") {
    const { error } = await sb.from("family_student_links").upsert(
      { family_responsible_id, student_id, vinculo_tipo: "responsavel_legal" },
      { onConflict: "family_responsible_id,student_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, mensagem: "Vinculado com sucesso" });
  }

  if (acao === "desvincular") {
    const { error } = await sb
      .from("family_student_links")
      .delete()
      .eq("family_responsible_id", family_responsible_id)
      .eq("student_id", student_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, mensagem: "Desvinculado com sucesso" });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
