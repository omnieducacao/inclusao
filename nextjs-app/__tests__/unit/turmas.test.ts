/**
 * Onda 1: regra única para ligar estudante à turma e filtrar a lista pelo vínculo.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({ getSupabase: vi.fn() }));

import { segmentoDaSerie, serieCombina, turmaCombina, estudanteNaTurma, filtrarPorVinculo } from "@/lib/turmas";

const g7 = { code: "7", label: "7º Ano", segment_id: "EFAF" };
const g5 = { code: "5", label: "5º Ano", segment_id: "EFAI" };
const g1em = { code: "1EM", label: "1ª Série", segment_id: "EM" };

describe("série do estudante × turma cadastrada", () => {
  it("lê o segmento escrito na série", () => {
    expect(segmentoDaSerie("7º Ano (EFAF)")).toBe("EFAF");
    expect(segmentoDaSerie("Educação Infantil (5 anos)")).toBe("EI");
    expect(segmentoDaSerie("1ª Série (EM)")).toBe("EM");
    expect(segmentoDaSerie("4º ano")).toBe("EFAI");
  });

  it("combina pelo número e pelo segmento", () => {
    expect(serieCombina(g7, "7º Ano (EFAF)")).toBe(true);
    expect(serieCombina(g1em, "1ª Série (EM)")).toBe(true);
    // antes batia só pelo número: EI 5 anos virava 5º ano, 1º ano virava 1ª série
    expect(serieCombina(g5, "Educação Infantil (5 anos)")).toBe(false);
    expect(serieCombina(g1em, "1º Ano (EFAI)")).toBe(false);
  });

  it("turma: igual, sem diferenciar maiúsculas; vazio aceita", () => {
    expect(turmaCombina("A", "a")).toBe(true);
    expect(turmaCombina("A", "B")).toBe(false);
    expect(turmaCombina("A", "")).toBe(true);
  });

  it("class_id manda quando existe", () => {
    const turma = { id: "t7a", class_group: "A", grade: g7 };
    expect(estudanteNaTurma({ id: "1", class_id: "t7a" }, turma)).toBe(true);
    expect(estudanteNaTurma({ id: "1", class_id: "outra", grade: "7º Ano (EFAF)", class_group: "A" }, turma)).toBe(false);
    expect(estudanteNaTurma({ id: "1", grade: "7º Ano (EFAF)", class_group: "A" }, turma)).toBe(true);
  });
});

describe("lista filtrada pelo vínculo", () => {
  const lista = [
    { id: "a", grade: "7º Ano (EFAF)", class_group: "A" },
    { id: "b", grade: "7º Ano (EFAF)", class_group: "B" },
    { id: "c", grade: "5º Ano (EFAI)", class_group: "A", class_id: "t5a" },
  ];

  it("toda a escola", () => {
    expect(filtrarPorVinculo({ tipo: "todos" }, lista)).toHaveLength(3);
  });

  it("por turma", () => {
    const v = { tipo: "turmas" as const, turmas: [{ id: "t7a", class_group: "A", grade: g7 }, { id: "t5a", class_group: "A", grade: g5 }] };
    expect(filtrarPorVinculo(v, lista).map((e) => e.id)).toEqual(["a", "c"]);
  });

  it("um a um", () => {
    expect(filtrarPorVinculo({ tipo: "estudantes", ids: new Set(["b"]) }, lista).map((e) => e.id)).toEqual(["b"]);
  });
});
