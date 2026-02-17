/**
 * Gera DOCX simples a partir de texto.
 * Equivalente a criar_docx_simples do Streamlit.
 * Suporta formatação inclusiva (OpenDyslexic, 14pt, 1.5x espaçamento).
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  convertInchesToTwip,
} from "docx";

/** Configurações de formatação inclusiva */
export interface InclusiveFormatOptions {
  formatoInclusivo?: boolean;
}

// Constantes de formatação inclusiva
const INCLUSIVE_FONT = "OpenDyslexic";
const INCLUSIVE_FALLBACK_FONT = "Arial";
const INCLUSIVE_FONT_SIZE = 28;        // 14pt em half-points
const INCLUSIVE_HEADING_SIZE = 36;     // 18pt em half-points
const INCLUSIVE_LINE_SPACING = 360;    // 1.5x em twips (240 = single)
const INCLUSIVE_PARAGRAPH_AFTER = 240; // 12pt após parágrafo

/**
 * Detecta se uma linha é um título/destaque (começa com ** ou #)
 */
function isHighlightLine(line: string): boolean {
  return /^\*\*/.test(line) || /^#{1,3}\s/.test(line);
}

/**
 * Remove marcadores de markdown (** e #)
 */
function cleanMarkdown(line: string): string {
  return line
    .replace(/^\*\*\s*/, "")
    .replace(/\s*\*\*$/, "")
    .replace(/\*\*/g, "")
    .replace(/^#{1,3}\s*/, "")
    .trim();
}

/**
 * Cria parágrafo inclusivo com formatação acessível
 */
function createInclusiveParagraph(text: string, isHeading = false): Paragraph {
  const isBold = isHeading || isHighlightLine(text);
  const cleanText = isBold ? cleanMarkdown(text) : text;

  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      line: INCLUSIVE_LINE_SPACING,
      after: INCLUSIVE_PARAGRAPH_AFTER,
    },
    children: [
      new TextRun({
        text: cleanText,
        font: { name: INCLUSIVE_FONT, hint: undefined },
        size: isHeading ? INCLUSIVE_HEADING_SIZE : INCLUSIVE_FONT_SIZE,
        bold: isBold,
      }),
    ],
  });
}

export async function textToDocxBuffer(
  texto: string,
  titulo: string = "Documento",
  options?: InclusiveFormatOptions
): Promise<Buffer> {
  const lines = (texto || "").split(/\r?\n/).filter((l) => l.trim());
  const inclusive = options?.formatoInclusivo === true;

  const children: Paragraph[] = [];

  if (inclusive) {
    // Título com formatação inclusiva
    children.push(createInclusiveParagraph(titulo, true));

    // Nota sobre a fonte OpenDyslexic
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: INCLUSIVE_LINE_SPACING, after: INCLUSIVE_PARAGRAPH_AFTER },
        children: [
          new TextRun({
            text: "⚠ Este documento usa a fonte OpenDyslexic para acessibilidade. ",
            font: { name: INCLUSIVE_FALLBACK_FONT },
            size: 20, // 10pt
            italics: true,
            color: "888888",
          }),
          new TextRun({
            text: "Se a fonte não aparecer corretamente, baixe em: opendyslexic.org",
            font: { name: INCLUSIVE_FALLBACK_FONT },
            size: 20,
            italics: true,
            color: "888888",
          }),
        ],
      })
    );

    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      children.push(createInclusiveParagraph(t));
    }
  } else {
    // Formato padrão (original)
    children.push(
      new Paragraph({
        text: titulo,
        heading: HeadingLevel.HEADING_1,
      })
    );
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      children.push(new Paragraph({ text: t }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: inclusive
          ? {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1.2),
                right: convertInchesToTwip(1.2),
              },
            },
          }
          : undefined,
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
