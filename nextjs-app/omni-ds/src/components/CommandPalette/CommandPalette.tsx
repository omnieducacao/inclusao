import { useState, useRef, useEffect, useCallback, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    shortcut?: string;
    group?: string;
    onSelect: () => void;
    disabled?: boolean;
}

export interface CommandPaletteProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
    /** Aberto/fechado */
    open: boolean;
    /** Callback ao fechar */
    onClose: () => void;
    /** Lista de comandos */
    items: CommandItem[];
    /** Placeholder do input */
    placeholder?: string;
}

/**
 * CommandPalette — Palette de comandos estilo ⌘K.
 *
 * @example
 * ```tsx
 * <CommandPalette
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   items={[
 *     { id: "new-pei", label: "Novo PEI", icon: <Icon />, group: "Ações", onSelect: () => router.push("/pei/new") },
 *     { id: "search", label: "Buscar aluno", group: "Navegação", onSelect: () => {} },
 *   ]}
 * />
 * ```
 */
const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
    ({ open, onClose, items, placeholder = "Buscar comando...", className, ...props }, ref) => {
        const [query, setQuery] = useState("");
        const [highlightedIndex, setHighlightedIndex] = useState(0);
        const inputRef = useRef<HTMLInputElement>(null);
        const listRef = useRef<HTMLDivElement>(null);

        // Filter items
        const filtered = items.filter(
            (item) =>
                item.label.toLowerCase().includes(query.toLowerCase()) ||
                item.description?.toLowerCase().includes(query.toLowerCase()) ||
                item.group?.toLowerCase().includes(query.toLowerCase())
        );

        // Group items
        const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
            const group = item.group || "Geral";
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {});

        const flatItems = Object.values(groups).flat();

        // Reset on open
        useEffect(() => {
            if (open) {
                setQuery("");
                setHighlightedIndex(0);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        }, [open]);

        // Close on Escape
        useEffect(() => {
            if (!open) return;
            const handler = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };
            document.addEventListener("keydown", handler);
            return () => document.removeEventListener("keydown", handler);
        }, [open, onClose]);

        const selectItem = useCallback(
            (item: CommandItem) => {
                if (item.disabled) return;
                item.onSelect();
                onClose();
            },
            [onClose]
        );

        const handleKeyDown = (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setHighlightedIndex((i) => Math.min(i + 1, flatItems.length - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setHighlightedIndex((i) => Math.max(i - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (flatItems[highlightedIndex]) selectItem(flatItems[highlightedIndex]);
                    break;
            }
        };

        // Scroll highlighted into view
        useEffect(() => {
            if (!open || !listRef.current) return;
            const items = listRef.current.querySelectorAll("[data-command-item]");
            items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
        }, [highlightedIndex, open]);

        if (!open) return null;

        return (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]" onClick={onClose}>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <div
                    ref={ref}
                    role="dialog"
                    aria-label="Command palette"
                    className={cn(
                        "relative w-full max-w-lg rounded-2xl overflow-hidden",
                        "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
                        "shadow-[var(--omni-shadow-2xl)]",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                    {...props}
                >
                    {/* Search input */}
                    <div className="flex items-center gap-3 px-4 border-b border-[var(--omni-border-default)]">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-[var(--omni-text-muted)]">
                            <circle cx="7" cy="7" r="5" />
                            <path d="M14 14L10.5 10.5" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setHighlightedIndex(0); }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent h-12 text-sm text-[var(--omni-text-primary)] placeholder:text-[var(--omni-text-muted)] outline-none"
                            role="combobox"
                            aria-expanded={true}
                            aria-autocomplete="list"
                        />
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[var(--omni-text-muted)] bg-[var(--omni-bg-tertiary)] rounded-md border border-[var(--omni-border-default)]">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div ref={listRef} className="max-h-72 overflow-auto p-2" role="listbox">
                        {flatItems.length === 0 ? (
                            <div className="py-6 text-center text-sm text-[var(--omni-text-muted)]">
                                Nenhum comando encontrado
                            </div>
                        ) : (
                            Object.entries(groups).map(([group, groupItems]) => (
                                <div key={group}>
                                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]">
                                        {group}
                                    </div>
                                    {groupItems.map((item) => {
                                        const globalIndex = flatItems.indexOf(item);
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                role="option"
                                                data-command-item
                                                aria-selected={globalIndex === highlightedIndex}
                                                disabled={item.disabled}
                                                onClick={() => selectItem(item)}
                                                onMouseEnter={() => setHighlightedIndex(globalIndex)}
                                                className={cn(
                                                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm",
                                                    "transition-colors cursor-pointer outline-none text-left",
                                                    globalIndex === highlightedIndex
                                                        ? "bg-[var(--omni-bg-hover)]"
                                                        : "hover:bg-[var(--omni-bg-hover)]",
                                                    item.disabled && "opacity-40 cursor-not-allowed"
                                                )}
                                            >
                                                {item.icon && (
                                                    <span className="shrink-0 w-5 h-5 flex items-center justify-center text-[var(--omni-text-muted)]">
                                                        {item.icon}
                                                    </span>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-[var(--omni-text-primary)] truncate">{item.label}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-[var(--omni-text-muted)] truncate">{item.description}</p>
                                                    )}
                                                </div>
                                                {item.shortcut && (
                                                    <kbd className="flex items-center gap-0.5 text-[10px] font-mono font-semibold text-[var(--omni-text-muted)]">
                                                        {item.shortcut}
                                                    </kbd>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--omni-border-default)] text-[10px] text-[var(--omni-text-muted)]">
                        <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> Navegar</span>
                        <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> Selecionar</span>
                        <span className="flex items-center gap-1"><kbd className="font-mono">ESC</kbd> Fechar</span>
                    </div>
                </div>
            </div>
        );
    }
);

CommandPalette.displayName = "CommandPalette";

export { CommandPalette };
