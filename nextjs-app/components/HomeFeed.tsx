"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Icon } from "phosphor-react";

type Notification = {
    id: string;
    type: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "alert";
    studentId?: string;
    studentName?: string;
};

const SEVERITY_STYLES: Record<
    string,
    { bg: string; border: string; text: string; dot: string }
> = {
    alert: {
        bg: "rgba(239, 68, 68, 0.06)",
        border: "rgba(239, 68, 68, 0.15)",
        text: "var(--text-primary)",
        dot: "#ef4444",
    },
    warning: {
        bg: "rgba(245, 158, 11, 0.06)",
        border: "rgba(245, 158, 11, 0.15)",
        text: "var(--text-primary)",
        dot: "#f59e0b",
    },
    info: {
        bg: "rgba(59, 130, 246, 0.06)",
        border: "rgba(59, 130, 246, 0.15)",
        text: "var(--text-primary)",
        dot: "#3b82f6",
    },
};

const TYPE_ICON_MAP: Record<string, string> = {
    pei: "ClipboardText",
    diario: "BookOpen",
    announcement: "Megaphone",
    paee: "PuzzlePiece",
};

const TYPE_ICON_COLORS: Record<string, string> = {
    pei: "#4285F4",
    diario: "#E8453C",
    announcement: "#F9AB00",
    paee: "#9334E6",
};

export function HomeFeed() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [icons, setIcons] = useState<Record<string, Icon>>({});

    useEffect(() => {
        fetch("/api/notifications")
            .then((r) => r.json())
            .then((data) => {
                setNotifications(data.notifications || []);
            })
            .catch(() => {
                setNotifications([]);
            })
            .finally(() => setLoading(false));

        if (typeof window !== "undefined") {
            import("phosphor-react").then((phosphor) => {
                setIcons({
                    Bell: phosphor.Bell,
                    ClockCountdown: phosphor.Clock,
                    ClipboardText: phosphor.ClipboardText,
                    BookOpen: phosphor.BookOpen,
                    Megaphone: phosphor.Megaphone,
                    PuzzlePiece: phosphor.PuzzlePiece,
                    MapPin: phosphor.MapPin,
                    CheckCircle: phosphor.CheckCircle,
                });
            });
        }
    }, []);

    const peiReminders = notifications.filter((n) => n.type === "pei");
    const otherNotifications = notifications.filter((n) => n.type !== "pei");
    const visibleOther = expanded
        ? otherNotifications
        : otherNotifications.slice(0, 4);

    const BellIcon = icons.Bell;
    const ClockIcon = icons.ClockCountdown;
    const CheckIcon = icons.CheckCircle;

    if (loading) {
        return (
            <div
                className="rounded-2xl p-5 space-y-3 animate-pulse"
                style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-default)",
                }}
            >
                <div
                    className="h-4 w-32 rounded"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                />
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-14 rounded-xl"
                        style={{ backgroundColor: "var(--bg-tertiary)" }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Activity Feed */}
            <div className="sidebar-glass-card">
                <div
                    className="px-5 py-3.5 flex items-center justify-between"
                    style={{
                        borderBottom: "1px solid var(--border-default)",
                        background: "var(--bg-tertiary)",
                    }}
                >
                    <h3
                        className="text-sm font-bold flex items-center gap-2"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {BellIcon ? (
                            <BellIcon weight="duotone" style={{ width: "18px", height: "18px", color: "#4F5BD5" }} />
                        ) : (
                            <span className="w-[18px] h-[18px] rounded bg-indigo-100 animate-pulse" />
                        )}
                        Atividade & Alertas
                    </h3>
                    {notifications.length > 0 && (
                        <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white animate-pulse"
                            style={{
                                background:
                                    peiReminders.some((n) => n.severity === "alert")
                                        ? "#ef4444"
                                        : "#f59e0b",
                                boxShadow: peiReminders.some((n) => n.severity === "alert")
                                    ? '0 0 12px rgba(239, 68, 68, 0.4)'
                                    : '0 0 12px rgba(245, 158, 11, 0.4)',
                            }}
                        >
                            {notifications.length}
                        </span>
                    )}
                </div>

                <div className="p-3 space-y-1.5 max-h-[320px] overflow-y-auto relative">
                    {visibleOther.length === 0 && peiReminders.length === 0 && (
                        <div className="text-center py-8">
                            <div
                                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                                style={{ background: "linear-gradient(135deg, rgba(52, 168, 83, 0.1), rgba(16, 185, 129, 0.1))" }}
                            >
                                {CheckIcon ? (
                                    <CheckIcon weight="duotone" style={{ width: "28px", height: "28px", color: "#34A853" }} />
                                ) : (
                                    <span className="text-2xl">✓</span>
                                )}
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Tudo em dia! Nenhum alerta no momento.
                            </p>
                            <p
                                className="text-xs mt-1 italic"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Continue acompanhando seus estudantes.
                            </p>
                        </div>
                    )}

                    {visibleOther.map((n) => {
                        const style = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
                        const typeIconName = TYPE_ICON_MAP[n.type] || "MapPin";
                        const typeIconColor = TYPE_ICON_COLORS[n.type] || "#64748b";
                        const TypeIcon = icons[typeIconName];
                        const href =
                            n.type === "diario" && n.studentId
                                ? `/diario?student=${n.studentId}`
                                : n.type === "announcement"
                                    ? "#"
                                    : "#";

                        return (
                            <Link
                                key={n.id}
                                href={href}
                                className="flex items-start gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] group"
                                style={{
                                    backgroundColor: style.bg,
                                    border: `1px solid ${style.border}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 4px 16px ${style.dot}18`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {TypeIcon ? (
                                    <TypeIcon
                                        weight="duotone"
                                        className="mt-0.5 shrink-0"
                                        style={{ width: "18px", height: "18px", color: typeIconColor }}
                                    />
                                ) : (
                                    <span className="w-[18px] h-[18px] rounded mt-0.5 shrink-0" style={{ backgroundColor: typeIconColor + '20' }} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-[13px] font-semibold leading-tight"
                                        style={{ color: style.text }}
                                    >
                                        {n.title}
                                    </p>
                                    <p
                                        className="text-[12px] mt-0.5 leading-snug truncate"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {n.description}
                                    </p>
                                </div>
                                <div
                                    className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                                    style={{ backgroundColor: style.dot }}
                                />
                            </Link>
                        );
                    })}
                </div>

                {otherNotifications.length > 4 && (
                    <div
                        className="px-4 py-2 text-center"
                        style={{ borderTop: "1px solid var(--border-default)" }}
                    >
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="text-xs font-medium transition-colors"
                            style={{ color: "var(--text-link)" }}
                        >
                            {expanded
                                ? "Mostrar menos"
                                : `Ver mais ${otherNotifications.length - 4} alertas`}
                        </button>
                    </div>
                )}
            </div>

            {/* PEI Reminders */}
            {peiReminders.length > 0 && (
                <div className="sidebar-glass-card">
                    <div
                        className="px-5 py-3.5 flex items-center justify-between"
                        style={{
                            borderBottom: "1px solid var(--border-default)",
                            background: "var(--bg-tertiary)",
                        }}
                    >
                        <h3
                            className="text-sm font-bold flex items-center gap-2"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {ClockIcon ? (
                                <ClockIcon weight="duotone" style={{ width: "18px", height: "18px", color: "#E8453C" }} />
                            ) : (
                                <span className="w-[18px] h-[18px] rounded bg-red-100 animate-pulse" />
                            )}
                            Lembretes de Revisão PEI
                        </h3>
                        <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                            style={{
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                color: "#ef4444",
                            }}
                        >
                            {peiReminders.length}
                        </span>
                    </div>

                    <div className="p-3 space-y-1.5">
                        {peiReminders.slice(0, 5).map((n) => {
                            const style =
                                SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
                            const PeiIcon = icons.ClipboardText;
                            return (
                                <Link
                                    key={n.id}
                                    href={`/pei?student=${n.studentId}`}
                                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] group"
                                    style={{
                                        backgroundColor: style.bg,
                                        border: `1px solid ${style.border}`,
                                    }}
                                >
                                    {PeiIcon ? (
                                        <PeiIcon
                                            weight="duotone"
                                            className="shrink-0"
                                            style={{ width: "18px", height: "18px", color: "#4285F4" }}
                                        />
                                    ) : (
                                        <span className="w-[18px] h-[18px] rounded shrink-0 bg-blue-100 animate-pulse" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-[13px] font-semibold truncate"
                                            style={{ color: style.text }}
                                        >
                                            {n.studentName || "Estudante"}
                                        </p>
                                        <p
                                            className="text-[11px] mt-0.5"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            {n.description}
                                        </p>
                                    </div>
                                    <span
                                        className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: "var(--text-link)" }}
                                    >
                                        Revisar →
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

