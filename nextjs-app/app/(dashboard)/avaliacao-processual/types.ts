import type { NivelOmnisfera } from "@/lib/omnisfera-types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlunoProcessual {
    id: string;
    name: string;
    grade: string;
    class_group: string;
    diagnostico: string;
    disciplinas: {
        id: string;
        disciplina: string;
        professor_regente_nome: string;
        has_avaliacao: boolean;
        nivel_omnisfera: number | null;
    }[];
}

export interface HabilidadeAvaliada {
    codigo_bncc: string;
    descricao: string;
    nivel_atual: NivelOmnisfera;
    nivel_anterior: NivelOmnisfera | null;
    observacao: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

export const cardS = "rounded-xl border border-(--omni-border-default) bg-(--omni-bg-secondary) overflow-hidden";
export const headerS = "flex items-center gap-2 px-4 py-3 border-b border-(--omni-border-default) bg-(--omni-bg-tertiary)";
export const bodyS = "p-4";

export const NIVEL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
    0: { bg: "rgba(239,68,68,.08)", border: "rgba(239,68,68,.2)", text: "#f87171" },
    1: { bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.2)", text: "#fbbf24" },
    2: { bg: "rgba(59,130,246,.08)", border: "rgba(59,130,246,.2)", text: "#60a5fa" },
    3: { bg: "rgba(16,185,129,.08)", border: "rgba(16,185,129,.2)", text: "#34d399" },
    4: { bg: "rgba(99,102,241,.08)", border: "rgba(99,102,241,.2)", text: "#818cf8" },
};

export type TipoPeriodo = "bimestral" | "trimestral" | "semestral";

export const PERIODOS: Record<TipoPeriodo, { label: string; periodos: { value: number; label: string }[] }> = {
    bimestral: {
        label: "Bimestral",
        periodos: [
            { value: 1, label: "1º Bimestre" },
            { value: 2, label: "2º Bimestre" },
            { value: 3, label: "3º Bimestre" },
            { value: 4, label: "4º Bimestre" },
        ],
    },
    trimestral: {
        label: "Trimestral",
        periodos: [
            { value: 1, label: "1º Trimestre" },
            { value: 2, label: "2º Trimestre" },
            { value: 3, label: "3º Trimestre" },
        ],
    },
    semestral: {
        label: "Semestral",
        periodos: [
            { value: 1, label: "1º Semestre" },
            { value: 2, label: "2º Semestre" },
        ],
    },
};
