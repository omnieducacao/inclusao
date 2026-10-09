"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Send, BookOpen, Trash2, RefreshCw } from "lucide-react";
import { useConfirmar } from "@/components/Confirmar";
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
    /** Called to save a NEW student PEI */
    onSave?: () => void;
    /** Called to update an EXISTING student PEI */
    onUpdate?: () => void;
    /** Whether the PEI is currently being saved */
    saving?: boolean;
    /** Whether we are editing an existing student (vs new) */
    isEditing?: boolean;
}

// Onda 15: estado de cada disciplina com os chips do design system
const TOM_DA_FASE: Record<FaseStatusPEIDisciplina, string> = {
    plano_ensino: "omni-estado--atencao",
    diagnostica: "omni-estado--info",
    pei_disciplina: "omni-estado--info",
    concluido: "omni-estado--sucesso",
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function PEIFase2Regentes({ studentId, studentName, studentGrade, studentClass, onDisciplinaSelect, onSave, onUpdate, saving: externalSaving, isEditing }: Props) {
    const [disciplinas, setDisciplinas] = useState<DisciplinaRegente[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);
    const [error, setError] = useState("");
    const { confirmar, dialogo } = useConfirmar();

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

    const needsSaveFirst = !isEditing || !studentId;

    const vincularTodos = async () => {
        if (!studentId) return;
        setSending(true);
        setError("");
        try {
            // ── Auto-save PEI before sending ──
            if (isEditing && onUpdate) {
                onUpdate();
                // Wait for save to complete
                await new Promise(r => setTimeout(r, 1500));
            } else if (!isEditing && onSave) {
                onSave();
                await new Promise(r => setTimeout(r, 1500));
            }

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
        if (!(await confirmar({ titulo: `Tirar ${disc.disciplina} do PEI?`, texto: `${disc.professor_regente_nome} deixa de ver este PEI na disciplina.`, acao: "Tirar", cancelar: "Manter", perigo: true }))) return;
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

    // ─── Sem estudante salvo ──────────────────────────────────────────────────

    if (!studentId) {
        return (
            <div className="omni-vazio" style={{ textAlign: "center" }}>
                <p className="omni-vazio__titulo">Salve o PEI primeiro</p>
                <p className="omni-vazio__texto">Depois de salvo, dá para enviar o PEI aos professores da turma.</p>
                {needsSaveFirst && onSave && (
                    <button type="button" className="omni-btn omni-btn--primario" onClick={onSave} disabled={externalSaving}>
                        {externalSaving ? "Salvando…" : "Salvar o PEI"}
                    </button>
                )}
            </div>
        );
    }

    // ─── Tela ────────────────────────────────────────────────────────────────

    return (
        <div style={{ display: "grid", gap: 20 }}>
            {dialogo}
            <div>
                <h3 style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>Professores da turma</h3>
                <p className="omni-apoio" style={{ margin: "4px 0 0", maxWidth: "65ch" }}>
                    Cada professor recebe o PEI de {studentName}, lê, dá ciência e faz a parte da disciplina dele.
                </p>
            </div>

            {disciplinas.length === 0 && !loading && (
                <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 14 }} aria-label="Professores encontrados na turma">
                    {previewLoading ? (
                        <p className="omni-apoio" role="status" style={{ margin: 0 }}>Procurando os professores da turma…</p>
                    ) : preview.length > 0 ? (
                        <>
                            <p style={{ margin: 0, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                                {preview.length === 1 ? "1 professor encontrado" : `${preview.length} professores encontrados`} na turma {studentGrade}{studentClass ? ` · ${studentClass}` : ""}
                            </p>
                            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {preview.map((t, i) => (
                                    <li key={i} className="omni-estado"><strong style={{ color: "var(--tinta)" }}>{t.name}</strong>&nbsp;· {t.component}</li>
                                ))}
                            </ul>
                            <button type="button" className="omni-btn omni-btn--primario" style={{ justifySelf: "start" }} onClick={vincularTodos} disabled={sending}>
                                <Send aria-hidden /> {sending ? "Enviando…" : `Enviar o PEI para ${preview.length === 1 ? "o professor" : `os ${preview.length} professores`}`}
                            </button>
                        </>
                    ) : (
                        <div className="omni-aviso omni-aviso--atencao">
                            <div>
                                <div className="omni-aviso__texto">Nenhum professor ligado a esta turma ainda. Ligue os professores às turmas e aos componentes em Equipe e papéis.</div>
                                <div className="omni-aviso__acoes"><a className="omni-btn omni-btn--secundario omni-btn--pequeno" href="/gestao">Abrir Equipe e papéis</a></div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {disciplinas.length > 0 && (
                <section style={{ display: "grid", gap: 12 }} aria-label="Disciplinas com o PEI">
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ margin: 0, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                            {disciplinas.length === 1 ? "1 disciplina recebeu o PEI" : `${disciplinas.length} disciplinas receberam o PEI`}
                        </p>
                        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={vincularTodos} disabled={sending}>
                            <RefreshCw aria-hidden /> {sending ? "Procurando…" : "Procurar professores novos"}
                        </button>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {disciplinas.map((d) => {
                            const status = (d.fase_status || "plano_ensino") as FaseStatusPEIDisciplina;
                            const isRemoving = removing === d.id;
                            return (
                                <li key={d.id || d.disciplina} className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 8, padding: "14px 16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                        {onDisciplinaSelect ? (
                                            <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ padding: 0, minHeight: 0, font: "800 16px/22px var(--font-sans)" }} onClick={() => onDisciplinaSelect(d.disciplina)}>{d.disciplina}</button>
                                        ) : (
                                            <strong style={{ font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{d.disciplina}</strong>
                                        )}
                                        <span className={`omni-estado ${TOM_DA_FASE[status] || ""}`}>{FASE_STATUS_LABELS[status] || status}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                        <span className="omni-apoio" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                            <BookOpen aria-hidden style={{ width: 16, height: 16 }} /> {d.professor_regente_nome}
                                        </span>
                                        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno omni-btn--icone" onClick={() => desvincular(d)} disabled={isRemoving} aria-label={`Tirar ${d.disciplina}`} title="Tirar esta disciplina">
                                            <Trash2 aria-hidden />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {error && (
                <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{error}</div></div></div>
            )}

            {loading && <p className="omni-apoio" role="status">Carregando…</p>}
        </div>
    );
}
