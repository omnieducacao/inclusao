"use client";

import React, { useState, useEffect } from "react";
import {
    Brain, Loader2, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, Sparkles, ClipboardCheck,
} from "lucide-react";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";

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

interface Props {
    studentId: string | null;
    disciplina: string;
    planoEnsinoId?: string | null;
    planoEnsinoConteudo?: string;
    onAvaliacaoConcluida?: (avaliacaoId: string, nivel: number) => void;
}

export function PEIAvaliacaoDiagnostica({
    studentId, disciplina, planoEnsinoId,
    planoEnsinoConteudo, onAvaliacaoConcluida,
}: Props) {
    const [gerando, setGerando] = useState(false);
    const [questoes, setQuestoes] = useState<Questao[]>([]);
    const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
    const [respostas, setRespostas] = useState<Record<string, string>>({});
    const [nivelIdentificado, setNivelIdentificado] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [expandedQ, setExpandedQ] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [loading, setLoading] = useState(false);

    // Carregar avaliação existente
    useEffect(() => {
        if (!studentId || !disciplina) return;
        setLoading(true);
        fetch(`/api/pei/avaliacao-diagnostica?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}`)
            .then((r) => r.json())
            .then((data) => {
                const avs = data.avaliacoes || [];
                if (avs.length > 0) {
                    const av = avs[0];
                    setAvaliacaoId(av.id);
                    const qg = av.questoes_geradas;
                    if (qg?.questoes) {
                        setQuestoes(qg.questoes);
                    } else if (qg?.raw_response) {
                        // Se veio como text bruto, marcar
                        setError("A IA retornou texto não estruturado. Gere novamente.");
                    }
                    if (av.resultados) setRespostas(av.resultados as Record<string, string>);
                    if (av.nivel_omnisfera_identificado != null) setNivelIdentificado(av.nivel_omnisfera_identificado);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [studentId, disciplina]);

    const gerarAvaliacao = async () => {
        if (!studentId) return;
        setGerando(true);
        setError("");
        setQuestoes([]);

        try {
            const res = await fetch("/api/pei/avaliacao-diagnostica", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    disciplina,
                    habilidades_bncc: [
                        {
                            codigo: `EF_${disciplina.toUpperCase().slice(0, 3)}`,
                            disciplina,
                            ano: "6º",
                            segmento: "EF2",
                            unidade_tematica: "Diagnóstica Geral",
                            objeto_conhecimento: "Avaliação inicial",
                            habilidade: `Avaliar nível do estudante em ${disciplina}`,
                            nivel_cognitivo_saeb: "I",
                            prioridade_saeb: "alta",
                        },
                    ],
                    nivel_omnisfera_estimado: 1,
                    plano_ensino_contexto: planoEnsinoConteudo || undefined,
                    plano_ensino_id: planoEnsinoId || undefined,
                    quantidade: 4,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAvaliacaoId(data.avaliacao?.id);
            const qg = data.avaliacao?.questoes_geradas;
            if (qg?.questoes) {
                setQuestoes(qg.questoes);
            } else {
                setError("Resposta da IA não está no formato esperado. Tente novamente.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao gerar avaliação");
        } finally {
            setGerando(false);
        }
    };

    const salvarResultados = async () => {
        if (!avaliacaoId) return;
        setSalvando(true);

        // Calcular nível com base nas respostas
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
            onAvaliacaoConcluida?.(avaliacaoId, nivel);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar resultados");
        } finally {
            setSalvando(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "#3b82f6" }} />
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                borderRadius: 14, padding: "18px 22px", color: "#fff",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Brain size={20} />
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                        Avaliação Diagnóstica — {disciplina}
                    </h4>
                </div>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                    A IA gera questões diagnósticas alinhadas à BNCC e contextualizadas ao
                    plano de ensino. Registre as respostas do estudante para identificar o nível Omnisfera.
                </p>
            </div>

            {/* Nível já identificado */}
            {nivelIdentificado !== null && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                    borderRadius: 12, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)",
                }}>
                    <CheckCircle2 size={22} style={{ color: "#10b981" }} />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#10b981" }}>
                            Nível Omnisfera identificado: {nivelIdentificado} — {ESCALA_OMNISFERA[nivelIdentificado as NivelOmnisfera]?.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            {ESCALA_OMNISFERA[nivelIdentificado as NivelOmnisfera]?.descricao}
                        </div>
                    </div>
                </div>
            )}

            {/* Botão gerar */}
            {questoes.length === 0 && !gerando && (
                <button
                    onClick={gerarAvaliacao}
                    disabled={!studentId}
                    style={{
                        padding: "14px 20px", borderRadius: 12,
                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                        color: "#fff", border: "none", cursor: "pointer",
                        fontWeight: 700, fontSize: 15,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                >
                    <Sparkles size={20} /> Gerar Avaliação Diagnóstica
                </button>
            )}

            {gerando && (
                <div style={{
                    padding: 40, textAlign: "center",
                    background: "rgba(37,99,235,.05)", borderRadius: 12,
                }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6", marginBottom: 12 }} />
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        Gerando questões diagnósticas com IA...
                    </p>
                </div>
            )}

            {error && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 8,
                    background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13,
                }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {/* Questões */}
            {questoes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {questoes.map((q, idx) => {
                        const isExpanded = expandedQ === q.id;
                        const respondida = !!respostas[q.id];
                        const correta = respostas[q.id] === q.gabarito;

                        return (
                            <div key={q.id} style={{
                                background: "rgba(30,41,59,.5)", borderRadius: 12,
                                border: respondida
                                    ? `1px solid ${correta ? "rgba(16,185,129,.4)" : "rgba(239,68,68,.4)"}`
                                    : "1px solid rgba(148,163,184,.15)",
                                overflow: "hidden",
                            }}>
                                {/* Header da questão */}
                                <div
                                    onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                                    style={{
                                        padding: "14px 18px", cursor: "pointer",
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                    }}
                                >
                                    <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>
                                        Questão {idx + 1}
                                        {respondida && (
                                            <span style={{ marginLeft: 8, fontSize: 12, color: correta ? "#10b981" : "#f87171" }}>
                                                {correta ? "✓ Correta" : "✗ Incorreta"}
                                            </span>
                                        )}
                                    </span>
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>

                                {/* Conteúdo expandido */}
                                {isExpanded && (
                                    <div style={{ padding: "0 18px 16px" }}>
                                        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 14 }}>
                                            {q.enunciado}
                                        </p>

                                        {/* Alternativas */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                                            {(["A", "B", "C", "D"] as const).map((letra) => {
                                                const selected = respostas[q.id] === letra;
                                                const isCorrect = letra === q.gabarito;
                                                const showResult = respondida && nivelIdentificado !== null;

                                                let bg = "rgba(15,23,42,.4)";
                                                let borderColor = "rgba(148,163,184,.15)";
                                                if (selected) { bg = "rgba(99,102,241,.15)"; borderColor = "#6366f1"; }
                                                if (showResult && isCorrect) { bg = "rgba(16,185,129,.1)"; borderColor = "#10b981"; }
                                                if (showResult && selected && !isCorrect) { bg = "rgba(239,68,68,.1)"; borderColor = "#f87171"; }

                                                return (
                                                    <button
                                                        key={letra}
                                                        onClick={() => {
                                                            if (nivelIdentificado !== null) return; // Já aplicada
                                                            setRespostas({ ...respostas, [q.id]: letra });
                                                        }}
                                                        style={{
                                                            padding: "10px 14px", borderRadius: 8, textAlign: "left",
                                                            background: bg, border: `1px solid ${borderColor}`,
                                                            color: "#e2e8f0", cursor: nivelIdentificado !== null ? "default" : "pointer",
                                                            fontSize: 13, transition: "all .2s",
                                                        }}
                                                    >
                                                        <strong style={{ marginRight: 8 }}>{letra})</strong>
                                                        {q.alternativas[letra]}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Justificativa pedagógica */}
                                        {q.justificativa_pedagogica && (
                                            <div style={{
                                                padding: "10px 14px", borderRadius: 8, fontSize: 12,
                                                background: "rgba(99,102,241,.08)", color: "#a5b4fc",
                                                marginTop: 8,
                                            }}>
                                                <strong>Justificativa pedagógica:</strong> {q.justificativa_pedagogica}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Botão salvar resultados */}
                    {nivelIdentificado === null && Object.keys(respostas).length >= questoes.length && (
                        <button
                            onClick={salvarResultados}
                            disabled={salvando}
                            style={{
                                padding: "14px 20px", borderRadius: 12,
                                background: "linear-gradient(135deg, #059669, #10b981)",
                                color: "#fff", border: "none", cursor: "pointer",
                                fontWeight: 700, fontSize: 15,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            {salvando ? (
                                <><Loader2 size={18} className="animate-spin" /> Calculando nível...</>
                            ) : (
                                <><ClipboardCheck size={18} /> Registrar respostas e calcular nível</>
                            )}
                        </button>
                    )}

                    {/* Botão refazer */}
                    {questoes.length > 0 && (
                        <button
                            onClick={() => { setQuestoes([]); setRespostas({}); setNivelIdentificado(null); setAvaliacaoId(null); }}
                            style={{
                                padding: "8px 16px", borderRadius: 8,
                                background: "transparent", color: "#94a3b8",
                                border: "1px solid rgba(148,163,184,.2)", cursor: "pointer",
                                fontSize: 13, textAlign: "center",
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
