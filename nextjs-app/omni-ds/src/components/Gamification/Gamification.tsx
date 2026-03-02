import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { feedbackColors, masteryColors, brandColors } from "../../tokens/colors";

// ═══════════════════════════════════════════════
// StreakCalendar — Grade de dias com intensidade
// ═══════════════════════════════════════════════

export interface StreakDay {
    /** Data (YYYY-MM-DD) */
    date: string;
    /** Intensidade 0-4 (0=nenhum, 1=pouco, 4=muito) */
    intensity: 0 | 1 | 2 | 3 | 4;
}

export interface StreakCalendarProps extends HTMLAttributes<HTMLDivElement> {
    /** Dados dos dias */
    days: StreakDay[];
    /** Semanas a exibir (padrão: 12) */
    weeks?: number;
    /** Cor temática */
    color?: string;
    /** Mostrar labels dos dias da semana */
    showDayLabels?: boolean;
    /** Mostrar labels dos meses */
    showMonthLabels?: boolean;
    /** Mostrar contagem de streak atual */
    streakCount?: number;
    /** Tamanho de cada célula */
    cellSize?: number;
    /** Gap entre células */
    cellGap?: number;
}

const intensityOpacity = [0.06, 0.25, 0.5, 0.75, 1];

/**
 * StreakCalendar — Calendário de sequência de estudo (tipo GitHub/Duolingo).
 *
 * Grade de células coloridas por intensidade, mostrando o padrão de estudo
 * ao longo das semanas. Inspirado nos calendários de contribuição.
 */
const StreakCalendar = forwardRef<HTMLDivElement, StreakCalendarProps>(
    ({ days, weeks = 12, color = feedbackColors.success.base, showDayLabels = true, showMonthLabels = true, streakCount, cellSize = 14, cellGap = 3, className, ...props }, ref) => {

        // Build a lookup map
        const dayMap = new Map(days.map(d => [d.date, d.intensity]));

        // Generate grid: weeks × 7 days
        const today = new Date();
        const totalDays = weeks * 7;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - totalDays + 1);
        // Align to Monday
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - ((dayOfWeek + 6) % 7));

        const grid: { date: string; intensity: number }[][] = [];
        const current = new Date(startDate);

        for (let w = 0; w < weeks; w++) {
            const week: { date: string; intensity: number }[] = [];
            for (let d = 0; d < 7; d++) {
                const key = current.toISOString().slice(0, 10);
                week.push({ date: key, intensity: dayMap.get(key) ?? 0 });
                current.setDate(current.getDate() + 1);
            }
            grid.push(week);
        }

        const dayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

        return (
            <div ref={ref} className={cn("inline-flex flex-col gap-2", className)} {...props}>
                {/* Streak counter */}
                {streakCount !== undefined && (
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🔥</span>
                        <div>
                            <p className="text-2xl font-extrabold tracking-tight text-(--omni-text-primary)">{streakCount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-(--omni-text-muted)">dias seguidos</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-1">
                    {/* Day labels */}
                    {showDayLabels && (
                        <div className="flex flex-col pr-1" style={{ gap: cellGap }}>
                            {dayLabels.map((label, i) => (
                                <span
                                    key={i}
                                    className="text-[9px] font-semibold text-(--omni-text-muted) flex items-center justify-end"
                                    style={{ height: cellSize, lineHeight: `${cellSize}px` }}
                                >
                                    {i % 2 === 0 ? label : ""}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    <div className="flex" style={{ gap: cellGap }}>
                        {grid.map((week, wi) => (
                            <div key={wi} className="flex flex-col" style={{ gap: cellGap }}>
                                {week.map((day, di) => (
                                    <div
                                        key={di}
                                        className="rounded-sm transition-colors"
                                        style={{
                                            width: cellSize,
                                            height: cellSize,
                                            backgroundColor: color,
                                            opacity: intensityOpacity[day.intensity],
                                        }}
                                        title={`${day.date}: nível ${day.intensity}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] text-(--omni-text-muted) mr-1">Menos</span>
                    {[0, 1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="rounded-sm"
                            style={{ width: cellSize - 2, height: cellSize - 2, backgroundColor: color, opacity: intensityOpacity[i] }}
                        />
                    ))}
                    <span className="text-[9px] text-(--omni-text-muted) ml-1">Mais</span>
                </div>
            </div>
        );
    }
);

StreakCalendar.displayName = "StreakCalendar";

// ═══════════════════════════════════════════════
// MasteryBar — Barra multi-nível de maestria
// ═══════════════════════════════════════════════

export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

const masteryConfig: { label: string; color: string; bg: string }[] = [
    { label: "Não iniciado", color: masteryColors.none.base, bg: masteryColors.none.bg },
    { label: "Iniciante", color: masteryColors.beginner.base, bg: masteryColors.beginner.bg },
    { label: "Praticando", color: masteryColors.learning.base, bg: masteryColors.learning.bg },
    { label: "Avançado", color: masteryColors.advanced.base, bg: masteryColors.advanced.bg },
    { label: "Dominado", color: masteryColors.mastered.base, bg: masteryColors.mastered.bg },
];

export interface MasteryBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Nível de maestria (0-4) */
    level: MasteryLevel;
    /** Mostrar label de nível */
    showLabel?: boolean;
    /** Label customizado */
    labels?: string[];
    /** Tamanho */
    size?: "sm" | "md" | "lg";
}

/**
 * MasteryBar — Barra multi-nível de maestria (estilo Xueersi/Atama+).
 *
 * 5 segmentos que acendem progressivamente com cores distintas,
 * representando a evolução: não iniciado → dominado.
 */
const MasteryBar = forwardRef<HTMLDivElement, MasteryBarProps>(
    ({ level, showLabel = true, labels, size = "md", className, ...props }, ref) => {
        const heights = { sm: 4, md: 6, lg: 8 };
        const h = heights[size];
        const cfg = masteryConfig[level];
        const customLabels = labels || masteryConfig.map(m => m.label);

        return (
            <div ref={ref} className={cn("inline-flex flex-col gap-1.5", className)} {...props}>
                <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="flex-1 rounded-full transition-all duration-300"
                            style={{
                                height: h,
                                minWidth: size === "sm" ? 16 : size === "md" ? 24 : 32,
                                backgroundColor: i <= level ? masteryConfig[Math.min(i, 4)].color : "var(--omni-border-default)",
                                opacity: i <= level ? 1 : 0.3,
                            }}
                        />
                    ))}
                </div>
                {showLabel && (
                    <div className="flex items-center gap-1.5">
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cfg.color }}
                        />
                        <span className="text-xs font-semibold" style={{ color: cfg.color }}>
                            {customLabels[level]}
                        </span>
                    </div>
                )}
            </div>
        );
    }
);

MasteryBar.displayName = "MasteryBar";

// ═══════════════════════════════════════════════
// StudyGoalRing — Anel circular de meta diária
// ═══════════════════════════════════════════════

export interface StudyGoalRingProps extends HTMLAttributes<HTMLDivElement> {
    /** Valor atual */
    current: number;
    /** Meta */
    goal: number;
    /** Unidade (ex: "min", "exercícios") */
    unit?: string;
    /** Cor do anel */
    color?: string;
    /** Diâmetro */
    diameter?: number;
    /** Espessura do anel */
    strokeWidth?: number;
    /** Ícone ou conteúdo central */
    icon?: ReactNode;
    /** Label abaixo */
    label?: string;
}

/**
 * StudyGoalRing — Anel circular de progresso de meta diária.
 *
 * Inspirado no StudySapuri e Yuanfudao. SVG ring com
 * valor central, unidade e label. Animação suave.
 */
const StudyGoalRing = forwardRef<HTMLDivElement, StudyGoalRingProps>(
    ({ current, goal, unit = "min", color = feedbackColors.success.base, diameter = 120, strokeWidth = 8, icon, label, className, ...props }, ref) => {
        const pct = Math.min(100, (current / goal) * 100);
        const radius = (diameter - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (pct / 100) * circumference;
        const isComplete = current >= goal;

        return (
            <div ref={ref} className={cn("inline-flex flex-col items-center gap-2", className)} {...props}>
                <div className="relative" style={{ width: diameter, height: diameter }}>
                    <svg width={diameter} height={diameter} className="transform -rotate-90">
                        {/* Background ring */}
                        <circle
                            cx={diameter / 2} cy={diameter / 2} r={radius}
                            fill="none" stroke="var(--omni-border-default)"
                            strokeWidth={strokeWidth} opacity={0.3}
                        />
                        {/* Progress ring */}
                        <circle
                            cx={diameter / 2} cy={diameter / 2} r={radius}
                            fill="none" stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: "stroke-dashoffset 0.6s ease" }}
                        />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {icon && <span className="mb-0.5">{icon}</span>}
                        <p className="text-xl font-extrabold tracking-tight text-(--omni-text-primary)">
                            {current}<span className="text-xs font-semibold text-(--omni-text-muted)">/{goal}</span>
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-(--omni-text-muted)">{unit}</p>
                    </div>
                </div>
                {/* Label */}
                {label && (
                    <p className="text-xs font-semibold text-(--omni-text-secondary)">{label}</p>
                )}
                {/* Complete badge */}
                {isComplete && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${color}15`, color }}>
                        ✓ Meta atingida!
                    </span>
                )}
            </div>
        );
    }
);

StudyGoalRing.displayName = "StudyGoalRing";

// ═══════════════════════════════════════════════
// SkillBadge — Badge de conquista com nível + XP
// ═══════════════════════════════════════════════

export interface SkillBadgeProps extends HTMLAttributes<HTMLDivElement> {
    /** Nome da habilidade */
    name: string;
    /** Nível */
    level: number;
    /** XP atual */
    xp?: number;
    /** XP necessário pro próximo nível */
    xpNext?: number;
    /** Ícone / emoji */
    icon?: ReactNode;
    /** Cor do badge */
    color?: string;
    /** Variante */
    variant?: "default" | "compact" | "mini";
    /** Se está desbloqueado */
    unlocked?: boolean;
}

/**
 * SkillBadge — Badge de conquista com nível e XP.
 *
 * Mostra ícone, nível, barra de XP e nome. Inspirado na
 * gamificação de Duolingo/Yuanfudao.
 */
const SkillBadge = forwardRef<HTMLDivElement, SkillBadgeProps>(
    ({ name, level, xp, xpNext, icon, color = brandColors.primary, variant = "default", unlocked = true, className, ...props }, ref) => {
        const isMini = variant === "mini";
        const isCompact = variant === "compact";
        const xpPct = xp !== undefined && xpNext ? Math.min(100, (xp / xpNext) * 100) : 0;

        if (isMini) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all",
                        unlocked ? "border-transparent" : "border-dashed border-(--omni-border-default) opacity-40",
                        className
                    )}
                    style={unlocked ? { backgroundColor: `${color}12`, color } : undefined}
                    {...props}
                >
                    {icon && <span className="text-sm">{icon}</span>}
                    <span>Nv.{level}</span>
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-(--omni-shadow-elevated) hover:-translate-y-0.5",
                    unlocked
                        ? "border-(--omni-border-default) bg-(--omni-bg-secondary)"
                        : "border-dashed border-(--omni-border-default) bg-(--omni-bg-secondary) opacity-50",
                    isCompact ? "p-3" : "p-4",
                    className
                )}
                {...props}
            >
                <div className={cn("flex items-center gap-3", isCompact && "gap-2")}>
                    {/* Icon */}
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-xl shrink-0",
                            isCompact ? "w-9 h-9 text-lg" : "w-12 h-12 text-2xl"
                        )}
                        style={{ backgroundColor: unlocked ? `${color}15` : "var(--omni-bg-hover)", color: unlocked ? color : "var(--omni-text-muted)" }}
                    >
                        {icon || "⭐"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className={cn("font-bold text-(--omni-text-primary) truncate", isCompact ? "text-xs" : "text-sm")}>
                            {name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${color}15`, color }}
                            >
                                Nv.{level}
                            </span>
                            {xp !== undefined && xpNext && (
                                <span className="text-[10px] text-(--omni-text-muted) font-semibold tabular-nums">
                                    {xp}/{xpNext} XP
                                </span>
                            )}
                        </div>
                    </div>
                    {!unlocked && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-(--omni-text-muted) shrink-0">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    )}
                </div>
                {/* XP bar */}
                {xp !== undefined && xpNext && !isCompact && (
                    <div className="mt-3">
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}15` }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${xpPct}%`, backgroundColor: color }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

SkillBadge.displayName = "SkillBadge";

// ═══════════════════════════════════════════════
// DifficultyDots — Indicador visual de dificuldade
// ═══════════════════════════════════════════════

export interface DifficultyDotsProps extends HTMLAttributes<HTMLDivElement> {
    /** Nível de dificuldade (1-5) */
    level: 1 | 2 | 3 | 4 | 5;
    /** Total de dots */
    max?: number;
    /** Formato: dots ou stars */
    shape?: "dots" | "stars" | "bars";
    /** Cor ativa (auto = verde→vermelho) */
    color?: "auto" | string;
    /** Tamanho */
    size?: "sm" | "md" | "lg";
    /** Mostrar label */
    showLabel?: boolean;
    /** Labels customizados */
    labels?: string[];
}

const difficultyLabels = ["Muito fácil", "Fácil", "Médio", "Difícil", "Muito difícil"];
const difficultyColors = [
    feedbackColors.success.base,
    "#22c55e",
    feedbackColors.warning.base,
    "#f97316",
    feedbackColors.error.base,
];

/**
 * DifficultyDots — Indicador visual de dificuldade.
 *
 * Dots, estrelas ou barras que representam a dificuldade.
 * Auto-coloring: verde (fácil) → vermelho (difícil).
 */
function DifficultyDots({ level, max = 5, shape = "dots", color = "auto", size = "md", showLabel = false, labels, className, ...props }: DifficultyDotsProps) {
    const activeColor = color === "auto" ? difficultyColors[level - 1] : color;
    const sizes = { sm: 6, md: 8, lg: 10 };
    const s = sizes[size];
    const customLabels = labels || difficultyLabels;

    return (
        <div className={cn("inline-flex items-center gap-1.5", className)} {...props}>
            {Array.from({ length: max }, (_, i) => {
                const active = i < level;
                if (shape === "stars") {
                    return (
                        <svg key={i} width={s + 4} height={s + 4} viewBox="0 0 24 24" fill={active ? activeColor : "none"} stroke={active ? activeColor : "var(--omni-border-default)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    );
                }
                if (shape === "bars") {
                    return (
                        <div
                            key={i}
                            className="rounded-sm transition-all"
                            style={{
                                width: s - 2,
                                height: s + (i * 3),
                                backgroundColor: active ? activeColor : "var(--omni-border-default)",
                                opacity: active ? 1 : 0.3,
                            }}
                        />
                    );
                }
                return (
                    <div
                        key={i}
                        className="rounded-full transition-all"
                        style={{
                            width: s,
                            height: s,
                            backgroundColor: active ? activeColor : "var(--omni-border-default)",
                            opacity: active ? 1 : 0.3,
                        }}
                    />
                );
            })}
            {showLabel && (
                <span className="text-xs font-semibold ml-1" style={{ color: activeColor }}>
                    {customLabels[level - 1]}
                </span>
            )}
        </div>
    );
}

export { StreakCalendar, MasteryBar, StudyGoalRing, SkillBadge, DifficultyDots };
