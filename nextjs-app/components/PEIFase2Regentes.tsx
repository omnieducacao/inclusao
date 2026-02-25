"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Send, Plus, Users, BookOpen, CheckCircle2,
    Clock, AlertTriangle, Loader2, Trash2, Sparkles,
} from "lucide-react";
import { DISCIPLINAS_EF, FASE_STATUS_LABELS, type FaseStatusPEIDisciplina } from "@/lib/omnisfera-types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DisciplinaRegente {
    id?: string;
    disciplina: string;
    professor_regente_nome: string;
    professor_regente_id?: string;
    fase_status: FaseStatusPEIDisciplina;
}

interface Professor {
    id: string;
    name: string;
    link_type: string;
    components: string[]; // componentes curriculares atribuídos
}

interface Props {
    studentId: string | null;
    studentName: string;
    onDisciplinaSelect?: (disciplina: string) => void;
}

const STATUS_COLORS: Record<FaseStatusPEIDisciplina, string> = {
    plano_ensino: "var(--color-warning, #f59e0b)",
    diagnostica: "var(--color-info, #3b82f6)",
    pei_disciplina: "var(--color-primary, #8b5cf6)",
    concluido: "var(--color-success, #10b981)",
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function PEIFase2Regentes({ studentId, studentName, onDisciplinaSelect }: Props) {
    const [disciplinas, setDisciplinas] = useState<DisciplinaRegente[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    // Professores do banco
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [loadingProfs, setLoadingProfs] = useState(false);

    // Nova disciplina form
    const [novaDisciplina, setNovaDisciplina] = useState("");
    const [selectedProfId, setSelectedProfId] = useState("");
    const [novasDisciplinas, setNovasDisciplinas] = useState<Array<{
        disciplina: string;
        professor_id: string;
        professor_nome: string;
    }>>([]);

    // Carregar professores cadastrados
    const fetchProfessores = useCallback(async () => {
        setLoadingProfs(true);
        try {
            const res = await fetch("/api/members");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao buscar professores");

            // Filtrar apenas membros com can_pei e formatar
            const members = (data.members || data || []) as Array<{
                id: string;
                name: string;
                link_type?: string;
                can_pei?: boolean;
                teacher_assignments?: Array<{ component_name?: string; component_id?: string }>;
            }>;

            const profs: Professor[] = members
                .filter(m => m.name) // pelo menos ter nome
                .map(m => ({
                    id: m.id,
                    name: m.name,
                    link_type: m.link_type || "todos",
                    components: (m.teacher_assignments || [])
                        .map(a => a.component_name || "")
                        .filter(Boolean),
                }));

            setProfessores(profs);
        } catch (err) {
            console.warn("Erro ao buscar professores:", err);
        } finally {
            setLoadingProfs(false);
        }
    }, []);

    // Carregar disciplinas existentes
    useEffect(() => {
        if (!studentId) return;
        setLoading(true);
        fetch(`/api/pei/enviar-regentes?studentId=${studentId}`)
            .then((r) => r.json())
            .then((data) => {
                setDisciplinas(data.disciplinas || []);
            })
            .catch(() => setError("Erro ao carregar disciplinas"))
            .finally(() => setLoading(false));
    }, [studentId]);

    // Carregar professores ao montar
    useEffect(() => {
        fetchProfessores();
    }, [fetchProfessores]);

    // ─── Ações ────────────────────────────────────────────────────────────────

    const adicionarDisciplina = () => {
        if (!novaDisciplina || !selectedProfId) return;
        const prof = professores.find(p => p.id === selectedProfId);
        if (!prof) return;

        if (novasDisciplinas.some((d) => d.disciplina === novaDisciplina) ||
            disciplinas.some((d) => d.disciplina === novaDisciplina)) {
            setError("Esta disciplina já foi adicionada.");
            return;
        }
        setNovasDisciplinas([
            ...novasDisciplinas,
            { disciplina: novaDisciplina, professor_id: prof.id, professor_nome: prof.name },
        ]);
        setNovaDisciplina("");
        setSelectedProfId("");
        setError("");
    };

    const removerNova = (idx: number) => {
        setNovasDisciplinas(novasDisciplinas.filter((_, i) => i !== idx));
    };

    // Enviar modo automático (busca teacher_assignments automaticamente)
    const enviarAuto = async () => {
        if (!studentId) return;
        setSending(true);
        setError("");
        try {
            const res = await fetch("/api/pei/enviar-regentes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, auto: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao enviar");
            setDisciplinas([...disciplinas, ...(data.disciplinas || [])]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar automaticamente");
        } finally {
            setSending(false);
        }
    };

    // Enviar modo manual
    const enviarManual = async () => {
        if (!studentId || novasDisciplinas.length === 0) return;
        setSending(true);
        setError("");
        try {
            const res = await fetch("/api/pei/enviar-regentes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    disciplinas: novasDisciplinas.map((d) => ({
                        disciplina: d.disciplina,
                        professor_regente_nome: d.professor_nome,
                        professor_regente_id: d.professor_id,
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao enviar");
            setDisciplinas([...disciplinas, ...(data.disciplinas || [])]);
            setNovasDisciplinas([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar para regentes");
        } finally {
            setSending(false);
        }
    };

    // ─── Empty state ──────────────────────────────────────────────────────────

    if (!studentId) {
        return (
            <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                <Users size={48} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>Selecione um estudante para enviar o PEI para os professores regentes.</p>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: 16, padding: "20px 24px", color: "#fff",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Users size={22} />
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                        Fase 2 — Professores Regentes
                    </h3>
                </div>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                    Envie o PEI de <strong>{studentName}</strong> para cada professor regente.
                    Eles irão inserir o plano de ensino, aplicar a avaliação diagnóstica e
                    elaborar o PEI por componente curricular.
                </p>
            </div>

            {/* Envio automático */}
            {disciplinas.length === 0 && (
                <div style={{
                    background: "rgba(16,185,129,.06)", borderRadius: 14, padding: 20,
                    border: "1px solid rgba(16,185,129,.2)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <Sparkles size={18} style={{ color: "#10b981" }} />
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary, #e2e8f0)" }}>
                            Envio automático por vínculo
                        </h4>
                    </div>
                    <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-muted, #94a3b8)" }}>
                        Detecta automaticamente os professores vinculados à turma do estudante
                        (cadastrados em <strong>Gestão de Usuários</strong>) e cria uma disciplina
                        para cada componente curricular atribuído.
                    </p>
                    <button
                        onClick={enviarAuto}
                        disabled={sending}
                        style={{
                            padding: "10px 20px", borderRadius: 10,
                            background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff", border: "none",
                            cursor: sending ? "wait" : "pointer",
                            fontWeight: 700, fontSize: 14, display: "flex",
                            alignItems: "center", gap: 8,
                        }}
                    >
                        {sending ? (
                            <><Loader2 size={16} className="animate-spin" /> Detectando professores...</>
                        ) : (
                            <><Sparkles size={16} /> Detectar e enviar automaticamente</>
                        )}
                    </button>
                </div>
            )}

            {/* Cards de disciplinas já enviadas */}
            {disciplinas.length > 0 && (
                <div>
                    <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "var(--text-primary, #e2e8f0)" }}>
                        Disciplinas enviadas ({disciplinas.length})
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                        {disciplinas.map((d) => {
                            const status = (d.fase_status || "plano_ensino") as FaseStatusPEIDisciplina;
                            const color = STATUS_COLORS[status] || "#94a3b8";
                            return (
                                <div
                                    key={d.id || d.disciplina}
                                    onClick={() => onDisciplinaSelect?.(d.disciplina)}
                                    style={{
                                        background: "var(--bg-tertiary, rgba(30,41,59,.6))", borderRadius: 12,
                                        padding: "16px 18px", border: `1px solid ${color}33`,
                                        cursor: onDisciplinaSelect ? "pointer" : "default",
                                        transition: "all .2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}88`; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}33`; }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary, #f1f5f9)" }}>
                                            {d.disciplina}
                                        </span>
                                        <span style={{
                                            fontSize: 11, padding: "2px 8px", borderRadius: 20,
                                            background: `${color}22`, color, fontWeight: 600,
                                        }}>
                                            {FASE_STATUS_LABELS[status] || status}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted, #94a3b8)" }}>
                                        <BookOpen size={14} />
                                        {d.professor_regente_nome}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Adicionar manualmente */}
            <div style={{ background: "var(--bg-tertiary, rgba(30,41,59,.4))", borderRadius: 14, padding: 20 }}>
                <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "var(--text-primary, #e2e8f0)" }}>
                    <Plus size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    Adicionar disciplina manualmente
                </h4>

                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    {/* Select de disciplina */}
                    <select
                        value={novaDisciplina}
                        onChange={(e) => setNovaDisciplina(e.target.value)}
                        style={{
                            flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8,
                            background: "var(--bg-primary, rgba(15,23,42,.6))",
                            color: "var(--text-primary, #e2e8f0)",
                            border: "1px solid var(--border-default, rgba(148,163,184,.3))",
                            fontSize: 14,
                        }}
                    >
                        <option value="">Selecionar disciplina...</option>
                        {DISCIPLINAS_EF.filter(
                            (d) => !disciplinas.some((ex) => ex.disciplina === d) &&
                                !novasDisciplinas.some((n) => n.disciplina === d)
                        ).map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    {/* Select de professor (do banco) */}
                    <select
                        value={selectedProfId}
                        onChange={(e) => setSelectedProfId(e.target.value)}
                        style={{
                            flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8,
                            background: "var(--bg-primary, rgba(15,23,42,.6))",
                            color: "var(--text-primary, #e2e8f0)",
                            border: "1px solid var(--border-default, rgba(148,163,184,.3))",
                            fontSize: 14,
                        }}
                    >
                        <option value="">
                            {loadingProfs ? "Carregando professores..." : "Selecionar professor cadastrado..."}
                        </option>
                        {professores.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                                {p.components.length > 0 ? ` (${p.components.join(", ")})` : ""}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={adicionarDisciplina}
                        disabled={!novaDisciplina || !selectedProfId}
                        style={{
                            padding: "8px 16px", borderRadius: 8,
                            background: novaDisciplina && selectedProfId ? "#4f46e5" : "var(--bg-tertiary, #334155)",
                            color: "#fff", border: "none",
                            cursor: novaDisciplina && selectedProfId ? "pointer" : "not-allowed",
                            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                        }}
                    >
                        <Plus size={16} /> Adicionar
                    </button>
                </div>

                {professores.length === 0 && !loadingProfs && (
                    <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "0 0 12px" }}>
                        💡 Nenhum professor encontrado. Cadastre professores em{" "}
                        <strong>Gestão de Usuários</strong> e atribua turmas e componentes curriculares.
                    </p>
                )}

                {/* Lista de novas disciplinas pendentes */}
                {novasDisciplinas.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {novasDisciplinas.map((d, i) => (
                            <div key={i} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "8px 12px", borderRadius: 8,
                                background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)",
                            }}>
                                <span style={{ color: "var(--text-primary, #c7d2fe)", fontSize: 14 }}>
                                    <strong>{d.disciplina}</strong> — {d.professor_nome}
                                </span>
                                <button onClick={() => removerNova(i)} style={{
                                    background: "none", border: "none", color: "#f87171", cursor: "pointer",
                                }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: 8, marginBottom: 12,
                        background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13,
                    }}>
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                {novasDisciplinas.length > 0 && (
                    <button
                        onClick={enviarManual}
                        disabled={sending}
                        style={{
                            width: "100%", padding: "12px 20px", borderRadius: 10,
                            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                            color: "#fff", border: "none", cursor: sending ? "wait" : "pointer",
                            fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 8,
                        }}
                    >
                        {sending ? (
                            <><Loader2 size={18} className="animate-spin" /> Enviando...</>
                        ) : (
                            <><Send size={18} /> Enviar para {novasDisciplinas.length} professor{novasDisciplinas.length > 1 ? "es" : ""}</>
                        )}
                    </button>
                )}
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: 20 }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: "#6366f1" }} />
                </div>
            )}
        </div>
    );
}
