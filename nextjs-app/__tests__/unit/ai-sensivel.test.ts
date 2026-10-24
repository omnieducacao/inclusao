/**
 * SCRUM-69, revisto em 24/10 (SCRUM-197): dados de estudante e de saúde só vão para o Omni IA
 * (Fireworks, só EUA, retenção zero), nunca para outro motor, nem como reserva. O SDK da OpenAI é simulado só para ver para onde cada chamada iria
 * (DeepSeek e Kimi usam o mesmo SDK, com outro baseURL). Nenhuma chamada de rede acontece.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } }));

const clientes: Array<{ apiKey?: string; baseURL?: string }> = [];
let falharOrange = false;
let falharOmni = false;

vi.mock("openai", () => ({
  default: class {
    constructor(opts: { apiKey?: string; baseURL?: string }) {
      clientes.push(opts);
    }
    chat = {
      completions: {
        create: async () => {
          const ultimo = clientes[clientes.length - 1];
          if (falharOrange && !ultimo.baseURL) throw new Error("OpenAI fora do ar");
          if (falharOmni && /fireworks/.test(ultimo.baseURL || "")) throw new Error("Fireworks fora do ar");
          return { model: "modelo-teste", usage: {}, choices: [{ message: { content: "resposta da IA com texto suficiente" } }] };
        },
      },
    };
  },
}));

import { chatCompletionText, motoresParaTentar, motorParaDadosSensiveis, OMNI_IA_INDISPONIVEL } from "@/lib/ai-engines";
import { anonymizeMessages } from "@/lib/ai-anonymize";

const CHAVES = ["DEEPSEEK_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY", "KIMI_API_KEY", "ANTHROPIC_API_KEY", "FIREWORKS_API_KEY"] as const;
const guardadas: Record<string, string | undefined> = {};
const msgs = [{ role: "user", content: "Gere um plano." }];
const opcoes = { useCache: false, trackUsage: false };

const usouDeepSeekOuKimi = () => clientes.some((c) => /api\.deepseek|moonshot|openrouter/i.test(c.baseURL || ""));
const soOmniIa = () => clientes.length > 0 && clientes.every((c) => c.baseURL === "https://us.api.fireworks.ai/inference/v1");

beforeEach(() => {
  clientes.length = 0;
  falharOrange = false;
  falharOmni = false;
  for (const k of CHAVES) {
    guardadas[k] = process.env[k];
    delete process.env[k];
  }
  process.env.DEEPSEEK_API_KEY = "chave-deepseek-de-teste";
  process.env.OPENROUTER_API_KEY = "chave-openrouter-de-teste";
  process.env.OPENAI_API_KEY = "sk-chave-openai-de-teste-1234567890";
  process.env.FIREWORKS_API_KEY = "chave-fireworks-de-teste";
});
afterEach(() => {
  for (const k of CHAVES) {
    if (guardadas[k] === undefined) delete process.env[k];
    else process.env[k] = guardadas[k];
  }
});

describe("política de motores para dados sensíveis", () => {
  it("controle: sem dados sensíveis, o DeepSeek continua sendo usado", async () => {
    await chatCompletionText("red", msgs, opcoes);
    expect(clientes.some((c) => /api\.deepseek/i.test(c.baseURL || ""))).toBe(true);
  });

  it("sensivel: true troca red pelo Omni IA (Fireworks, só EUA)", async () => {
    await chatCompletionText("red", msgs, { ...opcoes, sensivel: true });
    expect(usouDeepSeekOuKimi()).toBe(false);
    expect(clientes).toHaveLength(1);
    expect(soOmniIa()).toBe(true);
    expect(clientes[0].apiKey).toBe("chave-fireworks-de-teste");
  });

  it("sensivel: true troca blue (Kimi), orange e green pelo Omni IA", async () => {
    for (const e of ["blue", "orange", "green", "yellow"] as const) {
      clientes.length = 0;
      await chatCompletionText(e, msgs, { ...opcoes, sensivel: true });
      expect(soOmniIa()).toBe(true);
    }
  });

  it("mensagens que passaram por anonymizeMessages com nome de estudante ficam sensíveis", async () => {
    const { anonymized } = anonymizeMessages([{ role: "user", content: "Plano para Beatriz Almeida" }], "Beatriz Almeida");
    await chatCompletionText("red", anonymized, opcoes);
    expect(soOmniIa()).toBe(true);
  });

  it("mensagens com CPF ou e-mail achado ficam sensíveis mesmo sem nome de estudante", async () => {
    const { anonymized } = anonymizeMessages([{ role: "user", content: "Responsável: contato ana@exemplo.test" }]);
    await chatCompletionText("red", anonymized, opcoes);
    expect(soOmniIa()).toBe(true);
  });

  it("o prompt sem dado pessoal e sem nome não é marcado (red continua permitido)", async () => {
    const { anonymized } = anonymizeMessages([{ role: "user", content: "Sugira uma dinâmica de 10 minutos sobre frações." }]);
    await chatCompletionText("red", anonymized, opcoes);
    expect(clientes.some((c) => /api\.deepseek/i.test(c.baseURL || ""))).toBe(true);
  });

  it("a chave informada para o red não é enviada ao motor que o substituiu", async () => {
    await chatCompletionText("red", msgs, { ...opcoes, sensivel: true, apiKey: "chave-do-deepseek-do-usuario" });
    expect(clientes.some((c) => c.apiKey === "chave-do-deepseek-do-usuario")).toBe(false);
  });

  it("sem a chave da Fireworks, recusa em vez de cair em outro motor", async () => {
    delete process.env.FIREWORKS_API_KEY;
    await expect(chatCompletionText("red", msgs, { ...opcoes, sensivel: true })).rejects.toThrow(OMNI_IA_INDISPONIVEL);
    expect(clientes).toHaveLength(0);
  });

  it("se o Omni IA falhar, avisa e não tenta nenhum outro motor", async () => {
    falharOmni = true;
    await expect(chatCompletionText("orange", msgs, { ...opcoes, sensivel: true })).rejects.toThrow(OMNI_IA_INDISPONIVEL);
    expect(soOmniIa()).toBe(true);
    expect(clientes).toHaveLength(1);
  });

  it("Kimi que falha não cai mais em silêncio para o DeepSeek (sem dados sensíveis)", async () => {
    // única chave presente: OpenRouter (blue). A falha do blue deve subir, não virar chamada ao DeepSeek
    delete process.env.OPENAI_API_KEY;
    const { default: OpenAI } = await import("openai");
    expect(OpenAI).toBeDefined();
    falharOrange = false;
    // força o blue a falhar com resposta curta demais (< 10 caracteres)
    vi.doMock("openai", () => ({
      default: class {
        constructor(opts: { apiKey?: string; baseURL?: string }) {
          clientes.push(opts);
        }
        chat = { completions: { create: async () => ({ model: "m", usage: {}, choices: [{ message: { content: "curta" } }] }) } };
      },
    }));
    vi.resetModules();
    const { chatCompletionTextMotor } = await import("@/lib/ai-engines");
    await expect(chatCompletionTextMotor("blue", msgs, opcoes)).rejects.toThrow(/Kimi/);
    expect(clientes.some((c) => /deepseek/i.test(c.baseURL || ""))).toBe(false);
    vi.doUnmock("openai");
  });
});

describe("funções puras", () => {
  it("motorParaDadosSensiveis devolve sempre o Omni IA", () => {
    const livre = () => false;
    for (const e of ["red", "blue", "green", "yellow", "orange", "omni"] as const) {
      expect(motorParaDadosSensiveis(e, livre)).toBe("omni");
    }
  });

  it("sem o Omni IA configurado, recusa", () => {
    expect(() => motorParaDadosSensiveis("orange", (e) => e === "omni")).toThrow(OMNI_IA_INDISPONIVEL);
  });

  it("o reserva de uma conversa sensível nunca é red nem blue", () => {
    const proibidos = ["red", "blue"] as const;
    expect(motoresParaTentar("green", () => false, proibidos)).toEqual(["green", "orange"]);
    expect(motoresParaTentar("orange", () => false, proibidos)).toEqual(["orange", "yellow"]);
    expect(motoresParaTentar("orange", (e) => e === "yellow", proibidos)).toEqual(["orange"]);
  });
});
