import { parseBody, peiExportSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { chatCompletionText } from "@/lib/ai-engines";
import { serializarPeiParaTexto, promptDocumentoOficial } from "@/lib/pei-documento-oficial";
import { gerarPdfDocumentoOficial } from "@/lib/pei-pdf-oficial";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
    const { error: authError } = await requireAuth();
    if (authError) return authError;
    try {
        const parsed = await parseBody(req, peiExportSchema);
        if (parsed.error) return parsed.error;
        const { peiData } = parsed.data;

        if (!peiData || typeof peiData !== "object") {
            return NextResponse.json({ error: "peiData obrigatório." }, { status: 400 });
        }

        // Engine da request ou padrão
        const engine = ((parsed.data as Record<string, unknown>).engine as EngineId) || "red";

        // 1. Serializar dados do PEI
        const textoSerializado = serializarPeiParaTexto(peiData);

        // 2. Chamar IA para reescrita como documento oficial
        const messages = promptDocumentoOficial(textoSerializado);
        const textoOficial = await chatCompletionText(engine, messages, {
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
        const nomeEstudante = (peiData.nome || "Estudante").toString();
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
