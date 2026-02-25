"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Loader2, Plus, ChevronLeft, CheckCircle2,
    GraduationCap, FileText, AlertTriangle,
} from "lucide-react";
import { PlanoCursoEditor } from "@/components/PlanoCursoEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComboItem {
    serie: string;
    serieCode: string;
    componente: string;
    componenteId: string | null;
    classGroup: string;
    gradeId: string;
}

interface PlanoExistente {
    id: string;
    disciplina: string;
    ano_serie: string;
    bimestre: string | null;
    conteudo: string | null;
    habilidades_bncc: string[];
    professor_nome: string;
    updated_at: string;
}

// ─── Component Colors ─────────────────────────────────────────────────────────

const COMPONENT_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    "Língua Portuguesa": { bg: "rgba(59,130,246,.08)", border: "rgba(59,130,246,.25)", text: "#60a5fa", accent: "#3b82f6" },
    "Matemática": { bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.25)", text: "#fbbf24", accent: "#f59e0b" },
    "Ciências": { bg: "rgba(16,185,129,.08)", border: "rgba(16,185,129,.25)", text: "#34d399", accent: "#10b981" },
    "História": { bg: "rgba(168,85,247,.08)", border: "rgba(168,85,247,.25)", text: "#c084fc", accent: "#a855f7" },
    "Geografia": { bg: "rgba(6,182,212,.08)", border: "rgba(6,182,212,.25)", text: "#22d3ee", accent: "#06b6d4" },
    "Arte": { bg: "rgba(236,72,153,.08)", border: "rgba(236,72,153,.25)", text: "#f472b6", accent: "#ec4899" },
    "Educação Física": { bg: "rgba(249,115,22,.08)", border: "rgba(249,115,22,.25)", text: "#fb923c", accent: "#f97316" },
    "Língua Inglesa": { bg: "rgba(99,102,241,.08)", border: "rgba(99,102,241,.25)", text: "#818cf8", accent: "#6366f1" },
    "Ensino Religioso": { bg: "rgba(139,92,246,.08)", border: "rgba(139,92,246,.25)", text: "#a78bfa", accent: "#8b5cf6" },
    "Prática Textual": { bg: "rgba(14,165,233,.08)", border: "rgba(14,165,233,.25)", text: "#38bdf8", accent: "#0ea5e9" },
    "Literatura": { bg: "rgba(217,70,239,.08)", border: "rgba(217,70,239,.25)", text: "#e879f9", accent: "#d946ef" },
};

const DEFAULT_COLOR = { bg: "rgba(148,163,184,.08)", border: "rgba(148,163,184,.2)", text: "#94a3b8", accent: "#64748b" };

function getColor(comp: string) {
    return COMPONENT_COLORS[comp] || DEFAULT_COLOR;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlanoCursoClient() {
    const [combos, setCombos] = useState<ComboItem[]>([]);
    const [planos, setPlanos] = useState<PlanoExistente[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMaster, setIsMaster] = useState(false);
    const [professorName, setProfessorName] = useState("");
    const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);

    // ─── Fetch data ─────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [compRes, planosRes] = await Promise.all([
                fetch("/api/plano-curso/meus-componentes").then(r => r.json()),
                fetch("/api/plano-curso").then(r => r.json()),
            ]);
            setCombos(compRes.componentes || []);
            setIsMaster(compRes.is_master || false);
            setProfessorName(compRes.professor?.name || "Professor");
            setPlanos(planosRes.planos || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Helpers ────────────────────────────────────────────────────────────

    function getPlanoCount(componente: string, serie: string): number {
        return planos.filter(p => p.disciplina === componente && p.ano_serie === serie).length;
    }

    function getLastUpdated(componente: string, serie: string): string | null {
        const matching = planos.filter(p => p.disciplina === componente && p.ano_serie === serie);
        if (matching.length === 0) return null;
        matching.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        return matching[0].updated_at;
    }

    // Group combos by componente
    const grouped = combos.reduce<Record<string, ComboItem[]>>((acc, c) => {
        if (!acc[c.componente]) acc[c.componente] = [];
        acc[c.componente].push(c);
        return acc;
    }, {});

    // ─── Loading ────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: "center" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#0ea5e9", margin: "0 auto" }} />
                <p style={{ color: "var(--text-muted)", marginTop: 14, fontSize: 14 }}>Carregando seus componentes...</p>
            </div>
        );
    }

    // ─── Editor view ────────────────────────────────────────────────────────

    if (selectedCombo) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <button
                    onClick={() => { setSelectedCombo(null); fetchData(); }}
                    type="button"
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                        background: "transparent", color: "var(--text-muted, #94a3b8)",
                        cursor: "pointer", width: "fit-content",
                    }}
                >
                    <ChevronLeft size={16} /> Voltar aos componentes
                </button>

                <PlanoCursoEditor
                    componente={selectedCombo.componente}
                    serie={selectedCombo.serie}
                    onSaved={() => fetchData()}
                />
            </div>
        );
    }

    // ─── Grid view ──────────────────────────────────────────────────────────

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                borderRadius: 16, padding: "24px 28px", color: "#fff",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BookOpen size={28} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Plano de Curso</h2>
                        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
                            {professorName} · {combos.length} componente{combos.length !== 1 ? "s" : ""}/série{combos.length !== 1 ? "s" : ""} vinculado{combos.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Empty state */}
            {combos.length === 0 && (
                <div style={{
                    padding: "48px 24px", textAlign: "center",
                    border: "2px dashed var(--border-default, rgba(148,163,184,.15))",
                    borderRadius: 16, color: "var(--text-muted, #64748b)",
                }}>
                    <AlertTriangle size={36} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                    <h3 style={{ marginBottom: 8, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                        Nenhum componente vinculado
                    </h3>
                    <p style={{ fontSize: 14, maxWidth: 400, margin: "0 auto" }}>
                        Você ainda não está vinculado a componentes curriculares e séries.
                        Peça ao coordenador para cadastrar seus vínculos em <strong>Gestão de Usuários</strong>.
                    </p>
                </div>
            )}

            {/* Component groups */}
            {Object.entries(grouped).map(([componente, items]) => {
                const color = getColor(componente);
                return (
                    <div key={componente}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            marginBottom: 12, paddingBottom: 8,
                            borderBottom: `2px solid ${color.border}`,
                        }}>
                            <GraduationCap size={18} style={{ color: color.accent }} />
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.text }}>{componente}</h3>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                                background: color.bg, color: color.text,
                            }}>
                                {items.length} série{items.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                            {items.map((item) => {
                                const count = getPlanoCount(item.componente, item.serie);
                                const lastUpdated = getLastUpdated(item.componente, item.serie);
                                const hasPlanos = count > 0;

                                return (
                                    <button
                                        key={`${item.componente}:${item.serie}`}
                                        onClick={() => setSelectedCombo(item)}
                                        type="button"
                                        style={{
                                            display: "flex", flexDirection: "column", gap: 8,
                                            padding: "16px 18px", borderRadius: 14,
                                            border: `1.5px solid ${hasPlanos ? color.border : "var(--border-default, rgba(148,163,184,.12))"}`,
                                            background: hasPlanos ? color.bg : "var(--bg-secondary, rgba(15,23,42,.4))",
                                            cursor: "pointer", textAlign: "left",
                                            transition: "all .2s",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                                                {item.serie}
                                            </span>
                                            {hasPlanos ? (
                                                <CheckCircle2 size={16} style={{ color: color.accent }} />
                                            ) : (
                                                <Plus size={16} style={{ color: "var(--text-muted, #64748b)" }} />
                                            )}
                                        </div>

                                        {item.classGroup && (
                                            <span style={{ fontSize: 11, color: "var(--text-muted, #94a3b8)" }}>
                                                Turma {item.classGroup}
                                            </span>
                                        )}

                                        {hasPlanos ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <FileText size={12} style={{ color: color.text }} />
                                                <span style={{ fontSize: 12, fontWeight: 600, color: color.text }}>
                                                    {count} plano{count !== 1 ? "s" : ""}
                                                </span>
                                                {lastUpdated && (
                                                    <span style={{ fontSize: 10, color: "var(--text-muted, #94a3b8)" }}>
                                                        · {new Date(lastUpdated).toLocaleDateString("pt-BR")}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                                                Criar plano
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
