/**
 * Gestão — Shared types and constants
 */

export type WorkspaceMember = {
    id: string;
    nome: string;
    email: string;
    telefone?: string | null;
    cargo?: string | null;
    papel?: "direcao" | "coordenacao" | "professor" | "aee" | "apoio";
    can_estudantes: boolean;
    can_pei: boolean;
    can_pei_professor: boolean;
    can_paee: boolean;
    can_hub: boolean;
    can_diario: boolean;
    can_avaliacao: boolean;
    can_gestao: boolean;
    link_type: "todos" | "turma" | "tutor";
    active: boolean;
};

export type FamilyResponsavel = {
    id: string;
    nome: string;
    email: string;
    telefone?: string | null;
    parentesco?: string | null;
    active: boolean;
    created_at: string;
};

export type WorkspaceMaster = { workspace_id: string; email: string; nome: string } | null;

export const PERM_LABELS: Record<string, string> = {
    can_estudantes: "Estudantes",
    can_pei: "PEI",
    can_pei_professor: "PEI - Professor",
    can_paee: "PAEE",
    can_hub: "Hub",
    can_diario: "Diário",
    can_avaliacao: "Avaliação",
    can_gestao: "Gestão",
};

export const LINK_OPTIONS: { value: "todos" | "turma" | "tutor"; label: string }[] = [
    { value: "todos", label: "Toda a escola" },
    { value: "turma", label: "As turmas em que dá aula" },
    { value: "tutor", label: "Estudantes escolhidos um a um" },
];
