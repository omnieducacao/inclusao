"use client";

import { useState } from "react";
import { Newspaper, Calendar, Sparkles, Rocket, ChevronDown, ChevronUp } from "lucide-react";

type FeedItem = {
    id: string;
    type: "changelog" | "data_comemorativa" | "dica" | "aviso" | "emergencia";
    title: string;
    body: string;
    date: string;       // ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
    icon: string;       // emoji ou text icon
    color: string;      // hex color
    link_url?: string;
};

const TYPE_META: Record<FeedItem["type"], { label: string; iconComponent: any }> = {
    changelog: { label: "Novidade", iconComponent: Rocket },
    data_comemorativa: { label: "Data Comemorativa", iconComponent: Calendar },
    dica: { label: "Dica", iconComponent: Sparkles },
    aviso: { label: "Aviso", iconComponent: Newspaper },
    emergencia: { label: "Alerta🚨", iconComponent: Newspaper }
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 0) return `em ${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""}`;
    if (days === 0) return "hoje";
    if (days === 1) return "ontem";
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} sem. atrás`;
    return `${Math.floor(days / 30)} mês${Math.floor(days / 30) !== 1 ? "es" : ""} atrás`;
}

function sortFeed(items: FeedItem[]): FeedItem[] {
    const now = Date.now();
    return [...items].sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        const aFuture = da > now;
        const bFuture = db > now;
        if (aFuture && !bFuture) return -1;
        if (!aFuture && bFuture) return 1;
        return aFuture ? da - db : db - da; // Closest feature first OR most recent past first
    });
}

const INITIAL_SHOW = 4;

export function FeedClient({ initialItems }: { initialItems: FeedItem[] }) {
    const [expanded, setExpanded] = useState(false);
    const sorted = sortFeed(initialItems);
    const visible = expanded ? sorted : sorted.slice(0, INITIAL_SHOW);

    return (
        <section
            className="rounded-2xl overflow-hidden"
            style={{
                background: "var(--surface-1, #ffffff)",
                border: "1px solid var(--border-light, #e2e8f0)",
            }}
        >
            {/* Header */}
            <div
                className="px-5 py-3.5 flex items-center gap-2"
                style={{
                    borderBottom: "1px solid var(--border-light, #e2e8f0)",
                    background: "var(--bg-tertiary, #f8fafc)",
                }}
            >
                <Newspaper size={15} style={{ color: "#2B6B8A" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary, #1e293b)" }}>
                    Feed OmniProf
                </h3>
                <span
                    className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(43,107,138,0.08)", color: "#2B6B8A" }}
                >
                    {sorted.length}
                </span>
            </div>

            {/* Items */}
            <div className="p-3 space-y-2">
                {visible.length === 0 && (
                    <div className="text-center py-6">
                        <p className="text-xs text-slate-400">Nenhum aviso no momento.</p>
                    </div>
                )}
                {visible.map((item) => {
                    const fallbackMeta = TYPE_META.aviso;
                    const meta = TYPE_META[item.type] || fallbackMeta;
                    const TypeIcon = meta.iconComponent;

                    const cardContent = (
                        <div
                            className="flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.005]"
                            style={{
                                background: `${item.color}06`,
                                border: `1px solid ${item.color}12`,
                            }}
                        >
                            <div
                                className="shrink-0 flex items-center justify-center rounded-lg mt-0.5"
                                style={{ width: 32, height: 32, background: `${item.color}12` }}
                            >
                                <span className="text-sm">{item.icon}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span
                                        className="text-[13px] font-bold leading-tight"
                                        style={{ color: "var(--text-primary, #1e293b)" }}
                                    >
                                        {item.title}
                                    </span>
                                </div>
                                <p
                                    className="text-[12px] leading-snug m-0"
                                    style={{ color: "var(--text-secondary, #64748b)" }}
                                >
                                    {item.body}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span
                                        className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ background: `${item.color}10`, color: item.color }}
                                    >
                                        <TypeIcon size={10} />
                                        {meta.label}
                                    </span>
                                    <span className="text-[10px]" style={{ color: "var(--text-muted, #94a3b8)" }}>
                                        {timeAgo(item.date)}
                                    </span>
                                </div>
                            </div>
                        </div >
                    );

                    if (item.link_url) {
                        return (
                            <a key={item.id} href={item.link_url} target="_blank" rel="noopener noreferrer" className="block outline-none">
                                {cardContent}
                            </a>
                        );
                    }

                    return <div key={item.id}>{cardContent}</div>;
                })}
            </div >

            {/* Expand/Collapse */}
            {
                sorted.length > INITIAL_SHOW && (
                    <div
                        className="px-4 py-2.5 text-center"
                        style={{ borderTop: "1px solid var(--border-light, #e2e8f0)" }}
                    >
                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
                            style={{ color: "#2B6B8A", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                            {expanded ? (
                                <>Mostrar menos <ChevronUp size={12} /></>
                            ) : (
                                <>Ver mais {sorted.length - INITIAL_SHOW} itens <ChevronDown size={12} /></>
                            )}
                        </button>
                    </div>
                )
            }
        </section >
    );
}
