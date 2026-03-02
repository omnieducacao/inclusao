"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
};

type ToastContextType = {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const STYLES: Record<ToastType, string> = {
    success: "border-l-emerald-500 text-emerald-500",
    error: "border-l-red-500 text-red-500",
    warning: "border-l-amber-500 text-amber-500",
    info: "border-l-sky-500 text-sky-500",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const styleClass = STYLES[toast.type];
    const borderColor = styleClass.split(' ')[0];
    const iconColor = styleClass.split(' ')[1];
    const Icon = ICONS[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)] border-l-4 shadow-[var(--omni-shadow-lg)] animate-slide-up ${borderColor}`}
            style={{ minWidth: 280, maxWidth: 420 }}
        >
            <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
            <span className="text-sm font-medium flex-1 text-[var(--omni-text-primary)]">{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-0.5 rounded text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success", duration = 4000) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            {toasts.length > 0 && (
                <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}
