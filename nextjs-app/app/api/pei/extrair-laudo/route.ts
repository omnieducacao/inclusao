import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, visionAdapt, getEngineError, getEngineErrorWithWorkspace, motorParaDadosSensiveis, type EngineId } from "@/lib/ai-engines";
import { mascararPII } from "@/lib/pii";
import { delimitarLaudo, lerLaudoExtraido } from "@/lib/laudo";
import { requireAuth } from "@/lib/permissions";
import { logger } from "@/lib/logger";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PDF_TYPES = ["application/pdf"];

/**
 * Extrai texto do PDF usando pdf-parse.
 */
async function extractTextFromPdf(buffer: Buffer, maxPages: number = 6): Promise<string> {

  const pdfParseModule = await import("pdf-parse");
  const pdfParse = pdfParseModule.default || pdfParseModule;

  const data = await pdfParse(buffer, { max: maxPages });
  const textoFinal = (data.text || "").trim();

  if (!textoFinal || textoFinal.length < 30) {
    throw new Error("PDF extraído mas texto muito curto ou vazio. O PDF pode ser uma imagem escaneada — tente enviar como imagem (foto/print).");
  }

  return textoFinal;
}

const PROMPT_EXTRAIR = `Analise este laudo médico/escolar. Extraia: 1) Diagnóstico; 2) Medicamentos. Responda APENAS em JSON, sem markdown, sem backticks: { "diagnostico": "...", "medicamentos": [ {"nome": "...", "posologia": "..."} ] }. Se não houver medicamentos, retorne lista vazia. Códigos entre colchetes, como [CPF_1], são dados pessoais ocultados: ignore-os.`;

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { session, error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const engineRaw = formData.get("engine");
    const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(String(engineRaw || ""))
      ? (engineRaw as EngineId)
      : "orange";

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
    let raw: string;
    // laudo é dado de saúde: DeepSeek e Kimi ficam de fora (SCRUM-69); o PDF passa pela máscara de dados pessoais
    let restaurar: (t: string) => string = (t) => t;

    if (isImage) {
      // ── Imagem: usar visionAdapt (Gemini Flash ou GPT-4o) ──
      const base64 = buf.toString("base64");
      const mime = fileType || "image/jpeg";
      const prompt = `${PROMPT_EXTRAIR}\n\nA imagem a seguir é um laudo médico/escolar. Leia o texto da imagem e extraia as informações solicitadas.`;

      try {
        raw = await visionAdapt(prompt, base64, mime);
         
      } catch (visionErr: any) {
        logger.error({ err: visionErr }, "Erro na visão:");
        return NextResponse.json(
          { error: `Erro ao processar imagem: ${visionErr?.message || visionErr}` },
          { status: 500 }
        );
      }
    } else {
      // ── PDF: extrair texto e enviar para IA ──
      // Verificar engine para PDF
      let motor: EngineId;
      try {
        motor = motorParaDadosSensiveis(engine, (e) => Boolean(getEngineError(e)));
      } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "Nenhum motor permitido para laudo." }, { status: 500 });
      }
      if (motor === "orange") {
        const openaiKey = process.env.OPENAI_API_KEY || "";
        if (openaiKey.startsWith("sk-or-")) {
          return NextResponse.json(
            { error: "A variável OPENAI_API_KEY está configurada com uma chave do OpenRouter (sk-or-...). Configure uma chave válida do OpenAI (sk-...)." },
            { status: 500 }
          );
        }
        if (!openaiKey || openaiKey.length < 20) {
          return NextResponse.json(
            { error: "OPENAI_API_KEY não está configurada ou é inválida." },
            { status: 500 }
          );
        }
      }

      const wsId = session?.simulating_workspace_id || session?.workspace_id;
      const engineErr = await getEngineErrorWithWorkspace(motor, wsId);
      if (engineErr) {
        return NextResponse.json({ error: engineErr }, { status: 500 });
      }

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

      const mascara = mascararPII(textoPdf.slice(0, 6000), { nomes: { ESCOLA: session?.workspace_name } });
      restaurar = mascara.restaurar;
      const prompt = `${PROMPT_EXTRAIR}\n\n${delimitarLaudo(mascara.texto)}`;

      try {
        raw = (await chatCompletionText(motor, [{ role: "user", content: prompt }], { temperature: 0.2, sensivel: true })).trim();
         
      } catch (apiErr: any) {
        const errorMsg = apiErr?.message || String(apiErr);
        if (errorMsg.includes("API key") || errorMsg.includes("401") || errorMsg.includes("Incorrect API key")) {
          return NextResponse.json(
            { error: `Erro de autenticação da API: ${errorMsg}` },
            { status: 500 }
          );
        }
        throw apiErr;
      }
    }

    if (!raw) {
      return NextResponse.json(
        { error: "A IA não retornou dados válidos." },
        { status: 500 }
      );
    }

    // Resposta validada por schema (Zod), sem adivinhar por expressão regular
    const lido = lerLaudoExtraido(raw);
    if (!lido.ok) {
      logger.error({ motivo: lido.motivo, tamanho: raw.length }, "extrair-laudo: resposta fora do formato");
      return NextResponse.json(
        { error: "Não conseguimos ler o laudo com segurança. Tente de novo ou preencha o diagnóstico à mão." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      diagnostico: restaurar(lido.dados.diagnostico).trim(),
      medicamentos: lido.dados.medicamentos.map((m) => ({
        nome: restaurar(m.nome).trim(),
        posologia: restaurar(m.posologia).trim(),
      })),
    });
  } catch (err) {
    logger.error({ err: err }, "Erro extrair-laudo:");
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar laudo." },
      { status: 500 }
    );
  }
}
