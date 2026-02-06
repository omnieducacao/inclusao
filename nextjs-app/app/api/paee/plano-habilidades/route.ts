import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";

export async function POST(req: Request) {
  let body: {
    estudante?: { nome?: string; ia_sugestao?: string };
    foco?: string;
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
  const contexto = (estudante.ia_sugestao || "").slice(0, 2000);
  const foco = body.foco || "Funções Executivas";

  const promptFeedback = body.feedback?.trim() ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${body.feedback}\n` : "";

  const prompt = `
CRIE PLANO DE INTERVENÇÃO AEE.
FOCO: ${foco}.
ESTUDANTE: ${nome} | CONTEXTO PEI: ${contexto}
${promptFeedback}
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

  try {
    const texto = await withFallback("paee", null, async (selectedEngine) => {
      return await chatCompletionText(selectedEngine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    });
    return NextResponse.json({ texto });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar plano de habilidades." },
      { status: 500 }
    );
  }
}
