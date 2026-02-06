import { NextResponse } from "next/server";
import { carregarHabilidadesEMPorArea } from "@/lib/bncc";

export async function GET(req: Request) {
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
