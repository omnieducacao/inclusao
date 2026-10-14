import { describe, it, expect } from "vitest";
import { metasDoCicloAtivo, objetivosComMetas, metasNoRegistro, trabalhoPorMeta, PREFIXO_META_AEE } from "@/lib/paee";

const ciclos = [
  { status: "concluido", config_ciclo: { metas_selecionadas: [{ id: "velha", tipo: "x", descricao: "Meta antiga" }] } },
  {
    status: "ativo", atualizado_em: "2026-10-01",
    config_ciclo: {
      data_inicio: "2026-10-01",
      metas_selecionadas: [
        { id: "m1", tipo: "curto", descricao: "Ler frases curtas  com apoio visual" },
        { id: "m2", tipo: "curto", descricao: "Manter a atenção por 15 minutos" },
        { id: "m3", tipo: "curto", descricao: "Fora do ciclo", selecionada: false },
      ],
    },
  },
];

describe("Diário ↔ metas do ciclo do AEE", () => {
  it("lista só as metas marcadas do ciclo ativo", () => {
    expect(metasDoCicloAtivo(ciclos).map((m) => m.descricao)).toEqual(["Ler frases curtas com apoio visual", "Manter a atenção por 15 minutos"]);
    expect(metasDoCicloAtivo([])).toEqual([]);
  });
  it("grava e lê as metas no texto de objetivos, sem perder o texto livre", () => {
    const t = objetivosComMetas(["Ler frases curtas com apoio visual"], "  trabalhar sílabas  ");
    expect(t).toBe(`${PREFIXO_META_AEE}Ler frases curtas com apoio visual\ntrabalhar sílabas`);
    expect(metasNoRegistro(t)).toEqual(["Ler frases curtas com apoio visual"]);
    expect(metasNoRegistro("texto antigo sem metas")).toEqual([]);
  });
  it("conta os atendimentos por meta desde o início do ciclo", () => {
    const regs = [
      { data_sessao: "2026-09-20", objetivos_trabalhados: objetivosComMetas(["Ler frases curtas com apoio visual"], "") },
      { data_sessao: "2026-10-03", objetivos_trabalhados: objetivosComMetas(["Ler frases curtas com apoio visual"], "") },
      { data_sessao: "2026-10-08", objetivos_trabalhados: objetivosComMetas(["Ler frases curtas com apoio visual", "Manter a atenção por 15 minutos"], "") },
      { data_sessao: "2026-10-09", objetivos_trabalhados: "só texto" },
    ];
    const r = trabalhoPorMeta(ciclos, regs);
    expect(r.map((m) => [m.atendimentos, m.ultima])).toEqual([[2, "2026-10-08"], [1, "2026-10-08"]]);
  });
});
