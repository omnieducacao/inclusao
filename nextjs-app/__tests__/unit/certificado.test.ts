import { describe, expect, it } from "vitest";
import { TRILHAS, codigoValido, dataPorExtenso, gerarCodigo, temasDaTrilha, validarPedido } from "@/lib/certificado";

describe("certificado da formação (onda 53)", () => {
  it("horas e temas por trilha", () => {
    expect(TRILHAS.prof.horas).toBe(3);
    expect(TRILHAS.aee.horas).toBe(3);
    expect(TRILHAS.coord.horas).toBe(2);
    expect(temasDaTrilha("prof")).toHaveLength(11);
    expect(temasDaTrilha("aee")).toHaveLength(11);
    expect(temasDaTrilha("coord")).toHaveLength(7);
  });
  it("gera códigos válidos e sem letras ambíguas", () => {
    for (let i = 0; i < 200; i++) expect(codigoValido(gerarCodigo())).toBe(true);
    expect(gerarCodigo(() => new Uint8Array(8))).toBe("OMNI-AAAA-AAAA");
    expect(codigoValido("OMNI-0OIL-AAAA")).toBe(false);
    expect(codigoValido("qualquer")).toBe(false);
  });
  it("valida o pedido", () => {
    const bom = { nome: "Ana  Ribeiro", email: "ANA@escola.com.br", escola: "Escola Teste", trilha: "aee", consentimento: true, reflexao: "Vou montar uma agenda visual com a turma e combinar pausas curtas com a estudante." };
    const r = validarPedido(bom);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.pedido.nome).toBe("Ana Ribeiro"); expect(r.pedido.email).toBe("ana@escola.com.br"); expect(r.pedido.telefone).toBeNull(); }
    const ruim = validarPedido({ nome: "Ana", email: "x", escola: "", trilha: "outra", telefone: "123" });
    expect(ruim.ok).toBe(false);
    if (!ruim.ok) expect(Object.keys(ruim.erros).sort()).toEqual(["consentimento", "email", "escola", "nome", "reflexao", "telefone", "trilha"]);
  });
  it("data por extenso no fuso de Brasília", () => {
    expect(dataPorExtenso("2026-10-15T12:00:00Z")).toBe("15 de outubro de 2026");
    expect(dataPorExtenso("2026-10-16T01:00:00Z")).toBe("15 de outubro de 2026");
  });
});
