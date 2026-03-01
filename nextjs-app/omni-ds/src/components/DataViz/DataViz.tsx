import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

// ═══════════════════════════════════════════════
// DonutChart — Gráfico donut SVG com legenda
// ═══════════════════════════════════════════════

export interface DonutSegment {
    /** Label da categoria */
    label: string;
    /** Valor numérico */
    value: number;
    /** Cor */
    color: string;
}

export interface DonutChartProps extends HTMLAttributes<HTMLDivElement> {
    /** Segmentos do donut */
    segments: DonutSegment[];
    /** Diâmetro do donut */
    size?: number;
    /** Espessura do arco */
    strokeWidth?: number;
    /** Conteúdo central (ex: percentual) */
    centerLabel?: ReactNode;
    /** Mostrar legenda */
    showLegend?: boolean;
    /** Mostrar valores na legenda */
    showValues?: boolean;
    /** Formato do valor */
    valueFormatter?: (value: number) => string;
    /** Layout da legenda */
    legendPosition?: "right" | "bottom";
}

/**
 * DonutChart — Gráfico donut SVG com legenda.
 *
 * Donut chart leve e customizável com segmentos coloridos,
 * label central e legenda com valores. Inspirado em dashboards financeiros.
 */
const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(
    ({ segments, size = 140, strokeWidth = 24, centerLabel, showLegend = true, showValues = true, valueFormatter, legendPosition = "right", className, ...props }, ref) => {
        const total = segments.reduce((s, seg) => s + seg.value, 0);
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;

        // Build arcs
        let accumulated = 0;
        const arcs = segments.map(seg => {
            const pct = total > 0 ? seg.value / total : 0;
            const dashLength = pct * circumference;
            const dashGap = circumference - dashLength;
            const offset = -(accumulated * circumference) + circumference * 0.25; // start from top
            accumulated += pct;
            return { ...seg, pct, dashLength, dashGap, offset };
        });

        const formatVal = valueFormatter || ((v: number) => v.toLocaleString("pt-BR"));

        const isBottom = legendPosition === "bottom";

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex gap-5",
                    isBottom ? "flex-col items-center" : "items-center",
                    className
                )}
                {...props}
            >
                {/* Donut */}
                <div className="relative shrink-0" style={{ width: size, height: size }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        {/* Background circle */}
                        <circle
                            cx={size / 2} cy={size / 2} r={radius}
                            fill="none" stroke="var(--omni-border-default)" strokeWidth={strokeWidth}
                            opacity={0.15}
                        />
                        {/* Segments */}
                        {arcs.map((arc, i) => (
                            <circle
                                key={i}
                                cx={size / 2} cy={size / 2} r={radius}
                                fill="none" stroke={arc.color} strokeWidth={strokeWidth}
                                strokeDasharray={`${arc.dashLength} ${arc.dashGap}`}
                                strokeDashoffset={arc.offset}
                                strokeLinecap="butt"
                                style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }}
                            />
                        ))}
                    </svg>
                    {/* Center label */}
                    {centerLabel && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-extrabold text-[var(--omni-text-primary)]">
                                {centerLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* Legend */}
                {showLegend && (
                    <div className={cn("flex flex-col gap-2", isBottom && "flex-row flex-wrap justify-center gap-x-5")}>
                        {segments.map((seg) => {
                            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
                            return (
                                <div key={seg.label} className="flex items-center gap-2">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: seg.color }}
                                    />
                                    <span className="text-xs font-medium text-[var(--omni-text-secondary)]">
                                        {seg.label}
                                    </span>
                                    {showValues && (
                                        <span className="text-xs font-bold text-[var(--omni-text-primary)] ml-auto tabular-nums">
                                            {formatVal(seg.value)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
);

DonutChart.displayName = "DonutChart";

// ═══════════════════════════════════════════════
// GoalCard — Card de meta com ring + targets
// ═══════════════════════════════════════════════

export interface GoalTarget {
    /** Ícone ou emoji */
    icon: ReactNode;
    /** Nome do target */
    label: string;
    /** Progresso (ex: "12.567 de 25.000") */
    progress?: string;
    /** Cor do ícone background */
    color?: string;
}

export interface GoalCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Título */
    title: string;
    /** Subtítulo / período */
    subtitle?: string;
    /** Valor atual */
    current: number;
    /** Meta */
    goal: number;
    /** Unidade ou sufixo */
    unit?: string;
    /** Cor do ring */
    color?: string;
    /** Ação (ex: "Ver Relatório") */
    actionLabel?: string;
    /** Callback da ação */
    onAction?: () => void;
    /** Targets / sub-metas */
    targets?: GoalTarget[];
    /** Formatador de valor */
    valueFormatter?: (v: number) => string;
}

/**
 * GoalCard — Card de meta com ring progress + targets.
 *
 * Mostra progresso circular, valor grande, meta e grid de sub-targets.
 * Inspirado no "Saving Goal" do dashboard financeiro.
 */
const GoalCard = forwardRef<HTMLDivElement, GoalCardProps>(
    ({ title, subtitle, current, goal, unit, color = "#10b981", actionLabel, onAction, targets, valueFormatter, className, ...props }, ref) => {
        const pct = Math.min(100, (current / goal) * 100);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (pct / 100) * circumference;
        const formatVal = valueFormatter || ((v: number) => v.toLocaleString("pt-BR"));

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] p-5 transition-all duration-200 hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-0.5",
                    className
                )}
                {...props}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-bold text-[var(--omni-text-primary)]">{title}</p>
                        {subtitle && <p className="text-[11px] text-[var(--omni-text-muted)] mt-0.5">{subtitle}</p>}
                    </div>
                    {actionLabel && (
                        <button
                            type="button" onClick={onAction}
                            className="text-[11px] font-semibold px-3 py-1 rounded-lg border border-[var(--omni-border-default)] text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-hover)] transition-colors"
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>

                {/* Ring + Value */}
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
                        <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--omni-border-default)" strokeWidth="8" opacity={0.15} />
                            <circle
                                cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference} strokeDashoffset={offset}
                                style={{ transition: "stroke-dashoffset 0.6s ease" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-extrabold" style={{ color }}>{Math.round(pct)}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold tracking-tight text-[var(--omni-text-primary)]">
                            {formatVal(current)}
                        </p>
                        <p className="text-xs text-[var(--omni-text-muted)]">
                            de {formatVal(goal)}{unit ? ` ${unit}` : ""}
                        </p>
                    </div>
                </div>

                {/* Targets grid */}
                {targets && targets.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--omni-border-default)]">
                        {targets.map((t) => (
                            <div key={t.label} className="flex items-center gap-2.5">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                                    style={{ backgroundColor: `${t.color || color}12`, color: t.color || color }}
                                >
                                    {t.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-[var(--omni-text-primary)] truncate">{t.label}</p>
                                    {t.progress && (
                                        <p className="text-[10px] text-[var(--omni-text-muted)] truncate">{t.progress}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);

GoalCard.displayName = "GoalCard";

// ═══════════════════════════════════════════════
// ActivityRow — Linha de atividade / transação
// ═══════════════════════════════════════════════

export interface ActivityRowProps extends HTMLAttributes<HTMLDivElement> {
    /** Ícone ou avatar */
    icon: ReactNode;
    /** Cor de fundo do ícone */
    iconColor?: string;
    /** Título */
    title: string;
    /** Subtítulo / data */
    subtitle?: string;
    /** Valor à direita */
    trailing?: ReactNode;
    /** Se é clicável */
    clickable?: boolean;
}

/**
 * ActivityRow — Linha de atividade / feed.
 *
 * Ícone em circle colorido + título + subtítulo + valor trailing.
 * Ideal para feeds de atividade, logs, transações.
 */
const ActivityRow = forwardRef<HTMLDivElement, ActivityRowProps>(
    ({ icon, iconColor, title, subtitle, trailing, clickable = false, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    clickable && "cursor-pointer hover:bg-[var(--omni-bg-hover)]",
                    className
                )}
                {...props}
            >
                {/* Icon */}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm"
                    style={{
                        backgroundColor: iconColor ? `${iconColor}12` : "var(--omni-bg-hover)",
                        color: iconColor || "var(--omni-text-secondary)",
                    }}
                >
                    {icon}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--omni-text-primary)] truncate">{title}</p>
                    {subtitle && (
                        <p className="text-[11px] text-[var(--omni-text-muted)] truncate">{subtitle}</p>
                    )}
                </div>
                {/* Trailing */}
                {trailing && (
                    <div className="text-sm font-bold text-[var(--omni-text-primary)] shrink-0 text-right tabular-nums">
                        {trailing}
                    </div>
                )}
            </div>
        );
    }
);

ActivityRow.displayName = "ActivityRow";

export { DonutChart, GoalCard, ActivityRow };
