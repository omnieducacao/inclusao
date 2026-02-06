import { NextResponse } from "next/server";
import { textToDocxBuffer } from "@/lib/docx-simples";
import { peiDataToFullText } from "@/lib/pei-export";
import type { PEIData } from "@/lib/pei";

export async function POST(req: Request) {
  try {
    const { peiData } = (await req.json()) as { peiData: PEIData };
    if (!peiData || typeof peiData !== "object") {
      return NextResponse.json({ error: "peiData obrigatório." }, { status: 400 });
    }
    const texto = peiDataToFullText(peiData);
    const titulo = `PEI - ${(peiData.nome || "Estudante").toString()}`;
    const buffer = await textToDocxBuffer(texto, titulo);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.docx"`,
      },
    });
  } catch (err) {
    console.error("PEI exportar DOCX:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao exportar PEI." },
      { status: 500 }
    );
  }
}
