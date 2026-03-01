/**
 * Design System — Icon Standards
 *
 * Padrões visuais e diretrizes para uso de ícones Lordicon no Omniverso/Omnisfera.
 * Todas as constantes abaixo devem ser usadas ao renderizar LottieIcon.
 */

// ─── Categorias de Ícones ───

export type IconStyle = "flat" | "outline" | "lineal" | "wired-flat" | "system";

/**
 * Categorias:
 *
 * flat         → Ícones preenchidos com cores originais (multicoloridos).
 *                Uso: cards de módulo, hero sections, decorativo.
 *                NÃO aplicar colorize, colors ou strokeWidth.
 *
 * outline      → Contorno fino. Padrão Lordicon: primary (cor do módulo) + secondary (grafite).
 *                Uso: navegação, toolbars, menus, estados default.
 *                Aplicar colors=`primary:${cor},secondary:${ICON_GRAPHITE}`
 *
 * lineal       → Semi-preenchidos com linhas. Mesmas regras de outline.
 *                Uso: alternativa ao outline quando precisa de mais detalhamento visual.
 *
 * wired-flat   → Flat animados com cores originais.
 *                NÃO aplicar colorize, colors ou strokeWidth.
 *
 * system       → Ícones sólidos escuros para elementos de sistema.
 *                Uso: spinners, toggles, uploads, ferramentas de UI.
 *                Aplicar colorize=ICON_SYSTEM_COLOR sobre fundo ICON_SYSTEM_BG.
 */

// ─── Cores Padrão ───

/** Cor secundária padrão Lordicon — quase preto, grafite */
export const ICON_GRAPHITE = "#121331";

/** Cor primária default para outline/lineal quando não vinculado a um módulo */
export const ICON_PRIMARY_DEFAULT = "#7c3aed";

/** Cor dos ícones de sistema (slate claro) */
export const ICON_SYSTEM_COLOR = "#94a3b8";

/** Fundo dos ícones de sistema */
export const ICON_SYSTEM_BG = "#1e293b";

// ─── Escala de Tamanhos ───

/**
 * Tamanhos padronizados para ícones.
 * Garante consistência visual em todo o sistema.
 *
 * @example
 * ```tsx
 * <LottieIcon animation="..." size={iconSize.md} />
 * ```
 */
export const iconSize = {
    /** Inline text, badges */
    xs: 16,
    /** Botões compactos, chips */
    sm: 20,
    /** Padrão — menus, listas, inputs */
    md: 24,
    /** Cards, section headers */
    lg: 32,
    /** Module cards, hero */
    xl: 40,
    /** Destaque, empty states */
    "2xl": 48,
    /** Hero sections, splash */
    "3xl": 64,
} as const;

export type IconSizeKey = keyof typeof iconSize;

// ─── Helper para gerar colors string ───

/**
 * Gera o valor da prop `colors` no padrão Lordicon.
 * Primary = grafite (FIXO, nunca muda) — linhas principais escuras
 * Secondary = cor accent (customizável por módulo) — detalhes coloridos
 *
 * Segue o padrão do ícone 161-growth: contorno escuro + accent colorido.
 *
 * @example
 * ```tsx
 * <LottieIcon colors={iconColors("#7c3aed")} />
 * // → "primary:#121331,secondary:#7c3aed"
 * ```
 */
export function iconColors(accentHex: string, graphiteHex = ICON_GRAPHITE): string {
    return `primary:${graphiteHex},secondary:${accentHex}`;
}

// ─── Tabela de ícones por módulo ───

export const moduleIcons = {
    pei: {
        flat: "pei_flat",
        outline: "wired-outline-426-brain-hover-pinch",
    },
    hub: {
        flat: "hub_flat",
        outline: "wired-outline-3139-rocket-space-alt-hover-pinch",
    },
    diario: {
        flat: "Diario_flat",
        outline: "wired-outline-3140-book-open-hover-pinch",
    },
    paee: {
        flat: "paee_flat",
        outline: "wired-outline-782-compass-hover-pinch",
    },
    estudantes: {
        flat: "estudantes_flat",
        outline: "wired-outline-529-boy-girl-children-hover-pinch",
    },
    pgi: {
        flat: "pgi_flat",
        outline: "wired-outline-967-questionnaire-hover-pinch",
    },
    monitoramento: {
        flat: "dados_flat",
        outline: "wired-outline-152-bar-chart-arrow-hover-growth",
    },
    gestao: {
        flat: "usuarios_flat",
        outline: "wired-outline-1004-management-team-hover-smooth",
    },
} as const;
