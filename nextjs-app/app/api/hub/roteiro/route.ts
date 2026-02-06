import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  let body: {
    aluno?: { nome?: string; ia_sugestao?: string; hiperfoco?: string };
    materia?: string;
    assunto?: string;
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
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";

  if (!assunto) {
    return NextResponse.json({ error: "Informe o assunto." }, { status: 400 });
  }

  let infoBncc = "";
  if (body.habilidades_bncc?.length) {
    infoBncc += "\nHabilidades BNCC:\n" + body.habilidades_bncc.map((h) => `- ${h}`).join("\n");
  }
  if (body.ano) infoBncc += `\nAno: ${body.ano}`;
  if (body.unidade_tematica) infoBncc += `\nUnidade Temática: ${body.unidade_tematica}`;
  if (body.objeto_conhecimento) infoBncc += `\nObjeto do Conhecimento: ${body.objeto_conhecimento}`;

  const perfil = (aluno.ia_sugestao || "").slice(0, 500);
  const hiperfoco = aluno.hiperfoco || "Geral";
  const nome = aluno.nome || "o estudante";

  const prompt = `Crie um ROTEIRO DE AULA INDIVIDUALIZADO para ${nome}.

INFORMAÇÕES DO ESTUDANTE:
- Perfil: ${perfil}
- Hiperfoco: ${hiperfoco}

INFORMAÇÕES DA AULA:
- Componente Curricular: ${materia}
- Assunto: ${assunto}
${infoBncc}

ESTRUTURA OBRIGATÓRIA:

1. **CONEXÃO INICIAL COM O HIPERFOCO** (2-3 minutos)
   - Como conectar o tema com o hiperfoco do estudante

2. **OBJETIVOS DA AULA**
   - Objetivos claros e mensuráveis

3. **DESENVOLVIMENTO PASSO A PASSO** (15-20 minutos)
   - Divida em 3-4 etapas claras
   - Inclua perguntas mediadoras
   - Use exemplos relacionados ao hiperfoco

4. **ATIVIDADE PRÁTICA INDIVIDUAL** (5-7 minutos)
   - Tarefa que o estudante pode fazer sozinho

5. **FECHAMENTO E REFLEXÃO** (3-5 minutos)
   - Verificação dos objetivos
   - Pergunta de reflexão

6. **RECURSOS E MATERIAIS**

7. **AVALIAÇÃO FORMATIVA**
   - Como avaliar durante a aula

Regra LGPD: NUNCA inclua diagnóstico ou CID.`;

  const err = getEngineError(engine);
  if (err) return NextResponse.json({ error: err }, { status: 500 });

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto });
  } catch (e) {
    console.error("Hub roteiro:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar roteiro." },
      { status: 500 }
    );
  }
}
