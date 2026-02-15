/**
 * Exportação PDF oficial do PEI
 * Documento completo com todas as seções do PEI Omnisfera
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
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "--")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x00-\xFF\n]/g, "");
}

function formatarData(val: string | Date | undefined): string {
  if (!val) return "--";
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("pt-BR");
  }
  return (val as Date).toLocaleDateString?.("pt-BR") ?? String(val);
}

// Mapa de labels para detalhes do diagnóstico
const LABEL_DETALHES: Record<string, string> = {
  tea_nivel_suporte: "Nivel de Suporte (DSM-5)",
  tea_comunicacao: "Comunicacao",
  tea_sensibilidades: "Sensibilidades Sensoriais",
  tea_rigidez: "Rigidez Comportamental",
  tdah_tipo: "Tipo de TDAH",
  tdah_medicacao: "Manejo Medicamentoso",
  tdah_momento_critico: "Momento Critico do Dia",
  tdah_estrategia_foco: "Estrategia de Foco",
  dislexia_tipo: "Tipo de Dislexia",
  dislexia_nivel_leitura: "Nivel de Leitura",
  dislexia_recursos: "Recursos Preferenciais",
  di_nivel: "Nivel de DI",
  di_autonomia_avds: "Autonomia em AVDs",
  di_comunicacao_funcional: "Comunicacao Funcional",
  df_tipo: "Tipo de Deficiencia Fisica",
  df_mobilidade: "Mobilidade",
  df_motricidade_fina: "Motricidade Fina",
  df_acessibilidade: "Acessibilidade Necessaria",
  da_tipo_perda: "Tipo de Perda Auditiva",
  da_recurso: "Recurso Auditivo",
  da_comunicacao: "Forma de Comunicacao",
  da_interprete_libras: "Interprete de Libras",
  dv_tipo: "Tipo de Deficiencia Visual",
  dv_recursos: "Recursos Visuais",
  ahsd_area_destaque: "Area de Destaque",
  ahsd_enriquecimento: "Enriquecimento Curricular",
  ahsd_desafios: "Desafios",
};

/**
 * Gera PDF completo do PEI com todas as seções - Documento Oficial
 */
export async function gerarPdfPei(dados: PEIData): Promise<Uint8Array> {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = PDF_TOP;

  // Função auxiliar para adicionar header em cada página
  const addHeader = () => {
    // Faixa superior com gradiente simulado
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, PDF_PAGE_WIDTH, 14, "F");
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 14, PDF_PAGE_WIDTH, 30, "F");

    // Título na faixa escura
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("OMNISFERA", PDF_LEFT, 9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Plataforma de Inclusao Educacional", PDF_LEFT + 30, 9);

    // Título do documento
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("PEI - PLANO DE ENSINO INDIVIDUALIZADO", PDF_LEFT, 26);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Documento de Planejamento e Flexibilizacao Curricular", PDF_LEFT, 32);

    // Data de emissão
    const dataEmissao = new Date().toLocaleDateString("pt-BR");
    doc.text(`Emitido em: ${dataEmissao}`, PDF_PAGE_WIDTH - PDF_RIGHT, 32, { align: "right" });

    // Linha separadora
    doc.setDrawColor(59, 130, 246); // blue-500
    doc.setLineWidth(0.5);
    doc.line(PDF_LEFT, 44, PDF_PAGE_WIDTH - PDF_RIGHT, 44);

    y = 52;
  };

  // Função auxiliar para adicionar título de seção
  const addSectionTitle = (title: string, icon?: string) => {
    if (y > 245) {
      doc.addPage();
      addHeader();
    }

    // Background azul escuro para título
    doc.setFillColor(30, 58, 138); // blue-900
    doc.roundedRect(PDF_LEFT, y, PDF_CONTENT_WIDTH, 10, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    const displayTitle = icon ? `${icon}  ${title.toUpperCase()}` : title.toUpperCase();
    doc.text(limparTexto(displayTitle), PDF_LEFT + 4, y + 7);

    doc.setTextColor(0, 0, 0);
    y += 16;
  };

  // Função auxiliar para adicionar subtítulo
  const addSubtitle = (title: string) => {
    if (y > 260) {
      doc.addPage();
      addHeader();
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text(limparTexto(title), PDF_LEFT, y);
    doc.setTextColor(0, 0, 0);
    y += 7;
  };

  // Função auxiliar para adicionar linha com label e valor
  const addLine = (label: string, value: string) => {
    if (y > 270) {
      doc.addPage();
      addHeader();
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(label, PDF_LEFT, y);
    const labelWidth = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(limparTexto(value), PDF_LEFT + labelWidth + 2, y);
    doc.setTextColor(0, 0, 0);
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
      y += 5.5;
    }
  };

  // Função auxiliar para adicionar item com bullet
  const addBulletItem = (text: string, bulletType: "dot" | "check" = "dot") => {
    if (y > 270) {
      doc.addPage();
      addHeader();
    }
    const bullet = bulletType === "check" ? "[X]" : "-";
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(bullet, PDF_LEFT + 2, y);
    const lines = doc.splitTextToSize(limparTexto(text), PDF_CONTENT_WIDTH - 10);
    doc.text(lines[0], PDF_LEFT + 10, y);
    y += 5.5;
    for (let i = 1; i < lines.length; i++) {
      if (y > 270) {
        doc.addPage();
        addHeader();
      }
      doc.text(lines[i], PDF_LEFT + 10, y);
      y += 5.5;
    }
    y += 0.5;
  };

  // Função auxiliar para adicionar box informativo
  const addInfoBox = (label: string, value: string, bgColor: [number, number, number] = [241, 245, 249]) => {
    if (y > 260) {
      doc.addPage();
      addHeader();
    }
    doc.setFillColor(...bgColor);
    doc.roundedRect(PDF_LEFT, y, PDF_CONTENT_WIDTH, 10, 1.5, 1.5, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(label, PDF_LEFT + 3, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const labelW = doc.getTextWidth(label);
    doc.text(limparTexto(value), PDF_LEFT + labelW + 5, y + 4);
    doc.setTextColor(0, 0, 0);
    y += 13;
  };

  // Separador visual
  const addSpacer = (size = 4) => { y += size; };

  // ======================================================================
  // Header inicial
  // ======================================================================
  addHeader();

  // ======================================================================
  // 1. IDENTIFICAÇÃO E CONTEXTO
  // ======================================================================
  addSectionTitle("1. IDENTIFICACAO E CONTEXTO");

  addLine("Estudante:", dados.nome || "--");
  addLine("Data de Nascimento:", formatarData(dados.nasc as string));
  addLine("Serie/Ano:", dados.serie || "--");
  addLine("Turma:", dados.turma || "--");
  addLine("Matricula/RA:", dados.matricula || (dados as { ra?: string }).ra || "--");

  // Nível de alfabetização
  if (dados.nivel_alfabetizacao && dados.nivel_alfabetizacao !== "Nao se aplica (Educacao Infantil)") {
    addLine("Nivel de Alfabetizacao:", dados.nivel_alfabetizacao);
  }

  addSpacer(3);

  if (limparTexto(dados.historico)) {
    addSubtitle("Historico Escolar");
    addMultiline(dados.historico as string);
    addSpacer(3);
  }

  if (limparTexto(dados.familia)) {
    addSubtitle("Dinamica Familiar");
    addMultiline(dados.familia as string);
    addSpacer(3);
  }

  const compFam = (dados.composicao_familiar_tags || []).filter(Boolean) as string[];
  if (compFam.length) {
    addLine("Composicao Familiar:", compFam.join(", "));
    addSpacer(3);
  }

  // ======================================================================
  // 2. DIAGNÓSTICO E CONTEXTO CLÍNICO
  // ======================================================================
  addSpacer(6);
  addSectionTitle("2. DIAGNOSTICO E CONTEXTO CLINICO");

  addSubtitle("Diagnostico");
  addMultiline(dados.diagnostico as string || "--");
  addSpacer(3);

  // Detalhes condicionais do diagnóstico (TEA, TDAH, etc.)
  const detalhesDiag = (dados.detalhes_diagnostico || {}) as Record<string, string | string[]>;
  const detalhesFiltrados = Object.entries(detalhesDiag).filter(
    ([, v]) => v && (typeof v === "string" ? v.trim() : (v as string[]).length > 0)
  );

  if (detalhesFiltrados.length) {
    addSubtitle("Detalhamento Clinico");
    for (const [key, val] of detalhesFiltrados) {
      const label = LABEL_DETALHES[key] || key.replace(/_/g, " ");
      const value = Array.isArray(val) ? val.join(", ") : val;
      addLine(`${label}:`, value);
    }
    addSpacer(3);
  }

  // Medicações
  const meds = dados.lista_medicamentos || [];
  if (meds.length) {
    addSubtitle("Medicacoes em Uso");
    meds.forEach((m) => {
      const escola = m.escola ? " (Administracao na escola)" : "";
      addBulletItem(`${limparTexto(m.nome)} - ${limparTexto(m.posologia)}${escola}`, "dot");
    });
    addSpacer(2);
  }

  // Checklist de Evidências
  const evidencias = dados.checklist_evidencias || {};
  const evidSelected = Object.entries(evidencias).filter(([, v]) => v);
  if (evidSelected.length) {
    addSubtitle("Evidencias Observadas");
    evidSelected.forEach(([k]) => {
      addBulletItem(k.replace("?", ""), "check");
    });
    addSpacer(2);
  }

  // ======================================================================
  // 3. POTENCIALIDADES E INTERESSES
  // ======================================================================
  const potencias = (dados.potencias || []).filter(Boolean) as string[];
  const hiperfoco = limparTexto(dados.hiperfoco);

  if (potencias.length || hiperfoco) {
    addSpacer(6);
    addSectionTitle("3. POTENCIALIDADES E INTERESSES");

    if (hiperfoco) {
      addInfoBox("Hiperfoco / Interesse Principal:", hiperfoco, [219, 234, 254]); // blue-100
    }

    if (potencias.length) {
      addSubtitle("Potencialidades Identificadas");
      potencias.forEach((p) => addBulletItem(p, "check"));
      addSpacer(2);
    }
  }

  // ======================================================================
  // 4. REDE DE APOIO E ORIENTAÇÕES
  // ======================================================================
  const rede = (dados.rede_apoio || []).filter(Boolean) as string[];
  const orientacoes = limparTexto(dados.orientacoes_especialistas);
  const orientacoesPorProf = dados.orientacoes_por_profissional || {};

  if (rede.length || orientacoes || Object.keys(orientacoesPorProf).length) {
    addSpacer(6);
    addSectionTitle("4. REDE DE APOIO E ORIENTACOES");

    if (rede.length) {
      addSubtitle("Profissionais da Rede");
      rede.forEach((r) => addBulletItem(r, "dot"));
      addSpacer(3);
    }

    if (orientacoes) {
      addSubtitle("Orientacoes Gerais dos Especialistas");
      addMultiline(orientacoes);
      addSpacer(3);
    }

    Object.entries(orientacoesPorProf).forEach(([prof, txt]) => {
      if (limparTexto(txt as string)) {
        addSubtitle(`Orientacoes - ${prof}`);
        addMultiline(txt as string);
        addSpacer(2);
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
    addSpacer(6);
    addSectionTitle("5. MAPEAMENTO DE BARREIRAS E NIVEIS DE SUPORTE");

    Object.entries(barreiras).forEach(([area, itens]) => {
      if (Array.isArray(itens) && itens.length) {
        if (y > 250) {
          doc.addPage();
          addHeader();
        }
        addSubtitle(area);
        itens.forEach((item: string) => {
          const nivel = niveis[item] || niveis[`${area}_${item}`] || "Monitorado";
          addBulletItem(`${limparTexto(item)} -- Nivel de Suporte: ${nivel}`, "check");
        });
        addSpacer(3);
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
    addSpacer(6);
    addSectionTitle("6. PLANO DE ACAO - ESTRATEGIAS");

    if (estAcesso.length) {
      addSubtitle("Estrategias de Acesso");
      estAcesso.forEach((e) => addBulletItem(e, "dot"));
      if (outrosAcesso) {
        addMultiline(`Outras: ${outrosAcesso}`);
      }
      addSpacer(3);
    }

    if (estEnsino.length) {
      addSubtitle("Estrategias de Ensino");
      estEnsino.forEach((e) => addBulletItem(e, "dot"));
      if (outrosEnsino) {
        addMultiline(`Outras: ${outrosEnsino}`);
      }
      addSpacer(3);
    }

    if (estAval.length) {
      addSubtitle("Estrategias de Avaliacao");
      estAval.forEach((e) => addBulletItem(e, "dot"));
    }
  }

  // ======================================================================
  // 7. HABILIDADES BNCC SELECIONADAS
  // ======================================================================
  const habBncc = dados.habilidades_bncc_validadas || dados.habilidades_bncc_selecionadas || [];
  const bnccEI = dados.bncc_ei_objetivos || [];

  if ((Array.isArray(habBncc) && habBncc.length) || (Array.isArray(bnccEI) && bnccEI.length)) {
    addSpacer(6);
    addSectionTitle("7. HABILIDADES BNCC SELECIONADAS");

    if (dados.bncc_ei_idade || dados.bncc_ei_campo) {
      addInfoBox(
        "Educacao Infantil:",
        `${dados.bncc_ei_idade || ""} | Campo: ${dados.bncc_ei_campo || ""}`,
        [236, 253, 245] // green-50
      );
    }

    if (Array.isArray(bnccEI) && bnccEI.length) {
      addSubtitle("Objetivos de Aprendizagem (EI)");
      bnccEI.forEach((obj) => addBulletItem(String(obj), "dot"));
      addSpacer(3);
    }

    if (Array.isArray(habBncc) && habBncc.length) {
      addSubtitle("Habilidades por Componente Curricular");
      // Agrupar por disciplina
      const porDisciplina: Record<string, typeof habBncc> = {};
      habBncc.forEach((h) => {
        const disc = (h as { disciplina?: string }).disciplina || "Geral";
        if (!porDisciplina[disc]) porDisciplina[disc] = [];
        porDisciplina[disc].push(h);
      });
      Object.entries(porDisciplina).forEach(([disc, habs]) => {
        if (y > 250) { doc.addPage(); addHeader(); }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(5, 150, 105); // green-600
        doc.text(limparTexto(disc), PDF_LEFT, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
        habs.forEach((h) => {
          const hab = h as { codigo?: string; descricao?: string; habilidade_completa?: string };
          const codigo = hab.codigo || "";
          const desc = hab.habilidade_completa || hab.descricao || "";
          addBulletItem(`${codigo} -- ${desc}`, "dot");
        });
        addSpacer(2);
      });
    }
  }

  // ======================================================================
  // 8. PLANEJAMENTO PEDAGÓGICO DETALHADO (IA)
  // ======================================================================
  if (limparTexto(dados.ia_sugestao)) {
    addSpacer(6);
    addSectionTitle("8. PLANEJAMENTO PEDAGOGICO DETALHADO");

    const motor = dados.consultoria_engine || "red";
    const motorNome: Record<string, string> = {
      red: "OmniRed (DeepSeek)",
      blue: "OmniBlue (Kimi)",
      green: "OmniGreen (Claude)",
      yellow: "OmniYellow (Gemini)",
      orange: "OmniOrange (OpenAI)",
    };

    addInfoBox("Motor IA:", motorNome[motor] || motor, [254, 243, 199]); // yellow-100

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
        y += 4;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 64, 175);
        const titulo = limparTexto(l.replace(/#/g, "").trim());
        doc.text(titulo, PDF_LEFT, y);
        doc.setTextColor(0, 0, 0);
        y += 7;
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
  // 9. MONITORAMENTO E ACOMPANHAMENTO
  // ======================================================================
  const monitoramentoData = dados.monitoramento_data;
  const statusMeta = limparTexto(dados.status_meta);
  const parecerGeral = limparTexto(dados.parecer_geral);
  const proximosPassos = (dados.proximos_passos_select || []).filter(Boolean) as string[];

  if (monitoramentoData || statusMeta || parecerGeral || proximosPassos.length) {
    addSpacer(6);
    addSectionTitle("9. MONITORAMENTO E ACOMPANHAMENTO");

    if (monitoramentoData) {
      addLine("Data do Monitoramento:", formatarData(monitoramentoData as string));
      addSpacer(2);
    }

    if (statusMeta) {
      addInfoBox("Status da Meta:", statusMeta, [236, 253, 245]);
      addSpacer(1);
    }

    if (parecerGeral) {
      addSubtitle("Parecer Geral");
      addMultiline(parecerGeral);
      addSpacer(3);
    }

    if (proximosPassos.length) {
      addSubtitle("Proximos Passos");
      proximosPassos.forEach((p) => addBulletItem(p, "dot"));
    }
  }

  // ======================================================================
  // 10. COMPLIANCE LBI (Lei Brasileira de Inclusão)
  // ======================================================================
  {
    const checks = [
      { label: "Nome do estudante", ok: !!limparTexto(dados.nome), ref: "Art. 28 LBI" },
      { label: "Serie/Ano", ok: !!dados.serie, ref: "Art. 28 LBI" },
      { label: "Diagnostico", ok: !!limparTexto(dados.diagnostico), ref: "Art. 28, inciso XVII" },
      { label: "Barreiras mapeadas", ok: temBarreiras, ref: "Art. 3, inciso IV" },
      { label: "Estrategias pedagogicas", ok: estAcesso.length > 0 || estEnsino.length > 0, ref: "Art. 28, inciso II" },
      { label: "Habilidades BNCC", ok: (habBncc.length > 0 || bnccEI.length > 0), ref: "BNCC 2018" },
      { label: "Rede de apoio", ok: rede.length > 0, ref: "Art. 28, inciso XI" },
      { label: "Potencialidades", ok: potencias.length > 0, ref: "Art. 2, Paragrafo unico" },
    ];

    const total = checks.length;
    const compliant = checks.filter((c) => c.ok).length;
    const pct = Math.round((compliant / total) * 100);

    addSpacer(6);
    addSectionTitle("10. COMPLIANCE LBI");

    addInfoBox("Conformidade:", `${compliant}/${total} campos (${pct}%)`, pct >= 75 ? [236, 253, 245] : [254, 226, 226]);

    checks.forEach((c) => {
      const status = c.ok ? "[X]" : "[ ]";
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(c.ok ? 22 : 185, c.ok ? 163 : 28, c.ok ? 74 : 28);
      if (y > 270) { doc.addPage(); addHeader(); }
      doc.text(`${status} ${c.label}`, PDF_LEFT + 2, y);
      doc.setTextColor(148, 163, 184);
      doc.text(`(${c.ref})`, PDF_LEFT + 80, y);
      doc.setTextColor(0, 0, 0);
      y += 5.5;
    });
  }

  // ======================================================================
  // Footer em todas as páginas
  // ======================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Linha separadora
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(PDF_LEFT, 287 - PDF_BOTTOM, PDF_PAGE_WIDTH - PDF_RIGHT, 287 - PDF_BOTTOM);

    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Pagina ${i} de ${totalPages}  |  Gerado via Omnisfera  |  ${new Date().toLocaleDateString("pt-BR")}`,
      PDF_PAGE_WIDTH / 2,
      287 - PDF_BOTTOM + 5,
      { align: "center" }
    );
    doc.text(
      "Documento confidencial - Lei n. 13.146/2015 (LBI) e LGPD",
      PDF_PAGE_WIDTH / 2,
      287 - PDF_BOTTOM + 9,
      { align: "center" }
    );
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
