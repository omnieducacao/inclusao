import { NextResponse } from "next/server";
import { carregarHabilidadesEMPorArea } from "@/lib/bncc";
import { requireAuth } from "@/lib/permissions";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const blocos = carregarHabilidadesEMPorArea();
    return NextResponse.json(blocos);
  } catch (err) {
    logger.error({ err: err }, "BNCC EM:");
    return NextResponse.json(
      { error: "Erro ao carregar BNCC EM." },
      { status: 500 }
    );
  }
}
