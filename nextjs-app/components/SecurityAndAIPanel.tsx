"use client";

import { useState } from "react";
import type { EngineId } from "@/lib/ai-engines";
import { ENGINE_NAMES } from "@/lib/ai-engines";
import { LottieIcon } from "./LottieIcon";

const ENGINE_COLORS: Record<EngineId, { bg: string; text: string; dot: string; border: string }> = {
    red: { bg: "rgba(239,68,68,0.08)", text: "#dc2626", dot: "#ef4444", border: "rgba(239,68,68,0.2)" },
    blue: { bg: "rgba(59,130,246,0.08)", text: "#2563eb", dot: "#3b82f6", border: "rgba(59,130,246,0.2)" },
    green: { bg: "rgba(16,185,129,0.08)", text: "#059669", dot: "#10b981", border: "rgba(16,185,129,0.2)" },
    yellow: { bg: "rgba(245,158,11,0.08)", text: "#d97706", dot: "#f59e0b", border: "rgba(245,158,11,0.2)" },
    orange: { bg: "rgba(249,115,22,0.08)", text: "#ea580c", dot: "#f97316", border: "rgba(249,115,22,0.2)" },
};

const ENGINE_SHORT_NAMES: Record<EngineId, string> = {
    red: "Red",
    blue: "Blue",
    green: "Green",
    yellow: "Yellow",
    orange: "Orange",
};

interface SecurityAndAIPanelProps {
    engines?: EngineId[];
}

export function SecurityAndAIPanel({ engines = ["red", "blue", "green", "yellow", "orange"] }: SecurityAndAIPanelProps) {
    const [hoveredEngine, setHoveredEngine] = useState<EngineId | null>(null);

    return (
        <div className="sidebar-glass-card overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ borderRadius: '16px', border: '1px solid rgba(15,23,42,0.05)' }}>
            {/* Top gradient aurora bar */}
            <div
                className="h-[3px] w-full bg-linear-to-r from-blue-500 via-indigo-500 to-emerald-500"
            />

            <div className="p-5 flex flex-col md:flex-row gap-6 md:items-start">
                {/* ── Certificações e LGPD Section ── */}
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                        <div
                            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.12))',
                                border: '1px solid rgba(16,185,129,0.2)',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.1)'
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-slate-800">
                                    Segurança & Compliance Educacional
                                </h3>
                                <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                                    style={{
                                        background: 'rgba(16,185,129,0.1)',
                                        color: '#059669',
                                        border: '1px solid rgba(16,185,129,0.2)',
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                    Totalmente Seguro
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-500 mb-3">
                                Blindagem jurídica contra vazamentos. Os dados diagnósticos, médicos e relatórios educacionais
                                são <strong className="text-slate-700">criptografados end-to-end (AES-256)</strong>. Auditlogs ativos e relatórios em conformidade total com os Art. 11 e 37 da LGPD.
                            </p>

                            {/* Premium Enterprise Badges */}
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { icon: "🔐", label: "Criptografia GCM" },
                                    { icon: "🏥", label: "Protocolo Saúde" },
                                    { icon: "👁️", label: "WCAG AAA 100%" },
                                    { icon: "🛡️", label: "Auditoria Ativa" },
                                ].map((badge) => (
                                    <span
                                        key={badge.label}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 hover:-translate-y-0.5"
                                        style={{
                                            background: '#f8fafc',
                                            color: '#475569',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 2px 4px rgba(15,23,42,0.02)'
                                        }}
                                    >
                                        <span className="text-xs opacity-80">{badge.icon}</span>
                                        {badge.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider em Desktop vira vertical */}
                <div className="hidden md:block w-px h-[120px] bg-linear-to-b from-transparent via-slate-200 to-transparent mx-2" />
                <div className="md:hidden h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent my-1" />

                {/* ── AI Engines Section ── */}
                <div className="flex-1">
                    <div className="flex items-start gap-4">
                        <div
                            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.12))',
                                border: '1px solid rgba(99,102,241,0.2)',
                                boxShadow: '0 4px 12px rgba(99,102,241,0.1)'
                            }}
                        >
                            <LottieIcon
                                animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
                                size={28}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-slate-800">
                                    Ecossistema Multi-Engines
                                </h3>
                                <span
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                                    style={{
                                        background: 'rgba(99,102,241,0.1)',
                                        color: '#6366f1',
                                        border: '1px solid rgba(99,102,241,0.2)',
                                    }}
                                >
                                    {engines.length} Inteligências
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-500 mb-3">
                                Modelos especializados que processam laudos médicos, interpretam a BNCC e desenham planos PDI preditivos
                                em milissegundos, com o sistema blindado para <strong className="text-slate-700">Zero-Training Policy</strong> (seus dados não treinam a I.A).
                            </p>

                            {/* Engine pills Magnéticos */}
                            <div className="flex flex-wrap gap-2">
                                {engines.map((engine) => {
                                    const colors = ENGINE_COLORS[engine];
                                    const isHovered = hoveredEngine === engine;
                                    return (
                                        <span
                                            key={engine}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-default transition-all duration-300 ease-out"
                                            style={{
                                                background: colors.bg,
                                                color: colors.text,
                                                border: `1px solid ${colors.border}`,
                                                transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                                                boxShadow: isHovered ? `0 4px 12px ${colors.border}` : '0 1px 2px rgba(0,0,0,0.02)',
                                            }}
                                            title={ENGINE_NAMES[engine]}
                                            onMouseEnter={() => setHoveredEngine(engine)}
                                            onMouseLeave={() => setHoveredEngine(null)}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0 transition-transform duration-300"
                                                style={{
                                                    backgroundColor: colors.dot,
                                                    boxShadow: `0 0 8px ${colors.dot}80`,
                                                    transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                                                }}
                                            />
                                            Omni{ENGINE_SHORT_NAMES[engine]}
                                        </span>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

