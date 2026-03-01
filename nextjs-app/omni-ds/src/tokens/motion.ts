/**
 * Omni DS — Motion Tokens
 *
 * Durações, easings e transitions pré-compostas.
 * Respeita prefers-reduced-motion automaticamente via CSS.
 *
 * @example
 * ```tsx
 * <div style={{ transition: `opacity ${duration.normal} ${easing.standard}` }}>
 * ```
 */

/** Durações em ms */
export const duration = {
    /** Micro-interações: hover, focus ring */
    instant: "100ms",
    /** Transições rápidas: botões, toggles */
    fast: "150ms",
    /** Transições padrão: cards, menus */
    normal: "250ms",
    /** Transições elaboradas: modais, drawers */
    slow: "400ms",
    /** Animações complexas: page transitions */
    slower: "600ms",
} as const;

/** Curvas de easing */
export const easing = {
    /** Padrão — Material Design standard */
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    /** Entrada de elementos (aparecer) */
    enter: "cubic-bezier(0, 0, 0.2, 1)",
    /** Saída de elementos (desaparecer) */
    exit: "cubic-bezier(0.4, 0, 1, 1)",
    /** Spring — bounce sutil para interações premium */
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    /** Elastic — para drag & drop, gestos */
    elastic: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    /** Linear — progress bars, loading */
    linear: "linear",
} as const;

/** Transições pré-compostas (property + duration + easing) */
export const motionPresets = {
    /** Hover suave em cards e botões */
    hover: `all ${duration.fast} ${easing.standard}`,
    /** Expansão de accordions, dropdowns */
    expand: `all ${duration.normal} ${easing.spring}`,
    /** Entrada de modais e drawers */
    modalEnter: `all ${duration.slow} ${easing.spring}`,
    /** Saída de modais e drawers */
    modalExit: `all ${duration.normal} ${easing.exit}`,
    /** Fade in/out de toasts */
    fade: `opacity ${duration.normal} ${easing.standard}`,
    /** Slide in de sheets */
    slide: `transform ${duration.slow} ${easing.spring}`,
    /** Scale + fade para popovers */
    pop: `all ${duration.fast} ${easing.spring}`,
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
