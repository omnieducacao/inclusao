import { describe, it, expect } from "vitest";
import { pendenciasDoInicio, pedemAtencao, dataCurta, primeiroNome, saudacao, hojeBrasilia } from "@/lib/inicio";

const HOJE = "2026-10-09";
const est = (id: string, name: string, pei: Record<string, unknown> | null) => ({ id, name, grade: "4º Ano (EFAI)", pei_data: pei });

describe("início · pendências", () => {
  const lista = [
    est("a", "Ana Beatriz", { vigencia: { status: "vigente", versao: 2, proxima_revisao: "2026-05-12" } }),
    est("b", "Lucas", { vigencia: { status: "vigente", versao: 1, proxima_revisao: "2026-10-20" } }),
    est("c", "Helena", { nome: "Helena", serie: "4º", hiperfoco: "dinossauros" }),
    est("d", "Bruno", { nome: "Bruno", serie: "4º" }),
    est("e", "Carla", { vigencia: { status: "vigente", versao: 3, proxima_revisao: "2027-03-01" } }),
  ];

  it("coordenação vê vencida, rascunho, revisão chegando e sem PEI, nessa ordem", () => {
    const p = pendenciasDoInicio(lista, { editaPei: true, cientes: null, hoje: HOJE });
    expect(p.map((x) => `${x.tipo}:${x.studentId}`)).toEqual([
      "revisao_vencida:a", "rascunho:c", "revisao_proxima:b", "sem_pei:d",
    ]);
    expect(p[0].texto).toBe("A revisão do PEI de Ana Beatriz venceu em 12/05");
    expect(pedemAtencao(p)).toBe(2);
  });

  it("professor vê só a ciência das versões que ainda não leu", () => {
    const p = pendenciasDoInicio(lista, { editaPei: false, cientes: new Set(["a:2"]), hoje: HOJE });
    expect(p.map((x) => x.nome)).toEqual(["Carla", "Lucas"]); // em ordem alfabética
    expect(p.every((x) => x.tipo === "ciencia" && x.href === "/pei-regente")).toBe(true);
  });
});

describe("início · textos", () => {
  it("formata datas, nomes e saudação", () => {
    expect(dataCurta("2026-05-12", HOJE)).toBe("12/05");
    expect(dataCurta("2027-03-01", HOJE)).toBe("01/03/2027");
    expect(primeiroNome("marina souza")).toBe("Marina");
    expect(primeiroNome("")).toBe("");
    expect(saudacao(new Date("2026-10-09T12:00:00Z"))).toBe("Bom dia"); // 9h em Brasília
    expect(saudacao(new Date("2026-10-09T18:00:00Z"))).toBe("Boa tarde");
    expect(saudacao(new Date("2026-10-10T00:30:00Z"))).toBe("Boa noite");
    expect(hojeBrasilia(new Date("2026-10-10T01:00:00Z"))).toBe("2026-10-09");
  });
});
