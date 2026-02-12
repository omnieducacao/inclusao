import { parseBody, studentPatchDataSchema } from "@/lib/validation";
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
  const parsed = await parseBody(req, studentPatchDataSchema);

  if (parsed.error) return parsed.error;

  const body = parsed.data;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const ciclos = Array.isArray(body.paee_ciclos) ? body.paee_ciclos : [];
  const result = await updateStudentPaeeCiclos(
    session.workspace_id,
    id,
    ciclos,
    (body.planejamento_ativo as string | null) ?? null,
    {
      status_planejamento: body.status_planejamento as string | undefined,
      data_inicio_ciclo: (body.data_inicio_ciclo as string | null) ?? null,
      data_fim_ciclo: (body.data_fim_ciclo as string | null) ?? null,
      paee_data: (body.paee_data as Record<string, unknown> | null) ?? null,
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
