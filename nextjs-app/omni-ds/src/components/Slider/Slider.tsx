import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
    label?: string;
    showValue?: boolean;
    color?: string;
};

const Slider = forwardRef<HTMLInputElement, SliderProps>(({ label, showValue = true, color = "#0ea5e9", className, id, value, ...props }, ref) => {
    const inputId = id || (label ? `slider-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {(label || showValue) && (
                <div className="flex justify-between items-center">
                    {label && <label htmlFor={inputId} className="text-sm font-semibold text-[var(--omni-text-primary)]">{label}</label>}
                    {showValue && <span className="text-sm font-mono font-bold" style={{ color }}>{value ?? props.defaultValue ?? 50}</span>}
                </div>
            )}
            <input ref={ref} id={inputId} type="range" value={value} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--omni-bg-tertiary)] accent-sky-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sky-600 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110" style={{ accentColor: color }} {...props} />
        </div>
    );
});
Slider.displayName = "Slider";
export { Slider };
