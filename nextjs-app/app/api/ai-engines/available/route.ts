import { NextResponse } from "next/server";
import { getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const engines: EngineId[] = ["red", "blue", "green", "yellow", "orange"];
  const available = engines.filter((engine) => !getEngineError(engine));

  return NextResponse.json({ available });
}
