import { parseBody, paeeRelatorioCicloSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

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
        const sb = getSupabase();
        const { data: student } = await sb
            .from("students")
            .select("name, pei_data")
            .eq("id", studentId)
            .single();

        const { data: diarioEntries } = await sb
            .from("diario_registros")
            .select("*")
            .eq("student_id", studentId)
            .order("data_sessao", { ascending: true })
            .limit(30);

        const nomeEstudante = student?.name || "Estudante";
        const diagnostico = (student?.pei_data as Record<string, unknown>)?.diagnostico as string || "";
        const registros = diarioEntries || [];

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

        const texto = await chatCompletionText(engine, [
            { role: "system", content: system },
            { role: "user", content: user },
        ], { temperature: 0.5 });

        return NextResponse.json({ texto: (texto || "").trim() });
    } catch (err) {
        console.error("PAEE Relatório Ciclo:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar relatório." },
            { status: 500 }
        );
    }
}
