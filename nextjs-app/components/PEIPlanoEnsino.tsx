"use client";

import React, { useState, useEffect } from "react";
import {
    FileText, Upload, Edit3, Save, Loader2,
    CheckCircle2, BookOpen, AlertTriangle,
} from "lucide-react";

interface Props {
    studentId: string | null;
    disciplina: string;
    anoSerie: string;
    onPlanoSaved?: (planoId: string) => void;
}

export function PEIPlanoEnsino({ studentId, disciplina, anoSerie, onPlanoSaved }: Props) {
    const [modo, setModo] = useState<"escolher" | "colar" | "criar">("escolher");
    const [conteudo, setConteudo] = useState("");
    const [habilidadesBncc, setHabilidadesBncc] = useState<string[]>([]);
    const [bimestre, setBimestre] = useState("1º bimestre");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [planoId, setPlanoId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Carregar plano existente
    useEffect(() => {
        if (!disciplina || !anoSerie) return;
        setLoading(true);
        fetch(`/api/pei/plano-ensino?disciplina=${encodeURIComponent(disciplina)}&ano_serie=${encodeURIComponent(anoSerie)}`)
            .then((r) => r.json())
            .then((data) => {
                const planos = data.planos || [];
                if (planos.length > 0) {
                    const p = planos[0];
                    setConteudo(p.conteudo || "");
                    setHabilidadesBncc(p.habilidades_bncc || []);
                    setBimestre(p.bimestre || "1º bimestre");
                    setPlanoId(p.id);
                    setModo("colar");
                    setSaved(true);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [disciplina, anoSerie]);

    const salvar = async () => {
        if (!conteudo.trim()) {
            setError("O plano de ensino não pode estar vazio.");
            return;
        }
        setSaving(true);
        setError("");

        try {
            const res = await fetch("/api/pei/plano-ensino", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: planoId || undefined,
                    disciplina,
                    ano_serie: anoSerie,
                    conteudo,
                    habilidades_bncc: habilidadesBncc,
                    bimestre,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlanoId(data.plano?.id);
            setSaved(true);
            onPlanoSaved?.(data.plano?.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar plano");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "#6366f1" }} />
            </div>
        );
    }

    // Tela de escolha
    if (modo === "escolher") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    borderRadius: 14, padding: "18px 22px", color: "#fff",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <BookOpen size={20} />
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                            Plano de Ensino — {disciplina}
                        </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                        O plano de ensino é a base para a avaliação diagnóstica.
                        A IA usará este plano para gerar questões contextualizadas.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <button
                        onClick={() => setModo("colar")}
                        style={{
                            padding: "24px 20px", borderRadius: 12, border: "1px solid rgba(16,185,129,.3)",
                            background: "rgba(16,185,129,.08)", cursor: "pointer",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                            color: "#e2e8f0", transition: "all .2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,.6)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,.3)"; }}
                    >
                        <Upload size={28} style={{ color: "#10b981" }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Inserir plano pronto</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Cole ou digite o plano existente</span>
                    </button>

                    <button
                        onClick={() => setModo("criar")}
                        style={{
                            padding: "24px 20px", borderRadius: 12, border: "1px solid rgba(99,102,241,.3)",
                            background: "rgba(99,102,241,.08)", cursor: "pointer",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                            color: "#e2e8f0", transition: "all .2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,.6)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,.3)"; }}
                    >
                        <Edit3 size={28} style={{ color: "#6366f1" }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Criar plano do zero</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Estruture o plano com ajuda da IA</span>
                    </button>
                </div>
            </div>
        );
    }

    // Editor de plano (colar ou criar)
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={18} style={{ color: "#10b981" }} />
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>
                        Plano de Ensino — {disciplina}
                    </h4>
                    {saved && (
                        <span style={{
                            display: "flex", alignItems: "center", gap: 4,
                            fontSize: 12, color: "#10b981", fontWeight: 600,
                        }}>
                            <CheckCircle2 size={14} /> Salvo
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setModo("escolher")}
                    style={{
                        background: "none", border: "none", color: "#94a3b8",
                        cursor: "pointer", fontSize: 13, textDecoration: "underline",
                    }}
                >
                    Voltar
                </button>
            </div>

            {/* Bimestre */}
            <div style={{ display: "flex", gap: 8 }}>
                {["1º bimestre", "2º bimestre", "3º bimestre", "4º bimestre"].map((b) => (
                    <button
                        key={b}
                        onClick={() => setBimestre(b)}
                        style={{
                            padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                            border: bimestre === b ? "1px solid #6366f1" : "1px solid rgba(148,163,184,.2)",
                            background: bimestre === b ? "rgba(99,102,241,.15)" : "transparent",
                            color: bimestre === b ? "#a5b4fc" : "#94a3b8",
                            cursor: "pointer", transition: "all .2s",
                        }}
                    >
                        {b}
                    </button>
                ))}
            </div>

            {/* Textarea */}
            <textarea
                value={conteudo}
                onChange={(e) => { setConteudo(e.target.value); setSaved(false); }}
                placeholder={modo === "colar"
                    ? "Cole aqui o plano de ensino do professor regente...\n\nInclua: objetivos, conteúdos, habilidades BNCC previstas, metodologia, avaliação."
                    : "Descreva o plano de ensino para esta disciplina...\n\n• Objetivos de aprendizagem\n• Conteúdos programáticos\n• Habilidades BNCC\n• Metodologia\n• Avaliação"
                }
                style={{
                    width: "100%", minHeight: 260, padding: 16, borderRadius: 12,
                    background: "rgba(15,23,42,.6)", color: "#e2e8f0",
                    border: "1px solid rgba(148,163,184,.2)",
                    fontSize: 14, lineHeight: 1.6, resize: "vertical",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
            />

            {error && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: 8,
                    background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13,
                }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {/* Botão salvar */}
            <button
                onClick={salvar}
                disabled={saving || !conteudo.trim()}
                style={{
                    padding: "12px 20px", borderRadius: 10,
                    background: conteudo.trim() ? "linear-gradient(135deg, #059669, #10b981)" : "#334155",
                    color: "#fff", border: "none",
                    cursor: saving || !conteudo.trim() ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: 15,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
            >
                {saving ? (
                    <><Loader2 size={18} className="animate-spin" /> Salvando...</>
                ) : (
                    <><Save size={18} /> Salvar Plano de Ensino</>
                )}
            </button>
        </div>
    );
}
