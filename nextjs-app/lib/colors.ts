/**
 * Omnisfera — Color Utils (MIGRATED)
 *
 * Agora derivado de module-theme.ts (que usa DS moduleColors).
 * Mantém exports compatíveis para consumidores existentes.
 *
 * @deprecated Prefira importar de "@/lib/module-theme" diretamente.
 */

import { moduleTheme, getModuleColors, type ModuleThemeKey } from "./module-theme";

// ─── Legacy Color Key → ModuleTheme Key mapping ──────────────────────────────

const legacyKeyMap: Record<string, ModuleThemeKey> = {
  sky: "omnisfera",
  blue: "ferramentas",
  violet: "pei",
  cyan: "hub",
  rose: "paee",
  slate: "admin",
  teal: "monitoramento",
  test: "ferramentas",
  presentation: "pgi",
  table: "gestao",
  green: "diario",
  amber: "cursos",
  // Direct DS keys also work
  pei: "pei",
  paee: "paee",
  hub: "hub",
  diario: "diario",
  cursos: "cursos",
  ferramentas: "ferramentas",
  omnisfera: "omnisfera",
  gestao: "gestao",
  monitoramento: "monitoramento",
  pgi: "pgi",
  admin: "admin",
};

/** Resolve any legacy color key to a ModuleThemeKey */
function resolveKey(colorKey: string): ModuleThemeKey {
  return legacyKeyMap[colorKey] || "omnisfera";
}

// ─── Legacy exports (compat) ─────────────────────────────────────────────────

/**
 * @deprecated Use getModuleColors from module-theme.ts
 */
export function getColorClasses(colorKey: string, isDark?: boolean) {
  return getModuleColors(resolveKey(colorKey), isDark);
}

// Legacy palettes — generated from moduleTheme for backward compat
function buildPalette(isDark: boolean): Record<string, { bg: string; icon: string; text: string }> {
  const palette: Record<string, { bg: string; icon: string; text: string }> = {};
  for (const [legacyKey, themeKey] of Object.entries(legacyKeyMap)) {
    const t = moduleTheme[themeKey];
    palette[legacyKey] = {
      bg: isDark ? t.softDark : t.soft,
      icon: isDark ? t.secondary : t.primary,
      text: isDark ? t.secondary : t.softText,
    };
  }
  return palette;
}

/**
 * @deprecated Use moduleTheme from module-theme.ts
 */
export const colorPalette = buildPalette(false);

/**
 * @deprecated Use moduleTheme from module-theme.ts  
 */
export const colorPaletteDark = buildPalette(true);

/**
 * @deprecated Use routeThemeMap from module-theme.ts
 */
export const moduleColors: Record<string, string> = Object.fromEntries(
  Object.entries(legacyKeyMap).map(([k, v]) => [k, v])
);
