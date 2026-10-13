"use client";

/** Onda 22: visual do design system — avisos flutuantes com omni-toasts/omni-toast; cores só por variáveis. */

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

/* Cor do ícone sobre o fundo "noite" do toast: as cores puras do símbolo leem bem no escuro */
const corIcone: Record<ToastType, string> = {
    success: "var(--encontro-verde)",
    error: "var(--encontro-vermelho)",
    warning: "var(--encontro-amarelo)",
    info: "var(--encontro-azul)",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const Icon = icons[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div role={toast.type === "error" ? "alert" : "status"} className="omni-toast">
            <Icon aria-hidden="true" style={{ color: corIcone[toast.type] }} />
            <div className="omni-toast__texto">
                <div style={{ fontWeight: 700 }}>{toast.title}</div>
                {toast.description && (
                    <div style={{ fontSize: 14, lineHeight: "20px", color: "var(--sobre-noite-2)" }}>
                        {toast.description}
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={() => onRemove(toast.id)}
                className="omni-toast__acao"
                aria-label="Fechar aviso"
            >
                <X aria-hidden="true" style={{ width: 16, height: 16 }} />
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
            {toasts.length > 0 && (
                <div aria-live="polite" aria-label="Avisos" className="omni-toasts">
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}
