import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  try {
    const body = await req.json();
    const { focoTreino, studentId, studentName, contextoPei, feedback, engine = "red" } = body;

    if (!focoTreino || !studentName) {
      return NextResponse.json({ error: "Foco do atendimento e nome do estudante são obrigatórios." }, { status: 400 });
    }

    const engineId = (["red", "blue", "green", "yellow", "orange"].includes(engine) ? engine : "red") as EngineId;

    const prompt = `
    CRIE PLANO DE INTERVENÇÃO AEE.
    FOCO: ${focoTreino}.
    ESTUDANTE: ${studentName} | CONTEXTO PEI: ${(contextoPei || "").slice(0, 2000)}
    ${feedback ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${feedback}\n` : ""}
    
    GERE 3 METAS SMART (Curto, Médio, Longo prazo) com estrutura completa:
    
    Para cada meta, inclua:
    1. **Meta Específica** (o que será alcançado)
    2. **Indicadores de Progresso** (como medir)
    3. **Estratégias de Ensino** (como ensinar)
    4. **Recursos e Materiais**
    5. **Frequência de Intervenção**
    6. **Responsáveis** (AEE, sala regular, família)
    7. **Critérios de Sucesso**
    
    TEMPORALIDADE:
    - CURTO PRAZO (1-2 meses): Habilidades básicas
    - MÉDIO PRAZO (3-6 meses): Consolidação
    - LONGO PRAZO (6-12 meses): Generalização
    
    Inclua também:
    - Registro de observações
    - Sistema de monitoramento
    - Estratégias de generalização para outros contextos
    `;

    const resultado = await chatCompletionText(engineId, [{ role: "user", content: prompt }], { temperature: 0.7 });

    return NextResponse.json({ plano: resultado });
  } catch (error) {
    console.error("Erro ao gerar plano de habilidades:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar plano de habilidades." },
      { status: 500 }
    );
  }
}
