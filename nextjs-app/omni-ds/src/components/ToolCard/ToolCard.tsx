import { forwardRef, type HTMLAttributes, type ElementType } from "react";
import { cn } from "../../utils/cn";

export type ToolCardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
    icon: ElementType;
    title: string;
    description: string;
    aiTag?: string;
    moduleColor?: string;
    onClick?: () => void;
};

const ToolCard = forwardRef<HTMLDivElement, ToolCardProps>(
    ({ icon: Icon, title, description, aiTag, moduleColor, onClick, className, ...props }, ref) => (
        <div
            ref={ref}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
            className={cn(
                "group relative flex flex-col gap-3 p-5 rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)]",
                "shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)]",
                "hover:shadow-[var(--omni-shadow-elevated),var(--omni-shadow-inner)] hover:-translate-y-1",
                "transition-all duration-200 cursor-pointer active:scale-[0.98] touch-manipulation",
                className
            )}
            {...props}
        >
            <div className="flex items-center justify-between">
                <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl text-white"
                    style={{ backgroundColor: moduleColor || "#0891b2" }}
                >
                    <Icon size={20} />
                </div>
                {aiTag && (
                    <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: moduleColor || "#0891b2" }}
                    >
                        {aiTag}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-sm font-bold text-[var(--omni-text-primary)] group-hover:text-[var(--omni-text-primary)]">
                    {title}
                </h3>
                <p className="text-xs text-[var(--omni-text-muted)] mt-1 line-clamp-2">
                    {description}
                </p>
            </div>
        </div>
    )
);

ToolCard.displayName = "ToolCard";
export { ToolCard };
