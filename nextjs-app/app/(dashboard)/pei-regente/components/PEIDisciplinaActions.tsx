"use client";

import React, { useState, useEffect } from "react";
import {
    Brain, CheckCircle2, ExternalLink,
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all bg-linear-to-br from-violet-600 to-violet-500"
            >
                <ExternalLink className="w-4 h-4" />
                Enviar para PEI geral e consolidar
            </a>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Toggle feedback area */}
            {!showFeedback ? (
                <button
                    type="button"
                    onClick={() => setShowFeedback(true)}
                    disabled={finalizando || !adaptacaoSugestao}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 ${finalizando ? 'bg-slate-400' : 'bg-linear-to-br from-emerald-600 to-emerald-500'}`}
                >
                    <CheckCircle2 size={14} />
                    Finalizar e devolver ao especialista
                </button>
            ) : (
                <div className="p-4 rounded-xl space-y-3 border-2 border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-xs font-bold text-emerald-600">
                        📝 Devolutiva para o Especialista (opcional)
                    </p>
                    <textarea
                        value={feedbackProfessor}
                        onChange={(e) => setFeedbackProfessor(e.target.value)}
                        placeholder="Observações sobre o estudante nesta disciplina, dificuldades percebidas, sugestões de adaptação, etc."
                        rows={3}
                        className="w-full p-3 rounded-lg text-sm resize-none bg-(--bg-primary) border border-(--border-default) text-(--text-primary)"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleFinalizar}
                            disabled={finalizando}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 ${finalizando ? "bg-slate-400" : "bg-linear-to-br from-emerald-600 to-emerald-500"
                                }`}
                        >
                            {finalizando ? <OmniLoader engine="green" size={14} /> : <CheckCircle2 size={14} />}
                            {finalizando ? "Finalizando..." : "Confirmar e devolver"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFeedback(false)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-colors text-(--omni-text-muted)"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
            {erro && <span className="text-xs text-red-400">{erro}</span>}
            <span className="omni-label-xs text-slate-500">
                A adaptação será enviada ao especialista AEE para consolidação no PEI oficial.
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
            <div className="py-10 text-center">
                <OmniLoader variant="card" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="rounded-2xl p-4 md:px-5 md:py-4.5 text-white bg-linear-to-br from-blue-600 to-blue-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Brain size={22} />
                        <div>
                            <h4 className="m-0 text-lg font-bold">Avaliação Diagnóstica — {disciplina}</h4>
                            <p className="m-0 text-xs opacity-85">
                                {studentName} · Vincule uma avaliação aplicada no módulo Avaliação Diagnóstica
                            </p>
                        </div>
                    </div>
                    {avaliacao?.status === "aplicada" && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-200">
                            <CheckCircle2 size={14} /> Aplicada
                        </span>
                    )}
                </div>
            </div>

            {/* Resultado vinculado */}
            {avaliacao?.status === "aplicada" && avaliacao.nivel !== null && (
                <div className="flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-emerald-500/10 border-[1.5px] border-emerald-500/30">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br from-emerald-600 to-emerald-500 text-white text-xl font-extrabold">
                        {avaliacao.nivel}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold omni-body text-emerald-500">
                            Nível Omnisfera: {avaliacao.nivel} — {ESCALA_OMNISFERA[avaliacao.nivel as NivelOmnisfera]?.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {avaliacao.questoes} questões · {new Date(avaliacao.updated_at).toLocaleDateString("pt-BR")}
                        </div>
                    </div>
                </div>
            )}

            {/* Status: gerada mas não aplicada */}
            {avaliacao && avaliacao.status !== "aplicada" && (
                <div className="px-5 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="font-bold text-sm text-amber-500">Avaliação gerada, pendente de aplicação</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {avaliacao.questoes} questões · Aplique no módulo Avaliação Diagnóstica
                        </div>
                    </div>
                    <a href={`/avaliacao-diagnostica?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}&fromPEI=true`} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl omni-body font-bold bg-linear-to-br from-amber-500 to-amber-600 text-white transition-opacity hover:opacity-90">
                        <ExternalLink size={14} /> Aplicar
                    </a>
                </div>
            )}

            {/* Nenhuma avaliação */}
            {!avaliacao && (
                <div className="text-center px-5 py-8 rounded-2xl border border-(--border-default) bg-(--bg-secondary)">
                    <Brain size={40} className="mx-auto mb-3 text-slate-400 opacity-30" />
                    <p className="text-sm font-semibold text-(--omni-text-primary) mb-1">
                        Nenhuma avaliação diagnóstica encontrada
                    </p>
                    <p className="text-xs text-(--omni-text-muted) mb-4">
                        Gere e aplique uma avaliação no módulo <strong>Avaliação Diagnóstica</strong> para {studentName} em {disciplina}.
                    </p>
                    <a href={`/avaliacao-diagnostica?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}&fromPEI=true`} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-linear-to-br from-blue-600 to-blue-500 text-white transition-opacity hover:opacity-90">
                        <ExternalLink size={16} /> Ir para Avaliação Diagnóstica
                    </a>
                </div>
            )}
        </div>
    );
}
