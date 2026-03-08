import type { EngineId } from "@/lib/ai-engines";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlunoDisc {
    id: string;
    disciplina: string;
    professor_regente_nome: string;
    has_avaliacao: boolean;
    nivel_omnisfera: number | null;
    avaliacao_status: string;
}

export interface Aluno {
    id: string;
    name: string;
    grade: string;
    class_group: string;
    diagnostico: string;
    barreiras_selecionadas?: Record<string, Record<string, boolean>>;
    disciplinas: AlunoDisc[];
}

export interface PlanoVinculado {
    id: string;
    disciplina: string;
    ano_serie: string;
    bimestre: string;
    conteudo: string | null;
    habilidades_bncc: string[] | null;
}

export interface BlocoPlano {
    titulo: string;
    habilidades_bncc?: string[];
    objetivos?: string[];
    objetivos_livre?: string;
    metodologia?: string[];
    avaliacao?: string[];
}

export type ChecklistAdaptacao = Record<string, boolean>;

// ─── Constants ────────────────────────────────────────────────────────────────

export const ENGINE_OPTIONS: { id: EngineId; label: string; color: string }[] = [
    { id: "red", label: "OmniRed (DeepSeek)", color: "#ef4444" },
    { id: "green", label: "OmniGreen (Claude)", color: "#10b981" },
    { id: "blue", label: "OmniBlue (Kimi)", color: "#3b82f6" },
    { id: "orange", label: "OmniOrange (GPT)", color: "#f59e0b" },
];

// Taxonomia de Bloom (reutilizada do Hub)
export const TAXONOMIA_BLOOM: Record<string, string[]> = {
    "1. Lembrar": ["Citar", "Definir", "Identificar", "Listar", "Nomear", "Reconhecer", "Recordar"],
    "2. Entender": ["Classificar", "Descrever", "Explicar", "Expressar", "Resumir", "Traduzir"],
    "3. Aplicar": ["Aplicar", "Demonstrar", "Ilustrar", "Interpretar", "Operar", "Usar"],
    "4. Analisar": ["Analisar", "Comparar", "Contrastar", "Diferenciar", "Distinguir", "Examinar"],
    "5. Avaliar": ["Argumentar", "Avaliar", "Defender", "Julgar", "Selecionar", "Validar"],
    "6. Criar": ["Compor", "Construir", "Criar", "Desenvolver", "Formular", "Propor"],
};

// Mapear domínio cognitivo SAEB → domínios Bloom correspondentes
export const SAEB_TO_BLOOM: Record<string, string[]> = {
    "I": ["1. Lembrar", "2. Entender"],
    "II": ["3. Aplicar", "4. Analisar"],
    "III": ["5. Avaliar", "6. Criar"],
};
