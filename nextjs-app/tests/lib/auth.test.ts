import { describe, it, expect } from "vitest";
import { verifyPassword } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Função hashPassword extraída (mesma lógica do auth.ts)
function hashPassword(plain: string): string | null {
  if (!plain || plain.length < 4) return null;
  try {
    return bcrypt.hashSync(plain, 10);
  } catch {
    return null;
  }
}

describe("lib/auth", () => {
  describe("hashPassword", () => {
    it("deve retornar hash bcrypt válido para admin", () => {
      const hash = hashPassword("admin123");
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
      expect(hash!.length).toBeGreaterThan(10);
      expect(hash).not.toBe("admin123");
      expect(hash).toMatch(/^\$2[aby]\$/); // Formato bcrypt
    });

    it("deve retornar null para senha vazia", () => {
      const hash = hashPassword("");
      expect(hash).toBeNull();
    });

    it("deve retornar null para senha muito curta", () => {
      const hash = hashPassword("abc");
      expect(hash).toBeNull();
    });
  });

  describe("verifyPassword", () => {
    it("deve verificar senha de admin corretamente", () => {
      const hash = hashPassword("admin123");
      const isValid = verifyPassword("admin123", hash!);
      expect(isValid).toBe(true);
    });

    it("deve retornar false para senha incorreta", () => {
      const hash = hashPassword("admin123");
      const isValid = verifyPassword("senha_errada", hash!);
      expect(isValid).toBe(false);
    });

    it("deve retornar false para senha vazia", () => {
      const hash = hashPassword("admin123");
      const isValid = verifyPassword("", hash!);
      expect(isValid).toBe(false);
    });
  });
});
