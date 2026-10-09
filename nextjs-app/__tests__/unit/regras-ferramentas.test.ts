/**
 * Onda 3 (parte 2): toda ferramenta termina com as regras de qualidade do OmniProf,
 * e o resumo do PEI entra inteiro (antes era cortado em 300 a 1.000 caracteres).
 */
import { describe, it, expect } from "vitest";
import { adaptarPromptProva, gerarPromptPapoMestre, gerarPromptDinamicaInclusiva } from "@/lib/hub-prompts";
import { regrasDaFerramenta } from "@/lib/ferramentas/regras";

const perfilLongo = "PEI DO ESTUDANTE " + "x".repeat(1500) + " FIM-DO-PERFIL";

describe("regras de qualidade", () => {
  it("adaptar prova: não simplificar, sem rótulo, gabarito na análise e divisor mantido", () => {
    const p = adaptarPromptProva({
      aluno: { nome: "Ana", ia_sugestao: perfilLongo, hiperfoco: "dinossauros" },
      texto: "1) Quanto é 2+2?", materia: "Matemática", tema: "Soma", tipo_atv: "Prova",
      remover_resp: true, questoes_mapeadas: [],
    });
    expect(p).toContain("adaptar NÃO é simplificar");
    expect(p).toContain("nunca escreva diagnóstico");
    expect(p).toContain("---DIVISOR---");
    expect(p).toContain("gabarito");
    expect(p).toContain("FIM-DO-PERFIL");
  });

  it("papo de mestre não inventa dados", () => {
    const p = gerarPromptPapoMestre({ materia: "História", assunto: "Revolução Industrial", aluno: { nome: "Ana", hiperfoco: "games" } } as never);
    expect(p).toContain("Não invente dado numérico");
    expect(p).toContain("português do Brasil");
  });

  it("dinâmica traz cuidados de inclusão e temas sensíveis", () => {
    const p = gerarPromptDinamicaInclusiva({ materia: "História", assunto: "Escravidão", qtd_alunos: 20, caracteristicas_turma: "", aluno: { nome: "Ana" } } as never);
    expect(p).toContain("TEMAS SENSÍVEIS");
    expect(p).toContain("sem eliminação");
  });

  it("ferramenta visual não recebe regras de texto-fonte", () => {
    expect(regrasDaFerramenta("visual")).not.toContain("Texto adaptado para fins didáticos");
  });
});
