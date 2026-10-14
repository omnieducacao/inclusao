import { describe, it, expect } from "vitest";
import { JORNADA, proximosPassos, type EtapaId } from "@/lib/jornada";
import { pendenciasDoInicio } from "@/lib/inicio";

const AEE = { can_estudantes: true, can_pei: true, can_paee: true, can_hub: true, can_diario: true, can_avaliacao: true };

describe("jornada: nenhum módulo é beco sem saída", () => {
  it("toda etapa aponta para etapas que existem", () => {
    for (const e of Object.values(JORNADA)) {
      expect(e.depois.length).toBeGreaterThan(0);
      for (const d of e.depois) expect(JORNADA[d as EtapaId], `${e.id} → ${d}`).toBeDefined();
    }
  });
  it("do PEI vai para o PAEE com o estudante escolhido", () => {
    const p = proximosPassos("pei", AEE, "abc");
    expect(p[0]).toMatchObject({ id: "paee", href: "/paee?student=abc" });
  });
  it("depois de avaliar, volta ao PEI na revisão", () => {
    const p = proximosPassos("avaliacao", AEE, "abc");
    expect(p.map((x) => x.href)).toEqual(["/evolucao?student=abc", "/pei?student=abc&etapa=4"]);
    expect(p[1].titulo).toBe("Revisar o PEI");
  });
  it("só mostra o que a pessoa pode abrir", () => {
    const apoio = { can_hub: true, can_diario: true };
    expect(proximosPassos("hub", apoio, "x").map((p) => p.id)).toEqual(["diario"]);
    expect(proximosPassos("diario", apoio, "x")).toEqual([]);
  });
});

describe("Início: passagem do PEI para o AEE", () => {
  const vigente = { vigencia: { status: "vigente", versao: 1, proxima_revisao: "2027-03-01" } };
  it("PEI valendo sem ciclo ativo pede para planejar o AEE", () => {
    const p = pendenciasDoInicio([{ id: "e1", name: "Ana", grade: "4º ano", pei_data: vigente, paee_ciclos: [] }], { editaPei: true, cientes: null, hoje: "2026-10-13", editaPaee: true });
    expect(p.find((x) => x.tipo === "sem_paee")).toMatchObject({ href: "/paee?student=e1", acao: "Planejar o AEE" });
  });
  it("com ciclo ativo, ou sem permissão de PAEE, não pede", () => {
    const ativo = pendenciasDoInicio([{ id: "e1", name: "Ana", grade: null, pei_data: vigente, paee_ciclos: [{ status: "ativo" }] }], { editaPei: true, cientes: null, hoje: "2026-10-13", editaPaee: true });
    expect(ativo.some((x) => x.tipo === "sem_paee")).toBe(false);
    const sem = pendenciasDoInicio([{ id: "e1", name: "Ana", grade: null, pei_data: vigente }], { editaPei: true, cientes: null, hoje: "2026-10-13" });
    expect(sem.some((x) => x.tipo === "sem_paee")).toBe(false);
  });
});
