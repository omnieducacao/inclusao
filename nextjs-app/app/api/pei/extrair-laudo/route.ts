import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";

/**
 * Extrai texto do PDF usando pdf-parse (biblioteca server-side nativa para Node.js).
 * Compatível com Next.js e Render - não requer workers.
 */
async function extractTextFromPdf(buffer: Buffer, maxPages: number = 6): Promise<string> {
  // Importar pdf-parse dinamicamente (server-side apenas)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParseModule = await import("pdf-parse");
  // pdf-parse exporta como default
  const pdfParse = pdfParseModule.default || pdfParseModule;

  try {
    // pdf-parse extrai todo o texto de uma vez
    // A opção max limita o número de páginas processadas
    const data = await pdfParse(buffer, {
      max: maxPages,
    });

    const textoFinal = (data.text || "").trim();

    if (!textoFinal || textoFinal.length < 30) {
      throw new Error("PDF extraído mas texto muito curto ou vazio. O PDF pode ser uma imagem escaneada.");
    }

    console.log(`✅ PDF extraído: ${textoFinal.length} chars de ${data.numpages} páginas`);
    return textoFinal;
  } catch (err) {
    console.error("Erro ao extrair texto do PDF:", err);
    throw new Error(
      err instanceof Error ? err.message : "Não foi possível extrair texto do PDF. Verifique se o arquivo é um PDF válido."
    );
  }
}

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const engineRaw = formData.get("engine");
    let engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(String(engineRaw || ""))
      ? (engineRaw as EngineId)
      : "orange"; // Streamlit usa gpt-4o-mini (orange) como padrão para laudos

    // Verificar se a chave está configurada corretamente
    if (engine === "orange") {
      const openaiKey = process.env.OPENAI_API_KEY || "";
      if (openaiKey.startsWith("sk-or-")) {
        return NextResponse.json(
          {
            error:
              "A variável OPENAI_API_KEY está configurada com uma chave do OpenRouter (sk-or-...). " +
              "Configure uma chave válida do OpenAI (sk-...) no Render, ou use OPENROUTER_API_KEY e selecione o engine 'blue'.",
          },
          { status: 500 }
        );
      }
      if (!openaiKey || openaiKey.length < 20) {
        return NextResponse.json(
          {
            error: "OPENAI_API_KEY não está configurada ou é inválida. Configure no Render.",
          },
          { status: 500 }
        );
      }
    }

    const engineErr = getEngineError(engine);
    if (engineErr) {
      return NextResponse.json({ error: engineErr }, { status: 500 });
    }

    if (!file || !file.size) {
      return NextResponse.json(
        { error: "Envie um arquivo PDF." },
        { status: 400 }
      );
    }

    // Verificar tipo
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "O arquivo precisa ser um PDF." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    let textoPdf = "";

    try {
      textoPdf = await extractTextFromPdf(buf);
    } catch (err) {
      console.error("Erro ao extrair texto do PDF:", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Não foi possível extrair texto do PDF." },
        { status: 400 }
      );
    }

    // Enviar para IA (mesmo prompt do Streamlit)
    const textoLimitado = textoPdf.slice(0, 6000);
    const prompt =
      "Analise este laudo médico/escolar. Extraia: 1) Diagnóstico; 2) Medicamentos. " +
      'Responda APENAS em JSON, sem markdown, sem backticks: { "diagnostico": "...", "medicamentos": [ {"nome": "...", "posologia": "..."} ] }. ' +
      "Se não houver medicamentos, retorne lista vazia. " +
      `Texto do laudo:\n\n${textoLimitado}`;

    let raw: string;
    try {
      raw = (await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.2 })).trim();
    } catch (apiErr: any) {
      // Melhorar mensagem de erro para chaves incorretas
      const errorMsg = apiErr?.message || String(apiErr);
      if (errorMsg.includes("API key") || errorMsg.includes("401") || errorMsg.includes("Incorrect API key")) {
        const apiKey = process.env.OPENAI_API_KEY || "";
        if (apiKey.startsWith("sk-or-")) {
          return NextResponse.json(
            {
              error: "A chave OPENAI_API_KEY está configurada com uma chave do OpenRouter (sk-or-...). Configure uma chave válida do OpenAI (sk-...) no Render.",
            },
            { status: 500 }
          );
        }
        return NextResponse.json(
          {
            error: `Erro de autenticação da API: ${errorMsg}. Verifique se OPENAI_API_KEY está configurada corretamente no Render.`,
          },
          { status: 500 }
        );
      }
      throw apiErr;
    }
    if (!raw) {
      return NextResponse.json(
        { error: "A IA não retornou dados válidos." },
        { status: 500 }
      );
    }

    // Parse do JSON (com fallbacks robustos)
    let jsonStr = raw;
    // Remover markdown code blocks se existirem
    const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();

    // Encontrar JSON no texto
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
      // Fallback: extrair manualmente
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
