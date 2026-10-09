/**
 * Onda 2: estudo de caso, vigência e abas por modo da escola.
 */
import { describe, it, expect } from "vitest";
import { passosConcluidos, estudoCasoCompleto, somarMeses, revisaoVencida, estudoCasoParaPrompt } from "@/lib/estudo-caso";
import { tabsDoModo } from "@/hooks/usePEIData";

describe("estudo de caso", () => {
  const pei = {
    estudo_caso: { demandas: "Não conclui tarefas escritas", contexto_escolar: "Turma de 28", necessita_profissional_apoio: "nao" },
    barreiras_selecionadas: { "Funções Cognitivas": ["Atenção Sustentada/Focada"] },
    potencias: ["Memória Visual"],
    estrategias_ensino: ["Fragmentação de Tarefas"],
  };

  it("marca os quatro passos quando o mínimo está preenchido", () => {
    expect(passosConcluidos(pei)).toEqual({ 1: true, 2: true, 3: true, 4: true });
    expect(estudoCasoCompleto(pei)).toBe(true);
  });

  it("passo 3 exige decidir sobre o profissional de apoio", () => {
    const sem = { ...pei, estudo_caso: { ...pei.estudo_caso, necessita_profissional_apoio: undefined } };
    expect(passosConcluidos(sem)[3]).toBe(false);
  });

  it("vira contexto para a IA", () => {
    const t = estudoCasoParaPrompt(pei.estudo_caso as never);
    expect(t).toContain("ESTUDO DE CASO");
    expect(t).toContain("PROFISSIONAL DE APOIO: não");
    expect(estudoCasoParaPrompt({})).toBe("");
  });
});

describe("vigência", () => {
  it("soma meses para a próxima revisão", () => {
    expect(somarMeses("2026-10-09", 6)).toBe("2027-04-09");
  });

  it("revisão atrasada só quando vigente e com data passada", () => {
    expect(revisaoVencida({ status: "vigente", versao: 1, proxima_revisao: "2026-01-01" }, "2026-10-09")).toBe(true);
    expect(revisaoVencida({ status: "vigente", versao: 1, proxima_revisao: "2027-01-01" }, "2026-10-09")).toBe(false);
    expect(revisaoVencida({ status: "em_revisao", versao: 1, proxima_revisao: "2026-01-01" }, "2026-10-09")).toBe(false);
  });
});

describe("abas do PEI por modo", () => {
  it("simplificado: estudo de caso no lugar das abas soltas, sem regentes e consolidação", () => {
    const ids = tabsDoModo("simplificado").map((t) => t.id);
    expect(ids).toEqual(["inicio", "estudante", "estudo_caso", "bncc", "consultoria", "vigencia", "dashboard"]);
  });

  it("completo mantém todas, com estudo de caso e vigência", () => {
    const ids = tabsDoModo("completo").map((t) => t.id);
    expect(ids).toContain("regentes");
    expect(ids).toContain("estudo_caso");
    expect(ids).toContain("vigencia");
  });
});
