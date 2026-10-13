import { describe, it, expect } from "vitest";
import { resumoPaee } from "@/lib/paee";

describe("resumo do PAEE em Evolução e dados", () => {
  it("pega o ciclo ativo e calcula a semana atual", () => {
    const r = resumoPaee([
      { status: "concluido", tipo: "planejamento_aee", criado_em: "2026-03-01" },
      { status: "ativo", tipo: "planejamento_aee", criado_em: "2026-09-01", config_ciclo: { duracao_semanas: 8, data_inicio: "2026-09-21", data_fim: "2026-11-16", foco_principal: "Leitura", frequencia: "2x por semana", metas_selecionadas: [{ id: "1", tipo: "a", descricao: "x" }, { id: "2", tipo: "a", descricao: "y", selecionada: false }] } },
    ], new Date(2026, 9, 13));
    expect(r.total).toBe(2);
    expect(r.concluidos).toBe(1);
    expect(r.atual).toMatchObject({ status: "ativo", foco: "Leitura", semanas: 8, semanaAtual: 4, metas: 1 });
  });
  it("sem ciclo ativo, mostra o rascunho; sem nada, atual é null", () => {
    expect(resumoPaee([{ status: "rascunho", tipo: "planejamento_aee" }]).atual?.status).toBe("rascunho");
    expect(resumoPaee(null)).toEqual({ total: 0, concluidos: 0, atual: null });
  });
  it("não passa da última semana", () => {
    const r = resumoPaee([{ status: "ativo", tipo: "planejamento_aee", config_ciclo: { duracao_semanas: 4, data_inicio: "2026-01-05" } }], new Date(2026, 9, 13));
    expect(r.atual?.semanaAtual).toBe(4);
  });
});
