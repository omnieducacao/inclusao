/**
 * Testes de Integração — API School Grades (/api/school/grades)
 *
 * Testa gestão de séries da escola:
 * - GET retorna séries com IDs selecionados
 * - GET requer auth
 * - PATCH atualiza séries
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({
        id: "u1",
        workspace_id: "w1",
    }),
}));

vi.mock("@/lib/school", () => ({
    listGrades: vi.fn().mockResolvedValue([
        { id: "g1", code: "EF1", label: "EF: 1º Ano" },
        { id: "g2", code: "EF2", label: "EF: 2º Ano" },
    ]),
    listWorkspaceGrades: vi.fn().mockResolvedValue(["g1"]),
    listGradesForWorkspace: vi.fn().mockResolvedValue([
        { id: "g1", code: "EF1", label: "EF: 1º Ano" },
        { id: "g2", code: "EF2", label: "EF: 2º Ano" },
    ]),
    setWorkspaceGrades: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/lib/validation", () => ({
    parseBody: vi.fn().mockResolvedValue({
        data: { grade_ids: ["g1", "g2"] },
        error: null,
    }),
    schoolGradePatchSchema: {},
}));

import { GET, PATCH } from "@/app/api/school/grades/route";

describe("API School Grades", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("GET retorna séries e IDs selecionados", async () => {
        const req = new Request("http://localhost/api/school/grades");
        const res = await GET(req as never);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.grades).toHaveLength(2);
        expect(data.selected_ids).toContain("g1");
    });

    it("GET retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/school/grades");
        const res = await GET(req as never);
        expect(res.status).toBe(401);
    });

    it("GET for_workspace retorna grades para workspace", async () => {
        const req = new Request("http://localhost/api/school/grades?for_workspace=1");
        const res = await GET(req as never);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.grades).toBeDefined();
    });

    it("PATCH atualiza séries selecionadas", async () => {
        const req = new Request("http://localhost/api/school/grades", {
            method: "PATCH",
            body: JSON.stringify({ grade_ids: ["g1", "g2"] }),
        });
        const res = await PATCH(req as never);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.ok).toBe(true);
    });

    it("PATCH retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/school/grades", {
            method: "PATCH",
            body: JSON.stringify({ grade_ids: [] }),
        });
        const res = await PATCH(req as never);
        expect(res.status).toBe(401);
    });
});
