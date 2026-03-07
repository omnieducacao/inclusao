"use client";

import React, { useState, useEffect } from "react";
import { OmniLoader } from "@/components/OmniLoader";
import { BookMarked, ChevronUp, ChevronDown, Target, Users } from "lucide-react";

export function ManualAplicacaoPanel() {
    const [manual, setManual] = useState<{ passo: number; titulo: string; instrucao: string }[]>([]);
    const [escala, setEscala] = useState<{ nivel: number; label: string; codigo: string; descritor: string; observar: string; suporte: string }[]>([]);
    const [adaptacoes, setAdaptacoes] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [expandedStep, setExpandedStep] = useState<number | null>(1);

    useEffect(() => {
        Promise.all([
            fetch("/api/avaliacao-diagnostica/matriz?section=manual").then(r => r.json()),
            fetch("/api/avaliacao-diagnostica/matriz?section=escala").then(r => r.json()),
        ]).then(([manualData, escalaData]) => {
            setManual(manualData.manual || []);
            setEscala(escalaData.escala || []);
            setAdaptacoes(escalaData.adaptacoes_nee || {});
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const nivelColors = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

    if (loading) return <div className="text-center py-10"><OmniLoader variant="card" /></div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Step-by-step manual */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <BookMarked size={18} style={{ color: "#3b82f6" }} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Passo a Passo</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {manual.map(step => (
                        <div key={step.passo} style={{
                            borderRadius: 12, overflow: "hidden",
                            border: expandedStep === step.passo
                                ? "1.5px solid rgba(37,99,235,.3)"
                                : "1px solid var(--border-default, rgba(148,163,184,.1))",
                            background: "var(--bg-secondary, rgba(15,23,42,.4))",
                        }}>
                            <button
                                onClick={() => setExpandedStep(expandedStep === step.passo ? null : step.passo)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "12px 16px",
                                    border: "none", cursor: "pointer",
                                    background: expandedStep === step.passo ? "rgba(37,99,235,.05)" : "transparent",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 12, fontWeight: 800,
                                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                        color: "#fff",
                                    }}>{step.passo}</span>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{step.titulo}</span>
                                </div>
                                {expandedStep === step.passo ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />}
                            </button>
                            {expandedStep === step.passo && (
                                <div style={{ padding: "0 16px 14px", fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>
                                    {step.instrucao}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Escala de Proficiência Omnisfera */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Target size={18} style={{ color: "#8b5cf6" }} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Escala de Proficiência Omnisfera</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {escala.map(e => (
                        <div key={e.nivel} style={{
                            display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12,
                            border: `1.5px solid ${nivelColors[e.nivel]}30`,
                            background: `${nivelColors[e.nivel]}06`,
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: `linear-gradient(135deg, ${nivelColors[e.nivel]}, ${nivelColors[e.nivel]}cc)`,
                                color: "#fff", fontSize: 18, fontWeight: 800,
                            }}>{e.nivel}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: nivelColors[e.nivel] }}>
                                    {e.label} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>({e.codigo})</span>
                                </div>
                                <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2, lineHeight: 1.5 }}>
                                    {e.descritor}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                                    👁️ {e.observar}
                                </div>
                                <div style={{ fontSize: 11, color: nivelColors[e.nivel], marginTop: 4, fontWeight: 600 }}>
                                    Suporte: {e.suporte}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Adaptações por perfil NEE */}
            {Object.keys(adaptacoes).length > 0 && (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <Users size={18} style={{ color: "#10b981" }} />
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Adaptações por Perfil NEE</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                        {Object.entries(adaptacoes).map(([perfil, desc]) => (
                            <div key={perfil} style={{
                                padding: "14px 16px", borderRadius: 12,
                                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                            }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#10b981", marginBottom: 6 }}>{perfil}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

