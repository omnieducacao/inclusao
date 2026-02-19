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
        <div className="sidebar-glass-card overflow-hidden" style={{ borderRadius: '16px' }}>
            {/* Top gradient bar */}
            <div
                className="h-[2px] w-full"
                style={{
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #6366f1, #10b981, #3b82f6)',
                }}
            />

            <div className="p-5">
                {/* ── LGPD Section ── */}
                <div className="flex items-start gap-3 mb-4">
                    <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.12))',
                            border: '1px solid rgba(16,185,129,0.15)',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                                Proteção LGPD
                            </h3>
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{
                                    background: 'rgba(16,185,129,0.1)',
                                    color: '#059669',
                                    border: '1px solid rgba(16,185,129,0.2)',
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ativa
                            </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                            Dados sensíveis de saúde criptografados com{" "}
                            <strong style={{ color: 'var(--text-secondary)' }}>AES-256-GCM</strong>.
                            Diagnósticos, medicamentos e laudos protegidos em conformidade com o Art. 11 da LGPD.
                        </p>
                    </div>
                </div>

                {/* Security badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {[
                        { icon: "🔐", label: "Criptografia AES-256" },
                        { icon: "🛡️", label: "Dados de Saúde" },
                        { icon: "✓", label: "Art. 11 LGPD" },
                    ].map((badge) => (
                        <span
                            key={badge.label}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
                            style={{
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-default)',
                            }}
                        >
                            <span className="text-[11px]">{badge.icon}</span>
                            {badge.label}
                        </span>
                    ))}
                </div>

                {/* Divider */}
                <div
                    className="h-px w-full mb-4"
                    style={{
                        background: 'linear-gradient(to right, transparent, var(--border-default), transparent)',
                    }}
                />

                {/* ── AI Engines Section ── */}
                <div className="flex items-start gap-3 mb-3">
                    <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.12))',
                            border: '1px solid rgba(99,102,241,0.15)',
                        }}
                    >
                        <LottieIcon
                            animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
                            size={22}
                            loop={true}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                                Motores de IA
                            </h3>
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{
                                    background: 'rgba(99,102,241,0.1)',
                                    color: '#6366f1',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                }}
                            >
                                {engines.length} ativos
                            </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                            Inteligência artificial especializada em educação inclusiva, com anonimização de dados.
                        </p>
                    </div>
                </div>

                {/* Engine pills */}
                <div className="flex flex-wrap gap-1.5">
                    {engines.map((engine) => {
                        const colors = ENGINE_COLORS[engine];
                        const isHovered = hoveredEngine === engine;
                        return (
                            <span
                                key={engine}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-default transition-all duration-200"
                                style={{
                                    background: colors.bg,
                                    color: colors.text,
                                    border: `1px solid ${colors.border}`,
                                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: isHovered ? `0 2px 8px ${colors.border}` : 'none',
                                }}
                                title={ENGINE_NAMES[engine]}
                                onMouseEnter={() => setHoveredEngine(engine)}
                                onMouseLeave={() => setHoveredEngine(null)}
                            >
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{
                                        backgroundColor: colors.dot,
                                        boxShadow: `0 0 6px ${colors.dot}40`,
                                    }}
                                />
                                Omni{ENGINE_SHORT_NAMES[engine]}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
