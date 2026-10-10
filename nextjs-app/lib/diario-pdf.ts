/**
 * Relatório em PDF do diário de bordo (onda 19).
 * Gera o PDF do período escolhido: resumo (atendimentos, minutos, engajamento)
 * e a lista dos atendimentos. Não grava nada; só lê os registros recebidos.
 */
import { jsPDF } from "jspdf";

export type RegistroDiarioPdf = {
  data_sessao?: string;
  duracao_minutos?: number;
  modalidade_atendimento?: string;
  atividade_principal?: string;
  objetivos_trabalhados?: string;
  proximos_passos?: string;
  engajamento_aluno?: number;
};

export type ResumoDiarioPdf = {
  totalAtendimentos: number;
  minutosSomados: number;
  /** Média de 1 a 5; null quando nenhum atendimento tem engajamento anotado. */
  engajamentoMedio: number | null;
};

export type DadosPdfDiario = {
  estudante: string;
  /** Texto do período, ex.: "01/09/2026 a 30/09/2026" ou "Todos os atendimentos". */
  periodo: string;
  registros: RegistroDiarioPdf[];
  resumo?: ResumoDiarioPdf;
};

const MODALIDADES: Record<string, string> = {
  individual: "Individual",
  grupo: "Grupo",
  observacao_sala: "Observação em sala",
  consultoria: "Consultoria",
};

const ESQ = 15;
const LARGURA = 180;
const TOPO = 20;
const LIMITE = 277; // A4 tem 297 mm; deixa espaço para o rodapé

/** O jsPDF com helvetica aceita Latin-1: troca aspas e travessões e tira o que ficar fora. */
export function limparLatin1(texto: string | undefined | null): string {
  if (!texto) return "";
  return String(texto)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/•/g, "-")
    .replace(/[^\x00-\xFF]/g, "")
    .replace(/\r/g, "");
}

function fmtData(s: string | undefined): string {
  if (!s) return "Sem data";
  const soData = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00` : s;
  const d = new Date(soData);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("pt-BR");
}

export function calcularResumoDiario(registros: RegistroDiarioPdf[]): ResumoDiarioPdf {
  const comEngaj = registros.filter((r) => typeof r.engajamento_aluno === "number" && r.engajamento_aluno > 0);
  return {
    totalAtendimentos: registros.length,
    minutosSomados: registros.reduce((acc, r) => acc + (r.duracao_minutos || 0), 0),
    engajamentoMedio: comEngaj.length
      ? comEngaj.reduce((acc, r) => acc + (r.engajamento_aluno || 0), 0) / comEngaj.length
      : null,
  };
}

/** Monta o PDF e devolve os bytes (serve para baixar e para testar). */
export function gerarPdfDiario({ estudante, periodo, registros, resumo }: DadosPdfDiario): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const r = resumo ?? calcularResumoDiario(registros);
  let y = TOPO;

  const garantirEspaco = (altura: number) => {
    if (y + altura > LIMITE) {
      doc.addPage();
      y = TOPO;
    }
  };

  const escrever = (texto: string, tamanho = 11, estilo: "normal" | "bold" = "normal", recuo = 0) => {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tamanho);
    const linhas = doc.splitTextToSize(limparLatin1(texto), LARGURA - recuo) as string[];
    const alturaLinha = tamanho * 0.45;
    for (const linha of linhas) {
      garantirEspaco(alturaLinha);
      doc.text(linha, ESQ + recuo, y);
      y += alturaLinha;
    }
  };

  // Cabeçalho
  doc.setTextColor(20, 24, 31);
  escrever(`Diário de bordo · ${estudante || "Estudante"}`, 18, "bold");
  y += 1;
  doc.setTextColor(80, 86, 96);
  escrever(`Período: ${periodo}`, 11);
  escrever(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 9);
  y += 4;

  // Resumo
  doc.setDrawColor(210, 214, 220);
  doc.line(ESQ, y, ESQ + LARGURA, y);
  y += 7;
  doc.setTextColor(20, 24, 31);
  escrever("Resumo", 13, "bold");
  y += 1;
  escrever(`Atendimentos: ${r.totalAtendimentos}`);
  escrever(`Minutos somados: ${r.minutosSomados} (${(r.minutosSomados / 60).toFixed(1).replace(".", ",")} h)`);
  escrever(
    `Engajamento médio: ${r.engajamentoMedio === null ? "sem anotação" : `${r.engajamentoMedio.toFixed(1).replace(".", ",")} de 5`}`
  );
  y += 4;
  doc.line(ESQ, y, ESQ + LARGURA, y);
  y += 7;

  // Atendimentos
  escrever("Atendimentos", 13, "bold");
  y += 2;
  if (registros.length === 0) {
    escrever("Nenhum atendimento neste período.");
  }
  registros.forEach((reg, i) => {
    garantirEspaco(18);
    const modalidade = MODALIDADES[reg.modalidade_atendimento || ""] || reg.modalidade_atendimento || "Sem modalidade";
    const duracao = reg.duracao_minutos ? ` · ${reg.duracao_minutos} min` : "";
    doc.setTextColor(20, 24, 31);
    escrever(`${fmtData(reg.data_sessao)} · ${modalidade}${duracao}`, 11, "bold");
    doc.setTextColor(50, 56, 66);
    escrever(`O que foi feito: ${reg.atividade_principal?.trim() || "não anotado"}`, 10, "normal", 4);
    if (reg.objetivos_trabalhados?.trim()) escrever(`Objetivos: ${reg.objetivos_trabalhados.trim()}`, 10, "normal", 4);
    if (reg.proximos_passos?.trim()) escrever(`Próximos passos: ${reg.proximos_passos.trim()}`, 10, "normal", 4);
    if (i < registros.length - 1) {
      y += 2;
      garantirEspaco(4);
      doc.setDrawColor(230, 232, 236);
      doc.line(ESQ + 4, y, ESQ + LARGURA, y);
      y += 5;
    }
  });

  // Rodapé com página
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 126, 136);
    doc.text(limparLatin1(`Omnisfera · Diário de bordo · página ${p} de ${total}`), ESQ, 290);
  }

  return new Uint8Array(doc.output("arraybuffer"));
}

/** Nome do arquivo: diario-{nome}-{data}.pdf, sem acentos nem espaços. */
export function nomeArquivoPdfDiario(estudante: string, data = new Date()): string {
  const nome = (estudante || "estudante")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "estudante";
  const dia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
  return `diario-${nome}-${dia}.pdf`;
}

/** Gera e baixa o PDF no navegador. */
export function baixarPdfDiario(dados: DadosPdfDiario): void {
  const bytes = gerarPdfDiario(dados);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivoPdfDiario(dados.estudante);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
