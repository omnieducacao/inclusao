import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
    // Base styles Premium
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active-scale touch-manipulation select-none",
    {
        variants: {
            variant: {
                primary:
                    "bg-sky-600 text-white hover:bg-sky-500 shadow-sm hover:shadow-md focus-visible:ring-sky-500 border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
                secondary:
                    "bg-[var(--omni-surface-1)] text-[var(--omni-text-primary)] border border-[var(--omni-border-strong)] hover:bg-[var(--omni-surface-2)] shadow-sm focus-visible:ring-[var(--omni-border-strong)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
                ghost:
                    "text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-hover)] hover:text-[var(--omni-text-primary)]",
                danger:
                    "bg-red-600 text-white hover:bg-red-500 shadow-sm hover:shadow-md focus-visible:ring-red-500 border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
                success:
                    "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm hover:shadow-md focus-visible:ring-emerald-500 border border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]",
                module:
                    "text-white shadow-sm hover:shadow-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-transparent",
            },
            size: {
                sm: "h-8 px-3 text-xs rounded-lg",
                md: "h-10 px-4 text-sm rounded-xl",
                lg: "h-12 px-6 text-base rounded-xl",
                icon: "h-10 w-10 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        /** Cor do módulo (usado com variant="module") */
        moduleColor?: string;
        /** Estado de loading */
        loading?: boolean;
    };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, moduleColor, loading, children, style, disabled, ...props }, ref) => {
        const moduleStyle =
            variant === "module" && moduleColor
                ? { backgroundColor: moduleColor, ...style }
                : style;

        return (
            <button
                ref={ref}
                className={cn(buttonVariants({ variant, size }), className)}
                style={moduleStyle}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin -ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
