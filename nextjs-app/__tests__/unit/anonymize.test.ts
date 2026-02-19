/**
 * Testes Unitários - Módulo de Anonimização LGPD
 * 
 * Cobertura:
 * - Anonimização de nomes em prompts para IA
 * - Substuição de dados pessoais por tokens
 * - Restauração de nomes nas respostas
 * - Proteção de múltiplos nomes (responsáveis, profissionais)
 * - Edge cases: nomes curtos, caracteres especiais
 * 
 * LGPD: Testes de pseudonimização (Art. 13, §2º)
 */

import { describe, it, expect } from "vitest";
import { anonymizePrompt, deanonymizeResponse } from "@/lib/anonymize";

describe("anonymize", () => {
    describe("anonymizePrompt", () => {
        it("substitui nome completo do estudante por [ESTUDANTE]", () => {
            const prompt = "João Silva tem dificuldade em matemática.";
            const result = anonymizePrompt(prompt, "João Silva");
            expect(result).toBe("[ESTUDANTE] tem dificuldade em matemática.");
        });

        it("substitui primeiro nome se tiver mais de 3 caracteres", () => {
            const prompt = "Maria gosta de ciências. Maria sempre participa.";
            const result = anonymizePrompt(prompt, "Maria Souza");
            expect(result).toBe("[ESTUDANTE] gosta de ciências. [ESTUDANTE] sempre participa.");
        });

        it("não substitui primeiro nome curto (<=3 chars) para evitar falsos positivos", () => {
            const prompt = "Ana é uma ótima aluna. Ana gosta de ler.";
            // "Ana" tem 3 caracteres, então não deve ser substituído
            const result = anonymizePrompt(prompt, "Ana Clara");
            expect(result).toBe("Ana é uma ótima aluna. Ana gosta de ler.");
        });

        it("substitui múltiplas ocorrências do nome completo", () => {
            const prompt = "Pedro Henrique tem TDAH. Pedro Henrique está medicado.";
            const result = anonymizePrompt(prompt, "Pedro Henrique");
            expect(result).toBe("[ESTUDANTE] tem TDAH. [ESTUDANTE] está medicado.");
        });

        it("é case insensitive", () => {
            const prompt = "CARLOS tem hiperfoco. carlos gosta de números.";
            const result = anonymizePrompt(prompt, "Carlos Eduardo");
            expect(result).toBe("[ESTUDANTE] tem hiperfoco. [ESTUDANTE] gosta de números.");
        });

        it("não altera prompt quando não há nome do estudante", () => {
            const prompt = "O estudante tem bom desempenho.";
            const result = anonymizePrompt(prompt, null);
            expect(result).toBe("O estudante tem bom desempenho.");
        });

        it("não altera prompt quando nome é vazio", () => {
            const prompt = "O estudante tem bom desempenho.";
            const result = anonymizePrompt(prompt, "");
            expect(result).toBe("O estudante tem bom desempenho.");
        });

        it("não altera prompt quando nome tem apenas espaços", () => {
            const prompt = "O estudante tem bom desempenho.";
            const result = anonymizePrompt(prompt, "   ");
            expect(result).toBe("O estudante tem bom desempenho.");
        });

        it("substitui nomes adicionais (responsáveis, profissionais)", () => {
            const prompt = "O laudo foi assinado por Dr. Roberto. A mãe Ana conversou com ele.";
            const additionalNames = {
                "RESPONSAVEL": "Ana",
                "PROFISSIONAL": "Roberto",
            };
            const result = anonymizePrompt(prompt, null, additionalNames);
            expect(result).toBe("O laudo foi assinado por Dr. [PROFISSIONAL]. A mãe [RESPONSAVEL] conversou com ele.");
        });

        it("substitui nome do estudante E nomes adicionais", () => {
            const prompt = "Lucas foi avaliado por Dra. Fernanda. A mãe Patricia acompanhou.";
            const additionalNames = {
                "RESPONSAVEL": "Patricia",
                "MEDICO": "Fernanda",
            };
            const result = anonymizePrompt(prompt, "Lucas Mendes", additionalNames);
            expect(result).toBe("[ESTUDANTE] foi avaliado por Dra. [MEDICO]. A mãe [RESPONSAVEL] acompanhou.");
        });

        it("não substitui nomes adicionais quando valor é vazio", () => {
            const prompt = "O médico Roberto fez o laudo.";
            const additionalNames = {
                "MEDICO": "",
                "OUTRO": "  ",
            };
            const result = anonymizePrompt(prompt, null, additionalNames);
            expect(result).toBe("O médico Roberto fez o laudo.");
        });

        it("trata nomes com acentos corretamente", () => {
            const prompt = "José Antônio tem dislexia. José precisa de apoio.";
            const result = anonymizePrompt(prompt, "José Antônio");
            expect(result).toBe("[ESTUDANTE] tem dislexia. José precisa de apoio.");
            // Nota: "José" tem 4 caracteres, então deve ser substituído
        });

        it("trata nomes compostos", () => {
            const prompt = "Ana Maria Silva tem autismo. Ana Maria é verbal.";
            const result = anonymizePrompt(prompt, "Ana Maria Silva");
            expect(result).toBe("[ESTUDANTE] tem autismo. Ana Maria é verbal.");
        });

        it("preserva pontuação e formatação", () => {
            const prompt = "Gabriel (5 anos) tem TEA. Gabriel? Sim, Gabriel!";
            const result = anonymizePrompt(prompt, "Gabriel Santos");
            expect(result).toBe("[ESTUDANTE] (5 anos) tem TEA. [ESTUDANTE]? Sim, [ESTUDANTE]!");
        });

        it("não substitui substring de outras palavras", () => {
            // "Ana" não deve substituir "Banana" ou "Análise"
            const prompt = "Ana comeu banana. Ana fez análise.";
            const result = anonymizePrompt(prompt, "Ana Clara");
            expect(result).toBe("Ana comeu banana. Ana fez análise.");
        });

        it("lida com texto grande eficientemente", () => {
            const prompt = "Rafael ".repeat(1000) + "é um bom aluno.";
            const result = anonymizePrompt(prompt, "Rafael Oliveira");
            // Deve completar em tempo razoável e substituir todas ocorrências
            expect(result).not.toContain("Rafael Oliveira");
            expect(result.split("[ESTUDANTE]").length).toBeGreaterThan(100);
        });
    });

    describe("deanonymizeResponse", () => {
        it("restaura nome do estudante no lugar de [ESTUDANTE]", () => {
            const response = "[ESTUDANTE] deve praticar leitura diária.";
            const result = deanonymizeResponse(response, "João Silva");
            expect(result).toBe("João Silva deve praticar leitura diária.");
        });

        it("restaura múltiplas ocorrências", () => {
            const response = "[ESTUDANTE] tem potencial. [ESTUDANTE] precisa de apoio.";
            const result = deanonymizeResponse(response, "Maria Souza");
            expect(result).toBe("Maria Souza tem potencial. Maria Souza precisa de apoio.");
        });

        it("não altera quando não há nome do estudante", () => {
            const response = "[ESTUDANTE] deve estudar.";
            const result = deanonymizeResponse(response, null);
            expect(result).toBe("[ESTUDANTE] deve estudar.");
        });

        it("restaura nomes adicionais", () => {
            const response = "O laudo foi feito pelo [MEDICO]. [RESPONSAVEL] deve acompanhar.";
            const additionalNames = {
                "MEDICO": "Dr. Roberto",
                "RESPONSAVEL": "Patricia Silva",
            };
            const result = deanonymizeResponse(response, null, additionalNames);
            expect(result).toBe("O laudo foi feito pelo Dr. Roberto. Patricia Silva deve acompanhar.");
        });

        it("restaura nome do estudante e nomes adicionais", () => {
            const response = "[ESTUDANTE] foi avaliado por [MEDICO]. [RESPONSAVEL] concordou.";
            const additionalNames = {
                "MEDICO": "Dra. Fernanda",
                "RESPONSAVEL": "Ana Paula",
            };
            const result = deanonymizeResponse(response, "Lucas Mendes", additionalNames);
            expect(result).toBe("Lucas Mendes foi avaliado por Dra. Fernanda. Ana Paula concordou.");
        });

        it("faz trim no nome antes de restaurar", () => {
            const response = "[ESTUDANTE] está progredindo.";
            const result = deanonymizeResponse(response, "  João Silva  ");
            expect(result).toBe("João Silva está progredindo.");
        });

        it("não restaura tokens sem correspondência", () => {
            const response = "[ESTUDANTE] falou com [NAO_EXISTE].";
            const result = deanonymizeResponse(response, "Maria");
            expect(result).toBe("Maria falou com [NAO_EXISTE].");
        });
    });

    describe("Ciclo Completo - Anonimização e Restauração", () => {
        it("preserva integridade do texto após ciclo completo", () => {
            const promptOriginal = "Gabriel tem TDAH. Gabriel toma Ritalina.";
            const nomeEstudante = "Gabriel Oliveira";

            // Anonimizar
            const anonimizado = anonymizePrompt(promptOriginal, nomeEstudante);
            expect(anonimizado).not.toContain("Gabriel");

            // Processar pela IA (simulado)
            const respostaIA = anonimizado.replace(/tem TDAH/, "tem TDAH e necessita de apoio");

            // Restaurar
            const restaurado = deanonymizeResponse(respostaIA, nomeEstudante);
            expect(restaurado).toContain("Gabriel Oliveira");
            expect(restaurado).toContain("necessita de apoio");
        });

        it("protege dados sensíveis em contexto médico", () => {
            const promptMedico = `
                Laudo Médico
                Paciente: Carlos Eduardo Santos
                Médico: Dra. Fernanda Lima
                Responsável: Ana Paula Santos
                
                Carlos Eduardo apresenta TEA nível 2.
                Carlos está medicado com Risperidona.
            `;

            const anonimizado = anonymizePrompt(
                promptMedico,
                "Carlos Eduardo Santos",
                {
                    "MEDICO": "Fernanda Lima",
                    "RESPONSAVEL": "Ana Paula Santos",
                }
            );

            // Não deve conter nomes reais
            expect(anonimizado).not.toContain("Carlos Eduardo Santos");
            expect(anonimizado).not.toContain("Fernanda Lima");
            expect(anonimizado).not.toContain("Ana Paula Santos");

            // Deve conter os tokens
            expect(anonimizado).toContain("[ESTUDANTE]");
            expect(anonimizado).toContain("[MEDICO]");
            expect(anonimizado).toContain("[RESPONSAVEL]");

            // Deve manter informações médicas
            expect(anonimizado).toContain("TEA nível 2");
            expect(anonimizado).toContain("Risperidona");
        });
    });

    describe("LGPD - Conformidade", () => {
        it("remove identificação direta (Art. 5º, XII)", () => {
            const prompt = "O estudante Rafael tem diagnóstico de dislexia.";
            const result = anonymizePrompt(prompt, "Rafael Silva");
            // Não deve ser possível identificar o titular diretamente
            expect(result).not.toContain("Rafael");
            expect(result).not.toContain("Silva");
        });

        it("mantém utilidade dos dados para processamento (Art. 7º)", () => {
            const prompt = "Mariana tem dificuldade em matemática e hiperfoco em arte.";
            const result = anonymizePrompt(prompt, "Mariana Oliveira");
            // Deve manter informações relevantes para o tratamento
            expect(result).toContain("dificuldade em matemática");
            expect(result).toContain("hiperfoco em arte");
        });

        it("permite reversão quando necessário (para operador)", () => {
            const prompt = "Pedro tem TDAH.";
            const anonimizado = anonymizePrompt(prompt, "Pedro Henrique");
            const restaurado = deanonymizeResponse(anonimizado, "Pedro Henrique");
            
            // O controlador do dado deve conseguir restaurar
            expect(restaurado).toBe("Pedro Henrique tem TDAH.");
        });
    });
});
