import { jsxs as d, jsx as t } from "react/jsx-runtime";
import { forwardRef as S, useState as R, useContext as me, createContext as Ie, useRef as H, useEffect as F, useCallback as se, useMemo as Mt, Suspense as Lt, lazy as At } from "react";
const jt = {
  pei: { bg: "#7c3aed", text: "#ffffff", glow: "rgba(139, 92, 246, 0.25)", bgPastel: "#ede5fb", textPastel: "#5b21b6" },
  paee: { bg: "#e11d48", text: "#ffffff", glow: "rgba(244, 63, 94, 0.25)", bgPastel: "#fce4ec", textPastel: "#9f1239" },
  hub: { bg: "#0891b2", text: "#ffffff", glow: "rgba(6, 182, 212, 0.25)", bgPastel: "#e0f5f9", textPastel: "#0e7490" },
  diario: { bg: "#059669", text: "#ffffff", glow: "rgba(16, 185, 129, 0.25)", bgPastel: "#dcfce7", textPastel: "#047857" },
  cursos: { bg: "#d97706", text: "#ffffff", glow: "rgba(245, 158, 11, 0.25)", bgPastel: "#fef3cd", textPastel: "#92400e" },
  ferramentas: { bg: "#2563eb", text: "#ffffff", glow: "rgba(59, 130, 246, 0.25)", bgPastel: "#dbeafe", textPastel: "#1d4ed8" },
  omnisfera: { bg: "#0ea5e9", text: "#ffffff", glow: "rgba(56, 189, 248, 0.25)", bgPastel: "#e0f2fe", textPastel: "#0369a1" },
  gestao: { bg: "#6366f1", text: "#ffffff", glow: "rgba(99, 102, 241, 0.25)", bgPastel: "#e0e1fc", textPastel: "#4338ca" },
  monitoramento: { bg: "#0d9488", text: "#ffffff", glow: "rgba(20, 184, 166, 0.25)", bgPastel: "#ccfbf1", textPastel: "#0f766e" },
  pgi: { bg: "#8b5cf6", text: "#ffffff", glow: "rgba(139, 92, 246, 0.25)", bgPastel: "#ede9fe", textPastel: "#6d28d9" },
  admin: { bg: "#475569", text: "#ffffff", glow: "rgba(71, 85, 105, 0.25)", bgPastel: "#e8eaed", textPastel: "#334155" }
}, bn = {
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
}, z = {
  success: { base: "#10b981", soft: "#ecfdf5", text: "#059669" },
  warning: { base: "#f59e0b", soft: "#fffbeb", text: "#d97706" },
  error: { base: "#ef4444", soft: "#fef2f2", text: "#dc2626" },
  info: { base: "#3b82f6", soft: "#eff6ff", text: "#2563eb" },
  neutral: { base: "#94a3b8", soft: "#f1f5f9", text: "#64748b" }
}, V = {
  none: { base: "#94a3b8", bg: "#f1f5f9" },
  beginner: { base: "#f59e0b", bg: "#fffbeb" },
  learning: { base: "#3b82f6", bg: "#eff6ff" },
  advanced: { base: "#8b5cf6", bg: "#f5f3ff" },
  mastered: { base: "#10b981", bg: "#ecfdf5" }
}, fn = {
  linguagens: "#8b5cf6",
  matematica: "#3b82f6",
  humanas: "#f59e0b",
  natureza: "#10b981",
  redacao: "#ec4899"
}, zt = {
  primary: "#6366f1",
  primarySoft: "#eef2ff",
  primaryText: "#4f46e5"
}, hn = {
  success: z.success.base,
  warning: z.warning.base,
  error: z.error.base,
  info: z.info.base
}, pn = {
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
}, xn = {
  primary: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
}, Ae = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800
}, je = {
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
}, ze = {
  tight: 1.15,
  snug: 1.2,
  normal: 1.4,
  relaxed: 1.6
}, pe = {
  tighter: "-0.035em",
  tight: "-0.02em",
  snug: "-0.015em",
  normal: "-0.01em",
  wide: "0.01em"
}, gn = {
  display: {
    fontSize: je["3xl"],
    fontWeight: Ae.extrabold,
    letterSpacing: pe.tighter,
    lineHeight: ze.tight
  },
  sectionTitle: {
    fontSize: je.lg,
    fontWeight: Ae.bold,
    letterSpacing: pe.snug,
    lineHeight: ze.snug
  },
  subsection: {
    fontSize: "0.9375rem",
    fontWeight: 650,
    letterSpacing: pe.normal,
    lineHeight: ze.normal
  },
  caption: {
    fontSize: je.xs,
    fontWeight: Ae.medium,
    letterSpacing: pe.wide
  }
}, vn = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
  sm: "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)",
  md: "0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.06)",
  xl: "0 12px 32px rgba(0, 0, 0, 0.1), 0 24px 64px rgba(0, 0, 0, 0.08)",
  innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.2)"
}, yn = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.2)",
  sm: "0 2px 8px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15)",
  md: "0 4px 12px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.35), 0 16px 48px rgba(0, 0, 0, 0.25)",
  xl: "0 12px 32px rgba(0, 0, 0, 0.4), 0 24px 64px rgba(0, 0, 0, 0.3)",
  innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
}, kn = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px"
}, wn = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "500ms cubic-bezier(0.16, 1, 0.3, 1)"
}, _t = "#121331", Nn = "#7c3aed", Cn = "#94a3b8", Sn = "#1e293b", Mn = {
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
function Ln(e, o = _t) {
  return `primary:${o},secondary:${e}`;
}
const An = {
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
}, K = {
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
}, jn = {
  /** Espaçamento interno de componentes compactos (buttons, badges) */
  componentXs: K[1],
  // 4px
  /** Espaçamento interno padrão de componentes */
  componentSm: K[2],
  // 8px
  /** Espaçamento interno de cards e containers */
  componentMd: K[4],
  // 16px
  /** Espaçamento interno de sections */
  componentLg: K[6],
  // 24px
  /** Gap entre itens de lista */
  listGap: K[2],
  // 8px
  /** Gap entre cards em grids */
  gridGap: K[3],
  // 12px
  /** Margem entre seções da página */
  sectionGap: K[8],
  // 32px
  /** Padding de página */
  pagePadding: K[10]
  // 40px
}, zn = {
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
}, ae = {
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
}, _n = {
  xs: `(min-width: ${ae.xs}px)`,
  sm: `(min-width: ${ae.sm}px)`,
  md: `(min-width: ${ae.md}px)`,
  lg: `(min-width: ${ae.lg}px)`,
  xl: `(min-width: ${ae.xl}px)`,
  "2xl": `(min-width: ${ae["2xl"]}px)`,
  /** Preferência do sistema por reduced motion */
  reducedMotion: "(prefers-reduced-motion: reduce)",
  /** Dark mode via sistema */
  darkMode: "(prefers-color-scheme: dark)",
  /** Touch device */
  touch: "(hover: none) and (pointer: coarse)"
}, Z = {
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
}, ee = {
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
}, Dn = {
  /** Hover suave em cards e botões */
  hover: `all ${Z.fast} ${ee.standard}`,
  /** Expansão de accordions, dropdowns */
  expand: `all ${Z.normal} ${ee.spring}`,
  /** Entrada de modais e drawers */
  modalEnter: `all ${Z.slow} ${ee.spring}`,
  /** Saída de modais e drawers */
  modalExit: `all ${Z.normal} ${ee.exit}`,
  /** Fade in/out de toasts */
  fade: `opacity ${Z.normal} ${ee.standard}`,
  /** Slide in de sheets */
  slide: `transform ${Z.slow} ${ee.spring}`,
  /** Scale + fade para popovers */
  pop: `all ${Z.fast} ${ee.spring}`
};
function ot(e) {
  var o, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var a = e.length;
    for (o = 0; o < a; o++) e[o] && (r = ot(e[o])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function nt() {
  for (var e, o, r = 0, n = "", a = arguments.length; r < a; r++) (e = arguments[r]) && (o = ot(e)) && (n && (n += " "), n += o);
  return n;
}
const Ve = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, He = nt, ie = (e, o) => (r) => {
  var n;
  if ((o == null ? void 0 : o.variants) == null) return He(e, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
  const { variants: a, defaultVariants: i } = o, s = Object.keys(a).map((m) => {
    const u = r == null ? void 0 : r[m], f = i == null ? void 0 : i[m];
    if (u === null) return null;
    const h = Ve(u) || Ve(f);
    return a[m][h];
  }), c = r && Object.entries(r).reduce((m, u) => {
    let [f, h] = u;
    return h === void 0 || (m[f] = h), m;
  }, {}), l = o == null || (n = o.compoundVariants) === null || n === void 0 ? void 0 : n.reduce((m, u) => {
    let { class: f, className: h, ...g } = u;
    return Object.entries(g).every((x) => {
      let [p, N] = x;
      return Array.isArray(N) ? N.includes({
        ...i,
        ...c
      }[p]) : {
        ...i,
        ...c
      }[p] === N;
    }) ? [
      ...m,
      f,
      h
    ] : m;
  }, []);
  return He(e, s, l, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, Dt = (e, o) => {
  const r = new Array(e.length + o.length);
  for (let n = 0; n < e.length; n++)
    r[n] = e[n];
  for (let n = 0; n < o.length; n++)
    r[e.length + n] = o[n];
  return r;
}, Pt = (e, o) => ({
  classGroupId: e,
  validator: o
}), at = (e = /* @__PURE__ */ new Map(), o = null, r) => ({
  nextPart: e,
  validators: o,
  classGroupId: r
}), ke = "-", Ye = [], Bt = "arbitrary..", It = (e) => {
  const o = Tt(e), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: n
  } = e;
  return {
    getClassGroupId: (s) => {
      if (s.startsWith("[") && s.endsWith("]"))
        return $t(s);
      const c = s.split(ke), l = c[0] === "" && c.length > 1 ? 1 : 0;
      return st(c, l, o);
    },
    getConflictingClassGroupIds: (s, c) => {
      if (c) {
        const l = n[s], m = r[s];
        return l ? m ? Dt(m, l) : l : m || Ye;
      }
      return r[s] || Ye;
    }
  };
}, st = (e, o, r) => {
  if (e.length - o === 0)
    return r.classGroupId;
  const a = e[o], i = r.nextPart.get(a);
  if (i) {
    const m = st(e, o + 1, i);
    if (m) return m;
  }
  const s = r.validators;
  if (s === null)
    return;
  const c = o === 0 ? e.join(ke) : e.slice(o).join(ke), l = s.length;
  for (let m = 0; m < l; m++) {
    const u = s[m];
    if (u.validator(c))
      return u.classGroupId;
  }
}, $t = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const o = e.slice(1, -1), r = o.indexOf(":"), n = o.slice(0, r);
  return n ? Bt + n : void 0;
})(), Tt = (e) => {
  const {
    theme: o,
    classGroups: r
  } = e;
  return Rt(r, o);
}, Rt = (e, o) => {
  const r = at();
  for (const n in e) {
    const a = e[n];
    $e(a, r, n, o);
  }
  return r;
}, $e = (e, o, r, n) => {
  const a = e.length;
  for (let i = 0; i < a; i++) {
    const s = e[i];
    Et(s, o, r, n);
  }
}, Et = (e, o, r, n) => {
  if (typeof e == "string") {
    Wt(e, o, r);
    return;
  }
  if (typeof e == "function") {
    Ft(e, o, r, n);
    return;
  }
  Ot(e, o, r, n);
}, Wt = (e, o, r) => {
  const n = e === "" ? o : it(o, e);
  n.classGroupId = r;
}, Ft = (e, o, r, n) => {
  if (Gt(e)) {
    $e(e(n), o, r, n);
    return;
  }
  o.validators === null && (o.validators = []), o.validators.push(Pt(r, e));
}, Ot = (e, o, r, n) => {
  const a = Object.entries(e), i = a.length;
  for (let s = 0; s < i; s++) {
    const [c, l] = a[s];
    $e(l, it(o, c), r, n);
  }
}, it = (e, o) => {
  let r = e;
  const n = o.split(ke), a = n.length;
  for (let i = 0; i < a; i++) {
    const s = n[i];
    let c = r.nextPart.get(s);
    c || (c = at(), r.nextPart.set(s, c)), r = c;
  }
  return r;
}, Gt = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Vt = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let o = 0, r = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null);
  const a = (i, s) => {
    r[i] = s, o++, o > e && (o = 0, n = r, r = /* @__PURE__ */ Object.create(null));
  };
  return {
    get(i) {
      let s = r[i];
      if (s !== void 0)
        return s;
      if ((s = n[i]) !== void 0)
        return a(i, s), s;
    },
    set(i, s) {
      i in r ? r[i] = s : a(i, s);
    }
  };
}, Pe = "!", Ue = ":", Ht = [], Ke = (e, o, r, n, a) => ({
  modifiers: e,
  hasImportantModifier: o,
  baseClassName: r,
  maybePostfixModifierPosition: n,
  isExternal: a
}), Yt = (e) => {
  const {
    prefix: o,
    experimentalParseClassName: r
  } = e;
  let n = (a) => {
    const i = [];
    let s = 0, c = 0, l = 0, m;
    const u = a.length;
    for (let p = 0; p < u; p++) {
      const N = a[p];
      if (s === 0 && c === 0) {
        if (N === Ue) {
          i.push(a.slice(l, p)), l = p + 1;
          continue;
        }
        if (N === "/") {
          m = p;
          continue;
        }
      }
      N === "[" ? s++ : N === "]" ? s-- : N === "(" ? c++ : N === ")" && c--;
    }
    const f = i.length === 0 ? a : a.slice(l);
    let h = f, g = !1;
    f.endsWith(Pe) ? (h = f.slice(0, -1), g = !0) : (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      f.startsWith(Pe) && (h = f.slice(1), g = !0)
    );
    const x = m && m > l ? m - l : void 0;
    return Ke(i, g, h, x);
  };
  if (o) {
    const a = o + Ue, i = n;
    n = (s) => s.startsWith(a) ? i(s.slice(a.length)) : Ke(Ht, !1, s, void 0, !0);
  }
  if (r) {
    const a = n;
    n = (i) => r({
      className: i,
      parseClassName: a
    });
  }
  return n;
}, Ut = (e) => {
  const o = /* @__PURE__ */ new Map();
  return e.orderSensitiveModifiers.forEach((r, n) => {
    o.set(r, 1e6 + n);
  }), (r) => {
    const n = [];
    let a = [];
    for (let i = 0; i < r.length; i++) {
      const s = r[i], c = s[0] === "[", l = o.has(s);
      c || l ? (a.length > 0 && (a.sort(), n.push(...a), a = []), n.push(s)) : a.push(s);
    }
    return a.length > 0 && (a.sort(), n.push(...a)), n;
  };
}, Kt = (e) => ({
  cache: Vt(e.cacheSize),
  parseClassName: Yt(e),
  sortModifiers: Ut(e),
  ...It(e)
}), qt = /\s+/, Qt = (e, o) => {
  const {
    parseClassName: r,
    getClassGroupId: n,
    getConflictingClassGroupIds: a,
    sortModifiers: i
  } = o, s = [], c = e.trim().split(qt);
  let l = "";
  for (let m = c.length - 1; m >= 0; m -= 1) {
    const u = c[m], {
      isExternal: f,
      modifiers: h,
      hasImportantModifier: g,
      baseClassName: x,
      maybePostfixModifierPosition: p
    } = r(u);
    if (f) {
      l = u + (l.length > 0 ? " " + l : l);
      continue;
    }
    let N = !!p, _ = n(N ? x.substring(0, p) : x);
    if (!_) {
      if (!N) {
        l = u + (l.length > 0 ? " " + l : l);
        continue;
      }
      if (_ = n(x), !_) {
        l = u + (l.length > 0 ? " " + l : l);
        continue;
      }
      N = !1;
    }
    const v = h.length === 0 ? "" : h.length === 1 ? h[0] : i(h).join(":"), C = g ? v + Pe : v, A = C + _;
    if (s.indexOf(A) > -1)
      continue;
    s.push(A);
    const D = a(_, N);
    for (let M = 0; M < D.length; ++M) {
      const I = D[M];
      s.push(C + I);
    }
    l = u + (l.length > 0 ? " " + l : l);
  }
  return l;
}, Jt = (...e) => {
  let o = 0, r, n, a = "";
  for (; o < e.length; )
    (r = e[o++]) && (n = lt(r)) && (a && (a += " "), a += n);
  return a;
}, lt = (e) => {
  if (typeof e == "string")
    return e;
  let o, r = "";
  for (let n = 0; n < e.length; n++)
    e[n] && (o = lt(e[n])) && (r && (r += " "), r += o);
  return r;
}, Xt = (e, ...o) => {
  let r, n, a, i;
  const s = (l) => {
    const m = o.reduce((u, f) => f(u), e());
    return r = Kt(m), n = r.cache.get, a = r.cache.set, i = c, c(l);
  }, c = (l) => {
    const m = n(l);
    if (m)
      return m;
    const u = Qt(l, r);
    return a(l, u), u;
  };
  return i = s, (...l) => i(Jt(...l));
}, Zt = [], $ = (e) => {
  const o = (r) => r[e] || Zt;
  return o.isThemeGetter = !0, o;
}, dt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, ct = /^\((?:(\w[\w-]*):)?(.+)\)$/i, er = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, tr = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, rr = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, or = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, nr = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ar = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, q = (e) => er.test(e), j = (e) => !!e && !Number.isNaN(Number(e)), Q = (e) => !!e && Number.isInteger(Number(e)), _e = (e) => e.endsWith("%") && j(e.slice(0, -1)), U = (e) => tr.test(e), mt = () => !0, sr = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  rr.test(e) && !or.test(e)
), Te = () => !1, ir = (e) => nr.test(e), lr = (e) => ar.test(e), dr = (e) => !k(e) && !w(e), cr = (e) => J(e, ft, Te), k = (e) => dt.test(e), te = (e) => J(e, ht, sr), qe = (e) => J(e, gr, j), mr = (e) => J(e, xt, mt), ur = (e) => J(e, pt, Te), Qe = (e) => J(e, ut, Te), br = (e) => J(e, bt, lr), xe = (e) => J(e, gt, ir), w = (e) => ct.test(e), ce = (e) => re(e, ht), fr = (e) => re(e, pt), Je = (e) => re(e, ut), hr = (e) => re(e, ft), pr = (e) => re(e, bt), ge = (e) => re(e, gt, !0), xr = (e) => re(e, xt, !0), J = (e, o, r) => {
  const n = dt.exec(e);
  return n ? n[1] ? o(n[1]) : r(n[2]) : !1;
}, re = (e, o, r = !1) => {
  const n = ct.exec(e);
  return n ? n[1] ? o(n[1]) : r : !1;
}, ut = (e) => e === "position" || e === "percentage", bt = (e) => e === "image" || e === "url", ft = (e) => e === "length" || e === "size" || e === "bg-size", ht = (e) => e === "length", gr = (e) => e === "number", pt = (e) => e === "family-name", xt = (e) => e === "number" || e === "weight", gt = (e) => e === "shadow", vr = () => {
  const e = $("color"), o = $("font"), r = $("text"), n = $("font-weight"), a = $("tracking"), i = $("leading"), s = $("breakpoint"), c = $("container"), l = $("spacing"), m = $("radius"), u = $("shadow"), f = $("inset-shadow"), h = $("text-shadow"), g = $("drop-shadow"), x = $("blur"), p = $("perspective"), N = $("aspect"), _ = $("ease"), v = $("animate"), C = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], A = () => [
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
  ], D = () => [...A(), w, k], M = () => ["auto", "hidden", "clip", "visible", "scroll"], I = () => ["auto", "contain", "none"], y = () => [w, k, l], P = () => [q, "full", "auto", ...y()], Y = () => [Q, "none", "subgrid", w, k], le = () => ["auto", {
    span: ["full", Q, w, k]
  }, Q, w, k], oe = () => [Q, "auto", w, k], de = () => ["auto", "min", "max", "fr", w, k], Ne = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], ne = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], O = () => ["auto", ...y()], X = () => [q, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...y()], Ce = () => [q, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...y()], Se = () => [q, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...y()], L = () => [e, w, k], Ee = () => [...A(), Je, Qe, {
    position: [w, k]
  }], We = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], Fe = () => ["auto", "cover", "contain", hr, cr, {
    size: [w, k]
  }], Me = () => [_e, ce, te], E = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    m,
    w,
    k
  ], W = () => ["", j, ce, te], ue = () => ["solid", "dashed", "dotted", "double"], Oe = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], T = () => [j, _e, Je, Qe], Ge = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    x,
    w,
    k
  ], be = () => ["none", j, w, k], fe = () => ["none", j, w, k], Le = () => [j, w, k], he = () => [q, "full", ...y()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [U],
      breakpoint: [U],
      color: [mt],
      container: [U],
      "drop-shadow": [U],
      ease: ["in", "out", "in-out"],
      font: [dr],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [U],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [U],
      shadow: [U],
      spacing: ["px", j],
      text: [U],
      "text-shadow": [U],
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
        aspect: ["auto", "square", q, k, w, N]
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
        columns: [j, k, w, c]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": C()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": C()
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
        object: D()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: M()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": M()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": M()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: I()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": I()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": I()
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
        inset: P()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": P()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": P()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": P(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: P()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": P(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: P()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": P()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": P()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: P()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: P()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: P()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: P()
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
        z: [Q, "auto", w, k]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [q, "full", "auto", c, ...y()]
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
        flex: [j, q, "auto", "initial", "none", k]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", j, w, k]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", j, w, k]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [Q, "first", "last", "none", w, k]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": Y()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: le()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": oe()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": oe()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": Y()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: le()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": oe()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": oe()
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
        "auto-cols": de()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": de()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: y()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": y()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": y()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...Ne(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...ne(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...ne()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...Ne()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...ne(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...ne(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": Ne()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...ne(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...ne()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: y()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: y()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: y()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: y()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: y()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: y()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: y()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: y()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: y()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: y()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: y()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: O()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: O()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: O()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: O()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: O()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: O()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: O()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: O()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: O()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: O()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: O()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": y()
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
        "space-y": y()
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
        size: X()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...Ce()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...Ce()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...Ce()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...Se()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...Se()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...Se()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [c, "screen", ...X()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          c,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...X()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          c,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [s]
          },
          ...X()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...X()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...X()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...X()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", r, ce, te]
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
        font: [n, xr, mr]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", _e, k]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [fr, ur, o]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [k]
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
        tracking: [a, w, k]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [j, "none", w, qe]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          i,
          ...y()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", w, k]
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
        list: ["disc", "decimal", "none", w, k]
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
        placeholder: L()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: L()
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
        decoration: [...ue(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [j, "from-font", "auto", w, te]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: L()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [j, "auto", w, k]
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
        indent: y()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", w, k]
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
        content: ["none", w, k]
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
        bg: Ee()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: We()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: Fe()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, Q, w, k],
          radial: ["", w, k],
          conic: [Q, w, k]
        }, pr, br]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: L()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: Me()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: Me()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: Me()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: L()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: L()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: L()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: E()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": E()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": E()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": E()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": E()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": E()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": E()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": E()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": E()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": E()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": E()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": E()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": E()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": E()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": E()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: W()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": W()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": W()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": W()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": W()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": W()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": W()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": W()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": W()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": W()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": W()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": W()
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
        "divide-y": W()
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
        border: [...ue(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...ue(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: L()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": L()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": L()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": L()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": L()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": L()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": L()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": L()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": L()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": L()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": L()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: L()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...ue(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [j, w, k]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", j, ce, te]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: L()
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
          u,
          ge,
          xe
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: L()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", f, ge, xe]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": L()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: W()
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
        ring: L()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [j, te]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": L()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": W()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": L()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", h, ge, xe]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": L()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [j, w, k]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...Oe(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": Oe()
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
        "mask-linear": [j]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": T()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": T()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": L()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": L()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": T()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": T()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": L()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": L()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": T()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": T()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": L()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": L()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": T()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": T()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": L()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": L()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": T()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": T()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": L()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": L()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": T()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": T()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": L()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": L()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": T()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": T()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": L()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": L()
      }],
      "mask-image-radial": [{
        "mask-radial": [w, k]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": T()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": T()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": L()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": L()
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
        "mask-radial-at": A()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [j]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": T()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": T()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": L()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": L()
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
        mask: Ee()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: We()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: Fe()
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
        mask: ["none", w, k]
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
          w,
          k
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: Ge()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [j, w, k]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [j, w, k]
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
          g,
          ge,
          xe
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": L()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", j, w, k]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [j, w, k]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", j, w, k]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [j, w, k]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", j, w, k]
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
          w,
          k
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": Ge()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [j, w, k]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [j, w, k]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", j, w, k]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [j, w, k]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", j, w, k]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [j, w, k]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [j, w, k]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", j, w, k]
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
        "border-spacing": y()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": y()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": y()
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
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", w, k]
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
        duration: [j, "initial", w, k]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", _, w, k]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [j, w, k]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", v, w, k]
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
        perspective: [p, w, k]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": D()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: be()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": be()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": be()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": be()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: fe()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": fe()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": fe()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": fe()
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
        skew: Le()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": Le()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": Le()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [w, k, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: D()
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
        translate: he()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": he()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": he()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": he()
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
        accent: L()
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
        caret: L()
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", w, k]
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
        "scroll-m": y()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": y()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": y()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": y()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": y()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": y()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": y()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": y()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": y()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": y()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": y()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": y()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": y()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": y()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": y()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": y()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": y()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": y()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": y()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": y()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": y()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": y()
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
        "will-change": ["auto", "scroll", "contents", "transform", w, k]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...L()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [j, ce, te, qe]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...L()]
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
}, yr = /* @__PURE__ */ Xt(vr);
function b(...e) {
  return yr(nt(e));
}
const kr = ie(
  // Base styles Premium
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active-scale touch-manipulation select-none",
  {
    variants: {
      variant: {
        primary: "bg-sky-600 text-white hover:bg-sky-500 shadow-sm hover:shadow-md focus-visible:ring-sky-500 border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
        secondary: "bg-(--omni-surface-1) text-(--omni-text-primary) border border-(--omni-border-strong) hover:bg-(--omni-surface-2) shadow-sm focus-visible:ring-(--omni-border-strong) shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
        ghost: "text-(--omni-text-secondary) hover:bg-(--omni-bg-hover) hover:text-(--omni-text-primary)",
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
), vt = S(
  ({ className: e, variant: o, size: r, moduleColor: n, loading: a, children: i, style: s, disabled: c, ...l }, m) => {
    const u = o === "module" && n ? { backgroundColor: n, ...s } : s;
    return /* @__PURE__ */ d(
      "button",
      {
        ref: m,
        className: b(kr({ variant: o, size: r }), e),
        style: u,
        disabled: c || a,
        ...l,
        children: [
          a && /* @__PURE__ */ d(
            "svg",
            {
              className: "animate-spin -ml-1 h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              children: [
                /* @__PURE__ */ t("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ t("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
              ]
            }
          ),
          i
        ]
      }
    );
  }
);
vt.displayName = "Button";
const wr = ie(
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
function Pn({ className: e, variant: o, size: r, moduleColor: n, dot: a, children: i, style: s, ...c }) {
  const l = o === "module" && n ? { backgroundColor: `${n}20`, color: n, ...s } : s;
  return /* @__PURE__ */ d("span", { className: b(wr({ variant: o, size: r }), e), style: l, ...c, children: [
    a && /* @__PURE__ */ t(
      "span",
      {
        className: "w-1.5 h-1.5 rounded-full shrink-0",
        style: { backgroundColor: "currentColor" }
      }
    ),
    i
  ] });
}
const Xe = {
  blue: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
  green: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  orange: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  default: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" }
};
function Bn({ children: e, color: o = "default", closable: r, onClose: n, icon: a, variant: i = "filled", className: s }) {
  const c = Xe[o] || Xe.default, l = o.startsWith("#");
  return /* @__PURE__ */ d("span", { className: b(
    "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
    l ? "border-current/20" : b(i === "filled" ? c.bg : "bg-transparent", c.text, c.border),
    s
  ), style: l ? { color: o, backgroundColor: `${o}18`, borderColor: `${o}30` } : void 0, children: [
    a,
    e,
    r && /* @__PURE__ */ t("button", { onClick: n, className: "ml-0.5 p-0.5 rounded hover:bg-black/10 transition-colors", "aria-label": "Remover", children: /* @__PURE__ */ d("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ t("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ t("path", { d: "m6 6 12 12" })
    ] }) })
  ] });
}
const Nr = S(
  ({ className: e, orientation: o = "horizontal", decorative: r = !0, ...n }, a) => /* @__PURE__ */ t(
    "div",
    {
      ref: a,
      role: r ? "none" : "separator",
      "aria-orientation": r ? void 0 : o,
      className: b(
        "shrink-0 bg-(--omni-border-default)",
        o === "horizontal" ? "h-px w-full" : "h-full w-px",
        e
      ),
      ...n
    }
  )
);
Nr.displayName = "Separator";
function In({
  variant: e = "text",
  width: o,
  height: r,
  lines: n = 1,
  className: a,
  style: i,
  ...s
}) {
  const c = "relative overflow-hidden bg-(--omni-surface-0) dark:bg-white/5 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[omni-shimmer_2s_infinite_ease-in-out] before:bg-linear-to-r before:from-transparent before:via-black/5 dark:before:via-white/10 before:to-transparent";
  if (e === "circular") {
    const l = o || r || 40;
    return /* @__PURE__ */ t(
      "div",
      {
        className: b(c, "rounded-full", a),
        style: { width: l, height: l, ...i },
        ...s
      }
    );
  }
  return e === "rectangular" ? /* @__PURE__ */ t(
    "div",
    {
      className: b(c, "rounded-xl", a),
      style: { width: o || "100%", height: r || 120, ...i },
      ...s
    }
  ) : n > 1 ? /* @__PURE__ */ t("div", { className: b("flex flex-col gap-2", a), ...s, children: Array.from({ length: n }).map((l, m) => /* @__PURE__ */ t(
    "div",
    {
      className: b(c, "h-4"),
      style: {
        width: m === n - 1 ? "75%" : o || "100%",
        ...i
      }
    },
    m
  )) }) : /* @__PURE__ */ t(
    "div",
    {
      className: b(c, "h-4", a),
      style: { width: o || "100%", height: r, ...i },
      ...s
    }
  );
}
const Cr = ie("transition-all duration-200", {
  variants: {
    variant: {
      default: "bg-(--omni-bg-secondary) rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-(--omni-shadow-sm) hover:shadow-(--omni-shadow-md)",
      premium: "bg-(--omni-bg-secondary) rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-(--omni-shadow-md) hover:shadow-(--omni-shadow-elevated) hover:-translate-y-1 hover:border-(--omni-border-strong)",
      glass: "bg-(--omni-glass-bg-strong) backdrop-blur-[24px] backdrop-saturate-[200%] rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)] hover:shadow-[var(--omni-shadow-elevated),var(--omni-shadow-inner)] hover:-translate-y-1",
      interactive: "bg-(--omni-surface-1) rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)] hover:shadow-[var(--omni-shadow-lg),var(--omni-shadow-inner)] hover:-translate-y-[4px] cursor-pointer",
      flat: "rounded-(--omni-radius-lg) border-none"
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
}), Sr = S(
  ({ className: e, variant: o, padding: r, ...n }, a) => /* @__PURE__ */ t(
    "div",
    {
      ref: a,
      className: b(Cr({ variant: o, padding: r }), e),
      ...n
    }
  )
);
Sr.displayName = "Card";
const Mr = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t("div", { ref: r, className: b("flex flex-col gap-1.5", e), ...o })
);
Mr.displayName = "CardHeader";
const Lr = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "h3",
    {
      ref: r,
      className: b("text-lg font-bold tracking-tight text-(--omni-text-primary)", e),
      ...o
    }
  )
);
Lr.displayName = "CardTitle";
const Ar = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "p",
    {
      ref: r,
      className: b("text-sm text-(--omni-text-muted)", e),
      ...o
    }
  )
);
Ar.displayName = "CardDescription";
const jr = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t("div", { ref: r, className: b("pt-2", e), ...o })
);
jr.displayName = "CardContent";
const zr = {
  light: "bg-(--omni-glass-bg) backdrop-blur-md backdrop-saturate-150 border-(--omni-border-subtle)",
  medium: "bg-(--omni-glass-bg-strong) backdrop-blur-xl backdrop-saturate-[200%] border-(--omni-border-default)",
  strong: "bg-(--omni-glass-bg-strong) backdrop-blur-2xl backdrop-saturate-[200%] border-(--omni-border-strong)"
}, _r = S(
  ({ intensity: e = "medium", className: o, children: r, ...n }, a) => /* @__PURE__ */ t(
    "div",
    {
      ref: a,
      className: b(
        "rounded-2xl border shadow-[var(--omni-shadow-sm),var(--omni-shadow-inner)] transition-all",
        zr[e],
        o
      ),
      ...n,
      children: r
    }
  )
);
_r.displayName = "GlassPanel";
const Dr = S(
  ({ className: e, maxHeight: o, scrollbarVisibility: r = "auto", style: n, children: a, ...i }, s) => /* @__PURE__ */ t(
    "div",
    {
      ref: s,
      className: b(
        "relative overflow-auto",
        // Custom scrollbar styling
        "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-(--omni-scrollbar-thumb) [&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb:hover]:bg-(--omni-scrollbar-thumb-hover)",
        r === "hover" && "[&::-webkit-scrollbar-thumb]:opacity-0 [&:hover::-webkit-scrollbar-thumb]:opacity-100",
        r === "always" && "[&::-webkit-scrollbar-thumb]:opacity-100",
        e
      ),
      style: { maxHeight: o, ...n },
      tabIndex: 0,
      role: "region",
      "aria-label": "Scrollable content",
      ...i,
      children: a
    }
  )
);
Dr.displayName = "ScrollArea";
const yt = Ie({
  collapsed: !1,
  setCollapsed: () => {
  }
}), Re = () => me(yt), Pr = S(
  ({ width: e = "260px", collapsedWidth: o = "64px", collapsed: r, onCollapsedChange: n, children: a, className: i, style: s, ...c }, l) => {
    const [m, u] = R(!1), f = r ?? m, h = (g) => {
      u(g), n == null || n(g);
    };
    return /* @__PURE__ */ t(yt.Provider, { value: { collapsed: f, setCollapsed: h }, children: /* @__PURE__ */ t(
      "nav",
      {
        ref: l,
        role: "navigation",
        "aria-label": "Sidebar navigation",
        className: b(
          "flex flex-col h-full",
          "bg-(--omni-bg-secondary) border-r border-(--omni-border-default)",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "overflow-hidden shrink-0",
          i
        ),
        style: {
          width: f ? o : e,
          ...s
        },
        ...c,
        children: a
      }
    ) });
  }
);
Pr.displayName = "Sidebar";
const Br = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t("div", { ref: r, className: b("px-4 py-4 shrink-0", e), ...o })
);
Br.displayName = "SidebarHeader";
const Ir = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t("div", { ref: r, className: b("flex-1 overflow-auto px-3 py-2", e), ...o })
);
Ir.displayName = "SidebarContent";
const $r = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "div",
    {
      ref: r,
      className: b("px-3 py-3 shrink-0 border-t border-(--omni-border-default)", e),
      ...o
    }
  )
);
$r.displayName = "SidebarFooter";
const Tr = S(
  ({ label: e, children: o, className: r, ...n }, a) => {
    const { collapsed: i } = Re();
    return /* @__PURE__ */ d("div", { ref: a, className: b("mb-2", r), role: "group", "aria-label": e, ...n, children: [
      e && !i && /* @__PURE__ */ t("p", { className: "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-(--omni-text-muted)", children: e }),
      /* @__PURE__ */ t("div", { className: "flex flex-col gap-0.5", children: o })
    ] });
  }
);
Tr.displayName = "SidebarGroup";
const Rr = S(
  ({ icon: e, active: o, badge: r, children: n, className: a, ...i }, s) => {
    const { collapsed: c } = Re();
    return /* @__PURE__ */ d(
      "button",
      {
        ref: s,
        type: "button",
        className: b(
          "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium",
          "transition-colors cursor-pointer outline-none",
          o ? "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" : "text-(--omni-text-secondary) hover:bg-(--omni-bg-hover) hover:text-(--omni-text-primary)",
          c && "justify-center px-0",
          a
        ),
        title: c && typeof n == "string" ? n : void 0,
        ...i,
        children: [
          e && /* @__PURE__ */ t("span", { className: "shrink-0 w-5 h-5 flex items-center justify-center", children: e }),
          !c && /* @__PURE__ */ t("span", { className: "flex-1 text-left truncate", children: n }),
          !c && r && /* @__PURE__ */ t("span", { className: "shrink-0", children: r })
        ]
      }
    );
  }
);
Rr.displayName = "SidebarItem";
function $n({ className: e, ...o }) {
  const { collapsed: r, setCollapsed: n } = Re();
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      onClick: () => n(!r),
      className: b(
        "flex items-center justify-center w-full rounded-xl py-2 text-sm font-medium",
        "text-(--omni-text-muted) hover:bg-(--omni-bg-hover) hover:text-(--omni-text-primary)",
        "transition-colors cursor-pointer",
        e
      ),
      "aria-label": r ? "Expandir sidebar" : "Colapsar sidebar",
      ...o,
      children: [
        /* @__PURE__ */ t(
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
            className: b("transition-transform", r && "rotate-180"),
            children: /* @__PURE__ */ t("path", { d: "M10 4L6 8L10 12" })
          }
        ),
        !r && /* @__PURE__ */ t("span", { className: "ml-2", children: "Colapsar" })
      ]
    }
  );
}
function Tn({ title: e, subtitle: o, icon: r, action: n, className: a }) {
  return /* @__PURE__ */ d("div", { className: b("flex items-center justify-between gap-4 mb-4", a), children: [
    /* @__PURE__ */ d("div", { className: "flex items-center gap-3 min-w-0", children: [
      r && /* @__PURE__ */ t("span", { className: "shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-(--omni-bg-tertiary) text-(--omni-text-secondary)", children: r }),
      /* @__PURE__ */ d("div", { className: "min-w-0", children: [
        /* @__PURE__ */ t("h2", { className: "text-lg font-bold tracking-tight text-(--omni-text-primary) truncate", children: e }),
        o && /* @__PURE__ */ t("p", { className: "text-sm text-(--omni-text-muted) truncate mt-0.5", children: o })
      ] })
    ] }),
    n && /* @__PURE__ */ t("div", { className: "shrink-0", children: n })
  ] });
}
const Er = ie(
  "w-full bg-(--omni-surface-0) text-(--omni-text-primary) border shadow-sm transition-all duration-200 placeholder:text-(--omni-text-muted) focus:outline-none focus:bg-(--omni-surface-1) focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border-(--omni-border-default) focus:border-sky-500 focus:ring-sky-500/20 hover:border-(--omni-border-strong)",
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
), Wr = S(
  ({
    className: e,
    variant: o,
    inputSize: r,
    label: n,
    error: a,
    helperText: i,
    leftIcon: s,
    rightIcon: c,
    id: l,
    ...m
  }, u) => {
    const f = l || (n ? n.toLowerCase().replace(/\s+/g, "-") : void 0);
    return /* @__PURE__ */ d("div", { className: "flex flex-col gap-1.5", children: [
      n && /* @__PURE__ */ t(
        "label",
        {
          htmlFor: f,
          className: "text-sm font-semibold text-(--omni-text-primary)",
          children: n
        }
      ),
      /* @__PURE__ */ d("div", { className: "relative", children: [
        s && /* @__PURE__ */ t("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-(--omni-text-muted)", children: s }),
        /* @__PURE__ */ t(
          "input",
          {
            ref: u,
            id: f,
            className: b(
              Er({ variant: a ? "error" : o, inputSize: r }),
              s && "pl-10",
              c && "pr-10",
              e
            ),
            ...m
          }
        ),
        c && /* @__PURE__ */ t("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-(--omni-text-muted)", children: c })
      ] }),
      a && /* @__PURE__ */ t("p", { className: "text-xs font-medium text-red-500", children: a }),
      !a && i && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted)", children: i })
    ] });
  }
);
Wr.displayName = "Input";
const Fr = ie(
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
), Or = S(
  ({
    className: e,
    variant: o,
    selectSize: r,
    label: n,
    error: a,
    helperText: i,
    options: s,
    placeholder: c,
    id: l,
    ...m
  }, u) => {
    const f = l || (n ? n.toLowerCase().replace(/\s+/g, "-") : void 0);
    return /* @__PURE__ */ d("div", { className: "flex flex-col gap-1.5", children: [
      n && /* @__PURE__ */ t(
        "label",
        {
          htmlFor: f,
          className: "text-sm font-semibold text-(--omni-text-primary)",
          children: n
        }
      ),
      /* @__PURE__ */ d("div", { className: "relative", children: [
        /* @__PURE__ */ d(
          "select",
          {
            ref: u,
            id: f,
            className: b(
              Fr({ variant: a ? "error" : o, selectSize: r }),
              e
            ),
            ...m,
            children: [
              c && /* @__PURE__ */ t("option", { value: "", disabled: !0, children: c }),
              s.map((g) => /* @__PURE__ */ t("option", { value: g.value, disabled: g.disabled, children: g.label }, g.value))
            ]
          }
        ),
        /* @__PURE__ */ t(
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
            children: /* @__PURE__ */ t("path", { d: "m6 9 6 6 6-6" })
          }
        )
      ] }),
      a && /* @__PURE__ */ t("p", { className: "text-xs font-medium text-red-500", children: a }),
      !a && i && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted)", children: i })
    ] });
  }
);
Or.displayName = "Select";
const Gr = ie(
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
), Vr = S(
  ({ className: e, variant: o, label: r, error: n, helperText: a, minRows: i = 3, id: s, style: c, ...l }, m) => {
    const u = s || (r ? r.toLowerCase().replace(/\s+/g, "-") : void 0);
    return /* @__PURE__ */ d("div", { className: "flex flex-col gap-1.5", children: [
      r && /* @__PURE__ */ t("label", { htmlFor: u, className: "text-sm font-semibold text-(--omni-text-primary)", children: r }),
      /* @__PURE__ */ t(
        "textarea",
        {
          ref: m,
          id: u,
          rows: i,
          className: b(Gr({ variant: n ? "error" : o }), e),
          style: c,
          ...l
        }
      ),
      n && /* @__PURE__ */ t("p", { className: "text-xs font-medium text-red-500", children: n }),
      !n && a && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted)", children: a })
    ] });
  }
);
Vr.displayName = "Textarea";
const Hr = S(({ label: e, description: o, className: r, disabled: n, id: a, ...i }, s) => {
  const c = a || (e ? `cb-${e.toLowerCase().replace(/\s+/g, "-")}` : void 0);
  return /* @__PURE__ */ d("label", { className: b("group flex items-start gap-2.5 cursor-pointer select-none", n && "opacity-50 cursor-not-allowed", r), htmlFor: c, children: [
    /* @__PURE__ */ d("div", { className: "relative shrink-0 mt-0.5", children: [
      /* @__PURE__ */ t("input", { ref: s, id: c, type: "checkbox", disabled: n, className: "peer sr-only", ...i }),
      /* @__PURE__ */ t("div", { className: "w-[18px] h-[18px] rounded-md border-2 border-(--omni-border-strong) bg-(--omni-bg-secondary) transition-all peer-checked:bg-sky-600 peer-checked:border-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/20 peer-focus-visible:ring-offset-1" }),
      /* @__PURE__ */ t("svg", { className: "absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M20 6 9 17l-5-5" }) })
    ] }),
    (e || o) && /* @__PURE__ */ d("div", { children: [
      e && /* @__PURE__ */ t("span", { className: "text-sm font-medium text-(--omni-text-primary)", children: e }),
      o && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) mt-0.5", children: o })
    ] })
  ] });
});
Hr.displayName = "Checkbox";
const kt = Ie({ name: "" });
function Rn({ name: e, value: o, onChange: r, children: n, className: a, label: i, disabled: s }) {
  return /* @__PURE__ */ t(kt.Provider, { value: { name: e, value: o, onChange: r, disabled: s }, children: /* @__PURE__ */ d("fieldset", { className: b("flex flex-col gap-2", a), children: [
    i && /* @__PURE__ */ t("legend", { className: "text-sm font-semibold text-(--omni-text-primary) mb-1", children: i }),
    n
  ] }) });
}
function En({ value: e, label: o, description: r, disabled: n, className: a }) {
  const i = me(kt), s = n || i.disabled, c = i.value === e;
  return /* @__PURE__ */ d("label", { className: b("group flex items-start gap-2.5 cursor-pointer select-none", s && "opacity-50 cursor-not-allowed", a), children: [
    /* @__PURE__ */ d("div", { className: "relative shrink-0 mt-0.5", children: [
      /* @__PURE__ */ t("input", { type: "radio", name: i.name, value: e, checked: c, onChange: () => {
        var l;
        return (l = i.onChange) == null ? void 0 : l.call(i, e);
      }, disabled: s, className: "peer sr-only" }),
      /* @__PURE__ */ t("div", { className: "w-[18px] h-[18px] rounded-full border-2 border-(--omni-border-strong) bg-(--omni-bg-secondary) transition-all peer-checked:border-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/20 peer-focus-visible:ring-offset-1" }),
      /* @__PURE__ */ t("div", { className: "absolute top-[5px] left-[5px] w-2 h-2 rounded-full bg-sky-600 opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100 transition-all" })
    ] }),
    /* @__PURE__ */ d("div", { children: [
      /* @__PURE__ */ t("span", { className: "text-sm font-medium text-(--omni-text-primary)", children: o }),
      r && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) mt-0.5", children: r })
    ] })
  ] });
}
const Yr = { sm: { track: "w-8 h-5", thumb: "w-3.5 h-3.5", translate: "translate-x-3.5" }, md: { track: "w-11 h-6", thumb: "w-4.5 h-4.5", translate: "translate-x-5" }, lg: { track: "w-14 h-7", thumb: "w-5.5 h-5.5", translate: "translate-x-7" } }, Ur = S(({ label: e, size: o = "md", color: r, className: n, disabled: a, checked: i, defaultChecked: s, onChange: c, id: l, ...m }, u) => {
  const f = Yr[o], h = l || (e ? `toggle-${e.toLowerCase().replace(/\s+/g, "-")}` : void 0);
  return /* @__PURE__ */ d("label", { className: b("inline-flex items-center gap-2.5 cursor-pointer select-none", a && "opacity-50 cursor-not-allowed", n), htmlFor: h, children: [
    /* @__PURE__ */ d("div", { className: "relative", children: [
      /* @__PURE__ */ t("input", { ref: u, id: h, type: "checkbox", role: "switch", "aria-checked": i, checked: i, defaultChecked: s, onChange: c, disabled: a, className: "sr-only peer", ...m }),
      /* @__PURE__ */ t("div", { className: b("rounded-full transition-colors duration-200 bg-(--omni-bg-tertiary) border border-(--omni-border-default) peer-checked:border-transparent", f.track), style: i || s ? { backgroundColor: r || "#0ea5e9" } : void 0 }),
      /* @__PURE__ */ t("div", { className: b("absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:" + f.translate, f.thumb) })
    ] }),
    e && /* @__PURE__ */ t("span", { className: "text-sm font-medium text-(--omni-text-primary)", children: e })
  ] });
});
Ur.displayName = "Toggle";
const Kr = S(({ label: e, showValue: o = !0, color: r = "#0ea5e9", className: n, id: a, value: i, ...s }, c) => {
  const l = a || (e ? `slider-${e.toLowerCase().replace(/\s+/g, "-")}` : void 0);
  return /* @__PURE__ */ d("div", { className: b("flex flex-col gap-1.5", n), children: [
    (e || o) && /* @__PURE__ */ d("div", { className: "flex justify-between items-center", children: [
      e && /* @__PURE__ */ t("label", { htmlFor: l, className: "text-sm font-semibold text-(--omni-text-primary)", children: e }),
      o && /* @__PURE__ */ t("span", { className: "text-sm font-mono font-bold", style: { color: r }, children: i ?? s.defaultValue ?? 50 })
    ] }),
    /* @__PURE__ */ t("input", { ref: c, id: l, type: "range", value: i, className: "w-full h-2 rounded-full appearance-none cursor-pointer bg-(--omni-bg-tertiary) accent-sky-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-600 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110", style: { accentColor: r }, ...s })
  ] });
});
Kr.displayName = "Slider";
const qr = S(
  ({ options: e, value: o, onChange: r, placeholder: n = "Buscar...", label: a, freeSolo: i, emptyMessage: s = "Nenhum resultado", className: c, ...l }, m) => {
    const [u, f] = R(!1), [h, g] = R(""), [x, p] = R(0), N = H(null), _ = H(null), v = e.find((M) => M.value === o), C = e.filter(
      (M) => {
        var I;
        return M.label.toLowerCase().includes(h.toLowerCase()) || ((I = M.description) == null ? void 0 : I.toLowerCase().includes(h.toLowerCase()));
      }
    );
    F(() => {
      if (!u) return;
      const M = (I) => {
        N.current && !N.current.contains(I.target) && f(!1);
      };
      return document.addEventListener("mousedown", M), () => document.removeEventListener("mousedown", M);
    }, [u]);
    const A = se(
      (M) => {
        r == null || r(M.value), g(""), f(!1);
      },
      [r]
    ), D = (M) => {
      if (!u && (M.key === "ArrowDown" || M.key === "Enter")) {
        f(!0);
        return;
      }
      if (u)
        switch (M.key) {
          case "ArrowDown":
            M.preventDefault(), p((I) => Math.min(I + 1, C.length - 1));
            break;
          case "ArrowUp":
            M.preventDefault(), p((I) => Math.max(I - 1, 0));
            break;
          case "Enter":
            M.preventDefault(), C[x] && !C[x].disabled && A(C[x]);
            break;
          case "Escape":
            f(!1);
            break;
        }
    };
    return F(() => {
      if (!u || !_.current) return;
      const M = _.current.children[x];
      M == null || M.scrollIntoView({ block: "nearest" });
    }, [x, u]), /* @__PURE__ */ d("div", { ref: N, className: "relative flex flex-col gap-1.5", children: [
      a && /* @__PURE__ */ t("label", { className: "text-sm font-semibold text-(--omni-text-primary)", children: a }),
      /* @__PURE__ */ d("div", { className: "relative", children: [
        /* @__PURE__ */ t(
          "input",
          {
            ref: m,
            type: "text",
            role: "combobox",
            "aria-expanded": u,
            "aria-autocomplete": "list",
            "aria-activedescendant": u && C[x] ? `combo-opt-${C[x].value}` : void 0,
            className: b(
              "w-full h-10 px-3.5 text-sm rounded-xl",
              "bg-(--omni-bg-secondary) text-(--omni-text-primary)",
              "border border-(--omni-border-default)",
              "placeholder:text-(--omni-text-muted)",
              "focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500",
              "transition-all",
              c
            ),
            placeholder: n,
            value: u ? h : (v == null ? void 0 : v.label) || "",
            onChange: (M) => {
              g(M.target.value), p(0), u || f(!0);
            },
            onFocus: () => f(!0),
            onKeyDown: D,
            ...l
          }
        ),
        /* @__PURE__ */ t("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--omni-text-muted)", children: /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M4 6L8 10L12 6" }) }) })
      ] }),
      u && /* @__PURE__ */ t(
        "ul",
        {
          ref: _,
          role: "listbox",
          className: b(
            "absolute top-full left-0 right-0 z-50 mt-1",
            "max-h-60 overflow-auto rounded-xl p-1.5",
            "bg-(--omni-bg-secondary) border border-(--omni-border-default)",
            "shadow-(--omni-shadow-lg)"
          ),
          children: C.length === 0 ? /* @__PURE__ */ t("li", { className: "px-3 py-2 text-sm text-(--omni-text-muted) text-center", children: s }) : C.map((M, I) => /* @__PURE__ */ d(
            "li",
            {
              id: `combo-opt-${M.value}`,
              role: "option",
              "aria-selected": M.value === o,
              "aria-disabled": M.disabled,
              className: b(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer",
                "transition-colors",
                I === x && "bg-(--omni-bg-hover)",
                M.value === o && "font-semibold text-sky-600",
                M.disabled && "opacity-50 cursor-not-allowed"
              ),
              onClick: () => !M.disabled && A(M),
              onMouseEnter: () => p(I),
              children: [
                M.icon && /* @__PURE__ */ t("span", { className: "shrink-0", children: M.icon }),
                /* @__PURE__ */ d("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ t("p", { className: "truncate", children: M.label }),
                  M.description && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) truncate", children: M.description })
                ] }),
                M.value === o && /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "shrink-0 text-sky-600", children: /* @__PURE__ */ t("path", { d: "M3 8L6.5 11.5L13 5" }) })
              ]
            },
            M.value
          ))
        }
      )
    ] });
  }
);
qr.displayName = "Combobox";
const Qr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], Jr = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function Xr(e, o) {
  return new Date(e, o + 1, 0).getDate();
}
function Zr(e, o) {
  return new Date(e, o, 1).getDay();
}
function Ze(e, o) {
  return e.getFullYear() === o.getFullYear() && e.getMonth() === o.getMonth() && e.getDate() === o.getDate();
}
const eo = S(
  ({ value: e, onChange: o, label: r, min: n, max: a, placeholder: i = "Selecione uma data", disabled: s, className: c, ...l }, m) => {
    const [u, f] = R(!1), [h, g] = R(() => (e ?? /* @__PURE__ */ new Date()).getFullYear()), [x, p] = R(() => (e ?? /* @__PURE__ */ new Date()).getMonth()), N = Mt(() => /* @__PURE__ */ new Date(), []), _ = Xr(h, x), v = Zr(h, x), C = [
      ...Array(v).fill(null),
      ...Array.from({ length: _ }, (y, P) => P + 1)
    ], A = (y) => {
      let P = x + y, Y = h;
      P < 0 && (P = 11, Y--), P > 11 && (P = 0, Y++), p(P), g(Y);
    }, D = (y) => {
      const P = new Date(h, x, y);
      return !!(n && P < new Date(n.getFullYear(), n.getMonth(), n.getDate()) || a && P > new Date(a.getFullYear(), a.getMonth(), a.getDate()));
    }, M = (y) => {
      if (D(y)) return;
      const P = new Date(h, x, y);
      o == null || o(P), f(!1);
    }, I = e ? `${String(e.getDate()).padStart(2, "0")}/${String(e.getMonth() + 1).padStart(2, "0")}/${e.getFullYear()}` : "";
    return /* @__PURE__ */ d("div", { ref: m, className: b("relative flex flex-col gap-1.5", c), ...l, children: [
      r && /* @__PURE__ */ t("label", { className: "text-sm font-semibold text-(--omni-text-primary)", children: r }),
      /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          disabled: s,
          onClick: () => f(!u),
          "aria-haspopup": "dialog",
          "aria-expanded": u,
          className: b(
            "flex items-center gap-2 w-full h-10 px-3.5 text-sm rounded-xl text-left",
            "bg-(--omni-bg-secondary) border border-(--omni-border-default)",
            "transition-all cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500",
            s && "opacity-50 cursor-not-allowed",
            !e && "text-(--omni-text-muted)"
          ),
          children: [
            /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className: "shrink-0 text-(--omni-text-muted)", children: [
              /* @__PURE__ */ t("rect", { x: "2", y: "3", width: "12", height: "11", rx: "2" }),
              /* @__PURE__ */ t("path", { d: "M5 1v3M11 1v3M2 7h12" })
            ] }),
            /* @__PURE__ */ t("span", { className: "flex-1 truncate", children: e ? I : i })
          ]
        }
      ),
      u && !s && /* @__PURE__ */ d(
        "div",
        {
          role: "dialog",
          "aria-label": "Calendário",
          className: b(
            "absolute top-full left-0 z-50 mt-1 p-3",
            "bg-(--omni-bg-secondary) border border-(--omni-border-default)",
            "rounded-xl shadow-(--omni-shadow-lg)",
            "min-w-[280px]"
          ),
          children: [
            /* @__PURE__ */ d("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ t("button", { type: "button", onClick: () => A(-1), className: "p-1 rounded-lg hover:bg-(--omni-bg-hover) transition-colors", "aria-label": "Mês anterior", children: /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ t("path", { d: "M10 4L6 8L10 12" }) }) }),
              /* @__PURE__ */ d("span", { className: "text-sm font-bold text-(--omni-text-primary)", children: [
                Jr[x],
                " ",
                h
              ] }),
              /* @__PURE__ */ t("button", { type: "button", onClick: () => A(1), className: "p-1 rounded-lg hover:bg-(--omni-bg-hover) transition-colors", "aria-label": "Próximo mês", children: /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ t("path", { d: "M6 4L10 8L6 12" }) }) })
            ] }),
            /* @__PURE__ */ t("div", { className: "grid grid-cols-7 gap-0.5 mb-1", children: Qr.map((y) => /* @__PURE__ */ t("div", { className: "text-center text-[10px] font-bold uppercase tracking-wider text-(--omni-text-muted) py-1", children: y }, y)) }),
            /* @__PURE__ */ t("div", { className: "grid grid-cols-7 gap-0.5", role: "grid", "aria-label": "Dias do mês", children: C.map((y, P) => {
              if (y === null) return /* @__PURE__ */ t("div", {}, `e-${P}`);
              const Y = new Date(h, x, y), le = e && Ze(Y, e), oe = Ze(Y, N), de = D(y);
              return /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  role: "gridcell",
                  "aria-selected": le || void 0,
                  disabled: de,
                  onClick: () => M(y),
                  className: b(
                    "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium",
                    "transition-colors cursor-pointer",
                    le ? "bg-sky-600 text-white font-bold" : oe ? "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 font-bold" : "text-(--omni-text-primary) hover:bg-(--omni-bg-hover)",
                    de && "opacity-30 cursor-not-allowed"
                  ),
                  children: y
                },
                y
              );
            }) }),
            /* @__PURE__ */ t("div", { className: "mt-2 pt-2 border-t border-(--omni-border-default)", children: /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                onClick: () => {
                  g(N.getFullYear()), p(N.getMonth()), o == null || o(N), f(!1);
                },
                className: "w-full text-center text-xs font-semibold text-sky-600 hover:text-sky-700 py-1 rounded-lg hover:bg-(--omni-bg-hover) transition-colors",
                children: "Hoje"
              }
            ) })
          ]
        }
      )
    ] });
  }
);
eo.displayName = "DatePicker";
function Wn({ accept: e, multiple: o, maxSize: r, onFiles: n, className: a, label: i = "Click or drag file to this area to upload", description: s }) {
  const [c, l] = R(!1), m = H(null), u = (p) => {
    if (!p) return;
    let N = Array.from(p);
    r && (N = N.filter((_) => _.size <= r)), N.length && (n == null || n(N));
  }, f = (p) => {
    p.preventDefault(), p.stopPropagation();
  }, h = (p) => {
    f(p), l(!0);
  }, g = (p) => {
    f(p), l(!1);
  }, x = (p) => {
    f(p), l(!1), u(p.dataTransfer.files);
  };
  return /* @__PURE__ */ d(
    "div",
    {
      className: b(
        "relative flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center",
        c ? "border-sky-500 bg-sky-50 dark:bg-sky-950/20" : "border-(--omni-border-default) hover:border-sky-400 hover:bg-(--omni-bg-tertiary)",
        a
      ),
      onClick: () => {
        var p;
        return (p = m.current) == null ? void 0 : p.click();
      },
      onDragOver: f,
      onDragEnter: h,
      onDragLeave: g,
      onDrop: x,
      children: [
        /* @__PURE__ */ t("input", { ref: m, type: "file", accept: e, multiple: o, onChange: (p) => u(p.target.files), className: "hidden" }),
        /* @__PURE__ */ d("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className: "text-(--omni-text-muted)", children: [
          /* @__PURE__ */ t("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
          /* @__PURE__ */ t("polyline", { points: "17 8 12 3 7 8" }),
          /* @__PURE__ */ t("line", { x1: "12", x2: "12", y1: "3", y2: "15" })
        ] }),
        /* @__PURE__ */ t("p", { className: "text-sm font-semibold text-(--omni-text-secondary)", children: i }),
        s && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted)", children: s })
      ]
    }
  );
}
const to = S(
  ({ label: e, selected: o = !1, onChange: r, color: n, icon: a, removable: i, onRemove: s, disabled: c, className: l, ...m }, u) => /* @__PURE__ */ d(
    "button",
    {
      ref: u,
      type: "button",
      role: "option",
      "aria-selected": o,
      disabled: c,
      onClick: () => {
        c || r == null || r(!o);
      },
      className: b(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold",
        "border transition-all duration-150 cursor-pointer select-none",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        c && "opacity-40 cursor-not-allowed",
        l
      ),
      style: o ? {
        backgroundColor: n || "var(--omni-primary)",
        borderColor: n || "var(--omni-primary)",
        color: "#fff",
        boxShadow: n ? `0 2px 8px ${n}40` : void 0
      } : {
        backgroundColor: "var(--omni-bg-secondary)",
        borderColor: "var(--omni-border-default)",
        color: "var(--omni-text-secondary)"
      },
      ...m,
      children: [
        a && /* @__PURE__ */ t("span", { className: "shrink-0 flex items-center", children: a }),
        e,
        i && /* @__PURE__ */ t(
          "span",
          {
            onClick: (h) => {
              h.stopPropagation(), s == null || s();
            },
            className: b(
              "ml-0.5 p-0.5 rounded-full inline-flex items-center justify-center",
              "hover:bg-white/20 transition-colors cursor-pointer"
            ),
            "aria-label": "Remover",
            children: /* @__PURE__ */ t("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: /* @__PURE__ */ t("path", { d: "M18 6L6 18M6 6l12 12" }) })
          }
        )
      ]
    }
  )
);
to.displayName = "FilterChip";
const ro = {
  info: { bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800", icon: "text-sky-600", title: "text-sky-800 dark:text-sky-200" },
  success: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", icon: "text-emerald-600", title: "text-emerald-800 dark:text-emerald-200" },
  warning: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-600", title: "text-amber-800 dark:text-amber-200" },
  error: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: "text-red-600", title: "text-red-800 dark:text-red-200" }
}, oo = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };
function Fn({ variant: e = "info", title: o, children: r, closable: n, onClose: a, icon: i, className: s }) {
  const c = ro[e];
  return /* @__PURE__ */ d("div", { className: b("flex gap-3 p-4 rounded-xl border", c.bg, c.border, s), role: "alert", children: [
    /* @__PURE__ */ t("span", { className: b("shrink-0 text-lg", c.icon), children: i ?? oo[e] }),
    /* @__PURE__ */ d("div", { className: "flex-1 min-w-0", children: [
      o && /* @__PURE__ */ t("p", { className: b("text-sm font-bold", c.title), children: o }),
      /* @__PURE__ */ t("div", { className: b("text-sm text-(--omni-text-secondary)", o && "mt-1"), children: r })
    ] }),
    n && /* @__PURE__ */ t("button", { onClick: a, className: "shrink-0 p-1 rounded-lg text-(--omni-text-muted) hover:text-(--omni-text-primary) hover:bg-black/5 transition-colors", "aria-label": "Fechar", children: /* @__PURE__ */ d("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ t("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ t("path", { d: "m6 6 12 12" })
    ] }) })
  ] });
}
const no = { sm: "h-1.5", md: "h-2.5", lg: "h-4" }, ao = { sm: 48, md: 72, lg: 96 };
function On({ value: e, max: o = 100, variant: r = "linear", size: n = "md", color: a = "#0ea5e9", showValue: i = !0, label: s, className: c }) {
  const l = Math.min(100, Math.max(0, e / o * 100));
  if (r === "circular") {
    const m = ao[n], u = n === "sm" ? 4 : n === "md" ? 6 : 8, f = (m - u) / 2, h = 2 * Math.PI * f, g = h - l / 100 * h;
    return /* @__PURE__ */ d("div", { className: b("inline-flex flex-col items-center gap-1", c), children: [
      s && /* @__PURE__ */ t("span", { className: "text-xs font-semibold text-(--omni-text-muted)", children: s }),
      /* @__PURE__ */ d("div", { className: "relative", role: "progressbar", "aria-valuenow": Math.round(l), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": s || `Progresso: ${Math.round(l)}%`, style: { width: m, height: m }, children: [
        /* @__PURE__ */ d("svg", { width: m, height: m, className: "-rotate-90", children: [
          /* @__PURE__ */ t("circle", { cx: m / 2, cy: m / 2, r: f, fill: "none", stroke: "var(--omni-bg-tertiary)", strokeWidth: u }),
          /* @__PURE__ */ t("circle", { cx: m / 2, cy: m / 2, r: f, fill: "none", stroke: a, strokeWidth: u, strokeDasharray: h, strokeDashoffset: g, strokeLinecap: "round", className: "transition-all duration-500" })
        ] }),
        i && /* @__PURE__ */ d("span", { className: "absolute inset-0 flex items-center justify-center text-sm font-bold", style: { color: a }, children: [
          Math.round(l),
          "%"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ d("div", { className: b("w-full", c), children: [
    (s || i) && /* @__PURE__ */ d("div", { className: "flex justify-between items-center mb-1.5", children: [
      s && /* @__PURE__ */ t("span", { className: "text-xs font-semibold text-(--omni-text-muted)", children: s }),
      i && /* @__PURE__ */ d("span", { className: "text-xs font-bold", style: { color: a }, children: [
        Math.round(l),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: b("w-full rounded-full bg-(--omni-bg-tertiary) overflow-hidden", no[n]), role: "progressbar", "aria-valuenow": Math.round(l), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": s || `Progresso: ${Math.round(l)}%`, children: /* @__PURE__ */ t("div", { className: "h-full rounded-full transition-all duration-500", style: { width: `${l}%`, backgroundColor: a } }) })
  ] });
}
let ye = [];
function Gn(e) {
  const o = { ...e, id: Math.random().toString(36).slice(2) };
  ye.forEach((r) => r(o));
}
const so = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" }, io = { info: "border-l-sky-500", success: "border-l-emerald-500", warning: "border-l-amber-500", error: "border-l-red-500" };
function Vn({ position: e = "top-right" }) {
  const [o, r] = R([]), n = se((i) => r((s) => s.filter((c) => c.id !== i)), []);
  F(() => {
    const i = (s) => {
      r((c) => [...c, s]), setTimeout(() => n(s.id), s.duration || 4e3);
    };
    return ye.push(i), () => {
      ye = ye.filter((s) => s !== i);
    };
  }, [n]);
  const a = { "top-right": "top-4 right-4", "top-left": "top-4 left-4", "bottom-right": "bottom-4 right-4", "bottom-left": "bottom-4 left-4" }[e];
  return /* @__PURE__ */ t("div", { className: b("fixed z-[9999] flex flex-col gap-2 pointer-events-none", a), "aria-live": "polite", children: o.map((i) => /* @__PURE__ */ t("div", { className: b("pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl bg-(--omni-bg-secondary) border border-(--omni-border-default) border-l-4 shadow-(--omni-shadow-lg) animate-[slide-in_300ms_ease-out]", io[i.variant]), children: /* @__PURE__ */ d("div", { className: "flex gap-2.5", children: [
    /* @__PURE__ */ t("span", { className: "text-base shrink-0", children: so[i.variant] }),
    /* @__PURE__ */ d("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ t("p", { className: "text-sm font-bold text-(--omni-text-primary)", children: i.title }),
      i.description && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) mt-0.5", children: i.description })
    ] }),
    /* @__PURE__ */ t("button", { onClick: () => n(i.id), className: "shrink-0 p-0.5 rounded text-(--omni-text-muted) hover:text-(--omni-text-primary) transition-colors", children: /* @__PURE__ */ d("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ t("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ t("path", { d: "m6 6 12 12" })
    ] }) })
  ] }) }, i.id)) });
}
const lo = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  full: "max-w-[90vw] max-h-[90vh]"
}, wt = S(
  ({ open: e, onClose: o, title: r, size: n = "md", showClose: a = !0, children: i, className: s, ...c }, l) => {
    const m = H(null), u = (f) => {
      m.current = f, typeof l == "function" ? l(f) : l && (l.current = f);
    };
    return F(() => {
      const f = m.current;
      f && (e && !f.open ? f.showModal() : !e && f.open && f.close());
    }, [e]), F(() => {
      const f = m.current;
      if (!f) return;
      const h = () => o();
      return f.addEventListener("close", h), () => f.removeEventListener("close", h);
    }, [o]), /* @__PURE__ */ d(
      "dialog",
      {
        ref: u,
        className: b(
          "p-0 rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary) text-(--omni-text-primary) shadow-[var(--omni-shadow-2xl)]",
          "backdrop:bg-black/50 backdrop:backdrop-blur-md",
          "w-full",
          lo[n],
          "animate-[modal-in_250ms_cubic-bezier(0.16,1,0.3,1)]",
          s
        ),
        ...c,
        children: [
          (r || a) && /* @__PURE__ */ d("div", { className: "flex items-center justify-between px-6 pt-5 pb-1", children: [
            r && /* @__PURE__ */ t("h2", { className: "text-lg font-bold tracking-tight", children: r }),
            a && /* @__PURE__ */ t(
              "button",
              {
                onClick: o,
                className: "ml-auto p-1.5 rounded-lg text-(--omni-text-muted) hover:text-(--omni-text-primary) hover:bg-(--omni-bg-tertiary) transition-colors",
                "aria-label": "Fechar",
                children: /* @__PURE__ */ d("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ t("path", { d: "M18 6 6 18" }),
                  /* @__PURE__ */ t("path", { d: "m6 6 12 12" })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ t("div", { className: "px-6 pb-6 pt-2", children: i })
        ]
      }
    );
  }
);
wt.displayName = "Modal";
const co = { danger: "#ef4444", warning: "#f59e0b", info: "#0ea5e9" }, mo = { danger: "bg-red-100 dark:bg-red-900/30", warning: "bg-amber-100 dark:bg-amber-900/30", info: "bg-sky-100 dark:bg-sky-900/30" }, uo = { danger: "⚠️", warning: "❓", info: "ℹ️" };
function Hn({ open: e, onConfirm: o, onCancel: r, title: n, description: a, icon: i, variant: s = "danger", confirmText: c = "Confirmar", cancelText: l = "Cancelar" }) {
  return /* @__PURE__ */ t(wt, { open: e, onClose: r, size: "sm", showClose: !1, children: /* @__PURE__ */ d("div", { className: "flex flex-col items-center text-center", children: [
    /* @__PURE__ */ t("div", { className: `w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 ${mo[s]}`, children: i ?? uo[s] }),
    /* @__PURE__ */ t("h3", { className: "text-lg font-bold text-(--omni-text-primary)", children: n }),
    a && /* @__PURE__ */ t("p", { className: "text-sm text-(--omni-text-muted) mt-2 max-w-xs", children: a }),
    /* @__PURE__ */ d("div", { className: "flex gap-3 mt-6 w-full", children: [
      /* @__PURE__ */ t("button", { onClick: r, className: "flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-(--omni-border-default) text-(--omni-text-secondary) hover:bg-(--omni-bg-tertiary) transition-colors", children: l }),
      /* @__PURE__ */ t("button", { onClick: o, className: "flex-1 px-4 py-2.5 text-sm font-bold rounded-xl text-white transition-colors hover:opacity-90", style: { backgroundColor: co[s] }, children: c })
    ] })
  ] }) });
}
const bo = (e) => e >= 60 ? z.success.base : e >= 40 ? z.warning.base : z.error.base, fo = {
  green: z.success.base,
  yellow: z.warning.base,
  red: z.error.base
}, Nt = S(
  ({ value: e, marker: o, color: r = "auto", width: n = 120, height: a = 8, showLabel: i, className: s, ...c }, l) => {
    const m = r === "auto" ? bo(e) : fo[r] || r, u = o ?? e;
    return /* @__PURE__ */ d("div", { ref: l, className: b("inline-flex items-center gap-2", s), ...c, children: [
      /* @__PURE__ */ d(
        "div",
        {
          className: "relative rounded-full overflow-hidden",
          style: { width: n, height: a, backgroundColor: `${m}20` },
          children: [
            /* @__PURE__ */ t(
              "div",
              {
                className: "absolute inset-y-0 left-0 rounded-full transition-all duration-300",
                style: { width: `${Math.min(100, Math.max(0, e))}%`, backgroundColor: m }
              }
            ),
            /* @__PURE__ */ t(
              "div",
              {
                className: "absolute top-[-2px] bottom-[-2px] w-[3px] rounded-sm transition-all duration-300",
                style: {
                  left: `${Math.min(100, Math.max(0, u))}%`,
                  backgroundColor: "var(--omni-text-primary, #1e293b)",
                  transform: "translateX(-50%)"
                }
              }
            )
          ]
        }
      ),
      i && /* @__PURE__ */ d("span", { className: "text-sm font-bold tabular-nums", style: { color: m }, children: [
        Math.round(e),
        "%"
      ] })
    ] });
  }
);
Nt.displayName = "ScoreBar";
const Ct = {
  intervir: { label: "Intervir", color: z.error.base, bg: z.error.soft },
  acompanhar: { label: "Acompanhar", color: z.warning.base, bg: z.warning.soft },
  desafiar: { label: "Desafiar", color: z.success.base, bg: z.success.soft }
}, ho = S(
  ({ subject: e, meta: o, status: r, percentage: n, marker: a, expandable: i = !1, expanded: s = !1, onToggle: c, children: l, className: m, ...u }, f) => {
    const h = Ct[r];
    return /* @__PURE__ */ d("div", { ref: f, className: b("border border-(--omni-border-default) rounded-xl overflow-hidden transition-all", m), ...u, children: [
      /* @__PURE__ */ d(
        "div",
        {
          className: b(
            "flex items-center gap-4 px-5 py-4",
            i && "cursor-pointer hover:bg-(--omni-bg-hover)"
          ),
          onClick: i ? c : void 0,
          style: { borderLeft: `3px solid ${h.color}` },
          children: [
            /* @__PURE__ */ d("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ t("span", { className: "text-sm font-bold text-(--omni-text-primary)", children: e }),
              o && /* @__PURE__ */ t("span", { className: "text-xs text-(--omni-text-muted) ml-2", children: o })
            ] }),
            /* @__PURE__ */ t(
              "span",
              {
                className: "px-2.5 py-1 text-[11px] font-bold rounded-md shrink-0",
                style: { backgroundColor: h.bg, color: h.color },
                children: h.label
              }
            ),
            /* @__PURE__ */ t(Nt, { value: n, marker: a, color: h.color, width: 120 }),
            /* @__PURE__ */ d("span", { className: "text-sm font-bold tabular-nums text-(--omni-text-primary) w-10 text-right shrink-0", children: [
              n,
              "%"
            ] }),
            i && /* @__PURE__ */ t(
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
                className: b("shrink-0 transition-transform text-(--omni-text-muted)", s && "rotate-180"),
                children: /* @__PURE__ */ t("path", { d: "m6 9 6 6 6-6" })
              }
            )
          ]
        }
      ),
      i && s && l && /* @__PURE__ */ t("div", { className: "px-5 pb-4 pt-0 border-t border-(--omni-border-default)", children: l })
    ] });
  }
);
ho.displayName = "SubjectProgressRow";
const po = S(
  ({ intervir: e, acompanhar: o, desafiar: r, actionLabel: n, onAction: a, className: i, ...s }, c) => {
    const l = [
      {
        key: "intervir",
        data: e,
        icon: /* @__PURE__ */ d("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#ef4444", strokeWidth: "2", strokeLinecap: "round", children: [
          /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ t("path", { d: "M12 8v4M12 16h.01" })
        ] })
      },
      {
        key: "acompanhar",
        data: o,
        icon: /* @__PURE__ */ t("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#f59e0b", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ t("path", { d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" }) })
      },
      {
        key: "desafiar",
        data: r,
        icon: /* @__PURE__ */ d("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#10b981", strokeWidth: "2", strokeLinecap: "round", children: [
          /* @__PURE__ */ t("path", { d: "M12 15a3 3 0 100-6 3 3 0 000 6z" }),
          /* @__PURE__ */ t("path", { d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" })
        ] })
      }
    ];
    return /* @__PURE__ */ d("div", { ref: c, className: b("rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary) overflow-hidden transition-all duration-200 hover:shadow-(--omni-shadow-elevated) hover:-translate-y-0.5", i), ...s, children: [
      /* @__PURE__ */ t("div", { className: "grid grid-cols-3 divide-x divide-(--omni-border-default)", children: l.map(({ key: m, data: u, icon: f }) => {
        const h = Ct[m];
        return /* @__PURE__ */ d("div", { className: "p-5", children: [
          /* @__PURE__ */ d("div", { className: "flex items-center gap-2 mb-2", children: [
            f,
            /* @__PURE__ */ t("span", { className: "text-sm font-bold", style: { color: h.color }, children: h.label })
          ] }),
          /* @__PURE__ */ d("p", { className: "text-sm font-semibold text-(--omni-text-primary)", children: [
            u.count,
            " disciplina",
            u.count !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) mt-0.5 truncate", children: u.items.join(", ") })
        ] }, m);
      }) }),
      n && /* @__PURE__ */ t("div", { className: "border-t border-(--omni-border-default) px-5 py-3 text-center", children: /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          onClick: a,
          className: "text-sm font-semibold text-(--omni-primary) hover:underline inline-flex items-center gap-1",
          children: [
            n,
            /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ t("path", { d: "M5 12h14M12 5l7 7-7 7" }) })
          ]
        }
      ) })
    ] });
  }
);
po.displayName = "RecommendationPanel";
const xo = S(
  ({ title: e, subtitle: o, position: r, areas: n, footer: a, color: i = "#6366f1", className: s, ...c }, l) => /* @__PURE__ */ d(
    "div",
    {
      ref: l,
      className: b(
        "rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary) p-5 text-center transition-all duration-200 hover:shadow-(--omni-shadow-elevated) hover:-translate-y-0.5",
        s
      ),
      ...c,
      children: [
        /* @__PURE__ */ t("p", { className: "text-sm font-bold text-(--omni-text-primary)", children: e }),
        o && /* @__PURE__ */ d("p", { className: "text-xs text-(--omni-text-muted) mt-0.5 flex items-center justify-center gap-1", children: [
          /* @__PURE__ */ t("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ t("path", { d: "M3 21h18M5 21V7l7-4 7 4v14" }) }),
          o
        ] }),
        /* @__PURE__ */ d("p", { className: "text-4xl font-extrabold mt-3 tracking-tight", style: { color: i }, children: [
          r,
          /* @__PURE__ */ t("span", { className: "text-lg align-super", children: "º" })
        ] }),
        n && n.length > 0 && /* @__PURE__ */ t("div", { className: b(
          "grid gap-3 mt-4",
          (n.length <= 2, "grid-cols-2")
        ), children: n.map((m) => /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ d("p", { className: "text-xl font-extrabold text-(--omni-text-primary)", children: [
            m.position,
            /* @__PURE__ */ t("span", { className: "text-xs align-super", children: "º" })
          ] }),
          /* @__PURE__ */ t("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-(--omni-text-muted)", children: m.label })
        ] }, m.label)) }),
        a && a.length > 0 && /* @__PURE__ */ t("div", { className: "mt-4 pt-3 border-t border-(--omni-border-default) space-y-1", children: a.map((m, u) => /* @__PURE__ */ d("p", { className: "text-xs text-(--omni-text-muted) flex items-center justify-center gap-1.5", children: [
          m.icon,
          m.text
        ] }, u)) })
      ]
    }
  )
);
xo.displayName = "RankingCard";
const go = {
  green: z.success.base,
  red: z.error.base,
  yellow: z.warning.base,
  blue: z.info.base
}, vo = S(
  ({ title: e, lines: o, showInfo: r = !0, className: n, ...a }, i) => /* @__PURE__ */ d(
    "div",
    {
      ref: i,
      className: b(
        "rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary) p-5 transition-all duration-200 hover:shadow-(--omni-shadow-elevated) hover:-translate-y-0.5",
        n
      ),
      ...a,
      children: [
        /* @__PURE__ */ d("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ t("p", { className: "text-sm font-bold text-(--omni-text-primary)", children: e }),
          r && /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "var(--omni-text-muted)", strokeWidth: "2", strokeLinecap: "round", className: "shrink-0", children: [
            /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ t("path", { d: "M12 16v-4M12 8h.01" })
          ] })
        ] }),
        /* @__PURE__ */ t("div", { className: "space-y-4", children: o.map((s, c) => {
          const l = s.total > 0 ? Math.round(s.current / s.total * 100) : 0, m = go[s.color || "green"] || s.color || "#10b981";
          return /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ d("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ t("span", { className: "text-sm font-semibold text-(--omni-text-primary)", children: s.label }),
              /* @__PURE__ */ d("span", { className: "text-sm font-bold tabular-nums text-(--omni-text-primary)", children: [
                s.current,
                /* @__PURE__ */ d("span", { className: "text-(--omni-text-muted) font-normal", children: [
                  "/",
                  s.total
                ] }),
                " ",
                /* @__PURE__ */ d("span", { className: "text-xs text-(--omni-text-muted)", children: [
                  "(",
                  l,
                  "%)"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ t("div", { className: "w-full h-2 rounded-full overflow-hidden", style: { backgroundColor: `${m}20` }, children: /* @__PURE__ */ t(
              "div",
              {
                className: "h-full rounded-full transition-all duration-300",
                style: { width: `${l}%`, backgroundColor: m }
              }
            ) }),
            s.detail && /* @__PURE__ */ t("p", { className: "text-[11px] text-(--omni-text-muted) mt-1", children: s.detail })
          ] }, c);
        }) })
      ]
    }
  )
);
vo.displayName = "PanoramaCard";
const yo = {
  success: { dot: z.success.base, text: z.success.text },
  error: { dot: z.error.base, text: z.error.text },
  warning: { dot: z.warning.base, text: z.warning.text },
  info: { dot: z.info.base, text: z.info.text },
  neutral: { dot: z.neutral.base, text: z.neutral.text }
};
function Yn({ variant: e = "neutral", label: o, size: r = 8, className: n, ...a }) {
  const i = yo[e];
  return /* @__PURE__ */ d("span", { className: b("inline-flex items-center gap-2 text-sm font-semibold", n), style: { color: i.text }, ...a, children: [
    /* @__PURE__ */ t("span", { className: "shrink-0 rounded-full", style: { width: r, height: r, backgroundColor: i.dot } }),
    o
  ] });
}
function Un({ items: e, shape: o = "square", className: r, ...n }) {
  return /* @__PURE__ */ t("div", { className: b("flex flex-wrap items-center gap-4", r), ...n, children: e.map((a) => /* @__PURE__ */ d("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium text-(--omni-text-secondary)", children: [
    /* @__PURE__ */ t(
      "span",
      {
        className: "shrink-0",
        style: {
          width: o === "line" ? 16 : 10,
          height: o === "line" ? 3 : 10,
          backgroundColor: a.color,
          borderRadius: o === "dot" ? "50%" : 2
        }
      }
    ),
    a.label
  ] }, a.label)) });
}
function Kn({ items: e, activeKey: o, defaultActiveKey: r, onChange: n, variant: a = "line", children: i, className: s }) {
  var x;
  const [c, l] = R(r || ((x = e[0]) == null ? void 0 : x.key) || ""), m = o ?? c, u = (p) => {
    l(p), n == null || n(p);
  }, f = "inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer select-none whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed", g = {
    line: { wrapper: "flex border-b border-(--omni-border-default) gap-1", tab: "px-4 py-2.5 text-sm -mb-px", active: "text-sky-600 border-b-2 border-sky-600", inactive: "text-(--omni-text-muted) hover:text-(--omni-text-primary)" },
    card: { wrapper: "flex bg-(--omni-bg-tertiary) p-1 rounded-xl gap-1", tab: "px-4 py-2 text-sm rounded-lg", active: "bg-(--omni-bg-secondary) text-(--omni-text-primary) shadow-(--omni-shadow-sm)", inactive: "text-(--omni-text-muted) hover:text-(--omni-text-primary)" },
    pill: { wrapper: "flex gap-2", tab: "px-4 py-2 text-sm rounded-full", active: "bg-sky-600 text-white shadow-sm", inactive: "bg-(--omni-bg-tertiary) text-(--omni-text-muted) hover:bg-(--omni-bg-hover)" }
  }[a];
  return /* @__PURE__ */ d("div", { className: s, children: [
    /* @__PURE__ */ t("div", { className: g.wrapper, role: "tablist", children: e.map((p) => /* @__PURE__ */ d(
      "button",
      {
        role: "tab",
        "aria-selected": m === p.key,
        disabled: p.disabled,
        className: b(f, g.tab, m === p.key ? g.active : g.inactive),
        onClick: () => !p.disabled && u(p.key),
        children: [
          p.icon,
          p.label
        ]
      },
      p.key
    )) }),
    i && /* @__PURE__ */ t("div", { className: "pt-4", children: i(m) })
  ] });
}
function qn({ items: e, current: o, direction: r = "horizontal", className: n }) {
  return /* @__PURE__ */ t("div", { className: b(r === "horizontal" ? "flex items-start" : "flex flex-col", n), children: e.map((a, i) => {
    const s = i < o ? "finished" : i === o ? "active" : "waiting", c = i === e.length - 1;
    return /* @__PURE__ */ t("div", { className: b("flex", r === "horizontal" ? "flex-1 items-start" : "pb-8 last:pb-0"), children: /* @__PURE__ */ d("div", { className: b("flex", r === "horizontal" ? "flex-col items-center flex-1" : "items-start gap-3"), children: [
      /* @__PURE__ */ d("div", { className: "flex items-center gap-2 w-full", children: [
        r === "vertical" && /* @__PURE__ */ d("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ t("div", { className: b(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0",
            s === "finished" ? "bg-sky-600 border-sky-600 text-white" : s === "active" ? "border-sky-600 text-sky-600 bg-transparent" : "border-(--omni-border-default) text-(--omni-text-muted) bg-transparent"
          ), children: s === "finished" ? /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M20 6 9 17l-5-5" }) }) : i + 1 }),
          !c && /* @__PURE__ */ t("div", { className: b("w-0.5 flex-1 min-h-[24px] mt-1", s === "finished" ? "bg-sky-600" : "bg-(--omni-border-default)") })
        ] }),
        r === "horizontal" && /* @__PURE__ */ d("div", { className: "flex items-center w-full", children: [
          /* @__PURE__ */ t("div", { className: b(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0",
            s === "finished" ? "bg-sky-600 border-sky-600 text-white" : s === "active" ? "border-sky-600 text-sky-600 bg-transparent" : "border-(--omni-border-default) text-(--omni-text-muted) bg-transparent"
          ), children: s === "finished" ? /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M20 6 9 17l-5-5" }) }) : i + 1 }),
          !c && /* @__PURE__ */ t("div", { className: b("flex-1 h-0.5 mx-2", i < o ? "bg-sky-600" : "bg-(--omni-border-default)") })
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: r === "horizontal" ? "mt-2 text-center" : "", children: [
        /* @__PURE__ */ t("p", { className: b("text-sm font-semibold", s === "active" ? "text-(--omni-text-primary)" : s === "finished" ? "text-(--omni-text-secondary)" : "text-(--omni-text-muted)"), children: a.title }),
        a.description && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) mt-0.5", children: a.description })
      ] })
    ] }) }, i);
  }) });
}
function Qn({ current: e, total: o, pageSize: r = 10, onChange: n, className: a }) {
  const i = Math.ceil(o / r);
  if (i <= 1) return null;
  const s = () => {
    const l = [];
    if (i <= 7) {
      for (let m = 1; m <= i; m++) l.push(m);
      return l;
    }
    l.push(1), e > 3 && l.push("...");
    for (let m = Math.max(2, e - 1); m <= Math.min(i - 1, e + 1); m++) l.push(m);
    return e < i - 2 && l.push("..."), l.push(i), l;
  }, c = "min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all";
  return /* @__PURE__ */ d("nav", { className: b("flex items-center gap-1", a), "aria-label": "Paginação", children: [
    /* @__PURE__ */ t("button", { disabled: e <= 1, onClick: () => n(e - 1), className: b(c, "px-2 text-(--omni-text-muted) hover:bg-(--omni-bg-tertiary) disabled:opacity-30"), children: /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "m15 18-6-6 6-6" }) }) }),
    s().map((l, m) => l === "..." ? /* @__PURE__ */ t("span", { className: "px-1 text-(--omni-text-muted)", children: "…" }, `e${m}`) : /* @__PURE__ */ t("button", { onClick: () => n(l), className: b(c, l === e ? "bg-sky-600 text-white shadow-sm" : "text-(--omni-text-secondary) hover:bg-(--omni-bg-tertiary)"), children: l }, l)),
    /* @__PURE__ */ t("button", { disabled: e >= i, onClick: () => n(e + 1), className: b(c, "px-2 text-(--omni-text-muted) hover:bg-(--omni-bg-tertiary) disabled:opacity-30"), children: /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "m9 18 6-6-6-6" }) }) })
  ] });
}
function Jn({ items: e, separator: o, className: r }) {
  const n = o ?? /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-(--omni-text-muted)", children: /* @__PURE__ */ t("path", { d: "m9 18 6-6-6-6" }) });
  return /* @__PURE__ */ t("nav", { className: b("flex items-center gap-1.5 text-sm", r), "aria-label": "Breadcrumb", children: e.map((a, i) => {
    const s = i === e.length - 1;
    return /* @__PURE__ */ d("span", { className: "flex items-center gap-1.5", children: [
      i > 0 && /* @__PURE__ */ t("span", { className: "shrink-0", children: n }),
      a.href && !s ? /* @__PURE__ */ d("a", { href: a.href, className: "flex items-center gap-1 text-(--omni-text-muted) hover:text-(--omni-text-primary) transition-colors", children: [
        a.icon,
        a.label
      ] }) : /* @__PURE__ */ d("span", { className: b("flex items-center gap-1", s ? "font-semibold text-(--omni-text-primary)" : "text-(--omni-text-muted)"), children: [
        a.icon,
        a.label
      ] })
    ] }, i);
  }) });
}
function Xn({ items: e, defaultOpenKeys: o = [], multiple: r = !1, className: n }) {
  const [a, i] = R(new Set(o)), s = (c) => {
    i((l) => {
      const m = new Set(r ? l : []);
      return l.has(c) ? m.delete(c) : m.add(c), m;
    });
  };
  return /* @__PURE__ */ t("div", { className: b("divide-y divide-(--omni-border-default) border border-(--omni-border-default) rounded-xl overflow-hidden", n), children: e.map((c) => {
    const l = a.has(c.key);
    return /* @__PURE__ */ d("div", { children: [
      /* @__PURE__ */ d("button", { onClick: () => s(c.key), className: "flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-(--omni-bg-tertiary) transition-colors", "aria-expanded": l, children: [
        /* @__PURE__ */ d("span", { className: "flex items-center gap-2 text-sm font-semibold text-(--omni-text-primary)", children: [
          c.icon,
          c.title
        ] }),
        /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: b("text-(--omni-text-muted) transition-transform duration-200", l && "rotate-180"), children: /* @__PURE__ */ t("path", { d: "m6 9 6 6 6-6" }) })
      ] }),
      /* @__PURE__ */ t("div", { className: b("overflow-hidden transition-all duration-200", l ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"), children: /* @__PURE__ */ t("div", { className: "px-4 pb-4 text-sm text-(--omni-text-secondary)", children: c.children }) })
    ] }, c.key);
  }) });
}
const ko = S(
  ({ open: e, onClose: o, side: r = "right", size: n, title: a, children: i, className: s, ...c }, l) => {
    const m = H(null), u = l || m, f = n || (r === "left" || r === "right" ? "380px" : "320px");
    F(() => {
      const N = u.current;
      N && (e && !N.open ? N.showModal() : !e && N.open && N.close());
    }, [e, u]);
    const h = se(
      (N) => {
        N.target === N.currentTarget && o();
      },
      [o]
    ), g = se(
      (N) => {
        N.preventDefault(), o();
      },
      [o]
    ), x = {
      right: "ml-auto h-full rounded-l-2xl translate-x-0",
      left: "mr-auto h-full rounded-r-2xl translate-x-0",
      top: "mb-auto w-full rounded-b-2xl translate-y-0",
      bottom: "mt-auto w-full rounded-t-2xl translate-y-0"
    }, p = r === "left" || r === "right" ? { width: f, maxWidth: "90vw" } : { height: f, maxHeight: "90vh" };
    return /* @__PURE__ */ t(
      "dialog",
      {
        ref: u,
        "aria-label": a,
        className: b(
          // Reset dialog defaults
          "fixed inset-0 m-0 p-0 max-w-none max-h-none",
          "bg-transparent border-none outline-none",
          // Backdrop
          "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
          // Animation
          "open:animate-in open:fade-in-0",
          s
        ),
        onClick: h,
        onCancel: g,
        ...c,
        children: /* @__PURE__ */ t(
          "div",
          {
            className: b(
              "bg-(--omni-bg-secondary) shadow-[var(--omni-shadow-2xl)]",
              "flex flex-col overflow-hidden",
              x[r]
            ),
            style: p,
            children: i
          }
        )
      }
    );
  }
);
ko.displayName = "Sheet";
const wo = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "div",
    {
      ref: r,
      className: b(
        "flex items-center justify-between px-6 py-4",
        "border-b border-(--omni-border-default)",
        e
      ),
      ...o
    }
  )
);
wo.displayName = "SheetHeader";
const No = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "h2",
    {
      ref: r,
      className: b("text-lg font-bold tracking-tight text-(--omni-text-primary)", e),
      ...o
    }
  )
);
No.displayName = "SheetTitle";
const Co = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "div",
    {
      ref: r,
      className: b("flex-1 overflow-auto px-6 py-4", e),
      ...o
    }
  )
);
Co.displayName = "SheetBody";
const So = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "div",
    {
      ref: r,
      className: b(
        "flex items-center justify-end gap-3 px-6 py-4",
        "border-t border-(--omni-border-default)",
        e
      ),
      ...o
    }
  )
);
So.displayName = "SheetFooter";
const we = Ie({
  open: !1,
  setOpen: () => {
  },
  triggerRef: { current: null }
});
function Zn({ children: e, open: o, onOpenChange: r }) {
  const [n, a] = R(!1), i = o ?? n, s = se(
    (l) => {
      a(l), r == null || r(l);
    },
    [r]
  ), c = H(null);
  return /* @__PURE__ */ t(we.Provider, { value: { open: i, setOpen: s, triggerRef: c }, children: e });
}
const Mo = S(
  ({ children: e, className: o, onClick: r, ...n }, a) => {
    const { open: i, setOpen: s, triggerRef: c } = me(we);
    return /* @__PURE__ */ t(
      "button",
      {
        ref: (l) => {
          c.current = l, typeof a == "function" ? a(l) : a && (a.current = l);
        },
        type: "button",
        "aria-haspopup": "menu",
        "aria-expanded": i,
        className: b("inline-flex items-center", o),
        onClick: (l) => {
          r == null || r(l), s(!i);
        },
        ...n,
        children: e
      }
    );
  }
);
Mo.displayName = "DropdownMenuTrigger";
const Lo = S(
  ({ children: e, className: o, align: r = "start", side: n = "bottom", ...a }, i) => {
    const { open: s, setOpen: c, triggerRef: l } = me(we), m = H(null);
    return F(() => {
      if (!s) return;
      const u = (f) => {
        const h = f.target;
        m.current && !m.current.contains(h) && l.current && !l.current.contains(h) && c(!1);
      };
      return document.addEventListener("mousedown", u), () => document.removeEventListener("mousedown", u);
    }, [s, c, l]), F(() => {
      if (!s) return;
      const u = (f) => {
        var h;
        f.key === "Escape" && (c(!1), (h = l.current) == null || h.focus());
      };
      return document.addEventListener("keydown", u), () => document.removeEventListener("keydown", u);
    }, [s, c, l]), F(() => {
      if (s && m.current) {
        const u = m.current.querySelector('[role="menuitem"]');
        u == null || u.focus();
      }
    }, [s]), s ? /* @__PURE__ */ t(
      "div",
      {
        ref: (u) => {
          m.current = u, typeof i == "function" ? i(u) : i && (i.current = u);
        },
        role: "menu",
        "aria-orientation": "vertical",
        className: b(
          "absolute z-50 min-w-[180px] overflow-hidden rounded-xl",
          "bg-(--omni-bg-secondary) border border-(--omni-border-default)",
          "shadow-(--omni-shadow-lg) p-1.5",
          "animate-in fade-in-0 zoom-in-95",
          n === "bottom" ? "mt-2" : "mb-2 bottom-full",
          r === "end" ? "right-0" : r === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
          o
        ),
        ...a,
        children: e
      }
    ) : null;
  }
);
Lo.displayName = "DropdownMenuContent";
const Ao = S(
  ({ children: e, className: o, icon: r, shortcut: n, destructive: a, disabled: i, onClick: s, ...c }, l) => {
    const { setOpen: m } = me(we);
    return /* @__PURE__ */ d(
      "button",
      {
        ref: l,
        type: "button",
        role: "menuitem",
        disabled: i,
        className: b(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
          "transition-colors cursor-pointer outline-none",
          "focus:bg-(--omni-bg-hover) hover:bg-(--omni-bg-hover)",
          a ? "text-red-600 focus:text-red-600 dark:text-red-400" : "text-(--omni-text-primary)",
          i && "opacity-50 cursor-not-allowed pointer-events-none",
          o
        ),
        onClick: (u) => {
          s == null || s(u), i || m(!1);
        },
        onKeyDown: (u) => {
          var f, h, g, x;
          if (u.key === "ArrowDown") {
            u.preventDefault();
            const p = ((h = (f = u.currentTarget.nextElementSibling) == null ? void 0 : f.querySelector) == null ? void 0 : h.call(f, "[role='menuitem']")) ?? u.currentTarget.nextElementSibling;
            p == null || p.focus();
          }
          if (u.key === "ArrowUp") {
            u.preventDefault();
            const p = ((x = (g = u.currentTarget.previousElementSibling) == null ? void 0 : g.querySelector) == null ? void 0 : x.call(g, "[role='menuitem']")) ?? u.currentTarget.previousElementSibling;
            p == null || p.focus();
          }
        },
        ...c,
        children: [
          r && /* @__PURE__ */ t("span", { className: "shrink-0 text-(--omni-text-muted)", children: r }),
          /* @__PURE__ */ t("span", { className: "flex-1 text-left", children: e }),
          n && /* @__PURE__ */ t("span", { className: "ml-auto text-xs text-(--omni-text-muted) font-mono", children: n })
        ]
      }
    );
  }
);
Ao.displayName = "DropdownMenuItem";
function ea({ className: e, ...o }) {
  return /* @__PURE__ */ t(
    "div",
    {
      role: "separator",
      className: b("h-px my-1 bg-(--omni-border-default)", e),
      ...o
    }
  );
}
function ta({ className: e, children: o, ...r }) {
  return /* @__PURE__ */ t(
    "div",
    {
      className: b(
        "px-3 py-1.5 text-xs font-semibold text-(--omni-text-muted) uppercase tracking-wider",
        e
      ),
      ...r,
      children: o
    }
  );
}
const jo = S(
  ({ open: e, onClose: o, items: r, placeholder: n = "Buscar comando...", className: a, ...i }, s) => {
    const [c, l] = R(""), [m, u] = R(0), f = H(null), h = H(null), x = r.filter(
      (v) => {
        var C, A;
        return v.label.toLowerCase().includes(c.toLowerCase()) || ((C = v.description) == null ? void 0 : C.toLowerCase().includes(c.toLowerCase())) || ((A = v.group) == null ? void 0 : A.toLowerCase().includes(c.toLowerCase()));
      }
    ).reduce((v, C) => {
      const A = C.group || "Geral";
      return v[A] || (v[A] = []), v[A].push(C), v;
    }, {}), p = Object.values(x).flat();
    F(() => {
      e && (l(""), u(0), setTimeout(() => {
        var v;
        return (v = f.current) == null ? void 0 : v.focus();
      }, 50));
    }, [e]), F(() => {
      if (!e) return;
      const v = (C) => {
        C.key === "Escape" && o();
      };
      return document.addEventListener("keydown", v), () => document.removeEventListener("keydown", v);
    }, [e, o]);
    const N = se(
      (v) => {
        v.disabled || (v.onSelect(), o());
      },
      [o]
    ), _ = (v) => {
      switch (v.key) {
        case "ArrowDown":
          v.preventDefault(), u((C) => Math.min(C + 1, p.length - 1));
          break;
        case "ArrowUp":
          v.preventDefault(), u((C) => Math.max(C - 1, 0));
          break;
        case "Enter":
          v.preventDefault(), p[m] && N(p[m]);
          break;
      }
    };
    return F(() => {
      var C;
      if (!e || !h.current) return;
      (C = h.current.querySelectorAll("[data-command-item]")[m]) == null || C.scrollIntoView({ block: "nearest" });
    }, [m, e]), e ? /* @__PURE__ */ d("div", { className: "fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]", onClick: o, children: [
      /* @__PURE__ */ t("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm" }),
      /* @__PURE__ */ d(
        "div",
        {
          ref: s,
          role: "dialog",
          "aria-label": "Command palette",
          className: b(
            "relative w-full max-w-lg rounded-2xl overflow-hidden",
            "bg-(--omni-bg-secondary) border border-(--omni-border-default)",
            "shadow-[var(--omni-shadow-2xl)]",
            a
          ),
          onClick: (v) => v.stopPropagation(),
          ...i,
          children: [
            /* @__PURE__ */ d("div", { className: "flex items-center gap-3 px-4 border-b border-(--omni-border-default)", children: [
              /* @__PURE__ */ d("svg", { width: "18", height: "18", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", className: "shrink-0 text-(--omni-text-muted)", children: [
                /* @__PURE__ */ t("circle", { cx: "7", cy: "7", r: "5" }),
                /* @__PURE__ */ t("path", { d: "M14 14L10.5 10.5" })
              ] }),
              /* @__PURE__ */ t(
                "input",
                {
                  ref: f,
                  type: "text",
                  value: c,
                  onChange: (v) => {
                    l(v.target.value), u(0);
                  },
                  onKeyDown: _,
                  placeholder: n,
                  className: "flex-1 bg-transparent h-12 text-sm text-(--omni-text-primary) placeholder:text-(--omni-text-muted) outline-none",
                  role: "combobox",
                  "aria-expanded": !0,
                  "aria-autocomplete": "list"
                }
              ),
              /* @__PURE__ */ t("kbd", { className: "hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-(--omni-text-muted) bg-(--omni-bg-tertiary) rounded-md border border-(--omni-border-default)", children: "ESC" })
            ] }),
            /* @__PURE__ */ t("div", { ref: h, className: "max-h-72 overflow-auto p-2", role: "listbox", children: p.length === 0 ? /* @__PURE__ */ t("div", { className: "py-6 text-center text-sm text-(--omni-text-muted)", children: "Nenhum comando encontrado" }) : Object.entries(x).map(([v, C]) => /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ t("div", { className: "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-(--omni-text-muted)", children: v }),
              C.map((A) => {
                const D = p.indexOf(A);
                return /* @__PURE__ */ d(
                  "button",
                  {
                    type: "button",
                    role: "option",
                    "data-command-item": !0,
                    "aria-selected": D === m,
                    disabled: A.disabled,
                    onClick: () => N(A),
                    onMouseEnter: () => u(D),
                    className: b(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm",
                      "transition-colors cursor-pointer outline-none text-left",
                      D === m ? "bg-(--omni-bg-hover)" : "hover:bg-(--omni-bg-hover)",
                      A.disabled && "opacity-40 cursor-not-allowed"
                    ),
                    children: [
                      A.icon && /* @__PURE__ */ t("span", { className: "shrink-0 w-5 h-5 flex items-center justify-center text-(--omni-text-muted)", children: A.icon }),
                      /* @__PURE__ */ d("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ t("p", { className: "font-medium text-(--omni-text-primary) truncate", children: A.label }),
                        A.description && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) truncate", children: A.description })
                      ] }),
                      A.shortcut && /* @__PURE__ */ t("kbd", { className: "flex items-center gap-0.5 text-[10px] font-mono font-semibold text-(--omni-text-muted)", children: A.shortcut })
                    ]
                  },
                  A.id
                );
              })
            ] }, v)) }),
            /* @__PURE__ */ d("div", { className: "flex items-center gap-4 px-4 py-2 border-t border-(--omni-border-default) text-[10px] text-(--omni-text-muted)", children: [
              /* @__PURE__ */ d("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ t("kbd", { className: "font-mono", children: "↑↓" }),
                " Navegar"
              ] }),
              /* @__PURE__ */ d("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ t("kbd", { className: "font-mono", children: "↵" }),
                " Selecionar"
              ] }),
              /* @__PURE__ */ d("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ t("kbd", { className: "font-mono", children: "ESC" }),
                " Fechar"
              ] })
            ] })
          ]
        }
      )
    ] }) : null;
  }
);
jo.displayName = "CommandPalette";
const zo = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2"
};
function ra({ content: e, position: o = "top", children: r, className: n }) {
  return /* @__PURE__ */ d("div", { className: b("relative group inline-flex", n), children: [
    r,
    /* @__PURE__ */ t(
      "span",
      {
        role: "tooltip",
        className: b(
          "absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none",
          "bg-(--omni-text-primary) text-(--omni-text-inverse)",
          "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
          "transition-all duration-150 ease-out",
          "shadow-(--omni-shadow-md)",
          zo[o]
        ),
        children: e
      }
    )
  ] });
}
const Be = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" }, et = ["bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500"];
function _o(e) {
  return e.split(" ").map((o) => o[0]).join("").toUpperCase().slice(0, 2);
}
function Do(e) {
  let o = 0;
  for (const r of e) o = r.charCodeAt(0) + ((o << 5) - o);
  return et[Math.abs(o) % et.length];
}
function oa({ src: e, alt: o, name: r, size: n = "md", className: a }) {
  if (e) return /* @__PURE__ */ t("img", { src: e, alt: o || r || "", className: b("rounded-full object-cover ring-2 ring-(--omni-bg-secondary)", Be[n], a) });
  const i = r ? _o(r) : "?";
  return /* @__PURE__ */ t("div", { className: b("rounded-full flex items-center justify-center font-bold text-white ring-2 ring-(--omni-bg-secondary)", Be[n], r ? Do(r) : "bg-slate-400", a), children: i });
}
function na({ children: e, max: o = 4, size: r = "md", className: n }) {
  const a = Array.isArray(e) ? e : [e], i = a.slice(0, o), s = a.length - o;
  return /* @__PURE__ */ d("div", { className: b("flex -space-x-2", n), children: [
    i,
    s > 0 && /* @__PURE__ */ d("div", { className: b("rounded-full flex items-center justify-center font-bold bg-(--omni-bg-tertiary) text-(--omni-text-muted) ring-2 ring-(--omni-bg-secondary)", Be[r]), children: [
      "+",
      s
    ] })
  ] });
}
const Po = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t("div", { className: "relative w-full overflow-auto rounded-xl border border-(--omni-border-default)", children: /* @__PURE__ */ t(
    "table",
    {
      ref: r,
      className: b("w-full caption-bottom text-sm", e),
      ...o
    }
  ) })
);
Po.displayName = "Table";
const Bo = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "thead",
    {
      ref: r,
      className: b(
        "bg-(--omni-bg-tertiary) [&_tr]:border-b [&_tr]:border-(--omni-border-default)",
        e
      ),
      ...o
    }
  )
);
Bo.displayName = "TableHeader";
const Io = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "tbody",
    {
      ref: r,
      className: b(
        "bg-(--omni-bg-secondary) [&_tr:last-child]:border-0",
        e
      ),
      ...o
    }
  )
);
Io.displayName = "TableBody";
const $o = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "tfoot",
    {
      ref: r,
      className: b(
        "border-t border-(--omni-border-default) bg-(--omni-bg-tertiary) font-medium",
        e
      ),
      ...o
    }
  )
);
$o.displayName = "TableFooter";
const To = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "tr",
    {
      ref: r,
      className: b(
        "border-b border-(--omni-border-default) transition-colors",
        "hover:bg-(--omni-bg-hover)",
        "data-[state=selected]:bg-sky-50 dark:data-[state=selected]:bg-sky-900/10",
        e
      ),
      ...o
    }
  )
);
To.displayName = "TableRow";
const Ro = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "th",
    {
      ref: r,
      className: b(
        "h-11 px-4 text-left align-middle font-semibold",
        "text-(--omni-text-secondary) text-xs uppercase tracking-wider",
        "[&:has([role=checkbox])]:pr-0",
        e
      ),
      ...o
    }
  )
);
Ro.displayName = "TableHead";
const Eo = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "td",
    {
      ref: r,
      className: b(
        "px-4 py-3 align-middle text-(--omni-text-primary)",
        "[&:has([role=checkbox])]:pr-0",
        e
      ),
      ...o
    }
  )
);
Eo.displayName = "TableCell";
const Wo = S(
  ({ className: e, ...o }, r) => /* @__PURE__ */ t(
    "caption",
    {
      ref: r,
      className: b("mt-3 text-sm text-(--omni-text-muted)", e),
      ...o
    }
  )
);
Wo.displayName = "TableCaption";
const Fo = S(
  ({ avatarUrl: e, initials: o, name: r, role: n, status: a, color: i = "#7c3aed", action: s, extra: c, variant: l = "default", className: m, ...u }, f) => {
    const h = l === "compact", g = l === "horizontal", x = h ? "w-10 h-10" : "w-14 h-14";
    return /* @__PURE__ */ d(
      "div",
      {
        ref: f,
        className: b(
          "rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary)",
          "transition-all duration-200 hover:shadow-md",
          g ? "flex items-center gap-4 p-4" : "p-5",
          m
        ),
        ...u,
        children: [
          /* @__PURE__ */ d("div", { className: b(
            "flex items-center gap-3",
            !g && !h && "flex-col text-center"
          ), children: [
            /* @__PURE__ */ d("div", { className: "relative", children: [
              e ? /* @__PURE__ */ t(
                "img",
                {
                  src: e,
                  alt: r,
                  className: b(x, "rounded-full object-cover ring-2 ring-white dark:ring-slate-800")
                }
              ) : /* @__PURE__ */ t(
                "div",
                {
                  className: b(x, "rounded-full flex items-center justify-center font-bold text-white text-sm"),
                  style: { backgroundColor: i },
                  children: o || r.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
                }
              ),
              a && /* @__PURE__ */ t(
                "span",
                {
                  className: b(
                    "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800",
                    a === "online" ? "bg-emerald-500" : a === "away" ? "bg-amber-500" : "bg-slate-400"
                  )
                }
              )
            ] }),
            /* @__PURE__ */ d("div", { className: b(!g && !h && "mt-1"), children: [
              /* @__PURE__ */ t("p", { className: "text-sm font-bold text-(--omni-text-primary) truncate", children: r }),
              n && /* @__PURE__ */ t("p", { className: "text-xs font-medium text-(--omni-text-muted) truncate mt-0.5", children: n })
            ] })
          ] }),
          (s || c) && /* @__PURE__ */ d("div", { className: b("mt-3", g && "ml-auto mt-0"), children: [
            s && /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                onClick: s.onClick,
                className: "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                style: { color: i, backgroundColor: `${i}12` },
                children: s.label
              }
            ),
            c
          ] })
        ]
      }
    );
  }
);
Fo.displayName = "ProfileCard";
function aa({ items: e, color: o = "#059669", startAt: r = 1, variant: n = "default", className: a, ...i }) {
  const s = n === "compact", c = n === "card";
  return /* @__PURE__ */ t("ol", { className: b("flex flex-col", c ? "gap-2" : "gap-0", a), ...i, children: e.map((l, m) => {
    const u = r + m;
    return /* @__PURE__ */ d(
      "li",
      {
        className: b(
          "flex items-center gap-4 group transition-colors",
          c ? "p-3.5 rounded-xl hover:bg-(--omni-bg-hover) border border-transparent hover:border-(--omni-border-default)" : "py-3 border-b border-(--omni-border-default) last:border-b-0"
        ),
        children: [
          /* @__PURE__ */ t(
            "span",
            {
              className: b(
                "shrink-0 font-extrabold tabular-nums leading-none",
                s ? "text-lg w-6" : "text-2xl w-8"
              ),
              style: { color: o },
              children: String(u).padStart(2, "0")
            }
          ),
          /* @__PURE__ */ d("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ t("p", { className: b(
              "font-semibold text-(--omni-text-primary) truncate",
              "text-sm"
            ), children: l.title }),
            l.description && /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) mt-0.5 truncate", children: l.description })
          ] }),
          l.icon && /* @__PURE__ */ t("span", { className: "shrink-0 text-(--omni-text-muted)", children: l.icon })
        ]
      },
      m
    );
  }) });
}
const Oo = S(
  ({ segments: e, size: o = 140, strokeWidth: r = 24, centerLabel: n, showLegend: a = !0, showValues: i = !0, valueFormatter: s, legendPosition: c = "right", className: l, ...m }, u) => {
    const f = e.reduce((v, C) => v + C.value, 0), h = (o - r) / 2, g = 2 * Math.PI * h;
    let x = 0;
    const p = e.map((v) => {
      const C = f > 0 ? v.value / f : 0, A = C * g, D = g - A, M = -(x * g) + g * 0.25;
      return x += C, { ...v, pct: C, dashLength: A, dashGap: D, offset: M };
    }), N = s || ((v) => v.toLocaleString("pt-BR")), _ = c === "bottom";
    return /* @__PURE__ */ d(
      "div",
      {
        ref: u,
        className: b(
          "inline-flex gap-5",
          _ ? "flex-col items-center" : "items-center",
          l
        ),
        ...m,
        children: [
          /* @__PURE__ */ d("div", { className: "relative shrink-0", style: { width: o, height: o }, children: [
            /* @__PURE__ */ d("svg", { width: o, height: o, viewBox: `0 0 ${o} ${o}`, children: [
              /* @__PURE__ */ t(
                "circle",
                {
                  cx: o / 2,
                  cy: o / 2,
                  r: h,
                  fill: "none",
                  stroke: "var(--omni-border-default)",
                  strokeWidth: r,
                  opacity: 0.15
                }
              ),
              p.map((v, C) => /* @__PURE__ */ t(
                "circle",
                {
                  cx: o / 2,
                  cy: o / 2,
                  r: h,
                  fill: "none",
                  stroke: v.color,
                  strokeWidth: r,
                  strokeDasharray: `${v.dashLength} ${v.dashGap}`,
                  strokeDashoffset: v.offset,
                  strokeLinecap: "butt",
                  style: { transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }
                },
                C
              ))
            ] }),
            n && /* @__PURE__ */ t("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ t("span", { className: "text-xl font-extrabold text-(--omni-text-primary)", children: n }) })
          ] }),
          a && /* @__PURE__ */ t("div", { className: b("flex flex-col gap-2", _ && "flex-row flex-wrap justify-center gap-x-5"), children: e.map((v) => (f > 0 && Math.round(v.value / f * 100), /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ t(
              "span",
              {
                className: "w-2.5 h-2.5 rounded-full shrink-0",
                style: { backgroundColor: v.color }
              }
            ),
            /* @__PURE__ */ t("span", { className: "text-xs font-medium text-(--omni-text-secondary)", children: v.label }),
            i && /* @__PURE__ */ t("span", { className: "text-xs font-bold text-(--omni-text-primary) ml-auto tabular-nums", children: N(v.value) })
          ] }, v.label))) })
        ]
      }
    );
  }
);
Oo.displayName = "DonutChart";
const Go = S(
  ({ title: e, subtitle: o, current: r, goal: n, unit: a, color: i = "#10b981", actionLabel: s, onAction: c, targets: l, valueFormatter: m, className: u, ...f }, h) => {
    const g = Math.min(100, r / n * 100), x = 45, p = 2 * Math.PI * x, N = p - g / 100 * p, _ = m || ((v) => v.toLocaleString("pt-BR"));
    return /* @__PURE__ */ d(
      "div",
      {
        ref: h,
        className: b(
          "rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary) p-5 transition-all duration-200 hover:shadow-(--omni-shadow-elevated) hover:-translate-y-0.5",
          u
        ),
        ...f,
        children: [
          /* @__PURE__ */ d("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ t("p", { className: "text-sm font-bold text-(--omni-text-primary)", children: e }),
              o && /* @__PURE__ */ t("p", { className: "text-[11px] text-(--omni-text-muted) mt-0.5", children: o })
            ] }),
            s && /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                onClick: c,
                className: "text-[11px] font-semibold px-3 py-1 rounded-lg border border-(--omni-border-default) text-(--omni-text-secondary) hover:bg-(--omni-bg-hover) transition-colors",
                children: s
              }
            )
          ] }),
          /* @__PURE__ */ d("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ d("div", { className: "relative shrink-0", style: { width: 100, height: 100 }, children: [
              /* @__PURE__ */ d("svg", { width: "100", height: "100", viewBox: "0 0 100 100", className: "transform -rotate-90", children: [
                /* @__PURE__ */ t("circle", { cx: "50", cy: "50", r: x, fill: "none", stroke: "var(--omni-border-default)", strokeWidth: "8", opacity: 0.15 }),
                /* @__PURE__ */ t(
                  "circle",
                  {
                    cx: "50",
                    cy: "50",
                    r: x,
                    fill: "none",
                    stroke: i,
                    strokeWidth: "8",
                    strokeLinecap: "round",
                    strokeDasharray: p,
                    strokeDashoffset: N,
                    style: { transition: "stroke-dashoffset 0.6s ease" }
                  }
                )
              ] }),
              /* @__PURE__ */ t("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ d("span", { className: "text-lg font-extrabold", style: { color: i }, children: [
                Math.round(g),
                "%"
              ] }) })
            ] }),
            /* @__PURE__ */ d("div", { children: [
              /* @__PURE__ */ t("p", { className: "text-2xl font-extrabold tracking-tight text-(--omni-text-primary)", children: _(r) }),
              /* @__PURE__ */ d("p", { className: "text-xs text-(--omni-text-muted)", children: [
                "de ",
                _(n),
                a ? ` ${a}` : ""
              ] })
            ] })
          ] }),
          l && l.length > 0 && /* @__PURE__ */ t("div", { className: "grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-(--omni-border-default)", children: l.map((v) => /* @__PURE__ */ d("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ t(
              "div",
              {
                className: "w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0",
                style: { backgroundColor: `${v.color || i}12`, color: v.color || i },
                children: v.icon
              }
            ),
            /* @__PURE__ */ d("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t("p", { className: "text-[11px] font-bold text-(--omni-text-primary) truncate", children: v.label }),
              v.progress && /* @__PURE__ */ t("p", { className: "text-[10px] text-(--omni-text-muted) truncate", children: v.progress })
            ] })
          ] }, v.label)) })
        ]
      }
    );
  }
);
Go.displayName = "GoalCard";
const Vo = S(
  ({ icon: e, iconColor: o, title: r, subtitle: n, trailing: a, clickable: i = !1, className: s, ...c }, l) => /* @__PURE__ */ d(
    "div",
    {
      ref: l,
      className: b(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
        i && "cursor-pointer hover:bg-(--omni-bg-hover)",
        s
      ),
      ...c,
      children: [
        /* @__PURE__ */ t(
          "div",
          {
            className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm",
            style: {
              backgroundColor: o ? `${o}12` : "var(--omni-bg-hover)",
              color: o || "var(--omni-text-secondary)"
            },
            children: e
          }
        ),
        /* @__PURE__ */ d("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ t("p", { className: "text-sm font-semibold text-(--omni-text-primary) truncate", children: r }),
          n && /* @__PURE__ */ t("p", { className: "text-[11px] text-(--omni-text-muted) truncate", children: n })
        ] }),
        a && /* @__PURE__ */ t("div", { className: "text-sm font-bold text-(--omni-text-primary) shrink-0 text-right tabular-nums", children: a })
      ]
    }
  )
);
Vo.displayName = "ActivityRow";
function sa({
  moduleKey: e,
  icon: o,
  iconElement: r,
  title: n,
  description: a,
  badge: i,
  active: s,
  disabled: c,
  variant: l = "saturated",
  onClick: m,
  className: u
}) {
  const f = jt[e], h = l === "pastel", g = h ? f.bgPastel : f.bg, x = h ? f.textPastel : f.text, p = h ? `${f.bg}20` : "rgba(255,255,255,0.2)", N = h ? f.textPastel : "white";
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      onClick: m,
      disabled: c,
      className: b(
        "group relative flex flex-col items-center justify-center text-center p-5 rounded-2xl",
        "transition-all duration-300 ease-out touch-manipulation active-scale overflow-hidden",
        "min-h-[140px] w-full shadow-(--omni-shadow-elevated) ring-1 ring-white/10 dark:ring-white/5",
        c && "opacity-50 cursor-not-allowed",
        !c && "cursor-pointer hover:scale-[1.03] hover:-translate-y-1 hover:shadow-(--omni-shadow-2xl)",
        s && "ring-2 ring-white/60 shadow-(--omni-shadow-xl) scale-[1.02]",
        u
      ),
      style: {
        backgroundColor: g,
        color: x,
        boxShadow: s ? `0 0 0 1px rgba(255,255,255,0.2) inset, ${f.glow}, var(--omni-shadow-lg)` : h ? "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" : "0 1px 0 0 rgba(255,255,255,0.15) inset, var(--omni-shadow-elevated)",
        ...h ? { border: `1px solid ${f.bg}25` } : {}
      },
      children: [
        /* @__PURE__ */ t("div", { className: "mb-3 flex items-center justify-center", children: r ?? (o && /* @__PURE__ */ t(o, { className: `w-10 h-10 ${h ? "" : "text-white/90"}`, strokeWidth: 1.5, style: h ? { color: f.bg } : void 0 })) }),
        /* @__PURE__ */ t("span", { className: `text-sm font-bold tracking-tight leading-tight ${h ? "" : "text-white"}`, style: h ? { color: x } : void 0, children: n }),
        a && /* @__PURE__ */ t("span", { className: `mt-1 text-[11px] font-medium leading-snug line-clamp-2 ${h ? "opacity-70" : "text-white/70"}`, style: h ? { color: x } : void 0, children: a }),
        i && /* @__PURE__ */ t(
          "span",
          {
            className: "mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm",
            style: { backgroundColor: p, color: N },
            children: i
          }
        ),
        /* @__PURE__ */ t(
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
const Ho = S(
  ({ icon: e, title: o, description: r, aiTag: n, moduleColor: a, onClick: i, className: s, ...c }, l) => /* @__PURE__ */ d(
    "div",
    {
      ref: l,
      onClick: i,
      role: i ? "button" : void 0,
      tabIndex: i ? 0 : void 0,
      onKeyDown: i ? (m) => {
        (m.key === "Enter" || m.key === " ") && (m.preventDefault(), i());
      } : void 0,
      className: b(
        "group relative flex flex-col gap-3 p-5 rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary)",
        "shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)]",
        "hover:shadow-[var(--omni-shadow-elevated),var(--omni-shadow-inner)] hover:-translate-y-1",
        "transition-all duration-200 cursor-pointer active:scale-[0.98] touch-manipulation",
        s
      ),
      ...c,
      children: [
        /* @__PURE__ */ d("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ t(
            "div",
            {
              className: "flex items-center justify-center w-10 h-10 rounded-xl text-white",
              style: { backgroundColor: a || "#0891b2" },
              children: /* @__PURE__ */ t(e, { size: 20 })
            }
          ),
          n && /* @__PURE__ */ t(
            "span",
            {
              className: "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white",
              style: { backgroundColor: a || "#0891b2" },
              children: n
            }
          )
        ] }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ t("h3", { className: "text-sm font-bold text-(--omni-text-primary) group-hover:text-(--omni-text-primary)", children: o }),
          /* @__PURE__ */ t("p", { className: "text-xs text-(--omni-text-muted) mt-1 line-clamp-2", children: r })
        ] })
      ]
    }
  )
);
Ho.displayName = "ToolCard";
const Yo = {
  Matemática: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" }),
    /* @__PURE__ */ t("path", { d: "M17 14v6M14 17h6" })
  ] }),
  Português: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
    /* @__PURE__ */ t("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" }),
    /* @__PURE__ */ t("path", { d: "M8 7h8M8 11h6" })
  ] }),
  Ciências: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M9 3h6M10 3v7.4a2 2 0 0 1-.6 1.4L6.5 15.2A3 3 0 0 0 5.5 17.4V18a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-.6a3 3 0 0 0-1-2.2l-2.9-3.4a2 2 0 0 1-.6-1.4V3" }),
    /* @__PURE__ */ t("circle", { cx: "9", cy: "17", r: "1", fill: "currentColor" }),
    /* @__PURE__ */ t("circle", { cx: "14", cy: "16", r: "0.7", fill: "currentColor" })
  ] }),
  História: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M3 21h18M5 21V7l7-4 7 4v14" }),
    /* @__PURE__ */ t("path", { d: "M9 21v-4h6v4M9 9h1M14 9h1M9 13h1M14 13h1" })
  ] }),
  Geografia: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ t("path", { d: "M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
  ] }),
  Artes: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3 0 5.6-2.5 5.6-5.6C22 5.8 17.5 2 12 2z" }),
    /* @__PURE__ */ t("circle", { cx: "7.5", cy: "11", r: "1.5", fill: "currentColor" }),
    /* @__PURE__ */ t("circle", { cx: "10", cy: "7", r: "1.5", fill: "currentColor" }),
    /* @__PURE__ */ t("circle", { cx: "15", cy: "7", r: "1.5", fill: "currentColor" }),
    /* @__PURE__ */ t("circle", { cx: "17.5", cy: "11", r: "1.5", fill: "currentColor" })
  ] }),
  "Educação Física": /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "5", r: "2" }),
    /* @__PURE__ */ t("path", { d: "M4 17l4-4 4 4 4-4 4 4" }),
    /* @__PURE__ */ t("path", { d: "M12 12v5" }),
    /* @__PURE__ */ t("path", { d: "M8 21h8" })
  ] }),
  Inglês: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M5 8l6 4-6 4V8z" }),
    /* @__PURE__ */ t("path", { d: "M13 12h8M13 8h5M13 16h3" })
  ] }),
  Filosofia: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "3" }),
    /* @__PURE__ */ t("path", { d: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" })
  ] }),
  Sociologia: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ t("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ t("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  Biologia: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M12 22c-4-4-8-6-8-12a8 8 0 1 1 16 0c0 6-4 8-8 12z" }),
    /* @__PURE__ */ t("path", { d: "M12 6v10M8 10h8" })
  ] }),
  Física: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "3" }),
    /* @__PURE__ */ t("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4" }),
    /* @__PURE__ */ t("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4", transform: "rotate(60 12 12)" }),
    /* @__PURE__ */ t("ellipse", { cx: "12", cy: "12", rx: "10", ry: "4", transform: "rotate(120 12 12)" })
  ] }),
  Química: /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M9 3h6M10 3v6l-5 8.5a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3L14 9V3" }),
    /* @__PURE__ */ t("path", { d: "M8.5 14h7" })
  ] }),
  "Educação Infantil": /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
    /* @__PURE__ */ t("path", { d: "M12 3l1.5 4.5h4.5l-3.5 2.7 1.3 4.3L12 12l-3.8 2.5 1.3-4.3-3.5-2.7h4.5z" }),
    /* @__PURE__ */ t("path", { d: "M12 16v5M8 21h8" })
  ] })
}, Uo = /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", width: "22", height: "22", children: [
  /* @__PURE__ */ t("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
  /* @__PURE__ */ t("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" })
] }), Ko = {
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
}, qo = { bg: "#64748b", fg: "#475569", pastel: "#f1f5f9", emoji: "📚" };
function Qo(e) {
  return Ko[e] || qo;
}
const Jo = S(
  ({ subject: e, icon: o, meta: r, badge: n, subtitle: a, interactive: i = !0, variant: s = "pastel", className: c, children: l, ...m }, u) => {
    const f = Qo(e), h = {
      pastel: {
        background: f.pastel,
        borderColor: `${f.bg}20`
      },
      solid: {
        background: f.bg,
        borderColor: f.bg
      },
      outlined: {
        background: "var(--omni-bg-secondary)",
        borderColor: f.bg
      }
    }, g = s === "solid" ? "#fff" : f.fg, x = s === "solid" ? "rgba(255,255,255,0.7)" : `${f.fg}99`, p = s === "solid" ? 0.08 : 0.06;
    return /* @__PURE__ */ d(
      "div",
      {
        ref: u,
        className: b(
          "relative rounded-2xl border p-5 transition-all duration-200 overflow-hidden",
          i && "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]",
          c
        ),
        style: {
          ...h[s],
          borderWidth: s === "outlined" ? 2 : 1
        },
        ...m,
        children: [
          /* @__PURE__ */ t(
            "span",
            {
              className: "absolute pointer-events-none select-none",
              style: {
                right: -4,
                top: "50%",
                fontSize: 80,
                opacity: p,
                lineHeight: 1,
                transform: "translateY(-50%) rotate(-12deg)"
              },
              "aria-hidden": "true",
              children: f.emoji
            }
          ),
          n && /* @__PURE__ */ t(
            "span",
            {
              className: "absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md z-10",
              style: {
                backgroundColor: s === "solid" ? "rgba(255,255,255,0.2)" : `${f.bg}15`,
                color: s === "solid" ? "#fff" : f.bg
              },
              children: n
            }
          ),
          /* @__PURE__ */ d("div", { className: "relative z-10 flex items-start gap-3 mb-3", children: [
            /* @__PURE__ */ t(
              "div",
              {
                className: "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                style: {
                  backgroundColor: s === "solid" ? "rgba(255,255,255,0.2)" : `${f.bg}15`,
                  color: s === "solid" ? "#fff" : f.bg
                },
                children: o || Yo[e] || Uo
              }
            ),
            /* @__PURE__ */ d("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ t(
                "h3",
                {
                  className: "text-base font-bold leading-tight truncate",
                  style: { color: g },
                  children: e
                }
              ),
              a && /* @__PURE__ */ t("p", { className: "text-xs font-medium mt-0.5 truncate", style: { color: x }, children: a })
            ] })
          ] }),
          r && r.length > 0 && /* @__PURE__ */ t("div", { className: b(
            "relative z-10 grid gap-2",
            r.length === 1 ? "grid-cols-1" : r.length === 2 ? "grid-cols-2" : "grid-cols-3"
          ), children: r.map((N) => /* @__PURE__ */ d("div", { children: [
            /* @__PURE__ */ t(
              "p",
              {
                className: "text-lg font-extrabold leading-none",
                style: { color: g },
                children: N.value
              }
            ),
            /* @__PURE__ */ t(
              "p",
              {
                className: "text-[10px] font-semibold uppercase tracking-wider mt-0.5",
                style: { color: x },
                children: N.label
              }
            )
          ] }, N.label)) }),
          l && /* @__PURE__ */ t("div", { className: "relative z-10", children: l })
        ]
      }
    );
  }
);
Jo.displayName = "CurriculumCard";
const Xo = S(
  ({ label: e, value: o, icon: r, trend: n, color: a = "#0ea5e9", variant: i = "gradient", suffix: s, className: c, ...l }, m) => {
    const u = i === "gradient", f = i === "pastel", h = u ? "#fff" : a, g = u ? "rgba(255,255,255,0.7)" : `${a}88`, x = u ? { background: `linear-gradient(135deg, ${a}, ${a}cc)` } : f ? { background: `${a}12`, border: `1px solid ${a}20` } : { background: "var(--omni-bg-secondary)", border: "1px solid var(--omni-border-default)" };
    return /* @__PURE__ */ d(
      "div",
      {
        ref: m,
        className: b(
          "relative p-5 rounded-2xl overflow-hidden transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-lg",
          c
        ),
        style: x,
        ...l,
        children: [
          u && /* @__PURE__ */ t(
            "div",
            {
              className: "absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none",
              style: { background: "rgba(255,255,255,0.1)" }
            }
          ),
          /* @__PURE__ */ d("div", { className: "relative z-10 flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ d("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ t("p", { className: "text-[11px] font-bold uppercase tracking-widest mb-2", style: { color: g }, children: e }),
              /* @__PURE__ */ d("div", { className: "flex items-baseline gap-1.5", children: [
                /* @__PURE__ */ t("p", { className: "text-3xl font-extrabold tracking-tight leading-none", style: { color: h }, children: o }),
                s && /* @__PURE__ */ t("span", { className: "text-sm font-medium", style: { color: g }, children: s })
              ] }),
              n && /* @__PURE__ */ d("div", { className: "flex items-center gap-1.5 mt-2", children: [
                /* @__PURE__ */ d(
                  "span",
                  {
                    className: b(
                      "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md",
                      u ? "bg-white/20" : n.value >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    ),
                    style: u ? { color: "#fff" } : void 0,
                    children: [
                      n.value >= 0 ? "↑" : "↓",
                      " ",
                      Math.abs(n.value),
                      "%"
                    ]
                  }
                ),
                n.label && /* @__PURE__ */ t("span", { className: "text-[10px] font-medium", style: { color: g }, children: n.label })
              ] })
            ] }),
            r && /* @__PURE__ */ t(
              "div",
              {
                className: "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                style: {
                  backgroundColor: u ? "rgba(255,255,255,0.2)" : `${a}15`,
                  color: u ? "#fff" : a
                },
                children: r
              }
            )
          ] })
        ]
      }
    );
  }
);
Xo.displayName = "MetricCard";
function ia({ title: e, value: o, icon: r, trend: n, color: a = "#0ea5e9", className: i }) {
  return /* @__PURE__ */ d("div", { className: b("p-5 rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary) shadow-(--omni-shadow-md) hover:shadow-(--omni-shadow-elevated) hover:-translate-y-1 transition-all duration-200", i), children: [
    /* @__PURE__ */ d("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ t("span", { className: "text-xs font-semibold uppercase tracking-wider text-(--omni-text-muted)", children: e }),
      r && /* @__PURE__ */ t("div", { className: "w-9 h-9 rounded-xl flex items-center justify-center text-white", style: { backgroundColor: a }, children: r })
    ] }),
    /* @__PURE__ */ t("p", { className: "text-3xl font-extrabold tracking-tight text-(--omni-text-primary)", children: o }),
    n && /* @__PURE__ */ d("div", { className: "flex items-center gap-1 mt-2", children: [
      /* @__PURE__ */ d("span", { className: b("text-xs font-bold", n.value >= 0 ? "text-emerald-600" : "text-red-500"), children: [
        n.value >= 0 ? "↑" : "↓",
        " ",
        Math.abs(n.value),
        "%"
      ] }),
      n.label && /* @__PURE__ */ t("span", { className: "text-xs text-(--omni-text-muted)", children: n.label })
    ] })
  ] });
}
const tt = [0.06, 0.25, 0.5, 0.75, 1], Zo = S(
  ({ days: e, weeks: o = 12, color: r = z.success.base, showDayLabels: n = !0, showMonthLabels: a = !0, streakCount: i, cellSize: s = 14, cellGap: c = 3, className: l, ...m }, u) => {
    const f = new Map(e.map((C) => [C.date, C.intensity])), h = /* @__PURE__ */ new Date(), g = o * 7, x = new Date(h);
    x.setDate(x.getDate() - g + 1);
    const p = x.getDay();
    x.setDate(x.getDate() - (p + 6) % 7);
    const N = [], _ = new Date(x);
    for (let C = 0; C < o; C++) {
      const A = [];
      for (let D = 0; D < 7; D++) {
        const M = _.toISOString().slice(0, 10);
        A.push({ date: M, intensity: f.get(M) ?? 0 }), _.setDate(_.getDate() + 1);
      }
      N.push(A);
    }
    const v = ["S", "T", "Q", "Q", "S", "S", "D"];
    return /* @__PURE__ */ d("div", { ref: u, className: b("inline-flex flex-col gap-2", l), ...m, children: [
      i !== void 0 && /* @__PURE__ */ d("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ t("span", { className: "text-2xl", children: "🔥" }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ t("p", { className: "text-2xl font-extrabold tracking-tight text-(--omni-text-primary)", children: i }),
          /* @__PURE__ */ t("p", { className: "text-[10px] font-bold uppercase tracking-widest text-(--omni-text-muted)", children: "dias seguidos" })
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "flex gap-1", children: [
        n && /* @__PURE__ */ t("div", { className: "flex flex-col pr-1", style: { gap: c }, children: v.map((C, A) => /* @__PURE__ */ t(
          "span",
          {
            className: "text-[9px] font-semibold text-(--omni-text-muted) flex items-center justify-end",
            style: { height: s, lineHeight: `${s}px` },
            children: A % 2 === 0 ? C : ""
          },
          A
        )) }),
        /* @__PURE__ */ t("div", { className: "flex", style: { gap: c }, children: N.map((C, A) => /* @__PURE__ */ t("div", { className: "flex flex-col", style: { gap: c }, children: C.map((D, M) => /* @__PURE__ */ t(
          "div",
          {
            className: "rounded-sm transition-colors",
            style: {
              width: s,
              height: s,
              backgroundColor: r,
              opacity: tt[D.intensity]
            },
            title: `${D.date}: nível ${D.intensity}`
          },
          M
        )) }, A)) })
      ] }),
      /* @__PURE__ */ d("div", { className: "flex items-center gap-1 mt-1", children: [
        /* @__PURE__ */ t("span", { className: "text-[9px] text-(--omni-text-muted) mr-1", children: "Menos" }),
        [0, 1, 2, 3, 4].map((C) => /* @__PURE__ */ t(
          "div",
          {
            className: "rounded-sm",
            style: { width: s - 2, height: s - 2, backgroundColor: r, opacity: tt[C] }
          },
          C
        )),
        /* @__PURE__ */ t("span", { className: "text-[9px] text-(--omni-text-muted) ml-1", children: "Mais" })
      ] })
    ] });
  }
);
Zo.displayName = "StreakCalendar";
const De = [
  { label: "Não iniciado", color: V.none.base, bg: V.none.bg },
  { label: "Iniciante", color: V.beginner.base, bg: V.beginner.bg },
  { label: "Praticando", color: V.learning.base, bg: V.learning.bg },
  { label: "Avançado", color: V.advanced.base, bg: V.advanced.bg },
  { label: "Dominado", color: V.mastered.base, bg: V.mastered.bg }
], en = S(
  ({ level: e, showLabel: o = !0, labels: r, size: n = "md", className: a, ...i }, s) => {
    const l = { sm: 4, md: 6, lg: 8 }[n], m = De[e], u = r || De.map((f) => f.label);
    return /* @__PURE__ */ d("div", { ref: s, className: b("inline-flex flex-col gap-1.5", a), ...i, children: [
      /* @__PURE__ */ t("div", { className: "flex items-center gap-1", children: [0, 1, 2, 3, 4].map((f) => /* @__PURE__ */ t(
        "div",
        {
          className: "flex-1 rounded-full transition-all duration-300",
          style: {
            height: l,
            minWidth: n === "sm" ? 16 : n === "md" ? 24 : 32,
            backgroundColor: f <= e ? De[Math.min(f, 4)].color : "var(--omni-border-default)",
            opacity: f <= e ? 1 : 0.3
          }
        },
        f
      )) }),
      o && /* @__PURE__ */ d("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ t(
          "span",
          {
            className: "w-2 h-2 rounded-full shrink-0",
            style: { backgroundColor: m.color }
          }
        ),
        /* @__PURE__ */ t("span", { className: "text-xs font-semibold", style: { color: m.color }, children: u[e] })
      ] })
    ] });
  }
);
en.displayName = "MasteryBar";
const tn = S(
  ({ current: e, goal: o, unit: r = "min", color: n = z.success.base, diameter: a = 120, strokeWidth: i = 8, icon: s, label: c, className: l, ...m }, u) => {
    const f = Math.min(100, e / o * 100), h = (a - i) / 2, g = 2 * Math.PI * h, x = g - f / 100 * g, p = e >= o;
    return /* @__PURE__ */ d("div", { ref: u, className: b("inline-flex flex-col items-center gap-2", l), ...m, children: [
      /* @__PURE__ */ d("div", { className: "relative", style: { width: a, height: a }, children: [
        /* @__PURE__ */ d("svg", { width: a, height: a, className: "transform -rotate-90", children: [
          /* @__PURE__ */ t(
            "circle",
            {
              cx: a / 2,
              cy: a / 2,
              r: h,
              fill: "none",
              stroke: "var(--omni-border-default)",
              strokeWidth: i,
              opacity: 0.3
            }
          ),
          /* @__PURE__ */ t(
            "circle",
            {
              cx: a / 2,
              cy: a / 2,
              r: h,
              fill: "none",
              stroke: n,
              strokeWidth: i,
              strokeLinecap: "round",
              strokeDasharray: g,
              strokeDashoffset: x,
              style: { transition: "stroke-dashoffset 0.6s ease" }
            }
          )
        ] }),
        /* @__PURE__ */ d("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
          s && /* @__PURE__ */ t("span", { className: "mb-0.5", children: s }),
          /* @__PURE__ */ d("p", { className: "text-xl font-extrabold tracking-tight text-(--omni-text-primary)", children: [
            e,
            /* @__PURE__ */ d("span", { className: "text-xs font-semibold text-(--omni-text-muted)", children: [
              "/",
              o
            ] })
          ] }),
          /* @__PURE__ */ t("p", { className: "text-[10px] font-bold uppercase tracking-wider text-(--omni-text-muted)", children: r })
        ] })
      ] }),
      c && /* @__PURE__ */ t("p", { className: "text-xs font-semibold text-(--omni-text-secondary)", children: c }),
      p && /* @__PURE__ */ t("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", style: { backgroundColor: `${n}15`, color: n }, children: "✓ Meta atingida!" })
    ] });
  }
);
tn.displayName = "StudyGoalRing";
const rn = S(
  ({ name: e, level: o, xp: r, xpNext: n, icon: a, color: i = zt.primary, variant: s = "default", unlocked: c = !0, className: l, ...m }, u) => {
    const f = s === "mini", h = s === "compact", g = r !== void 0 && n ? Math.min(100, r / n * 100) : 0;
    return f ? /* @__PURE__ */ d(
      "div",
      {
        ref: u,
        className: b(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all",
          c ? "border-transparent" : "border-dashed border-(--omni-border-default) opacity-40",
          l
        ),
        style: c ? { backgroundColor: `${i}12`, color: i } : void 0,
        ...m,
        children: [
          a && /* @__PURE__ */ t("span", { className: "text-sm", children: a }),
          /* @__PURE__ */ d("span", { children: [
            "Nv.",
            o
          ] })
        ]
      }
    ) : /* @__PURE__ */ d(
      "div",
      {
        ref: u,
        className: b(
          "rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-(--omni-shadow-elevated) hover:-translate-y-0.5",
          c ? "border-(--omni-border-default) bg-(--omni-bg-secondary)" : "border-dashed border-(--omni-border-default) bg-(--omni-bg-secondary) opacity-50",
          h ? "p-3" : "p-4",
          l
        ),
        ...m,
        children: [
          /* @__PURE__ */ d("div", { className: b("flex items-center gap-3", h && "gap-2"), children: [
            /* @__PURE__ */ t(
              "div",
              {
                className: b(
                  "flex items-center justify-center rounded-xl shrink-0",
                  h ? "w-9 h-9 text-lg" : "w-12 h-12 text-2xl"
                ),
                style: { backgroundColor: c ? `${i}15` : "var(--omni-bg-hover)", color: c ? i : "var(--omni-text-muted)" },
                children: a || "⭐"
              }
            ),
            /* @__PURE__ */ d("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ t("p", { className: b("font-bold text-(--omni-text-primary) truncate", h ? "text-xs" : "text-sm"), children: e }),
              /* @__PURE__ */ d("div", { className: "flex items-center gap-2 mt-0.5", children: [
                /* @__PURE__ */ d(
                  "span",
                  {
                    className: "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    style: { backgroundColor: `${i}15`, color: i },
                    children: [
                      "Nv.",
                      o
                    ]
                  }
                ),
                r !== void 0 && n && /* @__PURE__ */ d("span", { className: "text-[10px] text-(--omni-text-muted) font-semibold tabular-nums", children: [
                  r,
                  "/",
                  n,
                  " XP"
                ] })
              ] })
            ] }),
            !c && /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", className: "text-(--omni-text-muted) shrink-0", children: [
              /* @__PURE__ */ t("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
              /* @__PURE__ */ t("path", { d: "M7 11V7a5 5 0 0110 0v4" })
            ] })
          ] }),
          r !== void 0 && n && !h && /* @__PURE__ */ t("div", { className: "mt-3", children: /* @__PURE__ */ t("div", { className: "w-full h-1.5 rounded-full overflow-hidden", style: { backgroundColor: `${i}15` }, children: /* @__PURE__ */ t(
            "div",
            {
              className: "h-full rounded-full transition-all duration-500",
              style: { width: `${g}%`, backgroundColor: i }
            }
          ) }) })
        ]
      }
    );
  }
);
rn.displayName = "SkillBadge";
const on = ["Muito fácil", "Fácil", "Médio", "Difícil", "Muito difícil"], nn = [
  z.success.base,
  "#22c55e",
  z.warning.base,
  "#f97316",
  z.error.base
];
function la({ level: e, max: o = 5, shape: r = "dots", color: n = "auto", size: a = "md", showLabel: i = !1, labels: s, className: c, ...l }) {
  const m = n === "auto" ? nn[e - 1] : n, f = { sm: 6, md: 8, lg: 10 }[a], h = s || on;
  return /* @__PURE__ */ d("div", { className: b("inline-flex items-center gap-1.5", c), ...l, children: [
    Array.from({ length: o }, (g, x) => {
      const p = x < e;
      return r === "stars" ? /* @__PURE__ */ t("svg", { width: f + 4, height: f + 4, viewBox: "0 0 24 24", fill: p ? m : "none", stroke: p ? m : "var(--omni-border-default)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) }, x) : r === "bars" ? /* @__PURE__ */ t(
        "div",
        {
          className: "rounded-sm transition-all",
          style: {
            width: f - 2,
            height: f + x * 3,
            backgroundColor: p ? m : "var(--omni-border-default)",
            opacity: p ? 1 : 0.3
          }
        },
        x
      ) : /* @__PURE__ */ t(
        "div",
        {
          className: "rounded-full transition-all",
          style: {
            width: f,
            height: f,
            backgroundColor: p ? m : "var(--omni-border-default)",
            opacity: p ? 1 : 0.3
          }
        },
        x
      );
    }),
    i && /* @__PURE__ */ t("span", { className: "text-xs font-semibold ml-1", style: { color: m }, children: h[e - 1] })
  ] });
}
function da({ icon: e, title: o, description: r, action: n, className: a }) {
  return /* @__PURE__ */ d(
    "div",
    {
      className: b(
        "flex flex-col items-center justify-center rounded-2xl",
        "border border-(--omni-border-default)",
        "bg-(--omni-bg-tertiary)/50",
        "py-12 px-6 text-center",
        a
      ),
      role: "status",
      "aria-label": o,
      children: [
        e && /* @__PURE__ */ t("div", { className: "mb-4 p-3 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400", children: /* @__PURE__ */ t(e, { className: "w-10 h-10", "aria-hidden": !0 }) }),
        /* @__PURE__ */ t("h3", { className: "text-lg font-semibold text-(--omni-text-primary)", children: o }),
        r && /* @__PURE__ */ t("p", { className: "mt-2 text-sm text-(--omni-text-muted) max-w-sm", children: r }),
        n && /* @__PURE__ */ t("div", { className: "mt-4", children: /* @__PURE__ */ t(vt, { variant: "primary", size: "sm", onClick: n.onClick, children: n.label }) })
      ]
    }
  );
}
const an = At(() => import("./index-CizbuhCJ.js").then((e) => ({ default: e.Player }))), rt = /* @__PURE__ */ new Map(), ve = /* @__PURE__ */ new Map();
function St(e, o) {
  const r = `${o}${e}.json`, n = rt.get(r);
  if (n) return Promise.resolve(n);
  const a = ve.get(r);
  if (a) return a;
  const i = fetch(r).then((s) => {
    if (!s.ok) throw new Error(`Failed: ${r}`);
    return s.json();
  }).then((s) => (rt.set(r, s), ve.delete(r), s)).catch((s) => {
    throw ve.delete(r), s;
  });
  return ve.set(r, i), i;
}
function sn(e, o) {
  const r = (a) => {
    if (!a || typeof a != "object" || a === null) return a;
    const i = { ...a };
    return i.x && delete i.x, typeof i.k == "number" ? (i.k = o, i) : (Array.isArray(i.k) && (i.k = i.k.map((s) => {
      if (s == null || typeof s != "object") return s;
      const c = s, l = c.s;
      return typeof l == "number" ? { ...c, s: o } : Array.isArray(l) ? { ...c, s: l.map(() => o) } : s;
    })), i);
  }, n = (a) => {
    if (a === null || typeof a != "object") return a;
    if (Array.isArray(a)) return a.map(n);
    const i = a;
    if (i.ty === "st" && i.w != null)
      return { ...i, w: r(i.w) };
    const s = {};
    for (const c of Object.keys(i)) s[c] = n(i[c]);
    return s;
  };
  return n(JSON.parse(JSON.stringify(e)));
}
function ca({
  animation: e,
  icon: o,
  basePath: r = "/lottie/",
  size: n = 48,
  colorize: a,
  colors: i,
  strokeWidth: s,
  state: c,
  direction: l,
  autoplay: m = !0,
  className: u = "",
  style: f = {},
  onReady: h,
  onComplete: g
}) {
  const x = H(null), [p, N] = R(o ?? null), [_, v] = R(!1);
  F(() => {
    if (o) {
      N(o);
      return;
    }
    if (!e) return;
    let D = !1;
    return St(e, r).then((M) => {
      D || N(M);
    }).catch(() => {
      D || v(!0);
    }), () => {
      D = !0;
    };
  }, [e, o, r]), F(() => {
    m && p && x.current && x.current.playFromBeginning();
  }, [p, m]);
  const C = {
    width: n,
    height: n,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...f
  };
  if (_)
    return /* @__PURE__ */ t("div", { className: u, style: C, children: /* @__PURE__ */ t("span", { style: { fontSize: 10, opacity: 0.4 }, children: "⚠️" }) });
  if (!p)
    return /* @__PURE__ */ t("div", { className: u, style: C });
  const A = s ? sn(p, s) : p;
  return /* @__PURE__ */ t("div", { className: u, style: C, children: /* @__PURE__ */ t(Lt, { fallback: null, children: /* @__PURE__ */ t(
    an,
    {
      ref: x,
      icon: A,
      size: n,
      colorize: a,
      colors: i,
      state: c,
      direction: l,
      onReady: h,
      onComplete: g
    }
  ) }) });
}
function ma(e, o = "/lottie/") {
  St(e, o).catch(() => {
  });
}
const ln = 3, G = 1.8, B = 1, dn = {
  // ── Module icons ──
  UsersFour: { animation: "wired-outline-529-boy-girl-children-hover-pinch", strokeScale: B, flatAnimation: "estudantes_flat" },
  Student: { animation: "wired-outline-426-brain-hover-pinch", strokeScale: B, flatAnimation: "pei_flat" },
  PuzzlePiece: { animation: "wired-outline-782-compass-hover-pinch", strokeScale: G, flatAnimation: "paee_flat" },
  RocketLaunch: { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: B, flatAnimation: "hub_flat" },
  BookOpen: { animation: "wired-outline-3140-book-open-hover-pinch", strokeScale: B, flatAnimation: "Diario_flat" },
  ChartLineUp: { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: B, flatAnimation: "dados_flat" },
  UsersThree: { animation: "wired-outline-1004-management-team-hover-smooth", strokeScale: G, flatAnimation: "usuarios_flat" },
  GraduationCap: { animation: "wired-outline-406-study-graduation-hover-pinch", strokeScale: B, flatAnimation: "configuracao_escola_flat" },
  ClipboardText: { animation: "wired-outline-967-questionnaire-hover-pinch", strokeScale: B, flatAnimation: "pgi_flat" },
  Gear: { animation: "wired-outline-39-cog-hover-mechanic", strokeScale: G, flatAnimation: "configuracao_escola_flat" },
  BookBookmark: { animation: "wired-outline-2167-books-course-assign-hover-pinch", strokeScale: B, flatAnimation: "livros_flat" },
  Sparkle: { animation: "wired-outline-489-rocket-space-hover-flying", strokeScale: B, flatAnimation: "foguete_flat" },
  CalendarBlank: { animation: "wired-outline-973-appointment-schedule-hover-click", strokeScale: G, flatAnimation: "agenda_flat" },
  Megaphone: { animation: "wired-outline-411-news-newspaper-hover-pinch", strokeScale: G, flatAnimation: "megafone" },
  // ── Aliases ──
  Compass: { animation: "wired-outline-426-brain-hover-pinch", strokeScale: B, flatAnimation: "pei_flat" },
  Puzzle: { animation: "wired-outline-782-compass-hover-pinch", strokeScale: G, flatAnimation: "paee_flat" },
  Rocket: { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: B, flatAnimation: "hub_flat" },
  BarChart3: { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: B, flatAnimation: "dados_flat" },
  School: { animation: "wired-outline-406-study-graduation-hover-pinch", strokeScale: B, flatAnimation: "configuracao_escola_flat" },
  ClipboardList: { animation: "wired-outline-967-questionnaire-hover-pinch", strokeScale: B, flatAnimation: "pgi_flat" },
  Settings: { animation: "wired-outline-39-cog-hover-mechanic", strokeScale: G, flatAnimation: "configuracao_escola_flat" }
}, cn = {
  "/": { animation: "wired-outline-63-home-hover-3d-roll", strokeScale: ln },
  "/estudantes": { animation: "wired-outline-529-boy-girl-children-hover-pinch", strokeScale: B, flatAnimation: "estudantes_flat" },
  "/omnisfera": { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: B, flatAnimation: "hub_flat" },
  "/pei": { animation: "wired-outline-426-brain-hover-pinch", strokeScale: B, flatAnimation: "pei_flat" },
  "/paee": { animation: "wired-outline-782-compass-hover-pinch", strokeScale: G, flatAnimation: "paee_flat" },
  "/hub": { animation: "wired-outline-3139-rocket-space-alt-hover-pinch", strokeScale: B, flatAnimation: "hub_flat" },
  "/diario": { animation: "wired-outline-3140-book-open-hover-pinch", strokeScale: B, flatAnimation: "Diario_flat" },
  "/monitoramento": { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: B, flatAnimation: "dados_flat" },
  "/infos": { animation: "wired-outline-2167-books-course-assign-hover-pinch", strokeScale: B, flatAnimation: "central_inteligencia_flat" },
  "/config-escola": { animation: "wired-outline-406-study-graduation-hover-pinch", strokeScale: B, flatAnimation: "configuracao_escola_flat" },
  "/gestao": { animation: "wired-outline-1004-management-team-hover-smooth", strokeScale: G, flatAnimation: "usuarios_flat" },
  "/pgi": { animation: "wired-outline-967-questionnaire-hover-pinch", strokeScale: B, flatAnimation: "pgi_flat" },
  "/relatorios": { animation: "wired-outline-152-bar-chart-arrow-hover-growth", strokeScale: B, flatAnimation: "dados_flat" },
  "/cursos": { animation: "wired-outline-2167-books-course-assign-hover-pinch", strokeScale: B, flatAnimation: "livros_flat" },
  "/ferramentas": { animation: "wired-outline-489-rocket-space-hover-flying", strokeScale: B, flatAnimation: "foguete_flat" },
  "/agenda": { animation: "wired-outline-973-appointment-schedule-hover-click", strokeScale: G, flatAnimation: "agenda_flat" },
  "/comunicacao": { animation: "wired-outline-411-news-newspaper-hover-pinch", strokeScale: G, flatAnimation: "megafone" }
}, ua = [
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
function ba(e) {
  return dn[e];
}
function fa(e) {
  return cn[e];
}
export {
  Xn as Accordion,
  Vo as ActivityRow,
  Fn as Alert,
  oa as Avatar,
  na as AvatarGroup,
  Pn as Badge,
  Jn as Breadcrumbs,
  vt as Button,
  Sr as Card,
  jr as CardContent,
  Ar as CardDescription,
  Mr as CardHeader,
  Lr as CardTitle,
  Hr as Checkbox,
  qr as Combobox,
  jo as CommandPalette,
  Hn as ConfirmDialog,
  Jo as CurriculumCard,
  eo as DatePicker,
  la as DifficultyDots,
  Oo as DonutChart,
  Zn as DropdownMenu,
  Lo as DropdownMenuContent,
  Ao as DropdownMenuItem,
  ta as DropdownMenuLabel,
  ea as DropdownMenuSeparator,
  Mo as DropdownMenuTrigger,
  da as EmptyState,
  ua as FLAT_ANIMATIONS,
  to as FilterChip,
  _r as GlassPanel,
  Go as GoalCard,
  _t as ICON_GRAPHITE,
  Nn as ICON_PRIMARY_DEFAULT,
  dn as ICON_REGISTRY,
  Sn as ICON_SYSTEM_BG,
  Cn as ICON_SYSTEM_COLOR,
  Wr as Input,
  Un as LegendBar,
  ca as LottieIcon,
  en as MasteryBar,
  Xo as MetricCard,
  wt as Modal,
  sa as ModuleCard,
  aa as NumberedList,
  Qn as Pagination,
  vo as PanoramaCard,
  Fo as ProfileCard,
  On as Progress,
  cn as ROUTE_REGISTRY,
  Rn as RadioGroup,
  En as RadioItem,
  xo as RankingCard,
  po as RecommendationPanel,
  Nt as ScoreBar,
  Dr as ScrollArea,
  Tn as SectionTitle,
  Or as Select,
  Nr as Separator,
  ko as Sheet,
  Co as SheetBody,
  So as SheetFooter,
  wo as SheetHeader,
  No as SheetTitle,
  Pr as Sidebar,
  Ir as SidebarContent,
  $r as SidebarFooter,
  Tr as SidebarGroup,
  Br as SidebarHeader,
  Rr as SidebarItem,
  $n as SidebarToggle,
  In as Skeleton,
  rn as SkillBadge,
  Kr as Slider,
  ia as StatCard,
  Yn as StatusDot,
  qn as Steps,
  Zo as StreakCalendar,
  tn as StudyGoalRing,
  ho as SubjectProgressRow,
  Po as Table,
  Io as TableBody,
  Wo as TableCaption,
  Eo as TableCell,
  $o as TableFooter,
  Ro as TableHead,
  Bo as TableHeader,
  To as TableRow,
  Kn as Tabs,
  Bn as Tag,
  Vr as Textarea,
  Vn as ToastContainer,
  Ur as Toggle,
  Ho as ToolCard,
  ra as Tooltip,
  Wn as Upload,
  fn as areaColors,
  wr as badgeVariants,
  zt as brandColors,
  ae as breakpoints,
  kr as buttonVariants,
  Cr as cardVariants,
  b as cn,
  Ko as curriculumColors,
  Z as duration,
  ee as easing,
  z as feedbackColors,
  xn as fontFamily,
  je as fontSize,
  Ae as fontWeight,
  ba as getIconEntry,
  fa as getRouteEntry,
  pn as gradients,
  Ln as iconColors,
  Mn as iconSize,
  Er as inputVariants,
  pe as letterSpacing,
  ze as lineHeight,
  V as masteryColors,
  _n as mediaQueries,
  jt as moduleColors,
  An as moduleIcons,
  Dn as motionPresets,
  ma as preloadAnimation,
  kn as radius,
  Fr as selectVariants,
  bn as semanticColors,
  vn as shadows,
  yn as shadowsDark,
  K as spacing,
  jn as spacingAlias,
  hn as statusColors,
  gn as textStyles,
  Gr as textareaVariants,
  Gn as toast,
  wn as transitions,
  Re as useSidebar,
  zn as zIndex
};
