import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

export const badgeVariants = cva(
    "inline-flex items-center gap-1 font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                primary: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
                success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                module: "text-white",
            },
            size: {
                sm: "px-2 py-0.5 text-[10px] rounded-md",
                md: "px-2.5 py-1 text-xs rounded-lg",
                lg: "px-3 py-1.5 text-sm rounded-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
    VariantProps<typeof badgeVariants> & {
        moduleColor?: string;
        /** Dot indicator before text */
        dot?: boolean;
    };

export function Badge({ className, variant, size, moduleColor, dot, children, style, ...props }: BadgeProps) {
    const moduleStyle = variant === "module" && moduleColor
        ? { backgroundColor: `${moduleColor}20`, color: moduleColor, ...style }
        : style;

    return (
        <span className={cn(badgeVariants({ variant, size }), className)} style={moduleStyle} {...props}>
            {dot && (
                <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: "currentColor" }}
                />
            )}
            {children}
        </span>
    );
}
