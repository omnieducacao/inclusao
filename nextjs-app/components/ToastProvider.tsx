"use client";

import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number; // ms, default 4000
}

interface ToastContextType {
    toast: (params: Omit<Toast, "id">) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    toast: () => { },
    success: () => { },
    error: () => { },
    warning: () => { },
    info: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

const icons: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: {
        bg: "var(--bg-secondary)",
        border: "#10b981",
        icon: "#10b981",
        text: "var(--text-primary)",
    },
    error: {
        bg: "var(--bg-secondary)",
        border: "#ef4444",
        icon: "#ef4444",
        text: "var(--text-primary)",
    },
    warning: {
        bg: "var(--bg-secondary)",
        border: "#f59e0b",
        icon: "#f59e0b",
        text: "var(--text-primary)",
    },
    info: {
        bg: "var(--bg-secondary)",
        border: "#3b82f6",
        icon: "#3b82f6",
        text: "var(--text-primary)",
    },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const color = colors[toast.type];
    const Icon = icons[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div
            role="alert"
            className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in-right min-w-[300px] max-w-[420px]"
            style={{
                background: color.bg,
                borderLeft: `4px solid ${color.border}`,
                border: `1px solid var(--border-default)`,
                borderLeftWidth: "4px",
                borderLeftColor: color.border,
            }}
        >
            <Icon size={18} style={{ color: color.icon }} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: color.text }}>
                    {toast.title}
                </div>
                {toast.description && (
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {toast.description}
                    </div>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Fechar notificação"
                style={{ color: "var(--text-muted)" }}
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((params: Omit<Toast, "id">) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts((prev) => [...prev.slice(-4), { ...params, id }]); // keep max 5
    }, []);

    const success = useCallback((title: string, description?: string) => {
        addToast({ type: "success", title, description });
    }, [addToast]);

    const error = useCallback((title: string, description?: string) => {
        addToast({ type: "error", title, description, duration: 6000 });
    }, [addToast]);

    const warning = useCallback((title: string, description?: string) => {
        addToast({ type: "warning", title, description });
    }, [addToast]);

    const info = useCallback((title: string, description?: string) => {
        addToast({ type: "info", title, description });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
            {children}
            {/* Toast container — fixed bottom-right, accessible */}
            {toasts.length > 0 && (
                <div
                    aria-live="polite"
                    aria-label="Notificações"
                    className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3"
                    style={{ pointerEvents: "auto" }}
                >
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}
