import { NextResponse } from "next/server";
import { carregarHabilidadesEFPorComponente } from "@/lib/bncc";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serie = searchParams.get("serie") || "";

  try {
    const blocos = carregarHabilidadesEFPorComponente(serie);
    return NextResponse.json(blocos);
  } catch (err) {
    console.error("BNCC EF:", err);
    return NextResponse.json(
      { error: "Erro ao carregar BNCC EF." },
      { status: 500 }
    );
  }
}
