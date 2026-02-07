import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { gerarPromptDinamicaInclusiva } from "@/lib/hub-prompts";

export async function POST(req: Request) {
  let body: {
    aluno?: { nome?: string; ia_sugestao?: string; hiperfoco?: string };
    materia?: string;
    assunto?: string;
    qtd_alunos?: number;
    caracteristicas_turma?: string;
    ano?: string;
    unidade_tematica?: string;
    objeto_conhecimento?: string;
    habilidades_bncc?: string[];
    engine?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

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
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto });
  } catch (e) {
    console.error("Hub dinamica:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar dinâmica." },
      { status: 500 }
    );
  }
}
