import { describe, it, expect } from "vitest";
import {
    getDataBrasilia,
    getDataBrasiliaISO,
    getDataBrasiliaFormatada,
} from "@/lib/date-utils";

describe("date-utils", () => {
    describe("getDataBrasilia", () => {
        it("retorna instância de Date", () => {
            const d = getDataBrasilia();
            expect(d).toBeInstanceOf(Date);
        });

        it("não retorna NaN", () => {
            const d = getDataBrasilia();
            expect(isNaN(d.getTime())).toBe(false);
        });
    });

    describe("getDataBrasiliaISO", () => {
        it("retorna formato YYYY-MM-DD", () => {
            const iso = getDataBrasiliaISO();
            expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it("retorna string com 10 caracteres", () => {
            expect(getDataBrasiliaISO().length).toBe(10);
        });
    });

    describe("getDataBrasiliaFormatada", () => {
        it("retorna string não-vazia", () => {
            const formatted = getDataBrasiliaFormatada();
            expect(formatted.length).toBeGreaterThan(0);
        });

        it("contém o ano atual", () => {
            const formatted = getDataBrasiliaFormatada();
            const year = new Date().getFullYear().toString();
            expect(formatted).toContain(year);
        });
    });
});
