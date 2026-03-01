import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    /** Altura máxima antes de scrollar */
    maxHeight?: string | number;
    /** Mostrar scrollbar sempre ou só no hover */
    scrollbarVisibility?: "auto" | "always" | "hover";
}

/**
 * ScrollArea — Container com scroll estilizado.
 *
 * @example
 * ```tsx
 * <ScrollArea maxHeight={400}>
 *   <LongContent />
 * </ScrollArea>
 * ```
 */
const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, maxHeight, scrollbarVisibility = "auto", style, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative overflow-auto",
                // Custom scrollbar styling
                "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-[var(--omni-scrollbar-thumb)] [&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb:hover]:bg-[var(--omni-scrollbar-thumb-hover)]",
                scrollbarVisibility === "hover" && "[&::-webkit-scrollbar-thumb]:opacity-0 [&:hover::-webkit-scrollbar-thumb]:opacity-100",
                scrollbarVisibility === "always" && "[&::-webkit-scrollbar-thumb]:opacity-100",
                className
            )}
            style={{ maxHeight, ...style }}
            tabIndex={0}
            role="region"
            aria-label="Scrollable content"
            {...props}
        >
            {children}
        </div>
    )
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
