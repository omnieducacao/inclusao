/**
 * Exportação PDF oficial do PEI
 * Compatível com Streamlit (gerar_pdf_final)
 */

import type { PEIData } from "./pei";
// jsPDF precisa ser importado dinamicamente para funcionar no servidor
let jsPDFClass: typeof import("jspdf").jsPDF | null = null;

async function getJsPDF() {
  if (!jsPDFClass) {
    const jsPDFModule = await import("jspdf");
    jsPDFClass = jsPDFModule.jsPDF;
  }
  return jsPDFClass;
}

// Constantes de layout (em mm, A4)
const PDF_LEFT = 15;
const PDF_RIGHT = 15;
const PDF_TOP = 20;
const PDF_BOTTOM = 22;
const PDF_PAGE_WIDTH = 210;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_LEFT - PDF_RIGHT; // 180mm

function limparTexto(texto: string | undefined | null): string {
  if (!texto) return "";
  return String(texto)
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/#/g, "")
    .replace(/•/g, "-")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[\u007F-\uFFFF]/g, (c) => (/[\u00C0-\u024F]/.test(c) ? c : "?"));
}

function formatarData(val: string | Date | undefined): string {
  if (!val) return "—";
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("pt-BR");
  }
  return (val as Date).toLocaleDateString?.("pt-BR") ?? String(val);
}

/**
 * Gera PDF completo do PEI com todas as seções - Documento Oficial
 */
export async function gerarPdfPei(dados: PEIData): Promise<Uint8Array> {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = PDF_TOP;

  // Função auxiliar para adicionar header em cada página
  const addHeader = () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, PDF_PAGE_WIDTH, 42, "F");
    
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("PEI - PLANO DE ENSINO INDIVIDUALIZADO", PDF_LEFT, 22);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Documento de Planejamento e Flexibilização Curricular", PDF_LEFT, 28);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(PDF_LEFT, 42, PDF_PAGE_WIDTH - PDF_RIGHT, 42);
    
    y = 50; // Reset Y após header
  };

  // Função auxiliar para adicionar título de seção
  const addSectionTitle = (title: string) => {
    if (y > 250) {
      doc.addPage();
      addHeader();
    }
    
    doc.setFillColor(241, 245, 249);
    doc.rect(PDF_LEFT, y, PDF_CONTENT_WIDTH, 10, "F");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), PDF_LEFT + 4, y + 7);
    
    y += 16;
  };

  // Função auxiliar para adicionar linha com label e valor
  const addLine = (label: string, value: string, boldLabel = true) => {
    if (y > 270) {
      doc.addPage();
      addHeader();
    }
    
    if (boldLabel) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(label, PDF_LEFT, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont("helvetica", "normal");
      doc.text(value, PDF_LEFT + labelWidth + 2, y);
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(value, PDF_LEFT, y);
    }
    y += 6;
  };

  // Função auxiliar para adicionar texto multi-linha
  const addMultiline = (text: string, bold = false) => {
    const lines = doc.splitTextToSize(limparTexto(text), PDF_CONTENT_WIDTH);
    doc.setFontSize(10);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        addHeader();
      }
      doc.text(line, PDF_LEFT, y);
      y += 6;
    }
  };

  // Função auxiliar para adicionar item com bullet
  const addBulletItem = (text: string, bulletType: "dot" | "check" = "dot") => {
    if (y > 270) {
      doc.addPage();
      addHeader();
    }
    const bullet = bulletType === "check" ? "✓" : "•";
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(bullet, PDF_LEFT, y);
    const lines = doc.splitTextToSize(limparTexto(text), PDF_CONTENT_WIDTH - 6);
    doc.text(lines[0], PDF_LEFT + 6, y);
    y += 6;
    for (let i = 1; i < lines.length; i++) {
      if (y > 270) {
        doc.addPage();
        addHeader();
      }
      doc.text(lines[i], PDF_LEFT + 6, y);
      y += 6;
    }
    y += 1;
  };

  // Header inicial
  addHeader();

  // ======================================================================
  // 1. IDENTIFICAÇÃO E CONTEXTO
  // ======================================================================
  addSectionTitle("1. IDENTIFICAÇÃO E CONTEXTO");
  
  addLine("Estudante:", limparTexto(dados.nome) || "—");
  addLine("Data de Nascimento:", formatarData(dados.nasc as string));
  addLine("Série/Ano:", limparTexto(dados.serie) || "—");
  addLine("Turma:", limparTexto(dados.turma) || "—");
  addLine("Matrícula/RA:", limparTexto(dados.matricula || (dados as { ra?: string }).ra) || "—");
  y += 3;

  if (limparTexto(dados.historico)) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico Escolar:", PDF_LEFT, y);
    y += 6;
    addMultiline(dados.historico as string);
    y += 2;
  }

  if (limparTexto(dados.familia)) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Dinâmica Familiar:", PDF_LEFT, y);
    y += 6;
    addMultiline(dados.familia as string);
    y += 2;
  }

  const compFam = (dados.composicao_familiar_tags || []).filter(Boolean) as string[];
  if (compFam.length) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Composição Familiar:", PDF_LEFT, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(compFam.join(", "), PDF_LEFT, y);
    y += 8;
  }

  // ======================================================================
  // 2. DIAGNÓSTICO E CONTEXTO CLÍNICO
  // ======================================================================
  doc.addPage();
  addHeader();
  addSectionTitle("2. DIAGNÓSTICO E CONTEXTO CLÍNICO");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Diagnóstico:", PDF_LEFT, y);
  y += 6;
  addMultiline(dados.diagnostico as string);
  y += 3;

  const meds = dados.lista_medicamentos || [];
  if (meds.length) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Medicações em Uso:", PDF_LEFT, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    meds.forEach((m) => {
      const escola = m.escola ? " (Administração na escola)" : "";
      const texto = `- ${limparTexto(m.nome)} - ${limparTexto(m.posologia)}${escola}`;
      addMultiline(texto);
    });
    y += 2;
  }

  // ======================================================================
  // 3. POTENCIALIDADES E INTERESSES
  // ======================================================================
  const potencias = (dados.potencias || []).filter(Boolean) as string[];
  const hiperfoco = limparTexto(dados.hiperfoco);
  
  if (potencias.length || hiperfoco) {
    doc.addPage();
    addHeader();
    addSectionTitle("3. POTENCIALIDADES E INTERESSES");

    if (hiperfoco) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Hiperfoco/Interesse Principal:", PDF_LEFT, y);
      y += 6;
      addMultiline(hiperfoco);
      y += 2;
    }

    if (potencias.length) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Potencialidades:", PDF_LEFT, y);
      y += 6;
      potencias.forEach((p) => addBulletItem(p, "dot"));
      y += 2;
    }
  }

  // ======================================================================
  // 4. REDE DE APOIO E ORIENTAÇÕES
  // ======================================================================
  const rede = (dados.rede_apoio || []).filter(Boolean) as string[];
  const orientacoes = limparTexto(dados.orientacoes_especialistas);
  const orientacoesPorProf = dados.orientacoes_por_profissional || {};

  if (rede.length || orientacoes || Object.keys(orientacoesPorProf).length) {
    doc.addPage();
    addHeader();
    addSectionTitle("4. REDE DE APOIO E ORIENTAÇÕES");

    if (rede.length) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Profissionais da Rede:", PDF_LEFT, y);
      y += 6;
      rede.forEach((r) => addBulletItem(r, "dot"));
      y += 2;
    }

    if (orientacoes) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Orientações Gerais dos Especialistas:", PDF_LEFT, y);
      y += 6;
      addMultiline(orientacoes);
      y += 2;
    }

    Object.entries(orientacoesPorProf).forEach(([prof, txt]) => {
      if (limparTexto(txt as string)) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Orientações - ${prof}:`, PDF_LEFT, y);
        y += 6;
        addMultiline(txt as string);
        y += 2;
      }
    });
  }

  // ======================================================================
  // 5. MAPEAMENTO DE BARREIRAS E NÍVEIS DE SUPORTE
  // ======================================================================
  const barreiras = dados.barreiras_selecionadas || {};
  const niveis = dados.niveis_suporte || {};
  const temBarreiras = Object.values(barreiras).some((itens) => Array.isArray(itens) && itens.length > 0);

  if (temBarreiras) {
    doc.addPage();
    addHeader();
    addSectionTitle("5. MAPEAMENTO DE BARREIRAS E NÍVEIS DE SUPORTE");

    Object.entries(barreiras).forEach(([area, itens]) => {
      if (Array.isArray(itens) && itens.length) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 51, 102);
        doc.text(limparTexto(area), PDF_LEFT, y);
        doc.setTextColor(0, 0, 0);
        y += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        itens.forEach((item: string) => {
          const nivel = niveis[item] || niveis[`${area}_${item}`] || "Monitorado";
          addBulletItem(`${limparTexto(item)} (Nível de Suporte: ${nivel})`, "check");
        });
        y += 2;
      }
    });
  }

  // ======================================================================
  // 6. PLANO DE AÇÃO - ESTRATÉGIAS
  // ======================================================================
  const estAcesso = (dados.estrategias_acesso || []).filter(Boolean) as string[];
  const estEnsino = (dados.estrategias_ensino || []).filter(Boolean) as string[];
  const estAval = (dados.estrategias_avaliacao || []).filter(Boolean) as string[];
  const outrosAcesso = limparTexto(dados.outros_acesso);
  const outrosEnsino = limparTexto(dados.outros_ensino);

  if (estAcesso.length || estEnsino.length || estAval.length || outrosAcesso || outrosEnsino) {
    doc.addPage();
    addHeader();
    addSectionTitle("6. PLANO DE AÇÃO - ESTRATÉGIAS");

    if (estAcesso.length) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Estratégias de Acesso:", PDF_LEFT, y);
      y += 6;
      estAcesso.forEach((e) => addBulletItem(e, "dot"));
      y += 2;
    }

    if (outrosAcesso) {
      addMultiline(outrosAcesso);
      y += 2;
    }

    if (estEnsino.length) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Estratégias de Ensino:", PDF_LEFT, y);
      y += 6;
      estEnsino.forEach((e) => addBulletItem(e, "dot"));
      y += 2;
    }

    if (outrosEnsino) {
      addMultiline(outrosEnsino);
      y += 2;
    }

    if (estAval.length) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Estratégias de Avaliação:", PDF_LEFT, y);
      y += 6;
      estAval.forEach((e) => addBulletItem(e, "dot"));
    }
  }

  // ======================================================================
  // 7. PLANEJAMENTO PEDAGÓGICO DETALHADO
  // ======================================================================
  if (limparTexto(dados.ia_sugestao)) {
    doc.addPage();
    addHeader();
    addSectionTitle("7. PLANEJAMENTO PEDAGÓGICO DETALHADO");

    const motor = dados.consultoria_engine || "red";
    const motorNome: Record<string, string> = {
      red: "OmniRed (DeepSeek)",
      blue: "OmniBlue (Kimi)",
      green: "OmniGreen (Claude)",
      yellow: "OmniYellow (Gemini)",
      orange: "OmniOrange (OpenAI)",
    };

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gerado por ${motorNome[motor] || motor}. Input: série, diagnóstico e barreiras mapeadas; cruzei com BNCC + DUA.`,
      PDF_LEFT,
      y
    );
    doc.setTextColor(0, 0, 0);
    y += 8;

    // Processar texto da IA (remover markdown, formatar títulos e listas)
    const textoIa = limparTexto(dados.ia_sugestao).replace(/\[.*?\]/g, "");
    const linhas = textoIa.split("\n");

    for (const linha of linhas) {
      const l = linha.trim();
      if (!l) continue;

      if (y > 270) {
        doc.addPage();
        addHeader();
      }

      if (l.startsWith("###") || l.startsWith("##")) {
        y += 5;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 51, 102);
        const titulo = limparTexto(l.replace(/#/g, "").trim());
        doc.text(titulo, PDF_LEFT, y);
        doc.setTextColor(0, 0, 0);
        y += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
      } else if (l.startsWith("-") || l.startsWith("*")) {
        const texto = limparTexto(l.replace(/[-*]/g, "").trim());
        addBulletItem(texto, "dot");
      } else {
        addMultiline(l);
      }
    }
  }

  // ======================================================================
  // 8. MONITORAMENTO E ACOMPANHAMENTO
  // ======================================================================
  const monitoramentoData = dados.monitoramento_data;
  const statusMeta = limparTexto(dados.status_meta);
  const parecerGeral = limparTexto(dados.parecer_geral);
  const proximosPassos = (dados.proximos_passos_select || []).filter(Boolean) as string[];

  if (monitoramentoData || statusMeta || parecerGeral || proximosPassos.length) {
    doc.addPage();
    addHeader();
    addSectionTitle("8. MONITORAMENTO E ACOMPANHAMENTO");

    if (monitoramentoData) {
      addLine("Data do Monitoramento:", formatarData(monitoramentoData as string));
      y += 2;
    }

    if (statusMeta) {
      addLine("Status da Meta:", statusMeta);
      y += 2;
    }

    if (parecerGeral) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Parecer Geral:", PDF_LEFT, y);
      y += 6;
      addMultiline(parecerGeral);
      y += 2;
    }

    if (proximosPassos.length) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Próximos Passos:", PDF_LEFT, y);
      y += 6;
      proximosPassos.forEach((p) => addBulletItem(p, "dot"));
    }
  }

  // Adicionar footer em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} | Gerado via Omnisfera`, PDF_PAGE_WIDTH / 2, PDF_PAGE_WIDTH - PDF_BOTTOM, { align: "center" });
  }

  // Retornar como Uint8Array para compatibilidade
  return new Uint8Array(doc.output("arraybuffer"));
}
