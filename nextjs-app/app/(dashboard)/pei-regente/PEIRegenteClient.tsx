"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    BookOpen, Users, AlertTriangle, ChevronRight,
    FileText, Brain, ClipboardCheck, CheckCircle2, ArrowLeft,
    Sparkles, School, ExternalLink, Target, Trash2, RotateCcw,
} from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PEIPlanoEnsino } from "@/components/PEIPlanoEnsino";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { OnboardingPanel, OnboardingResetButton } from "@/components/OnboardingPanel";
import { ESCALA_OMNISFERA, FASE_STATUS_LABELS, type NivelOmnisfera, type FaseStatusPEIDisciplina } from "@/lib/omnisfera-types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AlunoDisc {
    id: string;
    disciplina: string;
    professor_regente_nome: string;
    fase_status: FaseStatusPEIDisciplina;
    has_plano: boolean;
    has_avaliacao: boolean;
    nivel_omnisfera: number | null;
    avaliacao_status: string;
    is_virtual: boolean;
}

interface Aluno {
    id: string;
    name: string;
    grade: string;
    class_group: string;
    diagnostico: string;
    fase_pei: string;
    habilidades_bncc: Array<{ codigo?: string; disciplina?: string; habilidade?: string; unidade_tematica?: string; objeto_conhecimento?: string;[key: string]: unknown }>;
    bncc_ei_objetivos: string[];
    disciplinas: AlunoDisc[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pei_geral?: Record<string, any>;
}

interface DataResponse {
    professor: { id: string; name: string; is_master: boolean };
    alunos: Aluno[];
}

// ─── Constantes Visuais ───────────────────────────────────────────────────────

const STEP_COLORS: Record<FaseStatusPEIDisciplina, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    plano_ensino: {
        bg: "bg-amber-500/10", border: "border-amber-500/30",
        text: "text-amber-500", icon: <FileText size={16} className="text-amber-500" />,
    },
    diagnostica: {
        bg: "bg-blue-500/10", border: "border-blue-500/30",
        text: "text-blue-500", icon: <Brain size={16} className="text-blue-500" />,
    },
    pei_disciplina: {
        bg: "bg-violet-500/10", border: "border-violet-500/30",
        text: "text-violet-500", icon: <ClipboardCheck size={16} className="text-violet-500" />,
    },
    concluido: {
        bg: "bg-emerald-500/10", border: "border-emerald-500/30",
        text: "text-emerald-500", icon: <CheckCircle2 size={16} className="text-emerald-500" />,
    },
};

// ─── Variantes de Animação (Framer Motion) ───────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export function PEIRegenteClient() {
    const [data, setData] = useState<DataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Navegação interna
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<AlunoDisc | null>(null);
    const [activeStep, setActiveStep] = useState<"plano" | "diagnostica" | "pei" | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('onboarding_pei_regente')) setShowOnboarding(true);
    }, []);

    // Ponte Pedagógica state
    const [gerandoAdaptacao, setGerandoAdaptacao] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adaptacaoSugestao, setAdaptacaoSugestao] = useState<Record<string, any> | null>(null);
    const [adaptacaoMeta, setAdaptacaoMeta] = useState<{ plano_encontrado: boolean; nivel_diag: number | null } | null>(null);
    const [versionSaveStatus, setVersionSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [transitioning, setTransitioning] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/pei-regente/meus-alunos");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Erro ao buscar dados");
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro de conexão");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Load existing adaptation draft when entering PEI step (B3 + B1: avoid re-calling AI)
    useEffect(() => {
        if (activeStep !== "pei" || !selectedAluno || !selectedDisc) return;
        if (adaptacaoSugestao) return; // Already loaded

        fetch(`/api/pei/disciplina?studentId=${selectedAluno.id}&disciplina=${encodeURIComponent(selectedDisc.disciplina)}`)
            .then(r => r.json())
            .then(data => {
                const peiData = data.pei_disciplina?.pei_disciplina_data as Record<string, unknown> | undefined;
                const rascunho = peiData?.adaptacao_rascunho as Record<string, unknown> | undefined;
                if (rascunho && Object.keys(rascunho).length > 0) {
                    setAdaptacaoSugestao(rascunho);
                    setToast("📋 Adaptação anterior carregada");
                    setTimeout(() => setToast(null), 2500);
                }
            })
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, selectedAluno?.id, selectedDisc?.disciplina]);

    // ─── Loading / Erro ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="rounded-2xl p-12 text-center bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                <OmniLoader variant="card" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl p-8 bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                <div className="flex items-center gap-3 mb-4 text-red-400">
                    <AlertTriangle size={24} />
                    <span className="font-semibold">{error}</span>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-(--omni-bg-tertiary) text-(--omni-text-primary) border border-(--omni-border-default)"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!data?.alunos?.length) {
        return (
            <div className="rounded-2xl p-12 text-center bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                <School size={48} className="mx-auto mb-4 text-(--omni-text-muted) opacity-40" />
                <h3 className="text-lg font-semibold mb-2 text-(--omni-text-primary)">
                    Nenhum estudante em Fase 2
                </h3>
                <p className="text-sm text-(--omni-text-muted)">
                    {data?.professor?.is_master
                        ? "Nenhum PEI foi enviado para professores regentes ainda. Finalize um PEI no módulo PEI e clique em \"Enviar para Regentes\"."
                        : "Aguarde o envio do PEI pelo profissional AEE ou coordenação."}
                </p>
            </div>
        );
    }

    // ─── Área de Trabalho (step ativo) ────────────────────────────────────────

    if (selectedAluno && selectedDisc && activeStep) {
        return (
            <div className="relative rounded-2xl overflow-hidden bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                {/* Toast notification */}
                {toast && (
                    <div className="absolute top-3 right-3 z-50 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 omni-body font-bold animate-fade-in">
                        {toast}
                    </div>
                )}
                {/* Transitioning overlay */}
                {transitioning && (
                    <div className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                        <div className="text-center">
                            <OmniLoader variant="card" />
                            <p className="text-white omni-body mt-2 font-bold">Avançando fase...</p>
                        </div>
                    </div>
                )}
                {/* Header com breadcrumb */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-(--omni-border-default) bg-(--omni-bg-tertiary)">
                    <button
                        onClick={() => { setActiveStep(null); setSelectedDisc(null); }}
                        className="p-1.5 rounded-lg transition-colors text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        <span>{selectedAluno.name}</span>
                        <span className="mx-2">›</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedDisc.disciplina}</span>
                        <span className="mx-2">›</span>
                        <span className={STEP_COLORS[selectedDisc.fase_status]?.text || 'text-slate-400'}>
                            {activeStep === "plano" ? "Plano de Ensino"
                                : activeStep === "diagnostica" ? "Avaliação Diagnóstica"
                                    : "PEI Disciplina"}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {activeStep === "plano" && !selectedAluno.grade && (
                        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-500">
                                <strong>Atenção:</strong> A série/ano do estudante não está cadastrada.
                                O plano será buscado com valor padrão. Atualize o cadastro do estudante para resultados mais precisos.
                            </p>
                        </div>
                    )}
                    {activeStep === "plano" && (
                        <PEIPlanoEnsino
                            studentId={selectedAluno.id}
                            disciplina={selectedDisc.disciplina}
                            anoSerie={selectedAluno.grade || "6º Ano"}
                            onPlanoSaved={async (planoId: string) => {
                                setTransitioning(true);
                                // Link plano_ensino_id to pei_disciplinas AND advance status
                                if (selectedDisc.id && !selectedDisc.is_virtual) {
                                    try {
                                        await fetch("/api/pei/disciplina", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                studentId: selectedAluno.id,
                                                disciplina: selectedDisc.disciplina,
                                                plano_ensino_id: planoId,
                                            }),
                                        });
                                        if (selectedDisc.fase_status === "plano_ensino") {
                                            await fetch("/api/pei/disciplina", {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    id: selectedDisc.id,
                                                    fase_status: "diagnostica",
                                                }),
                                            });
                                        }
                                        setToast("✅ Plano vinculado! Avançando para Diagnóstica...");
                                        setTimeout(() => setToast(null), 3000);
                                    } catch { /* silent */ }
                                }
                                await fetchData();
                                setTransitioning(false);
                            }}
                        />
                    )}

                    {activeStep === "diagnostica" && (
                        <PEIAvaliacaoDiagnosticaLink
                            studentId={selectedAluno.id}
                            studentName={selectedAluno.name}
                            disciplina={selectedDisc.disciplina}
                            onLinked={async () => {
                                setTransitioning(true);
                                if (selectedDisc.id && !selectedDisc.is_virtual && selectedDisc.fase_status === "diagnostica") {
                                    await fetch("/api/pei/disciplina", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            id: selectedDisc.id,
                                            fase_status: "pei_disciplina",
                                        }),
                                    }).catch(() => { });
                                    setToast("✅ Diagnóstica aplicada! Avançando para PEI...");
                                    setTimeout(() => setToast(null), 3000);
                                }
                                await fetchData();
                                setTransitioning(false);
                            }}
                        />
                    )}

                    {activeStep === "pei" && (
                        <div className="space-y-6">
                            {/* Título */}
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    PEI por Disciplina — {selectedDisc.disciplina}
                                </h3>
                            </div>

                            {/* ── PEI Geral (PEI 1) — expandível ── */}
                            {selectedAluno.pei_geral && Object.keys(selectedAluno.pei_geral).length > 1 && (
                                <details className="rounded-xl overflow-hidden border-[1.5px] border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors">
                                    <summary className="px-5 py-3.5 cursor-pointer flex items-center gap-2 bg-indigo-500/10">
                                        <FileText className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-bold text-indigo-400">
                                            PEI Geral do Estudante
                                        </span>
                                        <span className="omni-label-xs ml-auto px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                            Informações gerais
                                        </span>
                                    </summary>
                                    <div className="px-2 pb-4 pt-2">
                                        <PEISummaryPanel
                                            peiData={selectedAluno.pei_geral}
                                            studentName={selectedAluno.name}
                                        />
                                    </div>
                                </details>
                            )}

                            {/* ── BNCC do Especialista (read-only) ── */}
                            {selectedAluno.habilidades_bncc?.length > 0 && (
                                <details className="rounded-xl overflow-hidden border border-green-600/20 bg-green-600/5 hover:bg-green-600/10 transition-colors">
                                    <summary className="px-5 py-3 cursor-pointer flex items-center gap-2 bg-green-600/10">
                                        <BookOpen className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-bold text-green-600">
                                            Habilidades BNCC (selecionadas pelo Especialista)
                                        </span>
                                        <span className="omni-label-xs ml-auto px-2 py-0.5 rounded-full font-bold bg-green-600/15 text-green-600">
                                            {(() => {
                                                const disc = selectedDisc.disciplina.toLowerCase();
                                                const filtered = selectedAluno.habilidades_bncc.filter(h =>
                                                    !h.disciplina || h.disciplina.toLowerCase().includes(disc)
                                                );
                                                return filtered.length > 0
                                                    ? `${filtered.length} da sua disciplina`
                                                    : `${selectedAluno.habilidades_bncc.length} total`;
                                            })()}
                                        </span>
                                    </summary>
                                    <div className="px-5 pb-4 pt-2 space-y-1.5">
                                        {selectedAluno.habilidades_bncc.map((h, i) => {
                                            const disc = selectedDisc.disciplina.toLowerCase();
                                            const isMyDisc = !h.disciplina || h.disciplina.toLowerCase().includes(disc);
                                            return (
                                                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${isMyDisc ? 'bg-green-600/10 border border-green-600/15 opacity-100' : 'bg-transparent border-transparent opacity-50'}`}>
                                                    {h.codigo && (
                                                        <span className="font-bold shrink-0 px-1.5 py-0.5 rounded bg-green-600/10 text-green-600 omni-label-xs">{h.codigo}</span>
                                                    )}
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        {h.habilidade || h.objeto_conhecimento || String(h.codigo || `Habilidade ${i + 1}`)}
                                                    </span>
                                                    {h.disciplina && (
                                                        <span className="shrink-0 omni-label-xs text-slate-400">
                                                            {h.disciplina}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            )}

                            {/* EI Objetivos */}
                            {selectedAluno.bncc_ei_objetivos?.length > 0 && (
                                <details className="rounded-xl overflow-hidden border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 transition-colors">
                                    <summary className="px-5 py-3 cursor-pointer flex items-center gap-2 bg-sky-500/10">
                                        <BookOpen className="w-4 h-4 text-sky-500" />
                                        <span className="text-sm font-bold text-sky-500">
                                            Objetivos EI (BNCC — Campos de Experiência)
                                        </span>
                                        <span className="omni-label-xs ml-auto px-2 py-0.5 rounded-full font-bold bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
                                            {selectedAluno.bncc_ei_objetivos.length}
                                        </span>
                                    </summary>
                                    <div className="px-5 pb-4 pt-2 space-y-1">
                                        {selectedAluno.bncc_ei_objetivos.map((obj, i) => (
                                            <p key={i} className="text-xs p-2 rounded-lg" style={{
                                                color: 'var(--text-secondary)',
                                                background: 'rgba(66,153,225,.04)',
                                            }}>• {obj}</p>
                                        ))}
                                    </div>
                                </details>
                            )}

                            {/* ── Ponte Pedagógica: Plano de Curso + Diagnóstica → PEI ── */}
                            <div className="p-5 rounded-xl space-y-4 bg-sky-500/10 border border-sky-500/25">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-sky-500" />
                                    <h4 className="text-sm font-bold text-sky-500">
                                        Metas do Bimestre para a Disciplina
                                    </h4>
                                </div>
                                <p className="text-xs text-(--omni-text-muted)">
                                    A IA cruza o <strong>Plano de Curso da turma</strong> com o <strong>nível do estudante</strong> (Diagnóstica)
                                    e suas barreiras/potencialidades para sugerir adaptações individualizadas.
                                </p>

                                {/* IA Button */}
                                <button
                                    onClick={async () => {
                                        if (!selectedAluno) return;
                                        setGerandoAdaptacao(true);
                                        aiLoadingStart("red", "pei_regente");
                                        try {
                                            const res = await fetch("/api/pei/adaptar-plano", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    student_id: selectedAluno.id,
                                                    disciplina: selectedDisc.disciplina,
                                                    serie: selectedAluno.grade || "",
                                                    barreiras: {},
                                                    potencialidades: [],
                                                    diagnostico: selectedAluno.diagnostico || "",
                                                    nome_aluno: selectedAluno.name,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (data.sugestao) {
                                                setAdaptacaoSugestao(data.sugestao);
                                                setAdaptacaoMeta({
                                                    plano_encontrado: data.plano_curso_encontrado || false,
                                                    nivel_diag: data.diagnostica_nivel ?? null,
                                                });

                                                // Auto-save adaptation to pei_disciplina_data
                                                if (selectedDisc.id && !selectedDisc.is_virtual) {
                                                    fetch("/api/pei/disciplina", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            studentId: selectedAluno.id,
                                                            disciplina: selectedDisc.disciplina,
                                                            pei_disciplina_data: { adaptacao_rascunho: data.sugestao },
                                                        }),
                                                    }).catch(() => { });

                                                    // Advance to pei_disciplina step
                                                    if (selectedDisc.fase_status === "diagnostica" || selectedDisc.fase_status === "plano_ensino") {
                                                        fetch("/api/pei/disciplina", {
                                                            method: "PATCH",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                id: selectedDisc.id,
                                                                fase_status: "pei_disciplina",
                                                            }),
                                                        }).catch(() => { });
                                                    }
                                                }
                                            }
                                        } catch { /* silent */ }
                                        setGerandoAdaptacao(false);
                                        aiLoadingStop();
                                    }}
                                    disabled={gerandoAdaptacao}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 ${gerandoAdaptacao ? 'bg-slate-400' : 'bg-linear-to-br from-sky-500 to-blue-500'}`}
                                >
                                    {gerandoAdaptacao ? <OmniLoader engine="red" size={14} /> : (
                                        <>
                                            <Sparkles size={14} />
                                        </>
                                    )}
                                    {gerandoAdaptacao ? "Gerando adaptações..." : "Sugerir Adaptações com IA"}
                                </button>

                                {/* Result */}
                                {adaptacaoSugestao && (
                                    <div className="space-y-3 pt-2">
                                        {/* Meta badges */}
                                        <div className="flex gap-2 flex-wrap">
                                            {adaptacaoMeta?.nivel_diag != null && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-sky-500/10 text-sky-500">
                                                    📊 Nível Diagnóstica: {adaptacaoMeta.nivel_diag}
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${adaptacaoMeta?.plano_encontrado ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                📚 Plano de Curso: {adaptacaoMeta?.plano_encontrado ? "✅ Encontrado" : "⚠️ Não encontrado"}
                                            </span>
                                        </div>

                                        {/* Resumo */}
                                        {adaptacaoSugestao.resumo_adaptacao && (
                                            <div className="p-3 rounded-lg text-sm bg-(--bg-primary) border border-sky-500/15 text-(--text-secondary)">
                                                {String(adaptacaoSugestao.resumo_adaptacao)}
                                            </div>
                                        )}

                                        {/* Objetivos individualizados + Rubrica */}
                                        {adaptacaoSugestao.objetivos_individualizados && (
                                            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-bold text-blue-500">
                                                        <Target className="w-3 h-3 inline mr-1" />
                                                        Objetivos Individualizados
                                                    </p>
                                                    {adaptacaoMeta?.nivel_diag != null && (
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full omni-label-xs font-bold ${adaptacaoMeta.nivel_diag >= 3 ? 'bg-emerald-500/10 text-emerald-500' : adaptacaoMeta.nivel_diag >= 2 ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                            N{adaptacaoMeta.nivel_diag} — {ESCALA_OMNISFERA[adaptacaoMeta.nivel_diag as NivelOmnisfera]?.label || ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {String(adaptacaoSugestao.objetivos_individualizados)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Habilidades prioritárias */}
                                        {(adaptacaoSugestao.habilidades_prioritarias || []).length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {(adaptacaoSugestao.habilidades_prioritarias as string[]).map((h: string, i: number) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md omni-label-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        🎯 {h}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Metodologia */}
                                        {adaptacaoSugestao.metodologia_adaptada && (
                                            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                                                <p className="text-xs font-bold mb-1 text-purple-500">📐 Metodologia Adaptada</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {String(adaptacaoSugestao.metodologia_adaptada)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Estratégias cards */}
                                        {(adaptacaoSugestao.estrategias_acesso?.length || adaptacaoSugestao.estrategias_ensino?.length || adaptacaoSugestao.estrategias_avaliacao?.length) && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {adaptacaoSugestao.estrategias_acesso?.length > 0 && (
                                                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                                        <p className="text-xs font-bold mb-1 text-emerald-500">♿ Acesso</p>
                                                        {(adaptacaoSugestao.estrategias_acesso as string[]).map((e: string, i: number) => (
                                                            <p key={i} className="text-xs text-slate-500 dark:text-slate-400">• {e}</p>
                                                        ))}
                                                    </div>
                                                )}
                                                {adaptacaoSugestao.estrategias_ensino?.length > 0 && (
                                                    <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                                                        <p className="text-xs font-bold mb-1 text-indigo-500">📚 Ensino</p>
                                                        {(adaptacaoSugestao.estrategias_ensino as string[]).map((e: string, i: number) => (
                                                            <p key={i} className="text-xs text-slate-500 dark:text-slate-400">• {e}</p>
                                                        ))}
                                                    </div>
                                                )}
                                                {adaptacaoSugestao.estrategias_avaliacao?.length > 0 && (
                                                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                                                        <p className="text-xs font-bold mb-1 text-amber-500">📝 Avaliação</p>
                                                        {(adaptacaoSugestao.estrategias_avaliacao as string[]).map((e: string, i: number) => (
                                                            <p key={i} className="text-xs text-slate-500 dark:text-slate-400">• {e}</p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <a
                                                href={`/pei?studentId=${selectedAluno.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all bg-linear-to-br from-emerald-600 to-emerald-500"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Abrir PEI completo e aplicar estratégias
                                            </a>

                                            {/* Finalizar PEI desta disciplina e enviar para consolidar */}
                                            {selectedDisc.id && !selectedDisc.is_virtual && (
                                                <FinalizarPeiDisciplinaButton
                                                    studentId={selectedAluno.id}
                                                    disciplina={selectedDisc.disciplina}
                                                    peiDisciplinaId={selectedDisc.id}
                                                    adaptacaoSugestao={adaptacaoSugestao}
                                                    onFinalizado={() => { fetchData(); setAdaptacaoSugestao(null); }}
                                                />
                                            )}

                                            {/* Auto-save version */}
                                            <button
                                                onClick={async () => {
                                                    setVersionSaveStatus('saving');
                                                    try {
                                                        const res = await fetch('/api/pei/versions', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                studentId: selectedAluno.id,
                                                                label: `Adaptação ${selectedDisc.disciplina} — ${new Date().toLocaleDateString('pt-BR')}`,
                                                            }),
                                                        });
                                                        setVersionSaveStatus(res.ok ? 'saved' : 'error');
                                                    } catch { setVersionSaveStatus('error'); }
                                                    setTimeout(() => setVersionSaveStatus('idle'), 3000);
                                                }}
                                                disabled={versionSaveStatus === 'saving'}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${versionSaveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : versionSaveStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'}`}
                                            >
                                                {versionSaveStatus === 'saving' ? '⏳ Salvando...'
                                                    : versionSaveStatus === 'saved' ? '✅ Versão salva!'
                                                        : versionSaveStatus === 'error' ? '❌ Erro ao salvar'
                                                            : '📸 Salvar Versão PEI'}
                                            </button>
                                        </div>

                                        {/* Alerts */}
                                        {(adaptacaoSugestao.alertas || []).length > 0 && (
                                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                                                <p className="text-xs font-bold mb-1 text-amber-500">⚠️ Alertas</p>
                                                {(adaptacaoSugestao.alertas as string[]).map((a: string, i: number) => (
                                                    <p key={i} className="text-xs text-slate-500 dark:text-slate-400">• {a}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Info about full PEI */}
                            <div className="p-4 rounded-lg text-center bg-slate-50 border border-(--border-default) dark:bg-slate-800/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    As adaptações sugeridas acima podem ser aplicadas no <strong>PEI completo do estudante</strong>,
                                    acessível pelo módulo PEI principal.
                                </p>
                                <a
                                    href={`/pei?studentId=${selectedAluno.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold transition-colors text-indigo-500 hover:text-indigo-600"
                                >
                                    <ExternalLink size={12} /> Ir para PEI completo
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── Pipeline de disciplinas do aluno selecionado ─────────────────────────

    if (selectedAluno) {
        return (
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-(--border-default) relative">
                {/* Toast notification */}
                {toast && (
                    <div className="absolute top-3 right-3 z-50 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 omni-body font-bold">
                        {toast}
                    </div>
                )}
                {/* Header do aluno */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-(--border-default) bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedAluno(null)}
                            className="p-1.5 rounded-lg transition-colors text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{selectedAluno.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {selectedAluno.grade} {selectedAluno.class_group && `— ${selectedAluno.class_group}`}
                                {selectedAluno.diagnostico && ` · ${selectedAluno.diagnostico}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pipeline por disciplina */}
                <div className="p-6 space-y-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-500 dark:text-slate-400">
                        Componentes Curriculares ({selectedAluno.disciplinas.length})
                    </h4>

                    {selectedAluno.disciplinas.map((disc) => {
                        const step = STEP_COLORS[disc.fase_status] || STEP_COLORS.plano_ensino;
                        const steps: Array<{ key: "plano" | "diagnostica" | "pei"; label: string; done: boolean; active: boolean }> = [
                            { key: "plano", label: "Plano de Ensino", done: disc.has_plano, active: disc.fase_status === "plano_ensino" },
                            { key: "diagnostica", label: "Diagnóstica", done: disc.has_avaliacao && disc.avaliacao_status === "aplicada", active: disc.fase_status === "diagnostica" },
                            { key: "pei", label: "PEI Disciplina", done: disc.fase_status === "concluido", active: disc.fase_status === "pei_disciplina" },
                        ];

                        return (
                            <div
                                key={disc.id}
                                className={`rounded-xl overflow-hidden transition-all border ${step.border} ${step.bg}`}
                            >
                                {/* Header da disciplina */}
                                <div className="px-5 py-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {step.icon}
                                        <div>
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                {disc.disciplina}
                                            </span>
                                            <span className="text-xs ml-2 text-slate-500 dark:text-slate-400">
                                                {disc.professor_regente_nome}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badge nível */}
                                    <div className="flex items-center gap-2">
                                        {disc.nivel_omnisfera !== null && (
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                                                N{disc.nivel_omnisfera} — {ESCALA_OMNISFERA[disc.nivel_omnisfera as NivelOmnisfera]?.label || ""}
                                            </span>
                                        )}
                                        {/* Reset discipline button */}
                                        {!disc.is_virtual && disc.fase_status !== 'concluido' && (
                                            <button
                                                title="Resetar esta disciplina"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!confirm(`Resetar o PEI de ${disc.disciplina}? Isso apagará o progresso (plano vinculado, adaptações). A avaliação diagnóstica NÃO será afetada.`)) return;
                                                    try {
                                                        await fetch(`/api/pei/disciplina?id=${disc.id}`, { method: 'DELETE' });
                                                        setToast(`🗑️ PEI ${disc.disciplina} resetado`);
                                                        setTimeout(() => setToast(null), 3000);
                                                        fetchData();
                                                    } catch { /* silent */ }
                                                }}
                                                className="p-1.5 rounded-lg transition-all text-slate-400 hover:text-red-500 opacity-50 hover:opacity-100"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Pipeline steps */}
                                <div className="px-5 pb-4 flex items-center gap-2">
                                    {steps.map((s, i) => (
                                        <React.Fragment key={s.key}>
                                            <button
                                                onClick={() => { setSelectedDisc(disc); setActiveStep(s.key); }}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-85 ${s.done ? 'bg-emerald-500/10 text-emerald-500 border border-transparent' : s.active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border border-(--border-default)'}`}
                                            >
                                                {s.done ? <CheckCircle2 size={13} /> : i === 0 ? <FileText size={13} /> : i === 1 ? <Brain size={13} /> : <ClipboardCheck size={13} />}
                                                {s.label}
                                            </button>
                                            {i < steps.length - 1 && (
                                                <ChevronRight size={14} className="text-slate-400 opacity-40 ml-1 mr-1" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── Lista de Alunos ──────────────────────────────────────────────────────

    return (
        <div className="rounded-2xl overflow-hidden bg-(--bg-secondary) border border-(--border-default)">
            {/* Onboarding Panel */}
            {showOnboarding && (
                <div className="px-6 pt-6">
                    <OnboardingPanel
                        moduleKey="pei_regente"
                        moduleTitle="Bem-vindo ao PEI do Professor"
                        moduleSubtitle="Acompanhe e adapte o PEI para suas disciplinas"
                        accentColor="#10b981"
                        accentColorLight="#34d399"
                        steps={[
                            { icon: <Users size={22} />, title: "Seus Estudantes", description: "Veja os alunos em Fase 2 do PEI" },
                            { icon: <FileText size={22} />, title: "Plano de Ensino", description: "Vincule o plano da sua turma" },
                            { icon: <Brain size={22} />, title: "Diagnóstica", description: "Verifique o nível do estudante" },
                            { icon: <ClipboardCheck size={22} />, title: "PEI Disciplina", description: "Gere adaptações com a Ponte Pedagógica" },
                        ]}
                        onStart={() => setShowOnboarding(false)}
                    />
                </div>
            )}
            {/* Header com info do professor */}
            <div className="px-6 py-4 border-b border-(--border-default) bg-(--bg-tertiary)">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-linear-to-br from-emerald-600 to-emerald-500">
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-(--omni-text-primary)">
                                {data.professor.is_master ? "Visão Geral — Todos os Estudantes" : `Meus Estudantes`}
                            </h3>
                            <p className="text-xs text-(--omni-text-muted)">
                                {data.professor.name} · {data.alunos.length} estudante{data.alunos.length !== 1 ? "s" : ""} em Fase 2
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-(--bg-tertiary) text-(--text-muted) border border-(--border-default) hover:bg-(--bg-hover)"
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Lista de alunos como cards com orquestração do framer-motion */}
            <motion.div
                className="p-6 space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {data.alunos.map((aluno) => {
                    const totalDisc = aluno.disciplinas.length;
                    const concluidas = aluno.disciplinas.filter(d => d.fase_status === "concluido").length;
                    const progress = totalDisc > 0 ? Math.round((concluidas / totalDisc) * 100) : 0;

                    return (
                        <motion.div
                            key={aluno.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedAluno(aluno)}
                            className="rounded-xl p-4 cursor-pointer transition-all bg-(--bg-primary) border border-(--border-default) hover:border-emerald-500/40 hover:shadow-[0_2px_12px_rgba(16,185,129,.08)]"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-linear-to-br from-indigo-500 to-violet-500">
                                        {aluno.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-(--omni-text-primary)">
                                            {aluno.name}
                                        </span>
                                        <p className="text-xs text-(--omni-text-muted)">
                                            {aluno.grade} {aluno.class_group && `— ${aluno.class_group}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className={`text-xs font-bold ${progress === 100 ? 'text-emerald-500' : 'text-(--text-muted)'}`}>
                                            {concluidas}/{totalDisc}
                                        </span>
                                        <p className="omni-label-xs text-(--omni-text-muted)">disciplinas</p>
                                    </div>
                                    <ChevronRight size={16} className="text-(--omni-text-muted)" />
                                </div>
                            </div>

                            {/* Mini pipeline */}
                            <div className="flex gap-1.5 mt-2">
                                {aluno.disciplinas.map((d) => {
                                    const stepColor = STEP_COLORS[d.fase_status];
                                    return (
                                        <span
                                            key={d.id}
                                            className={`omni-label-xs font-semibold px-2 py-0.5 rounded-md border ${stepColor.border} ${stepColor.bg} ${stepColor.text}`}
                                            title={`${d.disciplina}: ${FASE_STATUS_LABELS[d.fase_status]}`}
                                        >
                                            {d.disciplina.length > 12 ? d.disciplina.slice(0, 10) + "…" : d.disciplina}
                                        </span>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

// ─── Finalizar PEI Disciplina e enviar para consolidar ─────────────────────

function FinalizarPeiDisciplinaButton({
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

function PEIAvaliacaoDiagnosticaLink({ studentId, studentName, disciplina, onLinked }: {
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
            // Don't auto-advance if we're just viewing — only on first link
            // The parent already handles the auto-advance when necessary
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
