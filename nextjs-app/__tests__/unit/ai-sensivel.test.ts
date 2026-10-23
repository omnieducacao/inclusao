/**
 * SCRUM-69: dados de estudante e de saúde nunca vão para DeepSeek (red) nem Kimi (blue),
 * nem como motor reserva. O SDK da OpenAI é simulado só para ver para onde cada chamada iria
 * (DeepSeek e Kimi usam o mesmo SDK, com outro baseURL). Nenhuma chamada de rede acontece.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } }));

const clientes: Array<{ apiKey?: string; baseURL?: string }> = [];
let falharOrange = false;

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
          return { model: "modelo-teste", usage: {}, choices: [{ message: { content: "resposta da IA com texto suficiente" } }] };
        },
      },
    };
  },
}));

import { chatCompletionText, motoresParaTentar, motorParaDadosSensiveis } from "@/lib/ai-engines";
import { anonymizeMessages } from "@/lib/ai-anonymize";

const CHAVES = ["DEEPSEEK_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY", "KIMI_API_KEY", "ANTHROPIC_API_KEY"] as const;
const guardadas: Record<string, string | undefined> = {};
const msgs = [{ role: "user", content: "Gere um plano." }];
const opcoes = { useCache: false, trackUsage: false };

const usouDeepSeekOuKimi = () => clientes.some((c) => /deepseek|moonshot|openrouter/i.test(c.baseURL || ""));

beforeEach(() => {
  clientes.length = 0;
  falharOrange = false;
  for (const k of CHAVES) {
    guardadas[k] = process.env[k];
    delete process.env[k];
  }
  process.env.DEEPSEEK_API_KEY = "chave-deepseek-de-teste";
  process.env.OPENROUTER_API_KEY = "chave-openrouter-de-teste";
  process.env.OPENAI_API_KEY = "sk-chave-openai-de-teste-1234567890";
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
    expect(clientes.some((c) => /deepseek/i.test(c.baseURL || ""))).toBe(true);
  });

  it("sensivel: true troca red por OmniOrange (OpenAI direto)", async () => {
    await chatCompletionText("red", msgs, { ...opcoes, sensivel: true });
    expect(usouDeepSeekOuKimi()).toBe(false);
    expect(clientes).toHaveLength(1);
    expect(clientes[0].apiKey).toContain("chave-openai");
  });

  it("sensivel: true troca blue (Kimi) por OmniOrange", async () => {
    await chatCompletionText("blue", msgs, { ...opcoes, sensivel: true });
    expect(usouDeepSeekOuKimi()).toBe(false);
  });

  it("mensagens que passaram por anonymizeMessages com nome de estudante ficam sensíveis", async () => {
    const { anonymized } = anonymizeMessages([{ role: "user", content: "Plano para Beatriz Almeida" }], "Beatriz Almeida");
    await chatCompletionText("red", anonymized, opcoes);
    expect(usouDeepSeekOuKimi()).toBe(false);
  });

  it("mensagens com CPF ou e-mail achado ficam sensíveis mesmo sem nome de estudante", async () => {
    const { anonymized } = anonymizeMessages([{ role: "user", content: "Responsável: contato ana@exemplo.test" }]);
    await chatCompletionText("red", anonymized, opcoes);
    expect(usouDeepSeekOuKimi()).toBe(false);
  });

  it("o prompt sem dado pessoal e sem nome não é marcado (red continua permitido)", async () => {
    const { anonymized } = anonymizeMessages([{ role: "user", content: "Sugira uma dinâmica de 10 minutos sobre frações." }]);
    await chatCompletionText("red", anonymized, opcoes);
    expect(clientes.some((c) => /deepseek/i.test(c.baseURL || ""))).toBe(true);
  });

  it("a chave informada para o red não é enviada ao motor que o substituiu", async () => {
    await chatCompletionText("red", msgs, { ...opcoes, sensivel: true, apiKey: "chave-do-deepseek-do-usuario" });
    expect(clientes.some((c) => c.apiKey === "chave-do-deepseek-do-usuario")).toBe(false);
  });

  it("sem OpenAI nem Gemini configurados, recusa em vez de cair no DeepSeek", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(chatCompletionText("red", msgs, { ...opcoes, sensivel: true })).rejects.toThrow(/OmniOrange|OmniYellow/);
    expect(clientes).toHaveLength(0);
  });

  it("se o OmniOrange falhar, o reserva nunca é DeepSeek nem Kimi", async () => {
    falharOrange = true;
    await expect(chatCompletionText("orange", msgs, { ...opcoes, sensivel: true })).rejects.toThrow();
    expect(usouDeepSeekOuKimi()).toBe(false);
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
  it("motorParaDadosSensiveis mantém motores permitidos e troca red e blue", () => {
    const livre = () => false;
    expect(motorParaDadosSensiveis("orange", livre)).toBe("orange");
    expect(motorParaDadosSensiveis("yellow", livre)).toBe("yellow");
    expect(motorParaDadosSensiveis("green", livre)).toBe("green");
    expect(motorParaDadosSensiveis("red", livre)).toBe("orange");
    expect(motorParaDadosSensiveis("blue", livre)).toBe("orange");
  });

  it("sem OmniOrange, vai para OmniYellow; sem nenhum, recusa", () => {
    expect(motorParaDadosSensiveis("red", (e) => e === "orange")).toBe("yellow");
    expect(() => motorParaDadosSensiveis("red", (e) => e === "orange" || e === "yellow")).toThrow();
  });

  it("o reserva de uma conversa sensível nunca é red nem blue", () => {
    const proibidos = ["red", "blue"] as const;
    expect(motoresParaTentar("green", () => false, proibidos)).toEqual(["green", "orange"]);
    expect(motoresParaTentar("orange", () => false, proibidos)).toEqual(["orange", "yellow"]);
    expect(motoresParaTentar("orange", (e) => e === "yellow", proibidos)).toEqual(["orange"]);
  });
});
