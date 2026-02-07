import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { frequencia, acoes, studentId, studentName, feedback, engine = "red" } = body;

    if (!acoes || !studentName) {
      return NextResponse.json({ error: "Ações desenvolvidas e nome do estudante são obrigatórios." }, { status: 400 });
    }

    const engineId = (["red", "blue", "green", "yellow", "orange"].includes(engine) ? engine : "red") as EngineId;

    const prompt = `
    CARTA DE ARTICULAÇÃO (AEE -> SALA REGULAR).
    Estudante: ${studentName}. 
    Frequência no AEE: ${frequencia || "Não informado"}.
    Ações desenvolvidas no AEE: ${acoes}.
    ${feedback ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${feedback}\n` : ""}
    
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

    const resultado = await chatCompletionText(engineId, [{ role: "user", content: prompt }], { temperature: 0.6 });

    return NextResponse.json({ documento: resultado });
  } catch (error) {
    console.error("Erro ao gerar documento de articulação:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar documento de articulação." },
      { status: 500 }
    );
  }
}
