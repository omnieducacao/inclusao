import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type BreadcrumbItem = { label: string; href?: string; icon?: ReactNode };
export type BreadcrumbsProps = { items: BreadcrumbItem[]; separator?: ReactNode; className?: string };

function Breadcrumbs({ items, separator, className }: BreadcrumbsProps) {
    const sep = separator ?? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--omni-text-muted)]"><path d="m9 18 6-6-6-6"/></svg>;
    return (
        <nav className={cn("flex items-center gap-1.5 text-sm", className)} aria-label="Breadcrumb">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <span key={i} className="flex items-center gap-1.5">
                        {i > 0 && <span className="flex-shrink-0">{sep}</span>}
                        {item.href && !isLast ? (
                            <a href={item.href} className="flex items-center gap-1 text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] transition-colors">
                                {item.icon}{item.label}
                            </a>
                        ) : (
                            <span className={cn("flex items-center gap-1", isLast ? "font-semibold text-[var(--omni-text-primary)]" : "text-[var(--omni-text-muted)]")}>
                                {item.icon}{item.label}
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
export { Breadcrumbs };
