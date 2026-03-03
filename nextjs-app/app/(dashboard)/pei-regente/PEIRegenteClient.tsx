"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Users, AlertTriangle, ChevronRight,
    FileText, Brain, ClipboardCheck, CheckCircle2, ArrowLeft,
    Sparkles, School, ExternalLink, Target,
} from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { PEIPlanoEnsino } from "@/components/PEIPlanoEnsino";
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
}

interface DataResponse {
    professor: { id: string; name: string; is_master: boolean };
    alunos: Aluno[];
}

// ─── Constantes Visuais ───────────────────────────────────────────────────────

const STEP_COLORS: Record<FaseStatusPEIDisciplina, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    plano_ensino: {
        bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.3)",
        text: "#f59e0b", icon: <FileText size={16} style={{ color: "#f59e0b" }} />,
    },
    diagnostica: {
        bg: "rgba(59,130,246,.08)", border: "rgba(59,130,246,.3)",
        text: "#3b82f6", icon: <Brain size={16} style={{ color: "#3b82f6" }} />,
    },
    pei_disciplina: {
        bg: "rgba(139,92,246,.08)", border: "rgba(139,92,246,.3)",
        text: "#8b5cf6", icon: <ClipboardCheck size={16} style={{ color: "#8b5cf6" }} />,
    },
    concluido: {
        bg: "rgba(16,185,129,.08)", border: "rgba(16,185,129,.3)",
        text: "#10b981", icon: <CheckCircle2 size={16} style={{ color: "#10b981" }} />,
    },
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
            <div className="rounded-2xl overflow-hidden bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                {/* Header com breadcrumb */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-(--omni-border-default) bg-(--omni-bg-tertiary)">
                    <button
                        onClick={() => { setActiveStep(null); setSelectedDisc(null); }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>{selectedAluno.name}</span>
                        <span className="mx-2">›</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedDisc.disciplina}</span>
                        <span className="mx-2">›</span>
                        <span style={{ color: STEP_COLORS[selectedDisc.fase_status]?.text || '#94a3b8' }}>
                            {activeStep === "plano" ? "Plano de Ensino"
                                : activeStep === "diagnostica" ? "Avaliação Diagnóstica"
                                    : "PEI Disciplina"}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {activeStep === "plano" && (
                        <PEIPlanoEnsino
                            studentId={selectedAluno.id}
                            disciplina={selectedDisc.disciplina}
                            anoSerie={selectedAluno.grade || "6º Ano"}
                            onPlanoSaved={async (planoId: string) => {
                                // Link plano_ensino_id to pei_disciplinas AND advance status
                                if (selectedDisc.id && !String(selectedDisc.id).startsWith("virtual_")) {
                                    try {
                                        // Save plano_ensino_id via POST
                                        await fetch("/api/pei/disciplina", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                studentId: selectedAluno.id,
                                                disciplina: selectedDisc.disciplina,
                                                plano_ensino_id: planoId,
                                            }),
                                        });
                                        // Advance status to diagnostica
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
                                    } catch { /* silent */ }
                                }
                                fetchData();
                            }}
                        />
                    )}

                    {activeStep === "diagnostica" && (
                        <PEIAvaliacaoDiagnosticaLink
                            studentId={selectedAluno.id}
                            studentName={selectedAluno.name}
                            disciplina={selectedDisc.disciplina}
                            onLinked={async () => {
                                // Auto-advance to pei_disciplina when diagnostic is applied
                                if (selectedDisc.id && !String(selectedDisc.id).startsWith("virtual_") && selectedDisc.fase_status === "diagnostica") {
                                    await fetch("/api/pei/disciplina", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            id: selectedDisc.id,
                                            fase_status: "pei_disciplina",
                                        }),
                                    }).catch(() => { });
                                }
                                fetchData();
                            }}
                        />
                    )}

                    {activeStep === "pei" && (
                        <div className="space-y-6">
                            {/* Título */}
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5" style={{ color: '#818cf8' }} />
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    PEI por Disciplina — {selectedDisc.disciplina}
                                </h3>
                            </div>

                            {/* ── BNCC do Especialista (read-only) ── */}
                            {selectedAluno.habilidades_bncc?.length > 0 && (
                                <details className="rounded-xl overflow-hidden" style={{
                                    border: '1px solid rgba(56,161,105,.2)',
                                    background: 'rgba(56,161,105,.03)',
                                }}>
                                    <summary className="px-5 py-3 cursor-pointer flex items-center gap-2" style={{ background: 'rgba(56,161,105,.06)' }}>
                                        <BookOpen className="w-4 h-4" style={{ color: '#38A169' }} />
                                        <span className="text-sm font-bold" style={{ color: '#38A169' }}>
                                            Habilidades BNCC (selecionadas pelo Especialista)
                                        </span>
                                        <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full font-bold" style={{
                                            background: 'rgba(56,161,105,.12)', color: '#38A169',
                                        }}>
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
                                                <div key={i} className="flex items-start gap-2 p-2 rounded-lg text-xs" style={{
                                                    background: isMyDisc ? 'rgba(56,161,105,.06)' : 'transparent',
                                                    border: isMyDisc ? '1px solid rgba(56,161,105,.15)' : '1px solid transparent',
                                                    opacity: isMyDisc ? 1 : 0.5,
                                                }}>
                                                    {h.codigo && (
                                                        <span className="font-bold shrink-0 px-1.5 py-0.5 rounded" style={{
                                                            background: 'rgba(56,161,105,.1)', color: '#38A169', fontSize: 10,
                                                        }}>{h.codigo}</span>
                                                    )}
                                                    <span style={{ color: 'var(--text-secondary)' }}>
                                                        {h.habilidade || h.objeto_conhecimento || String(h.codigo || `Habilidade ${i + 1}`)}
                                                    </span>
                                                    {h.disciplina && (
                                                        <span className="shrink-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
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
                                <details className="rounded-xl overflow-hidden" style={{
                                    border: '1px solid rgba(66,153,225,.2)',
                                    background: 'rgba(66,153,225,.03)',
                                }}>
                                    <summary className="px-5 py-3 cursor-pointer flex items-center gap-2" style={{ background: 'rgba(66,153,225,.06)' }}>
                                        <BookOpen className="w-4 h-4" style={{ color: '#4299e1' }} />
                                        <span className="text-sm font-bold" style={{ color: '#4299e1' }}>
                                            Objetivos EI (BNCC — Campos de Experiência)
                                        </span>
                                        <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full font-bold" style={{
                                            background: 'rgba(66,153,225,.12)', color: '#4299e1',
                                        }}>
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
                            <div className="p-5 rounded-xl space-y-4" style={{
                                border: '2px solid rgba(14,165,233,.2)',
                                background: 'linear-gradient(135deg, rgba(14,165,233,.04), rgba(59,130,246,.03))',
                            }}>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" style={{ color: '#0ea5e9' }} />
                                    <h4 className="text-sm font-bold" style={{ color: '#0ea5e9' }}>
                                        Ponte Pedagógica: Plano de Curso + Diagnóstica → PEI
                                    </h4>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    A IA cruza o <strong>Plano de Curso da turma</strong> com o <strong>nível do estudante</strong> (Diagnóstica)
                                    e suas barreiras/potencialidades para sugerir adaptações individualizadas.
                                </p>

                                {/* IA Button */}
                                <button
                                    onClick={async () => {
                                        if (!selectedAluno) return;
                                        setGerandoAdaptacao(true);
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
                                                if (selectedDisc.id && !String(selectedDisc.id).startsWith("virtual_")) {
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
                                    }}
                                    disabled={gerandoAdaptacao}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                                    style={{ background: gerandoAdaptacao ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}
                                >
                                    {gerandoAdaptacao ? <OmniLoader engine="red" size={14} /> : (
                                        <>
                                            <Sparkles size={14} />
                                        </>
                                    )}
                                    {gerandoAdaptacao ? "Gerando adaptações..." : "Sugerir Adaptações com IA"}
                                </button>
                                {gerandoAdaptacao && <OmniLoader engine="red" variant="overlay" module="pei_regente" />}

                                {/* Result */}
                                {adaptacaoSugestao && (
                                    <div className="space-y-3 pt-2">
                                        {/* Meta badges */}
                                        <div className="flex gap-2 flex-wrap">
                                            {adaptacaoMeta?.nivel_diag != null && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold"
                                                    style={{ backgroundColor: 'rgba(14,165,233,.1)', color: '#0ea5e9' }}>
                                                    📊 Nível Diagnóstica: {adaptacaoMeta.nivel_diag}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold"
                                                style={{
                                                    backgroundColor: adaptacaoMeta?.plano_encontrado ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)',
                                                    color: adaptacaoMeta?.plano_encontrado ? '#10b981' : '#f59e0b',
                                                }}>
                                                📚 Plano de Curso: {adaptacaoMeta?.plano_encontrado ? "✅ Encontrado" : "⚠️ Não encontrado"}
                                            </span>
                                        </div>

                                        {/* Resumo */}
                                        {adaptacaoSugestao.resumo_adaptacao && (
                                            <div className="p-3 rounded-lg text-sm" style={{
                                                backgroundColor: 'var(--bg-primary)',
                                                border: '1px solid rgba(14,165,233,.15)',
                                                color: 'var(--text-secondary)',
                                            }}>
                                                {String(adaptacaoSugestao.resumo_adaptacao)}
                                            </div>
                                        )}

                                        {/* Objetivos individualizados + Rubrica */}
                                        {adaptacaoSugestao.objetivos_individualizados && (
                                            <div className="p-3 rounded-lg" style={{
                                                backgroundColor: 'rgba(59,130,246,.05)',
                                                border: '1px solid rgba(59,130,246,.15)',
                                            }}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-bold" style={{ color: '#3b82f6' }}>
                                                        <Target className="w-3 h-3 inline mr-1" />
                                                        Objetivos Individualizados
                                                    </p>
                                                    {adaptacaoMeta?.nivel_diag != null && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                                            style={{
                                                                background: adaptacaoMeta.nivel_diag >= 3 ? 'rgba(16,185,129,.12)'
                                                                    : adaptacaoMeta.nivel_diag >= 2 ? 'rgba(59,130,246,.12)'
                                                                        : 'rgba(245,158,11,.12)',
                                                                color: adaptacaoMeta.nivel_diag >= 3 ? '#10b981'
                                                                    : adaptacaoMeta.nivel_diag >= 2 ? '#3b82f6'
                                                                        : '#f59e0b',
                                                            }}>
                                                            N{adaptacaoMeta.nivel_diag} — {ESCALA_OMNISFERA[adaptacaoMeta.nivel_diag as NivelOmnisfera]?.label || ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {String(adaptacaoSugestao.objetivos_individualizados)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Habilidades prioritárias */}
                                        {(adaptacaoSugestao.habilidades_prioritarias || []).length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {(adaptacaoSugestao.habilidades_prioritarias as string[]).map((h: string, i: number) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold"
                                                        style={{ backgroundColor: 'rgba(99,102,241,.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,.15)' }}>
                                                        🎯 {h}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Metodologia */}
                                        {adaptacaoSugestao.metodologia_adaptada && (
                                            <div className="p-3 rounded-lg" style={{
                                                backgroundColor: 'rgba(168,85,247,.05)',
                                                border: '1px solid rgba(168,85,247,.15)',
                                            }}>
                                                <p className="text-xs font-bold mb-1" style={{ color: '#a855f7' }}>📐 Metodologia Adaptada</p>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {String(adaptacaoSugestao.metodologia_adaptada)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Estratégias cards */}
                                        {(adaptacaoSugestao.estrategias_acesso?.length || adaptacaoSugestao.estrategias_ensino?.length || adaptacaoSugestao.estrategias_avaliacao?.length) && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {adaptacaoSugestao.estrategias_acesso?.length > 0 && (
                                                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.15)' }}>
                                                        <p className="text-xs font-bold mb-1" style={{ color: '#10b981' }}>♿ Acesso</p>
                                                        {(adaptacaoSugestao.estrategias_acesso as string[]).map((e: string, i: number) => (
                                                            <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {e}</p>
                                                        ))}
                                                    </div>
                                                )}
                                                {adaptacaoSugestao.estrategias_ensino?.length > 0 && (
                                                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,.05)', border: '1px solid rgba(99,102,241,.15)' }}>
                                                        <p className="text-xs font-bold mb-1" style={{ color: '#6366f1' }}>📚 Ensino</p>
                                                        {(adaptacaoSugestao.estrategias_ensino as string[]).map((e: string, i: number) => (
                                                            <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {e}</p>
                                                        ))}
                                                    </div>
                                                )}
                                                {adaptacaoSugestao.estrategias_avaliacao?.length > 0 && (
                                                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.15)' }}>
                                                        <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>📝 Avaliação</p>
                                                        {(adaptacaoSugestao.estrategias_avaliacao as string[]).map((e: string, i: number) => (
                                                            <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {e}</p>
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
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all"
                                                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', display: 'inline-flex' }}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Abrir PEI completo e aplicar estratégias
                                            </a>

                                            {/* Finalizar PEI desta disciplina e enviar para consolidar */}
                                            {selectedDisc.id && !String(selectedDisc.id).startsWith("virtual_") && (
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
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                                style={{
                                                    backgroundColor: versionSaveStatus === 'saved' ? 'rgba(16,185,129,.1)'
                                                        : versionSaveStatus === 'error' ? 'rgba(239,68,68,.1)'
                                                            : 'rgba(99,102,241,.08)',
                                                    color: versionSaveStatus === 'saved' ? '#10b981'
                                                        : versionSaveStatus === 'error' ? '#f87171'
                                                            : '#818cf8',
                                                    border: versionSaveStatus === 'saved' ? '1px solid rgba(16,185,129,.2)'
                                                        : versionSaveStatus === 'error' ? '1px solid rgba(239,68,68,.2)'
                                                            : '1px solid rgba(99,102,241,.15)',
                                                }}
                                            >
                                                {versionSaveStatus === 'saving' ? '⏳ Salvando...'
                                                    : versionSaveStatus === 'saved' ? '✅ Versão salva!'
                                                        : versionSaveStatus === 'error' ? '❌ Erro ao salvar'
                                                            : '📸 Salvar Versão PEI'}
                                            </button>
                                        </div>

                                        {/* Alerts */}
                                        {(adaptacaoSugestao.alertas || []).length > 0 && (
                                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.15)' }}>
                                                <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>⚠️ Alertas</p>
                                                {(adaptacaoSugestao.alertas as string[]).map((a: string, i: number) => (
                                                    <p key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>• {a}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Info about full PEI */}
                            <div className="p-4 rounded-lg text-center" style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-default)',
                            }}>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    As adaptações sugeridas acima podem ser aplicadas no <strong>PEI completo do estudante</strong>,
                                    acessível pelo módulo PEI principal.
                                </p>
                                <a
                                    href={`/pei?studentId=${selectedAluno.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold transition-colors"
                                    style={{ color: '#818cf8' }}
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
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                {/* Header do aluno */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedAluno(null)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedAluno.name}</h3>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {selectedAluno.grade} {selectedAluno.class_group && `— ${selectedAluno.class_group}`}
                                {selectedAluno.diagnostico && ` · ${selectedAluno.diagnostico}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pipeline por disciplina */}
                <div className="p-6 space-y-4">
                    <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
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
                                className="rounded-xl overflow-hidden transition-all"
                                style={{ border: `1px solid ${step.border}`, backgroundColor: step.bg }}
                            >
                                {/* Header da disciplina */}
                                <div className="px-5 py-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {step.icon}
                                        <div>
                                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                {disc.disciplina}
                                            </span>
                                            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                                                {disc.professor_regente_nome}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badge nível */}
                                    {disc.nivel_omnisfera !== null && (
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{ backgroundColor: 'rgba(99,102,241,.12)', color: '#818cf8' }}>
                                            N{disc.nivel_omnisfera} — {ESCALA_OMNISFERA[disc.nivel_omnisfera as NivelOmnisfera]?.label || ""}
                                        </span>
                                    )}
                                </div>

                                {/* Pipeline steps */}
                                <div className="px-5 pb-4 flex items-center gap-2">
                                    {steps.map((s, i) => (
                                        <React.Fragment key={s.key}>
                                            <button
                                                onClick={() => { setSelectedDisc(disc); setActiveStep(s.key); }}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                                style={{
                                                    backgroundColor: s.done
                                                        ? 'rgba(16,185,129,.12)'
                                                        : s.active
                                                            ? 'rgba(99,102,241,.12)'
                                                            : 'var(--bg-tertiary)',
                                                    color: s.done ? '#10b981' : s.active ? '#818cf8' : 'var(--text-muted)',
                                                    border: s.active ? '1px solid rgba(99,102,241,.3)' : '1px solid var(--border-default)',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                            >
                                                {s.done ? <CheckCircle2 size={13} /> : i === 0 ? <FileText size={13} /> : i === 1 ? <Brain size={13} /> : <ClipboardCheck size={13} />}
                                                {s.label}
                                            </button>
                                            {i < steps.length - 1 && (
                                                <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
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
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            {/* Onboarding Panel */}
            {showOnboarding && (
                <div style={{ padding: '24px 24px 0' }}>
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
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {data.professor.is_master ? "Visão Geral — Todos os Estudantes" : `Meus Estudantes`}
                            </h3>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {data.professor.name} · {data.alunos.length} estudante{data.alunos.length !== 1 ? "s" : ""} em Fase 2
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Lista de alunos como cards */}
            <div className="p-6 space-y-3">
                {data.alunos.map((aluno) => {
                    const totalDisc = aluno.disciplinas.length;
                    const concluidas = aluno.disciplinas.filter(d => d.fase_status === "concluido").length;
                    const progress = totalDisc > 0 ? Math.round((concluidas / totalDisc) * 100) : 0;

                    return (
                        <div
                            key={aluno.id}
                            onClick={() => setSelectedAluno(aluno)}
                            className="rounded-xl p-4 cursor-pointer transition-all"
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-default)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(16,185,129,.4)';
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(16,185,129,.08)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border-default)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                        {aluno.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {aluno.name}
                                        </span>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {aluno.grade} {aluno.class_group && `— ${aluno.class_group}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className="text-xs font-bold" style={{ color: progress === 100 ? '#10b981' : 'var(--text-muted)' }}>
                                            {concluidas}/{totalDisc}
                                        </span>
                                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>disciplinas</p>
                                    </div>
                                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                </div>
                            </div>

                            {/* Mini pipeline */}
                            <div className="flex gap-1.5 mt-2">
                                {aluno.disciplinas.map((d) => {
                                    const stepColor = STEP_COLORS[d.fase_status];
                                    return (
                                        <span
                                            key={d.id}
                                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                            style={{ backgroundColor: stepColor.bg, color: stepColor.text, border: `1px solid ${stepColor.border}` }}
                                            title={`${d.disciplina}: ${FASE_STATUS_LABELS[d.fase_status]}`}
                                        >
                                            {d.disciplina.length > 12 ? d.disciplina.slice(0, 10) + "…" : d.disciplina}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", display: "inline-flex" }}
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{
                        background: finalizando ? "#94a3b8" : "linear-gradient(135deg, #059669, #10b981)",
                        display: "inline-flex",
                    }}
                >
                    <CheckCircle2 size={14} />
                    Finalizar e devolver ao especialista
                </button>
            ) : (
                <div className="p-4 rounded-xl space-y-3" style={{
                    border: '2px solid rgba(16,185,129,.2)',
                    background: 'rgba(16,185,129,.03)',
                }}>
                    <p className="text-xs font-bold" style={{ color: '#059669' }}>
                        📝 Devolutiva para o Especialista (opcional)
                    </p>
                    <textarea
                        value={feedbackProfessor}
                        onChange={(e) => setFeedbackProfessor(e.target.value)}
                        placeholder="Observações sobre o estudante nesta disciplina, dificuldades percebidas, sugestões de adaptação, etc."
                        rows={3}
                        className="w-full p-3 rounded-lg text-sm resize-none"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)',
                        }}
                    />
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleFinalizar}
                            disabled={finalizando}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                            style={{
                                background: finalizando ? "#94a3b8" : "linear-gradient(135deg, #059669, #10b981)",
                            }}
                        >
                            {finalizando ? <OmniLoader engine="green" size={14} /> : <CheckCircle2 size={14} />}
                            {finalizando ? "Finalizando..." : "Confirmar e devolver"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFeedback(false)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
            {erro && <span className="text-xs text-red-400">{erro}</span>}
            <span className="text-[10px] text-slate-500">
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

    // Auto-advance fase_status when diagnóstica is applied
    useEffect(() => {
        if (avaliacao?.status === "aplicada" && onLinked) {
            // Notify parent so it can refresh data (status advance happens via polling)
            onLinked();
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                borderRadius: 14, padding: "18px 22px", color: "#fff",
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Brain size={22} />
                        <div>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Avaliação Diagnóstica — {disciplina}</h4>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
                                {studentName} · Vincule uma avaliação aplicada no módulo Avaliação Diagnóstica
                            </p>
                        </div>
                    </div>
                    {avaliacao?.status === "aplicada" && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#bbf7d0" }}>
                            <CheckCircle2 size={14} /> Aplicada
                        </span>
                    )}
                </div>
            </div>

            {/* Resultado vinculado */}
            {avaliacao?.status === "aplicada" && avaliacao.nivel !== null && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                    borderRadius: 14, background: "rgba(16,185,129,.08)", border: "1.5px solid rgba(16,185,129,.3)",
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center",
                        justifyContent: "center", background: "linear-gradient(135deg, #059669, #10b981)",
                        color: "#fff", fontSize: 20, fontWeight: 800,
                    }}>{avaliacao.nivel}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#10b981" }}>
                            Nível Omnisfera: {avaliacao.nivel} — {ESCALA_OMNISFERA[avaliacao.nivel as NivelOmnisfera]?.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                            {avaliacao.questoes} questões · {new Date(avaliacao.updated_at).toLocaleDateString("pt-BR")}
                        </div>
                    </div>
                </div>
            )}

            {/* Status: gerada mas não aplicada */}
            {avaliacao && avaliacao.status !== "aplicada" && (
                <div style={{
                    padding: "16px 20px", borderRadius: 14,
                    background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#f59e0b" }}>Avaliação gerada, pendente de aplicação</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                            {avaliacao.questoes} questões · Aplique no módulo Avaliação Diagnóstica
                        </div>
                    </div>
                    <a href="/avaliacao-diagnostica" style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "#fff", textDecoration: "none",
                    }}>
                        <ExternalLink size={14} /> Aplicar
                    </a>
                </div>
            )}

            {/* Nenhuma avaliação */}
            {!avaliacao && (
                <div style={{
                    textAlign: "center", padding: "32px 20px",
                    borderRadius: 14, border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                }}>
                    <Brain size={40} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.3 }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>
                        Nenhuma avaliação diagnóstica encontrada
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
                        Gere e aplique uma avaliação no módulo <strong>Avaliação Diagnóstica</strong> para {studentName} em {disciplina}.
                    </p>
                    <a href="/avaliacao-diagnostica" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                        color: "#fff", textDecoration: "none",
                    }}>
                        <ExternalLink size={16} /> Ir para Avaliação Diagnóstica
                    </a>
                </div>
            )}
        </div>
    );
}
