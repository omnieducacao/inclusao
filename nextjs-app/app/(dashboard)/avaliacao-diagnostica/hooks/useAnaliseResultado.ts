"use client";

import { useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────

export interface ResultadoQualitativo {
    nivel_desempenho: string;
    nivel_omnisfera: number;
    score_geral: number;
    habilidades: Array<{
        codigo_bncc: string;
        acertou: boolean;
        nivel_desempenho: string;
        distrator_ativado?: string;
        erro_cognitivo?: string;
        sugestao_mediacao?: string;
    }>;
    mapa_competencias: {
        dominadas: string[];
        em_desenvolvimento: string[];
        nao_demonstradas: string[];
    };
    agrupamento_sugerido?: {
        grupo: string;
        descricao: string;
    };
    mediacao_sugerida: string;
    disclaimer_pedagogico: string;
}

// ── Hook: useAnaliseResultado ────────────────────────────────

export function useAnaliseResultado() {
    const [resultado, setResultado] = useState<ResultadoQualitativo | null>(null);
    const [analisando, setAnalisando] = useState(false);
    const [erroAnalise, setErroAnalise] = useState("");

    const analisarResultado = useCallback(async (params: {
        studentId: string;
        disciplina: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questoes: any[];
        respostas: Record<string, string>;
        diagnosticoAluno?: string;
    }) => {
        setAnalisando(true);
        setErroAnalise("");

        try {
            const res = await fetch("/api/avaliacao-diagnostica/resultado-qualitativo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro na análise");

            setResultado(data.resultado || data);
            return data.resultado || data;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro na análise";
            setErroAnalise(msg);
            return null;
        } finally {
            setAnalisando(false);
        }
    }, []);

    const resetAnalise = useCallback(() => {
        setResultado(null);
        setErroAnalise("");
    }, []);

    return {
        resultado,
        analisando,
        erroAnalise,
        analisarResultado,
        resetAnalise,
    };
}
