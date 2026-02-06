import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Configure GEMINI_API_KEY ou OPENAI_API_KEY para gerar imagens." },
      { status: 500 }
    );
  }

  let body: { tipo: "ilustracao" | "caa"; prompt: string; feedback?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { tipo, prompt, feedback } = body;
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Informe o prompt ou conceito." }, { status: 400 });
  }

  // Por ora usamos DALL-E (OpenAI). Gemini Imagen requer @google/genai ou Vertex AI.
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey?.trim()) {
    return NextResponse.json(
      { error: "Configure OPENAI_API_KEY para gerar imagens (Estúdio Visual)." },
      { status: 500 }
    );
  }

  let finalPrompt = "";
  if (tipo === "caa") {
    const ajuste = feedback ? ` CORREÇÃO: ${feedback}` : "";
    finalPrompt = `Create a COMMUNICATION SYMBOL (AAC/PECS) for the concept: '${prompt}'.${ajuste}
STYLE: Flat vector icon (ARASAAC/Noun Project style). Solid WHITE background. Thick BLACK outlines. High contrast primary colors.
CRITICAL: NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS. Purely visual symbol.`;
  } else {
    const ajuste = feedback ? ` Adjustment: ${feedback}` : "";
    finalPrompt = `Educational illustration, clean flat vector style, white background.${ajuste}
CRITICAL: NO TEXT, NO TYPOGRAPHY, NO ALPHABET, NO NUMBERS, NO LABELS. Just the visual representation of: ${prompt}`;
  }

  try {
    const client = new OpenAI({ apiKey: openaiKey });
    const resp = await client.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
      response_format: "b64_json",
    });

    const b64 = resp.data[0];
    if (!b64 || !("b64_json" in b64)) {
      return NextResponse.json({ error: "Resposta sem imagem." }, { status: 500 });
    }
    const dataUrl = `data:image/png;base64,${(b64 as { b64_json?: string }).b64_json}`;
    return NextResponse.json({ image: dataUrl });
  } catch (err) {
    console.error("Estudio imagem:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar imagem." },
      { status: 500 }
    );
  }
}
