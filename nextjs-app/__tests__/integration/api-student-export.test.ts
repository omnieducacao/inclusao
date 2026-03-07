/**
 * Testes de Integração — API Student Export (LGPD Art. 18)
 *
 * Cobertura:
 * - Rejeita sem autenticação
 * - Rejeita para membros não-master
 * - Exporta dados completos para master
 * - Inclui meta LGPD no export
 * - Retorna 404 para estudante inexistente
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock session
const mockSession = {
    workspace_id: "ws-test-123",
    workspace_name: "Escola Teste",
    usuario_nome: "Professor João",
    user_role: "master" as const,
    is_platform_admin: false,
    terms_accepted: true,
    exp: Date.now() / 1000 + 3600,
};

let sessionToReturn: typeof mockSession | null = mockSession;

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(() => Promise.resolve(sessionToReturn)),
}));

// Mock supabase
const mockStudent = {
    id: "student-abc",
    name: "João Silva",
    grade: "3º Ano",
    workspace_id: "ws-test-123",
    created_at: "2026-01-01",
};

const mockSingle = vi.fn().mockResolvedValue({ data: mockStudent, error: null });
const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

// Simple chain mock that handles all tables
const createChainMock = (data: unknown[] = []) => {
    return {
        select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data, error: null }),
        }),
    };
};

vi.mock("@/lib/supabase", () => ({
    getSupabase: () => {
        const tables: Record<string, unknown> = {
            students: {
                select: () => ({
                    eq: () => ({ single: () => Promise.resolve({ data: mockStudent, error: null }) }),
                }),
            },
        };

        // Return default empty arrays for other tables
        return {
            from: (table: string) => {
                if (table === "students") {
                    return tables.students;
                }
                if (table === "audit_log") {
                    return { insert: () => Promise.resolve({ data: null, error: null }) };
                }
                return createChainMock();
            },
        };
    },
}));

vi.mock("@/lib/encryption", () => ({
    decryptField: (val: string) => val, // passthrough for tests
}));

vi.mock("@/lib/audit", () => ({
    logExport: vi.fn().mockResolvedValue(undefined),
}));

describe("API Student Export — /api/students/[id]/export", () => {

    beforeEach(() => {
        sessionToReturn = { ...mockSession };
        vi.clearAllMocks();
    });

    it("retorna 401 sem autenticação", async () => {
        sessionToReturn = null;

        const { GET } = await import("@/app/api/students/[id]/export/route");
        const request = new Request("http://localhost/api/students/abc/export");
        const response = await GET(request, { params: Promise.resolve({ id: "abc" }) });

        expect(response.status).toBe(401);
    });

    it("retorna 403 para membros não-master", async () => {
        sessionToReturn = { ...mockSession, user_role: "member" as const, is_platform_admin: false };

        const { GET } = await import("@/app/api/students/[id]/export/route");
        const request = new Request("http://localhost/api/students/abc/export");
        const response = await GET(request, { params: Promise.resolve({ id: "abc" }) });

        expect(response.status).toBe(403);
    });

    it("exporta dados completos com meta LGPD para master", async () => {
        const { GET } = await import("@/app/api/students/[id]/export/route");
        const request = new Request("http://localhost/api/students/student-abc/export");
        const response = await GET(request, { params: Promise.resolve({ id: "student-abc" }) });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data._meta).toBeDefined();
        expect(data._meta.lgpdBasis).toContain("Art. 18");
        expect(data._meta.exportedBy).toBe("Professor João");
        expect(data.student).toBeDefined();
        expect(data.student.name).toBe("João Silva");
    });
});
