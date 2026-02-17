/**
 * Gera e baixa PDF a partir de texto (client-side).
 * Usado em Hub (Adaptar Prova/Atividade) e PGI.
 * Suporta formatação inclusiva (OpenDyslexic, 14pt, 1.5x espaçamento, fundo creme).
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
    const lineHeight = inclusive ? 9 : 6;
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

    // Função para desenhar fundo creme em cada página
    const drawCreamBg = () => {
      if (inclusive) {
        doc.setFillColor(253, 246, 227); // #FDF6E3 — creme suave
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      }
    };

    // jsPDF Helvetica suporta WinAnsiEncoding (Latin-1, codepoints 0-255).
    const safe = (s: string) =>
      s
        .replace(/\u2018|\u2019/g, "'")   // smart quotes → ASCII
        .replace(/\u201C|\u201D/g, '"')   // smart double quotes → ASCII
        .replace(/\u2013/g, "-")          // en-dash → hyphen
        .replace(/\u2014/g, "--")         // em-dash → double hyphen
        .replace(/\u2026/g, "...")        // ellipsis → three dots
        .replace(/\u2022/g, "-")          // bullet → hyphen
        .replace(/\u00A0/g, " ")          // non-breaking space → space
        .replace(/[^\x00-\xFF]/g, "")     // remover tudo fora de Latin-1
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    // Primeira página — fundo creme
    drawCreamBg();

    const fontName = inclusive ? "OpenDyslexic" : "helvetica";

    if (title) {
      const titleSize = inclusive ? 18 : 14;
      doc.setFontSize(titleSize);
      doc.setFont(fontName, "bold");
      if (inclusive) doc.setTextColor(33, 37, 41); // #212529
      doc.text(safe(title), margin, y);
      y += lineHeight * 2;
    }

    const bodySize = inclusive ? 14 : 10;
    doc.setFontSize(bodySize);
    doc.setFont(fontName, "normal");
    if (inclusive) doc.setTextColor(33, 37, 41);

    const lines = doc.splitTextToSize(safe(text || "—"), maxWidth);
    for (const line of lines) {
      const pageBreakY = inclusive ? 260 : 270;
      if (y > pageBreakY) {
        doc.addPage();
        drawCreamBg();
        y = inclusive ? 25 : 20;
        doc.setFontSize(bodySize);
        doc.setFont(fontName, "normal");
        if (inclusive) doc.setTextColor(33, 37, 41);
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(filename);
  }).catch((err) => {
    console.error("Erro ao gerar PDF:", err);
  });
}
