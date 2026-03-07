/**
 * Testes — useHubGenerate hook
 *
 * Testa a lógica de geração do Hub:
 * - Estado inicial
 * - Validação antes de gerar
 * - Chamada de API com sucesso
 * - Chamada de API com erro
 * - Reset
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import "../component/setup";

// Mock AI Loading
vi.mock("@/hooks/useAILoading", () => ({
    aiLoadingStart: vi.fn(),
    aiLoadingStop: vi.fn(),
}));

import { useHubGenerate } from "@/hooks/useHubGenerate";

describe("useHubGenerate", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("estado inicial: loading=false, erro=null, resultado=null", () => {
        const { result } = renderHook(() =>
            useHubGenerate({ endpoint: "/api/test", engine: "red" })
        );

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
        expect(result.current.resultado).toBeNull();
        expect(result.current.validado).toBe(false);
    });

    it("bloqueia geração quando validação falha", async () => {
        const { result } = renderHook(() =>
            useHubGenerate({
                endpoint: "/api/test",
                engine: "red",
                validate: () => "Campo obrigatório",
            })
        );

        await act(async () => {
            await result.current.gerar({ data: "test" });
        });

        expect(result.current.erro).toBe("Campo obrigatório");
        expect(result.current.resultado).toBeNull();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("gera com sucesso quando API retorna OK", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ texto: "Resultado gerado com sucesso!" }),
        });

        const { result } = renderHook(() =>
            useHubGenerate({ endpoint: "/api/hub/test", engine: "blue" })
        );

        await act(async () => {
            await result.current.gerar({ materia: "Português" });
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
        expect(result.current.resultado).toBe("Resultado gerado com sucesso!");
        expect(global.fetch).toHaveBeenCalledWith("/api/hub/test", expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ materia: "Português" }),
        }));
    });

    it("captura erro da API", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: "Motor IA indisponível" }),
        });

        const { result } = renderHook(() =>
            useHubGenerate({ endpoint: "/api/hub/test", engine: "red" })
        );

        await act(async () => {
            await result.current.gerar({ data: "test" });
        });

        expect(result.current.erro).toBe("Motor IA indisponível");
        expect(result.current.resultado).toBeNull();
    });

    it("captura erro de rede", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

        const { result } = renderHook(() =>
            useHubGenerate({ endpoint: "/api/hub/test", engine: "red" })
        );

        await act(async () => {
            await result.current.gerar({ data: "test" });
        });

        expect(result.current.erro).toBe("Network error");
        expect(result.current.resultado).toBeNull();
    });

    it("usa extractResult customizado", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ html: "<h1>PEI</h1>", score: 95 }),
        });

        const { result } = renderHook(() =>
            useHubGenerate({
                endpoint: "/api/hub/test",
                engine: "green",
                extractResult: (data) => `Score: ${data.score}`,
            })
        );

        await act(async () => {
            await result.current.gerar({});
        });

        expect(result.current.resultado).toBe("Score: 95");
    });

    it("reset limpa todos os estados", async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ texto: "resultado" }),
        });

        const { result } = renderHook(() =>
            useHubGenerate({ endpoint: "/api/hub/test", engine: "red" })
        );

        await act(async () => {
            await result.current.gerar({});
        });

        expect(result.current.resultado).toBe("resultado");

        act(() => {
            result.current.reset();
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
        expect(result.current.resultado).toBeNull();
        expect(result.current.validado).toBe(false);
    });
});
