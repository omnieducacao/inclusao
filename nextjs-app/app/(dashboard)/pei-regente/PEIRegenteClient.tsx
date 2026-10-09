"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BookOpen, AlertTriangle, ChevronRight,
    FileText, Brain, ClipboardCheck, CheckCircle2, ArrowLeft,
    Sparkles, School, ExternalLink, Target, RotateCcw,
    BarChart3, Ruler, Accessibility, PencilLine, Save,
    type LucideIcon,
} from "lucide-react";
import { useConfirmar } from "@/components/Confirmar";
import { OmniLoader } from "@/components/OmniLoader";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PEIPlanoEnsino } from "@/components/PEIPlanoEnsino";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { OnboardingPanel, OnboardingResetButton } from "@/components/OnboardingPanel";
import { iniciais } from "@/lib/inicio";
import { ESCALA_OMNISFERA, FASE_STATUS_LABELS, type NivelOmnisfera, type FaseStatusPEIDisciplina } from "@/lib/omnisfera-types";
import { FinalizarPeiDisciplinaButton, PEIAvaliacaoDiagnosticaLink } from "./components/PEIDisciplinaActions";

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
    devolutiva?: { texto: string; em: string | null; por: string | null; lida_em: string | null } | null;
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
// Onda 18: cada fase vira um selo omni-estado + um ícone (sem classes de cor)

const FASE_VISUAL: Record<FaseStatusPEIDisciplina, { estado: "neutro" | "info" | "sucesso"; Icone: LucideIcon }> = {
    plano_ensino: { estado: "neutro", Icone: FileText },
    diagnostica: { estado: "info", Icone: Brain },
    pei_disciplina: { estado: "info", Icone: ClipboardCheck },
    concluido: { estado: "sucesso", Icone: CheckCircle2 },
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
    }, []);

    // Ponte Pedagógica state
    const [gerandoAdaptacao, setGerandoAdaptacao] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adaptacaoSugestao, setAdaptacaoSugestao] = useState<Record<string, any> | null>(null);
    const [adaptacaoMeta, setAdaptacaoMeta] = useState<{ plano_encontrado: boolean; nivel_diag: number | null } | null>(null);
    const [versionSaveStatus, setVersionSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [transitioning, setTransitioning] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const { confirmar, dialogo } = useConfirmar();

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
                    setToast("Adaptação anterior carregada.");
                    setTimeout(() => setToast(null), 2500);
                }
            })
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, selectedAluno?.id, selectedDisc?.disciplina]);

    // ─── Loading / Erro ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="omni-cartao" style={{ alignItems: "center", padding: 48 }}>
                <OmniLoader variant="card" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                <AlertTriangle className="omni-aviso__icone" aria-hidden />
                <div>
                    <div className="omni-aviso__titulo">Não foi possível carregar as disciplinas</div>
                    <div className="omni-aviso__texto">{error}</div>
                    <div className="omni-aviso__acoes">
                        <button type="button" onClick={fetchData} className="omni-btn omni-btn--secundario omni-btn--pequeno">
                            <RotateCcw size={16} aria-hidden /> Tentar de novo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data?.alunos?.length) {
        return (
            <div className="omni-vazio">
                <School size={40} aria-hidden style={{ color: "var(--tinta-3)" }} />
                <h3 className="omni-vazio__titulo">Nenhum estudante na Fase 2</h3>
                <p className="omni-vazio__texto">
                    {data?.professor?.is_master
                        ? "Nenhum PEI foi enviado aos professores ainda. Finalize um PEI no módulo PEI e use \"Enviar aos professores\"."
                        : "Aguarde o envio do PEI pelo profissional do AEE ou pela coordenação."}
                </p>
            </div>
        );
    }

    // ─── Área de Trabalho (step ativo) ────────────────────────────────────────

    const avisoToast = toast && (
        <div className="omni-aviso omni-aviso--sucesso" role="status"
            style={{ position: "absolute", top: 12, right: 12, zIndex: 50, maxWidth: 380, boxShadow: "var(--sombra-2)" }}>
            <CheckCircle2 className="omni-aviso__icone" aria-hidden />
            <div><div className="omni-aviso__texto" style={{ marginTop: 0, color: "var(--tinta)" }}>{toast}</div></div>
        </div>
    );

    const resumoDetalhe: React.CSSProperties = {
        cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        font: "700 15px/22px var(--font-sans)", color: "var(--tinta)",
    };

    if (selectedAluno && selectedDisc && activeStep) {
        return (
            <div className="omni-cartao" style={{ position: "relative", padding: 0, gap: 0, overflow: "hidden" }}>
                {avisoToast}
                {/* Transitioning overlay */}
                {transitioning && (
                    <div role="status" aria-live="polite"
                        style={{ position: "absolute", inset: 0, zIndex: 40, display: "grid", placeItems: "center", background: "color-mix(in srgb, var(--superficie) 80%, transparent)" }}>
                        <div style={{ textAlign: "center" }}>
                            <OmniLoader variant="card" />
                            <p className="omni-apoio" style={{ marginTop: 8, fontWeight: 700 }}>Passando para a próxima etapa…</p>
                        </div>
                    </div>
                )}
                {/* Header com breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--borda)", background: "var(--superficie-2)" }}>
                    <button
                        type="button"
                        onClick={() => { setActiveStep(null); setSelectedDisc(null); }}
                        className="omni-btn omni-btn--discreto omni-btn--icone omni-btn--pequeno"
                        aria-label="Voltar para as disciplinas"
                    >
                        <ArrowLeft size={18} aria-hidden />
                    </button>
                    <nav aria-label="Onde você está" className="omni-apoio" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 14 }}>
                        <span>{selectedAluno.name}</span>
                        <ChevronRight size={14} aria-hidden />
                        <span style={{ color: "var(--tinta)", fontWeight: 700 }}>{selectedDisc.disciplina}</span>
                        <ChevronRight size={14} aria-hidden />
                        <span className={`omni-estado omni-estado--${FASE_VISUAL[selectedDisc.fase_status]?.estado || "neutro"}`} aria-current="page">
                            {activeStep === "plano" ? "Plano de ensino"
                                : activeStep === "diagnostica" ? "Avaliação diagnóstica"
                                    : "PEI da disciplina"}
                        </span>
                    </nav>
                </div>

                <div style={{ padding: 20 }}>
                    {activeStep === "plano" && !selectedAluno.grade && (
                        <div className="omni-aviso omni-aviso--atencao" role="status" style={{ maxWidth: "none", marginBottom: 16 }}>
                            <AlertTriangle className="omni-aviso__icone" aria-hidden />
                            <div>
                                <div className="omni-aviso__titulo">A série/ano do estudante não está cadastrada</div>
                                <div className="omni-aviso__texto">
                                    O plano será buscado com um valor padrão. Atualize o cadastro do estudante para um resultado mais preciso.
                                </div>
                            </div>
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
                                        setToast("Plano vinculado. Próxima etapa: avaliação diagnóstica.");
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
                                    setToast("Avaliação diagnóstica aplicada. Próxima etapa: PEI da disciplina.");
                                    setTimeout(() => setToast(null), 3000);
                                }
                                await fetchData();
                                setTransitioning(false);
                            }}
                        />
                    )}

                    {activeStep === "pei" && (
                        <div style={{ display: "grid", gap: 20 }}>
                            {/* Título */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <ClipboardCheck size={20} aria-hidden style={{ color: "var(--acao)" }} />
                                <h3 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>
                                    PEI da disciplina — {selectedDisc.disciplina}
                                </h3>
                            </div>

                            {/* ── PEI Geral (PEI 1) — expandível ── */}
                            {selectedAluno.pei_geral && Object.keys(selectedAluno.pei_geral).length > 1 && (
                                <details className="omni-cartao omni-cartao--plano" style={{ padding: "14px 18px" }}>
                                    <summary style={resumoDetalhe}>
                                        <FileText size={16} aria-hidden style={{ color: "var(--acao)" }} />
                                        PEI geral do estudante
                                        <span className="omni-estado omni-estado--info" style={{ marginLeft: "auto" }}>
                                            Informações gerais
                                        </span>
                                    </summary>
                                    <div style={{ paddingTop: 8 }}>
                                        <PEISummaryPanel
                                            peiData={selectedAluno.pei_geral}
                                            studentName={selectedAluno.name}
                                        />
                                    </div>
                                </details>
                            )}

                            {/* ── BNCC do Especialista (read-only) ── */}
                            {selectedAluno.habilidades_bncc?.length > 0 && (
                                <details className="omni-cartao omni-cartao--plano" style={{ padding: "14px 18px" }}>
                                    <summary style={resumoDetalhe}>
                                        <BookOpen size={16} aria-hidden style={{ color: "var(--sucesso)" }} />
                                        Habilidades da BNCC escolhidas pelo especialista
                                        <span className="omni-estado omni-estado--sucesso" style={{ marginLeft: "auto" }}>
                                            {(() => {
                                                const disc = selectedDisc.disciplina.toLowerCase();
                                                const filtered = selectedAluno.habilidades_bncc.filter(h =>
                                                    !h.disciplina || h.disciplina.toLowerCase().includes(disc)
                                                );
                                                return filtered.length > 0
                                                    ? `${filtered.length} da sua disciplina`
                                                    : `${selectedAluno.habilidades_bncc.length} no total`;
                                            })()}
                                        </span>
                                    </summary>
                                    <ul style={{ listStyle: "none", margin: 0, padding: "8px 0 0", display: "grid", gap: 6 }}>
                                        {selectedAluno.habilidades_bncc.map((h, i) => {
                                            const disc = selectedDisc.disciplina.toLowerCase();
                                            const isMyDisc = !h.disciplina || h.disciplina.toLowerCase().includes(disc);
                                            return (
                                                <li key={i} style={{
                                                    display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
                                                    borderRadius: "var(--o-radius-md)", font: "400 14px/20px var(--font-sans)",
                                                    background: isMyDisc ? "var(--superficie)" : "transparent",
                                                    border: `1px solid ${isMyDisc ? "var(--borda)" : "transparent"}`,
                                                    color: isMyDisc ? "var(--tinta-2)" : "var(--tinta-3)",
                                                }}>
                                                    {h.codigo && (
                                                        <span className="omni-estado omni-estado--sucesso" style={{ flex: "none" }}>{h.codigo}</span>
                                                    )}
                                                    <span style={{ flex: 1 }}>
                                                        {h.habilidade || h.objeto_conhecimento || String(h.codigo || `Habilidade ${i + 1}`)}
                                                    </span>
                                                    {h.disciplina && (
                                                        <span className="omni-rotulo" style={{ flex: "none" }}>
                                                            {h.disciplina}
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </details>
                            )}

                            {/* EI Objetivos */}
                            {selectedAluno.bncc_ei_objetivos?.length > 0 && (
                                <details className="omni-cartao omni-cartao--plano" style={{ padding: "14px 18px" }}>
                                    <summary style={resumoDetalhe}>
                                        <BookOpen size={16} aria-hidden style={{ color: "var(--info)" }} />
                                        Objetivos da Educação Infantil (BNCC, campos de experiência)
                                        <span className="omni-estado omni-estado--info" style={{ marginLeft: "auto" }}>
                                            {selectedAluno.bncc_ei_objetivos.length}
                                        </span>
                                    </summary>
                                    <ul style={{ margin: 0, padding: "8px 0 0 20px", display: "grid", gap: 4, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                                        {selectedAluno.bncc_ei_objetivos.map((obj, i) => (
                                            <li key={i}>{obj}</li>
                                        ))}
                                    </ul>
                                </details>
                            )}

                            {/* ── Ponte Pedagógica: Plano de ensino + Diagnóstica → PEI ── */}
                            <section className="omni-cartao" aria-labelledby="metas-bimestre" style={{ gap: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Target size={18} aria-hidden style={{ color: "var(--acao)" }} />
                                    <h4 id="metas-bimestre" className="omni-cartao__titulo" style={{ margin: 0 }}>
                                        Metas do bimestre para a disciplina
                                    </h4>
                                </div>
                                <p className="omni-cartao__texto" style={{ margin: 0 }}>
                                    A Omnisfera cruza o <strong>plano de ensino da turma</strong> com o <strong>nível do estudante</strong> na avaliação diagnóstica,
                                    e com as barreiras e potencialidades, para sugerir adaptações só para este estudante.
                                </p>

                                {/* IA Button */}
                                <div>
                                    <button
                                        type="button"
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
                                        aria-busy={gerandoAdaptacao}
                                        className="omni-btn omni-btn--primario"
                                    >
                                        {gerandoAdaptacao ? <OmniLoader engine="red" size={16} /> : <Sparkles size={16} aria-hidden />}
                                        {gerandoAdaptacao ? "Preparando as adaptações…" : (adaptacaoSugestao ? "Sugerir de novo" : "Sugerir adaptações")}
                                    </button>
                                </div>

                                {/* Result */}
                                {adaptacaoSugestao && (
                                    <div style={{ display: "grid", gap: 12 }}>
                                        {/* Meta badges */}
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {adaptacaoMeta?.nivel_diag != null && (
                                                <span className="omni-estado omni-estado--info">
                                                    <BarChart3 aria-hidden /> Nível na diagnóstica: {adaptacaoMeta.nivel_diag}
                                                </span>
                                            )}
                                            <span className={`omni-estado omni-estado--${adaptacaoMeta?.plano_encontrado ? "sucesso" : "atencao"}`}>
                                                Plano de ensino: {adaptacaoMeta?.plano_encontrado ? "encontrado" : "não encontrado"}
                                            </span>
                                        </div>

                                        {/* Resumo */}
                                        {adaptacaoSugestao.resumo_adaptacao && (
                                            <p className="omni-cartao__texto" style={{ margin: 0 }}>
                                                {String(adaptacaoSugestao.resumo_adaptacao)}
                                            </p>
                                        )}

                                        {/* Objetivos individualizados + Rubrica */}
                                        {adaptacaoSugestao.objetivos_individualizados && (
                                            <div className="omni-cartao omni-cartao--plano" style={{ padding: 14, gap: 6 }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                                                    <p className="omni-rotulo" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                        <Target size={14} aria-hidden /> Objetivos para este estudante
                                                    </p>
                                                    {adaptacaoMeta?.nivel_diag != null && (
                                                        <span className={`omni-estado omni-estado--${adaptacaoMeta.nivel_diag >= 3 ? "sucesso" : adaptacaoMeta.nivel_diag >= 2 ? "info" : "atencao"}`}>
                                                            N{adaptacaoMeta.nivel_diag} — {ESCALA_OMNISFERA[adaptacaoMeta.nivel_diag as NivelOmnisfera]?.label || ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="omni-cartao__texto" style={{ margin: 0 }}>
                                                    {String(adaptacaoSugestao.objetivos_individualizados)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Habilidades prioritárias */}
                                        {(adaptacaoSugestao.habilidades_prioritarias || []).length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} aria-label="Habilidades prioritárias">
                                                {(adaptacaoSugestao.habilidades_prioritarias as string[]).map((h: string, i: number) => (
                                                    <span key={i} className="omni-estado omni-estado--neutro">
                                                        {h}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Metodologia */}
                                        {adaptacaoSugestao.metodologia_adaptada && (
                                            <div className="omni-cartao omni-cartao--plano" style={{ padding: 14, gap: 6 }}>
                                                <p className="omni-rotulo" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                    <Ruler size={14} aria-hidden /> Como ensinar
                                                </p>
                                                <p className="omni-cartao__texto" style={{ margin: 0 }}>
                                                    {String(adaptacaoSugestao.metodologia_adaptada)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Estratégias cards */}
                                        {(adaptacaoSugestao.estrategias_acesso?.length || adaptacaoSugestao.estrategias_ensino?.length || adaptacaoSugestao.estrategias_avaliacao?.length) && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {adaptacaoSugestao.estrategias_acesso?.length > 0 && (
                                                    <div className="omni-cartao omni-cartao--plano" style={{ padding: 14, gap: 6 }}>
                                                        <p className="omni-rotulo" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                            <Accessibility size={14} aria-hidden /> Acesso
                                                        </p>
                                                        <ul style={{ margin: 0, paddingLeft: 18, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                                                            {(adaptacaoSugestao.estrategias_acesso as string[]).map((e: string, i: number) => (
                                                                <li key={i}>{e}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {adaptacaoSugestao.estrategias_ensino?.length > 0 && (
                                                    <div className="omni-cartao omni-cartao--plano" style={{ padding: 14, gap: 6 }}>
                                                        <p className="omni-rotulo" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                            <BookOpen size={14} aria-hidden /> Ensino
                                                        </p>
                                                        <ul style={{ margin: 0, paddingLeft: 18, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                                                            {(adaptacaoSugestao.estrategias_ensino as string[]).map((e: string, i: number) => (
                                                                <li key={i}>{e}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {adaptacaoSugestao.estrategias_avaliacao?.length > 0 && (
                                                    <div className="omni-cartao omni-cartao--plano" style={{ padding: 14, gap: 6 }}>
                                                        <p className="omni-rotulo" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                            <PencilLine size={14} aria-hidden /> Avaliação
                                                        </p>
                                                        <ul style={{ margin: 0, paddingLeft: 18, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                                                            {(adaptacaoSugestao.estrategias_avaliacao as string[]).map((e: string, i: number) => (
                                                                <li key={i}>{e}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Alerts */}
                                        {(adaptacaoSugestao.alertas || []).length > 0 && (
                                            <div className="omni-aviso omni-aviso--atencao" style={{ maxWidth: "none" }}>
                                                <AlertTriangle className="omni-aviso__icone" aria-hidden />
                                                <div>
                                                    <div className="omni-aviso__titulo">Pontos de atenção</div>
                                                    <ul className="omni-aviso__texto" style={{ margin: "2px 0 0", paddingLeft: 18 }}>
                                                        {(adaptacaoSugestao.alertas as string[]).map((a: string, i: number) => (
                                                            <li key={i}>{a}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                                            <a
                                                href={`/pei?student=${selectedAluno.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="omni-btn omni-btn--secundario"
                                            >
                                                <ExternalLink size={16} aria-hidden />
                                                Abrir o PEI completo
                                                <span className="omni-so-leitor"> (abre em nova aba)</span>
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
                                                type="button"
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
                                                aria-busy={versionSaveStatus === 'saving'}
                                                className="omni-btn omni-btn--discreto"
                                            >
                                                {versionSaveStatus === 'saved' ? <CheckCircle2 size={16} aria-hidden />
                                                    : versionSaveStatus === 'error' ? <AlertTriangle size={16} aria-hidden />
                                                        : <Save size={16} aria-hidden />}
                                                {versionSaveStatus === 'saving' ? 'Guardando…'
                                                    : versionSaveStatus === 'saved' ? 'Versão guardada'
                                                        : versionSaveStatus === 'error' ? 'Não deu para guardar. Tente de novo'
                                                            : 'Guardar uma versão do PEI'}
                                            </button>
                                            <span className="omni-so-leitor" role="status">
                                                {versionSaveStatus === 'saved' ? 'Versão do PEI guardada.' : versionSaveStatus === 'error' ? 'Não foi possível guardar a versão.' : ''}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Info about full PEI */}
                            <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 6 }}>
                                <p className="omni-apoio" style={{ margin: 0 }}>
                                    As adaptações sugeridas acima podem ser aplicadas no <strong>PEI completo do estudante</strong>,
                                    no módulo PEI.
                                </p>
                                <a
                                    href={`/pei?student=${selectedAluno.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "700 14px/20px var(--font-sans)", color: "var(--acao)" }}
                                >
                                    <ExternalLink size={14} aria-hidden /> Ir para o PEI completo
                                    <span className="omni-so-leitor"> (abre em nova aba)</span>
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
            <div className="omni-cartao" style={{ position: "relative", padding: 0, gap: 0, overflow: "hidden" }}>
                {dialogo}
                {avisoToast}
                {/* Header do aluno */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--borda)", background: "var(--superficie-2)" }}>
                    <button
                        type="button"
                        onClick={() => setSelectedAluno(null)}
                        className="omni-btn omni-btn--discreto omni-btn--icone omni-btn--pequeno"
                        aria-label="Voltar para a lista de estudantes"
                    >
                        <ArrowLeft size={18} aria-hidden />
                    </button>
                    <div>
                        <h3 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>{selectedAluno.name}</h3>
                        <p className="omni-apoio" style={{ margin: 0, fontSize: 14 }}>
                            {[selectedAluno.grade, selectedAluno.class_group].filter(Boolean).join(" · ")}
                            {/* Onda 5: o diagnóstico não aparece ao lado do nome */}
                        </p>
                    </div>
                </div>

                {/* Pipeline por disciplina */}
                <div style={{ padding: 20, display: "grid", gap: 14 }}>
                    <h4 className="omni-rotulo" style={{ margin: 0 }}>
                        Disciplinas ({selectedAluno.disciplinas.length})
                    </h4>

                    {selectedAluno.disciplinas.map((disc) => {
                        const step = FASE_VISUAL[disc.fase_status] || FASE_VISUAL.plano_ensino;
                        const steps: Array<{ key: "plano" | "diagnostica" | "pei"; label: string; done: boolean; active: boolean }> = [
                            { key: "plano", label: "Plano de ensino", done: disc.has_plano, active: disc.fase_status === "plano_ensino" },
                            { key: "diagnostica", label: "Avaliação diagnóstica", done: disc.has_avaliacao && disc.avaliacao_status === "aplicada", active: disc.fase_status === "diagnostica" },
                            { key: "pei", label: "PEI da disciplina", done: disc.fase_status === "concluido", active: disc.fase_status === "pei_disciplina" },
                        ];
                        const FaseIcone = step.Icone;

                        return (
                            <section
                                key={disc.id}
                                className="omni-cartao omni-cartao--plano"
                                aria-label={`${disc.disciplina}: ${FASE_STATUS_LABELS[disc.fase_status]}`}
                                style={{ padding: 0, gap: 0 }}
                            >
                                {/* Header da disciplina */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                        <FaseIcone size={18} aria-hidden style={{ color: "var(--tinta-3)" }} />
                                        <span style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
                                            {disc.disciplina}
                                        </span>
                                        <span className="omni-apoio" style={{ fontSize: 14 }}>
                                            {disc.professor_regente_nome}
                                        </span>
                                        <span className={`omni-estado omni-estado--${step.estado}`}>
                                            {FASE_STATUS_LABELS[disc.fase_status]}
                                        </span>
                                    </div>

                                    {/* Badge nível */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {disc.nivel_omnisfera !== null && (
                                            <span className="omni-estado omni-estado--info">
                                                N{disc.nivel_omnisfera} — {ESCALA_OMNISFERA[disc.nivel_omnisfera as NivelOmnisfera]?.label || ""}
                                            </span>
                                        )}
                                        {/* Reset discipline button */}
                                        {!disc.is_virtual && disc.fase_status !== 'concluido' && (
                                            <button
                                                type="button"
                                                title={`Recomeçar ${disc.disciplina}`}
                                                aria-label={`Recomeçar o PEI de ${disc.disciplina}`}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!(await confirmar({
                                                        titulo: `Recomeçar o PEI de ${disc.disciplina}?`,
                                                        texto: "Isso apaga o progresso desta disciplina (plano vinculado e adaptações). A avaliação diagnóstica não é afetada.",
                                                        acao: "Recomeçar",
                                                        cancelar: "Manter",
                                                        perigo: true,
                                                    }))) return;
                                                    try {
                                                        await fetch(`/api/pei/disciplina?id=${disc.id}`, { method: 'DELETE' });
                                                        setToast(`O PEI de ${disc.disciplina} foi recomeçado.`);
                                                        setTimeout(() => setToast(null), 3000);
                                                        fetchData();
                                                    } catch { /* silent */ }
                                                }}
                                                className="omni-btn omni-btn--discreto omni-btn--icone omni-btn--pequeno"
                                            >
                                                <RotateCcw size={16} aria-hidden />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Onda 16: devolutiva da coordenação */}
                                {disc.devolutiva && (
                                    <div className={`omni-aviso ${disc.devolutiva.lida_em ? "omni-aviso--info" : "omni-aviso--atencao"}`} role="status" style={{ maxWidth: "none", margin: "0 20px 12px" }}>
                                        <div>
                                            <div className="omni-aviso__titulo">
                                                {disc.devolutiva.por ? `${disc.devolutiva.por} devolveu ${disc.disciplina}` : `A coordenação devolveu ${disc.disciplina}`}
                                                {disc.devolutiva.em ? ` em ${new Date(disc.devolutiva.em).toLocaleDateString("pt-BR")}` : ""}
                                            </div>
                                            <div className="omni-aviso__texto">{disc.devolutiva.texto}</div>
                                            {!disc.devolutiva.lida_em && (
                                                <div className="omni-aviso__acoes">
                                                    <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno"
                                                        onClick={async () => {
                                                            await fetch("/api/pei/disciplina", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: disc.id, devolutiva_lida: true }) }).catch(() => null);
                                                            fetchData();
                                                        }}>
                                                        Entendi, vou rever
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Pipeline steps */}
                                <ol style={{ listStyle: "none", margin: 0, padding: "0 20px 16px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                    {steps.map((s, i) => (
                                        <li key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedDisc(disc); setActiveStep(s.key); }}
                                                className={`omni-btn omni-btn--pequeno ${s.active ? "omni-btn--primario" : "omni-btn--secundario"}`}
                                                aria-current={s.active ? "step" : undefined}
                                            >
                                                {s.done ? <CheckCircle2 size={16} aria-hidden style={{ color: s.active ? undefined : "var(--sucesso)" }} /> : i === 0 ? <FileText size={16} aria-hidden /> : i === 1 ? <Brain size={16} aria-hidden /> : <ClipboardCheck size={16} aria-hidden />}
                                                {s.label}
                                                {s.done && <span className="omni-so-leitor"> (feito)</span>}
                                            </button>
                                            {i < steps.length - 1 && (
                                                <ChevronRight size={14} aria-hidden style={{ color: "var(--tinta-3)" }} />
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── Lista de Alunos ──────────────────────────────────────────────────────

    // Onda 13: lista no design system; quem tem mais disciplinas por fazer vem primeiro
    const alunosOrdenados = [...data.alunos].sort((x, y) => {
        const falta = (al: typeof x) => al.disciplinas.filter((d) => d.fase_status !== "concluido").length;
        return falta(y) - falta(x) || x.name.localeCompare(y.name, "pt-BR");
    });
    return (
        <section className="space-y-4" aria-labelledby="disc-titulo">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="disc-titulo" style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>
                        {data.professor.is_master ? "Todas as disciplinas, por estudante" : "Sua parte em cada PEI"}
                    </h2>
                    <p className="omni-apoio" style={{ margin: "2px 0 0", maxWidth: "65ch" }}>
                        Para cada disciplina: plano de ensino, avaliação diagnóstica e as adaptações da disciplina no PEI. {data.alunos.length} estudante{data.alunos.length !== 1 ? "s" : ""} com o PEI já enviado aos professores.
                    </p>
                </div>
                <button type="button" onClick={fetchData} className="omni-btn omni-btn--discreto omni-btn--pequeno">Atualizar</button>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                {alunosOrdenados.map((aluno) => {
                    const totalDisc = aluno.disciplinas.length;
                    const concluidas = aluno.disciplinas.filter(d => d.fase_status === "concluido").length;
                    return (
                        <li key={aluno.id}>
                            <button type="button" onClick={() => setSelectedAluno(aluno)} className="omni-cartao omni-cartao--plano"
                                style={{ width: "100%", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}>
                                <span className="flex items-center justify-between gap-3" style={{ width: "100%" }}>
                                    <span className="flex items-center gap-3">
                                        <span className="omni-avatar" aria-hidden style={{ background: "var(--encontro-azul-suave)", color: "var(--encontro-azul-forte)" }}>
                                            {iniciais(aluno.name)}
                                        </span>
                                        <span>
                                            <span style={{ display: "block", font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{aluno.name}</span>
                                            <span className="omni-apoio" style={{ fontSize: 14 }}>{[aluno.grade, aluno.class_group].filter(Boolean).join(" · ")}</span>
                                        </span>
                                    </span>
                                    <span className={`omni-estado omni-estado--${concluidas === totalDisc && totalDisc > 0 ? "sucesso" : "neutro"}`}>
                                        {concluidas} de {totalDisc} disciplina{totalDisc !== 1 ? "s" : ""}
                                    </span>
                                </span>
                                <span className="flex flex-wrap gap-1.5">
                                    {aluno.disciplinas.map((d) => (
                                        <span key={d.id} className={`omni-estado omni-estado--${d.fase_status === "concluido" ? "sucesso" : d.fase_status === "plano_ensino" ? "neutro" : "info"}`}
                                            title={`${d.disciplina}: ${FASE_STATUS_LABELS[d.fase_status]}`}>
                                            {d.disciplina} · {FASE_STATUS_LABELS[d.fase_status]}
                                        </span>
                                    ))}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

