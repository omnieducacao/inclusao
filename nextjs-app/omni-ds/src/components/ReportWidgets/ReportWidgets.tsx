import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { feedbackColors } from "../../tokens/colors";

// ─── ScoreBar ───

export interface ScoreBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Valor atual (0-100) */
    value: number;
    /** Posição do marcador (line indicator) — valor de 0-100. Se omitido, usa `value` */
    marker?: number;
    /** Cor da barra (auto: verde >60, amarelo 40-60, vermelho <40) */
    color?: "auto" | "green" | "yellow" | "red" | string;
    /** Largura */
    width?: number | string;
    /** Altura da barra */
    height?: number;
    /** Mostra label de porcentagem */
    showLabel?: boolean;
}

const autoColor = (v: number) =>
    v >= 60 ? feedbackColors.success.base : v >= 40 ? feedbackColors.warning.base : feedbackColors.error.base;

const namedColors: Record<string, string> = {
    green: feedbackColors.success.base,
    yellow: feedbackColors.warning.base,
    red: feedbackColors.error.base,
};

/**
 * ScoreBar — Barra de desempenho com marcador de posição.
 *
 * Barra colorida (verde/amarelo/vermelho) com um marcador vertical
 * indicando a posição relativa. Ideal para relatórios educacionais.
 */
const ScoreBar = forwardRef<HTMLDivElement, ScoreBarProps>(
    ({ value, marker, color = "auto", width = 120, height = 8, showLabel, className, ...props }, ref) => {
        const barColor = color === "auto" ? autoColor(value) : namedColors[color] || color;
        const markerPos = marker ?? value;

        return (
            <div ref={ref} className={cn("inline-flex items-center gap-2", className)} {...props}>
                <div
                    className="relative rounded-full overflow-hidden"
                    style={{ width, height, backgroundColor: `${barColor}20` }}
                >
                    {/* Fill */}
                    <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: barColor }}
                    />
                    {/* Marker line */}
                    <div
                        className="absolute top-[-2px] bottom-[-2px] w-[3px] rounded-sm transition-all duration-300"
                        style={{
                            left: `${Math.min(100, Math.max(0, markerPos))}%`,
                            backgroundColor: "var(--omni-text-primary, #1e293b)",
                            transform: "translateX(-50%)",
                        }}
                    />
                </div>
                {showLabel && (
                    <span className="text-sm font-bold tabular-nums" style={{ color: barColor }}>
                        {Math.round(value)}%
                    </span>
                )}
            </div>
        );
    }
);

ScoreBar.displayName = "ScoreBar";

// ─── SubjectProgressRow ───

export type PerformanceStatus = "intervir" | "acompanhar" | "desafiar";

const statusConfig: Record<PerformanceStatus, { label: string; color: string; bg: string }> = {
    intervir: { label: "Intervir", color: feedbackColors.error.base, bg: feedbackColors.error.soft },
    acompanhar: { label: "Acompanhar", color: feedbackColors.warning.base, bg: feedbackColors.warning.soft },
    desafiar: { label: "Desafiar", color: feedbackColors.success.base, bg: feedbackColors.success.soft },
};

export interface SubjectProgressRowProps extends HTMLAttributes<HTMLDivElement> {
    /** Nome da disciplina */
    subject: string;
    /** Metadado (ex: "4 assuntos, 6 questões") */
    meta?: string;
    /** Status de desempenho */
    status: PerformanceStatus;
    /** Percentual (0-100) */
    percentage: number;
    /** Posição do marcador na barra */
    marker?: number;
    /** Se é expansível */
    expandable?: boolean;
    /** Se está expandido */
    expanded?: boolean;
    /** Callback ao expandir */
    onToggle?: () => void;
    /** Conteúdo expandido */
    children?: ReactNode;
}

/**
 * SubjectProgressRow — Linha de disciplina de relatório.
 *
 * Mostra nome da disciplina, metadados, badge de status (Intervir/Acompanhar/Desafiar),
 * barra de progresso com marcador e percentual. Pode ser expansível.
 */
const SubjectProgressRow = forwardRef<HTMLDivElement, SubjectProgressRowProps>(
    ({ subject, meta, status, percentage, marker, expandable = false, expanded = false, onToggle, children, className, ...props }, ref) => {
        const cfg = statusConfig[status];

        return (
            <div ref={ref} className={cn("border border-[var(--omni-border-default)] rounded-xl overflow-hidden transition-all", className)} {...props}>
                <div
                    className={cn(
                        "flex items-center gap-4 px-5 py-4",
                        expandable && "cursor-pointer hover:bg-[var(--omni-bg-hover)]"
                    )}
                    onClick={expandable ? onToggle : undefined}
                    style={{ borderLeft: `3px solid ${cfg.color}` }}
                >
                    {/* Subject info */}
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-[var(--omni-text-primary)]">{subject}</span>
                        {meta && (
                            <span className="text-xs text-[var(--omni-text-muted)] ml-2">{meta}</span>
                        )}
                    </div>

                    {/* Status badge */}
                    <span
                        className="px-2.5 py-1 text-[11px] font-bold rounded-md shrink-0"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                        {cfg.label}
                    </span>

                    {/* Score bar */}
                    <ScoreBar value={percentage} marker={marker} color={cfg.color} width={120} />

                    {/* Percentage */}
                    <span className="text-sm font-bold tabular-nums text-[var(--omni-text-primary)] w-10 text-right shrink-0">
                        {percentage}%
                    </span>

                    {/* Expand arrow */}
                    {expandable && (
                        <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={cn("shrink-0 transition-transform text-[var(--omni-text-muted)]", expanded && "rotate-180")}
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    )}
                </div>
                {/* Expanded content */}
                {expandable && expanded && children && (
                    <div className="px-5 pb-4 pt-0 border-t border-[var(--omni-border-default)]">
                        {children}
                    </div>
                )}
            </div>
        );
    }
);

SubjectProgressRow.displayName = "SubjectProgressRow";

// ─── RecommendationPanel ───

export interface RecommendationCategory {
    /** Quantidade */
    count: number;
    /** Lista de itens (ex: nomes de disciplinas) */
    items: string[];
}

export interface RecommendationPanelProps extends HTMLAttributes<HTMLDivElement> {
    /** Dados de "Intervir" */
    intervir: RecommendationCategory;
    /** Dados de "Acompanhar" */
    acompanhar: RecommendationCategory;
    /** Dados de "Desafiar" */
    desafiar: RecommendationCategory;
    /** Link de ação */
    actionLabel?: string;
    /** Callback da ação */
    onAction?: () => void;
}

/**
 * RecommendationPanel — Painel de recomendações tripartido.
 *
 * 3 colunas: Intervir (vermelho), Acompanhar (amarelo), Desafiar (verde).
 * Cada coluna mostra quantidade e lista de disciplinas.
 */
const RecommendationPanel = forwardRef<HTMLDivElement, RecommendationPanelProps>(
    ({ intervir, acompanhar, desafiar, actionLabel, onAction, className, ...props }, ref) => {
        const cols: { key: PerformanceStatus; data: RecommendationCategory; icon: ReactNode }[] = [
            {
                key: "intervir", data: intervir,
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>,
            },
            {
                key: "acompanhar", data: acompanhar,
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" /></svg>,
            },
            {
                key: "desafiar", data: desafiar,
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
            },
        ];

        return (
            <div ref={ref} className={cn("rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] overflow-hidden transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5", className)} {...props}>
                <div className="grid grid-cols-3 divide-x divide-[var(--omni-border-default)]">
                    {cols.map(({ key, data, icon }) => {
                        const cfg = statusConfig[key];
                        return (
                            <div key={key} className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    {icon}
                                    <span className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                                </div>
                                <p className="text-sm font-semibold text-[var(--omni-text-primary)]">
                                    {data.count} disciplina{data.count !== 1 ? "s" : ""}
                                </p>
                                <p className="text-xs text-[var(--omni-text-muted)] mt-0.5 truncate">
                                    {data.items.join(", ")}
                                </p>
                            </div>
                        );
                    })}
                </div>
                {actionLabel && (
                    <div className="border-t border-[var(--omni-border-default)] px-5 py-3 text-center">
                        <button
                            type="button" onClick={onAction}
                            className="text-sm font-semibold text-[var(--omni-primary)] hover:underline inline-flex items-center gap-1"
                        >
                            {actionLabel}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </div>
        );
    }
);

RecommendationPanel.displayName = "RecommendationPanel";

// ─── RankingCard ───

export interface RankingCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Título (ex: "Ranking Nacional") */
    title: string;
    /** Subtítulo (ex: "Minha escola") */
    subtitle?: string;
    /** Posição geral */
    position: number | string;
    /** Sub-rankings por área */
    areas?: { label: string; position: number | string }[];
    /** Informações extras no rodapé */
    footer?: { icon?: ReactNode; text: string }[];
    /** Cor de destaque */
    color?: string;
}

/**
 * RankingCard — Card de posição em ranking.
 *
 * Mostra posição principal grande + sub-rankings por área.
 * Inspirado no card de "Ranking nacional escolas COC".
 */
const RankingCard = forwardRef<HTMLDivElement, RankingCardProps>(
    ({ title, subtitle, position, areas, footer, color = "#6366f1", className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] p-5 text-center transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5",
                    className
                )}
                {...props}
            >
                <p className="text-sm font-bold text-[var(--omni-text-primary)]">{title}</p>
                {subtitle && (
                    <p className="text-xs text-[var(--omni-text-muted)] mt-0.5 flex items-center justify-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21h18M5 21V7l7-4 7 4v14" /></svg>
                        {subtitle}
                    </p>
                )}

                {/* Main position */}
                <p className="text-4xl font-extrabold mt-3 tracking-tight" style={{ color }}>
                    {position}<span className="text-lg align-super">º</span>
                </p>

                {/* Area sub-rankings */}
                {areas && areas.length > 0 && (
                    <div className={cn(
                        "grid gap-3 mt-4",
                        areas.length <= 2 ? "grid-cols-2" : "grid-cols-2"
                    )}>
                        {areas.map((a) => (
                            <div key={a.label}>
                                <p className="text-xl font-extrabold text-[var(--omni-text-primary)]">
                                    {a.position}<span className="text-xs align-super">º</span>
                                </p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--omni-text-muted)]">
                                    {a.label}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {footer && footer.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--omni-border-default)] space-y-1">
                        {footer.map((f, i) => (
                            <p key={i} className="text-xs text-[var(--omni-text-muted)] flex items-center justify-center gap-1.5">
                                {f.icon}{f.text}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);

RankingCard.displayName = "RankingCard";

// ─── PanoramaCard ───

export interface PanoramaStatLine {
    /** Rótulo (ex: "Docentes com turmas") */
    label: string;
    /** Valor atual */
    current: number;
    /** Valor total */
    total: number;
    /** Cor da barra */
    color?: "green" | "red" | "yellow" | "blue" | string;
    /** Detalhe (ex: "Professor ainda não tem turma") */
    detail?: string;
}

export interface PanoramaCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Título do card */
    title: string;
    /** Linhas de estatística */
    lines: PanoramaStatLine[];
    /** Mostrar ícone de info */
    showInfo?: boolean;
}

const panoramaColors: Record<string, string> = {
    green: feedbackColors.success.base, red: feedbackColors.error.base, yellow: feedbackColors.warning.base, blue: feedbackColors.info.base,
};

/**
 * PanoramaCard — Card de panorama com linhas de estatística.
 *
 * Mostra título + linhas com: label, fração (current/total), percentual,
 * barra de progresso e detalhe. Inspirado no "Panorama de docentes e estudantes".
 */
const PanoramaCard = forwardRef<HTMLDivElement, PanoramaCardProps>(
    ({ title, lines, showInfo = true, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] p-5 transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5",
                    className
                )}
                {...props}
            >
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-[var(--omni-text-primary)]">{title}</p>
                    {showInfo && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--omni-text-muted)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                        </svg>
                    )}
                </div>
                <div className="space-y-4">
                    {lines.map((line, i) => {
                        const pct = line.total > 0 ? Math.round((line.current / line.total) * 100) : 0;
                        const barColor = panoramaColors[line.color || "green"] || line.color || "#10b981";
                        return (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-[var(--omni-text-primary)]">{line.label}</span>
                                    <span className="text-sm font-bold tabular-nums text-[var(--omni-text-primary)]">
                                        {line.current}<span className="text-[var(--omni-text-muted)] font-normal">/{line.total}</span>{" "}
                                        <span className="text-xs text-[var(--omni-text-muted)]">({pct}%)</span>
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${barColor}20` }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                                    />
                                </div>
                                {line.detail && (
                                    <p className="text-[11px] text-[var(--omni-text-muted)] mt-1">{line.detail}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

PanoramaCard.displayName = "PanoramaCard";

// ─── StatusDot ───

export type StatusDotVariant = "success" | "error" | "warning" | "info" | "neutral";

const dotColors: Record<StatusDotVariant, { dot: string; text: string }> = {
    success: { dot: feedbackColors.success.base, text: feedbackColors.success.text },
    error: { dot: feedbackColors.error.base, text: feedbackColors.error.text },
    warning: { dot: feedbackColors.warning.base, text: feedbackColors.warning.text },
    info: { dot: feedbackColors.info.base, text: feedbackColors.info.text },
    neutral: { dot: feedbackColors.neutral.base, text: feedbackColors.neutral.text },
};

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
    /** Variante de cor */
    variant?: StatusDotVariant;
    /** Texto do label */
    label: string;
    /** Tamanho do dot */
    size?: number;
}

/**
 * StatusDot — Indicador de status com dot colorido.
 *
 * Usado em tabelas para indicar estado: ● Finalizado, ● Sem respostas, etc.
 */
function StatusDot({ variant = "neutral", label, size = 8, className, ...props }: StatusDotProps) {
    const c = dotColors[variant];
    return (
        <span className={cn("inline-flex items-center gap-2 text-sm font-semibold", className)} style={{ color: c.text }} {...props}>
            <span className="shrink-0 rounded-full" style={{ width: size, height: size, backgroundColor: c.dot }} />
            {label}
        </span>
    );
}

// ─── LegendBar ───

export interface LegendItem {
    /** Cor do quadrado */
    color: string;
    /** Label */
    label: string;
}

export interface LegendBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Itens da legenda */
    items: LegendItem[];
    /** Formato do indicador */
    shape?: "square" | "dot" | "line";
}

/**
 * LegendBar — Legenda horizontal com indicadores coloridos.
 *
 * Mostra quadrados/dots coloridos + labels. Usado em gráficos e relatórios.
 * Ex: ■ Alto: 70% ou mais · ■ Médio: 50-69% · ■ Baixo: <50%
 */
function LegendBar({ items, shape = "square", className, ...props }: LegendBarProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-4", className)} {...props}>
            {items.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--omni-text-secondary)]">
                    <span
                        className="shrink-0"
                        style={{
                            width: shape === "line" ? 16 : 10,
                            height: shape === "line" ? 3 : 10,
                            backgroundColor: item.color,
                            borderRadius: shape === "dot" ? "50%" : shape === "line" ? 2 : 2,
                        }}
                    />
                    {item.label}
                </span>
            ))}
        </div>
    );
}

export { ScoreBar, SubjectProgressRow, RecommendationPanel, RankingCard, PanoramaCard, StatusDot, LegendBar };

