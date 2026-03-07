/**
 * Testes de Integração — API PAEE
 *
 * Cobertura:
 * - POST /api/paee/relatorio-ciclo (Geração de relatórios cruzando diário e PAEE)
 * - PATCH /api/students/[id]/paee (Atualização do documento e ciclos)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Session ────────────────────────────────────────────────────────────────
const defaultSession = {
    workspace_id: "ws-test",
    workspace_name: "Escola Teste",
    usuario_nome: "Prof. Ana",
    user_role: "member" as const,
    is_platform_admin: false,
    terms_accepted: true,
    exp: Date.now() / 1000 + 3600,
    member: { id: "member-1" },
};

let sessionToReturn: typeof defaultSession | null = defaultSession;

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(() => Promise.resolve(sessionToReturn)),
}));

// ─── Mock Permission ─────────────────────────────────────────────────────────────
vi.mock("@/lib/permissions", () => ({
    requirePermission: vi.fn(() => null),
}));

// ─── Mock Rate Limit ─────────────────────────────────────────────────────────────
vi.mock("@/lib/rate-limit", () => ({
    rateLimitResponse: vi.fn(() => null),
    RATE_LIMITS: { AI_GENERATION: {} },
}));

// ─── Mock AI / Anonymize ──────────────────────────────────────────────────────────
vi.mock("@/lib/ai-anonymize", () => ({
    anonymizeMessages: vi.fn((msgs) => ({
        anonymized: msgs,
        restore: (t: string) => t,
    })),
}));

vi.mock("@/lib/ai-engines", () => ({
    chatCompletionText: vi.fn(() => Promise.resolve("Relatório gerado pela IA com base nos ciclos.")),
    getEngineError: vi.fn(() => null),
}));

// ─── Mock Validation ─────────────────────────────────────────────────────────────
vi.mock("@/lib/validation", () => ({
    parseBody: vi.fn(async (req, schema) => {
        const data = await req.json();
        if (!data.studentId && schema === "paeeRelatorioCicloSchema") {
            return { error: new Response(JSON.stringify({ error: "Faltam campos" }), { status: 400 }) };
        }
        return { data, error: null };
    }),
    paeeRelatorioCicloSchema: "paeeRelatorioCicloSchema",
    studentPatchDataSchema: "studentPatchDataSchema",
}));

// ─── Mock Supabase & Services ─────────────────────────────────────────────────────
vi.mock("@/lib/students", () => ({
    updateStudentPaeeCiclos: vi.fn(() => Promise.resolve({ success: true })),
}));

function createChainMock(data: unknown) {
    const terminal = {
        single: vi.fn(() => Promise.resolve({ data, error: null })),
        limit: vi.fn(() => Promise.resolve({ data, error: null })),
    };
    const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        ...terminal,
    };
    return chain;
}

vi.mock("@/lib/supabase", () => ({
    getSupabase: vi.fn(() => ({
        from: vi.fn((table: string) => {
            if (table === "students") {
                return createChainMock({ name: "João", pei_data: { diagnostico: "TEA" } });
            }
            if (table === "diario_registros") {
                return createChainMock([
                    { data_sessao: "2026-03-01", duracao_minutos: 45, engajamento_aluno: 4 }
                ]);
            }
            return createChainMock(null);
        }),
    })),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────────
import { POST as relatorioCiclo } from "@/app/api/paee/relatorio-ciclo/route";
import { PATCH as updatePaee } from "@/app/api/students/[id]/paee/route";

// ─── Tests ────────────────────────────────────────────────────────────────────────
describe("API PAEE", () => {
    beforeEach(() => {
        sessionToReturn = { ...defaultSession };
        vi.clearAllMocks();
    });

    describe("POST /api/paee/relatorio-ciclo", () => {
        it("retorna 401 sem autenticação", async () => {
            sessionToReturn = null;
            const req = new Request("http://localhost/api/paee/relatorio-ciclo", {
                method: "POST",
                body: JSON.stringify({ studentId: "s1", ciclo: { nome: "Ciclo 1" }, engine: "red" })
            });
            const res = await relatorioCiclo(req);
            expect(res.status).toBe(401);
        });

        it("retorna 400 se validação falhar", async () => {
            const req = new Request("http://localhost/api/paee/relatorio-ciclo", {
                method: "POST",
                body: JSON.stringify({ ciclo: { nome: "Sem id" } })
            });
            const res = await relatorioCiclo(req);
            expect(res.status).toBe(400);
        });

        it("gera o relatório com sucesso comunicando com IA", async () => {
            const req = new Request("http://localhost/api/paee/relatorio-ciclo", {
                method: "POST",
                body: JSON.stringify({ studentId: "s1", ciclo: { nome: "Ciclo 1" }, engine: "red" })
            });
            const res = await relatorioCiclo(req);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.texto).toBe("Relatório gerado pela IA com base nos ciclos.");
        });
    });

    describe("PATCH /api/students/[id]/paee", () => {
        it("retorna 401 sem autenticação", async () => {
            sessionToReturn = null;
            const req = new Request("http://localhost/api/students/123/paee", {
                method: "PATCH",
                body: JSON.stringify({})
            });
            const res = await updatePaee(req, { params: Promise.resolve({ id: "123" }) });
            expect(res.status).toBe(401);
        });

        it("chama updateStudentPaeeCiclos com sucesso", async () => {
            const req = new Request("http://localhost/api/students/123/paee", {
                method: "PATCH",
                body: JSON.stringify({ paee_ciclos: [], status_planejamento: "rascunho" })
            });
            const res = await updatePaee(req, { params: Promise.resolve({ id: "123" }) });
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.ok).toBe(true);
        });
    });
});
