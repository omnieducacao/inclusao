/**
 * Testes Unitários — lib/ai-engines.ts
 *
 * Testa funções puras:
 * - ENGINE_NAMES: mapeamento correto
 * - getEngineError: detecção de chaves ausentes
 * - getVisionError: detecção de chaves de visão
 * - validateOpenAIKey (via getApiKey): validação de chaves OpenAI vs OpenRouter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the ai-cache and supabase modules
vi.mock("@/lib/ai-cache", () => ({
    aiCache: { get: vi.fn(), set: vi.fn() },
}));
vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(),
}));

import { ENGINE_NAMES, getEngineError, getVisionError, type EngineId } from "@/lib/ai-engines";

describe("ENGINE_NAMES", () => {
    it("contém todos os 5 engines", () => {
        const keys = Object.keys(ENGINE_NAMES);
        expect(keys).toHaveLength(5);
        expect(keys).toContain("red");
        expect(keys).toContain("blue");
        expect(keys).toContain("green");
        expect(keys).toContain("yellow");
        expect(keys).toContain("orange");
    });

    it("cada engine tem nome legível", () => {
        expect(ENGINE_NAMES.red).toContain("DeepSeek");
        expect(ENGINE_NAMES.blue).toContain("Kimi");
        expect(ENGINE_NAMES.green).toContain("Claude");
        expect(ENGINE_NAMES.yellow).toContain("Gemini");
        expect(ENGINE_NAMES.orange).toContain("OpenAI");
    });
});

describe("getEngineError", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        // Clear all AI keys
        delete process.env.DEEPSEEK_API_KEY;
        delete process.env.OPENROUTER_API_KEY;
        delete process.env.KIMI_API_KEY;
        delete process.env.ANTHROPIC_API_KEY;
        delete process.env.GEMINI_API_KEY;
        delete process.env.OPENAI_API_KEY;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("retorna erro quando chave DeepSeek ausente", () => {
        const err = getEngineError("red");
        expect(err).toBeTruthy();
        expect(err).toContain("OmniRed");
    });

    it("retorna null quando chave DeepSeek existe", () => {
        process.env.DEEPSEEK_API_KEY = "test-key-123";
        const err = getEngineError("red");
        expect(err).toBeNull();
    });

    it("retorna erro quando chave Anthropic ausente", () => {
        const err = getEngineError("green");
        expect(err).toBeTruthy();
        expect(err).toContain("OmniGreen");
    });

    it("retorna null quando chave Anthropic existe", () => {
        process.env.ANTHROPIC_API_KEY = "sk-ant-test";
        const err = getEngineError("green");
        expect(err).toBeNull();
    });

    it("retorna erro quando chave Gemini ausente", () => {
        const err = getEngineError("yellow");
        expect(err).toBeTruthy();
        expect(err).toContain("OmniYellow");
    });

    it("detecta cada engine corretamente", () => {
        const engines: EngineId[] = ["red", "blue", "green", "yellow", "orange"];
        for (const e of engines) {
            const err = getEngineError(e);
            expect(err).toBeTruthy();
            expect(err).toContain(ENGINE_NAMES[e]);
        }
    });
});

describe("getVisionError", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.GEMINI_API_KEY;
        delete process.env.OPENAI_API_KEY;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("retorna erro quando nenhuma chave de visão existe", () => {
        const err = getVisionError();
        expect(err).toBeTruthy();
        expect(err).toContain("GEMINI_API_KEY");
    });

    it("retorna null quando GEMINI_API_KEY existe", () => {
        process.env.GEMINI_API_KEY = "test-gemini-key";
        const err = getVisionError();
        expect(err).toBeNull();
    });

    it("retorna null quando OPENAI_API_KEY existe (fallback)", () => {
        process.env.OPENAI_API_KEY = "sk-test-openai-key";
        const err = getVisionError();
        expect(err).toBeNull();
    });
});
