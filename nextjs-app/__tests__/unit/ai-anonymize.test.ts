import { describe, it, expect } from "vitest";
import { anonymizeMessages, anonymizeText } from "../../lib/ai-anonymize";

describe("ai-anonymize", () => {
    describe("anonymizeMessages", () => {
        it("should anonymize student name in all messages", () => {
            const messages = [
                { role: "system", content: "Você é um especialista." },
                { role: "user", content: "ESTUDANTE: João da Silva | Diagnóstico: TEA" },
            ];
            const { anonymized, restore } = anonymizeMessages(messages, "João da Silva");

            expect(anonymized[1].content).not.toContain("João");
            expect(anonymized[1].content).not.toContain("Silva");
            expect(anonymized[1].content).toContain("[ESTUDANTE]");
        });

        it("should restore names in AI response", () => {
            const messages = [
                { role: "user", content: "O aluno João Silva precisa de apoio." },
            ];
            const { anonymized, restore } = anonymizeMessages(messages, "João Silva");

            // Simula resposta da IA usando o token
            const aiResponse = "O [ESTUDANTE] demonstra progresso no aprendizado.";
            const restored = restore(aiResponse);

            expect(restored).toContain("João Silva");
            expect(restored).not.toContain("[ESTUDANTE]");
        });

        it("should return original messages when no name is provided", () => {
            const messages = [
                { role: "user", content: "Gerar plano de aula sobre matemática." },
            ];
            const { anonymized, restore } = anonymizeMessages(messages, null);

            expect(anonymized[0].content).toBe(messages[0].content);
            expect(restore("resposta")).toBe("resposta");
        });

        it("should return original messages for empty name", () => {
            const messages = [{ role: "user", content: "Teste" }];
            const { anonymized } = anonymizeMessages(messages, "");

            expect(anonymized[0].content).toBe("Teste");
        });

        it("should return original messages for whitespace-only name", () => {
            const messages = [{ role: "user", content: "Teste" }];
            const { anonymized } = anonymizeMessages(messages, "   ");

            expect(anonymized[0].content).toBe("Teste");
        });

        it("should handle additional names", () => {
            const messages = [
                { role: "user", content: "A mãe Maria Souza traz o aluno Pedro Silva." },
            ];
            const { anonymized, restore } = anonymizeMessages(
                messages,
                "Pedro Silva",
                { RESPONSAVEL_1: "Maria Souza" }
            );

            expect(anonymized[0].content).not.toContain("Pedro");
            expect(anonymized[0].content).not.toContain("Maria");
        });

        it("should anonymize system and user roles", () => {
            const messages = [
                { role: "system", content: "Ajude o aluno Pedro Santos." },
                { role: "user", content: "Pedro Santos tem 10 anos." },
            ];
            const { anonymized } = anonymizeMessages(messages, "Pedro Santos");

            expect(anonymized[0].content).not.toContain("Pedro");
            expect(anonymized[1].content).not.toContain("Pedro");
        });
    });

    describe("anonymizeText", () => {
        it("should anonymize a single text string", () => {
            const { anonymized, restore } = anonymizeText(
                "O estudante Ana Beatriz precisa de apoio visual.",
                "Ana Beatriz"
            );

            expect(anonymized).not.toContain("Ana");
            expect(anonymized).not.toContain("Beatriz");

            const restored = restore("[ESTUDANTE] está progredindo.");
            expect(restored).toContain("Ana Beatriz");
        });

        it("should pass through when no name provided", () => {
            const { anonymized, restore } = anonymizeText("Texto sem nome.", null);

            expect(anonymized).toBe("Texto sem nome.");
            expect(restore("output")).toBe("output");
        });

        it("should pass through for empty name", () => {
            const { anonymized } = anonymizeText("Texto.", "");
            expect(anonymized).toBe("Texto.");
        });

        it("should handle full anonymize-restore cycle", () => {
            const original = "Maria Clara tem diagnóstico de TEA. Maria Clara usa hiperfoco.";
            const { anonymized, restore } = anonymizeText(original, "Maria Clara");

            // Prompt should not contain real name
            expect(anonymized).not.toContain("Maria Clara");

            // AI response simulation
            const aiResponse = "A [ESTUDANTE] demonstra evolução significativa.";
            const restored = restore(aiResponse);
            expect(restored).toContain("Maria Clara");
        });
    });
});
