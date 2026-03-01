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

// ─── Styles CSS -> Tailwind ─────────────────────────────────────────────────────────────

const cardC = "rounded-2xl border border-(--border-default) bg-white dark:bg-slate-900/40 overflow-hidden shadow-sm";
const headerC = "flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/30";
const bodyC = "p-5";
const labelC = "text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-2 block";
const selectC = "w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-sm cursor-pointer font-sans shadow-sm";
const textareaC = "w-full min-h-[60px] p-3.5 rounded-xl bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-[13px] leading-relaxed resize-y font-sans shadow-sm";

// ─── Tag Selector ─────────────────────────────────────────────────────────────

function TagSelector({ options, selected, onToggle, label, color = "#6366f1" }: {
    options: string[]; selected: string[]; onToggle: (v: string) => void; label: string; color?: string;
}) {
    return (
        <div>
            <label className={labelC}>{label}</label>
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
            <label className={labelC}>Objetivos de Aprendizagem (Taxonomia de Bloom)</label>
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
    const [deleting, setDeleting] = useState(false);
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

    // ─── Delete ──────────────────────────────────────────────────────────

    const deletarPlano = async () => {
        if (!planoId) return;
        if (!confirm("Tem certeza que deseja apagar este plano de ensino? Esta ação não pode ser desfeita.")) return;
        setDeleting(true); setError("");
        try {
            const res = await fetch(`/api/plano-curso?id=${planoId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlanoId(null);
            setPlano({ bimestre: BIMESTRES[0], blocos: [] });
            setSaved(false);
            onSaved?.();
        } catch (err) { setError(err instanceof Error ? err.message : "Erro ao apagar"); }
        finally { setDeleting(false); }
    };

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
            <div className="bg-[linear-gradient(135deg,#0ea5e9_0%,#0284c7_100%)] rounded-2xl p-5 text-white shadow-premium relative overflow-hidden">
                {/* Efeito de brilho sutíl no header */}
                <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-size-[250%_250%,100%_100%] animate-aurora pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                            <BookOpen size={24} className="text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h4 className="m-0 text-lg font-bold tracking-tight text-white drop-shadow-sm">Plano de Curso — {componente}</h4>
                            <p className="m-0 text-sm font-medium text-sky-100">
                                {serie}{bncc && <> · BNCC integrada ({bnccDisciplinas.length} comp.)</>}
                                {plano.blocos.length > 0 && <> · {plano.blocos.length} bloco{plano.blocos.length !== 1 ? "s" : ""}</>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {saved && <span className="flex items-center gap-1.5 text-xs font-bold text-sky-100 bg-black/20 px-2.5 py-1 rounded-full"><CheckCircle2 size={14} /> Salvo</span>}
                        {totalHabs > 0 && <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold shadow-inner">{totalHabs} hab.</span>}
                        {planoId && (
                            <button
                                onClick={deletarPlano}
                                disabled={deleting}
                                type="button"
                                className={`btn-premium btn-premium-danger px-3 py-1.5 text-xs rounded-lg ${deleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} strokeWidth={2.5} />} Apagar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Período toggle */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                    {(["bimestre", "trimestre"] as const).map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => { setPeriodoTipo(tipo); setPlano(p => ({ ...p, bimestre: tipo === "bimestre" ? BIMESTRES[0] : TRIMESTRES[0] })); }}
                            type="button"
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${periodoTipo === tipo ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {periodos.map(b => (
                        <button
                            key={b}
                            onClick={() => setPlano(p => ({ ...p, bimestre: b }))}
                            type="button"
                            className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold transition-all border active:scale-95 ${plano.bimestre === b ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-sm' : 'border-slate-200 dark:border-slate-700/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
                {/* LEFT: Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* BNCC */}
                    {bnccLoading ? (
                        <div className={`${cardC} p-6 text-center`}>
                            <Loader2 size={20} className="animate-spin text-indigo-500 mx-auto" />
                        </div>
                    ) : bncc ? (
                        <div className={cardC}>
                            <div className={headerC}>
                                <GraduationCap size={16} className="text-indigo-400" />
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">BNCC — Selecione Habilidades</span>
                            </div>
                            <div className={`${bodyC} flex flex-col gap-2.5`}>
                                <div>
                                    <label className={labelC}>Componente Curricular</label>
                                    <select value={componenteSel} onChange={e => { setComponenteSel(e.target.value); setUnidadeSel(""); setObjetoSel(""); }} className={selectC}>
                                        <option value="">— Selecione —</option>
                                        {bnccDisciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                {componenteSel && discData && (
                                    <div>
                                        <label className={labelC}>Unidade Temática</label>
                                        <select value={unidadeSel} onChange={e => { setUnidadeSel(e.target.value); setObjetoSel(""); }} className={selectC}>
                                            <option value="">— Selecione —</option>
                                            {discData.unidades.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                )}
                                {unidadeSel && unidadeData && (
                                    <div>
                                        <label className={labelC}>Objeto do Conhecimento</label>
                                        <select value={objetoSel} onChange={e => setObjetoSel(e.target.value)} className={selectC}>
                                            <option value="">— Selecione —</option>
                                            {unidadeData.objetos.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                )}
                                {objetoSel && habsDoObjeto && habsDoObjeto.length > 0 && (
                                    <div>
                                        <label className={labelC}>Habilidades ({habsDoObjeto.length})</label>
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
                    <div className={cardC}><div className={`${bodyC} flex flex-col gap-3`}>
                        <BloomObjectives selected={form.objetivos} onToggle={v => toggleFormTag("objetivos", v)} />
                        <textarea placeholder="Ou escreva objetivos livres..." value={form.objetivos_livre} onChange={e => setForm(f => ({ ...f, objetivos_livre: e.target.value }))} className={`${textareaC} min-h-[50px]`} />
                    </div></div>

                    {/* Methodology */}
                    <div className={cardC}><div className={`${bodyC} flex flex-col gap-2.5`}>
                        <TagSelector options={METODOLOGIAS} selected={form.metodologias} onToggle={v => toggleFormTag("metodologias", v)} label="Metodologia" color="#8b5cf6" />
                        <textarea placeholder="Descreva como aplicar as metodologias neste contexto (a IA preenche automaticamente)..." value={form.metodologia_livre} onChange={e => setForm(f => ({ ...f, metodologia_livre: e.target.value }))} className={`${textareaC} min-h-[60px]`} />
                    </div></div>

                    {/* Resources */}
                    <div className={cardC}><div className={bodyC}>
                        <TagSelector options={RECURSOS} selected={form.recursos} onToggle={v => toggleFormTag("recursos", v)} label="Recursos Didáticos" color="#f59e0b" />
                    </div></div>

                    {/* Evaluation */}
                    <div className={cardC}><div className={`${bodyC} flex flex-col gap-2.5`}>
                        <TagSelector options={AVALIACOES} selected={form.avaliacoes} onToggle={v => toggleFormTag("avaliacoes", v)} label="Avaliação" color="#ec4899" />
                        <textarea placeholder="Detalhes adicionais..." value={form.avaliacao_livre} onChange={e => setForm(f => ({ ...f, avaliacao_livre: e.target.value }))} className={`${textareaC} min-h-[40px]`} />
                    </div></div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap mt-4">
                        <button onClick={gerarSugestaoIA} disabled={iaLoading || form.habilidades_bncc.length === 0} type="button" className={`btn-premium px-4 py-2.5 rounded-xl text-[13px] border-[1.5px] border-purple-500/50 hover:border-purple-500 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 ${(form.habilidades_bncc.length === 0 || iaLoading) ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}>
                            {iaLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Sugestão IA
                        </button>
                        <button onClick={addBloco} disabled={!canAddBloco} type="button" className={`btn-premium flex-1 px-4 py-2.5 rounded-xl text-[13px] hover:shadow-premium-lg ${canAddBloco ? 'btn-premium-primary bg-linear-to-br from-sky-500 to-sky-700 border-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-70 border border-slate-300 dark:border-slate-700 active:scale-100'}`}>
                            <Plus size={16} strokeWidth={2.5} /> {editingIndex !== null ? "Salvar Bloco" : "Adicionar Bloco"}
                        </button>
                        {editingIndex !== null && (
                            <button onClick={() => { setForm(emptyBloco()); setEditingIndex(null); }} type="button" className="btn-premium btn-premium-secondary px-4 py-2.5 rounded-xl text-[13px] hover:shadow-sm">Cancelar</button>
                        )}
                    </div>
                </div>

                {/* RIGHT: Blocks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className={headerC}>
                        <BookOpen size={16} className="text-sky-500" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Sequência Didática — {plano.bimestre}</span>
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
                                    <div key={bloco.id} className={`rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/40 transition-all ${editingIndex === index ? "border-2 border-purple-500 ring-2 ring-purple-500/20" : "border border-(--border-default)"}`}>
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
                                            <div className={`${bodyC} text-xs flex flex-col gap-2.5`}>
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
                            <button onClick={salvar} disabled={saving || plano.blocos.length === 0} type="button" className={`btn-premium w-full mt-4 py-3.5 rounded-xl text-[15px] hover:shadow-premium-lg transition-all ${(saving || plano.blocos.length === 0) ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-70 border border-slate-300 dark:border-slate-700 active:scale-100' : 'btn-premium-primary bg-linear-to-br from-sky-500 to-sky-700 border-none'}`}>
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
