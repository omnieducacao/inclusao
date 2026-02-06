/**
 * Multi-engine AI: OmniRed, OmniBlue, OmniGreen, OmniYellow, OmniOrange.
 * Compatível com omni_utils.chat_completion_multi_engine do Streamlit.
 */

export type EngineId = "red" | "blue" | "green" | "yellow" | "orange";

export const ENGINE_NAMES: Record<EngineId, string> = {
  red: "OmniRed",
  blue: "OmniBlue",
  green: "OmniGreen",
  yellow: "OmniYellow",
  orange: "OmniOrange",
};

function getEnv(key: string): string {
  return (process.env[key] || "").trim();
}

function getApiKey(engine: EngineId, overrideKey?: string): string {
  const k = overrideKey?.trim();
  if (k) return k;
  switch (engine) {
    case "red":
      return getEnv("DEEPSEEK_API_KEY");
    case "blue":
      return getEnv("OPENROUTER_API_KEY") || getEnv("KIMI_API_KEY");
    case "green":
      return getEnv("ANTHROPIC_API_KEY");
    case "yellow":
      return getEnv("GEMINI_API_KEY");
    case "orange":
      return getEnv("OPENAI_API_KEY");
    default:
      return getEnv("OPENAI_API_KEY");
  }
}

export function getEngineError(engine: EngineId): string | null {
  const key = getApiKey(engine);
  if (key) return null;
  // Sempre usa codenome para o usuário
  return `Configure a chave para ${ENGINE_NAMES[engine]}. Ver .env.local.example.`;
}

/** Chat completion para motores de texto (red, blue, orange). */
export async function chatCompletionText(
  engine: EngineId,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; apiKey?: string }
): Promise<string> {
  const temp = options?.temperature ?? 0.7;
  const apiKey = options?.apiKey || getApiKey(engine);

  // Orange (OpenAI)
  if (engine === "orange") {
    if (!apiKey) throw new Error("Configure OPENAI_API_KEY no ambiente.");
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
      temperature: temp,
    });
    return (resp.choices[0]?.message?.content || "").trim();
  }

  // Red (DeepSeek)
  if (engine === "red") {
    if (!apiKey) throw new Error("Configure DEEPSEEK_API_KEY no ambiente.");
    const baseUrl = getEnv("DEEPSEEK_BASE_URL") || "https://api.deepseek.com";
    const model = getEnv("DEEPSEEK_MODEL") || "deepseek-chat";
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey, baseURL: baseUrl });
    const resp = await client.chat.completions.create({
      model,
      messages: messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
      temperature: temp,
    });
    return (resp.choices[0]?.message?.content || "").trim();
  }

  // Blue (Kimi / OpenRouter)
  if (engine === "blue") {
    if (!apiKey) throw new Error("Configure OPENROUTER_API_KEY ou KIMI_API_KEY no ambiente.");
    const useOpenRouter = apiKey.startsWith("sk-or-");
    const baseUrl = useOpenRouter ? "https://openrouter.ai/api/v1" : (getEnv("OPENROUTER_BASE_URL") || "https://api.moonshot.ai/v1");
    const model = getEnv("KIMI_MODEL") || (useOpenRouter ? "moonshotai/kimi-k2.5" : "kimi-k2-turbo-preview");
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey, baseURL: baseUrl });
    const resp = await client.chat.completions.create({
      model,
      messages: messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
      temperature: temp,
    });
    return (resp.choices[0]?.message?.content || "").trim();
  }

  // Green (Claude) — requer @anthropic-ai/sdk
  if (engine === "green") {
    if (!apiKey) throw new Error("Configure ANTHROPIC_API_KEY no ambiente.");
    const { Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const system: string[] = [];
    const userParts: string[] = [];
    for (const m of messages) {
      const c = (m.content || "").trim();
      if (!c) continue;
      if (m.role === "system") system.push(c);
      else userParts.push(c);
    }
    const model = getEnv("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514";
    const resp = await client.messages.create({
      model,
      max_tokens: 4096,
      system: system.length ? system.join("\n\n") : undefined,
      messages: [{ role: "user", content: userParts.join("\n\n") || "Responda." }],
      temperature: temp,
    });
    const text = resp.content.find((c) => c.type === "text");
    return (text && "text" in text ? text.text : "").trim();
  }

  // Yellow (Gemini)
  if (engine === "yellow") {
    if (!apiKey) throw new Error("Configure GEMINI_API_KEY no ambiente.");
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const full = messages.map((m) => `[${m.role}]\n${m.content}`).join("\n\n");
    const result = await model.generateContent(full);
    const resp = result.response;
    return (resp.text() || "").trim();
  }

  throw new Error(`Motor não suportado: ${engine}`);
}

/** Retorna a chave de API para visão (Gemini preferido, OpenAI fallback). */
export function getVisionApiKey(): { engine: "yellow" | "orange"; key: string } | null {
  const gemini = getEnv("GEMINI_API_KEY");
  if (gemini) return { engine: "yellow", key: gemini };
  const openai = getEnv("OPENAI_API_KEY");
  if (openai) return { engine: "orange", key: openai };
  return null;
}

export function getVisionError(): string | null {
  const v = getVisionApiKey();
  if (v) return null;
  return "Configure GEMINI_API_KEY ou OPENAI_API_KEY para Adaptar Atividade (OCR/visão).";
}

/**
 * Vision: OCR + adaptação. Usa Gemini se disponível, senão OpenAI gpt-4o.
 * imageBase64: base64 da imagem (sem prefixo data:...)
 * mime: image/jpeg ou image/png
 */
export async function visionAdapt(
  prompt: string,
  imageBase64: string,
  mime: string,
  options?: { apiKey?: string }
): Promise<string> {
  const v = options?.apiKey ? { engine: "orange" as const, key: options.apiKey } : getVisionApiKey();
  if (!v) throw new Error(getVisionError() || "Chave de visão não configurada.");

  if (v.engine === "yellow") {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(v.key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mime || "image/jpeg",
      },
    };
    const result = await model.generateContent([{ text: prompt }, imagePart]);
    return (result.response.text() || "").trim();
  }

  // Orange (OpenAI gpt-4o)
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: v.key });
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mime};base64,${imageBase64}` } },
          { type: "text", text: prompt },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0.4,
  });
  return (completion.choices[0]?.message?.content || "").trim();
}
