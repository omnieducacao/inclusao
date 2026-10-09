import { describe, it, expect } from "vitest";
import { estimateCostUsd, priceForModel } from "@/lib/ai-pricing";

describe("custo estimado da IA", () => {
  it("calcula por milhão de tokens", () => {
    // deepseek-chat: 0,14 entrada / 0,28 saída por milhão
    expect(estimateCostUsd({ model: "deepseek-chat", tokensIn: 1_000_000, tokensOut: 500_000 })).toBeCloseTo(0.28, 6);
  });
  it("aceita nome com prefixo de provedor e cai no padrão quando não conhece", () => {
    expect(priceForModel("moonshotai/kimi-k2.5").inputPerMillionUsd).toBe(0.6);
    expect(priceForModel("modelo-novo").inputPerMillionUsd).toBe(0.2);
  });
  it("sem tokens, custo zero", () => {
    expect(estimateCostUsd({ model: "gpt-4o-mini" })).toBe(0);
  });
});
