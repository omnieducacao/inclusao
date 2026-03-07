"use client";

import { useUIState } from "./useUIState";

export function useStudentMutation() {
    const uiState = useUIState();
    const { execute } = uiState;

    const updatePAEEData = async (studentId: string, data: any, onSuccess?: () => void) => {
        return execute(async () => {
            const res = await fetch(`/api/students/${studentId}/paee`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paee_data: data }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP ${res.status}`);
            }
            return res.json();
        }, { onSuccess });
    };

    const updatePAEECiclos = async (
        studentId: string,
        payload: {
            paee_ciclos: any[];
            planejamento_ativo?: string;
            status_planejamento?: string;
            data_inicio_ciclo?: string | null;
            data_fim_ciclo?: string | null;
        },
        onSuccess?: () => void
    ) => {
        return execute(async () => {
            const res = await fetch(`/api/students/${studentId}/paee`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP ${res.status}`);
            }
            return res.json();
        }, { onSuccess });
    };

    const updatePEIData = async (studentId: string, data: any, onSuccess?: () => void) => {
        return execute(async () => {
            const res = await fetch(`/api/students/${studentId}/pei-data`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pei_data: data }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP ${res.status}`);
            }
            return res.json();
        }, { onSuccess });
    };

    const updateEstudante = async (studentId: string, payload: any, onSuccess?: () => void) => {
        return execute(async () => {
            const res = await fetch(`/api/students/${studentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP ${res.status}`);
            }
            return res.json();
        }, { onSuccess });
    };

    const deleteStudent = async (studentId: string, onSuccess?: () => void) => {
        return execute(async () => {
            const res = await fetch(`/api/students/${studentId}`, { method: "DELETE" });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP ${res.status}`);
            }
            return res.json();
        }, { onSuccess });
    };

    const updateDiario = async (studentId: string, payload: any, onSuccess?: () => void) => {
        return execute(async () => {
            const res = await fetch(`/api/students/${studentId}/diario`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP ${res.status}`);
            }
            return res.json();
        }, { onSuccess });
    };

    return {
        ...uiState,
        updatePAEEData,
        updatePAEECiclos,
        updatePEIData,
        updateEstudante,
        deleteStudent,
        updateDiario
    };
}
