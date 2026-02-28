/**
 * Testes Unitários - Omnisfera Validator
 *
 * Validação de questões diagnósticas, métricas de qualidade
 */

import { describe, it, expect, vi } from "vitest";
import {
  validarQuestoesDiagnosticas,
  calcularMetricas,
  gerarComRetry,
} from "@/lib/omnisfera-validator";

const questaoValida = {
  id: "q1",
  enunciado: "Qual o resultado de 2 + 2? A) 3 B) 4 C) 5.",
  gabarito: "B",
  instrucao_aplicacao_professor: "Aplicar individualmente em ambiente silencioso.",
  contexto_visual_sugerido: "Imagem de maçãs",
  justificativa_pedagogica: "Avalia compreensão de adição simples no campo numérico.",
  tempo_estimado_minutos: 3,
};

describe("omnisfera-validator", () => {
  describe("validarQuestoesDiagnosticas", () => {
    it("retorna erro quando questoes ausente", () => {
      const result = validarQuestoesDiagnosticas(
        { questoes: null } as never,
        "TEA",
        2
      );
      expect(result.valido).toBe(false);
      expect(result.erros).toContain("Campo questoes ausente ou inválido");
    });

    it("retorna erro quando gabarito não é B ou C", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [{ ...questaoValida, gabarito: "A" }],
          nivel_cognitivo_saeb: "I",
        },
        "TEA",
        2
      );
      expect(result.valido).toBe(false);
      expect(result.erros.some((e) => e.includes("gabarito inválido"))).toBe(true);
    });

    it("aceita gabarito B e C", () => {
      const resultB = validarQuestoesDiagnosticas(
        { questoes: [{ ...questaoValida, gabarito: "B" }], nivel_cognitivo_saeb: "I" },
        "TEA",
        2
      );
      const resultC = validarQuestoesDiagnosticas(
        { questoes: [{ ...questaoValida, gabarito: "C" }], nivel_cognitivo_saeb: "I" },
        "TEA",
        2
      );
      expect(resultB.erros.some((e) => e.includes("gabarito"))).toBe(false);
      expect(resultC.erros.some((e) => e.includes("gabarito"))).toBe(false);
    });

    it("retorna erro quando enunciado tem mais de 3 sentenças", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [{
            ...questaoValida,
            enunciado: "Frase um. Frase dois. Frase três. Frase quatro.",
          }],
          nivel_cognitivo_saeb: "I",
        },
        "TEA",
        2
      );
      expect(result.valido).toBe(false);
      expect(result.erros.some((e) => e.includes("sentenças"))).toBe(true);
    });

    it("retorna erro quando instrucao_aplicacao_professor muito curta", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [{ ...questaoValida, instrucao_aplicacao_professor: "Curta" }],
          nivel_cognitivo_saeb: "I",
        },
        "TEA",
        2
      );
      expect(result.valido).toBe(false);
      expect(result.erros.some((e) => e.includes("instrucao_aplicacao_professor"))).toBe(true);
    });

    it("retorna erro quando TEA sem contexto_visual_sugerido", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [{ ...questaoValida, contexto_visual_sugerido: "" }],
          nivel_cognitivo_saeb: "I",
        },
        "TEA",
        2
      );
      expect(result.valido).toBe(false);
      expect(result.erros.some((e) => e.includes("contexto_visual_sugerido"))).toBe(true);
    });

    it("retorna valido para questão bem formada", () => {
      const result = validarQuestoesDiagnosticas(
        { questoes: [questaoValida], nivel_cognitivo_saeb: "I" },
        "TEA",
        2
      );
      expect(result.valido).toBe(true);
      expect(result.erros).toHaveLength(0);
    });

    it("DI: rejeita enunciado com mais de 20 palavras", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [{
            ...questaoValida,
            enunciado: "uma duas três quatro cinco seis sete oito nove dez onze doze treze catorze quinze dezesseis dezessete dezoito dezenove vinte vinteum",
          }],
          nivel_cognitivo_saeb: "I",
        },
        "DI",
        2
      );
      expect(result.valido).toBe(false);
      expect(result.erros.some((e) => e.includes("palavras") && e.includes("DI"))).toBe(true);
    });

    it("TRANSTORNO_APRENDIZAGEM: aviso quando tempo > 5min", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [{ ...questaoValida, tempo_estimado_minutos: 8 }],
          nivel_cognitivo_saeb: "I",
        },
        "TRANSTORNO_APRENDIZAGEM",
        2
      );
      expect(result.valido).toBe(true);
      expect(result.avisos.some((a) => a.includes("tempo estimado"))).toBe(true);
    });

    it("nivel_omnisfera 1-2 + nivel_cognitivo_saeb III rejeita", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [questaoValida],
          nivel_cognitivo_saeb: "III",
        },
        "TEA",
        1
      );
      expect(result.valido).toBe(false);
      expect(result.erros.some((e) => e.includes("nível cognitivo III"))).toBe(true);
    });

    it("ALTAS_HABILIDADES aceita questão sem contexto visual", () => {
      const result = validarQuestoesDiagnosticas(
        {
          questoes: [{ ...questaoValida, contexto_visual_sugerido: "" }],
          nivel_cognitivo_saeb: "I",
        },
        "ALTAS_HABILIDADES",
        2
      );
      expect(result.valido).toBe(true);
    });
  });

  describe("calcularMetricas", () => {
    it("calcula taxa de aprovação direta", () => {
      const registros = [
        { status: "aprovado" as const, tentativas: 1 },
        { status: "aprovado" as const, tentativas: 1 },
        { status: "rejeitado" as const, tentativas: 3 },
      ];
      const m = calcularMetricas(registros);
      expect(m.total_gerados).toBe(3);
      expect(m.aprovados_sem_edicao).toBe(2);
      expect(m.rejeitados).toBe(1);
      expect(m.taxa_aprovacao_direta).toBeCloseTo(66.67, 1);
      expect(m.taxa_retry).toBeCloseTo(33.33, 1);
    });

    it("retorna zeros para array vazio", () => {
      const m = calcularMetricas([]);
      expect(m.total_gerados).toBe(0);
      expect(m.taxa_aprovacao_direta).toBe(0);
      expect(m.taxa_retry).toBe(0);
    });

    it("inclui aprovado_com_edicao em total", () => {
      const registros = [
        { status: "aprovado" as const, tentativas: 1 },
        { status: "aprovado_com_edicao" as const, tentativas: 2 },
        { status: "rejeitado" as const, tentativas: 3 },
      ];
      const m = calcularMetricas(registros);
      expect(m.total_gerados).toBe(3);
      expect(m.aprovados_sem_edicao).toBe(1);
      expect(m.aprovados_com_edicao).toBe(1);
      expect(m.rejeitados).toBe(1);
      expect(m.total_retries).toBe(2);
    });
  });

  describe("gerarComRetry", () => {
    it("retorna resultado na primeira tentativa quando válido", async () => {
      const chamada = vi.fn().mockResolvedValue({ valid: true });
      const validar = vi.fn().mockReturnValue({ valido: true, erros: [], avisos: [] });

      const result = await gerarComRetry(chamada, validar);

      expect(result.tentativas).toBe(1);
      expect(chamada).toHaveBeenCalledTimes(1);
    });

    it("tenta novamente quando inválido e corrige", async () => {
      const outputValido = { x: 1 };
      const chamada = vi.fn()
        .mockResolvedValueOnce({ x: 0 })
        .mockResolvedValueOnce(outputValido);
      const validar = vi.fn()
        .mockReturnValueOnce({ valido: false, erros: ["Erro 1"], avisos: [] })
        .mockReturnValueOnce({ valido: true, erros: [], avisos: [] });

      const result = await gerarComRetry(chamada, validar, 2);

      expect(result.tentativas).toBe(2);
      expect(result.resultado).toEqual(outputValido);
      expect(chamada).toHaveBeenCalledTimes(2);
    });

    it("lança erro após esgotar tentativas", async () => {
      const chamada = vi.fn().mockResolvedValue({});
      const validar = vi.fn().mockReturnValue({ valido: false, erros: ["Erro"], avisos: [] });

      await expect(gerarComRetry(chamada, validar, 1)).rejects.toThrow("falhou após");
      expect(chamada).toHaveBeenCalledTimes(2);
    });
  });
});
