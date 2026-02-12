import { parseBody, peiDataEngineSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
    let peiData: Record<string, unknown> = {};
    let engine: EngineId = "red";

    try {
        const parsed = await parseBody(req, peiDataEngineSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
        peiData = body.peiData || {};
        if (body.engine && ["red", "blue", "green", "yellow", "orange"].includes(body.engine)) {
            engine = body.engine as EngineId;
        }
    } catch {
        return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
    }

    const engineErr = getEngineError(engine);
    if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

    const nome = (peiData.nome as string) || "Estudante";
    const diagnostico = (peiData.diagnostico as string) || "";
    const hiperfoco = (peiData.hiperfoco as string) || "";
    const potencias = Array.isArray(peiData.potencias) ? peiData.potencias : [];
    const barreiras = peiData.barreiras_selecionadas as Record<string, string[]> || {};
    const meds = Array.isArray(peiData.lista_medicamentos) ? peiData.lista_medicamentos : [];
    const estrategias = [
        ...(Array.isArray(peiData.estrategias_acesso) ? peiData.estrategias_acesso : []),
        ...(Array.isArray(peiData.estrategias_ensino) ? peiData.estrategias_ensino : []),
    ];
    const iaSugestao = ((peiData.ia_sugestao as string) || "").slice(0, 800);

    const barreirasTxt = Object.entries(barreiras)
        .filter(([, v]) => v && v.length)
        .map(([area, lst]) => `${area}: ${lst.join(", ")}`)
        .join("\n");

    const medsTxt = meds.length
        ? meds.map((m: { nome?: string; posologia?: string }) => `${m.nome || ""} (${m.posologia || ""})`).filter(Boolean).join("; ")
        : "nenhuma";

    const system = `Você é um especialista em educação inclusiva. Gere EXCLUSIVAMENTE um JSON válido (sem markdown, sem backticks, sem explicação) com perguntas e respostas frequentes sobre o caso do estudante.

Formato EXATO:
[
  { "pergunta": "O que fazer quando...?", "resposta": "Uma resposta prática e objetiva..." },
  ...
]

REGRAS:
- Gere entre 8 e 12 perguntas
- Perguntas devem ser PRÁTICAS e do dia a dia escolar
- Respostas devem ser ACIONÁVEIS (o professor pode aplicar imediatamente)
- Inclua perguntas sobre: comportamento em sala, adaptação de atividades, avaliação, comunicação com família, crises, socialização, medicação (se houver), hiperfoco (se houver)
- Respostas com 2-4 frases cada
- Retorne APENAS o JSON, sem texto adicional`;

    const user = `ESTUDANTE: ${nome}
DIAGNÓSTICO: ${diagnostico || "em observação"}
HIPERFOCO: ${hiperfoco || "não identificado"}
POTENCIALIDADES: ${potencias.join(", ") || "em observação"}
BARREIRAS:\n${barreirasTxt || "não mapeadas"}
ESTRATÉGIAS: ${estrategias.join(", ") || "não definidas"}
MEDICAÇÃO: ${medsTxt}
PLANO PEDAGÓGICO:\n${iaSugestao || "em construção"}`;

    try {
        const texto = await chatCompletionText(engine, [
            { role: "system", content: system },
            { role: "user", content: user },
        ], { temperature: 0.5 });

        const jsonMatch = texto.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return NextResponse.json({ error: "IA não retornou JSON válido." }, { status: 500 });
        }
        const faqs = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ faqs });
    } catch (err) {
        console.error("PEI FAQ:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar FAQ." },
            { status: 500 }
        );
    }
}
