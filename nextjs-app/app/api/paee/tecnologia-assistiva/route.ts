import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";

export async function POST(req: Request) {
  let body: {
    estudante?: { nome?: string; ia_sugestao?: string };
    dificuldade?: string;
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
  const contexto = (estudante.ia_sugestao || "").slice(0, 1500);
  const dificuldade = body.dificuldade || "";

  if (!dificuldade.trim()) {
    return NextResponse.json({ error: "Informe a dificuldade específica." }, { status: 400 });
  }

  const promptFeedback = body.feedback?.trim() ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${body.feedback}\n` : "";

  const prompt = `
SUGESTÃO DE TECNOLOGIA ASSISTIVA.
Estudante: ${nome} | Dificuldade: ${dificuldade}.
Contexto PEI: ${contexto}
${promptFeedback}
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

  try {
    const texto = await withFallback("paee", null, async (selectedEngine) => {
      return await chatCompletionText(selectedEngine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    });
    return NextResponse.json({ texto });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar sugestões de tecnologia assistiva." },
      { status: 500 }
    );
  }
}
