import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listSchoolYears, createSchoolYear } from "@/lib/school";

export async function GET() {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const years = await listSchoolYears(workspaceId);
  return NextResponse.json({ years });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const year = body?.year;
  const name = body?.name;
  if (typeof year !== "number" || year < 2020 || year > 2030) {
    return NextResponse.json({ error: "Ano inválido (2020-2030)" }, { status: 400 });
  }

  const result = await createSchoolYear(workspaceId, year, name);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
