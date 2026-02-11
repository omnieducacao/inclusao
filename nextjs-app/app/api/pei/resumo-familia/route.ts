import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    let peiData: Record<string, unknown> = {};
    let engine: EngineId = "red";

    try {
        const body = await req.json();
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
    const serie = (peiData.serie as string) || "";
    const diagnostico = (peiData.diagnostico as string) || "";
    const hiperfoco = (peiData.hiperfoco as string) || "";
    const potencias = Array.isArray(peiData.potencias) ? peiData.potencias : [];
    const barreiras = peiData.barreiras_selecionadas as Record<string, string[]> || {};
    const meds = Array.isArray(peiData.lista_medicamentos) ? peiData.lista_medicamentos : [];
    const rede = Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : [];
    const iaSugestao = ((peiData.ia_sugestao as string) || "").slice(0, 800);

    const barreirasTxt = Object.entries(barreiras)
        .filter(([, v]) => v && v.length)
        .map(([area, lst]) => `${area}: ${lst.join(", ")}`)
        .join("\n");

    const medsTxt = meds.length
        ? meds.map((m: { nome?: string }) => m.nome || "").filter(Boolean).join(", ")
        : "nenhuma";

    const system = `Você é um especialista em educação inclusiva que se comunica com FAMÍLIAS.

MISSÃO: Criar um resumo carinhoso e acessível sobre o acompanhamento escolar do estudante, para ser apresentado em reunião com a família.

REGRAS ABSOLUTAS:
- Linguagem simples, calorosa e acolhedora
- PROIBIDO: jargão técnico, siglas (PEI, PAEE, DUA, BNCC, CID), termos médicos complexos
- Comece SEMPRE pelas POTÊNCIAS e conquistas
- Use "seu filho(a)" ou o nome do estudante
- Evite palavras como "déficit", "incapacidade", "limitação"
- Prefira: "desafio", "ponto de atenção", "área que estamos trabalhando"
- Descreva as estratégias como "o que estamos fazendo na escola para ajudar"
- Termine com uma mensagem de parceria escola-família
- Use Markdown simples (títulos ##, bullets -)
- Máximo 600 palavras`;

    const user = `ESTUDANTE: ${nome} | SÉRIE: ${serie}
DIAGNÓSTICO: ${diagnostico || "em acompanhamento"}
INTERESSES/HIPERFOCO: ${hiperfoco || "diversos"}
PONTOS FORTES: ${potencias.join(", ") || "em observação"}
DESAFIOS:\n${barreirasTxt || "em avaliação"}
MEDICAÇÃO: ${medsTxt}
REDE DE APOIO: ${rede.join(", ") || "escola"}
RESUMO DO PLANO:\n${iaSugestao || "plano em construção"}`;

    try {
        const texto = await chatCompletionText(engine, [
            { role: "system", content: system },
            { role: "user", content: user },
        ], { temperature: 0.7 });
        return NextResponse.json({ texto: (texto || "").trim() });
    } catch (err) {
        console.error("PEI Resumo Família:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar resumo." },
            { status: 500 }
        );
    }
}
