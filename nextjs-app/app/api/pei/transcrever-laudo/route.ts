import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, visionAdapt, getEngineError, type EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PDF_TYPES = ["application/pdf"];

/**
 * Extrai texto do PDF usando pdf-parse.
 */
async function extractTextFromPdf(buffer: Buffer, maxPages: number = 10): Promise<string> {
     
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;

    const data = await pdfParse(buffer, { max: maxPages });
    const textoFinal = (data.text || "").trim();

    if (!textoFinal || textoFinal.length < 20) {
        throw new Error("PDF extraído mas texto muito curto ou vazio. O PDF pode ser uma imagem escaneada — tente enviar como imagem (foto/print).");
    }

    console.log(`✅ PDF extraído para transcrição: ${textoFinal.length} chars de ${data.numpages} páginas`);
    return textoFinal;
}

const PROMPT_TRANSCREVER = `Você é um transcritor profissional de documentos médicos/especializados.
Transcreva o documento abaixo na ÍNTEGRA, mantendo toda a informação, termos técnicos, datas, nomes, assinaturas e observações.
Formate de forma limpa e legível, usando parágrafos e marcações quando necessário.
NÃO resuma, NÃO omita informações, NÃO interprete — apenas transcreva fielmente todo o conteúdo.
Se houver partes ilegíveis, indique com [ilegível].`;

export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    const { error: authError } = await requireAuth(); if (authError) return authError;
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file || !file.size) {
            return NextResponse.json(
                { error: "Envie um arquivo (PDF ou imagem)." },
                { status: 400 }
            );
        }

        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const isImage = IMAGE_TYPES.some(t => fileType.includes(t)) ||
            [".jpg", ".jpeg", ".png", ".webp"].some(ext => fileName.endsWith(ext));
        const isPdf = PDF_TYPES.some(t => fileType.includes(t)) || fileName.endsWith(".pdf");

        if (!isImage && !isPdf) {
            return NextResponse.json(
                { error: "Formato não suportado. Envie PDF, JPG, PNG ou WebP." },
                { status: 400 }
            );
        }

        const buf = Buffer.from(await file.arrayBuffer());
        let transcricao: string;

        if (isImage) {
            // ── Imagem: usar visionAdapt (Gemini Flash — mais barato com visão) ──
            const base64 = buf.toString("base64");
            const mime = fileType || "image/jpeg";
            const prompt = `${PROMPT_TRANSCREVER}\n\nA imagem a seguir contém um documento (laudo, relatório ou parecer). Transcreva TODO o conteúdo visível na imagem.`;

            try {
                transcricao = await visionAdapt(prompt, base64, mime);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (visionErr: any) {
                console.error("Erro na visão:", visionErr);
                return NextResponse.json(
                    { error: `Erro ao processar imagem: ${visionErr?.message || visionErr}` },
                    { status: 500 }
                );
            }
        } else {
            // ── PDF: extrair texto ──
            let textoPdf: string;
            try {
                textoPdf = await extractTextFromPdf(buf);
            } catch (err) {
                console.error("Erro ao extrair texto do PDF:", err);
                return NextResponse.json(
                    { error: err instanceof Error ? err.message : "Não foi possível extrair texto do PDF." },
                    { status: 400 }
                );
            }

            // Para PDFs com texto bom, retornar direto. Se curto, usar IA para organizar.
            if (textoPdf.length > 200) {
                // Texto já extraído é suficiente — usar IA apenas para formatar
                const engine: EngineId = "red"; // DeepSeek — mais barato
                const engineErr = getEngineError(engine);
                if (engineErr) {
                    // Fallback: retornar texto bruto
                    transcricao = textoPdf;
                } else {
                    const textoLimitado = textoPdf.slice(0, 12000);
                    const prompt = `${PROMPT_TRANSCREVER}\n\nTexto extraído do documento:\n\n${textoLimitado}`;

                    try {
                        transcricao = (await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.1 })).trim();
                    } catch {
                        // Fallback: retornar texto bruto em caso de erro da IA
                        transcricao = textoPdf;
                    }
                }
            } else {
                transcricao = textoPdf;
            }
        }

        if (!transcricao) {
            return NextResponse.json(
                { error: "Não foi possível transcrever o documento." },
                { status: 500 }
            );
        }

        return NextResponse.json({ transcricao });
    } catch (err) {
        console.error("Erro transcrever-laudo:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao transcrever documento." },
            { status: 500 }
        );
    }
}
