"use client";
import React from "react";
import { ESCALA_OMNISFERA, NivelOmnisfera } from "@/lib/omnisfera-types";

/**
 * Visual rubric guide for level attribution.
 * Shows all 5 Omnisfera levels with support level, description, and recommended instrument.
 * Highlights the currently selected level.
 */

interface RubricaOmnisferaProps {
    nivelAtual?: NivelOmnisfera;
    onSelect?: (nivel: NivelOmnisfera) => void;
    compact?: boolean;
}

const LEVEL_COLORS: Record<NivelOmnisfera, { bg: string; border: string; text: string; gradient: string }> = {
    0: { bg: "rgba(239,68,68,.06)", border: "rgba(239,68,68,.25)", text: "#ef4444", gradient: "linear-gradient(135deg, #dc2626, #ef4444)" },
    1: { bg: "rgba(245,158,11,.06)", border: "rgba(245,158,11,.25)", text: "#f59e0b", gradient: "linear-gradient(135deg, #d97706, #f59e0b)" },
    2: { bg: "rgba(59,130,246,.06)", border: "rgba(59,130,246,.25)", text: "#3b82f6", gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
    3: { bg: "rgba(16,185,129,.06)", border: "rgba(16,185,129,.25)", text: "#10b981", gradient: "linear-gradient(135deg, #059669, #10b981)" },
    4: { bg: "rgba(99,102,241,.06)", border: "rgba(99,102,241,.25)", text: "#6366f1", gradient: "linear-gradient(135deg, #4f46e5, #6366f1)" },
};

export function RubricaOmnisfera({ nivelAtual, onSelect, compact }: RubricaOmnisferaProps) {
    const levels = [0, 1, 2, 3, 4] as NivelOmnisfera[];

    if (compact) {
        // Compact: horizontal level selector (no rubric content)
        return (
            <div style={{
                display: "flex", gap: 6, flexWrap: "wrap",
                padding: "8px 0",
            }}>
                {levels.map(n => {
                    const c = LEVEL_COLORS[n];
                    const esc = ESCALA_OMNISFERA[n];
                    const selected = nivelAtual === n;
                    return (
                        <button
                            key={n}
                            onClick={() => onSelect?.(n)}
                            title={`${esc.label}: ${esc.descricao}`}
                            style={{
                                flex: 1, minWidth: 70, padding: "8px 6px", borderRadius: 10,
                                border: selected ? `2px solid ${c.text}` : `1px solid ${c.border}`,
                                background: selected ? c.bg : "transparent",
                                cursor: onSelect ? "pointer" : "default",
                                transition: "all .2s",
                                textAlign: "center",
                            }}
                        >
                            <div style={{
                                width: 24, height: 24, borderRadius: "50%", margin: "0 auto 4px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: selected ? c.gradient : "transparent",
                                color: selected ? "#fff" : c.text,
                                fontSize: 12, fontWeight: 800,
                                border: selected ? "none" : `1.5px solid ${c.border}`,
                            }}>
                                {n}
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: c.text }}>{esc.label}</div>
                        </button>
                    );
                })}
            </div>
        );
    }

    // Full rubric view
    return (
        <div style={{
            borderRadius: 12, overflow: "hidden",
            border: "1px solid var(--border-default, rgba(148,163,184,.12))",
        }}>
            <div style={{
                padding: "10px 14px",
                background: "var(--bg-tertiary, rgba(15,23,42,.5))",
                borderBottom: "1px solid var(--border-default, rgba(148,163,184,.12))",
                fontSize: 12, fontWeight: 700, color: "var(--text-primary)",
                display: "flex", alignItems: "center", gap: 6,
            }}>
                📊 Rubrica de Correção — Escala Omnisfera
            </div>
            <div style={{ padding: 0 }}>
                {levels.map(n => {
                    const c = LEVEL_COLORS[n];
                    const esc = ESCALA_OMNISFERA[n];
                    const selected = nivelAtual === n;

                    return (
                        <div
                            key={n}
                            onClick={() => onSelect?.(n)}
                            style={{
                                display: "flex", alignItems: "flex-start", gap: 12,
                                padding: "10px 14px",
                                background: selected ? c.bg : "transparent",
                                borderBottom: n < 4 ? "1px solid var(--border-default, rgba(148,163,184,.08))" : "none",
                                cursor: onSelect ? "pointer" : "default",
                                transition: "all .15s",
                                borderLeft: selected ? `3px solid ${c.text}` : "3px solid transparent",
                            }}
                        >
                            {/* Level badge */}
                            <div style={{
                                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: selected ? c.gradient : "transparent",
                                border: selected ? "none" : `1.5px solid ${c.border}`,
                                color: selected ? "#fff" : c.text,
                                fontSize: 14, fontWeight: 800,
                                marginTop: 2,
                            }}>
                                {n}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: selected ? c.text : "var(--text-primary)" }}>
                                        {esc.label}
                                    </span>
                                    <span style={{
                                        fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                                        background: `${c.text}15`, color: c.text,
                                    }}>
                                        {esc.suporte_correspondente}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary, #94a3b8)", lineHeight: 1.5 }}>
                                    {esc.descricao}
                                </div>
                                <div style={{ fontSize: 10, color: "var(--text-muted, #64748b)", marginTop: 4, fontStyle: "italic" }}>
                                    🔧 {esc.instrumento_recomendado}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
