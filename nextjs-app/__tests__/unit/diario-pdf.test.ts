import { describe, it, expect } from "vitest";
import { gerarPdfDiario, calcularResumoDiario, nomeArquivoPdfDiario } from "@/lib/diario-pdf";

const registros = [
  {
    data_sessao: "2026-09-02",
    duracao_minutos: 45,
    modalidade_atendimento: "individual",
    atividade_principal: "Jogo de memória com sílabas — leitura compartilhada",
    objetivos_trabalhados: "Atenção e consciência fonológica",
    proximos_passos: "Repetir com palavras de três sílabas",
    engajamento_aluno: 4,
  },
  {
    data_sessao: "2026-09-09",
    duracao_minutos: 30,
    modalidade_atendimento: "grupo",
    atividade_principal: "Roda de conversa sobre a rotina 🙂",
    engajamento_aluno: 3,
  },
];

describe("diario-pdf", () => {
  it("gera um PDF com mais de 1000 bytes", () => {
    const bytes = gerarPdfDiario({
      estudante: "João da Silva",
      periodo: "01/09/2026 a 30/09/2026",
      registros,
      resumo: calcularResumoDiario(registros),
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.byteLength).toBeGreaterThan(1000);
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe("%PDF-");
  });

  it("calcula o resumo e o nome do arquivo", () => {
    expect(calcularResumoDiario(registros)).toEqual({ totalAtendimentos: 2, minutosSomados: 75, engajamentoMedio: 3.5 });
    expect(nomeArquivoPdfDiario("João da Silva", new Date(2026, 9, 9))).toBe("diario-joao-da-silva-2026-10-09.pdf");
  });
});
