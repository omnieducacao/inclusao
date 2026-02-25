"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Loader2, CheckCircle2, Upload, Link2, FileText,
    ExternalLink, ChevronDown, ChevronRight, Eye,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PlanoVinculado {
    id: string;
    disciplina: string;
    ano_serie: string;
    bimestre: string | null;
    conteudo: string | null;
    habilidades_bncc: string[];
    professor_nome: string;
    updated_at: string;
}

interface SequenciaBloco {
    id: string;
    habilidades_bncc: string[];
    habilidades_descricoes: Record<string, string>;
    unidade_tematica: string;
    objeto_conhecimento: string;
    objetivos: string[];
    objetivos_livre: string;
    metodologias: string[];
    recursos: string[];
    avaliacoes: string[];
    avaliacao_livre: string;
}

interface Props {
    studentId: string | null;
    disciplina: string;
    anoSerie: string;
    onPlanoSaved?: (planoId: string) => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardS: React.CSSProperties = {
    borderRadius: 14, border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    backgroundColor: "var(--bg-secondary, rgba(15,23,42,.4))", overflow: "hidden",
};
const headerS: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
    borderBottom: "1px solid var(--border-default, rgba(148,163,184,.1))",
    backgroundColor: "var(--bg-tertiary, rgba(15,23,42,.3))",
};
const bodyS: React.CSSProperties = { padding: 16 };

// ─── Componente Principal ─────────────────────────────────────────────────────

export function PEIPlanoEnsino({ studentId, disciplina, anoSerie, onPlanoSaved }: Props) {
    const [loading, setLoading] = useState(true);
    const [planosDisponiveis, setPlanosDisponiveis] = useState<PlanoVinculado[]>([]);
    const [planoVinculado, setPlanoVinculado] = useState<PlanoVinculado | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [expandedView, setExpandedView] = useState(false);
    const [uploadMode, setUploadMode] = useState(false);

    // ─── Fetch available plans from Plano de Curso module ───────────────

    useEffect(() => {
        if (!disciplina || !anoSerie) { setLoading(false); return; }
        setLoading(true);

        Promise.all([
            // Fetch plans from plano-curso (independent module)
            fetch(`/api/plano-curso?componente=${encodeURIComponent(disciplina)}&serie=${encodeURIComponent(anoSerie)}`)
                .then(r => r.json()).catch(() => ({ planos: [] })),
            // Check if there's already a linked plan for this PEI
            fetch(`/api/pei/plano-ensino?disciplina=${encodeURIComponent(disciplina)}&ano_serie=${encodeURIComponent(anoSerie)}`)
                .then(r => r.json()).catch(() => ({ planos: [] })),
        ]).then(([cursoData, peiData]) => {
            setPlanosDisponiveis(cursoData.planos || []);
            const peiPlanos = peiData.planos || [];
            if (peiPlanos.length > 0) {
                setPlanoVinculado(peiPlanos[0]);
                setSaved(true);
            }
        }).finally(() => setLoading(false));
    }, [disciplina, anoSerie]);

    // ─── Link plan ──────────────────────────────────────────────────────

    const vincularPlano = useCallback(async (plano: PlanoVinculado) => {
        setSaving(true); setError("");
        try {
            // Ensure conteudo is a string (it may be a parsed object from jsonb)
            const conteudoStr = plano.conteudo
                ? (typeof plano.conteudo === "string" ? plano.conteudo : JSON.stringify(plano.conteudo))
                : null;

            const res = await fetch("/api/pei/plano-ensino", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: planoVinculado?.id || undefined,
                    disciplina, ano_serie: anoSerie,
                    conteudo: conteudoStr,
                    habilidades_bncc: plano.habilidades_bncc,
                    bimestre: plano.bimestre,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao vincular plano");
            setPlanoVinculado({ ...plano, id: data.plano?.id || plano.id });
            setSaved(true);
            onPlanoSaved?.(data.plano?.id);
        } catch (err) {
            console.error("vincularPlano error:", err);
            setError(err instanceof Error ? err.message : "Erro ao vincular plano");
        } finally { setSaving(false); }
    }, [disciplina, anoSerie, planoVinculado, onPlanoSaved]);

    // ─── Parse blocos ───────────────────────────────────────────────────

    function parseBlocos(conteudo: string | null): SequenciaBloco[] {
        if (!conteudo) return [];
        try {
            const parsed = typeof conteudo === "string" ? JSON.parse(conteudo) : conteudo;
            if (parsed?.blocos && Array.isArray(parsed.blocos)) return parsed.blocos;
        } catch { /* ignore */ }
        return [];
    }

    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "#10b981", margin: "0 auto" }} />
                <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 13 }}>Carregando plano...</p>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                borderRadius: 14, padding: "18px 22px", color: "#fff",
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <BookOpen size={22} />
                        <div>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Plano de Ensino — {disciplina}</h4>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
                                {anoSerie} · Vincule um plano criado no Plano de Curso
                            </p>
                        </div>
                    </div>
                    {saved && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#bbf7d0" }}>
                            <CheckCircle2 size={14} /> Vinculado
                        </span>
                    )}
                </div>
            </div>

            {/* Linked plan preview */}
            {planoVinculado && (
                <div style={{ ...cardS, border: "1.5px solid rgba(16,185,129,.3)" }}>
                    <div style={headerS}>
                        <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                            Plano Vinculado
                        </span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted, #94a3b8)" }}>
                            {planoVinculado.bimestre} · {new Date(planoVinculado.updated_at).toLocaleDateString("pt-BR")}
                        </span>
                    </div>
                    <div style={bodyS}>
                        {(() => {
                            const blocos = parseBlocos(planoVinculado.conteudo);
                            if (blocos.length === 0) return (
                                <p style={{ fontSize: 13, color: "var(--text-muted, #94a3b8)", margin: 0 }}>
                                    Plano vinculado (formato legado)
                                </p>
                            );
                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                            {blocos.length} bloco{blocos.length !== 1 ? "s" : ""} de sequência didática
                                        </span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", background: "rgba(99,102,241,.1)", padding: "2px 6px", borderRadius: 4 }}>
                                            {planoVinculado.habilidades_bncc?.length || 0} hab.
                                        </span>
                                        <button onClick={() => setExpandedView(!expandedView)} type="button" style={{
                                            marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
                                            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                            border: "1px solid var(--border-default)", background: "transparent",
                                            color: "#818cf8", cursor: "pointer",
                                        }}>
                                            <Eye size={12} /> {expandedView ? "Ocultar" : "Ver detalhes"}
                                        </button>
                                    </div>

                                    {expandedView && blocos.map((bloco, i) => (
                                        <div key={bloco.id || i} style={{
                                            padding: "10px 14px", borderRadius: 10, fontSize: 12,
                                            background: "var(--bg-primary, rgba(2,6,23,.3))",
                                            border: "1px solid var(--border-default, rgba(148,163,184,.08))",
                                        }}>
                                            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Bloco {i + 1}</div>
                                            {bloco.habilidades_bncc.length > 0 && <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600, color: "#818cf8", fontSize: 11 }}>BNCC: </span>{bloco.habilidades_bncc.join(", ")}</div>}
                                            {(bloco.objetivos.length > 0 || bloco.objetivos_livre) && <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600, color: "#a78bfa", fontSize: 11 }}>Objetivos: </span>{[...bloco.objetivos, bloco.objetivos_livre].filter(Boolean).join("; ")}</div>}
                                            {bloco.metodologias.length > 0 && <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600, color: "#8b5cf6", fontSize: 11 }}>Metodologia: </span>{bloco.metodologias.join(", ")}</div>}
                                            {bloco.recursos.length > 0 && <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600, color: "#f59e0b", fontSize: 11 }}>Recursos: </span>{bloco.recursos.join(", ")}</div>}
                                            {(bloco.avaliacoes.length > 0 || bloco.avaliacao_livre) && <div><span style={{ fontWeight: 600, color: "#ec4899", fontSize: 11 }}>Avaliação: </span>{[...bloco.avaliacoes, bloco.avaliacao_livre].filter(Boolean).join("; ")}</div>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Link option */}
                <button onClick={() => setUploadMode(false)} type="button" style={{
                    ...cardS, padding: "20px 18px", cursor: "pointer", textAlign: "left",
                    border: !uploadMode ? "1.5px solid rgba(14,165,233,.3)" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                    background: !uploadMode ? "rgba(14,165,233,.06)" : "var(--bg-secondary, rgba(15,23,42,.4))",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <Link2 size={18} style={{ color: "#0ea5e9" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                            Vincular Plano de Curso
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted, #94a3b8)", lineHeight: 1.4 }}>
                        Use um plano já criado no módulo Plano de Curso.
                    </p>
                </button>

                {/* Upload option */}
                <button onClick={() => setUploadMode(true)} type="button" style={{
                    ...cardS, padding: "20px 18px", cursor: "pointer", textAlign: "left",
                    border: uploadMode ? "1.5px solid rgba(139,92,246,.3)" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                    background: uploadMode ? "rgba(139,92,246,.06)" : "var(--bg-secondary, rgba(15,23,42,.4))",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <Upload size={18} style={{ color: "#8b5cf6" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                            Upload de PDF
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted, #94a3b8)", lineHeight: 1.4 }}>
                        Faça upload de um plano de ensino pronto em PDF.
                    </p>
                </button>
            </div>

            {/* Link mode: show available plans */}
            {!uploadMode && (
                <div style={cardS}>
                    <div style={headerS}>
                        <FileText size={16} style={{ color: "#0ea5e9" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                            Planos Disponíveis
                        </span>
                        <a href="/plano-curso" style={{
                            marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
                            fontSize: 12, fontWeight: 600, color: "#0ea5e9", textDecoration: "none",
                        }}>
                            <ExternalLink size={12} /> Criar novo plano
                        </a>
                    </div>
                    <div style={bodyS}>
                        {planosDisponiveis.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--text-muted, #64748b)" }}>
                                <FileText size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>
                                    Nenhum plano encontrado
                                </p>
                                <p style={{ fontSize: 12, margin: "0 0 12px", opacity: 0.7 }}>
                                    Crie um plano no módulo <strong>Plano de Curso</strong> para {disciplina} — {anoSerie}.
                                </p>
                                <a href="/plano-curso" style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                                    color: "#fff", textDecoration: "none",
                                }}>
                                    <ExternalLink size={14} /> Ir para Plano de Curso
                                </a>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {planosDisponiveis.map(p => {
                                    const blocos = parseBlocos(p.conteudo);
                                    const isLinked = planoVinculado?.conteudo === p.conteudo;
                                    return (
                                        <div key={p.id} style={{
                                            display: "flex", alignItems: "center", gap: 12,
                                            padding: "12px 14px", borderRadius: 10,
                                            background: isLinked ? "rgba(16,185,129,.06)" : "var(--bg-primary, rgba(2,6,23,.3))",
                                            border: isLinked ? "1px solid rgba(16,185,129,.2)" : "1px solid var(--border-default, rgba(148,163,184,.08))",
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                                                    {p.disciplina} — {p.bimestre || "Sem período"}
                                                </div>
                                                <div style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)" }}>
                                                    {p.ano_serie} · {blocos.length} bloco{blocos.length !== 1 ? "s" : ""} · {p.habilidades_bncc?.length || 0} hab. · {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                                                </div>
                                            </div>
                                            {isLinked ? (
                                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#10b981" }}>
                                                    <CheckCircle2 size={14} /> Vinculado
                                                </span>
                                            ) : (
                                                <button onClick={() => vincularPlano(p)} disabled={saving} type="button" style={{
                                                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                                    border: "none", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                    color: "#fff", cursor: "pointer",
                                                }}>
                                                    {saving ? <Loader2 size={12} className="animate-spin" /> : "Usar este plano"}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload mode: file upload */}
            {uploadMode && (
                <div style={cardS}>
                    <div style={headerS}>
                        <Upload size={16} style={{ color: "#8b5cf6" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>Upload de Plano</span>
                    </div>
                    <div style={{ ...bodyS, textAlign: "center", padding: "32px 16px" }}>
                        <Upload size={36} style={{ margin: "0 auto 12px", color: "var(--text-muted, #64748b)", opacity: 0.4 }} />
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>
                            Arraste um PDF aqui ou clique para selecionar
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "0 0 14px" }}>
                            Formatos aceitos: PDF (máx. 10MB)
                        </p>
                        <label style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: "rgba(139,92,246,.1)", border: "1.5px solid #8b5cf6",
                            color: "#a78bfa", cursor: "pointer",
                        }}>
                            <Upload size={14} /> Selecionar arquivo
                            <input type="file" accept=".pdf" style={{ display: "none" }} onChange={() => { /* TODO: implement upload */ }} />
                        </label>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#f87171",
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}
