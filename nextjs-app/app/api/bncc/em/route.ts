import { NextResponse } from "next/server";
import { carregarHabilidadesEMPorArea } from "@/lib/bncc";
import { requireAuth } from "@/lib/permissions";

export async function GET(req: Request) {
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const blocos = carregarHabilidadesEMPorArea();
    return NextResponse.json(blocos);
  } catch (err) {
    console.error("BNCC EM:", err);
    return NextResponse.json(
      { error: "Erro ao carregar BNCC EM." },
      { status: 500 }
    );
  }
}
