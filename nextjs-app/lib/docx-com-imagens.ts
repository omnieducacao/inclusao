/**
 * Gera DOCX com texto e imagens inseridas onde houver tags [[IMG_n]].
 * Equivalente a construir_docx_final do Streamlit.
 */
import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  TextRun,
  AlignmentType,
} from "docx";

const TAG_REGEX = /\[\[(?:IMG|GEN_IMG)[^\]]*?(\d+)\]\]/gi;

export type MapaImagens = Record<number, Buffer>;

function getImageBuffer(
  num: number,
  mapa: MapaImagens
): Buffer | null {
  if (mapa[num]) return mapa[num];
  const keys = Object.keys(mapa).map(Number);
  if (keys.length === 1) return mapa[keys[0]];
  return null;
}

export async function docxComImagens(
  texto: string,
  titulo: string,
  mapaImagens: MapaImagens
): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      text: titulo,
      heading: "Heading1",
      alignment: AlignmentType.CENTER,
    }),
  ];

  const linhas = texto.split(/\r?\n/);
  for (const linha of linhas) {
    const t = linha.trim();
    if (!t) {
      children.push(new Paragraph({ text: "" }));
      continue;
    }

    const matches = [...t.matchAll(new RegExp(TAG_REGEX.source, "gi"))];
    if (matches.length === 0) {
      children.push(new Paragraph({ text: t }));
      continue;
    }

    let lastIndex = 0;
    for (const m of matches) {
      const num = parseInt(m[1], 10);
      const imgBuffer = getImageBuffer(num, mapaImagens);

      if (m.index !== undefined && m.index > lastIndex) {
        const textoAntes = t.slice(lastIndex, m.index);
        if (textoAntes.trim()) {
          children.push(new Paragraph({ text: textoAntes }));
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
          children.push(new Paragraph({ text: `[Imagem ${num}]` }));
        }
      } else {
        children.push(new Paragraph({ text: `[Imagem ${num}]` }));
      }
      lastIndex = (m.index ?? 0) + m[0].length;
    }
    if (lastIndex < t.length) {
      const resto = t.slice(lastIndex).trim();
      if (resto) children.push(new Paragraph({ text: resto }));
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}
