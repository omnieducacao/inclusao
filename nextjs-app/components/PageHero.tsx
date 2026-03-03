"use client";

import { useState, useEffect } from "react";
import { moduleTheme, getRouteTheme, type ModuleThemeKey } from "@/lib/module-theme";
import { moduleColors, type ModuleKey } from "@omni/ds";
import { LottieIcon } from "./LottieIcon";
import { useTheme } from "./ThemeProvider";

// ─── Canonical Lottie icon per module ─────────────────────────────────────────

const moduleLottieIcon: Partial<Record<ModuleThemeKey, string>> = {
  omnisfera: "estudantes_flat",
  pei: "pei_flat",
  paee: "paee_flat",
  hub: "hub_flat",
  diario: "Diario_flat",
  cursos: "pei_flat",
  ferramentas: "hub_flat",
  gestao: "gestao_usuario_simples",
  monitoramento: "dados_flat",
  pgi: "pgi_flat",
  admin: "configuracao_escola_flat",
};

// ─── Legacy icon name → module key mapping ────────────────────────────────────

const legacyIconToModule: Record<string, ModuleThemeKey> = {
  UsersFour: "omnisfera",
  Student: "pei",
  Compass: "pei",
  PuzzlePiece: "paee",
  Puzzle: "paee",
  RocketLaunch: "hub",
  Rocket: "hub",
  BookOpen: "diario",
  ChartLineUp: "monitoramento",
  BarChart3: "monitoramento",
  UsersThree: "gestao",
  Settings: "gestao",
  GraduationCap: "cursos",
  School: "cursos",
  ClipboardText: "pgi",
  ClipboardList: "pgi",
  Gear: "admin",
  BookBookmark: "gestao",
  BookMarked: "gestao",
  Brain: "ferramentas",
};

// ─── Route → admin config key ─────────────────────────────────────────────────

const routeToAdminKey: Record<string, string> = {
  "/estudantes": "estudantes",
  "/pei": "pei",
  "/pei-regente": "pei-regente",
  "/plano-curso": "plano-curso",
  "/avaliacao-diagnostica": "avaliacao-diagnostica",
  "/avaliacao-processual": "avaliacao-processual",
  "/paee": "paee",
  "/hub": "hub",
  "/diario": "diario",
  "/monitoramento": "monitoramento",
  "/infos": "infos",
  "/pgi": "pgi",
  "/gestao": "gestao",
  "/config-escola": "config-escola",
  "/admin": "admin",
};

// moduleKey → admin key (for when route is not provided)
const moduleKeyToAdminKey: Record<string, string> = {
  estudantes: "estudantes",
  pei: "pei",
  paee: "paee",
  hub: "hub",
  diario: "diario",
  monitoramento: "monitoramento",
  gestao: "gestao",
  pgi: "pgi",
  cursos: "config-escola",
  omnisfera: "estudantes",
  ferramentas: "avaliacao-diagnostica",
};

// ─── Props ────────────────────────────────────────────────────────────────────

type PageHeroProps = {
  moduleKey?: ModuleThemeKey;
  route?: string;
  /** Explicit admin customization key (overrides moduleKey/route derivation) */
  adminKey?: string;
  title: string;
  desc: string;
  /** @deprecated Use moduleKey instead */
  iconName?: string;
  /** @deprecated Use moduleKey instead */
  color?: string;
  useLottie?: boolean;
  /** Explicit Lottie override (e.g., from home page customization) */
  lottieOverride?: string;
};

// Map admin COLOR_OPTIONS keys → hex (matches DS moduleColors)
const ADMIN_COLOR_HEX: Record<string, string> = {
  omnisfera: "#0ea5e9", pei: "#7c3aed", paee: "#e11d48", hub: "#0891b2",
  diario: "#059669", monitoramento: "#0d9488", ferramentas: "#2563eb",
  gestao: "#6366f1", cursos: "#d97706", pgi: "#8b5cf6", admin: "#475569",
  // Legacy keys (backwards compat with existing saved data)
  sky: "#0ea5e9", blue: "#2563eb", teal: "#0d9488", green: "#059669",
  cyan: "#0891b2", violet: "#7c3aed", rose: "#e11d48", amber: "#d97706",
  slate: "#475569", presentation: "#8b5cf6", table: "#2563eb",
  test: "#6366f1", reports: "#d97706",
};

export function PageHero({
  moduleKey,
  route,
  adminKey: adminKeyProp,
  title,
  desc,
  iconName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  color,
  useLottie = true,
  lottieOverride: propLottieOverride,
}: PageHeroProps) {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === "dark";
  const isNotebook = themeMode === "notebook";

  // ─── Resolve module key ──────────────────────────────────────────────
  let resolvedKey: ModuleThemeKey = "omnisfera";
  if (moduleKey) {
    resolvedKey = moduleKey;
  } else if (route) {
    const routeTheme = getRouteTheme(route);
    resolvedKey = (Object.entries(moduleTheme).find(
      ([, v]) => v === routeTheme
    )?.[0] as ModuleThemeKey) || "omnisfera";
  } else if (iconName && legacyIconToModule[iconName]) {
    resolvedKey = legacyIconToModule[iconName];
  }

  const theme = moduleTheme[resolvedKey];
  const dsColors = (resolvedKey in moduleColors)
    ? moduleColors[resolvedKey as ModuleKey]
    : moduleColors.omnisfera;

  const defaultLottieAnimation = moduleLottieIcon[resolvedKey];

  // ─── Read admin customization from DB ──────────────────────────────────────
  const [adminIcon, setAdminIcon] = useState<string | null>(null);
  const [adminColor, setAdminColor] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const adminKey = adminKeyProp
      || (route ? routeToAdminKey[route] : undefined)
      || (moduleKey ? moduleKeyToAdminKey[moduleKey] : undefined);
    if (!adminKey) return;

    fetch("/api/public/platform-config?key=card_customizations")
      .then(r => r.json())
      .then(data => {
        if (data?.value) {
          try {
            const customs = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
            if (customs[adminKey]?.icon) {
              setAdminIcon(customs[adminKey].icon);
            }
            // heroColor is independent; fallback to color if not set
            const hc = customs[adminKey]?.heroColor || customs[adminKey]?.color;
            if (hc) {
              setAdminColor(hc);
            }
          } catch { /* silent */ }
        }
      })
      .catch(() => { /* silent */ });
  }, [route, moduleKey, adminKeyProp]);

  // Priority: prop override > admin DB > default
  const lottieAnimation = propLottieOverride || adminIcon || defaultLottieAnimation;

  // Resolve effective colors (admin color override > default)
  // Admin saves color keys like 'sky', 'blue', 'violet' — map to hex
  const adminHex = adminColor ? ADMIN_COLOR_HEX[adminColor] : null;

  // Helper: create pastel bg from hex (blend 92% toward white)
  function hexToPastelBg(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const blend = (c: number) => Math.round(c + (255 - c) * 0.92);
    return `#${blend(r).toString(16).padStart(2, "0")}${blend(g).toString(16).padStart(2, "0")}${blend(b).toString(16).padStart(2, "0")}`;
  }

  // Helper: darken hex for text on pastel bg
  function hexToDarkenedText(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = (c: number) => Math.max(0, Math.round(c * 0.7));
    return `#${d(r).toString(16).padStart(2, "0")}${d(g).toString(16).padStart(2, "0")}${d(b).toString(16).padStart(2, "0")}`;
  }

  let cardBg: string;
  let textColor: string;
  let accentColor: string;

  if (adminHex) {
    // Admin override with notebook/dark/light mode awareness
    if (isNotebook) {
      cardBg = hexToPastelBg(adminHex);
      textColor = hexToDarkenedText(adminHex);
    } else if (isDark) {
      cardBg = `${adminHex}22`;
      textColor = adminHex;
    } else {
      cardBg = adminHex;
      textColor = "#ffffff";
    }
    accentColor = adminHex;
  } else {
    // Default: use module theme/DS colors
    const effectiveTheme = moduleTheme[resolvedKey];
    const effectiveDsColors = (resolvedKey in moduleColors)
      ? moduleColors[resolvedKey as ModuleKey]
      : moduleColors.omnisfera;
    cardBg = isNotebook ? effectiveDsColors.bgPastel : isDark ? effectiveTheme.softDark : effectiveDsColors.bg;
    textColor = isNotebook ? effectiveDsColors.textPastel : isDark ? effectiveTheme.secondary : "#ffffff";
    accentColor = effectiveTheme.primary;
  }

  // Helper: lighten hex for gradient line contrast on saturated bg
  function hexLighten(hex: string, amount: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const l = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
    return `#${l(r).toString(16).padStart(2, "0")}${l(g).toString(16).padStart(2, "0")}${l(b).toString(16).padStart(2, "0")}`;
  }

  // Gradient line color: needs to contrast with cardBg
  const gradientLineColor = isNotebook
    ? accentColor // notebook bg is pastel, saturated accent will pop
    : isDark
      ? accentColor // dark bg, saturated accent visible
      : hexLighten(accentColor, 0.4); // saturated bg → lighter line for contrast

  // ─── Skeleton while loading ─────────────────────────────────────────
  if (!isMounted || !useLottie || !lottieAnimation) {
    return (
      <div
        className="rounded-2xl overflow-hidden animate-fade-in-up"
        style={{ backgroundColor: cardBg, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
      >
        <div className="h-1 w-full opacity-60" style={{ background: `linear-gradient(to right, ${gradientLineColor}, ${gradientLineColor}88)` }} />
        <div className="flex items-center gap-5 h-[120px] px-8 md:px-10">
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-(--omni-bg-tertiary) rounded-xl animate-pulse" />
          </div>
          <div>
            <h1 className="omni-heading-lg" style={{ color: textColor }}>{title}</h1>
            <p className="omni-body mt-0.5" style={{ color: isNotebook ? `${dsColors.textPastel}99` : isDark ? "var(--omni-text-secondary)" : "rgba(255,255,255,0.7)" }}>{desc}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up"
      style={{
        backgroundColor: cardBg,
        boxShadow: isHovered
          ? isNotebook
            ? "0 8px 24px rgba(0,0,0,0.06)"
            : "0 8px 24px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)"
          : isNotebook
            ? "0 2px 8px rgba(0,0,0,0.04)"
            : "0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03)",
        ...(isNotebook ? { border: `1px solid ${dsColors.bg}25` } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top accent bar — contrasting gradient */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${gradientLineColor}, ${gradientLineColor}88)` }} />

      <div className="flex items-center gap-6 h-[120px] px-8 md:px-10">
        {/* Lottie icon — glass container matching home card style */}
        <div
          className="rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-105 shrink-0 border border-white/20"
          style={{
            width: "80px",
            height: "80px",
            padding: "6px",
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}09)`,
            boxShadow: isHovered
              ? `0 8px 20px ${accentColor}25`
              : `0 2px 10px ${accentColor}15, 0 1px 3px rgba(0,0,0,0.06)`,
          }}
        >
          <LottieIcon
            animation={lottieAnimation}
            size={60}
            className="shrink-0"
          />
        </div>
        <div className="flex-1">
          <h1 className="omni-heading-lg tracking-tight mb-0.5" style={{ color: textColor }}>{title}</h1>
          <p className="omni-body leading-relaxed" style={{ color: isNotebook ? `${dsColors.textPastel}99` : isDark ? "var(--omni-text-secondary)" : "rgba(255,255,255,0.7)" }}>
            {desc} — {title}
          </p>
        </div>
      </div>
    </div>
  );
}
