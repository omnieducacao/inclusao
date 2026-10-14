import { describe, it, expect } from "vitest";
import { pendenciasDoInicio } from "@/lib/inicio";

const vig = (extra: Record<string, unknown> = {}) => ({ vigencia: { status: "vigente", versao: 1, proxima_revisao: "2027-06-01" }, ...extra });

describe("Início da coordenação do PEI (modo completo)", () => {
  const hoje = "2026-10-14";
  it("PEI vigente sem envio aos professores pede o envio", () => {
    const p = pendenciasDoInicio([{ id: "a", name: "Ana", grade: "4º ano", pei_data: vig() }], { editaPei: true, cientes: null, hoje, completo: true, disciplinas: new Map() });
    expect(p.map((x) => x.tipo)).toEqual(["sem_envio"]);
    expect(p[0].href).toBe("/pei?student=a&etapa=3&secao=regentes");
  });
  it("disciplina concluída e ainda não juntada pede a consolidação; juntada não", () => {
    const d = new Map([["a", { enviadas: 2, concluidas: ["Matemática", "Ciências"] }]]);
    const p = pendenciasDoInicio([{ id: "a", name: "Ana", grade: "4º ano", pei_data: vig({ consolidacao: { disciplinas: [{ disciplina: "Ciências" }] } }) }], { editaPei: true, cientes: null, hoje, completo: true, disciplinas: d });
    expect(p.map((x) => x.tipo)).toEqual(["consolidar"]);
    expect(p[0].texto).toContain("Matemática voltou concluída");
  });
  it("no modo simplificado, nada disso", () => {
    const p = pendenciasDoInicio([{ id: "a", name: "Ana", grade: "4º ano", pei_data: vig() }], { editaPei: true, cientes: null, hoje, completo: false, disciplinas: new Map() });
    expect(p).toEqual([]);
  });
});
