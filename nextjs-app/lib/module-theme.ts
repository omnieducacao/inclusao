/**
 * Omnisfera — Module Theme (fonte única de cores por módulo)
 *
 * Derivado do DS moduleColors. Todos os consumidores (Navbar, PageHero,
 * ModuleCardsLottie, QuickActions) devem importar daqui.
 */

import { moduleColors } from "@omni/ds";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lighten a hex color into a soft tint (for light-mode backgrounds) */
function softTint(hex: string, alpha = 0.08): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

/** Lighten hex into a very pale pastel for light-mode card backgrounds */
function pastelBg(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Blend toward white at ~92%
    const blend = (c: number) => Math.round(c + (255 - c) * 0.92);
    return `#${blend(r).toString(16).padStart(2, "0")}${blend(g).toString(16).padStart(2, "0")}${blend(b).toString(16).padStart(2, "0")}`;
}

/** Slightly darken a hex color for secondary shades */
function darken(hex: string, amount = 0.15): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
    return `#${d(r).toString(16).padStart(2, "0")}${d(g).toString(16).padStart(2, "0")}${d(b).toString(16).padStart(2, "0")}`;
}

/** Slightly lighten a hex color */
function lighten(hex: string, amount = 0.2): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const l = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
    return `#${l(r).toString(16).padStart(2, "0")}${l(g).toString(16).padStart(2, "0")}${l(b).toString(16).padStart(2, "0")}`;
}

// ─── Theme Builder ────────────────────────────────────────────────────────────

function buildTheme(key: string, ds: { bg: string; text: string; glow: string }) {
    return {
        /** Cor primária do módulo (usada em cards, glows, accent bars) */
        primary: ds.bg,
        /** Cor secundária (versão mais clara) */
        secondary: lighten(ds.bg, 0.25),
        /** Cor de texto sobre fundo colorido */
        text: ds.text,
        /** Glow / sombra colorida */
        glow: ds.glow,
        /** Gradiente para navbar, accent bars */
        navGrad: { from: ds.bg, to: lighten(ds.bg, 0.25) },
        /** Array de gradiente para uso em CSS */
        gradient: [ds.bg, lighten(ds.bg, 0.25)] as [string, string],
        /** Fundo suave (light mode — cards, PageHero bg) */
        soft: pastelBg(ds.bg),
        /** Fundo suave (dark mode) */
        softDark: softTint(ds.bg, 0.12),
        /** Cor do ícone Phosphor / acento em contextos claros */
        icon: ds.bg,
        /** Cor de texto sobre fundo suave */
        softText: darken(ds.bg, 0.15),
    };
}

// ─── Module Theme Map ─────────────────────────────────────────────────────────

export const moduleTheme = {
    pei: buildTheme("pei", moduleColors.pei),
    paee: buildTheme("paee", moduleColors.paee),
    hub: buildTheme("hub", moduleColors.hub),
    diario: buildTheme("diario", moduleColors.diario),
    cursos: buildTheme("cursos", moduleColors.cursos),
    ferramentas: buildTheme("ferramentas", moduleColors.ferramentas),
    omnisfera: buildTheme("omnisfera", moduleColors.omnisfera),
    gestao: buildTheme("gestao", moduleColors.gestao),
    monitoramento: buildTheme("monitoramento", moduleColors.monitoramento),
    pgi: buildTheme("pgi", moduleColors.pgi),
    admin: buildTheme("admin", moduleColors.admin),
    // ── Legacy admin COLOR_OPTIONS aliases (backwards compat with existing saved data) ──
    // These map to the same DS colors as the new keys for consistency
    sky: buildTheme("sky", moduleColors.omnisfera),
    blue: buildTheme("blue", moduleColors.ferramentas),
    teal: buildTheme("teal", moduleColors.monitoramento),
    green: buildTheme("green", moduleColors.diario),
    cyan: buildTheme("cyan", moduleColors.hub),
    violet: buildTheme("violet", moduleColors.pei),
    rose: buildTheme("rose", moduleColors.paee),
    amber: buildTheme("amber", moduleColors.cursos),
    slate: buildTheme("slate", moduleColors.admin),
    presentation: buildTheme("presentation", moduleColors.pgi),
    table: buildTheme("table", moduleColors.ferramentas),
    test: buildTheme("test", moduleColors.gestao),
    reports: buildTheme("reports", moduleColors.cursos),
} as const;

export type ModuleThemeKey = keyof typeof moduleTheme;

// ─── Route → Theme lookup ─────────────────────────────────────────────────────

/** Mapeia cada rota do dashboard para sua chave de tema */
export const routeThemeMap: Record<string, ModuleThemeKey> = {
    "/": "omnisfera",
    "/estudantes": "omnisfera",
    "/pei": "pei",
    "/pei-regente": "monitoramento",
    "/pei-professor": "monitoramento",  // redirects to /pei-regente
    "/plano-curso": "omnisfera",
    "/avaliacao-diagnostica": "ferramentas",
    "/avaliacao-processual": "diario",
    "/paee": "paee",
    "/hub": "hub",
    "/diario": "diario",
    "/monitoramento": "monitoramento",
    "/infos": "gestao",
    "/config-escola": "cursos",
    "/gestao": "gestao",
    "/pgi": "pgi",
    "/admin": "admin",
    "/perfil": "omnisfera",
    "/familia": "omnisfera",
};

/** Retorna o tema de cores para uma rota */
export function getRouteTheme(route: string) {
    const key = routeThemeMap[route] || "omnisfera";
    return moduleTheme[key];
}

// ─── Compat: getColorClasses drop-in replacement ──────────────────────────────

/** Drop-in replacement para getColorClasses do antigo lib/colors.ts */
export function getModuleColors(moduleKey: string, _isDark?: boolean) {
    const theme = moduleTheme[moduleKey as ModuleThemeKey] || moduleTheme.omnisfera;
    return {
        bg: _isDark ? theme.softDark : theme.soft,
        icon: theme.primary,
        text: theme.softText,
    };
}
