/**
 * Multi-engine AI: OmniRed, OmniBlue, OmniGreen, OmniYellow, OmniOrange.
 * Compatível com omni_utils.chat_completion_multi_engine do Streamlit.
 * Inclui cache LRU com TTL para reduzir custos.
 * OmniGreen (Claude) restrito a plan = 'robusto' (5.2.1).
 */

import { aiCache } from "./ai-cache";
import { getSupabase } from "./supabase";
import { logger } from "@/lib/logger";

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

/**
 * Verifica engine + plano do workspace (OmniGreen só para plan = 'robusto').
 * Usar nas rotas API que têm session.workspace_id.
 */
export async function getEngineErrorWithWorkspace(
  engine: EngineId,
  workspaceId?: string | null
): Promise<string | null> {
  const baseErr = getEngineError(engine);
  if (baseErr) return baseErr;
  if (engine === "green" && workspaceId) {
    try {
      const sb = getSupabase();
      const { data } = await sb.from("workspaces").select("plan").eq("id", workspaceId).maybeSingle();
      if (data && data.plan !== "robusto") {
        return "OmniGreen (Claude) está disponível apenas para o plano Robusto. Entre em contato com o administrador para migrar de plano.";
      }
    } catch { /* expected fallback */
      // Falha ao consultar — permitir (evitar bloquear por erro de DB)
    }
  }
  return null;
}

/**
 * Onda 3 (trazido do OmniProf): tempo-limite e motor reserva.
 * Tenta o motor escolhido; se ele demorar demais, falhar ou responder vazio, tenta um motor reserva
 * configurado (nunca o Claude, que é restrito ao plano). Um só reserva.
 */
const ORDEM_RESERVA: EngineId[] = ["red", "orange", "yellow", "blue"];
const TEMPO_PRINCIPAL_MS = 90_000; // o Render não corta a rota; um PEI longo pode levar mais de 1 min
const TEMPO_RESERVA_MS = 75_000;

export function motoresParaTentar(escolhido: EngineId, temErro: (e: EngineId) => boolean): EngineId[] {
  const reserva = ORDEM_RESERVA.find((e) => e !== escolhido && !(escolhido === "blue" && e === "red") && !temErro(e));
  return reserva ? [escolhido, reserva] : [escolhido];
}

export async function comFallback<T>(
  motores: EngineId[],
  executar: (motor: EngineId, indice: number) => Promise<T>,
  tempos: number[] = [TEMPO_PRINCIPAL_MS, TEMPO_RESERVA_MS],
  valido: (r: T) => boolean = () => true
): Promise<T> {
  let ultimoErro: unknown = new Error("Nenhum motor de IA disponível.");
  for (let i = 0; i < motores.length; i++) {
    const motor = motores[i];
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const tempo = new Promise<never>((_, rej) => {
        timer = setTimeout(() => rej(new Error(`O motor ${ENGINE_NAMES[motor] ?? motor} demorou demais.`)), tempos[i] ?? tempos[tempos.length - 1]);
      });
      const r = await Promise.race([executar(motor, i), tempo]);
      if (!valido(r)) throw new Error(`Resposta vazia do motor ${ENGINE_NAMES[motor] ?? motor}.`);
      return r;
    } catch (err) {
      ultimoErro = err;
      if (i < motores.length - 1) {
        logger.warn({ err: err instanceof Error ? err.message : String(err), motor, reserva: motores[i + 1] }, "IA: usando motor reserva");
      }
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw ultimoErro;
}

/** Tokens e modelo de uma resposta no formato OpenAI (DeepSeek, Kimi e OpenAI usam o mesmo). */
function usoOpenAI(resp: { model?: string; usage?: { prompt_tokens?: number; completion_tokens?: number } | null }, inicio: number) {
  return { model: resp.model || "desconhecido", tokensIn: resp.usage?.prompt_tokens, tokensOut: resp.usage?.completion_tokens, durationMs: Date.now() - inicio };
}

/** Chat completion com tempo-limite e motor reserva (use esta). */
export async function chatCompletionText(
  engine: EngineId,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; apiKey?: string; workspaceId?: string; source?: string; trackUsage?: boolean; useCache?: boolean; max_tokens?: number }
): Promise<string> {
  const motores = motoresParaTentar(engine, (e) => Boolean(getEngineError(e)));
  return comFallback(
    motores,
    (motor, i) => chatCompletionTextMotor(motor, messages, i === 0 ? options : { ...options, apiKey: undefined }),
    undefined,
    (r) => typeof r === "string" && r.trim().length > 0
  );
}

/** Chat completion num motor só, sem reserva (red, blue, orange, green, yellow). */
export async function chatCompletionTextMotor(
  engine: EngineId,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; apiKey?: string; workspaceId?: string; source?: string; trackUsage?: boolean; useCache?: boolean; max_tokens?: number }
): Promise<string> {
  const temp = options?.temperature ?? 0.7;
  const inicio = Date.now();
  const apiKey = options?.apiKey || getApiKey(engine);
  const shouldTrack = options?.trackUsage !== false; // Por padrão, rastreia uso
  const shouldCache = options?.useCache !== false; // Por padrão, usa cache

  // Verificar cache antes de chamar a IA
  if (shouldCache) {
    const cached = aiCache.get(engine, messages);
    if (cached) return cached;
  }

  // Orange (OpenAI)
  if (engine === "orange") {
    if (!apiKey) throw new Error("Configure OPENAI_API_KEY no ambiente.");
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
      temperature: temp,
      max_tokens: options?.max_tokens || 4096,
    });
    const result = (resp.choices[0]?.message?.content || "").trim();
    if (shouldCache && result) aiCache.set(engine, messages, result);
    if (shouldTrack && result) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source, uso: usoOpenAI(resp, inicio) }).catch(() => { });
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
      max_tokens: options?.max_tokens || 8192,
    });
    const result = (resp.choices[0]?.message?.content || "").trim();
    if (shouldCache && result) aiCache.set(engine, messages, result);
    if (shouldTrack && result) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source, uso: usoOpenAI(resp, inicio) }).catch(() => { });
    }
    return result;
  }

  // Blue (Kimi / OpenRouter) — with auto-fallback to Red
  if (engine === "blue") {
    if (!apiKey) throw new Error("Configure OPENROUTER_API_KEY ou KIMI_API_KEY no ambiente.");
    const useOpenRouter = apiKey.startsWith("sk-or-");
    const baseUrl = useOpenRouter
      ? "https://openrouter.ai/api/v1"
      : (getEnv("OPENROUTER_BASE_URL") || "https://api.moonshot.cn/v1");
    const model = getEnv("KIMI_MODEL")
      || (useOpenRouter ? "moonshotai/kimi-k2.5" : "kimi-k2-0724");

    try {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey, baseURL: baseUrl });
      const resp = await client.chat.completions.create({
        model,
        messages: messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
        temperature: temp,
        max_tokens: options?.max_tokens || 4096,
      });
      const result = (resp.choices[0]?.message?.content || "").trim();

      if (!result || result.length < 10) {
        throw new Error("Resposta vazia ou inválida do Kimi K2");
      }

      if (shouldCache && result) aiCache.set(engine, messages, result);
      if (shouldTrack && result) {
        const { trackAIUsage } = await import("./tracking");
        trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source, uso: usoOpenAI(resp, inicio) }).catch(() => { });
      }
      return result;
    } catch (err) {
      logger.error({ err: err instanceof Error ? err : new Error(String(err)) }, "OmniBlue falhou, ativando fallback para OmniRed");
      // Fallback automático para OmniRed (DeepSeek)
      return await chatCompletionTextMotor("red", messages, {
        ...options,
        temperature: temp,
      });
    }
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
      max_tokens: options?.max_tokens || 8192,
      system: system.length ? system.join("\n\n") : undefined,
      messages: [{ role: "user", content: userParts.join("\n\n") || "Responda." }],
      temperature: temp,
    });
    const text = resp.content.find((c) => c.type === "text");
    const result = (text && "text" in text ? text.text : "").trim();
    if (shouldTrack && result) {
      const { trackAIUsage } = await import("./tracking");
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source, creditsConsumed: 2.0, uso: { model, tokensIn: resp.usage?.input_tokens, tokensOut: resp.usage?.output_tokens, durationMs: Date.now() - inicio } }).catch(() => { });
    }
    if (shouldCache && result) aiCache.set(engine, messages, result);
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
      trackAIUsage(engine, { workspaceId: options?.workspaceId, source: options?.source, uso: { model: "gemini-2.0-flash", tokensIn: resp.usageMetadata?.promptTokenCount, tokensOut: resp.usageMetadata?.candidatesTokenCount, durationMs: Date.now() - inicio } }).catch(() => { });
    }
    if (shouldCache && textResult) aiCache.set(engine, messages, textResult);
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
