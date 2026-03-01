"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart3, CheckCircle2, Clock, AlertTriangle,
    FileText, Loader2, Trophy,
} from "lucide-react";
import { ESCALA_OMNISFERA, FASE_STATUS_LABELS, type NivelOmnisfera, type FaseStatusPEIDisciplina } from "@/lib/omnisfera-types";

interface ResumoDisc {
    disciplina: string;
    professor_regente: string;
    fase_status: FaseStatusPEIDisciplina;
    tem_plano_ensino: boolean;
    tem_avaliacao: boolean;
    nivel_omnisfera: number | null;
    metas_smart: number;
    adaptacoes: boolean;
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

    useEffect(() => {
        let mounted = true;
        if (!studentId) return;

        const fetchConsolidacao = async () => {
            try {
                const res = await fetch(`/api/pei/consolidar?studentId=${studentId}`);
                if (!res.ok) {
                    throw new Error("Erro ao carregar consolidação");
                }
                const d = await res.json();
                if (mounted) {
                    setData(d);
                }
            } catch (err) {
                if (mounted) {
                    setError((err as Error).message || "Erro ao carregar consolidação");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            if (mounted) {
                setLoading(true);
                fetchConsolidacao();
            }
        }, 0);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [studentId]);

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

            {/* Tabela de disciplinas */}
            {resumo.length > 0 && (
                <div style={{
                    background: "rgba(30,41,59,.4)", borderRadius: 14,
                    overflow: "hidden",
                }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
                        padding: "10px 18px", fontSize: 11, fontWeight: 700,
                        color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px",
                        borderBottom: "1px solid rgba(148,163,184,.1)",
                    }}>
                        <span>Disciplina</span>
                        <span>Professor</span>
                        <span>Fase</span>
                        <span>Nível</span>
                        <span>Metas</span>
                    </div>

                    {resumo.map((d) => {
                        const status = d.fase_status as FaseStatusPEIDisciplina;
                        return (
                            <div key={d.disciplina} style={{
                                display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
                                padding: "12px 18px", fontSize: 13,
                                borderBottom: "1px solid rgba(148,163,184,.06)",
                                color: "#e2e8f0",
                            }}>
                                <span style={{ fontWeight: 600 }}>{d.disciplina}</span>
                                <span style={{ color: "#94a3b8" }}>{d.professor_regente}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {STATUS_ICONS[status]}
                                    <span style={{ fontSize: 12 }}>{FASE_STATUS_LABELS[status]}</span>
                                </span>
                                <span>
                                    {d.nivel_omnisfera !== null ? (
                                        <span style={{
                                            padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                                            background: "rgba(99,102,241,.15)", color: "#a5b4fc",
                                        }}>
                                            N{d.nivel_omnisfera}
                                        </span>
                                    ) : "—"}
                                </span>
                                <span style={{ color: "#94a3b8" }}>
                                    {d.metas_smart > 0 ? `${d.metas_smart} meta${d.metas_smart > 1 ? "s" : ""}` : "—"}
                                </span>
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
