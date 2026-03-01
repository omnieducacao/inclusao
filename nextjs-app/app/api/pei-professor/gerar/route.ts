import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/pei-professor/gerar
 * Gera o PEI por disciplina via IA, com fundamentação em neurociência.
 *
 * Body: { student_id, disciplina }
 */
export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION);
    if (rl) return rl;

    const session = await getSession();
    if (!session?.workspace_id || !session.member?.id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { student_id, disciplina } = body as { student_id: string; disciplina: string };

    if (!student_id || !disciplina) {
        return NextResponse.json({ error: "student_id e disciplina obrigatórios" }, { status: 400 });
    }

    const sb = getSupabase();

    // Buscar dados do estudante
    const { data: student } = await sb
        .from("students")
        .select("name, grade, class_group, diagnosis, pei_data")
        .eq("id", student_id)
        .eq("workspace_id", session.workspace_id)
        .maybeSingle();

    if (!student) {
        return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
    }

    const peiData = (student.pei_data || {}) as Record<string, unknown>;

    // Buscar avaliação diagnóstica do estudante (se existir)
    let avaliacaoInfo = "";
    try {
        const { data: avDiag } = await sb
            .from("avaliacao_processual")
            .select("disciplina, bimestre, habilidades, observacao_geral")
            .eq("student_id", student_id)
            .eq("workspace_id", session.workspace_id)
            .eq("disciplina", disciplina)
            .order("bimestre", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (avDiag) {
            const habs = (avDiag.habilidades || []) as Array<{ codigo_bncc?: string; descricao?: string; nivel_atual?: number }>;
            avaliacaoInfo = `\nAvaliação Diagnóstica (${disciplina}, bimestre ${avDiag.bimestre}):\n` +
                habs.map(h => `- ${h.codigo_bncc || "?"}: ${h.descricao || "?"} → Nível ${h.nivel_atual ?? "?"}/4`).join("\n") +
                (avDiag.observacao_geral ? `\nObservação: ${avDiag.observacao_geral}` : "");
        }
    } catch { /* tabela pode não existir */ }

    // Buscar habilidades BNCC selecionadas
    const habsBncc = Array.isArray(peiData.habilidades_bncc_validadas)
        ? peiData.habilidades_bncc_validadas
        : Array.isArray(peiData.habilidades_bncc_selecionadas)
            ? peiData.habilidades_bncc_selecionadas
            : [];
    const bnccInfo = habsBncc.length > 0
        ? `\nHabilidades BNCC selecionadas:\n${(habsBncc as Array<{ codigo?: string; descricao?: string; habilidade_completa?: string }>)
            .map(h => `- ${h.codigo || ""}: ${h.habilidade_completa || h.descricao || ""}`)
            .join("\n")}`
        : "";

    // Contexto do PEI 1
    const peiContext = [
        peiData.nome ? `Nome: ${peiData.nome}` : "",
        peiData.serie ? `Série: ${peiData.serie}` : "",
        student.diagnosis ? `Diagnóstico: ${student.diagnosis}` : "",
        peiData.barreiras ? `Barreiras: ${JSON.stringify(peiData.barreiras)}` : "",
        peiData.potencialidades ? `Potencialidades: ${peiData.potencialidades}` : "",
        peiData.ia_sugestao ? `Resumo PEI 1: ${(peiData.ia_sugestao as string).substring(0, 1000)}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `Você é um especialista em educação inclusiva com formação em neurociência aplicada à aprendizagem.

Gere um PEI completo para a disciplina **${disciplina}** do estudante descrito abaixo. Este é o material de trabalho do professor regente.

## Contexto do Estudante (PEI 1)
${peiContext}
${avaliacaoInfo}
${bnccInfo}

## INSTRUÇÕES — Gere o PEI em formato JSON com EXATAMENTE estas seções:

{
  "direcionamento": "Análise do perfil do estudante em relação a ${disciplina}: como ele aprende, quais são seus pontos fortes e desafios na disciplina, nível atual de desempenho. Seja específico e prático.",
  
  "objetivos": "3 a 5 objetivos de aprendizagem SMART alinhados às habilidades BNCC priorizadas para ${disciplina}. Cada objetivo deve ser mensurável.",
  
  "estrategias_neurociencia": "5 a 8 estratégias pedagógicas fundamentadas em neurociência (memória de trabalho, atenção sustentada, funções executivas, regulação emocional, neuroplasticidade, processamento sensorial). Para cada estratégia: nome da base neurocientífica, ação concreta do professor, exemplo prático na aula de ${disciplina}.",
  
  "adaptacoes_curriculares": "Adaptações específicas de: ① acesso (materiais, ambiente), ② objetivo (adequação de metas), ③ conteúdo (recorte/priorização), ④ método (como ensinar), ⑤ avaliação (como avaliar). Cada uma com ação prática.",
  
  "criterios_avaliacao": "Como avaliar o progresso do estudante nesta disciplina: instrumentos, frequência, indicadores de sucesso por nível (0-4 escala Omnisfera).",
  
  "recursos_recomendados": "3 a 5 recursos ou materiais específicos recomendados para este estudante nesta disciplina."
}

IMPORTANTE:
- Seja PRÁTICO e ESPECÍFICO para ${disciplina} — este é o documento de trabalho diário do professor
- Use linguagem acessível — evite jargão clínico excessivo
- As estratégias de neurociência devem ser APLICÁVEIS em sala de aula
- Responda APENAS o JSON, sem markdown, sem backticks, sem texto antes ou depois`;

    try {
        const engine: EngineId = "red"; // DeepSeek
        const result = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.5 });

        // Tentar parsear JSON
        let parsed: Record<string, unknown>;
        try {
            // Limpar possíveis markdown code blocks
            const cleaned = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            parsed = JSON.parse(cleaned);
        } catch {
            // Se falhar, retornar como texto
            parsed = {
                direcionamento: result,
                objetivos: "",
                estrategias_neurociencia: "",
                adaptacoes_curriculares: "",
                criterios_avaliacao: "",
                recursos_recomendados: "",
            };
        }

        return NextResponse.json({ pei_disciplina: parsed });
    } catch (err) {
        console.error("[pei-professor/gerar] error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar PEI" },
            { status: 500 }
        );
    }
}
