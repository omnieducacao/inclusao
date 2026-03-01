import { createContext, useContext, type ReactNode } from "react";
import { cn } from "../../utils/cn";

type RadioCtx = { name: string; value?: string; onChange?: (val: string) => void; disabled?: boolean };
const Ctx = createContext<RadioCtx>({ name: "" });

export type RadioGroupProps = { name: string; value?: string; onChange?: (val: string) => void; children: ReactNode; className?: string; label?: string; disabled?: boolean };

function RadioGroup({ name, value, onChange, children, className, label, disabled }: RadioGroupProps) {
    return (
        <Ctx.Provider value={{ name, value, onChange, disabled }}>
            <fieldset className={cn("flex flex-col gap-2", className)}>
                {label && <legend className="text-sm font-semibold text-[var(--omni-text-primary)] mb-1">{label}</legend>}
                {children}
            </fieldset>
        </Ctx.Provider>
    );
}

export type RadioItemProps = { value: string; label: string; description?: string; disabled?: boolean; className?: string };

function RadioItem({ value, label, description, disabled: itemDisabled, className }: RadioItemProps) {
    const ctx = useContext(Ctx);
    const disabled = itemDisabled || ctx.disabled;
    const checked = ctx.value === value;
    return (
        <label className={cn("group flex items-start gap-2.5 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
            <div className="relative flex-shrink-0 mt-0.5">
                <input type="radio" name={ctx.name} value={value} checked={checked} onChange={() => ctx.onChange?.(value)} disabled={disabled} className="peer sr-only" />
                <div className="w-[18px] h-[18px] rounded-full border-2 border-[var(--omni-border-strong)] bg-[var(--omni-bg-secondary)] transition-all peer-checked:border-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/20 peer-focus-visible:ring-offset-1" />
                <div className="absolute top-[5px] left-[5px] w-2 h-2 rounded-full bg-sky-600 opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100 transition-all" />
            </div>
            <div>
                <span className="text-sm font-medium text-[var(--omni-text-primary)]">{label}</span>
                {description && <p className="text-xs text-[var(--omni-text-muted)] mt-0.5">{description}</p>}
            </div>
        </label>
    );
}
export { RadioGroup, RadioItem };
