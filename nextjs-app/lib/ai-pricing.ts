/**
 * Custo estimado das chamadas de IA (10/10/2026). Mesma tabela do OmniProf (lib/ai-pricing.ts),
 * com os modelos que a Omnisfera usa. Preços estimados, em dólar: texto por 1 milhão de tokens,
 * imagem por imagem. Quando um provedor mudar o preço, é aqui que se ajusta.
 */
export type ModelPrice = { inputPerMillionUsd: number; outputPerMillionUsd: number; imageUsd?: number };

export const MODEL_PRICES: Record<string, ModelPrice> = {
  // DeepSeek (motor vermelho, padrão)
  "deepseek-chat": { inputPerMillionUsd: 0.14, outputPerMillionUsd: 0.28 },
  "deepseek-flash": { inputPerMillionUsd: 0.14, outputPerMillionUsd: 0.28 },
  // OpenAI (laranja)
  "gpt-4o-mini": { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.6 },
  // Kimi (azul)
  "kimi-k2.5": { inputPerMillionUsd: 0.6, outputPerMillionUsd: 2.5 },
  "kimi-k2-0724": { inputPerMillionUsd: 0.6, outputPerMillionUsd: 2.5 },
  "kimi-k2.6": { inputPerMillionUsd: 0.6, outputPerMillionUsd: 2.5 },
  // Claude (verde)
  "claude-sonnet-4-20250514": { inputPerMillionUsd: 3.0, outputPerMillionUsd: 15.0 },
  "claude-haiku-4-5": { inputPerMillionUsd: 1.0, outputPerMillionUsd: 5.0 },
  // Gemini (amarelo)
  "gemini-2.0-flash": { inputPerMillionUsd: 0.1, outputPerMillionUsd: 0.4 },
  // Imagens
  "gpt-image-1": { inputPerMillionUsd: 0, outputPerMillionUsd: 0, imageUsd: 0.04 },
  "gemini-2.5-flash-image": { inputPerMillionUsd: 0, outputPerMillionUsd: 0, imageUsd: 0.04 },
};

const DEFAULT_PRICE: ModelPrice = { inputPerMillionUsd: 0.2, outputPerMillionUsd: 0.8 };

export function priceForModel(model: string): ModelPrice {
  const id = model.split("/").pop() || model;
  return MODEL_PRICES[id] || MODEL_PRICES[model] || DEFAULT_PRICE;
}

export function estimateCostUsd(opts: { model: string; tokensIn?: number; tokensOut?: number; images?: number }): number {
  const p = priceForModel(opts.model);
  const texto = ((opts.tokensIn || 0) / 1_000_000) * p.inputPerMillionUsd + ((opts.tokensOut || 0) / 1_000_000) * p.outputPerMillionUsd;
  const imagem = (opts.images || 0) * (p.imageUsd || 0);
  return Math.round((texto + imagem) * 1_000_000) / 1_000_000;
}

export type UsoChamada = { model: string; tokensIn?: number; tokensOut?: number; durationMs?: number };
