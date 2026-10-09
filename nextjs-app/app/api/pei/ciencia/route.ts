import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { getStudent } from "@/lib/students";
import { negadoForaDoVinculo, membrosDoEstudante } from "@/lib/turmas";
import { logAction } from "@/lib/audit";
import type { Vigencia } from "@/lib/estudo-caso";

/**
 * Ciência do PEI pelos professores (onda 2).
 * GET  ?studentId=…  → quem já deu ciência da versão vigente e quem ainda não (coordenação)
 * POST { studentId } → o professor logado registra "Li e estou ciente" da versão vigente
 */
async function versaoVigente(workspaceId: string, studentId: string) {
  const est = await getStudent(workspaceId, studentId);
  if (!est) return null;
  const vig = ((est.pei_data || {}) as { vigencia?: Vigencia }).vigencia;
  return { est, vig };
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const studentId = new URL(req.url).searchParams.get("studentId") || "";
  const fora = await negadoForaDoVinculo(session, studentId);
  if (fora) return fora;

  const r = await versaoVigente(session.workspace_id, studentId);
  if (!r) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });
  const versao = r.vig?.versao || 0;

  const [{ data: ciencias }, esperados] = await Promise.all([
    getSupabase()
      .from("pei_ciencias")
      .select("member_id, created_at, workspace_members(nome)")
      .eq("workspace_id", session.workspace_id)
      .eq("student_id", studentId)
      .eq("versao", versao),
    membrosDoEstudante(session.workspace_id, r.est),
  ]);

  type Linha = { member_id: string; created_at: string; workspace_members: { nome: string } | { nome: string }[] | null };
  const lista = ((ciencias || []) as unknown as Linha[]).map((c) => {
    const m = Array.isArray(c.workspace_members) ? c.workspace_members[0] : c.workspace_members;
    return { member_id: c.member_id, nome: m?.nome || "Profissional", created_at: c.created_at };
  });
  const jaLeram = new Set(lista.map((c) => c.member_id));
  return NextResponse.json({
    versao,
    ciencias: lista,
    pendentes: esperados.filter((m) => !jaLeram.has(m.id)).map((m) => ({ member_id: m.id, nome: m.nome })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const memberId = memberIdDaSessao(session);
  if (!memberId) {
    return NextResponse.json({ error: "Só professores e profissionais registram ciência." }, { status: 403 });
  }

  let studentId = "";
  try {
    studentId = String(((await req.json()) as { studentId?: string }).studentId || "");
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const fora = await negadoForaDoVinculo(session, studentId);
  if (fora) return fora;

  const r = await versaoVigente(session.workspace_id, studentId);
  if (!r) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });
  if (r.vig?.status !== "vigente" || !r.vig.versao) {
    return NextResponse.json({ error: "Este PEI ainda não está vigente." }, { status: 409 });
  }

  const { error } = await getSupabase()
    .from("pei_ciencias")
    .upsert(
      { workspace_id: session.workspace_id, student_id: studentId, member_id: memberId, versao: r.vig.versao },
      { onConflict: "student_id,member_id,versao", ignoreDuplicates: true }
    );
  if (error) return NextResponse.json({ error: "Não foi possível registrar." }, { status: 500 });

  await logAction({
    workspaceId: session.workspace_id,
    actorName: memberId,
    actorRole: session.user_role,
    action: "update",
    resourceType: "pei_ciencia",
    resourceId: studentId,
    metadata: { versao: r.vig.versao },
  });
  return NextResponse.json({ ok: true, versao: r.vig.versao });
}
