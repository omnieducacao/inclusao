/**
 * Testes Unitários — Utilitários de Geração de Questões
 *
 * Testa limparEnunciado e buildResultadoFormatado
 * (funções puras exportadas do hook useGeracaoQuestoes)
 */

import { describe, it, expect } from "vitest";
import {
    limparEnunciado,
    buildResultadoFormatado,
} from "@/app/(dashboard)/avaliacao-diagnostica/hooks/useGeracaoQuestoes";

describe("useGeracaoQuestoes utilities", () => {
    describe("limparEnunciado", () => {
        it("retorna string limpa sem descrição de imagem", () => {
            const result = limparEnunciado("Leia o texto abaixo.", null);
            expect(result).toBe("Leia o texto abaixo.");
        });

        it("remove descrição de imagem embutida pela IA", () => {
            const enunciado = "Leia o texto abaixo. Ilustração mostrando um gráfico de barras com dados de população.";
            const result = limparEnunciado(enunciado);
            expect(result).not.toContain("Ilustração mostrando");
            expect(result).toContain("Leia o texto abaixo.");
        });

        it("remove [Imagem: ...] tags da IA", () => {
            const enunciado = "Observe a situação. [Imagem mostrando um cenário de sala de aula]";
            const result = limparEnunciado(enunciado);
            expect(result).not.toContain("[Imagem");
            expect(result).toContain("Observe a situação.");
        });

        it("remove texto exato de descricao_para_geracao", () => {
            const desc = "Gráfico de barras mostrando produção de soja por estado";
            const enunciado = `Observe o gráfico abaixo.\n\n${desc}\n\nQual estado produz mais?`;
            const result = limparEnunciado(enunciado, desc);
            expect(result).not.toContain(desc);
            expect(result).toContain("Observe o gráfico abaixo.");
            expect(result).toContain("Qual estado produz mais?");
        });

        it("colapsa quebras de linha excessivas", () => {
            const enunciado = "Texto um.\n\n\n\n\nTexto dois.";
            const result = limparEnunciado(enunciado);
            expect(result).not.toContain("\n\n\n");
        });

        it("lida com string vazia", () => {
            expect(limparEnunciado("")).toBe("");
            expect(limparEnunciado("", null)).toBe("");
        });

        it("remove Fotografia e Diagrama patterns", () => {
            expect(limparEnunciado("A Fotografia mostrando célula animal.")).toBe("A");
            expect(limparEnunciado("Um Diagrama representando o ciclo da água.")).toBe("Um");
        });

        it("remove Gráfico pattern", () => {
            const result = limparEnunciado("Observe. Gráfico de barras com dados de vendas.");
            expect(result).not.toContain("Gráfico de barras");
        });
    });

    describe("buildResultadoFormatado", () => {
        it("formata questão básica corretamente", () => {
            const questoes = [{
                habilidade_bncc_ref: "EF05MA01",
                enunciado: "Leia o problema abaixo.",
                comando: "Quanto é 2+2?",
                alternativas: { A: "3", B: "4", C: "5", D: "6" },
                gabarito: "B",
                _numero: 1,
                _gabarito_esperado: "B",
            }];
            const result = buildResultadoFormatado(questoes, {});

            expect(result).toContain("### Questão 1 — EF05MA01");
            expect(result).toContain("Leia o problema abaixo.");
            expect(result).toContain("**Quanto é 2+2?**");
            expect(result).toContain("**A)** 3");
            expect(result).toContain("**B)** 4");
            expect(result).toContain("> **Gabarito:** B");
        });

        it("inclui imagem inline quando disponível", () => {
            const questoes = [{
                enunciado: "Observe.",
                alternativas: { A: "1", B: "2", C: "3", D: "4" },
                gabarito: "A",
                _numero: 1,
            }];
            const imagens = { 1: "https://example.com/img.png" };
            const result = buildResultadoFormatado(questoes, imagens);

            expect(result).toContain("![Imagem da questão 1](https://example.com/img.png)");
        });

        it("mostra erro quando questão falhou", () => {
            const questoes = [{ _numero: 1, _erro: "Timeout na IA" }];
            const result = buildResultadoFormatado(questoes, {});

            expect(result).toContain("⚠️ Erro ao gerar: Timeout na IA");
        });

        it("formata múltiplas questões", () => {
            const questoes = [
                { enunciado: "Q1", alternativas: { A: "a", B: "b", C: "c", D: "d" }, gabarito: "A", _numero: 1 },
                { enunciado: "Q2", alternativas: { A: "e", B: "f", C: "g", D: "h" }, gabarito: "C", _numero: 2 },
            ];
            const result = buildResultadoFormatado(questoes, {});

            expect(result).toContain("### Questão 1");
            expect(result).toContain("### Questão 2");
            expect(result).toContain("> **Gabarito:** A");
            expect(result).toContain("> **Gabarito:** C");
        });

        it("inclui justificativa pedagógica quando presente", () => {
            const questoes = [{
                enunciado: "Q1",
                alternativas: { A: "a", B: "b", C: "c", D: "d" },
                gabarito: "B",
                justificativa_pedagogica: "Avalia compreensão textual",
                _numero: 1,
            }];
            const result = buildResultadoFormatado(questoes, {});

            expect(result).toContain("Avalia compreensão textual");
        });
    });
});
