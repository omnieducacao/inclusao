"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Save, Loader2, CheckCircle2, BookOpen, Plus, X,
    Sparkles, GraduationCap, ChevronDown, ChevronRight,
    Trash2, Edit3, Copy,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Habilidade {
    codigo: string;
    descricao: string;
    habilidade_completa: string;
}

interface BnccEstrutura {
    disciplinas: string[];
    porDisciplina: Record<string, {
        unidades: string[];
        porUnidade: Record<string, {
            objetos: string[];
            porObjeto: Record<string, Habilidade[]>;
        }>;
    }>;
}

/** Um bloco de sequência didática */
interface SequenciaBloco {
    id: string;
    habilidades_bncc: string[];
    habilidades_descricoes: Record<string, string>; // codigo → descricao
    unidade_tematica: string;
    objeto_conhecimento: string;
    objetivos: string[];
    objetivos_livre: string;
    metodologias: string[];
    recursos: string[];
    avaliacoes: string[];
    avaliacao_livre: string;
}

interface PlanoData {
    bimestre: string;
    blocos: SequenciaBloco[];
}

interface Props {
    studentId: string | null;
    disciplina: string;
    anoSerie: string;
    onPlanoSaved?: (planoId: string) => void;
}

// ─── Constantes Pedagógicas ────────────────────────────────────────────────────

const BIMESTRES = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];
const TRIMESTRES = ["1º Trimestre", "2º Trimestre", "3º Trimestre"];
type PeriodoTipo = "bimestre" | "trimestre";

const METODOLOGIAS = [
    "Aula Expositiva Dialogada", "Metodologia Ativa", "Aprendizagem Baseada em Problemas",
    "Ensino Híbrido", "Sala de Aula Invertida", "Rotação por Estações",
    "Gamificação", "Aprendizagem Baseada em Projetos (PBL)", "Peer Instruction",
    "Estudo de Caso", "Aprendizagem Cooperativa", "Trabalho em Grupo",
];

const RECURSOS = [
    "Livro Didático", "Quadro/Giz", "Projetor/Datashow", "Lousa Digital",
    "Tablets/Celulares", "Internet", "Material Maker (Papel, Cola, etc)",
    "Jogos Pedagógicos", "Laboratório", "Material Dourado",
    "Fichas / Atividades Impressas", "Vídeos Educativos", "Mapas / Gráficos",
    "Material Concreto", "Material Adaptado", "Recursos de CAA",
    "Música / Áudio", "Biblioteca",
];

const AVALIACOES = [
    "Observação Direta", "Registro Escrito", "Portfólio", "Autoavaliação",
    "Avaliação por Pares", "Prova Escrita", "Trabalho em Grupo",
    "Apresentação Oral", "Produção Textual", "Projeto",
    "Participação em Aula", "Exercícios Práticos", "Roda de Conversa",
];

const OBJETIVOS_BLOOM: Record<string, string[]> = {
    "Lembrar": ["Identificar", "Listar", "Nomear", "Reconhecer", "Definir", "Citar"],
    "Entender": ["Descrever", "Explicar", "Classificar", "Resumir", "Comparar", "Interpretar"],
    "Aplicar": ["Aplicar", "Demonstrar", "Resolver", "Usar", "Ilustrar", "Calcular"],
    "Analisar": ["Analisar", "Diferenciar", "Comparar", "Categorizar", "Examinar", "Investigar"],
    "Avaliar": ["Avaliar", "Argumentar", "Defender", "Julgar", "Justificar", "Criticar"],
    "Criar": ["Criar", "Desenvolver", "Planejar", "Produzir", "Propor", "Construir"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

function emptyBloco(): SequenciaBloco {
    return {
        id: uid(),
        habilidades_bncc: [], habilidades_descricoes: {},
        unidade_tematica: "", objeto_conhecimento: "",
        objetivos: [], objetivos_livre: "",
        metodologias: [], recursos: [], avaliacoes: [], avaliacao_livre: "",
    };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardS: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    backgroundColor: "var(--bg-secondary, rgba(15,23,42,.4))",
    overflow: "hidden",
};
const headerS: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-default, rgba(148,163,184,.1))",
    backgroundColor: "var(--bg-tertiary, rgba(15,23,42,.3))",
};
const bodyS: React.CSSProperties = { padding: 16 };
const labelS: React.CSSProperties = {
    fontSize: 13, fontWeight: 600,
    color: "var(--text-secondary, #cbd5e1)",
    marginBottom: 6, display: "block",
};
const selectS: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    background: "var(--bg-primary, rgba(2,6,23,.5))",
    color: "var(--text-primary, #e2e8f0)",
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    fontSize: 14, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
};
const textareaS: React.CSSProperties = {
    width: "100%", minHeight: 60, padding: 10, borderRadius: 10,
    background: "var(--bg-primary, rgba(2,6,23,.5))",
    color: "var(--text-primary, #e2e8f0)",
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    fontSize: 13, lineHeight: 1.5, resize: "vertical",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
};

// ─── Tag Selector ─────────────────────────────────────────────────────────────

function TagSelector({ options, selected, onToggle, label, color = "#6366f1" }: {
    options: string[];
    selected: string[];
    onToggle: (v: string) => void;
    label: string;
    color?: string;
}) {
    return (
        <div>
            <label style={labelS}>{label}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {options.map(o => {
                    const active = selected.includes(o);
                    return (
                        <button key={o} onClick={() => onToggle(o)} type="button" style={{
                            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: active ? `1.5px solid ${color}` : "1px solid var(--border-default, rgba(148,163,184,.15))",
                            background: active ? `${color}18` : "transparent",
                            color: active ? color : "var(--text-muted, #94a3b8)",
                            cursor: "pointer", transition: "all .15s",
                        }}>
                            {active ? "✓ " : ""}{o}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Bloom Selector ───────────────────────────────────────────────────────────

function BloomObjectives({ selected, onToggle }: {
    selected: string[];
    onToggle: (v: string) => void;
}) {
    const [expandedCat, setExpandedCat] = useState<string | null>(null);
    return (
        <div>
            <label style={labelS}>Objetivos de Aprendizagem (Taxonomia de Bloom)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                {Object.keys(OBJETIVOS_BLOOM).map(cat => (
                    <button key={cat} onClick={() => setExpandedCat(expandedCat === cat ? null : cat)} type="button" style={{
                        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        border: expandedCat === cat ? "1.5px solid #8b5cf6" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                        background: expandedCat === cat ? "rgba(139,92,246,.12)" : "transparent",
                        color: expandedCat === cat ? "#a78bfa" : "var(--text-muted, #94a3b8)",
                        cursor: "pointer", transition: "all .15s",
                    }}>
                        {cat}
                    </button>
                ))}
            </div>
            {expandedCat && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 0" }}>
                    {OBJETIVOS_BLOOM[expandedCat].map(v => {
                        const active = selected.includes(v);
                        return (
                            <button key={v} onClick={() => onToggle(v)} type="button" style={{
                                padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 600,
                                border: active ? "1.5px solid #10b981" : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                background: active ? "rgba(16,185,129,.12)" : "transparent",
                                color: active ? "#34d399" : "var(--text-muted, #94a3b8)",
                                cursor: "pointer", transition: "all .15s",
                            }}>
                                {active ? "✓ " : ""}{v}
                            </button>
                        );
                    })}
                </div>
            )}
            {selected.length > 0 && (
                <div style={{ fontSize: 12, color: "#34d399", marginTop: 4 }}>
                    ✓ {selected.join(", ")}
                </div>
            )}
        </div>
    );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function PEIPlanoEnsino({ studentId, disciplina, anoSerie, onPlanoSaved }: Props) {
    // BNCC
    const [bncc, setBncc] = useState<BnccEstrutura | null>(null);
    const [bnccLoading, setBnccLoading] = useState(false);
    const [componenteSel, setComponenteSel] = useState("");
    const [unidadeSel, setUnidadeSel] = useState("");
    const [objetoSel, setObjetoSel] = useState("");

    // Período
    const [periodoTipo, setPeriodoTipo] = useState<PeriodoTipo>("bimestre");
    const periodos = periodoTipo === "bimestre" ? BIMESTRES : TRIMESTRES;

    // Plano
    const [plano, setPlano] = useState<PlanoData>({ bimestre: BIMESTRES[0], blocos: [] });
    const [planoId, setPlanoId] = useState<string | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form state (current block being edited)
    const [form, setForm] = useState<SequenciaBloco>(emptyBloco());

    // UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [iaLoading, setIaLoading] = useState(false);
    const [expandedBloco, setExpandedBloco] = useState<string | null>(null);

    // ─── BNCC loading ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!anoSerie) return;
        setBnccLoading(true);
        fetch(`/api/bncc/ef?serie=${encodeURIComponent(anoSerie)}&estrutura=1`)
            .then(r => r.json())
            .then((data: BnccEstrutura) => {
                if (data?.disciplinas?.length) {
                    setBncc(data);
                    // Auto-selecionar componente se disciplina é específica
                    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                    const dNorm = normalize(disciplina);
                    if (dNorm && dNorm !== "geral") {
                        const match = data.disciplinas.find(d => {
                            const bNorm = normalize(d);
                            return bNorm === dNorm || bNorm.includes(dNorm) || dNorm.includes(bNorm);
                        });
                        if (match) setComponenteSel(match);
                    }
                }
            })
            .catch(() => { })
            .finally(() => setBnccLoading(false));
    }, [anoSerie, disciplina]);

    // ─── Plano loading ──────────────────────────────────────────────────────

    useEffect(() => {
        if (!disciplina || !anoSerie) { setLoading(false); return; }
        setLoading(true);
        fetch(`/api/pei/plano-ensino?disciplina=${encodeURIComponent(disciplina)}&ano_serie=${encodeURIComponent(anoSerie)}`)
            .then(r => r.json())
            .then(data => {
                const planos = data.planos || [];
                if (planos.length > 0) {
                    const p = planos[0];
                    setPlanoId(p.id);
                    // Parse conteudo
                    let blocos: SequenciaBloco[] = [];
                    try {
                        const parsed = typeof p.conteudo === "string" ? JSON.parse(p.conteudo) : p.conteudo;
                        if (parsed?.blocos && Array.isArray(parsed.blocos)) {
                            blocos = parsed.blocos;
                        } else if (parsed?.objetivos) {
                            // Backward compat: convert old flat format to single block
                            blocos = [{
                                id: uid(),
                                habilidades_bncc: p.habilidades_bncc || [],
                                habilidades_descricoes: {},
                                unidade_tematica: parsed.unidades_tematicas?.[0] || "",
                                objeto_conhecimento: parsed.objetos_conhecimento?.[0] || "",
                                objetivos: typeof parsed.objetivos === "string" && parsed.objetivos ? [parsed.objetivos] : [],
                                objetivos_livre: typeof parsed.objetivos === "string" ? parsed.objetivos : "",
                                metodologias: typeof parsed.metodologia === "string" && parsed.metodologia ? [parsed.metodologia] : [],
                                recursos: parsed.recursos || [],
                                avaliacoes: typeof parsed.avaliacao === "string" && parsed.avaliacao ? [parsed.avaliacao] : [],
                                avaliacao_livre: typeof parsed.avaliacao === "string" ? parsed.avaliacao : "",
                            }];
                        }
                    } catch { blocos = []; }

                    setPlano({ bimestre: p.bimestre || BIMESTRES[0], blocos });
                    // Detect period type
                    if (p.bimestre?.includes("Trimestre")) setPeriodoTipo("trimestre");
                    setSaved(true);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [disciplina, anoSerie]);

    // ─── BNCC cascading data ────────────────────────────────────────────────

    const discData = useMemo(() => {
        if (!bncc || !componenteSel) return null;
        return bncc.porDisciplina[componenteSel] || null;
    }, [bncc, componenteSel]);

    const unidadeData = useMemo(() => {
        if (!discData || !unidadeSel) return null;
        return discData.porUnidade[unidadeSel] || null;
    }, [discData, unidadeSel]);

    const habsDoObjeto = useMemo(() => {
        if (!unidadeData || !objetoSel) return null;
        return unidadeData.porObjeto[objetoSel] || null;
    }, [unidadeData, objetoSel]);

    // Available disciplines
    const bnccDisciplinas = useMemo(() => {
        if (!bncc) return [];
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const dNorm = normalize(disciplina);
        if (dNorm && dNorm !== "geral") {
            const match = bncc.disciplinas.find(d => {
                const bNorm = normalize(d);
                return bNorm === dNorm || bNorm.includes(dNorm) || dNorm.includes(bNorm);
            });
            if (match) return [match];
        }
        return bncc.disciplinas;
    }, [bncc, disciplina]);

    // ─── Form handlers ──────────────────────────────────────────────────────

    const toggleFormTag = useCallback((field: "objetivos" | "metodologias" | "recursos" | "avaliacoes", value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value],
        }));
    }, []);

    const toggleFormHab = useCallback((hab: Habilidade) => {
        setForm(prev => {
            const has = prev.habilidades_bncc.includes(hab.codigo);
            return {
                ...prev,
                habilidades_bncc: has
                    ? prev.habilidades_bncc.filter(c => c !== hab.codigo)
                    : [...prev.habilidades_bncc, hab.codigo],
                habilidades_descricoes: has
                    ? (() => { const d = { ...prev.habilidades_descricoes }; delete d[hab.codigo]; return d; })()
                    : { ...prev.habilidades_descricoes, [hab.codigo]: hab.descricao },
            };
        });
    }, []);

    // ─── Add / Edit block ───────────────────────────────────────────────────

    const addBloco = useCallback(() => {
        if (form.habilidades_bncc.length === 0 && !form.objetivos_livre && form.objetivos.length === 0) return;
        // Capture BNCC context
        const bloco: SequenciaBloco = {
            ...form,
            id: editingIndex !== null ? form.id : uid(),
            unidade_tematica: unidadeSel,
            objeto_conhecimento: objetoSel,
        };

        setPlano(prev => {
            const blocos = [...prev.blocos];
            if (editingIndex !== null) {
                blocos[editingIndex] = bloco;
            } else {
                blocos.push(bloco);
            }
            return { ...prev, blocos };
        });
        setForm(emptyBloco());
        setEditingIndex(null);
        setSaved(false);
    }, [form, editingIndex, unidadeSel, objetoSel]);

    const editBloco = useCallback((index: number) => {
        const b = plano.blocos[index];
        setForm(b);
        setEditingIndex(index);
        // Restore BNCC selects if possible
        if (b.unidade_tematica) setUnidadeSel(b.unidade_tematica);
        if (b.objeto_conhecimento) setObjetoSel(b.objeto_conhecimento);
    }, [plano.blocos]);

    const removeBloco = useCallback((index: number) => {
        setPlano(prev => ({
            ...prev,
            blocos: prev.blocos.filter((_, i) => i !== index),
        }));
        setSaved(false);
    }, []);

    const duplicateBloco = useCallback((index: number) => {
        setPlano(prev => {
            const clone = { ...prev.blocos[index], id: uid() };
            return { ...prev, blocos: [...prev.blocos, clone] };
        });
        setSaved(false);
    }, []);

    // ─── AI Suggestion ──────────────────────────────────────────────────────

    const gerarSugestaoIA = useCallback(async () => {
        if (form.habilidades_bncc.length === 0) return;
        setIaLoading(true);
        try {
            const res = await fetch("/api/pei/plano-ensino/sugestao-ia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    habilidades: form.habilidades_bncc,
                    descricoes: form.habilidades_descricoes,
                    componente: componenteSel,
                    unidade: unidadeSel,
                    objeto: objetoSel,
                    serie: anoSerie,
                }),
            });
            const data = await res.json();
            if (data.sugestao) {
                setForm(prev => ({
                    ...prev,
                    objetivos: [...new Set([...prev.objetivos, ...(data.sugestao.objetivos || [])])],
                    objetivos_livre: data.sugestao.objetivos_texto || prev.objetivos_livre,
                    metodologias: [...new Set([...prev.metodologias, ...(data.sugestao.metodologias || [])])],
                    recursos: [...new Set([...prev.recursos, ...(data.sugestao.recursos || [])])],
                    avaliacoes: [...new Set([...prev.avaliacoes, ...(data.sugestao.avaliacoes || [])])],
                }));
            }
        } catch { /* silent */ }
        finally { setIaLoading(false); }
    }, [form.habilidades_bncc, form.habilidades_descricoes, componenteSel, unidadeSel, objetoSel, anoSerie]);

    // ─── Save ───────────────────────────────────────────────────────────────

    const salvar = async () => {
        setSaving(true);
        setError("");
        try {
            // Collect all habilidades from all blocks
            const todasHabs = [...new Set(plano.blocos.flatMap(b => b.habilidades_bncc))];

            const conteudoJson = JSON.stringify({ blocos: plano.blocos });
            const res = await fetch("/api/pei/plano-ensino", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: planoId || undefined,
                    disciplina,
                    ano_serie: anoSerie,
                    conteudo: conteudoJson,
                    habilidades_bncc: todasHabs,
                    bimestre: plano.bimestre,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlanoId(data.plano?.id);
            setSaved(true);
            onPlanoSaved?.(data.plano?.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar");
        } finally {
            setSaving(false);
        }
    };

    // ─── Loading ────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "#10b981", margin: "0 auto" }} />
                <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 13 }}>Carregando plano...</p>
            </div>
        );
    }

    const totalHabs = plano.blocos.reduce((acc, b) => acc + b.habilidades_bncc.length, 0);
    const canAddBloco = form.habilidades_bncc.length > 0 || form.objetivos.length > 0 || form.objetivos_livre.trim().length > 0;

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                borderRadius: 14, padding: "18px 22px", color: "#fff",
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <BookOpen size={22} />
                        <div>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                                Plano de Ensino — {disciplina}
                            </h4>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
                                {anoSerie}
                                {bncc && <> · BNCC integrada ({bnccDisciplinas.length} componente{bnccDisciplinas.length !== 1 ? "s" : ""})</>}
                                {plano.blocos.length > 0 && <> · {plano.blocos.length} bloco{plano.blocos.length !== 1 ? "s" : ""}</>}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {saved && (
                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#bbf7d0" }}>
                                <CheckCircle2 size={14} /> Salvo
                            </span>
                        )}
                        {totalHabs > 0 && (
                            <span style={{ background: "rgba(255,255,255,.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                {totalHabs} hab.
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Período ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 10, background: "var(--bg-tertiary, rgba(15,23,42,.4))" }}>
                    {(["bimestre", "trimestre"] as const).map(tipo => (
                        <button key={tipo} onClick={() => {
                            setPeriodoTipo(tipo);
                            setPlano(p => ({ ...p, bimestre: tipo === "bimestre" ? BIMESTRES[0] : TRIMESTRES[0] }));
                        }} type="button" style={{
                            padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                            border: "none",
                            background: periodoTipo === tipo ? "rgba(16,185,129,.15)" : "transparent",
                            color: periodoTipo === tipo ? "#34d399" : "var(--text-muted, #94a3b8)",
                            cursor: "pointer", transition: "all .2s", textTransform: "capitalize",
                        }}>
                            {tipo}
                        </button>
                    ))}
                </div>
                {periodos.map(b => (
                    <button key={b} onClick={() => setPlano(p => ({ ...p, bimestre: b }))} type="button" style={{
                        padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        border: plano.bimestre === b ? "1.5px solid #10b981" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                        background: plano.bimestre === b ? "rgba(16,185,129,.12)" : "transparent",
                        color: plano.bimestre === b ? "#34d399" : "var(--text-muted, #94a3b8)",
                        cursor: "pointer", transition: "all .2s",
                    }}>
                        {b}
                    </button>
                ))}
            </div>

            {/* ── Split Layout ────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
                {/* ═══ LEFT: Formulário ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* BNCC Cascading Selects */}
                    {bnccLoading ? (
                        <div style={{ ...cardS, padding: 24, textAlign: "center" }}>
                            <Loader2 size={20} className="animate-spin" style={{ color: "#6366f1", margin: "0 auto" }} />
                            <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 12 }}>Carregando BNCC...</p>
                        </div>
                    ) : bncc ? (
                        <div style={cardS}>
                            <div style={headerS}>
                                <GraduationCap size={16} style={{ color: "#818cf8" }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                                    BNCC — Selecione Habilidades
                                </span>
                            </div>
                            <div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 10 }}>
                                {/* Componente */}
                                <div>
                                    <label style={labelS}>Componente Curricular</label>
                                    <select value={componenteSel} onChange={e => {
                                        setComponenteSel(e.target.value);
                                        setUnidadeSel(""); setObjetoSel("");
                                    }} style={selectS}>
                                        <option value="">— Selecione —</option>
                                        {bnccDisciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                {/* Unidade Temática */}
                                {componenteSel && discData && (
                                    <div>
                                        <label style={labelS}>Unidade Temática</label>
                                        <select value={unidadeSel} onChange={e => {
                                            setUnidadeSel(e.target.value); setObjetoSel("");
                                        }} style={selectS}>
                                            <option value="">— Selecione —</option>
                                            {discData.unidades.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Objeto do Conhecimento */}
                                {unidadeSel && unidadeData && (
                                    <div>
                                        <label style={labelS}>Objeto do Conhecimento</label>
                                        <select value={objetoSel} onChange={e => setObjetoSel(e.target.value)} style={selectS}>
                                            <option value="">— Selecione —</option>
                                            {unidadeData.objetos.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Habilidades (checkboxes) */}
                                {objetoSel && habsDoObjeto && habsDoObjeto.length > 0 && (
                                    <div>
                                        <label style={labelS}>Habilidades ({habsDoObjeto.length})</label>
                                        <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                                            {habsDoObjeto.map(h => {
                                                const sel = form.habilidades_bncc.includes(h.codigo);
                                                return (
                                                    <label key={h.codigo} style={{
                                                        display: "flex", alignItems: "flex-start", gap: 8,
                                                        padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                                                        background: sel ? "rgba(16,185,129,.08)" : "transparent",
                                                        border: sel ? "1px solid rgba(16,185,129,.2)" : "1px solid transparent",
                                                    }}>
                                                        <input type="checkbox" checked={sel} onChange={() => toggleFormHab(h)} style={{
                                                            marginTop: 3, accentColor: "#10b981", width: 16, height: 16, flexShrink: 0,
                                                        }} />
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: sel ? "#34d399" : "#818cf8", marginRight: 6 }}>
                                                                {h.codigo}
                                                            </span>
                                                            <span style={{ fontSize: 12, color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.4 }}>
                                                                {h.descricao}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Selected habs summary */}
                                {form.habilidades_bncc.length > 0 && (
                                    <div style={{
                                        display: "flex", flexWrap: "wrap", gap: 4,
                                        padding: "8px 10px", borderRadius: 8,
                                        background: "rgba(16,185,129,.06)",
                                        border: "1px solid rgba(16,185,129,.15)",
                                    }}>
                                        {form.habilidades_bncc.map(c => (
                                            <span key={c} onClick={() => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    habilidades_bncc: prev.habilidades_bncc.filter(x => x !== c),
                                                }));
                                            }} style={{
                                                padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                                                background: "rgba(16,185,129,.15)", color: "#34d399",
                                                cursor: "pointer",
                                            }}>
                                                {c} ✕
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Objetivos */}
                    <div style={cardS}>
                        <div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 12 }}>
                            <BloomObjectives
                                selected={form.objetivos}
                                onToggle={v => toggleFormTag("objetivos", v)}
                            />
                            <textarea
                                placeholder="Ou escreva objetivos livres..."
                                value={form.objetivos_livre}
                                onChange={e => setForm(f => ({ ...f, objetivos_livre: e.target.value }))}
                                style={{ ...textareaS, minHeight: 50 }}
                            />
                        </div>
                    </div>

                    {/* Metodologia */}
                    <div style={cardS}>
                        <div style={bodyS}>
                            <TagSelector
                                options={METODOLOGIAS}
                                selected={form.metodologias}
                                onToggle={v => toggleFormTag("metodologias", v)}
                                label="Metodologia"
                                color="#8b5cf6"
                            />
                        </div>
                    </div>

                    {/* Recursos */}
                    <div style={cardS}>
                        <div style={bodyS}>
                            <TagSelector
                                options={RECURSOS}
                                selected={form.recursos}
                                onToggle={v => toggleFormTag("recursos", v)}
                                label="Recursos Didáticos"
                                color="#f59e0b"
                            />
                        </div>
                    </div>

                    {/* Avaliação */}
                    <div style={cardS}>
                        <div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 10 }}>
                            <TagSelector
                                options={AVALIACOES}
                                selected={form.avaliacoes}
                                onToggle={v => toggleFormTag("avaliacoes", v)}
                                label="Avaliação"
                                color="#ec4899"
                            />
                            <textarea
                                placeholder="Detalhes adicionais da avaliação..."
                                value={form.avaliacao_livre}
                                onChange={e => setForm(f => ({ ...f, avaliacao_livre: e.target.value }))}
                                style={{ ...textareaS, minHeight: 40 }}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {/* AI Suggestion */}
                        <button onClick={gerarSugestaoIA} disabled={iaLoading || form.habilidades_bncc.length === 0} type="button" style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            border: "1.5px solid #8b5cf6",
                            background: "rgba(139,92,246,.1)",
                            color: "#a78bfa",
                            cursor: form.habilidades_bncc.length === 0 ? "not-allowed" : "pointer",
                            opacity: form.habilidades_bncc.length === 0 ? 0.5 : 1,
                            transition: "all .2s",
                        }}>
                            {iaLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            Sugestão IA
                        </button>

                        {/* Add Block */}
                        <button onClick={addBloco} disabled={!canAddBloco} type="button" style={{
                            display: "flex", alignItems: "center", gap: 6, flex: 1,
                            padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            border: "none",
                            background: canAddBloco ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "rgba(148,163,184,.15)",
                            color: canAddBloco ? "#fff" : "var(--text-muted, #64748b)",
                            cursor: canAddBloco ? "pointer" : "not-allowed",
                            justifyContent: "center", transition: "all .2s",
                        }}>
                            <Plus size={16} />
                            {editingIndex !== null ? "Salvar Bloco" : "Adicionar Bloco"}
                        </button>

                        {editingIndex !== null && (
                            <button onClick={() => { setForm(emptyBloco()); setEditingIndex(null); }} type="button" style={{
                                padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                background: "transparent", color: "var(--text-muted, #94a3b8)",
                                cursor: "pointer",
                            }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT: Sequência Didática acumulada ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={headerS}>
                        <BookOpen size={16} style={{ color: "#10b981" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                            Sequência Didática — {plano.bimestre}
                        </span>
                        <span style={{
                            marginLeft: "auto", fontSize: 11, fontWeight: 700,
                            color: "#10b981", background: "rgba(16,185,129,.1)",
                            padding: "2px 8px", borderRadius: 6,
                        }}>
                            {plano.blocos.length} bloco{plano.blocos.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {plano.blocos.length === 0 ? (
                        <div style={{
                            padding: "40px 20px", textAlign: "center",
                            border: "2px dashed var(--border-default, rgba(148,163,184,.15))",
                            borderRadius: 14, color: "var(--text-muted, #64748b)",
                        }}>
                            <BookOpen size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Nenhum bloco adicionado</p>
                            <p style={{ fontSize: 12, margin: 0, opacity: 0.7 }}>
                                Selecione habilidades BNCC e preencha o formulário ao lado para adicionar blocos à sequência didática.
                            </p>
                        </div>
                    ) : (
                        <>
                            {plano.blocos.map((bloco, index) => {
                                const isExpanded = expandedBloco === bloco.id;
                                return (
                                    <div key={bloco.id} style={{
                                        ...cardS,
                                        border: editingIndex === index
                                            ? "1.5px solid #8b5cf6"
                                            : "1px solid var(--border-default, rgba(148,163,184,.15))",
                                    }}>
                                        {/* Block header */}
                                        <button onClick={() => setExpandedBloco(isExpanded ? null : bloco.id)} type="button" style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: 8,
                                            padding: "10px 14px", border: "none",
                                            background: "var(--bg-tertiary, rgba(15,23,42,.3))",
                                            cursor: "pointer", textAlign: "left",
                                        }}>
                                            {isExpanded ? <ChevronDown size={14} style={{ color: "#10b981" }} /> : <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #e2e8f0)", flex: 1 }}>
                                                Bloco {index + 1}
                                                {bloco.unidade_tematica && (
                                                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted, #94a3b8)", marginLeft: 8 }}>
                                                        {bloco.unidade_tematica.slice(0, 40)}{bloco.unidade_tematica.length > 40 ? "..." : ""}
                                                    </span>
                                                )}
                                            </span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700,
                                                color: "#818cf8", background: "rgba(99,102,241,.1)",
                                                padding: "2px 6px", borderRadius: 4,
                                            }}>
                                                {bloco.habilidades_bncc.length} hab.
                                            </span>
                                        </button>

                                        {/* Block content (expanded) */}
                                        {isExpanded && (
                                            <div style={{ ...bodyS, fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                                {/* Habilidades */}
                                                {bloco.habilidades_bncc.length > 0 && (
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: "#818cf8", fontSize: 11 }}>Habilidades BNCC:</span>
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                                                            {bloco.habilidades_bncc.map(c => (
                                                                <span key={c} title={bloco.habilidades_descricoes[c] || ""} style={{
                                                                    padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                                                                    background: "rgba(99,102,241,.1)", color: "#818cf8",
                                                                }}>
                                                                    {c}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Objetivos */}
                                                {(bloco.objetivos.length > 0 || bloco.objetivos_livre) && (
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: "#a78bfa", fontSize: 11 }}>Objetivos:</span>
                                                        <p style={{ margin: "2px 0 0", color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.4 }}>
                                                            {[...bloco.objetivos, bloco.objetivos_livre].filter(Boolean).join("; ")}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Metodologia */}
                                                {bloco.metodologias.length > 0 && (
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: "#8b5cf6", fontSize: 11 }}>Metodologia:</span>
                                                        <p style={{ margin: "2px 0 0", color: "var(--text-secondary, #cbd5e1)" }}>
                                                            {bloco.metodologias.join(", ")}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Recursos */}
                                                {bloco.recursos.length > 0 && (
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: 11 }}>Recursos:</span>
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                                                            {bloco.recursos.map(r => (
                                                                <span key={r} style={{
                                                                    padding: "2px 8px", borderRadius: 10, fontSize: 11,
                                                                    background: "rgba(245,158,11,.08)", color: "#fbbf24",
                                                                }}>
                                                                    {r}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Avaliação */}
                                                {(bloco.avaliacoes.length > 0 || bloco.avaliacao_livre) && (
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: "#ec4899", fontSize: 11 }}>Avaliação:</span>
                                                        <p style={{ margin: "2px 0 0", color: "var(--text-secondary, #cbd5e1)" }}>
                                                            {[...bloco.avaliacoes, bloco.avaliacao_livre].filter(Boolean).join("; ")}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div style={{ display: "flex", gap: 6, paddingTop: 6, borderTop: "1px solid var(--border-default, rgba(148,163,184,.08))" }}>
                                                    <button onClick={() => editBloco(index)} type="button" style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                        border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                                        background: "transparent", color: "#818cf8", cursor: "pointer",
                                                    }}>
                                                        <Edit3 size={12} /> Editar
                                                    </button>
                                                    <button onClick={() => duplicateBloco(index)} type="button" style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                        border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                                        background: "transparent", color: "#94a3b8", cursor: "pointer",
                                                    }}>
                                                        <Copy size={12} /> Duplicar
                                                    </button>
                                                    <button onClick={() => removeBloco(index)} type="button" style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                        border: "1px solid rgba(239,68,68,.2)",
                                                        background: "transparent", color: "#ef4444", cursor: "pointer",
                                                        marginLeft: "auto",
                                                    }}>
                                                        <Trash2 size={12} /> Remover
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Save button */}
                            <button onClick={salvar} disabled={saving || plano.blocos.length === 0} type="button" style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                width: "100%", padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                                border: "none",
                                background: saving ? "rgba(148,163,184,.15)" : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                color: "#fff",
                                cursor: saving ? "not-allowed" : "pointer",
                                transition: "all .2s",
                            }}>
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? "Salvando..." : `Salvar Plano (${plano.blocos.length} bloco${plano.blocos.length !== 1 ? "s" : ""})`}
                            </button>

                            {error && (
                                <div style={{
                                    padding: "10px 14px", borderRadius: 10, fontSize: 13,
                                    background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
                                    color: "#f87171",
                                }}>
                                    {error}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
