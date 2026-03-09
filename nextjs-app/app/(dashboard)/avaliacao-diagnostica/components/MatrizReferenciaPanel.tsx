"use client";

import React, { useState, useEffect } from "react";
import { OmniLoader } from "@/components/OmniLoader";
import { ChevronRight, ArrowLeft } from "lucide-react";

export function MatrizReferenciaPanel() {
    const [areas, setAreas] = useState<{ area: string; total: number; series: string[] }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
    const [habilidades, setHabilidades] = useState<{
        serie: string; ano: string; tema: string; objeto_conhecimento: string;
        competencia: string; habilidade: string; descritor: string;
    }[]>([]);
    const [loadingHabs, setLoadingHabs] = useState(false);

    useEffect(() => {
        fetch("/api/avaliacao-diagnostica/matriz")
            .then(r => r.json())
            .then(d => setAreas(d.areas || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const selectSerie = async (area: string, serie: string) => {
        setSelectedArea(area);
        setSelectedSerie(serie);
        setLoadingHabs(true);
        try {
            const res = await fetch(`/api/avaliacao-diagnostica/matriz?area=${encodeURIComponent(area)}&serie=${serie}`);
            const data = await res.json();
            setHabilidades(data.habilidades || []);
        } catch { setHabilidades([]); }
        finally { setLoadingHabs(false); }
    };

    const areaColors: Record<string, string> = {
        "Matemática": "#3b82f6",
        "Linguagens": "#8b5cf6",
        "Ciências da Natureza": "#10b981",
        "Ciências Humanas": "#f59e0b",
    };

    if (loading) return <div className="text-center py-10"><OmniLoader variant="card" /></div>;

    if (selectedArea && selectedSerie) {
        const color = areaColors[selectedArea] || "#3b82f6";
        // Group by tema
        const temas: Record<string, typeof habilidades> = {};
        for (const h of habilidades) {
            const t = h.tema || "Geral";
            if (!temas[t]) temas[t] = [];
            temas[t].push(h);
        }

        return (
            <div>
                <button onClick={() => { setSelectedArea(null); setSelectedSerie(null); setHabilidades([]); }} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                    border: "none", background: "var(--color-info-bg)", color: "var(--color-info)", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, marginBottom: 14,
                }}><ArrowLeft size={14} /> Voltar</button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                        {selectedArea} — {selectedSerie}
                    </h3>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{habilidades.length} habilidades</span>
                </div>

                {loadingHabs ? (
                    <div className="text-center py-8"><OmniLoader variant="card" /></div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Object.entries(temas).map(([tema, items]) => (
                            <div key={tema} style={{
                                borderRadius: 14, overflow: "hidden",
                                border: "1px solid var(--border-default, var(--color-muted-border))",
                                background: "var(--bg-secondary)",
                            }}>
                                <div style={{
                                    padding: "10px 16px", fontWeight: 700, fontSize: 13, color,
                                    borderBottom: "1px solid var(--border-default)",
                                }}>
                                    {tema} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>({items.length})</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {items.map((h, i) => {
                                        // Extract code from habilidade text
                                        const codeMatch = h.habilidade.match(/^(EF\d+\w+\d+H?\d*|\(EF\d+\w+\d+\))/i);
                                        const code = codeMatch ? codeMatch[1].replace(/[()]/g, '') : '';
                                        return (
                                            <div key={i} style={{
                                                padding: "12px 16px",
                                                borderBottom: i < items.length - 1 ? "1px solid var(--border-default, var(--color-muted-subtle))" : "none",
                                            }}>
                                                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                                    {code && <span style={{
                                                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                                                        background: `${color}12`, color, whiteSpace: "nowrap",
                                                    }}>{code}</span>}
                                                    {h.competencia && <span style={{
                                                        fontSize: 10, color: "var(--text-muted)", overflow: "hidden",
                                                        textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300,
                                                    }}>{h.competencia.slice(0, 60)}...</span>}
                                                </div>
                                                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 4px", lineHeight: 1.5 }}>
                                                    {h.habilidade}
                                                </p>
                                                {h.descritor && (
                                                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                                                        📝 {h.descritor}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 4px" }}>
                Navegue pelas habilidades da matriz avaliativa por área do conhecimento e ano/série.
            </p>
            {areas.map(a => {
                const color = areaColors[a.area] || "#3b82f6";
                return (
                    <div key={a.area} style={{
                        borderRadius: 14, overflow: "hidden",
                        border: `1.5px solid ${color}30`,
                        background: "var(--bg-secondary)",
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 18px",
                            background: `${color}08`,
                            borderBottom: "1px solid var(--border-default)",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                                <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>{a.area}</span>
                            </div>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.total} habilidades</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 18px" }}>
                            {a.series.sort().map(s => (
                                <button
                                    key={s}
                                    onClick={() => selectSerie(a.area, s)}
                                    style={{
                                        padding: "8px 16px", borderRadius: 10,
                                        background: `${color}08`, border: `1px solid ${color}25`,
                                        color, cursor: "pointer", fontSize: 13, fontWeight: 700,
                                        display: "flex", alignItems: "center", gap: 4,
                                        transition: "all .2s",
                                    }}
                                >
                                    {s} <ChevronRight size={14} />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Manual de Aplicação Panel ──────────────────────────────────────────────


