import { useState, useMemo, forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    /** Data selecionada */
    value?: Date | null;
    /** Callback ao selecionar data */
    onChange?: (date: Date) => void;
    /** Rótulo */
    label?: string;
    /** Data mínima */
    min?: Date;
    /** Data máxima */
    max?: Date;
    /** Placeholder */
    placeholder?: string;
    /** Desabilitado */
    disabled?: boolean;
}

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * DatePicker — Seletor de data com calendário inline.
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date | null>(null);
 * <DatePicker label="Data de nascimento" value={date} onChange={setDate} />
 * ```
 */
const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
    ({ value, onChange, label, min, max, placeholder = "Selecione uma data", disabled, className, ...props }, ref) => {
        const [open, setOpen] = useState(false);
        const [viewYear, setViewYear] = useState(() => (value ?? new Date()).getFullYear());
        const [viewMonth, setViewMonth] = useState(() => (value ?? new Date()).getMonth());

        const today = useMemo(() => new Date(), []);

        const daysInMonth = getDaysInMonth(viewYear, viewMonth);
        const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
        const days: (number | null)[] = [
            ...Array(firstDay).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];

        const navigate = (dir: -1 | 1) => {
            let m = viewMonth + dir;
            let y = viewYear;
            if (m < 0) { m = 11; y--; }
            if (m > 11) { m = 0; y++; }
            setViewMonth(m);
            setViewYear(y);
        };

        const isDisabled = (day: number) => {
            const d = new Date(viewYear, viewMonth, day);
            if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
            if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
            return false;
        };

        const selectDay = (day: number) => {
            if (isDisabled(day)) return;
            const d = new Date(viewYear, viewMonth, day);
            onChange?.(d);
            setOpen(false);
        };

        const formatted = value
            ? `${String(value.getDate()).padStart(2, "0")}/${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`
            : "";

        return (
            <div ref={ref} className={cn("relative flex flex-col gap-1.5", className)} {...props}>
                {label && (
                    <label className="text-sm font-semibold text-[var(--omni-text-primary)]">{label}</label>
                )}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen(!open)}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className={cn(
                        "flex items-center gap-2 w-full h-10 px-3.5 text-sm rounded-xl text-left",
                        "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
                        "transition-all cursor-pointer",
                        "focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500",
                        disabled && "opacity-50 cursor-not-allowed",
                        !value && "text-[var(--omni-text-muted)]"
                    )}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--omni-text-muted)]">
                        <rect x="2" y="3" width="12" height="11" rx="2" />
                        <path d="M5 1v3M11 1v3M2 7h12" />
                    </svg>
                    <span className="flex-1 truncate">{value ? formatted : placeholder}</span>
                </button>

                {open && !disabled && (
                    <div
                        role="dialog"
                        aria-label="Calendário"
                        className={cn(
                            "absolute top-full left-0 z-50 mt-1 p-3",
                            "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
                            "rounded-xl shadow-[var(--omni-shadow-lg)]",
                            "min-w-[280px]"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <button type="button" onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-[var(--omni-bg-hover)] transition-colors" aria-label="Mês anterior">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4L6 8L10 12" /></svg>
                            </button>
                            <span className="text-sm font-bold text-[var(--omni-text-primary)]">
                                {MONTHS_PT[viewMonth]} {viewYear}
                            </span>
                            <button type="button" onClick={() => navigate(1)} className="p-1 rounded-lg hover:bg-[var(--omni-bg-hover)] transition-colors" aria-label="Próximo mês">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4L10 8L6 12" /></svg>
                            </button>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                            {DAYS_PT.map((d) => (
                                <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-[var(--omni-text-muted)] py-1">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label="Dias do mês">
                            {days.map((day, i) => {
                                if (day === null) return <div key={`e-${i}`} />;
                                const date = new Date(viewYear, viewMonth, day);
                                const isSelected = value && isSameDay(date, value);
                                const isToday = isSameDay(date, today);
                                const dis = isDisabled(day);

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        role="gridcell"
                                        aria-selected={isSelected || undefined}
                                        disabled={dis}
                                        onClick={() => selectDay(day)}
                                        className={cn(
                                            "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium",
                                            "transition-colors cursor-pointer",
                                            isSelected
                                                ? "bg-sky-600 text-white font-bold"
                                                : isToday
                                                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 font-bold"
                                                    : "text-[var(--omni-text-primary)] hover:bg-[var(--omni-bg-hover)]",
                                            dis && "opacity-30 cursor-not-allowed"
                                        )}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Today shortcut */}
                        <div className="mt-2 pt-2 border-t border-[var(--omni-border-default)]">
                            <button
                                type="button"
                                onClick={() => {
                                    setViewYear(today.getFullYear());
                                    setViewMonth(today.getMonth());
                                    onChange?.(today);
                                    setOpen(false);
                                }}
                                className="w-full text-center text-xs font-semibold text-sky-600 hover:text-sky-700 py-1 rounded-lg hover:bg-[var(--omni-bg-hover)] transition-colors"
                            >
                                Hoje
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
