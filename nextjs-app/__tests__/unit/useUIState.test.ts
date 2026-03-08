// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useUIState } from "@/hooks/useUIState";

describe("useUIState Hook", () => {
    it("inicializa com estado padrão: não carregando, sem erro, sem sucesso", () => {
        const { result } = renderHook(() => useUIState());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.success).toBe(false);
    });

    it("gerencia o ciclo de vida de uma Promise resolvendo com sucesso", async () => {
        const { result } = renderHook(() => useUIState());

        const mockData = { user: "Admin" };
        const mockPromiseFn = vi.fn().mockResolvedValue(mockData);
        const onSuccessMock = vi.fn();

        let promiseReturn: any;

        // Inicia a execução
        await act(async () => {
            promiseReturn = await result.current.execute(mockPromiseFn, { onSuccess: onSuccessMock });
        });

        expect(mockPromiseFn).toHaveBeenCalledTimes(1);
        expect(onSuccessMock).toHaveBeenCalledWith(mockData);

        // Verifica retorno do wrapper
        expect(promiseReturn).toEqual(mockData);

        // Verifica os booleanos e estados de UI na montagem
        expect(result.current.loading).toBe(false);
        expect(result.current.success).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it("gerencia o ciclo de vida de uma Promise rejeitada", async () => {
        const { result } = renderHook(() => useUIState());

        const errorMessage = "Erro na rede. Tente de Novo.";
        const mockPromiseFn = vi.fn().mockRejectedValue(new Error(errorMessage));
        const onErrorMock = vi.fn();

        let promiseReturn: any;

        await act(async () => {
            promiseReturn = await result.current.execute(mockPromiseFn, { onError: onErrorMock });
        });

        expect(mockPromiseFn).toHaveBeenCalledTimes(1);
        expect(onErrorMock).toHaveBeenCalledTimes(1);

        // Fallback de falha é null (segurança de UI para evitar crash)
        expect(promiseReturn).toBeNull();

        // Estados finais de falha
        expect(result.current.loading).toBe(false);
        expect(result.current.success).toBe(false);
        expect(result.current.error).toBe(errorMessage);
    });

    it("limpa todo o estado com reset()", async () => {
        const { result } = renderHook(() => useUIState());

        const mockPromiseFn = vi.fn().mockRejectedValue(new Error("Fake Error"));
        await act(async () => {
            await result.current.execute(mockPromiseFn);
        });

        // Deve ter o falso setado
        expect(result.current.error).toBe("Fake Error");

        // Executar reset
        act(() => {
            result.current.reset();
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.success).toBe(false);
        expect(result.current.error).toBeNull();
    });
});
