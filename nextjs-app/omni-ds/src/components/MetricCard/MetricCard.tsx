import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Rótulo do indicador */
    label: string;
    /** Valor principal */
    value: string | number;
    /** Ícone à direita */
    icon?: ReactNode;
    /** Variação percentual */
    trend?: { value: number; label?: string };
    /** Cor temática (hex) */
    color?: string;
    /** Variante de fundo */
    variant?: "gradient" | "pastel" | "flat";
    /** Sub-valor (ex: "de 100") */
    suffix?: string;
}

/**
 * MetricCard — Card de métrica premium com gradientes.
 *
 * Inspirado em dashboards educacionais com blocos coloridos,
 * números grandes e indicadores de tendência.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="Estudantes"
 *   value={230}
 *   trend={{ value: 12, label: "vs. mês anterior" }}
 *   icon={<Users size={20} />}
 *   color="#2563eb"
 *   variant="gradient"
 * />
 * ```
 */
const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
    ({ label, value, icon, trend, color = "#0ea5e9", variant = "gradient", suffix, className, ...props }, ref) => {

        const isGradient = variant === "gradient";
        const isPastel = variant === "pastel";
        const textPrimary = isGradient ? "#fff" : color;
        const textMuted = isGradient ? "rgba(255,255,255,0.7)" : `${color}88`;

        const bgStyle = isGradient
            ? { background: `linear-gradient(135deg, ${color}, ${color}cc)` }
            : isPastel
                ? { background: `${color}12`, border: `1px solid ${color}20` }
                : { background: "var(--omni-bg-secondary)", border: "1px solid var(--omni-border-default)" };

        return (
            <div
                ref={ref}
                className={cn(
                    "relative p-5 rounded-2xl overflow-hidden transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-lg",
                    className
                )}
                style={bgStyle}
                {...props}
            >
                {/* Decorative circle */}
                {isGradient && (
                    <div
                        className="absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                    />
                )}

                <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: textMuted }}>
                            {label}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                            <p className="text-3xl font-extrabold tracking-tight leading-none" style={{ color: textPrimary }}>
                                {value}
                            </p>
                            {suffix && (
                                <span className="text-sm font-medium" style={{ color: textMuted }}>{suffix}</span>
                            )}
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1.5 mt-2">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md",
                                        isGradient ? "bg-white/20" : trend.value >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                    )}
                                    style={isGradient ? { color: "#fff" } : undefined}
                                >
                                    {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
                                </span>
                                {trend.label && (
                                    <span className="text-[10px] font-medium" style={{ color: textMuted }}>{trend.label}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {icon && (
                        <div
                            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                            style={{
                                backgroundColor: isGradient ? "rgba(255,255,255,0.2)" : `${color}15`,
                                color: isGradient ? "#fff" : color,
                            }}
                        >
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

MetricCard.displayName = "MetricCard";

export { MetricCard };
