import { NextResponse } from "next/server";
import {
  faixasIdadeEI,
  camposExperienciaEI,
  objetivosEIPorIdadeCampo,
} from "@/lib/bncc";
import { requireAuth } from "@/lib/permissions";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const { error: authError } = await requireAuth(); if (authError) return authError;
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
    logger.error({ err: err }, "BNCC EI:");
    return NextResponse.json(
      { error: "Erro ao carregar BNCC EI." },
      { status: 500 }
    );
  }
}
