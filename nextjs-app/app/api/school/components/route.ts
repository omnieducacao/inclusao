import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listComponents } from "@/lib/school";

export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const components = await listComponents();
  return NextResponse.json({ components });
}
