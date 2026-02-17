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
const LINE_H = 5.5; // espaçamento entre linhas

// Títulos de seção conhecidos (o prompt instrui a IA a usar estes)
const KNOWN_SECTIONS = [
    "IDENTIFICACAO DO ESTUDANTE",
    "IDENTIFICAÇÃO DO ESTUDANTE",
    "DIAGNOSTICO E CONTEXTO CLINICO",
    "DIAGNÓSTICO E CONTEXTO CLÍNICO",
    "POTENCIALIDADES E INTERESSES",
    "MAPEAMENTO DE BARREIRAS E NIVEIS DE SUPORTE",
    "MAPEAMENTO DE BARREIRAS E NÍVEIS DE SUPORTE",
    "PLANO DE ACAO PEDAGOGICO",
    "PLANO DE AÇÃO PEDAGÓGICO",
    "PLANO DE ACAO PEDAGÓGICO",
    "ALINHAMENTO CURRICULAR",
    "MONITORAMENTO E ACOMPANHAMENTO",
    "CONSIDERACOES FINAIS E ENCAMINHAMENTOS",
    "CONSIDERAÇÕES FINAIS E ENCAMINHAMENTOS",
    "REDE DE APOIO",
    "REDE DE APOIO E ORIENTACOES",
    "REDE DE APOIO E ORIENTAÇÕES",
    "HISTORICO ESCOLAR",
    "HISTÓRICO ESCOLAR",
    "DINAMICA FAMILIAR",
    "DINÂMICA FAMILIAR",
    "HABILIDADES BNCC",
    "PLANEJAMENTO PEDAGOGICO",
    "PLANEJAMENTO PEDAGÓGICO",
];

/**
 * Normaliza string removendo acentos para comparação.
 */
function normalize(s: string): string {
    return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

/**
 * Verifica se um texto é um título de seção conhecido.
 * Retorna o título original (antes do ':') ou null.
 */
function extractSectionTitle(line: string): { title: string; rest: string } | null {
    // Tentativa 1: linha começa com título conhecido seguido de ':'
    const colonIdx = line.indexOf(":");
    if (colonIdx > 5 && colonIdx < 80) {
        const candidate = line.slice(0, colonIdx).trim();
        const candidateNorm = normalize(candidate);
        // Verificar se corresponde a algum título conhecido
        for (const known of KNOWN_SECTIONS) {
            if (candidateNorm === normalize(known) || candidateNorm.includes(normalize(known)) || normalize(known).includes(candidateNorm)) {
                return {
                    title: candidate,
                    rest: line.slice(colonIdx + 1).trim(),
                };
            }
        }
        // Fallback: se o candidato é todo MAIÚSCULA, tem pelo menos 3 palavras, e cada palavra > 2 chars
        const words = candidate.split(/\s+/).filter(w => w.length > 1);
        const isAllUpper = candidate === candidate.toUpperCase();
        if (isAllUpper && words.length >= 2 && candidate.length >= 15 && candidate.length < 70) {
            return {
                title: candidate,
                rest: line.slice(colonIdx + 1).trim(),
            };
        }
    }
    return null;
}

/**
 * Limpa caracteres fora de Latin-1 (jsPDF só suporta Latin-1 com Helvetica).
 */
function safe(s: string): string {
    return s
        .replace(/\u2018|\u2019|\u0060|\u00B4/g, "'")
        .replace(/\u201C|\u201D/g, '"')
        .replace(/\u2013/g, "-")
        .replace(/\u2014/g, " - ")
        .replace(/\u2026/g, "...")
        .replace(/\u2022/g, "-")
        .replace(/\u00A0/g, " ")
        .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "") // zero-width chars
        // Mapear acentos comuns que podem estar fora do range
        .replace(/[^\x00-\xFF\n]/g, (ch) => {
            // Tentar normalizar para Latin-1
            const nfd = ch.normalize("NFD");
            const base = nfd.replace(/[\u0300-\u036f]/g, "");
            return base || "";
        })
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");
}

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
        doc.text("Documento Oficial - Gerado com auxilio de Inteligencia Artificial", MARGIN_L, 30);

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
        doc.text(`PEI - ${safe(nomeEstudante)}`, MARGIN_L, 7);
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

    // Renderizar título de seção
    const renderSectionTitle = (title: string) => {
        checkPageBreak(16);
        y += 4;

        // Faixa de fundo para título
        doc.setFillColor(30, 58, 138); // blue-900
        doc.roundedRect(MARGIN_L, y - 4.5, CONTENT_W, 9, 1.5, 1.5, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(safe(title), MARGIN_L + 3, y + 1.5);
        doc.setTextColor(15, 23, 42);
        y += 10;
    };

    // Renderizar parágrafo de texto
    const renderParagraph = (text: string) => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59); // slate-800

        const safeText = safe(text);
        const lines = doc.splitTextToSize(safeText, CONTENT_W);
        for (const line of lines) {
            checkPageBreak(LINE_H + 1);
            doc.text(line, MARGIN_L, y);
            y += LINE_H;
        }
        y += 3; // espaço entre parágrafos
    };

    // ==========================================
    // RENDERIZAÇÃO PRINCIPAL
    // ==========================================

    // Primeira página
    addDocHeader();

    // Processar o texto da IA
    const cleanText = safe(textoIA);

    // Dividir em parágrafos (linhas duplas)
    const paragraphs = cleanText.split(/\n\n+/).filter((p) => p.trim().length > 0);

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed || trimmed.length < 3) continue;

        // Verificar se o parágrafo começa com um título de seção
        const sectionMatch = extractSectionTitle(trimmed);

        if (sectionMatch) {
            renderSectionTitle(sectionMatch.title);
            if (sectionMatch.rest && sectionMatch.rest.length > 3) {
                renderParagraph(sectionMatch.rest);
            }
        } else {
            // Pode ser um parágrafo com quebras simples (\n) dentro
            // Juntar as linhas em texto corrido
            const textoCorrido = trimmed.replace(/\n/g, " ").replace(/\s{2,}/g, " ");
            renderParagraph(textoCorrido);
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
            "Documento confidencial - Lei n. 13.146/2015 (LBI) e LGPD",
            PAGE_W / 2,
            297 - MARGIN_BOTTOM + 9,
            { align: "center" }
        );
    }

    return new Uint8Array(doc.output("arraybuffer"));
}
