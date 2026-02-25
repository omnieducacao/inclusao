import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chatCompletionText } from "@/lib/ai-engines";
import { anonymizeText } from "@/lib/ai-anonymize";

/**
 * POST /api/avaliacao-processual/gerar-relatorio
 * Generates an AI-powered evolution report for a student.
 */

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        nome,
        serie,
        diagnostico,
        disciplina,
        periodos = [],
        tipo_periodo = "bimestral",
    } = body;

    if (!nome || !disciplina || periodos.length === 0) {
        return NextResponse.json({
            error: "Dados obrigatórios: nome, disciplina, pelo menos 1 período",
        }, { status: 400 });
    }

    const { anonymized: nomeAnonimo } = anonymizeText(nome);

    const tipoLabel = tipo_periodo === "bimestral" ? "Bimestre" : tipo_periodo === "trimestral" ? "Trimestre" : "Semestre";

    const resumoPeriodos = periodos.map((p: {
        bimestre: number;
        media_nivel: number | null;
        habilidades?: Array<{ codigo_bncc: string; nivel_atual: number }>;
        observacao_geral?: string;
    }) => {
        const habsResumo = (p.habilidades || [])
            .map((h) => `${h.codigo_bncc}: N${h.nivel_atual}`)
            .join(", ");
        return `${tipoLabel} ${p.bimestre}: Média ${p.media_nivel ?? "N/A"}${habsResumo ? ` | ${habsResumo}` : ""}${p.observacao_geral ? ` | Obs: ${p.observacao_geral}` : ""}`;
    }).join("\n");

    const prompt = `Você é um pedagogo especialista em educação inclusiva.
Gere um relatório de evolução processual para o professor regente.

DADOS DO ESTUDANTE:
- Nome: ${nomeAnonimo}
- Série: ${serie || "não informada"}
- Diagnóstico: ${diagnostico || "não informado"}
- Disciplina: ${disciplina}

DADOS DA AVALIAÇÃO PROCESSUAL (${tipo_periodo}):
${resumoPeriodos}

INSTRUÇÕES:
1. Analise a evolução entre períodos
2. Identifique padrões de melhora ou regressão
3. Sugira ações pedagógicas concretas para o próximo período
4. Use linguagem acessível (sem termos clínicos)
5. Seja objetivo e prático

RETORNE em JSON válido com esta estrutura exata:
{
  "titulo": "Relatório de Evolução Processual — [Disciplina]",
  "periodo_analisado": "1º ao Xº [tipo]",
  "resumo_evolucao": "Texto de 3-4 linhas com panorama geral",
  "tendencia_geral": "melhora" ou "estavel" ou "regressao",
  "pontos_destaque": [
    { "tipo": "positivo" ou "atencao", "texto": "..." }
  ],
  "habilidades_progresso": ["códigos BNCC que melhoraram"],
  "habilidades_atencao": ["códigos BNCC que precisam reforço"],
  "acoes_sugeridas": [
    { "acao": "o que fazer", "justificativa": "por que", "prioridade": "alta" ou "media" ou "baixa" }
  ],
  "nota_para_pei": "Se houver necessidade de revisão do PEI" ou null
}`;

    try {
        const response = await chatCompletionText("red", [
            { role: "system", content: "Você é um pedagogo especialista. Responda APENAS em JSON válido." },
            { role: "user", content: prompt },
        ], {
            temperature: 0.4,
            workspaceId: session.workspace_id || undefined,
            source: "avaliacao-processual-relatorio",
        });

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const relatorio = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

        return NextResponse.json({ relatorio });
    } catch (err) {
        console.error("Erro ao gerar relatório de evolução:", err);

        // Structured fallback
        const medias = periodos
            .filter((p: { media_nivel: number | null }) => p.media_nivel !== null)
            .map((p: { media_nivel: number }) => p.media_nivel);

        const mediaInicial = medias.length > 0 ? medias[0] : 0;
        const mediaFinal = medias.length > 0 ? medias[medias.length - 1] : 0;
        const diff = mediaFinal - mediaInicial;
        const tendencia = diff > 0.3 ? "melhora" : diff < -0.3 ? "regressao" : "estavel";

        return NextResponse.json({
            relatorio: {
                titulo: `Relatório de Evolução — ${disciplina}`,
                periodo_analisado: `1º ao ${periodos.length}º ${tipoLabel.toLowerCase()}`,
                resumo_evolucao: `O estudante foi avaliado em ${periodos.length} ${tipoLabel.toLowerCase()}s com média evoluindo de ${mediaInicial} para ${mediaFinal}.`,
                tendencia_geral: tendencia,
                pontos_destaque: [
                    { tipo: tendencia === "melhora" ? "positivo" : "atencao", texto: `Média ${diff > 0 ? "crescente" : diff < 0 ? "decrescente" : "estável"} ao longo dos períodos.` },
                ],
                habilidades_progresso: [],
                habilidades_atencao: [],
                acoes_sugeridas: [
                    { acao: "Revisar estratégias de intervenção", justificativa: "Acompanhar de perto a evolução", prioridade: "media" },
                ],
                nota_para_pei: tendencia === "regressao" ? "Considerar revisão do PEI com base nos dados da processual." : null,
            },
            fallback: true,
        });
    }
}
