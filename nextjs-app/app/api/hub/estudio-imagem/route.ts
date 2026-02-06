import { NextResponse } from "next/server";
import { generateImageWithGemini } from "@/lib/gemini-image";
import OpenAI from "openai";
import { selectEngine } from "@/lib/engine-selector";

export async function POST(req: Request) {
  // Imagens sempre usam Gemini (yellow)
  const { engine, error: engineErr } = selectEngine("imagens", null, false);
  
  if (engineErr) {
    return NextResponse.json(
      { error: engineErr },
      { status: 500 }
    );
  }

  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!geminiKey && !openaiKey) {
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

  // 1) Tentar Gemini (como no Streamlit: ilustração e pictograma CAA)
  if (geminiKey) {
    let promptGemini: string;
    if (tipo === "caa") {
      const ajuste = feedback?.trim() ? ` Ajuste solicitado: ${feedback}.` : "";
      promptGemini =
        `Símbolo de comunicação (CAA/PECS) para o conceito: '${prompt.trim()}'.${ajuste} ` +
        "Estilo: ícone vetorial plano (estilo ARASAAC). Fundo BRANCO. Contornos PRETOS grossos. " +
        "Cores sólidas, alto contraste. Sem detalhes de fundo, sem sombras. " +
        "REGRA OBRIGATÓRIA: imagem MUDA, sem texto, palavras, letras ou números. Apenas o símbolo visual. " +
        "Proporção quadrada (1:1). Público: Brasil.";
    } else {
      const ajuste = feedback?.trim() ? ` Ajuste solicitado: ${feedback}` : "";
      promptGemini =
        "Ilustração educacional, estilo vetorial plano, fundo claro. " +
        "REGRA OBRIGATÓRIA: NÃO inclua texto, palavras, letras ou números na imagem. " +
        "Apenas a representação visual do conceito. Público: Brasil. Proporção quadrada (1:1). " +
        `Cena a representar: ${(prompt.trim() + ajuste).slice(0, 2000)}`;
    }
    try {
      const b64 = await generateImageWithGemini(promptGemini, {
        apiKey: geminiKey,
        timeoutMs: 90_000,
      });
      return NextResponse.json({ image: `data:image/png;base64,${b64}` });
    } catch (err) {
      console.error("Estudio imagem (Gemini):", err);
      if (!openaiKey) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Erro ao gerar imagem." },
          { status: 500 }
        );
      }
    }
  }

  // 2) Fallback DALL-E
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
    console.error("Estudio imagem (DALL-E):", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar imagem." },
      { status: 500 }
    );
  }
}
