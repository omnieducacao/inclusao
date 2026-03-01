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
