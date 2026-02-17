import { parseBody, hubGerarDocxSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { textToDocxBuffer } from "@/lib/docx-simples";
import { docxComImagens } from "@/lib/docx-com-imagens";
import { requireAuth } from "@/lib/permissions";

export async function POST(req: Request) {
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const parsed = await parseBody(req, hubGerarDocxSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const texto = typeof body.texto === "string" ? body.texto : "";
    const titulo = typeof body.titulo === "string" ? body.titulo : "Documento";
    const filename = typeof body.filename === "string" ? body.filename : `Documento_${new Date().toISOString().slice(0, 10)}.docx`;
    const mapaImagens = body.mapa_imagens as Record<string, string> | undefined;
    const formatoInclusivo = body.formato_inclusivo === true;

    let buffer: Buffer;
    if (mapaImagens && typeof mapaImagens === "object" && Object.keys(mapaImagens).length > 0) {
      const mapa: Record<number, Buffer> = {};
      for (const [k, v] of Object.entries(mapaImagens)) {
        if (typeof v === "string") {
          mapa[parseInt(k, 10)] = Buffer.from(v, "base64");
        }
      }
      buffer = await docxComImagens(texto, titulo, mapa, { formatoInclusivo });
    } else {
      buffer = await textToDocxBuffer(texto, titulo, { formatoInclusivo });
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
