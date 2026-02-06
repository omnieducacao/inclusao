import { describe, it, expect } from "vitest";
import { getAvailableEngines, getDefaultEngine, type ModuleType } from "@/lib/engine-selector";

describe("lib/engine-selector", () => {
  describe("getAvailableEngines", () => {
    it("deve retornar engines corretos para PEI", () => {
      const engines = getAvailableEngines("pei");
      expect(engines).toContain("red"); // DeepSeek
      expect(engines).toContain("blue"); // Kimi
      expect(engines).toContain("green"); // Claude
      expect(engines).not.toContain("yellow"); // Gemini não usado para texto PEI
      expect(engines).not.toContain("orange"); // ChatGPT não usado
    });

    it("deve retornar engines corretos para PAEE", () => {
      const engines = getAvailableEngines("paee");
      expect(engines).toEqual(["red"]); // Apenas DeepSeek
    });

    it("deve retornar engines corretos para Hub", () => {
      const engines = getAvailableEngines("hub");
      expect(engines).toContain("red"); // DeepSeek
      expect(engines).toContain("blue"); // Kimi
      expect(engines).toContain("green"); // Claude
      expect(engines).not.toContain("yellow"); // Gemini só para imagens
      expect(engines).not.toContain("orange"); // ChatGPT não usado
    });

    it("deve retornar engines corretos para extrair_laudo", () => {
      const engines = getAvailableEngines("extrair_laudo");
      expect(engines).toEqual(["orange"]); // Apenas ChatGPT
    });
  });

  describe("getDefaultEngine", () => {
    it("deve retornar red como padrão para PEI", () => {
      const engine = getDefaultEngine("pei");
      expect(engine).toBe("red");
    });

    it("deve retornar red como padrão para PAEE", () => {
      const engine = getDefaultEngine("paee");
      expect(engine).toBe("red");
    });

    it("deve retornar red como padrão para Hub", () => {
      const engine = getDefaultEngine("hub");
      expect(engine).toBe("red");
    });

    it("deve retornar orange como padrão para extrair_laudo", () => {
      const engine = getDefaultEngine("extrair_laudo");
      expect(engine).toBe("orange");
    });
  });
});
