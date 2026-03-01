import { cn } from "../../utils/cn";

export type PaginationProps = { current: number; total: number; pageSize?: number; onChange: (page: number) => void; className?: string };

function Pagination({ current, total, pageSize = 10, onChange, className }: PaginationProps) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
        pages.push(1);
        if (current > 3) pages.push("...");
        for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) pages.push(i);
        if (current < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    const btn = "min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all";
    return (
        <nav className={cn("flex items-center gap-1", className)} aria-label="Paginação">
            <button disabled={current <= 1} onClick={() => onChange(current - 1)} className={cn(btn, "px-2 text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-tertiary)] disabled:opacity-30")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            {getPages().map((p, i) => p === "..." ? <span key={`e${i}`} className="px-1 text-[var(--omni-text-muted)]">…</span> : (
                <button key={p} onClick={() => onChange(p as number)} className={cn(btn, p === current ? "bg-sky-600 text-white shadow-sm" : "text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-tertiary)]")}>{p}</button>
            ))}
            <button disabled={current >= totalPages} onClick={() => onChange(current + 1)} className={cn(btn, "px-2 text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-tertiary)] disabled:opacity-30")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
        </nav>
    );
}
export { Pagination };
