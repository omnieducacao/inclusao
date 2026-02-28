import { parseBody, hubPapoMestreSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineErrorWithWorkspace, type EngineId } from "@/lib/ai-engines";
import { gerarPromptPapoMestre } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { session, error: authError } = await requireAuth(); if (authError) return authError;
  const parsed = await parseBody(req, hubPapoMestreSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";

  const materia = (body.materia || "Geral").trim();
  const assunto = (body.assunto || "").trim();
  const hiperfoco = (body.hiperfoco || "Interesses gerais").trim();
  const temaTurma = (body.tema_turma || "").trim();
  const nomeEstudante = (body.nome_estudante || "o estudante").trim();

  if (!assunto) {
    return NextResponse.json({ error: "Informe o assunto da aula." }, { status: 400 });
  }

  // Usar prompt do arquivo separado (idêntico ao Streamlit)
  const prompt = gerarPromptPapoMestre({
    aluno: {
      nome: nomeEstudante,
      hiperfoco,
    },
    materia,
    assunto,
    tema_turma_extra: temaTurma,
  });

  const wsId = session?.simulating_workspace_id || session?.workspace_id;
  const engineErr = await getEngineErrorWithWorkspace(engine, wsId);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  try {
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], nomeEstudante);
    const textoRaw = await chatCompletionText(engine, anonymized, { temperature: 0.8 });
    return NextResponse.json({ texto: restore(textoRaw) });
  } catch (err) {
    console.error("Hub papo-mestre:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar conexões." },
      { status: 500 }
    );
  }
}
