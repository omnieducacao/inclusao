"use client";

import { useState, useCallback } from "react";
import type { EngineId } from "@/lib/ai-engines";

// ── Types ────────────────────────────────────────────────────

export interface QuestaoGerada {
    id?: string;
    habilidade_bncc_ref?: string;
    enunciado?: string;
    comando?: string;
    suporte_visual?: {
        necessario: boolean;
        justificativa?: string;
        tipo?: string;
        descricao_para_geracao?: string;
        texto_alternativo?: string;
        justificativa_pedagogica?: string;
    };
    alternativas?: Record<string, string>;
    gabarito?: string;
    analise_distratores?: Record<string, string>;
    justificativa_pedagogica?: string;
    instrucao_aplicacao_professor?: string;
    adaptacao_nee_aplicada?: string;
    nivel_suporte_recomendado?: string;
    nivel_omnisfera_alvo?: number;
    nivel_bloom?: string;
    tempo_estimado_minutos?: number;
    // Runtime fields
    _numero?: number;
    _gabarito_esperado?: string;
    _erro?: string;
    _imagemUrl?: string;
    _imagemGerada?: boolean;
    _imagemPermitida?: boolean;
    [key: string]: unknown;
}

export interface ProgressoGeracao {
    atual: number;
    total: number;
    status: "idle" | "gerando" | "concluido" | "erro";
}

interface GeracaoParams {
    habilidades: string[];
    disciplina: string;
    serie: string;
    qtdQuestoes: number;
    diagnosticoAluno: string;
    nomeAluno: string;
    nivelOmnisferaEstimado: number;
    planoEnsinoContexto?: string | null;
    alertaNee: string;
    instrucaoDiagnostica: string;
    barreirasAtivas: Record<string, boolean>;
    engine: EngineId;
    usarImagens: boolean;
    qtdImagens: number;
}

// ── Utility: clean AI image text from enunciado ──────────────

export function limparEnunciado(enunciado: string, descricaoImagem?: string | null): string {
    let clean = enunciado || "";
    if (descricaoImagem) {
        clean = clean.replace(descricaoImagem, "").replace(/\n{3,}/g, "\n\n").trim();
    }
    clean = clean
        .replace(/\[?\s*(?:Ilustra[çc][aã]o|Imagem|Fotografia|Diagrama|Gr[aá]fico|Mapa)\s*(?:mostrando|representando|de|com|:)[^\]\n]*\]?/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    return clean;
}

// ── Build formatted text from questions list ─────────────────

export function buildResultadoFormatado(
    questoes: QuestaoGerada[],
    imagens: Record<number, string>
): string {
    let texto = "";
    for (let i = 0; i < questoes.length; i++) {
        const q = questoes[i];
        if (q._erro) {
            texto += `### Questão ${i + 1}\n\n⚠️ Erro ao gerar: ${q._erro}\n\n---\n\n`;
            continue;
        }
        const sv = q.suporte_visual;
        const enunciadoClean = limparEnunciado(
            (q.enunciado || "") as string,
            sv?.descricao_para_geracao
        );

        const imgUrl = imagens[i + 1] || q._imagemUrl;
        const textoQ = [
            `### Questão ${i + 1} — ${q.habilidade_bncc_ref || ""}`,
            "",
            enunciadoClean || "",
            q.comando ? `\n**${q.comando}**` : "",
            imgUrl ? `\n![Imagem da questão ${i + 1}](${imgUrl})\n` : "",
            "",
            `**A)** ${q.alternativas?.A || ""}`,
            `**B)** ${q.alternativas?.B || ""}`,
            `**C)** ${q.alternativas?.C || ""}`,
            `**D)** ${q.alternativas?.D || ""}`,
            "",
            `> **Gabarito:** ${q.gabarito || q._gabarito_esperado || ""}`,
            q.justificativa_pedagogica ? `> ${q.justificativa_pedagogica}` : "",
            "",
            "---",
            "",
        ]
            .filter(Boolean)
            .join("\n");
        texto += textoQ;
    }
    return texto;
}

// ── Hook: useGeracaoQuestoes ─────────────────────────────────

export function useGeracaoQuestoes() {
    const [questoes, setQuestoes] = useState<QuestaoGerada[]>([]);
    const [progresso, setProgresso] = useState<ProgressoGeracao>({
        atual: 0,
        total: 0,
        status: "idle",
    });
    const [mapaImagens, setMapaImagens] = useState<Record<number, string>>({});
    const [resultadoFormatado, setResultadoFormatado] = useState<string | null>(null);
    const [erro, setErro] = useState("");

    const gerarQuestoes = useCallback(async (params: GeracaoParams) => {
        const {
            habilidades, disciplina, serie, qtdQuestoes,
            diagnosticoAluno, nomeAluno, nivelOmnisferaEstimado,
            planoEnsinoContexto, alertaNee, instrucaoDiagnostica,
            barreirasAtivas, engine, usarImagens, qtdImagens,
        } = params;

        // Build queue
        const fila: string[] = [];
        for (let i = 0; i < qtdQuestoes; i++) {
            fila.push(habilidades[i % habilidades.length] || disciplina);
        }

        // Distribute gabaritos A-D
        const letras = ["A", "B", "C", "D"];
        const gabaritos: string[] = [];
        for (let i = 0; i < fila.length; i++) gabaritos.push(letras[i % 4]);
        // Fisher-Yates shuffle
        for (let i = gabaritos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gabaritos[i], gabaritos[j]] = [gabaritos[j], gabaritos[i]];
        }

        // Progressive difficulty
        const dificuldades = fila.map((_, i) => {
            const pct = i / (fila.length - 1 || 1);
            return pct < 0.33 ? "facil" : pct < 0.67 ? "medio" : "dificil";
        });

        setProgresso({ atual: 0, total: fila.length, status: "gerando" });
        setQuestoes([]);
        setMapaImagens({});
        setResultadoFormatado(null);
        setErro("");

        const questoesGeradas: QuestaoGerada[] = [];
        const imagensGeradas: Record<number, string> = {};
        let countImagens = 0;

        for (let i = 0; i < fila.length; i++) {
            setProgresso({ atual: i + 1, total: fila.length, status: "gerando" });

            try {
                const res = await fetch("/api/avaliacao-diagnostica/criar-item", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        habilidade_codigo: fila[i],
                        disciplina,
                        serie,
                        gabarito_definido: gabaritos[i],
                        nivel_dificuldade: dificuldades[i],
                        numero_questao: i + 1,
                        total_questoes: fila.length,
                        diagnostico_aluno: diagnosticoAluno,
                        nome_aluno: nomeAluno,
                        nivel_omnisfera_estimado: nivelOmnisferaEstimado,
                        plano_ensino_contexto: planoEnsinoContexto,
                        alerta_nee: alertaNee,
                        instrucao_uso_diagnostica: instrucaoDiagnostica,
                        barreiras_ativas: barreirasAtivas,
                        engine,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Erro ao gerar item");

                const questao: QuestaoGerada = data.questao || {};
                questao._numero = i + 1;
                questao._gabarito_esperado = gabaritos[i];
                questoesGeradas.push(questao);
                setQuestoes([...questoesGeradas]);

                // Auto-generate image if needed AND within limit
                const sv = questao.suporte_visual;
                const withinLimit = usarImagens && countImagens < qtdImagens;
                if (sv && sv.necessario && sv.descricao_para_geracao && withinLimit) {
                    questao._imagemPermitida = true;
                    try {
                        const imgRes = await fetch("/api/avaliacao-diagnostica/gerar-imagem", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                tipo: sv.tipo || "ilustracao",
                                descricao: sv.descricao_para_geracao,
                                texto_alternativo: sv.texto_alternativo || sv.descricao_para_geracao,
                                disciplina,
                                serie,
                            }),
                        });
                        if (imgRes.ok) {
                            const imgData = await imgRes.json();
                            if (imgData.imageUrl) {
                                imagensGeradas[i + 1] = imgData.imageUrl;
                                setMapaImagens({ ...imagensGeradas });
                                questao._imagemUrl = imgData.imageUrl;
                                questao._imagemGerada = true;
                                countImagens++;
                            }
                        }
                    } catch { /* image generation is optional */ }
                } else if (sv && sv.necessario) {
                    questao._imagemPermitida = false;
                }
            } catch (err) {
                questoesGeradas.push({
                    _numero: i + 1,
                    _erro: err instanceof Error ? err.message : "Erro desconhecido",
                    _gabarito_esperado: gabaritos[i],
                });
                setQuestoes([...questoesGeradas]);
            }
        }

        // Build formatted text
        const textoFormatado = buildResultadoFormatado(questoesGeradas, imagensGeradas);
        setResultadoFormatado(textoFormatado);
        setProgresso({ atual: fila.length, total: fila.length, status: "concluido" });

        return { questoes: questoesGeradas, imagens: imagensGeradas, texto: textoFormatado };
    }, []);

    const resetGeracao = useCallback(() => {
        setQuestoes([]);
        setProgresso({ atual: 0, total: 0, status: "idle" });
        setMapaImagens({});
        setResultadoFormatado(null);
        setErro("");
    }, []);

    return {
        questoes,
        setQuestoes,
        progresso,
        mapaImagens,
        setMapaImagens,
        resultadoFormatado,
        setResultadoFormatado,
        erro,
        gerarQuestoes,
        resetGeracao,
    };
}
