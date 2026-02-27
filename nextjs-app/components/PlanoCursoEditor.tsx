"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Save, Loader2, CheckCircle2, BookOpen, Plus, X,
    Sparkles, GraduationCap, ChevronDown, ChevronRight,
    Trash2, Edit3, Copy,
} from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";

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

interface SequenciaBloco {
    id: string;
    habilidades_bncc: string[];
    habilidades_descricoes: Record<string, string>;
    unidade_tematica: string;
    objeto_conhecimento: string;
    objetivos: string[];
    objetivos_livre: string;
    metodologias: string[];
    metodologia_livre: string;
    recursos: string[];
    avaliacoes: string[];
    avaliacao_livre: string;
}

interface PlanoData {
    bimestre: string;
    blocos: SequenciaBloco[];
}

interface Props {
    componente: string;
    serie: string;
    onSaved?: () => void;
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
        id: uid(), habilidades_bncc: [], habilidades_descricoes: {},
        unidade_tematica: "", objeto_conhecimento: "",
        objetivos: [], objetivos_livre: "",
        metodologias: [], metodologia_livre: "",
        recursos: [], avaliacoes: [], avaliacao_livre: "",
    };
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
const labelS: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "var(--text-secondary, #cbd5e1)", marginBottom: 6, display: "block",
};
const selectS: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    background: "var(--bg-primary, rgba(2,6,23,.5))", color: "var(--text-primary, #e2e8f0)",
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
};
const textareaS: React.CSSProperties = {
    width: "100%", minHeight: 60, padding: 10, borderRadius: 10,
    background: "var(--bg-primary, rgba(2,6,23,.5))", color: "var(--text-primary, #e2e8f0)",
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    fontSize: 13, lineHeight: 1.5, resize: "vertical", fontFamily: "'Plus Jakarta Sans', sans-serif",
};

// ─── Tag Selector ─────────────────────────────────────────────────────────────

function TagSelector({ options, selected, onToggle, label, color = "#6366f1" }: {
    options: string[]; selected: string[]; onToggle: (v: string) => void; label: string; color?: string;
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

function BloomObjectives({ selected, onToggle }: { selected: string[]; onToggle: (v: string) => void }) {
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
                <div style={{ fontSize: 12, color: "#34d399", marginTop: 4 }}>✓ {selected.join(", ")}</div>
            )}
        </div>
    );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function PlanoCursoEditor({ componente, serie, onSaved }: Props) {
    const [bncc, setBncc] = useState<BnccEstrutura | null>(null);
    const [bnccLoading, setBnccLoading] = useState(false);
    const [componenteSel, setComponenteSel] = useState(componente);
    const [unidadeSel, setUnidadeSel] = useState("");
    const [objetoSel, setObjetoSel] = useState("");

    const [periodoTipo, setPeriodoTipo] = useState<PeriodoTipo>("bimestre");
    const periodos = periodoTipo === "bimestre" ? BIMESTRES : TRIMESTRES;

    const [plano, setPlano] = useState<PlanoData>({ bimestre: BIMESTRES[0], blocos: [] });
    const [planoId, setPlanoId] = useState<string | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<SequenciaBloco>(emptyBloco());

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [iaLoading, setIaLoading] = useState(false);
    const [expandedBloco, setExpandedBloco] = useState<string | null>(null);

    // ─── BNCC ───────────────────────────────────────────────────────────

    useEffect(() => {
        if (!serie) return;
        setBnccLoading(true);
        // Map friendly serie to API format
        const serieParam = serie.includes("Ano") ? serie : `${serie}`;
        fetch(`/api/bncc/ef?serie=${encodeURIComponent(serieParam)}&estrutura=1`)
            .then(r => r.json())
            .then((data: BnccEstrutura) => {
                if (data?.disciplinas?.length) {
                    setBncc(data);
                    // Auto-select componente
                    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                    const cNorm = normalize(componente);
                    if (cNorm && cNorm !== "geral") {
                        const match = data.disciplinas.find(d => {
                            const bNorm = normalize(d);
                            return bNorm === cNorm || bNorm.includes(cNorm) || cNorm.includes(bNorm);
                        });
                        if (match) setComponenteSel(match);
                    }
                }
            })
            .catch(() => { })
            .finally(() => setBnccLoading(false));
    }, [serie, componente]);

    // ─── Load existing plano ────────────────────────────────────────────

    useEffect(() => {
        setLoading(true);
        fetch(`/api/plano-curso?componente=${encodeURIComponent(componente)}&serie=${encodeURIComponent(serie)}`)
            .then(r => r.json())
            .then(data => {
                const planos = data.planos || [];
                if (planos.length > 0) {
                    const p = planos[0];
                    setPlanoId(p.id);
                    let blocos: SequenciaBloco[] = [];
                    try {
                        const parsed = typeof p.conteudo === "string" ? JSON.parse(p.conteudo) : p.conteudo;
                        if (parsed?.blocos && Array.isArray(parsed.blocos)) blocos = parsed.blocos;
                        else if (parsed?.objetivos) {
                            blocos = [{
                                id: uid(), habilidades_bncc: p.habilidades_bncc || [], habilidades_descricoes: {},
                                unidade_tematica: parsed.unidades_tematicas?.[0] || "", objeto_conhecimento: parsed.objetos_conhecimento?.[0] || "",
                                objetivos: typeof parsed.objetivos === "string" ? [parsed.objetivos] : [],
                                objetivos_livre: typeof parsed.objetivos === "string" ? parsed.objetivos : "",
                                metodologias: typeof parsed.metodologia === "string" ? [parsed.metodologia] : [],
                                metodologia_livre: "",
                                recursos: parsed.recursos || [],
                                avaliacoes: typeof parsed.avaliacao === "string" ? [parsed.avaliacao] : [],
                                avaliacao_livre: typeof parsed.avaliacao === "string" ? parsed.avaliacao : "",
                            }];
                        }
                    } catch { blocos = []; }
                    setPlano({ bimestre: p.bimestre || BIMESTRES[0], blocos });
                    if (p.bimestre?.includes("Trimestre")) setPeriodoTipo("trimestre");
                    setSaved(true);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [componente, serie]);

    // ─── BNCC cascading ─────────────────────────────────────────────────

    const discData = useMemo(() => bncc && componenteSel ? bncc.porDisciplina[componenteSel] || null : null, [bncc, componenteSel]);
    const unidadeData = useMemo(() => discData && unidadeSel ? discData.porUnidade[unidadeSel] || null : null, [discData, unidadeSel]);
    const habsDoObjeto = useMemo(() => unidadeData && objetoSel ? unidadeData.porObjeto[objetoSel] || null : null, [unidadeData, objetoSel]);

    const bnccDisciplinas = useMemo(() => {
        if (!bncc) return [];
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const cNorm = normalize(componente);
        if (cNorm && cNorm !== "geral") {
            const match = bncc.disciplinas.find(d => {
                const bNorm = normalize(d);
                return bNorm === cNorm || bNorm.includes(cNorm) || cNorm.includes(bNorm);
            });
            if (match) return [match];
        }
        return bncc.disciplinas;
    }, [bncc, componente]);

    // ─── Form handlers ──────────────────────────────────────────────────

    const toggleFormTag = useCallback((field: "objetivos" | "metodologias" | "recursos" | "avaliacoes", value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
        }));
    }, []);

    const toggleFormHab = useCallback((hab: Habilidade) => {
        setForm(prev => {
            const has = prev.habilidades_bncc.includes(hab.codigo);
            return {
                ...prev,
                habilidades_bncc: has ? prev.habilidades_bncc.filter(c => c !== hab.codigo) : [...prev.habilidades_bncc, hab.codigo],
                habilidades_descricoes: has
                    ? (() => { const d = { ...prev.habilidades_descricoes }; delete d[hab.codigo]; return d; })()
                    : { ...prev.habilidades_descricoes, [hab.codigo]: hab.descricao },
            };
        });
    }, []);

    const addBloco = useCallback(() => {
        if (form.habilidades_bncc.length === 0 && !form.objetivos_livre && form.objetivos.length === 0) return;
        const bloco: SequenciaBloco = { ...form, id: editingIndex !== null ? form.id : uid(), unidade_tematica: unidadeSel, objeto_conhecimento: objetoSel };
        setPlano(prev => {
            const blocos = [...prev.blocos];
            if (editingIndex !== null) blocos[editingIndex] = bloco; else blocos.push(bloco);
            return { ...prev, blocos };
        });
        setForm(emptyBloco()); setEditingIndex(null); setSaved(false);
    }, [form, editingIndex, unidadeSel, objetoSel]);

    const editBloco = useCallback((i: number) => {
        setForm(plano.blocos[i]); setEditingIndex(i);
        if (plano.blocos[i].unidade_tematica) setUnidadeSel(plano.blocos[i].unidade_tematica);
        if (plano.blocos[i].objeto_conhecimento) setObjetoSel(plano.blocos[i].objeto_conhecimento);
    }, [plano.blocos]);

    const removeBloco = useCallback((i: number) => {
        setPlano(prev => ({ ...prev, blocos: prev.blocos.filter((_, idx) => idx !== i) })); setSaved(false);
    }, []);

    const duplicateBloco = useCallback((i: number) => {
        setPlano(prev => ({ ...prev, blocos: [...prev.blocos, { ...prev.blocos[i], id: uid() }] })); setSaved(false);
    }, []);

    // ─── AI Suggestion ──────────────────────────────────────────────────

    const gerarSugestaoIA = useCallback(async () => {
        if (form.habilidades_bncc.length === 0) return;
        setIaLoading(true);
        try {
            const res = await fetch("/api/pei/plano-ensino/sugestao-ia", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    habilidades: form.habilidades_bncc, descricoes: form.habilidades_descricoes,
                    componente: componenteSel, unidade: unidadeSel, objeto: objetoSel, serie,
                }),
            });
            const data = await res.json();
            if (data.sugestao) {
                setForm(prev => ({
                    ...prev,
                    objetivos: [...new Set([...prev.objetivos, ...(data.sugestao.objetivos || [])])],
                    objetivos_livre: data.sugestao.objetivos_texto || prev.objetivos_livre,
                    metodologias: [...new Set([...prev.metodologias, ...(data.sugestao.metodologias || [])])],
                    metodologia_livre: data.sugestao.metodologia_texto || prev.metodologia_livre,
                    recursos: [...new Set([...prev.recursos, ...(data.sugestao.recursos || [])])],
                    avaliacoes: [...new Set([...prev.avaliacoes, ...(data.sugestao.avaliacoes || [])])],
                    avaliacao_livre: data.sugestao.avaliacao_texto || prev.avaliacao_livre,
                }));
            }
        } catch { /* silent */ }
        finally { setIaLoading(false); }
    }, [form.habilidades_bncc, form.habilidades_descricoes, componenteSel, unidadeSel, objetoSel, serie]);

    // ─── Save ───────────────────────────────────────────────────────────

    const salvar = async () => {
        setSaving(true); setError("");
        try {
            const todasHabs = [...new Set(plano.blocos.flatMap(b => b.habilidades_bncc))];
            const res = await fetch("/api/plano-curso", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: planoId || undefined, componente, serie,
                    conteudo: JSON.stringify({ blocos: plano.blocos }),
                    habilidades_bncc: todasHabs, bimestre: plano.bimestre,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlanoId(data.plano?.id); setSaved(true); onSaved?.();
        } catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar"); }
        finally { setSaving(false); }
    };

    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "#0ea5e9", margin: "0 auto" }} />
                <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 13 }}>Carregando plano...</p>
            </div>
        );
    }

    const totalHabs = plano.blocos.reduce((acc, b) => acc + b.habilidades_bncc.length, 0);
    const canAddBloco = form.habilidades_bncc.length > 0 || form.objetivos.length > 0 || form.objetivos_livre.trim().length > 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Overlay: ícone Omnisfera + motor trabalhando ao gerar sugestão IA */}
            {iaLoading && <OmniLoader engine="red" variant="overlay" module="plano_curso" />}

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", borderRadius: 14, padding: "18px 22px", color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <BookOpen size={22} />
                        <div>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Plano de Curso — {componente}</h4>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
                                {serie}{bncc && <> · BNCC integrada ({bnccDisciplinas.length} comp.)</>}
                                {plano.blocos.length > 0 && <> · {plano.blocos.length} bloco{plano.blocos.length !== 1 ? "s" : ""}</>}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {saved && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#bae6fd" }}><CheckCircle2 size={14} /> Salvo</span>}
                        {totalHabs > 0 && <span style={{ background: "rgba(255,255,255,.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{totalHabs} hab.</span>}
                    </div>
                </div>
            </div>

            {/* Período toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 10, background: "var(--bg-tertiary, rgba(15,23,42,.4))" }}>
                    {(["bimestre", "trimestre"] as const).map(tipo => (
                        <button key={tipo} onClick={() => { setPeriodoTipo(tipo); setPlano(p => ({ ...p, bimestre: tipo === "bimestre" ? BIMESTRES[0] : TRIMESTRES[0] })); }} type="button" style={{
                            padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none",
                            background: periodoTipo === tipo ? "rgba(14,165,233,.15)" : "transparent",
                            color: periodoTipo === tipo ? "#38bdf8" : "var(--text-muted, #94a3b8)",
                            cursor: "pointer", transition: "all .2s", textTransform: "capitalize",
                        }}>{tipo}</button>
                    ))}
                </div>
                {periodos.map(b => (
                    <button key={b} onClick={() => setPlano(p => ({ ...p, bimestre: b }))} type="button" style={{
                        padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        border: plano.bimestre === b ? "1.5px solid #0ea5e9" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                        background: plano.bimestre === b ? "rgba(14,165,233,.12)" : "transparent",
                        color: plano.bimestre === b ? "#38bdf8" : "var(--text-muted, #94a3b8)",
                        cursor: "pointer", transition: "all .2s",
                    }}>{b}</button>
                ))}
            </div>

            {/* Split Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
                {/* LEFT: Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* BNCC */}
                    {bnccLoading ? (
                        <div style={{ ...cardS, padding: 24, textAlign: "center" }}>
                            <Loader2 size={20} className="animate-spin" style={{ color: "#6366f1", margin: "0 auto" }} />
                        </div>
                    ) : bncc ? (
                        <div style={cardS}>
                            <div style={headerS}>
                                <GraduationCap size={16} style={{ color: "#818cf8" }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>BNCC — Selecione Habilidades</span>
                            </div>
                            <div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 10 }}>
                                <div>
                                    <label style={labelS}>Componente Curricular</label>
                                    <select value={componenteSel} onChange={e => { setComponenteSel(e.target.value); setUnidadeSel(""); setObjetoSel(""); }} style={selectS}>
                                        <option value="">— Selecione —</option>
                                        {bnccDisciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                {componenteSel && discData && (
                                    <div>
                                        <label style={labelS}>Unidade Temática</label>
                                        <select value={unidadeSel} onChange={e => { setUnidadeSel(e.target.value); setObjetoSel(""); }} style={selectS}>
                                            <option value="">— Selecione —</option>
                                            {discData.unidades.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                )}
                                {unidadeSel && unidadeData && (
                                    <div>
                                        <label style={labelS}>Objeto do Conhecimento</label>
                                        <select value={objetoSel} onChange={e => setObjetoSel(e.target.value)} style={selectS}>
                                            <option value="">— Selecione —</option>
                                            {unidadeData.objetos.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                )}
                                {objetoSel && habsDoObjeto && habsDoObjeto.length > 0 && (
                                    <div>
                                        <label style={labelS}>Habilidades ({habsDoObjeto.length})</label>
                                        <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                                            {habsDoObjeto.map(h => {
                                                const sel = form.habilidades_bncc.includes(h.codigo);
                                                return (
                                                    <label key={h.codigo} style={{
                                                        display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                                                        background: sel ? "rgba(14,165,233,.08)" : "transparent",
                                                        border: sel ? "1px solid rgba(14,165,233,.2)" : "1px solid transparent",
                                                    }}>
                                                        <input type="checkbox" checked={sel} onChange={() => toggleFormHab(h)} style={{ marginTop: 3, accentColor: "#0ea5e9", width: 16, height: 16, flexShrink: 0 }} />
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: sel ? "#38bdf8" : "#818cf8", marginRight: 6 }}>{h.codigo}</span>
                                                            <span style={{ fontSize: 12, color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.4 }}>{h.descricao}</span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {form.habilidades_bncc.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 10px", borderRadius: 8, background: "rgba(14,165,233,.06)", border: "1px solid rgba(14,165,233,.15)" }}>
                                        {form.habilidades_bncc.map(c => (
                                            <span key={c} onClick={() => setForm(prev => ({ ...prev, habilidades_bncc: prev.habilidades_bncc.filter(x => x !== c) }))} style={{
                                                padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                                                background: "rgba(14,165,233,.15)", color: "#38bdf8", cursor: "pointer",
                                            }}>{c} ✕</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Objectives */}
                    <div style={cardS}><div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 12 }}>
                        <BloomObjectives selected={form.objetivos} onToggle={v => toggleFormTag("objetivos", v)} />
                        <textarea placeholder="Ou escreva objetivos livres..." value={form.objetivos_livre} onChange={e => setForm(f => ({ ...f, objetivos_livre: e.target.value }))} style={{ ...textareaS, minHeight: 50 }} />
                    </div></div>

                    {/* Methodology */}
                    <div style={cardS}><div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 10 }}>
                        <TagSelector options={METODOLOGIAS} selected={form.metodologias} onToggle={v => toggleFormTag("metodologias", v)} label="Metodologia" color="#8b5cf6" />
                        <textarea placeholder="Descreva como aplicar as metodologias neste contexto (a IA preenche automaticamente)..." value={form.metodologia_livre} onChange={e => setForm(f => ({ ...f, metodologia_livre: e.target.value }))} style={{ ...textareaS, minHeight: 60 }} />
                    </div></div>

                    {/* Resources */}
                    <div style={cardS}><div style={bodyS}>
                        <TagSelector options={RECURSOS} selected={form.recursos} onToggle={v => toggleFormTag("recursos", v)} label="Recursos Didáticos" color="#f59e0b" />
                    </div></div>

                    {/* Evaluation */}
                    <div style={cardS}><div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 10 }}>
                        <TagSelector options={AVALIACOES} selected={form.avaliacoes} onToggle={v => toggleFormTag("avaliacoes", v)} label="Avaliação" color="#ec4899" />
                        <textarea placeholder="Detalhes adicionais..." value={form.avaliacao_livre} onChange={e => setForm(f => ({ ...f, avaliacao_livre: e.target.value }))} style={{ ...textareaS, minHeight: 40 }} />
                    </div></div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={gerarSugestaoIA} disabled={iaLoading || form.habilidades_bncc.length === 0} type="button" style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            border: "1.5px solid #8b5cf6", background: "rgba(139,92,246,.1)", color: "#a78bfa",
                            cursor: form.habilidades_bncc.length === 0 ? "not-allowed" : "pointer",
                            opacity: form.habilidades_bncc.length === 0 ? 0.5 : 1, transition: "all .2s",
                        }}>
                            {iaLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Sugestão IA
                        </button>
                        <button onClick={addBloco} disabled={!canAddBloco} type="button" style={{
                            display: "flex", alignItems: "center", gap: 6, flex: 1, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            border: "none", background: canAddBloco ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" : "rgba(148,163,184,.15)",
                            color: canAddBloco ? "#fff" : "var(--text-muted, #64748b)",
                            cursor: canAddBloco ? "pointer" : "not-allowed", justifyContent: "center", transition: "all .2s",
                        }}>
                            <Plus size={16} /> {editingIndex !== null ? "Salvar Bloco" : "Adicionar Bloco"}
                        </button>
                        {editingIndex !== null && (
                            <button onClick={() => { setForm(emptyBloco()); setEditingIndex(null); }} type="button" style={{
                                padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                background: "transparent", color: "var(--text-muted, #94a3b8)", cursor: "pointer",
                            }}>Cancelar</button>
                        )}
                    </div>
                </div>

                {/* RIGHT: Blocks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={headerS}>
                        <BookOpen size={16} style={{ color: "#0ea5e9" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>Sequência Didática — {plano.bimestre}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#0ea5e9", background: "rgba(14,165,233,.1)", padding: "2px 8px", borderRadius: 6 }}>
                            {plano.blocos.length} bloco{plano.blocos.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {plano.blocos.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center", border: "2px dashed var(--border-default, rgba(148,163,184,.15))", borderRadius: 14, color: "var(--text-muted, #64748b)" }}>
                            <BookOpen size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Nenhum bloco adicionado</p>
                            <p style={{ fontSize: 12, margin: 0, opacity: 0.7 }}>Selecione habilidades BNCC e preencha o formulário ao lado.</p>
                        </div>
                    ) : (
                        <>
                            {plano.blocos.map((bloco, index) => {
                                const isExpanded = expandedBloco === bloco.id;
                                return (
                                    <div key={bloco.id} style={{ ...cardS, border: editingIndex === index ? "1.5px solid #8b5cf6" : "1px solid var(--border-default, rgba(148,163,184,.15))" }}>
                                        <button onClick={() => setExpandedBloco(isExpanded ? null : bloco.id)} type="button" style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "none",
                                            background: "var(--bg-tertiary, rgba(15,23,42,.3))", cursor: "pointer", textAlign: "left",
                                        }}>
                                            {isExpanded ? <ChevronDown size={14} style={{ color: "#0ea5e9" }} /> : <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #e2e8f0)", flex: 1 }}>
                                                Bloco {index + 1}
                                                {bloco.unidade_tematica && <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted, #94a3b8)", marginLeft: 8 }}>{bloco.unidade_tematica.slice(0, 40)}</span>}
                                            </span>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: "#818cf8", background: "rgba(99,102,241,.1)", padding: "2px 6px", borderRadius: 4 }}>{bloco.habilidades_bncc.length} hab.</span>
                                        </button>
                                        {isExpanded && (
                                            <div style={{ ...bodyS, fontSize: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                                                {/* BNCC Decomposition */}
                                                {(bloco.unidade_tematica || bloco.objeto_conhecimento) && (
                                                    <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.12)" }}>
                                                        {bloco.unidade_tematica && (
                                                            <div style={{ marginBottom: bloco.objeto_conhecimento ? 6 : 0 }}>
                                                                <span style={{ fontSize: 10, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Unidade Temática</span>
                                                                <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: "var(--text-primary, #e2e8f0)" }}>{bloco.unidade_tematica}</p>
                                                            </div>
                                                        )}
                                                        {bloco.objeto_conhecimento && (
                                                            <div>
                                                                <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.05em" }}>Objeto do Conhecimento</span>
                                                                <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: "var(--text-primary, #e2e8f0)" }}>{bloco.objeto_conhecimento}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {bloco.habilidades_bncc.length > 0 && (
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: "#818cf8", fontSize: 11 }}>Habilidades BNCC ({bloco.habilidades_bncc.length}):</span>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                                                            {bloco.habilidades_bncc.map(c => (
                                                                <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(14,165,233,.05)", border: "1px solid rgba(14,165,233,.1)" }}>
                                                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", whiteSpace: "nowrap", marginTop: 1 }}>{c}</span>
                                                                    {bloco.habilidades_descricoes[c] && (
                                                                        <span style={{ fontSize: 12, color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.4 }}>{bloco.habilidades_descricoes[c]}</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {(bloco.objetivos.length > 0 || bloco.objetivos_livre) && <div><span style={{ fontWeight: 700, color: "#a78bfa", fontSize: 11 }}>Objetivos:</span><p style={{ margin: "4px 0 0", color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{bloco.objetivos_livre || bloco.objetivos.join("; ")}</p></div>}
                                                {bloco.metodologias.length > 0 && <div><span style={{ fontWeight: 700, color: "#8b5cf6", fontSize: 11 }}>Metodologia:</span>{bloco.metodologia_livre ? <p style={{ margin: "4px 0 0", color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{bloco.metodologia_livre}</p> : <p style={{ margin: "2px 0 0", color: "var(--text-secondary, #cbd5e1)" }}>{bloco.metodologias.join(", ")}</p>}</div>}
                                                {bloco.recursos.length > 0 && <div><span style={{ fontWeight: 700, color: "#f59e0b", fontSize: 11 }}>Recursos:</span><div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>{bloco.recursos.map(r => <span key={r} style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, background: "rgba(245,158,11,.08)", color: "#fbbf24" }}>{r}</span>)}</div></div>}
                                                {(bloco.avaliacoes.length > 0 || bloco.avaliacao_livre) && <div><span style={{ fontWeight: 700, color: "#ec4899", fontSize: 11 }}>Avaliação:</span>{bloco.avaliacao_livre ? <p style={{ margin: "4px 0 0", color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{bloco.avaliacao_livre}</p> : <p style={{ margin: "2px 0 0", color: "var(--text-secondary, #cbd5e1)" }}>{bloco.avaliacoes.join("; ")}</p>}</div>}
                                                <div style={{ display: "flex", gap: 6, paddingTop: 6, borderTop: "1px solid var(--border-default, rgba(148,163,184,.08))" }}>
                                                    <button onClick={() => editBloco(index)} type="button" style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid var(--border-default)", background: "transparent", color: "#818cf8", cursor: "pointer" }}><Edit3 size={12} /> Editar</button>
                                                    <button onClick={() => duplicateBloco(index)} type="button" style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid var(--border-default)", background: "transparent", color: "#94a3b8", cursor: "pointer" }}><Copy size={12} /> Duplicar</button>
                                                    <button onClick={() => removeBloco(index)} type="button" style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid rgba(239,68,68,.2)", background: "transparent", color: "#ef4444", cursor: "pointer", marginLeft: "auto" }}><Trash2 size={12} /> Remover</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button onClick={salvar} disabled={saving || plano.blocos.length === 0} type="button" style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                                border: "none", background: saving ? "rgba(148,163,184,.15)" : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                                color: "#fff", cursor: saving ? "not-allowed" : "pointer", transition: "all .2s",
                            }}>
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? "Salvando..." : `Salvar Plano (${plano.blocos.length} bloco${plano.blocos.length !== 1 ? "s" : ""})`}
                            </button>
                            {error && <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#f87171" }}>{error}</div>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
