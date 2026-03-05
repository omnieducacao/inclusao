/**
 * Testes Unitários - Omnisfera Prompts Engine
 *
 * Verifica distribuição de gabaritos e geração de templates
 */

import { describe, it, expect } from "vitest";
import {
    distribuirGabaritos,
    templateQuestoesDiagnosticas,
} from "@/lib/omnisfera-prompts";

describe("omnisfera-prompts", () => {
    describe("distribuirGabaritos", () => {
        it("distribui gabaritos para 4 questões com todas as letras", () => {
            const gabs = distribuirGabaritos(4);
            expect(gabs).toHaveLength(4);
            expect(gabs.sort()).toEqual(["A", "B", "C", "D"]);
        });

        it("distribui gabaritos para 8 questões com ~2 de cada", () => {
            const gabs = distribuirGabaritos(8);
            expect(gabs).toHaveLength(8);
            const counts = { A: 0, B: 0, C: 0, D: 0 };
            for (const g of gabs) counts[g as keyof typeof counts]++;
            expect(counts.A).toBe(2);
            expect(counts.B).toBe(2);
            expect(counts.C).toBe(2);
            expect(counts.D).toBe(2);
        });

        it("distribui gabaritos para 12 questões com 3 de cada", () => {
            const gabs = distribuirGabaritos(12);
            expect(gabs).toHaveLength(12);
            const counts = { A: 0, B: 0, C: 0, D: 0 };
            for (const g of gabs) counts[g as keyof typeof counts]++;
            expect(counts.A).toBe(3);
            expect(counts.B).toBe(3);
            expect(counts.C).toBe(3);
            expect(counts.D).toBe(3);
        });

        it("distribui gabaritos para 5 questões (não múltiplo de 4)", () => {
            const gabs = distribuirGabaritos(5);
            expect(gabs).toHaveLength(5);
            // All should be valid letters
            for (const g of gabs) expect(["A", "B", "C", "D"]).toContain(g);
            // At least one of each from A-D (since 5 > 4)
            const counts = { A: 0, B: 0, C: 0, D: 0 };
            for (const g of gabs) counts[g as keyof typeof counts]++;
            expect(counts.A).toBeGreaterThanOrEqual(1);
            expect(counts.B).toBeGreaterThanOrEqual(1);
            expect(counts.C).toBeGreaterThanOrEqual(1);
            expect(counts.D).toBeGreaterThanOrEqual(1);
        });

        it("distribui gabaritos para 1 questão", () => {
            const gabs = distribuirGabaritos(1);
            expect(gabs).toHaveLength(1);
            expect(["A", "B", "C", "D"]).toContain(gabs[0]);
        });

        it("retorna array vazio para 0 questões", () => {
            const gabs = distribuirGabaritos(0);
            expect(gabs).toHaveLength(0);
        });

        it("embaralha (não é sempre ABCD)", () => {
            // Run 10 times - statistically extremely unlikely all produce same order
            const orders = new Set<string>();
            for (let i = 0; i < 10; i++) {
                orders.add(distribuirGabaritos(4).join(""));
            }
            // At least 2 different orderings in 10 tries (extremely high probability)
            expect(orders.size).toBeGreaterThanOrEqual(2);
        });
    });

    describe("templateQuestoesDiagnosticas", () => {
        it("gera template Objetiva com gabaritos definidos", () => {
            const result = templateQuestoesDiagnosticas({
                habilidades: [{
                    codigo: "EF05MA01",
                    disciplina: "Matemática",
                    unidade_tematica: "Números",
                    objeto_conhecimento: "Sistema de numeração decimal",
                    habilidade: "Ler, escrever e ordenar números naturais",
                }],
                quantidade: 3,
                tipo_questao: "Objetiva",
                nivel_omnisfera_estimado: 2,
                gabaritos_definidos: ["A", "C", "D"],
            });
            expect(result).toContain("gabarito DEVE ser letra A");
            expect(result).toContain("gabarito DEVE ser letra C");
            expect(result).toContain("gabarito DEVE ser letra D");
            expect(result).toContain("EF05MA01");
            expect(result).toContain("suporte_visual");
            expect(result).toContain("comando");
            expect(result).not.toContain("B ou C");
        });

        it("gera template Discursiva com suporte_visual", () => {
            const result = templateQuestoesDiagnosticas({
                habilidades: [{
                    codigo: "EF05LP01",
                    disciplina: "Língua Portuguesa",
                    unidade_tematica: "Leitura",
                    objeto_conhecimento: "Interpretação de texto",
                    habilidade: "Interpretar textos informativos",
                }],
                quantidade: 2,
                tipo_questao: "Discursiva",
                nivel_omnisfera_estimado: 3,
            });
            expect(result).toContain("suporte_visual");
            expect(result).toContain("necessario");
            expect(result).toContain("descricao_para_geracao");
            expect(result).toContain("DISCURSIVAS");
            expect(result).toContain("comando");
        });

        it("inclui contexto do plano de ensino quando fornecido", () => {
            const result = templateQuestoesDiagnosticas({
                habilidades: [{
                    codigo: "EF05MA01",
                    disciplina: "Matemática",
                    unidade_tematica: "Números",
                    objeto_conhecimento: "Sistema de numeração decimal",
                    habilidade: "Ler números naturais",
                }],
                quantidade: 1,
                tipo_questao: "Objetiva",
                plano_ensino_contexto: "Conteúdo do plano para contextualizar",
            });
            expect(result).toContain("PLANO DE ENSINO VINCULADO");
            expect(result).toContain("Conteúdo do plano");
        });

        it("estrutura CAEd mencionada no template", () => {
            const result = templateQuestoesDiagnosticas({
                habilidades: [{
                    codigo: "EF05MA01",
                    disciplina: "Matemática",
                    unidade_tematica: "Números",
                    objeto_conhecimento: "Sistema",
                    habilidade: "Habilidade teste",
                }],
                quantidade: 1,
                tipo_questao: "Objetiva",
            });
            expect(result).toContain("Guia CAEd");
            expect(result).toContain("ENUNCIADO");
            expect(result).toContain("SUPORTE");
            expect(result).toContain("COMANDO");
            expect(result).toContain("1 item = 1 habilidade");
        });
    });
});
