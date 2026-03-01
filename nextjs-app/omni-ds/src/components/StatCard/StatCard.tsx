import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type StatCardProps = { title: string; value: string | number; icon?: ReactNode; trend?: { value: number; label?: string }; color?: string; className?: string };

function StatCard({ title, value, icon, trend, color = "#0ea5e9", className }: StatCardProps) {
    return (
        <div className={cn("p-5 rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] shadow-[var(--omni-shadow-md)] hover:shadow-[var(--omni-shadow-elevated)] hover:-translate-y-1 transition-all duration-200", className)}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--omni-text-muted)]">{title}</span>
                {icon && <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: color }}>{icon}</div>}
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--omni-text-primary)]">{value}</p>
            {trend && (
                <div className="flex items-center gap-1 mt-2">
                    <span className={cn("text-xs font-bold", trend.value >= 0 ? "text-emerald-600" : "text-red-500")}>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
                    {trend.label && <span className="text-xs text-[var(--omni-text-muted)]">{trend.label}</span>}
                </div>
            )}
        </div>
    );
}
export { StatCard };
