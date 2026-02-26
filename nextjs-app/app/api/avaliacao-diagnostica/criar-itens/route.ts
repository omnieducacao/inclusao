import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import {
    buildContextoAluno,
    templateQuestoesDiagnosticas,
    buildPromptCompleto,
    mapDiagnosticoToPerfilNEE,
} from "@/lib/omnisfera-prompts";
import { readFileSync } from "fs";
import { join } from "path";

// ── Cache BNCC completa ──────────────────────────────────────

interface BnccHabilidade {
    codigo: string;
    segmento: string;
    ano: string;
    disciplina: string;
    unidade_tematica: string;
    objeto_conhecimento: string;
    habilidade: string;
    nivel_cognitivo_saeb: string;
    prioridade_saeb: string;
    instrumento_avaliativo: string;
}

let cachedBncc: BnccHabilidade[] | null = null;
function loadBncc(): BnccHabilidade[] {
    if (!cachedBncc) {
        const raw = readFileSync(join(process.cwd(), "data", "bncc_completa.json"), "utf-8");
        cachedBncc = JSON.parse(raw);
    }
    return cachedBncc!;
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
    const tipoQuestao = ((body.tipo_questao as string) || "Objetiva") as "Objetiva" | "Discursiva";
    const diagnostico_aluno = (body.diagnostico_aluno as string) || "";
    const nome_aluno = (body.nome_aluno as string) || "o estudante";
    const plano_ensino_contexto = (body.plano_ensino_contexto as string) || "";
    const alerta_nee = (body.alerta_nee as string) || "";
    const instrucao_uso_diagnostica = (body.instrucao_uso_diagnostica as string) || "";
    const nivel_omnisfera_estimado = (body.nivel_omnisfera_estimado as number) ?? 1;
    const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine as string || "")
        ? (body.engine as EngineId)
        : "red";

    if (!disciplina && habilidades_selecionadas.length === 0) {
        return NextResponse.json({ error: "Selecione uma disciplina ou habilidades." }, { status: 400 });
    }

    // ── Build habilidades from BNCC completa ──────────────────

    const bncc = loadBncc();
    let habsParaPrompt: Array<{
        codigo: string;
        disciplina: string;
        unidade_tematica: string;
        objeto_conhecimento: string;
        habilidade: string;
        nivel_cognitivo_saeb?: string;
    }> = [];

    if (habilidades_selecionadas.length > 0) {
        // Match selected habilidades from the BNCC data
        for (const sel of habilidades_selecionadas) {
            const codeMatch = sel.match(/(EF\d+\w+\d+|EI\d+\w+\d+)/i);
            if (codeMatch) {
                const found = bncc.find(h => h.codigo === codeMatch[1]);
                if (found) {
                    habsParaPrompt.push({
                        codigo: found.codigo,
                        disciplina: found.disciplina,
                        unidade_tematica: found.unidade_tematica,
                        objeto_conhecimento: found.objeto_conhecimento,
                        habilidade: found.habilidade,
                        nivel_cognitivo_saeb: found.nivel_cognitivo_saeb,
                    });
                    continue;
                }
            }
            // Fallback: use the raw string as habilidade
            habsParaPrompt.push({
                codigo: sel.slice(0, 20),
                disciplina,
                unidade_tematica: "",
                objeto_conhecimento: "",
                habilidade: sel,
            });
        }
    } else {
        // Auto-select from BNCC by discipline and grade
        const gradeNum = serie.match(/\d+/)?.[0] || "6";
        const filtered = bncc.filter(h => {
            const discMatch = h.disciplina.toLowerCase().includes(disciplina.toLowerCase()) ||
                disciplina.toLowerCase().includes(h.disciplina.toLowerCase());
            const yearMatch = h.ano.includes(gradeNum);
            return discMatch && yearMatch;
        });

        // Prioritize SAEB priority
        const sorted = filtered.sort((a, b) => {
            const order = { alta: 0, media: 1, baixa: 2 };
            return (order[a.prioridade_saeb as keyof typeof order] ?? 2) -
                (order[b.prioridade_saeb as keyof typeof order] ?? 2);
        });

        habsParaPrompt = sorted.slice(0, Math.min(qtdQuestoes + 2, 8)).map(h => ({
            codigo: h.codigo,
            disciplina: h.disciplina,
            unidade_tematica: h.unidade_tematica,
            objeto_conhecimento: h.objeto_conhecimento,
            habilidade: h.habilidade,
            nivel_cognitivo_saeb: h.nivel_cognitivo_saeb,
        }));
    }

    if (habsParaPrompt.length === 0) {
        // Fallback: generate generic habilidade
        habsParaPrompt = [{
            codigo: `EF_${disciplina.toUpperCase().slice(0, 3)}`,
            disciplina,
            unidade_tematica: "Diagnóstica Geral",
            objeto_conhecimento: "Avaliação inicial",
            habilidade: `Avaliar nível do estudante em ${disciplina}`,
        }];
    }

    // ── Build 3-layer prompt ─────────────────────────────────

    // Camada 2: Contexto do Aluno
    const camada2 = buildContextoAluno({
        nome: nome_aluno,
        serie,
        diagnostico: diagnostico_aluno,
        nivel_omnisfera_estimado,
    });

    // Camada 3: Template da Tarefa
    const camada3 = templateQuestoesDiagnosticas({
        habilidades: habsParaPrompt,
        quantidade: qtdQuestoes,
        tipo_questao: tipoQuestao,
        nivel_omnisfera_estimado,
        plano_ensino_contexto: plano_ensino_contexto || undefined,
    });

    // Build complete prompt (system + user)
    let { system, user } = buildPromptCompleto(camada2, camada3);

    // Enrich with NEE-specific guidance
    if (alerta_nee) {
        user += `\n\n--- ALERTA POR PERFIL NEE ---\n${alerta_nee}`;
    }
    if (instrucao_uso_diagnostica) {
        user += `\n\n--- INSTRUÇÃO DE USO DIAGNÓSTICA ---\n${instrucao_uso_diagnostica}`;
    }

    const engineErr = getEngineError(engine);
    if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

    try {
        const { anonymized, restore } = anonymizeMessages(
            [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
            nome_aluno !== "o estudante" ? nome_aluno : null
        );
        const textoRaw = await chatCompletionText(engine, anonymized, {
            temperature: 0.4,  // Lower for diagnostic precision (from CONTEXT.md)
        });
        const texto = restore(textoRaw);

        // Try to parse JSON from the response
        let questoes = null;
        try {
            // Try direct JSON parse first
            const parsed = JSON.parse(texto);
            if (parsed.questoes) questoes = parsed;
        } catch {
            // Try to extract JSON block
            try {
                const jsonMatch = texto.match(/\{[\s\S]*"questoes"[\s\S]*\}/);
                if (jsonMatch) {
                    questoes = JSON.parse(jsonMatch[0]);
                }
            } catch { /* give up on JSON parsing */ }
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
