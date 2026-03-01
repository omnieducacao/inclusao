import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    /** Orientação do separador */
    orientation?: "horizontal" | "vertical";
    /** Estilo decorativo */
    decorative?: boolean;
}

/**
 * Separator — Divisor visual entre seções.
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" className="h-6" />
 * ```
 */
const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
    ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
        <div
            ref={ref}
            role={decorative ? "none" : "separator"}
            aria-orientation={decorative ? undefined : orientation}
            className={cn(
                "shrink-0 bg-[var(--omni-border-default)]",
                orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
                className
            )}
            {...props}
        />
    )
);

Separator.displayName = "Separator";

export { Separator };
