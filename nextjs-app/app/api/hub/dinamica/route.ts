import { parseBody, hubDinamicaSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { gerarPromptDinamicaInclusiva } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  const parsed = await parseBody(req, hubDinamicaSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const aluno = body.aluno || {};
  const materia = (body.materia || "Geral").trim();
  const assunto = (body.assunto || "").trim();
  const qtdAlunos = body.qtd_alunos ?? 25;
  const caracteristicas = (body.caracteristicas_turma || "").trim();
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";

  const temBnccPreenchida = (body.habilidades_bncc?.length || 0) > 0;
  if (!assunto && !temBnccPreenchida) {
    return NextResponse.json({ error: "Informe o assunto/tema ou selecione habilidades BNCC." }, { status: 400 });
  }

  // Usar prompt do arquivo separado (idêntico ao Streamlit)
  const prompt = gerarPromptDinamicaInclusiva({
    aluno: {
      nome: aluno.nome || "o estudante",
      ia_sugestao: aluno.ia_sugestao || "",
      hiperfoco: aluno.hiperfoco || "Geral",
    },
    materia,
    assunto: assunto || "(definido pelas habilidades BNCC)",
    qtd_alunos: qtdAlunos,
    caracteristicas_turma: caracteristicas || "Não informado",
    habilidades_bncc: body.habilidades_bncc,
    verbos_bloom: undefined, // Não usado na dinâmica
    ano: body.ano,
    unidade_tematica: body.unidade_tematica,
    objeto_conhecimento: body.objeto_conhecimento,
    feedback_anterior: "",
  });

  const err = getEngineError(engine);
  if (err) return NextResponse.json({ error: err }, { status: 500 });

  try {
    const studentName = aluno?.nome || null;
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], studentName);
    const textoRaw = await chatCompletionText(engine, anonymized, { temperature: 0.7 });
    return NextResponse.json({ texto: restore(textoRaw) });
  } catch (e) {
    console.error("Hub dinamica:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar dinâmica." },
      { status: 500 }
    );
  }
}
