/**
 * Testes Unitários — lib/avaliacao-imagens.ts
 *
 * Testa a lógica de decisão de imagem por perfil NEE e barreiras:
 * - determinarTipoImagem: TEA, DI, TA, SEM_NEE, habilidades visuais
 * - gerarInstrucaoImagemParaPrompt: formatação da instrução
 * - MAPEAMENTO_IMAGEM_BARREIRA: constantes de mapeamento
 */

import { describe, it, expect } from "vitest";
import {
    determinarTipoImagem,
    gerarInstrucaoImagemParaPrompt,
    MAPEAMENTO_IMAGEM_BARREIRA,
} from "@/lib/avaliacao-imagens";

describe("MAPEAMENTO_IMAGEM_BARREIRA", () => {
    it("contém mapeamentos para TEA, DI, TA e genérico", () => {
        const keys = Object.keys(MAPEAMENTO_IMAGEM_BARREIRA);
        expect(keys.some(k => k.startsWith("tea_"))).toBe(true);
        expect(keys.some(k => k.startsWith("di_"))).toBe(true);
        expect(keys.some(k => k.startsWith("ta_"))).toBe(true);
        expect(keys.some(k => k.startsWith("generico_"))).toBe(true);
    });

    it("cada mapeamento tem tipo, descricaoPrompt e prioridadeVisual", () => {
        for (const [, config] of Object.entries(MAPEAMENTO_IMAGEM_BARREIRA)) {
            expect(config.tipo).toBeDefined();
            expect(config.descricaoPrompt).toBeDefined();
            expect(config.prioridadeVisual).toBeDefined();
        }
    });
});

describe("determinarTipoImagem", () => {
    it("TEA sempre retorna necessário com prioridade obrigatória", () => {
        const result = determinarTipoImagem({ perfilNEE: "TEA" });
        expect(result.necessario).toBe(true);
        expect(result.prioridadeVisual).toBe("obrigatoria");
    });

    it("TEA com barreira de abstração usa 'concreto'", () => {
        const result = determinarTipoImagem({
            perfilNEE: "TEA",
            barreirasAtivas: { "Abstração e Generalização": true },
        });
        expect(result.necessario).toBe(true);
        expect(result.tipo).toBe("concreto");
        expect(result.configKey).toBe("tea_abstracao");
    });

    it("TEA com barreira de comunicação usa 'pictograma'", () => {
        const result = determinarTipoImagem({
            perfilNEE: "TEA",
            barreirasAtivas: { "Linguagem Receptiva": true },
        });
        expect(result.tipo).toBe("simbolico");
        expect(result.configKey).toBe("tea_comunicacao");
    });

    it("TEA com barreira de organização usa 'organizacao'", () => {
        const result = determinarTipoImagem({
            perfilNEE: "TEA",
            barreirasAtivas: { "Planejamento e Organização": true },
        });
        expect(result.tipo).toBe("organizacao");
        expect(result.configKey).toBe("tea_organizacao");
    });

    it("DI retorna necessário", () => {
        const result = determinarTipoImagem({ perfilNEE: "DI" });
        expect(result.necessario).toBe(true);
    });

    it("DI com barreira memória de trabalho tem prioridade obrigatória", () => {
        const result = determinarTipoImagem({
            perfilNEE: "DI",
            barreirasAtivas: { "Memória de Trabalho": true },
        });
        expect(result.necessario).toBe(true);
        expect(result.prioridadeVisual).toBe("obrigatoria");
    });

    it("TRANSTORNO_APRENDIZAGEM com dislexia retorna recomendada", () => {
        const result = determinarTipoImagem({
            perfilNEE: "TRANSTORNO_APRENDIZAGEM",
            barreirasAtivas: { "Decodificação Leitora": true },
        });
        expect(result.necessario).toBe(true);
        expect(result.prioridadeVisual).toBe("recomendada");
    });

    it("SEM_NEE sem habilidade visual retorna não necessário", () => {
        const result = determinarTipoImagem({ perfilNEE: "SEM_NEE" });
        expect(result.necessario).toBe(false);
        expect(result.prioridadeVisual).toBe("desnecessaria");
    });

    it("SEM_NEE com habilidade de gráfico retorna necessário", () => {
        const result = determinarTipoImagem({
            perfilNEE: "SEM_NEE",
            habilidadeDescricao: "Interpretar dados de gráfico de barras",
        });
        expect(result.necessario).toBe(true);
    });
});

describe("gerarInstrucaoImagemParaPrompt", () => {
    it("gera instrução completa quando necessário", () => {
        const decisao = determinarTipoImagem({ perfilNEE: "TEA" });
        const instrucao = gerarInstrucaoImagemParaPrompt(decisao);
        expect(instrucao).toContain("SUPORTE VISUAL OBRIGATÓRIO");
        expect(instrucao).toContain("necessario: true");
    });

    it("retorna não necessário quando imagem dispensável", () => {
        const decisao = determinarTipoImagem({ perfilNEE: "SEM_NEE" });
        const instrucao = gerarInstrucaoImagemParaPrompt(decisao);
        expect(instrucao).toContain("necessario = false");
    });
});
