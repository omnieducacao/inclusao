/**
 * Gera DOCX com texto e imagens inseridas onde houver tags [[IMG_n]].
 * Equivalente a construir_docx_final do Streamlit.
 * Suporta formatação inclusiva (OpenDyslexic, 14pt, 1.5x espaçamento).
 */
import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  TextRun,
  AlignmentType,
  HeadingLevel,
  convertInchesToTwip,
} from "docx";

// Regex para capturar tags de imagem: [[IMG_1]], [[IMG_2]], [[GEN_IMG: termo]] (convertido para [[IMG_n]])
const TAG_REGEX = /\[\[(?:IMG|GEN_IMG)[^\]]*?(\d+)\]\]/gi;

export type MapaImagens = Record<number, Buffer>;

// Constantes de formatação inclusiva
const INCLUSIVE_FONT = "OpenDyslexic";
const INCLUSIVE_FALLBACK_FONT = "Arial";
const INCLUSIVE_FONT_SIZE = 28;        // 14pt em half-points
const INCLUSIVE_HEADING_SIZE = 36;     // 18pt em half-points
const INCLUSIVE_LINE_SPACING = 360;    // 1.5x em twips
const INCLUSIVE_PARAGRAPH_AFTER = 240; // 12pt após parágrafo

function getImageBuffer(
  num: number,
  mapa: MapaImagens
): Buffer | null {
  if (mapa[num]) return mapa[num];
  const keys = Object.keys(mapa).map(Number);
  if (keys.length === 1) return mapa[keys[0]];
  return null;
}

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
 * Cria TextRun com formatação inclusiva
 */
function inclusiveTextRun(text: string, bold = false): TextRun {
  return new TextRun({
    text,
    font: { name: INCLUSIVE_FONT, hint: undefined },
    size: INCLUSIVE_FONT_SIZE,
    bold,
  });
}

export interface DocxOptions {
  formatoInclusivo?: boolean;
}

export async function docxComImagens(
  texto: string,
  titulo: string,
  mapaImagens: MapaImagens,
  options?: DocxOptions
): Promise<Buffer> {
  const inclusive = options?.formatoInclusivo === true;

  const children: Paragraph[] = [];

  if (inclusive) {
    // Título inclusivo
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: {
          line: INCLUSIVE_LINE_SPACING,
          after: INCLUSIVE_PARAGRAPH_AFTER,
        },
        children: [
          new TextRun({
            text: titulo,
            font: { name: INCLUSIVE_FONT, hint: undefined },
            size: INCLUSIVE_HEADING_SIZE,
            bold: true,
          }),
        ],
      })
    );

    // Nota sobre a fonte
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: INCLUSIVE_LINE_SPACING, after: INCLUSIVE_PARAGRAPH_AFTER },
        children: [
          new TextRun({
            text: "⚠ Este documento usa a fonte OpenDyslexic para acessibilidade. Se a fonte não aparecer corretamente, baixe em: opendyslexic.org",
            font: { name: INCLUSIVE_FALLBACK_FONT },
            size: 20,
            italics: true,
            color: "888888",
          }),
        ],
      })
    );
  } else {
    children.push(
      new Paragraph({
        text: titulo,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    );
  }

  const linhas = texto.split(/\r?\n/);
  for (const linha of linhas) {
    const t = linha.trim();
    if (!t) {
      children.push(new Paragraph({ text: "" }));
      continue;
    }

    const matches = [...t.matchAll(new RegExp(TAG_REGEX.source, "gi"))];
    if (matches.length === 0) {
      if (inclusive) {
        const isBold = isHighlightLine(t);
        const cleanText = isBold ? cleanMarkdown(t) : t;
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: {
              line: INCLUSIVE_LINE_SPACING,
              after: INCLUSIVE_PARAGRAPH_AFTER,
            },
            children: [inclusiveTextRun(cleanText, isBold)],
          })
        );
      } else {
        children.push(new Paragraph({ text: t }));
      }
      continue;
    }

    let lastIndex = 0;
    for (const m of matches) {
      const num = parseInt(m[1], 10);
      const imgBuffer = getImageBuffer(num, mapaImagens);

      if (m.index !== undefined && m.index > lastIndex) {
        const textoAntes = t.slice(lastIndex, m.index);
        if (textoAntes.trim()) {
          if (inclusive) {
            children.push(
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { line: INCLUSIVE_LINE_SPACING, after: INCLUSIVE_PARAGRAPH_AFTER },
                children: [inclusiveTextRun(textoAntes.trim())],
              })
            );
          } else {
            children.push(new Paragraph({ text: textoAntes }));
          }
        }
      }

      if (imgBuffer) {
        try {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  type: "png",
                  data: imgBuffer,
                  transformation: { width: 324, height: 243 },
                }),
              ],
              alignment: AlignmentType.CENTER,
            })
          );
        } catch {
          const placeholder = inclusive
            ? new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { line: INCLUSIVE_LINE_SPACING, after: INCLUSIVE_PARAGRAPH_AFTER },
              children: [inclusiveTextRun(`[Imagem ${num}]`)],
            })
            : new Paragraph({ text: `[Imagem ${num}]` });
          children.push(placeholder);
        }
      } else {
        const placeholder = inclusive
          ? new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: INCLUSIVE_LINE_SPACING, after: INCLUSIVE_PARAGRAPH_AFTER },
            children: [inclusiveTextRun(`[Imagem ${num}]`)],
          })
          : new Paragraph({ text: `[Imagem ${num}]` });
        children.push(placeholder);
      }
      lastIndex = (m.index ?? 0) + m[0].length;
    }
    if (lastIndex < t.length) {
      const resto = t.slice(lastIndex).trim();
      if (resto) {
        if (inclusive) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { line: INCLUSIVE_LINE_SPACING, after: INCLUSIVE_PARAGRAPH_AFTER },
              children: [inclusiveTextRun(resto)],
            })
          );
        } else {
          children.push(new Paragraph({ text: resto }));
        }
      }
    }
  }

  const doc = new Document({
    sections: [{
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
    }],
  });
  return Packer.toBuffer(doc);
}
