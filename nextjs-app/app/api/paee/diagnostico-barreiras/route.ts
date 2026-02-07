import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { observacoes, studentId, studentName, diagnosis, contextoPei, feedback, engine = "red" } = body;

    if (!observacoes || !studentName) {
      return NextResponse.json({ error: "Observações e nome do estudante são obrigatórios." }, { status: 400 });
    }

    const engineId = (["red", "blue", "green", "yellow", "orange"].includes(engine) ? engine : "red") as EngineId;

    const prompt = `
    ATUAR COMO: Especialista em AEE.
    ESTUDANTE: ${studentName} | DIAGNÓSTICO (clínico/CID): ${diagnosis || "Não informado"}
    CONTEXTO DO PEI: ${(contextoPei || "").slice(0, 2500)}
    OBSERVAÇÃO ATUAL: ${observacoes}
    ${feedback ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${feedback}\n` : ""}
    
    CLASSIFIQUE AS BARREIRAS (LBI):
    1. Barreiras Comunicacionais - dificuldades na comunicação e linguagem
    2. Barreiras Metodológicas - métodos de ensino inadequados
    3. Barreiras Atitudinais - atitudes e preconceitos
    4. Barreiras Tecnológicas - falta de recursos tecnológicos adequados
    5. Barreiras Arquitetônicas - espaço físico inadequado
    
    Para cada barreira identificada, forneça:
    - Descrição específica da barreira
    - Impacto na aprendizagem do estudante
    - Sugestões de intervenção imediata práticas e aplicáveis
    - Recursos necessários para implementação
    
    FORMATO DE SAÍDA:
    IMPORTANTE: NÃO use tabelas Markdown. Use apenas texto formatado com:
    - Títulos claros para cada tipo de barreira (ex: "BARREIRAS METODOLÓGICAS")
    - Parágrafos descritivos
    - Listas com marcadores simples (-) para organizar informações
    - Quebras de linha para separar seções
    
    Estrutura sugerida:
    
    [TÍTULO DA BARREIRA]
    
    Descrição: [texto descritivo]
    
    Impacto na Aprendizagem: [texto descritivo]
    
    Sugestões de Intervenção:
    - [sugestão 1]
    - [sugestão 2]
    - [sugestão 3]
    
    Recursos Necessários:
    - [recurso 1]
    - [recurso 2]
    
    SAÍDA: Texto formatado de forma clara e legível, SEM tabelas Markdown.
    `;

    const resultado = await chatCompletionText(engineId, [{ role: "user", content: prompt }], { temperature: 0.5 });

    return NextResponse.json({ diagnostico: resultado });
  } catch (error) {
    console.error("Erro ao gerar diagnóstico de barreiras:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar diagnóstico de barreiras." },
      { status: 500 }
    );
  }
}
