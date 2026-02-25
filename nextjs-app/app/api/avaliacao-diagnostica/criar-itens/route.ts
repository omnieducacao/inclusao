import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { criarPromptItensAvancado } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { readFileSync } from "fs";
import { join } from "path";

let cachedMatriz: Record<string, unknown> | null = null;
function loadMatriz() {
    if (!cachedMatriz) {
        const raw = readFileSync(join(process.cwd(), "data", "matriz_diagnostica.json"), "utf-8");
        cachedMatriz = JSON.parse(raw);
    }
    return cachedMatriz!;
}

export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    const { error: authError } = await requireAuth(); if (authError) return authError;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const disciplina = (body.disciplina as string) || "";
    const serie = (body.serie as string) || "";
    const habilidades_selecionadas = (body.habilidades_selecionadas as string[]) || [];
    const qtdQuestoes = (body.qtd_questoes as number) || 4;
    const tipoQuestao = (body.tipo_questao as string) || "Objetiva";
    const diagnostico_aluno = (body.diagnostico_aluno as string) || "";
    const nome_aluno = (body.nome_aluno as string) || "o estudante";
    const plano_ensino_contexto = (body.plano_ensino_contexto as string) || "";
    const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine as string || "")
        ? (body.engine as EngineId)
        : "red";

    if (!disciplina && habilidades_selecionadas.length === 0) {
        return NextResponse.json({ error: "Selecione uma disciplina ou habilidades." }, { status: 400 });
    }

    // Enrich with matrix data
    let matrizContext = "";
    if (habilidades_selecionadas.length > 0) {
        matrizContext = `\nHABILIDADES DA MATRIZ DE REFERÊNCIA SELECIONADAS:\n${habilidades_selecionadas.map(h => `- ${h}`).join("\n")}`;
    }

    // Get protocol adaptations for the diagnostic
    const matriz = loadMatriz();
    const protocolo = matriz.protocolo as Record<string, unknown>;
    const escala = protocolo.escala as { nivel: number; label: string; descritor: string }[];
    const adaptacoes = protocolo.adaptacoes_nee as Record<string, string> || {};

    let protocoloContext = "\nESCALA OMNISFERA (Níveis de Proficiência):";
    for (const e of escala || []) {
        protocoloContext += `\n- Nível ${e.nivel} (${e.label}): ${e.descritor}`;
    }

    if (diagnostico_aluno && adaptacoes[diagnostico_aluno]) {
        protocoloContext += `\n\nADAPTAÇÕES PARA ${diagnostico_aluno.toUpperCase()}: ${adaptacoes[diagnostico_aluno]}`;
    }

    let planoContext = "";
    if (plano_ensino_contexto) {
        planoContext = `\n\nPLANO DE ENSINO VINCULADO:\n${typeof plano_ensino_contexto === "string" ? plano_ensino_contexto.slice(0, 1500) : JSON.stringify(plano_ensino_contexto).slice(0, 1500)}`;
    }

    // Build the prompt using the advanced item creation function
    const prompt = criarPromptItensAvancado({
        materia: disciplina || "conteúdo baseado nas habilidades selecionadas",
        objeto: disciplina,
        qtd: qtdQuestoes,
        tipo_q: tipoQuestao as "Objetiva" | "Discursiva",
        qtd_imgs: 0,
        verbos_bloom: [],
        habilidades_bncc: habilidades_selecionadas,
        modo_profundo: false,
        checklist_adaptacao: {},
        hiperfoco: "Geral",
        ia_sugestao: diagnostico_aluno ? `Estudante com ${diagnostico_aluno}` : "",
    });

    const promptFinal = `${prompt}${matrizContext}${protocoloContext}${planoContext}

CONTEXTO DIAGNÓSTICO ADICIONAL:
- Esta avaliação é DIAGNÓSTICA — seu objetivo é IDENTIFICAR o nível Omnisfera (0-4) do estudante em ${disciplina}.
- Crie questões com dificuldade PROGRESSIVA: comece com itens de nível 1 (emergente) e aumente até nível 4 (consolidado).
- Para ${nome_aluno}, série ${serie}.
- FORMATO OBRIGATÓRIO DE SAÍDA (JSON):
Retorne APENAS um JSON válido com esta estrutura:
{
  "questoes": [
    {
      "id": "q1",
      "enunciado": "texto do enunciado",
      "alternativas": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "gabarito": "A",
      "justificativa_pedagogica": "...",
      "instrucao_aplicacao_professor": "...",
      "nivel_bloom": "Lembrar|Compreender|Aplicar|Analisar",
      "habilidade_bncc_ref": "código BNCC",
      "nivel_omnisfera_alvo": 1
    }
  ]
}
Garanta que as questões cubram os 4 níveis Omnisfera progressivamente.`;

    const engineErr = getEngineError(engine);
    if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

    try {
        const { anonymized, restore } = anonymizeMessages(
            [{ role: "user", content: promptFinal }],
            nome_aluno !== "o estudante" ? nome_aluno : null
        );
        const textoRaw = await chatCompletionText(engine, anonymized, { temperature: 0.5 });
        const texto = restore(textoRaw);

        // Try to parse JSON from the response
        let questoes = null;
        try {
            // Try direct JSON parse
            const jsonMatch = texto.match(/\{[\s\S]*"questoes"[\s\S]*\}/);
            if (jsonMatch) {
                questoes = JSON.parse(jsonMatch[0]);
            }
        } catch {
            // Return raw text if JSON parse fails
        }

        return NextResponse.json({ texto, questoes });
    } catch (err) {
        console.error("Avaliação Diagnóstica criar-itens:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar itens diagnósticos." },
            { status: 500 }
        );
    }
}
