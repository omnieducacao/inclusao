import { cn } from "../../utils/cn";

export type ProgressProps = { value: number; max?: number; variant?: "linear" | "circular"; size?: "sm" | "md" | "lg"; color?: string; showValue?: boolean; label?: string; className?: string };

const linearSizes = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
const circularSizes = { sm: 48, md: 72, lg: 96 };

function Progress({ value, max = 100, variant = "linear", size = "md", color = "#0ea5e9", showValue = true, label, className }: ProgressProps) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    if (variant === "circular") {
        const s = circularSizes[size];
        const stroke = size === "sm" ? 4 : size === "md" ? 6 : 8;
        const r = (s - stroke) / 2;
        const circ = 2 * Math.PI * r;
        const offset = circ - (pct / 100) * circ;
        return (
            <div className={cn("inline-flex flex-col items-center gap-1", className)}>
                {label && <span className="text-xs font-semibold text-[var(--omni-text-muted)]">{label}</span>}
                <div className="relative" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label || `Progresso: ${Math.round(pct)}%`} style={{ width: s, height: s }}>
                    <svg width={s} height={s} className="-rotate-90">
                        <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke="var(--omni-bg-tertiary)" strokeWidth={stroke} />
                        <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
                    </svg>
                    {showValue && <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>{Math.round(pct)}%</span>}
                </div>
            </div>
        );
    }
    return (
        <div className={cn("w-full", className)}>
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-xs font-semibold text-[var(--omni-text-muted)]">{label}</span>}
                    {showValue && <span className="text-xs font-bold" style={{ color }}>{Math.round(pct)}%</span>}
                </div>
            )}
            <div className={cn("w-full rounded-full bg-[var(--omni-bg-tertiary)] overflow-hidden", linearSizes[size])} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label || `Progresso: ${Math.round(pct)}%`}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}
export { Progress };
