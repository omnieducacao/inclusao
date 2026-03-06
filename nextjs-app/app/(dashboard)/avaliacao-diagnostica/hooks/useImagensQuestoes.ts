"use client";

import { useState, useCallback } from "react";

// ── Hook: useImagensQuestoes ────────────────────────────────

export interface ImagemState {
    url: string;
    questaoIndex: number;
    gerando: boolean;
}

export function useImagensQuestoes() {
    const [mapaImagens, setMapaImagens] = useState<Record<number, string>>({});
    const [gerandoImagem, setGerandoImagem] = useState<number | null>(null);

    const gerarImagem = useCallback(async (params: {
        questaoIndex: number;
        tipo: string;
        descricao: string;
        textoAlternativo: string;
        disciplina: string;
        serie: string;
    }) => {
        const { questaoIndex, tipo, descricao, textoAlternativo, disciplina, serie } = params;
        setGerandoImagem(questaoIndex);

        try {
            const res = await fetch("/api/avaliacao-diagnostica/gerar-imagem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: tipo || "ilustracao",
                    descricao,
                    texto_alternativo: textoAlternativo || descricao,
                    disciplina,
                    serie,
                }),
            });

            if (!res.ok) throw new Error("Erro ao gerar imagem");

            const data = await res.json();
            if (data.imageUrl) {
                setMapaImagens(prev => ({ ...prev, [questaoIndex]: data.imageUrl }));
                return data.imageUrl;
            }
            return null;
        } catch {
            return null;
        } finally {
            setGerandoImagem(null);
        }
    }, []);

    const removerImagem = useCallback((questaoIndex: number) => {
        setMapaImagens(prev => {
            const next = { ...prev };
            delete next[questaoIndex];
            return next;
        });
    }, []);

    return {
        mapaImagens,
        setMapaImagens,
        gerandoImagem,
        gerarImagem,
        removerImagem,
    };
}
