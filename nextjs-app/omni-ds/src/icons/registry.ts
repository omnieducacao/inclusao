/**
 * Omni DS — Icon Registry
 *
 * Centralized mapping of module icons to Lottie animations.
 * Stroke-scale is calibrated per animation group for visual homogeneity.
 */

export type IconEntry = {
    /** Lottie JSON filename (without .json extension) */
    animation: string;
    /** Stroke width multiplier (calibrated per icon series) */
    strokeScale: number;
    /** Flat variant filename (without .json extension) */
    flatAnimation?: string;
};

// ─── Stroke-scale groups ───
// Target: all icons appear ~18px visual stroke at default size
const THIN = 3.0;   // base ~2.5px × 3.0 = 7.5
const MEDIUM = 1.8;  // base ~6px × 1.8 = 10.8
const THICK = 1.0;   // base ~12px × 1.0 = 12

/** Icon name → Lottie animation entry */
export const ICON_REGISTRY: Record<string, IconEntry> = {
    // ── Module icons ──
    UsersFour: { animation: "wired-outline-529-boy-girl-children-hover-pinch", strokeScale: THICK, flatAnimation: "estudantes_flat" },
    Student: { animation: "wired-outline-426-brain-hover-pinch", strokeScale: THICK, flatAnimation: "pei_flat" },
    PuzzlePiece: { animation: "wired-outline-782-compass-hover-pinch", strokeScale: MEDIUM, flatAnimation: "paee_flat" },
    RocketLaunch: { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: THICK, flatAnimation: "hub_flat" },
    BookOpen: { animation: "wired-outline-3140-book-open-hover-pinch", strokeScale: THICK, flatAnimation: "Diario_flat" },
    ChartLineUp: { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: THICK, flatAnimation: "dados_flat" },
    UsersThree: { animation: "wired-outline-1004-management-team-hover-smooth", strokeScale: MEDIUM, flatAnimation: "usuarios_flat" },
    GraduationCap: { animation: "wired-outline-406-study-graduation-hover-pinch", strokeScale: THICK, flatAnimation: "configuracao_escola_flat" },
    ClipboardText: { animation: "wired-outline-967-questionnaire-hover-pinch", strokeScale: THICK, flatAnimation: "pgi_flat" },
    Gear: { animation: "wired-outline-39-cog-hover-mechanic", strokeScale: MEDIUM, flatAnimation: "configuracao_escola_flat" },
    BookBookmark: { animation: "wired-outline-2167-books-course-assign-hover-pinch", strokeScale: THICK, flatAnimation: "livros_flat" },
    Sparkle: { animation: "wired-outline-489-rocket-space-hover-flying", strokeScale: THICK, flatAnimation: "foguete_flat" },
    CalendarBlank: { animation: "wired-outline-973-appointment-schedule-hover-click", strokeScale: MEDIUM, flatAnimation: "agenda_flat" },
    Megaphone: { animation: "wired-outline-411-news-newspaper-hover-pinch", strokeScale: MEDIUM, flatAnimation: "megafone" },

    // ── Aliases ──
    Compass: { animation: "wired-outline-426-brain-hover-pinch", strokeScale: THICK, flatAnimation: "pei_flat" },
    Puzzle: { animation: "wired-outline-782-compass-hover-pinch", strokeScale: MEDIUM, flatAnimation: "paee_flat" },
    Rocket: { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: THICK, flatAnimation: "hub_flat" },
    BarChart3: { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: THICK, flatAnimation: "dados_flat" },
    School: { animation: "wired-outline-406-study-graduation-hover-pinch", strokeScale: THICK, flatAnimation: "configuracao_escola_flat" },
    ClipboardList: { animation: "wired-outline-967-questionnaire-hover-pinch", strokeScale: THICK, flatAnimation: "pgi_flat" },
    Settings: { animation: "wired-outline-39-cog-hover-mechanic", strokeScale: MEDIUM, flatAnimation: "configuracao_escola_flat" },
};

/** Route path → Lottie animation entry */
export const ROUTE_REGISTRY: Record<string, IconEntry> = {
    "/": { animation: "wired-outline-63-home-hover-3d-roll", strokeScale: THIN },
    "/estudantes": { animation: "wired-outline-529-boy-girl-children-hover-pinch", strokeScale: THICK, flatAnimation: "estudantes_flat" },
    "/omnisfera": { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: THICK, flatAnimation: "hub_flat" },
    "/pei": { animation: "wired-outline-426-brain-hover-pinch", strokeScale: THICK, flatAnimation: "pei_flat" },
    "/paee": { animation: "wired-outline-782-compass-hover-pinch", strokeScale: MEDIUM, flatAnimation: "paee_flat" },
    "/hub": { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: THICK, flatAnimation: "hub_flat" },
    "/diario": { animation: "wired-outline-3140-book-open-hover-pinch", strokeScale: THICK, flatAnimation: "Diario_flat" },
    "/monitoramento": { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: THICK, flatAnimation: "dados_flat" },
    "/infos": { animation: "wired-outline-2167-books-course-assign-hover-pinch", strokeScale: THICK, flatAnimation: "central_inteligencia_flat" },
    "/config-escola": { animation: "wired-outline-406-study-graduation-hover-pinch", strokeScale: THICK, flatAnimation: "configuracao_escola_flat" },
    "/gestao": { animation: "wired-outline-1004-management-team-hover-smooth", strokeScale: MEDIUM, flatAnimation: "usuarios_flat" },
    "/pgi": { animation: "wired-outline-967-questionnaire-hover-pinch", strokeScale: THICK, flatAnimation: "pgi_flat" },
    "/relatorios": { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: THICK, flatAnimation: "dados_flat" },
    "/cursos": { animation: "wired-outline-2167-books-course-assign-hover-pinch", strokeScale: THICK, flatAnimation: "livros_flat" },
    "/ferramentas": { animation: "wired-outline-489-rocket-space-hover-flying", strokeScale: THICK, flatAnimation: "foguete_flat" },
    "/agenda": { animation: "wired-outline-973-appointment-schedule-hover-click", strokeScale: MEDIUM, flatAnimation: "agenda_flat" },
    "/comunicacao": { animation: "wired-outline-411-news-newspaper-hover-pinch", strokeScale: MEDIUM, flatAnimation: "megafone" },
};

/** List of flat animation names bundled with the DS */
export const FLAT_ANIMATIONS = [
    "pei_flat", "paee_flat", "hub_flat", "Diario_flat",
    "dados_flat", "estudantes_flat", "usuarios_flat",
    "configuracao_escola_flat", "pgi_flat", "livros_flat",
    "foguete_flat", "agenda_flat", "megafone",
    "central_inteligencia_flat", "gestão_usuario_flat",
] as const;

export type FlatAnimation = typeof FLAT_ANIMATIONS[number];

// ─── Helpers ───
export function getIconEntry(iconName: string): IconEntry | undefined {
    return ICON_REGISTRY[iconName];
}

export function getRouteEntry(route: string): IconEntry | undefined {
    return ROUTE_REGISTRY[route];
}
