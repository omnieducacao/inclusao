/**
 * Omni DS — Typography Tokens
 */
export const fontFamily = {
    primary: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
} as const;

export const fontWeight = {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
} as const;

export const fontSize = {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.75rem",  // 28px
    "4xl": "2.25rem",  // 36px
} as const;

export const lineHeight = {
    tight: 1.15,
    snug: 1.2,
    normal: 1.4,
    relaxed: 1.6,
} as const;

export const letterSpacing = {
    tighter: "-0.035em",
    tight: "-0.02em",
    snug: "-0.015em",
    normal: "-0.01em",
    wide: "0.01em",
} as const;

/**
 * Escalas tipográficas pré-definidas
 * Usadas nos componentes SectionTitle, Heading, etc.
 */
export const textStyles = {
    display: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.extrabold,
        letterSpacing: letterSpacing.tighter,
        lineHeight: lineHeight.tight,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.snug,
        lineHeight: lineHeight.snug,
    },
    subsection: {
        fontSize: "0.9375rem",
        fontWeight: 650,
        letterSpacing: letterSpacing.normal,
        lineHeight: lineHeight.normal,
    },
    caption: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        letterSpacing: letterSpacing.wide,
    },
} as const;

/**
 * Omni Typography Scale — 10 níveis sistematizados
 * Corresponde às classes CSS .omni-* em globals.css
 *
 * @example
 * <span className="omni-label-xs">Badge</span>
 * <p className="omni-body">Texto padrão</p>
 * <h2 className="omni-heading">Título de seção</h2>
 */
export const omniScale = {
    labelXs: { fontSize: "10px", lineHeight: 1.4, fontWeight: 600 },
    labelSm: { fontSize: "11px", lineHeight: 1.45, fontWeight: 500 },
    label: { fontSize: "11px", lineHeight: 1.45, fontWeight: 600 },
    bodySm: { fontSize: "12px", lineHeight: 1.5, fontWeight: 400 },
    body: { fontSize: "13px", lineHeight: 1.5, fontWeight: 400 },
    bodyBold: { fontSize: "13px", lineHeight: 1.5, fontWeight: 700 },
    headingSm: { fontSize: "14px", lineHeight: 1.35, fontWeight: 600 },
    heading: { fontSize: "16px", lineHeight: 1.3, fontWeight: 700 },
    headingLg: { fontSize: "20px", lineHeight: 1.25, fontWeight: 800 },
    title: { fontSize: "24px", lineHeight: 1.2, fontWeight: 800 },
} as const;

/** Nomes de classes CSS para cada nível */
export const omniClass = {
    labelXs: "omni-label-xs",
    labelSm: "omni-label-sm",
    label: "omni-label",
    bodySm: "omni-body-sm",
    body: "omni-body",
    bodyBold: "omni-body-bold",
    headingSm: "omni-heading-sm",
    heading: "omni-heading",
    headingLg: "omni-heading-lg",
    title: "omni-title",
} as const;

export type OmniScaleLevel = keyof typeof omniScale;
