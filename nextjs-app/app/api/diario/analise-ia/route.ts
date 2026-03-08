import { parseBody, diarioAnaliseSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { logger } from "@/lib/logger";

type RegistroResumo = {
    data_sessao?: string;
    duracao_minutos?: number;
    modalidade_atendimento?: string;
    atividade_principal?: string;
    objetivos_trabalhados?: string;
    estrategias_utilizadas?: string;
    engajamento_aluno?: number;
    nivel_dificuldade?: string;
    competencias_trabalhadas?: string[];
    pontos_positivos?: string;
    dificuldades_identificadas?: string;
    proximos_passos?: string;
};

export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    const { error: authError } = await requireAuth(); if (authError) return authError;
    let registros: RegistroResumo[] = [];
    let engine: EngineId = "red";
    let nomeEstudante = "";
    let diagnostico = "";

    try {
        const parsed = await parseBody(req, diarioAnaliseSchema);
        if (parsed.error) return parsed.error;
        const body = parsed.data;
        registros = body.registros || [];
        nomeEstudante = body.nomeEstudante || "Estudante";
        diagnostico = body.diagnostico || "";
        if (body.engine && ["red", "blue", "green", "yellow", "orange"].includes(body.engine)) {
            engine = body.engine as EngineId;
        }
    } catch { /* expected fallback */
        return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
    }

    if (registros.length === 0) {
        return NextResponse.json({ error: "Nenhum registro para analisar." }, { status: 400 });
    }

    const engineErr = getEngineError(engine);
    if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

    // Resumir registros para não exceder contexto
    const resumo = registros.slice(0, 30).map((r, i) => {
        return `#${i + 1} | ${r.data_sessao || "?"} | ${r.modalidade_atendimento || "?"} | ${r.duracao_minutos || 0}min | Engajamento: ${r.engajamento_aluno || "?"}/5 | Dificuldade: ${r.nivel_dificuldade || "?"}
Atividade: ${r.atividade_principal || "-"}
Objetivos: ${r.objetivos_trabalhados || "-"}
Estratégias: ${r.estrategias_utilizadas || "-"}
Competências: ${(r.competencias_trabalhadas || []).join(", ") || "-"}
Positivo: ${r.pontos_positivos || "-"}
Dificuldades: ${r.dificuldades_identificadas || "-"}
Próximos passos: ${r.proximos_passos || "-"}`;
    }).join("\n---\n");

    const totalHoras = Math.round(registros.reduce((acc, r) => acc + (r.duracao_minutos || 0), 0) / 60);
    const engMedia = registros.length > 0
        ? (registros.reduce((acc, r) => acc + (r.engajamento_aluno || 0), 0) / registros.length).toFixed(1)
        : "N/A";

    const system = `Você é um analista pedagógico especialista em educação inclusiva. Analise os registros do Diário de Bordo e produza um relatório de inteligência.

Use Markdown simples. Estruture EXATAMENTE assim:

## 📊 Panorama Geral
Resumo quantitativo: total de sessões, horas, engajamento médio, período.

## 📈 Tendências Identificadas
- Padrões de engajamento (subindo, caindo, estável?)
- Modalidades mais eficazes para este estudante
- Competências que mais avançaram
- Horários/dias com melhor resposta (se identificável)

## ⚠️ Alertas e Pontos de Atenção
- Quedas bruscas de engajamento
- Dificuldades recorrentes
- Competências estagnadas
- Qualquer padrão preocupante

## 💡 Recomendações Práticas
- 3-5 ações concretas baseadas nos padrões encontrados
- Sugestões de modalidade, estratégia ou competência a priorizar
- Ajustes recomendados no plano

## 🎯 Próximos Focos Sugeridos
- Competências prioritárias para as próximas sessões
- Estratégias a testar

REGRAS:
- Seja específico e baseie-se nos dados reais
- Cite datas e números quando possível
- Linguagem profissional mas acessível
- Máximo 500 palavras`;

    const user = `ESTUDANTE: ${nomeEstudante}
DIAGNÓSTICO: ${diagnostico || "em acompanhamento"}
TOTAL: ${registros.length} registros | ${totalHoras}h totais | Engajamento médio: ${engMedia}/5

REGISTROS:
${resumo}`;

    try {
        const { anonymized, restore } = anonymizeMessages([
            { role: "system", content: system },
            { role: "user", content: user },
        ], nomeEstudante);
        const texto = await chatCompletionText(engine, anonymized, { temperature: 0.5 });
        return NextResponse.json({ texto: restore(texto || "").trim() });
    } catch (err) {
        logger.error({ err: err }, "Diário Análise IA:");
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao analisar registros." },
            { status: 500 }
        );
    }
}
