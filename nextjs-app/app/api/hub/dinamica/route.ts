import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";

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

  if (!assunto) {
    return NextResponse.json({ error: "Informe o assunto/tema." }, { status: 400 });
  }

  let infoBncc = "";
  if (body.habilidades_bncc?.length) {
    infoBncc += "\nHabilidades BNCC:\n" + body.habilidades_bncc.map((h) => `- ${h}`).join("\n");
  }
  if (body.ano) infoBncc += `\nAno: ${body.ano}`;
  if (body.unidade_tematica) infoBncc += `\nUnidade Temática: ${body.unidade_tematica}`;
  if (body.objeto_conhecimento) infoBncc += `\nObjeto do Conhecimento: ${body.objeto_conhecimento}`;

  const perfil = (aluno.ia_sugestao || "").slice(0, 400);
  const hiperfoco = aluno.hiperfoco || "Geral";
  const nome = aluno.nome || "o estudante";

  const prompt = `Crie uma DINÂMICA INCLUSIVA para ${qtdAlunos} estudantes.

INFORMAÇÕES DO ESTUDANTE FOCAL:
- Nome: ${nome}
- Perfil: ${perfil}
- Hiperfoco: ${hiperfoco}

INFORMAÇÕES DA DINÂMICA:
- Componente Curricular: ${materia}
- Tema: ${assunto}
- Características da turma: ${caracteristicas || "Não informado"}
${infoBncc}

ESTRUTURA OBRIGATÓRIA:

1. **NOME DA DINÂMICA E OBJETIVO**
   - Nome criativo
   - Objetivo claro

2. **MATERIAIS NECESSÁRIOS**

3. **PREPARAÇÃO**
   - Como preparar a sala/ambiente

4. **PASSO A PASSO** (detalhado)
   - Instruções claras para o professor
   - Inclua adaptações para o estudante focal

5. **DURAÇÃO ESTIMADA**

6. **AVALIAÇÃO**
   - Como avaliar a participação de todos

7. **VARIAÇÕES**
   - Sugestões para adaptar a dinâmica

Regra LGPD: NUNCA inclua diagnóstico ou CID.`;

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
