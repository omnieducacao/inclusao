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
