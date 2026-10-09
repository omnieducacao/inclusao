import { describe, it, expect } from "vitest";
import { secoesDaEtapa, etapaDaAbaAntiga, estadoDasEtapas, etapaInicial } from "@/lib/pei-etapas";

const HOJE = "2026-10-09";

describe("etapas do PEI (onda 7)", () => {
  it("modo simplificado tem menos seções que o completo", () => {
    expect(secoesDaEtapa(1, "simplificado").map((s) => s.id)).toEqual(["estudo_caso", "estudante"]);
    expect(secoesDaEtapa(1, "completo").length).toBe(5);
    expect(secoesDaEtapa(3, "simplificado").map((s) => s.id)).toEqual(["vigencia"]);
  });
  it("links antigos caem na etapa certa", () => {
    expect(etapaDaAbaAntiga("consultoria")).toEqual({ etapa: 2, secao: "consultoria" });
    expect(etapaDaAbaAntiga("dashboard")).toEqual({ etapa: 4, secao: "acompanhamento" });
    expect(etapaDaAbaAntiga("qualquer")).toBeNull();
  });
  it("PEI vazio começa na etapa 1", () => {
    const e = estadoDasEtapas({}, HOJE);
    expect(e[1].texto).toBe("A fazer");
    expect(etapaInicial(e)).toBe(1);
  });
  it("estudo concluído e texto gerado leva à etapa 2 para revisar", () => {
    const e = estadoDasEtapas({ estudo_caso: { concluido_em: "2026-09-01" }, ia_sugestao: "texto", status_validacao_pei: "rascunho" }, HOJE);
    expect(e[1].feito).toBe(true);
    expect(e[2].texto).toBe("Revisar o texto");
    expect(etapaInicial(e)).toBe(2);
  });
  it("PEI vigente com revisão vencida abre na revisão", () => {
    const e = estadoDasEtapas({ estudo_caso: { concluido_em: "x" }, vigencia: { status: "vigente", versao: 2, proxima_revisao: "2026-09-01" } }, HOJE);
    expect(e[3].texto).toBe("Vigente · versão 2");
    expect(e[4].texto).toBe("Revisão vencida");
    expect(etapaInicial(e)).toBe(4);
  });
});
