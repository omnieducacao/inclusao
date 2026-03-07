/**
 * Testes Unitários — lib/omnisfera-prompts.ts
 *
 * Testa funções puras do motor de prompts:
 * - distribuirGabaritos: distribuição equilibrada A-D
 * - mapDiagnosticoToPerfilNEE: mapeamento diagnóstico → perfil
 * - nivelCognitivoAutomatico: nível Omnisfera → SAEB
 * - buildContextoAluno: construção de contexto textual
 * - REGRAS_NEE: constantes de regras por perfil
 */

import { describe, it, expect } from "vitest";
import {
    distribuirGabaritos,
    mapDiagnosticoToPerfilNEE,
    nivelCognitivoAutomatico,
    buildContextoAluno,
    REGRAS_NEE,
} from "@/lib/omnisfera-prompts";

describe("distribuirGabaritos", () => {
    it("retorna array com tamanho correto", () => {
        expect(distribuirGabaritos(8)).toHaveLength(8);
        expect(distribuirGabaritos(1)).toHaveLength(1);
        expect(distribuirGabaritos(0)).toHaveLength(0);
    });

    it("contém apenas letras A-D", () => {
        const result = distribuirGabaritos(20);
        for (const r of result) {
            expect(["A", "B", "C", "D"]).toContain(r);
        }
    });

    it("distribui aproximadamente 25% para cada letra (em 100 itens)", () => {
        const result = distribuirGabaritos(100);
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        for (const r of result) {
            counts[r as keyof typeof counts]++;
        }
        // Com 100 itens, cada deve ter exatamente 25
        expect(counts.A).toBe(25);
        expect(counts.B).toBe(25);
        expect(counts.C).toBe(25);
        expect(counts.D).toBe(25);
    });

    it("embaralha (não retorna em ordem sequencial)", () => {
        // Run multiple times — at least one should be shuffled
        let foundShuffled = false;
        for (let i = 0; i < 10; i++) {
            const result = distribuirGabaritos(8);
            const sequential = ["A", "B", "C", "D", "A", "B", "C", "D"];
            if (JSON.stringify(result) !== JSON.stringify(sequential)) {
                foundShuffled = true;
                break;
            }
        }
        expect(foundShuffled).toBe(true);
    });
});

describe("mapDiagnosticoToPerfilNEE", () => {
    it("mapeia TEA corretamente", () => {
        expect(mapDiagnosticoToPerfilNEE("TEA")).toBe("TEA");
        expect(mapDiagnosticoToPerfilNEE("Autismo")).toBe("TEA");
        expect(mapDiagnosticoToPerfilNEE("Transtorno do Espectro Autista - TEA")).toBe("TEA");
    });

    it("mapeia DI corretamente", () => {
        expect(mapDiagnosticoToPerfilNEE("Deficiência Intelectual")).toBe("DI");
        expect(mapDiagnosticoToPerfilNEE("DI")).toBe("DI");
    });

    it("mapeia Altas Habilidades", () => {
        expect(mapDiagnosticoToPerfilNEE("Altas Habilidades")).toBe("ALTAS_HABILIDADES");
        expect(mapDiagnosticoToPerfilNEE("Superdotação")).toBe("ALTAS_HABILIDADES");
    });

    it("mapeia Transtornos de Aprendizagem", () => {
        expect(mapDiagnosticoToPerfilNEE("Dislexia")).toBe("TRANSTORNO_APRENDIZAGEM");
        expect(mapDiagnosticoToPerfilNEE("TDAH")).toBe("TRANSTORNO_APRENDIZAGEM");
        expect(mapDiagnosticoToPerfilNEE("Discalculia")).toBe("TRANSTORNO_APRENDIZAGEM");
    });

    it("retorna SEM_NEE para diagnósticos não reconhecidos", () => {
        expect(mapDiagnosticoToPerfilNEE("")).toBe("SEM_NEE");
        expect(mapDiagnosticoToPerfilNEE("Saudável")).toBe("SEM_NEE");
    });
});

describe("nivelCognitivoAutomatico", () => {
    it("nível 1-2 → SAEB I", () => {
        expect(nivelCognitivoAutomatico(1)).toBe("I");
        expect(nivelCognitivoAutomatico(2)).toBe("I");
    });

    it("nível 3 → SAEB II", () => {
        expect(nivelCognitivoAutomatico(3)).toBe("II");
    });

    it("nível 4+ → SAEB III", () => {
        expect(nivelCognitivoAutomatico(4)).toBe("III");
        expect(nivelCognitivoAutomatico(5)).toBe("III");
    });
});

describe("buildContextoAluno", () => {
    it("inclui nome, série e diagnóstico", () => {
        const ctx = buildContextoAluno({
            nome: "João",
            serie: "5º Ano",
            diagnostico: "TEA",
        });
        expect(ctx).toContain("João");
        expect(ctx).toContain("5º Ano");
        expect(ctx).toContain("TEA");
    });

    it("inclui perfil NEE mapeado", () => {
        const ctx = buildContextoAluno({
            nome: "Maria",
            serie: "3º Ano",
            diagnostico: "Autismo",
        });
        expect(ctx).toContain("TEA");
    });

    it("inclui observação do professor quando fornecida", () => {
        const ctx = buildContextoAluno({
            nome: "Pedro",
            serie: "1º Ano",
            diagnostico: "",
            observacao_professor: "Dificuldade em leitura",
        });
        expect(ctx).toContain("Dificuldade em leitura");
    });

    it("inclui nível Omnisfera estimado", () => {
        const ctx = buildContextoAluno({
            nome: "Ana",
            serie: "4º Ano",
            diagnostico: "TDAH",
            nivel_omnisfera_estimado: 3,
        });
        expect(ctx).toContain("3");
    });
});

describe("REGRAS_NEE", () => {
    it("contém regras para TEA, DI, e SEM_NEE", () => {
        expect(REGRAS_NEE.TEA).toBeDefined();
        expect(REGRAS_NEE.DI).toBeDefined();
        expect(REGRAS_NEE.SEM_NEE).toBeDefined();
    });

    it("TEA menciona linguagem literal", () => {
        expect(REGRAS_NEE.TEA.toLowerCase()).toContain("literal");
    });

    it("DI menciona fragmentar/concreto", () => {
        const diLow = REGRAS_NEE.DI.toLowerCase();
        expect(diLow.includes("fragment") || diLow.includes("concret")).toBe(true);
    });
});
