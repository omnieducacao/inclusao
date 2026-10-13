/**
 * Onda 25 — PDFs da prova em papel.
 * - Estudante: caderno adaptado (tamanho de letra, uma questão por página, linhas para responder)
 *   e, no fim, a folha de respostas com os quatro quadrados que a leitura por foto usa.
 * - Professora: gabarito, o erro que cada alternativa revela, o que observar e as rubricas.
 */
import { jsPDF } from "jspdf";
import type { Adaptacoes, ItemProva, Prova } from "@/lib/prova";
import { FOLHA, layoutFolha } from "@/lib/prova-omr";

const MARGEM = 18;
const LARGURA = 210 - MARGEM * 2;
const TAM: Record<Adaptacoes["fonte"], number> = { normal: 12, ampliada: 16, grande: 20 };

/** Troca caracteres que a fonte padrão do PDF não tem. */
function seguro(t: string): string {
  return (t || "")
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...")
    .replace(/[^\u0000-ÿ]/g, "");
}

type Escritor = { doc: jsPDF; y: number; tam: number };

function linhaH(tam: number) { return tam * 0.42 + 1.6; }

function escrever(e: Escritor, texto: string, opts: { negrito?: boolean; tam?: number; recuo?: number; cor?: number } = {}) {
  const tam = opts.tam ?? e.tam;
  e.doc.setFont("helvetica", opts.negrito ? "bold" : "normal");
  e.doc.setFontSize(tam);
  e.doc.setTextColor(opts.cor ?? 20);
  const recuo = opts.recuo ?? 0;
  const linhas = e.doc.splitTextToSize(seguro(texto), LARGURA - recuo) as string[];
  for (const l of linhas) {
    if (e.y + linhaH(tam) > 297 - MARGEM) { e.doc.addPage(); e.y = MARGEM; }
    e.doc.text(l, MARGEM + recuo, e.y);
    e.y += linhaH(tam);
  }
}

function cabecalho(e: Escritor, titulo: string, sub: string) {
  escrever(e, titulo, { negrito: true, tam: Math.max(14, e.tam + 2) });
  escrever(e, sub, { tam: Math.max(10, e.tam - 2), cor: 80 });
  e.y += 2;
  e.doc.setDrawColor(180); e.doc.line(MARGEM, e.y, 210 - MARGEM, e.y);
  e.y += 6;
}

function rotuloItem(i: number) { return `Questão ${i + 1}`; }

export function pdfEstudante(prova: Prova, nomeEstudante: string): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const tam = TAM[prova.adaptacoes.fonte] || 12;
  const e: Escritor = { doc, y: MARGEM + 4, tam };
  cabecalho(e, `${prova.disciplina}`, `${nomeEstudante} · ${prova.ano_referencia || ""} · código ${prova.codigo_curto}`);
  escrever(e, "Leia com calma. Se precisar, peça ajuda à professora. Responda na folha de respostas, no final.", { tam: Math.max(11, tam - 1), cor: 60 });
  e.y += 4;

  prova.itens.forEach((item, i) => {
    if (i > 0) {
      if (prova.adaptacoes.umaPorPagina) { doc.addPage(); e.y = MARGEM + 4; }
      else e.y += tam * 0.5;
    }
    escrever(e, rotuloItem(i), { negrito: true });
    if (item.texto_base) {
      const alturaLetra = tam * 0.3528; // pt → mm
      e.y += 2;
      const topo = e.y - alturaLetra * 0.85 - 2;
      escrever(e, item.texto_base, { recuo: 4 });
      const base = e.y - linhaH(tam) + 2.5;
      doc.setDrawColor(200); doc.rect(MARGEM, topo, LARGURA, base - topo, "S");
      e.y = base + alturaLetra * 0.85 + 3;
    }
    escrever(e, item.enunciado);
    if (item.tipo === "objetiva") {
      e.y += 1;
      for (const a of item.alternativas || []) escrever(e, `(${a.letra}) ${a.texto}`, { recuo: 4 });
    } else if (item.tipo === "aberta") {
      e.y += 2;
      for (let k = 0; k < (prova.adaptacoes.linhasResposta || 5); k++) {
        if (e.y + tam * 0.7 > 297 - MARGEM) { doc.addPage(); e.y = MARGEM; }
        e.y += tam * 0.62;
        doc.setDrawColor(190); doc.line(MARGEM, e.y, 210 - MARGEM, e.y);
      }
      e.y += 3;
    } else {
      escrever(e, "A professora vai acompanhar você nesta atividade.", { tam: Math.max(10, tam - 2), cor: 90 });
    }
  });

  folhaDeRespostas(doc, prova, nomeEstudante);
  return doc;
}

/** A folha que a professora pinta e fotografa. Desenhada com o mesmo layout que a leitura usa. */
export function folhaDeRespostas(doc: jsPDF, prova: Prova, nomeEstudante: string) {
  doc.addPage();
  doc.setFillColor(0, 0, 0);
  const m = FOLHA.marcador;
  for (const [cx, cy] of FOLHA.centros) doc.rect(cx - m / 2, cy - m / 2, m, m, "F");

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold"); doc.setFontSize(14);
  doc.text(seguro(`Folha de respostas · ${prova.disciplina}`), 28, 28);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(seguro(`${nomeEstudante} · código ${prova.codigo_curto}`), 28, 35);
  doc.setFontSize(8.5); doc.setTextColor(70);
  doc.text(seguro("Pinte a bolinha inteira. Nas questões abertas, a professora pinta o nível (0 a 4) pela rubrica do guia."), 28, 42);
  doc.text(seguro("Apoio dado: a professora pinta se precisou ajudar (leve: uma pista; total: fez junto)."), 28, 47);

  doc.setFontSize(9); doc.setTextColor(40); doc.setFont("helvetica", "bold");
  doc.text("Resposta", FOLHA.xOpcoes[0] - 3, FOLHA.topoItens - 9);
  doc.text("Apoio dado (professora)", FOLHA.xApoio[0] - 3, FOLHA.topoItens - 9);

  doc.setDrawColor(60); doc.setLineWidth(0.25);
  for (const linha of layoutFolha(prova.itens)) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(20);
    doc.text(String(linha.numero), 24, linha.y + 1.3, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(90);
    if (linha.tipo !== "objetiva") doc.text("nível", FOLHA.xOpcoes[0] - 10, linha.y + 1);
    for (const b of [...linha.opcoes, ...linha.apoio]) {
      doc.circle(b.x, b.y, FOLHA.raio, "S");
      doc.text(b.valor, b.x, b.y - FOLHA.raio - 0.8, { align: "center" });
    }
  }
}

export function pdfProfessora(prova: Prova, nomeEstudante: string, descritores: Array<{ codigo: string; descritor: string }>): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const e: Escritor = { doc, y: MARGEM + 4, tam: 10.5 };
  cabecalho(e, `Guia da professora · ${prova.disciplina}`, `${nomeEstudante} · ${prova.ano_referencia || ""} · código ${prova.codigo_curto} · não entregue ao estudante`);
  escrever(e, "Como aplicar: a questão 1 de cada descritor já traz apoio; a 2 é sem apoio. Se precisar ajudar, pinte o apoio dado na folha de respostas (leve: uma pista ou releitura; total: fez junto). O nível sugerido depende do acerto e do apoio; você confirma no sistema.", { cor: 60 });
  e.y += 3;

  let n = 0;
  for (const d of descritores) {
    const itens = prova.itens.filter((i) => i.codigo === d.codigo);
    if (!itens.length) continue;
    e.y += 2;
    escrever(e, `${d.codigo} · ${d.descritor}`, { negrito: true, tam: 11 });
    for (const item of itens) {
      n = prova.itens.indexOf(item);
      const certa = item.alternativas?.find((a) => a.letra === item.gabarito)?.texto;
      escrever(e, `${rotuloItem(n)} (${item.ordem === 1 ? "com apoio" : "sem apoio"}) · ${item.tipo === "objetiva" ? `gabarito ${item.gabarito}${certa ? ` (${certa})` : ""}` : item.tipo === "aberta" ? "aberta" : "observação"}`, { negrito: true, recuo: 3 });
      escrever(e, item.enunciado, { recuo: 6, cor: 40 });
      if (item.tipo === "objetiva") {
        for (const a of item.alternativas || []) {
          if (a.letra !== item.gabarito && a.erro) escrever(e, `${a.letra}: ${a.erro}`, { recuo: 6, cor: 70 });
        }
      } else {
        for (const r of item.rubrica || []) escrever(e, `Nível ${r.nivel}: ${r.criterio}`, { recuo: 6, cor: 50 });
      }
      if (item.observar) escrever(e, `Observar: ${item.observar}`, { recuo: 6, cor: 70 });
    }
  }
  return doc;
}

export function nomeArquivo(prova: Prova, nomeEstudante: string, parte: "estudante" | "professora"): string {
  const base = `${prova.disciplina}-${nomeEstudante}-${prova.codigo_curto}-${parte}`
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
  return `${base}.pdf`;
}

export type { ItemProva };
