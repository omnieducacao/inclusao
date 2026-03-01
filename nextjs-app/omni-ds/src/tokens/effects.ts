/**
 * Omni DS — Shadow, Radius, Transition Tokens
 */

export const shadows = {
    xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
    sm: "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)",
    md: "0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.06)",
    xl: "0 12px 32px rgba(0, 0, 0, 0.1), 0 24px 64px rgba(0, 0, 0, 0.08)",
    innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
} as const;

export const shadowsDark = {
    xs: "0 1px 2px rgba(0, 0, 0, 0.2)",
    sm: "0 2px 8px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15)",
    md: "0 4px 12px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.35), 0 16px 48px rgba(0, 0, 0, 0.25)",
    xl: "0 12px 32px rgba(0, 0, 0, 0.4), 0 24px 64px rgba(0, 0, 0, 0.3)",
    innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
} as const;

export const radius = {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
} as const;

export const transitions = {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "500ms cubic-bezier(0.16, 1, 0.3, 1)",
} as const;
