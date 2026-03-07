/**
 * Testes Unitários — lib/pei.ts
 *
 * Testa funções puras e constantes do módulo PEI:
 * - detectarNivelEnsino: Detecção do nível de ensino
 * - Constantes: SERIES, LISTAS_BARREIRAS, ESTRATEGIAS
 */

import { describe, it, expect } from "vitest";
import {
    detectarNivelEnsino,
    SERIES,
    SERIES_EF_EM,
    SERIES_EI,
    LISTAS_BARREIRAS,
    LISTA_POTENCIAS,
    ESTRATEGIAS_ACESSO,
    ESTRATEGIAS_ENSINO,
    ESTRATEGIAS_AVALIACAO,
    NIVEIS_SUPORTE,
    STATUS_META,
} from "@/lib/pei";

describe("detectarNivelEnsino", () => {
    it("retorna '' para série vazia", () => {
        expect(detectarNivelEnsino("")).toBe("");
    });

    it("detecta Educação Infantil", () => {
        expect(detectarNivelEnsino("Educação Infantil (3-5 anos)")).toBe("EI");
        expect(detectarNivelEnsino("Educação Infantil (0-2 anos)")).toBe("EI");
        expect(detectarNivelEnsino("Educação Infantil (4 anos)")).toBe("EI");
    });

    it("detecta EFI (Anos Iniciais)", () => {
        expect(detectarNivelEnsino("1º Ano (EFAI)")).toBe("EFI");
        expect(detectarNivelEnsino("3º Ano (EFAI)")).toBe("EFI");
        expect(detectarNivelEnsino("5º Ano (EFAI)")).toBe("EFI");
    });

    it("detecta EFII (Anos Finais)", () => {
        expect(detectarNivelEnsino("6º Ano (EFAF)")).toBe("EFII");
        expect(detectarNivelEnsino("9º Ano (EFAF)")).toBe("EFII");
    });

    it("detecta Ensino Médio", () => {
        expect(detectarNivelEnsino("1ª Série (EM)")).toBe("EM");
        expect(detectarNivelEnsino("2ª Série (EM)")).toBe("EM");
        expect(detectarNivelEnsino("EJA (Educação de Jovens e Adultos)")).toBe("EM");
    });

    it("fallback por número — 1-5 → EFI", () => {
        expect(detectarNivelEnsino("3º ano")).toBe("EFI");
        expect(detectarNivelEnsino("5 ano")).toBe("EFI");
    });

    it("fallback por número — 6+ → EFII", () => {
        expect(detectarNivelEnsino("6º ano")).toBe("EFII");
        expect(detectarNivelEnsino("8 ano")).toBe("EFII");
    });

    it("retorna EFI para texto sem número", () => {
        expect(detectarNivelEnsino("outro")).toBe("EFI");
    });
});

describe("Constantes PEI", () => {
    it("SERIES contém EI + EF/EM", () => {
        expect(SERIES.length).toBe(SERIES_EI.length + SERIES_EF_EM.length);
        expect(SERIES.length).toBeGreaterThan(15);
    });

    it("LISTAS_BARREIRAS tem 5 domínios", () => {
        const keys = Object.keys(LISTAS_BARREIRAS);
        expect(keys).toHaveLength(5);
        expect(keys).toContain("Funções Cognitivas");
        expect(keys).toContain("Comunicação e Linguagem");
        expect(keys).toContain("Socioemocional");
        expect(keys).toContain("Sensorial e Motor");
        expect(keys).toContain("Acadêmico");
    });

    it("cada domínio tem pelo menos 4 barreiras", () => {
        for (const [, barreiras] of Object.entries(LISTAS_BARREIRAS)) {
            expect(barreiras.length).toBeGreaterThanOrEqual(4);
        }
    });

    it("LISTA_POTENCIAS tem pelo menos 10 itens", () => {
        expect(LISTA_POTENCIAS.length).toBeGreaterThanOrEqual(10);
    });

    it("ESTRATÉGIAS todas definidas", () => {
        expect(ESTRATEGIAS_ACESSO.length).toBeGreaterThan(0);
        expect(ESTRATEGIAS_ENSINO.length).toBeGreaterThan(0);
        expect(ESTRATEGIAS_AVALIACAO.length).toBeGreaterThan(0);
    });

    it("NIVEIS_SUPORTE tem 4 níveis", () => {
        expect(NIVEIS_SUPORTE).toHaveLength(4);
        expect(NIVEIS_SUPORTE).toContain("Autônomo");
        expect(NIVEIS_SUPORTE).toContain("Muito Substancial");
    });

    it("STATUS_META tem 5 opções", () => {
        expect(STATUS_META).toHaveLength(5);
        expect(STATUS_META).toContain("Não Iniciado");
        expect(STATUS_META).toContain("Superado");
    });
});
