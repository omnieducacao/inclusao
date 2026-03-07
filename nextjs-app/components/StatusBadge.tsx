"use client";

import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    Loader2,
    FileCheck,
    Edit,
    type LucideIcon,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

type StatusType =
    | "pendente"
    | "em_andamento"
    | "concluido"
    | "aprovado"
    | "reprovado"
    | "revisao"
    | "rascunho"
    | "gerado"
    | "devolvido"
    | "carregando"
    | string; // Fallback

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    size?: "sm" | "md";
}

// ─── Config ─────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
    icon: LucideIcon;
    color: string;
    bg: string;
    label: string;
}> = {
    pendente: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,.1)", label: "Pendente" },
    em_andamento: { icon: Loader2, color: "#3b82f6", bg: "rgba(59,130,246,.1)", label: "Em andamento" },
    concluido: { icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,.1)", label: "Concluído" },
    aprovado: { icon: FileCheck, color: "#10b981", bg: "rgba(16,185,129,.1)", label: "Aprovado" },
    reprovado: { icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,.1)", label: "Reprovado" },
    revisao: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,.1)", label: "Em revisão" },
    rascunho: { icon: Edit, color: "#94a3b8", bg: "rgba(148,163,184,.1)", label: "Rascunho" },
    gerado: { icon: CheckCircle2, color: "#818cf8", bg: "rgba(129,140,248,.1)", label: "Gerado" },
    devolvido: { icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,.1)", label: "Devolvido" },
    carregando: { icon: Loader2, color: "#94a3b8", bg: "rgba(148,163,184,.1)", label: "Carregando..." },
};

const DEFAULT = { icon: Clock, color: "#94a3b8", bg: "rgba(148,163,184,.1)", label: "Desconhecido" };

// ─── Component ──────────────────────────────────────────────────────────────────

/**
 * StatusBadge — reusable status indicator across PAEE, PEI, Monitoramento.
 * Replaces inline status rendering (which was repeated 20+ times across modules).
 */
export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || DEFAULT;
    const Icon = config.icon;
    const displayLabel = label || config.label;
    const isSmall = size === "sm";

    return (
        <span
            role="status"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: isSmall ? 3 : 5,
                padding: isSmall ? "1px 6px" : "2px 10px",
                borderRadius: 9999,
                fontSize: isSmall ? 10 : 11,
                fontWeight: 600,
                color: config.color,
                backgroundColor: config.bg,
                whiteSpace: "nowrap",
            }}
        >
            <Icon size={isSmall ? 10 : 12} className={status === "em_andamento" || status === "carregando" ? "animate-spin" : ""} />
            {displayLabel}
        </span>
    );
}
