import { rateLimitIA } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, visionAdapt, getEngineError, motorParaDadosSensiveis, type EngineId } from "@/lib/ai-engines";
import { mascararPII } from "@/lib/pii";
import { delimitarLaudo } from "@/lib/laudo";
import { requireAuth } from "@/lib/permissions";
import { logger } from "@/lib/logger";

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

    return textoFinal;
}

const PROMPT_TRANSCREVER = `Você é um transcritor profissional de documentos médicos/especializados.
Transcreva o documento abaixo na ÍNTEGRA, mantendo toda a informação, termos técnicos, datas, nomes, assinaturas e observações.
Formate de forma limpa e legível, usando parágrafos e marcações quando necessário.
NÃO resuma, NÃO omita informações, NÃO interprete — apenas transcreva fielmente todo o conteúdo.
Se houver partes ilegíveis, indique com [ilegível].`;

export async function POST(req: Request) {
    const rl = await rateLimitIA(req); if (rl) return rl;
    const { session, error: authError } = await requireAuth(); if (authError) return authError;
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
     
            } catch (visionErr: any) {
                logger.error({ err: visionErr }, "Erro na visão:");
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
                logger.error({ err: err }, "Erro ao extrair texto do PDF:");
                return NextResponse.json(
                    { error: err instanceof Error ? err.message : "Não foi possível extrair texto do PDF." },
                    { status: 400 }
                );
            }

            // Para PDFs com texto bom, retornar direto. Se curto, usar IA para organizar.
            if (textoPdf.length > 200) {
                // Texto já extraído é suficiente — usar IA apenas para formatar
                // SCRUM-69: laudo é dado de saúde. DeepSeek e Kimi ficam de fora; sem OmniOrange nem
                // OmniYellow configurados, devolve o texto extraído sem passar por IA nenhuma.
                let engine: EngineId | null = null;
                try {
                    engine = motorParaDadosSensiveis("red", (e) => Boolean(getEngineError(e)));
                } catch { /* sem motor permitido: cai no texto bruto abaixo */ }
                if (!engine) {
                    // Fallback: retornar texto bruto
                    transcricao = textoPdf;
                } else {
                    // CPF, RG, contatos, nascimento e registros profissionais saem do prompt e voltam na resposta
                    const mascara = mascararPII(textoPdf.slice(0, 12000), { nomes: { ESCOLA: session?.workspace_name } });
                    const prompt = `${PROMPT_TRANSCREVER}\nCódigos entre colchetes, como [CPF_1], são dados pessoais ocultados: copie-os exatamente como estão.\n\n${delimitarLaudo(mascara.texto)}`;

                    try {
                        transcricao = mascara.restaurar((await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.1, sensivel: true })).trim());
                    } catch { /* expected fallback */
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
        logger.error({ err: err }, "Erro transcrever-laudo:");
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao transcrever documento." },
            { status: 500 }
        );
    }
}
