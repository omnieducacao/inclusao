"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Icon } from "phosphor-react";

// ── Types ──
type KPIs = {
    total_students: number;
    students_with_pei: number;
    recent_diario_entries: number;
    pei_up_to_date: number;
    pei_stale: number;
};

type Notification = {
    id: string;
    type: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "alert";
    studentId?: string;
    studentName?: string;
};

const TABS = [
    { id: "overview", label: "Visão Geral", iconName: "ChartBar" },
    { id: "alerts", label: "Alertas", iconName: "BellRinging" },
    { id: "legislation", label: "Legislação", iconName: "Scales" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const LEIS = [
    { nome: "Lei 13.146/2015", titulo: "Estatuto da Pessoa com Deficiência (LBI)", iconName: "Scales", href: "/infos?tab=legal", cor: "#3b82f6" },
    { nome: "Decreto 10.502/2020", titulo: "Política Nacional de Educação Especial", iconName: "Scroll", href: "/infos?tab=legal", cor: "#8b5cf6" },
    { nome: "BNCC", titulo: "Base Nacional Comum Curricular", iconName: "Books", href: "/infos?tab=legal", cor: "#10b981" },
    { nome: "Resolução CNE/CEB nº 4", titulo: "Diretrizes AEE", iconName: "Bank", href: "/infos?tab=legal", cor: "#f59e0b" },
];

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    alert: { bg: "rgba(239, 68, 68, 0.06)", border: "rgba(239, 68, 68, 0.15)", text: "var(--text-primary)", dot: "#ef4444" },
    warning: { bg: "rgba(245, 158, 11, 0.06)", border: "rgba(245, 158, 11, 0.15)", text: "var(--text-primary)", dot: "#f59e0b" },
    info: { bg: "rgba(59, 130, 246, 0.04)", border: "rgba(59, 130, 246, 0.1)", text: "var(--text-primary)", dot: "#3b82f6" },
};

const TYPE_ICONS: Record<string, string> = { pei: "FileText", diario: "BookOpen", announcement: "Megaphone", paee: "PuzzlePiece" };
const TYPE_COLORS: Record<string, string> = { pei: "#4285F4", diario: "#E8453C", announcement: "#F9AB00", paee: "#9334E6" };

// ── Animated Number ──
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (value === 0) {
            const timer = setTimeout(() => setDisplay(0), 0);
            return () => clearTimeout(timer);
        }
        const steps = 20;
        const increment = value / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= value) { setDisplay(value); clearInterval(interval); }
            else setDisplay(Math.floor(current));
        }, 40);
        return () => clearInterval(interval);
    }, [value]);
    return <>{display}{suffix}</>;
}

// ── Main Component ──
export function SituationPanel() {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [notiLoading, setNotiLoading] = useState(true);
    const [icons, setIcons] = useState<Record<string, Icon>>({});

    // Load phosphor icons
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("phosphor-react").then((phosphor) => {
                setIcons({
                    ChartBar: phosphor.ChartBar,
                    BellRinging: phosphor.BellRinging,
                    Scales: phosphor.Scales,
                    UsersFour: phosphor.UsersFour,
                    ClipboardText: phosphor.ClipboardText,
                    BookOpen: phosphor.BookOpen,
                    CheckCircle: phosphor.CheckCircle,
                    FileText: phosphor.FileText,
                    Megaphone: phosphor.Megaphone,
                    PuzzlePiece: phosphor.PuzzlePiece,
                    Scroll: phosphor.Scroll,
                    Books: phosphor.Books,
                    Bank: phosphor.Bank,
                    Warning: phosphor.Warning,
                    CaretRight: phosphor.CaretRight,
                });
            });
        }
    }, []);

    // Fetch KPIs
    useEffect(() => {
        fetch("/api/home/stats")
            .then((r) => r.json())
            .then((data) => setKpis(data.kpis || null))
            .catch(() => setKpis(null))
            .finally(() => setLoading(false));
    }, []);

    // Fetch notifications
    useEffect(() => {
        fetch("/api/notifications")
            .then((r) => r.json())
            .then((data) => setNotifications(data.notifications || []))
            .catch(() => setNotifications([]))
            .finally(() => setNotiLoading(false));
    }, []);

    const alertCount = notifications.filter((n) => n.severity === "alert" || n.severity === "warning").length;

    return (
        <div className="sidebar-glass-card overflow-hidden">
            {/* ── Tab Bar ── */}
            <div
                className="flex items-center gap-0 px-1 pt-1"
                style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-default)" }}
            >
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const TabIcon = icons[tab.iconName];
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className="relative flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold transition-all duration-200 rounded-t-lg"
                            style={{
                                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                                background: isActive ? "var(--bg-primary)" : "transparent",
                                borderBottom: isActive ? "2px solid #4F5BD5" : "2px solid transparent",
                            }}
                        >
                            {TabIcon && (
                                <TabIcon
                                    weight={isActive ? "duotone" : "regular"}
                                    style={{ width: "14px", height: "14px", color: isActive ? "#4F5BD5" : "var(--text-muted)" }}
                                />
                            )}
                            {tab.label}
                            {tab.id === "alerts" && alertCount > 0 && (
                                <span
                                    className="ml-0.5 px-1.5 py-0 text-[10px] font-bold text-white rounded-full animate-pulse"
                                    style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", fontSize: "9px", lineHeight: "16px", minWidth: "16px", textAlign: "center" }}
                                >
                                    {alertCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            <div className="p-3" style={{ minHeight: "200px" }}>
                {activeTab === "overview" && <OverviewTab kpis={kpis} loading={loading} icons={icons} />}
                {activeTab === "alerts" && <AlertsTab notifications={notifications} loading={notiLoading} icons={icons} />}
                {activeTab === "legislation" && <LegislationTab icons={icons} />}
            </div>
        </div>
    );
}

// ── Overview Tab ──
function OverviewTab({ kpis, loading, icons }: { kpis: KPIs | null; loading: boolean; icons: Record<string, Icon> }) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                ))}
            </div>
        );
    }

    if (!kpis) return <p className="text-[13px] text-center py-6" style={{ color: "var(--text-muted)" }}>Sem dados disponíveis</p>;

    const peiPercent = kpis.total_students > 0 ? Math.round((kpis.students_with_pei / kpis.total_students) * 100) : 0;
    const peiTotal = kpis.students_with_pei;
    const peiFreshPercent = peiTotal > 0 ? Math.round((kpis.pei_up_to_date / peiTotal) * 100) : 0;

    const cards = [
        { label: "Estudantes", value: kpis.total_students, iconName: "UsersFour", color: "#4F5BD5", gradient: "linear-gradient(135deg, #4F5BD5, #6366f1)" },
        { label: "Com PEI", value: kpis.students_with_pei, suffix: ` (${peiPercent}%)`, iconName: "ClipboardText", color: "#34A853", gradient: "linear-gradient(135deg, #34A853, #10b981)" },
        { label: "Diário (7d)", value: kpis.recent_diario_entries, iconName: "BookOpen", color: "#E8453C", gradient: "linear-gradient(135deg, #E8453C, #f43f5e)" },
        { label: "PEI Atualizado", value: kpis.pei_up_to_date, suffix: peiTotal > 0 ? ` de ${peiTotal}` : "", iconName: "CheckCircle", color: "#22c55e", gradient: "linear-gradient(135deg, #22c55e, #10b981)" },
    ];

    return (
        <>
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
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <div className="absolute top-0 left-0 w-full h-0.5 transition-all duration-300 group-hover:h-1" style={{ background: card.gradient }} />
                            <div className="flex items-center gap-2 mb-1">
                                {CardIcon ? (
                                    <div className="transition-all duration-300 group-hover:scale-110" style={{ filter: `drop-shadow(0 0 4px ${card.color}30)` }}>
                                        <CardIcon weight="duotone" style={{ width: "15px", height: "15px", color: card.color }} />
                                    </div>
                                ) : (
                                    <span className="w-[15px] h-[15px] rounded animate-pulse" style={{ backgroundColor: card.color + "30" }} />
                                )}
                                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                    {card.label}
                                </span>
                            </div>
                            <div className="text-xl font-extrabold tabular-nums" style={{ color: "var(--text-primary)" }}>
                                <AnimatedNumber value={card.value} />
                                {card.suffix && <span className="text-xs font-medium ml-0.5" style={{ color: "var(--text-secondary)" }}>{card.suffix}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Bars */}
            {kpis.total_students > 0 && (
                <div className="mt-3 px-1">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>Cobertura PEI</span>
                        <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{peiPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden progress-shimmer" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${peiPercent}%`, background: "linear-gradient(to right, #4F5BD5, #34A853)" }} />
                    </div>
                </div>
            )}
            {peiTotal > 0 && (
                <div className="mt-2.5 px-1">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>PEIs Atualizados (60d)</span>
                        <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{peiFreshPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden progress-shimmer" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${peiFreshPercent}%`,
                                background: peiFreshPercent >= 80 ? "linear-gradient(to right, #34A853, #10b981)" : peiFreshPercent >= 50 ? "linear-gradient(to right, #F9AB00, #eab308)" : "linear-gradient(to right, #E8453C, #f97316)",
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

// ── Alerts Tab ──
function AlertsTab({ notifications, loading, icons }: { notifications: Notification[]; loading: boolean; icons: Record<string, Icon> }) {
    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                ))}
            </div>
        );
    }

    if (notifications.length === 0) {
        const WarningIcon = icons.Warning;
        return (
            <div className="text-center py-8">
                {WarningIcon && <WarningIcon weight="duotone" style={{ width: "32px", height: "32px", color: "var(--text-muted)", margin: "0 auto 8px" }} />}
                <p className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>Nenhum alerta no momento</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>Bom trabalho! 🎉</p>
            </div>
        );
    }

    return (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.map((n) => {
                const styles = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
                const NotiIcon = icons[TYPE_ICONS[n.type]];
                const iconColor = TYPE_COLORS[n.type] || "#64748b";

                return (
                    <div
                        key={n.id}
                        className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] group cursor-pointer"
                        style={{ backgroundColor: styles.bg, border: `1px solid ${styles.border}` }}
                    >
                        <div className="relative mt-0.5 shrink-0">
                            {NotiIcon ? (
                                <NotiIcon weight="duotone" style={{ width: "16px", height: "16px", color: iconColor }} />
                            ) : (
                                <span className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: iconColor + "30" }} />
                            )}
                            <div
                                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse border border-white"
                                style={{ backgroundColor: styles.dot }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                                {n.title}
                            </p>
                            <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--text-secondary)" }}>
                                {n.description}
                            </p>
                            {n.studentName && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                                    {n.studentName}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Legislation Tab ──
function LegislationTab({ icons }: { icons: Record<string, Icon> }) {
    const CaretRight = icons.CaretRight;

    return (
        <div className="space-y-1">
            {LEIS.map((lei) => {
                const LeiIcon = icons[lei.iconName];
                return (
                    <Link
                        key={lei.nome}
                        href={lei.href}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] group"
                        style={{ backgroundColor: "transparent" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                            e.currentTarget.style.boxShadow = `0 2px 12px ${lei.cor}12`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
                            style={{ background: `linear-gradient(135deg, ${lei.cor}18, ${lei.cor}08)`, border: `1px solid ${lei.cor}20` }}
                        >
                            {LeiIcon ? (
                                <LeiIcon weight="duotone" style={{ width: "16px", height: "16px", color: lei.cor }} />
                            ) : (
                                <span className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: `${lei.cor}30` }} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                                {lei.nome}
                            </p>
                            <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                                {lei.titulo}
                            </p>
                        </div>
                        {CaretRight && (
                            <CaretRight
                                weight="bold"
                                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                style={{ width: "12px", height: "12px", color: "var(--text-link)" }}
                            />
                        )}
                    </Link>
                );
            })}
            <div className="px-3.5 pt-2">
                <Link href="/infos?tab=legal" className="text-[11px] font-semibold transition-colors" style={{ color: "var(--text-link)" }}>
                    Ver legislação completa →
                </Link>
            </div>
        </div>
    );
}
