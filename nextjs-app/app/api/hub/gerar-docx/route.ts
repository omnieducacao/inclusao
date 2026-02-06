import { NextResponse } from "next/server";
import { textToDocxBuffer } from "@/lib/docx-simples";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const texto = typeof body.texto === "string" ? body.texto : "";
    const titulo = typeof body.titulo === "string" ? body.titulo : "Documento";
    const filename = typeof body.filename === "string" ? body.filename : `Documento_${new Date().toISOString().slice(0, 10)}.docx`;

    const buffer = await textToDocxBuffer(texto, titulo);

    return new NextResponse(buffer, {
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
