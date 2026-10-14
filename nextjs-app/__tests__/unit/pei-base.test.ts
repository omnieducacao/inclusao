import { describe, it, expect } from "vitest";
import { baseDoTextoPei, textoPeiDesatualizado } from "@/lib/pei-base";

describe("Texto do PEI × estudo de caso", () => {
  const pei = { estudo_caso: { demandas: "perde o foco", concluido_em: null }, ia_sugestao: "texto" } as Record<string, unknown>;
  it("texto gerado com o estudo de caso de agora não avisa", () => {
    const p = { ...pei, ia_base: baseDoTextoPei(pei) };
    expect(textoPeiDesatualizado(p)).toBe(false);
  });
  it("interesse registrado depois do texto avisa", () => {
    const p = { ...pei, ia_base: baseDoTextoPei(pei), hiperfoco: "Dinossauros" };
    expect(textoPeiDesatualizado(p)).toBe(true);
  });
  it("concluir o estudo de caso não conta como mudança; texto antigo sem marca não avisa", () => {
    const p = { ...pei, ia_base: baseDoTextoPei(pei), estudo_caso: { demandas: "perde o foco", concluido_em: "2026-10-14" } };
    expect(textoPeiDesatualizado(p)).toBe(false);
    expect(textoPeiDesatualizado({ ...pei, hiperfoco: "x" })).toBe(false);
  });
});
