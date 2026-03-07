/**
 * Testes de Integração — API BNCC EF (/api/bncc/ef)
 *
 * Testa carregamento de habilidades BNCC Ensino Fundamental:
 * - Blocos por componente (modo padrão)
 * - Estrutura hierárquica (modo estrutura)
 * - Filtro por série
 * - Requer auth
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("@/lib/permissions", () => ({
    requireAuth: vi.fn().mockResolvedValue({ error: null, session: { id: "u1", workspace_id: "w1" } }),
}));

// Mock BNCC lib
vi.mock("@/lib/bncc", () => ({
    carregarHabilidadesEFPorComponente: vi.fn().mockReturnValue([
        { componente: "Matemática", habilidades: [{ codigo: "EF01MA01", descricao: "Contar de 1 a 10" }] },
        { componente: "Língua Portuguesa", habilidades: [{ codigo: "EF01LP01", descricao: "Ler e escrever" }] },
    ]),
    carregarEstruturaEF: vi.fn().mockReturnValue({
        disciplinas: ["Matemática", "Língua Portuguesa"],
        porDisciplina: {
            "Matemática": { unidades: ["Números"], porUnidade: { "Números": { objetos: ["Contagem"], porObjeto: {} } } },
        },
    }),
}));

import { GET } from "@/app/api/bncc/ef/route";

describe("API BNCC EF", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("retorna blocos por componente sem parâmetro estrutura", async () => {
        const req = new Request("http://localhost/api/bncc/ef?serie=1");
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(2);
        expect(data[0].componente).toBe("Matemática");
    });

    it("retorna estrutura hierárquica com estrutura=1", async () => {
        const req = new Request("http://localhost/api/bncc/ef?serie=1&estrutura=1");
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.disciplinas).toBeDefined();
        expect(data.disciplinas).toContain("Matemática");
    });

    it("retorna 401 sem autenticação", async () => {
        const { requireAuth } = await import("@/lib/permissions");
        (requireAuth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            error: new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { "Content-Type": "application/json" } }),
        });
        const req = new Request("http://localhost/api/bncc/ef");
        const res = await GET(req);
        expect(res.status).toBe(401);
    });
});
