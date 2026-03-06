/**
 * Testes Unitários — AI Engines Configuration
 *
 * Verifica configurações dos engines de IA,
 * especialmente OmniBlue (Kimi K2) após correção.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// We can't import the actual engine without API keys, but we can verify the configuration
const aiEnginesSource = readFileSync(
    join(process.cwd(), "lib/ai-engines.ts"),
    "utf-8"
);

describe("ai-engines configuration", () => {
    describe("OmniBlue (Kimi K2)", () => {
        it("usa URL correta api.moonshot.cn", () => {
            expect(aiEnginesSource).toContain("api.moonshot.cn/v1");
            // Should NOT use old URL
            expect(aiEnginesSource).not.toContain("api.moonshot.ai/v1");
        });

        it("usa modelo kimi-k2-0724", () => {
            expect(aiEnginesSource).toContain("kimi-k2-0724");
            // Should NOT use old model
            expect(aiEnginesSource).not.toContain("kimi-k2-turbo-preview");
        });

        it("tem max_tokens configurado", () => {
            // The blue engine block should include max_tokens
            const blueBlock = aiEnginesSource.slice(
                aiEnginesSource.indexOf('// Blue (Kimi'),
                aiEnginesSource.indexOf('// Green (Claude')
            );
            expect(blueBlock).toContain("max_tokens");
        });

        it("tem fallback automático para OmniRed", () => {
            const blueBlock = aiEnginesSource.slice(
                aiEnginesSource.indexOf('// Blue (Kimi'),
                aiEnginesSource.indexOf('// Green (Claude')
            );
            expect(blueBlock).toContain("fallback");
            expect(blueBlock).toContain('"red"');
            expect(blueBlock).toContain("catch");
        });

        it("valida resposta não vazia", () => {
            const blueBlock = aiEnginesSource.slice(
                aiEnginesSource.indexOf('// Blue (Kimi'),
                aiEnginesSource.indexOf('// Green (Claude')
            );
            expect(blueBlock).toContain("result.length < 10");
        });
    });

    describe("Engine IDs", () => {
        it("define 5 engines: red, blue, green, yellow, orange", () => {
            expect(aiEnginesSource).toContain('"red"');
            expect(aiEnginesSource).toContain('"blue"');
            expect(aiEnginesSource).toContain('"green"');
            expect(aiEnginesSource).toContain('"yellow"');
            expect(aiEnginesSource).toContain('"orange"');
        });
    });

    describe("OmniRed (DeepSeek)", () => {
        it("usa DeepSeek como engine padrão", () => {
            expect(aiEnginesSource).toContain("deepseek");
        });
    });

    describe("OmniGreen (Claude)", () => {
        it("usa Claude Sonnet", () => {
            expect(aiEnginesSource).toContain("claude");
        });
    });

    describe("OmniYellow (Gemini)", () => {
        it("usa Gemini", () => {
            expect(aiEnginesSource).toContain("gemini");
        });
    });
});
