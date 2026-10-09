import { describe, it, expect } from "vitest";
import { primeirosPassos, mostrarPrimeirosPassos } from "@/lib/primeiros-passos";

describe("primeiros passos da escola (onda 11)", () => {
  it("escola nova: nada feito, aparece", () => {
    const p = primeirosPassos({ anosLetivos: 0, turmas: 0, equipe: 0, estudantes: 0, peisVigentes: 0 });
    expect(p.map((x) => x.feito)).toEqual([false, false, false, false]);
    expect(mostrarPrimeirosPassos(p)).toBe(true);
  });
  it("turmas exigem ano letivo e turma", () => {
    expect(primeirosPassos({ anosLetivos: 1, turmas: 0, equipe: 0, estudantes: 0, peisVigentes: 0 })[0].feito).toBe(false);
    expect(primeirosPassos({ anosLetivos: 1, turmas: 3, equipe: 0, estudantes: 0, peisVigentes: 0 })[0].feito).toBe(true);
  });
  it("tudo feito: some do Início", () => {
    const p = primeirosPassos({ anosLetivos: 1, turmas: 2, equipe: 4, estudantes: 10, peisVigentes: 1 });
    expect(mostrarPrimeirosPassos(p)).toBe(false);
  });
});
