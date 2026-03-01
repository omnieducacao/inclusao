import { forwardRef, type SelectHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const selectVariants = cva(
    "w-full appearance-none bg-(--omni-surface-0) text-(--omni-text-primary) border shadow-sm transition-all duration-200 focus:outline-none focus:bg-(--omni-surface-1) focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer pr-10",
    {
        variants: {
            variant: {
                default:
                    "border-(--omni-border-default) focus:border-sky-500 focus:ring-sky-500/20 hover:border-(--omni-border-strong)",
                error:
                    "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-600",
            },
            selectSize: {
                sm: "h-8 px-3 text-xs rounded-lg",
                md: "h-10 px-3.5 text-sm rounded-xl",
                lg: "h-12 px-4 text-base rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            selectSize: "md",
        },
    }
);

export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> &
    VariantProps<typeof selectVariants> & {
        label?: string;
        error?: string;
        helperText?: string;
        options: SelectOption[];
        placeholder?: string;
    };

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            variant,
            selectSize,
            label,
            error,
            helperText,
            options,
            placeholder,
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
        const effectiveVariant = error ? "error" : variant;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-sm font-semibold text-(--omni-text-primary)"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            selectVariants({ variant: effectiveVariant, selectSize }),
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--omni-text-muted)"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
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

Select.displayName = "Select";

export { Select, selectVariants };
