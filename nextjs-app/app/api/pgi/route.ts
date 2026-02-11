import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPGIData, updatePGIData, type AcaoPGI, type PGIData } from "@/lib/pgi";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await getPGIData(workspaceId);
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const denied = requirePermission(session, "can_pgi");
  if (denied) return denied;

  const body = await request.json();
  const acoes = Array.isArray(body.acoes) ? body.acoes : undefined;
  const dimensionamento =
    body.dimensionamento && typeof body.dimensionamento === "object"
      ? body.dimensionamento
      : undefined;

  const current = await getPGIData(workspaceId);
  const next: PGIData = {
    acoes: (acoes ?? current.acoes ?? []) as AcaoPGI[],
    dimensionamento: dimensionamento ?? current.dimensionamento ?? {},
  };

  const result = await updatePGIData(workspaceId, next);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
