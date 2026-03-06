/**
 * Gera e baixa PDF a partir de texto markdown simplificado (client-side).
 * Usado em Hub, PGI, Avaliação Diagnóstica.
 * Suporta formatação inclusiva (OpenDyslexic, 14pt, 1.5x espaçamento, fundo creme).
 * Interpreta markdown básico: ###, **, ---, listas, etc.
 */

export interface PdfDownloadOptions {
  formatoInclusivo?: boolean;
}

export function downloadPdfFromText(
  text: string,
  filename: string,
  title?: string,
  options?: PdfDownloadOptions
): void {
  if (typeof window === "undefined") return;
  const inclusive = options?.formatoInclusivo === true;

  import("jspdf").then(async ({ jsPDF }) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = inclusive ? 25 : 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeightBody = inclusive ? 8 : 5.5;
    const lineHeightHeading = inclusive ? 11 : 8;
    let y = inclusive ? 25 : 20;

    // Se formato inclusivo, registrar OpenDyslexic
    if (inclusive) {
      try {
        const fontModule = await import("@/lib/fonts/opendyslexic-base64");
        const { OPENDYSLEXIC_REGULAR_BASE64, OPENDYSLEXIC_BOLD_BASE64 } = fontModule;
        doc.addFileToVFS("OpenDyslexic-Regular.otf", OPENDYSLEXIC_REGULAR_BASE64);
        doc.addFont("OpenDyslexic-Regular.otf", "OpenDyslexic", "normal");
        doc.addFileToVFS("OpenDyslexic-Bold.otf", OPENDYSLEXIC_BOLD_BASE64);
        doc.addFont("OpenDyslexic-Bold.otf", "OpenDyslexic", "bold");
      } catch (err) {
        console.warn("Não foi possível carregar OpenDyslexic, usando Arial:", err);
      }
    }

    const fontName = inclusive ? "OpenDyslexic" : "helvetica";

    // Função para desenhar fundo creme em cada página
    const drawCreamBg = () => {
      if (inclusive) {
        doc.setFillColor(253, 246, 227); // #FDF6E3
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      }
    };

    // Sanitize text for jsPDF (Latin-1 compatible)
    const safe = (s: string) =>
      s
        .replace(/\u2018|\u2019/g, "'")
        .replace(/\u201C|\u201D/g, '"')
        .replace(/\u2013/g, "-")
        .replace(/\u2014/g, "--")
        .replace(/\u2026/g, "...")
        .replace(/\u2022/g, "-")
        .replace(/\u00A0/g, " ")
        // Keep common Portuguese characters (Latin-1 range)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    // Remove emoji but keep accented chars
    const removeEmoji = (s: string) =>
      s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, "").trim();

    // Strip markdown bold markers
    const stripBold = (s: string) => s.replace(/\*\*/g, "");

    // Check if we need a page break
    const checkPageBreak = (extraSpace = 0) => {
      const pageBreakY = inclusive ? 260 : 270;
      if (y + extraSpace > pageBreakY) {
        doc.addPage();
        drawCreamBg();
        y = inclusive ? 25 : 20;
      }
    };

    // Write wrapped text
    const writeText = (text: string, fontSize: number, style: "normal" | "bold" = "normal", indent = 0) => {
      doc.setFontSize(fontSize);
      doc.setFont(fontName, style);
      if (inclusive) doc.setTextColor(33, 37, 41);
      const cleanText = removeEmoji(safe(stripBold(text)));
      if (!cleanText) return;
      const lines = doc.splitTextToSize(cleanText, maxWidth - indent);
      for (const line of lines) {
        checkPageBreak();
        doc.text(line, margin + indent, y);
        y += style === "bold" ? lineHeightHeading : lineHeightBody;
      }
    };

    // Draw horizontal rule
    const drawRule = () => {
      checkPageBreak(4);
      y += 2;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    };

    // ── First page background ──
    drawCreamBg();

    // ── Title ──
    if (title) {
      const titleSize = inclusive ? 18 : 16;
      doc.setFontSize(titleSize);
      doc.setFont(fontName, "bold");
      if (inclusive) doc.setTextColor(33, 37, 41);
      else doc.setTextColor(30, 64, 175); // blue for title
      doc.text(safe(removeEmoji(title)), margin, y);
      y += lineHeightHeading + 2;
      doc.setTextColor(0, 0, 0);
    }

    // ── Parse and render markdown ──
    const rawLines = (text || "").split("\n");
    const bodySize = inclusive ? 14 : 11;
    const headingSize = inclusive ? 16 : 13;

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i];
      const trimmed = rawLine.trim();

      // Skip empty lines
      if (trimmed === "") {
        y += lineHeightBody * 0.4;
        continue;
      }

      // Horizontal rule
      if (/^-{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
        drawRule();
        continue;
      }

      // Skip image references
      if (trimmed.startsWith("![")) {
        continue;
      }

      // Heading ### Questão 1 — ...
      if (trimmed.startsWith("### ")) {
        checkPageBreak(lineHeightHeading * 2);
        y += 3;
        writeText(trimmed.replace(/^###\s*/, ""), headingSize, "bold");
        y += 2;
        continue;
      }

      // Heading ## ...
      if (trimmed.startsWith("## ")) {
        checkPageBreak(lineHeightHeading * 2);
        y += 4;
        writeText(trimmed.replace(/^##\s*/, ""), headingSize + 1, "bold");
        y += 3;
        continue;
      }

      // Bold line: **Gabarito:** B, **Comando:**, etc.
      if (trimmed.startsWith("**") && trimmed.includes("**")) {
        writeText(trimmed, bodySize, "bold");
        continue;
      }

      // Italic line: *justificativa...*
      if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.startsWith("**")) {
        const italicText = trimmed.slice(1, -1);
        if (italicText) {
          doc.setFontSize(bodySize - 1);
          doc.setFont(fontName, "normal"); // jsPDF doesn't have italic for helvetica
          if (inclusive) doc.setTextColor(33, 37, 41);
          else doc.setTextColor(100, 100, 100);
          const safeLine = removeEmoji(safe(italicText));
          if (safeLine) {
            const wrapped = doc.splitTextToSize(safeLine, maxWidth);
            for (const wl of wrapped) {
              checkPageBreak();
              doc.text(wl, margin, y);
              y += lineHeightBody;
            }
          }
          doc.setTextColor(0, 0, 0);
        }
        continue;
      }

      // Alternatives: A) ..., B) ..., **C)** ... (bold = correct)
      if (/^[A-D]\)/.test(trimmed) || /^\*\*[A-D]\)\*\*/.test(trimmed)) {
        const isBold = trimmed.startsWith("**");
        const cleanAlt = stripBold(trimmed);
        writeText(cleanAlt, bodySize, isBold ? "bold" : "normal", 4);
        continue;
      }

      // Regular text
      writeText(trimmed, bodySize, "normal");
    }

    doc.save(filename);
  }).catch((err) => {
    console.error("Erro ao gerar PDF:", err);
  });
}
