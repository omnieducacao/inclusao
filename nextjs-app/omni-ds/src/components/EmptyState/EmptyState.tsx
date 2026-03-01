import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../Button";

export type EmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
    className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-2xl",
                "border border-[var(--omni-border-default)]",
                "bg-[var(--omni-bg-tertiary)]/50",
                "py-12 px-6 text-center",
                className
            )}
            role="status"
            aria-label={title}
        >
            {Icon && (
                <div className="mb-4 p-3 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400">
                    <Icon className="w-10 h-10" aria-hidden />
                </div>
            )}
            <h3 className="text-lg font-semibold text-[var(--omni-text-primary)]">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-[var(--omni-text-muted)] max-w-sm">{description}</p>
            )}
            {action && (
                <div className="mt-4">
                    <Button variant="primary" size="sm" onClick={action.onClick}>
                        {action.label}
                    </Button>
                </div>
            )}
        </div>
    );
}
