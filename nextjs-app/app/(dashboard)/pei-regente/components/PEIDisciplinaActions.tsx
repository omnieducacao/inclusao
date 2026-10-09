"use client";

import React, { useState, useEffect } from "react";
import {
    AlertTriangle, Brain, CheckCircle2, ExternalLink, Send,
} from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";

// ─── Finalizar PEI Disciplina e enviar para consolidar ─────────────────────

export function FinalizarPeiDisciplinaButton({
    studentId,
    disciplina,
    peiDisciplinaId,
    adaptacaoSugestao,
    onFinalizado,
}: {
    studentId: string;
    disciplina: string;
    peiDisciplinaId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adaptacaoSugestao: Record<string, any> | null;
    onFinalizado?: () => void;
}) {
    const [finalizando, setFinalizando] = useState(false);
    const [finalizado, setFinalizado] = useState(false);
    const [erro, setErro] = useState("");
    const [feedbackProfessor, setFeedbackProfessor] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    const handleFinalizar = async () => {
        if (!adaptacaoSugestao) return;
        setFinalizando(true);
        setErro("");
        try {
            const resPost = await fetch("/api/pei/disciplina", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    disciplina,
                    pei_disciplina_data: adaptacaoSugestao,
                }),
            });
            if (!resPost.ok) {
                const d = await resPost.json().catch(() => ({}));
                throw new Error(d.error || "Erro ao salvar PEI da disciplina");
            }
            const resPatch = await fetch("/api/pei/disciplina", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: peiDisciplinaId,
                    fase_status: "concluido",
                    feedback_professor: feedbackProfessor.trim() || undefined,
                }),
            });
            if (!resPatch.ok) {
                const d = await resPatch.json().catch(() => ({}));
                throw new Error(d.error || "Erro ao marcar como concluído");
            }
            setFinalizado(true);
            onFinalizado?.();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao finalizar");
        } finally {
            setFinalizando(false);
        }
    };

    if (finalizado) {
        return (
            <a
                href={`/pei?student=${studentId}&tab=consolidacao`}
                target="_blank"
                rel="noopener noreferrer"
                className="omni-btn omni-btn--primario"
            >
                <ExternalLink size={16} aria-hidden />
                Abrir a consolidação no PEI geral
                <span className="omni-so-leitor"> (abre em nova aba)</span>
            </a>
        );
    }

    return (
        <div style={{ display: "grid", gap: 8 }}>
            {/* Toggle feedback area */}
            {!showFeedback ? (
                <div>
                    <button
                        type="button"
                        onClick={() => setShowFeedback(true)}
                        disabled={finalizando || !adaptacaoSugestao}
                        className="omni-btn omni-btn--primario"
                    >
                        <Send size={16} aria-hidden />
                        Concluir e enviar à coordenação
                    </button>
                </div>
            ) : (
                <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 12 }}>
                    <label className="omni-campo" style={{ maxWidth: "none" }}>
                        <span className="omni-campo__rotulo">
                            Recado para a coordenação <span className="omni-campo__opcional">(opcional)</span>
                        </span>
                        <textarea
                            value={feedbackProfessor}
                            onChange={(e) => setFeedbackProfessor(e.target.value)}
                            placeholder="Como o estudante está nesta disciplina, o que você percebeu, o que sugere adaptar."
                            rows={3}
                            className="omni-entrada"
                            style={{ maxWidth: "none", resize: "vertical" }}
                        />
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={handleFinalizar}
                            disabled={finalizando}
                            aria-busy={finalizando}
                            className="omni-btn omni-btn--primario"
                        >
                            {finalizando ? <OmniLoader engine="green" size={16} /> : <CheckCircle2 size={16} aria-hidden />}
                            {finalizando ? "Enviando…" : "Enviar à coordenação"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFeedback(false)}
                            className="omni-btn omni-btn--discreto"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            )}
            {erro && (
                <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                    <AlertTriangle className="omni-aviso__icone" aria-hidden />
                    <div>
                        <div className="omni-aviso__titulo">Não foi possível enviar</div>
                        <div className="omni-aviso__texto">{erro}</div>
                    </div>
                </div>
            )}
            <span className="omni-apoio" style={{ fontSize: 13 }}>
                A adaptação vai para o especialista do AEE juntar no PEI oficial.
            </span>
        </div>
    );
}

// ─── PEI Avaliação Diagnóstica Link ──────────────────────────────────────────

export function PEIAvaliacaoDiagnosticaLink({ studentId, studentName, disciplina, onLinked }: {
    studentId: string; studentName: string; disciplina: string; onLinked?: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [avaliacao, setAvaliacao] = useState<{ id: string; nivel: number | null; status: string; questoes: number; updated_at: string } | null>(null);

    useEffect(() => {
        if (!studentId || !disciplina) { setTimeout(() => setLoading(false), 0); return; }
        fetch(`/api/pei/avaliacao-diagnostica?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}`)
            .then(r => r.json())
            .then(data => {
                const avs = data.avaliacoes || [];
                if (avs.length > 0) {
                    const av = avs[0];
                    setAvaliacao({
                        id: av.id,
                        nivel: av.nivel_omnisfera_identificado,
                        status: av.status || "pendente",
                        questoes: av.questoes_geradas?.questoes?.length || 0,
                        updated_at: av.updated_at || av.created_at,
                    });
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [studentId, disciplina]);

    // Auto-advance fase_status when diagnóstica is applied (only ONCE)
    const autoAdvancedRef = React.useRef(false);
    useEffect(() => {
        if (avaliacao?.status === "aplicada" && onLinked && !autoAdvancedRef.current) {
            autoAdvancedRef.current = true;
        }
    }, [avaliacao?.status, onLinked]);

    if (loading) {
        return (
            <div style={{ padding: "40px 0", display: "grid", placeItems: "center" }}>
                <OmniLoader variant="card" />
            </div>
        );
    }

    const linkDiagnostica = `/avaliacao-diagnostica?student=${studentId}&disciplina=${encodeURIComponent(disciplina)}`;
    const aplicada = avaliacao?.status === "aplicada";

    return (
        <div style={{ display: "grid", gap: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Brain size={22} aria-hidden style={{ color: "var(--acao)", marginTop: 2 }} />
                    <div>
                        <h4 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>
                            Avaliação diagnóstica — {disciplina}
                        </h4>
                        <p className="omni-apoio" style={{ margin: 0 }}>
                            {studentName} · a avaliação é feita na página Avaliação diagnóstica e aparece aqui quando for aplicada
                        </p>
                    </div>
                </div>
                {aplicada && (
                    <span className="omni-estado omni-estado--sucesso">
                        <CheckCircle2 aria-hidden /> Aplicada
                    </span>
                )}
            </div>

            {/* Resultado vinculado */}
            {aplicada && avaliacao.nivel !== null && (
                <div className="omni-cartao omni-cartao--plano" style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: "16px 20px" }}>
                    <span aria-hidden style={{
                        width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none",
                        background: "var(--sucesso-suave)", color: "var(--sucesso)", font: "800 20px/1 var(--font-sans)",
                    }}>
                        {avaliacao.nivel}
                    </span>
                    <div style={{ flex: 1 }}>
                        <div style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
                            Nível Omnisfera: {avaliacao.nivel} — {ESCALA_OMNISFERA[avaliacao.nivel as NivelOmnisfera]?.label}
                        </div>
                        <div className="omni-apoio" style={{ fontSize: 14 }}>
                            {avaliacao.questoes} questões · {new Date(avaliacao.updated_at).toLocaleDateString("pt-BR")}
                        </div>
                    </div>
                </div>
            )}

            {/* Status: gerada mas não aplicada */}
            {avaliacao && !aplicada && (
                <div className="omni-aviso omni-aviso--atencao" role="status" style={{ maxWidth: "none" }}>
                    <AlertTriangle className="omni-aviso__icone" aria-hidden />
                    <div>
                        <div className="omni-aviso__titulo">A avaliação foi criada, mas ainda não foi aplicada</div>
                        <div className="omni-aviso__texto">
                            {avaliacao.questoes} questões. Aplique com o estudante na página Avaliação diagnóstica.
                        </div>
                        <div className="omni-aviso__acoes">
                            <a href={linkDiagnostica} className="omni-btn omni-btn--primario omni-btn--pequeno">
                                <ExternalLink size={16} aria-hidden /> Aplicar a avaliação
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Nenhuma avaliação */}
            {!avaliacao && (
                <div className="omni-vazio">
                    <Brain size={36} aria-hidden style={{ color: "var(--tinta-3)" }} />
                    <p className="omni-vazio__titulo">Ainda não há avaliação diagnóstica</p>
                    <p className="omni-vazio__texto">
                        Crie e aplique a avaliação de {studentName} em {disciplina} na página <strong>Avaliação diagnóstica</strong>.
                    </p>
                    <a href={linkDiagnostica} className="omni-btn omni-btn--primario">
                        <ExternalLink size={16} aria-hidden /> Ir para a avaliação diagnóstica
                    </a>
                </div>
            )}
        </div>
    );
}
