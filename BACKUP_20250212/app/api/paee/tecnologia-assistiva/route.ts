import { parseBody, paeeTecnologiaAssistivaSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const parsed = await parseBody(req, paeeTecnologiaAssistivaSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { dificuldade, studentId, studentName, contextoPei, feedback, engine = "red" } = body;

    if (!dificuldade || !studentName) {
      return NextResponse.json({ error: "Dificuldade específica e nome do estudante são obrigatórios." }, { status: 400 });
    }

    const engineId = (["red", "blue", "green", "yellow", "orange"].includes(engine) ? engine : "red") as EngineId;

    const prompt = `
    SUGESTÃO DE TECNOLOGIA ASSISTIVA.
    Estudante: ${studentName} | Dificuldade: ${dificuldade}.
    Contexto PEI: ${(contextoPei || "").slice(0, 1500)}
    ${feedback ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${feedback}\n` : ""}
    
    Sugira recursos em 3 níveis:
    
    1. **BAIXA TECNOLOGIA (DIY - Faça Você Mesmo)**
       - Materiais simples e de baixo custo
       - Instruções passo a passo
       - Tempo de confecção
       - Custo estimado
    
    2. **MÉDIA TECNOLOGIA**
       - Recursos prontos disponíveis no mercado
       - Aplicativos gratuitos ou de baixo custo
       - Adaptações simples de materiais existentes
       - Onde encontrar/comprar
    
    3. **ALTA TECNOLOGIA**
       - Equipamentos especializados
       - Softwares específicos
       - Recursos de acessibilidade avançados
       - Processo de solicitação/viabilidade
    
    Para cada sugestão, inclua:
    - Nome do recurso
    - Finalidade específica
    - Como usar na prática
    - Benefícios para o aluno
    - Dificuldades possíveis e soluções
    - Referências para aprofundamento
    `;

    const resultado = await chatCompletionText(engineId, [{ role: "user", content: prompt }], { temperature: 0.7 });

    return NextResponse.json({ sugestoes: resultado });
  } catch (error) {
    console.error("Erro ao gerar sugestões de tecnologia assistiva:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar sugestões de tecnologia assistiva." },
      { status: 500 }
    );
  }
}
