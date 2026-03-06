/**
 * Testes Unitários — Prompt Pedagógico Atualizado
 *
 * Verifica que o system prompt contém as regras de imagem
 * por perfil NEE conforme análise Kimi K2.
 */

import { describe, it, expect } from "vitest";
import {
    SYSTEM_PROMPT_OMNISFERA,
    REGRAS_NEE,
    mapDiagnosticoToPerfilNEE,
    buildContextoAluno,
} from "@/lib/omnisfera-prompts";

describe("omnisfera-prompts NEE image rules", () => {
    describe("SYSTEM_PROMPT_OMNISFERA", () => {
        it("contém regras de imagem por perfil NEE", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("REGRAS DE IMAGEM POR PERFIL NEE");
        });

        it("TEA: imagem obrigatória", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("TEA: suporte_visual.necessario = true OBRIGATÓRIO");
        });

        it("DI: imagem recomendada", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("DI: suporte_visual.necessario = true RECOMENDADO");
        });

        it("Dislexia: tipo simbolico", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("Dislexia");
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("simbolico");
        });

        it("TDAH: tipo comparacao com destaque", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("TDAH");
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("comparacao");
        });

        it("Discalculia: tipo concreto", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("Discalculia");
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("contáveis");
        });

        it("enfatiza que imagem é CONTEÚDO não decoração", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("imagem é CONTEÚDO da questão, NÃO decoração");
        });

        it("menciona substituição de texto para NEE", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("SUBSTITUIR informação textual");
        });

        it("schema de suporte_visual inclui justificativa_pedagogica", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("justificativa_pedagogica");
        });

        it("lista tipos expandidos de imagem", () => {
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("sequencia");
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("comparacao");
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("organizacao");
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("concreto");
            expect(SYSTEM_PROMPT_OMNISFERA).toContain("simbolico");
        });
    });

    describe("REGRAS_NEE", () => {
        it("define regras para TEA", () => {
            expect(REGRAS_NEE.TEA).toContain("linguagem literal");
            expect(REGRAS_NEE.TEA).toContain("suporte_visual.necessario DEVE ser true");
        });

        it("define regras para DI", () => {
            expect(REGRAS_NEE.DI).toContain("ano_referencia_pei");
            expect(REGRAS_NEE.DI).toContain("material concreto");
        });

        it("define regras para Altas Habilidades", () => {
            expect(REGRAS_NEE.ALTAS_HABILIDADES).toContain("III");
            expect(REGRAS_NEE.ALTAS_HABILIDADES).toContain("interdisciplinares");
        });

        it("define regras para Transtornos de Aprendizagem", () => {
            expect(REGRAS_NEE.TRANSTORNO_APRENDIZAGEM).toContain("habilidade-alvo");
            expect(REGRAS_NEE.TRANSTORNO_APRENDIZAGEM).toContain("TDAH");
        });

        it("tem fallback SEM_NEE", () => {
            expect(REGRAS_NEE.SEM_NEE).toBeDefined();
        });
    });

    describe("mapDiagnosticoToPerfilNEE", () => {
        it("mapeia TEA corretamente", () => {
            expect(mapDiagnosticoToPerfilNEE("TEA")).toBe("TEA");
            expect(mapDiagnosticoToPerfilNEE("Autismo")).toBe("TEA");
            expect(mapDiagnosticoToPerfilNEE("tea")).toBe("TEA");
        });

        it("mapeia DI corretamente", () => {
            expect(mapDiagnosticoToPerfilNEE("Deficiência Intelectual")).toBe("DI");
        });

        it("mapeia Altas Habilidades corretamente", () => {
            expect(mapDiagnosticoToPerfilNEE("Altas Habilidades")).toBe("ALTAS_HABILIDADES");
            expect(mapDiagnosticoToPerfilNEE("Superdotação")).toBe("ALTAS_HABILIDADES");
        });

        it("mapeia Transtornos de Aprendizagem corretamente", () => {
            expect(mapDiagnosticoToPerfilNEE("Dislexia")).toBe("TRANSTORNO_APRENDIZAGEM");
            expect(mapDiagnosticoToPerfilNEE("TDAH")).toBe("TRANSTORNO_APRENDIZAGEM");
            expect(mapDiagnosticoToPerfilNEE("Discalculia")).toBe("TRANSTORNO_APRENDIZAGEM");
        });

        it("retorna SEM_NEE para diagnóstico desconhecido", () => {
            expect(mapDiagnosticoToPerfilNEE("")).toBe("SEM_NEE");
            expect(mapDiagnosticoToPerfilNEE("Outro")).toBe("SEM_NEE");
        });
    });

    describe("buildContextoAluno", () => {
        it("inclui perfil NEE e regras específicas", () => {
            const ctx = buildContextoAluno({
                nome: "Maria",
                serie: "5º ano",
                diagnostico: "TEA",
            });
            expect(ctx).toContain("Perfil NEE: TEA");
            expect(ctx).toContain("REGRAS ADICIONAIS — TEA");
        });

        it("inclui observação do professor se fornecida", () => {
            const ctx = buildContextoAluno({
                nome: "João",
                serie: "3º ano",
                diagnostico: "TDAH",
                observacao_professor: "Precisa de mais tempo",
            });
            expect(ctx).toContain("Precisa de mais tempo");
        });

        it("funciona sem diagnóstico", () => {
            const ctx = buildContextoAluno({
                nome: "Pedro",
                serie: "4º ano",
                diagnostico: "",
            });
            expect(ctx).toContain("SEM_NEE");
        });
    });
});
