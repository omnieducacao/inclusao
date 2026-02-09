/**
 * Gera PPTX (PowerPoint) premium a partir do plano de aula.
 * Templates visuais com gradientes, formas decorativas e tipografia profissional.
 */

import { getDataBrasiliaFormatada, getDataBrasiliaISO } from "./date-utils";

// Cores do design system Omnisfera
const COLORS = {
  primary: "0D9488",      // teal-600
  primaryDark: "0F766E",  // teal-700
  primaryLight: "CCFBF1", // teal-100
  accent: "7C3AED",       // violet-600
  accentLight: "EDE9FE",  // violet-100
  slate900: "0F172A",
  slate700: "334155",
  slate500: "64748B",
  slate200: "E2E8F0",
  slate50: "F8FAFC",
  white: "FFFFFF",
  warm: "FFF7ED",         // orange-50
};

export function gerarPptxPlanoAula(
  texto: string,
  titulo: string = "Plano de Aula DUA",
  nomeEstudante?: string
): void {
  if (typeof window === "undefined") return;

  import("pptxgenjs").then((module) => {
    const PptxGen = (module.default || module) as any;
    const pptx = new PptxGen();

    pptx.layout = "LAYOUT_WIDE" as any;
    pptx.author = "Omnisfera";
    pptx.company = "Omni Soluções Educacionais";
    pptx.title = titulo;
    pptx.subject = nomeEstudante ? `Plano de Aula - ${nomeEstudante}` : "Plano de Aula DUA";

    // ======== SLIDE DE CAPA ========
    const slideCover = pptx.addSlide();
    slideCover.background = { color: COLORS.primaryDark };

    // Faixa decorativa diagonal (simulada com retângulo)
    slideCover.addShape(pptx.ShapeType.rect as any, {
      x: -0.5, y: 5.5, w: 14, h: 2.5,
      fill: { color: COLORS.primary },
      rotate: -3,
    });

    // Círculo decorativo
    slideCover.addShape(pptx.ShapeType.ellipse as any, {
      x: 9, y: -1, w: 4, h: 4,
      fill: { color: COLORS.primary },
    });

    // Título
    slideCover.addText(titulo, {
      x: 0.8, y: 1.5, w: 8, h: 1.6,
      fontSize: 44, bold: true, color: COLORS.white,
      fontFace: "Calibri",
    });

    // Subtítulo com nome
    if (nomeEstudante) {
      slideCover.addText(`Plano personalizado para ${nomeEstudante}`, {
        x: 0.8, y: 3.2, w: 8, h: 0.7,
        fontSize: 20, italic: true, color: COLORS.primaryLight,
        fontFace: "Calibri",
      });
    }

    // Data (horário de Brasília)
    slideCover.addText(getDataBrasiliaFormatada(), {
      x: 0.8, y: 4.2, w: 8, h: 0.5,
      fontSize: 14, color: COLORS.primaryLight,
      fontFace: "Calibri",
    });

    // Logo text
    slideCover.addText("Omnisfera", {
      x: 0.8, y: 6.2, w: 3, h: 0.5,
      fontSize: 16, bold: true, color: COLORS.white,
      fontFace: "Calibri",
    });

    // ======== PROCESSAR SEÇÕES ========
    const secoes = parsearSecoes(texto);

    const slideColors = [
      COLORS.primary,
      COLORS.accent,
      "E11D48",   // rose
      "EA580C",   // orange
      "2563EB",   // blue
      "16A34A",   // green
    ];

    secoes.forEach((secao, idx) => {
      const corAccent = slideColors[idx % slideColors.length];
      criarSlideConteudo(pptx, secao.titulo, secao.itens, corAccent);
    });

    // Se não há seções detectadas, criar um slide com todo o texto
    if (secoes.length === 0) {
      criarSlideConteudo(pptx, "Plano de Aula", texto.split("\n").filter(l => l.trim()), COLORS.primary);
    }

    // ======== SLIDE FINAL ========
    const slideFinal = pptx.addSlide();
    slideFinal.background = { color: COLORS.primaryDark };

    slideFinal.addShape(pptx.ShapeType.rect as any, {
      x: -0.5, y: -0.5, w: 14, h: 2.5,
      fill: { color: COLORS.primary },
      rotate: 2,
    });

    slideFinal.addText("Omnisfera", {
      x: 0, y: 2, w: 13.33, h: 1.5,
      fontSize: 48, bold: true, color: COLORS.white,
      fontFace: "Calibri", align: "center",
    });
    slideFinal.addText("Educação inclusiva impulsionada por inteligência artificial", {
      x: 0, y: 3.5, w: 13.33, h: 0.8,
      fontSize: 18, italic: true, color: COLORS.primaryLight,
      fontFace: "Calibri", align: "center",
    });
    slideFinal.addText("© Omni Soluções Educacionais", {
      x: 0, y: 6.2, w: 13.33, h: 0.5,
      fontSize: 12, color: COLORS.primaryLight,
      fontFace: "Calibri", align: "center",
    });

    // Salvar (usar data de Brasília)
    const nomeArquivo = `Plano_Aula_${nomeEstudante ? nomeEstudante.replace(/\s+/g, "_") + "_" : ""}${getDataBrasiliaISO()}.pptx`;
    pptx.writeFile({ fileName: nomeArquivo });
  }).catch((err) => {
    console.error("Erro ao gerar PPTX:", err);
    alert("Erro ao gerar PowerPoint. Tente novamente.");
  });
}

// ================================================================
// Parser de seções do texto Markdown - Extrai conteúdo para uso na aula
// Foca em DESENVOLVIMENTO DA AULA e cria slides práticos para apresentação
// ================================================================
function parsearSecoes(texto: string): { titulo: string; itens: string[] }[] {
  const linhas = texto.split("\n");
  const secoes: { titulo: string; itens: string[] }[] = [];
  let secAtual: { titulo: string; itens: string[] } | null = null;
  let dentroDesenvolvimento = false;

  for (const linha of linhas) {
    const l = linha.trim();
    if (!l) continue;

    // Detectar início da seção DESENVOLVIMENTO DA AULA
    if (l.toLowerCase().includes("desenvolvimento") || l.toLowerCase().includes("🚀")) {
      dentroDesenvolvimento = true;
    }

    // Ignorar seções administrativas (objetivos, recursos, avaliação, etc) quando não estamos em desenvolvimento
    if (!dentroDesenvolvimento && (
      l.toLowerCase().includes("objetivo") ||
      l.toLowerCase().includes("recursos") ||
      l.toLowerCase().includes("avaliação") && !l.toLowerCase().includes("desenvolvimento") ||
      l.toLowerCase().includes("referência") ||
      l.toLowerCase().includes("adaptação") ||
      l.toLowerCase().includes("recuperação")
    )) {
      continue;
    }

    const isTitulo =
      l.startsWith("###") || l.startsWith("##") || l.startsWith("#") ||
      (l.length < 100 && l === l.toUpperCase() && l.length > 3 && !l.includes(":"));

    if (isTitulo) {
      if (secAtual && (secAtual.titulo || secAtual.itens.length > 0)) {
        secoes.push(secAtual);
      }
      const tituloLimpo = l.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/[🎯📊📈📝✅🧩⚠️💡🏁🎓🔍📋🏥🌟🚀]/g, "").replace(/\d+\.\s*/, "").trim();
      // Criar slide apenas se for etapa de desenvolvimento ou conteúdo prático
      if (dentroDesenvolvimento || tituloLimpo.toLowerCase().includes("conteúdo") || tituloLimpo.toLowerCase().includes("atividade")) {
        secAtual = { titulo: tituloLimpo, itens: [] };
      } else {
        secAtual = null;
      }
    } else if (secAtual) {
      const item = l.replace(/\*\*/g, "").replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (item && !item.toLowerCase().includes("minutos") && !item.toLowerCase().includes("tempo")) {
        secAtual.itens.push(item);
      }
    }
  }

  if (secAtual && (secAtual.titulo || secAtual.itens.length > 0)) {
    secoes.push(secAtual);
  }

  // Se não encontrou seções de desenvolvimento, criar slides do conteúdo principal
  if (secoes.length === 0) {
    const conteudoLinhas = linhas.filter(l => {
      const linha = l.trim();
      return linha && 
        !linha.toLowerCase().includes("objetivo") &&
        !linha.toLowerCase().includes("recursos") &&
        !linha.toLowerCase().includes("avaliação") &&
        !linha.toLowerCase().includes("referência") &&
        !linha.toLowerCase().includes("adaptação") &&
        !linha.toLowerCase().includes("recuperação") &&
        !linha.toLowerCase().includes("tempo estimado");
    });
    
    if (conteudoLinhas.length > 0) {
      const conteudo = conteudoLinhas.map(l => l.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/^[-•]\s*/, "").trim()).filter(l => l);
      if (conteudo.length > 0) {
        secoes.push({ titulo: "Conteúdo da Aula", itens: conteudo });
      }
    }
  }

  return secoes;
}

// ================================================================
// Cria slide de conteúdo com design premium
// ================================================================
function criarSlideConteudo(pptx: any, titulo: string, itens: string[], corAccent: string) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Barra lateral decorativa
  slide.addShape(pptx.ShapeType.rect as any, {
    x: 0, y: 0, w: 0.15, h: 7.5,
    fill: { color: corAccent },
  });

  // Orbe decorativa
  slide.addShape(pptx.ShapeType.ellipse as any, {
    x: 11.5, y: -0.5, w: 2.5, h: 2.5,
    fill: { color: corAccent + "15" },
    line: { color: corAccent, width: 0.5 },
  });

  // Título
  slide.addText(titulo, {
    x: 0.6, y: 0.3, w: 10, h: 0.7,
    fontSize: 26, bold: true, color: corAccent,
    fontFace: "Calibri",
  });

  // Linha separadora fina
  slide.addShape(pptx.ShapeType.rect as any, {
    x: 0.6, y: 1.05, w: 3, h: 0.04,
    fill: { color: corAccent },
  });

  // Conteúdo em duas colunas se muitos itens
  if (itens.length > 6) {
    const metade = Math.ceil(itens.length / 2);
    const col1 = itens.slice(0, metade);
    const col2 = itens.slice(metade);

    slide.addText(col1.map(item => ({ text: item, options: { bullet: { code: "2023" }, fontSize: 14, color: COLORS.slate700, breakLine: true, lineSpacing: 22 } })), {
      x: 0.6, y: 1.3, w: 5.8, h: 5.5,
      fontFace: "Calibri", valign: "top",
    });

    slide.addText(col2.map(item => ({ text: item, options: { bullet: { code: "2023" }, fontSize: 14, color: COLORS.slate700, breakLine: true, lineSpacing: 22 } })), {
      x: 6.8, y: 1.3, w: 5.8, h: 5.5,
      fontFace: "Calibri", valign: "top",
    });
  } else {
    slide.addText(itens.map(item => ({ text: item, options: { bullet: { code: "2023" }, fontSize: 16, color: COLORS.slate700, breakLine: true, lineSpacing: 26 } })), {
      x: 0.6, y: 1.3, w: 11.5, h: 5.5,
      fontFace: "Calibri", valign: "top",
    });
  }

  // Rodapé
  slide.addText("Omnisfera · Plano de Aula DUA", {
    x: 0.6, y: 7, w: 5, h: 0.3,
    fontSize: 9, color: COLORS.slate500,
    fontFace: "Calibri",
  });
}
