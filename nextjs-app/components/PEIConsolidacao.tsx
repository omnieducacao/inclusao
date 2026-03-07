"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BarChart3, CheckCircle2, Clock, AlertTriangle,
    FileText, Loader2, Trophy, RotateCcw, MessageSquare, Send,
} from "lucide-react";
import { ESCALA_OMNISFERA, FASE_STATUS_LABELS, type NivelOmnisfera, type FaseStatusPEIDisciplina } from "@/lib/omnisfera-types";

interface ResumoDisc {
    id?: string;
    disciplina: string;
    professor_regente: string;
    fase_status: FaseStatusPEIDisciplina;
    tem_plano_ensino: boolean;
    tem_avaliacao: boolean;
    nivel_omnisfera: number | null;
    metas_smart: number;
    adaptacoes: boolean;
    feedback_professor?: string;
    data_devolucao?: string;
}

interface ConsolidacaoData {
    estudante: { id: string; nome: string; serie: string; diagnostico: string; fase_pei: string };
    consolidacao: {
        total_disciplinas: number;
        concluidas: number;
        em_andamento: number;
        pendentes: number;
        progresso_percentual: number;
        pode_consolidar: boolean;
    };
    resumo_disciplinas: ResumoDisc[];
    pei_disciplinas?: Array<Record<string, unknown>>;
}

interface Props {
    studentId: string | null;
    onExportar?: () => void;
}

const STATUS_ICONS: Record<FaseStatusPEIDisciplina, React.ReactNode> = {
    plano_ensino: <Clock size={14} style={{ color: "#f59e0b" }} />,
    diagnostica: <BarChart3 size={14} style={{ color: "#3b82f6" }} />,
    pei_disciplina: <FileText size={14} style={{ color: "#8b5cf6" }} />,
    concluido: <CheckCircle2 size={14} style={{ color: "#10b981" }} />,
};

export function PEIConsolidacao({ studentId, onExportar }: Props) {
    const [data, setData] = useState<ConsolidacaoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Feedback/devolução state
    const [feedbackFor, setFeedbackFor] = useState<string | null>(null); // disciplina id
    const [feedbackText, setFeedbackText] = useState("");
    const [sendingFeedback, setSendingFeedback] = useState(false);

    const fetchData = useCallback(async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/pei/consolidar?studentId=${studentId}`);
            if (!res.ok) throw new Error("Erro ao carregar consolidação");
            const d = await res.json();
            setData(d);
        } catch (err) {
            setError((err as Error).message || "Erro ao carregar consolidação");
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Devolver disciplina ao professor ─────────────────────────
    const handleDevolver = async (discId: string) => {
        if (!feedbackText.trim()) {
            alert("Informe o feedback/observação para o professor antes de devolver.");
            return;
        }
        setSendingFeedback(true);
        try {
            const res = await fetch("/api/pei/disciplina", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: discId,
                    fase_status: "pei_disciplina",
                    feedback_professor: feedbackText.trim(),
                }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Erro ao devolver");
            }
            // Refresh data
            setFeedbackFor(null);
            setFeedbackText("");
            await fetchData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Erro ao devolver");
        } finally {
            setSendingFeedback(false);
        }
    };

    if (!studentId) {
        return (
            <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                Selecione um estudante para ver a consolidação.
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "#6366f1" }} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ padding: 24, textAlign: "center", color: "#f87171" }}>
                <AlertTriangle size={24} style={{ marginBottom: 8 }} />
                <p>{error || "Dados não disponíveis"}</p>
            </div>
        );
    }

    const { consolidacao: c, resumo_disciplinas: resumo } = data;

    // Map pei_disciplinas by disciplina for ids and feedback
    const discMap = new Map<string, Record<string, unknown>>();
    (data.pei_disciplinas || []).forEach((d) => {
        discMap.set(d.disciplina as string, d);
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Barra de progresso */}
            <div style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                borderRadius: 16, padding: "20px 24px", color: "#fff",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Consolidação do PEI</h3>
                        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>
                            {c.concluidas} de {c.total_disciplinas} disciplinas concluídas
                        </p>
                    </div>
                    <div style={{
                        fontSize: 32, fontWeight: 800, lineHeight: 1,
                        color: c.progresso_percentual === 100 ? "#34d399" : "#fff",
                    }}>
                        {c.progresso_percentual}%
                    </div>
                </div>
                <div style={{
                    height: 8, borderRadius: 4, background: "rgba(255,255,255,.2)",
                    overflow: "hidden",
                }}>
                    <div style={{
                        height: "100%", borderRadius: 4,
                        background: c.progresso_percentual === 100 ? "#34d399" : "#a78bfa",
                        width: `${c.progresso_percentual}%`,
                        transition: "width .5s ease",
                    }} />
                </div>

                {/* Stats */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12, marginTop: 16,
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{c.concluidas}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>Concluídas</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{c.em_andamento}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>Em andamento</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{c.pendentes}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>Pendentes</div>
                    </div>
                </div>
            </div>

            {/* Cards de disciplinas — com ações de feedback */}
            {resumo.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary, #1e293b)" }}>
                        Disciplinas ({resumo.length})
                    </h4>

                    {resumo.map((d) => {
                        const status = d.fase_status as FaseStatusPEIDisciplina;
                        const discData = discMap.get(d.disciplina);
                        const discId = (discData?.id as string) || d.id || "";
                        const lastFeedback = (discData?.feedback_professor as string) || d.feedback_professor || "";
                        const lastDevolucao = (discData?.data_devolucao as string) || d.data_devolucao || "";
                        const isFeedbackOpen = feedbackFor === discId;
                        const canDevolver = status === "pei_disciplina" || status === "concluido";

                        return (
                            <div key={d.disciplina} style={{
                                background: "var(--bg-tertiary, #f8fafc)", borderRadius: 14,
                                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                                overflow: "hidden",
                            }}>
                                {/* Main row */}
                                <div style={{
                                    display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr auto",
                                    padding: "14px 18px", fontSize: 13,
                                    alignItems: "center", gap: 8,
                                }}>
                                    <span style={{ fontWeight: 600, color: "var(--text-primary, #1e293b)" }}>{d.disciplina}</span>
                                    <span style={{ color: "var(--text-muted, #64748b)" }}>{d.professor_regente}</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        {STATUS_ICONS[status]}
                                        <span style={{ fontSize: 12 }}>{FASE_STATUS_LABELS[status]}</span>
                                    </span>
                                    <span>
                                        {d.nivel_omnisfera !== null ? (
                                            <span style={{
                                                padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                                                background: "rgba(99,102,241,.15)", color: "#6366f1",
                                            }}>
                                                N{d.nivel_omnisfera}
                                            </span>
                                        ) : "—"}
                                    </span>
                                    <span style={{ color: "var(--text-muted, #64748b)", fontSize: 12 }}>
                                        {d.metas_smart > 0 ? `${d.metas_smart} meta${d.metas_smart > 1 ? "s" : ""}` : "—"}
                                    </span>
                                    {/* Action buttons */}
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {canDevolver && (
                                            <button
                                                onClick={() => {
                                                    if (isFeedbackOpen) {
                                                        setFeedbackFor(null);
                                                        setFeedbackText("");
                                                    } else {
                                                        setFeedbackFor(discId);
                                                        setFeedbackText("");
                                                    }
                                                }}
                                                title="Devolver ao professor com feedback"
                                                style={{
                                                    padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                                                    background: isFeedbackOpen ? "rgba(245,158,11,.15)" : "rgba(245,158,11,.08)",
                                                    border: `1px solid ${isFeedbackOpen ? "rgba(245,158,11,.4)" : "rgba(245,158,11,.2)"}`,
                                                    color: "#d97706", cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: 4,
                                                }}
                                            >
                                                <RotateCcw size={12} /> Devolver
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Last feedback (if exists) */}
                                {lastFeedback && !isFeedbackOpen && (
                                    <div style={{
                                        padding: "8px 18px 12px", borderTop: "1px solid rgba(148,163,184,.08)",
                                        display: "flex", alignItems: "flex-start", gap: 8,
                                    }}>
                                        <MessageSquare size={13} style={{ color: "#f59e0b", marginTop: 2, flexShrink: 0 }} />
                                        <div>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: "#d97706" }}>
                                                Última devolutiva{lastDevolucao ? ` (${new Date(lastDevolucao).toLocaleDateString("pt-BR")})` : ""}:
                                            </span>
                                            <p style={{ fontSize: 12, color: "var(--text-secondary, #94a3b8)", margin: "2px 0 0", lineHeight: 1.4 }}>
                                                {lastFeedback}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Feedback input (expandable) */}
                                {isFeedbackOpen && (
                                    <div style={{
                                        padding: "12px 18px 16px", borderTop: "1px solid rgba(245,158,11,.15)",
                                        background: "rgba(245,158,11,.04)",
                                    }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "#d97706", display: "block", marginBottom: 6 }}>
                                            📝 Feedback para {d.professor_regente} ({d.disciplina})
                                        </label>
                                        <textarea
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder="Descreva o que precisa ser revisado ou melhorado..."
                                            rows={3}
                                            style={{
                                                width: "100%", padding: "10px 12px", borderRadius: 10,
                                                border: "1px solid rgba(245,158,11,.3)", background: "rgba(255,255,255,.5)",
                                                fontSize: 13, resize: "vertical", outline: "none",
                                                color: "var(--text-primary, #1e293b)",
                                            }}
                                        />
                                        <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                                            <button
                                                onClick={() => { setFeedbackFor(null); setFeedbackText(""); }}
                                                style={{
                                                    padding: "6px 14px", borderRadius: 8, fontSize: 12,
                                                    background: "transparent", border: "1px solid rgba(148,163,184,.2)",
                                                    color: "var(--text-muted, #64748b)", cursor: "pointer",
                                                }}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleDevolver(discId)}
                                                aria-label="Devolver para revisão"
                                                disabled={sendingFeedback || !feedbackText.trim()}
                                                style={{
                                                    padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                                    background: feedbackText.trim() ? "linear-gradient(135deg, #d97706, #f59e0b)" : "#94a3b8",
                                                    color: "#fff", border: "none",
                                                    cursor: sendingFeedback || !feedbackText.trim() ? "not-allowed" : "pointer",
                                                    display: "flex", alignItems: "center", gap: 6,
                                                    opacity: sendingFeedback ? 0.7 : 1,
                                                }}
                                            >
                                                {sendingFeedback ? (
                                                    <><Loader2 size={12} className="animate-spin" /> Devolvendo...</>
                                                ) : (
                                                    <><Send size={12} /> Devolver ao Professor</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Consolidação pronta */}
            {c.pode_consolidar && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "16px 20px", borderRadius: 12,
                    background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)",
                }}>
                    <Trophy size={24} style={{ color: "#10b981" }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#10b981", fontSize: 15 }}>
                            Todas as disciplinas concluídas!
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            O PEI está pronto para ser consolidado no documento oficial.
                        </div>
                    </div>
                    <button
                        onClick={onExportar}
                        aria-label="Exportar consolidação"
                        style={{
                            padding: "10px 20px", borderRadius: 10,
                            background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontWeight: 700, fontSize: 14,
                        }}
                    >
                        Gerar Documento Oficial
                    </button>
                </div>
            )}

            {/* Sem disciplinas */}
            {resumo.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                    <BarChart3 size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <p>Nenhuma disciplina enviada para os professores regentes ainda.</p>
                    <p style={{ fontSize: 13 }}>Vá até a aba &quot;Regentes&quot; para enviar o PEI.</p>
                </div>
            )}
        </div>
    );
}
