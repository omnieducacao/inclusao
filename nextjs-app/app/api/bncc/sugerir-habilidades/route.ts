import { parseBody, bnccSugerirSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const parsed = await parseBody(req, bnccSugerirSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { serie, tipo, habilidades } = body;

    if (!serie || !tipo || !habilidades) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const textoLista = habilidades
      .map((h: { disciplina?: string; codigo?: string; habilidade_completa?: string }) => {
        const disc = h.disciplina || "";
        const cod = h.codigo || "";
        const hab = h.habilidade_completa || "";
        return `- ${disc}: ${cod} — ${hab}`;
      })
      .join("\n");

    const prompt =
      tipo === "ano_atual"
        ? `O estudante está no ano/série: ${serie}. Abaixo estão as habilidades BNCC do ano atual (código e descrição).
Indique as habilidades mais fundamentais para esse ano (máximo 3 a 5 por componente curricular).

Retorne EXATAMENTE neste formato:
CODES:
(códigos um por linha, ex: EF01LP02)
MOTIVO:
(em 2 a 4 linhas, explique por que escolheu estas habilidades para este estudante.)

HABILIDADES DO ANO ATUAL:
${textoLista}`
        : `O estudante está no ano/série: ${serie}. Abaixo estão habilidades BNCC de ANOS ANTERIORES (que podem merecer atenção ou reforço).
Indique as habilidades mais relevantes para esse estudante (máximo 3 a 5 por componente curricular).

Retorne EXATAMENTE neste formato:
CODES:
(códigos um por linha, ex: EF01LP02)
MOTIVO:
(em 2 a 4 linhas, explique por que escolheu estas habilidades de anos anteriores para este estudante.)

HABILIDADES DE ANOS ANTERIORES:
${textoLista}`;

    // Usar engine padrão (yellow/Gemini ou fallback)
    const engine: EngineId = "yellow";
    const resposta = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });

    if (!resposta) {
      return NextResponse.json({ error: "Erro ao gerar sugestão" }, { status: 500 });
    }

    // Extrair códigos e motivo
    const codigos: string[] = [];
    let motivo = "";

    if (resposta.includes("MOTIVO:")) {
      const partes = resposta.split(/MOTIVO\s*:/i);
      if (partes.length >= 2) {
        motivo = partes[1].trim().slice(0, 500);
      }
      const blocoCodes = partes[0] || resposta;
      const regex = /(EF\d+[A-Z0-9]+|EM\d+[A-Z0-9]+)/gi;
      const matches = blocoCodes.match(regex);
      if (matches) {
        codigos.push(...matches.map((m) => m.toUpperCase()));
      }
    } else {
      const regex = /(EF\d+[A-Z0-9]+|EM\d+[A-Z0-9]+)/gi;
      const matches = resposta.match(regex);
      if (matches) {
        codigos.push(...matches.map((m) => m.toUpperCase()));
      }
    }

    return NextResponse.json({ codigos, motivo });
  } catch (error) {
    console.error("Erro ao sugerir habilidades:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
