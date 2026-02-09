/**
 * Gera PDF da Jornada Gamificada do PAEE (compatível com Streamlit _gerar_pdf_jornada_simples)
 */
export function gerarPdfJornada(texto: string, nomeEstudante: string): void {
  if (typeof window === "undefined") return;

  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Limpar texto e garantir encoding seguro para jsPDF (WinAnsiEncoding, Latin-1)
    const limparTexto = (t: string) => {
      if (!t) return "";
      return t
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/#/g, "")
        .replace(/•/g, "-")
        .replace(/\u201C|\u201D/g, '"')     // smart double quotes
        .replace(/\u2018|\u2019/g, "'")     // smart single quotes
        .replace(/\u2013/g, "-")            // en-dash
        .replace(/\u2014/g, "--")           // em-dash
        .replace(/\u2026/g, "...")          // ellipsis
        .replace(/\u00A0/g, " ")            // non-breaking space
        .replace(/[^\x00-\xFF\n]/g, "");    // manter apenas Latin-1
    };

    const textoLimpo = limparTexto(texto);
    const linhas = textoLimpo.split("\n");

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text("ROTEIRO DE MISSÃO", pageWidth / 2, y, { align: "center" });
    y += 10;

    // Linha divisória
    doc.setDrawColor(150);
    doc.line(10, y, pageWidth - 10, y);
    y += 10;

    // Conteúdo
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);

    for (const linha of linhas) {
      const l = linha.trim();
      if (!l) {
        y += 4;
        continue;
      }

      // Verificar se é título (uppercase ou tinha **)
      const isTitulo = l === l.toUpperCase() && l.length < 100 && !l.includes(":") && l.length > 3;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      if (isTitulo) {
        doc.setFont("helvetica", "bold");
        doc.setFillColor(240, 240, 240);
        const lines = doc.splitTextToSize(l, maxWidth);
        for (const line of lines) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.rect(margin, y - 4, maxWidth, 8, "F");
          doc.text(line, margin, y);
          y += 6;
        }
        doc.setFont("helvetica", "normal");
      } else {
        const lines = doc.splitTextToSize(l, maxWidth);
        for (const line of lines) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 6;
        }
      }
    }

    const nomeArquivo = `Jornada_${nomeEstudante.replace(/\s+/g, "_")}.pdf`;
    doc.save(nomeArquivo);
  }).catch((err) => {
    console.error("Erro ao gerar PDF da jornada:", err);
    alert("Erro ao gerar PDF. Tente novamente.");
  });
}
