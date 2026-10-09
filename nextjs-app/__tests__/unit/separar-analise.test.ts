import { describe, it, expect } from "vitest";
import { separarAnalise } from "@/lib/ferramentas/separar-analise";

describe("separarAnalise", () => {
  it("usa o divisor oficial", () => {
    const r = separarAnalise("[ANÁLISE PEDAGÓGICA]\nPor quê\n---DIVISOR---\n[ATIVIDADE]\n1. Questão");
    expect(r).toEqual({ analise: "Por quê", material: "1. Questão" });
  });
  it("separa pelo marcador [ATIVIDADE] quando o divisor veio como ---", () => {
    const r = separarAnalise("[ANÁLISE PEDAGÓGICA]\nPara o professor\n\n---\n\n[ATIVIDADE]\n1. Questão");
    expect(r.analise).toBe("Para o professor");
    expect(r.material).toBe("1. Questão");
  });
  it("separa na linha --- quando só a análise está marcada", () => {
    const r = separarAnalise("[ANÁLISE PEDAGÓGICA]\nNotas\n---\n1. Questão");
    expect(r).toEqual({ analise: "Notas", material: "1. Questão" });
  });
  it("sem marcadores, tudo é material", () => {
    expect(separarAnalise("1. Questão\n---\n2. Outra")).toEqual({ analise: "", material: "1. Questão\n---\n2. Outra" });
  });
});
