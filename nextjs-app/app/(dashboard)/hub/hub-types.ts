"use client";

/**
 * Hub shared types and constants — used across Hub tool components.
 */

import type { LucideIcon } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

export type Student = { id: string; name: string };
export type StudentFull = Student & {
    grade?: string | null;
    pei_data?: Record<string, unknown>;
};

export type EngineId = "red" | "blue" | "green" | "yellow" | "orange";

/** Estrutura BNCC para dropdowns (componente → unidade → objeto → habilidades) */
export type EstruturaBncc = {
    disciplinas: string[];
    porDisciplina: Record<string, {
        unidades: string[];
        porUnidade: Record<string, {
            objetos: string[];
            porObjeto: Record<string, { codigo: string; descricao: string; habilidade_completa?: string }[]>;
        }>;
    }>;
} | null;

export type ToolIdEFEM = "adaptar-prova" | "adaptar-atividade" | "criar-zero" | "criar-itens" | "estudio-visual" | "papo-mestre" | "plano-aula" | "roteiro" | "dinamica";
export type ToolIdEI = "criar-experiencia" | "estudio-visual" | "rotina-avd" | "inclusao-brincar";
export type ToolId = ToolIdEFEM | ToolIdEI;

export type ToolDef = { id: string; icon: LucideIcon; title: string; desc: string };

/** Common props for all Hub tool components */
export type HubToolProps = {
    student: StudentFull | null;
    engine: EngineId;
    onEngineChange: (e: EngineId) => void;
    onClose: () => void;
};

/** Common props for tools that also receive hiperfoco */
export type HubToolWithHiperfocoProps = HubToolProps & {
    hiperfoco: string;
};

/** Checklist adaptação used by CriarDoZero, AdaptarProva, etc. */
export type ChecklistAdaptacao = {
    questoes_desafiadoras?: boolean;
    compreende_instrucoes_complexas?: boolean;
    instrucoes_passo_a_passo?: boolean;
    dividir_em_etapas?: boolean;
    paragrafos_curtos?: boolean;
    dicas_apoio?: boolean;
    compreende_figuras_linguagem?: boolean;
    descricao_imagens?: boolean;
};

// ─── Constants ──────────────────────────────────────────────────────

export const COMPONENTES = [
    "Língua Portuguesa", "Matemática", "Arte", "Ciências",
    "Educação Física", "Geografia", "História", "Língua Inglesa", "Ensino Religioso",
];

// Taxonomia de Bloom - Estrutura completa com domínios e verbos
export const TAXONOMIA_BLOOM: Record<string, string[]> = {
    "1. Lembrar (Memorizar)": ["Citar", "Definir", "Identificar", "Listar", "Nomear", "Reconhecer", "Recordar", "Relacionar", "Repetir", "Sublinhar"],
    "2. Entender (Compreender)": ["Classificar", "Descrever", "Discutir", "Explicar", "Expressar", "Identificar", "Localizar", "Narrar", "Reafirmar", "Reportar", "Resumir", "Traduzir"],
    "3. Aplicar": ["Aplicar", "Demonstrar", "Dramatizar", "Empregar", "Esboçar", "Ilustrar", "Interpretar", "Operar", "Praticar", "Programar", "Usar"],
    "4. Analisar": ["Analisar", "Calcular", "Categorizar", "Comparar", "Contrastar", "Criticar", "Diferenciar", "Discriminar", "Distinguir", "Examinar", "Experimentar", "Testar"],
    "5. Avaliar": ["Argumentar", "Avaliar", "Defender", "Escolher", "Estimar", "Julgar", "Prever", "Selecionar", "Suportar", "Validar", "Valorizar"],
    "6. Criar": ["Compor", "Construir", "Criar", "Desenhar", "Desenvolver", "Formular", "Investigar", "Planejar", "Produzir", "Propor"],
};

// Metodologias para Plano de Aula
export const METODOLOGIAS = [
    "Aula Expositiva Dialogada",
    "Metodologia Ativa",
    "Aprendizagem Baseada em Problemas",
    "Ensino Híbrido",
    "Sala de Aula Invertida",
    "Rotação por Estações",
];

// Técnicas Ativas (aparece quando "Metodologia Ativa" é selecionada)
export const TECNICAS_ATIVAS = [
    "Gamificação",
    "Sala de Aula Invertida",
    "Aprendizagem Baseada em Projetos (PBL)",
    "Rotação por Estações",
    "Peer Instruction",
    "Estudo de Caso",
    "Aprendizagem Cooperativa",
];

// Recursos disponíveis
export const RECURSOS_DISPONIVEIS = [
    "Quadro/Giz",
    "Projetor/Datashow",
    "Lousa Digital",
    "Tablets/Celulares",
    "Internet",
    "Materiais Maker (Papel, Cola, etc)",
    "Jogos de Tabuleiro",
    "Laboratório",
    "Material Dourado",
    "Recursos de CAA",
    "Vídeos Educativos",
];
