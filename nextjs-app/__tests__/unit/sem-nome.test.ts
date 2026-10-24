import { describe, expect, it } from "vitest";
import { semNome } from "@/lib/sem-nome";

describe("semNome (Onda 88)", () => {
  it("tira nome completo e partes, sem mexer em palavras parecidas", () => {
    const t = "Missão 1: Ana Souza explora a floresta. ana encontra Souza. Banana fica.";
    const r = semNome(t, "Ana Souza");
    expect(r).not.toMatch(/\bAna\b|Souza/i);
    expect(r).toContain("Banana");
    expect(r).toContain("o estudante explora");
  });
  it("ignora partículas e nome vazio", () => {
    expect(semNome("Pedro dos Santos joga dos dados", "Pedro dos Santos")).toBe("o estudante joga dos dados");
    expect(semNome("texto", "")).toBe("texto");
  });
});
