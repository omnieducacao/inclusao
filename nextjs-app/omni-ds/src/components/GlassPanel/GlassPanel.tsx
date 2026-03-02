import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

const intensityClasses = {
    light: "bg-(--omni-glass-bg) backdrop-blur-md backdrop-saturate-150 border-(--omni-border-subtle)",
    medium: "bg-(--omni-glass-bg-strong) backdrop-blur-xl backdrop-saturate-[200%] border-(--omni-border-default)",
    strong: "bg-(--omni-glass-bg-strong) backdrop-blur-2xl backdrop-saturate-[200%] border-(--omni-border-strong)",
};

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
    intensity?: "light" | "medium" | "strong";
};

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ intensity = "medium", className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border shadow-[var(--omni-shadow-sm),var(--omni-shadow-inner)] transition-all",
                intensityClasses[intensity],
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);

GlassPanel.displayName = "GlassPanel";
export { GlassPanel };
