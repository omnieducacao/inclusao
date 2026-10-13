"use client";

import { OmniLoader } from "@/components/OmniLoader";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Save, CheckCircle2, BookOpen, Plus, X, Check,
    Sparkles, ChevronDown, ChevronRight,
    Trash2, Edit3, Copy, AlertTriangle } from "lucide-react";
import TelaCarregando, { CarregandoLinha } from "@/components/brand/TelaCarregando";
import { useAILoading } from "@/hooks/useAILoading";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";

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

// ─── Peças do formulário (design system: Pílula, Campo) ────────────────────────

/** Pílulas marcáveis (aria-pressed), como nas escolhas do Hub. */
function TagSelector({ options, selected, onToggle, label }: {
    options: string[]; selected: string[]; onToggle: (v: string) => void; label: string;
}) {
    return (
        <fieldset className="omni-linha" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="omni-linha__rotulo" style={{ marginBottom: 8 }}>{label}</legend>
            <div className="omni-linha__opcoes">
                {options.map(o => (
                    <button key={o} type="button" className="omni-pilula" aria-pressed={selected.includes(o)} onClick={() => onToggle(o)}>{o}</button>
                ))}
            </div>
        </fieldset>
    );
}

/** Objetivos pelos níveis da taxonomia de Bloom: escolhe o nível, depois os verbos. */
function BloomObjectives({ selected, onToggle }: { selected: string[]; onToggle: (v: string) => void }) {
    const [nivel, setNivel] = useState<string>("");
    return (
        <div className="omni-linha">
            <p className="omni-linha__rotulo">Objetivos de aprendizagem <span className="omni-campo__opcional">(níveis da taxonomia de Bloom)</span></p>
            <div className="omni-segmentado" role="radiogroup" aria-label="Nível de Bloom" style={{ flexWrap: "wrap" }}>
                {Object.keys(OBJETIVOS_BLOOM).map(cat => (
                    <label key={cat}>
                        <input type="radio" name="nivel-bloom" checked={nivel === cat} onChange={() => setNivel(cat)} onClick={() => nivel === cat && setNivel("")} />
                        {cat}
                    </label>
                ))}
            </div>
            {nivel && (
                <div className="omni-linha__opcoes">
                    {OBJETIVOS_BLOOM[nivel].map(v => (
                        <button key={v} type="button" className="omni-pilula" aria-pressed={selected.includes(v)} onClick={() => onToggle(v)}>{v}</button>
                    ))}
                </div>
            )}
            {selected.length > 0 && <p className="omni-apoio" style={{ margin: 0 }}>Escolhidos: {selected.join(", ")}</p>}
        </div>
    );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
    return (
        <label className="omni-campo" style={{ maxWidth: "none" }}>
            <span className="omni-campo__rotulo">{rotulo}</span>
            {children}
        </label>
    );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function PlanoCursoEditor({ componente, serie, onSaved }: Props) {
    const { start: aiLoadingStart, stop: aiLoadingStop } = useAILoading();
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
    const [iaErro, setIaErro] = useState<string | null>(null);
    const [expandedBloco, setExpandedBloco] = useState<string | null>(null);

    // ─── Auto-Save ───────────────────────────────────────────────────────
    const autoSaveData = useMemo(() => ({
        id: planoId,
        componente,
        serie,
        bimestre: plano.bimestre,
        blocos: plano.blocos,
    }), [planoId, componente, serie, plano.bimestre, plano.blocos]);

    const autoSave = useAutoSave(autoSaveData, async (data) => {
        if (!data.blocos || data.blocos.length === 0) return;
        const todasHabs = [...new Set(data.blocos.flatMap((b: SequenciaBloco) => b.habilidades_bncc))];
        const res = await fetch("/api/plano-curso", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: data.id || undefined,
                componente: data.componente,
                serie: data.serie,
                conteudo: JSON.stringify({ blocos: data.blocos }),
                habilidades_bncc: todasHabs,
                bimestre: data.bimestre,
            }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Erro ao auto-salvar");
        }
        const result = await res.json();
        if (result.plano?.id && !planoId) setPlanoId(result.plano.id);
    }, { debounceMs: 3000, enabled: !loading && !saving && plano.blocos.length > 0 });

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
        setIaErro(null);
        aiLoadingStart("red", "plano_curso");
        try {
            const res = await fetch("/api/pei/plano-ensino/sugestao-ia", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    habilidades: form.habilidades_bncc, descricoes: form.habilidades_descricoes,
                    componente: componenteSel, unidade: unidadeSel, objeto: objetoSel, serie,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.sugestao) setIaErro(data.error || "A IA não trouxe sugestão desta vez. Tente de novo.");
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
        } catch {
            setIaErro("Não conseguimos falar com a IA agora. Confira a internet e tente de novo."); // onda 5: antes falhava em silêncio
        }
        finally { setIaLoading(false); aiLoadingStop(); }
    }, [form.habilidades_bncc, form.habilidades_descricoes, componenteSel, unidadeSel, objetoSel, serie, aiLoadingStart, aiLoadingStop]);

    // ─── Delete ──────────────────────────────────────────────────────────

    const deletarPlano = async () => {
        if (!planoId) return;
        if (!confirm("Apagar este plano de ensino? Não dá para desfazer.")) return;
        setDeleting(true); setError("");
        try {
            const res = await fetch(`/api/plano-curso?id=${planoId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlanoId(null);
            setPlano({ bimestre: BIMESTRES[0], blocos: [] });
            setSaved(false);
            onSaved?.();
        } catch (err) { setError(err instanceof Error && err.message ? err.message : "Não deu para apagar o plano. Tente de novo."); }
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
        } catch (err) { setError(err instanceof Error && err.message ? err.message : "Não deu para salvar o plano. Tente de novo."); }
        finally { setSaving(false); }
    };

    // ─── Carregando ─────────────────────────────────────────────────────

    if (loading) {
        return <TelaCarregando variante="secao" mensagens={["Abrindo o plano de ensino…"]} />;
    }

    const totalHabs = plano.blocos.reduce((acc, b) => acc + b.habilidades_bncc.length, 0);
    const canAddBloco = form.habilidades_bncc.length > 0 || form.objetivos.length > 0 || form.objetivos_livre.trim().length > 0;
    const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Cabeçalho do plano */}
            <div className="omni-cartao" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                    <p className="omni-rotulo" style={{ margin: 0 }}>Plano de ensino</p>
                    <h2 style={{ margin: "2px 0 0", font: "800 22px/28px var(--font-sans)", color: "var(--tinta)" }}>{componente} · {serie}</h2>
                    <p className="omni-apoio" style={{ margin: "4px 0 0" }}>
                        {plural(plano.blocos.length, "bloco", "blocos")} na sequência · {plural(totalHabs, "habilidade da BNCC", "habilidades da BNCC")}
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <AutoSaveIndicator status={autoSave.status} lastSaved={autoSave.lastSaved} />
                    {saved && autoSave.status === "idle" && <span className="omni-estado omni-estado--sucesso"><CheckCircle2 aria-hidden /> Salvo</span>}
                    {planoId && (
                        <button onClick={deletarPlano} disabled={deleting} aria-busy={deleting} type="button" className="omni-btn omni-btn--perigo omni-btn--pequeno">
                            {deleting ? <OmniLoader size={16} /> : <Trash2 size={16} aria-hidden />} Apagar o plano
                        </button>
                    )}
                </div>
            </div>

            {/* Período */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div className="omni-segmentado" role="radiogroup" aria-label="Divisão do ano">
                    {(["bimestre", "trimestre"] as const).map(tipo => (
                        <label key={tipo}>
                            <input type="radio" name="periodo-tipo" checked={periodoTipo === tipo} onChange={() => { setPeriodoTipo(tipo); setPlano(p => ({ ...p, bimestre: tipo === "bimestre" ? BIMESTRES[0] : TRIMESTRES[0] })); }} />
                            {tipo === "bimestre" ? "Bimestres" : "Trimestres"}
                        </label>
                    ))}
                </div>
                <div className="omni-linha__opcoes" role="group" aria-label="Período">
                    {periodos.map(b => (
                        <button key={b} type="button" className="omni-pilula" aria-pressed={plano.bimestre === b} onClick={() => setPlano(p => ({ ...p, bimestre: b }))}>{b}</button>
                    ))}
                </div>
            </div>

            <div className="omni-mesa__grade">
                {/* ESQUERDA: montar um bloco */}
                <section className="omni-mesa__painel" aria-labelledby="pc-bloco">
                    <div className="omni-mesa__corpo" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <h3 id="pc-bloco" style={{ margin: 0, font: "800 17px/24px var(--font-sans)", color: "var(--tinta)" }}>
                            {editingIndex !== null ? `Editando o bloco ${editingIndex + 1}` : "Novo bloco da sequência"}
                        </h3>

                        {/* BNCC */}
                        {bnccLoading ? (
                            <CarregandoLinha texto="Carregando a BNCC do ano…" />
                        ) : bncc ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {bnccDisciplinas.length > 1 && (
                                    <Campo rotulo="Componente curricular">
                                        <select className="omni-entrada" value={componenteSel} onChange={e => { setComponenteSel(e.target.value); setUnidadeSel(""); setObjetoSel(""); }}>
                                            <option value="">Escolha</option>
                                            {bnccDisciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </Campo>
                                )}
                                {componenteSel && discData && (
                                    <Campo rotulo="Unidade temática">
                                        <select className="omni-entrada" value={unidadeSel} onChange={e => { setUnidadeSel(e.target.value); setObjetoSel(""); }}>
                                            <option value="">Escolha</option>
                                            {discData.unidades.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </Campo>
                                )}
                                {unidadeSel && unidadeData && (
                                    <Campo rotulo="Objeto de conhecimento">
                                        <select className="omni-entrada" value={objetoSel} onChange={e => setObjetoSel(e.target.value)}>
                                            <option value="">Escolha</option>
                                            {unidadeData.objetos.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </Campo>
                                )}
                                {objetoSel && habsDoObjeto && habsDoObjeto.length > 0 && (
                                    <div className="omni-linha">
                                        <p className="omni-linha__rotulo">Habilidades da BNCC ({habsDoObjeto.length})</p>
                                        <div className="omni-habilidades" role="listbox" aria-label="Habilidades da BNCC" aria-multiselectable>
                                            {habsDoObjeto.map(h => {
                                                const sel = form.habilidades_bncc.includes(h.codigo);
                                                return (
                                                    <button key={h.codigo} type="button" role="option" aria-selected={sel} className="omni-habilidade" onClick={() => toggleFormHab(h)}>
                                                        <span className="omni-habilidade__cod">{sel && <Check size={12} aria-hidden style={{ display: "inline", marginRight: 4 }} />}{h.codigo}</span>
                                                        <span className="omni-habilidade__txt">{h.descricao}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {form.habilidades_bncc.length > 0 && (
                                    <div className="omni-linha__opcoes" aria-label="Habilidades escolhidas">
                                        {form.habilidades_bncc.map(c => (
                                            <button key={c} type="button" className="omni-pilula" aria-pressed title="Tirar esta habilidade"
                                                onClick={() => setForm(prev => ({ ...prev, habilidades_bncc: prev.habilidades_bncc.filter(x => x !== c) }))}>
                                                {c} <X size={14} aria-hidden style={{ marginLeft: 4 }} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="omni-apoio" style={{ margin: 0 }}>Não achamos a BNCC deste ano. Você ainda pode escrever os objetivos abaixo.</p>
                        )}

                        <BloomObjectives selected={form.objetivos} onToggle={v => toggleFormTag("objetivos", v)} />
                        <Campo rotulo="Objetivos em texto livre">
                            <textarea className="omni-entrada" rows={2} placeholder="Ou escreva os objetivos com suas palavras" value={form.objetivos_livre} onChange={e => setForm(f => ({ ...f, objetivos_livre: e.target.value }))} />
                        </Campo>

                        <TagSelector options={METODOLOGIAS} selected={form.metodologias} onToggle={v => toggleFormTag("metodologias", v)} label="Metodologia" />
                        <Campo rotulo="Como aplicar a metodologia">
                            <textarea className="omni-entrada" rows={3} placeholder="Como as metodologias entram neste bloco (a sugestão da IA preenche aqui)" value={form.metodologia_livre} onChange={e => setForm(f => ({ ...f, metodologia_livre: e.target.value }))} />
                        </Campo>

                        <TagSelector options={RECURSOS} selected={form.recursos} onToggle={v => toggleFormTag("recursos", v)} label="Recursos didáticos" />

                        <TagSelector options={AVALIACOES} selected={form.avaliacoes} onToggle={v => toggleFormTag("avaliacoes", v)} label="Avaliação" />
                        <Campo rotulo="Detalhes da avaliação">
                            <textarea className="omni-entrada" rows={2} placeholder="Critérios, instrumentos, adaptações" value={form.avaliacao_livre} onChange={e => setForm(f => ({ ...f, avaliacao_livre: e.target.value }))} />
                        </Campo>

                        {iaErro && (
                            <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                                <AlertTriangle className="omni-aviso__icone" aria-hidden />
                                <div><div className="omni-aviso__titulo">{iaErro}</div></div>
                                <span />
                            </div>
                        )}
                    </div>
                    <div className="omni-mesa__acao">
                        <button onClick={addBloco} disabled={!canAddBloco} type="button" className="omni-btn omni-btn--primario">
                            <Plus size={18} aria-hidden /> {editingIndex !== null ? "Salvar o bloco" : "Adicionar à sequência"}
                        </button>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={gerarSugestaoIA} disabled={iaLoading || form.habilidades_bncc.length === 0} aria-busy={iaLoading} type="button" className="omni-btn omni-btn--secundario" style={{ flex: 1 }}>
                                {iaLoading ? <OmniLoader size={18} engine="red" /> : <Sparkles size={18} aria-hidden />} {iaLoading ? "Sugerindo…" : "Sugerir com IA"}
                            </button>
                            {editingIndex !== null && (
                                <button onClick={() => { setForm(emptyBloco()); setEditingIndex(null); }} type="button" className="omni-btn omni-btn--discreto">Cancelar</button>
                            )}
                        </div>
                        {form.habilidades_bncc.length === 0 && <p className="omni-mesa__acao-dica">Escolha ao menos uma habilidade para a IA sugerir o resto.</p>}
                    </div>
                </section>

                {/* DIREITA: a sequência didática */}
                <section className="omni-mesa__resultado" aria-labelledby="pc-sequencia">
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                        <h3 id="pc-sequencia" style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Sequência didática · {plano.bimestre}</h3>
                        <span className="omni-estado omni-estado--neutro">{plural(plano.blocos.length, "bloco", "blocos")}</span>
                    </div>

                    {plano.blocos.length === 0 ? (
                        <div className="omni-mesa__vazio">
                            <BookOpen size={40} aria-hidden style={{ color: "var(--tinta-3)" }} />
                            <p className="omni-mesa__vazio-titulo">A sequência ainda está vazia</p>
                            <p className="omni-mesa__vazio-texto">Escolha as habilidades da BNCC, os objetivos e a metodologia ao lado e adicione o primeiro bloco.</p>
                        </div>
                    ) : (
                        <>
                            {plano.blocos.map((bloco, index) => {
                                const aberto = expandedBloco === bloco.id;
                                const editando = editingIndex === index;
                                return (
                                    <article key={bloco.id} className="omni-cartao" style={{ padding: 0, gap: 0, overflow: "hidden", outline: editando ? "2px solid var(--acao)" : undefined }}>
                                        <button onClick={() => setExpandedBloco(aberto ? null : bloco.id)} type="button" aria-expanded={aberto}
                                            style={{ all: "unset", boxSizing: "border-box", width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", cursor: "pointer" }}>
                                            {aberto ? <ChevronDown size={18} aria-hidden style={{ color: "var(--acao)" }} /> : <ChevronRight size={18} aria-hidden style={{ color: "var(--tinta-3)" }} />}
                                            <span style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{ display: "block", font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>Bloco {index + 1}{editando ? " · editando" : ""}</span>
                                                {bloco.unidade_tematica && <span className="omni-apoio" style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bloco.unidade_tematica}{bloco.objeto_conhecimento ? ` · ${bloco.objeto_conhecimento}` : ""}</span>}
                                            </span>
                                            <span className="omni-estado omni-estado--info">{plural(bloco.habilidades_bncc.length, "habilidade", "habilidades")}</span>
                                        </button>
                                        {aberto && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 18px 18px", borderTop: "1px solid var(--borda)" }}>
                                                {bloco.habilidades_bncc.length > 0 && (
                                                    <div className="omni-linha" style={{ paddingTop: 12 }}>
                                                        <p className="omni-linha__rotulo">Habilidades da BNCC</p>
                                                        {bloco.habilidades_bncc.map(c => (
                                                            <p key={c} style={{ margin: 0, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                                                                <span className="omni-habilidade__cod" style={{ marginRight: 6 }}>{c}</span>{bloco.habilidades_descricoes[c] || ""}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                {(bloco.objetivos.length > 0 || bloco.objetivos_livre) && (
                                                    <div className="omni-linha"><p className="omni-linha__rotulo">Objetivos</p><p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--tinta-2)" }}>{bloco.objetivos_livre || bloco.objetivos.join("; ")}</p></div>
                                                )}
                                                {(bloco.metodologias.length > 0 || bloco.metodologia_livre) && (
                                                    <div className="omni-linha"><p className="omni-linha__rotulo">Metodologia</p><p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--tinta-2)" }}>{bloco.metodologia_livre || bloco.metodologias.join(", ")}</p></div>
                                                )}
                                                {bloco.recursos.length > 0 && (
                                                    <div className="omni-linha"><p className="omni-linha__rotulo">Recursos</p><div className="omni-linha__opcoes">{bloco.recursos.map(r => <span key={r} className="omni-estado omni-estado--neutro">{r}</span>)}</div></div>
                                                )}
                                                {(bloco.avaliacoes.length > 0 || bloco.avaliacao_livre) && (
                                                    <div className="omni-linha"><p className="omni-linha__rotulo">Avaliação</p><p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--tinta-2)" }}>{bloco.avaliacao_livre || bloco.avaliacoes.join("; ")}</p></div>
                                                )}
                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--borda)" }}>
                                                    <button onClick={() => editBloco(index)} type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno"><Edit3 size={16} aria-hidden /> Editar</button>
                                                    <button onClick={() => duplicateBloco(index)} type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno"><Copy size={16} aria-hidden /> Duplicar</button>
                                                    <button onClick={() => removeBloco(index)} type="button" className="omni-btn omni-btn--perigo omni-btn--pequeno" style={{ marginLeft: "auto" }}><Trash2 size={16} aria-hidden /> Tirar da sequência</button>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                            {error && (
                                <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                                    <AlertTriangle className="omni-aviso__icone" aria-hidden />
                                    <div><div className="omni-aviso__titulo">{error}</div></div>
                                    <span />
                                </div>
                            )}
                            <button onClick={salvar} disabled={saving || plano.blocos.length === 0} aria-busy={saving} type="button" className="omni-btn omni-btn--primario omni-btn--grande">
                                {saving ? <OmniLoader size={18} /> : <Save size={18} aria-hidden />}
                                {saving ? "Salvando…" : `Salvar o plano (${plural(plano.blocos.length, "bloco", "blocos")})`}
                            </button>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
