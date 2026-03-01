"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Send, Users, BookOpen, CheckCircle2,
    Loader2, Trash2, Sparkles, AlertTriangle,
} from "lucide-react";
import { FASE_STATUS_LABELS, type FaseStatusPEIDisciplina } from "@/lib/omnisfera-types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DisciplinaRegente {
    id?: string;
    disciplina: string;
    professor_regente_nome: string;
    professor_regente_id?: string;
    fase_status: FaseStatusPEIDisciplina;
}

interface Props {
    studentId: string | null;
    studentName: string;
    studentGrade?: string;
    studentClass?: string;
    onDisciplinaSelect?: (disciplina: string) => void;
}

const STATUS_COLORS: Record<FaseStatusPEIDisciplina, string> = {
    plano_ensino: "var(--color-warning, #f59e0b)",
    diagnostica: "var(--color-info, #3b82f6)",
    pei_disciplina: "var(--color-primary, #8b5cf6)",
    concluido: "var(--color-success, #10b981)",
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function PEIFase2Regentes({ studentId, studentName, studentGrade, studentClass, onDisciplinaSelect }: Props) {
    const [disciplinas, setDisciplinas] = useState<DisciplinaRegente[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);
    const [error, setError] = useState("");

    // Preview: professores detectados da turma
    const [preview, setPreview] = useState<Array<{ name: string; component: string }>>([]);
    const [previewLoading, setPreviewLoading] = useState(false);

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

    // Carregar preview de professores vinculados à turma
    const loadPreview = useCallback(async (grade: string, classGroup: string) => {
        if (!grade) return;
        setPreviewLoading(true);
        try {
            const res = await fetch(`/api/pei/enviar-regentes?preview=1&grade=${encodeURIComponent(grade)}&classGroup=${encodeURIComponent(classGroup)}`);
            const data = await res.json();
            setPreview(data.teachers || []);
        } catch {
            setPreview([]);
        } finally {
            setPreviewLoading(false);
        }
    }, []);

    // Inicializar preview ao montar
    useEffect(() => {
        if (!studentId || !studentGrade) return;
        loadPreview(studentGrade, studentClass || "");
    }, [studentId, studentGrade, studentClass, loadPreview]);

    // ─── Vincular todos ────────────────────────────────────────────────────

    const vincularTodos = async () => {
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
            if (!res.ok) throw new Error(data.error || "Erro ao vincular");
            setDisciplinas([...disciplinas, ...(data.disciplinas || [])]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao vincular professores");
        } finally {
            setSending(false);
        }
    };

    // ─── Desvincular disciplina ────────────────────────────────────────────

    const desvincular = async (disc: DisciplinaRegente) => {
        if (!disc.id || !studentId) return;
        if (!confirm(`Desvincular ${disc.disciplina} (${disc.professor_regente_nome})?`)) return;
        setRemoving(disc.id);
        try {
            const res = await fetch("/api/pei/enviar-regentes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: disc.id, studentId }),
            });
            if (res.ok) {
                setDisciplinas(disciplinas.filter((d) => d.id !== disc.id));
            } else {
                const data = await res.json();
                setError(data.error || "Erro ao desvincular");
            }
        } catch {
            setError("Erro ao desvincular");
        } finally {
            setRemoving(null);
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
                        Professores Regentes
                    </h3>
                </div>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                    Vincule o PEI de <strong>{studentName}</strong> aos professores da turma.
                    Cada professor receberá acesso para elaborar o PEI da sua disciplina.
                </p>
            </div>

            {/* Professores detectados (preview) */}
            {disciplinas.length === 0 && (
                <div style={{
                    background: "rgba(16,185,129,.06)", borderRadius: 14, padding: 20,
                    border: "1px solid rgba(16,185,129,.2)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <Sparkles size={18} style={{ color: "#10b981" }} />
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary, #1e293b)" }}>
                            Professores detectados na turma
                        </h4>
                    </div>

                    {previewLoading ? (
                        <p style={{ fontSize: 13, color: "#94a3b8" }}>
                            <Loader2 size={14} className="animate-spin" style={{ verticalAlign: "middle", marginRight: 6 }} />
                            Buscando professores vinculados...
                        </p>
                    ) : preview.length > 0 ? (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                                {preview.map((t, i) => (
                                    <div key={i} style={{
                                        padding: "8px 14px", borderRadius: 10,
                                        background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.15)",
                                        fontSize: 13, color: "var(--text-primary, #334155)",
                                    }}>
                                        <strong>{t.name}</strong>
                                        <span style={{ opacity: 0.6, marginLeft: 6 }}>• {t.component}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={vincularTodos}
                                disabled={sending}
                                style={{
                                    width: "100%", padding: "12px 20px", borderRadius: 12,
                                    background: "linear-gradient(135deg, #059669, #10b981)",
                                    color: "#fff", border: "none",
                                    cursor: sending ? "wait" : "pointer",
                                    fontWeight: 700, fontSize: 15, display: "flex",
                                    alignItems: "center", justifyContent: "center", gap: 8,
                                }}
                            >
                                {sending ? (
                                    <><Loader2 size={18} className="animate-spin" /> Vinculando...</>
                                ) : (
                                    <><Send size={18} /> Vincular todos os professores ({preview.length})</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div style={{ fontSize: 13, color: "#94a3b8" }}>
                            <AlertTriangle size={14} style={{ verticalAlign: "middle", marginRight: 6, color: "#f59e0b" }} />
                            Nenhum professor vinculado a esta turma. Cadastre professores com componentes curriculares em{" "}
                            <strong>Gestão de Usuários</strong>.
                        </div>
                    )}
                </div>
            )}

            {/* Cards de disciplinas vinculadas */}
            {disciplinas.length > 0 && (
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary, #1e293b)" }}>
                            Disciplinas vinculadas ({disciplinas.length})
                        </h4>
                        <button
                            onClick={vincularTodos}
                            disabled={sending}
                            style={{
                                padding: "6px 14px", borderRadius: 8,
                                background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)",
                                color: "#059669", fontSize: 13, fontWeight: 600,
                                cursor: sending ? "wait" : "pointer",
                                display: "flex", alignItems: "center", gap: 6,
                            }}
                        >
                            <Sparkles size={14} />
                            {sending ? "Detectando..." : "+ Detectar novos"}
                        </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                        {disciplinas.map((d) => {
                            const status = (d.fase_status || "plano_ensino") as FaseStatusPEIDisciplina;
                            const color = STATUS_COLORS[status] || "#94a3b8";
                            const isRemoving = removing === d.id;
                            return (
                                <div
                                    key={d.id || d.disciplina}
                                    style={{
                                        background: "var(--bg-tertiary, #f8fafc)", borderRadius: 12,
                                        padding: "16px 18px", border: `2px solid ${color}33`,
                                        transition: "all .2s", position: "relative",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                        <span
                                            onClick={() => onDisciplinaSelect?.(d.disciplina)}
                                            style={{
                                                fontWeight: 600, fontSize: 15, color: "var(--text-primary, #1e293b)",
                                                cursor: onDisciplinaSelect ? "pointer" : "default",
                                            }}
                                        >
                                            {d.disciplina}
                                        </span>
                                        <span style={{
                                            fontSize: 11, padding: "2px 8px", borderRadius: 20,
                                            background: `${color}15`, color, fontWeight: 600,
                                        }}>
                                            {FASE_STATUS_LABELS[status] || status}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted, #64748b)" }}>
                                            <BookOpen size={14} />
                                            {d.professor_regente_nome}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); desvincular(d); }}
                                            disabled={isRemoving}
                                            title="Desvincular"
                                            style={{
                                                background: "none", border: "none",
                                                color: isRemoving ? "#94a3b8" : "#ef4444",
                                                cursor: isRemoving ? "wait" : "pointer",
                                                padding: 4, borderRadius: 6,
                                            }}
                                        >
                                            {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {error && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(239,68,68,.08)", color: "#ef4444", fontSize: 13,
                    border: "1px solid rgba(239,68,68,.15)",
                }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {loading && (
                <div style={{ textAlign: "center", padding: 20 }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: "#6366f1" }} />
                </div>
            )}
        </div>
    );
}
