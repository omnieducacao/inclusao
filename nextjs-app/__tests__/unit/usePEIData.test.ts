/**
 * Testes Unitários — usePEIData helpers e lógica pura
 *
 * Testa as funções exportadas sem depender de hooks React:
 * - calcularProgresso
 * - getTabStatus
 * - TABS constante
 */

import { describe, it, expect } from "vitest";
import { calcularProgresso, getTabStatus, TABS } from "@/hooks/usePEIData";
import type { PEIData } from "@/lib/pei";

const EMPTY: PEIData = {} as PEIData;

function withFields(fields: Partial<PEIData>): PEIData {
    return { ...EMPTY, ...fields } as PEIData;
}

describe("calcularProgresso", () => {
    it("retorna 0 para PEI vazio", () => {
        expect(calcularProgresso(EMPTY)).toBe(0);
    });

    it("retorna ~13% com apenas estudante preenchido", () => {
        const d = withFields({ nome: "João", serie: "3º ano", turma: "A" });
        const p = calcularProgresso(d);
        expect(p).toBeGreaterThanOrEqual(12);
        expect(p).toBeLessThanOrEqual(13);
    });

    it("retorna 100% com todas as abas preenchidas", () => {
        const d = withFields({
            nome: "Maria",
            serie: "3º ano",
            turma: "B",
            checklist_evidencias: { item1: true },
            orientacoes_especialistas: "texto",
            rede_apoio: ["equipe"] as unknown as PEIData["rede_apoio"],
            hiperfoco: "dinossauros",
            potencias: ["criatividade"] as unknown as PEIData["potencias"],
            estrategias_acesso: ["rampa"] as unknown as PEIData["estrategias_acesso"],
            monitoramento_data: "2026-03-01",
            status_meta: "em_andamento",
            ia_sugestao: "Relatório IA gerado com sucesso...",
            status_validacao_pei: "aprovado" as PEIData["status_validacao_pei"],
        });
        expect(calcularProgresso(d)).toBe(100);
    });
});

describe("getTabStatus", () => {
    it("inicio: empty quando sem nome", () => {
        expect(getTabStatus(EMPTY, "inicio")).toBe("empty");
    });

    it("inicio: complete quando tem nome", () => {
        const d = withFields({ nome: "Ana" });
        expect(getTabStatus(d, "inicio")).toBe("complete");
    });

    it("estudante: in-progress com apenas nome", () => {
        const d = withFields({ nome: "Ana" });
        expect(getTabStatus(d, "estudante")).toBe("in-progress");
    });

    it("estudante: complete com nome + serie + turma", () => {
        const d = withFields({ nome: "Ana", serie: "1º", turma: "A" });
        expect(getTabStatus(d, "estudante")).toBe("complete");
    });

    it("evidencias: empty sem evidências", () => {
        expect(getTabStatus(EMPTY, "evidencias")).toBe("empty");
    });

    it("evidencias: complete com checklist preenchida", () => {
        const d = withFields({ checklist_evidencias: { item: true } });
        expect(getTabStatus(d, "evidencias")).toBe("complete");
    });

    it("consultoria: empty sem validação", () => {
        expect(getTabStatus(EMPTY, "consultoria")).toBe("empty");
    });

    it("consultoria: complete quando aprovado", () => {
        const d = withFields({ status_validacao_pei: "aprovado" as PEIData["status_validacao_pei"] });
        expect(getTabStatus(d, "consultoria")).toBe("complete");
    });

    it("dashboard: empty quando progresso 0", () => {
        expect(getTabStatus(EMPTY, "dashboard")).toBe("empty");
    });

    it("dashboard: complete quando progresso >= 50", () => {
        const d = withFields({
            nome: "Ana", serie: "1º", turma: "A",
            checklist_evidencias: { a: true },
            orientacoes_especialistas: "ok",
            rede_apoio: ["x"] as unknown as PEIData["rede_apoio"],
            hiperfoco: "y",
            estrategias_acesso: ["z"] as unknown as PEIData["estrategias_acesso"],
        });
        expect(getTabStatus(d, "dashboard")).toBe("complete");
    });
});

describe("TABS", () => {
    it("tem 12 abas", () => {
        expect(TABS).toHaveLength(12);
    });

    it("primeira aba é inicio", () => {
        expect(TABS[0].id).toBe("inicio");
    });

    it("última aba é dashboard", () => {
        expect(TABS[TABS.length - 1].id).toBe("dashboard");
    });

    it("cada aba tem id e label", () => {
        for (const tab of TABS) {
            expect(tab.id).toBeTruthy();
            expect(tab.label).toBeTruthy();
        }
    });
});
