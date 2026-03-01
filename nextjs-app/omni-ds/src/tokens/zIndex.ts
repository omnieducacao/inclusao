/**
 * Omni DS — Z-Index Tokens
 *
 * Escala fixa para evitar z-index wars.
 * Cada camada tem range reservado para sub-layers.
 *
 * @example
 * ```tsx
 * <div style={{ zIndex: zIndex.modal }}>
 * ```
 */
export const zIndex = {
    /** Elementos abaixo da baseline (-1) */
    behind: -1,
    /** Baseline — conteúdo normal */
    base: 0,
    /** Elementos elevados (badges, floating labels) */
    raised: 10,
    /** Dropdown menus, autocompletes */
    dropdown: 50,
    /** Headers fixos, navbars sticky */
    sticky: 100,
    /** Overlay escuro (backdrop de modais) */
    overlay: 150,
    /** Modais e dialogs */
    modal: 200,
    /** Popovers acima de modais */
    popover: 250,
    /** Toast notifications */
    toast: 300,
    /** Tooltips (sempre no topo) */
    tooltip: 400,
    /** DevTools / debug overlays */
    devtools: 9999,
} as const;

export type ZIndexKey = keyof typeof zIndex;
