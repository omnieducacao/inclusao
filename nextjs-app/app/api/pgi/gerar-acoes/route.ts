import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import type { DimensionamentoPGI } from "@/lib/pgi";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const dimensionamento = body.dimensionamento as DimensionamentoPGI;
    const engine = (["red", "blue", "green"].includes(body.engine || "") ? body.engine : "red") as EngineId;

    const engineErr = getEngineError(engine);
    if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

    const nTotal = dimensionamento.n_total ?? 0;
    const nDef = dimensionamento.n_deficiencia ?? 0;
    const nProf = dimensionamento.n_prof ?? 0;
    const horasDia = dimensionamento.horas_dia ?? 0;

    if (nTotal === 0 && nDef === 0 && nProf === 0 && horasDia === 0) {
      return NextResponse.json({ error: "Preencha o dimensionamento primeiro." }, { status: 400 });
    }

    const prompt = `Você é um consultor especializado em educação inclusiva. Com base no dimensionamento da escola abaixo, sugira ações práticas e viáveis para o Plano de Gestão Inclusiva (PGI).

DIMENSIONAMENTO:
- Total de alunos: ${nTotal}
- Alunos com deficiência/necessidades específicas: ${nDef}
- Profissionais da equipe de inclusão: ${nProf}
- Horas efetivas da equipe por dia: ${horasDia}

TIPOS DE AÇÃO POSSÍVEIS:
1. dimensionamento_pgei - Alocação de recursos, mediadores, ampliação de carga horária
2. infraestrutura - Rampas, banheiros adaptados, tecnologias assistivas
3. sala_multifuncional - Equipamentos SRM, materiais adaptados, organização do espaço
4. formacao - Capacitação docente, HTPC, formação sobre LDB/BNCC
5. recursos_pedagogicos - Materiais adaptados, intérpretes de Libras
6. comunicacao_procedimentos - Fluxo de recepção à família, arquivamento de documentação

PERFIS DE ATENDIMENTO: TEA, Deficiência física, Deficiência visual, Deficiência auditiva, Deficiência intelectual, Altas habilidades, Dificuldades de aprendizagem

Retorne APENAS um JSON válido com um array de ações sugeridas:
{
  "acoes": [
    {
      "tipo": "dimensionamento_pgei",
      "o_que": "Ação prática e específica",
      "por_que": "Justificativa baseada no dimensionamento",
      "quem": "Responsável sugerido",
      "onde": "Local sugerido",
      "como": "Método sugerido",
      "prazo": "YYYY-MM-DD",
      "custo": "Estimativa em R$ ou 'A definir'",
      "perfil": ["TEA", "Deficiência física"]
    }
  ]
}

REGRAS:
- Sugira 3 a 6 ações prioritárias baseadas no dimensionamento
- Se nDef > nProf * 2, sugira contratação de mediadores
- Se horasDia < 6, sugira ampliação de carga horária
- Se nDef > 0 e nProf === 0, sugira formação da equipe
- Considere infraestrutura se nDef > 0
- Ações devem ser práticas, viáveis e alinhadas à legislação (LBI, Decreto 6.571/2008, LDB)
- Use apenas os tipos de ação listados acima
- Use apenas os perfis listados acima`;

    const texto = await chatCompletionText(
      engine,
      [{ role: "user", content: prompt }],
      { temperature: 0.7 }
    );

    // Extrair JSON da resposta
    let jsonStr = texto.trim();
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }

    const parsed = JSON.parse(jsonStr);
    const acoes = Array.isArray(parsed.acoes) ? parsed.acoes : [];

    return NextResponse.json({ acoes });
  } catch (err) {
    console.error("Erro ao gerar ações PGI:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar ações." },
      { status: 500 }
    );
  }
}
