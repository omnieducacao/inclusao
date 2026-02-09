import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

  // Usar Gemini para geração de imagens (mesmo comando da versão Streamlit)
  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (!geminiKey || geminiKey.trim().length < 20) {
    return NextResponse.json(
      { 
        error: "GEMINI_API_KEY não está configurada ou é inválida. Configure uma chave válida do Google Gemini no Render para gerar imagens (Estúdio Visual)." 
      },
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
    // Usar Gemini para geração de imagens via API REST (mesmo método do mapa-mental)
    const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
    let lastError: Error | null = null;

    for (const modelId of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            continue; // Tentar próximo modelo
          }
          const errorText = await response.text();
          let errorMessage = `API retornou ${response.status}: ${errorText}`;
          
          // Melhorar mensagem de erro para chave inválida
          if (response.status === 400 && errorText.includes("API key not valid")) {
            errorMessage = "GEMINI_API_KEY não é válida. Verifique se a chave está correta no Render e se tem permissões para geração de imagens.";
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Extrair imagem da resposta
        const candidates = data.candidates || [];
        if (candidates.length > 0) {
          const candidate = candidates[0];
          const content = candidate.content || {};
          const parts = content.parts || [];
          
          for (const part of parts) {
            if (part.inlineData) {
              const b64 = part.inlineData.data;
              return NextResponse.json({ image: `data:image/png;base64,${b64}` });
            }
          }
        }
      } catch (err: any) {
        const errStr = String(err).toLowerCase();
        if (errStr.includes("404") || errStr.includes("not found")) {
          lastError = err;
          continue; // Tentar próximo modelo
        }
        throw err;
      }
    }

    if (lastError) {
      throw lastError;
    }

    return NextResponse.json({ error: "Nenhum modelo Gemini disponível para geração de imagens." }, { status: 500 });
  } catch (err) {
    console.error("Estudio imagem:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar imagem." },
      { status: 500 }
    );
  }
}
