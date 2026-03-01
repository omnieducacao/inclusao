import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

// ─── Ícones SVG Flat por disciplina ───

const subjectIcons: Record<string, ReactNode> = {
    "Matemática": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
            <path d="M17 14v6M14 17h6" />
        </svg>
    ),
    "Português": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8M8 11h6" />
        </svg>
    ),
    "Ciências": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M9 3h6M10 3v7.4a2 2 0 0 1-.6 1.4L6.5 15.2A3 3 0 0 0 5.5 17.4V18a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-.6a3 3 0 0 0-1-2.2l-2.9-3.4a2 2 0 0 1-.6-1.4V3" />
            <circle cx="9" cy="17" r="1" fill="currentColor" />
            <circle cx="14" cy="16" r="0.7" fill="currentColor" />
        </svg>
    ),
    "História": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M3 21h18M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-4h6v4M9 9h1M14 9h1M9 13h1M14 13h1" />
        </svg>
    ),
    "Geografia": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    "Artes": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3 0 5.6-2.5 5.6-5.6C22 5.8 17.5 2 12 2z" />
            <circle cx="7.5" cy="11" r="1.5" fill="currentColor" />
            <circle cx="10" cy="7" r="1.5" fill="currentColor" />
            <circle cx="15" cy="7" r="1.5" fill="currentColor" />
            <circle cx="17.5" cy="11" r="1.5" fill="currentColor" />
        </svg>
    ),
    "Educação Física": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <circle cx="12" cy="5" r="2" />
            <path d="M4 17l4-4 4 4 4-4 4 4" />
            <path d="M12 12v5" />
            <path d="M8 21h8" />
        </svg>
    ),
    "Inglês": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M5 8l6 4-6 4V8z" />
            <path d="M13 12h8M13 8h5M13 16h3" />
        </svg>
    ),
    "Filosofia": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    ),
    "Sociologia": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    "Biologia": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M12 22c-4-4-8-6-8-12a8 8 0 1 1 16 0c0 6-4 8-8 12z" />
            <path d="M12 6v10M8 10h8" />
        </svg>
    ),
    "Física": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <circle cx="12" cy="12" r="3" />
            <ellipse cx="12" cy="12" rx="10" ry="4" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
    ),
    "Química": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M9 3h6M10 3v6l-5 8.5a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3L14 9V3" />
            <path d="M8.5 14h7" />
        </svg>
    ),
    "Educação Infantil": (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M12 3l1.5 4.5h4.5l-3.5 2.7 1.3 4.3L12 12l-3.8 2.5 1.3-4.3-3.5-2.7h4.5z" />
            <path d="M12 16v5M8 21h8" />
        </svg>
    ),
};

const defaultIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

// ─── Paleta de Cores por Disciplina ───

export const curriculumColors: Record<string, { bg: string; fg: string; pastel: string; emoji: string }> = {
    "Matemática": { bg: "#2563eb", fg: "#1e40af", pastel: "#dbeafe", emoji: "📐" },
    "Português": { bg: "#7c3aed", fg: "#5b21b6", pastel: "#ede9fe", emoji: "📖" },
    "Ciências": { bg: "#059669", fg: "#047857", pastel: "#d1fae5", emoji: "🔬" },
    "História": { bg: "#d97706", fg: "#b45309", pastel: "#fef3c7", emoji: "🏛️" },
    "Geografia": { bg: "#0891b2", fg: "#0e7490", pastel: "#cffafe", emoji: "🌍" },
    "Artes": { bg: "#e11d48", fg: "#be123c", pastel: "#ffe4e6", emoji: "🎨" },
    "Educação Física": { bg: "#ea580c", fg: "#c2410c", pastel: "#ffedd5", emoji: "⚽" },
    "Inglês": { bg: "#4f46e5", fg: "#4338ca", pastel: "#e0e7ff", emoji: "🇬🇧" },
    "Filosofia": { bg: "#9333ea", fg: "#7e22ce", pastel: "#f3e8ff", emoji: "💭" },
    "Sociologia": { bg: "#0d9488", fg: "#0f766e", pastel: "#ccfbf1", emoji: "🤝" },
    "Biologia": { bg: "#16a34a", fg: "#15803d", pastel: "#dcfce7", emoji: "🧬" },
    "Física": { bg: "#6366f1", fg: "#4f46e5", pastel: "#e0e7ff", emoji: "⚡" },
    "Química": { bg: "#dc2626", fg: "#b91c1c", pastel: "#fef2f2", emoji: "⚗️" },
    "Educação Infantil": { bg: "#f472b6", fg: "#db2777", pastel: "#fce7f3", emoji: "🧸" },
};

/** Cor fallback para disciplinas não mapeadas */
const DEFAULT_COLOR = { bg: "#64748b", fg: "#475569", pastel: "#f1f5f9", emoji: "📚" };

function getColor(subject: string) {
    return curriculumColors[subject] || DEFAULT_COLOR;
}

// ─── Props ───

export interface CurriculumCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Nome da disciplina / componente curricular */
    subject: string;
    /** Ícone customizado (substitui o ícone flat padrão) */
    icon?: ReactNode;
    /** Metadados (ex: "24 habilidades", "3h/semana") */
    meta?: { label: string; value: string | number }[];
    /** Badge/tag no canto (ex: "BNCC", "Adaptado") */
    badge?: string;
    /** Subtítulo (ex: segmento, série) */
    subtitle?: string;
    /** Se é clicável */
    interactive?: boolean;
    /** Variante visual */
    variant?: "pastel" | "solid" | "outlined";
}

/**
 * CurriculumCard — Card de componente curricular.
 *
 * Ícone flat SVG no topo + emoji decorativo suave no fundo.
 * Inspirado em referências de dashboards educacionais.
 *
 * @example
 * ```tsx
 * <CurriculumCard
 *   subject="Matemática"
 *   subtitle="6º Ano — EF"
 *   meta={[
 *     { label: "Habilidades", value: 24 },
 *     { label: "Aulas/semana", value: "4h" },
 *   ]}
 *   badge="BNCC"
 * />
 * ```
 */
const CurriculumCard = forwardRef<HTMLDivElement, CurriculumCardProps>(
    ({ subject, icon, meta, badge, subtitle, interactive = true, variant = "pastel", className, children, ...props }, ref) => {
        const c = getColor(subject);

        const variantStyles = {
            pastel: {
                background: c.pastel,
                borderColor: `${c.bg}20`,
            },
            solid: {
                background: c.bg,
                borderColor: c.bg,
            },
            outlined: {
                background: "var(--omni-bg-secondary)",
                borderColor: c.bg,
            },
        };

        const textColor = variant === "solid" ? "#fff" : c.fg;
        const mutedColor = variant === "solid" ? "rgba(255,255,255,0.7)" : `${c.fg}99`;
        const emojiOpacity = variant === "solid" ? 0.08 : 0.06;

        return (
            <div
                ref={ref}
                className={cn(
                    "relative rounded-2xl border p-5 transition-all duration-200 overflow-hidden",
                    interactive && "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]",
                    className
                )}
                style={{
                    ...variantStyles[variant],
                    borderWidth: variant === "outlined" ? 2 : 1,
                }}
                {...props}
            >
                {/* ── Emoji Watermark no fundo ── */}
                <span
                    className="absolute pointer-events-none select-none"
                    style={{
                        right: -4,
                        top: "50%",
                        fontSize: 80,
                        opacity: emojiOpacity,
                        lineHeight: 1,
                        transform: "translateY(-50%) rotate(-12deg)",
                    }}
                    aria-hidden="true"
                >
                    {c.emoji}
                </span>

                {/* Badge */}
                {badge && (
                    <span
                        className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md z-10"
                        style={{
                            backgroundColor: variant === "solid" ? "rgba(255,255,255,0.2)" : `${c.bg}15`,
                            color: variant === "solid" ? "#fff" : c.bg,
                        }}
                    >
                        {badge}
                    </span>
                )}

                {/* Icon + Title */}
                <div className="relative z-10 flex items-start gap-3 mb-3">
                    <div
                        className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                        style={{
                            backgroundColor: variant === "solid" ? "rgba(255,255,255,0.2)" : `${c.bg}15`,
                            color: variant === "solid" ? "#fff" : c.bg,
                        }}
                    >
                        {icon || subjectIcons[subject] || defaultIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3
                            className="text-base font-bold leading-tight truncate"
                            style={{ color: textColor }}
                        >
                            {subject}
                        </h3>
                        {subtitle && (
                            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: mutedColor }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Meta grid */}
                {meta && meta.length > 0 && (
                    <div className={cn(
                        "relative z-10 grid gap-2",
                        meta.length === 1 ? "grid-cols-1" : meta.length === 2 ? "grid-cols-2" : "grid-cols-3"
                    )}>
                        {meta.map((m) => (
                            <div key={m.label}>
                                <p
                                    className="text-lg font-extrabold leading-none"
                                    style={{ color: textColor }}
                                >
                                    {m.value}
                                </p>
                                <p
                                    className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                                    style={{ color: mutedColor }}
                                >
                                    {m.label}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Slot for extra content */}
                {children && <div className="relative z-10">{children}</div>}
            </div>
        );
    }
);

CurriculumCard.displayName = "CurriculumCard";

export { CurriculumCard };
