import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";

export async function POST(req: Request) {
  let body: {
    estudante?: { nome?: string };
    frequencia?: string;
    acoes?: string;
    engine?: string;
    feedback?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  // PAEE: DeepSeek (red) sempre
  const { engine, error: engineErr } = selectEngine("paee", null, true);
  
  if (engineErr) {
    return NextResponse.json({ error: engineErr }, { status: 500 });
  }

  const estudante = body.estudante || {};
  const nome = estudante.nome || "Estudante";
  const frequencia = body.frequencia || "1x/sem";
  const acoes = body.acoes || "";

  if (!acoes.trim()) {
    return NextResponse.json({ error: "Informe o trabalho desenvolvido no AEE." }, { status: 400 });
  }

  const promptFeedback = body.feedback?.trim() ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${body.feedback}\n` : "";

  const prompt = `
CARTA DE ARTICULAÇÃO (AEE -> SALA REGULAR).
Estudante: ${nome}. 
Frequência no AEE: ${frequencia}.
Ações desenvolvidas no AEE: ${acoes}.
${promptFeedback}
ESTRUTURA DO DOCUMENTO:

1. **Cabeçalho Institucional**
   - Nome da escola
   - Data
   - Destinatário (Professor Regente)

2. **Resumo das Habilidades Desenvolvidas**
   - Competências trabalhadas
   - Progressos observados
   - Dificuldades persistentes

3. **Estratégias de Generalização** (para sala regular)
   - Como transferir as habilidades
   - Adaptações necessárias
   - Sinais de alerta

4. **Orientações Práticas** (3 dicas principais)
   - Para atividades em grupo
   - Para avaliações
   - Para gestão comportamental

5. **Plano de Ação Conjunto**
   - Responsabilidades do AEE
   - Responsabilidades da sala regular
   - Envolvimento da família

6. **Próximos Passos**
   - Reuniões de alinhamento
   - Avaliações periódicas
   - Ajustes necessários

7. **Contatos e Suporte**
   - Horários de atendimento
   - Canal de comunicação
   - Emergências

Formato: Documento formal mas acolhedor, com linguagem clara e objetiva.
`;

  try {
    const texto = await withFallback("paee", null, async (selectedEngine) => {
      return await chatCompletionText(selectedEngine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    });
    return NextResponse.json({ texto });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar documento de articulação." },
      { status: 500 }
    );
  }
}
