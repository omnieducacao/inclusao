import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type TooltipProps = {
    content: string;
    position?: "top" | "bottom" | "left" | "right";
    children: ReactNode;
    className?: string;
};

const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

function Tooltip({ content, position = "top", children, className }: TooltipProps) {
    return (
        <div className={cn("relative group inline-flex", className)}>
            {children}
            <span
                role="tooltip"
                className={cn(
                    "absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none",
                    "bg-[var(--omni-text-primary)] text-[var(--omni-text-inverse)]",
                    "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
                    "transition-all duration-150 ease-out",
                    "shadow-[var(--omni-shadow-md)]",
                    positionClasses[position]
                )}
            >
                {content}
            </span>
        </div>
    );
}

export { Tooltip };
