import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, visionAdapt, getEngineError, type EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PDF_TYPES = ["application/pdf"];

/**
 * Extrai texto do PDF usando pdf-parse.
 */
async function extractTextFromPdf(buffer: Buffer, maxPages: number = 6): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = pdfParseModule.default || pdfParseModule;

  const data = await pdfParse(buffer, { max: maxPages });
  const textoFinal = (data.text || "").trim();

  if (!textoFinal || textoFinal.length < 30) {
    throw new Error("PDF extraído mas texto muito curto ou vazio. O PDF pode ser uma imagem escaneada — tente enviar como imagem (foto/print).");
  }

  console.log(`✅ PDF extraído: ${textoFinal.length} chars de ${data.numpages} páginas`);
  return textoFinal;
}

const PROMPT_EXTRAIR = `Analise este laudo médico/escolar. Extraia: 1) Diagnóstico; 2) Medicamentos. Responda APENAS em JSON, sem markdown, sem backticks: { "diagnostico": "...", "medicamentos": [ {"nome": "...", "posologia": "..."} ] }. Se não houver medicamentos, retorne lista vazia.`;

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const engineRaw = formData.get("engine");
    let engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(String(engineRaw || ""))
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

    if (isImage) {
      // ── Imagem: usar visionAdapt (Gemini Flash ou GPT-4o) ──
      const base64 = buf.toString("base64");
      const mime = fileType || "image/jpeg";
      const prompt = `${PROMPT_EXTRAIR}\n\nA imagem a seguir é um laudo médico/escolar. Leia o texto da imagem e extraia as informações solicitadas.`;

      try {
        raw = await visionAdapt(prompt, base64, mime);
      } catch (visionErr: any) {
        console.error("Erro na visão:", visionErr);
        return NextResponse.json(
          { error: `Erro ao processar imagem: ${visionErr?.message || visionErr}` },
          { status: 500 }
        );
      }
    } else {
      // ── PDF: extrair texto e enviar para IA ──
      // Verificar engine para PDF
      if (engine === "orange") {
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

      const engineErr = getEngineError(engine);
      if (engineErr) {
        return NextResponse.json({ error: engineErr }, { status: 500 });
      }

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

      const textoLimitado = textoPdf.slice(0, 6000);
      const prompt = `${PROMPT_EXTRAIR}\n\nTexto do laudo:\n\n${textoLimitado}`;

      try {
        raw = (await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.2 })).trim();
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

    // Parse do JSON (com fallbacks robustos)
    let jsonStr = raw;
    const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();

    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let parsed: {
      diagnostico?: string;
      medicamentos?: { nome?: string; posologia?: string }[];
    };

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Erro ao fazer parse do JSON. Texto recebido:", raw.substring(0, 500));
      const diagnosticoMatch = raw.match(/(?:diagnóstico|diagnostico)[\s:"]*([^",\n}]+)/i);
      parsed = {
        diagnostico: diagnosticoMatch ? diagnosticoMatch[1].trim() : "",
        medicamentos: [],
      };
    }

    return NextResponse.json({
      diagnostico: parsed.diagnostico || "",
      medicamentos: Array.isArray(parsed.medicamentos)
        ? parsed.medicamentos.map((m) => ({
          nome: String(m.nome || "").trim(),
          posologia: String(m.posologia || "").trim(),
        }))
        : [],
    });
  } catch (err) {
    console.error("Erro extrair-laudo:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar laudo." },
      { status: 500 }
    );
  }
}
