/**
 * Multi-engine AI: OmniRed, OmniBlue, OmniGreen, OmniYellow, OmniOrange.
 * Compatível com omni_utils.chat_completion_multi_engine do Streamlit.
 */

export type EngineId = "red" | "blue" | "green" | "yellow" | "orange";

export const ENGINE_NAMES: Record<EngineId, string> = {
  red: "OmniRed (DeepSeek)",
  blue: "OmniBlue (Kimi)",
  green: "OmniGreen (Claude)",
  yellow: "OmniYellow (Gemini)",
  orange: "OmniOrange (OpenAI)",
};

function getEnv(key: string): string {
  return (process.env[key] || "").trim();
}

/**
 * Valida se uma chave do OpenAI não é uma chave do OpenRouter.
 * OPENAI_API_KEY deve começar com "sk-" mas NÃO com "sk-or-" (que é OpenRouter).
 * OPENROUTER_API_KEY começa com "sk-or-" e é apenas para engine "blue" (Kimi).
 */
function validateOpenAIKey(key: string, keyName: string = "OPENAI_API_KEY"): string {
  if (!key) return key;
  if (key.startsWith("sk-or-")) {
    throw new Error(
      `A variável ${keyName} está configurada com uma chave do OpenRouter (sk-or-...). ` +
      `Configure uma chave válida do OpenAI (sk-... mas não sk-or-...). ` +
      `Para usar Kimi/OpenRouter, configure OPENROUTER_API_KEY e use o engine "blue".`
    );
  }
  if (!key.startsWith("sk-")) {
    throw new Error(
      `A variável ${keyName} não parece ser uma chave válida do OpenAI (deve começar com "sk-").`
    );
  }
  return key;
}

function getApiKey(engine: EngineId, overrideKey?: string): string {
  const k = overrideKey?.trim();
  if (k) {
    // Se for engine orange e a chave for fornecida, validar
    if (engine === "orange") {
      return validateOpenAIKey(k, "apiKey override");
    }
    return k;
  }
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
      return validateOpenAIKey(getEnv("OPENAI_API_KEY"));
    default:
      return validateOpenAIKey(getEnv("OPENAI_API_KEY"));
  }
}

export function getEngineError(engine: EngineId): string | null {
  const key = getApiKey(engine);
  if (key) return null;
  return `Configure a chave para ${ENGINE_NAMES[engine]}. Ver .env.local.example.`;
}

/** Chat completion para motores de texto (red, blue, orange). */
export async function chatCompletionText(
  engine: EngineId,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; apiKey?: string; workspaceId?: string; source?: string; trackUsage?: boolean }
): Promise<string> {
  const temp = options?.temperature ?? 0.7;
  const apiKey = options?.apiKey || getApiKey(engine);
  const shouldTrack = options?.trackUsage !== false; // Por padrão, rastreia uso

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
    const result = (resp.choices[0]?.message?.content || "").trim();
    if (shouldTrack && result) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source }).catch(() => {});
    }
    return result;
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
    const result = (resp.choices[0]?.message?.content || "").trim();
    if (shouldTrack && result) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source }).catch(() => {});
    }
    return result;
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
    const result = (resp.choices[0]?.message?.content || "").trim();
    if (shouldTrack && result) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source }).catch(() => {});
    }
    return result;
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
    const result = (text && "text" in text ? text.text : "").trim();
    if (shouldTrack && result) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source, creditsConsumed: 2.0 }).catch(() => {});
    }
    return result;
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
    const textResult = (resp.text() || "").trim();
    if (shouldTrack && textResult) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source }).catch(() => {});
    }
    return textResult;
  }

  throw new Error(`Motor não suportado: ${engine}`);
}

/** Retorna a chave de API para visão (Gemini preferido, OpenAI fallback). */
export function getVisionApiKey(): { engine: "yellow" | "orange"; key: string } | null {
  const gemini = getEnv("GEMINI_API_KEY");
  if (gemini) return { engine: "yellow", key: gemini };
  const openai = getEnv("OPENAI_API_KEY");
  if (openai) {
    // Validar que não é uma chave do OpenRouter
    validateOpenAIKey(openai);
    return { engine: "orange", key: openai };
  }
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
