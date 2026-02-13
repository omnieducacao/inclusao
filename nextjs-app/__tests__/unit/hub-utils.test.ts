import { describe, it, expect } from "vitest";
import {
    garantirTagImagem,
    anoCelulaContem,
    extrairAnoBnccDoAluno,
    padronizarAno,
    ordenarAnos,
} from "@/lib/hub-utils";

describe("hub-utils", () => {
    describe("garantirTagImagem", () => {
        it("adiciona [[IMG_1]] quando não há tag", () => {
            const texto = "Primeira linha.\nSegunda linha.";
            const result = garantirTagImagem(texto);
            expect(result).toContain("[[IMG_1]]");
        });

        it("não duplica tag quando já existe [[IMG", () => {
            const texto = "Texto com [[IMG_1]] já presente.";
            const result = garantirTagImagem(texto);
            expect(result).toBe(texto);
        });

        it("não duplica tag quando já existe [[GEN_IMG", () => {
            const texto = "Texto com [[GEN_IMG_1]] já presente.";
            const result = garantirTagImagem(texto);
            expect(result).toBe(texto);
        });

        it("adiciona [[IMG_2]] quando tag especificada", () => {
            const texto = "Primeira linha.\nSegunda linha.";
            const result = garantirTagImagem(texto, "IMG_2");
            expect(result).toContain("[[IMG_2]]");
            expect(result).not.toContain("[[IMG_1]]");
        });

        it("não adiciona tag quando tagAInserir é null", () => {
            const texto = "Texto sem tag.";
            const result = garantirTagImagem(texto, null);
            expect(result).toBe(texto);
        });

        it("adiciona no início quando não há quebra de linha ou ponto", () => {
            const texto = "Texto simples sem ponto nem newline";
            const result = garantirTagImagem(texto);
            expect(result.startsWith("[[IMG_1]]")).toBe(true);
        });
    });

    describe("anoCelulaContem", () => {
        it("encontra ano em célula com múltiplos valores", () => {
            expect(anoCelulaContem("1º, 2º, 3º, 4º, 5º", "3º")).toBe(true);
        });

        it("retorna false para ano ausente", () => {
            expect(anoCelulaContem("1º, 2º", "3º")).toBe(false);
        });

        it("retorna false para strings vazias", () => {
            expect(anoCelulaContem("", "3º")).toBe(false);
            expect(anoCelulaContem("3º", "")).toBe(false);
        });

        it("match exato, não parcial", () => {
            expect(anoCelulaContem("1º", "1")).toBe(false);
        });
    });

    describe("extrairAnoBnccDoAluno", () => {
        it("extrai ano do ensino fundamental", () => {
            expect(extrairAnoBnccDoAluno({ grade: "3º ano" })).toBe("3º");
        });

        it("extrai série do ensino médio", () => {
            const result = extrairAnoBnccDoAluno({ serie: "2ª série EM" });
            expect(result).toBe("2EM");
        });

        it("retorna null para aluno null", () => {
            expect(extrairAnoBnccDoAluno(null)).toBeNull();
        });

        it("retorna null para série vazia", () => {
            expect(extrairAnoBnccDoAluno({ grade: "" })).toBeNull();
        });

        it("usa campo serie quando grade ausente", () => {
            const result = extrairAnoBnccDoAluno({ serie: "5º" });
            expect(result).toBe("5º");
        });
    });

    describe("padronizarAno", () => {
        it("normaliza '3º ano' → '03'", () => {
            expect(padronizarAno("3º ano")).toBe("03");
        });

        it("normaliza '2EM' → '02EM'", () => {
            expect(padronizarAno("2em")).toBe("02EM");
        });

        it("normaliza '1ª série' → '01'", () => {
            expect(padronizarAno("1ª série")).toBe("01");
        });

        it("retorna string inalterada quando nenhum padrão casa", () => {
            expect(padronizarAno("Maternal")).toBe("Maternal");
        });
    });

    describe("ordenarAnos", () => {
        it("ordena ensino fundamental corretamente", () => {
            const input = ["3º ano", "1º ano", "5º ano", "2º ano"];
            const result = ordenarAnos(input);
            expect(result[0]).toBe("1º ano");
            expect(result[result.length - 1]).toBe("5º ano");
        });

        it("ensino médio vem após fundamental", () => {
            const input = ["1EM", "9º ano", "1º ano"];
            const result = ordenarAnos(input);
            expect(result[result.length - 1]).toBe("9º ano");
        });
    });
});
