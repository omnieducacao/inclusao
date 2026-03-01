import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface FilterChipProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> {
    /** Texto do chip */
    label: string;
    /** Se está selecionado */
    selected?: boolean;
    /** Callback de toggle */
    onChange?: (selected: boolean) => void;
    /** Cor temática */
    color?: string;
    /** Ícone (avatar, dot, etc.) */
    icon?: ReactNode;
    /** Deletável */
    removable?: boolean;
    /** Callback ao remover */
    onRemove?: () => void;
    /** Desabilitado */
    disabled?: boolean;
}

/**
 * FilterChip — Pill de filtro interativo.
 *
 * Chips selecionáveis para filtros e categorias.
 * Inspirado nas pills coloridas da referência 1.
 *
 * @example
 * ```tsx
 * <FilterChip label="Matemática" selected color="#2563eb" />
 * <FilterChip label="Todos" icon={<Users size={14} />} />
 * ```
 */
const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
    ({ label, selected = false, onChange, color, icon, removable, onRemove, disabled, className, ...props }, ref) => {

        const handleClick = () => {
            if (disabled) return;
            onChange?.(!selected);
        };

        return (
            <button
                ref={ref}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold",
                    "border transition-all duration-150 cursor-pointer select-none",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    disabled && "opacity-40 cursor-not-allowed",
                    className
                )}
                style={
                    selected
                        ? {
                            backgroundColor: color || "var(--omni-primary)",
                            borderColor: color || "var(--omni-primary)",
                            color: "#fff",
                            boxShadow: color ? `0 2px 8px ${color}40` : undefined,
                        }
                        : {
                            backgroundColor: "var(--omni-bg-secondary)",
                            borderColor: "var(--omni-border-default)",
                            color: "var(--omni-text-secondary)",
                        }
                }
                {...props}
            >
                {icon && <span className="shrink-0 flex items-center">{icon}</span>}
                {label}
                {removable && (
                    <span
                        onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                        className={cn(
                            "ml-0.5 p-0.5 rounded-full inline-flex items-center justify-center",
                            "hover:bg-white/20 transition-colors cursor-pointer"
                        )}
                        aria-label="Remover"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </span>
                )}
            </button>
        );
    }
);

FilterChip.displayName = "FilterChip";

export { FilterChip };
