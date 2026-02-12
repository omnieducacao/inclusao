/**
 * Gera DOCX simples a partir de texto.
 * Equivalente a criar_docx_simples do Streamlit.
 */
import { Document, Packer, Paragraph } from "docx";

export async function textToDocxBuffer(texto: string, titulo: string = "Documento"): Promise<Buffer> {
  const lines = (texto || "").split(/\r?\n/).filter((l) => l.trim());
  const children: Paragraph[] = [
    new Paragraph({
      text: titulo,
      heading: "Heading1",
    }),
  ];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    children.push(new Paragraph({ text: t }));
  }
  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
