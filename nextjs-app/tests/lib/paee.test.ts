import { describe, it, expect } from "vitest";
import {
  extrairMetasDoPei,
  criarCronogramaBasico,
  fmtDataIso,
  badgeStatus,
  FREQUENCIAS,
} from "@/lib/paee";

describe("lib/paee", () => {
  describe("extrairMetasDoPei", () => {
    it("deve retornar lista vazia para pei_data vazio", () => {
      const metas = extrairMetasDoPei({});
      expect(metas).toEqual([]);
    });

    it("deve extrair metas de ia_sugestao", () => {
      const peiData = {
        ia_sugestao: `
          Meta: Desenvolver habilidades de leitura
          Objetivo: Melhorar compreensão textual
          Habilidade: Comunicação
        `,
      };
      const metas = extrairMetasDoPei(peiData);
      expect(metas.length).toBeGreaterThan(0);
    });

    it("deve retornar meta genérica se não encontrar metas", () => {
      const peiData = { nome: "João" };
      const metas = extrairMetasDoPei(peiData);
      expect(metas.length).toBeGreaterThan(0);
      expect(metas[0].tipo).toBe("DESENVOLVIMENTO");
    });
  });

  describe("criarCronogramaBasico", () => {
    it("deve criar cronograma com número correto de semanas", () => {
      const cronograma = criarCronogramaBasico(12, []);
      expect(cronograma.semanas.length).toBe(12);
    });

    it("deve criar fases corretamente", () => {
      const cronograma = criarCronogramaBasico(12, []);
      expect(cronograma.fases.length).toBeGreaterThan(0);
      expect(cronograma.fases[0].nome).toContain("Fase");
    });
  });

  describe("fmtDataIso", () => {
    it("deve formatar data ISO corretamente", () => {
      const data = "2026-02-06";
      const formatada = fmtDataIso(data);
      expect(formatada).toContain("2026");
    });

    it("deve retornar '-' para data vazia", () => {
      const formatada = fmtDataIso("");
      expect(formatada).toBe("-");
    });

    it("deve retornar '-' para undefined", () => {
      const formatada = fmtDataIso(undefined);
      expect(formatada).toBe("-");
    });
  });

  describe("badgeStatus", () => {
    it("deve retornar ícone e cor para status rascunho", () => {
      const [ic, cor] = badgeStatus("rascunho");
      expect(ic).toBeTruthy();
      expect(cor).toBeTruthy();
    });

    it("deve retornar ícone e cor para status ativo", () => {
      const [ic, cor] = badgeStatus("ativo");
      expect(ic).toBeTruthy();
      expect(cor).toBeTruthy();
    });

    it("deve retornar ícone e cor para status concluido", () => {
      const [ic, cor] = badgeStatus("concluido");
      expect(ic).toBeTruthy();
      expect(cor).toBeTruthy();
    });
  });

  describe("FREQUENCIAS", () => {
    it("deve conter frequências esperadas", () => {
      expect(FREQUENCIAS).toContain("1x_semana");
      expect(FREQUENCIAS).toContain("2x_semana");
      expect(FREQUENCIAS).toContain("3x_semana");
      expect(FREQUENCIAS).toContain("diario");
    });
  });
});
