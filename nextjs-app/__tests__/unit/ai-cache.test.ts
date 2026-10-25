import { describe, it, expect } from "vitest";
import { aiCache } from "@/lib/ai-cache";

const msgs = [{ role: "user", content: "Sugira três adaptações para o Estudante A." }];
const resposta = "x".repeat(80);

describe("cache de IA por escola (SCRUM-73)", () => {
    it("a resposta guardada por uma escola não aparece para outra", () => {
        aiCache.set("omni", msgs, resposta, undefined, "escola-1");
        expect(aiCache.get("omni", msgs, "escola-1")).toBe(resposta);
        expect(aiCache.get("omni", msgs, "escola-2")).toBeNull();
        expect(aiCache.get("omni", msgs)).toBeNull();
    });

    it("motor diferente não reaproveita", () => {
        aiCache.set("red", msgs, resposta, undefined, "escola-3");
        expect(aiCache.get("blue", msgs, "escola-3")).toBeNull();
    });
});
