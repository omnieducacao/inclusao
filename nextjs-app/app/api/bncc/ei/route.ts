import { NextResponse } from "next/server";
import {
  faixasIdadeEI,
  camposExperienciaEI,
  objetivosEIPorIdadeCampo,
} from "@/lib/bncc";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idade = searchParams.get("idade");
  const campo = searchParams.get("campo");

  try {
    const faixas = faixasIdadeEI();
    const campos = camposExperienciaEI();
    const objetivos =
      idade && campo ? objetivosEIPorIdadeCampo(idade, campo) : [];

    return NextResponse.json({
      faixas,
      campos,
      objetivos,
    });
  } catch (err) {
    console.error("BNCC EI:", err);
    return NextResponse.json(
      { error: "Erro ao carregar BNCC EI." },
      { status: 500 }
    );
  }
}
