/**
 * Omni DS — Breakpoint Tokens
 *
 * Mobile-first breakpoints (min-width).
 * Alinhados com Tailwind defaults para consistência.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
 * ```
 */
export const breakpoints = {
    /** Celulares pequenos */
    xs: 480,
    /** Celulares grandes / landscape */
    sm: 640,
    /** Tablets portrait */
    md: 768,
    /** Tablets landscape / laptops */
    lg: 1024,
    /** Desktops */
    xl: 1280,
    /** Telas wide */
    "2xl": 1536,
} as const;

/** Media query strings prontas para uso */
export const mediaQueries = {
    xs: `(min-width: ${breakpoints.xs}px)`,
    sm: `(min-width: ${breakpoints.sm}px)`,
    md: `(min-width: ${breakpoints.md}px)`,
    lg: `(min-width: ${breakpoints.lg}px)`,
    xl: `(min-width: ${breakpoints.xl}px)`,
    "2xl": `(min-width: ${breakpoints["2xl"]}px)`,
    /** Preferência do sistema por reduced motion */
    reducedMotion: "(prefers-reduced-motion: reduce)",
    /** Dark mode via sistema */
    darkMode: "(prefers-color-scheme: dark)",
    /** Touch device */
    touch: "(hover: none) and (pointer: coarse)",
} as const;

export type BreakpointKey = keyof typeof breakpoints;
