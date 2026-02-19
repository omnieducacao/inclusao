"use client";

import { useState, useEffect } from "react";
import type { Icon } from "phosphor-react";

type KPIs = {
    total_students: number;
    students_with_pei: number;
    recent_diario_entries: number;
    pei_up_to_date: number;
    pei_stale: number;
};

type KPICard = {
    label: string;
    value: number;
    suffix?: string;
    iconName: string;
    color: string;
    gradient: string;
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        const duration = 800;
        const steps = 20;
        const increment = value / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplay(value);
                clearInterval(interval);
            } else {
                setDisplay(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(interval);
    }, [value]);

    return <>{display}{suffix}</>;
}

export function SchoolMiniDashboard() {
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [loading, setLoading] = useState(true);
    const [icons, setIcons] = useState<Record<string, Icon>>({});

    useEffect(() => {
        fetch("/api/home/stats")
            .then((r) => r.json())
            .then((data) => setKpis(data.kpis || null))
            .catch(() => setKpis(null))
            .finally(() => setLoading(false));

        if (typeof window !== "undefined") {
            import("phosphor-react").then((phosphor) => {
                setIcons({
                    ChartBar: phosphor.ChartBar,
                    UsersFour: phosphor.UsersFour,
                    ClipboardText: phosphor.ClipboardText,
                    BookOpen: phosphor.BookOpen,
                    CheckCircle: phosphor.CheckCircle,
                });
            });
        }
    }, []);

    if (loading) {
        return (
            <div
                className="rounded-2xl p-5 animate-pulse"
                style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-default)",
                }}
            >
                <div className="h-4 w-40 rounded mb-4" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!kpis) return null;

    const peiTotal = kpis.students_with_pei;
    const peiPercent = kpis.total_students > 0
        ? Math.round((kpis.students_with_pei / kpis.total_students) * 100)
        : 0;
    const peiFreshPercent = peiTotal > 0
        ? Math.round((kpis.pei_up_to_date / peiTotal) * 100)
        : 0;

    const HeaderIcon = icons.ChartBar;

    const cards: KPICard[] = [
        {
            label: "Estudantes",
            value: kpis.total_students,
            iconName: "UsersFour",
            color: "#4F5BD5",
            gradient: "linear-gradient(135deg, #4F5BD5, #6366f1)",
        },
        {
            label: "Com PEI",
            value: kpis.students_with_pei,
            suffix: ` (${peiPercent}%)`,
            iconName: "ClipboardText",
            color: "#34A853",
            gradient: "linear-gradient(135deg, #34A853, #10b981)",
        },
        {
            label: "Diário (7d)",
            value: kpis.recent_diario_entries,
            iconName: "BookOpen",
            color: "#E8453C",
            gradient: "linear-gradient(135deg, #E8453C, #f43f5e)",
        },
        {
            label: "PEI Atualizado",
            value: kpis.pei_up_to_date,
            suffix: peiTotal > 0 ? ` de ${peiTotal}` : "",
            iconName: "CheckCircle",
            color: "#22c55e",
            gradient: "linear-gradient(135deg, #22c55e, #10b981)",
        },
    ];

    return (
        <div className="sidebar-glass-card">
            <div
                className="px-5 py-3.5 relative overflow-hidden"
                style={{
                    borderBottom: "1px solid var(--border-default)",
                    background: "var(--bg-tertiary)",
                }}
            >
                <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(to right, #4F5BD5, #6366f1, #8b5cf6)' }} />
                <h3
                    className="text-sm font-bold flex items-center gap-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    {HeaderIcon ? (
                        <HeaderIcon weight="duotone" style={{ width: "18px", height: "18px", color: "#4F5BD5" }} />
                    ) : (
                        <span className="w-[18px] h-[18px] rounded bg-indigo-100 animate-pulse" />
                    )}
                    Resumo da Escola
                </h3>
            </div>

            <div className="p-3">
                <div className="grid grid-cols-2 gap-2.5">
                    {cards.map((card) => {
                        const CardIcon = icons[card.iconName];
                        return (
                            <div
                                key={card.label}
                                className="relative rounded-xl px-4 py-3.5 overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
                                style={{
                                    backgroundColor: "var(--bg-tertiary)",
                                    border: "1px solid var(--border-default)",
                                    boxShadow: "var(--shadow-xs), inset 0 1px 0 rgba(255,255,255,0.5)",
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                }}
                            >
                                {/* Subtle gradient accent */}
                                <div
                                    className="absolute top-0 left-0 w-full h-0.5 transition-all duration-300 group-hover:h-1"
                                    style={{ background: card.gradient }}
                                />
                                <div className="flex items-center gap-2 mb-1">
                                    {CardIcon ? (
                                        <div
                                            className="transition-all duration-300 group-hover:scale-110"
                                            style={{ filter: `drop-shadow(0 0 4px ${card.color}30)` }}
                                        >
                                            <CardIcon
                                                weight="duotone"
                                                style={{ width: "15px", height: "15px", color: card.color }}
                                            />
                                        </div>
                                    ) : (
                                        <span className="w-[15px] h-[15px] rounded animate-pulse" style={{ backgroundColor: card.color + '30' }} />
                                    )}
                                    <span
                                        className="text-[11px] font-semibold uppercase tracking-wide"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {card.label}
                                    </span>
                                </div>
                                <div
                                    className="text-xl font-extrabold tabular-nums"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    <AnimatedNumber value={card.value} />
                                    {card.suffix && (
                                        <span
                                            className="text-xs font-medium ml-0.5"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            {card.suffix}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* PEI coverage progress bar */}
                {kpis.total_students > 0 && (
                    <div className="mt-3 px-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span
                                className="text-[11px] font-semibold"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Cobertura PEI
                            </span>
                            <span
                                className="text-[11px] font-bold tabular-nums"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {peiPercent}%
                            </span>
                        </div>
                        <div
                            className="w-full h-2 rounded-full overflow-hidden progress-shimmer"
                            style={{ backgroundColor: "var(--bg-tertiary)" }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${peiPercent}%`,
                                    background: "linear-gradient(to right, #4F5BD5, #34A853)",
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* PEI freshness bar */}
                {peiTotal > 0 && (
                    <div className="mt-2.5 px-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span
                                className="text-[11px] font-semibold"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                PEIs Atualizados (60d)
                            </span>
                            <span
                                className="text-[11px] font-bold tabular-nums"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {peiFreshPercent}%
                            </span>
                        </div>
                        <div
                            className="w-full h-2 rounded-full overflow-hidden progress-shimmer"
                            style={{ backgroundColor: "var(--bg-tertiary)" }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${peiFreshPercent}%`,
                                    background:
                                        peiFreshPercent >= 80
                                            ? "linear-gradient(to right, #34A853, #10b981)"
                                            : peiFreshPercent >= 50
                                                ? "linear-gradient(to right, #F9AB00, #eab308)"
                                                : "linear-gradient(to right, #E8453C, #f97316)",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
