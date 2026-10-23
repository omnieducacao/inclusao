import { parseBody, peiExportSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { gerarPdfPei } from "@/lib/pei-pdf-export";
import type { PEIData } from "@/lib/pei";
import { requireAuth } from "@/lib/permissions";
import { logExport } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const { session, error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const parsed = await parseBody(req, peiExportSchema);
    if (parsed.error) return parsed.error;
    const {  peiData  } = parsed.data;
    if (!peiData || typeof peiData !== "object") {
      return NextResponse.json({ error: "peiData obrigatório." }, { status: 400 });
    }

    const pdfBytes = await gerarPdfPei(peiData);
    const nomeEstudante = (peiData.nome || "Estudante").toString().replace(/\s+/g, "_");

    // Converter Uint8Array para Buffer para NextResponse
    const buffer = Buffer.from(pdfBytes);

    await logExport(session, req, { resourceType: "pei", format: "pdf" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PEI_${nomeEstudante}.pdf"`,
      },
    });
  } catch (err) {
    logger.error({ err: err }, "PEI exportar PDF:");
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao exportar PEI em PDF." },
      { status: 500 }
    );
  }
}
