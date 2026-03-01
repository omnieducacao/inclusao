import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label?: string;
    description?: string;
    indeterminate?: boolean;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, description, className, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    return (
        <label className={cn("group flex items-start gap-2.5 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed", className)} htmlFor={inputId}>
            <div className="relative flex-shrink-0 mt-0.5">
                <input ref={ref} id={inputId} type="checkbox" disabled={disabled} className="peer sr-only" {...props} />
                <div className="w-[18px] h-[18px] rounded-md border-2 border-[var(--omni-border-strong)] bg-[var(--omni-bg-secondary)] transition-all peer-checked:bg-sky-600 peer-checked:border-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/20 peer-focus-visible:ring-offset-1" />
                <svg className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            {(label || description) && (
                <div>
                    {label && <span className="text-sm font-medium text-[var(--omni-text-primary)]">{label}</span>}
                    {description && <p className="text-xs text-[var(--omni-text-muted)] mt-0.5">{description}</p>}
                </div>
            )}
        </label>
    );
});
Checkbox.displayName = "Checkbox";
export { Checkbox };
