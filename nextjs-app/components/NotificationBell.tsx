"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, AlertTriangle, Info, AlertCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

type Notification = {
    id: string;
    type: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "alert";
    studentId?: string;
    studentName?: string;
};

/**
 * NotificationBell — shows a bell icon with a badge count.
 * Fetches notifications on hover/click from /api/notifications.
 */
export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        if (fetched) return;
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setTotal(data.total || 0);
                setFetched(true);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [fetched]);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const handleToggle = () => {
        if (!open) fetchNotifications();
        setOpen((prev) => !prev);
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "alert":
                return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
            default:
                return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
        }
    };

    const getSeverityBg = (severity: string) => {
        switch (severity) {
            case "alert":
                return "bg-red-50 border-red-100";
            case "warning":
                return "bg-amber-50 border-amber-100";
            default:
                return "bg-blue-50 border-blue-100";
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={handleToggle}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                title="Notificações"
            >
                <Bell className="w-5 h-5" />
                {total > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] px-1 border-2 border-white">
                        {total > 9 ? "9+" : total}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50"
                    style={{ maxHeight: "60vh", backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-default)' }}>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            Notificações
                            {total > 0 && (
                                <span className="ml-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>({total})</span>
                            )}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
                        {loading && (
                            <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                Verificando...
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="py-8 text-center">
                                <div className="text-2xl mb-2">✅</div>
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Tudo em dia!</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Nenhuma notificação pendente.</div>
                            </div>
                        )}

                        {!loading &&
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-25 transition-colors ${getSeverityBg(n.severity)} border-l-4`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        {getSeverityIcon(n.severity)}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                                {n.title}
                                            </div>
                                            <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                {n.description}
                                            </div>
                                            {n.studentId && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpen(false);
                                                        router.push(
                                                            n.type === "diario"
                                                                ? `/diario?studentId=${n.studentId}`
                                                                : `/pei?studentId=${n.studentId}`
                                                        );
                                                    }}
                                                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Ir para {n.type === "diario" ? "Diário" : "PEI"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
