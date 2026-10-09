import { NextResponse } from "next/server";
import { requireAuthAndPermission } from "@/lib/permissions";
import { getStudent, updateStudentPeiData } from "@/lib/students";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { logAction } from "@/lib/audit";

/**
 * Onda 5 · resumo do PEI para a família.
 * A área da família mostrava o texto técnico do PEI gerado pela IA (ia_sugestao). Agora ela só vê
 * o resumo escrito para a família, depois que a coordenação revisa e libera.
 *
 * POST   { studentId, texto }  → libera (ou troca) o resumo
 * DELETE { studentId }         → recolhe o resumo (a família deixa de ver)
 */
async function salvar(studentId: string, texto: string | null) {
  const { session, error } = await requireAuthAndPermission("can_pei");
  if (error) return error;
  const workspaceId = session.simulating_workspace_id || session.workspace_id;
  if (!workspaceId || !studentId) return NextResponse.json({ error: "Estudante não informado." }, { status: 400 });
  const fora = await negadoForaDoVinculo(session, studentId);
  if (fora) return fora;
  const est = await getStudent(workspaceId, studentId);
  if (!est) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  const pei = { ...((est.pei_data || {}) as Record<string, unknown>) };
  if (texto) {
    pei.resumo_familia = { texto, liberado_em: new Date().toISOString(), liberado_por: session.usuario_nome || "" };
  } else {
    delete pei.resumo_familia;
  }
  const ok = await updateStudentPeiData(workspaceId, studentId, pei);
  if (!ok) return NextResponse.json({ error: "Não conseguimos salvar agora. Tente de novo." }, { status: 500 });
  await logAction({
    workspaceId,
    actorName: session.usuario_nome,
    actorRole: session.user_role,
    action: "update",
    resourceType: "pei_resumo_familia",
    resourceId: studentId,
    metadata: { liberado: Boolean(texto) },
  });
  return NextResponse.json({ ok: true, resumo_familia: pei.resumo_familia ?? null });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { studentId?: string; texto?: string };
  const texto = (body.texto || "").trim().slice(0, 8000);
  if (!texto) return NextResponse.json({ error: "Escreva o resumo antes de liberar." }, { status: 400 });
  return salvar(body.studentId || "", texto);
}

export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { studentId?: string };
  return salvar(body.studentId || "", null);
}
