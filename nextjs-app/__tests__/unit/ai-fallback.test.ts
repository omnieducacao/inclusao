/**
 * Onda 3: motor reserva e tempo-limite nas chamadas de IA (trazido do OmniProf).
 */
import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } }));
import { comFallback, motoresParaTentar } from "@/lib/ai-engines";

describe("motoresParaTentar", () => {
  it("escolhe um reserva configurado, nunca o Claude", () => {
    expect(motoresParaTentar("red", () => false)).toEqual(["red", "orange"]);
    expect(motoresParaTentar("green", () => false)).toEqual(["green", "red"]);
    expect(motoresParaTentar("red", (e) => e !== "red")).toEqual(["red"]);
  });
  it("Kimi já cai para o DeepSeek por dentro, então o reserva é outro", () => {
    expect(motoresParaTentar("blue", () => false)).toEqual(["blue", "orange"]);
  });
});

describe("comFallback", () => {
  it("usa o reserva quando o principal falha", async () => {
    const r = await comFallback(["red", "orange"], async (m) => {
      if (m === "red") throw new Error("fora do ar");
      return "ok do reserva";
    });
    expect(r).toBe("ok do reserva");
  });

  it("usa o reserva quando o principal demora demais", async () => {
    const r = await comFallback(
      ["red", "orange"],
      (m) => (m === "red" ? new Promise<string>((res) => setTimeout(() => res("tarde"), 200)) : Promise.resolve("rápido")),
      [20, 100]
    );
    expect(r).toBe("rápido");
  });

  it("resposta vazia conta como falha", async () => {
    const r = await comFallback(["red", "orange"], async (m) => (m === "red" ? "" : "cheio"), undefined, (x) => x.length > 0);
    expect(r).toBe("cheio");
  });

  it("sem reserva, devolve o erro do principal", async () => {
    await expect(comFallback(["red"], async () => { throw new Error("fora do ar"); })).rejects.toThrow("fora do ar");
  });
});
