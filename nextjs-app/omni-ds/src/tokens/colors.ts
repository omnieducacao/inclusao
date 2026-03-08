/**
 * Omni DS — Color Tokens
 * Paleta semântica + cores de módulos da plataforma
 */

// Cores por módulo (usadas em ModuleCard, badges, glows)
export const moduleColors = {
    pei: { bg: "#6366f1", text: "#ffffff", glow: "rgba(99, 102, 241, 0.25)", bgPastel: "#e0e7ff", textPastel: "#4338ca" },
    paee: { bg: "#f43f5e", text: "#ffffff", glow: "rgba(244, 63, 94, 0.25)", bgPastel: "#ffe4e6", textPastel: "#be123c" },
    hub: { bg: "#14b8a6", text: "#ffffff", glow: "rgba(20, 184, 166, 0.25)", bgPastel: "#ccfbf1", textPastel: "#0f766e" },
    diario: { bg: "#059669", text: "#ffffff", glow: "rgba(16, 185, 129, 0.25)", bgPastel: "#dcfce7", textPastel: "#047857" },
    cursos: { bg: "#d97706", text: "#ffffff", glow: "rgba(245, 158, 11, 0.25)", bgPastel: "#fef3cd", textPastel: "#92400e" },
    ferramentas: { bg: "#2563eb", text: "#ffffff", glow: "rgba(59, 130, 246, 0.25)", bgPastel: "#dbeafe", textPastel: "#1d4ed8" },
    omnisfera: { bg: "#0ea5e9", text: "#ffffff", glow: "rgba(56, 189, 248, 0.25)", bgPastel: "#e0f2fe", textPastel: "#0369a1" },
    gestao: { bg: "#6366f1", text: "#ffffff", glow: "rgba(99, 102, 241, 0.25)", bgPastel: "#e0e1fc", textPastel: "#4338ca" },
    monitoramento: { bg: "#0d9488", text: "#ffffff", glow: "rgba(20, 184, 166, 0.25)", bgPastel: "#ccfbf1", textPastel: "#0f766e" },
    pgi: { bg: "#8b5cf6", text: "#ffffff", glow: "rgba(139, 92, 246, 0.25)", bgPastel: "#ede9fe", textPastel: "#6d28d9" },
    admin: { bg: "#475569", text: "#ffffff", glow: "rgba(71, 85, 105, 0.25)", bgPastel: "#e8eaed", textPastel: "#334155" },
} as const;

export type ModuleKey = keyof typeof moduleColors;

// Cores semânticas (mapeadas para CSS custom properties)
export const semanticColors = {
    light: {
        bgPrimary: "#f7f8fa",
        bgSecondary: "#ffffff",
        bgTertiary: "#f1f5f9",
        bgHover: "#f8fafc",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        textMuted: "#94a3b8",
        textInverse: "#ffffff",
        borderDefault: "rgba(226, 232, 240, 0.6)",
        borderStrong: "rgba(203, 213, 225, 0.8)",
        borderSubtle: "rgba(241, 245, 249, 0.8)",
    },
    dark: {
        bgPrimary: "#0c0e14",
        bgSecondary: "#151821",
        bgTertiary: "#1c2030",
        bgHover: "#1e2235",
        textPrimary: "#e2e8f0",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",
        textInverse: "#0f172a",
        borderDefault: "rgba(51, 65, 85, 0.5)",
        borderStrong: "rgba(71, 85, 105, 0.6)",
        borderSubtle: "rgba(30, 41, 59, 0.8)",
    },
} as const;

// ─── Paleta de Feedback ───
// Usada em: Alert, Progress, StatusDot, ScoreBar, SubjectProgressRow, DifficultyDots, etc.
export const feedbackColors = {
    success: { base: "#10b981", soft: "#ecfdf5", text: "#059669" },
    warning: { base: "#f59e0b", soft: "#fffbeb", text: "#d97706" },
    error: { base: "#ef4444", soft: "#fef2f2", text: "#dc2626" },
    info: { base: "#3b82f6", soft: "#eff6ff", text: "#2563eb" },
    neutral: { base: "#94a3b8", soft: "#f1f5f9", text: "#64748b" },
} as const;

export type FeedbackKey = keyof typeof feedbackColors;

// ─── Paleta de Maestria ───
// Usada em: MasteryBar, SkillBadge, StreakCalendar
export const masteryColors = {
    none: { base: "#94a3b8", bg: "#f1f5f9" },
    beginner: { base: "#f59e0b", bg: "#fffbeb" },
    learning: { base: "#3b82f6", bg: "#eff6ff" },
    advanced: { base: "#8b5cf6", bg: "#f5f3ff" },
    mastered: { base: "#10b981", bg: "#ecfdf5" },
} as const;

export type MasteryKey = keyof typeof masteryColors;

// ─── Paleta de Áreas do Conhecimento ───
// Usada em: DonutChart, CurriculumCard, Reports
export const areaColors = {
    linguagens: "#8b5cf6",
    matematica: "#3b82f6",
    humanas: "#f59e0b",
    natureza: "#10b981",
    redacao: "#ec4899",
} as const;

export type AreaKey = keyof typeof areaColors;

// ─── Cor Primária da Identidade ───
export const brandColors = {
    primary: "#6366f1",
    primarySoft: "#eef2ff",
    primaryText: "#4f46e5",
} as const;

// Status colors (legacy — aponta para feedbackColors)
export const statusColors = {
    success: feedbackColors.success.base,
    warning: feedbackColors.warning.base,
    error: feedbackColors.error.base,
    info: feedbackColors.info.base,
} as const;

// Gradientes
export const gradients = {
    // Blues & Purples
    ocean: "linear-gradient(135deg, #7B05F5, #4AADDE)",
    cosmic: "linear-gradient(135deg, #7B7FF6, #1F2F98)",
    sky: "linear-gradient(135deg, #4AADDE, #1CA7EC)",
    // Pastéis suaves
    mint: "linear-gradient(135deg, #86E3CE, #D0E6A5)",
    sunset: "linear-gradient(135deg, #FFDD94, #FA897B)",
    lavender: "linear-gradient(135deg, #FA897B, #CCABD8)",
    // Deep
    midnight: "linear-gradient(135deg, #080742, #5E72EB)",
    coral: "linear-gradient(135deg, #FF9090, #FDC094)",
    // Module-specific
    peiGlow: "linear-gradient(135deg, #6366f1, #818cf8)",
    hubGlow: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
    diarioGlow: "linear-gradient(135deg, #059669, #10b981)",
    paeeGlow: "linear-gradient(135deg, #f43f5e, #fb7185)",
    cursosGlow: "linear-gradient(135deg, #d97706, #f59e0b)",
} as const;
