import { negadoForaDoVinculo } from "@/lib/turmas";
import { parseBody, paeeRelatorioCicloSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { getSession } from "@/lib/session";
import { getStudent } from "@/lib/students";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { logger } from "@/lib/logger";

/**
 * POST /api/paee/relatorio-ciclo
 * Cross-module: generates a cycle report by crossing PAEE cycle objectives
 * with Diário de Bordo entries from the same period.
 */
export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    try {
        const session = await getSession();
        if (!session?.workspace_id) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const parsed = await parseBody(req, paeeRelatorioCicloSchema);
        if (parsed.error) return parsed.error;
        const body = parsed.data;
        const { studentId, ciclo, engine: engineParam } = body;

        if (!studentId || !ciclo) {
            return NextResponse.json({ error: "StudentId e ciclo são obrigatórios." }, { status: 400 });
        }

        const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(engineParam) ? engineParam : "red";
        const engineErr = getEngineError(engine);
        if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

        // Fetch diário entries for this student within the cycle period
        // Onda 1: estudante sempre da escola da sessão; o diário mora em students.daily_logs
        // (a tabela "diario_registros" nunca existiu).
        const foraDoVinculo = await negadoForaDoVinculo(session, studentId);
        if (foraDoVinculo) return foraDoVinculo;
        const student = await getStudent(session.workspace_id, studentId);
        if (!student) {
            return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });
        }
        const nomeEstudante = student.name || "Estudante";
        const diagnostico = String((student.pei_data as Record<string, unknown> | undefined)?.diagnostico || student.diagnosis || "");
        const registros = ((student.daily_logs || []) as Array<Record<string, unknown>>)
            .slice()
            .sort((x, y) => String(x.data_sessao || "").localeCompare(String(y.data_sessao || "")))
            .slice(-30);

        // Build context from cycle data
        const cicloInfo = `
CICLO: ${ciclo.nome || ciclo.tipo || "Ciclo"}
TIPO: ${ciclo.tipo || "planejamento"}
PERÍODO: ${ciclo.data_inicio || "?"} a ${ciclo.data_fim || "?"}
FOCO: ${ciclo.foco || "-"}
OBJETIVOS: ${ciclo.objetivos || ciclo.conteudo || "-"}
CRONOGRAMA: ${ciclo.cronograma || "-"}
`.trim();

        // Build diário summary
        const diarioResumo = registros.length > 0
            ? registros.map((r: Record<string, unknown>, i: number) => {
                return `#${i + 1} | ${r.data_sessao || "?"} | ${r.duracao_minutos || 0}min | Engajamento: ${r.engajamento_aluno || "?"}/5
Atividade: ${r.atividade_principal || "-"}
Objetivos: ${r.objetivos_trabalhados || "-"}
Positivo: ${r.pontos_positivos || "-"}
Dificuldades: ${r.dificuldades_identificadas || "-"}`;
            }).join("\n---\n")
            : "Nenhum registro de diário encontrado para este período.";

        const system = `Você é um analista pedagógico especialista em AEE (Atendimento Educacional Especializado).

Sua tarefa: cruzar os OBJETIVOS do ciclo PAEE com os REGISTROS do Diário de Bordo para gerar um relatório de progresso.

Estruture EXATAMENTE assim em Markdown:

## 📋 Resumo do Ciclo
Período, tipo, foco principal, total de sessões registradas.

## 📊 Progresso por Objetivo
Para cada objetivo do ciclo, analise:
- Status (Atingido / Em progresso / Não iniciado / Parcial)
- Evidências nos registros do diário
- % estimada de avanço

## 📈 Análise de Engajamento
- Engajamento médio no período
- Tendência (melhorando/estável/declinando)
- Sessões de destaque (positivas ou negativas)

## 💡 Recomendações para o Próximo Ciclo
- 3-5 sugestões concretas
- Objetivos a manter, ajustar ou substituir
- Estratégias que funcionaram vs. que precisam mudar

REGRAS:
- Seja específico, cite datas e dados reais
- Se não há registros suficientes, sinalize
- Linguagem profissional, máximo 600 palavras`;

        const user = `ESTUDANTE: ${nomeEstudante}
DIAGNÓSTICO: ${diagnostico || "em acompanhamento"}

${cicloInfo}

REGISTROS DO DIÁRIO (${registros.length} sessões):
${diarioResumo}`;

        const { anonymized, restore } = anonymizeMessages([
            { role: "system", content: system },
            { role: "user", content: user },
        ], nomeEstudante);

        const texto = await chatCompletionText(engine, anonymized, { temperature: 0.5 });

        return NextResponse.json({ texto: restore(texto || "").trim() });
    } catch (err) {
        logger.error({ err: err }, "PAEE Relatório Ciclo:");
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar relatório." },
            { status: 500 }
        );
    }
}
