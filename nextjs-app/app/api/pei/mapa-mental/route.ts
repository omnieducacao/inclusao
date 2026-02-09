import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
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
    const diagnostico = (peiData.diagnostico as string) || "em observação";
    const hiperfoco = (peiData.hiperfoco as string) || "";
    const potencias = Array.isArray(peiData.potencias) ? peiData.potencias : [];
    const barreiras = peiData.barreiras_selecionadas as Record<string, string[]> || {};
    const rede = Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : [];
    const estrategias = [
        ...(Array.isArray(peiData.estrategias_acesso) ? peiData.estrategias_acesso : []),
        ...(Array.isArray(peiData.estrategias_ensino) ? peiData.estrategias_ensino : []),
        ...(Array.isArray(peiData.estrategias_avaliacao) ? peiData.estrategias_avaliacao : []),
    ];

    const barreirasTxt = Object.entries(barreiras)
        .filter(([, v]) => v && v.length)
        .map(([area, lst]) => `${area}: ${lst.join(", ")}`)
        .join("\n");

    const system = `Você é um especialista em educação inclusiva. Gere EXCLUSIVAMENTE um JSON válido (sem markdown, sem backticks, sem explicação) com a estrutura de mapa mental do perfil do estudante.

Formato EXATO do JSON:
{
  "centro": "Nome do Estudante",
  "ramos": [
    { "titulo": "Potencialidades", "cor": "#38A169", "icone": "⭐", "filhos": ["item1", "item2"] },
    { "titulo": "Barreiras", "cor": "#E53E3E", "icone": "🧱", "filhos": ["item1", "item2"] },
    { "titulo": "Estratégias", "cor": "#3182CE", "icone": "🎯", "filhos": ["item1", "item2"] },
    { "titulo": "Rede de Apoio", "cor": "#805AD5", "icone": "🤝", "filhos": ["item1", "item2"] },
    { "titulo": "Metas", "cor": "#DD6B20", "icone": "🏁", "filhos": ["Curto: ...", "Médio: ...", "Longo: ..."] }
  ]
}

REGRAS:
- Máximo 5 filhos por ramo
- Filhos devem ser strings curtas e práticas
- Baseie-se ESTRITAMENTE nos dados fornecidos
- Retorne APENAS o JSON, sem texto adicional`;

    const user = `ESTUDANTE: ${nome}
DIAGNÓSTICO: ${diagnostico}
HIPERFOCO: ${hiperfoco || "não identificado"}
POTENCIALIDADES: ${potencias.join(", ") || "não mapeadas"}
BARREIRAS:\n${barreirasTxt || "não mapeadas"}
ESTRATÉGIAS: ${estrategias.join(", ") || "não definidas"}
REDE DE APOIO: ${rede.join(", ") || "não informada"}
RELATÓRIO IA: ${((peiData.ia_sugestao as string) || "").slice(0, 600)}`;

    try {
        const texto = await chatCompletionText(engine, [
            { role: "system", content: system },
            { role: "user", content: user },
        ], { temperature: 0.4 });

        // Tentar extrair JSON do resultado
        const jsonMatch = texto.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({ error: "IA não retornou JSON válido." }, { status: 500 });
        }
        const mapa = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ mapa });
    } catch (err) {
        console.error("PEI Mapa Mental:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar mapa mental." },
            { status: 500 }
        );
    }
}
