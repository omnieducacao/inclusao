/**
 * Testes Unitários — PEI Helpers (lib/pei-helpers.ts)
 *
 * Cobertura:
 * - Virtual ID detection
 * - Virtual ID decomposition (student ID + discipline)
 * - Virtual ID creation
 * - PEI data validation
 * - Safe string extraction (including encrypted detection)
 */

import { describe, it, expect } from "vitest";
import {
    isVirtualId,
    getRealStudentId,
    getVirtualDiscipline,
    createVirtualId,
    hasMeaningfulPeiData,
    safeString,
} from "@/lib/pei-helpers";

describe("PEI Helpers — lib/pei-helpers.ts", () => {

    describe("isVirtualId", () => {
        it("retorna true para IDs virtuais", () => {
            expect(isVirtualId("virtual_abc123_portugues")).toBe(true);
            expect(isVirtualId("virtual_xyz_matematica")).toBe(true);
        });

        it("retorna false para IDs normais", () => {
            expect(isVirtualId("abc123")).toBe(false);
            expect(isVirtualId("550e8400-e29b-41d4-a716-446655440000")).toBe(false);
        });

        it("retorna false para null/undefined/empty", () => {
            expect(isVirtualId(null)).toBe(false);
            expect(isVirtualId(undefined)).toBe(false);
            expect(isVirtualId("")).toBe(false);
        });
    });

    describe("getRealStudentId", () => {
        it("extrai ID real de virtual ID", () => {
            expect(getRealStudentId("virtual_abc123_portugues")).toBe("abc123");
            expect(getRealStudentId("virtual_xyz789_matematica")).toBe("xyz789");
        });

        it("retorna o próprio ID se não é virtual", () => {
            expect(getRealStudentId("abc123")).toBe("abc123");
            expect(getRealStudentId("550e8400")).toBe("550e8400");
        });
    });

    describe("getVirtualDiscipline", () => {
        it("extrai disciplina de virtual ID", () => {
            expect(getVirtualDiscipline("virtual_abc_portugues")).toBe("portugues");
            expect(getVirtualDiscipline("virtual_abc_educacao_fisica")).toBe("educacao_fisica");
        });

        it("retorna null para IDs não-virtuais", () => {
            expect(getVirtualDiscipline("abc123")).toBeNull();
            expect(getVirtualDiscipline("normal_id")).toBeNull();
        });
    });

    describe("createVirtualId", () => {
        it("cria virtual ID corretamente", () => {
            expect(createVirtualId("abc123", "portugues")).toBe("virtual_abc123_portugues");
            expect(createVirtualId("xyz", "matematica")).toBe("virtual_xyz_matematica");
        });

        it("roundtrip: create → getRealStudentId e getVirtualDiscipline", () => {
            const vid = createVirtualId("student1", "ciencias");
            expect(getRealStudentId(vid)).toBe("student1");
            expect(getVirtualDiscipline(vid)).toBe("ciencias");
            expect(isVirtualId(vid)).toBe(true);
        });
    });

    describe("hasMeaningfulPeiData", () => {
        it("retorna false para null/undefined/empty", () => {
            expect(hasMeaningfulPeiData(null)).toBe(false);
            expect(hasMeaningfulPeiData(undefined)).toBe(false);
            expect(hasMeaningfulPeiData({})).toBe(false);
        });

        it("retorna false quando todos os valores são vazios", () => {
            expect(hasMeaningfulPeiData({ nome: "", serie: "", diagnostico: null })).toBe(false);
            expect(hasMeaningfulPeiData({ lista: [] })).toBe(false);
        });

        it("retorna true quando tem pelo menos um campo com conteúdo", () => {
            expect(hasMeaningfulPeiData({ nome: "João" })).toBe(true);
            expect(hasMeaningfulPeiData({ diagnostico: "TEA" })).toBe(true);
            expect(hasMeaningfulPeiData({ lista: [1, 2, 3] })).toBe(true);
        });
    });

    describe("safeString", () => {
        it("retorna string normal", () => {
            expect(safeString("Hello")).toBe("Hello");
            expect(safeString("Diagnóstico")).toBe("Diagnóstico");
        });

        it("retorna fallback para null/undefined", () => {
            expect(safeString(null)).toBe("");
            expect(safeString(undefined)).toBe("");
            expect(safeString(null, "N/A")).toBe("N/A");
        });

        it("converte números para string", () => {
            expect(safeString(42)).toBe("42");
        });

        it("detecta dados criptografados (base64 longo) e retorna fallback", () => {
            const encrypted = "A".repeat(200); // simula base64 criptografado
            expect(safeString(encrypted)).toBe("");
            expect(safeString(encrypted, "Dado protegido")).toBe("Dado protegido");
        });

        it("não rejeita strings normais curtas", () => {
            expect(safeString("ABC")).toBe("ABC");
            expect(safeString("TEA - Nível 1")).toBe("TEA - Nível 1");
        });
    });
});
