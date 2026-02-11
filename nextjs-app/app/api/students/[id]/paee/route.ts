import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateStudentPaeeCiclos } from "@/lib/students";
import { requirePermission } from "@/lib/permissions";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const denied = requirePermission(session, "can_paee");
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const ciclos = Array.isArray(body.paee_ciclos) ? body.paee_ciclos : [];
  const result = await updateStudentPaeeCiclos(
    session.workspace_id,
    id,
    ciclos,
    body.planejamento_ativo ?? null,
    {
      status_planejamento: body.status_planejamento,
      data_inicio_ciclo: body.data_inicio_ciclo ?? null,
      data_fim_ciclo: body.data_fim_ciclo ?? null,
      paee_data: body.paee_data ?? null,
    }
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Erro ao salvar PAEE." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
