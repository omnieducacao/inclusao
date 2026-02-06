/**
 * Geração de imagens com Gemini (Nano Banana), alinhado ao Streamlit (omni_utils).
 * Usa @google/genai (SDK novo); não confundir com @google/generative-ai (só texto).
 * Timeout para evitar travamentos.
 */

const DEFAULT_TIMEOUT_MS = 90_000;

export type GeminiImageOptions = {
  apiKey?: string;
  timeoutMs?: number;
};

/**
 * Gera uma imagem PNG via Gemini. Modelos tentados: gemini-2.5-flash-image, gemini-3-pro-image-preview.
 * Retorna base64 da imagem (sem prefixo data:...).
 */
export async function generateImageWithGemini(
  prompt: string,
  options?: GeminiImageOptions
): Promise<string> {
  const apiKey = (options?.apiKey ?? process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new Error("Configure GEMINI_API_KEY para gerar imagens.");
  }

  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const run = async (): Promise<string> => {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const modelsToTry = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"] as const;
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        // SDK getter: "concatenation of all inline data parts from the first candidate"
        const data = (response as { data?: string }).data;
        if (data) return data;

        type Part = { inlineData?: { data?: string } };
        const candidates = (response as { candidates?: Array<{ content?: { parts?: Part[] } }> }).candidates;
        if (!candidates?.length) throw new Error("Resposta sem candidatos.");
        const parts = candidates[0]?.content?.parts ?? [];
        for (const part of parts) {
          const inline = part.inlineData;
          if (inline?.data) return inline.data;
        }
        throw new Error("Resposta sem partes de imagem.");
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const msg = lastError.message.toLowerCase();
        if (msg.includes("404") || msg.includes("not found")) {
          continue;
        }
        throw lastError;
      }
    }

    throw lastError ?? new Error("Nenhuma imagem gerada na resposta.");
  };

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Timeout ao gerar imagem com Gemini. Tente de novo.")), timeoutMs);
  });

  return Promise.race([run(), timeoutPromise]);
}
