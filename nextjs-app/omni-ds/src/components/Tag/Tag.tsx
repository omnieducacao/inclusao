import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type TagProps = { children: ReactNode; color?: string; closable?: boolean; onClose?: () => void; icon?: ReactNode; variant?: "filled" | "outlined"; className?: string };

const presetColors: Record<string, { bg: string; text: string; border: string }> = {
    blue:    { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
    green:   { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    red:     { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
    orange:  { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    purple:  { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
    default: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
};

function Tag({ children, color = "default", closable, onClose, icon, variant = "filled", className }: TagProps) {
    const preset = presetColors[color] || presetColors.default;
    const isCustom = color.startsWith("#");
    return (
        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
            isCustom ? "border-current/20" : cn(variant === "filled" ? preset.bg : "bg-transparent", preset.text, preset.border), className
        )} style={isCustom ? { color, backgroundColor: `${color}18`, borderColor: `${color}30` } : undefined}>
            {icon}{children}
            {closable && (
                <button onClick={onClose} className="ml-0.5 p-0.5 rounded hover:bg-black/10 transition-colors" aria-label="Remover">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            )}
        </span>
    );
}
export { Tag };
