import { describe, it, expect, vi } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => ({ data: null, error: null })),
                })),
            })),
        })),
    })),
}));

// Mock session
vi.mock("@/lib/session", () => ({
    getSession: vi.fn(() =>
        Promise.resolve({
            workspace_id: "ws-123",
            workspace_name: "Escola Teste",
            user_email: "prof@escola.com",
            user_name: "Professor",
            user_role: "master",
            is_platform_admin: false,
            member: null,
        })
    ),
}));

// Mock AI engines
vi.mock("@/lib/ai-engines", () => ({
    chatCompletionText: vi.fn(() =>
        Promise.resolve("Atividade gerada com sucesso para teste.")
    ),
    getEngineError: vi.fn(() => null),
    getEngineErrorWithWorkspace: vi.fn(() => Promise.resolve(null)),
}));

import { POST } from "@/app/api/hub/criar-atividade/route";

function makeRequest(body: Record<string, unknown>): Request {
    return new Request("http://localhost:3000/api/hub/criar-atividade", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": `hub-test-${Math.random().toString(36).slice(2)}`,
        },
        body: JSON.stringify(body),
    });
}

describe("API /api/hub/criar-atividade", () => {
    it("retorna 400 para engine inválido", async () => {
        const req = makeRequest({ engine: "invalid", assunto: "Frações" });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("retorna 400 sem assunto nem habilidades", async () => {
        const req = makeRequest({ engine: "red", assunto: "" });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("retorna 200 com dados válidos e assunto", async () => {
        const req = makeRequest({
            engine: "red",
            assunto: "Frações",
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty("texto");
    });

    it("retorna 200 com habilidades BNCC (sem assunto)", async () => {
        const req = makeRequest({
            engine: "blue",
            habilidades: ["EF03MA01"],
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
    });

    it("aceita dados com estudante", async () => {
        const req = makeRequest({
            engine: "green",
            assunto: "Multiplicação",
            estudante: {
                nome: "João",
                serie: "3º ano",
                hiperfoco: "dinossauros",
            },
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
    });
});
