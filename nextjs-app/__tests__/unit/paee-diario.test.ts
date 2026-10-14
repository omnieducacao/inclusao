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

describe("Ciclo em andamento pelo planejamento_ativo", () => {
  const salvos = [
    { ciclo_id: "a", status: "rascunho", criado_em: "2026-09-01", config_ciclo: { data_inicio: "2026-09-01", metas_selecionadas: [{ id: "x", tipo: "t", descricao: "Meta A" }] } },
    { ciclo_id: "b", status: "rascunho", criado_em: "2026-10-01", config_ciclo: { metas_selecionadas: [{ id: "y", tipo: "t", descricao: "Meta B" }] } },
    { ciclo_id: "c", status: "concluido", config_ciclo: { metas_selecionadas: [{ id: "z", tipo: "t", descricao: "Meta C" }] } },
  ];
  it("o id marcado como atual vale, mesmo com status interno rascunho", async () => {
    const { cicloAtivo, resumoPaee } = await import("@/lib/paee");
    expect(cicloAtivo(salvos, "a")?.ciclo_id).toBe("a");
    expect(metasDoCicloAtivo(salvos, "b").map((m) => m.descricao)).toEqual(["Meta B"]);
    expect(resumoPaee(salvos, new Date(2026, 9, 14), "a").atual?.status).toBe("ativo");
  });
  it("sem id, rascunho não conta como em andamento; concluído também não", async () => {
    const { cicloAtivo } = await import("@/lib/paee");
    expect(cicloAtivo(salvos, null)).toBeNull();
    expect(cicloAtivo(salvos, "c")).toBeNull();
  });
});

describe("Metas de ciclos antigos", () => {
  it("tira o negrito do markdown e descarta títulos de seção", () => {
    const antigos = [{ ciclo_id: "v", status: "rascunho", config_ciclo: { metas_selecionadas: [
      { id: "1", tipo: "G", descricao: "**Linguagens**:" },
      { id: "2", tipo: "G", descricao: "**Foco do ano atual**: Fortalecer a comunicação" },
      { id: "3", tipo: "G", descricao: "Criação de ambientes previsíveis." },
    ] } }];
    expect(metasDoCicloAtivo(antigos, "v").map((m) => m.descricao)).toEqual(["Foco do ano atual: Fortalecer a comunicação", "Criação de ambientes previsíveis."]);
  });
});

describe("Ciclo vencido e frequência", () => {
  it("marca o ciclo cujo período já terminou e escreve a frequência por extenso", async () => {
    const { resumoPaee, rotuloFrequencia } = await import("@/lib/paee");
    const c = [{ ciclo_id: "a", status: "rascunho", config_ciclo: { data_inicio: "2026-01-28", data_fim: "2026-04-22", frequencia: "2x_semana" } }];
    expect(resumoPaee(c, new Date(2026, 9, 14), "a").atual?.encerrado).toBe(true);
    expect(resumoPaee(c, new Date(2026, 3, 1), "a").atual?.encerrado).toBe(false);
    expect(rotuloFrequencia("2x_semana")).toBe("2 vezes por semana");
    expect(rotuloFrequencia("Semanal")).toBe("Semanal");
  });
});
