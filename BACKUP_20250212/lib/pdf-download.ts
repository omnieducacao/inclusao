/**
 * Gera e baixa PDF a partir de texto (client-side).
 * Usado em Hub (Adaptar Prova/Atividade) e PGI.
 */
export function downloadPdfFromText(
  text: string,
  filename: string,
  title?: string
): void {
  if (typeof window === "undefined") return;
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let y = 20;

    // jsPDF Helvetica suporta WinAnsiEncoding (Latin-1, codepoints 0-255).
    // Preservamos tudo nessa faixa (inclui á, ã, ç, é, ê, ó, õ, ú, etc.)
    // e mapeamos caracteres fora dela para equivalentes ASCII.
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

    if (title) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(safe(title), margin, y);
      y += lineHeight * 2;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(safe(text || "—"), maxWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(filename);
  }).catch((err) => {
    console.error("Erro ao gerar PDF:", err);
  });
}
