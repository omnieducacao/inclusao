"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Activity, Loader2, AlertTriangle, ChevronDown, ChevronUp,
    Users, ArrowLeft, Save, BarChart3, Calendar, BookOpen, TrendingUp,
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
    }[];
}

interface HabilidadeAvaliada {
    codigo_bncc: string;
    descricao: string;
    nivel_atual: NivelOmnisfera;
    nivel_anterior: NivelOmnisfera | null;
    observacao: string;
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

const NIVEL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
    0: { bg: "rgba(239,68,68,.08)", border: "rgba(239,68,68,.2)", text: "#f87171" },
    1: { bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.2)", text: "#fbbf24" },
    2: { bg: "rgba(59,130,246,.08)", border: "rgba(59,130,246,.2)", text: "#60a5fa" },
    3: { bg: "rgba(16,185,129,.08)", border: "rgba(16,185,129,.2)", text: "#34d399" },
    4: { bg: "rgba(99,102,241,.08)", border: "rgba(99,102,241,.2)", text: "#818cf8" },
};

type TipoPeriodo = "bimestral" | "trimestral" | "semestral";

const PERIODOS: Record<TipoPeriodo, { label: string; periodos: { value: number; label: string }[] }> = {
    bimestral: {
        label: "Bimestral",
        periodos: [
            { value: 1, label: "1º Bimestre" },
            { value: 2, label: "2º Bimestre" },
            { value: 3, label: "3º Bimestre" },
            { value: 4, label: "4º Bimestre" },
        ],
    },
    trimestral: {
        label: "Trimestral",
        periodos: [
            { value: 1, label: "1º Trimestre" },
            { value: 2, label: "2º Trimestre" },
            { value: 3, label: "3º Trimestre" },
        ],
    },
    semestral: {
        label: "Semestral",
        periodos: [
            { value: 1, label: "1º Semestre" },
            { value: 2, label: "2º Semestre" },
        ],
    },
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AvaliacaoProcessualClient() {
    const [loading, setLoading] = useState(true);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [professorName, setProfessorName] = useState("");
    const [error, setError] = useState("");

    // Navigation
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<string | null>(null);
    const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("bimestral");
    const [selectedPeriodo, setSelectedPeriodo] = useState(1);

    // Avaliação state
    const [habilidades, setHabilidades] = useState<HabilidadeAvaliada[]>([]);
    const [observacaoGeral, setObservacaoGeral] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [salvou, setSalvou] = useState(false);
    const [expandedHab, setExpandedHab] = useState<string | null>(null);

    // ─── Fetch students ──────────────────────────────────────────────────

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

    // ─── Load existing processual for this bimestre ─────────────────────

    const loadRegistro = useCallback(async (studentId: string, disciplina: string, periodo: number) => {
        try {
            const res = await fetch(
                `/api/avaliacao-processual?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}&bimestre=${periodo}`
            );
            const data = await res.json();
            const registros = data.registros || [];
            if (registros.length > 0) {
                const reg = registros[0];
                if (reg.habilidades?.length) {
                    setHabilidades(reg.habilidades.map((h: Record<string, unknown>) => ({
                        codigo_bncc: h.codigo_bncc as string || "",
                        descricao: h.descricao as string || "",
                        nivel_atual: (h.nivel_atual as NivelOmnisfera) ?? 0,
                        nivel_anterior: (h.nivel_anterior as NivelOmnisfera) ?? null,
                        observacao: h.observacao as string || "",
                    })));
                }
                setObservacaoGeral(reg.observacao_geral || "");
            }
        } catch { /* silent */ }
    }, []);

    // ─── Load habilidades from plano genérico or matriz ──────────────────

    const loadHabilidades = useCallback(async (aluno: Aluno, disciplina: string) => {
        try {
            // Try loading from BNCC matrix
            const gradeNum = aluno.grade?.match(/\d+/)?.[0] || "6";
            const res = await fetch(
                `/api/avaliacao-diagnostica/matriz?section=bncc&disciplina=${encodeURIComponent(disciplina)}`
            );
            const data = await res.json();
            const habs = (data.habilidades || []).slice(0, 10); // First 10 for the grade

            const mapped: HabilidadeAvaliada[] = habs
                .filter((h: Record<string, unknown>) => {
                    const ano = h.ano as string || "";
                    return ano.includes(gradeNum);
                })
                .slice(0, 8)
                .map((h: Record<string, unknown>) => ({
                    codigo_bncc: h.codigo as string || h.habilidade as string || "",
                    descricao: h.habilidade as string || h.descritor as string || "",
                    nivel_atual: 0 as NivelOmnisfera,
                    nivel_anterior: null,
                    observacao: "",
                }));

            if (mapped.length > 0) {
                setHabilidades(mapped);
            } else {
                // Fallback: generate placeholder habilidades
                setHabilidades([
                    { codigo_bncc: `EF${gradeNum}LP01`, descricao: `Habilidade de Leitura — ${disciplina}`, nivel_atual: 0, nivel_anterior: null, observacao: "" },
                    { codigo_bncc: `EF${gradeNum}LP02`, descricao: `Habilidade de Escrita — ${disciplina}`, nivel_atual: 0, nivel_anterior: null, observacao: "" },
                    { codigo_bncc: `EF${gradeNum}LP03`, descricao: `Habilidade de Interpretação — ${disciplina}`, nivel_atual: 0, nivel_anterior: null, observacao: "" },
                ]);
            }
        } catch {
            setHabilidades([]);
        }
    }, []);

    // ─── Navigation handlers ────────────────────────────────────────────

    const openProcessual = useCallback((aluno: Aluno, disciplina: string) => {
        setSelectedAluno(aluno);
        setSelectedDisc(disciplina);
        setHabilidades([]);
        setObservacaoGeral("");
        setSalvou(false);

        // Load existing registro for current periodo
        loadRegistro(aluno.id, disciplina, selectedPeriodo);
        // Load habilidades
        loadHabilidades(aluno, disciplina);
    }, [selectedPeriodo, loadRegistro, loadHabilidades]);

    const goBack = () => {
        setSelectedAluno(null);
        setSelectedDisc(null);
        setHabilidades([]);
        setObservacaoGeral("");
        setSalvou(false);
    };

    // Update nivel for a habilidade
    const setNivel = (idx: number, nivel: NivelOmnisfera) => {
        setHabilidades(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], nivel_atual: nivel };
            return updated;
        });
    };

    // Update observacao for a habilidade
    const setObsHab = (idx: number, obs: string) => {
        setHabilidades(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], observacao: obs };
            return updated;
        });
    };

    // ─── Save ───────────────────────────────────────────────────────────

    const salvar = async () => {
        if (!selectedAluno || !selectedDisc) return;
        setSalvando(true);
        setSalvou(false);

        try {
            const res = await fetch("/api/avaliacao-processual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedAluno.id,
                    disciplina: selectedDisc,
                    bimestre: selectedPeriodo,
                    tipo_periodo: tipoPeriodo,
                    ano_letivo: new Date().getFullYear(),
                    habilidades: habilidades.map(h => ({
                        codigo_bncc: h.codigo_bncc,
                        descricao: h.descricao,
                        nivel_atual: h.nivel_atual,
                        nivel_anterior: h.nivel_anterior,
                        observacao: h.observacao,
                    })),
                    observacao_geral: observacaoGeral,
                }),
            });

            if (!res.ok) throw new Error("Erro ao salvar");
            setSalvou(true);
            setTimeout(() => setSalvou(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar");
        } finally { setSalvando(false); }
    };

    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: "center" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#10b981", margin: "0 auto 12px" }} />
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
                <button onClick={() => { setError(""); fetchAlunos(); }} style={{
                    padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)",
                    background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: 13,
                }}>Tentar novamente</button>
            </div>
        );
    }

    // ─── Registro View (student + discipline selected) ──────────────────

    if (selectedAluno && selectedDisc) {
        const mediaHabs = habilidades.length > 0
            ? Math.round(habilidades.reduce((acc, h) => acc + h.nivel_atual, 0) / habilidades.length * 10) / 10
            : 0;

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
                        border: "none", background: "rgba(16,185,129,.1)", color: "#34d399", cursor: "pointer",
                    }}><ArrowLeft size={16} /></button>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {selectedAluno.name} <span style={{ margin: "0 6px", opacity: .5 }}>›</span>
                        <strong style={{ color: "var(--text-primary)" }}>{selectedDisc}</strong>
                    </span>
                </div>

                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    borderRadius: 14, padding: "20px 24px", color: "#fff", marginBottom: 20,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <Activity size={22} />
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                            Avaliação Processual — {selectedDisc}
                        </h2>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, opacity: .85 }}>
                        Registre o nível Omnisfera atual do estudante em cada habilidade.
                    </p>
                </div>

                {/* Tipo de período */}
                <div style={{
                    display: "flex", gap: 6, marginBottom: 10,
                    padding: 4, borderRadius: 12,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    {(["bimestral", "trimestral", "semestral"] as TipoPeriodo[]).map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => {
                                setTipoPeriodo(tipo);
                                setSelectedPeriodo(1);
                                loadRegistro(selectedAluno.id, selectedDisc, 1);
                            }}
                            style={{
                                flex: 1, padding: "8px 10px", borderRadius: 10,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                cursor: "pointer", fontSize: 12, fontWeight: 700,
                                border: "none",
                                background: tipoPeriodo === tipo ? "rgba(16,185,129,.12)" : "transparent",
                                color: tipoPeriodo === tipo ? "#10b981" : "var(--text-muted, #94a3b8)",
                                transition: "all .2s",
                            }}
                        >
                            {PERIODOS[tipo].label}
                        </button>
                    ))}
                </div>

                {/* Período selector */}
                <div style={{
                    display: "flex", gap: 6, marginBottom: 20,
                    padding: 4, borderRadius: 12,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    {PERIODOS[tipoPeriodo].periodos.map(p => (
                        <button
                            key={p.value}
                            onClick={() => {
                                setSelectedPeriodo(p.value);
                                loadRegistro(selectedAluno.id, selectedDisc, p.value);
                            }}
                            style={{
                                flex: 1, padding: "10px 12px", borderRadius: 10,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                cursor: "pointer", fontSize: 13, fontWeight: 700,
                                border: "none",
                                background: selectedPeriodo === p.value ? "linear-gradient(135deg, #059669, #10b981)" : "transparent",
                                color: selectedPeriodo === p.value ? "#fff" : "var(--text-muted, #94a3b8)",
                                transition: "all .2s",
                            }}
                        >
                            <Calendar size={13} /> {p.label}
                        </button>
                    ))}
                </div>

                {/* Summary card */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                    <div style={{
                        ...cardS, padding: 16, textAlign: "center",
                        background: "rgba(16,185,129,.04)",
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{mediaHabs}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Média Omnisfera</div>
                    </div>
                    <div style={{
                        ...cardS, padding: 16, textAlign: "center",
                        background: "rgba(59,130,246,.04)",
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#3b82f6" }}>{habilidades.length}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Habilidades</div>
                    </div>
                    <div style={{
                        ...cardS, padding: 16, textAlign: "center",
                        background: "rgba(99,102,241,.04)",
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#818cf8" }}>{selectedPeriodo}º</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{PERIODOS[tipoPeriodo].label.slice(0, -1)}</div>
                    </div>
                </div>

                {/* Habilidades list */}
                <div style={{ ...cardS, marginBottom: 20 }}>
                    <div style={{ ...headerS, background: "rgba(16,185,129,.05)" }}>
                        <BookOpen size={16} style={{ color: "#10b981" }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#10b981" }}>Habilidades BNCC</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                            Avalie cada habilidade na escala 0-4
                        </span>
                    </div>
                    <div style={bodyS}>
                        {habilidades.map((hab, idx) => {
                            const colors = NIVEL_COLORS[hab.nivel_atual] || NIVEL_COLORS[0];
                            const expanded = expandedHab === hab.codigo_bncc;
                            return (
                                <div key={hab.codigo_bncc + idx} style={{
                                    padding: "12px 14px", borderRadius: 10, marginBottom: 8,
                                    border: `1px solid ${colors.border}`,
                                    background: colors.bg,
                                    transition: "all .2s",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                                                    background: "rgba(99,102,241,.1)", color: "#818cf8",
                                                }}>{hab.codigo_bncc}</span>
                                                {hab.nivel_anterior !== null && hab.nivel_anterior !== hab.nivel_atual && (
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 2,
                                                        color: hab.nivel_atual > hab.nivel_anterior ? "#10b981" : "#f87171",
                                                    }}>
                                                        <TrendingUp size={10} />
                                                        {hab.nivel_anterior} → {hab.nivel_atual}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.4 }}>
                                                {hab.descricao.slice(0, 120)}{hab.descricao.length > 120 ? "..." : ""}
                                            </div>
                                        </div>

                                        {/* Nivel buttons */}
                                        <div style={{ display: "flex", gap: 4 }}>
                                            {([0, 1, 2, 3, 4] as NivelOmnisfera[]).map(n => {
                                                const nc = NIVEL_COLORS[n];
                                                const selected = hab.nivel_atual === n;
                                                return (
                                                    <button
                                                        key={n}
                                                        onClick={() => setNivel(idx, n)}
                                                        title={ESCALA_OMNISFERA[n]?.label}
                                                        style={{
                                                            width: 32, height: 32, borderRadius: 8,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            cursor: "pointer", fontSize: 13, fontWeight: 800,
                                                            border: selected ? `2px solid ${nc.text}` : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                                            background: selected ? nc.bg : "transparent",
                                                            color: selected ? nc.text : "var(--text-muted, #94a3b8)",
                                                            transition: "all .15s",
                                                        }}
                                                    >
                                                        {n}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setExpandedHab(expanded ? null : hab.codigo_bncc)}
                                            style={{
                                                display: "flex", alignItems: "center", padding: 4,
                                                border: "none", background: "transparent",
                                                color: "var(--text-muted)", cursor: "pointer",
                                            }}
                                        >
                                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>

                                    {/* Expanded observation */}
                                    {expanded && (
                                        <div style={{ marginTop: 10 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                                                Observação do professor:
                                            </div>
                                            <textarea
                                                value={hab.observacao}
                                                onChange={(e) => setObsHab(idx, e.target.value)}
                                                placeholder="Descreva o que observou..."
                                                rows={2}
                                                style={{
                                                    width: "100%", padding: "8px 10px", borderRadius: 8,
                                                    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                                    background: "var(--bg-primary, rgba(2,6,23,.3))",
                                                    color: "var(--text-primary)", fontSize: 12, resize: "vertical",
                                                    fontFamily: "inherit",
                                                }}
                                            />
                                            <div style={{
                                                fontSize: 10, color: "var(--text-muted)", marginTop: 4,
                                                display: "flex", alignItems: "center", gap: 4,
                                            }}>
                                                <BarChart3 size={10} />
                                                {ESCALA_OMNISFERA[hab.nivel_atual]?.label} — {ESCALA_OMNISFERA[hab.nivel_atual]?.descricao}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Observação geral */}
                <div style={{ ...cardS, marginBottom: 20 }}>
                    <div style={headerS}>
                        <Activity size={16} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Observação Geral</span>
                    </div>
                    <div style={bodyS}>
                        <textarea
                            value={observacaoGeral}
                            onChange={(e) => setObservacaoGeral(e.target.value)}
                            placeholder={`Percepções gerais sobre o estudante neste ${PERIODOS[tipoPeriodo].label.toLowerCase().slice(0, -1)}...`}
                            rows={3}
                            style={{
                                width: "100%", padding: "10px 12px", borderRadius: 8,
                                border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                background: "var(--bg-primary, rgba(2,6,23,.3))",
                                color: "var(--text-primary)", fontSize: 13, resize: "vertical",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                </div>

                {/* Save button */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    {salvou && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 13, fontWeight: 600 }}>
                            ✓ Salvo com sucesso
                        </div>
                    )}
                    <button
                        onClick={salvar}
                        disabled={salvando || habilidades.length === 0}
                        style={{
                            padding: "12px 24px", borderRadius: 10,
                            display: "flex", alignItems: "center", gap: 8,
                            cursor: salvando ? "not-allowed" : "pointer",
                            fontSize: 14, fontWeight: 700,
                            border: "none",
                            background: salvando
                                ? "var(--bg-tertiary)"
                                : "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff",
                            transition: "all .2s",
                            opacity: habilidades.length === 0 ? 0.5 : 1,
                        }}
                    >
                        {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {salvando ? "Salvando..." : "Salvar Avaliação"}
                    </button>
                </div>
            </div>
        );
    }

    // ─── Student List ───────────────────────────────────────────────────

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Page header */}
            <div style={{
                background: "linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)",
                borderRadius: 16, padding: "24px 28px", color: "#fff", marginBottom: 24,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center",
                        justifyContent: "center", background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
                    }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Avaliação Processual</h1>
                        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
                            {professorName} · {alunos.length} estudante{alunos.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.8, maxWidth: 600 }}>
                    Registre a evolução periódica de cada estudante na escala Omnisfera (0-4).
                    Suporta avaliação bimestral, trimestral ou semestral.
                </p>
            </div>

            {/* Link to Diagnóstica */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", borderRadius: 10, marginBottom: 20,
                background: "rgba(37,99,235,.05)", border: "1px solid rgba(37,99,235,.15)",
            }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    📋 Precisa fazer a avaliação diagnóstica inicial?
                </span>
                <a href="/avaliacao-diagnostica" style={{
                    fontSize: 12, fontWeight: 700, color: "#3b82f6", textDecoration: "none",
                }}>Ir para Diagnóstica →</a>
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
                {alunos.map(aluno => (
                    <div key={aluno.id} style={cardS}>
                        <div style={{ ...headerS, justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    background: "linear-gradient(135deg, #059669, #10b981)",
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
                        </div>

                        {/* Discipline buttons */}
                        <div style={{ ...bodyS, display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {aluno.disciplinas.map(disc => (
                                <button
                                    key={disc.id}
                                    onClick={() => openProcessual(aluno, disc.disciplina)}
                                    style={{
                                        padding: "8px 14px", borderRadius: 10,
                                        display: "flex", alignItems: "center", gap: 6,
                                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                                        border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                                        background: "var(--bg-primary, rgba(2,6,23,.3))",
                                        color: "var(--text-secondary, #cbd5e1)",
                                        transition: "all .2s",
                                    }}
                                >
                                    <Activity size={14} />
                                    {disc.disciplina}
                                    {disc.nivel_omnisfera !== null && (
                                        <span style={{
                                            fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 4,
                                            background: "rgba(16,185,129,.12)", color: "#10b981",
                                        }}>N{disc.nivel_omnisfera}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
