"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Users, Loader2, AlertTriangle, ChevronRight,
    FileText, Brain, ClipboardCheck, CheckCircle2, ArrowLeft,
    Sparkles, School,
} from "lucide-react";
import { PEIPlanoEnsino } from "@/components/PEIPlanoEnsino";
import { PEIAvaliacaoDiagnostica } from "@/components/PEIAvaliacaoDiagnostica";
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
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#10b981' }} />
                <p style={{ color: 'var(--text-muted)' }}>Carregando seus estudantes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                <div className="flex items-center gap-3 mb-4" style={{ color: '#f87171' }}>
                    <AlertTriangle size={24} />
                    <span className="font-semibold">{error}</span>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!data?.alunos?.length) {
        return (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                <School size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Nenhum estudante em Fase 2
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                {/* Header com breadcrumb */}
                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)' }}>
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
                            onPlanoSaved={() => {
                                fetchData();
                            }}
                        />
                    )}

                    {activeStep === "diagnostica" && (
                        <PEIAvaliacaoDiagnostica
                            studentId={selectedAluno.id}
                            disciplina={selectedDisc.disciplina}
                            onAvaliacaoConcluida={() => {
                                fetchData();
                            }}
                        />
                    )}

                    {activeStep === "pei" && (
                        <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                            <ClipboardCheck size={48} className="mx-auto mb-4" style={{ opacity: 0.4 }} />
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                PEI por Disciplina — {selectedDisc.disciplina}
                            </h3>
                            <p className="text-sm">
                                Elabore adaptações curriculares, metas SMART e estratégias específicas
                                para este componente com base na avaliação diagnóstica realizada.
                            </p>
                            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                                (Formulário completo de PEI por disciplina será implementado na próxima iteração)
                            </p>
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
