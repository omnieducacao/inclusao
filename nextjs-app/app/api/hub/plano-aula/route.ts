import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  let body: {
    materia?: string;
    assunto?: string;
    engine?: string;
    duracao_minutos?: number;
    metodologia?: string;
    tecnica?: string;
    qtd_alunos?: number;
    recursos?: string[];
    habilidades_bncc?: string[];
    estudante?: { nome?: string; hiperfoco?: string; perfil?: string };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const materia = (body.materia || "Geral").trim();
  const assunto = (body.assunto || "").trim();
  const duracao = body.duracao_minutos ?? 50;
  const metodologia = (body.metodologia || "Metodologias ativas").trim();
  const tecnica = (body.tecnica || "Não especificada").trim();
  const qtdAlunos = body.qtd_alunos ?? 25;
  const recursos = body.recursos?.length ? body.recursos : ["Quadro", "Material impresso", "Projetor"];
  const habilidadesBncc = body.habilidades_bncc || [];
  const estudante = body.estudante || {};
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";

  if (!assunto) {
    return NextResponse.json({ error: "Informe o assunto/tema da aula." }, { status: 400 });
  }

  let infoBncc = "";
  if (habilidadesBncc.length > 0) {
    infoBncc = `\nHABILIDADES BNCC:\n${habilidadesBncc.map((h) => `- ${h}`).join("\n")}`;
  }

  let infoAluno = "";
  if (estudante.nome || estudante.hiperfoco) {
    infoAluno = `
INFORMAÇÕES DO ESTUDANTE (DUA):
- Nome: ${estudante.nome || ""}
- Hiperfoco: ${estudante.hiperfoco || ""}
- Perfil: ${(estudante.perfil || "").slice(0, 300)}
`;
  }

  const prompt = `ATUAR COMO: Coordenador Pedagógico Especialista em BNCC, DUA e Metodologias Ativas.

Crie um PLANO DE AULA COMPLETO com as seguintes informações:

INFORMAÇÕES BÁSICAS:
- Componente Curricular: ${materia}
- Tema/Assunto: ${assunto}
- Metodologia: ${metodologia}
- Técnica: ${tecnica}
- Quantidade de Estudantes: ${qtdAlunos}
- Duração da aula: ${duracao} minutos (${duracao === 50 ? "1 aula" : "2 aulas"})
- Recursos Disponíveis: ${recursos.join(", ")}
${infoBncc}
${infoAluno}

ESTRUTURA DO PLANO (Markdown):

## 📋 PLANO DE AULA: ${assunto}

### 🎯 OBJETIVOS DE APRENDIZAGEM
- Objetivo geral
- Objetivos específicos (3-4)
- Habilidades da BNCC trabalhadas

### 📚 CONTEÚDOS
- Conteúdos conceituais
- Conteúdos procedimentais
- Conteúdos atitudinais

### ⏰ TEMPO ESTIMADO
- Duração total: ${duracao} minutos — distribua o tempo entre as etapas (acolhida, desenvolvimento, avaliação) de forma coerente.

### 🛠 RECURSOS DIDÁTICOS
- Lista de recursos necessários

### 🚀 DESENVOLVIMENTO DA AULA
#### 1. ACOLHIDA E MOTIVAÇÃO
- Atividade de engajamento

#### 2. APRESENTAÇÃO DO CONTEÚDO
- Explicação do tema
- Conexões com conhecimentos prévios

#### 3. ATIVIDADE PRÁTICA
- Descrição detalhada da atividade

#### 4. AVALIAÇÃO E FECHAMENTO
- Verificação dos objetivos

Regra LGPD: NUNCA inclua diagnóstico ou CID no plano.`;

  const engineErr = getEngineError(engine);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Hub plano-aula:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar plano." },
      { status: 500 }
    );
  }
}
