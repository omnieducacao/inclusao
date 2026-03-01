import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const inputVariants = cva(
    "w-full bg-[var(--omni-surface-0)] text-[var(--omni-text-primary)] border shadow-sm transition-all duration-200 placeholder:text-[var(--omni-text-muted)] focus:outline-none focus:bg-[var(--omni-surface-1)] focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                default:
                    "border-[var(--omni-border-default)] focus:border-sky-500 focus:ring-sky-500/20 hover:border-[var(--omni-border-strong)]",
                error:
                    "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-600",
                success:
                    "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-emerald-600",
            },
            inputSize: {
                sm: "h-8 px-3 text-xs rounded-lg",
                md: "h-10 px-3.5 text-sm rounded-xl",
                lg: "h-12 px-4 text-base rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            inputSize: "md",
        },
    }
);

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
    VariantProps<typeof inputVariants> & {
        /** Rótulo acima do input */
        label?: string;
        /** Mensagem de erro abaixo do input */
        error?: string;
        /** Texto de ajuda abaixo do input */
        helperText?: string;
        /** Ícone à esquerda */
        leftIcon?: ReactNode;
        /** Ícone à direita */
        rightIcon?: ReactNode;
    };

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            variant,
            inputSize,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
        const effectiveVariant = error ? "error" : variant;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-semibold text-(--omni-text-primary)"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--omni-text-muted)">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            inputVariants({ variant: effectiveVariant, inputSize }),
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--omni-text-muted)">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && (
                    <p className="text-xs font-medium text-red-500">{error}</p>
                )}
                {!error && helperText && (
                    <p className="text-xs text-(--omni-text-muted)">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input, inputVariants };
