"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FileText, Save, Loader2,
    CheckCircle2, BookOpen, AlertTriangle,
    ChevronDown, ChevronRight, Plus, X,
    Sparkles, GraduationCap, Target,
    BookMarked, Lightbulb, ClipboardList,
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

interface PlanoData {
    id?: string;
    bimestre: string;
    habilidades_bncc: string[];
    objetivos: string;
    conteudos: string;
    metodologia: string;
    recursos: string[];
    avaliacao: string;
    unidades_tematicas: string[];
    objetos_conhecimento: string[];
}

interface Props {
    studentId: string | null;
    disciplina: string;
    anoSerie: string;
    onPlanoSaved?: (planoId: string) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const BIMESTRES = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];
const TRIMESTRES = ["1º Trimestre", "2º Trimestre", "3º Trimestre"];

type PeriodoTipo = "bimestre" | "trimestre";

const RECURSOS_SUGESTOES = [
    "Livro Didático", "Quadro Branco", "Projetor / Slides",
    "Vídeos Educativos", "Material Concreto", "Laboratório",
    "Jogos Pedagógicos", "Fichas / Atividades Impressas",
    "Computador / Tablet", "Material Adaptado", "Música / Áudio",
    "Mapas / Gráficos", "Biblioteca", "Trabalho em Campo",
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    backgroundColor: "var(--bg-secondary, rgba(15,23,42,.4))",
    overflow: "hidden",
};

const sectionHeaderStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-default, rgba(148,163,184,.1))",
    backgroundColor: "var(--bg-tertiary, rgba(15,23,42,.3))",
};

const sectionBodyStyle: React.CSSProperties = {
    padding: 16,
};

const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600,
    color: "var(--text-secondary, #cbd5e1)",
    marginBottom: 6, display: "block",
};

const textareaStyle: React.CSSProperties = {
    width: "100%", minHeight: 100, padding: 12, borderRadius: 10,
    background: "var(--bg-primary, rgba(2,6,23,.5))",
    color: "var(--text-primary, #e2e8f0)",
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    fontSize: 14, lineHeight: 1.6, resize: "vertical",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const selectStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    background: "var(--bg-primary, rgba(2,6,23,.5))",
    color: "var(--text-primary, #e2e8f0)",
    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    fontSize: 14, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export function PEIPlanoEnsino({ studentId, disciplina, anoSerie, onPlanoSaved }: Props) {
    // Estado BNCC
    const [bncc, setBncc] = useState<BnccEstrutura | null>(null);
    const [bnccLoading, setBnccLoading] = useState(false);

    // Tipo de período
    const [periodoTipo, setPeriodoTipo] = useState<PeriodoTipo>("bimestre");
    const periodos = periodoTipo === "bimestre" ? BIMESTRES : TRIMESTRES;

    // Estado do plano
    const [plano, setPlano] = useState<PlanoData>({
        bimestre: BIMESTRES[0],
        habilidades_bncc: [],
        objetivos: "",
        conteudos: "",
        metodologia: "",
        recursos: [],
        avaliacao: "",
        unidades_tematicas: [],
        objetos_conhecimento: [],
    });
    const [planoId, setPlanoId] = useState<string | null>(null);

    // UI
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [expandedUnidades, setExpandedUnidades] = useState<Set<string>>(new Set());
    const [expandedObjetos, setExpandedObjetos] = useState<Set<string>>(new Set());

    // ─── Carregar BNCC ────────────────────────────────────────────────────────

    useEffect(() => {
        if (!anoSerie) return;
        setBnccLoading(true);
        // Enviar anoSerie direto — a API lida com todos os formatos
        // ex: "7º Ano (EFAF)", "7º Ano", "7", etc.
        fetch(`/api/bncc/ef?serie=${encodeURIComponent(anoSerie)}&estrutura=1`)
            .then((r) => r.json())
            .then((data: BnccEstrutura) => {
                if (data?.disciplinas?.length > 0) {
                    setBncc(data);
                } else {
                    console.warn("BNCC: nenhuma disciplina retornada para", anoSerie);
                }
            })
            .catch((err) => { console.error("BNCC fetch error:", err); })
            .finally(() => setBnccLoading(false));
    }, [anoSerie]);

    // ─── Carregar plano existente ─────────────────────────────────────────────

    useEffect(() => {
        if (!disciplina || !anoSerie) return;
        setLoading(true);
        fetch(`/api/pei/plano-ensino?disciplina=${encodeURIComponent(disciplina)}&ano_serie=${encodeURIComponent(anoSerie)}`)
            .then((r) => r.json())
            .then((data) => {
                const planos = data.planos || [];
                if (planos.length > 0) {
                    const p = planos[0];
                    // Parse conteudo - pode ser JSON estruturado ou texto livre
                    let parsed: Partial<PlanoData> = {};
                    try {
                        if (p.conteudo && p.conteudo.startsWith("{")) {
                            parsed = JSON.parse(p.conteudo);
                        }
                    } catch { /* texto livre */ }

                    setPlano({
                        bimestre: p.bimestre || BIMESTRES[0],
                        habilidades_bncc: p.habilidades_bncc || parsed.habilidades_bncc || [],
                        objetivos: parsed.objetivos || (p.conteudo && !p.conteudo.startsWith("{") ? p.conteudo : ""),
                        conteudos: parsed.conteudos || "",
                        metodologia: parsed.metodologia || "",
                        recursos: parsed.recursos || [],
                        avaliacao: parsed.avaliacao || "",
                        unidades_tematicas: parsed.unidades_tematicas || [],
                        objetos_conhecimento: parsed.objetos_conhecimento || [],
                    });
                    setPlanoId(p.id);
                    setSaved(true);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [disciplina, anoSerie]);

    // ─── BNCC filtrada pela disciplina ────────────────────────────────────────

    const bnccDisciplinas = useMemo(() => {
        if (!bncc || !bncc.disciplinas?.length) return null;
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const dNorm = normalize(disciplina);
        const isGeral = dNorm === "geral" || !disciplina;

        if (!isGeral) {
            // Tentar match específico
            const key = Object.keys(bncc.porDisciplina).find((d) => {
                const bNorm = normalize(d);
                return bNorm === dNorm ||
                    bNorm.includes(dNorm) || dNorm.includes(bNorm) ||
                    bNorm.replace(/\s+/g, "") === dNorm.replace(/\s+/g, "");
            });
            if (key) {
                return [{ name: key, data: bncc.porDisciplina[key] }];
            }
        }

        // "Geral" ou sem match → mostrar TODAS as disciplinas BNCC
        return bncc.disciplinas.map((d) => ({ name: d, data: bncc.porDisciplina[d] }));
    }, [bncc, disciplina]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const updateField = useCallback((field: keyof PlanoData, value: unknown) => {
        setPlano((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    }, []);

    const toggleHabilidade = useCallback((codigo: string) => {
        setPlano((prev) => ({
            ...prev,
            habilidades_bncc: prev.habilidades_bncc.includes(codigo)
                ? prev.habilidades_bncc.filter((h) => h !== codigo)
                : [...prev.habilidades_bncc, codigo],
        }));
        setSaved(false);
    }, []);

    const toggleRecurso = useCallback((recurso: string) => {
        setPlano((prev) => ({
            ...prev,
            recursos: prev.recursos.includes(recurso)
                ? prev.recursos.filter((r) => r !== recurso)
                : [...prev.recursos, recurso],
        }));
        setSaved(false);
    }, []);

    const toggleExpand = useCallback((set: "unidades" | "objetos", key: string) => {
        const setter = set === "unidades" ? setExpandedUnidades : setExpandedObjetos;
        setter((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }, []);

    // ─── Salvar ───────────────────────────────────────────────────────────────

    const salvar = async () => {
        setSaving(true);
        setError("");
        try {
            const conteudoJson = JSON.stringify({
                objetivos: plano.objetivos,
                conteudos: plano.conteudos,
                metodologia: plano.metodologia,
                recursos: plano.recursos,
                avaliacao: plano.avaliacao,
                unidades_tematicas: plano.unidades_tematicas,
                objetos_conhecimento: plano.objetos_conhecimento,
            });

            const res = await fetch("/api/pei/plano-ensino", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: planoId || undefined,
                    disciplina,
                    ano_serie: anoSerie,
                    conteudo: conteudoJson,
                    habilidades_bncc: plano.habilidades_bncc,
                    bimestre: plano.bimestre,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlanoId(data.plano?.id);
            setSaved(true);
            onPlanoSaved?.(data.plano?.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar plano");
        } finally {
            setSaving(false);
        }
    };

    // ─── Loading ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "#10b981", margin: "0 auto" }} />
                <p style={{ color: "var(--text-muted)", marginTop: 12, fontSize: 13 }}>Carregando plano...</p>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    const habCount = plano.habilidades_bncc.length;
    const isComplete = plano.objetivos.trim().length > 0 && habCount > 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ── Header ────────────────────────────────────────────────── */}
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
                                {bnccDisciplinas && <> · BNCC integrada ({bnccDisciplinas.length} componente{bnccDisciplinas.length !== 1 ? "s" : ""})</>}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {saved && (
                            <span style={{
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 12, fontWeight: 600, color: "#bbf7d0",
                            }}>
                                <CheckCircle2 size={14} /> Salvo
                            </span>
                        )}
                        {habCount > 0 && (
                            <span style={{
                                background: "rgba(255,255,255,.2)",
                                padding: "3px 10px", borderRadius: 20,
                                fontSize: 11, fontWeight: 700,
                            }}>
                                {habCount} habilidade{habCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Período (Bimestre / Trimestre) ─────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Toggle tipo */}
                <div style={{ display: "flex", gap: 4, padding: 3, borderRadius: 10, background: "var(--bg-tertiary, rgba(15,23,42,.4))", width: "fit-content" }}>
                    {(["bimestre", "trimestre"] as const).map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => {
                                setPeriodoTipo(tipo);
                                updateField("bimestre", tipo === "bimestre" ? BIMESTRES[0] : TRIMESTRES[0]);
                            }}
                            style={{
                                padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                border: "none",
                                background: periodoTipo === tipo ? "rgba(16,185,129,.15)" : "transparent",
                                color: periodoTipo === tipo ? "#34d399" : "var(--text-muted, #94a3b8)",
                                cursor: "pointer", transition: "all .2s",
                                textTransform: "capitalize",
                            }}
                        >
                            {tipo}
                        </button>
                    ))}
                </div>
                {/* Períodos */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {periodos.map((b) => (
                        <button
                            key={b}
                            onClick={() => updateField("bimestre", b)}
                            style={{
                                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                border: plano.bimestre === b ? "1.5px solid #10b981" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                                background: plano.bimestre === b ? "rgba(16,185,129,.12)" : "transparent",
                                color: plano.bimestre === b ? "#34d399" : "var(--text-muted, #94a3b8)",
                                cursor: "pointer", transition: "all .2s",
                            }}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Seção BNCC ────────────────────────────────────────────── */}
            {bnccLoading ? (
                <div style={{ ...cardStyle, padding: 24, textAlign: "center" }}>
                    <Loader2 size={22} className="animate-spin" style={{ color: "#6366f1", margin: "0 auto" }} />
                    <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 13 }}>Carregando BNCC...</p>
                </div>
            ) : bnccDisciplinas ? (
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <GraduationCap size={18} style={{ color: "#818cf8" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                            Habilidades BNCC {bnccDisciplinas.length === 1 ? `— ${bnccDisciplinas[0].name}` : ""}
                        </span>
                        <span style={{
                            marginLeft: "auto", fontSize: 11, fontWeight: 600,
                            color: "#818cf8", background: "rgba(99,102,241,.1)",
                            padding: "2px 8px", borderRadius: 6,
                        }}>
                            {habCount} selecionada{habCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div style={{ ...sectionBodyStyle, maxHeight: 500, overflowY: "auto" }}>
                        {bnccDisciplinas.map((disc) => {
                            const discKey = `disc_${disc.name}`;
                            const isDiscExpanded = bnccDisciplinas.length === 1 || expandedUnidades.has(discKey);
                            // Count selected for this discipline
                            let discSelectedCount = 0;
                            for (const u of disc.data.unidades) {
                                for (const o of disc.data.porUnidade[u].objetos) {
                                    for (const h of disc.data.porUnidade[u].porObjeto[o]) {
                                        if (plano.habilidades_bncc.includes(h.codigo)) discSelectedCount++;
                                    }
                                }
                            }

                            return (
                                <div key={discKey} style={{ marginBottom: bnccDisciplinas.length > 1 ? 8 : 0 }}>
                                    {/* Discipline header (only if multiple) */}
                                    {bnccDisciplinas.length > 1 && (
                                        <button
                                            onClick={() => toggleExpand("unidades", discKey)}
                                            style={{
                                                width: "100%", display: "flex", alignItems: "center", gap: 8,
                                                padding: "10px 12px", borderRadius: 10, border: "none",
                                                background: isDiscExpanded ? "rgba(99,102,241,.06)" : "var(--bg-tertiary, rgba(15,23,42,.3))",
                                                cursor: "pointer", textAlign: "left", transition: "all .2s",
                                                marginBottom: isDiscExpanded ? 4 : 0,
                                            }}
                                        >
                                            {isDiscExpanded ? <ChevronDown size={16} style={{ color: "#818cf8" }} /> : <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />}
                                            <span style={{
                                                fontSize: 14, fontWeight: 700,
                                                color: isDiscExpanded ? "#a5b4fc" : "var(--text-primary, #e2e8f0)",
                                            }}>
                                                {disc.name}
                                            </span>
                                            {discSelectedCount > 0 && (
                                                <span style={{
                                                    marginLeft: "auto", fontSize: 10, fontWeight: 700,
                                                    color: "#10b981", background: "rgba(16,185,129,.1)",
                                                    padding: "2px 8px", borderRadius: 6,
                                                }}>
                                                    {discSelectedCount} sel.
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    {/* Unidades temáticas */}
                                    {isDiscExpanded && (
                                        <div style={{ paddingLeft: bnccDisciplinas.length > 1 ? 12 : 0 }}>
                                            {disc.data.unidades.map((unidade: string) => {
                                                const uKey = `u_${disc.name}_${unidade}`;
                                                const isUExpanded = expandedUnidades.has(uKey);
                                                const unidadeData = disc.data.porUnidade[unidade];

                                                return (
                                                    <div key={uKey} style={{ marginBottom: 4 }}>
                                                        <button
                                                            onClick={() => toggleExpand("unidades", uKey)}
                                                            style={{
                                                                width: "100%", display: "flex", alignItems: "center", gap: 8,
                                                                padding: "8px 10px", borderRadius: 8, border: "none",
                                                                background: isUExpanded ? "rgba(99,102,241,.08)" : "transparent",
                                                                cursor: "pointer", textAlign: "left", transition: "all .2s",
                                                            }}
                                                        >
                                                            {isUExpanded ? <ChevronDown size={14} style={{ color: "#818cf8" }} /> : <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}
                                                            <span style={{
                                                                fontSize: 13, fontWeight: 600,
                                                                color: isUExpanded ? "#a5b4fc" : "var(--text-secondary, #cbd5e1)",
                                                            }}>
                                                                {unidade}
                                                            </span>
                                                            {(() => {
                                                                let count = 0;
                                                                for (const obj of unidadeData.objetos) {
                                                                    for (const h of unidadeData.porObjeto[obj]) {
                                                                        if (plano.habilidades_bncc.includes(h.codigo)) count++;
                                                                    }
                                                                }
                                                                return count > 0 ? (
                                                                    <span style={{
                                                                        marginLeft: "auto", fontSize: 10, fontWeight: 700,
                                                                        color: "#10b981", background: "rgba(16,185,129,.1)",
                                                                        padding: "1px 6px", borderRadius: 4,
                                                                    }}>
                                                                        {count}
                                                                    </span>
                                                                ) : null;
                                                            })()}
                                                        </button>

                                                        {isUExpanded && (
                                                            <div style={{ paddingLeft: 20 }}>
                                                                {unidadeData.objetos.map((objeto: string) => {
                                                                    const oKey = `o_${disc.name}_${unidade}_${objeto}`;
                                                                    const isOExpanded = expandedObjetos.has(oKey);
                                                                    const habs = unidadeData.porObjeto[objeto];

                                                                    return (
                                                                        <div key={oKey} style={{ marginBottom: 4 }}>
                                                                            <button
                                                                                onClick={() => toggleExpand("objetos", oKey)}
                                                                                style={{
                                                                                    width: "100%", display: "flex", alignItems: "center", gap: 6,
                                                                                    padding: "8px 10px", borderRadius: 6, border: "none",
                                                                                    background: isOExpanded ? "rgba(16,185,129,.06)" : "transparent",
                                                                                    cursor: "pointer", textAlign: "left", transition: "all .15s",
                                                                                }}
                                                                            >
                                                                                {isOExpanded ? <ChevronDown size={12} style={{ color: "#10b981" }} /> : <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />}
                                                                                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary, #cbd5e1)" }}>
                                                                                    {objeto}
                                                                                </span>
                                                                                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted, #64748b)" }}>
                                                                                    {habs.length} hab.
                                                                                </span>
                                                                            </button>

                                                                            {isOExpanded && (
                                                                                <div style={{ paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
                                                                                    {habs.map((h: Habilidade) => {
                                                                                        const selected = plano.habilidades_bncc.includes(h.codigo);
                                                                                        return (
                                                                                            <label
                                                                                                key={h.codigo}
                                                                                                style={{
                                                                                                    display: "flex", alignItems: "flex-start", gap: 8,
                                                                                                    padding: "6px 10px", borderRadius: 8,
                                                                                                    cursor: "pointer", transition: "all .15s",
                                                                                                    background: selected ? "rgba(16,185,129,.08)" : "transparent",
                                                                                                    border: selected ? "1px solid rgba(16,185,129,.2)" : "1px solid transparent",
                                                                                                    marginBottom: 3,
                                                                                                }}
                                                                                            >
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={selected}
                                                                                                    onChange={() => toggleHabilidade(h.codigo)}
                                                                                                    style={{
                                                                                                        marginTop: 3, accentColor: "#10b981",
                                                                                                        width: 16, height: 16, flexShrink: 0,
                                                                                                    }}
                                                                                                />
                                                                                                <div style={{ flex: 1 }}>
                                                                                                    <span style={{
                                                                                                        fontSize: 11, fontWeight: 700,
                                                                                                        color: selected ? "#34d399" : "#818cf8",
                                                                                                        marginRight: 6,
                                                                                                    }}>
                                                                                                        {h.codigo}
                                                                                                    </span>
                                                                                                    <span style={{
                                                                                                        fontSize: 12,
                                                                                                        color: "var(--text-secondary, #cbd5e1)",
                                                                                                        lineHeight: 1.4,
                                                                                                    }}>
                                                                                                        {h.descricao}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </label>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Fallback: habilidades BNCC manual */
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <GraduationCap size={18} style={{ color: "#818cf8" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                            Habilidades BNCC
                        </span>
                    </div>
                    <div style={sectionBodyStyle}>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                            BNCC não disponível para esta série/disciplina. Insira os códigos manualmente (ex: EF07MA01).
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                            {plano.habilidades_bncc.map((h) => (
                                <span
                                    key={h}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 4,
                                        padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                        background: "rgba(99,102,241,.1)", color: "#a5b4fc",
                                        border: "1px solid rgba(99,102,241,.2)",
                                    }}
                                >
                                    {h}
                                    <button
                                        onClick={() => toggleHabilidade(h)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 0 }}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                type="text"
                                placeholder="Ex: EF07MA01"
                                id="hab-manual-input"
                                style={{ ...selectStyle, flex: 1 }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                                        if (val && !plano.habilidades_bncc.includes(val)) {
                                            toggleHabilidade(val);
                                            (e.target as HTMLInputElement).value = "";
                                        }
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    const input = document.getElementById("hab-manual-input") as HTMLInputElement;
                                    const val = input?.value?.trim().toUpperCase();
                                    if (val && !plano.habilidades_bncc.includes(val)) {
                                        toggleHabilidade(val);
                                        input.value = "";
                                    }
                                }}
                                style={{
                                    padding: "8px 14px", borderRadius: 8, border: "none",
                                    background: "rgba(99,102,241,.15)", color: "#818cf8",
                                    cursor: "pointer", fontWeight: 600, fontSize: 13,
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Objetivos de Aprendizagem ─────────────────────────────── */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                    <Target size={18} style={{ color: "#f59e0b" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                        Objetivos de Aprendizagem
                    </span>
                </div>
                <div style={sectionBodyStyle}>
                    <textarea
                        value={plano.objetivos}
                        onChange={(e) => updateField("objetivos", e.target.value)}
                        placeholder={"Descreva os objetivos de aprendizagem para este bimestre...\n\n• O que o estudante deve ser capaz de fazer ao final\n• Habilidades a serem desenvolvidas\n• Competências esperadas"}
                        style={textareaStyle}
                    />
                </div>
            </div>

            {/* ── Conteúdos Programáticos ────────────────────────────────── */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                    <BookMarked size={18} style={{ color: "#3b82f6" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                        Conteúdos Programáticos
                    </span>
                </div>
                <div style={sectionBodyStyle}>
                    <textarea
                        value={plano.conteudos}
                        onChange={(e) => updateField("conteudos", e.target.value)}
                        placeholder={"Liste os conteúdos que serão trabalhados neste bimestre...\n\n• Tópicos e subtópicos\n• Sequência didática prevista\n• Pré-requisitos necessários"}
                        style={textareaStyle}
                    />
                </div>
            </div>

            {/* ── Metodologia ───────────────────────────────────────────── */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                    <Lightbulb size={18} style={{ color: "#8b5cf6" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                        Metodologia
                    </span>
                </div>
                <div style={sectionBodyStyle}>
                    <textarea
                        value={plano.metodologia}
                        onChange={(e) => updateField("metodologia", e.target.value)}
                        placeholder={"Descreva a metodologia e estratégias de ensino...\n\n• Abordagens pedagógicas\n• Atividades previstas\n• Estratégias de diferenciação para estudantes com necessidades especiais"}
                        style={textareaStyle}
                    />
                </div>
            </div>

            {/* ── Recursos Didáticos ─────────────────────────────────────── */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                    <Sparkles size={18} style={{ color: "#ec4899" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                        Recursos Didáticos
                    </span>
                </div>
                <div style={sectionBodyStyle}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {RECURSOS_SUGESTOES.map((r) => {
                            const active = plano.recursos.includes(r);
                            return (
                                <button
                                    key={r}
                                    onClick={() => toggleRecurso(r)}
                                    style={{
                                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                        border: active ? "1px solid rgba(236,72,153,.3)" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                                        background: active ? "rgba(236,72,153,.1)" : "transparent",
                                        color: active ? "#f472b6" : "var(--text-muted, #94a3b8)",
                                        cursor: "pointer", transition: "all .2s",
                                    }}
                                >
                                    {active && <CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />}
                                    {r}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Avaliação ─────────────────────────────────────────────── */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                    <ClipboardList size={18} style={{ color: "#14b8a6" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #e2e8f0)" }}>
                        Avaliação
                    </span>
                </div>
                <div style={sectionBodyStyle}>
                    <textarea
                        value={plano.avaliacao}
                        onChange={(e) => updateField("avaliacao", e.target.value)}
                        placeholder={"Descreva como será feita a avaliação...\n\n• Instrumentos avaliativos (prova, trabalho, portfólio, etc.)\n• Critérios de avaliação\n• Adaptações avaliativas para estudantes com necessidades especiais"}
                        style={textareaStyle}
                    />
                </div>
            </div>

            {/* ── Erros ─────────────────────────────────────────────────── */}
            {error && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(239,68,68,.08)", color: "#f87171",
                    border: "1px solid rgba(239,68,68,.2)", fontSize: 13,
                }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {/* ── Botão Salvar ──────────────────────────────────────────── */}
            <button
                onClick={salvar}
                disabled={saving}
                style={{
                    padding: "14px 24px", borderRadius: 12,
                    background: isComplete
                        ? "linear-gradient(135deg, #059669, #10b981)"
                        : "linear-gradient(135deg, #475569, #64748b)",
                    color: "#fff", border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: 15,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all .3s",
                    opacity: saving ? 0.7 : 1,
                }}
            >
                {saving ? (
                    <><Loader2 size={18} className="animate-spin" /> Salvando...</>
                ) : (
                    <><Save size={18} /> Salvar Plano de Ensino</>
                )}
            </button>
        </div>
    );
}
