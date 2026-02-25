"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Brain, Loader2, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, Sparkles, ClipboardCheck,
    ArrowLeft, Users, BookOpen, Target, Zap,
} from "lucide-react";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Aluno {
    id: string;
    name: string;
    grade: string;
    class_group: string;
    diagnostico: string;
    disciplinas: {
        id: string;
        disciplina: string;
        professor_regente_nome: string;
        has_avaliacao: boolean;
        nivel_omnisfera: number | null;
        avaliacao_status: string;
    }[];
}

interface Questao {
    id: string;
    enunciado: string;
    alternativas: { A: string; B: string; C: string; D: string };
    gabarito: string;
    justificativa_pedagogica: string;
    instrucao_aplicacao_professor: string;
    contexto_visual_sugerido?: string | null;
    adaptacao_nee_aplicada?: string;
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

export default function AvaliacaoDiagnosticaClient() {
    const [loading, setLoading] = useState(true);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [professorName, setProfessorName] = useState("");
    const [error, setError] = useState("");

    // Navigation
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<string | null>(null);

    // Avaliação state
    const [gerando, setGerando] = useState(false);
    const [questoes, setQuestoes] = useState<Questao[]>([]);
    const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
    const [respostas, setRespostas] = useState<Record<string, string>>({});
    const [nivelIdentificado, setNivelIdentificado] = useState<number | null>(null);
    const [expandedQ, setExpandedQ] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [avalError, setAvalError] = useState("");
    const [currentStep, setCurrentStep] = useState(0); // Step-by-step wizard

    // ─── Fetch students ─────────────────────────────────────────────────

    const fetchAlunos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/pei-regente/meus-alunos");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAlunos(data.alunos || []);
            setProfessorName(data.professor?.name || "");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAlunos(); }, [fetchAlunos]);

    // ─── Load existing avaliação ────────────────────────────────────────

    const loadExistingAvaliacao = useCallback(async (studentId: string, disciplina: string) => {
        try {
            const res = await fetch(`/api/pei/avaliacao-diagnostica?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}`);
            const data = await res.json();
            const avs = data.avaliacoes || [];
            if (avs.length > 0) {
                const av = avs[0];
                setAvaliacaoId(av.id);
                const qg = av.questoes_geradas;
                if (qg?.questoes) {
                    setQuestoes(qg.questoes);
                }
                if (av.resultados) setRespostas(av.resultados as Record<string, string>);
                if (av.nivel_omnisfera_identificado != null) setNivelIdentificado(av.nivel_omnisfera_identificado);
            }
        } catch { /* silent */ }
    }, []);

    // ─── Select student + discipline ────────────────────────────────────

    const openAvaliacao = useCallback((aluno: Aluno, disciplina: string) => {
        setSelectedAluno(aluno);
        setSelectedDisc(disciplina);
        setQuestoes([]);
        setRespostas({});
        setNivelIdentificado(null);
        setAvaliacaoId(null);
        setExpandedQ(null);
        setAvalError("");
        setCurrentStep(0);
        loadExistingAvaliacao(aluno.id, disciplina);
    }, [loadExistingAvaliacao]);

    const goBack = () => {
        setSelectedAluno(null);
        setSelectedDisc(null);
        setQuestoes([]);
        setRespostas({});
        setNivelIdentificado(null);
        setAvaliacaoId(null);
        setCurrentStep(0);
    };

    // ─── Generate avaliação ─────────────────────────────────────────────

    const gerarAvaliacao = async () => {
        if (!selectedAluno || !selectedDisc) return;
        setGerando(true);
        setAvalError("");
        setQuestoes([]);

        try {
            const res = await fetch("/api/pei/avaliacao-diagnostica", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedAluno.id,
                    disciplina: selectedDisc,
                    habilidades_bncc: [{
                        codigo: `EF_${selectedDisc.toUpperCase().slice(0, 3)}`,
                        disciplina: selectedDisc,
                        ano: selectedAluno.grade?.match(/\d+/)?.[0] || "6",
                        segmento: "EF2",
                        unidade_tematica: "Diagnóstica Geral",
                        objeto_conhecimento: "Avaliação inicial",
                        habilidade: `Avaliar nível do estudante em ${selectedDisc}`,
                        nivel_cognitivo_saeb: "I",
                        prioridade_saeb: "alta",
                    }],
                    nivel_omnisfera_estimado: 1,
                    quantidade: 4,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAvaliacaoId(data.avaliacao?.id);
            const qg = data.avaliacao?.questoes_geradas;
            if (qg?.questoes) {
                setQuestoes(qg.questoes);
                setCurrentStep(1); // Move to first question
            } else {
                setAvalError("Resposta da IA não está no formato esperado. Tente novamente.");
            }
        } catch (err) {
            setAvalError(err instanceof Error ? err.message : "Erro ao gerar avaliação");
        } finally { setGerando(false); }
    };

    // ─── Save results ───────────────────────────────────────────────────

    const salvarResultados = async () => {
        if (!avaliacaoId) return;
        setSalvando(true);

        let acertos = 0;
        for (const q of questoes) {
            if (respostas[q.id] === q.gabarito) acertos++;
        }
        const percentual = questoes.length > 0 ? acertos / questoes.length : 0;
        let nivel: NivelOmnisfera = 0;
        if (percentual >= 0.9) nivel = 4;
        else if (percentual >= 0.7) nivel = 3;
        else if (percentual >= 0.5) nivel = 2;
        else if (percentual >= 0.25) nivel = 1;
        else nivel = 0;

        try {
            const res = await fetch("/api/pei/avaliacao-diagnostica", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: avaliacaoId,
                    resultados: respostas,
                    nivel_omnisfera_identificado: nivel,
                    status: "aplicada",
                }),
            });
            if (!res.ok) throw new Error("Erro ao salvar");
            setNivelIdentificado(nivel);
            setCurrentStep(questoes.length + 1); // Go to results step
            fetchAlunos(); // Refresh list
        } catch (err) {
            setAvalError(err instanceof Error ? err.message : "Erro ao salvar resultados");
        } finally { setSalvando(false); }
    };

    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: "center" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto 12px" }} />
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Carregando estudantes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171", marginBottom: 12 }}>
                    <AlertTriangle size={20} /> <span style={{ fontWeight: 600 }}>{error}</span>
                </div>
                <button onClick={fetchAlunos} style={{
                    padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)",
                    background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: 13,
                }}>Tentar novamente</button>
            </div>
        );
    }

    // ─── Avaliação View (student selected) ──────────────────────────────

    if (selectedAluno && selectedDisc) {
        const totalSteps = questoes.length + 2; // intro + questions + results
        const allAnswered = questoes.length > 0 && Object.keys(respostas).length >= questoes.length;

        return (
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* Breadcrumb */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
                    padding: "12px 16px", borderRadius: 12,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    <button onClick={goBack} style={{
                        display: "flex", alignItems: "center", padding: 6, borderRadius: 8,
                        border: "none", background: "rgba(99,102,241,.1)", color: "#818cf8", cursor: "pointer",
                    }}><ArrowLeft size={16} /></button>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {selectedAluno.name} <span style={{ margin: "0 6px", opacity: .5 }}>›</span>
                        <strong style={{ color: "var(--text-primary)" }}>{selectedDisc}</strong>
                    </span>
                </div>

                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    borderRadius: 14, padding: "20px 24px", color: "#fff", marginBottom: 20,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <Brain size={22} />
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                            Avaliação Diagnóstica — {selectedDisc}
                        </h2>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                        Estudante: <strong>{selectedAluno.name}</strong> · {selectedAluno.grade}
                        {selectedAluno.diagnostico && ` · ${selectedAluno.diagnostico}`}
                    </p>
                </div>

                {/* Level already identified */}
                {nivelIdentificado !== null && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                        borderRadius: 14, background: "rgba(16,185,129,.08)", border: "1.5px solid rgba(16,185,129,.3)",
                        marginBottom: 20,
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center",
                            justifyContent: "center", background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff", fontSize: 22, fontWeight: 800,
                        }}>{nivelIdentificado}</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#10b981" }}>
                                Nível Omnisfera: {nivelIdentificado} — {ESCALA_OMNISFERA[nivelIdentificado as NivelOmnisfera]?.label}
                            </div>
                            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
                                {ESCALA_OMNISFERA[nivelIdentificado as NivelOmnisfera]?.descricao}
                            </div>
                            <div style={{ fontSize: 12, color: "#10b981", marginTop: 4, fontWeight: 600 }}>
                                ✓ Resultado vinculado ao PEI do estudante
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 0: Generate button */}
                {questoes.length === 0 && !gerando && nivelIdentificado === null && (
                    <div style={{ ...cardS, textAlign: "center", padding: "40px 20px" }}>
                        <Brain size={48} style={{ margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.3 }} />
                        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                            Gerar Avaliação Diagnóstica
                        </h3>
                        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                            A IA irá gerar questões diagnósticas alinhadas à BNCC para avaliar o nível do estudante em {selectedDisc}.
                        </p>
                        <button onClick={gerarAvaliacao} style={{
                            padding: "14px 28px", borderRadius: 12,
                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontWeight: 700, fontSize: 15,
                            display: "inline-flex", alignItems: "center", gap: 8,
                        }}>
                            <Sparkles size={20} /> Gerar com IA
                        </button>
                    </div>
                )}

                {/* Generating state */}
                {gerando && (
                    <div style={{
                        padding: 50, textAlign: "center",
                        ...cardS, border: "1.5px solid rgba(37,99,235,.3)",
                    }}>
                        <Loader2 size={36} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto 14px" }} />
                        <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>
                            Gerando questões diagnósticas com IA...
                        </p>
                        <p style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
                            Isso pode levar até 30 segundos
                        </p>
                    </div>
                )}

                {avalError && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "12px 16px", borderRadius: 10,
                        background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13,
                        marginBottom: 16,
                    }}>
                        <AlertTriangle size={16} /> {avalError}
                    </div>
                )}

                {/* Progress bar */}
                {questoes.length > 0 && nivelIdentificado === null && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                                {Object.keys(respostas).length} de {questoes.length} respondidas
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {Math.round((Object.keys(respostas).length / questoes.length) * 100)}%
                            </span>
                        </div>
                        <div style={{
                            height: 6, borderRadius: 3,
                            background: "var(--bg-tertiary, rgba(15,23,42,.5))",
                        }}>
                            <div style={{
                                height: "100%", borderRadius: 3,
                                background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                                width: `${(Object.keys(respostas).length / questoes.length) * 100}%`,
                                transition: "width .3s ease",
                            }} />
                        </div>
                    </div>
                )}

                {/* Questions */}
                {questoes.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {questoes.map((q, idx) => {
                            const respondida = !!respostas[q.id];
                            const correta = respostas[q.id] === q.gabarito;
                            const showResult = respondida && nivelIdentificado !== null;

                            return (
                                <div key={q.id} style={{
                                    ...cardS,
                                    border: respondida
                                        ? showResult
                                            ? `1.5px solid ${correta ? "rgba(16,185,129,.4)" : "rgba(239,68,68,.4)"}`
                                            : "1.5px solid rgba(99,102,241,.3)"
                                        : "1px solid var(--border-default, rgba(148,163,184,.15))",
                                }}>
                                    {/* Question header */}
                                    <button
                                        onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                                        style={{
                                            ...headerS, width: "100%", cursor: "pointer",
                                            justifyContent: "space-between", border: "none",
                                            background: showResult && correta
                                                ? "rgba(16,185,129,.05)"
                                                : showResult && !correta
                                                    ? "rgba(239,68,68,.05)"
                                                    : "var(--bg-tertiary, rgba(15,23,42,.3))",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{
                                                width: 28, height: 28, borderRadius: "50%",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12, fontWeight: 800,
                                                background: respondida
                                                    ? showResult && correta ? "rgba(16,185,129,.15)" : showResult ? "rgba(239,68,68,.15)" : "rgba(99,102,241,.15)"
                                                    : "rgba(148,163,184,.1)",
                                                color: respondida
                                                    ? showResult && correta ? "#10b981" : showResult ? "#f87171" : "#818cf8"
                                                    : "var(--text-muted)",
                                            }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary, #e2e8f0)" }}>
                                                Questão {idx + 1}
                                                {respondida && showResult && (
                                                    <span style={{ marginLeft: 8, fontSize: 12, color: correta ? "#10b981" : "#f87171" }}>
                                                        {correta ? "✓ Correta" : "✗ Incorreta"}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            {respondida && !showResult && (
                                                <span style={{ fontSize: 11, fontWeight: 600, color: "#818cf8", background: "rgba(99,102,241,.1)", padding: "2px 8px", borderRadius: 4 }}>
                                                    Respondida
                                                </span>
                                            )}
                                            {expandedQ === q.id ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />}
                                        </div>
                                    </button>

                                    {/* Question content (expanded) */}
                                    {expandedQ === q.id && (
                                        <div style={bodyS}>
                                            {/* Instruction for professor */}
                                            {q.instrucao_aplicacao_professor && (
                                                <div style={{
                                                    padding: "10px 14px", borderRadius: 10, fontSize: 12,
                                                    background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.15)",
                                                    color: "#fbbf24", marginBottom: 14, lineHeight: 1.5,
                                                }}>
                                                    <strong>📋 Instrução para o professor:</strong> {q.instrucao_aplicacao_professor}
                                                </div>
                                            )}

                                            {/* Visual context suggestion */}
                                            {q.contexto_visual_sugerido && (
                                                <div style={{
                                                    padding: "8px 12px", borderRadius: 8, fontSize: 12,
                                                    background: "rgba(14,165,233,.06)", border: "1px solid rgba(14,165,233,.12)",
                                                    color: "#38bdf8", marginBottom: 12,
                                                }}>
                                                    🖼️ <strong>Contexto visual sugerido:</strong> {q.contexto_visual_sugerido}
                                                </div>
                                            )}

                                            {/* NEE adaptation */}
                                            {q.adaptacao_nee_aplicada && (
                                                <div style={{
                                                    padding: "8px 12px", borderRadius: 8, fontSize: 12,
                                                    background: "rgba(139,92,246,.06)", border: "1px solid rgba(139,92,246,.12)",
                                                    color: "#a78bfa", marginBottom: 12,
                                                }}>
                                                    ♿ <strong>Adaptação NEE:</strong> {q.adaptacao_nee_aplicada}
                                                </div>
                                            )}

                                            {/* Enunciado */}
                                            <p style={{
                                                fontSize: 15, lineHeight: 1.7, color: "var(--text-primary, #e2e8f0)",
                                                marginBottom: 16, fontWeight: 500,
                                            }}>
                                                {q.enunciado}
                                            </p>

                                            {/* Alternatives */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                                                {(["A", "B", "C", "D"] as const).map((letra) => {
                                                    const selected = respostas[q.id] === letra;
                                                    const isCorrect = letra === q.gabarito;

                                                    let bg = "var(--bg-primary, rgba(2,6,23,.3))";
                                                    let borderColor = "var(--border-default, rgba(148,163,184,.12))";
                                                    let textColor = "var(--text-primary, #e2e8f0)";
                                                    if (selected) { bg = "rgba(99,102,241,.12)"; borderColor = "#6366f1"; textColor = "#c7d2fe"; }
                                                    if (showResult && isCorrect) { bg = "rgba(16,185,129,.08)"; borderColor = "#10b981"; textColor = "#a7f3d0"; }
                                                    if (showResult && selected && !isCorrect) { bg = "rgba(239,68,68,.08)"; borderColor = "#f87171"; textColor = "#fecaca"; }

                                                    return (
                                                        <button
                                                            key={letra}
                                                            onClick={() => {
                                                                if (nivelIdentificado !== null) return;
                                                                setRespostas({ ...respostas, [q.id]: letra });
                                                            }}
                                                            style={{
                                                                padding: "12px 16px", borderRadius: 10, textAlign: "left",
                                                                background: bg, border: `1.5px solid ${borderColor}`,
                                                                color: textColor, cursor: nivelIdentificado !== null ? "default" : "pointer",
                                                                fontSize: 14, transition: "all .2s", display: "flex", alignItems: "center", gap: 10,
                                                            }}
                                                        >
                                                            <span style={{
                                                                width: 26, height: 26, borderRadius: "50%",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                fontSize: 12, fontWeight: 800,
                                                                background: selected ? "rgba(99,102,241,.2)" : "rgba(148,163,184,.08)",
                                                                color: selected ? "#818cf8" : "var(--text-muted)",
                                                                flexShrink: 0,
                                                            }}>{letra}</span>
                                                            {q.alternativas[letra]}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Pedagogical justification */}
                                            {showResult && q.justificativa_pedagogica && (
                                                <div style={{
                                                    padding: "12px 16px", borderRadius: 10, fontSize: 13,
                                                    background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.12)",
                                                    color: "#a5b4fc", lineHeight: 1.6,
                                                }}>
                                                    <strong>💡 Justificativa pedagógica:</strong> {q.justificativa_pedagogica}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Save results button */}
                        {nivelIdentificado === null && allAnswered && (
                            <button
                                onClick={salvarResultados}
                                disabled={salvando}
                                style={{
                                    padding: "16px 24px", borderRadius: 14,
                                    background: "linear-gradient(135deg, #059669, #10b981)",
                                    color: "#fff", border: "none", cursor: "pointer",
                                    fontWeight: 700, fontSize: 16,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    boxShadow: "0 4px 20px rgba(16,185,129,.3)",
                                }}
                            >
                                {salvando ? (
                                    <><Loader2 size={20} className="animate-spin" /> Calculando nível Omnisfera...</>
                                ) : (
                                    <><ClipboardCheck size={20} /> Registrar respostas e calcular nível</>
                                )}
                            </button>
                        )}

                        {/* Regenerate button */}
                        {questoes.length > 0 && (
                            <button
                                onClick={() => { setQuestoes([]); setRespostas({}); setNivelIdentificado(null); setAvaliacaoId(null); setCurrentStep(0); }}
                                style={{
                                    padding: "10px 18px", borderRadius: 10,
                                    background: "transparent", color: "var(--text-muted, #94a3b8)",
                                    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                    cursor: "pointer", fontSize: 13, textAlign: "center",
                                }}
                            >
                                Gerar nova avaliação
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ─── Student List ───────────────────────────────────────────────────

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Page header */}
            <div style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
                borderRadius: 16, padding: "24px 28px", color: "#fff", marginBottom: 24,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center",
                        justifyContent: "center", background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
                    }}>
                        <Brain size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Avaliação Diagnóstica</h1>
                        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
                            {professorName} · {alunos.length} estudante{alunos.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.8, maxWidth: 600 }}>
                    Gere avaliações diagnósticas com IA, aplique as questões e identifique o nível Omnisfera de cada estudante por componente curricular.
                </p>
            </div>

            {/* Empty state */}
            {alunos.length === 0 && (
                <div style={{ ...cardS, textAlign: "center", padding: "40px 20px" }}>
                    <Users size={48} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.3 }} />
                    <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                        Nenhum estudante encontrado
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                        Estudantes em Fase 2 do PEI aparecerão aqui.
                    </p>
                </div>
            )}

            {/* Student cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {alunos.map(aluno => {
                    const totalDisc = aluno.disciplinas.length;
                    const avaliadasCompletas = aluno.disciplinas.filter(d => d.avaliacao_status === "aplicada").length;

                    return (
                        <div key={aluno.id} style={cardS}>
                            <div style={{ ...headerS, justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                                        color: "#fff", fontSize: 12, fontWeight: 800,
                                    }}>
                                        {aluno.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary, #e2e8f0)" }}>
                                            {aluno.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)" }}>
                                            {aluno.grade} {aluno.class_group && `— ${aluno.class_group}`}
                                            {aluno.diagnostico && ` · ${aluno.diagnostico}`}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{
                                        fontSize: 12, fontWeight: 700,
                                        color: avaliadasCompletas === totalDisc && totalDisc > 0 ? "#10b981" : "var(--text-muted)",
                                    }}>
                                        {avaliadasCompletas}/{totalDisc}
                                    </span>
                                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>avaliações</div>
                                </div>
                            </div>

                            {/* Discipline buttons */}
                            <div style={{ ...bodyS, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {aluno.disciplinas.map(disc => {
                                    const applied = disc.avaliacao_status === "aplicada";
                                    const hasAvaliacao = disc.has_avaliacao;

                                    return (
                                        <button
                                            key={disc.id}
                                            onClick={() => openAvaliacao(aluno, disc.disciplina)}
                                            style={{
                                                padding: "8px 14px", borderRadius: 10,
                                                display: "flex", alignItems: "center", gap: 6,
                                                cursor: "pointer", fontSize: 13, fontWeight: 600,
                                                border: applied
                                                    ? "1.5px solid rgba(16,185,129,.3)"
                                                    : hasAvaliacao
                                                        ? "1.5px solid rgba(245,158,11,.3)"
                                                        : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                                background: applied
                                                    ? "rgba(16,185,129,.06)"
                                                    : hasAvaliacao
                                                        ? "rgba(245,158,11,.06)"
                                                        : "var(--bg-primary, rgba(2,6,23,.3))",
                                                color: applied
                                                    ? "#10b981"
                                                    : hasAvaliacao
                                                        ? "#f59e0b"
                                                        : "var(--text-secondary, #cbd5e1)",
                                                transition: "all .2s",
                                            }}
                                        >
                                            {applied ? <CheckCircle2 size={14} /> : hasAvaliacao ? <Target size={14} /> : <Zap size={14} />}
                                            {disc.disciplina}
                                            {disc.nivel_omnisfera !== null && (
                                                <span style={{
                                                    fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 4,
                                                    background: "rgba(99,102,241,.12)", color: "#818cf8",
                                                }}>N{disc.nivel_omnisfera}</span>
                                            )}
                                        </button>
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
