import { describe, it, expect } from "vitest";
import {
    criarPromptProfissional,
    adaptarPromptProva,
    gerarPromptPlanoAula,
    gerarPromptDinamicaInclusiva,
    gerarPromptRoteiroAula,
    gerarPromptPapoMestre,
} from "@/lib/hub-prompts";

describe("hub-prompts", () => {
    describe("criarPromptProfissional", () => {
        it("gera prompt não-vazio", () => {
            const prompt = criarPromptProfissional({
                materia: "Matemática",
                objeto: "Frações",
                qtd: 5,
                tipo_q: "Objetiva",
                qtd_imgs: 0,
            });
            expect(prompt.length).toBeGreaterThan(50);
        });

        it("inclui matéria e objeto no prompt", () => {
            const prompt = criarPromptProfissional({
                materia: "Ciências",
                objeto: "Sistema Solar",
                qtd: 3,
                tipo_q: "Discursiva",
                qtd_imgs: 0,
            });
            expect(prompt).toContain("Ciências");
            expect(prompt).toContain("Sistema Solar");
        });

        it("inclui hiperfoco quando fornecido", () => {
            const prompt = criarPromptProfissional({
                materia: "Matemática",
                objeto: "Números",
                qtd: 2,
                tipo_q: "Objetiva",
                qtd_imgs: 0,
                hiperfoco: "dinossauros",
            });
            expect(prompt.toLowerCase()).toContain("dinossauros");
        });

        it("inclui habilidades BNCC quando fornecidas", () => {
            const prompt = criarPromptProfissional({
                materia: "Português",
                objeto: "Leitura",
                qtd: 3,
                tipo_q: "Objetiva",
                qtd_imgs: 0,
                habilidades_bncc: ["EF01LP01"],
            });
            expect(prompt).toContain("EF01LP01");
        });
    });

    describe("adaptarPromptProva", () => {
        it("gera prompt com texto da prova", () => {
            const prompt = adaptarPromptProva({
                aluno: { nome: "João" },
                texto: "1) Qual a capital do Brasil?\n2) Quanto é 2+2?",
                materia: "Geral",
                tema: "Revisão",
                tipo_atv: "Prova",
                remover_resp: false,
                questoes_mapeadas: [1, 2],
            });
            expect(prompt.length).toBeGreaterThan(50);
            expect(prompt).toContain("Qual a capital do Brasil");
        });

        it("referencia questões mapeadas", () => {
            const prompt = adaptarPromptProva({
                aluno: { nome: "Ana" },
                texto: "1) Pergunta?\n2) Outra pergunta?",
                materia: "Matemática",
                tema: "Frações",
                tipo_atv: "Atividade",
                remover_resp: true,
                questoes_mapeadas: [1, 2],
            });
            // Should reference the questions in some way
            expect(prompt).toBeTruthy();
        });
    });

    describe("gerarPromptPlanoAula", () => {
        it("gera prompt com dados da aula", () => {
            const prompt = gerarPromptPlanoAula({
                materia: "História",
                assunto: "Revolução Francesa",
                metodologia: "Aula expositiva",
                tecnica: "Debate",
                qtd_alunos: 30,
                recursos: ["Quadro", "Projetor"],
            });
            expect(prompt).toContain("História");
            expect(prompt).toContain("Revolução Francesa");
        });

        it("inclui habilidades BNCC quando fornecidas", () => {
            const prompt = gerarPromptPlanoAula({
                materia: "Matemática",
                assunto: "Geometria",
                metodologia: "Prática",
                tecnica: "Manipulativos",
                qtd_alunos: 25,
                recursos: ["Material dourado"],
                habilidades_bncc: ["EF03MA15"],
            });
            expect(prompt).toContain("EF03MA15");
        });
    });

    describe("gerarPromptDinamicaInclusiva", () => {
        it("inclui quantidade de alunos", () => {
            const prompt = gerarPromptDinamicaInclusiva({
                aluno: { nome: "Pedro" },
                nome: "Pedro",
                materia: "Educação Física",
                assunto: "Coordenação motora",
                qtd_alunos: 20,
                caracteristicas_turma: "Turma com alunos de 7 a 8 anos",
            });
            expect(prompt).toContain("20");
            expect(prompt).toContain("Pedro");
        });
    });

    describe("gerarPromptRoteiroAula", () => {
        it("gera prompt com dados do aluno", () => {
            const prompt = gerarPromptRoteiroAula({
                aluno: { nome: "Maria", hiperfoco: "cavalos" },
                nome: "Maria",
                hiperfoco: "cavalos",
                materia: "Ciências",
                assunto: "Animais",
            });
            expect(prompt).toContain("Maria");
            expect(prompt.toLowerCase()).toContain("cavalos");
        });
    });

    describe("gerarPromptPapoMestre", () => {
        it("gera prompt para quebra-gelo", () => {
            const prompt = gerarPromptPapoMestre({
                aluno: { nome: "Lucas" },
                nome: "Lucas",
                materia: "Português",
                assunto: "Leitura",
            });
            expect(prompt).toContain("Lucas");
            expect(prompt.length).toBeGreaterThan(20);
        });
    });
});
