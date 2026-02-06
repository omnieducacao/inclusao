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

    const safe = (s: string) =>
      s
        .replace(/[\u007F-\uFFFF]/g, (c) =>
          /[\u00C0-\u024F]/.test(c) ? c : "?"
        )
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
