/**
 * Omni DS — Spacing Tokens
 *
 * Escala 4-base (4px increments) para consistência estrutural.
 * Usar em margins, paddings, gaps e offsets.
 *
 * @example
 * ```tsx
 * <div style={{ padding: spacing[4], gap: spacing[3] }}>
 * ```
 */
export const spacing = {
    0: "0px",
    px: "1px",
    0.5: "2px",
    1: "4px",
    1.5: "6px",
    2: "8px",
    2.5: "10px",
    3: "12px",
    3.5: "14px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "28px",
    8: "32px",
    9: "36px",
    10: "40px",
    12: "48px",
    14: "56px",
    16: "64px",
    20: "80px",
    24: "96px",
} as const;

/** Named spacing aliases for semantic usage */
export const spacingAlias = {
    /** Espaçamento interno de componentes compactos (buttons, badges) */
    componentXs: spacing[1],    // 4px
    /** Espaçamento interno padrão de componentes */
    componentSm: spacing[2],    // 8px
    /** Espaçamento interno de cards e containers */
    componentMd: spacing[4],    // 16px
    /** Espaçamento interno de sections */
    componentLg: spacing[6],    // 24px
    /** Gap entre itens de lista */
    listGap: spacing[2],        // 8px
    /** Gap entre cards em grids */
    gridGap: spacing[3],        // 12px
    /** Margem entre seções da página */
    sectionGap: spacing[8],     // 32px
    /** Padding de página */
    pagePadding: spacing[10],   // 40px
} as const;

export type SpacingKey = keyof typeof spacing;

// ─── Layout Standards (Tailwind class names) ──────────────────────────────────
// Baseado em auditoria do codebase:
//   gap: gap-2 (425x), gap-3 (120x), gap-4 (103x)
//   padding: p-4 (232x), p-3 (193x), p-6 (108x)
//   radius: rounded-lg (701x), rounded-xl (162x)

export const layoutStandards = {
    gap: {
        /** 4px — Tight: items within a label/badge */
        xs: "gap-1",
        /** 8px — Default: items in a row, form fields */
        sm: "gap-2",
        /** 12px — Comfortable: card content, list items */
        md: "gap-3",
        /** 16px — Spacious: card groups, major sections */
        lg: "gap-4",
        /** 24px — Section gap: page-level sections */
        xl: "gap-6",
    },
    padding: {
        /** 8px — Badges, pills, compact elements */
        xs: "p-2",
        /** 12px — Small cards, compact panels */
        sm: "p-3",
        /** 16px — Standard cards, panels */
        md: "p-4",
        /** 20px — Feature cards, hero sections */
        lg: "p-5",
        /** 24px — Page sections, large containers */
        xl: "p-6",
    },
    radius: {
        /** 8px — Standard: buttons, inputs, small cards */
        md: "rounded-lg",
        /** 12px — Cards, panels, modals */
        lg: "rounded-xl",
        /** 16px — Feature cards, hero sections */
        xl: "rounded-2xl",
        /** Full circle — Avatars, status dots */
        full: "rounded-full",
    },
} as const;

// ─── Icon Usage Guidelines ────────────────────────────────────────────────────

/**
 * Regra de ícones da plataforma:
 *
 * | Contexto              | Sistema         | Razão                            |
 * |-----------------------|-----------------|----------------------------------|
 * | Navbar (sidebar)      | Phosphor        | Legibilidade, outline consistente |
 * | Cards de Módulo       | Lottie colorido | Impacto visual, branding         |
 * | PageHero (headers)    | Lottie simples  | Equilíbrio, identificação        |
 * | Ações (botões, menus) | Lucide          | Consistência funcional           |
 * | Status/Feedback       | Lucide          | Familiar, semântico              |
 * | AI Engines            | Custom SVG      | Identidade dos motores           |
 *
 * NUNCA misture Phosphor e Lucide no mesmo componente.
 * Prefira Lucide para novos componentes (41 files vs Phosphor 11).
 */
export const iconGuidelines = {
    navigation: "phosphor" as const,
    moduleCards: "lottie" as const,
    pageHeaders: "lottie" as const,
    actions: "lucide" as const,
    status: "lucide" as const,
    aiEngines: "custom-svg" as const,
};
