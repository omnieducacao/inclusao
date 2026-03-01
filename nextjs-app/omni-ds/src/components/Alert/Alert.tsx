import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type AlertProps = { variant?: "info" | "success" | "warning" | "error"; title?: string; children: ReactNode; closable?: boolean; onClose?: () => void; icon?: ReactNode; className?: string };

const styles = {
    info:    { bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800", icon: "text-sky-600", title: "text-sky-800 dark:text-sky-200" },
    success: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", icon: "text-emerald-600", title: "text-emerald-800 dark:text-emerald-200" },
    warning: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-600", title: "text-amber-800 dark:text-amber-200" },
    error:   { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: "text-red-600", title: "text-red-800 dark:text-red-200" },
};

const defaultIcons: Record<string, string> = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };

function Alert({ variant = "info", title, children, closable, onClose, icon, className }: AlertProps) {
    const s = styles[variant];
    return (
        <div className={cn("flex gap-3 p-4 rounded-xl border", s.bg, s.border, className)} role="alert">
            <span className={cn("flex-shrink-0 text-lg", s.icon)}>{icon ?? defaultIcons[variant]}</span>
            <div className="flex-1 min-w-0">
                {title && <p className={cn("text-sm font-bold", s.title)}>{title}</p>}
                <div className={cn("text-sm text-[var(--omni-text-secondary)]", title && "mt-1")}>{children}</div>
            </div>
            {closable && (
                <button onClick={onClose} className="flex-shrink-0 p-1 rounded-lg text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] hover:bg-black/5 transition-colors" aria-label="Fechar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            )}
        </div>
    );
}
export { Alert };
