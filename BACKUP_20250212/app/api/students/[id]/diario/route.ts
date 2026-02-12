import { parseBody, studentPatchDataSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateStudentDailyLogs } from "@/lib/students";
import { requirePermission } from "@/lib/permissions";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const denied = requirePermission(session, "can_diario");
  if (denied) return denied;

  const { id } = await params;
  const parsed = await parseBody(req, studentPatchDataSchema);

  if (parsed.error) return parsed.error;

  const body = parsed.data;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const dailyLogs = Array.isArray(body.daily_logs) ? body.daily_logs : [];
  const result = await updateStudentDailyLogs(session.workspace_id, id, dailyLogs);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Erro ao salvar Diário." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
