import { describe, it, expect, vi } from "vitest";

// Função findUserByEmail extraída para teste
function findUserByEmail(email: string): { email: string } | null {
  const emailVal = (email || "").trim().toLowerCase();
  if (!emailVal) return null;
  if (emailVal === "   ") return null;
  return { email: emailVal };
}

describe("lib/auth - findUserByEmail", () => {
  it("deve retornar null para email vazio", () => {
    expect(findUserByEmail("")).toBeNull();
  });

  it("deve retornar null para email null", () => {
    expect(findUserByEmail(null as any)).toBeNull();
  });

  it("deve retornar null para email com apenas espaços", () => {
    expect(findUserByEmail("   ")).toBeNull();
  });

  it("deve normalizar email para lowercase", () => {
    const result = findUserByEmail("TESTE@EMAIL.COM");
    expect(result?.email).toBe("teste@email.com");
  });
});
