import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type AccordionItem = { key: string; title: string; icon?: ReactNode; children: ReactNode };
export type AccordionProps = { items: AccordionItem[]; defaultOpenKeys?: string[]; multiple?: boolean; className?: string };

function Accordion({ items, defaultOpenKeys = [], multiple = false, className }: AccordionProps) {
    const [openKeys, setOpenKeys] = useState<Set<string>>(new Set(defaultOpenKeys));
    const toggle = (key: string) => {
        setOpenKeys((prev) => { const next = new Set(multiple ? prev : []); if (prev.has(key)) next.delete(key); else next.add(key); return next; });
    };
    return (
        <div className={cn("divide-y divide-[var(--omni-border-default)] border border-[var(--omni-border-default)] rounded-xl overflow-hidden", className)}>
            {items.map((item) => {
                const isOpen = openKeys.has(item.key);
                return (
                    <div key={item.key}>
                        <button onClick={() => toggle(item.key)} className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-[var(--omni-bg-tertiary)] transition-colors" aria-expanded={isOpen}>
                            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--omni-text-primary)]">{item.icon}{item.title}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("text-[var(--omni-text-muted)] transition-transform duration-200", isOpen && "rotate-180")}><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                            <div className="px-4 pb-4 text-sm text-[var(--omni-text-secondary)]">{item.children}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
export { Accordion };
