/**
 * Testes de Integração — API Avaliação Diagnóstica Matriz (/api/avaliacao-diagnostica/matriz)
 *
 * A API lê arquivos JSON do disco (fs.readFileSync) para carregar a matriz BNCC.
 * Testamos os cenários possíveis com mocks dos dados.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "u1", workspace_id: "w1" }),
}));

// Mock fs to avoid reading actual files — return appropriate data based on path
const matrizData = {
    matrizes: {
        "Língua Portuguesa": {
            descritores: [{ codigo: "D01", habilidade: "Localizar informações" }],
        },
    },
    protocolo: { titulo: "Protocolo de Avaliação" },
    escala: { niveis: [{ nivel: 1, descricao: "Básico" }] },
};

const bnccData = [
    { codigo: "EF05MA01", segmento: "EF", ano: "5", disciplina: "Matemática", unidade_tematica: "Números", objeto_conhecimento: "Contagem", habilidade: "Contar", nivel_cognitivo_saeb: "I", prioridade_saeb: "Alta", instrumento_avaliativo: "Prova" },
];

vi.mock("fs", async () => {
    const actual = await vi.importActual("fs");
    return {
        ...actual,
        readFileSync: vi.fn().mockImplementation((path: string) => {
            if (path.includes("bncc_completa")) return JSON.stringify(bnccData);
            return JSON.stringify(matrizData);
        }),
    };
});

import { GET } from "@/app/api/avaliacao-diagnostica/matriz/route";

describe("API Avaliação Diagnóstica - Matriz", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it("retorna 401 sem sessão", async () => {
        const { getSession } = await import("@/lib/session");
        (getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/avaliacao-diagnostica/matriz");
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it("retorna dados com sessão válida e parâmetro area", async () => {
        const req = new Request("http://localhost/api/avaliacao-diagnostica/matriz?area=Matem%C3%A1tica");
        const res = await GET(req);
        expect(res.status).toBe(200);
    });

    it("retorna seção protocolo quando solicitado", async () => {
        const req = new Request("http://localhost/api/avaliacao-diagnostica/matriz?section=protocolo");
        const res = await GET(req);
        expect(res.status).toBe(200);
    });

    it("retorna seção escala quando solicitada", async () => {
        const req = new Request("http://localhost/api/avaliacao-diagnostica/matriz?section=escala");
        const res = await GET(req);
        expect(res.status).toBe(200);
    });
});
