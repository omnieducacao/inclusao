import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type SectionTitleProps = {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
};

function SectionTitle({ title, subtitle, icon, action, className }: SectionTitleProps) {
    return (
        <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
            <div className="flex items-center gap-3 min-w-0">
                {icon && (
                    <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--omni-bg-tertiary)] text-[var(--omni-text-secondary)]">
                        {icon}
                    </span>
                )}
                <div className="min-w-0">
                    <h2 className="text-lg font-bold tracking-tight text-[var(--omni-text-primary)] truncate">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-[var(--omni-text-muted)] truncate mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

export { SectionTitle };
