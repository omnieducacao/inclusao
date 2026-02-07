import { NextResponse } from "next/server";
import { getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function GET() {
  const engines: EngineId[] = ["red", "blue", "green", "yellow", "orange"];
  const available = engines.filter((engine) => !getEngineError(engine));
  
  return NextResponse.json({ available });
}
