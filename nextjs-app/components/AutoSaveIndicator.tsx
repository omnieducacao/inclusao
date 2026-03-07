"use client";

import { Save, Loader2, Check, AlertCircle } from "lucide-react";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
    status: AutoSaveStatus;
    lastSaved: Date | null;
}

const statusConfig = {
    idle: { icon: Save, text: "", color: "var(--text-muted)", animate: false },
    saving: { icon: Loader2, text: "Salvando...", color: "var(--text-secondary)", animate: true },
    saved: { icon: Check, text: "Rascunho salvo", color: "#10b981", animate: false },
    error: { icon: AlertCircle, text: "Erro ao salvar", color: "#ef4444", animate: false },
};

/**
 * AutoSaveIndicator — Compact inline indicator for auto-save status.
 * Shows "Salvando..." while saving and "Rascunho salvo" after success.
 */
export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
    if (status === "idle") return null;

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div
            className="flex items-center gap-1.5 text-xs font-medium transition-opacity duration-300"
            style={{ color: config.color }}
            aria-live="polite"
            role="status"
        >
            <Icon
                size={13}
                className={config.animate ? "animate-spin" : ""}
            />
            <span>{config.text}</span>
            {status === "saved" && lastSaved && (
                <span className="opacity-60">
                    ({lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})
                </span>
            )}
        </div>
    );
}
