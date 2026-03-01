import { useState, useRef, useEffect, useCallback, forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ComboboxOption {
    value: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    disabled?: boolean;
}

export interface ComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    /** Lista de opções */
    options: ComboboxOption[];
    /** Valor selecionado */
    value?: string;
    /** Callback ao selecionar */
    onChange?: (value: string) => void;
    /** Placeholder */
    placeholder?: string;
    /** Rótulo */
    label?: string;
    /** Permitir valor livre (não precisa estar nas opções) */
    freeSolo?: boolean;
    /** Mensagem quando sem resultados */
    emptyMessage?: string;
}

/**
 * Combobox — Input com autocomplete / seleção de opções.
 *
 * @example
 * ```tsx
 * <Combobox
 *   label="Módulo"
 *   options={[
 *     { value: "pei", label: "PEI" },
 *     { value: "hub", label: "Hub" },
 *   ]}
 *   value={module}
 *   onChange={setModule}
 * />
 * ```
 */
const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
    ({ options, value, onChange, placeholder = "Buscar...", label, freeSolo, emptyMessage = "Nenhum resultado", className, ...props }, ref) => {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");
        const [highlightedIndex, setHighlightedIndex] = useState(0);
        const containerRef = useRef<HTMLDivElement>(null);
        const listRef = useRef<HTMLUListElement>(null);

        const selected = options.find((o) => o.value === value);

        const filtered = options.filter(
            (o) =>
                o.label.toLowerCase().includes(query.toLowerCase()) ||
                o.description?.toLowerCase().includes(query.toLowerCase())
        );

        // Close on outside click
        useEffect(() => {
            if (!open) return;
            const handler = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setOpen(false);
                }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
        }, [open]);

        const selectOption = useCallback(
            (opt: ComboboxOption) => {
                onChange?.(opt.value);
                setQuery("");
                setOpen(false);
            },
            [onChange]
        );

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
                setOpen(true);
                return;
            }
            if (!open) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setHighlightedIndex((i) => Math.max(i - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filtered[highlightedIndex] && !filtered[highlightedIndex].disabled) {
                        selectOption(filtered[highlightedIndex]);
                    }
                    break;
                case "Escape":
                    setOpen(false);
                    break;
            }
        };

        // Scroll highlighted item into view
        useEffect(() => {
            if (!open || !listRef.current) return;
            const item = listRef.current.children[highlightedIndex] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }, [highlightedIndex, open]);

        return (
            <div ref={containerRef} className="relative flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-semibold text-[var(--omni-text-primary)]">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        type="text"
                        role="combobox"
                        aria-expanded={open}
                        aria-autocomplete="list"
                        aria-activedescendant={open && filtered[highlightedIndex] ? `combo-opt-${filtered[highlightedIndex].value}` : undefined}
                        className={cn(
                            "w-full h-10 px-3.5 text-sm rounded-xl",
                            "bg-[var(--omni-bg-secondary)] text-[var(--omni-text-primary)]",
                            "border border-[var(--omni-border-default)]",
                            "placeholder:text-[var(--omni-text-muted)]",
                            "focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500",
                            "transition-all",
                            className
                        )}
                        placeholder={placeholder}
                        value={open ? query : selected?.label || ""}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setHighlightedIndex(0);
                            if (!open) setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                        {...props}
                    />
                    {/* Chevron */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--omni-text-muted)]">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 6L8 10L12 6" />
                        </svg>
                    </span>
                </div>
                {/* Options */}
                {open && (
                    <ul
                        ref={listRef}
                        role="listbox"
                        className={cn(
                            "absolute top-full left-0 right-0 z-50 mt-1",
                            "max-h-60 overflow-auto rounded-xl p-1.5",
                            "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
                            "shadow-[var(--omni-shadow-lg)]"
                        )}
                    >
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-[var(--omni-text-muted)] text-center">
                                {emptyMessage}
                            </li>
                        ) : (
                            filtered.map((opt, i) => (
                                <li
                                    key={opt.value}
                                    id={`combo-opt-${opt.value}`}
                                    role="option"
                                    aria-selected={opt.value === value}
                                    aria-disabled={opt.disabled}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer",
                                        "transition-colors",
                                        i === highlightedIndex && "bg-[var(--omni-bg-hover)]",
                                        opt.value === value && "font-semibold text-sky-600",
                                        opt.disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => !opt.disabled && selectOption(opt)}
                                    onMouseEnter={() => setHighlightedIndex(i)}
                                >
                                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate">{opt.label}</p>
                                        {opt.description && (
                                            <p className="text-xs text-[var(--omni-text-muted)] truncate">{opt.description}</p>
                                        )}
                                    </div>
                                    {opt.value === value && (
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sky-600">
                                            <path d="M3 8L6.5 11.5L13 5" />
                                        </svg>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        );
    }
);

Combobox.displayName = "Combobox";

export { Combobox };
