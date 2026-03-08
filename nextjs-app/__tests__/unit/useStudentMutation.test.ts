// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStudentMutation } from "@/hooks/useStudentMutation";

// Mock global.fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("useStudentMutation Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("executa updatePAEEData com sucesso e retorna JSON limpo", async () => {
        // Objeto simulado do Backend
        const mockResponse = { success: true, updated_at: "2024-10-10" };

        // Simula resposta fetch de sucesso HTTP 200
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const { result } = renderHook(() => useStudentMutation());

        let apiReturn: any;

        await act(async () => {
            apiReturn = await result.current.updatePAEEData("student-123", { paee_goal: "Ler melhor" });
        });

        expect(fetchMock).toHaveBeenCalledWith("/api/students/student-123/paee", expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify({ paee_data: { paee_goal: "Ler melhor" } })
        }));

        expect(apiReturn).toEqual(mockResponse);
        expect(result.current.success).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it("executa deleteStudent e lança repasse pro useUIState no caso de Falha HTML", async () => {
        const errorMessage = "Estudante tem diários vinculados.";

        // Simula rejeição controlada do servidor (HTTP 400 Bad Request)
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: errorMessage }),
        });

        const { result } = renderHook(() => useStudentMutation());

        let apiReturn: any;
        await act(async () => {
            apiReturn = await result.current.deleteStudent("blocked-student-id");
        });

        expect(fetchMock).toHaveBeenCalledWith("/api/students/blocked-student-id", expect.objectContaining({
            method: "DELETE"
        }));

        // Quando falha, o executor principal resolve `null` e propaga o throw via set states internos.
        expect(apiReturn).toBeNull();
        expect(result.current.success).toBe(false);
        expect(result.current.error).toBe(errorMessage);
    });
});
