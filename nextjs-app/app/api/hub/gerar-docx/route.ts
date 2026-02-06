import { NextResponse } from "next/server";
import { textToDocxBuffer } from "@/lib/docx-simples";
import { docxComImagens } from "@/lib/docx-com-imagens";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const texto = typeof body.texto === "string" ? body.texto : "";
    const titulo = typeof body.titulo === "string" ? body.titulo : "Documento";
    const filename = typeof body.filename === "string" ? body.filename : `Documento_${new Date().toISOString().slice(0, 10)}.docx`;
    const mapaImagens = body.mapa_imagens as Record<string, string> | undefined;

    let buffer: Buffer;
    if (mapaImagens && typeof mapaImagens === "object" && Object.keys(mapaImagens).length > 0) {
      const mapa: Record<number, Buffer> = {};
      for (const [k, v] of Object.entries(mapaImagens)) {
        if (typeof v === "string") {
          mapa[parseInt(k, 10)] = Buffer.from(v, "base64");
        }
      }
      buffer = await docxComImagens(texto, titulo, mapa);
    } else {
      buffer = await textToDocxBuffer(texto, titulo);
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("gerar-docx:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar DOCX." },
      { status: 500 }
    );
  }
}
