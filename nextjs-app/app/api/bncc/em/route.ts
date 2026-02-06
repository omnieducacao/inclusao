import { NextResponse } from "next/server";
import { carregarHabilidadesEMPorArea } from "@/lib/bncc";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serie = searchParams.get("serie") || "";

  try {
    const blocos = carregarHabilidadesEMPorArea(serie || undefined);
    return NextResponse.json(blocos);
  } catch (err) {
    console.error("BNCC EM:", err);
    return NextResponse.json(
      { error: "Erro ao carregar BNCC EM." },
      { status: 500 }
    );
  }
}
