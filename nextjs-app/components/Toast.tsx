"use client";

/** Onda 22: visual do design system — avisos flutuantes com omni-toasts/omni-toast; cores só por variáveis. */

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

/* Cor do ícone sobre o fundo "noite" do toast: as cores puras do símbolo leem bem no escuro */
const COR_ICONE: Record<ToastType, string> = {
    success: "var(--encontro-verde)",
    error: "var(--encontro-vermelho)",
    warning: "var(--encontro-amarelo)",
    info: "var(--encontro-azul)",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const Icon = ICONS[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <div role={toast.type === "error" ? "alert" : "status"} className="omni-toast">
            <Icon aria-hidden="true" style={{ color: COR_ICONE[toast.type] }} />
            <span className="omni-toast__texto">{toast.message}</span>
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Fechar aviso"
                className="omni-toast__acao"
            >
                <X aria-hidden="true" style={{ width: 16, height: 16 }} />
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
            {toasts.length > 0 && (
                <div className="omni-toasts" aria-live="polite" aria-label="Avisos">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}
