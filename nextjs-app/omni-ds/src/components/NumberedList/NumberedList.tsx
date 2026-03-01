import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface NumberedListItem {
    /** Título */
    title: string;
    /** Descrição / subtítulo */
    description?: string;
    /** Ícone extra (substituir número) */
    icon?: ReactNode;
}

export interface NumberedListProps extends HTMLAttributes<HTMLOListElement> {
    /** Itens da lista */
    items: NumberedListItem[];
    /** Cor temática */
    color?: string;
    /** Começar a numeração em */
    startAt?: number;
    /** Variante */
    variant?: "default" | "compact" | "card";
}

/**
 * NumberedList — Lista numerada estilizada.
 *
 * Números grandes coloridos + título + descrição.
 * Inspirado no "Table of Contents" da referência 2.
 *
 * @example
 * ```tsx
 * <NumberedList
 *   color="#059669"
 *   items={[
 *     { title: "Introdução", description: "30 min" },
 *     { title: "Desenvolvimento", description: "1h" },
 *     { title: "Conclusão", description: "20 min" },
 *   ]}
 * />
 * ```
 */
function NumberedList({ items, color = "#059669", startAt = 1, variant = "default", className, ...props }: NumberedListProps) {
    const isCompact = variant === "compact";
    const isCard = variant === "card";

    return (
        <ol className={cn("flex flex-col", isCard ? "gap-2" : "gap-0", className)} {...props}>
            {items.map((item, i) => {
                const num = startAt + i;
                return (
                    <li
                        key={i}
                        className={cn(
                            "flex items-center gap-4 group transition-colors",
                            isCard
                                ? "p-3.5 rounded-xl hover:bg-[var(--omni-bg-hover)] border border-transparent hover:border-[var(--omni-border-default)]"
                                : "py-3 border-b border-[var(--omni-border-default)] last:border-b-0"
                        )}
                    >
                        {/* Number */}
                        <span
                            className={cn(
                                "shrink-0 font-extrabold tabular-nums leading-none",
                                isCompact ? "text-lg w-6" : "text-2xl w-8"
                            )}
                            style={{ color }}
                        >
                            {String(num).padStart(2, "0")}
                        </span>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <p className={cn(
                                "font-semibold text-[var(--omni-text-primary)] truncate",
                                isCompact ? "text-sm" : "text-sm"
                            )}>
                                {item.title}
                            </p>
                            {item.description && (
                                <p className="text-xs text-[var(--omni-text-muted)] mt-0.5 truncate">{item.description}</p>
                            )}
                        </div>

                        {/* Icon slot */}
                        {item.icon && (
                            <span className="shrink-0 text-[var(--omni-text-muted)]">{item.icon}</span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export { NumberedList };
