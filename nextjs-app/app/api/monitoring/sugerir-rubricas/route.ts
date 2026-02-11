import { parseBody, sugerirRubricasSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/monitoring/sugerir-rubricas
 * Cross-module: analyzes recent Diário entries to auto-suggest
 * rubric scores for Monitoramento.
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    try {
        const session = await getSession();
        if (!session?.workspace_id) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const parsed = await parseBody(req, sugerirRubricasSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
        const { studentId, engine: engineParam } = body;

        if (!studentId) {
            return NextResponse.json({ error: "StudentId é obrigatório." }, { status: 400 });
        }

        const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(engineParam) ? engineParam : "red";
        const engineErr = getEngineError(engine);
        if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

        const sb = getSupabase();

        // Fetch student info
        const { data: student } = await sb
            .from("students")
            .select("name, pei_data")
            .eq("id", studentId)
            .single();

        // Fetch recent diário entries
        const { data: diarioEntries } = await sb
            .from("diario_registros")
            .select("*")
            .eq("student_id", studentId)
            .order("data_sessao", { ascending: false })
            .limit(15);

        const nomeEstudante = student?.name || "Estudante";
        const diagnostico = (student?.pei_data as Record<string, unknown>)?.diagnostico as string || "";
        const registros = diarioEntries || [];

        if (registros.length < 2) {
            return NextResponse.json(
                { error: "São necessários pelo menos 2 registros no Diário para sugerir rubricas." },
                { status: 400 }
            );
        }

        const diarioResumo = registros.map((r: Record<string, unknown>, i: number) => {
            return `#${i + 1} | ${r.data_sessao || "?"} | Engajamento: ${r.engajamento_aluno || "?"}/5 | Dificuldade: ${r.nivel_dificuldade || "?"}
Atividade: ${r.atividade_principal || "-"}
Competências: ${Array.isArray(r.competencias_trabalhadas) ? (r.competencias_trabalhadas as string[]).join(", ") : "-"}
Positivo: ${r.pontos_positivos || "-"}
Dificuldades: ${r.dificuldades_identificadas || "-"}`;
        }).join("\n---\n");

        const system = `Você é um avaliador pedagógico especialista em educação inclusiva.

Analise os registros do Diário de Bordo e SUGIRA pontuações de rubrica de desenvolvimento.

Responda APENAS em JSON válido, sem markdown, sem explicações fora do JSON:

{
  "autonomia": { "score": 1-5, "justificativa": "..." },
  "social": { "score": 1-5, "justificativa": "..." },
  "conteudo": { "score": 1-5, "justificativa": "..." },
  "comportamento": { "score": 1-5, "justificativa": "..." },
  "resumo": "Uma frase resumindo o desenvolvimento geral."
}

Escala:
1 = Necessita apoio total
2 = Necessita apoio significativo  
3 = Necessita apoio moderado
4 = Necessita apoio esporádico
5 = Independente/Consolidado

REGRAS:
- Baseie-se ESTRITAMENTE nos dados dos registros
- Se dados insuficientes para um eixo, use score 0 e justifique
- Justificativas devem citar evidências dos registros
- Máximo 30 palavras por justificativa`;

        const user = `ESTUDANTE: ${nomeEstudante}
DIAGNÓSTICO: ${diagnostico || "em acompanhamento"}
REGISTROS RECENTES (${registros.length}):
${diarioResumo}`;

        const texto = await chatCompletionText(engine, [
            { role: "system", content: system },
            { role: "user", content: user },
        ], { temperature: 0.3 });

        // Parse JSON response
        try {
            const cleaned = (texto || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const rubricas = JSON.parse(cleaned);
            return NextResponse.json({ rubricas });
        } catch {
            return NextResponse.json({ texto: (texto || "").trim() });
        }
    } catch (err) {
        console.error("Monitoring Sugerir Rubricas:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao sugerir rubricas." },
            { status: 500 }
        );
    }
}
