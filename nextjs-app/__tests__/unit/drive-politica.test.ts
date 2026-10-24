import { describe, it, expect } from "vitest";
import { dominioDoEmail, normalizarDominio, normalizarPolitica, podeSalvarNoDrive } from "@/lib/drive-politica";

describe("Onda 92 · regra do Salvar no Drive", () => {
  it("normaliza a política com padrão 'qualquer'", () => {
    expect(normalizarPolitica("desligado")).toBe("desligado");
    expect(normalizarPolitica("dominio")).toBe("dominio");
    expect(normalizarPolitica("qualquer")).toBe("qualquer");
    expect(normalizarPolitica(null)).toBe("qualquer");
    expect(normalizarPolitica("outra")).toBe("qualquer");
  });

  it("limpa o domínio e recusa o que não parece domínio", () => {
    expect(normalizarDominio(" @Escola.COM.br ")).toBe("escola.com.br");
    expect(normalizarDominio("escola")).toBe("");
    expect(normalizarDominio("a b.com")).toBe("");
    expect(normalizarDominio(undefined)).toBe("");
  });

  it("tira o domínio do e-mail", () => {
    expect(dominioDoEmail("prof@Escola.com.br")).toBe("escola.com.br");
    expect(dominioDoEmail("sem-arroba")).toBe("");
  });

  it("aplica as três regras", () => {
    expect(podeSalvarNoDrive("qualquer", "", "gmail.com")).toEqual({ ok: true });
    expect(podeSalvarNoDrive("desligado", "escola.com.br", "escola.com.br").ok).toBe(false);
    expect(podeSalvarNoDrive("dominio", "escola.com.br", "escola.com.br")).toEqual({ ok: true });
    expect(podeSalvarNoDrive("dominio", "escola.com.br", "gmail.com").ok).toBe(false);
    expect(podeSalvarNoDrive("dominio", "", "escola.com.br").ok).toBe(false);
  });
});
