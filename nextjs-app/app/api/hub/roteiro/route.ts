import { parseBody, hubRoteiroSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineErrorWithWorkspace, type EngineId } from "@/lib/ai-engines";
import { gerarPromptRoteiroAula } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { session, error: authError } = await requireAuth(); if (authError) return authError;
  const parsed = await parseBody(req, hubRoteiroSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const aluno = body.aluno || {};
  const materia = (body.materia || "Geral").trim();
  const assunto = (body.assunto || "").trim();
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";

  const temBnccPreenchida = (body.habilidades_bncc?.length || 0) > 0;
  if (!assunto && !temBnccPreenchida) {
    return NextResponse.json({ error: "Informe o assunto ou selecione habilidades BNCC." }, { status: 400 });
  }

  // Usar prompt do arquivo separado (idêntico ao Streamlit)
  const prompt = gerarPromptRoteiroAula({
    aluno: {
      nome: aluno.nome || "o estudante",
      ia_sugestao: aluno.ia_sugestao || "",
      hiperfoco: aluno.hiperfoco || "Geral",
    },
    materia,
    assunto: assunto || "(definido pelas habilidades BNCC)",
    habilidades_bncc: body.habilidades_bncc,
    verbos_bloom: undefined, // Não usado no roteiro
    ano: body.ano,
    unidade_tematica: body.unidade_tematica,
    objeto_conhecimento: body.objeto_conhecimento,
    feedback_anterior: "",
  });

  const wsId = session?.simulating_workspace_id || session?.workspace_id;
  const err = await getEngineErrorWithWorkspace(engine, wsId);
  if (err) return NextResponse.json({ error: err }, { status: 500 });

  try {
    const studentName = aluno?.nome || null;
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], studentName);
    const textoRaw = await chatCompletionText(engine, anonymized, { temperature: 0.7 });
    return NextResponse.json({ texto: restore(textoRaw) });
  } catch (e) {
    console.error("Hub roteiro:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar roteiro." },
      { status: 500 }
    );
  }
}
