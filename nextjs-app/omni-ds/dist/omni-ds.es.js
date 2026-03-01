var _e = Object.defineProperty;
var Me = (t, n, c) => n in t ? _e(t, n, { enumerable: !0, configurable: !0, writable: !0, value: c }) : t[n] = c;
var Ce = (t, n, c) => Me(t, typeof n != "symbol" ? n + "" : n, c);
import { jsxs, jsx } from "react/jsx-runtime";
import i$1, { forwardRef, useState, useContext, createContext, useRef, useEffect, useCallback, useMemo } from "react";
const moduleColors = {
  pei: { bg: "#7c3aed", text: "#ffffff", glow: "rgba(139, 92, 246, 0.25)" },
  paee: { bg: "#e11d48", text: "#ffffff", glow: "rgba(244, 63, 94, 0.25)" },
  hub: { bg: "#0891b2", text: "#ffffff", glow: "rgba(6, 182, 212, 0.25)" },
  diario: { bg: "#059669", text: "#ffffff", glow: "rgba(16, 185, 129, 0.25)" },
  cursos: { bg: "#d97706", text: "#ffffff", glow: "rgba(245, 158, 11, 0.25)" },
  ferramentas: { bg: "#2563eb", text: "#ffffff", glow: "rgba(59, 130, 246, 0.25)" },
  omnisfera: { bg: "#0ea5e9", text: "#ffffff", glow: "rgba(56, 189, 248, 0.25)" },
  gestao: { bg: "#6366f1", text: "#ffffff", glow: "rgba(99, 102, 241, 0.25)" },
  monitoramento: { bg: "#0d9488", text: "#ffffff", glow: "rgba(20, 184, 166, 0.25)" },
  pgi: { bg: "#8b5cf6", text: "#ffffff", glow: "rgba(139, 92, 246, 0.25)" },
  admin: { bg: "#475569", text: "#ffffff", glow: "rgba(71, 85, 105, 0.25)" }
}, semanticColors = {
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
    borderSubtle: "rgba(241, 245, 249, 0.8)"
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
    borderSubtle: "rgba(30, 41, 59, 0.8)"
  }
}, feedbackColors = {
  success: { base: "#10b981", soft: "#ecfdf5", text: "#059669" },
  warning: { base: "#f59e0b", soft: "#fffbeb", text: "#d97706" },
  error: { base: "#ef4444", soft: "#fef2f2", text: "#dc2626" },
  info: { base: "#3b82f6", soft: "#eff6ff", text: "#2563eb" },
  neutral: { base: "#94a3b8", soft: "#f1f5f9", text: "#64748b" }
}, masteryColors = {
  none: { base: "#94a3b8", bg: "#f1f5f9" },
  beginner: { base: "#f59e0b", bg: "#fffbeb" },
  learning: { base: "#3b82f6", bg: "#eff6ff" },
  advanced: { base: "#8b5cf6", bg: "#f5f3ff" },
  mastered: { base: "#10b981", bg: "#ecfdf5" }
}, areaColors = {
  linguagens: "#8b5cf6",
  matematica: "#3b82f6",
  humanas: "#f59e0b",
  natureza: "#10b981",
  redacao: "#ec4899"
}, brandColors = {
  primary: "#6366f1",
  primarySoft: "#eef2ff",
  primaryText: "#4f46e5"
}, statusColors = {
  success: feedbackColors.success.base,
  warning: feedbackColors.warning.base,
  error: feedbackColors.error.base,
  info: feedbackColors.info.base
}, gradients = {
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
  peiGlow: "linear-gradient(135deg, #7c3aed, #a855f7)",
  hubGlow: "linear-gradient(135deg, #0891b2, #06b6d4)",
  diarioGlow: "linear-gradient(135deg, #059669, #10b981)",
  paeeGlow: "linear-gradient(135deg, #e11d48, #f43f5e)",
  cursosGlow: "linear-gradient(135deg, #d97706, #f59e0b)"
}, fontFamily = {
  primary: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
}, fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800
}, fontSize = {
  xs: "0.75rem",
  // 12px
  sm: "0.875rem",
  // 14px
  base: "1rem",
  // 16px
  lg: "1.125rem",
  // 18px
  xl: "1.25rem",
  // 20px
  "2xl": "1.5rem",
  // 24px
  "3xl": "1.75rem",
  // 28px
  "4xl": "2.25rem"
  // 36px
}, lineHeight = {
  tight: 1.15,
  snug: 1.2,
  normal: 1.4,
  relaxed: 1.6
}, letterSpacing = {
  tighter: "-0.035em",
  tight: "-0.02em",
  snug: "-0.015em",
  normal: "-0.01em",
  wide: "0.01em"
}, textStyles = {
  display: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.extrabold,
    letterSpacing: letterSpacing.tighter,
    lineHeight: lineHeight.tight
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.snug,
    lineHeight: lineHeight.snug
  },
  subsection: {
    fontSize: "0.9375rem",
    fontWeight: 650,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeight.normal
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide
  }
}, shadows = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
  sm: "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)",
  md: "0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.06)",
  xl: "0 12px 32px rgba(0, 0, 0, 0.1), 0 24px 64px rgba(0, 0, 0, 0.08)",
  innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.2)"
}, shadowsDark = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.2)",
  sm: "0 2px 8px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15)",
  md: "0 4px 12px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.35), 0 16px 48px rgba(0, 0, 0, 0.25)",
  xl: "0 12px 32px rgba(0, 0, 0, 0.4), 0 24px 64px rgba(0, 0, 0, 0.3)",
  innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
}, radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px"
}, transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "500ms cubic-bezier(0.16, 1, 0.3, 1)"
}, ICON_GRAPHITE = "#121331", ICON_PRIMARY_DEFAULT = "#7c3aed", ICON_SYSTEM_COLOR = "#94a3b8", ICON_SYSTEM_BG = "#1e293b", iconSize = {
  /** Inline text, badges */
  xs: 16,
  /** Botões compactos, chips */
  sm: 20,
  /** Padrão — menus, listas, inputs */
  md: 24,
  /** Cards, section headers */
  lg: 32,
  /** Module cards, hero */
  xl: 40,
  /** Destaque, empty states */
  "2xl": 48,
  /** Hero sections, splash */
  "3xl": 64
};
function iconColors(t, n = ICON_GRAPHITE) {
  return `primary:${n},secondary:${t}`;
}
const moduleIcons = {
  pei: {
    flat: "pei_flat",
    outline: "wired-outline-426-brain-hover-pinch"
  },
  hub: {
    flat: "hub_flat",
    outline: "wired-outline-3139-rocket-space-alt-hover-pinch"
  },
  diario: {
    flat: "Diario_flat",
    outline: "wired-outline-3140-book-open-hover-pinch"
  },
  paee: {
    flat: "paee_flat",
    outline: "wired-outline-782-compass-hover-pinch"
  },
  estudantes: {
    flat: "estudantes_flat",
    outline: "wired-outline-529-boy-girl-children-hover-pinch"
  },
  pgi: {
    flat: "pgi_flat",
    outline: "wired-outline-967-questionnaire-hover-pinch"
  },
  monitoramento: {
    flat: "dados_flat",
    outline: "wired-outline-152-bar-chart-arrow-hover-growth"
  },
  gestao: {
    flat: "usuarios_flat",
    outline: "wired-outline-1004-management-team-hover-smooth"
  }
}, spacing = {
  0: "0px",
  px: "1px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px"
}, spacingAlias = {
  /** Espaçamento interno de componentes compactos (buttons, badges) */
  componentXs: spacing[1],
  // 4px
  /** Espaçamento interno padrão de componentes */
  componentSm: spacing[2],
  // 8px
  /** Espaçamento interno de cards e containers */
  componentMd: spacing[4],
  // 16px
  /** Espaçamento interno de sections */
  componentLg: spacing[6],
  // 24px
  /** Gap entre itens de lista */
  listGap: spacing[2],
  // 8px
  /** Gap entre cards em grids */
  gridGap: spacing[3],
  // 12px
  /** Margem entre seções da página */
  sectionGap: spacing[8],
  // 32px
  /** Padding de página */
  pagePadding: spacing[10]
  // 40px
}, zIndex = {
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
  devtools: 9999
}, breakpoints = {
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
  "2xl": 1536
}, mediaQueries = {
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
  touch: "(hover: none) and (pointer: coarse)"
}, duration = {
  /** Micro-interações: hover, focus ring */
  instant: "100ms",
  /** Transições rápidas: botões, toggles */
  fast: "150ms",
  /** Transições padrão: cards, menus */
  normal: "250ms",
  /** Transições elaboradas: modais, drawers */
  slow: "400ms",
  /** Animações complexas: page transitions */
  slower: "600ms"
}, easing = {
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
  linear: "linear"
}, motionPresets = {
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
  pop: `all ${duration.fast} ${easing.spring}`
};
function r$2(t) {
  var n, c, d = "";
  if (typeof t == "string" || typeof t == "number") d += t;
  else if (typeof t == "object") if (Array.isArray(t)) {
    var v = t.length;
    for (n = 0; n < v; n++) t[n] && (c = r$2(t[n])) && (d && (d += " "), d += c);
  } else for (c in t) t[c] && (d && (d += " "), d += c);
  return d;
}
function clsx() {
  for (var t, n, c = 0, d = "", v = arguments.length; c < v; c++) (t = arguments[c]) && (n = r$2(t)) && (d && (d += " "), d += n);
  return d;
}
const falsyToString = (t) => typeof t == "boolean" ? `${t}` : t === 0 ? "0" : t, cx = clsx, cva = (t, n) => (c) => {
  var d;
  if ((n == null ? void 0 : n.variants) == null) return cx(t, c == null ? void 0 : c.class, c == null ? void 0 : c.className);
  const { variants: v, defaultVariants: y } = n, x = Object.keys(v).map((C) => {
    const P = c == null ? void 0 : c[C], F = y == null ? void 0 : y[C];
    if (P === null) return null;
    const S = falsyToString(P) || falsyToString(F);
    return v[C][S];
  }), w = c && Object.entries(c).reduce((C, P) => {
    let [F, S] = P;
    return S === void 0 || (C[F] = S), C;
  }, {}), k = n == null || (d = n.compoundVariants) === null || d === void 0 ? void 0 : d.reduce((C, P) => {
    let { class: F, className: S, ...j } = P;
    return Object.entries(j).every((T) => {
      let [A, R] = T;
      return Array.isArray(R) ? R.includes({
        ...y,
        ...w
      }[A]) : {
        ...y,
        ...w
      }[A] === R;
    }) ? [
      ...C,
      F,
      S
    ] : C;
  }, []);
  return cx(t, x, k, c == null ? void 0 : c.class, c == null ? void 0 : c.className);
}, concatArrays = (t, n) => {
  const c = new Array(t.length + n.length);
  for (let d = 0; d < t.length; d++)
    c[d] = t[d];
  for (let d = 0; d < n.length; d++)
    c[t.length + d] = n[d];
  return c;
}, createClassValidatorObject = (t, n) => ({
  classGroupId: t,
  validator: n
}), createClassPartObject = (t = /* @__PURE__ */ new Map(), n = null, c) => ({
  nextPart: t,
  validators: n,
  classGroupId: c
}), CLASS_PART_SEPARATOR = "-", EMPTY_CONFLICTS = [], ARBITRARY_PROPERTY_PREFIX = "arbitrary..", createClassGroupUtils = (t) => {
  const n = createClassMap(t), {
    conflictingClassGroups: c,
    conflictingClassGroupModifiers: d
  } = t;
  return {
    getClassGroupId: (x) => {
      if (x.startsWith("[") && x.endsWith("]"))
        return getGroupIdForArbitraryProperty(x);
      const w = x.split(CLASS_PART_SEPARATOR), k = w[0] === "" && w.length > 1 ? 1 : 0;
      return getGroupRecursive(w, k, n);
    },
    getConflictingClassGroupIds: (x, w) => {
      if (w) {
        const k = d[x], C = c[x];
        return k ? C ? concatArrays(C, k) : k : C || EMPTY_CONFLICTS;
      }
      return c[x] || EMPTY_CONFLICTS;
    }
  };
}, getGroupRecursive = (t, n, c) => {
  if (t.length - n === 0)
    return c.classGroupId;
  const v = t[n], y = c.nextPart.get(v);
  if (y) {
    const C = getGroupRecursive(t, n + 1, y);
    if (C) return C;
  }
  const x = c.validators;
  if (x === null)
    return;
  const w = n === 0 ? t.join(CLASS_PART_SEPARATOR) : t.slice(n).join(CLASS_PART_SEPARATOR), k = x.length;
  for (let C = 0; C < k; C++) {
    const P = x[C];
    if (P.validator(w))
      return P.classGroupId;
  }
}, getGroupIdForArbitraryProperty = (t) => t.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const n = t.slice(1, -1), c = n.indexOf(":"), d = n.slice(0, c);
  return d ? ARBITRARY_PROPERTY_PREFIX + d : void 0;
})(), createClassMap = (t) => {
  const {
    theme: n,
    classGroups: c
  } = t;
  return processClassGroups(c, n);
}, processClassGroups = (t, n) => {
  const c = createClassPartObject();
  for (const d in t) {
    const v = t[d];
    processClassesRecursively(v, c, d, n);
  }
  return c;
}, processClassesRecursively = (t, n, c, d) => {
  const v = t.length;
  for (let y = 0; y < v; y++) {
    const x = t[y];
    processClassDefinition(x, n, c, d);
  }
}, processClassDefinition = (t, n, c, d) => {
  if (typeof t == "string") {
    processStringDefinition(t, n, c);
    return;
  }
  if (typeof t == "function") {
    processFunctionDefinition(t, n, c, d);
    return;
  }
  processObjectDefinition(t, n, c, d);
}, processStringDefinition = (t, n, c) => {
  const d = t === "" ? n : getPart(n, t);
  d.classGroupId = c;
}, processFunctionDefinition = (t, n, c, d) => {
  if (isThemeGetter(t)) {
    processClassesRecursively(t(d), n, c, d);
    return;
  }
  n.validators === null && (n.validators = []), n.validators.push(createClassValidatorObject(c, t));
}, processObjectDefinition = (t, n, c, d) => {
  const v = Object.entries(t), y = v.length;
  for (let x = 0; x < y; x++) {
    const [w, k] = v[x];
    processClassesRecursively(k, getPart(n, w), c, d);
  }
}, getPart = (t, n) => {
  let c = t;
  const d = n.split(CLASS_PART_SEPARATOR), v = d.length;
  for (let y = 0; y < v; y++) {
    const x = d[y];
    let w = c.nextPart.get(x);
    w || (w = createClassPartObject(), c.nextPart.set(x, w)), c = w;
  }
  return c;
}, isThemeGetter = (t) => "isThemeGetter" in t && t.isThemeGetter === !0, createLruCache = (t) => {
  if (t < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let n = 0, c = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ Object.create(null);
  const v = (y, x) => {
    c[y] = x, n++, n > t && (n = 0, d = c, c = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(y) {
      let x = c[y];
      if (x !== void 0)
        return x;
      if ((x = d[y]) !== void 0)
        return v(y, x), x;
    },
    set(y, x) {
      y in c ? c[y] = x : v(y, x);
    }
  };
}, IMPORTANT_MODIFIER = "!", MODIFIER_SEPARATOR = ":", EMPTY_MODIFIERS = [], createResultObject = (t, n, c, d, v) => ({
  modifiers: t,
  hasImportantModifier: n,
  baseClassName: c,
  maybePostfixModifierPosition: d,
  isExternal: v
}), createParseClassName = (t) => {
  const {
    prefix: n,
    experimentalParseClassName: c
  } = t;
  let d = (v) => {
    const y = [];
    let x = 0, w = 0, k = 0, C;
    const P = v.length;
    for (let A = 0; A < P; A++) {
      const R = v[A];
      if (x === 0 && w === 0) {
        if (R === MODIFIER_SEPARATOR) {
          y.push(v.slice(k, A)), k = A + 1;
          continue;
        }
        if (R === "/") {
          C = A;
          continue;
        }
      }
      R === "[" ? x++ : R === "]" ? x-- : R === "(" ? w++ : R === ")" && w--;
    }
    const F = y.length === 0 ? v : v.slice(k);
    let S = F, j = !1;
    F.endsWith(IMPORTANT_MODIFIER) ? (S = F.slice(0, -1), j = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      F.startsWith(IMPORTANT_MODIFIER) && (S = F.slice(1), j = !0)
    );
    const T = C && C > k ? C - k : void 0;
    return createResultObject(y, j, S, T);
  };
  if (n) {
    const v = n + MODIFIER_SEPARATOR, y = d;
    d = (x) => x.startsWith(v) ? y(x.slice(v.length)) : createResultObject(EMPTY_MODIFIERS, !1, x, void 0, !0);
  }
  if (c) {
    const v = d;
    d = (y) => c({
      className: y,
      parseClassName: v
    });
  }
  return d;
}, createSortModifiers = (t) => {
  const n = /* @__PURE__ */ new Map();
  return t.orderSensitiveModifiers.forEach((c, d) => {
    n.set(c, 1e6 + d);
  }), (c) => {
    const d = [];
    let v = [];
    for (let y = 0; y < c.length; y++) {
      const x = c[y], w = x[0] === "[", k = n.has(x);
      w || k ? (v.length > 0 && (v.sort(), d.push(...v), v = []), d.push(x)) : v.push(x);
    }
    return v.length > 0 && (v.sort(), d.push(...v)), d;
  };
}, createConfigUtils = (t) => ({
  cache: createLruCache(t.cacheSize),
  parseClassName: createParseClassName(t),
  sortModifiers: createSortModifiers(t),
  ...createClassGroupUtils(t)
}), SPLIT_CLASSES_REGEX = /\s+/, mergeClassList = (t, n) => {
  const {
    parseClassName: c,
    getClassGroupId: d,
    getConflictingClassGroupIds: v,
    sortModifiers: y
  } = n, x = [], w = t.trim().split(SPLIT_CLASSES_REGEX);
  let k = "";
  for (let C = w.length - 1; C >= 0; C -= 1) {
    const P = w[C], {
      isExternal: F,
      modifiers: S,
      hasImportantModifier: j,
      baseClassName: T,
      maybePostfixModifierPosition: A
    } = c(P);
    if (F) {
      k = P + (k.length > 0 ? " " + k : k);
      continue;
    }
    let R = !!A, M = d(R ? T.substring(0, A) : T);
    if (!M) {
      if (!R) {
        k = P + (k.length > 0 ? " " + k : k);
        continue;
      }
      if (M = d(T), !M) {
        k = P + (k.length > 0 ? " " + k : k);
        continue;
      }
      R = !1;
    }
    const _ = S.length === 0 ? "" : S.length === 1 ? S[0] : y(S).join(":"), E = j ? _ + IMPORTANT_MODIFIER : _, I = E + M;
    if (x.indexOf(I) > -1)
      continue;
    x.push(I);
    const L = v(M, R);
    for (let D = 0; D < L.length; ++D) {
      const O = L[D];
      x.push(E + O);
    }
    k = P + (k.length > 0 ? " " + k : k);
  }
  return k;
}, twJoin = (...t) => {
  let n = 0, c, d, v = "";
  for (; n < t.length; )
    (c = t[n++]) && (d = toValue(c)) && (v && (v += " "), v += d);
  return v;
}, toValue = (t) => {
  if (typeof t == "string")
    return t;
  let n, c = "";
  for (let d = 0; d < t.length; d++)
    t[d] && (n = toValue(t[d])) && (c && (c += " "), c += n);
  return c;
}, createTailwindMerge = (t, ...n) => {
  let c, d, v, y;
  const x = (k) => {
    const C = n.reduce((P, F) => F(P), t());
    return c = createConfigUtils(C), d = c.cache.get, v = c.cache.set, y = w, w(k);
  }, w = (k) => {
    const C = d(k);
    if (C)
      return C;
    const P = mergeClassList(k, c);
    return v(k, P), P;
  };
  return y = x, (...k) => y(twJoin(...k));
}, fallbackThemeArr = [], fromTheme = (t) => {
  const n = (c) => c[t] || fallbackThemeArr;
  return n.isThemeGetter = !0, n;
}, arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i, fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, isFraction = (t) => fractionRegex.test(t), isNumber = (t) => !!t && !Number.isNaN(Number(t)), isInteger = (t) => !!t && Number.isInteger(Number(t)), isPercent = (t) => t.endsWith("%") && isNumber(t.slice(0, -1)), isTshirtSize = (t) => tshirtUnitRegex.test(t), isAny = () => !0, isLengthOnly = (t) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(t) && !colorFunctionRegex.test(t)
), isNever = () => !1, isShadow = (t) => shadowRegex.test(t), isImage = (t) => imageRegex.test(t), isAnyNonArbitrary = (t) => !isArbitraryValue(t) && !isArbitraryVariable(t), isArbitrarySize = (t) => getIsArbitraryValue(t, isLabelSize, isNever), isArbitraryValue = (t) => arbitraryValueRegex.test(t), isArbitraryLength = (t) => getIsArbitraryValue(t, isLabelLength, isLengthOnly), isArbitraryNumber = (t) => getIsArbitraryValue(t, isLabelNumber, isNumber), isArbitraryWeight = (t) => getIsArbitraryValue(t, isLabelWeight, isAny), isArbitraryFamilyName = (t) => getIsArbitraryValue(t, isLabelFamilyName, isNever), isArbitraryPosition = (t) => getIsArbitraryValue(t, isLabelPosition, isNever), isArbitraryImage = (t) => getIsArbitraryValue(t, isLabelImage, isImage), isArbitraryShadow = (t) => getIsArbitraryValue(t, isLabelShadow, isShadow), isArbitraryVariable = (t) => arbitraryVariableRegex.test(t), isArbitraryVariableLength = (t) => getIsArbitraryVariable(t, isLabelLength), isArbitraryVariableFamilyName = (t) => getIsArbitraryVariable(t, isLabelFamilyName), isArbitraryVariablePosition = (t) => getIsArbitraryVariable(t, isLabelPosition), isArbitraryVariableSize = (t) => getIsArbitraryVariable(t, isLabelSize), isArbitraryVariableImage = (t) => getIsArbitraryVariable(t, isLabelImage), isArbitraryVariableShadow = (t) => getIsArbitraryVariable(t, isLabelShadow, !0), isArbitraryVariableWeight = (t) => getIsArbitraryVariable(t, isLabelWeight, !0), getIsArbitraryValue = (t, n, c) => {
  const d = arbitraryValueRegex.exec(t);
  return d ? d[1] ? n(d[1]) : c(d[2]) : !1;
}, getIsArbitraryVariable = (t, n, c = !1) => {
  const d = arbitraryVariableRegex.exec(t);
  return d ? d[1] ? n(d[1]) : c : !1;
}, isLabelPosition = (t) => t === "position" || t === "percentage", isLabelImage = (t) => t === "image" || t === "url", isLabelSize = (t) => t === "length" || t === "size" || t === "bg-size", isLabelLength = (t) => t === "length", isLabelNumber = (t) => t === "number", isLabelFamilyName = (t) => t === "family-name", isLabelWeight = (t) => t === "number" || t === "weight", isLabelShadow = (t) => t === "shadow", getDefaultConfig = () => {
  const t = fromTheme("color"), n = fromTheme("font"), c = fromTheme("text"), d = fromTheme("font-weight"), v = fromTheme("tracking"), y = fromTheme("leading"), x = fromTheme("breakpoint"), w = fromTheme("container"), k = fromTheme("spacing"), C = fromTheme("radius"), P = fromTheme("shadow"), F = fromTheme("inset-shadow"), S = fromTheme("text-shadow"), j = fromTheme("drop-shadow"), T = fromTheme("blur"), A = fromTheme("perspective"), R = fromTheme("aspect"), M = fromTheme("ease"), _ = fromTheme("animate"), E = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], I = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ], L = () => [...I(), isArbitraryVariable, isArbitraryValue], D = () => ["auto", "hidden", "clip", "visible", "scroll"], O = () => ["auto", "contain", "none"], z = () => [isArbitraryVariable, isArbitraryValue, k], W = () => [isFraction, "full", "auto", ...z()], X = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue], K = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue], Y = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue], U = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue], Z = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], q = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], B = () => ["auto", ...z()], G = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...z()], N = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...z()], V = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...z()], H = () => [t, isArbitraryVariable, isArbitraryValue], $ = () => [...I(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }], J = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], ee = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }], te = () => [isPercent, isArbitraryVariableLength, isArbitraryLength], re = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    C,
    isArbitraryVariable,
    isArbitraryValue
  ], ie = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength], ne = () => ["solid", "dashed", "dotted", "double"], he = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], ae = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition], ce = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    T,
    isArbitraryVariable,
    isArbitraryValue
  ], oe = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue], le = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue], se = () => [isNumber, isArbitraryVariable, isArbitraryValue], Q = () => [isFraction, "full", ...z()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, R]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, w]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": E()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": E()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: L()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: D()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": D()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": D()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: O()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": O()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": O()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: W()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": W()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": W()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": W(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: W()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": W(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: W()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": W()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": W()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: W()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: W()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: W()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: W()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", w, ...z()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": X()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: K()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": Y()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": Y()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": X()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: K()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": Y()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": Y()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": U()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": U()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: z()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": z()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": z()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...Z(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...q(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...q()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...Z()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...q(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...q(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": Z()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...q(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...q()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: z()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: z()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: z()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: z()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: z()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: z()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: z()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: z()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: z()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: z()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: z()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: B()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: B()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: B()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: B()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: B()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: B()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: B()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: B()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: B()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: B()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: B()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": z()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": z()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: G()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...N()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...N()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...N()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...V()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...V()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...V()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [w, "screen", ...G()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          w,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...G()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          w,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [x]
          },
          ...G()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...G()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...G()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...G()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", c, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [d, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, n]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [v, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          y,
          ...z()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: H()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: H()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...ne(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: H()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: z()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: $()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: J()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: ee()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: H()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: te()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: te()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: te()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: H()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: H()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: H()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: re()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": re()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": re()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": re()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": re()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": re()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": re()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": re()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": re()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": re()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": re()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": re()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": re()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": re()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": re()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: ie()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": ie()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": ie()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": ie()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": ie()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": ie()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": ie()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": ie()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": ie()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": ie()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": ie()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": ie()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": ie()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...ne(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...ne(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: H()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": H()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": H()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": H()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": H()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": H()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": H()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": H()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": H()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": H()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": H()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: H()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...ne(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: H()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          P,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: H()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", F, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": H()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: ie()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: H()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": H()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": ie()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": H()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", S, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": H()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...he(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": he()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": ae()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": ae()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": H()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": H()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": ae()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": ae()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": H()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": H()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": ae()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": ae()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": H()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": H()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": ae()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": ae()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": H()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": H()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": ae()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": ae()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": H()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": H()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": ae()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": ae()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": H()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": H()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": ae()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": ae()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": H()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": H()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": ae()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": ae()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": H()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": H()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": I()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": ae()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": ae()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": H()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": H()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: $()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: J()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: ee()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: ce()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          j,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": H()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": ce()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": z()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": z()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": z()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", M, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", _, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [A, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": L()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: oe()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": oe()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": oe()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": oe()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: le()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": le()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": le()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": le()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: se()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": se()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": se()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: L()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: Q()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": Q()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": Q()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": Q()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: H()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: H()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": z()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": z()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": z()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": z()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": z()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": z()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": z()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": z()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": z()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": z()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": z()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": z()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": z()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": z()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": z()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": z()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": z()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": z()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": z()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": z()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": z()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": z()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...H()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...H()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
}, twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
function cn(...t) {
  return twMerge(clsx(t));
}
const buttonVariants = cva(
  // Base styles Premium
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active-scale touch-manipulation select-none",
  {
    variants: {
      variant: {
        primary: "bg-sky-600 text-white hover:bg-sky-500 shadow-sm hover:shadow-md focus-visible:ring-sky-500 border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
        secondary: "bg-[var(--omni-surface-1)] text-[var(--omni-text-primary)] border border-[var(--omni-border-strong)] hover:bg-[var(--omni-surface-2)] shadow-sm focus-visible:ring-[var(--omni-border-strong)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
        ghost: "text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-hover)] hover:text-[var(--omni-text-primary)]",
        danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm hover:shadow-md focus-visible:ring-red-500 border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
        success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm hover:shadow-md focus-visible:ring-emerald-500 border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
        module: "text-white shadow-sm hover:shadow-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-transparent"
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-4 text-sm rounded-xl",
        lg: "h-12 px-6 text-base rounded-xl",
        icon: "h-10 w-10 rounded-xl"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
), Button = forwardRef(
  ({ className: t, variant: n, size: c, moduleColor: d, loading: v, children: y, style: x, disabled: w, ...k }, C) => {
    const P = n === "module" && d ? { backgroundColor: d, ...x } : x;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref: C,
        className: cn(buttonVariants({ variant: n, size: c }), t),
        style: P,
        disabled: w || v,
        ...k,
        children: [
          v && /* @__PURE__ */ jsxs(
            "svg",
            {
              className: "animate-spin -ml-1 h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
              ]
            }
          ),
          y
        ]
      }
    );
  }
);
Button.displayName = "Button";
const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        primary: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        module: "text-white"
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] rounded-md",
        md: "px-2.5 py-1 text-xs rounded-lg",
        lg: "px-3 py-1.5 text-sm rounded-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
function Badge({ className: t, variant: n, size: c, moduleColor: d, dot: v, children: y, style: x, ...w }) {
  const k = n === "module" && d ? { backgroundColor: `${d}20`, color: d, ...x } : x;
  return /* @__PURE__ */ jsxs("span", { className: cn(badgeVariants({ variant: n, size: c }), t), style: k, ...w, children: [
    v && /* @__PURE__ */ jsx(
      "span",
      {
        className: "w-1.5 h-1.5 rounded-full shrink-0",
        style: { backgroundColor: "currentColor" }
      }
    ),
    y
  ] });
}
const presetColors = {
  blue: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
  green: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  orange: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  default: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" }
};
function Tag({ children: t, color: n = "default", closable: c, onClose: d, icon: v, variant: y = "filled", className: x }) {
  const w = presetColors[n] || presetColors.default, k = n.startsWith("#");
  return /* @__PURE__ */ jsxs("span", { className: cn(
    "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
    k ? "border-current/20" : cn(y === "filled" ? w.bg : "bg-transparent", w.text, w.border),
    x
  ), style: k ? { color: n, backgroundColor: `${n}18`, borderColor: `${n}30` } : void 0, children: [
    v,
    t,
    c && /* @__PURE__ */ jsx("button", { onClick: d, className: "ml-0.5 p-0.5 rounded hover:bg-black/10 transition-colors", "aria-label": "Remover", children: /* @__PURE__ */ jsxs("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
    ] }) })
  ] });
}
const Separator = forwardRef(
  ({ className: t, orientation: n = "horizontal", decorative: c = !0, ...d }, v) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: v,
      role: c ? "none" : "separator",
      "aria-orientation": c ? void 0 : n,
      className: cn(
        "shrink-0 bg-[var(--omni-border-default)]",
        n === "horizontal" ? "h-px w-full" : "h-full w-px",
        t
      ),
      ...d
    }
  )
);
Separator.displayName = "Separator";
function Skeleton({
  variant: t = "text",
  width: n,
  height: c,
  lines: d = 1,
  className: v,
  style: y,
  ...x
}) {
  const w = "relative overflow-hidden bg-[var(--omni-surface-0)] dark:bg-white/5 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[omni-shimmer_2s_infinite_ease-in-out] before:bg-gradient-to-r before:from-transparent before:via-black/5 dark:before:via-white/10 before:to-transparent";
  if (t === "circular") {
    const k = n || c || 40;
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(w, "rounded-full", v),
        style: { width: k, height: k, ...y },
        ...x
      }
    );
  }
  return t === "rectangular" ? /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(w, "rounded-xl", v),
      style: { width: n || "100%", height: c || 120, ...y },
      ...x
    }
  ) : d > 1 ? /* @__PURE__ */ jsx("div", { className: cn("flex flex-col gap-2", v), ...x, children: Array.from({ length: d }).map((k, C) => /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(w, "h-4"),
      style: {
        width: C === d - 1 ? "75%" : n || "100%",
        ...y
      }
    },
    C
  )) }) : /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(w, "h-4", v),
      style: { width: n || "100%", height: c, ...y },
      ...x
    }
  );
}
const cardVariants = cva("transition-all duration-200", {
  variants: {
    variant: {
      default: "bg-[var(--omni-bg-secondary)] rounded-[var(--omni-radius-lg)] border border-[var(--omni-border-default)] shadow-[var(--omni-shadow-sm)] hover:shadow-[var(--omni-shadow-md)]",
      premium: "bg-[var(--omni-bg-secondary)] rounded-[var(--omni-radius-lg)] border border-[var(--omni-border-default)] shadow-[var(--omni-shadow-md)] hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-1 hover:border-[var(--omni-border-strong)]",
      glass: "bg-[var(--omni-glass-bg-strong)] backdrop-blur-[24px] backdrop-saturate-[200%] rounded-[var(--omni-radius-lg)] border border-[var(--omni-border-default)] shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)] hover:shadow-[var(--omni-shadow-elevated),var(--omni-shadow-inner)] hover:-translate-y-1",
      interactive: "bg-[var(--omni-surface-1)] rounded-[var(--omni-radius-lg)] border border-[var(--omni-border-default)] shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)] hover:shadow-[var(--omni-shadow-lg),var(--omni-shadow-inner)] hover:-translate-y-[4px] cursor-pointer",
      flat: "rounded-[var(--omni-radius-lg)] border-none"
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-6"
    }
  },
  defaultVariants: {
    variant: "default",
    padding: "md"
  }
}), Card = forwardRef(
  ({ className: t, variant: n, padding: c, ...d }, v) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: v,
      className: cn(cardVariants({ variant: n, padding: c }), t),
      ...d
    }
  )
);
Card.displayName = "Card";
const CardHeader = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx("div", { ref: c, className: cn("flex flex-col gap-1.5", t), ...n })
);
CardHeader.displayName = "CardHeader";
const CardTitle = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "h3",
    {
      ref: c,
      className: cn("text-lg font-bold tracking-tight text-[var(--omni-text-primary)]", t),
      ...n
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "p",
    {
      ref: c,
      className: cn("text-sm text-[var(--omni-text-muted)]", t),
      ...n
    }
  )
);
CardDescription.displayName = "CardDescription";
const CardContent = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx("div", { ref: c, className: cn("pt-2", t), ...n })
);
CardContent.displayName = "CardContent";
const intensityClasses = {
  light: "bg-[var(--omni-glass-bg)] backdrop-blur-md backdrop-saturate-150 border-[var(--omni-border-subtle)]",
  medium: "bg-[var(--omni-glass-bg-strong)] backdrop-blur-xl backdrop-saturate-[200%] border-[var(--omni-border-default)]",
  strong: "bg-[var(--omni-glass-bg-strong)] backdrop-blur-2xl backdrop-saturate-[200%] border-[var(--omni-border-strong)]"
}, GlassPanel = forwardRef(
  ({ intensity: t = "medium", className: n, children: c, ...d }, v) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: v,
      className: cn(
        "rounded-2xl border shadow-[var(--omni-shadow-sm),var(--omni-shadow-inner)] transition-all",
        intensityClasses[t],
        n
      ),
      ...d,
      children: c
    }
  )
);
GlassPanel.displayName = "GlassPanel";
const ScrollArea = forwardRef(
  ({ className: t, maxHeight: n, scrollbarVisibility: c = "auto", style: d, children: v, ...y }, x) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: x,
      className: cn(
        "relative overflow-auto",
        // Custom scrollbar styling
        "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-[var(--omni-scrollbar-thumb)] [&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb:hover]:bg-[var(--omni-scrollbar-thumb-hover)]",
        c === "hover" && "[&::-webkit-scrollbar-thumb]:opacity-0 [&:hover::-webkit-scrollbar-thumb]:opacity-100",
        c === "always" && "[&::-webkit-scrollbar-thumb]:opacity-100",
        t
      ),
      style: { maxHeight: n, ...d },
      tabIndex: 0,
      role: "region",
      "aria-label": "Scrollable content",
      ...y,
      children: v
    }
  )
);
ScrollArea.displayName = "ScrollArea";
const Ctx$2 = createContext({
  collapsed: !1,
  setCollapsed: () => {
  }
}), useSidebar = () => useContext(Ctx$2), Sidebar = forwardRef(
  ({ width: t = "260px", collapsedWidth: n = "64px", collapsed: c, onCollapsedChange: d, children: v, className: y, style: x, ...w }, k) => {
    const [C, P] = useState(!1), F = c ?? C, S = (j) => {
      P(j), d == null || d(j);
    };
    return /* @__PURE__ */ jsx(Ctx$2.Provider, { value: { collapsed: F, setCollapsed: S }, children: /* @__PURE__ */ jsx(
      "nav",
      {
        ref: k,
        role: "navigation",
        "aria-label": "Sidebar navigation",
        className: cn(
          "flex flex-col h-full",
          "bg-[var(--omni-bg-secondary)] border-r border-[var(--omni-border-default)]",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "overflow-hidden shrink-0",
          y
        ),
        style: {
          width: F ? n : t,
          ...x
        },
        ...w,
        children: v
      }
    ) });
  }
);
Sidebar.displayName = "Sidebar";
const SidebarHeader = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx("div", { ref: c, className: cn("px-4 py-4 shrink-0", t), ...n })
);
SidebarHeader.displayName = "SidebarHeader";
const SidebarContent = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx("div", { ref: c, className: cn("flex-1 overflow-auto px-3 py-2", t), ...n })
);
SidebarContent.displayName = "SidebarContent";
const SidebarFooter = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: c,
      className: cn("px-3 py-3 shrink-0 border-t border-[var(--omni-border-default)]", t),
      ...n
    }
  )
);
SidebarFooter.displayName = "SidebarFooter";
const SidebarGroup = forwardRef(
  ({ label: t, children: n, className: c, ...d }, v) => {
    const { collapsed: y } = useSidebar();
    return /* @__PURE__ */ jsxs("div", { ref: v, className: cn("mb-2", c), role: "group", "aria-label": t, ...d, children: [
      t && !y && /* @__PURE__ */ jsx("p", { className: "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]", children: t }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: n })
    ] });
  }
);
SidebarGroup.displayName = "SidebarGroup";
const SidebarItem = forwardRef(
  ({ icon: t, active: n, badge: c, children: d, className: v, ...y }, x) => {
    const { collapsed: w } = useSidebar();
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref: x,
        type: "button",
        className: cn(
          "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium",
          "transition-colors cursor-pointer outline-none",
          n ? "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" : "text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-hover)] hover:text-[var(--omni-text-primary)]",
          w && "justify-center px-0",
          v
        ),
        title: w && typeof d == "string" ? d : void 0,
        ...y,
        children: [
          t && /* @__PURE__ */ jsx("span", { className: "shrink-0 w-5 h-5 flex items-center justify-center", children: t }),
          !w && /* @__PURE__ */ jsx("span", { className: "flex-1 text-left truncate", children: d }),
          !w && c && /* @__PURE__ */ jsx("span", { className: "shrink-0", children: c })
        ]
      }
    );
  }
);
SidebarItem.displayName = "SidebarItem";
function SidebarToggle({ className: t, ...n }) {
  const { collapsed: c, setCollapsed: d } = useSidebar();
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: () => d(!c),
      className: cn(
        "flex items-center justify-center w-full rounded-xl py-2 text-sm font-medium",
        "text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-hover)] hover:text-[var(--omni-text-primary)]",
        "transition-colors cursor-pointer",
        t
      ),
      "aria-label": c ? "Expandir sidebar" : "Colapsar sidebar",
      ...n,
      children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className: cn("transition-transform", c && "rotate-180"),
            children: /* @__PURE__ */ jsx("path", { d: "M10 4L6 8L10 12" })
          }
        ),
        !c && /* @__PURE__ */ jsx("span", { className: "ml-2", children: "Colapsar" })
      ]
    }
  );
}
function SectionTitle({ title: t, subtitle: n, icon: c, action: d, className: v }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center justify-between gap-4 mb-4", v), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
      c && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--omni-bg-tertiary)] text-[var(--omni-text-secondary)]", children: c }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold tracking-tight text-[var(--omni-text-primary)] truncate", children: t }),
        n && /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--omni-text-muted)] truncate mt-0.5", children: n })
      ] })
    ] }),
    d && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: d })
  ] });
}
const inputVariants = cva(
  "w-full bg-[var(--omni-surface-0)] text-[var(--omni-text-primary)] border shadow-sm transition-all duration-200 placeholder:text-[var(--omni-text-muted)] focus:outline-none focus:bg-[var(--omni-surface-1)] focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border-[var(--omni-border-default)] focus:border-sky-500 focus:ring-sky-500/20 hover:border-[var(--omni-border-strong)]",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-600",
        success: "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-emerald-600"
      },
      inputSize: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-3.5 text-sm rounded-xl",
        lg: "h-12 px-4 text-base rounded-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md"
    }
  }
), Input = forwardRef(
  ({
    className: t,
    variant: n,
    inputSize: c,
    label: d,
    error: v,
    helperText: y,
    leftIcon: x,
    rightIcon: w,
    id: k,
    ...C
  }, P) => {
    const F = k || (d ? d.toLowerCase().replace(/\s+/g, "-") : void 0);
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
      d && /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: F,
          className: "text-sm font-semibold text-(--omni-text-primary)",
          children: d
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        x && /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-(--omni-text-muted)", children: x }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: P,
            id: F,
            className: cn(
              inputVariants({ variant: v ? "error" : n, inputSize: c }),
              x && "pl-10",
              w && "pr-10",
              t
            ),
            ...C
          }
        ),
        w && /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-(--omni-text-muted)", children: w })
      ] }),
      v && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-red-500", children: v }),
      !v && y && /* @__PURE__ */ jsx("p", { className: "text-xs text-(--omni-text-muted)", children: y })
    ] });
  }
);
Input.displayName = "Input";
const selectVariants = cva(
  "w-full appearance-none bg-(--omni-surface-0) text-(--omni-text-primary) border shadow-sm transition-all duration-200 focus:outline-none focus:bg-(--omni-surface-1) focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer pr-10",
  {
    variants: {
      variant: {
        default: "border-(--omni-border-default) focus:border-sky-500 focus:ring-sky-500/20 hover:border-(--omni-border-strong)",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-600"
      },
      selectSize: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-3.5 text-sm rounded-xl",
        lg: "h-12 px-4 text-base rounded-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      selectSize: "md"
    }
  }
), Select = forwardRef(
  ({
    className: t,
    variant: n,
    selectSize: c,
    label: d,
    error: v,
    helperText: y,
    options: x,
    placeholder: w,
    id: k,
    ...C
  }, P) => {
    const F = k || (d ? d.toLowerCase().replace(/\s+/g, "-") : void 0);
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
      d && /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: F,
          className: "text-sm font-semibold text-(--omni-text-primary)",
          children: d
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            ref: P,
            id: F,
            className: cn(
              selectVariants({ variant: v ? "error" : n, selectSize: c }),
              t
            ),
            ...C,
            children: [
              w && /* @__PURE__ */ jsx("option", { value: "", disabled: !0, children: w }),
              x.map((j) => /* @__PURE__ */ jsx("option", { value: j.value, disabled: j.disabled, children: j.label }, j.value))
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--omni-text-muted)",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" })
          }
        )
      ] }),
      v && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-red-500", children: v }),
      !v && y && /* @__PURE__ */ jsx("p", { className: "text-xs text-(--omni-text-muted)", children: y })
    ] });
  }
);
Select.displayName = "Select";
const textareaVariants = cva(
  "w-full bg-(--omni-surface-0) text-(--omni-text-primary) border shadow-sm transition-all duration-200 placeholder:text-(--omni-text-muted) focus:bg-(--omni-surface-1) focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed resize-y rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
  {
    variants: {
      variant: {
        default: "border-(--omni-border-default) focus:border-sky-500 focus:ring-sky-500/20 hover:border-(--omni-border-strong)",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-600",
        success: "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-emerald-600"
      }
    },
    defaultVariants: { variant: "default" }
  }
), Textarea = forwardRef(
  ({ className: t, variant: n, label: c, error: d, helperText: v, minRows: y = 3, id: x, style: w, ...k }, C) => {
    const P = x || (c ? c.toLowerCase().replace(/\s+/g, "-") : void 0);
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
      c && /* @__PURE__ */ jsx("label", { htmlFor: P, className: "text-sm font-semibold text-(--omni-text-primary)", children: c }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          ref: C,
          id: P,
          rows: y,
          className: cn(textareaVariants({ variant: d ? "error" : n }), t),
          style: w,
          ...k
        }
      ),
      d && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-red-500", children: d }),
      !d && v && /* @__PURE__ */ jsx("p", { className: "text-xs text-(--omni-text-muted)", children: v })
    ] });
  }
);
Textarea.displayName = "Textarea";
const Checkbox = forwardRef(({ label: t, description: n, className: c, disabled: d, id: v, ...y }, x) => {
  const w = v || (t ? `cb-${t.toLowerCase().replace(/\s+/g, "-")}` : void 0);
  return /* @__PURE__ */ jsxs("label", { className: cn("group flex items-start gap-2.5 cursor-pointer select-none", d && "opacity-50 cursor-not-allowed", c), htmlFor: w, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex-shrink-0 mt-0.5", children: [
      /* @__PURE__ */ jsx("input", { ref: x, id: w, type: "checkbox", disabled: d, className: "peer sr-only", ...y }),
      /* @__PURE__ */ jsx("div", { className: "w-[18px] h-[18px] rounded-md border-2 border-[var(--omni-border-strong)] bg-[var(--omni-bg-secondary)] transition-all peer-checked:bg-sky-600 peer-checked:border-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/20 peer-focus-visible:ring-offset-1" }),
      /* @__PURE__ */ jsx("svg", { className: "absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }) })
    ] }),
    (t || n) && /* @__PURE__ */ jsxs("div", { children: [
      t && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[var(--omni-text-primary)]", children: t }),
      n && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] mt-0.5", children: n })
    ] })
  ] });
});
Checkbox.displayName = "Checkbox";
const Ctx$1 = createContext({ name: "" });
function RadioGroup({ name: t, value: n, onChange: c, children: d, className: v, label: y, disabled: x }) {
  return /* @__PURE__ */ jsx(Ctx$1.Provider, { value: { name: t, value: n, onChange: c, disabled: x }, children: /* @__PURE__ */ jsxs("fieldset", { className: cn("flex flex-col gap-2", v), children: [
    y && /* @__PURE__ */ jsx("legend", { className: "text-sm font-semibold text-[var(--omni-text-primary)] mb-1", children: y }),
    d
  ] }) });
}
function RadioItem({ value: t, label: n, description: c, disabled: d, className: v }) {
  const y = useContext(Ctx$1), x = d || y.disabled, w = y.value === t;
  return /* @__PURE__ */ jsxs("label", { className: cn("group flex items-start gap-2.5 cursor-pointer select-none", x && "opacity-50 cursor-not-allowed", v), children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex-shrink-0 mt-0.5", children: [
      /* @__PURE__ */ jsx("input", { type: "radio", name: y.name, value: t, checked: w, onChange: () => {
        var k;
        return (k = y.onChange) == null ? void 0 : k.call(y, t);
      }, disabled: x, className: "peer sr-only" }),
      /* @__PURE__ */ jsx("div", { className: "w-[18px] h-[18px] rounded-full border-2 border-[var(--omni-border-strong)] bg-[var(--omni-bg-secondary)] transition-all peer-checked:border-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/20 peer-focus-visible:ring-offset-1" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-[5px] left-[5px] w-2 h-2 rounded-full bg-sky-600 opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100 transition-all" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[var(--omni-text-primary)]", children: n }),
      c && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] mt-0.5", children: c })
    ] })
  ] });
}
const sizes$1 = { sm: { track: "w-8 h-5", thumb: "w-3.5 h-3.5", translate: "translate-x-3.5" }, md: { track: "w-11 h-6", thumb: "w-4.5 h-4.5", translate: "translate-x-5" }, lg: { track: "w-14 h-7", thumb: "w-5.5 h-5.5", translate: "translate-x-7" } }, Toggle = forwardRef(({ label: t, size: n = "md", color: c, className: d, disabled: v, checked: y, defaultChecked: x, onChange: w, id: k, ...C }, P) => {
  const F = sizes$1[n], S = k || (t ? `toggle-${t.toLowerCase().replace(/\s+/g, "-")}` : void 0);
  return /* @__PURE__ */ jsxs("label", { className: cn("inline-flex items-center gap-2.5 cursor-pointer select-none", v && "opacity-50 cursor-not-allowed", d), htmlFor: S, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("input", { ref: P, id: S, type: "checkbox", role: "switch", "aria-checked": y, checked: y, defaultChecked: x, onChange: w, disabled: v, className: "sr-only peer", ...C }),
      /* @__PURE__ */ jsx("div", { className: cn("rounded-full transition-colors duration-200 bg-[var(--omni-bg-tertiary)] border border-[var(--omni-border-default)] peer-checked:border-transparent", F.track), style: y || x ? { backgroundColor: c || "#0ea5e9" } : void 0 }),
      /* @__PURE__ */ jsx("div", { className: cn("absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:" + F.translate, F.thumb) })
    ] }),
    t && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[var(--omni-text-primary)]", children: t })
  ] });
});
Toggle.displayName = "Toggle";
const Slider = forwardRef(({ label: t, showValue: n = !0, color: c = "#0ea5e9", className: d, id: v, value: y, ...x }, w) => {
  const k = v || (t ? `slider-${t.toLowerCase().replace(/\s+/g, "-")}` : void 0);
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1.5", d), children: [
    (t || n) && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      t && /* @__PURE__ */ jsx("label", { htmlFor: k, className: "text-sm font-semibold text-[var(--omni-text-primary)]", children: t }),
      n && /* @__PURE__ */ jsx("span", { className: "text-sm font-mono font-bold", style: { color: c }, children: y ?? x.defaultValue ?? 50 })
    ] }),
    /* @__PURE__ */ jsx("input", { ref: w, id: k, type: "range", value: y, className: "w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--omni-bg-tertiary)] accent-sky-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-600 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110", style: { accentColor: c }, ...x })
  ] });
});
Slider.displayName = "Slider";
const Combobox = forwardRef(
  ({ options: t, value: n, onChange: c, placeholder: d = "Buscar...", label: v, freeSolo: y, emptyMessage: x = "Nenhum resultado", className: w, ...k }, C) => {
    const [P, F] = useState(!1), [S, j] = useState(""), [T, A] = useState(0), R = useRef(null), M = useRef(null), _ = t.find((D) => D.value === n), E = t.filter(
      (D) => {
        var O;
        return D.label.toLowerCase().includes(S.toLowerCase()) || ((O = D.description) == null ? void 0 : O.toLowerCase().includes(S.toLowerCase()));
      }
    );
    useEffect(() => {
      if (!P) return;
      const D = (O) => {
        R.current && !R.current.contains(O.target) && F(!1);
      };
      return document.addEventListener("mousedown", D), () => document.removeEventListener("mousedown", D);
    }, [P]);
    const I = useCallback(
      (D) => {
        c == null || c(D.value), j(""), F(!1);
      },
      [c]
    ), L = (D) => {
      if (!P && (D.key === "ArrowDown" || D.key === "Enter")) {
        F(!0);
        return;
      }
      if (P)
        switch (D.key) {
          case "ArrowDown":
            D.preventDefault(), A((O) => Math.min(O + 1, E.length - 1));
            break;
          case "ArrowUp":
            D.preventDefault(), A((O) => Math.max(O - 1, 0));
            break;
          case "Enter":
            D.preventDefault(), E[T] && !E[T].disabled && I(E[T]);
            break;
          case "Escape":
            F(!1);
            break;
        }
    };
    return useEffect(() => {
      if (!P || !M.current) return;
      const D = M.current.children[T];
      D == null || D.scrollIntoView({ block: "nearest" });
    }, [T, P]), /* @__PURE__ */ jsxs("div", { ref: R, className: "relative flex flex-col gap-1.5", children: [
      v && /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-[var(--omni-text-primary)]", children: v }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: C,
            type: "text",
            role: "combobox",
            "aria-expanded": P,
            "aria-autocomplete": "list",
            "aria-activedescendant": P && E[T] ? `combo-opt-${E[T].value}` : void 0,
            className: cn(
              "w-full h-10 px-3.5 text-sm rounded-xl",
              "bg-[var(--omni-bg-secondary)] text-[var(--omni-text-primary)]",
              "border border-[var(--omni-border-default)]",
              "placeholder:text-[var(--omni-text-muted)]",
              "focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500",
              "transition-all",
              w
            ),
            placeholder: d,
            value: P ? S : (_ == null ? void 0 : _.label) || "",
            onChange: (D) => {
              j(D.target.value), A(0), P || F(!0);
            },
            onFocus: () => F(!0),
            onKeyDown: L,
            ...k
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--omni-text-muted)]", children: /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M4 6L8 10L12 6" }) }) })
      ] }),
      P && /* @__PURE__ */ jsx(
        "ul",
        {
          ref: M,
          role: "listbox",
          className: cn(
            "absolute top-full left-0 right-0 z-50 mt-1",
            "max-h-60 overflow-auto rounded-xl p-1.5",
            "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
            "shadow-[var(--omni-shadow-lg)]"
          ),
          children: E.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-3 py-2 text-sm text-[var(--omni-text-muted)] text-center", children: x }) : E.map((D, O) => /* @__PURE__ */ jsxs(
            "li",
            {
              id: `combo-opt-${D.value}`,
              role: "option",
              "aria-selected": D.value === n,
              "aria-disabled": D.disabled,
              className: cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer",
                "transition-colors",
                O === T && "bg-[var(--omni-bg-hover)]",
                D.value === n && "font-semibold text-sky-600",
                D.disabled && "opacity-50 cursor-not-allowed"
              ),
              onClick: () => !D.disabled && I(D),
              onMouseEnter: () => A(O),
              children: [
                D.icon && /* @__PURE__ */ jsx("span", { className: "shrink-0", children: D.icon }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate", children: D.label }),
                  D.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] truncate", children: D.description })
                ] }),
                D.value === n && /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "shrink-0 text-sky-600", children: /* @__PURE__ */ jsx("path", { d: "M3 8L6.5 11.5L13 5" }) })
              ]
            },
            D.value
          ))
        }
      )
    ] });
  }
);
Combobox.displayName = "Combobox";
const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function getDaysInMonth(t, n) {
  return new Date(t, n + 1, 0).getDate();
}
function getFirstDayOfWeek(t, n) {
  return new Date(t, n, 1).getDay();
}
function isSameDay(t, n) {
  return t.getFullYear() === n.getFullYear() && t.getMonth() === n.getMonth() && t.getDate() === n.getDate();
}
const DatePicker = forwardRef(
  ({ value: t, onChange: n, label: c, min: d, max: v, placeholder: y = "Selecione uma data", disabled: x, className: w, ...k }, C) => {
    const [P, F] = useState(!1), [S, j] = useState(() => (t ?? /* @__PURE__ */ new Date()).getFullYear()), [T, A] = useState(() => (t ?? /* @__PURE__ */ new Date()).getMonth()), R = useMemo(() => /* @__PURE__ */ new Date(), []), M = getDaysInMonth(S, T), _ = getFirstDayOfWeek(S, T), E = [
      ...Array(_).fill(null),
      ...Array.from({ length: M }, (z, W) => W + 1)
    ], I = (z) => {
      let W = T + z, X = S;
      W < 0 && (W = 11, X--), W > 11 && (W = 0, X++), A(W), j(X);
    }, L = (z) => {
      const W = new Date(S, T, z);
      return !!(d && W < new Date(d.getFullYear(), d.getMonth(), d.getDate()) || v && W > new Date(v.getFullYear(), v.getMonth(), v.getDate()));
    }, D = (z) => {
      if (L(z)) return;
      const W = new Date(S, T, z);
      n == null || n(W), F(!1);
    }, O = t ? `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")}/${t.getFullYear()}` : "";
    return /* @__PURE__ */ jsxs("div", { ref: C, className: cn("relative flex flex-col gap-1.5", w), ...k, children: [
      c && /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-[var(--omni-text-primary)]", children: c }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          disabled: x,
          onClick: () => F(!P),
          "aria-haspopup": "dialog",
          "aria-expanded": P,
          className: cn(
            "flex items-center gap-2 w-full h-10 px-3.5 text-sm rounded-xl text-left",
            "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
            "transition-all cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500",
            x && "opacity-50 cursor-not-allowed",
            !t && "text-[var(--omni-text-muted)]"
          ),
          children: [
            /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className: "shrink-0 text-[var(--omni-text-muted)]", children: [
              /* @__PURE__ */ jsx("rect", { x: "2", y: "3", width: "12", height: "11", rx: "2" }),
              /* @__PURE__ */ jsx("path", { d: "M5 1v3M11 1v3M2 7h12" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: t ? O : y })
          ]
        }
      ),
      P && !x && /* @__PURE__ */ jsxs(
        "div",
        {
          role: "dialog",
          "aria-label": "Calendário",
          className: cn(
            "absolute top-full left-0 z-50 mt-1 p-3",
            "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
            "rounded-xl shadow-[var(--omni-shadow-lg)]",
            "min-w-[280px]"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => I(-1), className: "p-1 rounded-lg hover:bg-[var(--omni-bg-hover)] transition-colors", "aria-label": "Mês anterior", children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("path", { d: "M10 4L6 8L10 12" }) }) }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-[var(--omni-text-primary)]", children: [
                MONTHS_PT[T],
                " ",
                S
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => I(1), className: "p-1 rounded-lg hover:bg-[var(--omni-bg-hover)] transition-colors", "aria-label": "Próximo mês", children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("path", { d: "M6 4L10 8L6 12" }) }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-0.5 mb-1", children: DAYS_PT.map((z) => /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] font-bold uppercase tracking-wider text-[var(--omni-text-muted)] py-1", children: z }, z)) }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-0.5", role: "grid", "aria-label": "Dias do mês", children: E.map((z, W) => {
              if (z === null) return /* @__PURE__ */ jsx("div", {}, `e-${W}`);
              const X = new Date(S, T, z), K = t && isSameDay(X, t), Y = isSameDay(X, R), U = L(z);
              return /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  role: "gridcell",
                  "aria-selected": K || void 0,
                  disabled: U,
                  onClick: () => D(z),
                  className: cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium",
                    "transition-colors cursor-pointer",
                    K ? "bg-sky-600 text-white font-bold" : Y ? "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 font-bold" : "text-[var(--omni-text-primary)] hover:bg-[var(--omni-bg-hover)]",
                    U && "opacity-30 cursor-not-allowed"
                  ),
                  children: z
                },
                z
              );
            }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 pt-2 border-t border-[var(--omni-border-default)]", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  j(R.getFullYear()), A(R.getMonth()), n == null || n(R), F(!1);
                },
                className: "w-full text-center text-xs font-semibold text-sky-600 hover:text-sky-700 py-1 rounded-lg hover:bg-[var(--omni-bg-hover)] transition-colors",
                children: "Hoje"
              }
            ) })
          ]
        }
      )
    ] });
  }
);
DatePicker.displayName = "DatePicker";
function Upload({ accept: t, multiple: n, maxSize: c, onFiles: d, className: v, label: y = "Click or drag file to this area to upload", description: x }) {
  const [w, k] = useState(!1), C = useRef(null), P = (A) => {
    if (!A) return;
    let R = Array.from(A);
    c && (R = R.filter((M) => M.size <= c)), R.length && (d == null || d(R));
  }, F = (A) => {
    A.preventDefault(), A.stopPropagation();
  }, S = (A) => {
    F(A), k(!0);
  }, j = (A) => {
    F(A), k(!1);
  }, T = (A) => {
    F(A), k(!1), P(A.dataTransfer.files);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center",
        w ? "border-sky-500 bg-sky-50 dark:bg-sky-950/20" : "border-[var(--omni-border-default)] hover:border-sky-400 hover:bg-[var(--omni-bg-tertiary)]",
        v
      ),
      onClick: () => {
        var A;
        return (A = C.current) == null ? void 0 : A.click();
      },
      onDragOver: F,
      onDragEnter: S,
      onDragLeave: j,
      onDrop: T,
      children: [
        /* @__PURE__ */ jsx("input", { ref: C, type: "file", accept: t, multiple: n, onChange: (A) => P(A.target.files), className: "hidden" }),
        /* @__PURE__ */ jsxs("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[var(--omni-text-muted)]", children: [
          /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
          /* @__PURE__ */ jsx("polyline", { points: "17 8 12 3 7 8" }),
          /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "3", y2: "15" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[var(--omni-text-secondary)]", children: y }),
        x && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)]", children: x })
      ]
    }
  );
}
const FilterChip = forwardRef(
  ({ label: t, selected: n = !1, onChange: c, color: d, icon: v, removable: y, onRemove: x, disabled: w, className: k, ...C }, P) => /* @__PURE__ */ jsxs(
    "button",
    {
      ref: P,
      type: "button",
      role: "option",
      "aria-selected": n,
      disabled: w,
      onClick: () => {
        w || c == null || c(!n);
      },
      className: cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold",
        "border transition-all duration-150 cursor-pointer select-none",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        w && "opacity-40 cursor-not-allowed",
        k
      ),
      style: n ? {
        backgroundColor: d || "var(--omni-primary)",
        borderColor: d || "var(--omni-primary)",
        color: "#fff",
        boxShadow: d ? `0 2px 8px ${d}40` : void 0
      } : {
        backgroundColor: "var(--omni-bg-secondary)",
        borderColor: "var(--omni-border-default)",
        color: "var(--omni-text-secondary)"
      },
      ...C,
      children: [
        v && /* @__PURE__ */ jsx("span", { className: "shrink-0 flex items-center", children: v }),
        t,
        y && /* @__PURE__ */ jsx(
          "span",
          {
            onClick: (S) => {
              S.stopPropagation(), x == null || x();
            },
            className: cn(
              "ml-0.5 p-0.5 rounded-full inline-flex items-center justify-center",
              "hover:bg-white/20 transition-colors cursor-pointer"
            ),
            "aria-label": "Remover",
            children: /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: /* @__PURE__ */ jsx("path", { d: "M18 6L6 18M6 6l12 12" }) })
          }
        )
      ]
    }
  )
);
FilterChip.displayName = "FilterChip";
const styles = {
  info: { bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800", icon: "text-sky-600", title: "text-sky-800 dark:text-sky-200" },
  success: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", icon: "text-emerald-600", title: "text-emerald-800 dark:text-emerald-200" },
  warning: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-600", title: "text-amber-800 dark:text-amber-200" },
  error: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: "text-red-600", title: "text-red-800 dark:text-red-200" }
}, defaultIcons$1 = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };
function Alert({ variant: t = "info", title: n, children: c, closable: d, onClose: v, icon: y, className: x }) {
  const w = styles[t];
  return /* @__PURE__ */ jsxs("div", { className: cn("flex gap-3 p-4 rounded-xl border", w.bg, w.border, x), role: "alert", children: [
    /* @__PURE__ */ jsx("span", { className: cn("flex-shrink-0 text-lg", w.icon), children: y ?? defaultIcons$1[t] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      n && /* @__PURE__ */ jsx("p", { className: cn("text-sm font-bold", w.title), children: n }),
      /* @__PURE__ */ jsx("div", { className: cn("text-sm text-[var(--omni-text-secondary)]", n && "mt-1"), children: c })
    ] }),
    d && /* @__PURE__ */ jsx("button", { onClick: v, className: "flex-shrink-0 p-1 rounded-lg text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] hover:bg-black/5 transition-colors", "aria-label": "Fechar", children: /* @__PURE__ */ jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
    ] }) })
  ] });
}
const linearSizes = { sm: "h-1.5", md: "h-2.5", lg: "h-4" }, circularSizes = { sm: 48, md: 72, lg: 96 };
function Progress({ value: t, max: n = 100, variant: c = "linear", size: d = "md", color: v = "#0ea5e9", showValue: y = !0, label: x, className: w }) {
  const k = Math.min(100, Math.max(0, t / n * 100));
  if (c === "circular") {
    const C = circularSizes[d], P = d === "sm" ? 4 : d === "md" ? 6 : 8, F = (C - P) / 2, S = 2 * Math.PI * F, j = S - k / 100 * S;
    return /* @__PURE__ */ jsxs("div", { className: cn("inline-flex flex-col items-center gap-1", w), children: [
      x && /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-[var(--omni-text-muted)]", children: x }),
      /* @__PURE__ */ jsxs("div", { className: "relative", role: "progressbar", "aria-valuenow": Math.round(k), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": x || `Progresso: ${Math.round(k)}%`, style: { width: C, height: C }, children: [
        /* @__PURE__ */ jsxs("svg", { width: C, height: C, className: "-rotate-90", children: [
          /* @__PURE__ */ jsx("circle", { cx: C / 2, cy: C / 2, r: F, fill: "none", stroke: "var(--omni-bg-tertiary)", strokeWidth: P }),
          /* @__PURE__ */ jsx("circle", { cx: C / 2, cy: C / 2, r: F, fill: "none", stroke: v, strokeWidth: P, strokeDasharray: S, strokeDashoffset: j, strokeLinecap: "round", className: "transition-all duration-500" })
        ] }),
        y && /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 flex items-center justify-center text-sm font-bold", style: { color: v }, children: [
          Math.round(k),
          "%"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("w-full", w), children: [
    (x || y) && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-1.5", children: [
      x && /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-[var(--omni-text-muted)]", children: x }),
      y && /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold", style: { color: v }, children: [
        Math.round(k),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: cn("w-full rounded-full bg-[var(--omni-bg-tertiary)] overflow-hidden", linearSizes[d]), role: "progressbar", "aria-valuenow": Math.round(k), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": x || `Progresso: ${Math.round(k)}%`, children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-all duration-500", style: { width: `${k}%`, backgroundColor: v } }) })
  ] });
}
let toastListeners = [];
function toast(t) {
  const n = { ...t, id: Math.random().toString(36).slice(2) };
  toastListeners.forEach((c) => c(n));
}
const icons = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" }, colors$1 = { info: "border-l-sky-500", success: "border-l-emerald-500", warning: "border-l-amber-500", error: "border-l-red-500" };
function ToastContainer({ position: t = "top-right" }) {
  const [n, c] = useState([]), d = useCallback((y) => c((x) => x.filter((w) => w.id !== y)), []);
  useEffect(() => {
    const y = (x) => {
      c((w) => [...w, x]), setTimeout(() => d(x.id), x.duration || 4e3);
    };
    return toastListeners.push(y), () => {
      toastListeners = toastListeners.filter((x) => x !== y);
    };
  }, [d]);
  const v = { "top-right": "top-4 right-4", "top-left": "top-4 left-4", "bottom-right": "bottom-4 right-4", "bottom-left": "bottom-4 left-4" }[t];
  return /* @__PURE__ */ jsx("div", { className: cn("fixed z-[9999] flex flex-col gap-2 pointer-events-none", v), "aria-live": "polite", children: n.map((y) => /* @__PURE__ */ jsx("div", { className: cn("pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)] border-l-4 shadow-[var(--omni-shadow-lg)] animate-[slide-in_300ms_ease-out]", colors$1[y.variant]), children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5", children: [
    /* @__PURE__ */ jsx("span", { className: "text-base flex-shrink-0", children: icons[y.variant] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[var(--omni-text-primary)]", children: y.title }),
      y.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] mt-0.5", children: y.description })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: () => d(y.id), className: "flex-shrink-0 p-0.5 rounded text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] transition-colors", children: /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
    ] }) })
  ] }) }, y.id)) });
}
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  full: "max-w-[90vw] max-h-[90vh]"
}, Modal = forwardRef(
  ({ open: t, onClose: n, title: c, size: d = "md", showClose: v = !0, children: y, className: x, ...w }, k) => {
    const C = useRef(null), P = (F) => {
      C.current = F, typeof k == "function" ? k(F) : k && (k.current = F);
    };
    return useEffect(() => {
      const F = C.current;
      F && (t && !F.open ? F.showModal() : !t && F.open && F.close());
    }, [t]), useEffect(() => {
      const F = C.current;
      if (!F) return;
      const S = () => n();
      return F.addEventListener("close", S), () => F.removeEventListener("close", S);
    }, [n]), /* @__PURE__ */ jsxs(
      "dialog",
      {
        ref: P,
        className: cn(
          "p-0 rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] text-[var(--omni-text-primary)] shadow-[var(--omni-shadow-2xl)]",
          "backdrop:bg-black/50 backdrop:backdrop-blur-md",
          "w-full",
          sizeClasses[d],
          "animate-[modal-in_250ms_cubic-bezier(0.16,1,0.3,1)]",
          x
        ),
        ...w,
        children: [
          (c || v) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 pt-5 pb-1", children: [
            c && /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold tracking-tight", children: c }),
            v && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: n,
                className: "ml-auto p-1.5 rounded-lg text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] hover:bg-[var(--omni-bg-tertiary)] transition-colors",
                "aria-label": "Fechar",
                children: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
                  /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-6 pb-6 pt-2", children: y })
        ]
      }
    );
  }
);
Modal.displayName = "Modal";
const variantColors = { danger: "#ef4444", warning: "#f59e0b", info: "#0ea5e9" }, variantBg = { danger: "bg-red-100 dark:bg-red-900/30", warning: "bg-amber-100 dark:bg-amber-900/30", info: "bg-sky-100 dark:bg-sky-900/30" }, defaultIcons = { danger: "⚠️", warning: "❓", info: "ℹ️" };
function ConfirmDialog({ open: t, onConfirm: n, onCancel: c, title: d, description: v, icon: y, variant: x = "danger", confirmText: w = "Confirmar", cancelText: k = "Cancelar" }) {
  return /* @__PURE__ */ jsx(Modal, { open: t, onClose: c, size: "sm", showClose: !1, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center", children: [
    /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 ${variantBg[x]}`, children: y ?? defaultIcons[x] }),
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-[var(--omni-text-primary)]", children: d }),
    v && /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--omni-text-muted)] mt-2 max-w-xs", children: v }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mt-6 w-full", children: [
      /* @__PURE__ */ jsx("button", { onClick: c, className: "flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-[var(--omni-border-default)] text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-tertiary)] transition-colors", children: k }),
      /* @__PURE__ */ jsx("button", { onClick: n, className: "flex-1 px-4 py-2.5 text-sm font-bold rounded-xl text-white transition-colors hover:opacity-90", style: { backgroundColor: variantColors[x] }, children: w })
    ] })
  ] }) });
}
const autoColor = (t) => t >= 60 ? feedbackColors.success.base : t >= 40 ? feedbackColors.warning.base : feedbackColors.error.base, namedColors = {
  green: feedbackColors.success.base,
  yellow: feedbackColors.warning.base,
  red: feedbackColors.error.base
}, ScoreBar = forwardRef(
  ({ value: t, marker: n, color: c = "auto", width: d = 120, height: v = 8, showLabel: y, className: x, ...w }, k) => {
    const C = c === "auto" ? autoColor(t) : namedColors[c] || c, P = n ?? t;
    return /* @__PURE__ */ jsxs("div", { ref: k, className: cn("inline-flex items-center gap-2", x), ...w, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative rounded-full overflow-hidden",
          style: { width: d, height: v, backgroundColor: `${C}20` },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute inset-y-0 left-0 rounded-full transition-all duration-300",
                style: { width: `${Math.min(100, Math.max(0, t))}%`, backgroundColor: C }
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute top-[-2px] bottom-[-2px] w-[3px] rounded-sm transition-all duration-300",
                style: {
                  left: `${Math.min(100, Math.max(0, P))}%`,
                  backgroundColor: "var(--omni-text-primary, #1e293b)",
                  transform: "translateX(-50%)"
                }
              }
            )
          ]
        }
      ),
      y && /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold tabular-nums", style: { color: C }, children: [
        Math.round(t),
        "%"
      ] })
    ] });
  }
);
ScoreBar.displayName = "ScoreBar";
const statusConfig = {
  intervir: { label: "Intervir", color: feedbackColors.error.base, bg: feedbackColors.error.soft },
  acompanhar: { label: "Acompanhar", color: feedbackColors.warning.base, bg: feedbackColors.warning.soft },
  desafiar: { label: "Desafiar", color: feedbackColors.success.base, bg: feedbackColors.success.soft }
}, SubjectProgressRow = forwardRef(
  ({ subject: t, meta: n, status: c, percentage: d, marker: v, expandable: y = !1, expanded: x = !1, onToggle: w, children: k, className: C, ...P }, F) => {
    const S = statusConfig[c];
    return /* @__PURE__ */ jsxs("div", { ref: F, className: cn("border border-[var(--omni-border-default)] rounded-xl overflow-hidden transition-all", C), ...P, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "flex items-center gap-4 px-5 py-4",
            y && "cursor-pointer hover:bg-[var(--omni-bg-hover)]"
          ),
          onClick: y ? w : void 0,
          style: { borderLeft: `3px solid ${S.color}` },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[var(--omni-text-primary)]", children: t }),
              n && /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--omni-text-muted)] ml-2", children: n })
            ] }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "px-2.5 py-1 text-[11px] font-bold rounded-md shrink-0",
                style: { backgroundColor: S.bg, color: S.color },
                children: S.label
              }
            ),
            /* @__PURE__ */ jsx(ScoreBar, { value: d, marker: v, color: S.color, width: 120 }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold tabular-nums text-[var(--omni-text-primary)] w-10 text-right shrink-0", children: [
              d,
              "%"
            ] }),
            y && /* @__PURE__ */ jsx(
              "svg",
              {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                className: cn("shrink-0 transition-transform text-[var(--omni-text-muted)]", x && "rotate-180"),
                children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" })
              }
            )
          ]
        }
      ),
      y && x && k && /* @__PURE__ */ jsx("div", { className: "px-5 pb-4 pt-0 border-t border-[var(--omni-border-default)]", children: k })
    ] });
  }
);
SubjectProgressRow.displayName = "SubjectProgressRow";
const RecommendationPanel = forwardRef(
  ({ intervir: t, acompanhar: n, desafiar: c, actionLabel: d, onAction: v, className: y, ...x }, w) => {
    const k = [
      {
        key: "intervir",
        data: t,
        icon: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#ef4444", strokeWidth: "2", strokeLinecap: "round", children: [
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsx("path", { d: "M12 8v4M12 16h.01" })
        ] })
      },
      {
        key: "acompanhar",
        data: n,
        icon: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#f59e0b", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" }) })
      },
      {
        key: "desafiar",
        data: c,
        icon: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#10b981", strokeWidth: "2", strokeLinecap: "round", children: [
          /* @__PURE__ */ jsx("path", { d: "M12 15a3 3 0 100-6 3 3 0 000 6z" }),
          /* @__PURE__ */ jsx("path", { d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" })
        ] })
      }
    ];
    return /* @__PURE__ */ jsxs("div", { ref: w, className: cn("rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] overflow-hidden transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5", y), ...x, children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 divide-x divide-[var(--omni-border-default)]", children: k.map(({ key: C, data: P, icon: F }) => {
        const S = statusConfig[C];
        return /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            F,
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", style: { color: S.color }, children: S.label })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-[var(--omni-text-primary)]", children: [
            P.count,
            " disciplina",
            P.count !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] mt-0.5 truncate", children: P.items.join(", ") })
        ] }, C);
      }) }),
      d && /* @__PURE__ */ jsx("div", { className: "border-t border-[var(--omni-border-default)] px-5 py-3 text-center", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: v,
          className: "text-sm font-semibold text-[var(--omni-primary)] hover:underline inline-flex items-center gap-1",
          children: [
            d,
            /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("path", { d: "M5 12h14M12 5l7 7-7 7" }) })
          ]
        }
      ) })
    ] });
  }
);
RecommendationPanel.displayName = "RecommendationPanel";
const RankingCard = forwardRef(
  ({ title: t, subtitle: n, position: c, areas: d, footer: v, color: y = "#6366f1", className: x, ...w }, k) => /* @__PURE__ */ jsxs(
    "div",
    {
      ref: k,
      className: cn(
        "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] p-5 text-center transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5",
        x
      ),
      ...w,
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[var(--omni-text-primary)]", children: t }),
        n && /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--omni-text-muted)] mt-0.5 flex items-center justify-center gap-1", children: [
          /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ jsx("path", { d: "M3 21h18M5 21V7l7-4 7 4v14" }) }),
          n
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-4xl font-extrabold mt-3 tracking-tight", style: { color: y }, children: [
          c,
          /* @__PURE__ */ jsx("span", { className: "text-lg align-super", children: "º" })
        ] }),
        d && d.length > 0 && /* @__PURE__ */ jsx("div", { className: cn(
          "grid gap-3 mt-4",
          (d.length <= 2, "grid-cols-2")
        ), children: d.map((C) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-extrabold text-[var(--omni-text-primary)]", children: [
            C.position,
            /* @__PURE__ */ jsx("span", { className: "text-xs align-super", children: "º" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-[var(--omni-text-muted)]", children: C.label })
        ] }, C.label)) }),
        v && v.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 pt-3 border-t border-[var(--omni-border-default)] space-y-1", children: v.map((C, P) => /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--omni-text-muted)] flex items-center justify-center gap-1.5", children: [
          C.icon,
          C.text
        ] }, P)) })
      ]
    }
  )
);
RankingCard.displayName = "RankingCard";
const panoramaColors = {
  green: feedbackColors.success.base,
  red: feedbackColors.error.base,
  yellow: feedbackColors.warning.base,
  blue: feedbackColors.info.base
}, PanoramaCard = forwardRef(
  ({ title: t, lines: n, showInfo: c = !0, className: d, ...v }, y) => /* @__PURE__ */ jsxs(
    "div",
    {
      ref: y,
      className: cn(
        "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] p-5 transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5",
        d
      ),
      ...v,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[var(--omni-text-primary)]", children: t }),
          c && /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "var(--omni-text-muted)", strokeWidth: "2", strokeLinecap: "round", className: "shrink-0", children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ jsx("path", { d: "M12 16v-4M12 8h.01" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: n.map((x, w) => {
          const k = x.total > 0 ? Math.round(x.current / x.total * 100) : 0, C = panoramaColors[x.color || "green"] || x.color || "#10b981";
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[var(--omni-text-primary)]", children: x.label }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold tabular-nums text-[var(--omni-text-primary)]", children: [
                x.current,
                /* @__PURE__ */ jsxs("span", { className: "text-[var(--omni-text-muted)] font-normal", children: [
                  "/",
                  x.total
                ] }),
                " ",
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-[var(--omni-text-muted)]", children: [
                  "(",
                  k,
                  "%)"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full h-2 rounded-full overflow-hidden", style: { backgroundColor: `${C}20` }, children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-full transition-all duration-300",
                style: { width: `${k}%`, backgroundColor: C }
              }
            ) }),
            x.detail && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[var(--omni-text-muted)] mt-1", children: x.detail })
          ] }, w);
        }) })
      ]
    }
  )
);
PanoramaCard.displayName = "PanoramaCard";
const dotColors = {
  success: { dot: feedbackColors.success.base, text: feedbackColors.success.text },
  error: { dot: feedbackColors.error.base, text: feedbackColors.error.text },
  warning: { dot: feedbackColors.warning.base, text: feedbackColors.warning.text },
  info: { dot: feedbackColors.info.base, text: feedbackColors.info.text },
  neutral: { dot: feedbackColors.neutral.base, text: feedbackColors.neutral.text }
};
function StatusDot({ variant: t = "neutral", label: n, size: c = 8, className: d, ...v }) {
  const y = dotColors[t];
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-2 text-sm font-semibold", d), style: { color: y.text }, ...v, children: [
    /* @__PURE__ */ jsx("span", { className: "shrink-0 rounded-full", style: { width: c, height: c, backgroundColor: y.dot } }),
    n
  ] });
}
function LegendBar({ items: t, shape: n = "square", className: c, ...d }) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-wrap items-center gap-4", c), ...d, children: t.map((v) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium text-[var(--omni-text-secondary)]", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "shrink-0",
        style: {
          width: n === "line" ? 16 : 10,
          height: n === "line" ? 3 : 10,
          backgroundColor: v.color,
          borderRadius: n === "dot" ? "50%" : 2
        }
      }
    ),
    v.label
  ] }, v.label)) });
}
function Tabs({ items: t, activeKey: n, defaultActiveKey: c, onChange: d, variant: v = "line", children: y, className: x }) {
  var T;
  const [w, k] = useState(c || ((T = t[0]) == null ? void 0 : T.key) || ""), C = n ?? w, P = (A) => {
    k(A), d == null || d(A);
  }, F = "inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer select-none whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed", j = {
    line: { wrapper: "flex border-b border-[var(--omni-border-default)] gap-1", tab: "px-4 py-2.5 text-sm -mb-px", active: "text-sky-600 border-b-2 border-sky-600", inactive: "text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)]" },
    card: { wrapper: "flex bg-[var(--omni-bg-tertiary)] p-1 rounded-xl gap-1", tab: "px-4 py-2 text-sm rounded-lg", active: "bg-[var(--omni-bg-secondary)] text-[var(--omni-text-primary)] shadow-[var(--omni-shadow-sm)]", inactive: "text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)]" },
    pill: { wrapper: "flex gap-2", tab: "px-4 py-2 text-sm rounded-full", active: "bg-sky-600 text-white shadow-sm", inactive: "bg-[var(--omni-bg-tertiary)] text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-hover)]" }
  }[v];
  return /* @__PURE__ */ jsxs("div", { className: x, children: [
    /* @__PURE__ */ jsx("div", { className: j.wrapper, role: "tablist", children: t.map((A) => /* @__PURE__ */ jsxs(
      "button",
      {
        role: "tab",
        "aria-selected": C === A.key,
        disabled: A.disabled,
        className: cn(F, j.tab, C === A.key ? j.active : j.inactive),
        onClick: () => !A.disabled && P(A.key),
        children: [
          A.icon,
          A.label
        ]
      },
      A.key
    )) }),
    y && /* @__PURE__ */ jsx("div", { className: "pt-4", children: y(C) })
  ] });
}
function Steps({ items: t, current: n, direction: c = "horizontal", className: d }) {
  return /* @__PURE__ */ jsx("div", { className: cn(c === "horizontal" ? "flex items-start" : "flex flex-col", d), children: t.map((v, y) => {
    const x = y < n ? "finished" : y === n ? "active" : "waiting", w = y === t.length - 1;
    return /* @__PURE__ */ jsx("div", { className: cn("flex", c === "horizontal" ? "flex-1 items-start" : "pb-8 last:pb-0"), children: /* @__PURE__ */ jsxs("div", { className: cn("flex", c === "horizontal" ? "flex-col items-center flex-1" : "items-start gap-3"), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full", children: [
        c === "vertical" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("div", { className: cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0",
            x === "finished" ? "bg-sky-600 border-sky-600 text-white" : x === "active" ? "border-sky-600 text-sky-600 bg-transparent" : "border-[var(--omni-border-default)] text-[var(--omni-text-muted)] bg-transparent"
          ), children: x === "finished" ? /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }) }) : y + 1 }),
          !w && /* @__PURE__ */ jsx("div", { className: cn("w-0.5 flex-1 min-h-[24px] mt-1", x === "finished" ? "bg-sky-600" : "bg-[var(--omni-border-default)]") })
        ] }),
        c === "horizontal" && /* @__PURE__ */ jsxs("div", { className: "flex items-center w-full", children: [
          /* @__PURE__ */ jsx("div", { className: cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0",
            x === "finished" ? "bg-sky-600 border-sky-600 text-white" : x === "active" ? "border-sky-600 text-sky-600 bg-transparent" : "border-[var(--omni-border-default)] text-[var(--omni-text-muted)] bg-transparent"
          ), children: x === "finished" ? /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }) }) : y + 1 }),
          !w && /* @__PURE__ */ jsx("div", { className: cn("flex-1 h-0.5 mx-2", y < n ? "bg-sky-600" : "bg-[var(--omni-border-default)]") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: c === "horizontal" ? "mt-2 text-center" : "", children: [
        /* @__PURE__ */ jsx("p", { className: cn("text-sm font-semibold", x === "active" ? "text-[var(--omni-text-primary)]" : x === "finished" ? "text-[var(--omni-text-secondary)]" : "text-[var(--omni-text-muted)]"), children: v.title }),
        v.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] mt-0.5", children: v.description })
      ] })
    ] }) }, y);
  }) });
}
function Pagination({ current: t, total: n, pageSize: c = 10, onChange: d, className: v }) {
  const y = Math.ceil(n / c);
  if (y <= 1) return null;
  const x = () => {
    const k = [];
    if (y <= 7) {
      for (let C = 1; C <= y; C++) k.push(C);
      return k;
    }
    k.push(1), t > 3 && k.push("...");
    for (let C = Math.max(2, t - 1); C <= Math.min(y - 1, t + 1); C++) k.push(C);
    return t < y - 2 && k.push("..."), k.push(y), k;
  }, w = "min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all";
  return /* @__PURE__ */ jsxs("nav", { className: cn("flex items-center gap-1", v), "aria-label": "Paginação", children: [
    /* @__PURE__ */ jsx("button", { disabled: t <= 1, onClick: () => d(t - 1), className: cn(w, "px-2 text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-tertiary)] disabled:opacity-30"), children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "m15 18-6-6 6-6" }) }) }),
    x().map((k, C) => k === "..." ? /* @__PURE__ */ jsx("span", { className: "px-1 text-[var(--omni-text-muted)]", children: "…" }, `e${C}`) : /* @__PURE__ */ jsx("button", { onClick: () => d(k), className: cn(w, k === t ? "bg-sky-600 text-white shadow-sm" : "text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-tertiary)]"), children: k }, k)),
    /* @__PURE__ */ jsx("button", { disabled: t >= y, onClick: () => d(t + 1), className: cn(w, "px-2 text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-tertiary)] disabled:opacity-30"), children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "m9 18 6-6-6-6" }) }) })
  ] });
}
function Breadcrumbs({ items: t, separator: n, className: c }) {
  const d = n ?? /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[var(--omni-text-muted)]", children: /* @__PURE__ */ jsx("path", { d: "m9 18 6-6-6-6" }) });
  return /* @__PURE__ */ jsx("nav", { className: cn("flex items-center gap-1.5 text-sm", c), "aria-label": "Breadcrumb", children: t.map((v, y) => {
    const x = y === t.length - 1;
    return /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
      y > 0 && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0", children: d }),
      v.href && !x ? /* @__PURE__ */ jsxs("a", { href: v.href, className: "flex items-center gap-1 text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] transition-colors", children: [
        v.icon,
        v.label
      ] }) : /* @__PURE__ */ jsxs("span", { className: cn("flex items-center gap-1", x ? "font-semibold text-[var(--omni-text-primary)]" : "text-[var(--omni-text-muted)]"), children: [
        v.icon,
        v.label
      ] })
    ] }, y);
  }) });
}
function Accordion({ items: t, defaultOpenKeys: n = [], multiple: c = !1, className: d }) {
  const [v, y] = useState(new Set(n)), x = (w) => {
    y((k) => {
      const C = new Set(c ? k : []);
      return k.has(w) ? C.delete(w) : C.add(w), C;
    });
  };
  return /* @__PURE__ */ jsx("div", { className: cn("divide-y divide-[var(--omni-border-default)] border border-[var(--omni-border-default)] rounded-xl overflow-hidden", d), children: t.map((w) => {
    const k = v.has(w.key);
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => x(w.key), className: "flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-[var(--omni-bg-tertiary)] transition-colors", "aria-expanded": k, children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm font-semibold text-[var(--omni-text-primary)]", children: [
          w.icon,
          w.title
        ] }),
        /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: cn("text-[var(--omni-text-muted)] transition-transform duration-200", k && "rotate-180"), children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: cn("overflow-hidden transition-all duration-200", k ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"), children: /* @__PURE__ */ jsx("div", { className: "px-4 pb-4 text-sm text-[var(--omni-text-secondary)]", children: w.children }) })
    ] }, w.key);
  }) });
}
const Sheet = forwardRef(
  ({ open: t, onClose: n, side: c = "right", size: d, title: v, children: y, className: x, ...w }, k) => {
    const C = useRef(null), P = k || C, F = d || (c === "left" || c === "right" ? "380px" : "320px");
    useEffect(() => {
      const R = P.current;
      R && (t && !R.open ? R.showModal() : !t && R.open && R.close());
    }, [t, P]);
    const S = useCallback(
      (R) => {
        R.target === R.currentTarget && n();
      },
      [n]
    ), j = useCallback(
      (R) => {
        R.preventDefault(), n();
      },
      [n]
    ), T = {
      right: "ml-auto h-full rounded-l-2xl translate-x-0",
      left: "mr-auto h-full rounded-r-2xl translate-x-0",
      top: "mb-auto w-full rounded-b-2xl translate-y-0",
      bottom: "mt-auto w-full rounded-t-2xl translate-y-0"
    }, A = c === "left" || c === "right" ? { width: F, maxWidth: "90vw" } : { height: F, maxHeight: "90vh" };
    return /* @__PURE__ */ jsx(
      "dialog",
      {
        ref: P,
        "aria-label": v,
        className: cn(
          // Reset dialog defaults
          "fixed inset-0 m-0 p-0 max-w-none max-h-none",
          "bg-transparent border-none outline-none",
          // Backdrop
          "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
          // Animation
          "open:animate-in open:fade-in-0",
          x
        ),
        onClick: S,
        onCancel: j,
        ...w,
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "bg-[var(--omni-bg-secondary)] shadow-[var(--omni-shadow-2xl)]",
              "flex flex-col overflow-hidden",
              T[c]
            ),
            style: A,
            children: y
          }
        )
      }
    );
  }
);
Sheet.displayName = "Sheet";
const SheetHeader = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: c,
      className: cn(
        "flex items-center justify-between px-6 py-4",
        "border-b border-[var(--omni-border-default)]",
        t
      ),
      ...n
    }
  )
);
SheetHeader.displayName = "SheetHeader";
const SheetTitle = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "h2",
    {
      ref: c,
      className: cn("text-lg font-bold tracking-tight text-[var(--omni-text-primary)]", t),
      ...n
    }
  )
);
SheetTitle.displayName = "SheetTitle";
const SheetBody = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: c,
      className: cn("flex-1 overflow-auto px-6 py-4", t),
      ...n
    }
  )
);
SheetBody.displayName = "SheetBody";
const SheetFooter = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "div",
    {
      ref: c,
      className: cn(
        "flex items-center justify-end gap-3 px-6 py-4",
        "border-t border-[var(--omni-border-default)]",
        t
      ),
      ...n
    }
  )
);
SheetFooter.displayName = "SheetFooter";
const Ctx = createContext({
  open: !1,
  setOpen: () => {
  },
  triggerRef: { current: null }
});
function DropdownMenu({ children: t, open: n, onOpenChange: c }) {
  const [d, v] = useState(!1), y = n ?? d, x = useCallback(
    (k) => {
      v(k), c == null || c(k);
    },
    [c]
  ), w = useRef(null);
  return /* @__PURE__ */ jsx(Ctx.Provider, { value: { open: y, setOpen: x, triggerRef: w }, children: t });
}
const DropdownMenuTrigger = forwardRef(
  ({ children: t, className: n, onClick: c, ...d }, v) => {
    const { open: y, setOpen: x, triggerRef: w } = useContext(Ctx);
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref: (k) => {
          w.current = k, typeof v == "function" ? v(k) : v && (v.current = k);
        },
        type: "button",
        "aria-haspopup": "menu",
        "aria-expanded": y,
        className: cn("inline-flex items-center", n),
        onClick: (k) => {
          c == null || c(k), x(!y);
        },
        ...d,
        children: t
      }
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
const DropdownMenuContent = forwardRef(
  ({ children: t, className: n, align: c = "start", side: d = "bottom", ...v }, y) => {
    const { open: x, setOpen: w, triggerRef: k } = useContext(Ctx), C = useRef(null);
    return useEffect(() => {
      if (!x) return;
      const P = (F) => {
        const S = F.target;
        C.current && !C.current.contains(S) && k.current && !k.current.contains(S) && w(!1);
      };
      return document.addEventListener("mousedown", P), () => document.removeEventListener("mousedown", P);
    }, [x, w, k]), useEffect(() => {
      if (!x) return;
      const P = (F) => {
        var S;
        F.key === "Escape" && (w(!1), (S = k.current) == null || S.focus());
      };
      return document.addEventListener("keydown", P), () => document.removeEventListener("keydown", P);
    }, [x, w, k]), useEffect(() => {
      if (x && C.current) {
        const P = C.current.querySelector('[role="menuitem"]');
        P == null || P.focus();
      }
    }, [x]), x ? /* @__PURE__ */ jsx(
      "div",
      {
        ref: (P) => {
          C.current = P, typeof y == "function" ? y(P) : y && (y.current = P);
        },
        role: "menu",
        "aria-orientation": "vertical",
        className: cn(
          "absolute z-50 min-w-[180px] overflow-hidden rounded-xl",
          "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
          "shadow-[var(--omni-shadow-lg)] p-1.5",
          "animate-in fade-in-0 zoom-in-95",
          d === "bottom" ? "mt-2" : "mb-2 bottom-full",
          c === "end" ? "right-0" : c === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
          n
        ),
        ...v,
        children: t
      }
    ) : null;
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";
const DropdownMenuItem = forwardRef(
  ({ children: t, className: n, icon: c, shortcut: d, destructive: v, disabled: y, onClick: x, ...w }, k) => {
    const { setOpen: C } = useContext(Ctx);
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref: k,
        type: "button",
        role: "menuitem",
        disabled: y,
        className: cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
          "transition-colors cursor-pointer outline-none",
          "focus:bg-[var(--omni-bg-hover)] hover:bg-[var(--omni-bg-hover)]",
          v ? "text-red-600 focus:text-red-600 dark:text-red-400" : "text-[var(--omni-text-primary)]",
          y && "opacity-50 cursor-not-allowed pointer-events-none",
          n
        ),
        onClick: (P) => {
          x == null || x(P), y || C(!1);
        },
        onKeyDown: (P) => {
          var F, S, j, T;
          if (P.key === "ArrowDown") {
            P.preventDefault();
            const A = ((S = (F = P.currentTarget.nextElementSibling) == null ? void 0 : F.querySelector) == null ? void 0 : S.call(F, "[role='menuitem']")) ?? P.currentTarget.nextElementSibling;
            A == null || A.focus();
          }
          if (P.key === "ArrowUp") {
            P.preventDefault();
            const A = ((T = (j = P.currentTarget.previousElementSibling) == null ? void 0 : j.querySelector) == null ? void 0 : T.call(j, "[role='menuitem']")) ?? P.currentTarget.previousElementSibling;
            A == null || A.focus();
          }
        },
        ...w,
        children: [
          c && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[var(--omni-text-muted)]", children: c }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: t }),
          d && /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs text-[var(--omni-text-muted)] font-mono", children: d })
        ]
      }
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";
function DropdownMenuSeparator({ className: t, ...n }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "separator",
      className: cn("h-px my-1 bg-[var(--omni-border-default)]", t),
      ...n
    }
  );
}
function DropdownMenuLabel({ className: t, children: n, ...c }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "px-3 py-1.5 text-xs font-semibold text-[var(--omni-text-muted)] uppercase tracking-wider",
        t
      ),
      ...c,
      children: n
    }
  );
}
const CommandPalette = forwardRef(
  ({ open: t, onClose: n, items: c, placeholder: d = "Buscar comando...", className: v, ...y }, x) => {
    const [w, k] = useState(""), [C, P] = useState(0), F = useRef(null), S = useRef(null), T = c.filter(
      (_) => {
        var E, I;
        return _.label.toLowerCase().includes(w.toLowerCase()) || ((E = _.description) == null ? void 0 : E.toLowerCase().includes(w.toLowerCase())) || ((I = _.group) == null ? void 0 : I.toLowerCase().includes(w.toLowerCase()));
      }
    ).reduce((_, E) => {
      const I = E.group || "Geral";
      return _[I] || (_[I] = []), _[I].push(E), _;
    }, {}), A = Object.values(T).flat();
    useEffect(() => {
      t && (k(""), P(0), setTimeout(() => {
        var _;
        return (_ = F.current) == null ? void 0 : _.focus();
      }, 50));
    }, [t]), useEffect(() => {
      if (!t) return;
      const _ = (E) => {
        E.key === "Escape" && n();
      };
      return document.addEventListener("keydown", _), () => document.removeEventListener("keydown", _);
    }, [t, n]);
    const R = useCallback(
      (_) => {
        _.disabled || (_.onSelect(), n());
      },
      [n]
    ), M = (_) => {
      switch (_.key) {
        case "ArrowDown":
          _.preventDefault(), P((E) => Math.min(E + 1, A.length - 1));
          break;
        case "ArrowUp":
          _.preventDefault(), P((E) => Math.max(E - 1, 0));
          break;
        case "Enter":
          _.preventDefault(), A[C] && R(A[C]);
          break;
      }
    };
    return useEffect(() => {
      var E;
      if (!t || !S.current) return;
      (E = S.current.querySelectorAll("[data-command-item]")[C]) == null || E.scrollIntoView({ block: "nearest" });
    }, [C, t]), t ? /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]", onClick: n, children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm" }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: x,
          role: "dialog",
          "aria-label": "Command palette",
          className: cn(
            "relative w-full max-w-lg rounded-2xl overflow-hidden",
            "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
            "shadow-[var(--omni-shadow-2xl)]",
            v
          ),
          onClick: (_) => _.stopPropagation(),
          ...y,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 border-b border-[var(--omni-border-default)]", children: [
              /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", className: "shrink-0 text-[var(--omni-text-muted)]", children: [
                /* @__PURE__ */ jsx("circle", { cx: "7", cy: "7", r: "5" }),
                /* @__PURE__ */ jsx("path", { d: "M14 14L10.5 10.5" })
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: F,
                  type: "text",
                  value: w,
                  onChange: (_) => {
                    k(_.target.value), P(0);
                  },
                  onKeyDown: M,
                  placeholder: d,
                  className: "flex-1 bg-transparent h-12 text-sm text-[var(--omni-text-primary)] placeholder:text-[var(--omni-text-muted)] outline-none",
                  role: "combobox",
                  "aria-expanded": !0,
                  "aria-autocomplete": "list"
                }
              ),
              /* @__PURE__ */ jsx("kbd", { className: "hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[var(--omni-text-muted)] bg-[var(--omni-bg-tertiary)] rounded-md border border-[var(--omni-border-default)]", children: "ESC" })
            ] }),
            /* @__PURE__ */ jsx("div", { ref: S, className: "max-h-72 overflow-auto p-2", role: "listbox", children: A.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-6 text-center text-sm text-[var(--omni-text-muted)]", children: "Nenhum comando encontrado" }) : Object.entries(T).map(([_, E]) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]", children: _ }),
              E.map((I) => {
                const L = A.indexOf(I);
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    role: "option",
                    "data-command-item": !0,
                    "aria-selected": L === C,
                    disabled: I.disabled,
                    onClick: () => R(I),
                    onMouseEnter: () => P(L),
                    className: cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm",
                      "transition-colors cursor-pointer outline-none text-left",
                      L === C ? "bg-[var(--omni-bg-hover)]" : "hover:bg-[var(--omni-bg-hover)]",
                      I.disabled && "opacity-40 cursor-not-allowed"
                    ),
                    children: [
                      I.icon && /* @__PURE__ */ jsx("span", { className: "shrink-0 w-5 h-5 flex items-center justify-center text-[var(--omni-text-muted)]", children: I.icon }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsx("p", { className: "font-medium text-[var(--omni-text-primary)] truncate", children: I.label }),
                        I.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] truncate", children: I.description })
                      ] }),
                      I.shortcut && /* @__PURE__ */ jsx("kbd", { className: "flex items-center gap-0.5 text-[10px] font-mono font-semibold text-[var(--omni-text-muted)]", children: I.shortcut })
                    ]
                  },
                  I.id
                );
              })
            ] }, _)) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-4 py-2 border-t border-[var(--omni-border-default)] text-[10px] text-[var(--omni-text-muted)]", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("kbd", { className: "font-mono", children: "↑↓" }),
                " Navegar"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("kbd", { className: "font-mono", children: "↵" }),
                " Selecionar"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("kbd", { className: "font-mono", children: "ESC" }),
                " Fechar"
              ] })
            ] })
          ]
        }
      )
    ] }) : null;
  }
);
CommandPalette.displayName = "CommandPalette";
const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2"
};
function Tooltip({ content: t, position: n = "top", children: c, className: d }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("relative group inline-flex", d), children: [
    c,
    /* @__PURE__ */ jsx(
      "span",
      {
        role: "tooltip",
        className: cn(
          "absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none",
          "bg-[var(--omni-text-primary)] text-[var(--omni-text-inverse)]",
          "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
          "transition-all duration-150 ease-out",
          "shadow-[var(--omni-shadow-md)]",
          positionClasses[n]
        ),
        children: t
      }
    )
  ] });
}
const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" }, colors = ["bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500"];
function getInitials(t) {
  return t.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function hashColor(t) {
  let n = 0;
  for (const c of t) n = c.charCodeAt(0) + ((n << 5) - n);
  return colors[Math.abs(n) % colors.length];
}
function Avatar({ src: t, alt: n, name: c, size: d = "md", className: v }) {
  if (t) return /* @__PURE__ */ jsx("img", { src: t, alt: n || c || "", className: cn("rounded-full object-cover ring-2 ring-[var(--omni-bg-secondary)]", sizes[d], v) });
  const y = c ? getInitials(c) : "?";
  return /* @__PURE__ */ jsx("div", { className: cn("rounded-full flex items-center justify-center font-bold text-white ring-2 ring-[var(--omni-bg-secondary)]", sizes[d], c ? hashColor(c) : "bg-slate-400", v), children: y });
}
function AvatarGroup({ children: t, max: n = 4, size: c = "md", className: d }) {
  const v = Array.isArray(t) ? t : [t], y = v.slice(0, n), x = v.length - n;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex -space-x-2", d), children: [
    y,
    x > 0 && /* @__PURE__ */ jsxs("div", { className: cn("rounded-full flex items-center justify-center font-bold bg-[var(--omni-bg-tertiary)] text-[var(--omni-text-muted)] ring-2 ring-[var(--omni-bg-secondary)]", sizes[c]), children: [
      "+",
      x
    ] })
  ] });
}
const Table = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-auto rounded-xl border border-[var(--omni-border-default)]", children: /* @__PURE__ */ jsx(
    "table",
    {
      ref: c,
      className: cn("w-full caption-bottom text-sm", t),
      ...n
    }
  ) })
);
Table.displayName = "Table";
const TableHeader = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "thead",
    {
      ref: c,
      className: cn(
        "bg-[var(--omni-bg-tertiary)] [&_tr]:border-b [&_tr]:border-[var(--omni-border-default)]",
        t
      ),
      ...n
    }
  )
);
TableHeader.displayName = "TableHeader";
const TableBody = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "tbody",
    {
      ref: c,
      className: cn(
        "bg-[var(--omni-bg-secondary)] [&_tr:last-child]:border-0",
        t
      ),
      ...n
    }
  )
);
TableBody.displayName = "TableBody";
const TableFooter = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "tfoot",
    {
      ref: c,
      className: cn(
        "border-t border-[var(--omni-border-default)] bg-[var(--omni-bg-tertiary)] font-medium",
        t
      ),
      ...n
    }
  )
);
TableFooter.displayName = "TableFooter";
const TableRow = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "tr",
    {
      ref: c,
      className: cn(
        "border-b border-[var(--omni-border-default)] transition-colors",
        "hover:bg-[var(--omni-bg-hover)]",
        "data-[state=selected]:bg-sky-50 dark:data-[state=selected]:bg-sky-900/10",
        t
      ),
      ...n
    }
  )
);
TableRow.displayName = "TableRow";
const TableHead = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "th",
    {
      ref: c,
      className: cn(
        "h-11 px-4 text-left align-middle font-semibold",
        "text-[var(--omni-text-secondary)] text-xs uppercase tracking-wider",
        "[&:has([role=checkbox])]:pr-0",
        t
      ),
      ...n
    }
  )
);
TableHead.displayName = "TableHead";
const TableCell = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "td",
    {
      ref: c,
      className: cn(
        "px-4 py-3 align-middle text-[var(--omni-text-primary)]",
        "[&:has([role=checkbox])]:pr-0",
        t
      ),
      ...n
    }
  )
);
TableCell.displayName = "TableCell";
const TableCaption = forwardRef(
  ({ className: t, ...n }, c) => /* @__PURE__ */ jsx(
    "caption",
    {
      ref: c,
      className: cn("mt-3 text-sm text-[var(--omni-text-muted)]", t),
      ...n
    }
  )
);
TableCaption.displayName = "TableCaption";
const ProfileCard = forwardRef(
  ({ avatarUrl: t, initials: n, name: c, role: d, status: v, color: y = "#7c3aed", action: x, extra: w, variant: k = "default", className: C, ...P }, F) => {
    const S = k === "compact", j = k === "horizontal", T = S ? "w-10 h-10" : "w-14 h-14";
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: F,
        className: cn(
          "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)]",
          "transition-all duration-200 hover:shadow-md",
          j ? "flex items-center gap-4 p-4" : "p-5",
          C
        ),
        ...P,
        children: [
          /* @__PURE__ */ jsxs("div", { className: cn(
            "flex items-center gap-3",
            !j && !S && "flex-col text-center"
          ), children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              t ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: t,
                  alt: c,
                  className: cn(T, "rounded-full object-cover ring-2 ring-white dark:ring-slate-800")
                }
              ) : /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(T, "rounded-full flex items-center justify-center font-bold text-white text-sm"),
                  style: { backgroundColor: y },
                  children: n || c.split(" ").map((A) => A[0]).join("").slice(0, 2).toUpperCase()
                }
              ),
              v && /* @__PURE__ */ jsx(
                "span",
                {
                  className: cn(
                    "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800",
                    v === "online" ? "bg-emerald-500" : v === "away" ? "bg-amber-500" : "bg-slate-400"
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: cn(!j && !S && "mt-1"), children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[var(--omni-text-primary)] truncate", children: c }),
              d && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-[var(--omni-text-muted)] truncate mt-0.5", children: d })
            ] })
          ] }),
          (x || w) && /* @__PURE__ */ jsxs("div", { className: cn("mt-3", j && "ml-auto mt-0"), children: [
            x && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: x.onClick,
                className: "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                style: { color: y, backgroundColor: `${y}12` },
                children: x.label
              }
            ),
            w
          ] })
        ]
      }
    );
  }
);
ProfileCard.displayName = "ProfileCard";
function NumberedList({ items: t, color: n = "#059669", startAt: c = 1, variant: d = "default", className: v, ...y }) {
  const x = d === "compact", w = d === "card";
  return /* @__PURE__ */ jsx("ol", { className: cn("flex flex-col", w ? "gap-2" : "gap-0", v), ...y, children: t.map((k, C) => {
    const P = c + C;
    return /* @__PURE__ */ jsxs(
      "li",
      {
        className: cn(
          "flex items-center gap-4 group transition-colors",
          w ? "p-3.5 rounded-xl hover:bg-[var(--omni-bg-hover)] border border-transparent hover:border-[var(--omni-border-default)]" : "py-3 border-b border-[var(--omni-border-default)] last:border-b-0"
        ),
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "shrink-0 font-extrabold tabular-nums leading-none",
                x ? "text-lg w-6" : "text-2xl w-8"
              ),
              style: { color: n },
              children: String(P).padStart(2, "0")
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: cn(
              "font-semibold text-[var(--omni-text-primary)] truncate",
              "text-sm"
            ), children: k.title }),
            k.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] mt-0.5 truncate", children: k.description })
          ] }),
          k.icon && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[var(--omni-text-muted)]", children: k.icon })
        ]
      },
      C
    );
  }) });
}
const DonutChart = forwardRef(
  ({ segments: t, size: n = 140, strokeWidth: c = 24, centerLabel: d, showLegend: v = !0, showValues: y = !0, valueFormatter: x, legendPosition: w = "right", className: k, ...C }, P) => {
    const F = t.reduce((_, E) => _ + E.value, 0), S = (n - c) / 2, j = 2 * Math.PI * S;
    let T = 0;
    const A = t.map((_) => {
      const E = F > 0 ? _.value / F : 0, I = E * j, L = j - I, D = -(T * j) + j * 0.25;
      return T += E, { ..._, pct: E, dashLength: I, dashGap: L, offset: D };
    }), R = x || ((_) => _.toLocaleString("pt-BR")), M = w === "bottom";
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: P,
        className: cn(
          "inline-flex gap-5",
          M ? "flex-col items-center" : "items-center",
          k
        ),
        ...C,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", style: { width: n, height: n }, children: [
            /* @__PURE__ */ jsxs("svg", { width: n, height: n, viewBox: `0 0 ${n} ${n}`, children: [
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: n / 2,
                  cy: n / 2,
                  r: S,
                  fill: "none",
                  stroke: "var(--omni-border-default)",
                  strokeWidth: c,
                  opacity: 0.15
                }
              ),
              A.map((_, E) => /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: n / 2,
                  cy: n / 2,
                  r: S,
                  fill: "none",
                  stroke: _.color,
                  strokeWidth: c,
                  strokeDasharray: `${_.dashLength} ${_.dashGap}`,
                  strokeDashoffset: _.offset,
                  strokeLinecap: "butt",
                  style: { transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }
                },
                E
              ))
            ] }),
            d && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xl font-extrabold text-[var(--omni-text-primary)]", children: d }) })
          ] }),
          v && /* @__PURE__ */ jsx("div", { className: cn("flex flex-col gap-2", M && "flex-row flex-wrap justify-center gap-x-5"), children: t.map((_) => (F > 0 && Math.round(_.value / F * 100), /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "w-2.5 h-2.5 rounded-full shrink-0",
                style: { backgroundColor: _.color }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-[var(--omni-text-secondary)]", children: _.label }),
            y && /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[var(--omni-text-primary)] ml-auto tabular-nums", children: R(_.value) })
          ] }, _.label))) })
        ]
      }
    );
  }
);
DonutChart.displayName = "DonutChart";
const GoalCard = forwardRef(
  ({ title: t, subtitle: n, current: c, goal: d, unit: v, color: y = "#10b981", actionLabel: x, onAction: w, targets: k, valueFormatter: C, className: P, ...F }, S) => {
    const j = Math.min(100, c / d * 100), T = 45, A = 2 * Math.PI * T, R = A - j / 100 * A, M = C || ((_) => _.toLocaleString("pt-BR"));
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: S,
        className: cn(
          "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] p-5 transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5",
          P
        ),
        ...F,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[var(--omni-text-primary)]", children: t }),
              n && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[var(--omni-text-muted)] mt-0.5", children: n })
            ] }),
            x && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: w,
                className: "text-[11px] font-semibold px-3 py-1 rounded-lg border border-[var(--omni-border-default)] text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-hover)] transition-colors",
                children: x
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", style: { width: 100, height: 100 }, children: [
              /* @__PURE__ */ jsxs("svg", { width: "100", height: "100", viewBox: "0 0 100 100", className: "transform -rotate-90", children: [
                /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: T, fill: "none", stroke: "var(--omni-border-default)", strokeWidth: "8", opacity: 0.15 }),
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "50",
                    cy: "50",
                    r: T,
                    fill: "none",
                    stroke: y,
                    strokeWidth: "8",
                    strokeLinecap: "round",
                    strokeDasharray: A,
                    strokeDashoffset: R,
                    style: { transition: "stroke-dashoffset 0.6s ease" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxs("span", { className: "text-lg font-extrabold", style: { color: y }, children: [
                Math.round(j),
                "%"
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold tracking-tight text-[var(--omni-text-primary)]", children: M(c) }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--omni-text-muted)]", children: [
                "de ",
                M(d),
                v ? ` ${v}` : ""
              ] })
            ] })
          ] }),
          k && k.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--omni-border-default)]", children: k.map((_) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0",
                style: { backgroundColor: `${_.color || y}12`, color: _.color || y },
                children: _.icon
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-[var(--omni-text-primary)] truncate", children: _.label }),
              _.progress && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[var(--omni-text-muted)] truncate", children: _.progress })
            ] })
          ] }, _.label)) })
        ]
      }
    );
  }
);
GoalCard.displayName = "GoalCard";
const ActivityRow = forwardRef(
  ({ icon: t, iconColor: n, title: c, subtitle: d, trailing: v, clickable: y = !1, className: x, ...w }, k) => /* @__PURE__ */ jsxs(
    "div",
    {
      ref: k,
      className: cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
        y && "cursor-pointer hover:bg-[var(--omni-bg-hover)]",
        x
      ),
      ...w,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm",
            style: {
              backgroundColor: n ? `${n}12` : "var(--omni-bg-hover)",
              color: n || "var(--omni-text-secondary)"
            },
            children: t
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[var(--omni-text-primary)] truncate", children: c }),
          d && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[var(--omni-text-muted)] truncate", children: d })
        ] }),
        v && /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-[var(--omni-text-primary)] shrink-0 text-right tabular-nums", children: v })
      ]
    }
  )
);
ActivityRow.displayName = "ActivityRow";
function ModuleCard({
  moduleKey: t,
  icon: n,
  iconElement: c,
  title: d,
  description: v,
  badge: y,
  active: x,
  disabled: w,
  onClick: k,
  className: C
}) {
  const P = moduleColors[t];
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: k,
      disabled: w,
      className: cn(
        "group relative flex flex-col items-center justify-center text-center p-5 rounded-2xl",
        "transition-all duration-300 ease-out touch-manipulation active-scale overflow-hidden",
        "min-h-[140px] w-full shadow-(--omni-shadow-elevated) ring-1 ring-white/10 dark:ring-white/5",
        w && "opacity-50 cursor-not-allowed",
        !w && "cursor-pointer hover:scale-[1.03] hover:-translate-y-1 hover:shadow-(--omni-shadow-2xl)",
        x && "ring-2 ring-white/60 shadow-(--omni-shadow-xl) scale-[1.02]",
        C
      ),
      style: {
        backgroundColor: P.bg,
        color: P.text,
        boxShadow: x ? `0 0 0 1px rgba(255,255,255,0.2) inset, ${P.glow}, var(--omni-shadow-lg)` : "0 1px 0 0 rgba(255,255,255,0.15) inset, var(--omni-shadow-elevated)"
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "mb-3 flex items-center justify-center", children: c ?? (n && /* @__PURE__ */ jsx(n, { className: "w-10 h-10 text-white/90", strokeWidth: 1.5 })) }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-bold tracking-tight text-white leading-tight", children: d }),
        v && /* @__PURE__ */ jsx("span", { className: "mt-1 text-[11px] font-medium text-white/70 leading-snug line-clamp-2", children: v }),
        y && /* @__PURE__ */ jsx("span", { className: "mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm", children: y }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
            style: {
              background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 80%)"
            }
          }
        )
      ]
    }
  );
}
const ToolCard = forwardRef(
  ({ icon: t, title: n, description: c, aiTag: d, moduleColor: v, onClick: y, className: x, ...w }, k) => /* @__PURE__ */ jsxs(
    "div",
    {
      ref: k,
      onClick: y,
      role: y ? "button" : void 0,
      tabIndex: y ? 0 : void 0,
      onKeyDown: y ? (C) => {
        (C.key === "Enter" || C.key === " ") && (C.preventDefault(), y());
      } : void 0,
      className: cn(
        "group relative flex flex-col gap-3 p-5 rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)]",
        "shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)]",
        "hover:shadow-[var(--omni-shadow-elevated),var(--omni-shadow-inner)] hover:-translate-y-1",
        "transition-all duration-200 cursor-pointer active:scale-[0.98] touch-manipulation",
        x
      ),
      ...w,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex items-center justify-center w-10 h-10 rounded-xl text-white",
              style: { backgroundColor: v || "#0891b2" },
              children: /* @__PURE__ */ jsx(t, { size: 20 })
            }
          ),
          d && /* @__PURE__ */ jsx(
            "span",
            {
              className: "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white",
              style: { backgroundColor: v || "#0891b2" },
              children: d
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-[var(--omni-text-primary)] group-hover:text-[var(--omni-text-primary)]", children: n }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--omni-text-muted)] mt-1 line-clamp-2", children: c })
        ] })
      ]
    }
  )
);
ToolCard.displayName = "ToolCard";
const subjectIcons = {
  Matemática: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" }),
    /* @__PURE__ */ jsx("path", { d: "M17 14v6M14 17h6" })
  ] }),
  Português: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
    /* @__PURE__ */ jsx("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" }),
    /* @__PURE__ */ jsx("path", { d: "M8 7h8M8 11h6" })
  ] }),
  Ciências: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M9 3h6M10 3v7.4a2 2 0 0 1-.6 1.4L6.5 15.2A3 3 0 0 0 5.5 17.4V18a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-.6a3 3 0 0 0-1-2.2l-2.9-3.4a2 2 0 0 1-.6-1.4V3" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "17", r: "1", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "14", cy: "16", r: "0.7", fill: "currentColor" })
  ] }),
  História: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M3 21h18M5 21V7l7-4 7 4v14" }),
    /* @__PURE__ */ jsx("path", { d: "M9 21v-4h6v4M9 9h1M14 9h1M9 13h1M14 13h1" })
  ] }),
  Geografia: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
  ] }),
  Artes: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3 0 5.6-2.5 5.6-5.6C22 5.8 17.5 2 12 2z" }),
    /* @__PURE__ */ jsx("circle", { cx: "7.5", cy: "11", r: "1.5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "10", cy: "7", r: "1.5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "7", r: "1.5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "17.5", cy: "11", r: "1.5", fill: "currentColor" })
  ] }),
  "Educação Física": /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "5", r: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M4 17l4-4 4 4 4-4 4 4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12v5" }),
    /* @__PURE__ */ jsx("path", { d: "M8 21h8" })
  ] }),
  Inglês: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M5 8l6 4-6 4V8z" }),
    /* @__PURE__ */ jsx("path", { d: "M13 12h8M13 8h5M13 16h3" })
  ] }),
  Filosofia: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
    /* @__PURE__ */ jsx("path", { d: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" })
  ] }),
  Sociologia: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  Biologia: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M12 22c-4-4-8-6-8-12a8 8 0 1 1 16 0c0 6-4 8-8 12z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 6v10M8 10h8" })
  ] }),
  Física: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4", transform: "rotate(60 12 12)" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4", transform: "rotate(120 12 12)" })
  ] }),
  Química: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M9 3h6M10 3v6l-5 8.5a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3L14 9V3" }),
    /* @__PURE__ */ jsx("path", { d: "M8.5 14h7" })
  ] }),
  "Educação Infantil": /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ jsx("path", { d: "M12 3l1.5 4.5h4.5l-3.5 2.7 1.3 4.3L12 12l-3.8 2.5 1.3-4.3-3.5-2.7h4.5z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 16v5M8 21h8" })
  ] })
}, defaultIcon = /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
  /* @__PURE__ */ jsx("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
  /* @__PURE__ */ jsx("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" })
] }), curriculumColors = {
  Matemática: { bg: "#2563eb", fg: "#1e40af", pastel: "#dbeafe", emoji: "📐" },
  Português: { bg: "#7c3aed", fg: "#5b21b6", pastel: "#ede9fe", emoji: "📖" },
  Ciências: { bg: "#059669", fg: "#047857", pastel: "#d1fae5", emoji: "🔬" },
  História: { bg: "#d97706", fg: "#b45309", pastel: "#fef3c7", emoji: "🏛️" },
  Geografia: { bg: "#0891b2", fg: "#0e7490", pastel: "#cffafe", emoji: "🌍" },
  Artes: { bg: "#e11d48", fg: "#be123c", pastel: "#ffe4e6", emoji: "🎨" },
  "Educação Física": { bg: "#ea580c", fg: "#c2410c", pastel: "#ffedd5", emoji: "⚽" },
  Inglês: { bg: "#4f46e5", fg: "#4338ca", pastel: "#e0e7ff", emoji: "🇬🇧" },
  Filosofia: { bg: "#9333ea", fg: "#7e22ce", pastel: "#f3e8ff", emoji: "💭" },
  Sociologia: { bg: "#0d9488", fg: "#0f766e", pastel: "#ccfbf1", emoji: "🤝" },
  Biologia: { bg: "#16a34a", fg: "#15803d", pastel: "#dcfce7", emoji: "🧬" },
  Física: { bg: "#6366f1", fg: "#4f46e5", pastel: "#e0e7ff", emoji: "⚡" },
  Química: { bg: "#dc2626", fg: "#b91c1c", pastel: "#fef2f2", emoji: "⚗️" },
  "Educação Infantil": { bg: "#f472b6", fg: "#db2777", pastel: "#fce7f3", emoji: "🧸" }
}, DEFAULT_COLOR = { bg: "#64748b", fg: "#475569", pastel: "#f1f5f9", emoji: "📚" };
function getColor(t) {
  return curriculumColors[t] || DEFAULT_COLOR;
}
const CurriculumCard = forwardRef(
  ({ subject: t, icon: n, meta: c, badge: d, subtitle: v, interactive: y = !0, variant: x = "pastel", className: w, children: k, ...C }, P) => {
    const F = getColor(t), S = {
      pastel: {
        background: F.pastel,
        borderColor: `${F.bg}20`
      },
      solid: {
        background: F.bg,
        borderColor: F.bg
      },
      outlined: {
        background: "var(--omni-bg-secondary)",
        borderColor: F.bg
      }
    }, j = x === "solid" ? "#fff" : F.fg, T = x === "solid" ? "rgba(255,255,255,0.7)" : `${F.fg}99`, A = x === "solid" ? 0.08 : 0.06;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: P,
        className: cn(
          "relative rounded-2xl border p-5 transition-all duration-200 overflow-hidden",
          y && "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]",
          w
        ),
        style: {
          ...S[x],
          borderWidth: x === "outlined" ? 2 : 1
        },
        ...C,
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "absolute pointer-events-none select-none",
              style: {
                right: -4,
                top: "50%",
                fontSize: 80,
                opacity: A,
                lineHeight: 1,
                transform: "translateY(-50%) rotate(-12deg)"
              },
              "aria-hidden": "true",
              children: F.emoji
            }
          ),
          d && /* @__PURE__ */ jsx(
            "span",
            {
              className: "absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md z-10",
              style: {
                backgroundColor: x === "solid" ? "rgba(255,255,255,0.2)" : `${F.bg}15`,
                color: x === "solid" ? "#fff" : F.bg
              },
              children: d
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex items-start gap-3 mb-3", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                style: {
                  backgroundColor: x === "solid" ? "rgba(255,255,255,0.2)" : `${F.bg}15`,
                  color: x === "solid" ? "#fff" : F.bg
                },
                children: n || subjectIcons[t] || defaultIcon
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx(
                "h3",
                {
                  className: "text-base font-bold leading-tight truncate",
                  style: { color: j },
                  children: t
                }
              ),
              v && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium mt-0.5 truncate", style: { color: T }, children: v })
            ] })
          ] }),
          c && c.length > 0 && /* @__PURE__ */ jsx("div", { className: cn(
            "relative z-10 grid gap-2",
            c.length === 1 ? "grid-cols-1" : c.length === 2 ? "grid-cols-2" : "grid-cols-3"
          ), children: c.map((R) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              "p",
              {
                className: "text-lg font-extrabold leading-none",
                style: { color: j },
                children: R.value
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                className: "text-[10px] font-semibold uppercase tracking-wider mt-0.5",
                style: { color: T },
                children: R.label
              }
            )
          ] }, R.label)) }),
          k && /* @__PURE__ */ jsx("div", { className: "relative z-10", children: k })
        ]
      }
    );
  }
);
CurriculumCard.displayName = "CurriculumCard";
const MetricCard = forwardRef(
  ({ label: t, value: n, icon: c, trend: d, color: v = "#0ea5e9", variant: y = "gradient", suffix: x, className: w, ...k }, C) => {
    const P = y === "gradient", F = y === "pastel", S = P ? "#fff" : v, j = P ? "rgba(255,255,255,0.7)" : `${v}88`, T = P ? { background: `linear-gradient(135deg, ${v}, ${v}cc)` } : F ? { background: `${v}12`, border: `1px solid ${v}20` } : { background: "var(--omni-bg-secondary)", border: "1px solid var(--omni-border-default)" };
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: C,
        className: cn(
          "relative p-5 rounded-2xl overflow-hidden transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-lg",
          w
        ),
        style: T,
        ...k,
        children: [
          P && /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none",
              style: { background: "rgba(255,255,255,0.1)" }
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-widest mb-2", style: { color: j }, children: t }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-3xl font-extrabold tracking-tight leading-none", style: { color: S }, children: n }),
                x && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", style: { color: j }, children: x })
              ] }),
              d && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-2", children: [
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: cn(
                      "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md",
                      P ? "bg-white/20" : d.value >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    ),
                    style: P ? { color: "#fff" } : void 0,
                    children: [
                      d.value >= 0 ? "↑" : "↓",
                      " ",
                      Math.abs(d.value),
                      "%"
                    ]
                  }
                ),
                d.label && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium", style: { color: j }, children: d.label })
              ] })
            ] }),
            c && /* @__PURE__ */ jsx(
              "div",
              {
                className: "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                style: {
                  backgroundColor: P ? "rgba(255,255,255,0.2)" : `${v}15`,
                  color: P ? "#fff" : v
                },
                children: c
              }
            )
          ] })
        ]
      }
    );
  }
);
MetricCard.displayName = "MetricCard";
function StatCard({ title: t, value: n, icon: c, trend: d, color: v = "#0ea5e9", className: y }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("p-5 rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] shadow-[var(--omni-shadow-md)] hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-1 transition-all duration-200", y), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-[var(--omni-text-muted)]", children: t }),
      c && /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl flex items-center justify-center text-white", style: { backgroundColor: v }, children: c })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-3xl font-extrabold tracking-tight text-[var(--omni-text-primary)]", children: n }),
    d && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-2", children: [
      /* @__PURE__ */ jsxs("span", { className: cn("text-xs font-bold", d.value >= 0 ? "text-emerald-600" : "text-red-500"), children: [
        d.value >= 0 ? "↑" : "↓",
        " ",
        Math.abs(d.value),
        "%"
      ] }),
      d.label && /* @__PURE__ */ jsx("span", { className: "text-xs text-[var(--omni-text-muted)]", children: d.label })
    ] })
  ] });
}
const intensityOpacity = [0.06, 0.25, 0.5, 0.75, 1], StreakCalendar = forwardRef(
  ({ days: t, weeks: n = 12, color: c = feedbackColors.success.base, showDayLabels: d = !0, showMonthLabels: v = !0, streakCount: y, cellSize: x = 14, cellGap: w = 3, className: k, ...C }, P) => {
    const F = new Map(t.map((E) => [E.date, E.intensity])), S = /* @__PURE__ */ new Date(), j = n * 7, T = new Date(S);
    T.setDate(T.getDate() - j + 1);
    const A = T.getDay();
    T.setDate(T.getDate() - (A + 6) % 7);
    const R = [], M = new Date(T);
    for (let E = 0; E < n; E++) {
      const I = [];
      for (let L = 0; L < 7; L++) {
        const D = M.toISOString().slice(0, 10);
        I.push({ date: D, intensity: F.get(D) ?? 0 }), M.setDate(M.getDate() + 1);
      }
      R.push(I);
    }
    const _ = ["S", "T", "Q", "Q", "S", "S", "D"];
    return /* @__PURE__ */ jsxs("div", { ref: P, className: cn("inline-flex flex-col gap-2", k), ...C, children: [
      y !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🔥" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-extrabold tracking-tight text-[var(--omni-text-primary)]", children: y }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]", children: "dias seguidos" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        d && /* @__PURE__ */ jsx("div", { className: "flex flex-col pr-1", style: { gap: w }, children: _.map((E, I) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-[9px] font-semibold text-[var(--omni-text-muted)] flex items-center justify-end",
            style: { height: x, lineHeight: `${x}px` },
            children: I % 2 === 0 ? E : ""
          },
          I
        )) }),
        /* @__PURE__ */ jsx("div", { className: "flex", style: { gap: w }, children: R.map((E, I) => /* @__PURE__ */ jsx("div", { className: "flex flex-col", style: { gap: w }, children: E.map((L, D) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-sm transition-colors",
            style: {
              width: x,
              height: x,
              backgroundColor: c,
              opacity: intensityOpacity[L.intensity]
            },
            title: `${L.date}: nível ${L.intensity}`
          },
          D
        )) }, I)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[var(--omni-text-muted)] mr-1", children: "Menos" }),
        [0, 1, 2, 3, 4].map((E) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-sm",
            style: { width: x - 2, height: x - 2, backgroundColor: c, opacity: intensityOpacity[E] }
          },
          E
        )),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[var(--omni-text-muted)] ml-1", children: "Mais" })
      ] })
    ] });
  }
);
StreakCalendar.displayName = "StreakCalendar";
const masteryConfig = [
  { label: "Não iniciado", color: masteryColors.none.base, bg: masteryColors.none.bg },
  { label: "Iniciante", color: masteryColors.beginner.base, bg: masteryColors.beginner.bg },
  { label: "Praticando", color: masteryColors.learning.base, bg: masteryColors.learning.bg },
  { label: "Avançado", color: masteryColors.advanced.base, bg: masteryColors.advanced.bg },
  { label: "Dominado", color: masteryColors.mastered.base, bg: masteryColors.mastered.bg }
], MasteryBar = forwardRef(
  ({ level: t, showLabel: n = !0, labels: c, size: d = "md", className: v, ...y }, x) => {
    const k = { sm: 4, md: 6, lg: 8 }[d], C = masteryConfig[t], P = c || masteryConfig.map((F) => F.label);
    return /* @__PURE__ */ jsxs("div", { ref: x, className: cn("inline-flex flex-col gap-1.5", v), ...y, children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: [0, 1, 2, 3, 4].map((F) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex-1 rounded-full transition-all duration-300",
          style: {
            height: k,
            minWidth: d === "sm" ? 16 : d === "md" ? 24 : 32,
            backgroundColor: F <= t ? masteryConfig[Math.min(F, 4)].color : "var(--omni-border-default)",
            opacity: F <= t ? 1 : 0.3
          }
        },
        F
      )) }),
      n && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "w-2 h-2 rounded-full shrink-0",
            style: { backgroundColor: C.color }
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", style: { color: C.color }, children: P[t] })
      ] })
    ] });
  }
);
MasteryBar.displayName = "MasteryBar";
const StudyGoalRing = forwardRef(
  ({ current: t, goal: n, unit: c = "min", color: d = feedbackColors.success.base, diameter: v = 120, strokeWidth: y = 8, icon: x, label: w, className: k, ...C }, P) => {
    const F = Math.min(100, t / n * 100), S = (v - y) / 2, j = 2 * Math.PI * S, T = j - F / 100 * j, A = t >= n;
    return /* @__PURE__ */ jsxs("div", { ref: P, className: cn("inline-flex flex-col items-center gap-2", k), ...C, children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", style: { width: v, height: v }, children: [
        /* @__PURE__ */ jsxs("svg", { width: v, height: v, className: "transform -rotate-90", children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: v / 2,
              cy: v / 2,
              r: S,
              fill: "none",
              stroke: "var(--omni-border-default)",
              strokeWidth: y,
              opacity: 0.3
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: v / 2,
              cy: v / 2,
              r: S,
              fill: "none",
              stroke: d,
              strokeWidth: y,
              strokeLinecap: "round",
              strokeDasharray: j,
              strokeDashoffset: T,
              style: { transition: "stroke-dashoffset 0.6s ease" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
          x && /* @__PURE__ */ jsx("span", { className: "mb-0.5", children: x }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-extrabold tracking-tight text-[var(--omni-text-primary)]", children: [
            t,
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold text-[var(--omni-text-muted)]", children: [
              "/",
              n
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-[var(--omni-text-muted)]", children: c })
        ] })
      ] }),
      w && /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-[var(--omni-text-secondary)]", children: w }),
      A && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", style: { backgroundColor: `${d}15`, color: d }, children: "✓ Meta atingida!" })
    ] });
  }
);
StudyGoalRing.displayName = "StudyGoalRing";
const SkillBadge = forwardRef(
  ({ name: t, level: n, xp: c, xpNext: d, icon: v, color: y = brandColors.primary, variant: x = "default", unlocked: w = !0, className: k, ...C }, P) => {
    const F = x === "mini", S = x === "compact", j = c !== void 0 && d ? Math.min(100, c / d * 100) : 0;
    return F ? /* @__PURE__ */ jsxs(
      "div",
      {
        ref: P,
        className: cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all",
          w ? "border-transparent" : "border-dashed border-[var(--omni-border-default)] opacity-40",
          k
        ),
        style: w ? { backgroundColor: `${y}12`, color: y } : void 0,
        ...C,
        children: [
          v && /* @__PURE__ */ jsx("span", { className: "text-sm", children: v }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Nv.",
            n
          ] })
        ]
      }
    ) : /* @__PURE__ */ jsxs(
      "div",
      {
        ref: P,
        className: cn(
          "rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5",
          w ? "border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)]" : "border-dashed border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] opacity-50",
          S ? "p-3" : "p-4",
          k
        ),
        ...C,
        children: [
          /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-3", S && "gap-2"), children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "flex items-center justify-center rounded-xl shrink-0",
                  S ? "w-9 h-9 text-lg" : "w-12 h-12 text-2xl"
                ),
                style: { backgroundColor: w ? `${y}15` : "var(--omni-bg-hover)", color: w ? y : "var(--omni-text-muted)" },
                children: v || "⭐"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: cn("font-bold text-[var(--omni-text-primary)] truncate", S ? "text-xs" : "text-sm"), children: t }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    style: { backgroundColor: `${y}15`, color: y },
                    children: [
                      "Nv.",
                      n
                    ]
                  }
                ),
                c !== void 0 && d && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-[var(--omni-text-muted)] font-semibold tabular-nums", children: [
                  c,
                  "/",
                  d,
                  " XP"
                ] })
              ] })
            ] }),
            !w && /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", className: "text-[var(--omni-text-muted)] shrink-0", children: [
              /* @__PURE__ */ jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0110 0v4" })
            ] })
          ] }),
          c !== void 0 && d && !S && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx("div", { className: "w-full h-1.5 rounded-full overflow-hidden", style: { backgroundColor: `${y}15` }, children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full rounded-full transition-all duration-500",
              style: { width: `${j}%`, backgroundColor: y }
            }
          ) }) })
        ]
      }
    );
  }
);
SkillBadge.displayName = "SkillBadge";
const difficultyLabels = ["Muito fácil", "Fácil", "Médio", "Difícil", "Muito difícil"], difficultyColors = [
  feedbackColors.success.base,
  "#22c55e",
  feedbackColors.warning.base,
  "#f97316",
  feedbackColors.error.base
];
function DifficultyDots({ level: t, max: n = 5, shape: c = "dots", color: d = "auto", size: v = "md", showLabel: y = !1, labels: x, className: w, ...k }) {
  const C = d === "auto" ? difficultyColors[t - 1] : d, F = { sm: 6, md: 8, lg: 10 }[v], S = x || difficultyLabels;
  return /* @__PURE__ */ jsxs("div", { className: cn("inline-flex items-center gap-1.5", w), ...k, children: [
    Array.from({ length: n }, (j, T) => {
      const A = T < t;
      return c === "stars" ? /* @__PURE__ */ jsx("svg", { width: F + 4, height: F + 4, viewBox: "0 0 24 24", fill: A ? C : "none", stroke: A ? C : "var(--omni-border-default)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) }, T) : c === "bars" ? /* @__PURE__ */ jsx(
        "div",
        {
          className: "rounded-sm transition-all",
          style: {
            width: F - 2,
            height: F + T * 3,
            backgroundColor: A ? C : "var(--omni-border-default)",
            opacity: A ? 1 : 0.3
          }
        },
        T
      ) : /* @__PURE__ */ jsx(
        "div",
        {
          className: "rounded-full transition-all",
          style: {
            width: F,
            height: F,
            backgroundColor: A ? C : "var(--omni-border-default)",
            opacity: A ? 1 : 0.3
          }
        },
        T
      );
    }),
    y && /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold ml-1", style: { color: C }, children: S[t - 1] })
  ] });
}
function EmptyState({ icon: t, title: n, description: c, action: d, className: v }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-col items-center justify-center rounded-2xl",
        "border border-[var(--omni-border-default)]",
        "bg-[var(--omni-bg-tertiary)]/50",
        "py-12 px-6 text-center",
        v
      ),
      role: "status",
      "aria-label": n,
      children: [
        t && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400", children: /* @__PURE__ */ jsx(t, { className: "w-10 h-10", "aria-hidden": !0 }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-[var(--omni-text-primary)]", children: n }),
        c && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[var(--omni-text-muted)] max-w-sm", children: c }),
        d && /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Button, { variant: "primary", size: "sm", onClick: d.onClick, children: d.label }) })
      ]
    }
  );
}
function e(t) {
  return JSON.parse(JSON.stringify(t));
}
function f$1(t) {
  return t == null;
}
function r$1(t) {
  return t !== null && typeof t == "object";
}
function a$2(t, n, c) {
  let d = t;
  const v = Array.isArray(n) ? n : n.split(".");
  for (let y = 0; y < v.length; ++y) y === v.length - 1 ? d[v[y]] = c : d = d[v[y]];
}
const o = { aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000", greenyellow: "#adff2f", honeydew: "#f0fff0", hotpink: "#ff69b4", "indianred ": "#cd5c5c", indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgrey: "#d3d3d3", lightgreen: "#90ee90", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa", lightslategray: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370d8", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee", palevioletred: "#d87093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", rebeccapurple: "#663399", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", snow: "#fffafa", springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32" };
function i(t) {
  return t.startsWith("#") ? t.length === 4 ? `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}` : t : o[t.toLowerCase()] || "#000000";
}
function l(t) {
  if (!(!t || typeof t != "string"))
    return t.split(",").filter(((n) => n)).map(((n) => n.split(":"))).filter(((n) => n.length == 2)).reduce(((n, c) => (n[c[0].toLowerCase()] = i(c[1]), n)), {});
}
function u(t) {
  const n = t.toString(16);
  return n.length == 1 ? "0" + n : n;
}
function s$1(t) {
  return Math.round(t / 255 * 1e3) / 1e3;
}
function b(t) {
  return Math.round(255 * t);
}
function g(t) {
  const { r: n, g: c, b: d } = (function(v) {
    let y = parseInt(v[0] != "#" ? v : v.substring(1), 16);
    return { r: y >> 16 & 255, g: y >> 8 & 255, b: 255 & y };
  })(t);
  return [s$1(n), s$1(c), s$1(d)];
}
function h$1(t) {
  return (function(n) {
    return "#" + u(n.r) + u(n.g) + u(n.b);
  })({ r: b(t[0]), g: b(t[1]), b: b(t[2]) });
}
function p(t, { lottieInstance: n } = {}) {
  const c = [];
  return t && t.layers && t.layers.forEach(((d, v) => {
    d.nm && d.ef && d.ef.forEach(((y, x) => {
      var F, S, j;
      const w = (j = (S = (F = y == null ? void 0 : y.ef) == null ? void 0 : F[0]) == null ? void 0 : S.v) == null ? void 0 : j.k;
      if (w === void 0) return;
      let k, C;
      if (k = n ? `renderer.elements.${v}.effectsManager.effectElements.${x}.effectElements.0.p.v` : `layers.${v}.ef.${x}.ef.0.v.k`, y.mn === "ADBE Color Control" ? C = "color" : y.mn === "ADBE Slider Control" ? C = "slider" : y.mn === "ADBE Point Control" ? C = "point" : y.mn === "ADBE Checkbox Control" ? C = "checkbox" : y.mn.startsWith("Pseudo/") && (C = "feature"), !C) return;
      const P = y.nm.toLowerCase();
      c.push({ name: P, path: k, value: w, type: C });
    }));
  })), c;
}
function m(t, n, c) {
  for (const d of n) d.type === "color" ? typeof c == "object" && "r" in c && "g" in c && "b" in c ? a$2(t, d.path, [s$1(c.r), s$1(c.g), s$1(c.b)]) : Array.isArray(c) ? a$2(t, d.path, c) : typeof c == "string" && a$2(t, d.path, g(i(c))) : d.type === "point" ? typeof c == "object" && "x" in c && "y" in c ? (a$2(t, d.path + ".0", c.x), a$2(t, d.path + ".1", c.y)) : Array.isArray(c) && (a$2(t, d.path + ".0", c[0]), a$2(t, d.path + ".1", c[1])) : a$2(t, d.path, c);
}
function getDefaultExportFromCjs(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var lottie$1 = { exports: {} }, lottie = lottie$1.exports, hasRequiredLottie;
function requireLottie() {
  return hasRequiredLottie || (hasRequiredLottie = 1, (function(module, exports$1) {
    typeof document < "u" && typeof navigator < "u" && (function(t, n) {
      module.exports = n();
    })(lottie, (function() {
      var svgNS = "http://www.w3.org/2000/svg", locationHref = "", _useWebWorker = !1, initialDefaultFrame = -999999, setWebWorker = function(n) {
        _useWebWorker = !!n;
      }, getWebWorker = function() {
        return _useWebWorker;
      }, setLocationHref = function(n) {
        locationHref = n;
      }, getLocationHref = function() {
        return locationHref;
      };
      function createTag(t) {
        return document.createElement(t);
      }
      function extendPrototype(t, n) {
        var c, d = t.length, v;
        for (c = 0; c < d; c += 1) {
          v = t[c].prototype;
          for (var y in v)
            Object.prototype.hasOwnProperty.call(v, y) && (n.prototype[y] = v[y]);
        }
      }
      function getDescriptor(t, n) {
        return Object.getOwnPropertyDescriptor(t, n);
      }
      function createProxyFunction(t) {
        function n() {
        }
        return n.prototype = t, n;
      }
      var audioControllerFactory = (function() {
        function t(n) {
          this.audios = [], this.audioFactory = n, this._volume = 1, this._isMuted = !1;
        }
        return t.prototype = {
          addAudio: function(c) {
            this.audios.push(c);
          },
          pause: function() {
            var c, d = this.audios.length;
            for (c = 0; c < d; c += 1)
              this.audios[c].pause();
          },
          resume: function() {
            var c, d = this.audios.length;
            for (c = 0; c < d; c += 1)
              this.audios[c].resume();
          },
          setRate: function(c) {
            var d, v = this.audios.length;
            for (d = 0; d < v; d += 1)
              this.audios[d].setRate(c);
          },
          createAudio: function(c) {
            return this.audioFactory ? this.audioFactory(c) : window.Howl ? new window.Howl({
              src: [c]
            }) : {
              isPlaying: !1,
              play: function() {
                this.isPlaying = !0;
              },
              seek: function() {
                this.isPlaying = !1;
              },
              playing: function() {
              },
              rate: function() {
              },
              setVolume: function() {
              }
            };
          },
          setAudioFactory: function(c) {
            this.audioFactory = c;
          },
          setVolume: function(c) {
            this._volume = c, this._updateVolume();
          },
          mute: function() {
            this._isMuted = !0, this._updateVolume();
          },
          unmute: function() {
            this._isMuted = !1, this._updateVolume();
          },
          getVolume: function() {
            return this._volume;
          },
          _updateVolume: function() {
            var c, d = this.audios.length;
            for (c = 0; c < d; c += 1)
              this.audios[c].volume(this._volume * (this._isMuted ? 0 : 1));
          }
        }, function() {
          return new t();
        };
      })(), createTypedArray = /* @__PURE__ */ (function() {
        function t(c, d) {
          var v = 0, y = [], x;
          switch (c) {
            case "int16":
            case "uint8c":
              x = 1;
              break;
            default:
              x = 1.1;
              break;
          }
          for (v = 0; v < d; v += 1)
            y.push(x);
          return y;
        }
        function n(c, d) {
          return c === "float32" ? new Float32Array(d) : c === "int16" ? new Int16Array(d) : c === "uint8c" ? new Uint8ClampedArray(d) : t(c, d);
        }
        return typeof Uint8ClampedArray == "function" && typeof Float32Array == "function" ? n : t;
      })();
      function createSizedArray(t) {
        return Array.apply(null, {
          length: t
        });
      }
      function _typeof$6(t) {
        "@babel/helpers - typeof";
        return _typeof$6 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
          return typeof n;
        } : function(n) {
          return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
        }, _typeof$6(t);
      }
      var subframeEnabled = !0, expressionsPlugin = null, expressionsInterfaces = null, idPrefix$1 = "", isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent), bmPow = Math.pow, bmSqrt = Math.sqrt, bmFloor = Math.floor, bmMax = Math.max, bmMin = Math.min, BMMath = {};
      (function() {
        var t = ["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "cbrt", "expm1", "clz32", "cos", "cosh", "exp", "floor", "fround", "hypot", "imul", "log", "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"], n, c = t.length;
        for (n = 0; n < c; n += 1)
          BMMath[t[n]] = Math[t[n]];
      })(), BMMath.random = Math.random, BMMath.abs = function(t) {
        var n = _typeof$6(t);
        if (n === "object" && t.length) {
          var c = createSizedArray(t.length), d, v = t.length;
          for (d = 0; d < v; d += 1)
            c[d] = Math.abs(t[d]);
          return c;
        }
        return Math.abs(t);
      };
      var defaultCurveSegments = 150, degToRads = Math.PI / 180, roundCorner = 0.5519;
      function styleDiv(t) {
        t.style.position = "absolute", t.style.top = 0, t.style.left = 0, t.style.display = "block", t.style.transformOrigin = "0 0", t.style.webkitTransformOrigin = "0 0", t.style.backfaceVisibility = "visible", t.style.webkitBackfaceVisibility = "visible", t.style.transformStyle = "preserve-3d", t.style.webkitTransformStyle = "preserve-3d", t.style.mozTransformStyle = "preserve-3d";
      }
      function BMEnterFrameEvent(t, n, c, d) {
        this.type = t, this.currentTime = n, this.totalTime = c, this.direction = d < 0 ? -1 : 1;
      }
      function BMCompleteEvent(t, n) {
        this.type = t, this.direction = n < 0 ? -1 : 1;
      }
      function BMCompleteLoopEvent(t, n, c, d) {
        this.type = t, this.currentLoop = c, this.totalLoops = n, this.direction = d < 0 ? -1 : 1;
      }
      function BMSegmentStartEvent(t, n, c) {
        this.type = t, this.firstFrame = n, this.totalFrames = c;
      }
      function BMDestroyEvent(t, n) {
        this.type = t, this.target = n;
      }
      function BMRenderFrameErrorEvent(t, n) {
        this.type = "renderFrameError", this.nativeError = t, this.currentTime = n;
      }
      function BMConfigErrorEvent(t) {
        this.type = "configError", this.nativeError = t;
      }
      var createElementID = /* @__PURE__ */ (function() {
        var t = 0;
        return function() {
          return t += 1, idPrefix$1 + "__lottie_element_" + t;
        };
      })();
      function HSVtoRGB(t, n, c) {
        var d, v, y, x, w, k, C, P;
        switch (x = Math.floor(t * 6), w = t * 6 - x, k = c * (1 - n), C = c * (1 - w * n), P = c * (1 - (1 - w) * n), x % 6) {
          case 0:
            d = c, v = P, y = k;
            break;
          case 1:
            d = C, v = c, y = k;
            break;
          case 2:
            d = k, v = c, y = P;
            break;
          case 3:
            d = k, v = C, y = c;
            break;
          case 4:
            d = P, v = k, y = c;
            break;
          case 5:
            d = c, v = k, y = C;
            break;
        }
        return [d, v, y];
      }
      function RGBtoHSV(t, n, c) {
        var d = Math.max(t, n, c), v = Math.min(t, n, c), y = d - v, x, w = d === 0 ? 0 : y / d, k = d / 255;
        switch (d) {
          case v:
            x = 0;
            break;
          case t:
            x = n - c + y * (n < c ? 6 : 0), x /= 6 * y;
            break;
          case n:
            x = c - t + y * 2, x /= 6 * y;
            break;
          case c:
            x = t - n + y * 4, x /= 6 * y;
            break;
        }
        return [x, w, k];
      }
      function addSaturationToRGB(t, n) {
        var c = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
        return c[1] += n, c[1] > 1 ? c[1] = 1 : c[1] <= 0 && (c[1] = 0), HSVtoRGB(c[0], c[1], c[2]);
      }
      function addBrightnessToRGB(t, n) {
        var c = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
        return c[2] += n, c[2] > 1 ? c[2] = 1 : c[2] < 0 && (c[2] = 0), HSVtoRGB(c[0], c[1], c[2]);
      }
      function addHueToRGB(t, n) {
        var c = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
        return c[0] += n / 360, c[0] > 1 ? c[0] -= 1 : c[0] < 0 && (c[0] += 1), HSVtoRGB(c[0], c[1], c[2]);
      }
      var rgbToHex = (function() {
        var t = [], n, c;
        for (n = 0; n < 256; n += 1)
          c = n.toString(16), t[n] = c.length === 1 ? "0" + c : c;
        return function(d, v, y) {
          return d < 0 && (d = 0), v < 0 && (v = 0), y < 0 && (y = 0), "#" + t[d] + t[v] + t[y];
        };
      })(), setSubframeEnabled = function(n) {
        subframeEnabled = !!n;
      }, getSubframeEnabled = function() {
        return subframeEnabled;
      }, setExpressionsPlugin = function(n) {
        expressionsPlugin = n;
      }, getExpressionsPlugin = function() {
        return expressionsPlugin;
      }, setExpressionInterfaces = function(n) {
        expressionsInterfaces = n;
      }, getExpressionInterfaces = function() {
        return expressionsInterfaces;
      }, setDefaultCurveSegments = function(n) {
        defaultCurveSegments = n;
      }, getDefaultCurveSegments = function() {
        return defaultCurveSegments;
      }, setIdPrefix = function(n) {
        idPrefix$1 = n;
      };
      function createNS(t) {
        return document.createElementNS(svgNS, t);
      }
      function _typeof$5(t) {
        "@babel/helpers - typeof";
        return _typeof$5 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
          return typeof n;
        } : function(n) {
          return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
        }, _typeof$5(t);
      }
      var dataManager = /* @__PURE__ */ (function() {
        var t = 1, n = [], c, d, v = {
          onmessage: function() {
          },
          postMessage: function(j) {
            c({
              data: j
            });
          }
        }, y = {
          postMessage: function(j) {
            v.onmessage({
              data: j
            });
          }
        };
        function x(S) {
          if (window.Worker && window.Blob && getWebWorker()) {
            var j = new Blob(["var _workerSelf = self; self.onmessage = ", S.toString()], {
              type: "text/javascript"
            }), T = URL.createObjectURL(j);
            return new Worker(T);
          }
          return c = S, v;
        }
        function w() {
          d || (d = x(function(j) {
            function T() {
              function R(q, B) {
                var G, N, V = q.length, H, $, J, ee;
                for (N = 0; N < V; N += 1)
                  if (G = q[N], "ks" in G && !G.completed) {
                    if (G.completed = !0, G.hasMask) {
                      var te = G.masksProperties;
                      for ($ = te.length, H = 0; H < $; H += 1)
                        if (te[H].pt.k.i)
                          L(te[H].pt.k);
                        else
                          for (ee = te[H].pt.k.length, J = 0; J < ee; J += 1)
                            te[H].pt.k[J].s && L(te[H].pt.k[J].s[0]), te[H].pt.k[J].e && L(te[H].pt.k[J].e[0]);
                    }
                    G.ty === 0 ? (G.layers = E(G.refId, B), R(G.layers, B)) : G.ty === 4 ? I(G.shapes) : G.ty === 5 && U(G);
                  }
              }
              function M(q, B) {
                if (q) {
                  var G = 0, N = q.length;
                  for (G = 0; G < N; G += 1)
                    q[G].t === 1 && (q[G].data.layers = E(q[G].data.refId, B), R(q[G].data.layers, B));
                }
              }
              function _(q, B) {
                for (var G = 0, N = B.length; G < N; ) {
                  if (B[G].id === q)
                    return B[G];
                  G += 1;
                }
                return null;
              }
              function E(q, B) {
                var G = _(q, B);
                return G ? G.layers.__used ? JSON.parse(JSON.stringify(G.layers)) : (G.layers.__used = !0, G.layers) : null;
              }
              function I(q) {
                var B, G = q.length, N, V;
                for (B = G - 1; B >= 0; B -= 1)
                  if (q[B].ty === "sh")
                    if (q[B].ks.k.i)
                      L(q[B].ks.k);
                    else
                      for (V = q[B].ks.k.length, N = 0; N < V; N += 1)
                        q[B].ks.k[N].s && L(q[B].ks.k[N].s[0]), q[B].ks.k[N].e && L(q[B].ks.k[N].e[0]);
                  else q[B].ty === "gr" && I(q[B].it);
              }
              function L(q) {
                var B, G = q.i.length;
                for (B = 0; B < G; B += 1)
                  q.i[B][0] += q.v[B][0], q.i[B][1] += q.v[B][1], q.o[B][0] += q.v[B][0], q.o[B][1] += q.v[B][1];
              }
              function D(q, B) {
                var G = B ? B.split(".") : [100, 100, 100];
                return q[0] > G[0] ? !0 : G[0] > q[0] ? !1 : q[1] > G[1] ? !0 : G[1] > q[1] ? !1 : q[2] > G[2] ? !0 : G[2] > q[2] ? !1 : null;
              }
              var O = /* @__PURE__ */ (function() {
                var q = [4, 4, 14];
                function B(N) {
                  var V = N.t.d;
                  N.t.d = {
                    k: [{
                      s: V,
                      t: 0
                    }]
                  };
                }
                function G(N) {
                  var V, H = N.length;
                  for (V = 0; V < H; V += 1)
                    N[V].ty === 5 && B(N[V]);
                }
                return function(N) {
                  if (D(q, N.v) && (G(N.layers), N.assets)) {
                    var V, H = N.assets.length;
                    for (V = 0; V < H; V += 1)
                      N.assets[V].layers && G(N.assets[V].layers);
                  }
                };
              })(), z = /* @__PURE__ */ (function() {
                var q = [4, 7, 99];
                return function(B) {
                  if (B.chars && !D(q, B.v)) {
                    var G, N = B.chars.length;
                    for (G = 0; G < N; G += 1) {
                      var V = B.chars[G];
                      V.data && V.data.shapes && (I(V.data.shapes), V.data.ip = 0, V.data.op = 99999, V.data.st = 0, V.data.sr = 1, V.data.ks = {
                        p: {
                          k: [0, 0],
                          a: 0
                        },
                        s: {
                          k: [100, 100],
                          a: 0
                        },
                        a: {
                          k: [0, 0],
                          a: 0
                        },
                        r: {
                          k: 0,
                          a: 0
                        },
                        o: {
                          k: 100,
                          a: 0
                        }
                      }, B.chars[G].t || (V.data.shapes.push({
                        ty: "no"
                      }), V.data.shapes[0].it.push({
                        p: {
                          k: [0, 0],
                          a: 0
                        },
                        s: {
                          k: [100, 100],
                          a: 0
                        },
                        a: {
                          k: [0, 0],
                          a: 0
                        },
                        r: {
                          k: 0,
                          a: 0
                        },
                        o: {
                          k: 100,
                          a: 0
                        },
                        sk: {
                          k: 0,
                          a: 0
                        },
                        sa: {
                          k: 0,
                          a: 0
                        },
                        ty: "tr"
                      })));
                    }
                  }
                };
              })(), W = /* @__PURE__ */ (function() {
                var q = [5, 7, 15];
                function B(N) {
                  var V = N.t.p;
                  typeof V.a == "number" && (V.a = {
                    a: 0,
                    k: V.a
                  }), typeof V.p == "number" && (V.p = {
                    a: 0,
                    k: V.p
                  }), typeof V.r == "number" && (V.r = {
                    a: 0,
                    k: V.r
                  });
                }
                function G(N) {
                  var V, H = N.length;
                  for (V = 0; V < H; V += 1)
                    N[V].ty === 5 && B(N[V]);
                }
                return function(N) {
                  if (D(q, N.v) && (G(N.layers), N.assets)) {
                    var V, H = N.assets.length;
                    for (V = 0; V < H; V += 1)
                      N.assets[V].layers && G(N.assets[V].layers);
                  }
                };
              })(), X = /* @__PURE__ */ (function() {
                var q = [4, 1, 9];
                function B(N) {
                  var V, H = N.length, $, J;
                  for (V = 0; V < H; V += 1)
                    if (N[V].ty === "gr")
                      B(N[V].it);
                    else if (N[V].ty === "fl" || N[V].ty === "st")
                      if (N[V].c.k && N[V].c.k[0].i)
                        for (J = N[V].c.k.length, $ = 0; $ < J; $ += 1)
                          N[V].c.k[$].s && (N[V].c.k[$].s[0] /= 255, N[V].c.k[$].s[1] /= 255, N[V].c.k[$].s[2] /= 255, N[V].c.k[$].s[3] /= 255), N[V].c.k[$].e && (N[V].c.k[$].e[0] /= 255, N[V].c.k[$].e[1] /= 255, N[V].c.k[$].e[2] /= 255, N[V].c.k[$].e[3] /= 255);
                      else
                        N[V].c.k[0] /= 255, N[V].c.k[1] /= 255, N[V].c.k[2] /= 255, N[V].c.k[3] /= 255;
                }
                function G(N) {
                  var V, H = N.length;
                  for (V = 0; V < H; V += 1)
                    N[V].ty === 4 && B(N[V].shapes);
                }
                return function(N) {
                  if (D(q, N.v) && (G(N.layers), N.assets)) {
                    var V, H = N.assets.length;
                    for (V = 0; V < H; V += 1)
                      N.assets[V].layers && G(N.assets[V].layers);
                  }
                };
              })(), K = /* @__PURE__ */ (function() {
                var q = [4, 4, 18];
                function B(N) {
                  var V, H = N.length, $, J;
                  for (V = H - 1; V >= 0; V -= 1)
                    if (N[V].ty === "sh")
                      if (N[V].ks.k.i)
                        N[V].ks.k.c = N[V].closed;
                      else
                        for (J = N[V].ks.k.length, $ = 0; $ < J; $ += 1)
                          N[V].ks.k[$].s && (N[V].ks.k[$].s[0].c = N[V].closed), N[V].ks.k[$].e && (N[V].ks.k[$].e[0].c = N[V].closed);
                    else N[V].ty === "gr" && B(N[V].it);
                }
                function G(N) {
                  var V, H, $ = N.length, J, ee, te, re;
                  for (H = 0; H < $; H += 1) {
                    if (V = N[H], V.hasMask) {
                      var ie = V.masksProperties;
                      for (ee = ie.length, J = 0; J < ee; J += 1)
                        if (ie[J].pt.k.i)
                          ie[J].pt.k.c = ie[J].cl;
                        else
                          for (re = ie[J].pt.k.length, te = 0; te < re; te += 1)
                            ie[J].pt.k[te].s && (ie[J].pt.k[te].s[0].c = ie[J].cl), ie[J].pt.k[te].e && (ie[J].pt.k[te].e[0].c = ie[J].cl);
                    }
                    V.ty === 4 && B(V.shapes);
                  }
                }
                return function(N) {
                  if (D(q, N.v) && (G(N.layers), N.assets)) {
                    var V, H = N.assets.length;
                    for (V = 0; V < H; V += 1)
                      N.assets[V].layers && G(N.assets[V].layers);
                  }
                };
              })();
              function Y(q) {
                q.__complete || (X(q), O(q), z(q), W(q), K(q), R(q.layers, q.assets), M(q.chars, q.assets), q.__complete = !0);
              }
              function U(q) {
                q.t.a.length === 0 && "m" in q.t.p;
              }
              var Z = {};
              return Z.completeData = Y, Z.checkColors = X, Z.checkChars = z, Z.checkPathProperties = W, Z.checkShapes = K, Z.completeLayers = R, Z;
            }
            if (y.dataManager || (y.dataManager = T()), y.assetLoader || (y.assetLoader = /* @__PURE__ */ (function() {
              function R(_) {
                var E = _.getResponseHeader("content-type");
                return E && _.responseType === "json" && E.indexOf("json") !== -1 || _.response && _typeof$5(_.response) === "object" ? _.response : _.response && typeof _.response == "string" ? JSON.parse(_.response) : _.responseText ? JSON.parse(_.responseText) : null;
              }
              function M(_, E, I, L) {
                var D, O = new XMLHttpRequest();
                try {
                  O.responseType = "json";
                } catch {
                }
                O.onreadystatechange = function() {
                  if (O.readyState === 4)
                    if (O.status === 200)
                      D = R(O), I(D);
                    else
                      try {
                        D = R(O), I(D);
                      } catch (z) {
                        L && L(z);
                      }
                };
                try {
                  O.open(["G", "E", "T"].join(""), _, !0);
                } catch {
                  O.open(["G", "E", "T"].join(""), E + "/" + _, !0);
                }
                O.send();
              }
              return {
                load: M
              };
            })()), j.data.type === "loadAnimation")
              y.assetLoader.load(j.data.path, j.data.fullPath, function(R) {
                y.dataManager.completeData(R), y.postMessage({
                  id: j.data.id,
                  payload: R,
                  status: "success"
                });
              }, function() {
                y.postMessage({
                  id: j.data.id,
                  status: "error"
                });
              });
            else if (j.data.type === "complete") {
              var A = j.data.animation;
              y.dataManager.completeData(A), y.postMessage({
                id: j.data.id,
                payload: A,
                status: "success"
              });
            } else j.data.type === "loadData" && y.assetLoader.load(j.data.path, j.data.fullPath, function(R) {
              y.postMessage({
                id: j.data.id,
                payload: R,
                status: "success"
              });
            }, function() {
              y.postMessage({
                id: j.data.id,
                status: "error"
              });
            });
          }), d.onmessage = function(S) {
            var j = S.data, T = j.id, A = n[T];
            n[T] = null, j.status === "success" ? A.onComplete(j.payload) : A.onError && A.onError();
          });
        }
        function k(S, j) {
          t += 1;
          var T = "processId_" + t;
          return n[T] = {
            onComplete: S,
            onError: j
          }, T;
        }
        function C(S, j, T) {
          w();
          var A = k(j, T);
          d.postMessage({
            type: "loadAnimation",
            path: S,
            fullPath: window.location.origin + window.location.pathname,
            id: A
          });
        }
        function P(S, j, T) {
          w();
          var A = k(j, T);
          d.postMessage({
            type: "loadData",
            path: S,
            fullPath: window.location.origin + window.location.pathname,
            id: A
          });
        }
        function F(S, j, T) {
          w();
          var A = k(j, T);
          d.postMessage({
            type: "complete",
            animation: S,
            id: A
          });
        }
        return {
          loadAnimation: C,
          loadData: P,
          completeAnimation: F
        };
      })(), ImagePreloader = (function() {
        var t = (function() {
          var M = createTag("canvas");
          M.width = 1, M.height = 1;
          var _ = M.getContext("2d");
          return _.fillStyle = "rgba(0,0,0,0)", _.fillRect(0, 0, 1, 1), M;
        })();
        function n() {
          this.loadedAssets += 1, this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages && this.imagesLoadedCb && this.imagesLoadedCb(null);
        }
        function c() {
          this.loadedFootagesCount += 1, this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages && this.imagesLoadedCb && this.imagesLoadedCb(null);
        }
        function d(M, _, E) {
          var I = "";
          if (M.e)
            I = M.p;
          else if (_) {
            var L = M.p;
            L.indexOf("images/") !== -1 && (L = L.split("/")[1]), I = _ + L;
          } else
            I = E, I += M.u ? M.u : "", I += M.p;
          return I;
        }
        function v(M) {
          var _ = 0, E = setInterval((function() {
            var I = M.getBBox();
            (I.width || _ > 500) && (this._imageLoaded(), clearInterval(E)), _ += 1;
          }).bind(this), 50);
        }
        function y(M) {
          var _ = d(M, this.assetsPath, this.path), E = createNS("image");
          isSafari ? this.testImageLoaded(E) : E.addEventListener("load", this._imageLoaded, !1), E.addEventListener("error", (function() {
            I.img = t, this._imageLoaded();
          }).bind(this), !1), E.setAttributeNS("http://www.w3.org/1999/xlink", "href", _), this._elementHelper.append ? this._elementHelper.append(E) : this._elementHelper.appendChild(E);
          var I = {
            img: E,
            assetData: M
          };
          return I;
        }
        function x(M) {
          var _ = d(M, this.assetsPath, this.path), E = createTag("img");
          E.crossOrigin = "anonymous", E.addEventListener("load", this._imageLoaded, !1), E.addEventListener("error", (function() {
            I.img = t, this._imageLoaded();
          }).bind(this), !1), E.src = _;
          var I = {
            img: E,
            assetData: M
          };
          return I;
        }
        function w(M) {
          var _ = {
            assetData: M
          }, E = d(M, this.assetsPath, this.path);
          return dataManager.loadData(E, (function(I) {
            _.img = I, this._footageLoaded();
          }).bind(this), (function() {
            _.img = {}, this._footageLoaded();
          }).bind(this)), _;
        }
        function k(M, _) {
          this.imagesLoadedCb = _;
          var E, I = M.length;
          for (E = 0; E < I; E += 1)
            M[E].layers || (!M[E].t || M[E].t === "seq" ? (this.totalImages += 1, this.images.push(this._createImageData(M[E]))) : M[E].t === 3 && (this.totalFootages += 1, this.images.push(this.createFootageData(M[E]))));
        }
        function C(M) {
          this.path = M || "";
        }
        function P(M) {
          this.assetsPath = M || "";
        }
        function F(M) {
          for (var _ = 0, E = this.images.length; _ < E; ) {
            if (this.images[_].assetData === M)
              return this.images[_].img;
            _ += 1;
          }
          return null;
        }
        function S() {
          this.imagesLoadedCb = null, this.images.length = 0;
        }
        function j() {
          return this.totalImages === this.loadedAssets;
        }
        function T() {
          return this.totalFootages === this.loadedFootagesCount;
        }
        function A(M, _) {
          M === "svg" ? (this._elementHelper = _, this._createImageData = this.createImageData.bind(this)) : this._createImageData = this.createImgData.bind(this);
        }
        function R() {
          this._imageLoaded = n.bind(this), this._footageLoaded = c.bind(this), this.testImageLoaded = v.bind(this), this.createFootageData = w.bind(this), this.assetsPath = "", this.path = "", this.totalImages = 0, this.totalFootages = 0, this.loadedAssets = 0, this.loadedFootagesCount = 0, this.imagesLoadedCb = null, this.images = [];
        }
        return R.prototype = {
          loadAssets: k,
          setAssetsPath: P,
          setPath: C,
          loadedImages: j,
          loadedFootages: T,
          destroy: S,
          getAsset: F,
          createImgData: x,
          createImageData: y,
          imageLoaded: n,
          footageLoaded: c,
          setCacheType: A
        }, R;
      })();
      function BaseEvent() {
      }
      BaseEvent.prototype = {
        triggerEvent: function(n, c) {
          if (this._cbs[n])
            for (var d = this._cbs[n], v = 0; v < d.length; v += 1)
              d[v](c);
        },
        addEventListener: function(n, c) {
          return this._cbs[n] || (this._cbs[n] = []), this._cbs[n].push(c), (function() {
            this.removeEventListener(n, c);
          }).bind(this);
        },
        removeEventListener: function(n, c) {
          if (!c)
            this._cbs[n] = null;
          else if (this._cbs[n]) {
            for (var d = 0, v = this._cbs[n].length; d < v; )
              this._cbs[n][d] === c && (this._cbs[n].splice(d, 1), d -= 1, v -= 1), d += 1;
            this._cbs[n].length || (this._cbs[n] = null);
          }
        }
      };
      var markerParser = /* @__PURE__ */ (function() {
        function t(n) {
          for (var c = n.split(`\r
`), d = {}, v, y = 0, x = 0; x < c.length; x += 1)
            v = c[x].split(":"), v.length === 2 && (d[v[0]] = v[1].trim(), y += 1);
          if (y === 0)
            throw new Error();
          return d;
        }
        return function(n) {
          for (var c = [], d = 0; d < n.length; d += 1) {
            var v = n[d], y = {
              time: v.tm,
              duration: v.dr
            };
            try {
              y.payload = JSON.parse(n[d].cm);
            } catch {
              try {
                y.payload = t(n[d].cm);
              } catch {
                y.payload = {
                  name: n[d].cm
                };
              }
            }
            c.push(y);
          }
          return c;
        };
      })(), ProjectInterface = /* @__PURE__ */ (function() {
        function t(n) {
          this.compositions.push(n);
        }
        return function() {
          function n(c) {
            for (var d = 0, v = this.compositions.length; d < v; ) {
              if (this.compositions[d].data && this.compositions[d].data.nm === c)
                return this.compositions[d].prepareFrame && this.compositions[d].data.xt && this.compositions[d].prepareFrame(this.currentFrame), this.compositions[d].compInterface;
              d += 1;
            }
            return null;
          }
          return n.compositions = [], n.currentFrame = 0, n.registerComposition = t, n;
        };
      })(), renderers = {}, registerRenderer = function(n, c) {
        renderers[n] = c;
      };
      function getRenderer(t) {
        return renderers[t];
      }
      function getRegisteredRenderer() {
        if (renderers.canvas)
          return "canvas";
        for (var t in renderers)
          if (renderers[t])
            return t;
        return "";
      }
      function _typeof$4(t) {
        "@babel/helpers - typeof";
        return _typeof$4 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
          return typeof n;
        } : function(n) {
          return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
        }, _typeof$4(t);
      }
      var AnimationItem = function() {
        this._cbs = [], this.name = "", this.path = "", this.isLoaded = !1, this.currentFrame = 0, this.currentRawFrame = 0, this.firstFrame = 0, this.totalFrames = 0, this.frameRate = 0, this.frameMult = 0, this.playSpeed = 1, this.playDirection = 1, this.playCount = 0, this.animationData = {}, this.assets = [], this.isPaused = !0, this.autoplay = !1, this.loop = !0, this.renderer = null, this.animationID = createElementID(), this.assetsPath = "", this.timeCompleted = 0, this.segmentPos = 0, this.isSubframeEnabled = getSubframeEnabled(), this.segments = [], this._idle = !0, this._completedLoop = !1, this.projectInterface = ProjectInterface(), this.imagePreloader = new ImagePreloader(), this.audioController = audioControllerFactory(), this.markers = [], this.configAnimation = this.configAnimation.bind(this), this.onSetupError = this.onSetupError.bind(this), this.onSegmentComplete = this.onSegmentComplete.bind(this), this.drawnFrameEvent = new BMEnterFrameEvent("drawnFrame", 0, 0, 0), this.expressionsPlugin = getExpressionsPlugin();
      };
      extendPrototype([BaseEvent], AnimationItem), AnimationItem.prototype.setParams = function(t) {
        (t.wrapper || t.container) && (this.wrapper = t.wrapper || t.container);
        var n = "svg";
        t.animType ? n = t.animType : t.renderer && (n = t.renderer);
        var c = getRenderer(n);
        this.renderer = new c(this, t.rendererSettings), this.imagePreloader.setCacheType(n, this.renderer.globalData.defs), this.renderer.setProjectInterface(this.projectInterface), this.animType = n, t.loop === "" || t.loop === null || t.loop === void 0 || t.loop === !0 ? this.loop = !0 : t.loop === !1 ? this.loop = !1 : this.loop = parseInt(t.loop, 10), this.autoplay = "autoplay" in t ? t.autoplay : !0, this.name = t.name ? t.name : "", this.autoloadSegments = Object.prototype.hasOwnProperty.call(t, "autoloadSegments") ? t.autoloadSegments : !0, this.assetsPath = t.assetsPath, this.initialSegment = t.initialSegment, t.audioFactory && this.audioController.setAudioFactory(t.audioFactory), t.animationData ? this.setupAnimation(t.animationData) : t.path && (t.path.lastIndexOf("\\") !== -1 ? this.path = t.path.substr(0, t.path.lastIndexOf("\\") + 1) : this.path = t.path.substr(0, t.path.lastIndexOf("/") + 1), this.fileName = t.path.substr(t.path.lastIndexOf("/") + 1), this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf(".json")), dataManager.loadAnimation(t.path, this.configAnimation, this.onSetupError));
      }, AnimationItem.prototype.onSetupError = function() {
        this.trigger("data_failed");
      }, AnimationItem.prototype.setupAnimation = function(t) {
        dataManager.completeAnimation(t, this.configAnimation);
      }, AnimationItem.prototype.setData = function(t, n) {
        n && _typeof$4(n) !== "object" && (n = JSON.parse(n));
        var c = {
          wrapper: t,
          animationData: n
        }, d = t.attributes;
        c.path = d.getNamedItem("data-animation-path") ? d.getNamedItem("data-animation-path").value : d.getNamedItem("data-bm-path") ? d.getNamedItem("data-bm-path").value : d.getNamedItem("bm-path") ? d.getNamedItem("bm-path").value : "", c.animType = d.getNamedItem("data-anim-type") ? d.getNamedItem("data-anim-type").value : d.getNamedItem("data-bm-type") ? d.getNamedItem("data-bm-type").value : d.getNamedItem("bm-type") ? d.getNamedItem("bm-type").value : d.getNamedItem("data-bm-renderer") ? d.getNamedItem("data-bm-renderer").value : d.getNamedItem("bm-renderer") ? d.getNamedItem("bm-renderer").value : getRegisteredRenderer() || "canvas";
        var v = d.getNamedItem("data-anim-loop") ? d.getNamedItem("data-anim-loop").value : d.getNamedItem("data-bm-loop") ? d.getNamedItem("data-bm-loop").value : d.getNamedItem("bm-loop") ? d.getNamedItem("bm-loop").value : "";
        v === "false" ? c.loop = !1 : v === "true" ? c.loop = !0 : v !== "" && (c.loop = parseInt(v, 10));
        var y = d.getNamedItem("data-anim-autoplay") ? d.getNamedItem("data-anim-autoplay").value : d.getNamedItem("data-bm-autoplay") ? d.getNamedItem("data-bm-autoplay").value : d.getNamedItem("bm-autoplay") ? d.getNamedItem("bm-autoplay").value : !0;
        c.autoplay = y !== "false", c.name = d.getNamedItem("data-name") ? d.getNamedItem("data-name").value : d.getNamedItem("data-bm-name") ? d.getNamedItem("data-bm-name").value : d.getNamedItem("bm-name") ? d.getNamedItem("bm-name").value : "";
        var x = d.getNamedItem("data-anim-prerender") ? d.getNamedItem("data-anim-prerender").value : d.getNamedItem("data-bm-prerender") ? d.getNamedItem("data-bm-prerender").value : d.getNamedItem("bm-prerender") ? d.getNamedItem("bm-prerender").value : "";
        x === "false" && (c.prerender = !1), c.path ? this.setParams(c) : this.trigger("destroy");
      }, AnimationItem.prototype.includeLayers = function(t) {
        t.op > this.animationData.op && (this.animationData.op = t.op, this.totalFrames = Math.floor(t.op - this.animationData.ip));
        var n = this.animationData.layers, c, d = n.length, v = t.layers, y, x = v.length;
        for (y = 0; y < x; y += 1)
          for (c = 0; c < d; ) {
            if (n[c].id === v[y].id) {
              n[c] = v[y];
              break;
            }
            c += 1;
          }
        if ((t.chars || t.fonts) && (this.renderer.globalData.fontManager.addChars(t.chars), this.renderer.globalData.fontManager.addFonts(t.fonts, this.renderer.globalData.defs)), t.assets)
          for (d = t.assets.length, c = 0; c < d; c += 1)
            this.animationData.assets.push(t.assets[c]);
        this.animationData.__complete = !1, dataManager.completeAnimation(this.animationData, this.onSegmentComplete);
      }, AnimationItem.prototype.onSegmentComplete = function(t) {
        this.animationData = t;
        var n = getExpressionsPlugin();
        n && n.initExpressions(this), this.loadNextSegment();
      }, AnimationItem.prototype.loadNextSegment = function() {
        var t = this.animationData.segments;
        if (!t || t.length === 0 || !this.autoloadSegments) {
          this.trigger("data_ready"), this.timeCompleted = this.totalFrames;
          return;
        }
        var n = t.shift();
        this.timeCompleted = n.time * this.frameRate;
        var c = this.path + this.fileName + "_" + this.segmentPos + ".json";
        this.segmentPos += 1, dataManager.loadData(c, this.includeLayers.bind(this), (function() {
          this.trigger("data_failed");
        }).bind(this));
      }, AnimationItem.prototype.loadSegments = function() {
        var t = this.animationData.segments;
        t || (this.timeCompleted = this.totalFrames), this.loadNextSegment();
      }, AnimationItem.prototype.imagesLoaded = function() {
        this.trigger("loaded_images"), this.checkLoaded();
      }, AnimationItem.prototype.preloadImages = function() {
        this.imagePreloader.setAssetsPath(this.assetsPath), this.imagePreloader.setPath(this.path), this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
      }, AnimationItem.prototype.configAnimation = function(t) {
        if (this.renderer)
          try {
            this.animationData = t, this.initialSegment ? (this.totalFrames = Math.floor(this.initialSegment[1] - this.initialSegment[0]), this.firstFrame = Math.round(this.initialSegment[0])) : (this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip), this.firstFrame = Math.round(this.animationData.ip)), this.renderer.configAnimation(t), t.assets || (t.assets = []), this.assets = this.animationData.assets, this.frameRate = this.animationData.fr, this.frameMult = this.animationData.fr / 1e3, this.renderer.searchExtraCompositions(t.assets), this.markers = markerParser(t.markers || []), this.trigger("config_ready"), this.preloadImages(), this.loadSegments(), this.updaFrameModifier(), this.waitForFontsLoaded(), this.isPaused && this.audioController.pause();
          } catch (n) {
            this.triggerConfigError(n);
          }
      }, AnimationItem.prototype.waitForFontsLoaded = function() {
        this.renderer && (this.renderer.globalData.fontManager.isLoaded ? this.checkLoaded() : setTimeout(this.waitForFontsLoaded.bind(this), 20));
      }, AnimationItem.prototype.checkLoaded = function() {
        if (!this.isLoaded && this.renderer.globalData.fontManager.isLoaded && (this.imagePreloader.loadedImages() || this.renderer.rendererType !== "canvas") && this.imagePreloader.loadedFootages()) {
          this.isLoaded = !0;
          var t = getExpressionsPlugin();
          t && t.initExpressions(this), this.renderer.initItems(), setTimeout((function() {
            this.trigger("DOMLoaded");
          }).bind(this), 0), this.gotoFrame(), this.autoplay && this.play();
        }
      }, AnimationItem.prototype.resize = function(t, n) {
        var c = typeof t == "number" ? t : void 0, d = typeof n == "number" ? n : void 0;
        this.renderer.updateContainerSize(c, d);
      }, AnimationItem.prototype.setSubframe = function(t) {
        this.isSubframeEnabled = !!t;
      }, AnimationItem.prototype.gotoFrame = function() {
        this.currentFrame = this.isSubframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame, this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted && (this.currentFrame = this.timeCompleted), this.trigger("enterFrame"), this.renderFrame(), this.trigger("drawnFrame");
      }, AnimationItem.prototype.renderFrame = function() {
        if (!(this.isLoaded === !1 || !this.renderer))
          try {
            this.expressionsPlugin && this.expressionsPlugin.resetFrame(), this.renderer.renderFrame(this.currentFrame + this.firstFrame);
          } catch (t) {
            this.triggerRenderFrameError(t);
          }
      }, AnimationItem.prototype.play = function(t) {
        t && this.name !== t || this.isPaused === !0 && (this.isPaused = !1, this.trigger("_play"), this.audioController.resume(), this._idle && (this._idle = !1, this.trigger("_active")));
      }, AnimationItem.prototype.pause = function(t) {
        t && this.name !== t || this.isPaused === !1 && (this.isPaused = !0, this.trigger("_pause"), this._idle = !0, this.trigger("_idle"), this.audioController.pause());
      }, AnimationItem.prototype.togglePause = function(t) {
        t && this.name !== t || (this.isPaused === !0 ? this.play() : this.pause());
      }, AnimationItem.prototype.stop = function(t) {
        t && this.name !== t || (this.pause(), this.playCount = 0, this._completedLoop = !1, this.setCurrentRawFrameValue(0));
      }, AnimationItem.prototype.getMarkerData = function(t) {
        for (var n, c = 0; c < this.markers.length; c += 1)
          if (n = this.markers[c], n.payload && n.payload.name === t)
            return n;
        return null;
      }, AnimationItem.prototype.goToAndStop = function(t, n, c) {
        if (!(c && this.name !== c)) {
          var d = Number(t);
          if (isNaN(d)) {
            var v = this.getMarkerData(t);
            v && this.goToAndStop(v.time, !0);
          } else n ? this.setCurrentRawFrameValue(t) : this.setCurrentRawFrameValue(t * this.frameModifier);
          this.pause();
        }
      }, AnimationItem.prototype.goToAndPlay = function(t, n, c) {
        if (!(c && this.name !== c)) {
          var d = Number(t);
          if (isNaN(d)) {
            var v = this.getMarkerData(t);
            v && (v.duration ? this.playSegments([v.time, v.time + v.duration], !0) : this.goToAndStop(v.time, !0));
          } else
            this.goToAndStop(d, n, c);
          this.play();
        }
      }, AnimationItem.prototype.advanceTime = function(t) {
        if (!(this.isPaused === !0 || this.isLoaded === !1)) {
          var n = this.currentRawFrame + t * this.frameModifier, c = !1;
          n >= this.totalFrames - 1 && this.frameModifier > 0 ? !this.loop || this.playCount === this.loop ? this.checkSegments(n > this.totalFrames ? n % this.totalFrames : 0) || (c = !0, n = this.totalFrames - 1) : n >= this.totalFrames ? (this.playCount += 1, this.checkSegments(n % this.totalFrames) || (this.setCurrentRawFrameValue(n % this.totalFrames), this._completedLoop = !0, this.trigger("loopComplete"))) : this.setCurrentRawFrameValue(n) : n < 0 ? this.checkSegments(n % this.totalFrames) || (this.loop && !(this.playCount-- <= 0 && this.loop !== !0) ? (this.setCurrentRawFrameValue(this.totalFrames + n % this.totalFrames), this._completedLoop ? this.trigger("loopComplete") : this._completedLoop = !0) : (c = !0, n = 0)) : this.setCurrentRawFrameValue(n), c && (this.setCurrentRawFrameValue(n), this.pause(), this.trigger("complete"));
        }
      }, AnimationItem.prototype.adjustSegment = function(t, n) {
        this.playCount = 0, t[1] < t[0] ? (this.frameModifier > 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(-1)), this.totalFrames = t[0] - t[1], this.timeCompleted = this.totalFrames, this.firstFrame = t[1], this.setCurrentRawFrameValue(this.totalFrames - 1e-3 - n)) : t[1] > t[0] && (this.frameModifier < 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(1)), this.totalFrames = t[1] - t[0], this.timeCompleted = this.totalFrames, this.firstFrame = t[0], this.setCurrentRawFrameValue(1e-3 + n)), this.trigger("segmentStart");
      }, AnimationItem.prototype.setSegment = function(t, n) {
        var c = -1;
        this.isPaused && (this.currentRawFrame + this.firstFrame < t ? c = t : this.currentRawFrame + this.firstFrame > n && (c = n - t)), this.firstFrame = t, this.totalFrames = n - t, this.timeCompleted = this.totalFrames, c !== -1 && this.goToAndStop(c, !0);
      }, AnimationItem.prototype.playSegments = function(t, n) {
        if (n && (this.segments.length = 0), _typeof$4(t[0]) === "object") {
          var c, d = t.length;
          for (c = 0; c < d; c += 1)
            this.segments.push(t[c]);
        } else
          this.segments.push(t);
        this.segments.length && n && this.adjustSegment(this.segments.shift(), 0), this.isPaused && this.play();
      }, AnimationItem.prototype.resetSegments = function(t) {
        this.segments.length = 0, this.segments.push([this.animationData.ip, this.animationData.op]), t && this.checkSegments(0);
      }, AnimationItem.prototype.checkSegments = function(t) {
        return this.segments.length ? (this.adjustSegment(this.segments.shift(), t), !0) : !1;
      }, AnimationItem.prototype.destroy = function(t) {
        t && this.name !== t || !this.renderer || (this.renderer.destroy(), this.imagePreloader.destroy(), this.trigger("destroy"), this._cbs = null, this.onEnterFrame = null, this.onLoopComplete = null, this.onComplete = null, this.onSegmentStart = null, this.onDestroy = null, this.renderer = null, this.expressionsPlugin = null, this.imagePreloader = null, this.projectInterface = null);
      }, AnimationItem.prototype.setCurrentRawFrameValue = function(t) {
        this.currentRawFrame = t, this.gotoFrame();
      }, AnimationItem.prototype.setSpeed = function(t) {
        this.playSpeed = t, this.updaFrameModifier();
      }, AnimationItem.prototype.setDirection = function(t) {
        this.playDirection = t < 0 ? -1 : 1, this.updaFrameModifier();
      }, AnimationItem.prototype.setLoop = function(t) {
        this.loop = t;
      }, AnimationItem.prototype.setVolume = function(t, n) {
        n && this.name !== n || this.audioController.setVolume(t);
      }, AnimationItem.prototype.getVolume = function() {
        return this.audioController.getVolume();
      }, AnimationItem.prototype.mute = function(t) {
        t && this.name !== t || this.audioController.mute();
      }, AnimationItem.prototype.unmute = function(t) {
        t && this.name !== t || this.audioController.unmute();
      }, AnimationItem.prototype.updaFrameModifier = function() {
        this.frameModifier = this.frameMult * this.playSpeed * this.playDirection, this.audioController.setRate(this.playSpeed * this.playDirection);
      }, AnimationItem.prototype.getPath = function() {
        return this.path;
      }, AnimationItem.prototype.getAssetsPath = function(t) {
        var n = "";
        if (t.e)
          n = t.p;
        else if (this.assetsPath) {
          var c = t.p;
          c.indexOf("images/") !== -1 && (c = c.split("/")[1]), n = this.assetsPath + c;
        } else
          n = this.path, n += t.u ? t.u : "", n += t.p;
        return n;
      }, AnimationItem.prototype.getAssetData = function(t) {
        for (var n = 0, c = this.assets.length; n < c; ) {
          if (t === this.assets[n].id)
            return this.assets[n];
          n += 1;
        }
        return null;
      }, AnimationItem.prototype.hide = function() {
        this.renderer.hide();
      }, AnimationItem.prototype.show = function() {
        this.renderer.show();
      }, AnimationItem.prototype.getDuration = function(t) {
        return t ? this.totalFrames : this.totalFrames / this.frameRate;
      }, AnimationItem.prototype.updateDocumentData = function(t, n, c) {
        try {
          var d = this.renderer.getElementByPath(t);
          d.updateDocumentData(n, c);
        } catch {
        }
      }, AnimationItem.prototype.trigger = function(t) {
        if (this._cbs && this._cbs[t])
          switch (t) {
            case "enterFrame":
              this.triggerEvent(t, new BMEnterFrameEvent(t, this.currentFrame, this.totalFrames, this.frameModifier));
              break;
            case "drawnFrame":
              this.drawnFrameEvent.currentTime = this.currentFrame, this.drawnFrameEvent.totalTime = this.totalFrames, this.drawnFrameEvent.direction = this.frameModifier, this.triggerEvent(t, this.drawnFrameEvent);
              break;
            case "loopComplete":
              this.triggerEvent(t, new BMCompleteLoopEvent(t, this.loop, this.playCount, this.frameMult));
              break;
            case "complete":
              this.triggerEvent(t, new BMCompleteEvent(t, this.frameMult));
              break;
            case "segmentStart":
              this.triggerEvent(t, new BMSegmentStartEvent(t, this.firstFrame, this.totalFrames));
              break;
            case "destroy":
              this.triggerEvent(t, new BMDestroyEvent(t, this));
              break;
            default:
              this.triggerEvent(t);
          }
        t === "enterFrame" && this.onEnterFrame && this.onEnterFrame.call(this, new BMEnterFrameEvent(t, this.currentFrame, this.totalFrames, this.frameMult)), t === "loopComplete" && this.onLoopComplete && this.onLoopComplete.call(this, new BMCompleteLoopEvent(t, this.loop, this.playCount, this.frameMult)), t === "complete" && this.onComplete && this.onComplete.call(this, new BMCompleteEvent(t, this.frameMult)), t === "segmentStart" && this.onSegmentStart && this.onSegmentStart.call(this, new BMSegmentStartEvent(t, this.firstFrame, this.totalFrames)), t === "destroy" && this.onDestroy && this.onDestroy.call(this, new BMDestroyEvent(t, this));
      }, AnimationItem.prototype.triggerRenderFrameError = function(t) {
        var n = new BMRenderFrameErrorEvent(t, this.currentFrame);
        this.triggerEvent("error", n), this.onError && this.onError.call(this, n);
      }, AnimationItem.prototype.triggerConfigError = function(t) {
        var n = new BMConfigErrorEvent(t, this.currentFrame);
        this.triggerEvent("error", n), this.onError && this.onError.call(this, n);
      };
      var animationManager = (function() {
        var t = {}, n = [], c = 0, d = 0, v = 0, y = !0, x = !1;
        function w(B) {
          for (var G = 0, N = B.target; G < d; )
            n[G].animation === N && (n.splice(G, 1), G -= 1, d -= 1, N.isPaused || F()), G += 1;
        }
        function k(B, G) {
          if (!B)
            return null;
          for (var N = 0; N < d; ) {
            if (n[N].elem === B && n[N].elem !== null)
              return n[N].animation;
            N += 1;
          }
          var V = new AnimationItem();
          return S(V, B), V.setData(B, G), V;
        }
        function C() {
          var B, G = n.length, N = [];
          for (B = 0; B < G; B += 1)
            N.push(n[B].animation);
          return N;
        }
        function P() {
          v += 1, X();
        }
        function F() {
          v -= 1;
        }
        function S(B, G) {
          B.addEventListener("destroy", w), B.addEventListener("_active", P), B.addEventListener("_idle", F), n.push({
            elem: G,
            animation: B
          }), d += 1;
        }
        function j(B) {
          var G = new AnimationItem();
          return S(G, null), G.setParams(B), G;
        }
        function T(B, G) {
          var N;
          for (N = 0; N < d; N += 1)
            n[N].animation.setSpeed(B, G);
        }
        function A(B, G) {
          var N;
          for (N = 0; N < d; N += 1)
            n[N].animation.setDirection(B, G);
        }
        function R(B) {
          var G;
          for (G = 0; G < d; G += 1)
            n[G].animation.play(B);
        }
        function M(B) {
          var G = B - c, N;
          for (N = 0; N < d; N += 1)
            n[N].animation.advanceTime(G);
          c = B, v && !x ? window.requestAnimationFrame(M) : y = !0;
        }
        function _(B) {
          c = B, window.requestAnimationFrame(M);
        }
        function E(B) {
          var G;
          for (G = 0; G < d; G += 1)
            n[G].animation.pause(B);
        }
        function I(B, G, N) {
          var V;
          for (V = 0; V < d; V += 1)
            n[V].animation.goToAndStop(B, G, N);
        }
        function L(B) {
          var G;
          for (G = 0; G < d; G += 1)
            n[G].animation.stop(B);
        }
        function D(B) {
          var G;
          for (G = 0; G < d; G += 1)
            n[G].animation.togglePause(B);
        }
        function O(B) {
          var G;
          for (G = d - 1; G >= 0; G -= 1)
            n[G].animation.destroy(B);
        }
        function z(B, G, N) {
          var V = [].concat([].slice.call(document.getElementsByClassName("lottie")), [].slice.call(document.getElementsByClassName("bodymovin"))), H, $ = V.length;
          for (H = 0; H < $; H += 1)
            N && V[H].setAttribute("data-bm-type", N), k(V[H], B);
          if (G && $ === 0) {
            N || (N = "svg");
            var J = document.getElementsByTagName("body")[0];
            J.innerText = "";
            var ee = createTag("div");
            ee.style.width = "100%", ee.style.height = "100%", ee.setAttribute("data-bm-type", N), J.appendChild(ee), k(ee, B);
          }
        }
        function W() {
          var B;
          for (B = 0; B < d; B += 1)
            n[B].animation.resize();
        }
        function X() {
          !x && v && y && (window.requestAnimationFrame(_), y = !1);
        }
        function K() {
          x = !0;
        }
        function Y() {
          x = !1, X();
        }
        function U(B, G) {
          var N;
          for (N = 0; N < d; N += 1)
            n[N].animation.setVolume(B, G);
        }
        function Z(B) {
          var G;
          for (G = 0; G < d; G += 1)
            n[G].animation.mute(B);
        }
        function q(B) {
          var G;
          for (G = 0; G < d; G += 1)
            n[G].animation.unmute(B);
        }
        return t.registerAnimation = k, t.loadAnimation = j, t.setSpeed = T, t.setDirection = A, t.play = R, t.pause = E, t.stop = L, t.togglePause = D, t.searchAnimations = z, t.resize = W, t.goToAndStop = I, t.destroy = O, t.freeze = K, t.unfreeze = Y, t.setVolume = U, t.mute = Z, t.unmute = q, t.getRegisteredAnimations = C, t;
      })(), BezierFactory = (function() {
        var t = {};
        t.getBezierEasing = c;
        var n = {};
        function c(_, E, I, L, D) {
          var O = D || ("bez_" + _ + "_" + E + "_" + I + "_" + L).replace(/\./g, "p");
          if (n[O])
            return n[O];
          var z = new M([_, E, I, L]);
          return n[O] = z, z;
        }
        var d = 4, v = 1e-3, y = 1e-7, x = 10, w = 11, k = 1 / (w - 1), C = typeof Float32Array == "function";
        function P(_, E) {
          return 1 - 3 * E + 3 * _;
        }
        function F(_, E) {
          return 3 * E - 6 * _;
        }
        function S(_) {
          return 3 * _;
        }
        function j(_, E, I) {
          return ((P(E, I) * _ + F(E, I)) * _ + S(E)) * _;
        }
        function T(_, E, I) {
          return 3 * P(E, I) * _ * _ + 2 * F(E, I) * _ + S(E);
        }
        function A(_, E, I, L, D) {
          var O, z, W = 0;
          do
            z = E + (I - E) / 2, O = j(z, L, D) - _, O > 0 ? I = z : E = z;
          while (Math.abs(O) > y && ++W < x);
          return z;
        }
        function R(_, E, I, L) {
          for (var D = 0; D < d; ++D) {
            var O = T(E, I, L);
            if (O === 0) return E;
            var z = j(E, I, L) - _;
            E -= z / O;
          }
          return E;
        }
        function M(_) {
          this._p = _, this._mSampleValues = C ? new Float32Array(w) : new Array(w), this._precomputed = !1, this.get = this.get.bind(this);
        }
        return M.prototype = {
          get: function(E) {
            var I = this._p[0], L = this._p[1], D = this._p[2], O = this._p[3];
            return this._precomputed || this._precompute(), I === L && D === O ? E : E === 0 ? 0 : E === 1 ? 1 : j(this._getTForX(E), L, O);
          },
          // Private part
          _precompute: function() {
            var E = this._p[0], I = this._p[1], L = this._p[2], D = this._p[3];
            this._precomputed = !0, (E !== I || L !== D) && this._calcSampleValues();
          },
          _calcSampleValues: function() {
            for (var E = this._p[0], I = this._p[2], L = 0; L < w; ++L)
              this._mSampleValues[L] = j(L * k, E, I);
          },
          /**
               * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
               */
          _getTForX: function(E) {
            for (var I = this._p[0], L = this._p[2], D = this._mSampleValues, O = 0, z = 1, W = w - 1; z !== W && D[z] <= E; ++z)
              O += k;
            --z;
            var X = (E - D[z]) / (D[z + 1] - D[z]), K = O + X * k, Y = T(K, I, L);
            return Y >= v ? R(E, K, I, L) : Y === 0 ? K : A(E, O, O + k, I, L);
          }
        }, t;
      })(), pooling = /* @__PURE__ */ (function() {
        function t(n) {
          return n.concat(createSizedArray(n.length));
        }
        return {
          double: t
        };
      })(), poolFactory = /* @__PURE__ */ (function() {
        return function(t, n, c) {
          var d = 0, v = t, y = createSizedArray(v), x = {
            newElement: w,
            release: k
          };
          function w() {
            var C;
            return d ? (d -= 1, C = y[d]) : C = n(), C;
          }
          function k(C) {
            d === v && (y = pooling.double(y), v *= 2), c && c(C), y[d] = C, d += 1;
          }
          return x;
        };
      })(), bezierLengthPool = (function() {
        function t() {
          return {
            addedLength: 0,
            percents: createTypedArray("float32", getDefaultCurveSegments()),
            lengths: createTypedArray("float32", getDefaultCurveSegments())
          };
        }
        return poolFactory(8, t);
      })(), segmentsLengthPool = (function() {
        function t() {
          return {
            lengths: [],
            totalLength: 0
          };
        }
        function n(c) {
          var d, v = c.lengths.length;
          for (d = 0; d < v; d += 1)
            bezierLengthPool.release(c.lengths[d]);
          c.lengths.length = 0;
        }
        return poolFactory(8, t, n);
      })();
      function bezFunction() {
        var t = Math;
        function n(S, j, T, A, R, M) {
          var _ = S * A + j * R + T * M - R * A - M * S - T * j;
          return _ > -1e-3 && _ < 1e-3;
        }
        function c(S, j, T, A, R, M, _, E, I) {
          if (T === 0 && M === 0 && I === 0)
            return n(S, j, A, R, _, E);
          var L = t.sqrt(t.pow(A - S, 2) + t.pow(R - j, 2) + t.pow(M - T, 2)), D = t.sqrt(t.pow(_ - S, 2) + t.pow(E - j, 2) + t.pow(I - T, 2)), O = t.sqrt(t.pow(_ - A, 2) + t.pow(E - R, 2) + t.pow(I - M, 2)), z;
          return L > D ? L > O ? z = L - D - O : z = O - D - L : O > D ? z = O - D - L : z = D - L - O, z > -1e-4 && z < 1e-4;
        }
        var d = /* @__PURE__ */ (function() {
          return function(S, j, T, A) {
            var R = getDefaultCurveSegments(), M, _, E, I, L, D = 0, O, z = [], W = [], X = bezierLengthPool.newElement();
            for (E = T.length, M = 0; M < R; M += 1) {
              for (L = M / (R - 1), O = 0, _ = 0; _ < E; _ += 1)
                I = bmPow(1 - L, 3) * S[_] + 3 * bmPow(1 - L, 2) * L * T[_] + 3 * (1 - L) * bmPow(L, 2) * A[_] + bmPow(L, 3) * j[_], z[_] = I, W[_] !== null && (O += bmPow(z[_] - W[_], 2)), W[_] = z[_];
              O && (O = bmSqrt(O), D += O), X.percents[M] = L, X.lengths[M] = D;
            }
            return X.addedLength = D, X;
          };
        })();
        function v(S) {
          var j = segmentsLengthPool.newElement(), T = S.c, A = S.v, R = S.o, M = S.i, _, E = S._length, I = j.lengths, L = 0;
          for (_ = 0; _ < E - 1; _ += 1)
            I[_] = d(A[_], A[_ + 1], R[_], M[_ + 1]), L += I[_].addedLength;
          return T && E && (I[_] = d(A[_], A[0], R[_], M[0]), L += I[_].addedLength), j.totalLength = L, j;
        }
        function y(S) {
          this.segmentLength = 0, this.points = new Array(S);
        }
        function x(S, j) {
          this.partialLength = S, this.point = j;
        }
        var w = /* @__PURE__ */ (function() {
          var S = {};
          return function(j, T, A, R) {
            var M = (j[0] + "_" + j[1] + "_" + T[0] + "_" + T[1] + "_" + A[0] + "_" + A[1] + "_" + R[0] + "_" + R[1]).replace(/\./g, "p");
            if (!S[M]) {
              var _ = getDefaultCurveSegments(), E, I, L, D, O, z = 0, W, X, K = null;
              j.length === 2 && (j[0] !== T[0] || j[1] !== T[1]) && n(j[0], j[1], T[0], T[1], j[0] + A[0], j[1] + A[1]) && n(j[0], j[1], T[0], T[1], T[0] + R[0], T[1] + R[1]) && (_ = 2);
              var Y = new y(_);
              for (L = A.length, E = 0; E < _; E += 1) {
                for (X = createSizedArray(L), O = E / (_ - 1), W = 0, I = 0; I < L; I += 1)
                  D = bmPow(1 - O, 3) * j[I] + 3 * bmPow(1 - O, 2) * O * (j[I] + A[I]) + 3 * (1 - O) * bmPow(O, 2) * (T[I] + R[I]) + bmPow(O, 3) * T[I], X[I] = D, K !== null && (W += bmPow(X[I] - K[I], 2));
                W = bmSqrt(W), z += W, Y.points[E] = new x(W, X), K = X;
              }
              Y.segmentLength = z, S[M] = Y;
            }
            return S[M];
          };
        })();
        function k(S, j) {
          var T = j.percents, A = j.lengths, R = T.length, M = bmFloor((R - 1) * S), _ = S * j.addedLength, E = 0;
          if (M === R - 1 || M === 0 || _ === A[M])
            return T[M];
          for (var I = A[M] > _ ? -1 : 1, L = !0; L; )
            if (A[M] <= _ && A[M + 1] > _ ? (E = (_ - A[M]) / (A[M + 1] - A[M]), L = !1) : M += I, M < 0 || M >= R - 1) {
              if (M === R - 1)
                return T[M];
              L = !1;
            }
          return T[M] + (T[M + 1] - T[M]) * E;
        }
        function C(S, j, T, A, R, M) {
          var _ = k(R, M), E = 1 - _, I = t.round((E * E * E * S[0] + (_ * E * E + E * _ * E + E * E * _) * T[0] + (_ * _ * E + E * _ * _ + _ * E * _) * A[0] + _ * _ * _ * j[0]) * 1e3) / 1e3, L = t.round((E * E * E * S[1] + (_ * E * E + E * _ * E + E * E * _) * T[1] + (_ * _ * E + E * _ * _ + _ * E * _) * A[1] + _ * _ * _ * j[1]) * 1e3) / 1e3;
          return [I, L];
        }
        var P = createTypedArray("float32", 8);
        function F(S, j, T, A, R, M, _) {
          R < 0 ? R = 0 : R > 1 && (R = 1);
          var E = k(R, _);
          M = M > 1 ? 1 : M;
          var I = k(M, _), L, D = S.length, O = 1 - E, z = 1 - I, W = O * O * O, X = E * O * O * 3, K = E * E * O * 3, Y = E * E * E, U = O * O * z, Z = E * O * z + O * E * z + O * O * I, q = E * E * z + O * E * I + E * O * I, B = E * E * I, G = O * z * z, N = E * z * z + O * I * z + O * z * I, V = E * I * z + O * I * I + E * z * I, H = E * I * I, $ = z * z * z, J = I * z * z + z * I * z + z * z * I, ee = I * I * z + z * I * I + I * z * I, te = I * I * I;
          for (L = 0; L < D; L += 1)
            P[L * 4] = t.round((W * S[L] + X * T[L] + K * A[L] + Y * j[L]) * 1e3) / 1e3, P[L * 4 + 1] = t.round((U * S[L] + Z * T[L] + q * A[L] + B * j[L]) * 1e3) / 1e3, P[L * 4 + 2] = t.round((G * S[L] + N * T[L] + V * A[L] + H * j[L]) * 1e3) / 1e3, P[L * 4 + 3] = t.round(($ * S[L] + J * T[L] + ee * A[L] + te * j[L]) * 1e3) / 1e3;
          return P;
        }
        return {
          getSegmentsLength: v,
          getNewSegment: F,
          getPointInSegment: C,
          buildBezierData: w,
          pointOnLine2D: n,
          pointOnLine3D: c
        };
      }
      var bez = bezFunction(), initFrame = initialDefaultFrame, mathAbs = Math.abs;
      function interpolateValue(t, n) {
        var c = this.offsetTime, d;
        this.propType === "multidimensional" && (d = createTypedArray("float32", this.pv.length));
        for (var v = n.lastIndex, y = v, x = this.keyframes.length - 1, w = !0, k, C, P; w; ) {
          if (k = this.keyframes[y], C = this.keyframes[y + 1], y === x - 1 && t >= C.t - c) {
            k.h && (k = C), v = 0;
            break;
          }
          if (C.t - c > t) {
            v = y;
            break;
          }
          y < x - 1 ? y += 1 : (v = 0, w = !1);
        }
        P = this.keyframesMetadata[y] || {};
        var F, S, j, T, A, R, M = C.t - c, _ = k.t - c, E;
        if (k.to) {
          P.bezierData || (P.bezierData = bez.buildBezierData(k.s, C.s || k.e, k.to, k.ti));
          var I = P.bezierData;
          if (t >= M || t < _) {
            var L = t >= M ? I.points.length - 1 : 0;
            for (S = I.points[L].point.length, F = 0; F < S; F += 1)
              d[F] = I.points[L].point[F];
          } else {
            P.__fnct ? R = P.__fnct : (R = BezierFactory.getBezierEasing(k.o.x, k.o.y, k.i.x, k.i.y, k.n).get, P.__fnct = R), j = R((t - _) / (M - _));
            var D = I.segmentLength * j, O, z = n.lastFrame < t && n._lastKeyframeIndex === y ? n._lastAddedLength : 0;
            for (A = n.lastFrame < t && n._lastKeyframeIndex === y ? n._lastPoint : 0, w = !0, T = I.points.length; w; ) {
              if (z += I.points[A].partialLength, D === 0 || j === 0 || A === I.points.length - 1) {
                for (S = I.points[A].point.length, F = 0; F < S; F += 1)
                  d[F] = I.points[A].point[F];
                break;
              } else if (D >= z && D < z + I.points[A + 1].partialLength) {
                for (O = (D - z) / I.points[A + 1].partialLength, S = I.points[A].point.length, F = 0; F < S; F += 1)
                  d[F] = I.points[A].point[F] + (I.points[A + 1].point[F] - I.points[A].point[F]) * O;
                break;
              }
              A < T - 1 ? A += 1 : w = !1;
            }
            n._lastPoint = A, n._lastAddedLength = z - I.points[A].partialLength, n._lastKeyframeIndex = y;
          }
        } else {
          var W, X, K, Y, U;
          if (x = k.s.length, E = C.s || k.e, this.sh && k.h !== 1)
            if (t >= M)
              d[0] = E[0], d[1] = E[1], d[2] = E[2];
            else if (t <= _)
              d[0] = k.s[0], d[1] = k.s[1], d[2] = k.s[2];
            else {
              var Z = createQuaternion(k.s), q = createQuaternion(E), B = (t - _) / (M - _);
              quaternionToEuler(d, slerp(Z, q, B));
            }
          else
            for (y = 0; y < x; y += 1)
              k.h !== 1 && (t >= M ? j = 1 : t < _ ? j = 0 : (k.o.x.constructor === Array ? (P.__fnct || (P.__fnct = []), P.__fnct[y] ? R = P.__fnct[y] : (W = k.o.x[y] === void 0 ? k.o.x[0] : k.o.x[y], X = k.o.y[y] === void 0 ? k.o.y[0] : k.o.y[y], K = k.i.x[y] === void 0 ? k.i.x[0] : k.i.x[y], Y = k.i.y[y] === void 0 ? k.i.y[0] : k.i.y[y], R = BezierFactory.getBezierEasing(W, X, K, Y).get, P.__fnct[y] = R)) : P.__fnct ? R = P.__fnct : (W = k.o.x, X = k.o.y, K = k.i.x, Y = k.i.y, R = BezierFactory.getBezierEasing(W, X, K, Y).get, k.keyframeMetadata = R), j = R((t - _) / (M - _)))), E = C.s || k.e, U = k.h === 1 ? k.s[y] : k.s[y] + (E[y] - k.s[y]) * j, this.propType === "multidimensional" ? d[y] = U : d = U;
        }
        return n.lastIndex = v, d;
      }
      function slerp(t, n, c) {
        var d = [], v = t[0], y = t[1], x = t[2], w = t[3], k = n[0], C = n[1], P = n[2], F = n[3], S, j, T, A, R;
        return j = v * k + y * C + x * P + w * F, j < 0 && (j = -j, k = -k, C = -C, P = -P, F = -F), 1 - j > 1e-6 ? (S = Math.acos(j), T = Math.sin(S), A = Math.sin((1 - c) * S) / T, R = Math.sin(c * S) / T) : (A = 1 - c, R = c), d[0] = A * v + R * k, d[1] = A * y + R * C, d[2] = A * x + R * P, d[3] = A * w + R * F, d;
      }
      function quaternionToEuler(t, n) {
        var c = n[0], d = n[1], v = n[2], y = n[3], x = Math.atan2(2 * d * y - 2 * c * v, 1 - 2 * d * d - 2 * v * v), w = Math.asin(2 * c * d + 2 * v * y), k = Math.atan2(2 * c * y - 2 * d * v, 1 - 2 * c * c - 2 * v * v);
        t[0] = x / degToRads, t[1] = w / degToRads, t[2] = k / degToRads;
      }
      function createQuaternion(t) {
        var n = t[0] * degToRads, c = t[1] * degToRads, d = t[2] * degToRads, v = Math.cos(n / 2), y = Math.cos(c / 2), x = Math.cos(d / 2), w = Math.sin(n / 2), k = Math.sin(c / 2), C = Math.sin(d / 2), P = v * y * x - w * k * C, F = w * k * x + v * y * C, S = w * y * x + v * k * C, j = v * k * x - w * y * C;
        return [F, S, j, P];
      }
      function getValueAtCurrentTime() {
        var t = this.comp.renderedFrame - this.offsetTime, n = this.keyframes[0].t - this.offsetTime, c = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
        if (!(t === this._caching.lastFrame || this._caching.lastFrame !== initFrame && (this._caching.lastFrame >= c && t >= c || this._caching.lastFrame < n && t < n))) {
          this._caching.lastFrame >= t && (this._caching._lastKeyframeIndex = -1, this._caching.lastIndex = 0);
          var d = this.interpolateValue(t, this._caching);
          this.pv = d;
        }
        return this._caching.lastFrame = t, this.pv;
      }
      function setVValue(t) {
        var n;
        if (this.propType === "unidimensional")
          n = t * this.mult, mathAbs(this.v - n) > 1e-5 && (this.v = n, this._mdf = !0);
        else
          for (var c = 0, d = this.v.length; c < d; )
            n = t[c] * this.mult, mathAbs(this.v[c] - n) > 1e-5 && (this.v[c] = n, this._mdf = !0), c += 1;
      }
      function processEffectsSequence() {
        if (!(this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length)) {
          if (this.lock) {
            this.setVValue(this.pv);
            return;
          }
          this.lock = !0, this._mdf = this._isFirstFrame;
          var t, n = this.effectsSequence.length, c = this.kf ? this.pv : this.data.k;
          for (t = 0; t < n; t += 1)
            c = this.effectsSequence[t](c);
          this.setVValue(c), this._isFirstFrame = !1, this.lock = !1, this.frameId = this.elem.globalData.frameId;
        }
      }
      function addEffect(t) {
        this.effectsSequence.push(t), this.container.addDynamicProperty(this);
      }
      function ValueProperty(t, n, c, d) {
        this.propType = "unidimensional", this.mult = c || 1, this.data = n, this.v = c ? n.k * c : n.k, this.pv = n.k, this._mdf = !1, this.elem = t, this.container = d, this.comp = t.comp, this.k = !1, this.kf = !1, this.vel = 0, this.effectsSequence = [], this._isFirstFrame = !0, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
      }
      function MultiDimensionalProperty(t, n, c, d) {
        this.propType = "multidimensional", this.mult = c || 1, this.data = n, this._mdf = !1, this.elem = t, this.container = d, this.comp = t.comp, this.k = !1, this.kf = !1, this.frameId = -1;
        var v, y = n.k.length;
        for (this.v = createTypedArray("float32", y), this.pv = createTypedArray("float32", y), this.vel = createTypedArray("float32", y), v = 0; v < y; v += 1)
          this.v[v] = n.k[v] * this.mult, this.pv[v] = n.k[v];
        this._isFirstFrame = !0, this.effectsSequence = [], this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
      }
      function KeyframedValueProperty(t, n, c, d) {
        this.propType = "unidimensional", this.keyframes = n.k, this.keyframesMetadata = [], this.offsetTime = t.data.st, this.frameId = -1, this._caching = {
          lastFrame: initFrame,
          lastIndex: 0,
          value: 0,
          _lastKeyframeIndex: -1
        }, this.k = !0, this.kf = !0, this.data = n, this.mult = c || 1, this.elem = t, this.container = d, this.comp = t.comp, this.v = initFrame, this.pv = initFrame, this._isFirstFrame = !0, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.addEffect = addEffect;
      }
      function KeyframedMultidimensionalProperty(t, n, c, d) {
        this.propType = "multidimensional";
        var v, y = n.k.length, x, w, k, C;
        for (v = 0; v < y - 1; v += 1)
          n.k[v].to && n.k[v].s && n.k[v + 1] && n.k[v + 1].s && (x = n.k[v].s, w = n.k[v + 1].s, k = n.k[v].to, C = n.k[v].ti, (x.length === 2 && !(x[0] === w[0] && x[1] === w[1]) && bez.pointOnLine2D(x[0], x[1], w[0], w[1], x[0] + k[0], x[1] + k[1]) && bez.pointOnLine2D(x[0], x[1], w[0], w[1], w[0] + C[0], w[1] + C[1]) || x.length === 3 && !(x[0] === w[0] && x[1] === w[1] && x[2] === w[2]) && bez.pointOnLine3D(x[0], x[1], x[2], w[0], w[1], w[2], x[0] + k[0], x[1] + k[1], x[2] + k[2]) && bez.pointOnLine3D(x[0], x[1], x[2], w[0], w[1], w[2], w[0] + C[0], w[1] + C[1], w[2] + C[2])) && (n.k[v].to = null, n.k[v].ti = null), x[0] === w[0] && x[1] === w[1] && k[0] === 0 && k[1] === 0 && C[0] === 0 && C[1] === 0 && (x.length === 2 || x[2] === w[2] && k[2] === 0 && C[2] === 0) && (n.k[v].to = null, n.k[v].ti = null));
        this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.data = n, this.keyframes = n.k, this.keyframesMetadata = [], this.offsetTime = t.data.st, this.k = !0, this.kf = !0, this._isFirstFrame = !0, this.mult = c || 1, this.elem = t, this.container = d, this.comp = t.comp, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.frameId = -1;
        var P = n.k[0].s.length;
        for (this.v = createTypedArray("float32", P), this.pv = createTypedArray("float32", P), v = 0; v < P; v += 1)
          this.v[v] = initFrame, this.pv[v] = initFrame;
        this._caching = {
          lastFrame: initFrame,
          lastIndex: 0,
          value: createTypedArray("float32", P)
        }, this.addEffect = addEffect;
      }
      var PropertyFactory = /* @__PURE__ */ (function() {
        function t(c, d, v, y, x) {
          d.sid && (d = c.globalData.slotManager.getProp(d));
          var w;
          if (!d.k.length)
            w = new ValueProperty(c, d, y, x);
          else if (typeof d.k[0] == "number")
            w = new MultiDimensionalProperty(c, d, y, x);
          else
            switch (v) {
              case 0:
                w = new KeyframedValueProperty(c, d, y, x);
                break;
              case 1:
                w = new KeyframedMultidimensionalProperty(c, d, y, x);
                break;
            }
          return w.effectsSequence.length && x.addDynamicProperty(w), w;
        }
        var n = {
          getProp: t
        };
        return n;
      })();
      function DynamicPropertyContainer() {
      }
      DynamicPropertyContainer.prototype = {
        addDynamicProperty: function(n) {
          this.dynamicProperties.indexOf(n) === -1 && (this.dynamicProperties.push(n), this.container.addDynamicProperty(this), this._isAnimated = !0);
        },
        iterateDynamicProperties: function() {
          this._mdf = !1;
          var n, c = this.dynamicProperties.length;
          for (n = 0; n < c; n += 1)
            this.dynamicProperties[n].getValue(), this.dynamicProperties[n]._mdf && (this._mdf = !0);
        },
        initDynamicPropertyContainer: function(n) {
          this.container = n, this.dynamicProperties = [], this._mdf = !1, this._isAnimated = !1;
        }
      };
      var pointPool = (function() {
        function t() {
          return createTypedArray("float32", 2);
        }
        return poolFactory(8, t);
      })();
      function ShapePath() {
        this.c = !1, this._length = 0, this._maxLength = 8, this.v = createSizedArray(this._maxLength), this.o = createSizedArray(this._maxLength), this.i = createSizedArray(this._maxLength);
      }
      ShapePath.prototype.setPathData = function(t, n) {
        this.c = t, this.setLength(n);
        for (var c = 0; c < n; )
          this.v[c] = pointPool.newElement(), this.o[c] = pointPool.newElement(), this.i[c] = pointPool.newElement(), c += 1;
      }, ShapePath.prototype.setLength = function(t) {
        for (; this._maxLength < t; )
          this.doubleArrayLength();
        this._length = t;
      }, ShapePath.prototype.doubleArrayLength = function() {
        this.v = this.v.concat(createSizedArray(this._maxLength)), this.i = this.i.concat(createSizedArray(this._maxLength)), this.o = this.o.concat(createSizedArray(this._maxLength)), this._maxLength *= 2;
      }, ShapePath.prototype.setXYAt = function(t, n, c, d, v) {
        var y;
        switch (this._length = Math.max(this._length, d + 1), this._length >= this._maxLength && this.doubleArrayLength(), c) {
          case "v":
            y = this.v;
            break;
          case "i":
            y = this.i;
            break;
          case "o":
            y = this.o;
            break;
          default:
            y = [];
            break;
        }
        (!y[d] || y[d] && !v) && (y[d] = pointPool.newElement()), y[d][0] = t, y[d][1] = n;
      }, ShapePath.prototype.setTripleAt = function(t, n, c, d, v, y, x, w) {
        this.setXYAt(t, n, "v", x, w), this.setXYAt(c, d, "o", x, w), this.setXYAt(v, y, "i", x, w);
      }, ShapePath.prototype.reverse = function() {
        var t = new ShapePath();
        t.setPathData(this.c, this._length);
        var n = this.v, c = this.o, d = this.i, v = 0;
        this.c && (t.setTripleAt(n[0][0], n[0][1], d[0][0], d[0][1], c[0][0], c[0][1], 0, !1), v = 1);
        var y = this._length - 1, x = this._length, w;
        for (w = v; w < x; w += 1)
          t.setTripleAt(n[y][0], n[y][1], d[y][0], d[y][1], c[y][0], c[y][1], w, !1), y -= 1;
        return t;
      }, ShapePath.prototype.length = function() {
        return this._length;
      };
      var shapePool = (function() {
        function t() {
          return new ShapePath();
        }
        function n(v) {
          var y = v._length, x;
          for (x = 0; x < y; x += 1)
            pointPool.release(v.v[x]), pointPool.release(v.i[x]), pointPool.release(v.o[x]), v.v[x] = null, v.i[x] = null, v.o[x] = null;
          v._length = 0, v.c = !1;
        }
        function c(v) {
          var y = d.newElement(), x, w = v._length === void 0 ? v.v.length : v._length;
          for (y.setLength(w), y.c = v.c, x = 0; x < w; x += 1)
            y.setTripleAt(v.v[x][0], v.v[x][1], v.o[x][0], v.o[x][1], v.i[x][0], v.i[x][1], x);
          return y;
        }
        var d = poolFactory(4, t, n);
        return d.clone = c, d;
      })();
      function ShapeCollection() {
        this._length = 0, this._maxLength = 4, this.shapes = createSizedArray(this._maxLength);
      }
      ShapeCollection.prototype.addShape = function(t) {
        this._length === this._maxLength && (this.shapes = this.shapes.concat(createSizedArray(this._maxLength)), this._maxLength *= 2), this.shapes[this._length] = t, this._length += 1;
      }, ShapeCollection.prototype.releaseShapes = function() {
        var t;
        for (t = 0; t < this._length; t += 1)
          shapePool.release(this.shapes[t]);
        this._length = 0;
      };
      var shapeCollectionPool = (function() {
        var t = {
          newShapeCollection: v,
          release: y
        }, n = 0, c = 4, d = createSizedArray(c);
        function v() {
          var x;
          return n ? (n -= 1, x = d[n]) : x = new ShapeCollection(), x;
        }
        function y(x) {
          var w, k = x._length;
          for (w = 0; w < k; w += 1)
            shapePool.release(x.shapes[w]);
          x._length = 0, n === c && (d = pooling.double(d), c *= 2), d[n] = x, n += 1;
        }
        return t;
      })(), ShapePropertyFactory = (function() {
        var t = -999999;
        function n(M, _, E) {
          var I = E.lastIndex, L, D, O, z, W, X, K, Y, U, Z = this.keyframes;
          if (M < Z[0].t - this.offsetTime)
            L = Z[0].s[0], O = !0, I = 0;
          else if (M >= Z[Z.length - 1].t - this.offsetTime)
            L = Z[Z.length - 1].s ? Z[Z.length - 1].s[0] : Z[Z.length - 2].e[0], O = !0;
          else {
            for (var q = I, B = Z.length - 1, G = !0, N, V, H; G && (N = Z[q], V = Z[q + 1], !(V.t - this.offsetTime > M)); )
              q < B - 1 ? q += 1 : G = !1;
            if (H = this.keyframesMetadata[q] || {}, O = N.h === 1, I = q, !O) {
              if (M >= V.t - this.offsetTime)
                Y = 1;
              else if (M < N.t - this.offsetTime)
                Y = 0;
              else {
                var $;
                H.__fnct ? $ = H.__fnct : ($ = BezierFactory.getBezierEasing(N.o.x, N.o.y, N.i.x, N.i.y).get, H.__fnct = $), Y = $((M - (N.t - this.offsetTime)) / (V.t - this.offsetTime - (N.t - this.offsetTime)));
              }
              D = V.s ? V.s[0] : N.e[0];
            }
            L = N.s[0];
          }
          for (X = _._length, K = L.i[0].length, E.lastIndex = I, z = 0; z < X; z += 1)
            for (W = 0; W < K; W += 1)
              U = O ? L.i[z][W] : L.i[z][W] + (D.i[z][W] - L.i[z][W]) * Y, _.i[z][W] = U, U = O ? L.o[z][W] : L.o[z][W] + (D.o[z][W] - L.o[z][W]) * Y, _.o[z][W] = U, U = O ? L.v[z][W] : L.v[z][W] + (D.v[z][W] - L.v[z][W]) * Y, _.v[z][W] = U;
        }
        function c() {
          var M = this.comp.renderedFrame - this.offsetTime, _ = this.keyframes[0].t - this.offsetTime, E = this.keyframes[this.keyframes.length - 1].t - this.offsetTime, I = this._caching.lastFrame;
          return I !== t && (I < _ && M < _ || I > E && M > E) || (this._caching.lastIndex = I < M ? this._caching.lastIndex : 0, this.interpolateShape(M, this.pv, this._caching)), this._caching.lastFrame = M, this.pv;
        }
        function d() {
          this.paths = this.localShapeCollection;
        }
        function v(M, _) {
          if (M._length !== _._length || M.c !== _.c)
            return !1;
          var E, I = M._length;
          for (E = 0; E < I; E += 1)
            if (M.v[E][0] !== _.v[E][0] || M.v[E][1] !== _.v[E][1] || M.o[E][0] !== _.o[E][0] || M.o[E][1] !== _.o[E][1] || M.i[E][0] !== _.i[E][0] || M.i[E][1] !== _.i[E][1])
              return !1;
          return !0;
        }
        function y(M) {
          v(this.v, M) || (this.v = shapePool.clone(M), this.localShapeCollection.releaseShapes(), this.localShapeCollection.addShape(this.v), this._mdf = !0, this.paths = this.localShapeCollection);
        }
        function x() {
          if (this.elem.globalData.frameId !== this.frameId) {
            if (!this.effectsSequence.length) {
              this._mdf = !1;
              return;
            }
            if (this.lock) {
              this.setVValue(this.pv);
              return;
            }
            this.lock = !0, this._mdf = !1;
            var M;
            this.kf ? M = this.pv : this.data.ks ? M = this.data.ks.k : M = this.data.pt.k;
            var _, E = this.effectsSequence.length;
            for (_ = 0; _ < E; _ += 1)
              M = this.effectsSequence[_](M);
            this.setVValue(M), this.lock = !1, this.frameId = this.elem.globalData.frameId;
          }
        }
        function w(M, _, E) {
          this.propType = "shape", this.comp = M.comp, this.container = M, this.elem = M, this.data = _, this.k = !1, this.kf = !1, this._mdf = !1;
          var I = E === 3 ? _.pt.k : _.ks.k;
          this.v = shapePool.clone(I), this.pv = shapePool.clone(this.v), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(this.v), this.reset = d, this.effectsSequence = [];
        }
        function k(M) {
          this.effectsSequence.push(M), this.container.addDynamicProperty(this);
        }
        w.prototype.interpolateShape = n, w.prototype.getValue = x, w.prototype.setVValue = y, w.prototype.addEffect = k;
        function C(M, _, E) {
          this.propType = "shape", this.comp = M.comp, this.elem = M, this.container = M, this.offsetTime = M.data.st, this.keyframes = E === 3 ? _.pt.k : _.ks.k, this.keyframesMetadata = [], this.k = !0, this.kf = !0;
          var I = this.keyframes[0].s[0].i.length;
          this.v = shapePool.newElement(), this.v.setPathData(this.keyframes[0].s[0].c, I), this.pv = shapePool.clone(this.v), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(this.v), this.lastFrame = t, this.reset = d, this._caching = {
            lastFrame: t,
            lastIndex: 0
          }, this.effectsSequence = [c.bind(this)];
        }
        C.prototype.getValue = x, C.prototype.interpolateShape = n, C.prototype.setVValue = y, C.prototype.addEffect = k;
        var P = (function() {
          var M = roundCorner;
          function _(E, I) {
            this.v = shapePool.newElement(), this.v.setPathData(!0, 4), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.localShapeCollection.addShape(this.v), this.d = I.d, this.elem = E, this.comp = E.comp, this.frameId = -1, this.initDynamicPropertyContainer(E), this.p = PropertyFactory.getProp(E, I.p, 1, 0, this), this.s = PropertyFactory.getProp(E, I.s, 1, 0, this), this.dynamicProperties.length ? this.k = !0 : (this.k = !1, this.convertEllToPath());
          }
          return _.prototype = {
            reset: d,
            getValue: function() {
              this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertEllToPath());
            },
            convertEllToPath: function() {
              var I = this.p.v[0], L = this.p.v[1], D = this.s.v[0] / 2, O = this.s.v[1] / 2, z = this.d !== 3, W = this.v;
              W.v[0][0] = I, W.v[0][1] = L - O, W.v[1][0] = z ? I + D : I - D, W.v[1][1] = L, W.v[2][0] = I, W.v[2][1] = L + O, W.v[3][0] = z ? I - D : I + D, W.v[3][1] = L, W.i[0][0] = z ? I - D * M : I + D * M, W.i[0][1] = L - O, W.i[1][0] = z ? I + D : I - D, W.i[1][1] = L - O * M, W.i[2][0] = z ? I + D * M : I - D * M, W.i[2][1] = L + O, W.i[3][0] = z ? I - D : I + D, W.i[3][1] = L + O * M, W.o[0][0] = z ? I + D * M : I - D * M, W.o[0][1] = L - O, W.o[1][0] = z ? I + D : I - D, W.o[1][1] = L + O * M, W.o[2][0] = z ? I - D * M : I + D * M, W.o[2][1] = L + O, W.o[3][0] = z ? I - D : I + D, W.o[3][1] = L - O * M;
            }
          }, extendPrototype([DynamicPropertyContainer], _), _;
        })(), F = (function() {
          function M(_, E) {
            this.v = shapePool.newElement(), this.v.setPathData(!0, 0), this.elem = _, this.comp = _.comp, this.data = E, this.frameId = -1, this.d = E.d, this.initDynamicPropertyContainer(_), E.sy === 1 ? (this.ir = PropertyFactory.getProp(_, E.ir, 0, 0, this), this.is = PropertyFactory.getProp(_, E.is, 0, 0.01, this), this.convertToPath = this.convertStarToPath) : this.convertToPath = this.convertPolygonToPath, this.pt = PropertyFactory.getProp(_, E.pt, 0, 0, this), this.p = PropertyFactory.getProp(_, E.p, 1, 0, this), this.r = PropertyFactory.getProp(_, E.r, 0, degToRads, this), this.or = PropertyFactory.getProp(_, E.or, 0, 0, this), this.os = PropertyFactory.getProp(_, E.os, 0, 0.01, this), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.localShapeCollection.addShape(this.v), this.paths = this.localShapeCollection, this.dynamicProperties.length ? this.k = !0 : (this.k = !1, this.convertToPath());
          }
          return M.prototype = {
            reset: d,
            getValue: function() {
              this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertToPath());
            },
            convertStarToPath: function() {
              var E = Math.floor(this.pt.v) * 2, I = Math.PI * 2 / E, L = !0, D = this.or.v, O = this.ir.v, z = this.os.v, W = this.is.v, X = 2 * Math.PI * D / (E * 2), K = 2 * Math.PI * O / (E * 2), Y, U, Z, q, B = -Math.PI / 2;
              B += this.r.v;
              var G = this.data.d === 3 ? -1 : 1;
              for (this.v._length = 0, Y = 0; Y < E; Y += 1) {
                U = L ? D : O, Z = L ? z : W, q = L ? X : K;
                var N = U * Math.cos(B), V = U * Math.sin(B), H = N === 0 && V === 0 ? 0 : V / Math.sqrt(N * N + V * V), $ = N === 0 && V === 0 ? 0 : -N / Math.sqrt(N * N + V * V);
                N += +this.p.v[0], V += +this.p.v[1], this.v.setTripleAt(N, V, N - H * q * Z * G, V - $ * q * Z * G, N + H * q * Z * G, V + $ * q * Z * G, Y, !0), L = !L, B += I * G;
              }
            },
            convertPolygonToPath: function() {
              var E = Math.floor(this.pt.v), I = Math.PI * 2 / E, L = this.or.v, D = this.os.v, O = 2 * Math.PI * L / (E * 4), z, W = -Math.PI * 0.5, X = this.data.d === 3 ? -1 : 1;
              for (W += this.r.v, this.v._length = 0, z = 0; z < E; z += 1) {
                var K = L * Math.cos(W), Y = L * Math.sin(W), U = K === 0 && Y === 0 ? 0 : Y / Math.sqrt(K * K + Y * Y), Z = K === 0 && Y === 0 ? 0 : -K / Math.sqrt(K * K + Y * Y);
                K += +this.p.v[0], Y += +this.p.v[1], this.v.setTripleAt(K, Y, K - U * O * D * X, Y - Z * O * D * X, K + U * O * D * X, Y + Z * O * D * X, z, !0), W += I * X;
              }
              this.paths.length = 0, this.paths[0] = this.v;
            }
          }, extendPrototype([DynamicPropertyContainer], M), M;
        })(), S = (function() {
          function M(_, E) {
            this.v = shapePool.newElement(), this.v.c = !0, this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.localShapeCollection.addShape(this.v), this.paths = this.localShapeCollection, this.elem = _, this.comp = _.comp, this.frameId = -1, this.d = E.d, this.initDynamicPropertyContainer(_), this.p = PropertyFactory.getProp(_, E.p, 1, 0, this), this.s = PropertyFactory.getProp(_, E.s, 1, 0, this), this.r = PropertyFactory.getProp(_, E.r, 0, 0, this), this.dynamicProperties.length ? this.k = !0 : (this.k = !1, this.convertRectToPath());
          }
          return M.prototype = {
            convertRectToPath: function() {
              var E = this.p.v[0], I = this.p.v[1], L = this.s.v[0] / 2, D = this.s.v[1] / 2, O = bmMin(L, D, this.r.v), z = O * (1 - roundCorner);
              this.v._length = 0, this.d === 2 || this.d === 1 ? (this.v.setTripleAt(E + L, I - D + O, E + L, I - D + O, E + L, I - D + z, 0, !0), this.v.setTripleAt(E + L, I + D - O, E + L, I + D - z, E + L, I + D - O, 1, !0), O !== 0 ? (this.v.setTripleAt(E + L - O, I + D, E + L - O, I + D, E + L - z, I + D, 2, !0), this.v.setTripleAt(E - L + O, I + D, E - L + z, I + D, E - L + O, I + D, 3, !0), this.v.setTripleAt(E - L, I + D - O, E - L, I + D - O, E - L, I + D - z, 4, !0), this.v.setTripleAt(E - L, I - D + O, E - L, I - D + z, E - L, I - D + O, 5, !0), this.v.setTripleAt(E - L + O, I - D, E - L + O, I - D, E - L + z, I - D, 6, !0), this.v.setTripleAt(E + L - O, I - D, E + L - z, I - D, E + L - O, I - D, 7, !0)) : (this.v.setTripleAt(E - L, I + D, E - L + z, I + D, E - L, I + D, 2), this.v.setTripleAt(E - L, I - D, E - L, I - D + z, E - L, I - D, 3))) : (this.v.setTripleAt(E + L, I - D + O, E + L, I - D + z, E + L, I - D + O, 0, !0), O !== 0 ? (this.v.setTripleAt(E + L - O, I - D, E + L - O, I - D, E + L - z, I - D, 1, !0), this.v.setTripleAt(E - L + O, I - D, E - L + z, I - D, E - L + O, I - D, 2, !0), this.v.setTripleAt(E - L, I - D + O, E - L, I - D + O, E - L, I - D + z, 3, !0), this.v.setTripleAt(E - L, I + D - O, E - L, I + D - z, E - L, I + D - O, 4, !0), this.v.setTripleAt(E - L + O, I + D, E - L + O, I + D, E - L + z, I + D, 5, !0), this.v.setTripleAt(E + L - O, I + D, E + L - z, I + D, E + L - O, I + D, 6, !0), this.v.setTripleAt(E + L, I + D - O, E + L, I + D - O, E + L, I + D - z, 7, !0)) : (this.v.setTripleAt(E - L, I - D, E - L + z, I - D, E - L, I - D, 1, !0), this.v.setTripleAt(E - L, I + D, E - L, I + D - z, E - L, I + D, 2, !0), this.v.setTripleAt(E + L, I + D, E + L - z, I + D, E + L, I + D, 3, !0)));
            },
            getValue: function() {
              this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertRectToPath());
            },
            reset: d
          }, extendPrototype([DynamicPropertyContainer], M), M;
        })();
        function j(M, _, E) {
          var I;
          if (E === 3 || E === 4) {
            var L = E === 3 ? _.pt : _.ks, D = L.k;
            D.length ? I = new C(M, _, E) : I = new w(M, _, E);
          } else E === 5 ? I = new S(M, _) : E === 6 ? I = new P(M, _) : E === 7 && (I = new F(M, _));
          return I.k && M.addDynamicProperty(I), I;
        }
        function T() {
          return w;
        }
        function A() {
          return C;
        }
        var R = {};
        return R.getShapeProp = j, R.getConstructorFunction = T, R.getKeyframedConstructorFunction = A, R;
      })();
      /*!
       Transformation Matrix v2.0
       (c) Epistemex 2014-2015
       www.epistemex.com
       By Ken Fyrstenberg
       Contributions by leeoniya.
       License: MIT, header required.
       */
      var Matrix = /* @__PURE__ */ (function() {
        var t = Math.cos, n = Math.sin, c = Math.tan, d = Math.round;
        function v() {
          return this.props[0] = 1, this.props[1] = 0, this.props[2] = 0, this.props[3] = 0, this.props[4] = 0, this.props[5] = 1, this.props[6] = 0, this.props[7] = 0, this.props[8] = 0, this.props[9] = 0, this.props[10] = 1, this.props[11] = 0, this.props[12] = 0, this.props[13] = 0, this.props[14] = 0, this.props[15] = 1, this;
        }
        function y(N) {
          if (N === 0)
            return this;
          var V = t(N), H = n(N);
          return this._t(V, -H, 0, 0, H, V, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function x(N) {
          if (N === 0)
            return this;
          var V = t(N), H = n(N);
          return this._t(1, 0, 0, 0, 0, V, -H, 0, 0, H, V, 0, 0, 0, 0, 1);
        }
        function w(N) {
          if (N === 0)
            return this;
          var V = t(N), H = n(N);
          return this._t(V, 0, H, 0, 0, 1, 0, 0, -H, 0, V, 0, 0, 0, 0, 1);
        }
        function k(N) {
          if (N === 0)
            return this;
          var V = t(N), H = n(N);
          return this._t(V, -H, 0, 0, H, V, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function C(N, V) {
          return this._t(1, V, N, 1, 0, 0);
        }
        function P(N, V) {
          return this.shear(c(N), c(V));
        }
        function F(N, V) {
          var H = t(V), $ = n(V);
          return this._t(H, $, 0, 0, -$, H, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, c(N), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(H, -$, 0, 0, $, H, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }
        function S(N, V, H) {
          return !H && H !== 0 && (H = 1), N === 1 && V === 1 && H === 1 ? this : this._t(N, 0, 0, 0, 0, V, 0, 0, 0, 0, H, 0, 0, 0, 0, 1);
        }
        function j(N, V, H, $, J, ee, te, re, ie, ne, he, ae, ce, oe, le, se) {
          return this.props[0] = N, this.props[1] = V, this.props[2] = H, this.props[3] = $, this.props[4] = J, this.props[5] = ee, this.props[6] = te, this.props[7] = re, this.props[8] = ie, this.props[9] = ne, this.props[10] = he, this.props[11] = ae, this.props[12] = ce, this.props[13] = oe, this.props[14] = le, this.props[15] = se, this;
        }
        function T(N, V, H) {
          return H = H || 0, N !== 0 || V !== 0 || H !== 0 ? this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, N, V, H, 1) : this;
        }
        function A(N, V, H, $, J, ee, te, re, ie, ne, he, ae, ce, oe, le, se) {
          var Q = this.props;
          if (N === 1 && V === 0 && H === 0 && $ === 0 && J === 0 && ee === 1 && te === 0 && re === 0 && ie === 0 && ne === 0 && he === 1 && ae === 0)
            return Q[12] = Q[12] * N + Q[15] * ce, Q[13] = Q[13] * ee + Q[15] * oe, Q[14] = Q[14] * he + Q[15] * le, Q[15] *= se, this._identityCalculated = !1, this;
          var me = Q[0], be = Q[1], ve = Q[2], ue = Q[3], ge = Q[4], ye = Q[5], fe = Q[6], xe = Q[7], ke = Q[8], de = Q[9], we = Q[10], pe = Q[11], Se = Q[12], Pe = Q[13], Ee = Q[14], Ae = Q[15];
          return Q[0] = me * N + be * J + ve * ie + ue * ce, Q[1] = me * V + be * ee + ve * ne + ue * oe, Q[2] = me * H + be * te + ve * he + ue * le, Q[3] = me * $ + be * re + ve * ae + ue * se, Q[4] = ge * N + ye * J + fe * ie + xe * ce, Q[5] = ge * V + ye * ee + fe * ne + xe * oe, Q[6] = ge * H + ye * te + fe * he + xe * le, Q[7] = ge * $ + ye * re + fe * ae + xe * se, Q[8] = ke * N + de * J + we * ie + pe * ce, Q[9] = ke * V + de * ee + we * ne + pe * oe, Q[10] = ke * H + de * te + we * he + pe * le, Q[11] = ke * $ + de * re + we * ae + pe * se, Q[12] = Se * N + Pe * J + Ee * ie + Ae * ce, Q[13] = Se * V + Pe * ee + Ee * ne + Ae * oe, Q[14] = Se * H + Pe * te + Ee * he + Ae * le, Q[15] = Se * $ + Pe * re + Ee * ae + Ae * se, this._identityCalculated = !1, this;
        }
        function R(N) {
          var V = N.props;
          return this.transform(V[0], V[1], V[2], V[3], V[4], V[5], V[6], V[7], V[8], V[9], V[10], V[11], V[12], V[13], V[14], V[15]);
        }
        function M() {
          return this._identityCalculated || (this._identity = !(this.props[0] !== 1 || this.props[1] !== 0 || this.props[2] !== 0 || this.props[3] !== 0 || this.props[4] !== 0 || this.props[5] !== 1 || this.props[6] !== 0 || this.props[7] !== 0 || this.props[8] !== 0 || this.props[9] !== 0 || this.props[10] !== 1 || this.props[11] !== 0 || this.props[12] !== 0 || this.props[13] !== 0 || this.props[14] !== 0 || this.props[15] !== 1), this._identityCalculated = !0), this._identity;
        }
        function _(N) {
          for (var V = 0; V < 16; ) {
            if (N.props[V] !== this.props[V])
              return !1;
            V += 1;
          }
          return !0;
        }
        function E(N) {
          var V;
          for (V = 0; V < 16; V += 1)
            N.props[V] = this.props[V];
          return N;
        }
        function I(N) {
          var V;
          for (V = 0; V < 16; V += 1)
            this.props[V] = N[V];
        }
        function L(N, V, H) {
          return {
            x: N * this.props[0] + V * this.props[4] + H * this.props[8] + this.props[12],
            y: N * this.props[1] + V * this.props[5] + H * this.props[9] + this.props[13],
            z: N * this.props[2] + V * this.props[6] + H * this.props[10] + this.props[14]
          };
        }
        function D(N, V, H) {
          return N * this.props[0] + V * this.props[4] + H * this.props[8] + this.props[12];
        }
        function O(N, V, H) {
          return N * this.props[1] + V * this.props[5] + H * this.props[9] + this.props[13];
        }
        function z(N, V, H) {
          return N * this.props[2] + V * this.props[6] + H * this.props[10] + this.props[14];
        }
        function W() {
          var N = this.props[0] * this.props[5] - this.props[1] * this.props[4], V = this.props[5] / N, H = -this.props[1] / N, $ = -this.props[4] / N, J = this.props[0] / N, ee = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / N, te = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / N, re = new Matrix();
          return re.props[0] = V, re.props[1] = H, re.props[4] = $, re.props[5] = J, re.props[12] = ee, re.props[13] = te, re;
        }
        function X(N) {
          var V = this.getInverseMatrix();
          return V.applyToPointArray(N[0], N[1], N[2] || 0);
        }
        function K(N) {
          var V, H = N.length, $ = [];
          for (V = 0; V < H; V += 1)
            $[V] = X(N[V]);
          return $;
        }
        function Y(N, V, H) {
          var $ = createTypedArray("float32", 6);
          if (this.isIdentity())
            $[0] = N[0], $[1] = N[1], $[2] = V[0], $[3] = V[1], $[4] = H[0], $[5] = H[1];
          else {
            var J = this.props[0], ee = this.props[1], te = this.props[4], re = this.props[5], ie = this.props[12], ne = this.props[13];
            $[0] = N[0] * J + N[1] * te + ie, $[1] = N[0] * ee + N[1] * re + ne, $[2] = V[0] * J + V[1] * te + ie, $[3] = V[0] * ee + V[1] * re + ne, $[4] = H[0] * J + H[1] * te + ie, $[5] = H[0] * ee + H[1] * re + ne;
          }
          return $;
        }
        function U(N, V, H) {
          var $;
          return this.isIdentity() ? $ = [N, V, H] : $ = [N * this.props[0] + V * this.props[4] + H * this.props[8] + this.props[12], N * this.props[1] + V * this.props[5] + H * this.props[9] + this.props[13], N * this.props[2] + V * this.props[6] + H * this.props[10] + this.props[14]], $;
        }
        function Z(N, V) {
          if (this.isIdentity())
            return N + "," + V;
          var H = this.props;
          return Math.round((N * H[0] + V * H[4] + H[12]) * 100) / 100 + "," + Math.round((N * H[1] + V * H[5] + H[13]) * 100) / 100;
        }
        function q() {
          for (var N = 0, V = this.props, H = "matrix3d(", $ = 1e4; N < 16; )
            H += d(V[N] * $) / $, H += N === 15 ? ")" : ",", N += 1;
          return H;
        }
        function B(N) {
          var V = 1e4;
          return N < 1e-6 && N > 0 || N > -1e-6 && N < 0 ? d(N * V) / V : N;
        }
        function G() {
          var N = this.props, V = B(N[0]), H = B(N[1]), $ = B(N[4]), J = B(N[5]), ee = B(N[12]), te = B(N[13]);
          return "matrix(" + V + "," + H + "," + $ + "," + J + "," + ee + "," + te + ")";
        }
        return function() {
          this.reset = v, this.rotate = y, this.rotateX = x, this.rotateY = w, this.rotateZ = k, this.skew = P, this.skewFromAxis = F, this.shear = C, this.scale = S, this.setTransform = j, this.translate = T, this.transform = A, this.multiply = R, this.applyToPoint = L, this.applyToX = D, this.applyToY = O, this.applyToZ = z, this.applyToPointArray = U, this.applyToTriplePoints = Y, this.applyToPointStringified = Z, this.toCSS = q, this.to2dCSS = G, this.clone = E, this.cloneFromProps = I, this.equals = _, this.inversePoints = K, this.inversePoint = X, this.getInverseMatrix = W, this._t = this.transform, this.isIdentity = M, this._identity = !0, this._identityCalculated = !1, this.props = createTypedArray("float32", 16), this.reset();
        };
      })();
      function _typeof$3(t) {
        "@babel/helpers - typeof";
        return _typeof$3 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
          return typeof n;
        } : function(n) {
          return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
        }, _typeof$3(t);
      }
      var lottie = {};
      function setLocation(t) {
        setLocationHref(t);
      }
      function searchAnimations() {
        animationManager.searchAnimations();
      }
      function setSubframeRendering(t) {
        setSubframeEnabled(t);
      }
      function setPrefix(t) {
        setIdPrefix(t);
      }
      function loadAnimation(t) {
        return animationManager.loadAnimation(t);
      }
      function setQuality(t) {
        if (typeof t == "string")
          switch (t) {
            case "high":
              setDefaultCurveSegments(200);
              break;
            default:
            case "medium":
              setDefaultCurveSegments(50);
              break;
            case "low":
              setDefaultCurveSegments(10);
              break;
          }
        else !isNaN(t) && t > 1 && setDefaultCurveSegments(t);
      }
      function inBrowser() {
        return typeof navigator < "u";
      }
      function installPlugin(t, n) {
        t === "expressions" && setExpressionsPlugin(n);
      }
      function getFactory(t) {
        switch (t) {
          case "propertyFactory":
            return PropertyFactory;
          case "shapePropertyFactory":
            return ShapePropertyFactory;
          case "matrix":
            return Matrix;
          default:
            return null;
        }
      }
      lottie.play = animationManager.play, lottie.pause = animationManager.pause, lottie.setLocationHref = setLocation, lottie.togglePause = animationManager.togglePause, lottie.setSpeed = animationManager.setSpeed, lottie.setDirection = animationManager.setDirection, lottie.stop = animationManager.stop, lottie.searchAnimations = searchAnimations, lottie.registerAnimation = animationManager.registerAnimation, lottie.loadAnimation = loadAnimation, lottie.setSubframeRendering = setSubframeRendering, lottie.resize = animationManager.resize, lottie.goToAndStop = animationManager.goToAndStop, lottie.destroy = animationManager.destroy, lottie.setQuality = setQuality, lottie.inBrowser = inBrowser, lottie.installPlugin = installPlugin, lottie.freeze = animationManager.freeze, lottie.unfreeze = animationManager.unfreeze, lottie.setVolume = animationManager.setVolume, lottie.mute = animationManager.mute, lottie.unmute = animationManager.unmute, lottie.getRegisteredAnimations = animationManager.getRegisteredAnimations, lottie.useWebWorker = setWebWorker, lottie.setIDPrefix = setPrefix, lottie.__getFactory = getFactory, lottie.version = "5.13.0";
      function checkReady() {
        document.readyState === "complete" && (clearInterval(readyStateCheckInterval), searchAnimations());
      }
      function getQueryVariable(t) {
        for (var n = queryString.split("&"), c = 0; c < n.length; c += 1) {
          var d = n[c].split("=");
          if (decodeURIComponent(d[0]) == t)
            return decodeURIComponent(d[1]);
        }
        return null;
      }
      var queryString = "";
      {
        var scripts = document.getElementsByTagName("script"), index = scripts.length - 1, myScript = scripts[index] || {
          src: ""
        };
        queryString = myScript.src ? myScript.src.replace(/^[^\?]+\??/, "") : "", getQueryVariable("renderer");
      }
      var readyStateCheckInterval = setInterval(checkReady, 100);
      try {
        _typeof$3(exports$1) !== "object" && (window.bodymovin = lottie);
      } catch (t) {
      }
      var ShapeModifiers = (function() {
        var t = {}, n = {};
        t.registerModifier = c, t.getModifier = d;
        function c(v, y) {
          n[v] || (n[v] = y);
        }
        function d(v, y, x) {
          return new n[v](y, x);
        }
        return t;
      })();
      function ShapeModifier() {
      }
      ShapeModifier.prototype.initModifierProperties = function() {
      }, ShapeModifier.prototype.addShapeToModifier = function() {
      }, ShapeModifier.prototype.addShape = function(t) {
        if (!this.closed) {
          t.sh.container.addDynamicProperty(t.sh);
          var n = {
            shape: t.sh,
            data: t,
            localShapeCollection: shapeCollectionPool.newShapeCollection()
          };
          this.shapes.push(n), this.addShapeToModifier(n), this._isAnimated && t.setAsAnimated();
        }
      }, ShapeModifier.prototype.init = function(t, n) {
        this.shapes = [], this.elem = t, this.initDynamicPropertyContainer(t), this.initModifierProperties(t, n), this.frameId = initialDefaultFrame, this.closed = !1, this.k = !1, this.dynamicProperties.length ? this.k = !0 : this.getValue(!0);
      }, ShapeModifier.prototype.processKeys = function() {
        this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties());
      }, extendPrototype([DynamicPropertyContainer], ShapeModifier);
      function TrimModifier() {
      }
      extendPrototype([ShapeModifier], TrimModifier), TrimModifier.prototype.initModifierProperties = function(t, n) {
        this.s = PropertyFactory.getProp(t, n.s, 0, 0.01, this), this.e = PropertyFactory.getProp(t, n.e, 0, 0.01, this), this.o = PropertyFactory.getProp(t, n.o, 0, 0, this), this.sValue = 0, this.eValue = 0, this.getValue = this.processKeys, this.m = n.m, this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
      }, TrimModifier.prototype.addShapeToModifier = function(t) {
        t.pathsData = [];
      }, TrimModifier.prototype.calculateShapeEdges = function(t, n, c, d, v) {
        var y = [];
        n <= 1 ? y.push({
          s: t,
          e: n
        }) : t >= 1 ? y.push({
          s: t - 1,
          e: n - 1
        }) : (y.push({
          s: t,
          e: 1
        }), y.push({
          s: 0,
          e: n - 1
        }));
        var x = [], w, k = y.length, C;
        for (w = 0; w < k; w += 1)
          if (C = y[w], !(C.e * v < d || C.s * v > d + c)) {
            var P, F;
            C.s * v <= d ? P = 0 : P = (C.s * v - d) / c, C.e * v >= d + c ? F = 1 : F = (C.e * v - d) / c, x.push([P, F]);
          }
        return x.length || x.push([0, 0]), x;
      }, TrimModifier.prototype.releasePathsData = function(t) {
        var n, c = t.length;
        for (n = 0; n < c; n += 1)
          segmentsLengthPool.release(t[n]);
        return t.length = 0, t;
      }, TrimModifier.prototype.processShapes = function(t) {
        var n, c;
        if (this._mdf || t) {
          var d = this.o.v % 360 / 360;
          if (d < 0 && (d += 1), this.s.v > 1 ? n = 1 + d : this.s.v < 0 ? n = 0 + d : n = this.s.v + d, this.e.v > 1 ? c = 1 + d : this.e.v < 0 ? c = 0 + d : c = this.e.v + d, n > c) {
            var v = n;
            n = c, c = v;
          }
          n = Math.round(n * 1e4) * 1e-4, c = Math.round(c * 1e4) * 1e-4, this.sValue = n, this.eValue = c;
        } else
          n = this.sValue, c = this.eValue;
        var y, x, w = this.shapes.length, k, C, P, F, S, j = 0;
        if (c === n)
          for (x = 0; x < w; x += 1)
            this.shapes[x].localShapeCollection.releaseShapes(), this.shapes[x].shape._mdf = !0, this.shapes[x].shape.paths = this.shapes[x].localShapeCollection, this._mdf && (this.shapes[x].pathsData.length = 0);
        else if (c === 1 && n === 0 || c === 0 && n === 1) {
          if (this._mdf)
            for (x = 0; x < w; x += 1)
              this.shapes[x].pathsData.length = 0, this.shapes[x].shape._mdf = !0;
        } else {
          var T = [], A, R;
          for (x = 0; x < w; x += 1)
            if (A = this.shapes[x], !A.shape._mdf && !this._mdf && !t && this.m !== 2)
              A.shape.paths = A.localShapeCollection;
            else {
              if (y = A.shape.paths, C = y._length, S = 0, !A.shape._mdf && A.pathsData.length)
                S = A.totalShapeLength;
              else {
                for (P = this.releasePathsData(A.pathsData), k = 0; k < C; k += 1)
                  F = bez.getSegmentsLength(y.shapes[k]), P.push(F), S += F.totalLength;
                A.totalShapeLength = S, A.pathsData = P;
              }
              j += S, A.shape._mdf = !0;
            }
          var M = n, _ = c, E = 0, I;
          for (x = w - 1; x >= 0; x -= 1)
            if (A = this.shapes[x], A.shape._mdf) {
              for (R = A.localShapeCollection, R.releaseShapes(), this.m === 2 && w > 1 ? (I = this.calculateShapeEdges(n, c, A.totalShapeLength, E, j), E += A.totalShapeLength) : I = [[M, _]], C = I.length, k = 0; k < C; k += 1) {
                M = I[k][0], _ = I[k][1], T.length = 0, _ <= 1 ? T.push({
                  s: A.totalShapeLength * M,
                  e: A.totalShapeLength * _
                }) : M >= 1 ? T.push({
                  s: A.totalShapeLength * (M - 1),
                  e: A.totalShapeLength * (_ - 1)
                }) : (T.push({
                  s: A.totalShapeLength * M,
                  e: A.totalShapeLength
                }), T.push({
                  s: 0,
                  e: A.totalShapeLength * (_ - 1)
                }));
                var L = this.addShapes(A, T[0]);
                if (T[0].s !== T[0].e) {
                  if (T.length > 1) {
                    var D = A.shape.paths.shapes[A.shape.paths._length - 1];
                    if (D.c) {
                      var O = L.pop();
                      this.addPaths(L, R), L = this.addShapes(A, T[1], O);
                    } else
                      this.addPaths(L, R), L = this.addShapes(A, T[1]);
                  }
                  this.addPaths(L, R);
                }
              }
              A.shape.paths = R;
            }
        }
      }, TrimModifier.prototype.addPaths = function(t, n) {
        var c, d = t.length;
        for (c = 0; c < d; c += 1)
          n.addShape(t[c]);
      }, TrimModifier.prototype.addSegment = function(t, n, c, d, v, y, x) {
        v.setXYAt(n[0], n[1], "o", y), v.setXYAt(c[0], c[1], "i", y + 1), x && v.setXYAt(t[0], t[1], "v", y), v.setXYAt(d[0], d[1], "v", y + 1);
      }, TrimModifier.prototype.addSegmentFromArray = function(t, n, c, d) {
        n.setXYAt(t[1], t[5], "o", c), n.setXYAt(t[2], t[6], "i", c + 1), d && n.setXYAt(t[0], t[4], "v", c), n.setXYAt(t[3], t[7], "v", c + 1);
      }, TrimModifier.prototype.addShapes = function(t, n, c) {
        var d = t.pathsData, v = t.shape.paths.shapes, y, x = t.shape.paths._length, w, k, C = 0, P, F, S, j, T = [], A, R = !0;
        for (c ? (F = c._length, A = c._length) : (c = shapePool.newElement(), F = 0, A = 0), T.push(c), y = 0; y < x; y += 1) {
          for (S = d[y].lengths, c.c = v[y].c, k = v[y].c ? S.length : S.length + 1, w = 1; w < k; w += 1)
            if (P = S[w - 1], C + P.addedLength < n.s)
              C += P.addedLength, c.c = !1;
            else if (C > n.e) {
              c.c = !1;
              break;
            } else
              n.s <= C && n.e >= C + P.addedLength ? (this.addSegment(v[y].v[w - 1], v[y].o[w - 1], v[y].i[w], v[y].v[w], c, F, R), R = !1) : (j = bez.getNewSegment(v[y].v[w - 1], v[y].v[w], v[y].o[w - 1], v[y].i[w], (n.s - C) / P.addedLength, (n.e - C) / P.addedLength, S[w - 1]), this.addSegmentFromArray(j, c, F, R), R = !1, c.c = !1), C += P.addedLength, F += 1;
          if (v[y].c && S.length) {
            if (P = S[w - 1], C <= n.e) {
              var M = S[w - 1].addedLength;
              n.s <= C && n.e >= C + M ? (this.addSegment(v[y].v[w - 1], v[y].o[w - 1], v[y].i[0], v[y].v[0], c, F, R), R = !1) : (j = bez.getNewSegment(v[y].v[w - 1], v[y].v[0], v[y].o[w - 1], v[y].i[0], (n.s - C) / M, (n.e - C) / M, S[w - 1]), this.addSegmentFromArray(j, c, F, R), R = !1, c.c = !1);
            } else
              c.c = !1;
            C += P.addedLength, F += 1;
          }
          if (c._length && (c.setXYAt(c.v[A][0], c.v[A][1], "i", A), c.setXYAt(c.v[c._length - 1][0], c.v[c._length - 1][1], "o", c._length - 1)), C > n.e)
            break;
          y < x - 1 && (c = shapePool.newElement(), R = !0, T.push(c), F = 0);
        }
        return T;
      };
      function PuckerAndBloatModifier() {
      }
      extendPrototype([ShapeModifier], PuckerAndBloatModifier), PuckerAndBloatModifier.prototype.initModifierProperties = function(t, n) {
        this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(t, n.a, 0, null, this), this._isAnimated = !!this.amount.effectsSequence.length;
      }, PuckerAndBloatModifier.prototype.processPath = function(t, n) {
        var c = n / 100, d = [0, 0], v = t._length, y = 0;
        for (y = 0; y < v; y += 1)
          d[0] += t.v[y][0], d[1] += t.v[y][1];
        d[0] /= v, d[1] /= v;
        var x = shapePool.newElement();
        x.c = t.c;
        var w, k, C, P, F, S;
        for (y = 0; y < v; y += 1)
          w = t.v[y][0] + (d[0] - t.v[y][0]) * c, k = t.v[y][1] + (d[1] - t.v[y][1]) * c, C = t.o[y][0] + (d[0] - t.o[y][0]) * -c, P = t.o[y][1] + (d[1] - t.o[y][1]) * -c, F = t.i[y][0] + (d[0] - t.i[y][0]) * -c, S = t.i[y][1] + (d[1] - t.i[y][1]) * -c, x.setTripleAt(w, k, C, P, F, S, y);
        return x;
      }, PuckerAndBloatModifier.prototype.processShapes = function(t) {
        var n, c, d = this.shapes.length, v, y, x = this.amount.v;
        if (x !== 0) {
          var w, k;
          for (c = 0; c < d; c += 1) {
            if (w = this.shapes[c], k = w.localShapeCollection, !(!w.shape._mdf && !this._mdf && !t))
              for (k.releaseShapes(), w.shape._mdf = !0, n = w.shape.paths.shapes, y = w.shape.paths._length, v = 0; v < y; v += 1)
                k.addShape(this.processPath(n[v], x));
            w.shape.paths = w.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      var TransformPropertyFactory = (function() {
        var t = [0, 0];
        function n(k) {
          var C = this._mdf;
          this.iterateDynamicProperties(), this._mdf = this._mdf || C, this.a && k.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.s && k.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.sk && k.skewFromAxis(-this.sk.v, this.sa.v), this.r ? k.rotate(-this.r.v) : k.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.data.p.s ? this.data.p.z ? k.translate(this.px.v, this.py.v, -this.pz.v) : k.translate(this.px.v, this.py.v, 0) : k.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
        }
        function c(k) {
          if (this.elem.globalData.frameId !== this.frameId) {
            if (this._isDirty && (this.precalculateMatrix(), this._isDirty = !1), this.iterateDynamicProperties(), this._mdf || k) {
              var C;
              if (this.v.cloneFromProps(this.pre.props), this.appliedTransformations < 1 && this.v.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.appliedTransformations < 2 && this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.sk && this.appliedTransformations < 3 && this.v.skewFromAxis(-this.sk.v, this.sa.v), this.r && this.appliedTransformations < 4 ? this.v.rotate(-this.r.v) : !this.r && this.appliedTransformations < 4 && this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.autoOriented) {
                var P, F;
                if (C = this.elem.globalData.frameRate, this.p && this.p.keyframes && this.p.getValueAtTime)
                  this.p._caching.lastFrame + this.p.offsetTime <= this.p.keyframes[0].t ? (P = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / C, 0), F = this.p.getValueAtTime(this.p.keyframes[0].t / C, 0)) : this.p._caching.lastFrame + this.p.offsetTime >= this.p.keyframes[this.p.keyframes.length - 1].t ? (P = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t / C, 0), F = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.05) / C, 0)) : (P = this.p.pv, F = this.p.getValueAtTime((this.p._caching.lastFrame + this.p.offsetTime - 0.01) / C, this.p.offsetTime));
                else if (this.px && this.px.keyframes && this.py.keyframes && this.px.getValueAtTime && this.py.getValueAtTime) {
                  P = [], F = [];
                  var S = this.px, j = this.py;
                  S._caching.lastFrame + S.offsetTime <= S.keyframes[0].t ? (P[0] = S.getValueAtTime((S.keyframes[0].t + 0.01) / C, 0), P[1] = j.getValueAtTime((j.keyframes[0].t + 0.01) / C, 0), F[0] = S.getValueAtTime(S.keyframes[0].t / C, 0), F[1] = j.getValueAtTime(j.keyframes[0].t / C, 0)) : S._caching.lastFrame + S.offsetTime >= S.keyframes[S.keyframes.length - 1].t ? (P[0] = S.getValueAtTime(S.keyframes[S.keyframes.length - 1].t / C, 0), P[1] = j.getValueAtTime(j.keyframes[j.keyframes.length - 1].t / C, 0), F[0] = S.getValueAtTime((S.keyframes[S.keyframes.length - 1].t - 0.01) / C, 0), F[1] = j.getValueAtTime((j.keyframes[j.keyframes.length - 1].t - 0.01) / C, 0)) : (P = [S.pv, j.pv], F[0] = S.getValueAtTime((S._caching.lastFrame + S.offsetTime - 0.01) / C, S.offsetTime), F[1] = j.getValueAtTime((j._caching.lastFrame + j.offsetTime - 0.01) / C, j.offsetTime));
                } else
                  F = t, P = F;
                this.v.rotate(-Math.atan2(P[1] - F[1], P[0] - F[0]));
              }
              this.data.p && this.data.p.s ? this.data.p.z ? this.v.translate(this.px.v, this.py.v, -this.pz.v) : this.v.translate(this.px.v, this.py.v, 0) : this.v.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
            }
            this.frameId = this.elem.globalData.frameId;
          }
        }
        function d() {
          if (this.appliedTransformations = 0, this.pre.reset(), !this.a.effectsSequence.length)
            this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.appliedTransformations = 1;
          else
            return;
          if (!this.s.effectsSequence.length)
            this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.appliedTransformations = 2;
          else
            return;
          if (this.sk)
            if (!this.sk.effectsSequence.length && !this.sa.effectsSequence.length)
              this.pre.skewFromAxis(-this.sk.v, this.sa.v), this.appliedTransformations = 3;
            else
              return;
          this.r ? this.r.effectsSequence.length || (this.pre.rotate(-this.r.v), this.appliedTransformations = 4) : !this.rz.effectsSequence.length && !this.ry.effectsSequence.length && !this.rx.effectsSequence.length && !this.or.effectsSequence.length && (this.pre.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.appliedTransformations = 4);
        }
        function v() {
        }
        function y(k) {
          this._addDynamicProperty(k), this.elem.addDynamicProperty(k), this._isDirty = !0;
        }
        function x(k, C, P) {
          if (this.elem = k, this.frameId = -1, this.propType = "transform", this.data = C, this.v = new Matrix(), this.pre = new Matrix(), this.appliedTransformations = 0, this.initDynamicPropertyContainer(P || k), C.p && C.p.s ? (this.px = PropertyFactory.getProp(k, C.p.x, 0, 0, this), this.py = PropertyFactory.getProp(k, C.p.y, 0, 0, this), C.p.z && (this.pz = PropertyFactory.getProp(k, C.p.z, 0, 0, this))) : this.p = PropertyFactory.getProp(k, C.p || {
            k: [0, 0, 0]
          }, 1, 0, this), C.rx) {
            if (this.rx = PropertyFactory.getProp(k, C.rx, 0, degToRads, this), this.ry = PropertyFactory.getProp(k, C.ry, 0, degToRads, this), this.rz = PropertyFactory.getProp(k, C.rz, 0, degToRads, this), C.or.k[0].ti) {
              var F, S = C.or.k.length;
              for (F = 0; F < S; F += 1)
                C.or.k[F].to = null, C.or.k[F].ti = null;
            }
            this.or = PropertyFactory.getProp(k, C.or, 1, degToRads, this), this.or.sh = !0;
          } else
            this.r = PropertyFactory.getProp(k, C.r || {
              k: 0
            }, 0, degToRads, this);
          C.sk && (this.sk = PropertyFactory.getProp(k, C.sk, 0, degToRads, this), this.sa = PropertyFactory.getProp(k, C.sa, 0, degToRads, this)), this.a = PropertyFactory.getProp(k, C.a || {
            k: [0, 0, 0]
          }, 1, 0, this), this.s = PropertyFactory.getProp(k, C.s || {
            k: [100, 100, 100]
          }, 1, 0.01, this), C.o ? this.o = PropertyFactory.getProp(k, C.o, 0, 0.01, k) : this.o = {
            _mdf: !1,
            v: 1
          }, this._isDirty = !0, this.dynamicProperties.length || this.getValue(!0);
        }
        x.prototype = {
          applyToMatrix: n,
          getValue: c,
          precalculateMatrix: d,
          autoOrient: v
        }, extendPrototype([DynamicPropertyContainer], x), x.prototype.addDynamicProperty = y, x.prototype._addDynamicProperty = DynamicPropertyContainer.prototype.addDynamicProperty;
        function w(k, C, P) {
          return new x(k, C, P);
        }
        return {
          getTransformProperty: w
        };
      })();
      function RepeaterModifier() {
      }
      extendPrototype([ShapeModifier], RepeaterModifier), RepeaterModifier.prototype.initModifierProperties = function(t, n) {
        this.getValue = this.processKeys, this.c = PropertyFactory.getProp(t, n.c, 0, null, this), this.o = PropertyFactory.getProp(t, n.o, 0, null, this), this.tr = TransformPropertyFactory.getTransformProperty(t, n.tr, this), this.so = PropertyFactory.getProp(t, n.tr.so, 0, 0.01, this), this.eo = PropertyFactory.getProp(t, n.tr.eo, 0, 0.01, this), this.data = n, this.dynamicProperties.length || this.getValue(!0), this._isAnimated = !!this.dynamicProperties.length, this.pMatrix = new Matrix(), this.rMatrix = new Matrix(), this.sMatrix = new Matrix(), this.tMatrix = new Matrix(), this.matrix = new Matrix();
      }, RepeaterModifier.prototype.applyTransforms = function(t, n, c, d, v, y) {
        var x = y ? -1 : 1, w = d.s.v[0] + (1 - d.s.v[0]) * (1 - v), k = d.s.v[1] + (1 - d.s.v[1]) * (1 - v);
        t.translate(d.p.v[0] * x * v, d.p.v[1] * x * v, d.p.v[2]), n.translate(-d.a.v[0], -d.a.v[1], d.a.v[2]), n.rotate(-d.r.v * x * v), n.translate(d.a.v[0], d.a.v[1], d.a.v[2]), c.translate(-d.a.v[0], -d.a.v[1], d.a.v[2]), c.scale(y ? 1 / w : w, y ? 1 / k : k), c.translate(d.a.v[0], d.a.v[1], d.a.v[2]);
      }, RepeaterModifier.prototype.init = function(t, n, c, d) {
        for (this.elem = t, this.arr = n, this.pos = c, this.elemsData = d, this._currentCopies = 0, this._elements = [], this._groups = [], this.frameId = -1, this.initDynamicPropertyContainer(t), this.initModifierProperties(t, n[c]); c > 0; )
          c -= 1, this._elements.unshift(n[c]);
        this.dynamicProperties.length ? this.k = !0 : this.getValue(!0);
      }, RepeaterModifier.prototype.resetElements = function(t) {
        var n, c = t.length;
        for (n = 0; n < c; n += 1)
          t[n]._processed = !1, t[n].ty === "gr" && this.resetElements(t[n].it);
      }, RepeaterModifier.prototype.cloneElements = function(t) {
        var n = JSON.parse(JSON.stringify(t));
        return this.resetElements(n), n;
      }, RepeaterModifier.prototype.changeGroupRender = function(t, n) {
        var c, d = t.length;
        for (c = 0; c < d; c += 1)
          t[c]._render = n, t[c].ty === "gr" && this.changeGroupRender(t[c].it, n);
      }, RepeaterModifier.prototype.processShapes = function(t) {
        var n, c, d, v, y, x = !1;
        if (this._mdf || t) {
          var w = Math.ceil(this.c.v);
          if (this._groups.length < w) {
            for (; this._groups.length < w; ) {
              var k = {
                it: this.cloneElements(this._elements),
                ty: "gr"
              };
              k.it.push({
                a: {
                  a: 0,
                  ix: 1,
                  k: [0, 0]
                },
                nm: "Transform",
                o: {
                  a: 0,
                  ix: 7,
                  k: 100
                },
                p: {
                  a: 0,
                  ix: 2,
                  k: [0, 0]
                },
                r: {
                  a: 1,
                  ix: 6,
                  k: [{
                    s: 0,
                    e: 0,
                    t: 0
                  }, {
                    s: 0,
                    e: 0,
                    t: 1
                  }]
                },
                s: {
                  a: 0,
                  ix: 3,
                  k: [100, 100]
                },
                sa: {
                  a: 0,
                  ix: 5,
                  k: 0
                },
                sk: {
                  a: 0,
                  ix: 4,
                  k: 0
                },
                ty: "tr"
              }), this.arr.splice(0, 0, k), this._groups.splice(0, 0, k), this._currentCopies += 1;
            }
            this.elem.reloadShapes(), x = !0;
          }
          y = 0;
          var C;
          for (d = 0; d <= this._groups.length - 1; d += 1) {
            if (C = y < w, this._groups[d]._render = C, this.changeGroupRender(this._groups[d].it, C), !C) {
              var P = this.elemsData[d].it, F = P[P.length - 1];
              F.transform.op.v !== 0 ? (F.transform.op._mdf = !0, F.transform.op.v = 0) : F.transform.op._mdf = !1;
            }
            y += 1;
          }
          this._currentCopies = w;
          var S = this.o.v, j = S % 1, T = S > 0 ? Math.floor(S) : Math.ceil(S), A = this.pMatrix.props, R = this.rMatrix.props, M = this.sMatrix.props;
          this.pMatrix.reset(), this.rMatrix.reset(), this.sMatrix.reset(), this.tMatrix.reset(), this.matrix.reset();
          var _ = 0;
          if (S > 0) {
            for (; _ < T; )
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !1), _ += 1;
            j && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, j, !1), _ += j);
          } else if (S < 0) {
            for (; _ > T; )
              this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !0), _ -= 1;
            j && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, -j, !0), _ -= j);
          }
          d = this.data.m === 1 ? 0 : this._currentCopies - 1, v = this.data.m === 1 ? 1 : -1, y = this._currentCopies;
          for (var E, I; y; ) {
            if (n = this.elemsData[d].it, c = n[n.length - 1].transform.mProps.v.props, I = c.length, n[n.length - 1].transform.mProps._mdf = !0, n[n.length - 1].transform.op._mdf = !0, n[n.length - 1].transform.op.v = this._currentCopies === 1 ? this.so.v : this.so.v + (this.eo.v - this.so.v) * (d / (this._currentCopies - 1)), _ !== 0) {
              for ((d !== 0 && v === 1 || d !== this._currentCopies - 1 && v === -1) && this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !1), this.matrix.transform(R[0], R[1], R[2], R[3], R[4], R[5], R[6], R[7], R[8], R[9], R[10], R[11], R[12], R[13], R[14], R[15]), this.matrix.transform(M[0], M[1], M[2], M[3], M[4], M[5], M[6], M[7], M[8], M[9], M[10], M[11], M[12], M[13], M[14], M[15]), this.matrix.transform(A[0], A[1], A[2], A[3], A[4], A[5], A[6], A[7], A[8], A[9], A[10], A[11], A[12], A[13], A[14], A[15]), E = 0; E < I; E += 1)
                c[E] = this.matrix.props[E];
              this.matrix.reset();
            } else
              for (this.matrix.reset(), E = 0; E < I; E += 1)
                c[E] = this.matrix.props[E];
            _ += 1, y -= 1, d += v;
          }
        } else
          for (y = this._currentCopies, d = 0, v = 1; y; )
            n = this.elemsData[d].it, c = n[n.length - 1].transform.mProps.v.props, n[n.length - 1].transform.mProps._mdf = !1, n[n.length - 1].transform.op._mdf = !1, y -= 1, d += v;
        return x;
      }, RepeaterModifier.prototype.addShape = function() {
      };
      function RoundCornersModifier() {
      }
      extendPrototype([ShapeModifier], RoundCornersModifier), RoundCornersModifier.prototype.initModifierProperties = function(t, n) {
        this.getValue = this.processKeys, this.rd = PropertyFactory.getProp(t, n.r, 0, null, this), this._isAnimated = !!this.rd.effectsSequence.length;
      }, RoundCornersModifier.prototype.processPath = function(t, n) {
        var c = shapePool.newElement();
        c.c = t.c;
        var d, v = t._length, y, x, w, k, C, P, F = 0, S, j, T, A, R, M;
        for (d = 0; d < v; d += 1)
          y = t.v[d], w = t.o[d], x = t.i[d], y[0] === w[0] && y[1] === w[1] && y[0] === x[0] && y[1] === x[1] ? (d === 0 || d === v - 1) && !t.c ? (c.setTripleAt(y[0], y[1], w[0], w[1], x[0], x[1], F), F += 1) : (d === 0 ? k = t.v[v - 1] : k = t.v[d - 1], C = Math.sqrt(Math.pow(y[0] - k[0], 2) + Math.pow(y[1] - k[1], 2)), P = C ? Math.min(C / 2, n) / C : 0, R = y[0] + (k[0] - y[0]) * P, S = R, M = y[1] - (y[1] - k[1]) * P, j = M, T = S - (S - y[0]) * roundCorner, A = j - (j - y[1]) * roundCorner, c.setTripleAt(S, j, T, A, R, M, F), F += 1, d === v - 1 ? k = t.v[0] : k = t.v[d + 1], C = Math.sqrt(Math.pow(y[0] - k[0], 2) + Math.pow(y[1] - k[1], 2)), P = C ? Math.min(C / 2, n) / C : 0, T = y[0] + (k[0] - y[0]) * P, S = T, A = y[1] + (k[1] - y[1]) * P, j = A, R = S - (S - y[0]) * roundCorner, M = j - (j - y[1]) * roundCorner, c.setTripleAt(S, j, T, A, R, M, F), F += 1) : (c.setTripleAt(t.v[d][0], t.v[d][1], t.o[d][0], t.o[d][1], t.i[d][0], t.i[d][1], F), F += 1);
        return c;
      }, RoundCornersModifier.prototype.processShapes = function(t) {
        var n, c, d = this.shapes.length, v, y, x = this.rd.v;
        if (x !== 0) {
          var w, k;
          for (c = 0; c < d; c += 1) {
            if (w = this.shapes[c], k = w.localShapeCollection, !(!w.shape._mdf && !this._mdf && !t))
              for (k.releaseShapes(), w.shape._mdf = !0, n = w.shape.paths.shapes, y = w.shape.paths._length, v = 0; v < y; v += 1)
                k.addShape(this.processPath(n[v], x));
            w.shape.paths = w.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function floatEqual(t, n) {
        return Math.abs(t - n) * 1e5 <= Math.min(Math.abs(t), Math.abs(n));
      }
      function floatZero(t) {
        return Math.abs(t) <= 1e-5;
      }
      function lerp(t, n, c) {
        return t * (1 - c) + n * c;
      }
      function lerpPoint(t, n, c) {
        return [lerp(t[0], n[0], c), lerp(t[1], n[1], c)];
      }
      function quadRoots(t, n, c) {
        if (t === 0) return [];
        var d = n * n - 4 * t * c;
        if (d < 0) return [];
        var v = -n / (2 * t);
        if (d === 0) return [v];
        var y = Math.sqrt(d) / (2 * t);
        return [v - y, v + y];
      }
      function polynomialCoefficients(t, n, c, d) {
        return [-t + 3 * n - 3 * c + d, 3 * t - 6 * n + 3 * c, -3 * t + 3 * n, t];
      }
      function singlePoint(t) {
        return new PolynomialBezier(t, t, t, t, !1);
      }
      function PolynomialBezier(t, n, c, d, v) {
        v && pointEqual(t, n) && (n = lerpPoint(t, d, 1 / 3)), v && pointEqual(c, d) && (c = lerpPoint(t, d, 2 / 3));
        var y = polynomialCoefficients(t[0], n[0], c[0], d[0]), x = polynomialCoefficients(t[1], n[1], c[1], d[1]);
        this.a = [y[0], x[0]], this.b = [y[1], x[1]], this.c = [y[2], x[2]], this.d = [y[3], x[3]], this.points = [t, n, c, d];
      }
      PolynomialBezier.prototype.point = function(t) {
        return [((this.a[0] * t + this.b[0]) * t + this.c[0]) * t + this.d[0], ((this.a[1] * t + this.b[1]) * t + this.c[1]) * t + this.d[1]];
      }, PolynomialBezier.prototype.derivative = function(t) {
        return [(3 * t * this.a[0] + 2 * this.b[0]) * t + this.c[0], (3 * t * this.a[1] + 2 * this.b[1]) * t + this.c[1]];
      }, PolynomialBezier.prototype.tangentAngle = function(t) {
        var n = this.derivative(t);
        return Math.atan2(n[1], n[0]);
      }, PolynomialBezier.prototype.normalAngle = function(t) {
        var n = this.derivative(t);
        return Math.atan2(n[0], n[1]);
      }, PolynomialBezier.prototype.inflectionPoints = function() {
        var t = this.a[1] * this.b[0] - this.a[0] * this.b[1];
        if (floatZero(t)) return [];
        var n = -0.5 * (this.a[1] * this.c[0] - this.a[0] * this.c[1]) / t, c = n * n - 1 / 3 * (this.b[1] * this.c[0] - this.b[0] * this.c[1]) / t;
        if (c < 0) return [];
        var d = Math.sqrt(c);
        return floatZero(d) ? d > 0 && d < 1 ? [n] : [] : [n - d, n + d].filter(function(v) {
          return v > 0 && v < 1;
        });
      }, PolynomialBezier.prototype.split = function(t) {
        if (t <= 0) return [singlePoint(this.points[0]), this];
        if (t >= 1) return [this, singlePoint(this.points[this.points.length - 1])];
        var n = lerpPoint(this.points[0], this.points[1], t), c = lerpPoint(this.points[1], this.points[2], t), d = lerpPoint(this.points[2], this.points[3], t), v = lerpPoint(n, c, t), y = lerpPoint(c, d, t), x = lerpPoint(v, y, t);
        return [new PolynomialBezier(this.points[0], n, v, x, !0), new PolynomialBezier(x, y, d, this.points[3], !0)];
      };
      function extrema(t, n) {
        var c = t.points[0][n], d = t.points[t.points.length - 1][n];
        if (c > d) {
          var v = d;
          d = c, c = v;
        }
        for (var y = quadRoots(3 * t.a[n], 2 * t.b[n], t.c[n]), x = 0; x < y.length; x += 1)
          if (y[x] > 0 && y[x] < 1) {
            var w = t.point(y[x])[n];
            w < c ? c = w : w > d && (d = w);
          }
        return {
          min: c,
          max: d
        };
      }
      PolynomialBezier.prototype.bounds = function() {
        return {
          x: extrema(this, 0),
          y: extrema(this, 1)
        };
      }, PolynomialBezier.prototype.boundingBox = function() {
        var t = this.bounds();
        return {
          left: t.x.min,
          right: t.x.max,
          top: t.y.min,
          bottom: t.y.max,
          width: t.x.max - t.x.min,
          height: t.y.max - t.y.min,
          cx: (t.x.max + t.x.min) / 2,
          cy: (t.y.max + t.y.min) / 2
        };
      };
      function intersectData(t, n, c) {
        var d = t.boundingBox();
        return {
          cx: d.cx,
          cy: d.cy,
          width: d.width,
          height: d.height,
          bez: t,
          t: (n + c) / 2,
          t1: n,
          t2: c
        };
      }
      function splitData(t) {
        var n = t.bez.split(0.5);
        return [intersectData(n[0], t.t1, t.t), intersectData(n[1], t.t, t.t2)];
      }
      function boxIntersect(t, n) {
        return Math.abs(t.cx - n.cx) * 2 < t.width + n.width && Math.abs(t.cy - n.cy) * 2 < t.height + n.height;
      }
      function intersectsImpl(t, n, c, d, v, y) {
        if (boxIntersect(t, n)) {
          if (c >= y || t.width <= d && t.height <= d && n.width <= d && n.height <= d) {
            v.push([t.t, n.t]);
            return;
          }
          var x = splitData(t), w = splitData(n);
          intersectsImpl(x[0], w[0], c + 1, d, v, y), intersectsImpl(x[0], w[1], c + 1, d, v, y), intersectsImpl(x[1], w[0], c + 1, d, v, y), intersectsImpl(x[1], w[1], c + 1, d, v, y);
        }
      }
      PolynomialBezier.prototype.intersections = function(t, n, c) {
        n === void 0 && (n = 2), c === void 0 && (c = 7);
        var d = [];
        return intersectsImpl(intersectData(this, 0, 1), intersectData(t, 0, 1), 0, n, d, c), d;
      }, PolynomialBezier.shapeSegment = function(t, n) {
        var c = (n + 1) % t.length();
        return new PolynomialBezier(t.v[n], t.o[n], t.i[c], t.v[c], !0);
      }, PolynomialBezier.shapeSegmentInverted = function(t, n) {
        var c = (n + 1) % t.length();
        return new PolynomialBezier(t.v[c], t.i[c], t.o[n], t.v[n], !0);
      };
      function crossProduct(t, n) {
        return [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
      }
      function lineIntersection(t, n, c, d) {
        var v = [t[0], t[1], 1], y = [n[0], n[1], 1], x = [c[0], c[1], 1], w = [d[0], d[1], 1], k = crossProduct(crossProduct(v, y), crossProduct(x, w));
        return floatZero(k[2]) ? null : [k[0] / k[2], k[1] / k[2]];
      }
      function polarOffset(t, n, c) {
        return [t[0] + Math.cos(n) * c, t[1] - Math.sin(n) * c];
      }
      function pointDistance(t, n) {
        return Math.hypot(t[0] - n[0], t[1] - n[1]);
      }
      function pointEqual(t, n) {
        return floatEqual(t[0], n[0]) && floatEqual(t[1], n[1]);
      }
      function ZigZagModifier() {
      }
      extendPrototype([ShapeModifier], ZigZagModifier), ZigZagModifier.prototype.initModifierProperties = function(t, n) {
        this.getValue = this.processKeys, this.amplitude = PropertyFactory.getProp(t, n.s, 0, null, this), this.frequency = PropertyFactory.getProp(t, n.r, 0, null, this), this.pointsType = PropertyFactory.getProp(t, n.pt, 0, null, this), this._isAnimated = this.amplitude.effectsSequence.length !== 0 || this.frequency.effectsSequence.length !== 0 || this.pointsType.effectsSequence.length !== 0;
      };
      function setPoint(t, n, c, d, v, y, x) {
        var w = c - Math.PI / 2, k = c + Math.PI / 2, C = n[0] + Math.cos(c) * d * v, P = n[1] - Math.sin(c) * d * v;
        t.setTripleAt(C, P, C + Math.cos(w) * y, P - Math.sin(w) * y, C + Math.cos(k) * x, P - Math.sin(k) * x, t.length());
      }
      function getPerpendicularVector(t, n) {
        var c = [n[0] - t[0], n[1] - t[1]], d = -Math.PI * 0.5, v = [Math.cos(d) * c[0] - Math.sin(d) * c[1], Math.sin(d) * c[0] + Math.cos(d) * c[1]];
        return v;
      }
      function getProjectingAngle(t, n) {
        var c = n === 0 ? t.length() - 1 : n - 1, d = (n + 1) % t.length(), v = t.v[c], y = t.v[d], x = getPerpendicularVector(v, y);
        return Math.atan2(0, 1) - Math.atan2(x[1], x[0]);
      }
      function zigZagCorner(t, n, c, d, v, y, x) {
        var w = getProjectingAngle(n, c), k = n.v[c % n._length], C = n.v[c === 0 ? n._length - 1 : c - 1], P = n.v[(c + 1) % n._length], F = y === 2 ? Math.sqrt(Math.pow(k[0] - C[0], 2) + Math.pow(k[1] - C[1], 2)) : 0, S = y === 2 ? Math.sqrt(Math.pow(k[0] - P[0], 2) + Math.pow(k[1] - P[1], 2)) : 0;
        setPoint(t, n.v[c % n._length], w, x, d, S / ((v + 1) * 2), F / ((v + 1) * 2));
      }
      function zigZagSegment(t, n, c, d, v, y) {
        for (var x = 0; x < d; x += 1) {
          var w = (x + 1) / (d + 1), k = v === 2 ? Math.sqrt(Math.pow(n.points[3][0] - n.points[0][0], 2) + Math.pow(n.points[3][1] - n.points[0][1], 2)) : 0, C = n.normalAngle(w), P = n.point(w);
          setPoint(t, P, C, y, c, k / ((d + 1) * 2), k / ((d + 1) * 2)), y = -y;
        }
        return y;
      }
      ZigZagModifier.prototype.processPath = function(t, n, c, d) {
        var v = t._length, y = shapePool.newElement();
        if (y.c = t.c, t.c || (v -= 1), v === 0) return y;
        var x = -1, w = PolynomialBezier.shapeSegment(t, 0);
        zigZagCorner(y, t, 0, n, c, d, x);
        for (var k = 0; k < v; k += 1)
          x = zigZagSegment(y, w, n, c, d, -x), k === v - 1 && !t.c ? w = null : w = PolynomialBezier.shapeSegment(t, (k + 1) % v), zigZagCorner(y, t, k + 1, n, c, d, x);
        return y;
      }, ZigZagModifier.prototype.processShapes = function(t) {
        var n, c, d = this.shapes.length, v, y, x = this.amplitude.v, w = Math.max(0, Math.round(this.frequency.v)), k = this.pointsType.v;
        if (x !== 0) {
          var C, P;
          for (c = 0; c < d; c += 1) {
            if (C = this.shapes[c], P = C.localShapeCollection, !(!C.shape._mdf && !this._mdf && !t))
              for (P.releaseShapes(), C.shape._mdf = !0, n = C.shape.paths.shapes, y = C.shape.paths._length, v = 0; v < y; v += 1)
                P.addShape(this.processPath(n[v], x, w, k));
            C.shape.paths = C.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function linearOffset(t, n, c) {
        var d = Math.atan2(n[0] - t[0], n[1] - t[1]);
        return [polarOffset(t, d, c), polarOffset(n, d, c)];
      }
      function offsetSegment(t, n) {
        var c, d, v, y, x, w, k;
        k = linearOffset(t.points[0], t.points[1], n), c = k[0], d = k[1], k = linearOffset(t.points[1], t.points[2], n), v = k[0], y = k[1], k = linearOffset(t.points[2], t.points[3], n), x = k[0], w = k[1];
        var C = lineIntersection(c, d, v, y);
        C === null && (C = d);
        var P = lineIntersection(x, w, v, y);
        return P === null && (P = x), new PolynomialBezier(c, C, P, w);
      }
      function joinLines(t, n, c, d, v) {
        var y = n.points[3], x = c.points[0];
        if (d === 3 || pointEqual(y, x)) return y;
        if (d === 2) {
          var w = -n.tangentAngle(1), k = -c.tangentAngle(0) + Math.PI, C = lineIntersection(y, polarOffset(y, w + Math.PI / 2, 100), x, polarOffset(x, w + Math.PI / 2, 100)), P = C ? pointDistance(C, y) : pointDistance(y, x) / 2, F = polarOffset(y, w, 2 * P * roundCorner);
          return t.setXYAt(F[0], F[1], "o", t.length() - 1), F = polarOffset(x, k, 2 * P * roundCorner), t.setTripleAt(x[0], x[1], x[0], x[1], F[0], F[1], t.length()), x;
        }
        var S = pointEqual(y, n.points[2]) ? n.points[0] : n.points[2], j = pointEqual(x, c.points[1]) ? c.points[3] : c.points[1], T = lineIntersection(S, y, x, j);
        return T && pointDistance(T, y) < v ? (t.setTripleAt(T[0], T[1], T[0], T[1], T[0], T[1], t.length()), T) : y;
      }
      function getIntersection(t, n) {
        var c = t.intersections(n);
        return c.length && floatEqual(c[0][0], 1) && c.shift(), c.length ? c[0] : null;
      }
      function pruneSegmentIntersection(t, n) {
        var c = t.slice(), d = n.slice(), v = getIntersection(t[t.length - 1], n[0]);
        return v && (c[t.length - 1] = t[t.length - 1].split(v[0])[0], d[0] = n[0].split(v[1])[1]), t.length > 1 && n.length > 1 && (v = getIntersection(t[0], n[n.length - 1]), v) ? [[t[0].split(v[0])[0]], [n[n.length - 1].split(v[1])[1]]] : [c, d];
      }
      function pruneIntersections(t) {
        for (var n, c = 1; c < t.length; c += 1)
          n = pruneSegmentIntersection(t[c - 1], t[c]), t[c - 1] = n[0], t[c] = n[1];
        return t.length > 1 && (n = pruneSegmentIntersection(t[t.length - 1], t[0]), t[t.length - 1] = n[0], t[0] = n[1]), t;
      }
      function offsetSegmentSplit(t, n) {
        var c = t.inflectionPoints(), d, v, y, x;
        if (c.length === 0)
          return [offsetSegment(t, n)];
        if (c.length === 1 || floatEqual(c[1], 1))
          return y = t.split(c[0]), d = y[0], v = y[1], [offsetSegment(d, n), offsetSegment(v, n)];
        y = t.split(c[0]), d = y[0];
        var w = (c[1] - c[0]) / (1 - c[0]);
        return y = y[1].split(w), x = y[0], v = y[1], [offsetSegment(d, n), offsetSegment(x, n), offsetSegment(v, n)];
      }
      function OffsetPathModifier() {
      }
      extendPrototype([ShapeModifier], OffsetPathModifier), OffsetPathModifier.prototype.initModifierProperties = function(t, n) {
        this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(t, n.a, 0, null, this), this.miterLimit = PropertyFactory.getProp(t, n.ml, 0, null, this), this.lineJoin = n.lj, this._isAnimated = this.amount.effectsSequence.length !== 0;
      }, OffsetPathModifier.prototype.processPath = function(t, n, c, d) {
        var v = shapePool.newElement();
        v.c = t.c;
        var y = t.length();
        t.c || (y -= 1);
        var x, w, k, C = [];
        for (x = 0; x < y; x += 1)
          k = PolynomialBezier.shapeSegment(t, x), C.push(offsetSegmentSplit(k, n));
        if (!t.c)
          for (x = y - 1; x >= 0; x -= 1)
            k = PolynomialBezier.shapeSegmentInverted(t, x), C.push(offsetSegmentSplit(k, n));
        C = pruneIntersections(C);
        var P = null, F = null;
        for (x = 0; x < C.length; x += 1) {
          var S = C[x];
          for (F && (P = joinLines(v, F, S[0], c, d)), F = S[S.length - 1], w = 0; w < S.length; w += 1)
            k = S[w], P && pointEqual(k.points[0], P) ? v.setXYAt(k.points[1][0], k.points[1][1], "o", v.length() - 1) : v.setTripleAt(k.points[0][0], k.points[0][1], k.points[1][0], k.points[1][1], k.points[0][0], k.points[0][1], v.length()), v.setTripleAt(k.points[3][0], k.points[3][1], k.points[3][0], k.points[3][1], k.points[2][0], k.points[2][1], v.length()), P = k.points[3];
        }
        return C.length && joinLines(v, F, C[0][0], c, d), v;
      }, OffsetPathModifier.prototype.processShapes = function(t) {
        var n, c, d = this.shapes.length, v, y, x = this.amount.v, w = this.miterLimit.v, k = this.lineJoin;
        if (x !== 0) {
          var C, P;
          for (c = 0; c < d; c += 1) {
            if (C = this.shapes[c], P = C.localShapeCollection, !(!C.shape._mdf && !this._mdf && !t))
              for (P.releaseShapes(), C.shape._mdf = !0, n = C.shape.paths.shapes, y = C.shape.paths._length, v = 0; v < y; v += 1)
                P.addShape(this.processPath(n[v], x, k, w));
            C.shape.paths = C.localShapeCollection;
          }
        }
        this.dynamicProperties.length || (this._mdf = !1);
      };
      function getFontProperties(t) {
        for (var n = t.fStyle ? t.fStyle.split(" ") : [], c = "normal", d = "normal", v = n.length, y, x = 0; x < v; x += 1)
          switch (y = n[x].toLowerCase(), y) {
            case "italic":
              d = "italic";
              break;
            case "bold":
              c = "700";
              break;
            case "black":
              c = "900";
              break;
            case "medium":
              c = "500";
              break;
            case "regular":
            case "normal":
              c = "400";
              break;
            case "light":
            case "thin":
              c = "200";
              break;
          }
        return {
          style: d,
          weight: t.fWeight || c
        };
      }
      var FontManager = (function() {
        var t = 5e3, n = {
          w: 0,
          size: 0,
          shapes: [],
          data: {
            shapes: []
          }
        }, c = [];
        c = c.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403]);
        var d = 127988, v = 917631, y = 917601, x = 917626, w = 65039, k = 8205, C = 127462, P = 127487, F = ["d83cdffb", "d83cdffc", "d83cdffd", "d83cdffe", "d83cdfff"];
        function S(B) {
          var G = B.split(","), N, V = G.length, H = [];
          for (N = 0; N < V; N += 1)
            G[N] !== "sans-serif" && G[N] !== "monospace" && H.push(G[N]);
          return H.join(",");
        }
        function j(B, G) {
          var N = createTag("span");
          N.setAttribute("aria-hidden", !0), N.style.fontFamily = G;
          var V = createTag("span");
          V.innerText = "giItT1WQy@!-/#", N.style.position = "absolute", N.style.left = "-10000px", N.style.top = "-10000px", N.style.fontSize = "300px", N.style.fontVariant = "normal", N.style.fontStyle = "normal", N.style.fontWeight = "normal", N.style.letterSpacing = "0", N.appendChild(V), document.body.appendChild(N);
          var H = V.offsetWidth;
          return V.style.fontFamily = S(B) + ", " + G, {
            node: V,
            w: H,
            parent: N
          };
        }
        function T() {
          var B, G = this.fonts.length, N, V, H = G;
          for (B = 0; B < G; B += 1)
            this.fonts[B].loaded ? H -= 1 : this.fonts[B].fOrigin === "n" || this.fonts[B].origin === 0 ? this.fonts[B].loaded = !0 : (N = this.fonts[B].monoCase.node, V = this.fonts[B].monoCase.w, N.offsetWidth !== V ? (H -= 1, this.fonts[B].loaded = !0) : (N = this.fonts[B].sansCase.node, V = this.fonts[B].sansCase.w, N.offsetWidth !== V && (H -= 1, this.fonts[B].loaded = !0)), this.fonts[B].loaded && (this.fonts[B].sansCase.parent.parentNode.removeChild(this.fonts[B].sansCase.parent), this.fonts[B].monoCase.parent.parentNode.removeChild(this.fonts[B].monoCase.parent)));
          H !== 0 && Date.now() - this.initTime < t ? setTimeout(this.checkLoadedFontsBinded, 20) : setTimeout(this.setIsLoadedBinded, 10);
        }
        function A(B, G) {
          var N = document.body && G ? "svg" : "canvas", V, H = getFontProperties(B);
          if (N === "svg") {
            var $ = createNS("text");
            $.style.fontSize = "100px", $.setAttribute("font-family", B.fFamily), $.setAttribute("font-style", H.style), $.setAttribute("font-weight", H.weight), $.textContent = "1", B.fClass ? ($.style.fontFamily = "inherit", $.setAttribute("class", B.fClass)) : $.style.fontFamily = B.fFamily, G.appendChild($), V = $;
          } else {
            var J = new OffscreenCanvas(500, 500).getContext("2d");
            J.font = H.style + " " + H.weight + " 100px " + B.fFamily, V = J;
          }
          function ee(te) {
            return N === "svg" ? (V.textContent = te, V.getComputedTextLength()) : V.measureText(te).width;
          }
          return {
            measureText: ee
          };
        }
        function R(B, G) {
          if (!B) {
            this.isLoaded = !0;
            return;
          }
          if (this.chars) {
            this.isLoaded = !0, this.fonts = B.list;
            return;
          }
          if (!document.body) {
            this.isLoaded = !0, B.list.forEach(function(he) {
              he.helper = A(he), he.cache = {};
            }), this.fonts = B.list;
            return;
          }
          var N = B.list, V, H = N.length, $ = H;
          for (V = 0; V < H; V += 1) {
            var J = !0, ee, te;
            if (N[V].loaded = !1, N[V].monoCase = j(N[V].fFamily, "monospace"), N[V].sansCase = j(N[V].fFamily, "sans-serif"), !N[V].fPath)
              N[V].loaded = !0, $ -= 1;
            else if (N[V].fOrigin === "p" || N[V].origin === 3) {
              if (ee = document.querySelectorAll('style[f-forigin="p"][f-family="' + N[V].fFamily + '"], style[f-origin="3"][f-family="' + N[V].fFamily + '"]'), ee.length > 0 && (J = !1), J) {
                var re = createTag("style");
                re.setAttribute("f-forigin", N[V].fOrigin), re.setAttribute("f-origin", N[V].origin), re.setAttribute("f-family", N[V].fFamily), re.type = "text/css", re.innerText = "@font-face {font-family: " + N[V].fFamily + "; font-style: normal; src: url('" + N[V].fPath + "');}", G.appendChild(re);
              }
            } else if (N[V].fOrigin === "g" || N[V].origin === 1) {
              for (ee = document.querySelectorAll('link[f-forigin="g"], link[f-origin="1"]'), te = 0; te < ee.length; te += 1)
                ee[te].href.indexOf(N[V].fPath) !== -1 && (J = !1);
              if (J) {
                var ie = createTag("link");
                ie.setAttribute("f-forigin", N[V].fOrigin), ie.setAttribute("f-origin", N[V].origin), ie.type = "text/css", ie.rel = "stylesheet", ie.href = N[V].fPath, document.body.appendChild(ie);
              }
            } else if (N[V].fOrigin === "t" || N[V].origin === 2) {
              for (ee = document.querySelectorAll('script[f-forigin="t"], script[f-origin="2"]'), te = 0; te < ee.length; te += 1)
                N[V].fPath === ee[te].src && (J = !1);
              if (J) {
                var ne = createTag("link");
                ne.setAttribute("f-forigin", N[V].fOrigin), ne.setAttribute("f-origin", N[V].origin), ne.setAttribute("rel", "stylesheet"), ne.setAttribute("href", N[V].fPath), G.appendChild(ne);
              }
            }
            N[V].helper = A(N[V], G), N[V].cache = {}, this.fonts.push(N[V]);
          }
          $ === 0 ? this.isLoaded = !0 : setTimeout(this.checkLoadedFonts.bind(this), 100);
        }
        function M(B) {
          if (B) {
            this.chars || (this.chars = []);
            var G, N = B.length, V, H = this.chars.length, $;
            for (G = 0; G < N; G += 1) {
              for (V = 0, $ = !1; V < H; )
                this.chars[V].style === B[G].style && this.chars[V].fFamily === B[G].fFamily && this.chars[V].ch === B[G].ch && ($ = !0), V += 1;
              $ || (this.chars.push(B[G]), H += 1);
            }
          }
        }
        function _(B, G, N) {
          for (var V = 0, H = this.chars.length; V < H; ) {
            if (this.chars[V].ch === B && this.chars[V].style === G && this.chars[V].fFamily === N)
              return this.chars[V];
            V += 1;
          }
          return (typeof B == "string" && B.charCodeAt(0) !== 13 || !B) && console && console.warn && !this._warned && (this._warned = !0, console.warn("Missing character from exported characters list: ", B, G, N)), n;
        }
        function E(B, G, N) {
          var V = this.getFontByName(G), H = B;
          if (!V.cache[H]) {
            var $ = V.helper;
            if (B === " ") {
              var J = $.measureText("|" + B + "|"), ee = $.measureText("||");
              V.cache[H] = (J - ee) / 100;
            } else
              V.cache[H] = $.measureText(B) / 100;
          }
          return V.cache[H] * N;
        }
        function I(B) {
          for (var G = 0, N = this.fonts.length; G < N; ) {
            if (this.fonts[G].fName === B)
              return this.fonts[G];
            G += 1;
          }
          return this.fonts[0];
        }
        function L(B) {
          var G = 0, N = B.charCodeAt(0);
          if (N >= 55296 && N <= 56319) {
            var V = B.charCodeAt(1);
            V >= 56320 && V <= 57343 && (G = (N - 55296) * 1024 + V - 56320 + 65536);
          }
          return G;
        }
        function D(B, G) {
          var N = B.toString(16) + G.toString(16);
          return F.indexOf(N) !== -1;
        }
        function O(B) {
          return B === k;
        }
        function z(B) {
          return B === w;
        }
        function W(B) {
          var G = L(B);
          return G >= C && G <= P;
        }
        function X(B) {
          return W(B.substr(0, 2)) && W(B.substr(2, 2));
        }
        function K(B) {
          return c.indexOf(B) !== -1;
        }
        function Y(B, G) {
          var N = L(B.substr(G, 2));
          if (N !== d)
            return !1;
          var V = 0;
          for (G += 2; V < 5; ) {
            if (N = L(B.substr(G, 2)), N < y || N > x)
              return !1;
            V += 1, G += 2;
          }
          return L(B.substr(G, 2)) === v;
        }
        function U() {
          this.isLoaded = !0;
        }
        var Z = function() {
          this.fonts = [], this.chars = null, this.typekitLoaded = 0, this.isLoaded = !1, this._warned = !1, this.initTime = Date.now(), this.setIsLoadedBinded = this.setIsLoaded.bind(this), this.checkLoadedFontsBinded = this.checkLoadedFonts.bind(this);
        };
        Z.isModifier = D, Z.isZeroWidthJoiner = O, Z.isFlagEmoji = X, Z.isRegionalCode = W, Z.isCombinedCharacter = K, Z.isRegionalFlag = Y, Z.isVariationSelector = z, Z.BLACK_FLAG_CODE_POINT = d;
        var q = {
          addChars: M,
          addFonts: R,
          getCharData: _,
          getFontByName: I,
          measureText: E,
          checkLoadedFonts: T,
          setIsLoaded: U
        };
        return Z.prototype = q, Z;
      })();
      function SlotManager(t) {
        this.animationData = t;
      }
      SlotManager.prototype.getProp = function(t) {
        return this.animationData.slots && this.animationData.slots[t.sid] ? Object.assign(t, this.animationData.slots[t.sid].p) : t;
      };
      function slotFactory(t) {
        return new SlotManager(t);
      }
      function RenderableElement() {
      }
      RenderableElement.prototype = {
        initRenderable: function() {
          this.isInRange = !1, this.hidden = !1, this.isTransparent = !1, this.renderableComponents = [];
        },
        addRenderableComponent: function(n) {
          this.renderableComponents.indexOf(n) === -1 && this.renderableComponents.push(n);
        },
        removeRenderableComponent: function(n) {
          this.renderableComponents.indexOf(n) !== -1 && this.renderableComponents.splice(this.renderableComponents.indexOf(n), 1);
        },
        prepareRenderableFrame: function(n) {
          this.checkLayerLimits(n);
        },
        checkTransparency: function() {
          this.finalTransform.mProp.o.v <= 0 ? !this.isTransparent && this.globalData.renderConfig.hideOnTransparent && (this.isTransparent = !0, this.hide()) : this.isTransparent && (this.isTransparent = !1, this.show());
        },
        /**
           * @function
           * Initializes frame related properties.
           *
           * @param {number} num
           * current frame number in Layer's time
           *
           */
        checkLayerLimits: function(n) {
          this.data.ip - this.data.st <= n && this.data.op - this.data.st > n ? this.isInRange !== !0 && (this.globalData._mdf = !0, this._mdf = !0, this.isInRange = !0, this.show()) : this.isInRange !== !1 && (this.globalData._mdf = !0, this.isInRange = !1, this.hide());
        },
        renderRenderable: function() {
          var n, c = this.renderableComponents.length;
          for (n = 0; n < c; n += 1)
            this.renderableComponents[n].renderFrame(this._isFirstFrame);
        },
        sourceRectAtTime: function() {
          return {
            top: 0,
            left: 0,
            width: 100,
            height: 100
          };
        },
        getLayerSize: function() {
          return this.data.ty === 5 ? {
            w: this.data.textData.width,
            h: this.data.textData.height
          } : {
            w: this.data.width,
            h: this.data.height
          };
        }
      };
      var getBlendMode = /* @__PURE__ */ (function() {
        var t = {
          0: "source-over",
          1: "multiply",
          2: "screen",
          3: "overlay",
          4: "darken",
          5: "lighten",
          6: "color-dodge",
          7: "color-burn",
          8: "hard-light",
          9: "soft-light",
          10: "difference",
          11: "exclusion",
          12: "hue",
          13: "saturation",
          14: "color",
          15: "luminosity"
        };
        return function(n) {
          return t[n] || "";
        };
      })();
      function SliderEffect(t, n, c) {
        this.p = PropertyFactory.getProp(n, t.v, 0, 0, c);
      }
      function AngleEffect(t, n, c) {
        this.p = PropertyFactory.getProp(n, t.v, 0, 0, c);
      }
      function ColorEffect(t, n, c) {
        this.p = PropertyFactory.getProp(n, t.v, 1, 0, c);
      }
      function PointEffect(t, n, c) {
        this.p = PropertyFactory.getProp(n, t.v, 1, 0, c);
      }
      function LayerIndexEffect(t, n, c) {
        this.p = PropertyFactory.getProp(n, t.v, 0, 0, c);
      }
      function MaskIndexEffect(t, n, c) {
        this.p = PropertyFactory.getProp(n, t.v, 0, 0, c);
      }
      function CheckboxEffect(t, n, c) {
        this.p = PropertyFactory.getProp(n, t.v, 0, 0, c);
      }
      function NoValueEffect() {
        this.p = {};
      }
      function EffectsManager(t, n) {
        var c = t.ef || [];
        this.effectElements = [];
        var d, v = c.length, y;
        for (d = 0; d < v; d += 1)
          y = new GroupEffect(c[d], n), this.effectElements.push(y);
      }
      function GroupEffect(t, n) {
        this.init(t, n);
      }
      extendPrototype([DynamicPropertyContainer], GroupEffect), GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties, GroupEffect.prototype.init = function(t, n) {
        this.data = t, this.effectElements = [], this.initDynamicPropertyContainer(n);
        var c, d = this.data.ef.length, v, y = this.data.ef;
        for (c = 0; c < d; c += 1) {
          switch (v = null, y[c].ty) {
            case 0:
              v = new SliderEffect(y[c], n, this);
              break;
            case 1:
              v = new AngleEffect(y[c], n, this);
              break;
            case 2:
              v = new ColorEffect(y[c], n, this);
              break;
            case 3:
              v = new PointEffect(y[c], n, this);
              break;
            case 4:
            case 7:
              v = new CheckboxEffect(y[c], n, this);
              break;
            case 10:
              v = new LayerIndexEffect(y[c], n, this);
              break;
            case 11:
              v = new MaskIndexEffect(y[c], n, this);
              break;
            case 5:
              v = new EffectsManager(y[c], n);
              break;
            // case 6:
            default:
              v = new NoValueEffect(y[c]);
              break;
          }
          v && this.effectElements.push(v);
        }
      };
      function BaseElement() {
      }
      BaseElement.prototype = {
        checkMasks: function() {
          if (!this.data.hasMask)
            return !1;
          for (var n = 0, c = this.data.masksProperties.length; n < c; ) {
            if (this.data.masksProperties[n].mode !== "n" && this.data.masksProperties[n].cl !== !1)
              return !0;
            n += 1;
          }
          return !1;
        },
        initExpressions: function() {
          var n = getExpressionInterfaces();
          if (n) {
            var c = n("layer"), d = n("effects"), v = n("shape"), y = n("text"), x = n("comp");
            this.layerInterface = c(this), this.data.hasMask && this.maskManager && this.layerInterface.registerMaskInterface(this.maskManager);
            var w = d.createEffectsInterface(this, this.layerInterface);
            this.layerInterface.registerEffectsInterface(w), this.data.ty === 0 || this.data.xt ? this.compInterface = x(this) : this.data.ty === 4 ? (this.layerInterface.shapeInterface = v(this.shapesData, this.itemsData, this.layerInterface), this.layerInterface.content = this.layerInterface.shapeInterface) : this.data.ty === 5 && (this.layerInterface.textInterface = y(this), this.layerInterface.text = this.layerInterface.textInterface);
          }
        },
        setBlendMode: function() {
          var n = getBlendMode(this.data.bm), c = this.baseElement || this.layerElement;
          c.style["mix-blend-mode"] = n;
        },
        initBaseData: function(n, c, d) {
          this.globalData = c, this.comp = d, this.data = n, this.layerId = createElementID(), this.data.sr || (this.data.sr = 1), this.effectsManager = new EffectsManager(this.data, this, this.dynamicProperties);
        },
        getType: function() {
          return this.type;
        },
        sourceRectAtTime: function() {
        }
      };
      function FrameElement() {
      }
      FrameElement.prototype = {
        /**
           * @function
           * Initializes frame related properties.
           *
           */
        initFrame: function() {
          this._isFirstFrame = !1, this.dynamicProperties = [], this._mdf = !1;
        },
        /**
           * @function
           * Calculates all dynamic values
           *
           * @param {number} num
           * current frame number in Layer's time
           * @param {boolean} isVisible
           * if layers is currently in range
           *
           */
        prepareProperties: function(n, c) {
          var d, v = this.dynamicProperties.length;
          for (d = 0; d < v; d += 1)
            (c || this._isParent && this.dynamicProperties[d].propType === "transform") && (this.dynamicProperties[d].getValue(), this.dynamicProperties[d]._mdf && (this.globalData._mdf = !0, this._mdf = !0));
        },
        addDynamicProperty: function(n) {
          this.dynamicProperties.indexOf(n) === -1 && this.dynamicProperties.push(n);
        }
      };
      function FootageElement(t, n, c) {
        this.initFrame(), this.initRenderable(), this.assetData = n.getAssetData(t.refId), this.footageData = n.imageLoader.getAsset(this.assetData), this.initBaseData(t, n, c);
      }
      FootageElement.prototype.prepareFrame = function() {
      }, extendPrototype([RenderableElement, BaseElement, FrameElement], FootageElement), FootageElement.prototype.getBaseElement = function() {
        return null;
      }, FootageElement.prototype.renderFrame = function() {
      }, FootageElement.prototype.destroy = function() {
      }, FootageElement.prototype.initExpressions = function() {
        var t = getExpressionInterfaces();
        if (t) {
          var n = t("footage");
          this.layerInterface = n(this);
        }
      }, FootageElement.prototype.getFootageData = function() {
        return this.footageData;
      };
      function AudioElement(t, n, c) {
        this.initFrame(), this.initRenderable(), this.assetData = n.getAssetData(t.refId), this.initBaseData(t, n, c), this._isPlaying = !1, this._canPlay = !1;
        var d = this.globalData.getAssetsPath(this.assetData);
        this.audio = this.globalData.audioController.createAudio(d), this._currentTime = 0, this.globalData.audioController.addAudio(this), this._volumeMultiplier = 1, this._volume = 1, this._previousVolume = null, this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, n.frameRate, this) : {
          _placeholder: !0
        }, this.lv = PropertyFactory.getProp(this, t.au && t.au.lv ? t.au.lv : {
          k: [100]
        }, 1, 0.01, this);
      }
      AudioElement.prototype.prepareFrame = function(t) {
        if (this.prepareRenderableFrame(t, !0), this.prepareProperties(t, !0), this.tm._placeholder)
          this._currentTime = t / this.data.sr;
        else {
          var n = this.tm.v;
          this._currentTime = n;
        }
        this._volume = this.lv.v[0];
        var c = this._volume * this._volumeMultiplier;
        this._previousVolume !== c && (this._previousVolume = c, this.audio.volume(c));
      }, extendPrototype([RenderableElement, BaseElement, FrameElement], AudioElement), AudioElement.prototype.renderFrame = function() {
        this.isInRange && this._canPlay && (this._isPlaying ? (!this.audio.playing() || Math.abs(this._currentTime / this.globalData.frameRate - this.audio.seek()) > 0.1) && this.audio.seek(this._currentTime / this.globalData.frameRate) : (this.audio.play(), this.audio.seek(this._currentTime / this.globalData.frameRate), this._isPlaying = !0));
      }, AudioElement.prototype.show = function() {
      }, AudioElement.prototype.hide = function() {
        this.audio.pause(), this._isPlaying = !1;
      }, AudioElement.prototype.pause = function() {
        this.audio.pause(), this._isPlaying = !1, this._canPlay = !1;
      }, AudioElement.prototype.resume = function() {
        this._canPlay = !0;
      }, AudioElement.prototype.setRate = function(t) {
        this.audio.rate(t);
      }, AudioElement.prototype.volume = function(t) {
        this._volumeMultiplier = t, this._previousVolume = t * this._volume, this.audio.volume(this._previousVolume);
      }, AudioElement.prototype.getBaseElement = function() {
        return null;
      }, AudioElement.prototype.destroy = function() {
      }, AudioElement.prototype.sourceRectAtTime = function() {
      }, AudioElement.prototype.initExpressions = function() {
      };
      function BaseRenderer() {
      }
      BaseRenderer.prototype.checkLayers = function(t) {
        var n, c = this.layers.length, d;
        for (this.completeLayers = !0, n = c - 1; n >= 0; n -= 1)
          this.elements[n] || (d = this.layers[n], d.ip - d.st <= t - this.layers[n].st && d.op - d.st > t - this.layers[n].st && this.buildItem(n)), this.completeLayers = this.elements[n] ? this.completeLayers : !1;
        this.checkPendingElements();
      }, BaseRenderer.prototype.createItem = function(t) {
        switch (t.ty) {
          case 2:
            return this.createImage(t);
          case 0:
            return this.createComp(t);
          case 1:
            return this.createSolid(t);
          case 3:
            return this.createNull(t);
          case 4:
            return this.createShape(t);
          case 5:
            return this.createText(t);
          case 6:
            return this.createAudio(t);
          case 13:
            return this.createCamera(t);
          case 15:
            return this.createFootage(t);
          default:
            return this.createNull(t);
        }
      }, BaseRenderer.prototype.createCamera = function() {
        throw new Error("You're using a 3d camera. Try the html renderer.");
      }, BaseRenderer.prototype.createAudio = function(t) {
        return new AudioElement(t, this.globalData, this);
      }, BaseRenderer.prototype.createFootage = function(t) {
        return new FootageElement(t, this.globalData, this);
      }, BaseRenderer.prototype.buildAllItems = function() {
        var t, n = this.layers.length;
        for (t = 0; t < n; t += 1)
          this.buildItem(t);
        this.checkPendingElements();
      }, BaseRenderer.prototype.includeLayers = function(t) {
        this.completeLayers = !1;
        var n, c = t.length, d, v = this.layers.length;
        for (n = 0; n < c; n += 1)
          for (d = 0; d < v; ) {
            if (this.layers[d].id === t[n].id) {
              this.layers[d] = t[n];
              break;
            }
            d += 1;
          }
      }, BaseRenderer.prototype.setProjectInterface = function(t) {
        this.globalData.projectInterface = t;
      }, BaseRenderer.prototype.initItems = function() {
        this.globalData.progressiveLoad || this.buildAllItems();
      }, BaseRenderer.prototype.buildElementParenting = function(t, n, c) {
        for (var d = this.elements, v = this.layers, y = 0, x = v.length; y < x; )
          v[y].ind == n && (!d[y] || d[y] === !0 ? (this.buildItem(y), this.addPendingElement(t)) : (c.push(d[y]), d[y].setAsParent(), v[y].parent !== void 0 ? this.buildElementParenting(t, v[y].parent, c) : t.setHierarchy(c))), y += 1;
      }, BaseRenderer.prototype.addPendingElement = function(t) {
        this.pendingElements.push(t);
      }, BaseRenderer.prototype.searchExtraCompositions = function(t) {
        var n, c = t.length;
        for (n = 0; n < c; n += 1)
          if (t[n].xt) {
            var d = this.createComp(t[n]);
            d.initExpressions(), this.globalData.projectInterface.registerComposition(d);
          }
      }, BaseRenderer.prototype.getElementById = function(t) {
        var n, c = this.elements.length;
        for (n = 0; n < c; n += 1)
          if (this.elements[n].data.ind === t)
            return this.elements[n];
        return null;
      }, BaseRenderer.prototype.getElementByPath = function(t) {
        var n = t.shift(), c;
        if (typeof n == "number")
          c = this.elements[n];
        else {
          var d, v = this.elements.length;
          for (d = 0; d < v; d += 1)
            if (this.elements[d].data.nm === n) {
              c = this.elements[d];
              break;
            }
        }
        return t.length === 0 ? c : c.getElementByPath(t);
      }, BaseRenderer.prototype.setupGlobalData = function(t, n) {
        this.globalData.fontManager = new FontManager(), this.globalData.slotManager = slotFactory(t), this.globalData.fontManager.addChars(t.chars), this.globalData.fontManager.addFonts(t.fonts, n), this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem), this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem), this.globalData.imageLoader = this.animationItem.imagePreloader, this.globalData.audioController = this.animationItem.audioController, this.globalData.frameId = 0, this.globalData.frameRate = t.fr, this.globalData.nm = t.nm, this.globalData.compSize = {
          w: t.w,
          h: t.h
        };
      };
      var effectTypes = {
        TRANSFORM_EFFECT: "transformEFfect"
      };
      function TransformElement() {
      }
      TransformElement.prototype = {
        initTransform: function() {
          var n = new Matrix();
          this.finalTransform = {
            mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this, this.data.ks, this) : {
              o: 0
            },
            _matMdf: !1,
            _localMatMdf: !1,
            _opMdf: !1,
            mat: n,
            localMat: n,
            localOpacity: 1
          }, this.data.ao && (this.finalTransform.mProp.autoOriented = !0), this.data.ty;
        },
        renderTransform: function() {
          if (this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this._isFirstFrame, this.finalTransform._matMdf = this.finalTransform.mProp._mdf || this._isFirstFrame, this.hierarchy) {
            var n, c = this.finalTransform.mat, d = 0, v = this.hierarchy.length;
            if (!this.finalTransform._matMdf)
              for (; d < v; ) {
                if (this.hierarchy[d].finalTransform.mProp._mdf) {
                  this.finalTransform._matMdf = !0;
                  break;
                }
                d += 1;
              }
            if (this.finalTransform._matMdf)
              for (n = this.finalTransform.mProp.v.props, c.cloneFromProps(n), d = 0; d < v; d += 1)
                c.multiply(this.hierarchy[d].finalTransform.mProp.v);
          }
          (!this.localTransforms || this.finalTransform._matMdf) && (this.finalTransform._localMatMdf = this.finalTransform._matMdf), this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v);
        },
        renderLocalTransform: function() {
          if (this.localTransforms) {
            var n = 0, c = this.localTransforms.length;
            if (this.finalTransform._localMatMdf = this.finalTransform._matMdf, !this.finalTransform._localMatMdf || !this.finalTransform._opMdf)
              for (; n < c; )
                this.localTransforms[n]._mdf && (this.finalTransform._localMatMdf = !0), this.localTransforms[n]._opMdf && !this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v, this.finalTransform._opMdf = !0), n += 1;
            if (this.finalTransform._localMatMdf) {
              var d = this.finalTransform.localMat;
              for (this.localTransforms[0].matrix.clone(d), n = 1; n < c; n += 1) {
                var v = this.localTransforms[n].matrix;
                d.multiply(v);
              }
              d.multiply(this.finalTransform.mat);
            }
            if (this.finalTransform._opMdf) {
              var y = this.finalTransform.localOpacity;
              for (n = 0; n < c; n += 1)
                y *= this.localTransforms[n].opacity * 0.01;
              this.finalTransform.localOpacity = y;
            }
          }
        },
        searchEffectTransforms: function() {
          if (this.renderableEffectsManager) {
            var n = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
            if (n.length) {
              this.localTransforms = [], this.finalTransform.localMat = new Matrix();
              var c = 0, d = n.length;
              for (c = 0; c < d; c += 1)
                this.localTransforms.push(n[c]);
            }
          }
        },
        globalToLocal: function(n) {
          var c = [];
          c.push(this.finalTransform);
          for (var d = !0, v = this.comp; d; )
            v.finalTransform ? (v.data.hasMask && c.splice(0, 0, v.finalTransform), v = v.comp) : d = !1;
          var y, x = c.length, w;
          for (y = 0; y < x; y += 1)
            w = c[y].mat.applyToPointArray(0, 0, 0), n = [n[0] - w[0], n[1] - w[1], 0];
          return n;
        },
        mHelper: new Matrix()
      };
      function MaskElement(t, n, c) {
        this.data = t, this.element = n, this.globalData = c, this.storedData = [], this.masksProperties = this.data.masksProperties || [], this.maskElement = null;
        var d = this.globalData.defs, v, y = this.masksProperties ? this.masksProperties.length : 0;
        this.viewData = createSizedArray(y), this.solidPath = "";
        var x, w = this.masksProperties, k = 0, C = [], P, F, S = createElementID(), j, T, A, R, M = "clipPath", _ = "clip-path";
        for (v = 0; v < y; v += 1)
          if ((w[v].mode !== "a" && w[v].mode !== "n" || w[v].inv || w[v].o.k !== 100 || w[v].o.x) && (M = "mask", _ = "mask"), (w[v].mode === "s" || w[v].mode === "i") && k === 0 ? (j = createNS("rect"), j.setAttribute("fill", "#ffffff"), j.setAttribute("width", this.element.comp.data.w || 0), j.setAttribute("height", this.element.comp.data.h || 0), C.push(j)) : j = null, x = createNS("path"), w[v].mode === "n")
            this.viewData[v] = {
              op: PropertyFactory.getProp(this.element, w[v].o, 0, 0.01, this.element),
              prop: ShapePropertyFactory.getShapeProp(this.element, w[v], 3),
              elem: x,
              lastPath: ""
            }, d.appendChild(x);
          else {
            k += 1, x.setAttribute("fill", w[v].mode === "s" ? "#000000" : "#ffffff"), x.setAttribute("clip-rule", "nonzero");
            var E;
            if (w[v].x.k !== 0 ? (M = "mask", _ = "mask", R = PropertyFactory.getProp(this.element, w[v].x, 0, null, this.element), E = createElementID(), T = createNS("filter"), T.setAttribute("id", E), A = createNS("feMorphology"), A.setAttribute("operator", "erode"), A.setAttribute("in", "SourceGraphic"), A.setAttribute("radius", "0"), T.appendChild(A), d.appendChild(T), x.setAttribute("stroke", w[v].mode === "s" ? "#000000" : "#ffffff")) : (A = null, R = null), this.storedData[v] = {
              elem: x,
              x: R,
              expan: A,
              lastPath: "",
              lastOperator: "",
              filterId: E,
              lastRadius: 0
            }, w[v].mode === "i") {
              F = C.length;
              var I = createNS("g");
              for (P = 0; P < F; P += 1)
                I.appendChild(C[P]);
              var L = createNS("mask");
              L.setAttribute("mask-type", "alpha"), L.setAttribute("id", S + "_" + k), L.appendChild(x), d.appendChild(L), I.setAttribute("mask", "url(" + getLocationHref() + "#" + S + "_" + k + ")"), C.length = 0, C.push(I);
            } else
              C.push(x);
            w[v].inv && !this.solidPath && (this.solidPath = this.createLayerSolidPath()), this.viewData[v] = {
              elem: x,
              lastPath: "",
              op: PropertyFactory.getProp(this.element, w[v].o, 0, 0.01, this.element),
              prop: ShapePropertyFactory.getShapeProp(this.element, w[v], 3),
              invRect: j
            }, this.viewData[v].prop.k || this.drawPath(w[v], this.viewData[v].prop.v, this.viewData[v]);
          }
        for (this.maskElement = createNS(M), y = C.length, v = 0; v < y; v += 1)
          this.maskElement.appendChild(C[v]);
        k > 0 && (this.maskElement.setAttribute("id", S), this.element.maskedElement.setAttribute(_, "url(" + getLocationHref() + "#" + S + ")"), d.appendChild(this.maskElement)), this.viewData.length && this.element.addRenderableComponent(this);
      }
      MaskElement.prototype.getMaskProperty = function(t) {
        return this.viewData[t].prop;
      }, MaskElement.prototype.renderFrame = function(t) {
        var n = this.element.finalTransform.mat, c, d = this.masksProperties.length;
        for (c = 0; c < d; c += 1)
          if ((this.viewData[c].prop._mdf || t) && this.drawPath(this.masksProperties[c], this.viewData[c].prop.v, this.viewData[c]), (this.viewData[c].op._mdf || t) && this.viewData[c].elem.setAttribute("fill-opacity", this.viewData[c].op.v), this.masksProperties[c].mode !== "n" && (this.viewData[c].invRect && (this.element.finalTransform.mProp._mdf || t) && this.viewData[c].invRect.setAttribute("transform", n.getInverseMatrix().to2dCSS()), this.storedData[c].x && (this.storedData[c].x._mdf || t))) {
            var v = this.storedData[c].expan;
            this.storedData[c].x.v < 0 ? (this.storedData[c].lastOperator !== "erode" && (this.storedData[c].lastOperator = "erode", this.storedData[c].elem.setAttribute("filter", "url(" + getLocationHref() + "#" + this.storedData[c].filterId + ")")), v.setAttribute("radius", -this.storedData[c].x.v)) : (this.storedData[c].lastOperator !== "dilate" && (this.storedData[c].lastOperator = "dilate", this.storedData[c].elem.setAttribute("filter", null)), this.storedData[c].elem.setAttribute("stroke-width", this.storedData[c].x.v * 2));
          }
      }, MaskElement.prototype.getMaskelement = function() {
        return this.maskElement;
      }, MaskElement.prototype.createLayerSolidPath = function() {
        var t = "M0,0 ";
        return t += " h" + this.globalData.compSize.w, t += " v" + this.globalData.compSize.h, t += " h-" + this.globalData.compSize.w, t += " v-" + this.globalData.compSize.h + " ", t;
      }, MaskElement.prototype.drawPath = function(t, n, c) {
        var d = " M" + n.v[0][0] + "," + n.v[0][1], v, y;
        for (y = n._length, v = 1; v < y; v += 1)
          d += " C" + n.o[v - 1][0] + "," + n.o[v - 1][1] + " " + n.i[v][0] + "," + n.i[v][1] + " " + n.v[v][0] + "," + n.v[v][1];
        if (n.c && y > 1 && (d += " C" + n.o[v - 1][0] + "," + n.o[v - 1][1] + " " + n.i[0][0] + "," + n.i[0][1] + " " + n.v[0][0] + "," + n.v[0][1]), c.lastPath !== d) {
          var x = "";
          c.elem && (n.c && (x = t.inv ? this.solidPath + d : d), c.elem.setAttribute("d", x)), c.lastPath = d;
        }
      }, MaskElement.prototype.destroy = function() {
        this.element = null, this.globalData = null, this.maskElement = null, this.data = null, this.masksProperties = null;
      };
      var filtersFactory = (function() {
        var t = {};
        t.createFilter = n, t.createAlphaToLuminanceFilter = c;
        function n(d, v) {
          var y = createNS("filter");
          return y.setAttribute("id", d), v !== !0 && (y.setAttribute("filterUnits", "objectBoundingBox"), y.setAttribute("x", "0%"), y.setAttribute("y", "0%"), y.setAttribute("width", "100%"), y.setAttribute("height", "100%")), y;
        }
        function c() {
          var d = createNS("feColorMatrix");
          return d.setAttribute("type", "matrix"), d.setAttribute("color-interpolation-filters", "sRGB"), d.setAttribute("values", "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1"), d;
        }
        return t;
      })(), featureSupport = (function() {
        var t = {
          maskType: !0,
          svgLumaHidden: !0,
          offscreenCanvas: typeof OffscreenCanvas < "u"
        };
        return (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) && (t.maskType = !1), /firefox/i.test(navigator.userAgent) && (t.svgLumaHidden = !1), t;
      })(), registeredEffects$1 = {}, idPrefix = "filter_result_";
      function SVGEffects(t) {
        var n, c = "SourceGraphic", d = t.data.ef ? t.data.ef.length : 0, v = createElementID(), y = filtersFactory.createFilter(v, !0), x = 0;
        this.filters = [];
        var w;
        for (n = 0; n < d; n += 1) {
          w = null;
          var k = t.data.ef[n].ty;
          if (registeredEffects$1[k]) {
            var C = registeredEffects$1[k].effect;
            w = new C(y, t.effectsManager.effectElements[n], t, idPrefix + x, c), c = idPrefix + x, registeredEffects$1[k].countsAsEffect && (x += 1);
          }
          w && this.filters.push(w);
        }
        x && (t.globalData.defs.appendChild(y), t.layerElement.setAttribute("filter", "url(" + getLocationHref() + "#" + v + ")")), this.filters.length && t.addRenderableComponent(this);
      }
      SVGEffects.prototype.renderFrame = function(t) {
        var n, c = this.filters.length;
        for (n = 0; n < c; n += 1)
          this.filters[n].renderFrame(t);
      }, SVGEffects.prototype.getEffects = function(t) {
        var n, c = this.filters.length, d = [];
        for (n = 0; n < c; n += 1)
          this.filters[n].type === t && d.push(this.filters[n]);
        return d;
      };
      function registerEffect$1(t, n, c) {
        registeredEffects$1[t] = {
          effect: n,
          countsAsEffect: c
        };
      }
      function SVGBaseElement() {
      }
      SVGBaseElement.prototype = {
        initRendererElement: function() {
          this.layerElement = createNS("g");
        },
        createContainerElements: function() {
          this.matteElement = createNS("g"), this.transformedElement = this.layerElement, this.maskedElement = this.layerElement, this._sizeChanged = !1;
          var n = null;
          if (this.data.td) {
            this.matteMasks = {};
            var c = createNS("g");
            c.setAttribute("id", this.layerId), c.appendChild(this.layerElement), n = c, this.globalData.defs.appendChild(c);
          } else this.data.tt ? (this.matteElement.appendChild(this.layerElement), n = this.matteElement, this.baseElement = this.matteElement) : this.baseElement = this.layerElement;
          if (this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data.cl && this.layerElement.setAttribute("class", this.data.cl), this.data.ty === 0 && !this.data.hd) {
            var d = createNS("clipPath"), v = createNS("path");
            v.setAttribute("d", "M0,0 L" + this.data.w + ",0 L" + this.data.w + "," + this.data.h + " L0," + this.data.h + "z");
            var y = createElementID();
            if (d.setAttribute("id", y), d.appendChild(v), this.globalData.defs.appendChild(d), this.checkMasks()) {
              var x = createNS("g");
              x.setAttribute("clip-path", "url(" + getLocationHref() + "#" + y + ")"), x.appendChild(this.layerElement), this.transformedElement = x, n ? n.appendChild(this.transformedElement) : this.baseElement = this.transformedElement;
            } else
              this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + y + ")");
          }
          this.data.bm !== 0 && this.setBlendMode();
        },
        renderElement: function() {
          this.finalTransform._localMatMdf && this.transformedElement.setAttribute("transform", this.finalTransform.localMat.to2dCSS()), this.finalTransform._opMdf && this.transformedElement.setAttribute("opacity", this.finalTransform.localOpacity);
        },
        destroyBaseElement: function() {
          this.layerElement = null, this.matteElement = null, this.maskManager.destroy();
        },
        getBaseElement: function() {
          return this.data.hd ? null : this.baseElement;
        },
        createRenderableComponents: function() {
          this.maskManager = new MaskElement(this.data, this, this.globalData), this.renderableEffectsManager = new SVGEffects(this), this.searchEffectTransforms();
        },
        getMatte: function(n) {
          if (this.matteMasks || (this.matteMasks = {}), !this.matteMasks[n]) {
            var c = this.layerId + "_" + n, d, v, y, x;
            if (n === 1 || n === 3) {
              var w = createNS("mask");
              w.setAttribute("id", c), w.setAttribute("mask-type", n === 3 ? "luminance" : "alpha"), y = createNS("use"), y.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId), w.appendChild(y), this.globalData.defs.appendChild(w), !featureSupport.maskType && n === 1 && (w.setAttribute("mask-type", "luminance"), d = createElementID(), v = filtersFactory.createFilter(d), this.globalData.defs.appendChild(v), v.appendChild(filtersFactory.createAlphaToLuminanceFilter()), x = createNS("g"), x.appendChild(y), w.appendChild(x), x.setAttribute("filter", "url(" + getLocationHref() + "#" + d + ")"));
            } else if (n === 2) {
              var k = createNS("mask");
              k.setAttribute("id", c), k.setAttribute("mask-type", "alpha");
              var C = createNS("g");
              k.appendChild(C), d = createElementID(), v = filtersFactory.createFilter(d);
              var P = createNS("feComponentTransfer");
              P.setAttribute("in", "SourceGraphic"), v.appendChild(P);
              var F = createNS("feFuncA");
              F.setAttribute("type", "table"), F.setAttribute("tableValues", "1.0 0.0"), P.appendChild(F), this.globalData.defs.appendChild(v);
              var S = createNS("rect");
              S.setAttribute("width", this.comp.data.w), S.setAttribute("height", this.comp.data.h), S.setAttribute("x", "0"), S.setAttribute("y", "0"), S.setAttribute("fill", "#ffffff"), S.setAttribute("opacity", "0"), C.setAttribute("filter", "url(" + getLocationHref() + "#" + d + ")"), C.appendChild(S), y = createNS("use"), y.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId), C.appendChild(y), featureSupport.maskType || (k.setAttribute("mask-type", "luminance"), v.appendChild(filtersFactory.createAlphaToLuminanceFilter()), x = createNS("g"), C.appendChild(S), x.appendChild(this.layerElement), C.appendChild(x)), this.globalData.defs.appendChild(k);
            }
            this.matteMasks[n] = c;
          }
          return this.matteMasks[n];
        },
        setMatte: function(n) {
          this.matteElement && this.matteElement.setAttribute("mask", "url(" + getLocationHref() + "#" + n + ")");
        }
      };
      function HierarchyElement() {
      }
      HierarchyElement.prototype = {
        /**
           * @function
           * Initializes hierarchy properties
           *
           */
        initHierarchy: function() {
          this.hierarchy = [], this._isParent = !1, this.checkParenting();
        },
        /**
           * @function
           * Sets layer's hierarchy.
           * @param {array} hierarch
           * layer's parent list
           *
           */
        setHierarchy: function(n) {
          this.hierarchy = n;
        },
        /**
           * @function
           * Sets layer as parent.
           *
           */
        setAsParent: function() {
          this._isParent = !0;
        },
        /**
           * @function
           * Searches layer's parenting chain
           *
           */
        checkParenting: function() {
          this.data.parent !== void 0 && this.comp.buildElementParenting(this, this.data.parent, []);
        }
      };
      function RenderableDOMElement() {
      }
      (function() {
        var t = {
          initElement: function(c, d, v) {
            this.initFrame(), this.initBaseData(c, d, v), this.initTransform(c, d, v), this.initHierarchy(), this.initRenderable(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), this.createContent(), this.hide();
          },
          hide: function() {
            if (!this.hidden && (!this.isInRange || this.isTransparent)) {
              var c = this.baseElement || this.layerElement;
              c.style.display = "none", this.hidden = !0;
            }
          },
          show: function() {
            if (this.isInRange && !this.isTransparent) {
              if (!this.data.hd) {
                var c = this.baseElement || this.layerElement;
                c.style.display = "block";
              }
              this.hidden = !1, this._isFirstFrame = !0;
            }
          },
          renderFrame: function() {
            this.data.hd || this.hidden || (this.renderTransform(), this.renderRenderable(), this.renderLocalTransform(), this.renderElement(), this.renderInnerContent(), this._isFirstFrame && (this._isFirstFrame = !1));
          },
          renderInnerContent: function() {
          },
          prepareFrame: function(c) {
            this._mdf = !1, this.prepareRenderableFrame(c), this.prepareProperties(c, this.isInRange), this.checkTransparency();
          },
          destroy: function() {
            this.innerElem = null, this.destroyBaseElement();
          }
        };
        extendPrototype([RenderableElement, createProxyFunction(t)], RenderableDOMElement);
      })();
      function IImageElement(t, n, c) {
        this.assetData = n.getAssetData(t.refId), this.assetData && this.assetData.sid && (this.assetData = n.slotManager.getProp(this.assetData)), this.initElement(t, n, c), this.sourceRect = {
          top: 0,
          left: 0,
          width: this.assetData.w,
          height: this.assetData.h
        };
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], IImageElement), IImageElement.prototype.createContent = function() {
        var t = this.globalData.getAssetsPath(this.assetData);
        this.innerElem = createNS("image"), this.innerElem.setAttribute("width", this.assetData.w + "px"), this.innerElem.setAttribute("height", this.assetData.h + "px"), this.innerElem.setAttribute("preserveAspectRatio", this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio), this.innerElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", t), this.layerElement.appendChild(this.innerElem);
      }, IImageElement.prototype.sourceRectAtTime = function() {
        return this.sourceRect;
      };
      function ProcessedElement(t, n) {
        this.elem = t, this.pos = n;
      }
      function IShapeElement() {
      }
      IShapeElement.prototype = {
        addShapeToModifiers: function(n) {
          var c, d = this.shapeModifiers.length;
          for (c = 0; c < d; c += 1)
            this.shapeModifiers[c].addShape(n);
        },
        isShapeInAnimatedModifiers: function(n) {
          for (var c = 0, d = this.shapeModifiers.length; c < d; )
            if (this.shapeModifiers[c].isAnimatedWithShape(n))
              return !0;
          return !1;
        },
        renderModifiers: function() {
          if (this.shapeModifiers.length) {
            var n, c = this.shapes.length;
            for (n = 0; n < c; n += 1)
              this.shapes[n].sh.reset();
            c = this.shapeModifiers.length;
            var d;
            for (n = c - 1; n >= 0 && (d = this.shapeModifiers[n].processShapes(this._isFirstFrame), !d); n -= 1)
              ;
          }
        },
        searchProcessedElement: function(n) {
          for (var c = this.processedElements, d = 0, v = c.length; d < v; ) {
            if (c[d].elem === n)
              return c[d].pos;
            d += 1;
          }
          return 0;
        },
        addProcessedElement: function(n, c) {
          for (var d = this.processedElements, v = d.length; v; )
            if (v -= 1, d[v].elem === n) {
              d[v].pos = c;
              return;
            }
          d.push(new ProcessedElement(n, c));
        },
        prepareFrame: function(n) {
          this.prepareRenderableFrame(n), this.prepareProperties(n, this.isInRange);
        }
      };
      var lineCapEnum = {
        1: "butt",
        2: "round",
        3: "square"
      }, lineJoinEnum = {
        1: "miter",
        2: "round",
        3: "bevel"
      };
      function SVGShapeData(t, n, c) {
        this.caches = [], this.styles = [], this.transformers = t, this.lStr = "", this.sh = c, this.lvl = n, this._isAnimated = !!c.k;
        for (var d = 0, v = t.length; d < v; ) {
          if (t[d].mProps.dynamicProperties.length) {
            this._isAnimated = !0;
            break;
          }
          d += 1;
        }
      }
      SVGShapeData.prototype.setAsAnimated = function() {
        this._isAnimated = !0;
      };
      function SVGStyleData(t, n) {
        this.data = t, this.type = t.ty, this.d = "", this.lvl = n, this._mdf = !1, this.closed = t.hd === !0, this.pElem = createNS("path"), this.msElem = null;
      }
      SVGStyleData.prototype.reset = function() {
        this.d = "", this._mdf = !1;
      };
      function DashProperty(t, n, c, d) {
        this.elem = t, this.frameId = -1, this.dataProps = createSizedArray(n.length), this.renderer = c, this.k = !1, this.dashStr = "", this.dashArray = createTypedArray("float32", n.length ? n.length - 1 : 0), this.dashoffset = createTypedArray("float32", 1), this.initDynamicPropertyContainer(d);
        var v, y = n.length || 0, x;
        for (v = 0; v < y; v += 1)
          x = PropertyFactory.getProp(t, n[v].v, 0, 0, this), this.k = x.k || this.k, this.dataProps[v] = {
            n: n[v].n,
            p: x
          };
        this.k || this.getValue(!0), this._isAnimated = this.k;
      }
      DashProperty.prototype.getValue = function(t) {
        if (!(this.elem.globalData.frameId === this.frameId && !t) && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf = this._mdf || t, this._mdf)) {
          var n = 0, c = this.dataProps.length;
          for (this.renderer === "svg" && (this.dashStr = ""), n = 0; n < c; n += 1)
            this.dataProps[n].n !== "o" ? this.renderer === "svg" ? this.dashStr += " " + this.dataProps[n].p.v : this.dashArray[n] = this.dataProps[n].p.v : this.dashoffset[0] = this.dataProps[n].p.v;
        }
      }, extendPrototype([DynamicPropertyContainer], DashProperty);
      function SVGStrokeStyleData(t, n, c) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(t, n.o, 0, 0.01, this), this.w = PropertyFactory.getProp(t, n.w, 0, null, this), this.d = new DashProperty(t, n.d || {}, "svg", this), this.c = PropertyFactory.getProp(t, n.c, 1, 255, this), this.style = c, this._isAnimated = !!this._isAnimated;
      }
      extendPrototype([DynamicPropertyContainer], SVGStrokeStyleData);
      function SVGFillStyleData(t, n, c) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(t, n.o, 0, 0.01, this), this.c = PropertyFactory.getProp(t, n.c, 1, 255, this), this.style = c;
      }
      extendPrototype([DynamicPropertyContainer], SVGFillStyleData);
      function SVGNoStyleData(t, n, c) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.style = c;
      }
      extendPrototype([DynamicPropertyContainer], SVGNoStyleData);
      function GradientProperty(t, n, c) {
        this.data = n, this.c = createTypedArray("uint8c", n.p * 4);
        var d = n.k.k[0].s ? n.k.k[0].s.length - n.p * 4 : n.k.k.length - n.p * 4;
        this.o = createTypedArray("float32", d), this._cmdf = !1, this._omdf = !1, this._collapsable = this.checkCollapsable(), this._hasOpacity = d, this.initDynamicPropertyContainer(c), this.prop = PropertyFactory.getProp(t, n.k, 1, null, this), this.k = this.prop.k, this.getValue(!0);
      }
      GradientProperty.prototype.comparePoints = function(t, n) {
        for (var c = 0, d = this.o.length / 2, v; c < d; ) {
          if (v = Math.abs(t[c * 4] - t[n * 4 + c * 2]), v > 0.01)
            return !1;
          c += 1;
        }
        return !0;
      }, GradientProperty.prototype.checkCollapsable = function() {
        if (this.o.length / 2 !== this.c.length / 4)
          return !1;
        if (this.data.k.k[0].s)
          for (var t = 0, n = this.data.k.k.length; t < n; ) {
            if (!this.comparePoints(this.data.k.k[t].s, this.data.p))
              return !1;
            t += 1;
          }
        else if (!this.comparePoints(this.data.k.k, this.data.p))
          return !1;
        return !0;
      }, GradientProperty.prototype.getValue = function(t) {
        if (this.prop.getValue(), this._mdf = !1, this._cmdf = !1, this._omdf = !1, this.prop._mdf || t) {
          var n, c = this.data.p * 4, d, v;
          for (n = 0; n < c; n += 1)
            d = n % 4 === 0 ? 100 : 255, v = Math.round(this.prop.v[n] * d), this.c[n] !== v && (this.c[n] = v, this._cmdf = !t);
          if (this.o.length)
            for (c = this.prop.v.length, n = this.data.p * 4; n < c; n += 1)
              d = n % 2 === 0 ? 100 : 1, v = n % 2 === 0 ? Math.round(this.prop.v[n] * 100) : this.prop.v[n], this.o[n - this.data.p * 4] !== v && (this.o[n - this.data.p * 4] = v, this._omdf = !t);
          this._mdf = !t;
        }
      }, extendPrototype([DynamicPropertyContainer], GradientProperty);
      function SVGGradientFillStyleData(t, n, c) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.initGradientData(t, n, c);
      }
      SVGGradientFillStyleData.prototype.initGradientData = function(t, n, c) {
        this.o = PropertyFactory.getProp(t, n.o, 0, 0.01, this), this.s = PropertyFactory.getProp(t, n.s, 1, null, this), this.e = PropertyFactory.getProp(t, n.e, 1, null, this), this.h = PropertyFactory.getProp(t, n.h || {
          k: 0
        }, 0, 0.01, this), this.a = PropertyFactory.getProp(t, n.a || {
          k: 0
        }, 0, degToRads, this), this.g = new GradientProperty(t, n.g, this), this.style = c, this.stops = [], this.setGradientData(c.pElem, n), this.setGradientOpacity(n, c), this._isAnimated = !!this._isAnimated;
      }, SVGGradientFillStyleData.prototype.setGradientData = function(t, n) {
        var c = createElementID(), d = createNS(n.t === 1 ? "linearGradient" : "radialGradient");
        d.setAttribute("id", c), d.setAttribute("spreadMethod", "pad"), d.setAttribute("gradientUnits", "userSpaceOnUse");
        var v = [], y, x, w;
        for (w = n.g.p * 4, x = 0; x < w; x += 4)
          y = createNS("stop"), d.appendChild(y), v.push(y);
        t.setAttribute(n.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + c + ")"), this.gf = d, this.cst = v;
      }, SVGGradientFillStyleData.prototype.setGradientOpacity = function(t, n) {
        if (this.g._hasOpacity && !this.g._collapsable) {
          var c, d, v, y = createNS("mask"), x = createNS("path");
          y.appendChild(x);
          var w = createElementID(), k = createElementID();
          y.setAttribute("id", k);
          var C = createNS(t.t === 1 ? "linearGradient" : "radialGradient");
          C.setAttribute("id", w), C.setAttribute("spreadMethod", "pad"), C.setAttribute("gradientUnits", "userSpaceOnUse"), v = t.g.k.k[0].s ? t.g.k.k[0].s.length : t.g.k.k.length;
          var P = this.stops;
          for (d = t.g.p * 4; d < v; d += 2)
            c = createNS("stop"), c.setAttribute("stop-color", "rgb(255,255,255)"), C.appendChild(c), P.push(c);
          x.setAttribute(t.ty === "gf" ? "fill" : "stroke", "url(" + getLocationHref() + "#" + w + ")"), t.ty === "gs" && (x.setAttribute("stroke-linecap", lineCapEnum[t.lc || 2]), x.setAttribute("stroke-linejoin", lineJoinEnum[t.lj || 2]), t.lj === 1 && x.setAttribute("stroke-miterlimit", t.ml)), this.of = C, this.ms = y, this.ost = P, this.maskId = k, n.msElem = x;
        }
      }, extendPrototype([DynamicPropertyContainer], SVGGradientFillStyleData);
      function SVGGradientStrokeStyleData(t, n, c) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.w = PropertyFactory.getProp(t, n.w, 0, null, this), this.d = new DashProperty(t, n.d || {}, "svg", this), this.initGradientData(t, n, c), this._isAnimated = !!this._isAnimated;
      }
      extendPrototype([SVGGradientFillStyleData, DynamicPropertyContainer], SVGGradientStrokeStyleData);
      function ShapeGroupData() {
        this.it = [], this.prevViewData = [], this.gr = createNS("g");
      }
      function SVGTransformData(t, n, c) {
        this.transform = {
          mProps: t,
          op: n,
          container: c
        }, this.elements = [], this._isAnimated = this.transform.mProps.dynamicProperties.length || this.transform.op.effectsSequence.length;
      }
      var buildShapeString = function(n, c, d, v) {
        if (c === 0)
          return "";
        var y = n.o, x = n.i, w = n.v, k, C = " M" + v.applyToPointStringified(w[0][0], w[0][1]);
        for (k = 1; k < c; k += 1)
          C += " C" + v.applyToPointStringified(y[k - 1][0], y[k - 1][1]) + " " + v.applyToPointStringified(x[k][0], x[k][1]) + " " + v.applyToPointStringified(w[k][0], w[k][1]);
        return d && c && (C += " C" + v.applyToPointStringified(y[k - 1][0], y[k - 1][1]) + " " + v.applyToPointStringified(x[0][0], x[0][1]) + " " + v.applyToPointStringified(w[0][0], w[0][1]), C += "z"), C;
      }, SVGElementsRenderer = (function() {
        var t = new Matrix(), n = new Matrix(), c = {
          createRenderFunction: d
        };
        function d(F) {
          switch (F.ty) {
            case "fl":
              return w;
            case "gf":
              return C;
            case "gs":
              return k;
            case "st":
              return P;
            case "sh":
            case "el":
            case "rc":
            case "sr":
              return x;
            case "tr":
              return v;
            case "no":
              return y;
            default:
              return null;
          }
        }
        function v(F, S, j) {
          (j || S.transform.op._mdf) && S.transform.container.setAttribute("opacity", S.transform.op.v), (j || S.transform.mProps._mdf) && S.transform.container.setAttribute("transform", S.transform.mProps.v.to2dCSS());
        }
        function y() {
        }
        function x(F, S, j) {
          var T, A, R, M, _, E, I = S.styles.length, L = S.lvl, D, O, z, W;
          for (E = 0; E < I; E += 1) {
            if (M = S.sh._mdf || j, S.styles[E].lvl < L) {
              for (O = n.reset(), z = L - S.styles[E].lvl, W = S.transformers.length - 1; !M && z > 0; )
                M = S.transformers[W].mProps._mdf || M, z -= 1, W -= 1;
              if (M)
                for (z = L - S.styles[E].lvl, W = S.transformers.length - 1; z > 0; )
                  O.multiply(S.transformers[W].mProps.v), z -= 1, W -= 1;
            } else
              O = t;
            if (D = S.sh.paths, A = D._length, M) {
              for (R = "", T = 0; T < A; T += 1)
                _ = D.shapes[T], _ && _._length && (R += buildShapeString(_, _._length, _.c, O));
              S.caches[E] = R;
            } else
              R = S.caches[E];
            S.styles[E].d += F.hd === !0 ? "" : R, S.styles[E]._mdf = M || S.styles[E]._mdf;
          }
        }
        function w(F, S, j) {
          var T = S.style;
          (S.c._mdf || j) && T.pElem.setAttribute("fill", "rgb(" + bmFloor(S.c.v[0]) + "," + bmFloor(S.c.v[1]) + "," + bmFloor(S.c.v[2]) + ")"), (S.o._mdf || j) && T.pElem.setAttribute("fill-opacity", S.o.v);
        }
        function k(F, S, j) {
          C(F, S, j), P(F, S, j);
        }
        function C(F, S, j) {
          var T = S.gf, A = S.g._hasOpacity, R = S.s.v, M = S.e.v;
          if (S.o._mdf || j) {
            var _ = F.ty === "gf" ? "fill-opacity" : "stroke-opacity";
            S.style.pElem.setAttribute(_, S.o.v);
          }
          if (S.s._mdf || j) {
            var E = F.t === 1 ? "x1" : "cx", I = E === "x1" ? "y1" : "cy";
            T.setAttribute(E, R[0]), T.setAttribute(I, R[1]), A && !S.g._collapsable && (S.of.setAttribute(E, R[0]), S.of.setAttribute(I, R[1]));
          }
          var L, D, O, z;
          if (S.g._cmdf || j) {
            L = S.cst;
            var W = S.g.c;
            for (O = L.length, D = 0; D < O; D += 1)
              z = L[D], z.setAttribute("offset", W[D * 4] + "%"), z.setAttribute("stop-color", "rgb(" + W[D * 4 + 1] + "," + W[D * 4 + 2] + "," + W[D * 4 + 3] + ")");
          }
          if (A && (S.g._omdf || j)) {
            var X = S.g.o;
            for (S.g._collapsable ? L = S.cst : L = S.ost, O = L.length, D = 0; D < O; D += 1)
              z = L[D], S.g._collapsable || z.setAttribute("offset", X[D * 2] + "%"), z.setAttribute("stop-opacity", X[D * 2 + 1]);
          }
          if (F.t === 1)
            (S.e._mdf || j) && (T.setAttribute("x2", M[0]), T.setAttribute("y2", M[1]), A && !S.g._collapsable && (S.of.setAttribute("x2", M[0]), S.of.setAttribute("y2", M[1])));
          else {
            var K;
            if ((S.s._mdf || S.e._mdf || j) && (K = Math.sqrt(Math.pow(R[0] - M[0], 2) + Math.pow(R[1] - M[1], 2)), T.setAttribute("r", K), A && !S.g._collapsable && S.of.setAttribute("r", K)), S.s._mdf || S.e._mdf || S.h._mdf || S.a._mdf || j) {
              K || (K = Math.sqrt(Math.pow(R[0] - M[0], 2) + Math.pow(R[1] - M[1], 2)));
              var Y = Math.atan2(M[1] - R[1], M[0] - R[0]), U = S.h.v;
              U >= 1 ? U = 0.99 : U <= -1 && (U = -0.99);
              var Z = K * U, q = Math.cos(Y + S.a.v) * Z + R[0], B = Math.sin(Y + S.a.v) * Z + R[1];
              T.setAttribute("fx", q), T.setAttribute("fy", B), A && !S.g._collapsable && (S.of.setAttribute("fx", q), S.of.setAttribute("fy", B));
            }
          }
        }
        function P(F, S, j) {
          var T = S.style, A = S.d;
          A && (A._mdf || j) && A.dashStr && (T.pElem.setAttribute("stroke-dasharray", A.dashStr), T.pElem.setAttribute("stroke-dashoffset", A.dashoffset[0])), S.c && (S.c._mdf || j) && T.pElem.setAttribute("stroke", "rgb(" + bmFloor(S.c.v[0]) + "," + bmFloor(S.c.v[1]) + "," + bmFloor(S.c.v[2]) + ")"), (S.o._mdf || j) && T.pElem.setAttribute("stroke-opacity", S.o.v), (S.w._mdf || j) && (T.pElem.setAttribute("stroke-width", S.w.v), T.msElem && T.msElem.setAttribute("stroke-width", S.w.v));
        }
        return c;
      })();
      function SVGShapeElement(t, n, c) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.initElement(t, n, c), this.prevViewData = [];
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableDOMElement], SVGShapeElement), SVGShapeElement.prototype.initSecondaryElement = function() {
      }, SVGShapeElement.prototype.identityMatrix = new Matrix(), SVGShapeElement.prototype.buildExpressionInterface = function() {
      }, SVGShapeElement.prototype.createContent = function() {
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], !0), this.filterUniqueShapes();
      }, SVGShapeElement.prototype.filterUniqueShapes = function() {
        var t, n = this.shapes.length, c, d, v = this.stylesList.length, y, x = [], w = !1;
        for (d = 0; d < v; d += 1) {
          for (y = this.stylesList[d], w = !1, x.length = 0, t = 0; t < n; t += 1)
            c = this.shapes[t], c.styles.indexOf(y) !== -1 && (x.push(c), w = c._isAnimated || w);
          x.length > 1 && w && this.setShapesAsAnimated(x);
        }
      }, SVGShapeElement.prototype.setShapesAsAnimated = function(t) {
        var n, c = t.length;
        for (n = 0; n < c; n += 1)
          t[n].setAsAnimated();
      }, SVGShapeElement.prototype.createStyleElement = function(t, n) {
        var c, d = new SVGStyleData(t, n), v = d.pElem;
        if (t.ty === "st")
          c = new SVGStrokeStyleData(this, t, d);
        else if (t.ty === "fl")
          c = new SVGFillStyleData(this, t, d);
        else if (t.ty === "gf" || t.ty === "gs") {
          var y = t.ty === "gf" ? SVGGradientFillStyleData : SVGGradientStrokeStyleData;
          c = new y(this, t, d), this.globalData.defs.appendChild(c.gf), c.maskId && (this.globalData.defs.appendChild(c.ms), this.globalData.defs.appendChild(c.of), v.setAttribute("mask", "url(" + getLocationHref() + "#" + c.maskId + ")"));
        } else t.ty === "no" && (c = new SVGNoStyleData(this, t, d));
        return (t.ty === "st" || t.ty === "gs") && (v.setAttribute("stroke-linecap", lineCapEnum[t.lc || 2]), v.setAttribute("stroke-linejoin", lineJoinEnum[t.lj || 2]), v.setAttribute("fill-opacity", "0"), t.lj === 1 && v.setAttribute("stroke-miterlimit", t.ml)), t.r === 2 && v.setAttribute("fill-rule", "evenodd"), t.ln && v.setAttribute("id", t.ln), t.cl && v.setAttribute("class", t.cl), t.bm && (v.style["mix-blend-mode"] = getBlendMode(t.bm)), this.stylesList.push(d), this.addToAnimatedContents(t, c), c;
      }, SVGShapeElement.prototype.createGroupElement = function(t) {
        var n = new ShapeGroupData();
        return t.ln && n.gr.setAttribute("id", t.ln), t.cl && n.gr.setAttribute("class", t.cl), t.bm && (n.gr.style["mix-blend-mode"] = getBlendMode(t.bm)), n;
      }, SVGShapeElement.prototype.createTransformElement = function(t, n) {
        var c = TransformPropertyFactory.getTransformProperty(this, t, this), d = new SVGTransformData(c, c.o, n);
        return this.addToAnimatedContents(t, d), d;
      }, SVGShapeElement.prototype.createShapeElement = function(t, n, c) {
        var d = 4;
        t.ty === "rc" ? d = 5 : t.ty === "el" ? d = 6 : t.ty === "sr" && (d = 7);
        var v = ShapePropertyFactory.getShapeProp(this, t, d, this), y = new SVGShapeData(n, c, v);
        return this.shapes.push(y), this.addShapeToModifiers(y), this.addToAnimatedContents(t, y), y;
      }, SVGShapeElement.prototype.addToAnimatedContents = function(t, n) {
        for (var c = 0, d = this.animatedContents.length; c < d; ) {
          if (this.animatedContents[c].element === n)
            return;
          c += 1;
        }
        this.animatedContents.push({
          fn: SVGElementsRenderer.createRenderFunction(t),
          element: n,
          data: t
        });
      }, SVGShapeElement.prototype.setElementStyles = function(t) {
        var n = t.styles, c, d = this.stylesList.length;
        for (c = 0; c < d; c += 1)
          n.indexOf(this.stylesList[c]) === -1 && !this.stylesList[c].closed && n.push(this.stylesList[c]);
      }, SVGShapeElement.prototype.reloadShapes = function() {
        this._isFirstFrame = !0;
        var t, n = this.itemsData.length;
        for (t = 0; t < n; t += 1)
          this.prevViewData[t] = this.itemsData[t];
        for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], !0), this.filterUniqueShapes(), n = this.dynamicProperties.length, t = 0; t < n; t += 1)
          this.dynamicProperties[t].getValue();
        this.renderModifiers();
      }, SVGShapeElement.prototype.searchShapes = function(t, n, c, d, v, y, x) {
        var w = [].concat(y), k, C = t.length - 1, P, F, S = [], j = [], T, A, R;
        for (k = C; k >= 0; k -= 1) {
          if (R = this.searchProcessedElement(t[k]), R ? n[k] = c[R - 1] : t[k]._render = x, t[k].ty === "fl" || t[k].ty === "st" || t[k].ty === "gf" || t[k].ty === "gs" || t[k].ty === "no")
            R ? n[k].style.closed = t[k].hd : n[k] = this.createStyleElement(t[k], v), t[k]._render && n[k].style.pElem.parentNode !== d && d.appendChild(n[k].style.pElem), S.push(n[k].style);
          else if (t[k].ty === "gr") {
            if (!R)
              n[k] = this.createGroupElement(t[k]);
            else
              for (F = n[k].it.length, P = 0; P < F; P += 1)
                n[k].prevViewData[P] = n[k].it[P];
            this.searchShapes(t[k].it, n[k].it, n[k].prevViewData, n[k].gr, v + 1, w, x), t[k]._render && n[k].gr.parentNode !== d && d.appendChild(n[k].gr);
          } else t[k].ty === "tr" ? (R || (n[k] = this.createTransformElement(t[k], d)), T = n[k].transform, w.push(T)) : t[k].ty === "sh" || t[k].ty === "rc" || t[k].ty === "el" || t[k].ty === "sr" ? (R || (n[k] = this.createShapeElement(t[k], w, v)), this.setElementStyles(n[k])) : t[k].ty === "tm" || t[k].ty === "rd" || t[k].ty === "ms" || t[k].ty === "pb" || t[k].ty === "zz" || t[k].ty === "op" ? (R ? (A = n[k], A.closed = !1) : (A = ShapeModifiers.getModifier(t[k].ty), A.init(this, t[k]), n[k] = A, this.shapeModifiers.push(A)), j.push(A)) : t[k].ty === "rp" && (R ? (A = n[k], A.closed = !0) : (A = ShapeModifiers.getModifier(t[k].ty), n[k] = A, A.init(this, t, k, n), this.shapeModifiers.push(A), x = !1), j.push(A));
          this.addProcessedElement(t[k], k + 1);
        }
        for (C = S.length, k = 0; k < C; k += 1)
          S[k].closed = !0;
        for (C = j.length, k = 0; k < C; k += 1)
          j[k].closed = !0;
      }, SVGShapeElement.prototype.renderInnerContent = function() {
        this.renderModifiers();
        var t, n = this.stylesList.length;
        for (t = 0; t < n; t += 1)
          this.stylesList[t].reset();
        for (this.renderShape(), t = 0; t < n; t += 1)
          (this.stylesList[t]._mdf || this._isFirstFrame) && (this.stylesList[t].msElem && (this.stylesList[t].msElem.setAttribute("d", this.stylesList[t].d), this.stylesList[t].d = "M0 0" + this.stylesList[t].d), this.stylesList[t].pElem.setAttribute("d", this.stylesList[t].d || "M0 0"));
      }, SVGShapeElement.prototype.renderShape = function() {
        var t, n = this.animatedContents.length, c;
        for (t = 0; t < n; t += 1)
          c = this.animatedContents[t], (this._isFirstFrame || c.element._isAnimated) && c.data !== !0 && c.fn(c.data, c.element, this._isFirstFrame);
      }, SVGShapeElement.prototype.destroy = function() {
        this.destroyBaseElement(), this.shapesData = null, this.itemsData = null;
      };
      function LetterProps(t, n, c, d, v, y) {
        this.o = t, this.sw = n, this.sc = c, this.fc = d, this.m = v, this.p = y, this._mdf = {
          o: !0,
          sw: !!n,
          sc: !!c,
          fc: !!d,
          m: !0,
          p: !0
        };
      }
      LetterProps.prototype.update = function(t, n, c, d, v, y) {
        this._mdf.o = !1, this._mdf.sw = !1, this._mdf.sc = !1, this._mdf.fc = !1, this._mdf.m = !1, this._mdf.p = !1;
        var x = !1;
        return this.o !== t && (this.o = t, this._mdf.o = !0, x = !0), this.sw !== n && (this.sw = n, this._mdf.sw = !0, x = !0), this.sc !== c && (this.sc = c, this._mdf.sc = !0, x = !0), this.fc !== d && (this.fc = d, this._mdf.fc = !0, x = !0), this.m !== v && (this.m = v, this._mdf.m = !0, x = !0), y.length && (this.p[0] !== y[0] || this.p[1] !== y[1] || this.p[4] !== y[4] || this.p[5] !== y[5] || this.p[12] !== y[12] || this.p[13] !== y[13]) && (this.p = y, this._mdf.p = !0, x = !0), x;
      };
      function TextProperty(t, n) {
        this._frameId = initialDefaultFrame, this.pv = "", this.v = "", this.kf = !1, this._isFirstFrame = !0, this._mdf = !1, n.d && n.d.sid && (n.d = t.globalData.slotManager.getProp(n.d)), this.data = n, this.elem = t, this.comp = this.elem.comp, this.keysIndex = 0, this.canResize = !1, this.minimumFontSize = 1, this.effectsSequence = [], this.currentData = {
          ascent: 0,
          boxWidth: this.defaultBoxWidth,
          f: "",
          fStyle: "",
          fWeight: "",
          fc: "",
          j: "",
          justifyOffset: "",
          l: [],
          lh: 0,
          lineWidths: [],
          ls: "",
          of: "",
          s: "",
          sc: "",
          sw: 0,
          t: 0,
          tr: 0,
          sz: 0,
          ps: null,
          fillColorAnim: !1,
          strokeColorAnim: !1,
          strokeWidthAnim: !1,
          yOffset: 0,
          finalSize: 0,
          finalText: [],
          finalLineHeight: 0,
          __complete: !1
        }, this.copyData(this.currentData, this.data.d.k[0].s), this.searchProperty() || this.completeTextData(this.currentData);
      }
      TextProperty.prototype.defaultBoxWidth = [0, 0], TextProperty.prototype.copyData = function(t, n) {
        for (var c in n)
          Object.prototype.hasOwnProperty.call(n, c) && (t[c] = n[c]);
        return t;
      }, TextProperty.prototype.setCurrentData = function(t) {
        t.__complete || this.completeTextData(t), this.currentData = t, this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth, this._mdf = !0;
      }, TextProperty.prototype.searchProperty = function() {
        return this.searchKeyframes();
      }, TextProperty.prototype.searchKeyframes = function() {
        return this.kf = this.data.d.k.length > 1, this.kf && this.addEffect(this.getKeyframeValue.bind(this)), this.kf;
      }, TextProperty.prototype.addEffect = function(t) {
        this.effectsSequence.push(t), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.getValue = function(t) {
        if (!((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !t)) {
          this.currentData.t = this.data.d.k[this.keysIndex].s.t;
          var n = this.currentData, c = this.keysIndex;
          if (this.lock) {
            this.setCurrentData(this.currentData);
            return;
          }
          this.lock = !0, this._mdf = !1;
          var d, v = this.effectsSequence.length, y = t || this.data.d.k[this.keysIndex].s;
          for (d = 0; d < v; d += 1)
            c !== this.keysIndex ? y = this.effectsSequence[d](y, y.t) : y = this.effectsSequence[d](this.currentData, y.t);
          n !== y && this.setCurrentData(y), this.v = this.currentData, this.pv = this.v, this.lock = !1, this.frameId = this.elem.globalData.frameId;
        }
      }, TextProperty.prototype.getKeyframeValue = function() {
        for (var t = this.data.d.k, n = this.elem.comp.renderedFrame, c = 0, d = t.length; c <= d - 1 && !(c === d - 1 || t[c + 1].t > n); )
          c += 1;
        return this.keysIndex !== c && (this.keysIndex = c), this.data.d.k[this.keysIndex].s;
      }, TextProperty.prototype.buildFinalText = function(t) {
        for (var n = [], c = 0, d = t.length, v, y, x = !1, w = !1, k = ""; c < d; )
          x = w, w = !1, v = t.charCodeAt(c), k = t.charAt(c), FontManager.isCombinedCharacter(v) ? x = !0 : v >= 55296 && v <= 56319 ? FontManager.isRegionalFlag(t, c) ? k = t.substr(c, 14) : (y = t.charCodeAt(c + 1), y >= 56320 && y <= 57343 && (FontManager.isModifier(v, y) ? (k = t.substr(c, 2), x = !0) : FontManager.isFlagEmoji(t.substr(c, 4)) ? k = t.substr(c, 4) : k = t.substr(c, 2))) : v > 56319 ? (y = t.charCodeAt(c + 1), FontManager.isVariationSelector(v) && (x = !0)) : FontManager.isZeroWidthJoiner(v) && (x = !0, w = !0), x ? (n[n.length - 1] += k, x = !1) : n.push(k), c += k.length;
        return n;
      }, TextProperty.prototype.completeTextData = function(t) {
        t.__complete = !0;
        var n = this.elem.globalData.fontManager, c = this.data, d = [], v, y, x, w = 0, k, C = c.m.g, P = 0, F = 0, S = 0, j = [], T = 0, A = 0, R, M, _ = n.getFontByName(t.f), E, I = 0, L = getFontProperties(_);
        t.fWeight = L.weight, t.fStyle = L.style, t.finalSize = t.s, t.finalText = this.buildFinalText(t.t), y = t.finalText.length, t.finalLineHeight = t.lh;
        var D = t.tr / 1e3 * t.finalSize, O;
        if (t.sz)
          for (var z = !0, W = t.sz[0], X = t.sz[1], K, Y; z; ) {
            Y = this.buildFinalText(t.t), K = 0, T = 0, y = Y.length, D = t.tr / 1e3 * t.finalSize;
            var U = -1;
            for (v = 0; v < y; v += 1)
              O = Y[v].charCodeAt(0), x = !1, Y[v] === " " ? U = v : (O === 13 || O === 3) && (T = 0, x = !0, K += t.finalLineHeight || t.finalSize * 1.2), n.chars ? (E = n.getCharData(Y[v], _.fStyle, _.fFamily), I = x ? 0 : E.w * t.finalSize / 100) : I = n.measureText(Y[v], t.f, t.finalSize), T + I > W && Y[v] !== " " ? (U === -1 ? y += 1 : v = U, K += t.finalLineHeight || t.finalSize * 1.2, Y.splice(v, U === v ? 1 : 0, "\r"), U = -1, T = 0) : (T += I, T += D);
            K += _.ascent * t.finalSize / 100, this.canResize && t.finalSize > this.minimumFontSize && X < K ? (t.finalSize -= 1, t.finalLineHeight = t.finalSize * t.lh / t.s) : (t.finalText = Y, y = t.finalText.length, z = !1);
          }
        T = -D, I = 0;
        var Z = 0, q;
        for (v = 0; v < y; v += 1)
          if (x = !1, q = t.finalText[v], O = q.charCodeAt(0), O === 13 || O === 3 ? (Z = 0, j.push(T), A = T > A ? T : A, T = -2 * D, k = "", x = !0, S += 1) : k = q, n.chars ? (E = n.getCharData(q, _.fStyle, n.getFontByName(t.f).fFamily), I = x ? 0 : E.w * t.finalSize / 100) : I = n.measureText(k, t.f, t.finalSize), q === " " ? Z += I + D : (T += I + D + Z, Z = 0), d.push({
            l: I,
            an: I,
            add: P,
            n: x,
            anIndexes: [],
            val: k,
            line: S,
            animatorJustifyOffset: 0
          }), C == 2) {
            if (P += I, k === "" || k === " " || v === y - 1) {
              for ((k === "" || k === " ") && (P -= I); F <= v; )
                d[F].an = P, d[F].ind = w, d[F].extra = I, F += 1;
              w += 1, P = 0;
            }
          } else if (C == 3) {
            if (P += I, k === "" || v === y - 1) {
              for (k === "" && (P -= I); F <= v; )
                d[F].an = P, d[F].ind = w, d[F].extra = I, F += 1;
              P = 0, w += 1;
            }
          } else
            d[w].ind = w, d[w].extra = 0, w += 1;
        if (t.l = d, A = T > A ? T : A, j.push(T), t.sz)
          t.boxWidth = t.sz[0], t.justifyOffset = 0;
        else
          switch (t.boxWidth = A, t.j) {
            case 1:
              t.justifyOffset = -t.boxWidth;
              break;
            case 2:
              t.justifyOffset = -t.boxWidth / 2;
              break;
            default:
              t.justifyOffset = 0;
          }
        t.lineWidths = j;
        var B = c.a, G, N;
        M = B.length;
        var V, H, $ = [];
        for (R = 0; R < M; R += 1) {
          for (G = B[R], G.a.sc && (t.strokeColorAnim = !0), G.a.sw && (t.strokeWidthAnim = !0), (G.a.fc || G.a.fh || G.a.fs || G.a.fb) && (t.fillColorAnim = !0), H = 0, V = G.s.b, v = 0; v < y; v += 1)
            N = d[v], N.anIndexes[R] = H, (V == 1 && N.val !== "" || V == 2 && N.val !== "" && N.val !== " " || V == 3 && (N.n || N.val == " " || v == y - 1) || V == 4 && (N.n || v == y - 1)) && (G.s.rn === 1 && $.push(H), H += 1);
          c.a[R].s.totalChars = H;
          var J = -1, ee;
          if (G.s.rn === 1)
            for (v = 0; v < y; v += 1)
              N = d[v], J != N.anIndexes[R] && (J = N.anIndexes[R], ee = $.splice(Math.floor(Math.random() * $.length), 1)[0]), N.anIndexes[R] = ee;
        }
        t.yOffset = t.finalLineHeight || t.finalSize * 1.2, t.ls = t.ls || 0, t.ascent = _.ascent * t.finalSize / 100;
      }, TextProperty.prototype.updateDocumentData = function(t, n) {
        n = n === void 0 ? this.keysIndex : n;
        var c = this.copyData({}, this.data.d.k[n].s);
        c = this.copyData(c, t), this.data.d.k[n].s = c, this.recalculate(n), this.setCurrentData(c), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.recalculate = function(t) {
        var n = this.data.d.k[t].s;
        n.__complete = !1, this.keysIndex = 0, this._isFirstFrame = !0, this.getValue(n);
      }, TextProperty.prototype.canResizeFont = function(t) {
        this.canResize = t, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
      }, TextProperty.prototype.setMinimumFontSize = function(t) {
        this.minimumFontSize = Math.floor(t) || 1, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
      };
      var TextSelectorProp = (function() {
        var t = Math.max, n = Math.min, c = Math.floor;
        function d(y, x) {
          this._currentTextLength = -1, this.k = !1, this.data = x, this.elem = y, this.comp = y.comp, this.finalS = 0, this.finalE = 0, this.initDynamicPropertyContainer(y), this.s = PropertyFactory.getProp(y, x.s || {
            k: 0
          }, 0, 0, this), "e" in x ? this.e = PropertyFactory.getProp(y, x.e, 0, 0, this) : this.e = {
            v: 100
          }, this.o = PropertyFactory.getProp(y, x.o || {
            k: 0
          }, 0, 0, this), this.xe = PropertyFactory.getProp(y, x.xe || {
            k: 0
          }, 0, 0, this), this.ne = PropertyFactory.getProp(y, x.ne || {
            k: 0
          }, 0, 0, this), this.sm = PropertyFactory.getProp(y, x.sm || {
            k: 100
          }, 0, 0, this), this.a = PropertyFactory.getProp(y, x.a, 0, 0.01, this), this.dynamicProperties.length || this.getValue();
        }
        d.prototype = {
          getMult: function(x) {
            this._currentTextLength !== this.elem.textProperty.currentData.l.length && this.getValue();
            var w = 0, k = 0, C = 1, P = 1;
            this.ne.v > 0 ? w = this.ne.v / 100 : k = -this.ne.v / 100, this.xe.v > 0 ? C = 1 - this.xe.v / 100 : P = 1 + this.xe.v / 100;
            var F = BezierFactory.getBezierEasing(w, k, C, P).get, S = 0, j = this.finalS, T = this.finalE, A = this.data.sh;
            if (A === 2)
              T === j ? S = x >= T ? 1 : 0 : S = t(0, n(0.5 / (T - j) + (x - j) / (T - j), 1)), S = F(S);
            else if (A === 3)
              T === j ? S = x >= T ? 0 : 1 : S = 1 - t(0, n(0.5 / (T - j) + (x - j) / (T - j), 1)), S = F(S);
            else if (A === 4)
              T === j ? S = 0 : (S = t(0, n(0.5 / (T - j) + (x - j) / (T - j), 1)), S < 0.5 ? S *= 2 : S = 1 - 2 * (S - 0.5)), S = F(S);
            else if (A === 5) {
              if (T === j)
                S = 0;
              else {
                var R = T - j;
                x = n(t(0, x + 0.5 - j), T - j);
                var M = -R / 2 + x, _ = R / 2;
                S = Math.sqrt(1 - M * M / (_ * _));
              }
              S = F(S);
            } else A === 6 ? (T === j ? S = 0 : (x = n(t(0, x + 0.5 - j), T - j), S = (1 + Math.cos(Math.PI + Math.PI * 2 * x / (T - j))) / 2), S = F(S)) : (x >= c(j) && (x - j < 0 ? S = t(0, n(n(T, 1) - (j - x), 1)) : S = t(0, n(T - x, 1))), S = F(S));
            if (this.sm.v !== 100) {
              var E = this.sm.v * 0.01;
              E === 0 && (E = 1e-8);
              var I = 0.5 - E * 0.5;
              S < I ? S = 0 : (S = (S - I) / E, S > 1 && (S = 1));
            }
            return S * this.a.v;
          },
          getValue: function(x) {
            this.iterateDynamicProperties(), this._mdf = x || this._mdf, this._currentTextLength = this.elem.textProperty.currentData.l.length || 0, x && this.data.r === 2 && (this.e.v = this._currentTextLength);
            var w = this.data.r === 2 ? 1 : 100 / this.data.totalChars, k = this.o.v / w, C = this.s.v / w + k, P = this.e.v / w + k;
            if (C > P) {
              var F = C;
              C = P, P = F;
            }
            this.finalS = C, this.finalE = P;
          }
        }, extendPrototype([DynamicPropertyContainer], d);
        function v(y, x, w) {
          return new d(y, x);
        }
        return {
          getTextSelectorProp: v
        };
      })();
      function TextAnimatorDataProperty(t, n, c) {
        var d = {
          propType: !1
        }, v = PropertyFactory.getProp, y = n.a;
        this.a = {
          r: y.r ? v(t, y.r, 0, degToRads, c) : d,
          rx: y.rx ? v(t, y.rx, 0, degToRads, c) : d,
          ry: y.ry ? v(t, y.ry, 0, degToRads, c) : d,
          sk: y.sk ? v(t, y.sk, 0, degToRads, c) : d,
          sa: y.sa ? v(t, y.sa, 0, degToRads, c) : d,
          s: y.s ? v(t, y.s, 1, 0.01, c) : d,
          a: y.a ? v(t, y.a, 1, 0, c) : d,
          o: y.o ? v(t, y.o, 0, 0.01, c) : d,
          p: y.p ? v(t, y.p, 1, 0, c) : d,
          sw: y.sw ? v(t, y.sw, 0, 0, c) : d,
          sc: y.sc ? v(t, y.sc, 1, 0, c) : d,
          fc: y.fc ? v(t, y.fc, 1, 0, c) : d,
          fh: y.fh ? v(t, y.fh, 0, 0, c) : d,
          fs: y.fs ? v(t, y.fs, 0, 0.01, c) : d,
          fb: y.fb ? v(t, y.fb, 0, 0.01, c) : d,
          t: y.t ? v(t, y.t, 0, 0, c) : d
        }, this.s = TextSelectorProp.getTextSelectorProp(t, n.s, c), this.s.t = n.s.t;
      }
      function TextAnimatorProperty(t, n, c) {
        this._isFirstFrame = !0, this._hasMaskedPath = !1, this._frameId = -1, this._textData = t, this._renderType = n, this._elem = c, this._animatorsData = createSizedArray(this._textData.a.length), this._pathData = {}, this._moreOptions = {
          alignment: {}
        }, this.renderedLetters = [], this.lettersChangedFlag = !1, this.initDynamicPropertyContainer(c);
      }
      TextAnimatorProperty.prototype.searchProperties = function() {
        var t, n = this._textData.a.length, c, d = PropertyFactory.getProp;
        for (t = 0; t < n; t += 1)
          c = this._textData.a[t], this._animatorsData[t] = new TextAnimatorDataProperty(this._elem, c, this);
        this._textData.p && "m" in this._textData.p ? (this._pathData = {
          a: d(this._elem, this._textData.p.a, 0, 0, this),
          f: d(this._elem, this._textData.p.f, 0, 0, this),
          l: d(this._elem, this._textData.p.l, 0, 0, this),
          r: d(this._elem, this._textData.p.r, 0, 0, this),
          p: d(this._elem, this._textData.p.p, 0, 0, this),
          m: this._elem.maskManager.getMaskProperty(this._textData.p.m)
        }, this._hasMaskedPath = !0) : this._hasMaskedPath = !1, this._moreOptions.alignment = d(this._elem, this._textData.m.a, 1, 0, this);
      }, TextAnimatorProperty.prototype.getMeasures = function(t, n) {
        if (this.lettersChangedFlag = n, !(!this._mdf && !this._isFirstFrame && !n && (!this._hasMaskedPath || !this._pathData.m._mdf))) {
          this._isFirstFrame = !1;
          var c = this._moreOptions.alignment.v, d = this._animatorsData, v = this._textData, y = this.mHelper, x = this._renderType, w = this.renderedLetters.length, k, C, P, F, S = t.l, j, T, A, R, M, _, E, I, L, D, O, z, W, X, K;
          if (this._hasMaskedPath) {
            if (K = this._pathData.m, !this._pathData.n || this._pathData._mdf) {
              var Y = K.v;
              this._pathData.r.v && (Y = Y.reverse()), j = {
                tLength: 0,
                segments: []
              }, F = Y._length - 1;
              var U;
              for (z = 0, P = 0; P < F; P += 1)
                U = bez.buildBezierData(Y.v[P], Y.v[P + 1], [Y.o[P][0] - Y.v[P][0], Y.o[P][1] - Y.v[P][1]], [Y.i[P + 1][0] - Y.v[P + 1][0], Y.i[P + 1][1] - Y.v[P + 1][1]]), j.tLength += U.segmentLength, j.segments.push(U), z += U.segmentLength;
              P = F, K.v.c && (U = bez.buildBezierData(Y.v[P], Y.v[0], [Y.o[P][0] - Y.v[P][0], Y.o[P][1] - Y.v[P][1]], [Y.i[0][0] - Y.v[0][0], Y.i[0][1] - Y.v[0][1]]), j.tLength += U.segmentLength, j.segments.push(U), z += U.segmentLength), this._pathData.pi = j;
            }
            if (j = this._pathData.pi, T = this._pathData.f.v, E = 0, _ = 1, R = 0, M = !0, D = j.segments, T < 0 && K.v.c)
              for (j.tLength < Math.abs(T) && (T = -Math.abs(T) % j.tLength), E = D.length - 1, L = D[E].points, _ = L.length - 1; T < 0; )
                T += L[_].partialLength, _ -= 1, _ < 0 && (E -= 1, L = D[E].points, _ = L.length - 1);
            L = D[E].points, I = L[_ - 1], A = L[_], O = A.partialLength;
          }
          F = S.length, k = 0, C = 0;
          var Z = t.finalSize * 1.2 * 0.714, q = !0, B, G, N, V, H;
          V = d.length;
          var $, J = -1, ee, te, re, ie = T, ne = E, he = _, ae = -1, ce, oe, le, se, Q, me, be, ve, ue = "", ge = this.defaultPropsArray, ye;
          if (t.j === 2 || t.j === 1) {
            var fe = 0, xe = 0, ke = t.j === 2 ? -0.5 : -1, de = 0, we = !0;
            for (P = 0; P < F; P += 1)
              if (S[P].n) {
                for (fe && (fe += xe); de < P; )
                  S[de].animatorJustifyOffset = fe, de += 1;
                fe = 0, we = !0;
              } else {
                for (N = 0; N < V; N += 1)
                  B = d[N].a, B.t.propType && (we && t.j === 2 && (xe += B.t.v * ke), G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), $.length ? fe += B.t.v * $[0] * ke : fe += B.t.v * $ * ke);
                we = !1;
              }
            for (fe && (fe += xe); de < P; )
              S[de].animatorJustifyOffset = fe, de += 1;
          }
          for (P = 0; P < F; P += 1) {
            if (y.reset(), ce = 1, S[P].n)
              k = 0, C += t.yOffset, C += q ? 1 : 0, T = ie, q = !1, this._hasMaskedPath && (E = ne, _ = he, L = D[E].points, I = L[_ - 1], A = L[_], O = A.partialLength, R = 0), ue = "", ve = "", me = "", ye = "", ge = this.defaultPropsArray;
            else {
              if (this._hasMaskedPath) {
                if (ae !== S[P].line) {
                  switch (t.j) {
                    case 1:
                      T += z - t.lineWidths[S[P].line];
                      break;
                    case 2:
                      T += (z - t.lineWidths[S[P].line]) / 2;
                      break;
                  }
                  ae = S[P].line;
                }
                J !== S[P].ind && (S[J] && (T += S[J].extra), T += S[P].an / 2, J = S[P].ind), T += c[0] * S[P].an * 5e-3;
                var pe = 0;
                for (N = 0; N < V; N += 1)
                  B = d[N].a, B.p.propType && (G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), $.length ? pe += B.p.v[0] * $[0] : pe += B.p.v[0] * $), B.a.propType && (G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), $.length ? pe += B.a.v[0] * $[0] : pe += B.a.v[0] * $);
                for (M = !0, this._pathData.a.v && (T = S[0].an * 0.5 + (z - this._pathData.f.v - S[0].an * 0.5 - S[S.length - 1].an * 0.5) * J / (F - 1), T += this._pathData.f.v); M; )
                  R + O >= T + pe || !L ? (W = (T + pe - R) / A.partialLength, te = I.point[0] + (A.point[0] - I.point[0]) * W, re = I.point[1] + (A.point[1] - I.point[1]) * W, y.translate(-c[0] * S[P].an * 5e-3, -(c[1] * Z) * 0.01), M = !1) : L && (R += A.partialLength, _ += 1, _ >= L.length && (_ = 0, E += 1, D[E] ? L = D[E].points : K.v.c ? (_ = 0, E = 0, L = D[E].points) : (R -= A.partialLength, L = null)), L && (I = A, A = L[_], O = A.partialLength));
                ee = S[P].an / 2 - S[P].add, y.translate(-ee, 0, 0);
              } else
                ee = S[P].an / 2 - S[P].add, y.translate(-ee, 0, 0), y.translate(-c[0] * S[P].an * 5e-3, -c[1] * Z * 0.01, 0);
              for (N = 0; N < V; N += 1)
                B = d[N].a, B.t.propType && (G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), (k !== 0 || t.j !== 0) && (this._hasMaskedPath ? $.length ? T += B.t.v * $[0] : T += B.t.v * $ : $.length ? k += B.t.v * $[0] : k += B.t.v * $));
              for (t.strokeWidthAnim && (le = t.sw || 0), t.strokeColorAnim && (t.sc ? oe = [t.sc[0], t.sc[1], t.sc[2]] : oe = [0, 0, 0]), t.fillColorAnim && t.fc && (se = [t.fc[0], t.fc[1], t.fc[2]]), N = 0; N < V; N += 1)
                B = d[N].a, B.a.propType && (G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), $.length ? y.translate(-B.a.v[0] * $[0], -B.a.v[1] * $[1], B.a.v[2] * $[2]) : y.translate(-B.a.v[0] * $, -B.a.v[1] * $, B.a.v[2] * $));
              for (N = 0; N < V; N += 1)
                B = d[N].a, B.s.propType && (G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), $.length ? y.scale(1 + (B.s.v[0] - 1) * $[0], 1 + (B.s.v[1] - 1) * $[1], 1) : y.scale(1 + (B.s.v[0] - 1) * $, 1 + (B.s.v[1] - 1) * $, 1));
              for (N = 0; N < V; N += 1) {
                if (B = d[N].a, G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), B.sk.propType && ($.length ? y.skewFromAxis(-B.sk.v * $[0], B.sa.v * $[1]) : y.skewFromAxis(-B.sk.v * $, B.sa.v * $)), B.r.propType && ($.length ? y.rotateZ(-B.r.v * $[2]) : y.rotateZ(-B.r.v * $)), B.ry.propType && ($.length ? y.rotateY(B.ry.v * $[1]) : y.rotateY(B.ry.v * $)), B.rx.propType && ($.length ? y.rotateX(B.rx.v * $[0]) : y.rotateX(B.rx.v * $)), B.o.propType && ($.length ? ce += (B.o.v * $[0] - ce) * $[0] : ce += (B.o.v * $ - ce) * $), t.strokeWidthAnim && B.sw.propType && ($.length ? le += B.sw.v * $[0] : le += B.sw.v * $), t.strokeColorAnim && B.sc.propType)
                  for (Q = 0; Q < 3; Q += 1)
                    $.length ? oe[Q] += (B.sc.v[Q] - oe[Q]) * $[0] : oe[Q] += (B.sc.v[Q] - oe[Q]) * $;
                if (t.fillColorAnim && t.fc) {
                  if (B.fc.propType)
                    for (Q = 0; Q < 3; Q += 1)
                      $.length ? se[Q] += (B.fc.v[Q] - se[Q]) * $[0] : se[Q] += (B.fc.v[Q] - se[Q]) * $;
                  B.fh.propType && ($.length ? se = addHueToRGB(se, B.fh.v * $[0]) : se = addHueToRGB(se, B.fh.v * $)), B.fs.propType && ($.length ? se = addSaturationToRGB(se, B.fs.v * $[0]) : se = addSaturationToRGB(se, B.fs.v * $)), B.fb.propType && ($.length ? se = addBrightnessToRGB(se, B.fb.v * $[0]) : se = addBrightnessToRGB(se, B.fb.v * $));
                }
              }
              for (N = 0; N < V; N += 1)
                B = d[N].a, B.p.propType && (G = d[N].s, $ = G.getMult(S[P].anIndexes[N], v.a[N].s.totalChars), this._hasMaskedPath ? $.length ? y.translate(0, B.p.v[1] * $[0], -B.p.v[2] * $[1]) : y.translate(0, B.p.v[1] * $, -B.p.v[2] * $) : $.length ? y.translate(B.p.v[0] * $[0], B.p.v[1] * $[1], -B.p.v[2] * $[2]) : y.translate(B.p.v[0] * $, B.p.v[1] * $, -B.p.v[2] * $));
              if (t.strokeWidthAnim && (me = le < 0 ? 0 : le), t.strokeColorAnim && (be = "rgb(" + Math.round(oe[0] * 255) + "," + Math.round(oe[1] * 255) + "," + Math.round(oe[2] * 255) + ")"), t.fillColorAnim && t.fc && (ve = "rgb(" + Math.round(se[0] * 255) + "," + Math.round(se[1] * 255) + "," + Math.round(se[2] * 255) + ")"), this._hasMaskedPath) {
                if (y.translate(0, -t.ls), y.translate(0, c[1] * Z * 0.01 + C, 0), this._pathData.p.v) {
                  X = (A.point[1] - I.point[1]) / (A.point[0] - I.point[0]);
                  var Se = Math.atan(X) * 180 / Math.PI;
                  A.point[0] < I.point[0] && (Se += 180), y.rotate(-Se * Math.PI / 180);
                }
                y.translate(te, re, 0), T -= c[0] * S[P].an * 5e-3, S[P + 1] && J !== S[P + 1].ind && (T += S[P].an / 2, T += t.tr * 1e-3 * t.finalSize);
              } else {
                switch (y.translate(k, C, 0), t.ps && y.translate(t.ps[0], t.ps[1] + t.ascent, 0), t.j) {
                  case 1:
                    y.translate(S[P].animatorJustifyOffset + t.justifyOffset + (t.boxWidth - t.lineWidths[S[P].line]), 0, 0);
                    break;
                  case 2:
                    y.translate(S[P].animatorJustifyOffset + t.justifyOffset + (t.boxWidth - t.lineWidths[S[P].line]) / 2, 0, 0);
                    break;
                }
                y.translate(0, -t.ls), y.translate(ee, 0, 0), y.translate(c[0] * S[P].an * 5e-3, c[1] * Z * 0.01, 0), k += S[P].l + t.tr * 1e-3 * t.finalSize;
              }
              x === "html" ? ue = y.toCSS() : x === "svg" ? ue = y.to2dCSS() : ge = [y.props[0], y.props[1], y.props[2], y.props[3], y.props[4], y.props[5], y.props[6], y.props[7], y.props[8], y.props[9], y.props[10], y.props[11], y.props[12], y.props[13], y.props[14], y.props[15]], ye = ce;
            }
            w <= P ? (H = new LetterProps(ye, me, be, ve, ue, ge), this.renderedLetters.push(H), w += 1, this.lettersChangedFlag = !0) : (H = this.renderedLetters[P], this.lettersChangedFlag = H.update(ye, me, be, ve, ue, ge) || this.lettersChangedFlag);
          }
        }
      }, TextAnimatorProperty.prototype.getValue = function() {
        this._elem.globalData.frameId !== this._frameId && (this._frameId = this._elem.globalData.frameId, this.iterateDynamicProperties());
      }, TextAnimatorProperty.prototype.mHelper = new Matrix(), TextAnimatorProperty.prototype.defaultPropsArray = [], extendPrototype([DynamicPropertyContainer], TextAnimatorProperty);
      function ITextElement() {
      }
      ITextElement.prototype.initElement = function(t, n, c) {
        this.lettersChangedFlag = !0, this.initFrame(), this.initBaseData(t, n, c), this.textProperty = new TextProperty(this, t.t, this.dynamicProperties), this.textAnimator = new TextAnimatorProperty(t.t, this.renderType, this), this.initTransform(t, n, c), this.initHierarchy(), this.initRenderable(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), this.createContent(), this.hide(), this.textAnimator.searchProperties(this.dynamicProperties);
      }, ITextElement.prototype.prepareFrame = function(t) {
        this._mdf = !1, this.prepareRenderableFrame(t), this.prepareProperties(t, this.isInRange);
      }, ITextElement.prototype.createPathShape = function(t, n) {
        var c, d = n.length, v, y = "";
        for (c = 0; c < d; c += 1)
          n[c].ty === "sh" && (v = n[c].ks.k, y += buildShapeString(v, v.i.length, !0, t));
        return y;
      }, ITextElement.prototype.updateDocumentData = function(t, n) {
        this.textProperty.updateDocumentData(t, n);
      }, ITextElement.prototype.canResizeFont = function(t) {
        this.textProperty.canResizeFont(t);
      }, ITextElement.prototype.setMinimumFontSize = function(t) {
        this.textProperty.setMinimumFontSize(t);
      }, ITextElement.prototype.applyTextPropertiesToMatrix = function(t, n, c, d, v) {
        switch (t.ps && n.translate(t.ps[0], t.ps[1] + t.ascent, 0), n.translate(0, -t.ls, 0), t.j) {
          case 1:
            n.translate(t.justifyOffset + (t.boxWidth - t.lineWidths[c]), 0, 0);
            break;
          case 2:
            n.translate(t.justifyOffset + (t.boxWidth - t.lineWidths[c]) / 2, 0, 0);
            break;
        }
        n.translate(d, v, 0);
      }, ITextElement.prototype.buildColor = function(t) {
        return "rgb(" + Math.round(t[0] * 255) + "," + Math.round(t[1] * 255) + "," + Math.round(t[2] * 255) + ")";
      }, ITextElement.prototype.emptyProp = new LetterProps(), ITextElement.prototype.destroy = function() {
      }, ITextElement.prototype.validateText = function() {
        (this.textProperty._mdf || this.textProperty._isFirstFrame) && (this.buildNewText(), this.textProperty._isFirstFrame = !1, this.textProperty._mdf = !1);
      };
      var emptyShapeData = {
        shapes: []
      };
      function SVGTextLottieElement(t, n, c) {
        this.textSpans = [], this.renderType = "svg", this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], SVGTextLottieElement), SVGTextLottieElement.prototype.createContent = function() {
        this.data.singleShape && !this.globalData.fontManager.chars && (this.textContainer = createNS("text"));
      }, SVGTextLottieElement.prototype.buildTextContents = function(t) {
        for (var n = 0, c = t.length, d = [], v = ""; n < c; )
          t[n] === "\r" || t[n] === "" ? (d.push(v), v = "") : v += t[n], n += 1;
        return d.push(v), d;
      }, SVGTextLottieElement.prototype.buildShapeData = function(t, n) {
        if (t.shapes && t.shapes.length) {
          var c = t.shapes[0];
          if (c.it) {
            var d = c.it[c.it.length - 1];
            d.s && (d.s.k[0] = n, d.s.k[1] = n);
          }
        }
        return t;
      }, SVGTextLottieElement.prototype.buildNewText = function() {
        this.addDynamicProperty(this);
        var t, n, c = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(c ? c.l.length : 0), c.fc ? this.layerElement.setAttribute("fill", this.buildColor(c.fc)) : this.layerElement.setAttribute("fill", "rgba(0,0,0,0)"), c.sc && (this.layerElement.setAttribute("stroke", this.buildColor(c.sc)), this.layerElement.setAttribute("stroke-width", c.sw)), this.layerElement.setAttribute("font-size", c.finalSize);
        var d = this.globalData.fontManager.getFontByName(c.f);
        if (d.fClass)
          this.layerElement.setAttribute("class", d.fClass);
        else {
          this.layerElement.setAttribute("font-family", d.fFamily);
          var v = c.fWeight, y = c.fStyle;
          this.layerElement.setAttribute("font-style", y), this.layerElement.setAttribute("font-weight", v);
        }
        this.layerElement.setAttribute("aria-label", c.t);
        var x = c.l || [], w = !!this.globalData.fontManager.chars;
        n = x.length;
        var k, C = this.mHelper, P = "", F = this.data.singleShape, S = 0, j = 0, T = !0, A = c.tr * 1e-3 * c.finalSize;
        if (F && !w && !c.sz) {
          var R = this.textContainer, M = "start";
          switch (c.j) {
            case 1:
              M = "end";
              break;
            case 2:
              M = "middle";
              break;
            default:
              M = "start";
              break;
          }
          R.setAttribute("text-anchor", M), R.setAttribute("letter-spacing", A);
          var _ = this.buildTextContents(c.finalText);
          for (n = _.length, j = c.ps ? c.ps[1] + c.ascent : 0, t = 0; t < n; t += 1)
            k = this.textSpans[t].span || createNS("tspan"), k.textContent = _[t], k.setAttribute("x", 0), k.setAttribute("y", j), k.style.display = "inherit", R.appendChild(k), this.textSpans[t] || (this.textSpans[t] = {
              span: null,
              glyph: null
            }), this.textSpans[t].span = k, j += c.finalLineHeight;
          this.layerElement.appendChild(R);
        } else {
          var E = this.textSpans.length, I;
          for (t = 0; t < n; t += 1) {
            if (this.textSpans[t] || (this.textSpans[t] = {
              span: null,
              childSpan: null,
              glyph: null
            }), !w || !F || t === 0) {
              if (k = E > t ? this.textSpans[t].span : createNS(w ? "g" : "text"), E <= t) {
                if (k.setAttribute("stroke-linecap", "butt"), k.setAttribute("stroke-linejoin", "round"), k.setAttribute("stroke-miterlimit", "4"), this.textSpans[t].span = k, w) {
                  var L = createNS("g");
                  k.appendChild(L), this.textSpans[t].childSpan = L;
                }
                this.textSpans[t].span = k, this.layerElement.appendChild(k);
              }
              k.style.display = "inherit";
            }
            if (C.reset(), F && (x[t].n && (S = -A, j += c.yOffset, j += T ? 1 : 0, T = !1), this.applyTextPropertiesToMatrix(c, C, x[t].line, S, j), S += x[t].l || 0, S += A), w) {
              I = this.globalData.fontManager.getCharData(c.finalText[t], d.fStyle, this.globalData.fontManager.getFontByName(c.f).fFamily);
              var D;
              if (I.t === 1)
                D = new SVGCompElement(I.data, this.globalData, this);
              else {
                var O = emptyShapeData;
                I.data && I.data.shapes && (O = this.buildShapeData(I.data, c.finalSize)), D = new SVGShapeElement(O, this.globalData, this);
              }
              if (this.textSpans[t].glyph) {
                var z = this.textSpans[t].glyph;
                this.textSpans[t].childSpan.removeChild(z.layerElement), z.destroy();
              }
              this.textSpans[t].glyph = D, D._debug = !0, D.prepareFrame(0), D.renderFrame(), this.textSpans[t].childSpan.appendChild(D.layerElement), I.t === 1 && this.textSpans[t].childSpan.setAttribute("transform", "scale(" + c.finalSize / 100 + "," + c.finalSize / 100 + ")");
            } else
              F && k.setAttribute("transform", "translate(" + C.props[12] + "," + C.props[13] + ")"), k.textContent = x[t].val, k.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
          }
          F && k && k.setAttribute("d", P);
        }
        for (; t < this.textSpans.length; )
          this.textSpans[t].span.style.display = "none", t += 1;
        this._sizeChanged = !0;
      }, SVGTextLottieElement.prototype.sourceRectAtTime = function() {
        if (this.prepareFrame(this.comp.renderedFrame - this.data.st), this.renderInnerContent(), this._sizeChanged) {
          this._sizeChanged = !1;
          var t = this.layerElement.getBBox();
          this.bbox = {
            top: t.y,
            left: t.x,
            width: t.width,
            height: t.height
          };
        }
        return this.bbox;
      }, SVGTextLottieElement.prototype.getValue = function() {
        var t, n = this.textSpans.length, c;
        for (this.renderedFrame = this.comp.renderedFrame, t = 0; t < n; t += 1)
          c = this.textSpans[t].glyph, c && (c.prepareFrame(this.comp.renderedFrame - this.data.st), c._mdf && (this._mdf = !0));
      }, SVGTextLottieElement.prototype.renderInnerContent = function() {
        if (this.validateText(), (!this.data.singleShape || this._mdf) && (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag), this.lettersChangedFlag || this.textAnimator.lettersChangedFlag)) {
          this._sizeChanged = !0;
          var t, n, c = this.textAnimator.renderedLetters, d = this.textProperty.currentData.l;
          n = d.length;
          var v, y, x;
          for (t = 0; t < n; t += 1)
            d[t].n || (v = c[t], y = this.textSpans[t].span, x = this.textSpans[t].glyph, x && x.renderFrame(), v._mdf.m && y.setAttribute("transform", v.m), v._mdf.o && y.setAttribute("opacity", v.o), v._mdf.sw && y.setAttribute("stroke-width", v.sw), v._mdf.sc && y.setAttribute("stroke", v.sc), v._mdf.fc && y.setAttribute("fill", v.fc));
        }
      };
      function ISolidElement(t, n, c) {
        this.initElement(t, n, c);
      }
      extendPrototype([IImageElement], ISolidElement), ISolidElement.prototype.createContent = function() {
        var t = createNS("rect");
        t.setAttribute("width", this.data.sw), t.setAttribute("height", this.data.sh), t.setAttribute("fill", this.data.sc), this.layerElement.appendChild(t);
      };
      function NullElement(t, n, c) {
        this.initFrame(), this.initBaseData(t, n, c), this.initFrame(), this.initTransform(t, n, c), this.initHierarchy();
      }
      NullElement.prototype.prepareFrame = function(t) {
        this.prepareProperties(t, !0);
      }, NullElement.prototype.renderFrame = function() {
      }, NullElement.prototype.getBaseElement = function() {
        return null;
      }, NullElement.prototype.destroy = function() {
      }, NullElement.prototype.sourceRectAtTime = function() {
      }, NullElement.prototype.hide = function() {
      }, extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement], NullElement);
      function SVGRendererBase() {
      }
      extendPrototype([BaseRenderer], SVGRendererBase), SVGRendererBase.prototype.createNull = function(t) {
        return new NullElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createShape = function(t) {
        return new SVGShapeElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createText = function(t) {
        return new SVGTextLottieElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createImage = function(t) {
        return new IImageElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.createSolid = function(t) {
        return new ISolidElement(t, this.globalData, this);
      }, SVGRendererBase.prototype.configAnimation = function(t) {
        this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg"), this.svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"), this.renderConfig.viewBoxSize ? this.svgElement.setAttribute("viewBox", this.renderConfig.viewBoxSize) : this.svgElement.setAttribute("viewBox", "0 0 " + t.w + " " + t.h), this.renderConfig.viewBoxOnly || (this.svgElement.setAttribute("width", t.w), this.svgElement.setAttribute("height", t.h), this.svgElement.style.width = "100%", this.svgElement.style.height = "100%", this.svgElement.style.transform = "translate3d(0,0,0)", this.svgElement.style.contentVisibility = this.renderConfig.contentVisibility), this.renderConfig.width && this.svgElement.setAttribute("width", this.renderConfig.width), this.renderConfig.height && this.svgElement.setAttribute("height", this.renderConfig.height), this.renderConfig.className && this.svgElement.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.svgElement.setAttribute("id", this.renderConfig.id), this.renderConfig.focusable !== void 0 && this.svgElement.setAttribute("focusable", this.renderConfig.focusable), this.svgElement.setAttribute("preserveAspectRatio", this.renderConfig.preserveAspectRatio), this.animationItem.wrapper.appendChild(this.svgElement);
        var n = this.globalData.defs;
        this.setupGlobalData(t, n), this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.data = t;
        var c = createNS("clipPath"), d = createNS("rect");
        d.setAttribute("width", t.w), d.setAttribute("height", t.h), d.setAttribute("x", 0), d.setAttribute("y", 0);
        var v = createElementID();
        c.setAttribute("id", v), c.appendChild(d), this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + v + ")"), n.appendChild(c), this.layers = t.layers, this.elements = createSizedArray(t.layers.length);
      }, SVGRendererBase.prototype.destroy = function() {
        this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.layerElement = null, this.globalData.defs = null;
        var t, n = this.layers ? this.layers.length : 0;
        for (t = 0; t < n; t += 1)
          this.elements[t] && this.elements[t].destroy && this.elements[t].destroy();
        this.elements.length = 0, this.destroyed = !0, this.animationItem = null;
      }, SVGRendererBase.prototype.updateContainerSize = function() {
      }, SVGRendererBase.prototype.findIndexByInd = function(t) {
        var n = 0, c = this.layers.length;
        for (n = 0; n < c; n += 1)
          if (this.layers[n].ind === t)
            return n;
        return -1;
      }, SVGRendererBase.prototype.buildItem = function(t) {
        var n = this.elements;
        if (!(n[t] || this.layers[t].ty === 99)) {
          n[t] = !0;
          var c = this.createItem(this.layers[t]);
          if (n[t] = c, getExpressionsPlugin() && (this.layers[t].ty === 0 && this.globalData.projectInterface.registerComposition(c), c.initExpressions()), this.appendElementInPos(c, t), this.layers[t].tt) {
            var d = "tp" in this.layers[t] ? this.findIndexByInd(this.layers[t].tp) : t - 1;
            if (d === -1)
              return;
            if (!this.elements[d] || this.elements[d] === !0)
              this.buildItem(d), this.addPendingElement(c);
            else {
              var v = n[d], y = v.getMatte(this.layers[t].tt);
              c.setMatte(y);
            }
          }
        }
      }, SVGRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var t = this.pendingElements.pop();
          if (t.checkParenting(), t.data.tt)
            for (var n = 0, c = this.elements.length; n < c; ) {
              if (this.elements[n] === t) {
                var d = "tp" in t.data ? this.findIndexByInd(t.data.tp) : n - 1, v = this.elements[d], y = v.getMatte(this.layers[n].tt);
                t.setMatte(y);
                break;
              }
              n += 1;
            }
        }
      }, SVGRendererBase.prototype.renderFrame = function(t) {
        if (!(this.renderedFrame === t || this.destroyed)) {
          t === null ? t = this.renderedFrame : this.renderedFrame = t, this.globalData.frameNum = t, this.globalData.frameId += 1, this.globalData.projectInterface.currentFrame = t, this.globalData._mdf = !1;
          var n, c = this.layers.length;
          for (this.completeLayers || this.checkLayers(t), n = c - 1; n >= 0; n -= 1)
            (this.completeLayers || this.elements[n]) && this.elements[n].prepareFrame(t - this.layers[n].st);
          if (this.globalData._mdf)
            for (n = 0; n < c; n += 1)
              (this.completeLayers || this.elements[n]) && this.elements[n].renderFrame();
        }
      }, SVGRendererBase.prototype.appendElementInPos = function(t, n) {
        var c = t.getBaseElement();
        if (c) {
          for (var d = 0, v; d < n; )
            this.elements[d] && this.elements[d] !== !0 && this.elements[d].getBaseElement() && (v = this.elements[d].getBaseElement()), d += 1;
          v ? this.layerElement.insertBefore(c, v) : this.layerElement.appendChild(c);
        }
      }, SVGRendererBase.prototype.hide = function() {
        this.layerElement.style.display = "none";
      }, SVGRendererBase.prototype.show = function() {
        this.layerElement.style.display = "block";
      };
      function ICompElement() {
      }
      extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement, RenderableDOMElement], ICompElement), ICompElement.prototype.initElement = function(t, n, c) {
        this.initFrame(), this.initBaseData(t, n, c), this.initTransform(t, n, c), this.initRenderable(), this.initHierarchy(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), (this.data.xt || !n.progressiveLoad) && this.buildAllItems(), this.hide();
      }, ICompElement.prototype.prepareFrame = function(t) {
        if (this._mdf = !1, this.prepareRenderableFrame(t), this.prepareProperties(t, this.isInRange), !(!this.isInRange && !this.data.xt)) {
          if (this.tm._placeholder)
            this.renderedFrame = t / this.data.sr;
          else {
            var n = this.tm.v;
            n === this.data.op && (n = this.data.op - 1), this.renderedFrame = n;
          }
          var c, d = this.elements.length;
          for (this.completeLayers || this.checkLayers(this.renderedFrame), c = d - 1; c >= 0; c -= 1)
            (this.completeLayers || this.elements[c]) && (this.elements[c].prepareFrame(this.renderedFrame - this.layers[c].st), this.elements[c]._mdf && (this._mdf = !0));
        }
      }, ICompElement.prototype.renderInnerContent = function() {
        var t, n = this.layers.length;
        for (t = 0; t < n; t += 1)
          (this.completeLayers || this.elements[t]) && this.elements[t].renderFrame();
      }, ICompElement.prototype.setElements = function(t) {
        this.elements = t;
      }, ICompElement.prototype.getElements = function() {
        return this.elements;
      }, ICompElement.prototype.destroyElements = function() {
        var t, n = this.layers.length;
        for (t = 0; t < n; t += 1)
          this.elements[t] && this.elements[t].destroy();
      }, ICompElement.prototype.destroy = function() {
        this.destroyElements(), this.destroyBaseElement();
      };
      function SVGCompElement(t, n, c) {
        this.layers = t.layers, this.supports3d = !0, this.completeLayers = !1, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(t, n, c), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, n.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([SVGRendererBase, ICompElement, SVGBaseElement], SVGCompElement), SVGCompElement.prototype.createComp = function(t) {
        return new SVGCompElement(t, this.globalData, this);
      };
      function SVGRenderer(t, n) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.svgElement = createNS("svg");
        var c = "";
        if (n && n.title) {
          var d = createNS("title"), v = createElementID();
          d.setAttribute("id", v), d.textContent = n.title, this.svgElement.appendChild(d), c += v;
        }
        if (n && n.description) {
          var y = createNS("desc"), x = createElementID();
          y.setAttribute("id", x), y.textContent = n.description, this.svgElement.appendChild(y), c += " " + x;
        }
        c && this.svgElement.setAttribute("aria-labelledby", c);
        var w = createNS("defs");
        this.svgElement.appendChild(w);
        var k = createNS("g");
        this.svgElement.appendChild(k), this.layerElement = k, this.renderConfig = {
          preserveAspectRatio: n && n.preserveAspectRatio || "xMidYMid meet",
          imagePreserveAspectRatio: n && n.imagePreserveAspectRatio || "xMidYMid slice",
          contentVisibility: n && n.contentVisibility || "visible",
          progressiveLoad: n && n.progressiveLoad || !1,
          hideOnTransparent: !(n && n.hideOnTransparent === !1),
          viewBoxOnly: n && n.viewBoxOnly || !1,
          viewBoxSize: n && n.viewBoxSize || !1,
          className: n && n.className || "",
          id: n && n.id || "",
          focusable: n && n.focusable,
          filterSize: {
            width: n && n.filterSize && n.filterSize.width || "100%",
            height: n && n.filterSize && n.filterSize.height || "100%",
            x: n && n.filterSize && n.filterSize.x || "0%",
            y: n && n.filterSize && n.filterSize.y || "0%"
          },
          width: n && n.width,
          height: n && n.height,
          runExpressions: !n || n.runExpressions === void 0 || n.runExpressions
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          defs: w,
          renderConfig: this.renderConfig
        }, this.elements = [], this.pendingElements = [], this.destroyed = !1, this.rendererType = "svg";
      }
      extendPrototype([SVGRendererBase], SVGRenderer), SVGRenderer.prototype.createComp = function(t) {
        return new SVGCompElement(t, this.globalData, this);
      };
      function ShapeTransformManager() {
        this.sequences = {}, this.sequenceList = [], this.transform_key_count = 0;
      }
      ShapeTransformManager.prototype = {
        addTransformSequence: function(n) {
          var c, d = n.length, v = "_";
          for (c = 0; c < d; c += 1)
            v += n[c].transform.key + "_";
          var y = this.sequences[v];
          return y || (y = {
            transforms: [].concat(n),
            finalTransform: new Matrix(),
            _mdf: !1
          }, this.sequences[v] = y, this.sequenceList.push(y)), y;
        },
        processSequence: function(n, c) {
          for (var d = 0, v = n.transforms.length, y = c; d < v && !c; ) {
            if (n.transforms[d].transform.mProps._mdf) {
              y = !0;
              break;
            }
            d += 1;
          }
          if (y)
            for (n.finalTransform.reset(), d = v - 1; d >= 0; d -= 1)
              n.finalTransform.multiply(n.transforms[d].transform.mProps.v);
          n._mdf = y;
        },
        processSequences: function(n) {
          var c, d = this.sequenceList.length;
          for (c = 0; c < d; c += 1)
            this.processSequence(this.sequenceList[c], n);
        },
        getNewKey: function() {
          return this.transform_key_count += 1, "_" + this.transform_key_count;
        }
      };
      var lumaLoader = function() {
        var n = "__lottie_element_luma_buffer", c = null, d = null, v = null;
        function y() {
          var k = createNS("svg"), C = createNS("filter"), P = createNS("feColorMatrix");
          return C.setAttribute("id", n), P.setAttribute("type", "matrix"), P.setAttribute("color-interpolation-filters", "sRGB"), P.setAttribute("values", "0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0"), C.appendChild(P), k.appendChild(C), k.setAttribute("id", n + "_svg"), featureSupport.svgLumaHidden && (k.style.display = "none"), k;
        }
        function x() {
          c || (v = y(), document.body.appendChild(v), c = createTag("canvas"), d = c.getContext("2d"), d.filter = "url(#" + n + ")", d.fillStyle = "rgba(0,0,0,0)", d.fillRect(0, 0, 1, 1));
        }
        function w(k) {
          return c || x(), c.width = k.width, c.height = k.height, d.filter = "url(#" + n + ")", c;
        }
        return {
          load: x,
          get: w
        };
      };
      function createCanvas(t, n) {
        if (featureSupport.offscreenCanvas)
          return new OffscreenCanvas(t, n);
        var c = createTag("canvas");
        return c.width = t, c.height = n, c;
      }
      var assetLoader = (function() {
        return {
          loadLumaCanvas: lumaLoader.load,
          getLumaCanvas: lumaLoader.get,
          createCanvas
        };
      })(), registeredEffects = {};
      function CVEffects(t) {
        var n, c = t.data.ef ? t.data.ef.length : 0;
        this.filters = [];
        var d;
        for (n = 0; n < c; n += 1) {
          d = null;
          var v = t.data.ef[n].ty;
          if (registeredEffects[v]) {
            var y = registeredEffects[v].effect;
            d = new y(t.effectsManager.effectElements[n], t);
          }
          d && this.filters.push(d);
        }
        this.filters.length && t.addRenderableComponent(this);
      }
      CVEffects.prototype.renderFrame = function(t) {
        var n, c = this.filters.length;
        for (n = 0; n < c; n += 1)
          this.filters[n].renderFrame(t);
      }, CVEffects.prototype.getEffects = function(t) {
        var n, c = this.filters.length, d = [];
        for (n = 0; n < c; n += 1)
          this.filters[n].type === t && d.push(this.filters[n]);
        return d;
      };
      function registerEffect(t, n) {
        registeredEffects[t] = {
          effect: n
        };
      }
      function CVMaskElement(t, n) {
        this.data = t, this.element = n, this.masksProperties = this.data.masksProperties || [], this.viewData = createSizedArray(this.masksProperties.length);
        var c, d = this.masksProperties.length, v = !1;
        for (c = 0; c < d; c += 1)
          this.masksProperties[c].mode !== "n" && (v = !0), this.viewData[c] = ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[c], 3);
        this.hasMasks = v, v && this.element.addRenderableComponent(this);
      }
      CVMaskElement.prototype.renderFrame = function() {
        if (this.hasMasks) {
          var t = this.element.finalTransform.mat, n = this.element.canvasContext, c, d = this.masksProperties.length, v, y, x;
          for (n.beginPath(), c = 0; c < d; c += 1)
            if (this.masksProperties[c].mode !== "n") {
              this.masksProperties[c].inv && (n.moveTo(0, 0), n.lineTo(this.element.globalData.compSize.w, 0), n.lineTo(this.element.globalData.compSize.w, this.element.globalData.compSize.h), n.lineTo(0, this.element.globalData.compSize.h), n.lineTo(0, 0)), x = this.viewData[c].v, v = t.applyToPointArray(x.v[0][0], x.v[0][1], 0), n.moveTo(v[0], v[1]);
              var w, k = x._length;
              for (w = 1; w < k; w += 1)
                y = t.applyToTriplePoints(x.o[w - 1], x.i[w], x.v[w]), n.bezierCurveTo(y[0], y[1], y[2], y[3], y[4], y[5]);
              y = t.applyToTriplePoints(x.o[w - 1], x.i[0], x.v[0]), n.bezierCurveTo(y[0], y[1], y[2], y[3], y[4], y[5]);
            }
          this.element.globalData.renderer.save(!0), n.clip();
        }
      }, CVMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty, CVMaskElement.prototype.destroy = function() {
        this.element = null;
      };
      function CVBaseElement() {
      }
      var operationsMap = {
        1: "source-in",
        2: "source-out",
        3: "source-in",
        4: "source-out"
      };
      CVBaseElement.prototype = {
        createElements: function() {
        },
        initRendererElement: function() {
        },
        createContainerElements: function() {
          if (this.data.tt >= 1) {
            this.buffers = [];
            var n = this.globalData.canvasContext, c = assetLoader.createCanvas(n.canvas.width, n.canvas.height);
            this.buffers.push(c);
            var d = assetLoader.createCanvas(n.canvas.width, n.canvas.height);
            this.buffers.push(d), this.data.tt >= 3 && !document._isProxy && assetLoader.loadLumaCanvas();
          }
          this.canvasContext = this.globalData.canvasContext, this.transformCanvas = this.globalData.transformCanvas, this.renderableEffectsManager = new CVEffects(this), this.searchEffectTransforms();
        },
        createContent: function() {
        },
        setBlendMode: function() {
          var n = this.globalData;
          if (n.blendMode !== this.data.bm) {
            n.blendMode = this.data.bm;
            var c = getBlendMode(this.data.bm);
            n.canvasContext.globalCompositeOperation = c;
          }
        },
        createRenderableComponents: function() {
          this.maskManager = new CVMaskElement(this.data, this), this.transformEffects = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
        },
        hideElement: function() {
          !this.hidden && (!this.isInRange || this.isTransparent) && (this.hidden = !0);
        },
        showElement: function() {
          this.isInRange && !this.isTransparent && (this.hidden = !1, this._isFirstFrame = !0, this.maskManager._isFirstFrame = !0);
        },
        clearCanvas: function(n) {
          n.clearRect(this.transformCanvas.tx, this.transformCanvas.ty, this.transformCanvas.w * this.transformCanvas.sx, this.transformCanvas.h * this.transformCanvas.sy);
        },
        prepareLayer: function() {
          if (this.data.tt >= 1) {
            var n = this.buffers[0], c = n.getContext("2d");
            this.clearCanvas(c), c.drawImage(this.canvasContext.canvas, 0, 0), this.currentTransform = this.canvasContext.getTransform(), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform);
          }
        },
        exitLayer: function() {
          if (this.data.tt >= 1) {
            var n = this.buffers[1], c = n.getContext("2d");
            this.clearCanvas(c), c.drawImage(this.canvasContext.canvas, 0, 0), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform);
            var d = this.comp.getElementById("tp" in this.data ? this.data.tp : this.data.ind - 1);
            if (d.renderFrame(!0), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.data.tt >= 3 && !document._isProxy) {
              var v = assetLoader.getLumaCanvas(this.canvasContext.canvas), y = v.getContext("2d");
              y.drawImage(this.canvasContext.canvas, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.drawImage(v, 0, 0);
            }
            this.canvasContext.globalCompositeOperation = operationsMap[this.data.tt], this.canvasContext.drawImage(n, 0, 0), this.canvasContext.globalCompositeOperation = "destination-over", this.canvasContext.drawImage(this.buffers[0], 0, 0), this.canvasContext.setTransform(this.currentTransform), this.canvasContext.globalCompositeOperation = "source-over";
          }
        },
        renderFrame: function(n) {
          if (!(this.hidden || this.data.hd) && !(this.data.td === 1 && !n)) {
            this.renderTransform(), this.renderRenderable(), this.renderLocalTransform(), this.setBlendMode();
            var c = this.data.ty === 0;
            this.prepareLayer(), this.globalData.renderer.save(c), this.globalData.renderer.ctxTransform(this.finalTransform.localMat.props), this.globalData.renderer.ctxOpacity(this.finalTransform.localOpacity), this.renderInnerContent(), this.globalData.renderer.restore(c), this.exitLayer(), this.maskManager.hasMasks && this.globalData.renderer.restore(!0), this._isFirstFrame && (this._isFirstFrame = !1);
          }
        },
        destroy: function() {
          this.canvasContext = null, this.data = null, this.globalData = null, this.maskManager.destroy();
        },
        mHelper: new Matrix()
      }, CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement, CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;
      function CVShapeData(t, n, c, d) {
        this.styledShapes = [], this.tr = [0, 0, 0, 0, 0, 0];
        var v = 4;
        n.ty === "rc" ? v = 5 : n.ty === "el" ? v = 6 : n.ty === "sr" && (v = 7), this.sh = ShapePropertyFactory.getShapeProp(t, n, v, t);
        var y, x = c.length, w;
        for (y = 0; y < x; y += 1)
          c[y].closed || (w = {
            transforms: d.addTransformSequence(c[y].transforms),
            trNodes: []
          }, this.styledShapes.push(w), c[y].elements.push(w));
      }
      CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated;
      function CVShapeElement(t, n, c) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.itemsData = [], this.prevViewData = [], this.shapeModifiers = [], this.processedElements = [], this.transformsManager = new ShapeTransformManager(), this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableElement], CVShapeElement), CVShapeElement.prototype.initElement = RenderableDOMElement.prototype.initElement, CVShapeElement.prototype.transformHelper = {
        opacity: 1,
        _opMdf: !1
      }, CVShapeElement.prototype.dashResetter = [], CVShapeElement.prototype.createContent = function() {
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, []);
      }, CVShapeElement.prototype.createStyleElement = function(t, n) {
        var c = {
          data: t,
          type: t.ty,
          preTransforms: this.transformsManager.addTransformSequence(n),
          transforms: [],
          elements: [],
          closed: t.hd === !0
        }, d = {};
        if (t.ty === "fl" || t.ty === "st" ? (d.c = PropertyFactory.getProp(this, t.c, 1, 255, this), d.c.k || (c.co = "rgb(" + bmFloor(d.c.v[0]) + "," + bmFloor(d.c.v[1]) + "," + bmFloor(d.c.v[2]) + ")")) : (t.ty === "gf" || t.ty === "gs") && (d.s = PropertyFactory.getProp(this, t.s, 1, null, this), d.e = PropertyFactory.getProp(this, t.e, 1, null, this), d.h = PropertyFactory.getProp(this, t.h || {
          k: 0
        }, 0, 0.01, this), d.a = PropertyFactory.getProp(this, t.a || {
          k: 0
        }, 0, degToRads, this), d.g = new GradientProperty(this, t.g, this)), d.o = PropertyFactory.getProp(this, t.o, 0, 0.01, this), t.ty === "st" || t.ty === "gs") {
          if (c.lc = lineCapEnum[t.lc || 2], c.lj = lineJoinEnum[t.lj || 2], t.lj == 1 && (c.ml = t.ml), d.w = PropertyFactory.getProp(this, t.w, 0, null, this), d.w.k || (c.wi = d.w.v), t.d) {
            var v = new DashProperty(this, t.d, "canvas", this);
            d.d = v, d.d.k || (c.da = d.d.dashArray, c.do = d.d.dashoffset[0]);
          }
        } else
          c.r = t.r === 2 ? "evenodd" : "nonzero";
        return this.stylesList.push(c), d.style = c, d;
      }, CVShapeElement.prototype.createGroupElement = function() {
        var t = {
          it: [],
          prevViewData: []
        };
        return t;
      }, CVShapeElement.prototype.createTransformElement = function(t) {
        var n = {
          transform: {
            opacity: 1,
            _opMdf: !1,
            key: this.transformsManager.getNewKey(),
            op: PropertyFactory.getProp(this, t.o, 0, 0.01, this),
            mProps: TransformPropertyFactory.getTransformProperty(this, t, this)
          }
        };
        return n;
      }, CVShapeElement.prototype.createShapeElement = function(t) {
        var n = new CVShapeData(this, t, this.stylesList, this.transformsManager);
        return this.shapes.push(n), this.addShapeToModifiers(n), n;
      }, CVShapeElement.prototype.reloadShapes = function() {
        this._isFirstFrame = !0;
        var t, n = this.itemsData.length;
        for (t = 0; t < n; t += 1)
          this.prevViewData[t] = this.itemsData[t];
        for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, []), n = this.dynamicProperties.length, t = 0; t < n; t += 1)
          this.dynamicProperties[t].getValue();
        this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame);
      }, CVShapeElement.prototype.addTransformToStyleList = function(t) {
        var n, c = this.stylesList.length;
        for (n = 0; n < c; n += 1)
          this.stylesList[n].closed || this.stylesList[n].transforms.push(t);
      }, CVShapeElement.prototype.removeTransformFromStyleList = function() {
        var t, n = this.stylesList.length;
        for (t = 0; t < n; t += 1)
          this.stylesList[t].closed || this.stylesList[t].transforms.pop();
      }, CVShapeElement.prototype.closeStyles = function(t) {
        var n, c = t.length;
        for (n = 0; n < c; n += 1)
          t[n].closed = !0;
      }, CVShapeElement.prototype.searchShapes = function(t, n, c, d, v) {
        var y, x = t.length - 1, w, k, C = [], P = [], F, S, j, T = [].concat(v);
        for (y = x; y >= 0; y -= 1) {
          if (F = this.searchProcessedElement(t[y]), F ? n[y] = c[F - 1] : t[y]._shouldRender = d, t[y].ty === "fl" || t[y].ty === "st" || t[y].ty === "gf" || t[y].ty === "gs")
            F ? n[y].style.closed = !1 : n[y] = this.createStyleElement(t[y], T), C.push(n[y].style);
          else if (t[y].ty === "gr") {
            if (!F)
              n[y] = this.createGroupElement(t[y]);
            else
              for (k = n[y].it.length, w = 0; w < k; w += 1)
                n[y].prevViewData[w] = n[y].it[w];
            this.searchShapes(t[y].it, n[y].it, n[y].prevViewData, d, T);
          } else t[y].ty === "tr" ? (F || (j = this.createTransformElement(t[y]), n[y] = j), T.push(n[y]), this.addTransformToStyleList(n[y])) : t[y].ty === "sh" || t[y].ty === "rc" || t[y].ty === "el" || t[y].ty === "sr" ? F || (n[y] = this.createShapeElement(t[y])) : t[y].ty === "tm" || t[y].ty === "rd" || t[y].ty === "pb" || t[y].ty === "zz" || t[y].ty === "op" ? (F ? (S = n[y], S.closed = !1) : (S = ShapeModifiers.getModifier(t[y].ty), S.init(this, t[y]), n[y] = S, this.shapeModifiers.push(S)), P.push(S)) : t[y].ty === "rp" && (F ? (S = n[y], S.closed = !0) : (S = ShapeModifiers.getModifier(t[y].ty), n[y] = S, S.init(this, t, y, n), this.shapeModifiers.push(S), d = !1), P.push(S));
          this.addProcessedElement(t[y], y + 1);
        }
        for (this.removeTransformFromStyleList(), this.closeStyles(C), x = P.length, y = 0; y < x; y += 1)
          P[y].closed = !0;
      }, CVShapeElement.prototype.renderInnerContent = function() {
        this.transformHelper.opacity = 1, this.transformHelper._opMdf = !1, this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame), this.renderShape(this.transformHelper, this.shapesData, this.itemsData, !0);
      }, CVShapeElement.prototype.renderShapeTransform = function(t, n) {
        (t._opMdf || n.op._mdf || this._isFirstFrame) && (n.opacity = t.opacity, n.opacity *= n.op.v, n._opMdf = !0);
      }, CVShapeElement.prototype.drawLayer = function() {
        var t, n = this.stylesList.length, c, d, v, y, x, w, k = this.globalData.renderer, C = this.globalData.canvasContext, P, F;
        for (t = 0; t < n; t += 1)
          if (F = this.stylesList[t], P = F.type, !((P === "st" || P === "gs") && F.wi === 0 || !F.data._shouldRender || F.coOp === 0 || this.globalData.currentGlobalAlpha === 0)) {
            for (k.save(), x = F.elements, P === "st" || P === "gs" ? (k.ctxStrokeStyle(P === "st" ? F.co : F.grd), k.ctxLineWidth(F.wi), k.ctxLineCap(F.lc), k.ctxLineJoin(F.lj), k.ctxMiterLimit(F.ml || 0)) : k.ctxFillStyle(P === "fl" ? F.co : F.grd), k.ctxOpacity(F.coOp), P !== "st" && P !== "gs" && C.beginPath(), k.ctxTransform(F.preTransforms.finalTransform.props), d = x.length, c = 0; c < d; c += 1) {
              for ((P === "st" || P === "gs") && (C.beginPath(), F.da && (C.setLineDash(F.da), C.lineDashOffset = F.do)), w = x[c].trNodes, y = w.length, v = 0; v < y; v += 1)
                w[v].t === "m" ? C.moveTo(w[v].p[0], w[v].p[1]) : w[v].t === "c" ? C.bezierCurveTo(w[v].pts[0], w[v].pts[1], w[v].pts[2], w[v].pts[3], w[v].pts[4], w[v].pts[5]) : C.closePath();
              (P === "st" || P === "gs") && (k.ctxStroke(), F.da && C.setLineDash(this.dashResetter));
            }
            P !== "st" && P !== "gs" && this.globalData.renderer.ctxFill(F.r), k.restore();
          }
      }, CVShapeElement.prototype.renderShape = function(t, n, c, d) {
        var v, y = n.length - 1, x;
        for (x = t, v = y; v >= 0; v -= 1)
          n[v].ty === "tr" ? (x = c[v].transform, this.renderShapeTransform(t, x)) : n[v].ty === "sh" || n[v].ty === "el" || n[v].ty === "rc" || n[v].ty === "sr" ? this.renderPath(n[v], c[v]) : n[v].ty === "fl" ? this.renderFill(n[v], c[v], x) : n[v].ty === "st" ? this.renderStroke(n[v], c[v], x) : n[v].ty === "gf" || n[v].ty === "gs" ? this.renderGradientFill(n[v], c[v], x) : n[v].ty === "gr" ? this.renderShape(x, n[v].it, c[v].it) : n[v].ty;
        d && this.drawLayer();
      }, CVShapeElement.prototype.renderStyledShape = function(t, n) {
        if (this._isFirstFrame || n._mdf || t.transforms._mdf) {
          var c = t.trNodes, d = n.paths, v, y, x, w = d._length;
          c.length = 0;
          var k = t.transforms.finalTransform;
          for (x = 0; x < w; x += 1) {
            var C = d.shapes[x];
            if (C && C.v) {
              for (y = C._length, v = 1; v < y; v += 1)
                v === 1 && c.push({
                  t: "m",
                  p: k.applyToPointArray(C.v[0][0], C.v[0][1], 0)
                }), c.push({
                  t: "c",
                  pts: k.applyToTriplePoints(C.o[v - 1], C.i[v], C.v[v])
                });
              y === 1 && c.push({
                t: "m",
                p: k.applyToPointArray(C.v[0][0], C.v[0][1], 0)
              }), C.c && y && (c.push({
                t: "c",
                pts: k.applyToTriplePoints(C.o[v - 1], C.i[0], C.v[0])
              }), c.push({
                t: "z"
              }));
            }
          }
          t.trNodes = c;
        }
      }, CVShapeElement.prototype.renderPath = function(t, n) {
        if (t.hd !== !0 && t._shouldRender) {
          var c, d = n.styledShapes.length;
          for (c = 0; c < d; c += 1)
            this.renderStyledShape(n.styledShapes[c], n.sh);
        }
      }, CVShapeElement.prototype.renderFill = function(t, n, c) {
        var d = n.style;
        (n.c._mdf || this._isFirstFrame) && (d.co = "rgb(" + bmFloor(n.c.v[0]) + "," + bmFloor(n.c.v[1]) + "," + bmFloor(n.c.v[2]) + ")"), (n.o._mdf || c._opMdf || this._isFirstFrame) && (d.coOp = n.o.v * c.opacity);
      }, CVShapeElement.prototype.renderGradientFill = function(t, n, c) {
        var d = n.style, v;
        if (!d.grd || n.g._mdf || n.s._mdf || n.e._mdf || t.t !== 1 && (n.h._mdf || n.a._mdf)) {
          var y = this.globalData.canvasContext, x = n.s.v, w = n.e.v;
          if (t.t === 1)
            v = y.createLinearGradient(x[0], x[1], w[0], w[1]);
          else {
            var k = Math.sqrt(Math.pow(x[0] - w[0], 2) + Math.pow(x[1] - w[1], 2)), C = Math.atan2(w[1] - x[1], w[0] - x[0]), P = n.h.v;
            P >= 1 ? P = 0.99 : P <= -1 && (P = -0.99);
            var F = k * P, S = Math.cos(C + n.a.v) * F + x[0], j = Math.sin(C + n.a.v) * F + x[1];
            v = y.createRadialGradient(S, j, 0, x[0], x[1], k);
          }
          var T, A = t.g.p, R = n.g.c, M = 1;
          for (T = 0; T < A; T += 1)
            n.g._hasOpacity && n.g._collapsable && (M = n.g.o[T * 2 + 1]), v.addColorStop(R[T * 4] / 100, "rgba(" + R[T * 4 + 1] + "," + R[T * 4 + 2] + "," + R[T * 4 + 3] + "," + M + ")");
          d.grd = v;
        }
        d.coOp = n.o.v * c.opacity;
      }, CVShapeElement.prototype.renderStroke = function(t, n, c) {
        var d = n.style, v = n.d;
        v && (v._mdf || this._isFirstFrame) && (d.da = v.dashArray, d.do = v.dashoffset[0]), (n.c._mdf || this._isFirstFrame) && (d.co = "rgb(" + bmFloor(n.c.v[0]) + "," + bmFloor(n.c.v[1]) + "," + bmFloor(n.c.v[2]) + ")"), (n.o._mdf || c._opMdf || this._isFirstFrame) && (d.coOp = n.o.v * c.opacity), (n.w._mdf || this._isFirstFrame) && (d.wi = n.w.v);
      }, CVShapeElement.prototype.destroy = function() {
        this.shapesData = null, this.globalData = null, this.canvasContext = null, this.stylesList.length = 0, this.itemsData.length = 0;
      };
      function CVTextElement(t, n, c) {
        this.textSpans = [], this.yOffset = 0, this.fillColorAnim = !1, this.strokeColorAnim = !1, this.strokeWidthAnim = !1, this.stroke = !1, this.fill = !1, this.justifyOffset = 0, this.currentRender = null, this.renderType = "canvas", this.values = {
          fill: "rgba(0,0,0,0)",
          stroke: "rgba(0,0,0,0)",
          sWidth: 0,
          fValue: ""
        }, this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement, ITextElement], CVTextElement), CVTextElement.prototype.tHelper = createTag("canvas").getContext("2d"), CVTextElement.prototype.buildNewText = function() {
        var t = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
        var n = !1;
        t.fc ? (n = !0, this.values.fill = this.buildColor(t.fc)) : this.values.fill = "rgba(0,0,0,0)", this.fill = n;
        var c = !1;
        t.sc && (c = !0, this.values.stroke = this.buildColor(t.sc), this.values.sWidth = t.sw);
        var d = this.globalData.fontManager.getFontByName(t.f), v, y, x = t.l, w = this.mHelper;
        this.stroke = c, this.values.fValue = t.finalSize + "px " + this.globalData.fontManager.getFontByName(t.f).fFamily, y = t.finalText.length;
        var k, C, P, F, S, j, T, A, R, M, _ = this.data.singleShape, E = t.tr * 1e-3 * t.finalSize, I = 0, L = 0, D = !0, O = 0;
        for (v = 0; v < y; v += 1) {
          k = this.globalData.fontManager.getCharData(t.finalText[v], d.fStyle, this.globalData.fontManager.getFontByName(t.f).fFamily), C = k && k.data || {}, w.reset(), _ && x[v].n && (I = -E, L += t.yOffset, L += D ? 1 : 0, D = !1), S = C.shapes ? C.shapes[0].it : [], T = S.length, w.scale(t.finalSize / 100, t.finalSize / 100), _ && this.applyTextPropertiesToMatrix(t, w, x[v].line, I, L), R = createSizedArray(T - 1);
          var z = 0;
          for (j = 0; j < T; j += 1)
            if (S[j].ty === "sh") {
              for (F = S[j].ks.k.i.length, A = S[j].ks.k, M = [], P = 1; P < F; P += 1)
                P === 1 && M.push(w.applyToX(A.v[0][0], A.v[0][1], 0), w.applyToY(A.v[0][0], A.v[0][1], 0)), M.push(w.applyToX(A.o[P - 1][0], A.o[P - 1][1], 0), w.applyToY(A.o[P - 1][0], A.o[P - 1][1], 0), w.applyToX(A.i[P][0], A.i[P][1], 0), w.applyToY(A.i[P][0], A.i[P][1], 0), w.applyToX(A.v[P][0], A.v[P][1], 0), w.applyToY(A.v[P][0], A.v[P][1], 0));
              M.push(w.applyToX(A.o[P - 1][0], A.o[P - 1][1], 0), w.applyToY(A.o[P - 1][0], A.o[P - 1][1], 0), w.applyToX(A.i[0][0], A.i[0][1], 0), w.applyToY(A.i[0][0], A.i[0][1], 0), w.applyToX(A.v[0][0], A.v[0][1], 0), w.applyToY(A.v[0][0], A.v[0][1], 0)), R[z] = M, z += 1;
            }
          _ && (I += x[v].l, I += E), this.textSpans[O] ? this.textSpans[O].elem = R : this.textSpans[O] = {
            elem: R
          }, O += 1;
        }
      }, CVTextElement.prototype.renderInnerContent = function() {
        this.validateText();
        var t = this.canvasContext;
        t.font = this.values.fValue, this.globalData.renderer.ctxLineCap("butt"), this.globalData.renderer.ctxLineJoin("miter"), this.globalData.renderer.ctxMiterLimit(4), this.data.singleShape || this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
        var n, c, d, v, y, x, w = this.textAnimator.renderedLetters, k = this.textProperty.currentData.l;
        c = k.length;
        var C, P = null, F = null, S = null, j, T, A = this.globalData.renderer;
        for (n = 0; n < c; n += 1)
          if (!k[n].n) {
            if (C = w[n], C && (A.save(), A.ctxTransform(C.p), A.ctxOpacity(C.o)), this.fill) {
              for (C && C.fc ? P !== C.fc && (A.ctxFillStyle(C.fc), P = C.fc) : P !== this.values.fill && (P = this.values.fill, A.ctxFillStyle(this.values.fill)), j = this.textSpans[n].elem, v = j.length, this.globalData.canvasContext.beginPath(), d = 0; d < v; d += 1)
                for (T = j[d], x = T.length, this.globalData.canvasContext.moveTo(T[0], T[1]), y = 2; y < x; y += 6)
                  this.globalData.canvasContext.bezierCurveTo(T[y], T[y + 1], T[y + 2], T[y + 3], T[y + 4], T[y + 5]);
              this.globalData.canvasContext.closePath(), A.ctxFill();
            }
            if (this.stroke) {
              for (C && C.sw ? S !== C.sw && (S = C.sw, A.ctxLineWidth(C.sw)) : S !== this.values.sWidth && (S = this.values.sWidth, A.ctxLineWidth(this.values.sWidth)), C && C.sc ? F !== C.sc && (F = C.sc, A.ctxStrokeStyle(C.sc)) : F !== this.values.stroke && (F = this.values.stroke, A.ctxStrokeStyle(this.values.stroke)), j = this.textSpans[n].elem, v = j.length, this.globalData.canvasContext.beginPath(), d = 0; d < v; d += 1)
                for (T = j[d], x = T.length, this.globalData.canvasContext.moveTo(T[0], T[1]), y = 2; y < x; y += 6)
                  this.globalData.canvasContext.bezierCurveTo(T[y], T[y + 1], T[y + 2], T[y + 3], T[y + 4], T[y + 5]);
              this.globalData.canvasContext.closePath(), A.ctxStroke();
            }
            C && this.globalData.renderer.restore();
          }
      };
      function CVImageElement(t, n, c) {
        this.assetData = n.getAssetData(t.refId), this.img = n.imageLoader.getAsset(this.assetData), this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVImageElement), CVImageElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVImageElement.prototype.createContent = function() {
        if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height)) {
          var t = createTag("canvas");
          t.width = this.assetData.w, t.height = this.assetData.h;
          var n = t.getContext("2d"), c = this.img.width, d = this.img.height, v = c / d, y = this.assetData.w / this.assetData.h, x, w, k = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;
          v > y && k === "xMidYMid slice" || v < y && k !== "xMidYMid slice" ? (w = d, x = w * y) : (x = c, w = x / y), n.drawImage(this.img, (c - x) / 2, (d - w) / 2, x, w, 0, 0, this.assetData.w, this.assetData.h), this.img = t;
        }
      }, CVImageElement.prototype.renderInnerContent = function() {
        this.canvasContext.drawImage(this.img, 0, 0);
      }, CVImageElement.prototype.destroy = function() {
        this.img = null;
      };
      function CVSolidElement(t, n, c) {
        this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement), CVSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVSolidElement.prototype.renderInnerContent = function() {
        this.globalData.renderer.ctxFillStyle(this.data.sc), this.globalData.renderer.ctxFillRect(0, 0, this.data.sw, this.data.sh);
      };
      function CanvasRendererBase() {
      }
      extendPrototype([BaseRenderer], CanvasRendererBase), CanvasRendererBase.prototype.createShape = function(t) {
        return new CVShapeElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createText = function(t) {
        return new CVTextElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createImage = function(t) {
        return new CVImageElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createSolid = function(t) {
        return new CVSolidElement(t, this.globalData, this);
      }, CanvasRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, CanvasRendererBase.prototype.ctxTransform = function(t) {
        t[0] === 1 && t[1] === 0 && t[4] === 0 && t[5] === 1 && t[12] === 0 && t[13] === 0 || this.canvasContext.transform(t[0], t[1], t[4], t[5], t[12], t[13]);
      }, CanvasRendererBase.prototype.ctxOpacity = function(t) {
        this.canvasContext.globalAlpha *= t < 0 ? 0 : t;
      }, CanvasRendererBase.prototype.ctxFillStyle = function(t) {
        this.canvasContext.fillStyle = t;
      }, CanvasRendererBase.prototype.ctxStrokeStyle = function(t) {
        this.canvasContext.strokeStyle = t;
      }, CanvasRendererBase.prototype.ctxLineWidth = function(t) {
        this.canvasContext.lineWidth = t;
      }, CanvasRendererBase.prototype.ctxLineCap = function(t) {
        this.canvasContext.lineCap = t;
      }, CanvasRendererBase.prototype.ctxLineJoin = function(t) {
        this.canvasContext.lineJoin = t;
      }, CanvasRendererBase.prototype.ctxMiterLimit = function(t) {
        this.canvasContext.miterLimit = t;
      }, CanvasRendererBase.prototype.ctxFill = function(t) {
        this.canvasContext.fill(t);
      }, CanvasRendererBase.prototype.ctxFillRect = function(t, n, c, d) {
        this.canvasContext.fillRect(t, n, c, d);
      }, CanvasRendererBase.prototype.ctxStroke = function() {
        this.canvasContext.stroke();
      }, CanvasRendererBase.prototype.reset = function() {
        if (!this.renderConfig.clearCanvas) {
          this.canvasContext.restore();
          return;
        }
        this.contextData.reset();
      }, CanvasRendererBase.prototype.save = function() {
        this.canvasContext.save();
      }, CanvasRendererBase.prototype.restore = function(t) {
        if (!this.renderConfig.clearCanvas) {
          this.canvasContext.restore();
          return;
        }
        t && (this.globalData.blendMode = "source-over"), this.contextData.restore(t);
      }, CanvasRendererBase.prototype.configAnimation = function(t) {
        if (this.animationItem.wrapper) {
          this.animationItem.container = createTag("canvas");
          var n = this.animationItem.container.style;
          n.width = "100%", n.height = "100%";
          var c = "0px 0px 0px";
          n.transformOrigin = c, n.mozTransformOrigin = c, n.webkitTransformOrigin = c, n["-webkit-transform"] = c, n.contentVisibility = this.renderConfig.contentVisibility, this.animationItem.wrapper.appendChild(this.animationItem.container), this.canvasContext = this.animationItem.container.getContext("2d"), this.renderConfig.className && this.animationItem.container.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.animationItem.container.setAttribute("id", this.renderConfig.id);
        } else
          this.canvasContext = this.renderConfig.context;
        this.contextData.setContext(this.canvasContext), this.data = t, this.layers = t.layers, this.transformCanvas = {
          w: t.w,
          h: t.h,
          sx: 0,
          sy: 0,
          tx: 0,
          ty: 0
        }, this.setupGlobalData(t, document.body), this.globalData.canvasContext = this.canvasContext, this.globalData.renderer = this, this.globalData.isDashed = !1, this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.globalData.transformCanvas = this.transformCanvas, this.elements = createSizedArray(t.layers.length), this.updateContainerSize();
      }, CanvasRendererBase.prototype.updateContainerSize = function(t, n) {
        this.reset();
        var c, d;
        t ? (c = t, d = n, this.canvasContext.canvas.width = c, this.canvasContext.canvas.height = d) : (this.animationItem.wrapper && this.animationItem.container ? (c = this.animationItem.wrapper.offsetWidth, d = this.animationItem.wrapper.offsetHeight) : (c = this.canvasContext.canvas.width, d = this.canvasContext.canvas.height), this.canvasContext.canvas.width = c * this.renderConfig.dpr, this.canvasContext.canvas.height = d * this.renderConfig.dpr);
        var v, y;
        if (this.renderConfig.preserveAspectRatio.indexOf("meet") !== -1 || this.renderConfig.preserveAspectRatio.indexOf("slice") !== -1) {
          var x = this.renderConfig.preserveAspectRatio.split(" "), w = x[1] || "meet", k = x[0] || "xMidYMid", C = k.substr(0, 4), P = k.substr(4);
          v = c / d, y = this.transformCanvas.w / this.transformCanvas.h, y > v && w === "meet" || y < v && w === "slice" ? (this.transformCanvas.sx = c / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = c / (this.transformCanvas.w / this.renderConfig.dpr)) : (this.transformCanvas.sx = d / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.sy = d / (this.transformCanvas.h / this.renderConfig.dpr)), C === "xMid" && (y < v && w === "meet" || y > v && w === "slice") ? this.transformCanvas.tx = (c - this.transformCanvas.w * (d / this.transformCanvas.h)) / 2 * this.renderConfig.dpr : C === "xMax" && (y < v && w === "meet" || y > v && w === "slice") ? this.transformCanvas.tx = (c - this.transformCanvas.w * (d / this.transformCanvas.h)) * this.renderConfig.dpr : this.transformCanvas.tx = 0, P === "YMid" && (y > v && w === "meet" || y < v && w === "slice") ? this.transformCanvas.ty = (d - this.transformCanvas.h * (c / this.transformCanvas.w)) / 2 * this.renderConfig.dpr : P === "YMax" && (y > v && w === "meet" || y < v && w === "slice") ? this.transformCanvas.ty = (d - this.transformCanvas.h * (c / this.transformCanvas.w)) * this.renderConfig.dpr : this.transformCanvas.ty = 0;
        } else this.renderConfig.preserveAspectRatio === "none" ? (this.transformCanvas.sx = c / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = d / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.tx = 0, this.transformCanvas.ty = 0) : (this.transformCanvas.sx = this.renderConfig.dpr, this.transformCanvas.sy = this.renderConfig.dpr, this.transformCanvas.tx = 0, this.transformCanvas.ty = 0);
        this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1], this.ctxTransform(this.transformCanvas.props), this.canvasContext.beginPath(), this.canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h), this.canvasContext.closePath(), this.canvasContext.clip(), this.renderFrame(this.renderedFrame, !0);
      }, CanvasRendererBase.prototype.destroy = function() {
        this.renderConfig.clearCanvas && this.animationItem.wrapper && (this.animationItem.wrapper.innerText = "");
        var t, n = this.layers ? this.layers.length : 0;
        for (t = n - 1; t >= 0; t -= 1)
          this.elements[t] && this.elements[t].destroy && this.elements[t].destroy();
        this.elements.length = 0, this.globalData.canvasContext = null, this.animationItem.container = null, this.destroyed = !0;
      }, CanvasRendererBase.prototype.renderFrame = function(t, n) {
        if (!(this.renderedFrame === t && this.renderConfig.clearCanvas === !0 && !n || this.destroyed || t === -1)) {
          this.renderedFrame = t, this.globalData.frameNum = t - this.animationItem._isFirstFrame, this.globalData.frameId += 1, this.globalData._mdf = !this.renderConfig.clearCanvas || n, this.globalData.projectInterface.currentFrame = t;
          var c, d = this.layers.length;
          for (this.completeLayers || this.checkLayers(t), c = d - 1; c >= 0; c -= 1)
            (this.completeLayers || this.elements[c]) && this.elements[c].prepareFrame(t - this.layers[c].st);
          if (this.globalData._mdf) {
            for (this.renderConfig.clearCanvas === !0 ? this.canvasContext.clearRect(0, 0, this.transformCanvas.w, this.transformCanvas.h) : this.save(), c = d - 1; c >= 0; c -= 1)
              (this.completeLayers || this.elements[c]) && this.elements[c].renderFrame();
            this.renderConfig.clearCanvas !== !0 && this.restore();
          }
        }
      }, CanvasRendererBase.prototype.buildItem = function(t) {
        var n = this.elements;
        if (!(n[t] || this.layers[t].ty === 99)) {
          var c = this.createItem(this.layers[t], this, this.globalData);
          n[t] = c, c.initExpressions();
        }
      }, CanvasRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var t = this.pendingElements.pop();
          t.checkParenting();
        }
      }, CanvasRendererBase.prototype.hide = function() {
        this.animationItem.container.style.display = "none";
      }, CanvasRendererBase.prototype.show = function() {
        this.animationItem.container.style.display = "block";
      };
      function CanvasContext() {
        this.opacity = -1, this.transform = createTypedArray("float32", 16), this.fillStyle = "", this.strokeStyle = "", this.lineWidth = "", this.lineCap = "", this.lineJoin = "", this.miterLimit = "", this.id = Math.random();
      }
      function CVContextData() {
        this.stack = [], this.cArrPos = 0, this.cTr = new Matrix();
        var t, n = 15;
        for (t = 0; t < n; t += 1) {
          var c = new CanvasContext();
          this.stack[t] = c;
        }
        this._length = n, this.nativeContext = null, this.transformMat = new Matrix(), this.currentOpacity = 1, this.currentFillStyle = "", this.appliedFillStyle = "", this.currentStrokeStyle = "", this.appliedStrokeStyle = "", this.currentLineWidth = "", this.appliedLineWidth = "", this.currentLineCap = "", this.appliedLineCap = "", this.currentLineJoin = "", this.appliedLineJoin = "", this.appliedMiterLimit = "", this.currentMiterLimit = "";
      }
      CVContextData.prototype.duplicate = function() {
        var t = this._length * 2, n = 0;
        for (n = this._length; n < t; n += 1)
          this.stack[n] = new CanvasContext();
        this._length = t;
      }, CVContextData.prototype.reset = function() {
        this.cArrPos = 0, this.cTr.reset(), this.stack[this.cArrPos].opacity = 1;
      }, CVContextData.prototype.restore = function(t) {
        this.cArrPos -= 1;
        var n = this.stack[this.cArrPos], c = n.transform, d, v = this.cTr.props;
        for (d = 0; d < 16; d += 1)
          v[d] = c[d];
        if (t) {
          this.nativeContext.restore();
          var y = this.stack[this.cArrPos + 1];
          this.appliedFillStyle = y.fillStyle, this.appliedStrokeStyle = y.strokeStyle, this.appliedLineWidth = y.lineWidth, this.appliedLineCap = y.lineCap, this.appliedLineJoin = y.lineJoin, this.appliedMiterLimit = y.miterLimit;
        }
        this.nativeContext.setTransform(c[0], c[1], c[4], c[5], c[12], c[13]), (t || n.opacity !== -1 && this.currentOpacity !== n.opacity) && (this.nativeContext.globalAlpha = n.opacity, this.currentOpacity = n.opacity), this.currentFillStyle = n.fillStyle, this.currentStrokeStyle = n.strokeStyle, this.currentLineWidth = n.lineWidth, this.currentLineCap = n.lineCap, this.currentLineJoin = n.lineJoin, this.currentMiterLimit = n.miterLimit;
      }, CVContextData.prototype.save = function(t) {
        t && this.nativeContext.save();
        var n = this.cTr.props;
        this._length <= this.cArrPos && this.duplicate();
        var c = this.stack[this.cArrPos], d;
        for (d = 0; d < 16; d += 1)
          c.transform[d] = n[d];
        this.cArrPos += 1;
        var v = this.stack[this.cArrPos];
        v.opacity = c.opacity, v.fillStyle = c.fillStyle, v.strokeStyle = c.strokeStyle, v.lineWidth = c.lineWidth, v.lineCap = c.lineCap, v.lineJoin = c.lineJoin, v.miterLimit = c.miterLimit;
      }, CVContextData.prototype.setOpacity = function(t) {
        this.stack[this.cArrPos].opacity = t;
      }, CVContextData.prototype.setContext = function(t) {
        this.nativeContext = t;
      }, CVContextData.prototype.fillStyle = function(t) {
        this.stack[this.cArrPos].fillStyle !== t && (this.currentFillStyle = t, this.stack[this.cArrPos].fillStyle = t);
      }, CVContextData.prototype.strokeStyle = function(t) {
        this.stack[this.cArrPos].strokeStyle !== t && (this.currentStrokeStyle = t, this.stack[this.cArrPos].strokeStyle = t);
      }, CVContextData.prototype.lineWidth = function(t) {
        this.stack[this.cArrPos].lineWidth !== t && (this.currentLineWidth = t, this.stack[this.cArrPos].lineWidth = t);
      }, CVContextData.prototype.lineCap = function(t) {
        this.stack[this.cArrPos].lineCap !== t && (this.currentLineCap = t, this.stack[this.cArrPos].lineCap = t);
      }, CVContextData.prototype.lineJoin = function(t) {
        this.stack[this.cArrPos].lineJoin !== t && (this.currentLineJoin = t, this.stack[this.cArrPos].lineJoin = t);
      }, CVContextData.prototype.miterLimit = function(t) {
        this.stack[this.cArrPos].miterLimit !== t && (this.currentMiterLimit = t, this.stack[this.cArrPos].miterLimit = t);
      }, CVContextData.prototype.transform = function(t) {
        this.transformMat.cloneFromProps(t);
        var n = this.cTr;
        this.transformMat.multiply(n), n.cloneFromProps(this.transformMat.props);
        var c = n.props;
        this.nativeContext.setTransform(c[0], c[1], c[4], c[5], c[12], c[13]);
      }, CVContextData.prototype.opacity = function(t) {
        var n = this.stack[this.cArrPos].opacity;
        n *= t < 0 ? 0 : t, this.stack[this.cArrPos].opacity !== n && (this.currentOpacity !== t && (this.nativeContext.globalAlpha = t, this.currentOpacity = t), this.stack[this.cArrPos].opacity = n);
      }, CVContextData.prototype.fill = function(t) {
        this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fill(t);
      }, CVContextData.prototype.fillRect = function(t, n, c, d) {
        this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fillRect(t, n, c, d);
      }, CVContextData.prototype.stroke = function() {
        this.appliedStrokeStyle !== this.currentStrokeStyle && (this.appliedStrokeStyle = this.currentStrokeStyle, this.nativeContext.strokeStyle = this.appliedStrokeStyle), this.appliedLineWidth !== this.currentLineWidth && (this.appliedLineWidth = this.currentLineWidth, this.nativeContext.lineWidth = this.appliedLineWidth), this.appliedLineCap !== this.currentLineCap && (this.appliedLineCap = this.currentLineCap, this.nativeContext.lineCap = this.appliedLineCap), this.appliedLineJoin !== this.currentLineJoin && (this.appliedLineJoin = this.currentLineJoin, this.nativeContext.lineJoin = this.appliedLineJoin), this.appliedMiterLimit !== this.currentMiterLimit && (this.appliedMiterLimit = this.currentMiterLimit, this.nativeContext.miterLimit = this.appliedMiterLimit), this.nativeContext.stroke();
      };
      function CVCompElement(t, n, c) {
        this.completeLayers = !1, this.layers = t.layers, this.pendingElements = [], this.elements = createSizedArray(this.layers.length), this.initElement(t, n, c), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, n.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([CanvasRendererBase, ICompElement, CVBaseElement], CVCompElement), CVCompElement.prototype.renderInnerContent = function() {
        var t = this.canvasContext;
        t.beginPath(), t.moveTo(0, 0), t.lineTo(this.data.w, 0), t.lineTo(this.data.w, this.data.h), t.lineTo(0, this.data.h), t.lineTo(0, 0), t.clip();
        var n, c = this.layers.length;
        for (n = c - 1; n >= 0; n -= 1)
          (this.completeLayers || this.elements[n]) && this.elements[n].renderFrame();
      }, CVCompElement.prototype.destroy = function() {
        var t, n = this.layers.length;
        for (t = n - 1; t >= 0; t -= 1)
          this.elements[t] && this.elements[t].destroy();
        this.layers = null, this.elements = null;
      }, CVCompElement.prototype.createComp = function(t) {
        return new CVCompElement(t, this.globalData, this);
      };
      function CanvasRenderer(t, n) {
        this.animationItem = t, this.renderConfig = {
          clearCanvas: n && n.clearCanvas !== void 0 ? n.clearCanvas : !0,
          context: n && n.context || null,
          progressiveLoad: n && n.progressiveLoad || !1,
          preserveAspectRatio: n && n.preserveAspectRatio || "xMidYMid meet",
          imagePreserveAspectRatio: n && n.imagePreserveAspectRatio || "xMidYMid slice",
          contentVisibility: n && n.contentVisibility || "visible",
          className: n && n.className || "",
          id: n && n.id || "",
          runExpressions: !n || n.runExpressions === void 0 || n.runExpressions
        }, this.renderConfig.dpr = n && n.dpr || 1, this.animationItem.wrapper && (this.renderConfig.dpr = n && n.dpr || window.devicePixelRatio || 1), this.renderedFrame = -1, this.globalData = {
          frameNum: -1,
          _mdf: !1,
          renderConfig: this.renderConfig,
          currentGlobalAlpha: -1
        }, this.contextData = new CVContextData(), this.elements = [], this.pendingElements = [], this.transformMat = new Matrix(), this.completeLayers = !1, this.rendererType = "canvas", this.renderConfig.clearCanvas && (this.ctxTransform = this.contextData.transform.bind(this.contextData), this.ctxOpacity = this.contextData.opacity.bind(this.contextData), this.ctxFillStyle = this.contextData.fillStyle.bind(this.contextData), this.ctxStrokeStyle = this.contextData.strokeStyle.bind(this.contextData), this.ctxLineWidth = this.contextData.lineWidth.bind(this.contextData), this.ctxLineCap = this.contextData.lineCap.bind(this.contextData), this.ctxLineJoin = this.contextData.lineJoin.bind(this.contextData), this.ctxMiterLimit = this.contextData.miterLimit.bind(this.contextData), this.ctxFill = this.contextData.fill.bind(this.contextData), this.ctxFillRect = this.contextData.fillRect.bind(this.contextData), this.ctxStroke = this.contextData.stroke.bind(this.contextData), this.save = this.contextData.save.bind(this.contextData));
      }
      extendPrototype([CanvasRendererBase], CanvasRenderer), CanvasRenderer.prototype.createComp = function(t) {
        return new CVCompElement(t, this.globalData, this);
      };
      function HBaseElement() {
      }
      HBaseElement.prototype = {
        checkBlendMode: function() {
        },
        initRendererElement: function() {
          this.baseElement = createTag(this.data.tg || "div"), this.data.hasMask ? (this.svgElement = createNS("svg"), this.layerElement = createNS("g"), this.maskedElement = this.layerElement, this.svgElement.appendChild(this.layerElement), this.baseElement.appendChild(this.svgElement)) : this.layerElement = this.baseElement, styleDiv(this.baseElement);
        },
        createContainerElements: function() {
          this.renderableEffectsManager = new CVEffects(this), this.transformedElement = this.baseElement, this.maskedElement = this.layerElement, this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data.cl && this.layerElement.setAttribute("class", this.data.cl), this.data.bm !== 0 && this.setBlendMode();
        },
        renderElement: function() {
          var n = this.transformedElement ? this.transformedElement.style : {};
          if (this.finalTransform._matMdf) {
            var c = this.finalTransform.mat.toCSS();
            n.transform = c, n.webkitTransform = c;
          }
          this.finalTransform._opMdf && (n.opacity = this.finalTransform.mProp.o.v);
        },
        renderFrame: function() {
          this.data.hd || this.hidden || (this.renderTransform(), this.renderRenderable(), this.renderElement(), this.renderInnerContent(), this._isFirstFrame && (this._isFirstFrame = !1));
        },
        destroy: function() {
          this.layerElement = null, this.transformedElement = null, this.matteElement && (this.matteElement = null), this.maskManager && (this.maskManager.destroy(), this.maskManager = null);
        },
        createRenderableComponents: function() {
          this.maskManager = new MaskElement(this.data, this, this.globalData);
        },
        addEffects: function() {
        },
        setMatte: function() {
        }
      }, HBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement, HBaseElement.prototype.destroyBaseElement = HBaseElement.prototype.destroy, HBaseElement.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting;
      function HSolidElement(t, n, c) {
        this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], HSolidElement), HSolidElement.prototype.createContent = function() {
        var t;
        this.data.hasMask ? (t = createNS("rect"), t.setAttribute("width", this.data.sw), t.setAttribute("height", this.data.sh), t.setAttribute("fill", this.data.sc), this.svgElement.setAttribute("width", this.data.sw), this.svgElement.setAttribute("height", this.data.sh)) : (t = createTag("div"), t.style.width = this.data.sw + "px", t.style.height = this.data.sh + "px", t.style.backgroundColor = this.data.sc), this.layerElement.appendChild(t);
      };
      function HShapeElement(t, n, c) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.shapesContainer = createNS("g"), this.initElement(t, n, c), this.prevViewData = [], this.currentBBox = {
          x: 999999,
          y: -999999,
          h: 0,
          w: 0
        };
      }
      extendPrototype([BaseElement, TransformElement, HSolidElement, SVGShapeElement, HBaseElement, HierarchyElement, FrameElement, RenderableElement], HShapeElement), HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype.renderInnerContent, HShapeElement.prototype.createContent = function() {
        var t;
        if (this.baseElement.style.fontSize = 0, this.data.hasMask)
          this.layerElement.appendChild(this.shapesContainer), t = this.svgElement;
        else {
          t = createNS("svg");
          var n = this.comp.data ? this.comp.data : this.globalData.compSize;
          t.setAttribute("width", n.w), t.setAttribute("height", n.h), t.appendChild(this.shapesContainer), this.layerElement.appendChild(t);
        }
        this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.shapesContainer, 0, [], !0), this.filterUniqueShapes(), this.shapeCont = t;
      }, HShapeElement.prototype.getTransformedPoint = function(t, n) {
        var c, d = t.length;
        for (c = 0; c < d; c += 1)
          n = t[c].mProps.v.applyToPointArray(n[0], n[1], 0);
        return n;
      }, HShapeElement.prototype.calculateShapeBoundingBox = function(t, n) {
        var c = t.sh.v, d = t.transformers, v, y = c._length, x, w, k, C;
        if (!(y <= 1)) {
          for (v = 0; v < y - 1; v += 1)
            x = this.getTransformedPoint(d, c.v[v]), w = this.getTransformedPoint(d, c.o[v]), k = this.getTransformedPoint(d, c.i[v + 1]), C = this.getTransformedPoint(d, c.v[v + 1]), this.checkBounds(x, w, k, C, n);
          c.c && (x = this.getTransformedPoint(d, c.v[v]), w = this.getTransformedPoint(d, c.o[v]), k = this.getTransformedPoint(d, c.i[0]), C = this.getTransformedPoint(d, c.v[0]), this.checkBounds(x, w, k, C, n));
        }
      }, HShapeElement.prototype.checkBounds = function(t, n, c, d, v) {
        this.getBoundsOfCurve(t, n, c, d);
        var y = this.shapeBoundingBox;
        v.x = bmMin(y.left, v.x), v.xMax = bmMax(y.right, v.xMax), v.y = bmMin(y.top, v.y), v.yMax = bmMax(y.bottom, v.yMax);
      }, HShapeElement.prototype.shapeBoundingBox = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }, HShapeElement.prototype.tempBoundingBox = {
        x: 0,
        xMax: 0,
        y: 0,
        yMax: 0,
        width: 0,
        height: 0
      }, HShapeElement.prototype.getBoundsOfCurve = function(t, n, c, d) {
        for (var v = [[t[0], d[0]], [t[1], d[1]]], y, x, w, k, C, P, F, S = 0; S < 2; ++S)
          x = 6 * t[S] - 12 * n[S] + 6 * c[S], y = -3 * t[S] + 9 * n[S] - 9 * c[S] + 3 * d[S], w = 3 * n[S] - 3 * t[S], x |= 0, y |= 0, w |= 0, y === 0 && x === 0 || (y === 0 ? (k = -w / x, k > 0 && k < 1 && v[S].push(this.calculateF(k, t, n, c, d, S))) : (C = x * x - 4 * w * y, C >= 0 && (P = (-x + bmSqrt(C)) / (2 * y), P > 0 && P < 1 && v[S].push(this.calculateF(P, t, n, c, d, S)), F = (-x - bmSqrt(C)) / (2 * y), F > 0 && F < 1 && v[S].push(this.calculateF(F, t, n, c, d, S)))));
        this.shapeBoundingBox.left = bmMin.apply(null, v[0]), this.shapeBoundingBox.top = bmMin.apply(null, v[1]), this.shapeBoundingBox.right = bmMax.apply(null, v[0]), this.shapeBoundingBox.bottom = bmMax.apply(null, v[1]);
      }, HShapeElement.prototype.calculateF = function(t, n, c, d, v, y) {
        return bmPow(1 - t, 3) * n[y] + 3 * bmPow(1 - t, 2) * t * c[y] + 3 * (1 - t) * bmPow(t, 2) * d[y] + bmPow(t, 3) * v[y];
      }, HShapeElement.prototype.calculateBoundingBox = function(t, n) {
        var c, d = t.length;
        for (c = 0; c < d; c += 1)
          t[c] && t[c].sh ? this.calculateShapeBoundingBox(t[c], n) : t[c] && t[c].it ? this.calculateBoundingBox(t[c].it, n) : t[c] && t[c].style && t[c].w && this.expandStrokeBoundingBox(t[c].w, n);
      }, HShapeElement.prototype.expandStrokeBoundingBox = function(t, n) {
        var c = 0;
        if (t.keyframes) {
          for (var d = 0; d < t.keyframes.length; d += 1) {
            var v = t.keyframes[d].s;
            v > c && (c = v);
          }
          c *= t.mult;
        } else
          c = t.v * t.mult;
        n.x -= c, n.xMax += c, n.y -= c, n.yMax += c;
      }, HShapeElement.prototype.currentBoxContains = function(t) {
        return this.currentBBox.x <= t.x && this.currentBBox.y <= t.y && this.currentBBox.width + this.currentBBox.x >= t.x + t.width && this.currentBBox.height + this.currentBBox.y >= t.y + t.height;
      }, HShapeElement.prototype.renderInnerContent = function() {
        if (this._renderShapeFrame(), !this.hidden && (this._isFirstFrame || this._mdf)) {
          var t = this.tempBoundingBox, n = 999999;
          if (t.x = n, t.xMax = -n, t.y = n, t.yMax = -n, this.calculateBoundingBox(this.itemsData, t), t.width = t.xMax < t.x ? 0 : t.xMax - t.x, t.height = t.yMax < t.y ? 0 : t.yMax - t.y, this.currentBoxContains(t))
            return;
          var c = !1;
          if (this.currentBBox.w !== t.width && (this.currentBBox.w = t.width, this.shapeCont.setAttribute("width", t.width), c = !0), this.currentBBox.h !== t.height && (this.currentBBox.h = t.height, this.shapeCont.setAttribute("height", t.height), c = !0), c || this.currentBBox.x !== t.x || this.currentBBox.y !== t.y) {
            this.currentBBox.w = t.width, this.currentBBox.h = t.height, this.currentBBox.x = t.x, this.currentBBox.y = t.y, this.shapeCont.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h);
            var d = this.shapeCont.style, v = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
            d.transform = v, d.webkitTransform = v;
          }
        }
      };
      function HTextElement(t, n, c) {
        this.textSpans = [], this.textPaths = [], this.currentBBox = {
          x: 999999,
          y: -999999,
          h: 0,
          w: 0
        }, this.renderType = "svg", this.isMasked = !1, this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], HTextElement), HTextElement.prototype.createContent = function() {
        if (this.isMasked = this.checkMasks(), this.isMasked) {
          this.renderType = "svg", this.compW = this.comp.data.w, this.compH = this.comp.data.h, this.svgElement.setAttribute("width", this.compW), this.svgElement.setAttribute("height", this.compH);
          var t = createNS("g");
          this.maskedElement.appendChild(t), this.innerElem = t;
        } else
          this.renderType = "html", this.innerElem = this.layerElement;
        this.checkParenting();
      }, HTextElement.prototype.buildNewText = function() {
        var t = this.textProperty.currentData;
        this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
        var n = this.innerElem.style, c = t.fc ? this.buildColor(t.fc) : "rgba(0,0,0,0)";
        n.fill = c, n.color = c, t.sc && (n.stroke = this.buildColor(t.sc), n.strokeWidth = t.sw + "px");
        var d = this.globalData.fontManager.getFontByName(t.f);
        if (!this.globalData.fontManager.chars)
          if (n.fontSize = t.finalSize + "px", n.lineHeight = t.finalSize + "px", d.fClass)
            this.innerElem.className = d.fClass;
          else {
            n.fontFamily = d.fFamily;
            var v = t.fWeight, y = t.fStyle;
            n.fontStyle = y, n.fontWeight = v;
          }
        var x, w, k = t.l;
        w = k.length;
        var C, P, F, S = this.mHelper, j, T = "", A = 0;
        for (x = 0; x < w; x += 1) {
          if (this.globalData.fontManager.chars ? (this.textPaths[A] ? C = this.textPaths[A] : (C = createNS("path"), C.setAttribute("stroke-linecap", lineCapEnum[1]), C.setAttribute("stroke-linejoin", lineJoinEnum[2]), C.setAttribute("stroke-miterlimit", "4")), this.isMasked || (this.textSpans[A] ? (P = this.textSpans[A], F = P.children[0]) : (P = createTag("div"), P.style.lineHeight = 0, F = createNS("svg"), F.appendChild(C), styleDiv(P)))) : this.isMasked ? C = this.textPaths[A] ? this.textPaths[A] : createNS("text") : this.textSpans[A] ? (P = this.textSpans[A], C = this.textPaths[A]) : (P = createTag("span"), styleDiv(P), C = createTag("span"), styleDiv(C), P.appendChild(C)), this.globalData.fontManager.chars) {
            var R = this.globalData.fontManager.getCharData(t.finalText[x], d.fStyle, this.globalData.fontManager.getFontByName(t.f).fFamily), M;
            if (R ? M = R.data : M = null, S.reset(), M && M.shapes && M.shapes.length && (j = M.shapes[0].it, S.scale(t.finalSize / 100, t.finalSize / 100), T = this.createPathShape(S, j), C.setAttribute("d", T)), this.isMasked)
              this.innerElem.appendChild(C);
            else {
              if (this.innerElem.appendChild(P), M && M.shapes) {
                document.body.appendChild(F);
                var _ = F.getBBox();
                F.setAttribute("width", _.width + 2), F.setAttribute("height", _.height + 2), F.setAttribute("viewBox", _.x - 1 + " " + (_.y - 1) + " " + (_.width + 2) + " " + (_.height + 2));
                var E = F.style, I = "translate(" + (_.x - 1) + "px," + (_.y - 1) + "px)";
                E.transform = I, E.webkitTransform = I, k[x].yOffset = _.y - 1;
              } else
                F.setAttribute("width", 1), F.setAttribute("height", 1);
              P.appendChild(F);
            }
          } else if (C.textContent = k[x].val, C.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"), this.isMasked)
            this.innerElem.appendChild(C);
          else {
            this.innerElem.appendChild(P);
            var L = C.style, D = "translate3d(0," + -t.finalSize / 1.2 + "px,0)";
            L.transform = D, L.webkitTransform = D;
          }
          this.isMasked ? this.textSpans[A] = C : this.textSpans[A] = P, this.textSpans[A].style.display = "block", this.textPaths[A] = C, A += 1;
        }
        for (; A < this.textSpans.length; )
          this.textSpans[A].style.display = "none", A += 1;
      }, HTextElement.prototype.renderInnerContent = function() {
        this.validateText();
        var t;
        if (this.data.singleShape) {
          if (!this._isFirstFrame && !this.lettersChangedFlag)
            return;
          if (this.isMasked && this.finalTransform._matMdf) {
            this.svgElement.setAttribute("viewBox", -this.finalTransform.mProp.p.v[0] + " " + -this.finalTransform.mProp.p.v[1] + " " + this.compW + " " + this.compH), t = this.svgElement.style;
            var n = "translate(" + -this.finalTransform.mProp.p.v[0] + "px," + -this.finalTransform.mProp.p.v[1] + "px)";
            t.transform = n, t.webkitTransform = n;
          }
        }
        if (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag), !(!this.lettersChangedFlag && !this.textAnimator.lettersChangedFlag)) {
          var c, d, v = 0, y = this.textAnimator.renderedLetters, x = this.textProperty.currentData.l;
          d = x.length;
          var w, k, C;
          for (c = 0; c < d; c += 1)
            x[c].n ? v += 1 : (k = this.textSpans[c], C = this.textPaths[c], w = y[v], v += 1, w._mdf.m && (this.isMasked ? k.setAttribute("transform", w.m) : (k.style.webkitTransform = w.m, k.style.transform = w.m)), k.style.opacity = w.o, w.sw && w._mdf.sw && C.setAttribute("stroke-width", w.sw), w.sc && w._mdf.sc && C.setAttribute("stroke", w.sc), w.fc && w._mdf.fc && (C.setAttribute("fill", w.fc), C.style.color = w.fc));
          if (this.innerElem.getBBox && !this.hidden && (this._isFirstFrame || this._mdf)) {
            var P = this.innerElem.getBBox();
            this.currentBBox.w !== P.width && (this.currentBBox.w = P.width, this.svgElement.setAttribute("width", P.width)), this.currentBBox.h !== P.height && (this.currentBBox.h = P.height, this.svgElement.setAttribute("height", P.height));
            var F = 1;
            if (this.currentBBox.w !== P.width + F * 2 || this.currentBBox.h !== P.height + F * 2 || this.currentBBox.x !== P.x - F || this.currentBBox.y !== P.y - F) {
              this.currentBBox.w = P.width + F * 2, this.currentBBox.h = P.height + F * 2, this.currentBBox.x = P.x - F, this.currentBBox.y = P.y - F, this.svgElement.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h), t = this.svgElement.style;
              var S = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
              t.transform = S, t.webkitTransform = S;
            }
          }
        }
      };
      function HCameraElement(t, n, c) {
        this.initFrame(), this.initBaseData(t, n, c), this.initHierarchy();
        var d = PropertyFactory.getProp;
        if (this.pe = d(this, t.pe, 0, 0, this), t.ks.p.s ? (this.px = d(this, t.ks.p.x, 1, 0, this), this.py = d(this, t.ks.p.y, 1, 0, this), this.pz = d(this, t.ks.p.z, 1, 0, this)) : this.p = d(this, t.ks.p, 1, 0, this), t.ks.a && (this.a = d(this, t.ks.a, 1, 0, this)), t.ks.or.k.length && t.ks.or.k[0].to) {
          var v, y = t.ks.or.k.length;
          for (v = 0; v < y; v += 1)
            t.ks.or.k[v].to = null, t.ks.or.k[v].ti = null;
        }
        this.or = d(this, t.ks.or, 1, degToRads, this), this.or.sh = !0, this.rx = d(this, t.ks.rx, 0, degToRads, this), this.ry = d(this, t.ks.ry, 0, degToRads, this), this.rz = d(this, t.ks.rz, 0, degToRads, this), this.mat = new Matrix(), this._prevMat = new Matrix(), this._isFirstFrame = !0, this.finalTransform = {
          mProp: this
        };
      }
      extendPrototype([BaseElement, FrameElement, HierarchyElement], HCameraElement), HCameraElement.prototype.setup = function() {
        var t, n = this.comp.threeDElements.length, c, d, v;
        for (t = 0; t < n; t += 1)
          if (c = this.comp.threeDElements[t], c.type === "3d") {
            d = c.perspectiveElem.style, v = c.container.style;
            var y = this.pe.v + "px", x = "0px 0px 0px", w = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
            d.perspective = y, d.webkitPerspective = y, v.transformOrigin = x, v.mozTransformOrigin = x, v.webkitTransformOrigin = x, d.transform = w, d.webkitTransform = w;
          }
      }, HCameraElement.prototype.createElements = function() {
      }, HCameraElement.prototype.hide = function() {
      }, HCameraElement.prototype.renderFrame = function() {
        var t = this._isFirstFrame, n, c;
        if (this.hierarchy)
          for (c = this.hierarchy.length, n = 0; n < c; n += 1)
            t = this.hierarchy[n].finalTransform.mProp._mdf || t;
        if (t || this.pe._mdf || this.p && this.p._mdf || this.px && (this.px._mdf || this.py._mdf || this.pz._mdf) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or._mdf || this.a && this.a._mdf) {
          if (this.mat.reset(), this.hierarchy)
            for (c = this.hierarchy.length - 1, n = c; n >= 0; n -= 1) {
              var d = this.hierarchy[n].finalTransform.mProp;
              this.mat.translate(-d.p.v[0], -d.p.v[1], d.p.v[2]), this.mat.rotateX(-d.or.v[0]).rotateY(-d.or.v[1]).rotateZ(d.or.v[2]), this.mat.rotateX(-d.rx.v).rotateY(-d.ry.v).rotateZ(d.rz.v), this.mat.scale(1 / d.s.v[0], 1 / d.s.v[1], 1 / d.s.v[2]), this.mat.translate(d.a.v[0], d.a.v[1], d.a.v[2]);
            }
          if (this.p ? this.mat.translate(-this.p.v[0], -this.p.v[1], this.p.v[2]) : this.mat.translate(-this.px.v, -this.py.v, this.pz.v), this.a) {
            var v;
            this.p ? v = [this.p.v[0] - this.a.v[0], this.p.v[1] - this.a.v[1], this.p.v[2] - this.a.v[2]] : v = [this.px.v - this.a.v[0], this.py.v - this.a.v[1], this.pz.v - this.a.v[2]];
            var y = Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2)), x = [v[0] / y, v[1] / y, v[2] / y], w = Math.sqrt(x[2] * x[2] + x[0] * x[0]), k = Math.atan2(x[1], w), C = Math.atan2(x[0], -x[2]);
            this.mat.rotateY(C).rotateX(-k);
          }
          this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v), this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]), this.mat.translate(this.globalData.compSize.w / 2, this.globalData.compSize.h / 2, 0), this.mat.translate(0, 0, this.pe.v);
          var P = !this._prevMat.equals(this.mat);
          if ((P || this.pe._mdf) && this.comp.threeDElements) {
            c = this.comp.threeDElements.length;
            var F, S, j;
            for (n = 0; n < c; n += 1)
              if (F = this.comp.threeDElements[n], F.type === "3d") {
                if (P) {
                  var T = this.mat.toCSS();
                  j = F.container.style, j.transform = T, j.webkitTransform = T;
                }
                this.pe._mdf && (S = F.perspectiveElem.style, S.perspective = this.pe.v + "px", S.webkitPerspective = this.pe.v + "px");
              }
            this.mat.clone(this._prevMat);
          }
        }
        this._isFirstFrame = !1;
      }, HCameraElement.prototype.prepareFrame = function(t) {
        this.prepareProperties(t, !0);
      }, HCameraElement.prototype.destroy = function() {
      }, HCameraElement.prototype.getBaseElement = function() {
        return null;
      };
      function HImageElement(t, n, c) {
        this.assetData = n.getAssetData(t.refId), this.initElement(t, n, c);
      }
      extendPrototype([BaseElement, TransformElement, HBaseElement, HSolidElement, HierarchyElement, FrameElement, RenderableElement], HImageElement), HImageElement.prototype.createContent = function() {
        var t = this.globalData.getAssetsPath(this.assetData), n = new Image();
        this.data.hasMask ? (this.imageElem = createNS("image"), this.imageElem.setAttribute("width", this.assetData.w + "px"), this.imageElem.setAttribute("height", this.assetData.h + "px"), this.imageElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", t), this.layerElement.appendChild(this.imageElem), this.baseElement.setAttribute("width", this.assetData.w), this.baseElement.setAttribute("height", this.assetData.h)) : this.layerElement.appendChild(n), n.crossOrigin = "anonymous", n.src = t, this.data.ln && this.baseElement.setAttribute("id", this.data.ln);
      };
      function HybridRendererBase(t, n) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.renderConfig = {
          className: n && n.className || "",
          imagePreserveAspectRatio: n && n.imagePreserveAspectRatio || "xMidYMid slice",
          hideOnTransparent: !(n && n.hideOnTransparent === !1),
          filterSize: {
            width: n && n.filterSize && n.filterSize.width || "400%",
            height: n && n.filterSize && n.filterSize.height || "400%",
            x: n && n.filterSize && n.filterSize.x || "-100%",
            y: n && n.filterSize && n.filterSize.y || "-100%"
          }
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          renderConfig: this.renderConfig
        }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = !1, this.camera = null, this.supports3d = !0, this.rendererType = "html";
      }
      extendPrototype([BaseRenderer], HybridRendererBase), HybridRendererBase.prototype.buildItem = SVGRenderer.prototype.buildItem, HybridRendererBase.prototype.checkPendingElements = function() {
        for (; this.pendingElements.length; ) {
          var t = this.pendingElements.pop();
          t.checkParenting();
        }
      }, HybridRendererBase.prototype.appendElementInPos = function(t, n) {
        var c = t.getBaseElement();
        if (c) {
          var d = this.layers[n];
          if (!d.ddd || !this.supports3d)
            if (this.threeDElements)
              this.addTo3dContainer(c, n);
            else {
              for (var v = 0, y, x, w; v < n; )
                this.elements[v] && this.elements[v] !== !0 && this.elements[v].getBaseElement && (x = this.elements[v], w = this.layers[v].ddd ? this.getThreeDContainerByPos(v) : x.getBaseElement(), y = w || y), v += 1;
              y ? (!d.ddd || !this.supports3d) && this.layerElement.insertBefore(c, y) : (!d.ddd || !this.supports3d) && this.layerElement.appendChild(c);
            }
          else
            this.addTo3dContainer(c, n);
        }
      }, HybridRendererBase.prototype.createShape = function(t) {
        return this.supports3d ? new HShapeElement(t, this.globalData, this) : new SVGShapeElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createText = function(t) {
        return this.supports3d ? new HTextElement(t, this.globalData, this) : new SVGTextLottieElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createCamera = function(t) {
        return this.camera = new HCameraElement(t, this.globalData, this), this.camera;
      }, HybridRendererBase.prototype.createImage = function(t) {
        return this.supports3d ? new HImageElement(t, this.globalData, this) : new IImageElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createSolid = function(t) {
        return this.supports3d ? new HSolidElement(t, this.globalData, this) : new ISolidElement(t, this.globalData, this);
      }, HybridRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, HybridRendererBase.prototype.getThreeDContainerByPos = function(t) {
        for (var n = 0, c = this.threeDElements.length; n < c; ) {
          if (this.threeDElements[n].startPos <= t && this.threeDElements[n].endPos >= t)
            return this.threeDElements[n].perspectiveElem;
          n += 1;
        }
        return null;
      }, HybridRendererBase.prototype.createThreeDContainer = function(t, n) {
        var c = createTag("div"), d, v;
        styleDiv(c);
        var y = createTag("div");
        if (styleDiv(y), n === "3d") {
          d = c.style, d.width = this.globalData.compSize.w + "px", d.height = this.globalData.compSize.h + "px";
          var x = "50% 50%";
          d.webkitTransformOrigin = x, d.mozTransformOrigin = x, d.transformOrigin = x, v = y.style;
          var w = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
          v.transform = w, v.webkitTransform = w;
        }
        c.appendChild(y);
        var k = {
          container: y,
          perspectiveElem: c,
          startPos: t,
          endPos: t,
          type: n
        };
        return this.threeDElements.push(k), k;
      }, HybridRendererBase.prototype.build3dContainers = function() {
        var t, n = this.layers.length, c, d = "";
        for (t = 0; t < n; t += 1)
          this.layers[t].ddd && this.layers[t].ty !== 3 ? (d !== "3d" && (d = "3d", c = this.createThreeDContainer(t, "3d")), c.endPos = Math.max(c.endPos, t)) : (d !== "2d" && (d = "2d", c = this.createThreeDContainer(t, "2d")), c.endPos = Math.max(c.endPos, t));
        for (n = this.threeDElements.length, t = n - 1; t >= 0; t -= 1)
          this.resizerElem.appendChild(this.threeDElements[t].perspectiveElem);
      }, HybridRendererBase.prototype.addTo3dContainer = function(t, n) {
        for (var c = 0, d = this.threeDElements.length; c < d; ) {
          if (n <= this.threeDElements[c].endPos) {
            for (var v = this.threeDElements[c].startPos, y; v < n; )
              this.elements[v] && this.elements[v].getBaseElement && (y = this.elements[v].getBaseElement()), v += 1;
            y ? this.threeDElements[c].container.insertBefore(t, y) : this.threeDElements[c].container.appendChild(t);
            break;
          }
          c += 1;
        }
      }, HybridRendererBase.prototype.configAnimation = function(t) {
        var n = createTag("div"), c = this.animationItem.wrapper, d = n.style;
        d.width = t.w + "px", d.height = t.h + "px", this.resizerElem = n, styleDiv(n), d.transformStyle = "flat", d.mozTransformStyle = "flat", d.webkitTransformStyle = "flat", this.renderConfig.className && n.setAttribute("class", this.renderConfig.className), c.appendChild(n), d.overflow = "hidden";
        var v = createNS("svg");
        v.setAttribute("width", "1"), v.setAttribute("height", "1"), styleDiv(v), this.resizerElem.appendChild(v);
        var y = createNS("defs");
        v.appendChild(y), this.data = t, this.setupGlobalData(t, v), this.globalData.defs = y, this.layers = t.layers, this.layerElement = this.resizerElem, this.build3dContainers(), this.updateContainerSize();
      }, HybridRendererBase.prototype.destroy = function() {
        this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.animationItem.container = null, this.globalData.defs = null;
        var t, n = this.layers ? this.layers.length : 0;
        for (t = 0; t < n; t += 1)
          this.elements[t] && this.elements[t].destroy && this.elements[t].destroy();
        this.elements.length = 0, this.destroyed = !0, this.animationItem = null;
      }, HybridRendererBase.prototype.updateContainerSize = function() {
        var t = this.animationItem.wrapper.offsetWidth, n = this.animationItem.wrapper.offsetHeight, c = t / n, d = this.globalData.compSize.w / this.globalData.compSize.h, v, y, x, w;
        d > c ? (v = t / this.globalData.compSize.w, y = t / this.globalData.compSize.w, x = 0, w = (n - this.globalData.compSize.h * (t / this.globalData.compSize.w)) / 2) : (v = n / this.globalData.compSize.h, y = n / this.globalData.compSize.h, x = (t - this.globalData.compSize.w * (n / this.globalData.compSize.h)) / 2, w = 0);
        var k = this.resizerElem.style;
        k.webkitTransform = "matrix3d(" + v + ",0,0,0,0," + y + ",0,0,0,0,1,0," + x + "," + w + ",0,1)", k.transform = k.webkitTransform;
      }, HybridRendererBase.prototype.renderFrame = SVGRenderer.prototype.renderFrame, HybridRendererBase.prototype.hide = function() {
        this.resizerElem.style.display = "none";
      }, HybridRendererBase.prototype.show = function() {
        this.resizerElem.style.display = "block";
      }, HybridRendererBase.prototype.initItems = function() {
        if (this.buildAllItems(), this.camera)
          this.camera.setup();
        else {
          var t = this.globalData.compSize.w, n = this.globalData.compSize.h, c, d = this.threeDElements.length;
          for (c = 0; c < d; c += 1) {
            var v = this.threeDElements[c].perspectiveElem.style;
            v.webkitPerspective = Math.sqrt(Math.pow(t, 2) + Math.pow(n, 2)) + "px", v.perspective = v.webkitPerspective;
          }
        }
      }, HybridRendererBase.prototype.searchExtraCompositions = function(t) {
        var n, c = t.length, d = createTag("div");
        for (n = 0; n < c; n += 1)
          if (t[n].xt) {
            var v = this.createComp(t[n], d, this.globalData.comp, null);
            v.initExpressions(), this.globalData.projectInterface.registerComposition(v);
          }
      };
      function HCompElement(t, n, c) {
        this.layers = t.layers, this.supports3d = !t.hasMask, this.completeLayers = !1, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(t, n, c), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, n.frameRate, this) : {
          _placeholder: !0
        };
      }
      extendPrototype([HybridRendererBase, ICompElement, HBaseElement], HCompElement), HCompElement.prototype._createBaseContainerElements = HCompElement.prototype.createContainerElements, HCompElement.prototype.createContainerElements = function() {
        this._createBaseContainerElements(), this.data.hasMask ? (this.svgElement.setAttribute("width", this.data.w), this.svgElement.setAttribute("height", this.data.h), this.transformedElement = this.baseElement) : this.transformedElement = this.layerElement;
      }, HCompElement.prototype.addTo3dContainer = function(t, n) {
        for (var c = 0, d; c < n; )
          this.elements[c] && this.elements[c].getBaseElement && (d = this.elements[c].getBaseElement()), c += 1;
        d ? this.layerElement.insertBefore(t, d) : this.layerElement.appendChild(t);
      }, HCompElement.prototype.createComp = function(t) {
        return this.supports3d ? new HCompElement(t, this.globalData, this) : new SVGCompElement(t, this.globalData, this);
      };
      function HybridRenderer(t, n) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.renderConfig = {
          className: n && n.className || "",
          imagePreserveAspectRatio: n && n.imagePreserveAspectRatio || "xMidYMid slice",
          hideOnTransparent: !(n && n.hideOnTransparent === !1),
          filterSize: {
            width: n && n.filterSize && n.filterSize.width || "400%",
            height: n && n.filterSize && n.filterSize.height || "400%",
            x: n && n.filterSize && n.filterSize.x || "-100%",
            y: n && n.filterSize && n.filterSize.y || "-100%"
          },
          runExpressions: !n || n.runExpressions === void 0 || n.runExpressions
        }, this.globalData = {
          _mdf: !1,
          frameNum: -1,
          renderConfig: this.renderConfig
        }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = !1, this.camera = null, this.supports3d = !0, this.rendererType = "html";
      }
      extendPrototype([HybridRendererBase], HybridRenderer), HybridRenderer.prototype.createComp = function(t) {
        return this.supports3d ? new HCompElement(t, this.globalData, this) : new SVGCompElement(t, this.globalData, this);
      };
      var CompExpressionInterface = /* @__PURE__ */ (function() {
        return function(t) {
          function n(c) {
            for (var d = 0, v = t.layers.length; d < v; ) {
              if (t.layers[d].nm === c || t.layers[d].ind === c)
                return t.elements[d].layerInterface;
              d += 1;
            }
            return null;
          }
          return Object.defineProperty(n, "_name", {
            value: t.data.nm
          }), n.layer = n, n.pixelAspect = 1, n.height = t.data.h || t.globalData.compSize.h, n.width = t.data.w || t.globalData.compSize.w, n.pixelAspect = 1, n.frameDuration = 1 / t.globalData.frameRate, n.displayStartTime = 0, n.numLayers = t.layers.length, n;
        };
      })();
      function _typeof$2(t) {
        "@babel/helpers - typeof";
        return _typeof$2 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
          return typeof n;
        } : function(n) {
          return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
        }, _typeof$2(t);
      }
      function seedRandom(t, n) {
        var c = this, d = 256, v = 6, y = 52, x = "random", w = n.pow(d, v), k = n.pow(2, y), C = k * 2, P = d - 1, F;
        function S(E, I, L) {
          var D = [];
          I = I === !0 ? {
            entropy: !0
          } : I || {};
          var O = R(A(I.entropy ? [E, _(t)] : E === null ? M() : E, 3), D), z = new j(D), W = function() {
            for (var K = z.g(v), Y = w, U = 0; K < k; )
              K = (K + U) * d, Y *= d, U = z.g(1);
            for (; K >= C; )
              K /= 2, Y /= 2, U >>>= 1;
            return (K + U) / Y;
          };
          return W.int32 = function() {
            return z.g(4) | 0;
          }, W.quick = function() {
            return z.g(4) / 4294967296;
          }, W.double = W, R(_(z.S), t), (I.pass || L || function(X, K, Y, U) {
            return U && (U.S && T(U, z), X.state = function() {
              return T(z, {});
            }), Y ? (n[x] = X, K) : X;
          })(W, O, "global" in I ? I.global : this == n, I.state);
        }
        n["seed" + x] = S;
        function j(E) {
          var I, L = E.length, D = this, O = 0, z = D.i = D.j = 0, W = D.S = [];
          for (L || (E = [L++]); O < d; )
            W[O] = O++;
          for (O = 0; O < d; O++)
            W[O] = W[z = P & z + E[O % L] + (I = W[O])], W[z] = I;
          D.g = function(X) {
            for (var K, Y = 0, U = D.i, Z = D.j, q = D.S; X--; )
              K = q[U = P & U + 1], Y = Y * d + q[P & (q[U] = q[Z = P & Z + K]) + (q[Z] = K)];
            return D.i = U, D.j = Z, Y;
          };
        }
        function T(E, I) {
          return I.i = E.i, I.j = E.j, I.S = E.S.slice(), I;
        }
        function A(E, I) {
          var L = [], D = _typeof$2(E), O;
          if (I && D == "object")
            for (O in E)
              try {
                L.push(A(E[O], I - 1));
              } catch {
              }
          return L.length ? L : D == "string" ? E : E + "\0";
        }
        function R(E, I) {
          for (var L = E + "", D, O = 0; O < L.length; )
            I[P & O] = P & (D ^= I[P & O] * 19) + L.charCodeAt(O++);
          return _(I);
        }
        function M() {
          try {
            var E = new Uint8Array(d);
            return (c.crypto || c.msCrypto).getRandomValues(E), _(E);
          } catch {
            var I = c.navigator, L = I && I.plugins;
            return [+/* @__PURE__ */ new Date(), c, L, c.screen, _(t)];
          }
        }
        function _(E) {
          return String.fromCharCode.apply(0, E);
        }
        R(n.random(), t);
      }
      function initialize$2(t) {
        seedRandom([], t);
      }
      var propTypes = {
        SHAPE: "shape"
      };
      function _typeof$1(t) {
        "@babel/helpers - typeof";
        return _typeof$1 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
          return typeof n;
        } : function(n) {
          return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
        }, _typeof$1(t);
      }
      var ExpressionManager = (function() {
        var ob = {}, Math = BMMath, window = null, document = null, XMLHttpRequest = null, fetch = null, frames = null, _lottieGlobal = {};
        initialize$2(BMMath);
        function resetFrame() {
          _lottieGlobal = {};
        }
        function $bm_isInstanceOfArray(t) {
          return t.constructor === Array || t.constructor === Float32Array;
        }
        function isNumerable(t, n) {
          return t === "number" || n instanceof Number || t === "boolean" || t === "string";
        }
        function $bm_neg(t) {
          var n = _typeof$1(t);
          if (n === "number" || t instanceof Number || n === "boolean")
            return -t;
          if ($bm_isInstanceOfArray(t)) {
            var c, d = t.length, v = [];
            for (c = 0; c < d; c += 1)
              v[c] = -t[c];
            return v;
          }
          return t.propType ? t.v : -t;
        }
        var easeInBez = BezierFactory.getBezierEasing(0.333, 0, 0.833, 0.833, "easeIn").get, easeOutBez = BezierFactory.getBezierEasing(0.167, 0.167, 0.667, 1, "easeOut").get, easeInOutBez = BezierFactory.getBezierEasing(0.33, 0, 0.667, 1, "easeInOut").get;
        function sum(t, n) {
          var c = _typeof$1(t), d = _typeof$1(n);
          if (isNumerable(c, t) && isNumerable(d, n) || c === "string" || d === "string")
            return t + n;
          if ($bm_isInstanceOfArray(t) && isNumerable(d, n))
            return t = t.slice(0), t[0] += n, t;
          if (isNumerable(c, t) && $bm_isInstanceOfArray(n))
            return n = n.slice(0), n[0] = t + n[0], n;
          if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(n)) {
            for (var v = 0, y = t.length, x = n.length, w = []; v < y || v < x; )
              (typeof t[v] == "number" || t[v] instanceof Number) && (typeof n[v] == "number" || n[v] instanceof Number) ? w[v] = t[v] + n[v] : w[v] = n[v] === void 0 ? t[v] : t[v] || n[v], v += 1;
            return w;
          }
          return 0;
        }
        var add = sum;
        function sub(t, n) {
          var c = _typeof$1(t), d = _typeof$1(n);
          if (isNumerable(c, t) && isNumerable(d, n))
            return c === "string" && (t = parseInt(t, 10)), d === "string" && (n = parseInt(n, 10)), t - n;
          if ($bm_isInstanceOfArray(t) && isNumerable(d, n))
            return t = t.slice(0), t[0] -= n, t;
          if (isNumerable(c, t) && $bm_isInstanceOfArray(n))
            return n = n.slice(0), n[0] = t - n[0], n;
          if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(n)) {
            for (var v = 0, y = t.length, x = n.length, w = []; v < y || v < x; )
              (typeof t[v] == "number" || t[v] instanceof Number) && (typeof n[v] == "number" || n[v] instanceof Number) ? w[v] = t[v] - n[v] : w[v] = n[v] === void 0 ? t[v] : t[v] || n[v], v += 1;
            return w;
          }
          return 0;
        }
        function mul(t, n) {
          var c = _typeof$1(t), d = _typeof$1(n), v;
          if (isNumerable(c, t) && isNumerable(d, n))
            return t * n;
          var y, x;
          if ($bm_isInstanceOfArray(t) && isNumerable(d, n)) {
            for (x = t.length, v = createTypedArray("float32", x), y = 0; y < x; y += 1)
              v[y] = t[y] * n;
            return v;
          }
          if (isNumerable(c, t) && $bm_isInstanceOfArray(n)) {
            for (x = n.length, v = createTypedArray("float32", x), y = 0; y < x; y += 1)
              v[y] = t * n[y];
            return v;
          }
          return 0;
        }
        function div(t, n) {
          var c = _typeof$1(t), d = _typeof$1(n), v;
          if (isNumerable(c, t) && isNumerable(d, n))
            return t / n;
          var y, x;
          if ($bm_isInstanceOfArray(t) && isNumerable(d, n)) {
            for (x = t.length, v = createTypedArray("float32", x), y = 0; y < x; y += 1)
              v[y] = t[y] / n;
            return v;
          }
          if (isNumerable(c, t) && $bm_isInstanceOfArray(n)) {
            for (x = n.length, v = createTypedArray("float32", x), y = 0; y < x; y += 1)
              v[y] = t / n[y];
            return v;
          }
          return 0;
        }
        function mod(t, n) {
          return typeof t == "string" && (t = parseInt(t, 10)), typeof n == "string" && (n = parseInt(n, 10)), t % n;
        }
        var $bm_sum = sum, $bm_sub = sub, $bm_mul = mul, $bm_div = div, $bm_mod = mod;
        function clamp(t, n, c) {
          if (n > c) {
            var d = c;
            c = n, n = d;
          }
          return Math.min(Math.max(t, n), c);
        }
        function radiansToDegrees(t) {
          return t / degToRads;
        }
        var radians_to_degrees = radiansToDegrees;
        function degreesToRadians(t) {
          return t * degToRads;
        }
        var degrees_to_radians = radiansToDegrees, helperLengthArray = [0, 0, 0, 0, 0, 0];
        function length(t, n) {
          if (typeof t == "number" || t instanceof Number)
            return n = n || 0, Math.abs(t - n);
          n || (n = helperLengthArray);
          var c, d = Math.min(t.length, n.length), v = 0;
          for (c = 0; c < d; c += 1)
            v += Math.pow(n[c] - t[c], 2);
          return Math.sqrt(v);
        }
        function normalize(t) {
          return div(t, length(t));
        }
        function rgbToHsl(t) {
          var n = t[0], c = t[1], d = t[2], v = Math.max(n, c, d), y = Math.min(n, c, d), x, w, k = (v + y) / 2;
          if (v === y)
            x = 0, w = 0;
          else {
            var C = v - y;
            switch (w = k > 0.5 ? C / (2 - v - y) : C / (v + y), v) {
              case n:
                x = (c - d) / C + (c < d ? 6 : 0);
                break;
              case c:
                x = (d - n) / C + 2;
                break;
              case d:
                x = (n - c) / C + 4;
                break;
            }
            x /= 6;
          }
          return [x, w, k, t[3]];
        }
        function hue2rgb(t, n, c) {
          return c < 0 && (c += 1), c > 1 && (c -= 1), c < 1 / 6 ? t + (n - t) * 6 * c : c < 1 / 2 ? n : c < 2 / 3 ? t + (n - t) * (2 / 3 - c) * 6 : t;
        }
        function hslToRgb(t) {
          var n = t[0], c = t[1], d = t[2], v, y, x;
          if (c === 0)
            v = d, x = d, y = d;
          else {
            var w = d < 0.5 ? d * (1 + c) : d + c - d * c, k = 2 * d - w;
            v = hue2rgb(k, w, n + 1 / 3), y = hue2rgb(k, w, n), x = hue2rgb(k, w, n - 1 / 3);
          }
          return [v, y, x, t[3]];
        }
        function linear(t, n, c, d, v) {
          if ((d === void 0 || v === void 0) && (d = n, v = c, n = 0, c = 1), c < n) {
            var y = c;
            c = n, n = y;
          }
          if (t <= n)
            return d;
          if (t >= c)
            return v;
          var x = c === n ? 0 : (t - n) / (c - n);
          if (!d.length)
            return d + (v - d) * x;
          var w, k = d.length, C = createTypedArray("float32", k);
          for (w = 0; w < k; w += 1)
            C[w] = d[w] + (v[w] - d[w]) * x;
          return C;
        }
        function random(t, n) {
          if (n === void 0 && (t === void 0 ? (t = 0, n = 1) : (n = t, t = void 0)), n.length) {
            var c, d = n.length;
            t || (t = createTypedArray("float32", d));
            var v = createTypedArray("float32", d), y = BMMath.random();
            for (c = 0; c < d; c += 1)
              v[c] = t[c] + y * (n[c] - t[c]);
            return v;
          }
          t === void 0 && (t = 0);
          var x = BMMath.random();
          return t + x * (n - t);
        }
        function createPath(t, n, c, d) {
          var v, y = t.length, x = shapePool.newElement();
          x.setPathData(!!d, y);
          var w = [0, 0], k, C;
          for (v = 0; v < y; v += 1)
            k = n && n[v] ? n[v] : w, C = c && c[v] ? c[v] : w, x.setTripleAt(t[v][0], t[v][1], C[0] + t[v][0], C[1] + t[v][1], k[0] + t[v][0], k[1] + t[v][1], v, !0);
          return x;
        }
        function initiateExpression(elem, data, property) {
          function noOp(t) {
            return t;
          }
          if (!elem.globalData.renderConfig.runExpressions)
            return noOp;
          var val = data.x, needsVelocity = /velocity(?![\w\d])/.test(val), _needsRandom = val.indexOf("random") !== -1, elemType = elem.data.ty, transform, $bm_transform, content, effect, thisProperty = property;
          thisProperty._name = elem.data.nm, thisProperty.valueAtTime = thisProperty.getValueAtTime, Object.defineProperty(thisProperty, "value", {
            get: function() {
              return thisProperty.v;
            }
          }), elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate, elem.comp.displayStartTime = 0;
          var inPoint = elem.data.ip / elem.comp.globalData.frameRate, outPoint = elem.data.op / elem.comp.globalData.frameRate, width = elem.data.sw ? elem.data.sw : 0, height = elem.data.sh ? elem.data.sh : 0, name = elem.data.nm, loopIn, loop_in, loopOut, loop_out, smooth, toWorld, fromWorld, fromComp, toComp, fromCompToSurface, position, rotation, anchorPoint, scale, thisLayer, thisComp, mask, valueAtTime, velocityAtTime, scoped_bm_rt, expression_function = eval("[function _expression_function(){" + val + ";scoped_bm_rt=$bm_rt}]")[0], numKeys = property.kf ? data.k.length : 0, active = !this.data || this.data.hd !== !0, wiggle = (function t(n, c) {
            var d, v, y = this.pv.length ? this.pv.length : 1, x = createTypedArray("float32", y);
            n = 5;
            var w = Math.floor(time * n);
            for (d = 0, v = 0; d < w; ) {
              for (v = 0; v < y; v += 1)
                x[v] += -c + c * 2 * BMMath.random();
              d += 1;
            }
            var k = time * n, C = k - Math.floor(k), P = createTypedArray("float32", y);
            if (y > 1) {
              for (v = 0; v < y; v += 1)
                P[v] = this.pv[v] + x[v] + (-c + c * 2 * BMMath.random()) * C;
              return P;
            }
            return this.pv + x[0] + (-c + c * 2 * BMMath.random()) * C;
          }).bind(this);
          thisProperty.loopIn && (loopIn = thisProperty.loopIn.bind(thisProperty), loop_in = loopIn), thisProperty.loopOut && (loopOut = thisProperty.loopOut.bind(thisProperty), loop_out = loopOut), thisProperty.smooth && (smooth = thisProperty.smooth.bind(thisProperty));
          function loopInDuration(t, n) {
            return loopIn(t, n, !0);
          }
          function loopOutDuration(t, n) {
            return loopOut(t, n, !0);
          }
          this.getValueAtTime && (valueAtTime = this.getValueAtTime.bind(this)), this.getVelocityAtTime && (velocityAtTime = this.getVelocityAtTime.bind(this));
          var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface);
          function lookAt(t, n) {
            var c = [n[0] - t[0], n[1] - t[1], n[2] - t[2]], d = Math.atan2(c[0], Math.sqrt(c[1] * c[1] + c[2] * c[2])) / degToRads, v = -Math.atan2(c[1], c[2]) / degToRads;
            return [v, d, 0];
          }
          function easeOut(t, n, c, d, v) {
            return applyEase(easeOutBez, t, n, c, d, v);
          }
          function easeIn(t, n, c, d, v) {
            return applyEase(easeInBez, t, n, c, d, v);
          }
          function ease(t, n, c, d, v) {
            return applyEase(easeInOutBez, t, n, c, d, v);
          }
          function applyEase(t, n, c, d, v, y) {
            v === void 0 ? (v = c, y = d) : n = (n - c) / (d - c), n > 1 ? n = 1 : n < 0 && (n = 0);
            var x = t(n);
            if ($bm_isInstanceOfArray(v)) {
              var w, k = v.length, C = createTypedArray("float32", k);
              for (w = 0; w < k; w += 1)
                C[w] = (y[w] - v[w]) * x + v[w];
              return C;
            }
            return (y - v) * x + v;
          }
          function nearestKey(t) {
            var n, c = data.k.length, d, v;
            if (!data.k.length || typeof data.k[0] == "number")
              d = 0, v = 0;
            else if (d = -1, t *= elem.comp.globalData.frameRate, t < data.k[0].t)
              d = 1, v = data.k[0].t;
            else {
              for (n = 0; n < c - 1; n += 1)
                if (t === data.k[n].t) {
                  d = n + 1, v = data.k[n].t;
                  break;
                } else if (t > data.k[n].t && t < data.k[n + 1].t) {
                  t - data.k[n].t > data.k[n + 1].t - t ? (d = n + 2, v = data.k[n + 1].t) : (d = n + 1, v = data.k[n].t);
                  break;
                }
              d === -1 && (d = n + 1, v = data.k[n].t);
            }
            var y = {};
            return y.index = d, y.time = v / elem.comp.globalData.frameRate, y;
          }
          function key(t) {
            var n, c, d;
            if (!data.k.length || typeof data.k[0] == "number")
              throw new Error("The property has no keyframe at index " + t);
            t -= 1, n = {
              time: data.k[t].t / elem.comp.globalData.frameRate,
              value: []
            };
            var v = Object.prototype.hasOwnProperty.call(data.k[t], "s") ? data.k[t].s : data.k[t - 1].e;
            for (d = v.length, c = 0; c < d; c += 1)
              n[c] = v[c], n.value[c] = v[c];
            return n;
          }
          function framesToTime(t, n) {
            return n || (n = elem.comp.globalData.frameRate), t / n;
          }
          function timeToFrames(t, n) {
            return !t && t !== 0 && (t = time), n || (n = elem.comp.globalData.frameRate), t * n;
          }
          function seedRandom(t) {
            BMMath.seedrandom(randSeed + t);
          }
          function sourceRectAtTime() {
            return elem.sourceRectAtTime();
          }
          function substring(t, n) {
            return typeof value == "string" ? n === void 0 ? value.substring(t) : value.substring(t, n) : "";
          }
          function substr(t, n) {
            return typeof value == "string" ? n === void 0 ? value.substr(t) : value.substr(t, n) : "";
          }
          function posterizeTime(t) {
            time = t === 0 ? 0 : Math.floor(time * t) / t, value = valueAtTime(time);
          }
          var time, velocity, value, text, textIndex, textTotal, selectorValue, index = elem.data.ind, hasParent = !!(elem.hierarchy && elem.hierarchy.length), parent, randSeed = Math.floor(Math.random() * 1e6), globalData = elem.globalData;
          function executeExpression(t) {
            return value = t, this.frameExpressionId === elem.globalData.frameId && this.propType !== "textSelector" ? value : (this.propType === "textSelector" && (textIndex = this.textIndex, textTotal = this.textTotal, selectorValue = this.selectorValue), thisLayer || (text = elem.layerInterface.text, thisLayer = elem.layerInterface, thisComp = elem.comp.compInterface, toWorld = thisLayer.toWorld.bind(thisLayer), fromWorld = thisLayer.fromWorld.bind(thisLayer), fromComp = thisLayer.fromComp.bind(thisLayer), toComp = thisLayer.toComp.bind(thisLayer), mask = thisLayer.mask ? thisLayer.mask.bind(thisLayer) : null, fromCompToSurface = fromComp), transform || (transform = elem.layerInterface("ADBE Transform Group"), $bm_transform = transform, transform && (anchorPoint = transform.anchorPoint)), elemType === 4 && !content && (content = thisLayer("ADBE Root Vectors Group")), effect || (effect = thisLayer(4)), hasParent = !!(elem.hierarchy && elem.hierarchy.length), hasParent && !parent && (parent = elem.hierarchy[0].layerInterface), time = this.comp.renderedFrame / this.comp.globalData.frameRate, _needsRandom && seedRandom(randSeed + time), needsVelocity && (velocity = velocityAtTime(time)), expression_function(), this.frameExpressionId = elem.globalData.frameId, scoped_bm_rt = scoped_bm_rt.propType === propTypes.SHAPE ? scoped_bm_rt.v : scoped_bm_rt, scoped_bm_rt);
          }
          return executeExpression.__preventDeadCodeRemoval = [$bm_transform, anchorPoint, time, velocity, inPoint, outPoint, width, height, name, loop_in, loop_out, smooth, toComp, fromCompToSurface, toWorld, fromWorld, mask, position, rotation, scale, thisComp, numKeys, active, wiggle, loopInDuration, loopOutDuration, comp, lookAt, easeOut, easeIn, ease, nearestKey, key, text, textIndex, textTotal, selectorValue, framesToTime, timeToFrames, sourceRectAtTime, substring, substr, posterizeTime, index, globalData], executeExpression;
        }
        return ob.initiateExpression = initiateExpression, ob.__preventDeadCodeRemoval = [window, document, XMLHttpRequest, fetch, frames, $bm_neg, add, $bm_sum, $bm_sub, $bm_mul, $bm_div, $bm_mod, clamp, radians_to_degrees, degreesToRadians, degrees_to_radians, normalize, rgbToHsl, hslToRgb, linear, random, createPath, _lottieGlobal], ob.resetFrame = resetFrame, ob;
      })(), Expressions = (function() {
        var t = {};
        t.initExpressions = n, t.resetFrame = ExpressionManager.resetFrame;
        function n(c) {
          var d = 0, v = [];
          function y() {
            d += 1;
          }
          function x() {
            d -= 1, d === 0 && k();
          }
          function w(C) {
            v.indexOf(C) === -1 && v.push(C);
          }
          function k() {
            var C, P = v.length;
            for (C = 0; C < P; C += 1)
              v[C].release();
            v.length = 0;
          }
          c.renderer.compInterface = CompExpressionInterface(c.renderer), c.renderer.globalData.projectInterface.registerComposition(c.renderer), c.renderer.globalData.pushExpression = y, c.renderer.globalData.popExpression = x, c.renderer.globalData.registerExpressionProperty = w;
        }
        return t;
      })(), MaskManagerInterface = (function() {
        function t(c, d) {
          this._mask = c, this._data = d;
        }
        Object.defineProperty(t.prototype, "maskPath", {
          get: function() {
            return this._mask.prop.k && this._mask.prop.getValue(), this._mask.prop;
          }
        }), Object.defineProperty(t.prototype, "maskOpacity", {
          get: function() {
            return this._mask.op.k && this._mask.op.getValue(), this._mask.op.v * 100;
          }
        });
        var n = function(d) {
          var v = createSizedArray(d.viewData.length), y, x = d.viewData.length;
          for (y = 0; y < x; y += 1)
            v[y] = new t(d.viewData[y], d.masksProperties[y]);
          var w = function(C) {
            for (y = 0; y < x; ) {
              if (d.masksProperties[y].nm === C)
                return v[y];
              y += 1;
            }
            return null;
          };
          return w;
        };
        return n;
      })(), ExpressionPropertyInterface = /* @__PURE__ */ (function() {
        var t = {
          pv: 0,
          v: 0,
          mult: 1
        }, n = {
          pv: [0, 0, 0],
          v: [0, 0, 0],
          mult: 1
        };
        function c(x, w, k) {
          Object.defineProperty(x, "velocity", {
            get: function() {
              return w.getVelocityAtTime(w.comp.currentFrame);
            }
          }), x.numKeys = w.keyframes ? w.keyframes.length : 0, x.key = function(C) {
            if (!x.numKeys)
              return 0;
            var P = "";
            "s" in w.keyframes[C - 1] ? P = w.keyframes[C - 1].s : "e" in w.keyframes[C - 2] ? P = w.keyframes[C - 2].e : P = w.keyframes[C - 2].s;
            var F = k === "unidimensional" ? new Number(P) : Object.assign({}, P);
            return F.time = w.keyframes[C - 1].t / w.elem.comp.globalData.frameRate, F.value = k === "unidimensional" ? P[0] : P, F;
          }, x.valueAtTime = w.getValueAtTime, x.speedAtTime = w.getSpeedAtTime, x.velocityAtTime = w.getVelocityAtTime, x.propertyGroup = w.propertyGroup;
        }
        function d(x) {
          (!x || !("pv" in x)) && (x = t);
          var w = 1 / x.mult, k = x.pv * w, C = new Number(k);
          return C.value = k, c(C, x, "unidimensional"), function() {
            return x.k && x.getValue(), k = x.v * w, C.value !== k && (C = new Number(k), C.value = k, C[0] = k, c(C, x, "unidimensional")), C;
          };
        }
        function v(x) {
          (!x || !("pv" in x)) && (x = n);
          var w = 1 / x.mult, k = x.data && x.data.l || x.pv.length, C = createTypedArray("float32", k), P = createTypedArray("float32", k);
          return C.value = P, c(C, x, "multidimensional"), function() {
            x.k && x.getValue();
            for (var F = 0; F < k; F += 1)
              P[F] = x.v[F] * w, C[F] = P[F];
            return C;
          };
        }
        function y() {
          return t;
        }
        return function(x) {
          return x ? x.propType === "unidimensional" ? d(x) : v(x) : y;
        };
      })(), TransformExpressionInterface = /* @__PURE__ */ (function() {
        return function(t) {
          function n(x) {
            switch (x) {
              case "scale":
              case "Scale":
              case "ADBE Scale":
              case 6:
                return n.scale;
              case "rotation":
              case "Rotation":
              case "ADBE Rotation":
              case "ADBE Rotate Z":
              case 10:
                return n.rotation;
              case "ADBE Rotate X":
                return n.xRotation;
              case "ADBE Rotate Y":
                return n.yRotation;
              case "position":
              case "Position":
              case "ADBE Position":
              case 2:
                return n.position;
              case "ADBE Position_0":
                return n.xPosition;
              case "ADBE Position_1":
                return n.yPosition;
              case "ADBE Position_2":
                return n.zPosition;
              case "anchorPoint":
              case "AnchorPoint":
              case "Anchor Point":
              case "ADBE AnchorPoint":
              case 1:
                return n.anchorPoint;
              case "opacity":
              case "Opacity":
              case 11:
                return n.opacity;
              default:
                return null;
            }
          }
          Object.defineProperty(n, "rotation", {
            get: ExpressionPropertyInterface(t.r || t.rz)
          }), Object.defineProperty(n, "zRotation", {
            get: ExpressionPropertyInterface(t.rz || t.r)
          }), Object.defineProperty(n, "xRotation", {
            get: ExpressionPropertyInterface(t.rx)
          }), Object.defineProperty(n, "yRotation", {
            get: ExpressionPropertyInterface(t.ry)
          }), Object.defineProperty(n, "scale", {
            get: ExpressionPropertyInterface(t.s)
          });
          var c, d, v, y;
          return t.p ? y = ExpressionPropertyInterface(t.p) : (c = ExpressionPropertyInterface(t.px), d = ExpressionPropertyInterface(t.py), t.pz && (v = ExpressionPropertyInterface(t.pz))), Object.defineProperty(n, "position", {
            get: function() {
              return t.p ? y() : [c(), d(), v ? v() : 0];
            }
          }), Object.defineProperty(n, "xPosition", {
            get: ExpressionPropertyInterface(t.px)
          }), Object.defineProperty(n, "yPosition", {
            get: ExpressionPropertyInterface(t.py)
          }), Object.defineProperty(n, "zPosition", {
            get: ExpressionPropertyInterface(t.pz)
          }), Object.defineProperty(n, "anchorPoint", {
            get: ExpressionPropertyInterface(t.a)
          }), Object.defineProperty(n, "opacity", {
            get: ExpressionPropertyInterface(t.o)
          }), Object.defineProperty(n, "skew", {
            get: ExpressionPropertyInterface(t.sk)
          }), Object.defineProperty(n, "skewAxis", {
            get: ExpressionPropertyInterface(t.sa)
          }), Object.defineProperty(n, "orientation", {
            get: ExpressionPropertyInterface(t.or)
          }), n;
        };
      })(), LayerExpressionInterface = /* @__PURE__ */ (function() {
        function t(C) {
          var P = new Matrix();
          if (C !== void 0) {
            var F = this._elem.finalTransform.mProp.getValueAtTime(C);
            F.clone(P);
          } else {
            var S = this._elem.finalTransform.mProp;
            S.applyToMatrix(P);
          }
          return P;
        }
        function n(C, P) {
          var F = this.getMatrix(P);
          return F.props[12] = 0, F.props[13] = 0, F.props[14] = 0, this.applyPoint(F, C);
        }
        function c(C, P) {
          var F = this.getMatrix(P);
          return this.applyPoint(F, C);
        }
        function d(C, P) {
          var F = this.getMatrix(P);
          return F.props[12] = 0, F.props[13] = 0, F.props[14] = 0, this.invertPoint(F, C);
        }
        function v(C, P) {
          var F = this.getMatrix(P);
          return this.invertPoint(F, C);
        }
        function y(C, P) {
          if (this._elem.hierarchy && this._elem.hierarchy.length) {
            var F, S = this._elem.hierarchy.length;
            for (F = 0; F < S; F += 1)
              this._elem.hierarchy[F].finalTransform.mProp.applyToMatrix(C);
          }
          return C.applyToPointArray(P[0], P[1], P[2] || 0);
        }
        function x(C, P) {
          if (this._elem.hierarchy && this._elem.hierarchy.length) {
            var F, S = this._elem.hierarchy.length;
            for (F = 0; F < S; F += 1)
              this._elem.hierarchy[F].finalTransform.mProp.applyToMatrix(C);
          }
          return C.inversePoint(P);
        }
        function w(C) {
          var P = new Matrix();
          if (P.reset(), this._elem.finalTransform.mProp.applyToMatrix(P), this._elem.hierarchy && this._elem.hierarchy.length) {
            var F, S = this._elem.hierarchy.length;
            for (F = 0; F < S; F += 1)
              this._elem.hierarchy[F].finalTransform.mProp.applyToMatrix(P);
            return P.inversePoint(C);
          }
          return P.inversePoint(C);
        }
        function k() {
          return [1, 1, 1, 1];
        }
        return function(C) {
          var P;
          function F(A) {
            j.mask = new MaskManagerInterface(A, C);
          }
          function S(A) {
            j.effect = A;
          }
          function j(A) {
            switch (A) {
              case "ADBE Root Vectors Group":
              case "Contents":
              case 2:
                return j.shapeInterface;
              case 1:
              case 6:
              case "Transform":
              case "transform":
              case "ADBE Transform Group":
                return P;
              case 4:
              case "ADBE Effect Parade":
              case "effects":
              case "Effects":
                return j.effect;
              case "ADBE Text Properties":
                return j.textInterface;
              default:
                return null;
            }
          }
          j.getMatrix = t, j.invertPoint = x, j.applyPoint = y, j.toWorld = c, j.toWorldVec = n, j.fromWorld = v, j.fromWorldVec = d, j.toComp = c, j.fromComp = w, j.sampleImage = k, j.sourceRectAtTime = C.sourceRectAtTime.bind(C), j._elem = C, P = TransformExpressionInterface(C.finalTransform.mProp);
          var T = getDescriptor(P, "anchorPoint");
          return Object.defineProperties(j, {
            hasParent: {
              get: function() {
                return C.hierarchy.length;
              }
            },
            parent: {
              get: function() {
                return C.hierarchy[0].layerInterface;
              }
            },
            rotation: getDescriptor(P, "rotation"),
            scale: getDescriptor(P, "scale"),
            position: getDescriptor(P, "position"),
            opacity: getDescriptor(P, "opacity"),
            anchorPoint: T,
            anchor_point: T,
            transform: {
              get: function() {
                return P;
              }
            },
            active: {
              get: function() {
                return C.isInRange;
              }
            }
          }), j.startTime = C.data.st, j.index = C.data.ind, j.source = C.data.refId, j.height = C.data.ty === 0 ? C.data.h : 100, j.width = C.data.ty === 0 ? C.data.w : 100, j.inPoint = C.data.ip / C.comp.globalData.frameRate, j.outPoint = C.data.op / C.comp.globalData.frameRate, j._name = C.data.nm, j.registerMaskInterface = F, j.registerEffectsInterface = S, j;
        };
      })(), propertyGroupFactory = /* @__PURE__ */ (function() {
        return function(t, n) {
          return function(c) {
            return c = c === void 0 ? 1 : c, c <= 0 ? t : n(c - 1);
          };
        };
      })(), PropertyInterface = /* @__PURE__ */ (function() {
        return function(t, n) {
          var c = {
            _name: t
          };
          function d(v) {
            return v = v === void 0 ? 1 : v, v <= 0 ? c : n(v - 1);
          }
          return d;
        };
      })(), EffectsExpressionInterface = /* @__PURE__ */ (function() {
        var t = {
          createEffectsInterface: n
        };
        function n(v, y) {
          if (v.effectsManager) {
            var x = [], w = v.data.ef, k, C = v.effectsManager.effectElements.length;
            for (k = 0; k < C; k += 1)
              x.push(c(w[k], v.effectsManager.effectElements[k], y, v));
            var P = v.data.ef || [], F = function(j) {
              for (k = 0, C = P.length; k < C; ) {
                if (j === P[k].nm || j === P[k].mn || j === P[k].ix)
                  return x[k];
                k += 1;
              }
              return null;
            };
            return Object.defineProperty(F, "numProperties", {
              get: function() {
                return P.length;
              }
            }), F;
          }
          return null;
        }
        function c(v, y, x, w) {
          function k(j) {
            for (var T = v.ef, A = 0, R = T.length; A < R; ) {
              if (j === T[A].nm || j === T[A].mn || j === T[A].ix)
                return T[A].ty === 5 ? P[A] : P[A]();
              A += 1;
            }
            throw new Error();
          }
          var C = propertyGroupFactory(k, x), P = [], F, S = v.ef.length;
          for (F = 0; F < S; F += 1)
            v.ef[F].ty === 5 ? P.push(c(v.ef[F], y.effectElements[F], y.effectElements[F].propertyGroup, w)) : P.push(d(y.effectElements[F], v.ef[F].ty, w, C));
          return v.mn === "ADBE Color Control" && Object.defineProperty(k, "color", {
            get: function() {
              return P[0]();
            }
          }), Object.defineProperties(k, {
            numProperties: {
              get: function() {
                return v.np;
              }
            },
            _name: {
              value: v.nm
            },
            propertyGroup: {
              value: C
            }
          }), k.enabled = v.en !== 0, k.active = k.enabled, k;
        }
        function d(v, y, x, w) {
          var k = ExpressionPropertyInterface(v.p);
          function C() {
            return y === 10 ? x.comp.compInterface(v.p.v) : k();
          }
          return v.p.setGroupProperty && v.p.setGroupProperty(PropertyInterface("", w)), C;
        }
        return t;
      })(), ShapePathInterface = /* @__PURE__ */ (function() {
        return function(n, c, d) {
          var v = c.sh;
          function y(w) {
            return w === "Shape" || w === "shape" || w === "Path" || w === "path" || w === "ADBE Vector Shape" || w === 2 ? y.path : null;
          }
          var x = propertyGroupFactory(y, d);
          return v.setGroupProperty(PropertyInterface("Path", x)), Object.defineProperties(y, {
            path: {
              get: function() {
                return v.k && v.getValue(), v;
              }
            },
            shape: {
              get: function() {
                return v.k && v.getValue(), v;
              }
            },
            _name: {
              value: n.nm
            },
            ix: {
              value: n.ix
            },
            propertyIndex: {
              value: n.ix
            },
            mn: {
              value: n.mn
            },
            propertyGroup: {
              value: d
            }
          }), y;
        };
      })(), ShapeExpressionInterface = /* @__PURE__ */ (function() {
        function t(T, A, R) {
          var M = [], _, E = T ? T.length : 0;
          for (_ = 0; _ < E; _ += 1)
            T[_].ty === "gr" ? M.push(c(T[_], A[_], R)) : T[_].ty === "fl" ? M.push(d(T[_], A[_], R)) : T[_].ty === "st" ? M.push(x(T[_], A[_], R)) : T[_].ty === "tm" ? M.push(w(T[_], A[_], R)) : T[_].ty === "tr" || (T[_].ty === "el" ? M.push(C(T[_], A[_], R)) : T[_].ty === "sr" ? M.push(P(T[_], A[_], R)) : T[_].ty === "sh" ? M.push(ShapePathInterface(T[_], A[_], R)) : T[_].ty === "rc" ? M.push(F(T[_], A[_], R)) : T[_].ty === "rd" ? M.push(S(T[_], A[_], R)) : T[_].ty === "rp" ? M.push(j(T[_], A[_], R)) : T[_].ty === "gf" ? M.push(v(T[_], A[_], R)) : M.push(y(T[_], A[_])));
          return M;
        }
        function n(T, A, R) {
          var M, _ = function(L) {
            for (var D = 0, O = M.length; D < O; ) {
              if (M[D]._name === L || M[D].mn === L || M[D].propertyIndex === L || M[D].ix === L || M[D].ind === L)
                return M[D];
              D += 1;
            }
            return typeof L == "number" ? M[L - 1] : null;
          };
          _.propertyGroup = propertyGroupFactory(_, R), M = t(T.it, A.it, _.propertyGroup), _.numProperties = M.length;
          var E = k(T.it[T.it.length - 1], A.it[A.it.length - 1], _.propertyGroup);
          return _.transform = E, _.propertyIndex = T.cix, _._name = T.nm, _;
        }
        function c(T, A, R) {
          var M = function(L) {
            switch (L) {
              case "ADBE Vectors Group":
              case "Contents":
              case 2:
                return M.content;
              // Not necessary for now. Keeping them here in case a new case appears
              // case 'ADBE Vector Transform Group':
              // case 3:
              default:
                return M.transform;
            }
          };
          M.propertyGroup = propertyGroupFactory(M, R);
          var _ = n(T, A, M.propertyGroup), E = k(T.it[T.it.length - 1], A.it[A.it.length - 1], M.propertyGroup);
          return M.content = _, M.transform = E, Object.defineProperty(M, "_name", {
            get: function() {
              return T.nm;
            }
          }), M.numProperties = T.np, M.propertyIndex = T.ix, M.nm = T.nm, M.mn = T.mn, M;
        }
        function d(T, A, R) {
          function M(_) {
            return _ === "Color" || _ === "color" ? M.color : _ === "Opacity" || _ === "opacity" ? M.opacity : null;
          }
          return Object.defineProperties(M, {
            color: {
              get: ExpressionPropertyInterface(A.c)
            },
            opacity: {
              get: ExpressionPropertyInterface(A.o)
            },
            _name: {
              value: T.nm
            },
            mn: {
              value: T.mn
            }
          }), A.c.setGroupProperty(PropertyInterface("Color", R)), A.o.setGroupProperty(PropertyInterface("Opacity", R)), M;
        }
        function v(T, A, R) {
          function M(_) {
            return _ === "Start Point" || _ === "start point" ? M.startPoint : _ === "End Point" || _ === "end point" ? M.endPoint : _ === "Opacity" || _ === "opacity" ? M.opacity : null;
          }
          return Object.defineProperties(M, {
            startPoint: {
              get: ExpressionPropertyInterface(A.s)
            },
            endPoint: {
              get: ExpressionPropertyInterface(A.e)
            },
            opacity: {
              get: ExpressionPropertyInterface(A.o)
            },
            type: {
              get: function() {
                return "a";
              }
            },
            _name: {
              value: T.nm
            },
            mn: {
              value: T.mn
            }
          }), A.s.setGroupProperty(PropertyInterface("Start Point", R)), A.e.setGroupProperty(PropertyInterface("End Point", R)), A.o.setGroupProperty(PropertyInterface("Opacity", R)), M;
        }
        function y() {
          function T() {
            return null;
          }
          return T;
        }
        function x(T, A, R) {
          var M = propertyGroupFactory(O, R), _ = propertyGroupFactory(D, M);
          function E(z) {
            Object.defineProperty(D, T.d[z].nm, {
              get: ExpressionPropertyInterface(A.d.dataProps[z].p)
            });
          }
          var I, L = T.d ? T.d.length : 0, D = {};
          for (I = 0; I < L; I += 1)
            E(I), A.d.dataProps[I].p.setGroupProperty(_);
          function O(z) {
            return z === "Color" || z === "color" ? O.color : z === "Opacity" || z === "opacity" ? O.opacity : z === "Stroke Width" || z === "stroke width" ? O.strokeWidth : null;
          }
          return Object.defineProperties(O, {
            color: {
              get: ExpressionPropertyInterface(A.c)
            },
            opacity: {
              get: ExpressionPropertyInterface(A.o)
            },
            strokeWidth: {
              get: ExpressionPropertyInterface(A.w)
            },
            dash: {
              get: function() {
                return D;
              }
            },
            _name: {
              value: T.nm
            },
            mn: {
              value: T.mn
            }
          }), A.c.setGroupProperty(PropertyInterface("Color", M)), A.o.setGroupProperty(PropertyInterface("Opacity", M)), A.w.setGroupProperty(PropertyInterface("Stroke Width", M)), O;
        }
        function w(T, A, R) {
          function M(E) {
            return E === T.e.ix || E === "End" || E === "end" ? M.end : E === T.s.ix ? M.start : E === T.o.ix ? M.offset : null;
          }
          var _ = propertyGroupFactory(M, R);
          return M.propertyIndex = T.ix, A.s.setGroupProperty(PropertyInterface("Start", _)), A.e.setGroupProperty(PropertyInterface("End", _)), A.o.setGroupProperty(PropertyInterface("Offset", _)), M.propertyIndex = T.ix, M.propertyGroup = R, Object.defineProperties(M, {
            start: {
              get: ExpressionPropertyInterface(A.s)
            },
            end: {
              get: ExpressionPropertyInterface(A.e)
            },
            offset: {
              get: ExpressionPropertyInterface(A.o)
            },
            _name: {
              value: T.nm
            }
          }), M.mn = T.mn, M;
        }
        function k(T, A, R) {
          function M(E) {
            return T.a.ix === E || E === "Anchor Point" ? M.anchorPoint : T.o.ix === E || E === "Opacity" ? M.opacity : T.p.ix === E || E === "Position" ? M.position : T.r.ix === E || E === "Rotation" || E === "ADBE Vector Rotation" ? M.rotation : T.s.ix === E || E === "Scale" ? M.scale : T.sk && T.sk.ix === E || E === "Skew" ? M.skew : T.sa && T.sa.ix === E || E === "Skew Axis" ? M.skewAxis : null;
          }
          var _ = propertyGroupFactory(M, R);
          return A.transform.mProps.o.setGroupProperty(PropertyInterface("Opacity", _)), A.transform.mProps.p.setGroupProperty(PropertyInterface("Position", _)), A.transform.mProps.a.setGroupProperty(PropertyInterface("Anchor Point", _)), A.transform.mProps.s.setGroupProperty(PropertyInterface("Scale", _)), A.transform.mProps.r.setGroupProperty(PropertyInterface("Rotation", _)), A.transform.mProps.sk && (A.transform.mProps.sk.setGroupProperty(PropertyInterface("Skew", _)), A.transform.mProps.sa.setGroupProperty(PropertyInterface("Skew Angle", _))), A.transform.op.setGroupProperty(PropertyInterface("Opacity", _)), Object.defineProperties(M, {
            opacity: {
              get: ExpressionPropertyInterface(A.transform.mProps.o)
            },
            position: {
              get: ExpressionPropertyInterface(A.transform.mProps.p)
            },
            anchorPoint: {
              get: ExpressionPropertyInterface(A.transform.mProps.a)
            },
            scale: {
              get: ExpressionPropertyInterface(A.transform.mProps.s)
            },
            rotation: {
              get: ExpressionPropertyInterface(A.transform.mProps.r)
            },
            skew: {
              get: ExpressionPropertyInterface(A.transform.mProps.sk)
            },
            skewAxis: {
              get: ExpressionPropertyInterface(A.transform.mProps.sa)
            },
            _name: {
              value: T.nm
            }
          }), M.ty = "tr", M.mn = T.mn, M.propertyGroup = R, M;
        }
        function C(T, A, R) {
          function M(I) {
            return T.p.ix === I ? M.position : T.s.ix === I ? M.size : null;
          }
          var _ = propertyGroupFactory(M, R);
          M.propertyIndex = T.ix;
          var E = A.sh.ty === "tm" ? A.sh.prop : A.sh;
          return E.s.setGroupProperty(PropertyInterface("Size", _)), E.p.setGroupProperty(PropertyInterface("Position", _)), Object.defineProperties(M, {
            size: {
              get: ExpressionPropertyInterface(E.s)
            },
            position: {
              get: ExpressionPropertyInterface(E.p)
            },
            _name: {
              value: T.nm
            }
          }), M.mn = T.mn, M;
        }
        function P(T, A, R) {
          function M(I) {
            return T.p.ix === I ? M.position : T.r.ix === I ? M.rotation : T.pt.ix === I ? M.points : T.or.ix === I || I === "ADBE Vector Star Outer Radius" ? M.outerRadius : T.os.ix === I ? M.outerRoundness : T.ir && (T.ir.ix === I || I === "ADBE Vector Star Inner Radius") ? M.innerRadius : T.is && T.is.ix === I ? M.innerRoundness : null;
          }
          var _ = propertyGroupFactory(M, R), E = A.sh.ty === "tm" ? A.sh.prop : A.sh;
          return M.propertyIndex = T.ix, E.or.setGroupProperty(PropertyInterface("Outer Radius", _)), E.os.setGroupProperty(PropertyInterface("Outer Roundness", _)), E.pt.setGroupProperty(PropertyInterface("Points", _)), E.p.setGroupProperty(PropertyInterface("Position", _)), E.r.setGroupProperty(PropertyInterface("Rotation", _)), T.ir && (E.ir.setGroupProperty(PropertyInterface("Inner Radius", _)), E.is.setGroupProperty(PropertyInterface("Inner Roundness", _))), Object.defineProperties(M, {
            position: {
              get: ExpressionPropertyInterface(E.p)
            },
            rotation: {
              get: ExpressionPropertyInterface(E.r)
            },
            points: {
              get: ExpressionPropertyInterface(E.pt)
            },
            outerRadius: {
              get: ExpressionPropertyInterface(E.or)
            },
            outerRoundness: {
              get: ExpressionPropertyInterface(E.os)
            },
            innerRadius: {
              get: ExpressionPropertyInterface(E.ir)
            },
            innerRoundness: {
              get: ExpressionPropertyInterface(E.is)
            },
            _name: {
              value: T.nm
            }
          }), M.mn = T.mn, M;
        }
        function F(T, A, R) {
          function M(I) {
            return T.p.ix === I ? M.position : T.r.ix === I ? M.roundness : T.s.ix === I || I === "Size" || I === "ADBE Vector Rect Size" ? M.size : null;
          }
          var _ = propertyGroupFactory(M, R), E = A.sh.ty === "tm" ? A.sh.prop : A.sh;
          return M.propertyIndex = T.ix, E.p.setGroupProperty(PropertyInterface("Position", _)), E.s.setGroupProperty(PropertyInterface("Size", _)), E.r.setGroupProperty(PropertyInterface("Rotation", _)), Object.defineProperties(M, {
            position: {
              get: ExpressionPropertyInterface(E.p)
            },
            roundness: {
              get: ExpressionPropertyInterface(E.r)
            },
            size: {
              get: ExpressionPropertyInterface(E.s)
            },
            _name: {
              value: T.nm
            }
          }), M.mn = T.mn, M;
        }
        function S(T, A, R) {
          function M(I) {
            return T.r.ix === I || I === "Round Corners 1" ? M.radius : null;
          }
          var _ = propertyGroupFactory(M, R), E = A;
          return M.propertyIndex = T.ix, E.rd.setGroupProperty(PropertyInterface("Radius", _)), Object.defineProperties(M, {
            radius: {
              get: ExpressionPropertyInterface(E.rd)
            },
            _name: {
              value: T.nm
            }
          }), M.mn = T.mn, M;
        }
        function j(T, A, R) {
          function M(I) {
            return T.c.ix === I || I === "Copies" ? M.copies : T.o.ix === I || I === "Offset" ? M.offset : null;
          }
          var _ = propertyGroupFactory(M, R), E = A;
          return M.propertyIndex = T.ix, E.c.setGroupProperty(PropertyInterface("Copies", _)), E.o.setGroupProperty(PropertyInterface("Offset", _)), Object.defineProperties(M, {
            copies: {
              get: ExpressionPropertyInterface(E.c)
            },
            offset: {
              get: ExpressionPropertyInterface(E.o)
            },
            _name: {
              value: T.nm
            }
          }), M.mn = T.mn, M;
        }
        return function(T, A, R) {
          var M;
          function _(I) {
            if (typeof I == "number")
              return I = I === void 0 ? 1 : I, I === 0 ? R : M[I - 1];
            for (var L = 0, D = M.length; L < D; ) {
              if (M[L]._name === I)
                return M[L];
              L += 1;
            }
            return null;
          }
          function E() {
            return R;
          }
          return _.propertyGroup = propertyGroupFactory(_, E), M = t(T, A, _.propertyGroup), _.numProperties = M.length, _._name = "Contents", _;
        };
      })(), TextExpressionInterface = /* @__PURE__ */ (function() {
        return function(t) {
          var n;
          function c(d) {
            switch (d) {
              case "ADBE Text Document":
                return c.sourceText;
              default:
                return null;
            }
          }
          return Object.defineProperty(c, "sourceText", {
            get: function() {
              t.textProperty.getValue();
              var v = t.textProperty.currentData.t;
              return (!n || v !== n.value) && (n = new String(v), n.value = v || new String(v), Object.defineProperty(n, "style", {
                get: function() {
                  return {
                    fillColor: t.textProperty.currentData.fc
                  };
                }
              })), n;
            }
          }), c;
        };
      })();
      function _typeof(t) {
        "@babel/helpers - typeof";
        return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
          return typeof n;
        } : function(n) {
          return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
        }, _typeof(t);
      }
      var FootageInterface = /* @__PURE__ */ (function() {
        var t = function(d) {
          var v = "", y = d.getFootageData();
          function x() {
            return v = "", y = d.getFootageData(), w;
          }
          function w(k) {
            if (y[k])
              return v = k, y = y[k], _typeof(y) === "object" ? w : y;
            var C = k.indexOf(v);
            if (C !== -1) {
              var P = parseInt(k.substr(C + v.length), 10);
              return y = y[P], _typeof(y) === "object" ? w : y;
            }
            return "";
          }
          return x;
        }, n = function(d) {
          function v(y) {
            return y === "Outline" ? v.outlineInterface() : null;
          }
          return v._name = "Outline", v.outlineInterface = t(d), v;
        };
        return function(c) {
          function d(v) {
            return v === "Data" ? d.dataInterface : null;
          }
          return d._name = "Data", d.dataInterface = n(c), d;
        };
      })(), interfaces = {
        layer: LayerExpressionInterface,
        effects: EffectsExpressionInterface,
        comp: CompExpressionInterface,
        shape: ShapeExpressionInterface,
        text: TextExpressionInterface,
        footage: FootageInterface
      };
      function getInterface(t) {
        return interfaces[t] || null;
      }
      var expressionHelpers = /* @__PURE__ */ (function() {
        function t(x, w, k) {
          w.x && (k.k = !0, k.x = !0, k.initiateExpression = ExpressionManager.initiateExpression, k.effectsSequence.push(k.initiateExpression(x, w, k).bind(k)));
        }
        function n(x) {
          return x *= this.elem.globalData.frameRate, x -= this.offsetTime, x !== this._cachingAtTime.lastFrame && (this._cachingAtTime.lastIndex = this._cachingAtTime.lastFrame < x ? this._cachingAtTime.lastIndex : 0, this._cachingAtTime.value = this.interpolateValue(x, this._cachingAtTime), this._cachingAtTime.lastFrame = x), this._cachingAtTime.value;
        }
        function c(x) {
          var w = -0.01, k = this.getValueAtTime(x), C = this.getValueAtTime(x + w), P = 0;
          if (k.length) {
            var F;
            for (F = 0; F < k.length; F += 1)
              P += Math.pow(C[F] - k[F], 2);
            P = Math.sqrt(P) * 100;
          } else
            P = 0;
          return P;
        }
        function d(x) {
          if (this.vel !== void 0)
            return this.vel;
          var w = -1e-3, k = this.getValueAtTime(x), C = this.getValueAtTime(x + w), P;
          if (k.length) {
            P = createTypedArray("float32", k.length);
            var F;
            for (F = 0; F < k.length; F += 1)
              P[F] = (C[F] - k[F]) / w;
          } else
            P = (C - k) / w;
          return P;
        }
        function v() {
          return this.pv;
        }
        function y(x) {
          this.propertyGroup = x;
        }
        return {
          searchExpressions: t,
          getSpeedAtTime: c,
          getVelocityAtTime: d,
          getValueAtTime: n,
          getStaticValueAtTime: v,
          setGroupProperty: y
        };
      })();
      function addPropertyDecorator() {
        function t(S, j, T) {
          if (!this.k || !this.keyframes)
            return this.pv;
          S = S ? S.toLowerCase() : "";
          var A = this.comp.renderedFrame, R = this.keyframes, M = R[R.length - 1].t;
          if (A <= M)
            return this.pv;
          var _, E;
          T ? (j ? _ = Math.abs(M - this.elem.comp.globalData.frameRate * j) : _ = Math.max(0, M - this.elem.data.ip), E = M - _) : ((!j || j > R.length - 1) && (j = R.length - 1), E = R[R.length - 1 - j].t, _ = M - E);
          var I, L, D;
          if (S === "pingpong") {
            var O = Math.floor((A - E) / _);
            if (O % 2 !== 0)
              return this.getValueAtTime((_ - (A - E) % _ + E) / this.comp.globalData.frameRate, 0);
          } else if (S === "offset") {
            var z = this.getValueAtTime(E / this.comp.globalData.frameRate, 0), W = this.getValueAtTime(M / this.comp.globalData.frameRate, 0), X = this.getValueAtTime(((A - E) % _ + E) / this.comp.globalData.frameRate, 0), K = Math.floor((A - E) / _);
            if (this.pv.length) {
              for (D = new Array(z.length), L = D.length, I = 0; I < L; I += 1)
                D[I] = (W[I] - z[I]) * K + X[I];
              return D;
            }
            return (W - z) * K + X;
          } else if (S === "continue") {
            var Y = this.getValueAtTime(M / this.comp.globalData.frameRate, 0), U = this.getValueAtTime((M - 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (D = new Array(Y.length), L = D.length, I = 0; I < L; I += 1)
                D[I] = Y[I] + (Y[I] - U[I]) * ((A - M) / this.comp.globalData.frameRate) / 5e-4;
              return D;
            }
            return Y + (Y - U) * ((A - M) / 1e-3);
          }
          return this.getValueAtTime(((A - E) % _ + E) / this.comp.globalData.frameRate, 0);
        }
        function n(S, j, T) {
          if (!this.k)
            return this.pv;
          S = S ? S.toLowerCase() : "";
          var A = this.comp.renderedFrame, R = this.keyframes, M = R[0].t;
          if (A >= M)
            return this.pv;
          var _, E;
          T ? (j ? _ = Math.abs(this.elem.comp.globalData.frameRate * j) : _ = Math.max(0, this.elem.data.op - M), E = M + _) : ((!j || j > R.length - 1) && (j = R.length - 1), E = R[j].t, _ = E - M);
          var I, L, D;
          if (S === "pingpong") {
            var O = Math.floor((M - A) / _);
            if (O % 2 === 0)
              return this.getValueAtTime(((M - A) % _ + M) / this.comp.globalData.frameRate, 0);
          } else if (S === "offset") {
            var z = this.getValueAtTime(M / this.comp.globalData.frameRate, 0), W = this.getValueAtTime(E / this.comp.globalData.frameRate, 0), X = this.getValueAtTime((_ - (M - A) % _ + M) / this.comp.globalData.frameRate, 0), K = Math.floor((M - A) / _) + 1;
            if (this.pv.length) {
              for (D = new Array(z.length), L = D.length, I = 0; I < L; I += 1)
                D[I] = X[I] - (W[I] - z[I]) * K;
              return D;
            }
            return X - (W - z) * K;
          } else if (S === "continue") {
            var Y = this.getValueAtTime(M / this.comp.globalData.frameRate, 0), U = this.getValueAtTime((M + 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (D = new Array(Y.length), L = D.length, I = 0; I < L; I += 1)
                D[I] = Y[I] + (Y[I] - U[I]) * (M - A) / 1e-3;
              return D;
            }
            return Y + (Y - U) * (M - A) / 1e-3;
          }
          return this.getValueAtTime((_ - ((M - A) % _ + M)) / this.comp.globalData.frameRate, 0);
        }
        function c(S, j) {
          if (!this.k)
            return this.pv;
          if (S = (S || 0.4) * 0.5, j = Math.floor(j || 5), j <= 1)
            return this.pv;
          var T = this.comp.renderedFrame / this.comp.globalData.frameRate, A = T - S, R = T + S, M = j > 1 ? (R - A) / (j - 1) : 1, _ = 0, E = 0, I;
          this.pv.length ? I = createTypedArray("float32", this.pv.length) : I = 0;
          for (var L; _ < j; ) {
            if (L = this.getValueAtTime(A + _ * M), this.pv.length)
              for (E = 0; E < this.pv.length; E += 1)
                I[E] += L[E];
            else
              I += L;
            _ += 1;
          }
          if (this.pv.length)
            for (E = 0; E < this.pv.length; E += 1)
              I[E] /= j;
          else
            I /= j;
          return I;
        }
        function d(S) {
          this._transformCachingAtTime || (this._transformCachingAtTime = {
            v: new Matrix()
          });
          var j = this._transformCachingAtTime.v;
          if (j.cloneFromProps(this.pre.props), this.appliedTransformations < 1) {
            var T = this.a.getValueAtTime(S);
            j.translate(-T[0] * this.a.mult, -T[1] * this.a.mult, T[2] * this.a.mult);
          }
          if (this.appliedTransformations < 2) {
            var A = this.s.getValueAtTime(S);
            j.scale(A[0] * this.s.mult, A[1] * this.s.mult, A[2] * this.s.mult);
          }
          if (this.sk && this.appliedTransformations < 3) {
            var R = this.sk.getValueAtTime(S), M = this.sa.getValueAtTime(S);
            j.skewFromAxis(-R * this.sk.mult, M * this.sa.mult);
          }
          if (this.r && this.appliedTransformations < 4) {
            var _ = this.r.getValueAtTime(S);
            j.rotate(-_ * this.r.mult);
          } else if (!this.r && this.appliedTransformations < 4) {
            var E = this.rz.getValueAtTime(S), I = this.ry.getValueAtTime(S), L = this.rx.getValueAtTime(S), D = this.or.getValueAtTime(S);
            j.rotateZ(-E * this.rz.mult).rotateY(I * this.ry.mult).rotateX(L * this.rx.mult).rotateZ(-D[2] * this.or.mult).rotateY(D[1] * this.or.mult).rotateX(D[0] * this.or.mult);
          }
          if (this.data.p && this.data.p.s) {
            var O = this.px.getValueAtTime(S), z = this.py.getValueAtTime(S);
            if (this.data.p.z) {
              var W = this.pz.getValueAtTime(S);
              j.translate(O * this.px.mult, z * this.py.mult, -W * this.pz.mult);
            } else
              j.translate(O * this.px.mult, z * this.py.mult, 0);
          } else {
            var X = this.p.getValueAtTime(S);
            j.translate(X[0] * this.p.mult, X[1] * this.p.mult, -X[2] * this.p.mult);
          }
          return j;
        }
        function v() {
          return this.v.clone(new Matrix());
        }
        var y = TransformPropertyFactory.getTransformProperty;
        TransformPropertyFactory.getTransformProperty = function(S, j, T) {
          var A = y(S, j, T);
          return A.dynamicProperties.length ? A.getValueAtTime = d.bind(A) : A.getValueAtTime = v.bind(A), A.setGroupProperty = expressionHelpers.setGroupProperty, A;
        };
        var x = PropertyFactory.getProp;
        PropertyFactory.getProp = function(S, j, T, A, R) {
          var M = x(S, j, T, A, R);
          M.kf ? M.getValueAtTime = expressionHelpers.getValueAtTime.bind(M) : M.getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(M), M.setGroupProperty = expressionHelpers.setGroupProperty, M.loopOut = t, M.loopIn = n, M.smooth = c, M.getVelocityAtTime = expressionHelpers.getVelocityAtTime.bind(M), M.getSpeedAtTime = expressionHelpers.getSpeedAtTime.bind(M), M.numKeys = j.a === 1 ? j.k.length : 0, M.propertyIndex = j.ix;
          var _ = 0;
          return T !== 0 && (_ = createTypedArray("float32", j.a === 1 ? j.k[0].s.length : j.k.length)), M._cachingAtTime = {
            lastFrame: initialDefaultFrame,
            lastIndex: 0,
            value: _
          }, expressionHelpers.searchExpressions(S, j, M), M.k && R.addDynamicProperty(M), M;
        };
        function w(S) {
          return this._cachingAtTime || (this._cachingAtTime = {
            shapeValue: shapePool.clone(this.pv),
            lastIndex: 0,
            lastTime: initialDefaultFrame
          }), S *= this.elem.globalData.frameRate, S -= this.offsetTime, S !== this._cachingAtTime.lastTime && (this._cachingAtTime.lastIndex = this._cachingAtTime.lastTime < S ? this._caching.lastIndex : 0, this._cachingAtTime.lastTime = S, this.interpolateShape(S, this._cachingAtTime.shapeValue, this._cachingAtTime)), this._cachingAtTime.shapeValue;
        }
        var k = ShapePropertyFactory.getConstructorFunction(), C = ShapePropertyFactory.getKeyframedConstructorFunction();
        function P() {
        }
        P.prototype = {
          vertices: function(j, T) {
            this.k && this.getValue();
            var A = this.v;
            T !== void 0 && (A = this.getValueAtTime(T, 0));
            var R, M = A._length, _ = A[j], E = A.v, I = createSizedArray(M);
            for (R = 0; R < M; R += 1)
              j === "i" || j === "o" ? I[R] = [_[R][0] - E[R][0], _[R][1] - E[R][1]] : I[R] = [_[R][0], _[R][1]];
            return I;
          },
          points: function(j) {
            return this.vertices("v", j);
          },
          inTangents: function(j) {
            return this.vertices("i", j);
          },
          outTangents: function(j) {
            return this.vertices("o", j);
          },
          isClosed: function() {
            return this.v.c;
          },
          pointOnPath: function(j, T) {
            var A = this.v;
            T !== void 0 && (A = this.getValueAtTime(T, 0)), this._segmentsLength || (this._segmentsLength = bez.getSegmentsLength(A));
            for (var R = this._segmentsLength, M = R.lengths, _ = R.totalLength * j, E = 0, I = M.length, L = 0, D; E < I; ) {
              if (L + M[E].addedLength > _) {
                var O = E, z = A.c && E === I - 1 ? 0 : E + 1, W = (_ - L) / M[E].addedLength;
                D = bez.getPointInSegment(A.v[O], A.v[z], A.o[O], A.i[z], W, M[E]);
                break;
              } else
                L += M[E].addedLength;
              E += 1;
            }
            return D || (D = A.c ? [A.v[0][0], A.v[0][1]] : [A.v[A._length - 1][0], A.v[A._length - 1][1]]), D;
          },
          vectorOnPath: function(j, T, A) {
            j == 1 ? j = this.v.c : j == 0 && (j = 0.999);
            var R = this.pointOnPath(j, T), M = this.pointOnPath(j + 1e-3, T), _ = M[0] - R[0], E = M[1] - R[1], I = Math.sqrt(Math.pow(_, 2) + Math.pow(E, 2));
            if (I === 0)
              return [0, 0];
            var L = A === "tangent" ? [_ / I, E / I] : [-E / I, _ / I];
            return L;
          },
          tangentOnPath: function(j, T) {
            return this.vectorOnPath(j, T, "tangent");
          },
          normalOnPath: function(j, T) {
            return this.vectorOnPath(j, T, "normal");
          },
          setGroupProperty: expressionHelpers.setGroupProperty,
          getValueAtTime: expressionHelpers.getStaticValueAtTime
        }, extendPrototype([P], k), extendPrototype([P], C), C.prototype.getValueAtTime = w, C.prototype.initiateExpression = ExpressionManager.initiateExpression;
        var F = ShapePropertyFactory.getShapeProp;
        ShapePropertyFactory.getShapeProp = function(S, j, T, A, R) {
          var M = F(S, j, T, A, R);
          return M.propertyIndex = j.ix, M.lock = !1, T === 3 ? expressionHelpers.searchExpressions(S, j.pt, M) : T === 4 && expressionHelpers.searchExpressions(S, j.ks, M), M.k && S.addDynamicProperty(M), M;
        };
      }
      function initialize$1() {
        addPropertyDecorator();
      }
      function addDecorator() {
        function t() {
          return this.data.d.x ? (this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem, this.data.d, this), this.addEffect(this.getExpressionValue.bind(this)), !0) : null;
        }
        TextProperty.prototype.getExpressionValue = function(n, c) {
          var d = this.calculateExpression(c);
          if (n.t !== d) {
            var v = {};
            return this.copyData(v, n), v.t = d.toString(), v.__complete = !1, v;
          }
          return n;
        }, TextProperty.prototype.searchProperty = function() {
          var n = this.searchKeyframes(), c = this.searchExpressions();
          return this.kf = n || c, this.kf;
        }, TextProperty.prototype.searchExpressions = t;
      }
      function initialize() {
        addDecorator();
      }
      function SVGComposableEffect() {
      }
      SVGComposableEffect.prototype = {
        createMergeNode: function t(n, c) {
          var d = createNS("feMerge");
          d.setAttribute("result", n);
          var v, y;
          for (y = 0; y < c.length; y += 1)
            v = createNS("feMergeNode"), v.setAttribute("in", c[y]), d.appendChild(v), d.appendChild(v);
          return d;
        }
      };
      var linearFilterValue = "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0";
      function SVGTintFilter(t, n, c, d, v) {
        this.filterManager = n;
        var y = createNS("feColorMatrix");
        y.setAttribute("type", "matrix"), y.setAttribute("color-interpolation-filters", "linearRGB"), y.setAttribute("values", linearFilterValue + " 1 0"), this.linearFilter = y, y.setAttribute("result", d + "_tint_1"), t.appendChild(y), y = createNS("feColorMatrix"), y.setAttribute("type", "matrix"), y.setAttribute("color-interpolation-filters", "sRGB"), y.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), y.setAttribute("result", d + "_tint_2"), t.appendChild(y), this.matrixFilter = y;
        var x = this.createMergeNode(d, [v, d + "_tint_1", d + "_tint_2"]);
        t.appendChild(x);
      }
      extendPrototype([SVGComposableEffect], SVGTintFilter), SVGTintFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var n = this.filterManager.effectElements[0].p.v, c = this.filterManager.effectElements[1].p.v, d = this.filterManager.effectElements[2].p.v / 100;
          this.linearFilter.setAttribute("values", linearFilterValue + " " + d + " 0"), this.matrixFilter.setAttribute("values", c[0] - n[0] + " 0 0 0 " + n[0] + " " + (c[1] - n[1]) + " 0 0 0 " + n[1] + " " + (c[2] - n[2]) + " 0 0 0 " + n[2] + " 0 0 0 1 0");
        }
      };
      function SVGFillFilter(t, n, c, d) {
        this.filterManager = n;
        var v = createNS("feColorMatrix");
        v.setAttribute("type", "matrix"), v.setAttribute("color-interpolation-filters", "sRGB"), v.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), v.setAttribute("result", d), t.appendChild(v), this.matrixFilter = v;
      }
      SVGFillFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var n = this.filterManager.effectElements[2].p.v, c = this.filterManager.effectElements[6].p.v;
          this.matrixFilter.setAttribute("values", "0 0 0 0 " + n[0] + " 0 0 0 0 " + n[1] + " 0 0 0 0 " + n[2] + " 0 0 0 " + c + " 0");
        }
      };
      function SVGStrokeEffect(t, n, c) {
        this.initialized = !1, this.filterManager = n, this.elem = c, this.paths = [];
      }
      SVGStrokeEffect.prototype.initialize = function() {
        var t = this.elem.layerElement.children || this.elem.layerElement.childNodes, n, c, d, v;
        for (this.filterManager.effectElements[1].p.v === 1 ? (v = this.elem.maskManager.masksProperties.length, d = 0) : (d = this.filterManager.effectElements[0].p.v - 1, v = d + 1), c = createNS("g"), c.setAttribute("fill", "none"), c.setAttribute("stroke-linecap", "round"), c.setAttribute("stroke-dashoffset", 1), d; d < v; d += 1)
          n = createNS("path"), c.appendChild(n), this.paths.push({
            p: n,
            m: d
          });
        if (this.filterManager.effectElements[10].p.v === 3) {
          var y = createNS("mask"), x = createElementID();
          y.setAttribute("id", x), y.setAttribute("mask-type", "alpha"), y.appendChild(c), this.elem.globalData.defs.appendChild(y);
          var w = createNS("g");
          for (w.setAttribute("mask", "url(" + getLocationHref() + "#" + x + ")"); t[0]; )
            w.appendChild(t[0]);
          this.elem.layerElement.appendChild(w), this.masker = y, c.setAttribute("stroke", "#fff");
        } else if (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) {
          if (this.filterManager.effectElements[10].p.v === 2)
            for (t = this.elem.layerElement.children || this.elem.layerElement.childNodes; t.length; )
              this.elem.layerElement.removeChild(t[0]);
          this.elem.layerElement.appendChild(c), this.elem.layerElement.removeAttribute("mask"), c.setAttribute("stroke", "#fff");
        }
        this.initialized = !0, this.pathMasker = c;
      }, SVGStrokeEffect.prototype.renderFrame = function(t) {
        this.initialized || this.initialize();
        var n, c = this.paths.length, d, v;
        for (n = 0; n < c; n += 1)
          if (this.paths[n].m !== -1 && (d = this.elem.maskManager.viewData[this.paths[n].m], v = this.paths[n].p, (t || this.filterManager._mdf || d.prop._mdf) && v.setAttribute("d", d.lastPath), t || this.filterManager.effectElements[9].p._mdf || this.filterManager.effectElements[4].p._mdf || this.filterManager.effectElements[7].p._mdf || this.filterManager.effectElements[8].p._mdf || d.prop._mdf)) {
            var y;
            if (this.filterManager.effectElements[7].p.v !== 0 || this.filterManager.effectElements[8].p.v !== 100) {
              var x = Math.min(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01, w = Math.max(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v) * 0.01, k = v.getTotalLength();
              y = "0 0 0 " + k * x + " ";
              var C = k * (w - x), P = 1 + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01, F = Math.floor(C / P), S;
              for (S = 0; S < F; S += 1)
                y += "1 " + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01 + " ";
              y += "0 " + k * 10 + " 0 0";
            } else
              y = "1 " + this.filterManager.effectElements[4].p.v * 2 * this.filterManager.effectElements[9].p.v * 0.01;
            v.setAttribute("stroke-dasharray", y);
          }
        if ((t || this.filterManager.effectElements[4].p._mdf) && this.pathMasker.setAttribute("stroke-width", this.filterManager.effectElements[4].p.v * 2), (t || this.filterManager.effectElements[6].p._mdf) && this.pathMasker.setAttribute("opacity", this.filterManager.effectElements[6].p.v), (this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2) && (t || this.filterManager.effectElements[3].p._mdf)) {
          var j = this.filterManager.effectElements[3].p.v;
          this.pathMasker.setAttribute("stroke", "rgb(" + bmFloor(j[0] * 255) + "," + bmFloor(j[1] * 255) + "," + bmFloor(j[2] * 255) + ")");
        }
      };
      function SVGTritoneFilter(t, n, c, d) {
        this.filterManager = n;
        var v = createNS("feColorMatrix");
        v.setAttribute("type", "matrix"), v.setAttribute("color-interpolation-filters", "linearRGB"), v.setAttribute("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"), t.appendChild(v);
        var y = createNS("feComponentTransfer");
        y.setAttribute("color-interpolation-filters", "sRGB"), y.setAttribute("result", d), this.matrixFilter = y;
        var x = createNS("feFuncR");
        x.setAttribute("type", "table"), y.appendChild(x), this.feFuncR = x;
        var w = createNS("feFuncG");
        w.setAttribute("type", "table"), y.appendChild(w), this.feFuncG = w;
        var k = createNS("feFuncB");
        k.setAttribute("type", "table"), y.appendChild(k), this.feFuncB = k, t.appendChild(y);
      }
      SVGTritoneFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var n = this.filterManager.effectElements[0].p.v, c = this.filterManager.effectElements[1].p.v, d = this.filterManager.effectElements[2].p.v, v = d[0] + " " + c[0] + " " + n[0], y = d[1] + " " + c[1] + " " + n[1], x = d[2] + " " + c[2] + " " + n[2];
          this.feFuncR.setAttribute("tableValues", v), this.feFuncG.setAttribute("tableValues", y), this.feFuncB.setAttribute("tableValues", x);
        }
      };
      function SVGProLevelsFilter(t, n, c, d) {
        this.filterManager = n;
        var v = this.filterManager.effectElements, y = createNS("feComponentTransfer");
        (v[10].p.k || v[10].p.v !== 0 || v[11].p.k || v[11].p.v !== 1 || v[12].p.k || v[12].p.v !== 1 || v[13].p.k || v[13].p.v !== 0 || v[14].p.k || v[14].p.v !== 1) && (this.feFuncR = this.createFeFunc("feFuncR", y)), (v[17].p.k || v[17].p.v !== 0 || v[18].p.k || v[18].p.v !== 1 || v[19].p.k || v[19].p.v !== 1 || v[20].p.k || v[20].p.v !== 0 || v[21].p.k || v[21].p.v !== 1) && (this.feFuncG = this.createFeFunc("feFuncG", y)), (v[24].p.k || v[24].p.v !== 0 || v[25].p.k || v[25].p.v !== 1 || v[26].p.k || v[26].p.v !== 1 || v[27].p.k || v[27].p.v !== 0 || v[28].p.k || v[28].p.v !== 1) && (this.feFuncB = this.createFeFunc("feFuncB", y)), (v[31].p.k || v[31].p.v !== 0 || v[32].p.k || v[32].p.v !== 1 || v[33].p.k || v[33].p.v !== 1 || v[34].p.k || v[34].p.v !== 0 || v[35].p.k || v[35].p.v !== 1) && (this.feFuncA = this.createFeFunc("feFuncA", y)), (this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA) && (y.setAttribute("color-interpolation-filters", "sRGB"), t.appendChild(y)), (v[3].p.k || v[3].p.v !== 0 || v[4].p.k || v[4].p.v !== 1 || v[5].p.k || v[5].p.v !== 1 || v[6].p.k || v[6].p.v !== 0 || v[7].p.k || v[7].p.v !== 1) && (y = createNS("feComponentTransfer"), y.setAttribute("color-interpolation-filters", "sRGB"), y.setAttribute("result", d), t.appendChild(y), this.feFuncRComposed = this.createFeFunc("feFuncR", y), this.feFuncGComposed = this.createFeFunc("feFuncG", y), this.feFuncBComposed = this.createFeFunc("feFuncB", y));
      }
      SVGProLevelsFilter.prototype.createFeFunc = function(t, n) {
        var c = createNS(t);
        return c.setAttribute("type", "table"), n.appendChild(c), c;
      }, SVGProLevelsFilter.prototype.getTableValue = function(t, n, c, d, v) {
        for (var y = 0, x = 256, w, k = Math.min(t, n), C = Math.max(t, n), P = Array.call(null, {
          length: x
        }), F, S = 0, j = v - d, T = n - t; y <= 256; )
          w = y / 256, w <= k ? F = T < 0 ? v : d : w >= C ? F = T < 0 ? d : v : F = d + j * Math.pow((w - t) / T, 1 / c), P[S] = F, S += 1, y += 256 / (x - 1);
        return P.join(" ");
      }, SVGProLevelsFilter.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var n, c = this.filterManager.effectElements;
          this.feFuncRComposed && (t || c[3].p._mdf || c[4].p._mdf || c[5].p._mdf || c[6].p._mdf || c[7].p._mdf) && (n = this.getTableValue(c[3].p.v, c[4].p.v, c[5].p.v, c[6].p.v, c[7].p.v), this.feFuncRComposed.setAttribute("tableValues", n), this.feFuncGComposed.setAttribute("tableValues", n), this.feFuncBComposed.setAttribute("tableValues", n)), this.feFuncR && (t || c[10].p._mdf || c[11].p._mdf || c[12].p._mdf || c[13].p._mdf || c[14].p._mdf) && (n = this.getTableValue(c[10].p.v, c[11].p.v, c[12].p.v, c[13].p.v, c[14].p.v), this.feFuncR.setAttribute("tableValues", n)), this.feFuncG && (t || c[17].p._mdf || c[18].p._mdf || c[19].p._mdf || c[20].p._mdf || c[21].p._mdf) && (n = this.getTableValue(c[17].p.v, c[18].p.v, c[19].p.v, c[20].p.v, c[21].p.v), this.feFuncG.setAttribute("tableValues", n)), this.feFuncB && (t || c[24].p._mdf || c[25].p._mdf || c[26].p._mdf || c[27].p._mdf || c[28].p._mdf) && (n = this.getTableValue(c[24].p.v, c[25].p.v, c[26].p.v, c[27].p.v, c[28].p.v), this.feFuncB.setAttribute("tableValues", n)), this.feFuncA && (t || c[31].p._mdf || c[32].p._mdf || c[33].p._mdf || c[34].p._mdf || c[35].p._mdf) && (n = this.getTableValue(c[31].p.v, c[32].p.v, c[33].p.v, c[34].p.v, c[35].p.v), this.feFuncA.setAttribute("tableValues", n));
        }
      };
      function SVGDropShadowEffect(t, n, c, d, v) {
        var y = n.container.globalData.renderConfig.filterSize, x = n.data.fs || y;
        t.setAttribute("x", x.x || y.x), t.setAttribute("y", x.y || y.y), t.setAttribute("width", x.width || y.width), t.setAttribute("height", x.height || y.height), this.filterManager = n;
        var w = createNS("feGaussianBlur");
        w.setAttribute("in", "SourceAlpha"), w.setAttribute("result", d + "_drop_shadow_1"), w.setAttribute("stdDeviation", "0"), this.feGaussianBlur = w, t.appendChild(w);
        var k = createNS("feOffset");
        k.setAttribute("dx", "25"), k.setAttribute("dy", "0"), k.setAttribute("in", d + "_drop_shadow_1"), k.setAttribute("result", d + "_drop_shadow_2"), this.feOffset = k, t.appendChild(k);
        var C = createNS("feFlood");
        C.setAttribute("flood-color", "#00ff00"), C.setAttribute("flood-opacity", "1"), C.setAttribute("result", d + "_drop_shadow_3"), this.feFlood = C, t.appendChild(C);
        var P = createNS("feComposite");
        P.setAttribute("in", d + "_drop_shadow_3"), P.setAttribute("in2", d + "_drop_shadow_2"), P.setAttribute("operator", "in"), P.setAttribute("result", d + "_drop_shadow_4"), t.appendChild(P);
        var F = this.createMergeNode(d, [d + "_drop_shadow_4", v]);
        t.appendChild(F);
      }
      extendPrototype([SVGComposableEffect], SVGDropShadowEffect), SVGDropShadowEffect.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          if ((t || this.filterManager.effectElements[4].p._mdf) && this.feGaussianBlur.setAttribute("stdDeviation", this.filterManager.effectElements[4].p.v / 4), t || this.filterManager.effectElements[0].p._mdf) {
            var n = this.filterManager.effectElements[0].p.v;
            this.feFlood.setAttribute("flood-color", rgbToHex(Math.round(n[0] * 255), Math.round(n[1] * 255), Math.round(n[2] * 255)));
          }
          if ((t || this.filterManager.effectElements[1].p._mdf) && this.feFlood.setAttribute("flood-opacity", this.filterManager.effectElements[1].p.v / 255), t || this.filterManager.effectElements[2].p._mdf || this.filterManager.effectElements[3].p._mdf) {
            var c = this.filterManager.effectElements[3].p.v, d = (this.filterManager.effectElements[2].p.v - 90) * degToRads, v = c * Math.cos(d), y = c * Math.sin(d);
            this.feOffset.setAttribute("dx", v), this.feOffset.setAttribute("dy", y);
          }
        }
      };
      var _svgMatteSymbols = [];
      function SVGMatte3Effect(t, n, c) {
        this.initialized = !1, this.filterManager = n, this.filterElem = t, this.elem = c, c.matteElement = createNS("g"), c.matteElement.appendChild(c.layerElement), c.matteElement.appendChild(c.transformedElement), c.baseElement = c.matteElement;
      }
      SVGMatte3Effect.prototype.findSymbol = function(t) {
        for (var n = 0, c = _svgMatteSymbols.length; n < c; ) {
          if (_svgMatteSymbols[n] === t)
            return _svgMatteSymbols[n];
          n += 1;
        }
        return null;
      }, SVGMatte3Effect.prototype.replaceInParent = function(t, n) {
        var c = t.layerElement.parentNode;
        if (c) {
          for (var d = c.children, v = 0, y = d.length; v < y && d[v] !== t.layerElement; )
            v += 1;
          var x;
          v <= y - 2 && (x = d[v + 1]);
          var w = createNS("use");
          w.setAttribute("href", "#" + n), x ? c.insertBefore(w, x) : c.appendChild(w);
        }
      }, SVGMatte3Effect.prototype.setElementAsMask = function(t, n) {
        if (!this.findSymbol(n)) {
          var c = createElementID(), d = createNS("mask");
          d.setAttribute("id", n.layerId), d.setAttribute("mask-type", "alpha"), _svgMatteSymbols.push(n);
          var v = t.globalData.defs;
          v.appendChild(d);
          var y = createNS("symbol");
          y.setAttribute("id", c), this.replaceInParent(n, c), y.appendChild(n.layerElement), v.appendChild(y);
          var x = createNS("use");
          x.setAttribute("href", "#" + c), d.appendChild(x), n.data.hd = !1, n.show();
        }
        t.setMatte(n.layerId);
      }, SVGMatte3Effect.prototype.initialize = function() {
        for (var t = this.filterManager.effectElements[0].p.v, n = this.elem.comp.elements, c = 0, d = n.length; c < d; )
          n[c] && n[c].data.ind === t && this.setElementAsMask(this.elem, n[c]), c += 1;
        this.initialized = !0;
      }, SVGMatte3Effect.prototype.renderFrame = function() {
        this.initialized || this.initialize();
      };
      function SVGGaussianBlurEffect(t, n, c, d) {
        t.setAttribute("x", "-100%"), t.setAttribute("y", "-100%"), t.setAttribute("width", "300%"), t.setAttribute("height", "300%"), this.filterManager = n;
        var v = createNS("feGaussianBlur");
        v.setAttribute("result", d), t.appendChild(v), this.feGaussianBlur = v;
      }
      SVGGaussianBlurEffect.prototype.renderFrame = function(t) {
        if (t || this.filterManager._mdf) {
          var n = 0.3, c = this.filterManager.effectElements[0].p.v * n, d = this.filterManager.effectElements[1].p.v, v = d == 3 ? 0 : c, y = d == 2 ? 0 : c;
          this.feGaussianBlur.setAttribute("stdDeviation", v + " " + y);
          var x = this.filterManager.effectElements[2].p.v == 1 ? "wrap" : "duplicate";
          this.feGaussianBlur.setAttribute("edgeMode", x);
        }
      };
      function TransformEffect() {
      }
      TransformEffect.prototype.init = function(t) {
        this.effectsManager = t, this.type = effectTypes.TRANSFORM_EFFECT, this.matrix = new Matrix(), this.opacity = -1, this._mdf = !1, this._opMdf = !1;
      }, TransformEffect.prototype.renderFrame = function(t) {
        if (this._opMdf = !1, this._mdf = !1, t || this.effectsManager._mdf) {
          var n = this.effectsManager.effectElements, c = n[0].p.v, d = n[1].p.v, v = n[2].p.v === 1, y = n[3].p.v, x = v ? y : n[4].p.v, w = n[5].p.v, k = n[6].p.v, C = n[7].p.v;
          this.matrix.reset(), this.matrix.translate(-c[0], -c[1], c[2]), this.matrix.scale(x * 0.01, y * 0.01, 1), this.matrix.rotate(-C * degToRads), this.matrix.skewFromAxis(-w * degToRads, (k + 90) * degToRads), this.matrix.translate(d[0], d[1], 0), this._mdf = !0, this.opacity !== n[8].p.v && (this.opacity = n[8].p.v, this._opMdf = !0);
        }
      };
      function SVGTransformEffect(t, n) {
        this.init(n);
      }
      extendPrototype([TransformEffect], SVGTransformEffect);
      function CVTransformEffect(t) {
        this.init(t);
      }
      return extendPrototype([TransformEffect], CVTransformEffect), registerRenderer("canvas", CanvasRenderer), registerRenderer("html", HybridRenderer), registerRenderer("svg", SVGRenderer), ShapeModifiers.registerModifier("tm", TrimModifier), ShapeModifiers.registerModifier("pb", PuckerAndBloatModifier), ShapeModifiers.registerModifier("rp", RepeaterModifier), ShapeModifiers.registerModifier("rd", RoundCornersModifier), ShapeModifiers.registerModifier("zz", ZigZagModifier), ShapeModifiers.registerModifier("op", OffsetPathModifier), setExpressionsPlugin(Expressions), setExpressionInterfaces(getInterface), initialize$1(), initialize(), registerEffect$1(20, SVGTintFilter, !0), registerEffect$1(21, SVGFillFilter, !0), registerEffect$1(22, SVGStrokeEffect, !1), registerEffect$1(23, SVGTritoneFilter, !0), registerEffect$1(24, SVGProLevelsFilter, !0), registerEffect$1(25, SVGDropShadowEffect, !0), registerEffect$1(28, SVGMatte3Effect, !1), registerEffect$1(29, SVGGaussianBlurEffect, !0), registerEffect$1(35, SVGTransformEffect, !1), registerEffect(35, CVTransformEffect), lottie;
    }));
  })(lottie$1, lottie$1.exports)), lottie$1.exports;
}
var lottieExports = /* @__PURE__ */ requireLottie();
const s = /* @__PURE__ */ getDefaultExportFromCjs(lottieExports);
function f(t, n) {
  const c = [];
  for (const d of Object.keys(t)) {
    const v = t[d];
    r$1(v) && c.push(...f(v, n));
  }
  return t.x && typeof t.x == "string" && t.x.includes(n) && c.push(t), c;
}
function a$1(t) {
  let n, c, d = [], v = [];
  if (t.icon && (n = e(t.icon)), n) {
    if (v = p(n), d = (n.markers || []).map(((y) => {
      const [x, w] = y.cm.split(":"), k = { time: y.tm, duration: y.dr, name: w || x, default: !(!w || !x.includes("default")) };
      return (k.name === t.state || k.default && f$1(t.state)) && (c = k), k;
    })), d.length) {
      const y = d[0], x = d[d.length - 1];
      n.ip = y.time, n.op = x.time + x.duration + 1;
    }
    t.colors && (function(y, x, w) {
      for (const k of Object.keys(w)) {
        const C = i(w[k]), P = f(y, `effect('${k}')('Color')`), F = g(C);
        for (const S of P) S.k = [...F, 1];
        for (const S of x) S.name === k && (m(y, [S], F), S.value = F);
      }
    })(n, v.filter(((y) => y.type === "color")), l(t.colors));
  }
  return { properties: v, iconData: n, states: d, state: c };
}
const r = { renderer: "svg", loop: !1, autoplay: !1, rendererSettings: { preserveAspectRatio: "xMidYMid meet", progressiveLoad: !0, hideOnTransparent: !0 } };
let a;
class h extends i$1.Component {
  constructor(c) {
    super(c);
    Ce(this, "_ref");
    Ce(this, "_states", []);
    Ce(this, "_state");
    Ce(this, "_root");
    Ce(this, "_iconData");
    Ce(this, "_properties", []);
    Ce(this, "_lottie");
    const { iconData: d, states: v, state: y, properties: x } = a$1(c);
    this._iconData = d, this._states = v, this._state = y, this._properties = x, this._ref = i$1.createRef();
  }
  connect() {
    if (!this._iconData) return;
    const c = this._root.lastElementChild, d = this._properties.filter(((y) => y.type === "color"));
    if (d.length) {
      let y = "";
      for (const w of d) {
        const k = w.name, C = h$1(w.value);
        y += `
                    :host(:not(.colorize)) svg path[fill].${k} {
                        fill: var(--lord-icon-${k}, var(--lord-icon-${k}-base, ${C}));
                    }
        
                    :host(:not(.colorize)) svg path[stroke].${k} {
                        stroke: var(--lord-icon-${k}, var(--lord-icon-${k}-base, ${C}));
                    }
                `;
      }
      const x = document.createElement("style");
      x.innerHTML = y, c.appendChild(x);
    }
    const v = {};
    this._state && (v.initialSegment = [this._state.time, this._state.time + this._state.duration + 1]), this._lottie = s.loadAnimation({ container: c, animationData: this._iconData, ...v, ...r }), this._lottie.setDirection(this.props.direction || 1), this._lottie.addEventListener("complete", ((y) => {
      this.onFinish();
    })), this._lottie.isLoaded ? this.onReady() : this._lottie.addEventListener("config_ready", (() => {
      this.onReady();
    }));
  }
  disconnect() {
    this._lottie && (this._lottie.destroy(), this._lottie = void 0);
  }
  componentDidMount() {
    var c;
    if (!this._root) {
      this._root = (c = this._ref) == null ? void 0 : c.current.attachShadow({ mode: "open" }), a || (a = new CSSStyleSheet(), a.replaceSync(`
    :host {
        position: relative;
        display: block;
        transform: translate3d(0px, 0px, 0px);
        width: 100%;
        aspect-ratio: 1/1;
        overflow: hidden;
    }

    :host(.colorize) svg path[fill] {
        fill: var(--lord-icon-colorize, currentColor);
    }

    :host(.colorize) svg path[stroke] {
        stroke: var(--lord-icon-colorize, currentColor);
    }

    svg {
        position: absolute;
        pointer-events: none;
        display: block;
        transform: unset!important;
    }

    ::slotted(*) {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    .body.ready ::slotted(*) {
        display: none;
    }
`)), this._root.adoptedStyleSheets = [a];
      const d = document.createElement("div");
      d.classList.add("body"), this._root.appendChild(d);
    }
    this.connect();
  }
  componentWillUnmount() {
    this.disconnect();
  }
  componentDidUpdate(c, d) {
    c.state !== this.props.state && this.onStateChanged(), c.direction !== this.props.direction && this.onDirectionChanged(), c.icon === this.props.icon && c.colors === this.props.colors || this.onIconChanged();
  }
  onFinish() {
    var c, d;
    (d = (c = this.props).onComplete) == null || d.call(c);
  }
  onDirectionChanged() {
    this._lottie.setDirection(this.props.direction);
  }
  onStateChanged() {
    var d;
    const c = this.isPlaying;
    this._state = void 0, f$1(this.props.state) ? this._state = this._states.filter(((v) => v.default))[0] : this.props.state && (this._state = this._states.filter(((v) => v.name === this.props.state))[0]), this._state ? (d = this._lottie) == null || d.setSegment(this._state.time, this._state.time + this._state.duration + 1) : this._lottie.resetSegments(!0), this.goToFirstFrame(), c && (this.pause(), this.play());
  }
  onIconChanged() {
    const { iconData: c, states: d, state: v, properties: y } = a$1(this.props);
    this._iconData = c, this._states = d, this._state = v, this._properties = y, this.disconnect(), this.connect();
  }
  onReady() {
    var c, d;
    (d = (c = this.props).onReady) == null || d.call(c);
  }
  play() {
    this._lottie.play();
  }
  playFromBeginning() {
    if (this._state) {
      const c = [this._state.time, this._state.time + this._state.duration + 1];
      this._lottie.playSegments(c, !0);
    } else this._lottie.goToAndPlay(0);
  }
  pause() {
    this._lottie.pause();
  }
  goToFirstFrame() {
    this.goToFrame(0);
  }
  goToLastFrame() {
    this.goToFrame(Math.max(0, this.frames));
  }
  goToFrame(c) {
    this._lottie.goToAndStop(c, !0);
  }
  refresh() {
    var c;
    (c = this._lottie) == null || c.renderer.renderFrame(null);
  }
  render() {
    const c = this.props.size || 32, d = this.props.colorize || void 0;
    return jsx("div", { ref: this._ref, className: this.props.colorize ? "colorize" : void 0, style: { width: c, height: c, color: d, aspectRatio: 1, flexDirection: "row" } });
  }
  get frames() {
    return this._lottie.getDuration(!0) - 1;
  }
  get isPlaying() {
    return !this._lottie.isPaused;
  }
  get states() {
    return this._states;
  }
  get currentState() {
    return this._state;
  }
}
const jsonCache = /* @__PURE__ */ new Map(), fetchPromises = /* @__PURE__ */ new Map();
function fetchIcon(t, n) {
  const c = `${n}${t}.json`, d = jsonCache.get(c);
  if (d) return Promise.resolve(d);
  const v = fetchPromises.get(c);
  if (v) return v;
  const y = fetch(c).then((x) => {
    if (!x.ok) throw new Error(`Failed: ${c}`);
    return x.json();
  }).then((x) => (jsonCache.set(c, x), fetchPromises.delete(c), x)).catch((x) => {
    throw fetchPromises.delete(c), x;
  });
  return fetchPromises.set(c, y), y;
}
function normalizeStrokes(t, n) {
  const c = (v) => {
    if (!v || typeof v != "object" || v === null) return v;
    const y = { ...v };
    return y.x && delete y.x, typeof y.k == "number" ? (y.k = n, y) : (Array.isArray(y.k) && (y.k = y.k.map((x) => {
      if (x == null || typeof x != "object") return x;
      const w = x, k = w.s;
      return typeof k == "number" ? { ...w, s: n } : Array.isArray(k) ? { ...w, s: k.map(() => n) } : x;
    })), y);
  }, d = (v) => {
    if (v === null || typeof v != "object") return v;
    if (Array.isArray(v)) return v.map(d);
    const y = v;
    if (y.ty === "st" && y.w != null)
      return { ...y, w: c(y.w) };
    const x = {};
    for (const w of Object.keys(y)) x[w] = d(y[w]);
    return x;
  };
  return d(JSON.parse(JSON.stringify(t)));
}
function LottieIcon({
  animation: t,
  icon: n,
  basePath: c = "/lottie/",
  size: d = 48,
  colorize: v,
  colors: y,
  strokeWidth: x,
  state: w,
  direction: k,
  autoplay: C = !0,
  className: P = "",
  style: F = {},
  onReady: S,
  onComplete: j
}) {
  const T = useRef(null), [A, R] = useState(n ?? null), [M, _] = useState(!1);
  useEffect(() => {
    if (n) {
      R(n);
      return;
    }
    if (!t) return;
    let L = !1;
    return fetchIcon(t, c).then((D) => {
      L || R(D);
    }).catch(() => {
      L || _(!0);
    }), () => {
      L = !0;
    };
  }, [t, n, c]), useEffect(() => {
    C && A && T.current && T.current.playFromBeginning();
  }, [A, C]);
  const E = {
    width: d,
    height: d,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...F
  };
  if (M)
    return /* @__PURE__ */ jsx("div", { className: P, style: E, children: /* @__PURE__ */ jsx("span", { style: { fontSize: 10, opacity: 0.4 }, children: "⚠️" }) });
  if (!A)
    return /* @__PURE__ */ jsx("div", { className: P, style: E });
  const I = x ? normalizeStrokes(A, x) : A;
  return /* @__PURE__ */ jsx("div", { className: P, style: E, children: /* @__PURE__ */ jsx(
    h,
    {
      ref: T,
      icon: I,
      size: d,
      colorize: v,
      colors: y,
      state: w,
      direction: k,
      onReady: S,
      onComplete: j
    }
  ) });
}
function preloadAnimation(t, n = "/lottie/") {
  fetchIcon(t, n).catch(() => {
  });
}
const THIN = 3, MEDIUM = 1.8, THICK = 1, ICON_REGISTRY = {
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
  Settings: { animation: "wired-outline-39-cog-hover-mechanic", strokeScale: MEDIUM, flatAnimation: "configuracao_escola_flat" }
}, ROUTE_REGISTRY = {
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
  "/comunicacao": { animation: "wired-outline-411-news-newspaper-hover-pinch", strokeScale: MEDIUM, flatAnimation: "megafone" }
}, FLAT_ANIMATIONS = [
  "pei_flat",
  "paee_flat",
  "hub_flat",
  "Diario_flat",
  "dados_flat",
  "estudantes_flat",
  "usuarios_flat",
  "configuracao_escola_flat",
  "pgi_flat",
  "livros_flat",
  "foguete_flat",
  "agenda_flat",
  "megafone",
  "central_inteligencia_flat",
  "gestão_usuario_flat"
];
function getIconEntry(t) {
  return ICON_REGISTRY[t];
}
function getRouteEntry(t) {
  return ROUTE_REGISTRY[t];
}
export {
  Accordion,
  ActivityRow,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Combobox,
  CommandPalette,
  ConfirmDialog,
  CurriculumCard,
  DatePicker,
  DifficultyDots,
  DonutChart,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  FLAT_ANIMATIONS,
  FilterChip,
  GlassPanel,
  GoalCard,
  ICON_GRAPHITE,
  ICON_PRIMARY_DEFAULT,
  ICON_REGISTRY,
  ICON_SYSTEM_BG,
  ICON_SYSTEM_COLOR,
  Input,
  LegendBar,
  LottieIcon,
  MasteryBar,
  MetricCard,
  Modal,
  ModuleCard,
  NumberedList,
  Pagination,
  PanoramaCard,
  ProfileCard,
  Progress,
  ROUTE_REGISTRY,
  RadioGroup,
  RadioItem,
  RankingCard,
  RecommendationPanel,
  ScoreBar,
  ScrollArea,
  SectionTitle,
  Select,
  Separator,
  Sheet,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarToggle,
  Skeleton,
  SkillBadge,
  Slider,
  StatCard,
  StatusDot,
  Steps,
  StreakCalendar,
  StudyGoalRing,
  SubjectProgressRow,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Tag,
  Textarea,
  ToastContainer,
  Toggle,
  ToolCard,
  Tooltip,
  Upload,
  areaColors,
  badgeVariants,
  brandColors,
  breakpoints,
  buttonVariants,
  cardVariants,
  cn,
  curriculumColors,
  duration,
  easing,
  feedbackColors,
  fontFamily,
  fontSize,
  fontWeight,
  getIconEntry,
  getRouteEntry,
  gradients,
  iconColors,
  iconSize,
  inputVariants,
  letterSpacing,
  lineHeight,
  masteryColors,
  mediaQueries,
  moduleColors,
  moduleIcons,
  motionPresets,
  preloadAnimation,
  radius,
  selectVariants,
  semanticColors,
  shadows,
  shadowsDark,
  spacing,
  spacingAlias,
  statusColors,
  textStyles,
  textareaVariants,
  toast,
  transitions,
  useSidebar,
  zIndex
};
