import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type TabItem = { key: string; label: string; icon?: ReactNode; disabled?: boolean };
export type TabsProps = {
    items: TabItem[];
    activeKey?: string;
    defaultActiveKey?: string;
    onChange?: (key: string) => void;
    variant?: "line" | "card" | "pill";
    children?: (activeKey: string) => ReactNode;
    className?: string;
};

function Tabs({ items, activeKey: controlledKey, defaultActiveKey, onChange, variant = "line", children, className }: TabsProps) {
    const [internalKey, setInternalKey] = useState(defaultActiveKey || items[0]?.key || "");
    const activeKey = controlledKey ?? internalKey;
    const handleClick = (key: string) => { setInternalKey(key); onChange?.(key); };

    const base = "inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer select-none whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed";
    const variants = {
        line: { wrapper: "flex border-b border-[var(--omni-border-default)] gap-1", tab: "px-4 py-2.5 text-sm -mb-px", active: "text-sky-600 border-b-2 border-sky-600", inactive: "text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)]" },
        card: { wrapper: "flex bg-[var(--omni-bg-tertiary)] p-1 rounded-xl gap-1", tab: "px-4 py-2 text-sm rounded-lg", active: "bg-[var(--omni-bg-secondary)] text-[var(--omni-text-primary)] shadow-[var(--omni-shadow-sm)]", inactive: "text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)]" },
        pill: { wrapper: "flex gap-2", tab: "px-4 py-2 text-sm rounded-full", active: "bg-sky-600 text-white shadow-sm", inactive: "bg-[var(--omni-bg-tertiary)] text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-hover)]" },
    };
    const v = variants[variant];
    return (
        <div className={className}>
            <div className={v.wrapper} role="tablist">
                {items.map((item) => (
                    <button key={item.key} role="tab" aria-selected={activeKey === item.key} disabled={item.disabled}
                        className={cn(base, v.tab, activeKey === item.key ? v.active : v.inactive)}
                        onClick={() => !item.disabled && handleClick(item.key)}
                    >
                        {item.icon}{item.label}
                    </button>
                ))}
            </div>
            {children && <div className="pt-4">{children(activeKey)}</div>}
        </div>
    );
}
export { Tabs };
