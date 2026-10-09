"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Loader2, CheckCircle2, Upload, Link2, FileText,
    ExternalLink, Eye, AlertTriangle,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PlanoVinculado {
    id: string;
    disciplina: string;
    ano_serie: string;
    bimestre: string | null;
    conteudo: string | null;
    habilidades_bncc: string[];
    professor_nome: string;
    updated_at: string;
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
    recursos: string[];
    avaliacoes: string[];
    avaliacao_livre: string;
}

interface Props {
    studentId: string | null;
    disciplina: string;
    anoSerie: string;
    onPlanoSaved?: (planoId: string) => void;
}

// ─── Estilos (Onda 18: variáveis do design system) ───────────────────────────

const cardS: React.CSSProperties = {
    borderRadius: "var(--o-radius-md)", border: "1px solid var(--borda)",
    backgroundColor: "var(--superficie)", overflow: "hidden",
};
const headerS: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "12px 16px",
    borderBottom: "1px solid var(--borda)",
    backgroundColor: "var(--superficie-2)",
};
const bodyS: React.CSSProperties = { padding: 16 };
const tituloS: React.CSSProperties = { margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" };
const rotuloBlocoS: React.CSSProperties = { fontWeight: 700, color: "var(--tinta)" };

// ─── Componente Principal ─────────────────────────────────────────────────────

export function PEIPlanoEnsino({ studentId, disciplina, anoSerie, onPlanoSaved }: Props) {
    const [loading, setLoading] = useState(true);
    const [planosDisponiveis, setPlanosDisponiveis] = useState<PlanoVinculado[]>([]);
    const [planoVinculado, setPlanoVinculado] = useState<PlanoVinculado | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [expandedView, setExpandedView] = useState(false);
    const [uploadMode, setUploadMode] = useState(false);

    // ─── Fetch available plans from Plano de ensino module ───────────────

    useEffect(() => {
        if (!disciplina || !anoSerie) { setLoading(false); return; }
        setLoading(true);

        Promise.all([
            // Fetch plans from plano-curso (independent module)
            fetch(`/api/plano-curso?componente=${encodeURIComponent(disciplina)}&serie=${encodeURIComponent(anoSerie)}`)
                .then(r => r.json()).catch(() => ({ planos: [] })),
            // Check if there's already a linked plan for this PEI
            fetch(`/api/pei/plano-ensino?disciplina=${encodeURIComponent(disciplina)}&ano_serie=${encodeURIComponent(anoSerie)}`)
                .then(r => r.json()).catch(() => ({ planos: [] })),
        ]).then(([cursoData, peiData]) => {
            setPlanosDisponiveis(cursoData.planos || []);
            const peiPlanos = peiData.planos || [];
            if (peiPlanos.length > 0) {
                setPlanoVinculado(peiPlanos[0]);
                setSaved(true);
            }
        }).finally(() => setLoading(false));
    }, [disciplina, anoSerie]);

    // ─── Link plan ──────────────────────────────────────────────────────

    const vincularPlano = useCallback(async (plano: PlanoVinculado) => {
        setSaving(true); setError("");
        try {
            // Ensure conteudo is a string (it may be a parsed object from jsonb)
            const conteudoStr = plano.conteudo
                ? (typeof plano.conteudo === "string" ? plano.conteudo : JSON.stringify(plano.conteudo))
                : null;

            const res = await fetch("/api/pei/plano-ensino", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: planoVinculado?.id || undefined,
                    disciplina, ano_serie: anoSerie,
                    conteudo: conteudoStr,
                    habilidades_bncc: plano.habilidades_bncc,
                    bimestre: plano.bimestre,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao vincular plano");
            setPlanoVinculado({ ...plano, id: data.plano?.id || plano.id });
            setSaved(true);
            onPlanoSaved?.(data.plano?.id);
        } catch (err) {
            console.error("vincularPlano error:", err);
            setError(err instanceof Error ? err.message : "Erro ao vincular plano");
        } finally { setSaving(false); }
    }, [disciplina, anoSerie, planoVinculado, onPlanoSaved]);

    // ─── Parse blocos ───────────────────────────────────────────────────

    function parseBlocos(conteudo: string | null): SequenciaBloco[] {
        if (!conteudo) return [];
        try {
            const parsed = typeof conteudo === "string" ? JSON.parse(conteudo) : conteudo;
            if (parsed?.blocos && Array.isArray(parsed.blocos)) return parsed.blocos;
        } catch { /* ignore */ }
        return [];
    }

    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div role="status" style={{ padding: 40, textAlign: "center" }}>
                <Loader2 size={28} className="animate-spin" aria-hidden style={{ color: "var(--acao)", margin: "0 auto" }} />
                <p className="omni-apoio" style={{ marginTop: 12 }}>Carregando o plano…</p>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────

    return (
        <div style={{ display: "grid", gap: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <BookOpen size={22} aria-hidden style={{ color: "var(--acao)", marginTop: 2 }} />
                    <div>
                        <h4 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Plano de ensino — {disciplina}</h4>
                        <p className="omni-apoio" style={{ margin: 0 }}>
                            {anoSerie} · use um plano feito no módulo Plano de ensino ou envie o seu em PDF
                        </p>
                    </div>
                </div>
                {saved && (
                    <span className="omni-estado omni-estado--sucesso">
                        <CheckCircle2 aria-hidden /> Vinculado
                    </span>
                )}
            </div>

            {/* Linked plan preview */}
            {planoVinculado && (
                <section style={cardS} aria-labelledby="plano-vinculado-titulo">
                    <div style={headerS}>
                        <CheckCircle2 size={16} aria-hidden style={{ color: "var(--sucesso)" }} />
                        <h5 id="plano-vinculado-titulo" style={tituloS}>
                            Plano vinculado
                        </h5>
                        <span className="omni-apoio" style={{ marginLeft: "auto", fontSize: 13 }}>
                            {[planoVinculado.bimestre, new Date(planoVinculado.updated_at).toLocaleDateString("pt-BR")].filter(Boolean).join(" · ")}
                        </span>
                    </div>
                    <div style={bodyS}>
                        {(() => {
                            const blocos = parseBlocos(planoVinculado.conteudo);
                            if (blocos.length === 0) return (
                                <p className="omni-apoio" style={{ margin: 0 }}>
                                    Plano vinculado (enviado em PDF ou em formato antigo).
                                </p>
                            );
                            return (
                                <div style={{ display: "grid", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ font: "600 14px/20px var(--font-sans)", color: "var(--tinta)" }}>
                                            {blocos.length} bloco{blocos.length !== 1 ? "s" : ""} de sequência didática
                                        </span>
                                        <span className="omni-estado omni-estado--info">
                                            {planoVinculado.habilidades_bncc?.length || 0} habilidade{(planoVinculado.habilidades_bncc?.length || 0) !== 1 ? "s" : ""}
                                        </span>
                                        <button onClick={() => setExpandedView(!expandedView)} type="button" aria-expanded={expandedView}
                                            className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ marginLeft: "auto" }}>
                                            <Eye size={16} aria-hidden /> {expandedView ? "Esconder os blocos" : "Ver os blocos"}
                                        </button>
                                    </div>

                                    {expandedView && blocos.map((bloco, i) => (
                                        <div key={bloco.id || i} className="omni-cartao omni-cartao--plano" style={{ padding: "12px 14px", gap: 4, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                                            <div style={{ ...rotuloBlocoS, marginBottom: 2 }}>Bloco {i + 1}</div>
                                            {bloco.habilidades_bncc.length > 0 && <div><span style={rotuloBlocoS}>BNCC: </span>{bloco.habilidades_bncc.join(", ")}</div>}
                                            {(bloco.objetivos.length > 0 || bloco.objetivos_livre) && <div><span style={rotuloBlocoS}>Objetivos: </span>{[...bloco.objetivos, bloco.objetivos_livre].filter(Boolean).join("; ")}</div>}
                                            {bloco.metodologias.length > 0 && <div><span style={rotuloBlocoS}>Como ensinar: </span>{bloco.metodologias.join(", ")}</div>}
                                            {bloco.recursos.length > 0 && <div><span style={rotuloBlocoS}>Recursos: </span>{bloco.recursos.join(", ")}</div>}
                                            {(bloco.avaliacoes.length > 0 || bloco.avaliacao_livre) && <div><span style={rotuloBlocoS}>Avaliação: </span>{[...bloco.avaliacoes, bloco.avaliacao_livre].filter(Boolean).join("; ")}</div>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </section>
            )}

            {/* Options */}
            <div role="group" aria-label="Como trazer o plano" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {/* Link option */}
                <button onClick={() => setUploadMode(false)} type="button" aria-pressed={!uploadMode}
                    className="omni-cartao" style={{
                        padding: "18px", gap: 6, cursor: "pointer", textAlign: "left",
                        borderColor: !uploadMode ? "var(--acao)" : "var(--borda)",
                        borderWidth: !uploadMode ? 2 : 1,
                        background: !uploadMode ? "var(--acao-suave)" : "var(--superficie)",
                    }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Link2 size={18} aria-hidden style={{ color: "var(--acao)" }} />
                        <span style={tituloS}>Usar um plano de ensino</span>
                    </span>
                    <span className="omni-apoio" style={{ fontSize: 14 }}>
                        Escolha um plano já feito no módulo Plano de ensino.
                    </span>
                </button>

                {/* Upload option */}
                <button onClick={() => setUploadMode(true)} type="button" aria-pressed={uploadMode}
                    className="omni-cartao" style={{
                        padding: "18px", gap: 6, cursor: "pointer", textAlign: "left",
                        borderColor: uploadMode ? "var(--acao)" : "var(--borda)",
                        borderWidth: uploadMode ? 2 : 1,
                        background: uploadMode ? "var(--acao-suave)" : "var(--superficie)",
                    }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Upload size={18} aria-hidden style={{ color: "var(--acao)" }} />
                        <span style={tituloS}>Enviar o plano em PDF</span>
                    </span>
                    <span className="omni-apoio" style={{ fontSize: 14 }}>
                        Envie um plano de ensino pronto, em PDF.
                    </span>
                </button>
            </div>

            {/* Link mode: show available plans */}
            {!uploadMode && (
                <section style={cardS} aria-labelledby="planos-disponiveis-titulo">
                    <div style={headerS}>
                        <FileText size={16} aria-hidden style={{ color: "var(--acao)" }} />
                        <h5 id="planos-disponiveis-titulo" style={tituloS}>
                            Planos disponíveis
                        </h5>
                        <a href="/plano-curso" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ marginLeft: "auto" }}>
                            <ExternalLink size={16} aria-hidden /> Criar um plano
                        </a>
                    </div>
                    <div style={bodyS}>
                        {planosDisponiveis.length === 0 ? (
                            <div className="omni-vazio">
                                <FileText size={28} aria-hidden style={{ color: "var(--tinta-3)" }} />
                                <p className="omni-vazio__titulo">Nenhum plano encontrado</p>
                                <p className="omni-vazio__texto">
                                    Crie um plano no módulo <strong>Plano de ensino</strong> para {disciplina} — {anoSerie}.
                                </p>
                                <a href="/plano-curso" className="omni-btn omni-btn--primario">
                                    <ExternalLink size={16} aria-hidden /> Ir para o Plano de ensino
                                </a>
                            </div>
                        ) : (
                            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                                {planosDisponiveis.map(p => {
                                    const blocos = parseBlocos(p.conteudo);
                                    const isLinked = planoVinculado?.conteudo === p.conteudo;
                                    return (
                                        <li key={p.id} style={{
                                            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                                            padding: "12px 14px", borderRadius: "var(--o-radius-md)",
                                            background: isLinked ? "var(--sucesso-suave)" : "var(--superficie-2)",
                                            border: `1px solid ${isLinked ? "transparent" : "var(--borda)"}`,
                                        }}>
                                            <div style={{ flex: 1, minWidth: 180 }}>
                                                <div style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                                                    {p.disciplina} — {p.bimestre || "Sem período"}
                                                </div>
                                                <div className="omni-apoio" style={{ fontSize: 13 }}>
                                                    {p.ano_serie} · {blocos.length} bloco{blocos.length !== 1 ? "s" : ""} · {p.habilidades_bncc?.length || 0} habilidade{(p.habilidades_bncc?.length || 0) !== 1 ? "s" : ""} · {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                                                </div>
                                            </div>
                                            {isLinked ? (
                                                <span className="omni-estado omni-estado--sucesso">
                                                    <CheckCircle2 aria-hidden /> Vinculado
                                                </span>
                                            ) : (
                                                <button onClick={() => vincularPlano(p)} disabled={saving} aria-busy={saving} type="button"
                                                    className="omni-btn omni-btn--primario omni-btn--pequeno">
                                                    {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
                                                    {saving ? "Vinculando…" : "Usar este plano"}
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </section>
            )}

            {/* Upload mode: file upload */}
            {uploadMode && (
                <section style={cardS} aria-labelledby="enviar-plano-titulo">
                    <div style={headerS}>
                        <Upload size={16} aria-hidden style={{ color: "var(--acao)" }} />
                        <h5 id="enviar-plano-titulo" style={tituloS}>Enviar o plano de ensino</h5>
                    </div>
                    <div style={bodyS}>
                        <label className="omni-soltar" aria-busy={saving} style={{ cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1 }}>
                            {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
                            <span style={{ fontWeight: 700, color: "var(--tinta)" }}>
                                {saving ? "Enviando…" : "Arraste o PDF aqui ou clique para escolher"}
                            </span>
                            <span className="omni-soltar__dica">Só PDF, até 10 MB</span>
                            <input type="file" accept=".pdf" aria-label="Escolher o PDF do plano de ensino" disabled={saving} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setSaving(true); setError("");
                                try {
                                    const fd = new FormData();
                                    fd.append("file", file);
                                    fd.append("disciplina", disciplina);
                                    fd.append("ano_serie", anoSerie);
                                    const res = await fetch("/api/pei/plano-ensino/upload", { method: "POST", body: fd });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || "Não foi possível enviar o arquivo");
                                    setPlanoVinculado({
                                        id: data.plano?.id || "",
                                        disciplina, ano_serie: anoSerie,
                                        bimestre: null,
                                        conteudo: null,
                                        habilidades_bncc: [],
                                        professor_nome: data.plano?.professor_nome || "",
                                        updated_at: new Date().toISOString(),
                                    });
                                    setSaved(true);
                                    onPlanoSaved?.(data.plano?.id);
                                } catch (err) {
                                    setError(err instanceof Error ? err.message : "Não foi possível enviar o arquivo");
                                } finally { setSaving(false); }
                            }} />
                        </label>
                    </div>
                </section>
            )}

            {/* Error */}
            {error && (
                <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                    <AlertTriangle className="omni-aviso__icone" aria-hidden />
                    <div>
                        <div className="omni-aviso__titulo">Algo deu errado com o plano</div>
                        <div className="omni-aviso__texto">{error}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
