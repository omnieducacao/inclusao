import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
    label?: string;
    size?: "sm" | "md" | "lg";
    color?: string;
};

const sizes = { sm: { track: "w-8 h-5", thumb: "w-3.5 h-3.5", translate: "translate-x-3.5" }, md: { track: "w-11 h-6", thumb: "w-4.5 h-4.5", translate: "translate-x-5" }, lg: { track: "w-14 h-7", thumb: "w-5.5 h-5.5", translate: "translate-x-7" } };

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({ label, size = "md", color, className, disabled, checked, defaultChecked, onChange, id, ...props }, ref) => {
    const s = sizes[size];
    const inputId = id || (label ? `toggle-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    return (
        <label className={cn("inline-flex items-center gap-2.5 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed", className)} htmlFor={inputId}>
            <div className="relative">
                <input ref={ref} id={inputId} type="checkbox" role="switch" aria-checked={checked} checked={checked} defaultChecked={defaultChecked} onChange={onChange} disabled={disabled} className="sr-only peer" {...props} />
                <div className={cn("rounded-full transition-colors duration-200 bg-[var(--omni-bg-tertiary)] border border-[var(--omni-border-default)] peer-checked:border-transparent", s.track)} style={checked || defaultChecked ? { backgroundColor: color || "#0ea5e9" } : undefined} />
                <div className={cn("absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:" + s.translate, s.thumb)} />
            </div>
            {label && <span className="text-sm font-medium text-[var(--omni-text-primary)]">{label}</span>}
        </label>
    );
});
Toggle.displayName = "Toggle";
export { Toggle };
