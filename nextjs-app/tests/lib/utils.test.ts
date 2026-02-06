import { describe, it, expect } from "vitest";

// Funções utilitárias que precisam ser testadas
describe("utils", () => {
  describe("getInitials", () => {
    const getInitials = (name: string): string => {
      if (!name || name.trim() === "") return "U";
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    it("deve extrair iniciais corretamente de nome completo", () => {
      expect(getInitials("João Silva")).toBe("JS");
      expect(getInitials("Maria Santos")).toBe("MS");
    });

    it("deve extrair iniciais de nome único", () => {
      expect(getInitials("Maria")).toBe("MA");
      expect(getInitials("João")).toBe("JO");
    });

    it("deve retornar 'U' para string vazia", () => {
      expect(getInitials("")).toBe("U");
      expect(getInitials("   ")).toBe("U");
    });
  });

  describe("studentGradeToMatchKeys", () => {
    const studentGradeToMatchKeys = (grade: string): Set<string> => {
      if (!grade || grade.trim() === "") return new Set();
      const keys = new Set<string>();
      const g = grade.trim();

      // Extrai número da série
      const match = g.match(/(\d+)/);
      if (match) {
        keys.add(match[1]);
      }

      // Educação Infantil
      if (g.toLowerCase().includes("infantil") || g.toLowerCase().includes("ei")) {
        keys.add("2anos");
        keys.add("3anos");
        keys.add("4anos");
        keys.add("5anos");
      }

      // Ensino Médio
      if (g.includes("EM") || g.includes("Médio")) {
        const numMatch = g.match(/(\d+)/);
        if (numMatch) {
          keys.add(`${numMatch[1]}EM`);
        }
      }

      return keys;
    };

    it("deve converter 7º Ano corretamente", () => {
      const keys = studentGradeToMatchKeys("7º Ano (EFAF)");
      expect(keys.has("7")).toBe(true);
    });

    it("deve converter Educação Infantil corretamente", () => {
      const keys = studentGradeToMatchKeys("Educação Infantil");
      expect(keys.has("2anos")).toBe(true);
      expect(keys.has("3anos")).toBe(true);
    });

    it("deve converter 1ª Série EM corretamente", () => {
      const keys = studentGradeToMatchKeys("1ª Série (EM)");
      expect(keys.has("1") || keys.has("1EM")).toBe(true);
    });

    it("deve retornar set vazio para grade vazia", () => {
      const keys = studentGradeToMatchKeys("");
      expect(keys.size).toBe(0);
    });
  });
});
