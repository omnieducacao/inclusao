import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";

export async function POST(req: Request) {
  let body: {
    materia?: string;
    assunto?: string;
    hiperfoco?: string;
    tema_turma?: string;
    nome_estudante?: string;
    engine?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

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

  const prompt = `Crie 3 sugestões de 'Papo de Mestre' (Quebra-gelo/Introdução) para conectar ${nomeEstudante} à aula.
Componente Curricular: ${materia}. Assunto: ${assunto}.
Hiperfoco do estudante: ${hiperfoco}.
Tema de interesse da turma (DUA): ${temaTurma || "Não informado"}.

O objetivo é usar o hiperfoco ou o interesse da turma como UMA PONTE (estratégia DUA de engajamento) para explicar o conceito de ${assunto}.
Seja criativo e profundo.
Regra LGPD: NUNCA inclua diagnóstico ou CID no texto.`;

  try {
    const texto = await withFallback("hub", body.engine, async (selectedEngine) => {
      return await chatCompletionText(selectedEngine, [{ role: "user", content: prompt }], { temperature: 0.8 });
    });
    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Hub papo-mestre:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar conexões." },
      { status: 500 }
    );
  }
}
