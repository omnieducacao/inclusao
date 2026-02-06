import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";

export async function POST(req: Request) {
  let body: {
    estudante?: { nome?: string; diagnosis?: string; ia_sugestao?: string };
    observacao?: string;
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
  const diagnosis = estudante.diagnosis || "";
  const contexto = (estudante.ia_sugestao || "").slice(0, 2500);
  const obs = body.observacao || "";

  if (!obs.trim()) {
    return NextResponse.json({ error: "Informe a observação do AEE." }, { status: 400 });
  }

  const promptFeedback = body.feedback?.trim() ? `\nFEEDBACK PARA AJUSTE (revisão do professor): ${body.feedback}\n` : "";

  const prompt = `
ATUAR COMO: Especialista em AEE.
ESTUDANTE: ${nome} | DIAGNÓSTICO (clínico/CID): ${diagnosis}
CONTEXTO DO PEI: ${contexto}
OBSERVAÇÃO ATUAL: ${obs}
${promptFeedback}
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

  try {
    const texto = await withFallback("paee", null, async (selectedEngine) => {
      return await chatCompletionText(selectedEngine, [{ role: "user", content: prompt }], { temperature: 0.5 });
    });
    return NextResponse.json({ texto });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao gerar análise de barreiras." },
      { status: 500 }
    );
  }
}
