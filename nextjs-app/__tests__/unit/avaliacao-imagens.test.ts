/**
 * Testes Unitários — Mapeamento Barreira → Imagem
 *
 * Verifica que a decisão de tipo de imagem está correta
 * para cada perfil NEE e combinação de barreiras.
 */

import { describe, it, expect } from "vitest";
import {
    determinarTipoImagem,
    gerarInstrucaoImagemParaPrompt,
    MAPEAMENTO_IMAGEM_BARREIRA,
} from "@/lib/avaliacao-imagens";

describe("avaliacao-imagens", () => {
    describe("MAPEAMENTO_IMAGEM_BARREIRA", () => {
        it("tem mapeamentos para TEA", () => {
            expect(MAPEAMENTO_IMAGEM_BARREIRA["tea_inferencia"]).toBeDefined();
            expect(MAPEAMENTO_IMAGEM_BARREIRA["tea_abstracao"]).toBeDefined();
            expect(MAPEAMENTO_IMAGEM_BARREIRA["tea_comunicacao"]).toBeDefined();
            expect(MAPEAMENTO_IMAGEM_BARREIRA["tea_organizacao"]).toBeDefined();
        });

        it("tem mapeamentos para DI", () => {
            expect(MAPEAMENTO_IMAGEM_BARREIRA["di_memoria_trabalho"]).toBeDefined();
            expect(MAPEAMENTO_IMAGEM_BARREIRA["di_abstracao"]).toBeDefined();
            expect(MAPEAMENTO_IMAGEM_BARREIRA["di_planejamento"]).toBeDefined();
        });

        it("tem mapeamentos para TA", () => {
            expect(MAPEAMENTO_IMAGEM_BARREIRA["ta_dislexia_leitura"]).toBeDefined();
            expect(MAPEAMENTO_IMAGEM_BARREIRA["ta_tdah_atencao"]).toBeDefined();
            expect(MAPEAMENTO_IMAGEM_BARREIRA["ta_discalculia"]).toBeDefined();
        });

        it("cada mapeamento tem campos obrigatórios", () => {
            for (const [key, cfg] of Object.entries(MAPEAMENTO_IMAGEM_BARREIRA)) {
                expect(cfg.tipo, `${key}: tipo`).toBeTruthy();
                expect(cfg.descricaoPrompt, `${key}: descricaoPrompt`).toBeTruthy();
                expect(cfg.exemplo, `${key}: exemplo`).toBeTruthy();
                expect(cfg.prioridadeVisual, `${key}: prioridadeVisual`).toBeTruthy();
            }
        });
    });

    describe("determinarTipoImagem", () => {
        // ── TEA ──────────────────────────────────────────────

        it("TEA: retorna obrigatório sempre", () => {
            const decisao = determinarTipoImagem({ perfilNEE: "TEA" });
            expect(decisao.necessario).toBe(true);
            expect(decisao.prioridadeVisual).toBe("obrigatoria");
        });

        it("TEA + barreira abstração: retorna concreto", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "TEA",
                barreirasAtivas: { "Abstração e Generalização": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("concreto");
            expect(decisao.configKey).toBe("tea_abstracao");
        });

        it("TEA + barreira linguagem receptiva: retorna simbolico", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "TEA",
                barreirasAtivas: { "Linguagem Receptiva": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("simbolico");
            expect(decisao.configKey).toBe("tea_comunicacao");
        });

        it("TEA + barreira organização: retorna organizacao", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "TEA",
                barreirasAtivas: { "Planejamento e Organização": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("organizacao");
        });

        it("TEA sem barreiras específicas: retorna sequencia (default)", () => {
            const decisao = determinarTipoImagem({ perfilNEE: "TEA", barreirasAtivas: {} });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("sequencia");
            expect(decisao.configKey).toBe("tea_inferencia");
        });

        // ── DI ───────────────────────────────────────────────

        it("DI: retorna recomendado", () => {
            const decisao = determinarTipoImagem({ perfilNEE: "DI" });
            expect(decisao.necessario).toBe(true);
            expect(decisao.prioridadeVisual).toBe("recomendada");
        });

        it("DI + memória de trabalho: retorna organizacao obrigatória", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "DI",
                barreirasAtivas: { "Memória de Trabalho": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("organizacao");
            expect(decisao.prioridadeVisual).toBe("obrigatoria");
        });

        it("DI + barreira abstração: retorna concreto", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "DI",
                barreirasAtivas: { "Abstração e Generalização": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("concreto");
        });

        // ── Transtornos de Aprendizagem ─────────────────────

        it("TA + dislexia (decodificação leitora): retorna simbolico", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "TRANSTORNO_APRENDIZAGEM",
                barreirasAtivas: { "Decodificação Leitora": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("simbolico");
        });

        it("TA + TDAH (atenção): retorna comparacao", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "TRANSTORNO_APRENDIZAGEM",
                barreirasAtivas: { "Atenção Sustentada/Focada": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("comparacao");
        });

        it("TA + discalculia: retorna concreto", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "TRANSTORNO_APRENDIZAGEM",
                barreirasAtivas: { "Raciocínio Lógico-Matemático": true },
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("concreto");
        });

        // ── Habilidades que exigem imagem ────────────────────

        it("habilidade com 'gráfico': retorna grafico obrigatório", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "SEM_NEE",
                habilidadeDescricao: "Interpretar gráfico de barras",
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("grafico");
            expect(decisao.prioridadeVisual).toBe("obrigatoria");
        });

        it("habilidade com 'mapa': retorna mapa obrigatório", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "SEM_NEE",
                habilidadeDescricao: "Identificar regiões no mapa do Brasil",
            });
            expect(decisao.necessario).toBe(true);
            expect(decisao.tipo).toBe("mapa");
        });

        // ── Altas Habilidades ────────────────────────────────

        it("Altas Habilidades: imagem opcional", () => {
            const decisao = determinarTipoImagem({ perfilNEE: "ALTAS_HABILIDADES" });
            expect(decisao.necessario).toBe(false);
            expect(decisao.prioridadeVisual).toBe("opcional");
        });

        // ── Sem NEE ──────────────────────────────────────────

        it("SEM_NEE sem habilidade visual: imagem desnecessária", () => {
            const decisao = determinarTipoImagem({
                perfilNEE: "SEM_NEE",
                habilidadeDescricao: "Resolver problemas com números naturais",
            });
            expect(decisao.necessario).toBe(false);
            expect(decisao.prioridadeVisual).toBe("desnecessaria");
        });

        // ── Case insensitive ────────────────────────────────

        it("aceita perfil em minúsculo", () => {
            const decisao = determinarTipoImagem({ perfilNEE: "tea" });
            expect(decisao.necessario).toBe(true);
        });
    });

    describe("gerarInstrucaoImagemParaPrompt", () => {
        it("gera instrução quando imagem é necessária", () => {
            const decisao = determinarTipoImagem({ perfilNEE: "TEA" });
            const instrucao = gerarInstrucaoImagemParaPrompt(decisao);

            expect(instrucao).toContain("SUPORTE VISUAL OBRIGATÓRIO");
            expect(instrucao).toContain("sequencia");
            expect(instrucao).toContain("necessario: true");
            expect(instrucao).toContain("SUBSTITUIR");
        });

        it("gera instrução curta quando imagem não é necessária", () => {
            const decisao = determinarTipoImagem({ perfilNEE: "ALTAS_HABILIDADES" });
            const instrucao = gerarInstrucaoImagemParaPrompt(decisao);

            expect(instrucao).toContain("necessario = false");
            expect(instrucao).not.toContain("OBRIGATÓRIO");
        });
    });
});
