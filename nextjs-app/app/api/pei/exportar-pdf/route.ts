import { NextResponse } from "next/server";
import { gerarPdfPei } from "@/lib/pei-pdf-export";
import type { PEIData } from "@/lib/pei";

export async function POST(req: Request) {
  try {
    const { peiData } = (await req.json()) as { peiData: PEIData };
    if (!peiData || typeof peiData !== "object") {
      return NextResponse.json({ error: "peiData obrigatório." }, { status: 400 });
    }

    const pdfBytes = await gerarPdfPei(peiData);
    const nomeEstudante = (peiData.nome || "Estudante").toString().replace(/\s+/g, "_");

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PEI_${nomeEstudante}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PEI exportar PDF:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao exportar PEI em PDF." },
      { status: 500 }
    );
  }
}
