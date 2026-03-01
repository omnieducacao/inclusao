import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const textareaVariants = cva(
    "w-full bg-(--omni-surface-0) text-(--omni-text-primary) border shadow-sm transition-all duration-200 placeholder:text-(--omni-text-muted) focus:bg-(--omni-surface-1) focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed resize-y rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
    {
        variants: {
            variant: {
                default: "border-(--omni-border-default) focus:border-sky-500 focus:ring-sky-500/20 hover:border-(--omni-border-strong)",
                error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-600",
                success: "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-emerald-600",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
    VariantProps<typeof textareaVariants> & {
        label?: string;
        error?: string;
        helperText?: string;
        minRows?: number;
    };

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, label, error, helperText, minRows = 3, id, style, ...props }, ref) => {
        const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
        const effectiveVariant = error ? "error" : variant;
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={textareaId} className="text-sm font-semibold text-(--omni-text-primary)">{label}</label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    rows={minRows}
                    className={cn(textareaVariants({ variant: effectiveVariant }), className)}
                    style={style}
                    {...props}
                />
                {error && <p className="text-xs font-medium text-red-500">{error}</p>}
                {!error && helperText && <p className="text-xs text-(--omni-text-muted)">{helperText}</p>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
export { Textarea, textareaVariants };
