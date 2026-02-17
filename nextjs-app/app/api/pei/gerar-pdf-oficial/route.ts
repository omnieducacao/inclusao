import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { chatCompletionText } from "@/lib/ai-engines";
import { serializarPeiParaTexto, promptDocumentoOficial } from "@/lib/pei-documento-oficial";
import { gerarPdfDocumentoOficial } from "@/lib/pei-pdf-oficial";
import type { EngineId } from "@/lib/ai-engines";
import { z } from "zod";

// Schema próprio para este endpoint (aceita engine)
const peiPdfOficialSchema = z.object({
    peiData: z.record(z.string(), z.unknown()),
    engine: z.enum(["red", "blue", "green", "yellow", "orange"]).optional().default("red"),
});

export async function POST(req: Request) {
    const { error: authError } = await requireAuth();
    if (authError) return authError;
    try {
        const body = await req.json();
        const parsed = peiPdfOficialSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "peiData obrigatório." }, { status: 400 });
        }

        const { peiData, engine } = parsed.data;

        if (!peiData || typeof peiData !== "object") {
            return NextResponse.json({ error: "peiData obrigatório." }, { status: 400 });
        }

        // 1. Serializar dados do PEI
        const textoSerializado = serializarPeiParaTexto(peiData as Record<string, unknown>);

        // 2. Chamar IA para reescrita como documento oficial
        const messages = promptDocumentoOficial(textoSerializado);
        const textoOficial = await chatCompletionText(engine as EngineId, messages, {
            temperature: 0.4,
            source: "pei-pdf-oficial",
        });

        if (!textoOficial || textoOficial.length < 100) {
            return NextResponse.json(
                { error: "A IA não gerou texto suficiente. Tente novamente." },
                { status: 500 }
            );
        }

        // 3. Gerar PDF
        const nomeEstudante = ((peiData as Record<string, unknown>).nome || "Estudante").toString();
        const pdfBytes = await gerarPdfDocumentoOficial(textoOficial, nomeEstudante);
        const buffer = Buffer.from(pdfBytes);
        const filename = `PEI_Oficial_${nomeEstudante.replace(/\s+/g, "_")}.pdf`;

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (err) {
        console.error("PEI gerar-pdf-oficial:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar documento oficial." },
            { status: 500 }
        );
    }
}
