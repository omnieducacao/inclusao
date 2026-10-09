"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Send } from "lucide-react";
import { FASE_STATUS_LABELS, type FaseStatusPEIDisciplina } from "@/lib/omnisfera-types";

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

/** O que fica guardado no PEI quando a coordenação junta as disciplinas (10/10/2026). */
export type RegistroConsolidacao = {
    em: string;
    disciplinas: Array<{ disciplina: string; professor: string; nivel: number | null; metas: string[]; adaptacoes: string }>;
};

interface Props {
    studentId: string | null;
    /** quando as disciplinas já foram juntadas ao PEI */
    consolidadoEm?: string | null;
    onConsolidar?: (r: RegistroConsolidacao) => void;
}

const textoDe = (v: unknown): string => {
    if (typeof v === "string") return v.trim();
    if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        for (const k of ["descricao", "meta", "texto", "titulo", "objetivo"]) if (typeof o[k] === "string" && (o[k] as string).trim()) return (o[k] as string).trim();
    }
    return "";
};

// Onda 15: estado de cada disciplina com os chips do design system
const TOM_DA_FASE: Record<FaseStatusPEIDisciplina, string> = {
    plano_ensino: "omni-estado--atencao",
    diagnostica: "omni-estado--info",
    pei_disciplina: "omni-estado--info",
    concluido: "omni-estado--sucesso",
};

export function PEIConsolidacao({ studentId, consolidadoEm, onConsolidar }: Props) {
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
        if (!feedbackText.trim()) return;
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
            setError(err instanceof Error ? err.message : "Não deu para devolver agora.");
        } finally {
            setSendingFeedback(false);
        }
    };

    if (!studentId) {
        return <p className="omni-apoio">Escolha um estudante para ver o andamento das disciplinas.</p>;
    }

    if (loading && !data) {
        return <p className="omni-apoio" role="status">Carregando o andamento das disciplinas…</p>;
    }

    if (!data) {
        return (
            <div className="omni-aviso omni-aviso--erro" role="alert">
                <div><div className="omni-aviso__texto">{error || "Não deu para carregar o andamento agora."}</div>
                <div className="omni-aviso__acoes"><button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={fetchData}>Tentar de novo</button></div></div>
            </div>
        );
    }

    const { consolidacao: c, resumo_disciplinas: resumo } = data;

    const discMap = new Map<string, Record<string, unknown>>();
    (data.pei_disciplinas || []).forEach((d) => {
        discMap.set(d.disciplina as string, d);
    });

    if (resumo.length === 0) {
        return (
            <div className="omni-vazio" style={{ textAlign: "center" }}>
                <p className="omni-vazio__titulo">Nenhuma disciplina recebeu o PEI ainda</p>
                <p className="omni-vazio__texto">Envie o PEI aos professores em &ldquo;Professores regentes&rdquo;, aqui na mesma etapa. Depois, o andamento de cada disciplina aparece aqui.</p>
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gap: 20 }}>
            <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }} aria-label="Andamento das disciplinas">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div>
                        <h3 style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>Andamento das disciplinas</h3>
                        <p className="omni-apoio" style={{ margin: "2px 0 0" }}>{c.concluidas} de {c.total_disciplinas} concluídas · {c.em_andamento} em andamento · {c.pendentes} sem começar</p>
                    </div>
                    <span style={{ font: "800 28px/1 var(--font-sans)", color: "var(--tinta)", fontVariantNumeric: "tabular-nums" }}>{c.progresso_percentual}%</span>
                </div>
                <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.progresso_percentual} aria-label="Disciplinas concluídas" style={{ height: 8, borderRadius: 4, background: "var(--borda)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.progresso_percentual}%`, background: c.progresso_percentual === 100 ? "var(--encontro-verde-forte)" : "var(--acao)", transition: "width .5s ease" }} />
                </div>
            </section>

            {c.pode_consolidar && (() => {
                // 10/10/2026: a consolidação passa a fechar o PEI: as disciplinas entram no PEI (salvo e versionado com ele)
                const mudouDepois = Boolean(consolidadoEm && resumo.some((d) => (d as ResumoDisc & { updated_at?: string }).updated_at && String((d as ResumoDisc & { updated_at?: string }).updated_at) > consolidadoEm));
                const juntar = () => onConsolidar?.({
                    em: new Date().toISOString(),
                    disciplinas: resumo.map((d) => {
                        const dados = ((discMap.get(d.disciplina)?.pei_disciplina_data || {}) as Record<string, unknown>);
                        const metas = Array.isArray(dados.metas_smart) ? (dados.metas_smart as unknown[]).map(textoDe).filter(Boolean) : [];
                        return { disciplina: d.disciplina, professor: d.professor_regente, nivel: d.nivel_omnisfera, metas, adaptacoes: textoDe(dados.adaptacoes) };
                    }),
                });
                return (
                    <div className="omni-aviso omni-aviso--sucesso">
                        <div>
                            <div className="omni-aviso__titulo">
                                {consolidadoEm ? `PEI consolidado em ${new Date(consolidadoEm).toLocaleDateString("pt-BR")}` : "Todas as disciplinas concluídas"}
                            </div>
                            <div className="omni-aviso__texto">
                                {consolidadoEm
                                    ? (mudouDepois ? "Alguma disciplina mudou depois disso. Junte de novo para o PEI ficar com a versão mais recente." : "As disciplinas já fazem parte do PEI. O documento oficial sai pelo botão Baixar, no topo do PEI.")
                                    : "Junte o que cada professor fez ao PEI: as metas e adaptações das disciplinas passam a fazer parte do documento."}
                            </div>
                            {onConsolidar && (!consolidadoEm || mudouDepois) && (
                                <div className="omni-aviso__acoes">
                                    <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={juntar}>
                                        {consolidadoEm ? "Juntar de novo" : "Juntar as disciplinas ao PEI"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {error && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{error}</div></div></div>}

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }} aria-label="Disciplinas">
                {resumo.map((d) => {
                    const status = d.fase_status as FaseStatusPEIDisciplina;
                    const discData = discMap.get(d.disciplina);
                    const discId = (discData?.id as string) || d.id || "";
                    const lastFeedback = (discData?.feedback_professor as string) || d.feedback_professor || "";
                    const lastDevolucao = (discData?.data_devolucao as string) || d.data_devolucao || "";
                    const isFeedbackOpen = feedbackFor === discId;
                    const canDevolver = status === "pei_disciplina" || status === "concluido";
                    const detalhes = [
                        d.nivel_omnisfera !== null ? `nível ${d.nivel_omnisfera} na escala de 0 a 4` : "",
                        d.metas_smart > 0 ? `${d.metas_smart} meta${d.metas_smart > 1 ? "s" : ""}` : "",
                    ].filter(Boolean).join(" · ");

                    return (
                        <li key={d.disciplina} className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 10, padding: "14px 18px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 12px" }}>
                                <strong style={{ font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{d.disciplina}</strong>
                                <span className={`omni-estado ${TOM_DA_FASE[status] || ""}`}>{FASE_STATUS_LABELS[status] || status}</span>
                                <span className="omni-apoio" style={{ flex: "1 1 auto" }}>{d.professor_regente}{detalhes ? ` · ${detalhes}` : ""}</span>
                                {canDevolver && (
                                    <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" aria-expanded={isFeedbackOpen}
                                        onClick={() => { setFeedbackFor(isFeedbackOpen ? null : discId); setFeedbackText(""); }}>
                                        <RotateCcw aria-hidden /> Devolver com observação
                                    </button>
                                )}
                            </div>

                            {lastFeedback && !isFeedbackOpen && (
                                <p className="omni-apoio" style={{ margin: 0 }}>
                                    <strong>Última devolutiva{lastDevolucao ? ` (${new Date(lastDevolucao).toLocaleDateString("pt-BR")})` : ""}:</strong> {lastFeedback}
                                </p>
                            )}

                            {isFeedbackOpen && (
                                <div style={{ display: "grid", gap: 8 }}>
                                    <label className="omni-campo" style={{ maxWidth: "none" }}>
                                        <span className="omni-campo__rotulo">O que {d.professor_regente} precisa rever em {d.disciplina}</span>
                                        <textarea className="omni-entrada" rows={3} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Ex.: as metas ainda não dizem como vamos medir o avanço." />
                                    </label>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => { setFeedbackFor(null); setFeedbackText(""); }}>Cancelar</button>
                                        <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={() => handleDevolver(discId)} disabled={sendingFeedback || !feedbackText.trim()}>
                                            <Send aria-hidden /> {sendingFeedback ? "Devolvendo…" : "Devolver ao professor"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
