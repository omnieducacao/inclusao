import { describe, expect, it, beforeEach } from "vitest";
import { limiteEmMemoria, zerarLimiteEmMemoria, LIMITES_MEMORIA } from "@/lib/upstash-rate-limit";

describe("limite por IP em memória (Onda 89)", () => {
  beforeEach(() => zerarLimiteEmMemoria());
  it("bloqueia depois do máximo e libera quando a janela vira", () => {
    const { max, janelaMs } = LIMITES_MEMORIA.ai;
    for (let i = 0; i < max; i++) expect(limiteEmMemoria("1.2.3.4", "ai", 1000).success).toBe(true);
    expect(limiteEmMemoria("1.2.3.4", "ai", 1000).success).toBe(false);
    expect(limiteEmMemoria("5.6.7.8", "ai", 1000).success).toBe(true);
    expect(limiteEmMemoria("1.2.3.4", "ai", 1000 + janelaMs).success).toBe(true);
  });
});
