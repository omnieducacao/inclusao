/**
 * Gera PDF do Documento Oficial do PEI (texto fluido gerado por IA).
 * Usa fonte Helvetica (institucional), 11pt, espaçamento 1.4x.
 */

// jsPDF dinâmico
let jsPDFClass: typeof import("jspdf").jsPDF | null = null;
async function getJsPDF() {
    if (!jsPDFClass) {
        const m = await import("jspdf");
        jsPDFClass = m.jsPDF;
    }
    return jsPDFClass;
}

const PAGE_W = 210;
const MARGIN_L = 20;
const MARGIN_R = 20;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 25;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

/**
 * Gera PDF oficial a partir do texto reescrito pela IA.
 */
export async function gerarPdfDocumentoOficial(
    textoIA: string,
    nomeEstudante: string
): Promise<Uint8Array> {
    const jsPDF = await getJsPDF();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let y = MARGIN_TOP;
    let pageNum = 1;

    // Limpar caracteres fora de Latin-1
    const safe = (s: string) =>
        s
            .replace(/\u2018|\u2019/g, "'")
            .replace(/\u201C|\u201D/g, '"')
            .replace(/\u2013/g, "-")
            .replace(/\u2014/g, "--")
            .replace(/\u2026/g, "...")
            .replace(/\u2022/g, "-")
            .replace(/\u00A0/g, " ")
            .replace(/[^\x00-\xFF\n]/g, "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");

    // Header do documento
    const addDocHeader = () => {
        // Faixa institucional
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, PAGE_W, 12, "F");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("OMNISFERA", MARGIN_L, 8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(178, 190, 210);
        doc.text("Plataforma de Inclusao Educacional", MARGIN_L + 28, 8);

        // Título
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 12, PAGE_W, 24, "F");

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("PLANO DE ENSINO INDIVIDUALIZADO", MARGIN_L, 24);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Documento Oficial — Gerado com auxilio de Inteligencia Artificial", MARGIN_L, 30);

        const dataEmissao = new Date().toLocaleDateString("pt-BR");
        doc.text(`Emitido em: ${dataEmissao}`, PAGE_W - MARGIN_R, 30, { align: "right" });

        // Linha azul
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.line(MARGIN_L, 36, PAGE_W - MARGIN_R, 36);

        y = 44;
    };

    // Nova página
    const newPage = () => {
        doc.addPage();
        pageNum++;
        // Header simplificado nas páginas seguintes
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, PAGE_W, 10, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(178, 190, 210);
        doc.text(`PEI — ${safe(nomeEstudante)}`, MARGIN_L, 7);
        doc.text(`Pagina ${pageNum}`, PAGE_W - MARGIN_R, 7, { align: "right" });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_L, 12, PAGE_W - MARGIN_R, 12);

        y = 18;
    };

    const checkPageBreak = (needed: number) => {
        if (y + needed > 297 - MARGIN_BOTTOM) {
            newPage();
        }
    };

    // Primeira página
    addDocHeader();

    // Processar o texto da IA
    const cleanText = safe(textoIA);
    const paragraphs = cleanText.split(/\n\n+/);

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        // Detectar títulos de seção (em CAIXA ALTA seguido de : ou sozinho)
        const matchTitulo = trimmed.match(/^([A-ZÀÁÂÃÉÊÍÓÔÕÚÇÜ\s,]{8,}):?\s*/);
        const isSectionTitle = matchTitulo && matchTitulo[1].length < 80;

        if (isSectionTitle) {
            checkPageBreak(14);
            y += 3;

            // Faixa de fundo para título
            doc.setFillColor(30, 58, 138); // blue-900
            doc.roundedRect(MARGIN_L, y - 4, CONTENT_W, 9, 1.5, 1.5, "F");

            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text(safe(matchTitulo[1].trim()), MARGIN_L + 3, y + 2);
            doc.setTextColor(15, 23, 42);
            y += 10;

            // Texto após o título (na mesma linha original)
            const restText = trimmed.slice(matchTitulo[0].length).trim();
            if (restText) {
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                const lines = doc.splitTextToSize(safe(restText), CONTENT_W);
                for (const line of lines) {
                    checkPageBreak(6);
                    doc.text(line, MARGIN_L, y);
                    y += 5.8;
                }
                y += 3;
            }
        } else {
            // Parágrafo normal
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(15, 23, 42);

            const lines = doc.splitTextToSize(safe(trimmed), CONTENT_W);
            for (const line of lines) {
                checkPageBreak(6);
                doc.text(line, MARGIN_L, y);
                y += 5.8;
            }
            y += 3; // espaço entre parágrafos
        }
    }

    // Footer em todas as páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_L, 297 - MARGIN_BOTTOM, PAGE_W - MARGIN_R, 297 - MARGIN_BOTTOM);

        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Pagina ${i} de ${totalPages}  |  Documento Oficial PEI  |  Gerado via Omnisfera  |  ${new Date().toLocaleDateString("pt-BR")}`,
            PAGE_W / 2,
            297 - MARGIN_BOTTOM + 5,
            { align: "center" }
        );
        doc.text(
            "Documento confidencial — Lei n. 13.146/2015 (LBI) e LGPD",
            PAGE_W / 2,
            297 - MARGIN_BOTTOM + 9,
            { align: "center" }
        );
    }

    return new Uint8Array(doc.output("arraybuffer"));
}
