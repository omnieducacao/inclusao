import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// Função hashPassword extraída (privada no módulo, mas testamos a lógica)
function hashPassword(plain: string): string | null {
  if (!plain || plain.length < 4) return null;
  try {
    return bcrypt.hashSync(plain, 10);
  } catch {
    return null;
  }
}

function verifyPassword(plain: string, hash: string): boolean {
  if (!plain || !hash) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

describe("lib/members - hashPassword e verifyPassword", () => {
  describe("hashPassword", () => {
    it("deve retornar hash bcrypt válido", () => {
      const hash = hashPassword("senha123");
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
      expect(hash!.length).toBeGreaterThan(10);
      expect(hash).not.toBe("senha123");
      expect(hash).toMatch(/^\$2[aby]\$/); // Formato bcrypt
    });

    it("deve retornar null para senha vazia", () => {
      const hash = hashPassword("");
      expect(hash).toBeNull();
    });

    it("deve retornar null para senha muito curta", () => {
      const hash = hashPassword("abc"); // Menos de 4 caracteres
      expect(hash).toBeNull();
    });

    it("deve retornar hash diferente para mesma senha (salt)", () => {
      const hash1 = hashPassword("senha123");
      const hash2 = hashPassword("senha123");
      expect(hash1).not.toBe(hash2); // Salt diferente
    });
  });

  describe("verifyPassword", () => {
    it("deve verificar senha corretamente", () => {
      const hash = hashPassword("senha123");
      const isValid = verifyPassword("senha123", hash!);
      expect(isValid).toBe(true);
    });

    it("deve retornar false para senha incorreta", () => {
      const hash = hashPassword("senha123");
      const isValid = verifyPassword("senha_errada", hash!);
      expect(isValid).toBe(false);
    });

    it("deve retornar false para senha vazia", () => {
      const hash = hashPassword("senha123");
      const isValid = verifyPassword("", hash!);
      expect(isValid).toBe(false);
    });

    it("deve retornar false para hash vazio", () => {
      const isValid = verifyPassword("senha123", "");
      expect(isValid).toBe(false);
    });
  });
});
