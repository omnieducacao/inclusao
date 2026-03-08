/**
 * Omnisfera — Admin Color Constants (Single Source of Truth)
 *
 * Maps admin COLOR_OPTIONS keys → hex values.
 * Used by PageHero, PageAccentProvider, and any component that needs
 * to resolve admin-saved color keys to actual hex colors.
 *
 * These MUST match the DS moduleColors for consistency.
 * When the admin saves "pei" as a color, it should resolve to the
 * same hex as moduleColors.pei.bg.
 */

import { moduleColors } from "@omni/ds";

// ─── Primary color map (derived from DS) ──────────────────────────────────────

export const ADMIN_COLOR_HEX: Record<string, string> = {
    // Module keys — aligned with DS moduleColors
    omnisfera: moduleColors.omnisfera.bg,
    pei: moduleColors.pei.bg,
    paee: moduleColors.paee.bg,
    hub: moduleColors.hub.bg,
    diario: moduleColors.diario.bg,
    monitoramento: moduleColors.monitoramento.bg,
    ferramentas: moduleColors.ferramentas.bg,
    gestao: moduleColors.gestao.bg,
    cursos: moduleColors.cursos.bg,
    pgi: moduleColors.pgi.bg,
    admin: moduleColors.admin.bg,

    // ─── Legacy keys (backwards compat with existing saved data) ──────────
    sky: moduleColors.omnisfera.bg,
    blue: moduleColors.ferramentas.bg,
    teal: moduleColors.monitoramento.bg,
    green: moduleColors.diario.bg,
    cyan: moduleColors.hub.bg,
    violet: moduleColors.pei.bg,
    rose: moduleColors.paee.bg,
    amber: moduleColors.cursos.bg,
    slate: moduleColors.admin.bg,
    presentation: moduleColors.pgi.bg,
    table: moduleColors.ferramentas.bg,
    test: moduleColors.gestao.bg,
    reports: moduleColors.cursos.bg,
};
