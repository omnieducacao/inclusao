import { useEffect, useState, useCallback, type ReactNode } from "react";
import { cn } from "../../utils/cn";

type ToastData = { id: string; variant: "info" | "success" | "warning" | "error"; title: string; description?: string; duration?: number };

let toastListeners: ((t: ToastData) => void)[] = [];
export function toast(data: Omit<ToastData, "id">) {
    const t = { ...data, id: Math.random().toString(36).slice(2) };
    toastListeners.forEach((fn) => fn(t));
}

const icons: Record<string, string> = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };
const colors: Record<string, string> = { info: "border-l-sky-500", success: "border-l-emerald-500", warning: "border-l-amber-500", error: "border-l-red-500" };

export function ToastContainer({ position = "top-right" }: { position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const remove = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

    useEffect(() => {
        const handler = (t: ToastData) => {
            setToasts((prev) => [...prev, t]);
            setTimeout(() => remove(t.id), t.duration || 4000);
        };
        toastListeners.push(handler);
        return () => { toastListeners = toastListeners.filter((fn) => fn !== handler); };
    }, [remove]);

    const posClass = { "top-right": "top-4 right-4", "top-left": "top-4 left-4", "bottom-right": "bottom-4 right-4", "bottom-left": "bottom-4 left-4" }[position];
    return (
        <div className={cn("fixed z-[9999] flex flex-col gap-2 pointer-events-none", posClass)} aria-live="polite">
            {toasts.map((t) => (
                <div key={t.id} className={cn("pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)] border-l-4 shadow-[var(--omni-shadow-lg)] animate-[slide-in_300ms_ease-out]", colors[t.variant])}>
                    <div className="flex gap-2.5">
                        <span className="text-base flex-shrink-0">{icons[t.variant]}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--omni-text-primary)]">{t.title}</p>
                            {t.description && <p className="text-xs text-[var(--omni-text-muted)] mt-0.5">{t.description}</p>}
                        </div>
                        <button onClick={() => remove(t.id)} className="flex-shrink-0 p-0.5 rounded text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
