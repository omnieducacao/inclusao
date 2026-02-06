import { describe, it, expect } from "vitest";
import { SEGMENTS } from "@/lib/school";

describe("lib/school", () => {
  describe("SEGMENTS", () => {
    it("deve ter exatamente 4 segmentos", () => {
      expect(SEGMENTS.length).toBe(4);
    });

    it("deve conter EI (Educação Infantil)", () => {
      const codes = SEGMENTS.map((s) => s.id);
      expect(codes).toContain("EI");
    });

    it("deve conter EFAI (Ensino Fundamental Anos Iniciais)", () => {
      const codes = SEGMENTS.map((s) => s.id);
      expect(codes).toContain("EFAI");
    });

    it("deve conter EFAF (Ensino Fundamental Anos Finais)", () => {
      const codes = SEGMENTS.map((s) => s.id);
      expect(codes).toContain("EFAF");
    });

    it("deve conter EM (Ensino Médio)", () => {
      const codes = SEGMENTS.map((s) => s.id);
      expect(codes).toContain("EM");
    });

    it("deve ter estrutura correta (id, label)", () => {
      for (const segment of SEGMENTS) {
        expect(typeof segment.id).toBe("string");
        expect(segment.id.length).toBeGreaterThan(0);
        expect(typeof segment.label).toBe("string");
        expect(segment.label.length).toBeGreaterThan(0);
      }
    });
  });
});
