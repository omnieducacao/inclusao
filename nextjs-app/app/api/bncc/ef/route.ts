import { NextResponse } from "next/server";
import { carregarHabilidadesEFPorComponente, carregarEstruturaEF } from "@/lib/bncc";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serie = searchParams.get("serie") || "";
  const estrutura = searchParams.get("estrutura") === "1";

  try {
    if (estrutura) {
      const data = carregarEstruturaEF(serie);
      return NextResponse.json(data);
    }
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
