"use client";

import React from "react";
import {
    CheckCircle2, ChevronDown, ChevronUp, Sparkles,
    Target, Layers, Activity, TrendingUp,
} from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import { Card, CardHeader, CardTitle, CardContent } from "@omni/ds";
import { AccessibleButtonGroup } from "@/components/AccessibleButtonGroup";
import type { Aluno, PlanoVinculado } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

type DimensaoNEE = {
    id: string; dimensao: string; o_que_o_professor_observa: string;
    acao_pratica: string; indicadores_observaveis: string[];
    perguntas_professor: string[];
    niveis_omnisfera: Record<string, string>;
};

type EvolucaoProcessual = {
    disciplina: string;
    periodos: { bimestre: number; media_nivel: number | null }[];
    tendencia: string;
    media_mais_recente: number | null;
};

export type DiagOutputsSectionProps = {
    selectedAluno: Aluno;
    nivelIdentificado: number | null;

    // Camada B
    dimensoesNEE: DimensaoNEE[];
    showCamadaB: boolean;
    setShowCamadaB: (v: boolean) => void;
    dimensoesAvaliadas: Record<string, { nivel: number; observacao: string }>;
    setDimensoesAvaliadas: React.Dispatch<React.SetStateAction<Record<string, { nivel: number; observacao: string }>>>;

    // V3 Outputs
    gerarPerfil: () => void;
    gerandoPerfil: boolean;
    perfilGerado: Record<string, unknown> | null;
    perfilError: string | null;
    gerarEstrategias: () => void;
    gerandoEstrategias: boolean;
    estrategiasGeradas: Record<string, unknown> | null;

    // Processual
    evolucaoProcessual: EvolucaoProcessual[];
    showProcessual: boolean;
    setShowProcessual: (v: boolean) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DiagOutputsSection({
    selectedAluno, nivelIdentificado,
    dimensoesNEE, showCamadaB, setShowCamadaB, dimensoesAvaliadas, setDimensoesAvaliadas,
    gerarPerfil, gerandoPerfil, perfilGerado, perfilError,
    gerarEstrategias, gerandoEstrategias, estrategiasGeradas,
    evolucaoProcessual, showProcessual, setShowProcessual,
}: DiagOutputsSectionProps) {
    return (
        <>
            {/* ─── CAMADA B: Cognitivo-Funcional ──────────────────── */}
            {nivelIdentificado !== null && dimensoesNEE.length > 0 && (
                <Card variant="default" className="mb-5">
                    <button
                        onClick={() => setShowCamadaB(!showCamadaB)}
                        className="flex items-center gap-2 px-4 py-3 w-full cursor-pointer justify-between border-none"
                        style={{ background: "var(--color-accent-subtle)" }}
                    >
                        <div className="omni-flex-row omni-gap-2">
                            <Layers size={16} style={{ color: "var(--color-accent)" }} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-accent)" }}>
                                Camada B — Avaliação Cognitivo-Funcional
                            </span>
                            <span style={{
                                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                                background: "var(--color-accent-bg)", color: "var(--color-accent)",
                            }}>{dimensoesNEE.length} dimensões</span>
                        </div>
                        {showCamadaB ? <ChevronUp size={14} style={{ color: "var(--color-accent)" }} /> : <ChevronDown size={14} style={{ color: "var(--color-accent)" }} />}
                    </button>
                    {showCamadaB && (
                        <CardContent className="p-4" style={{ borderTop: "1px solid var(--omni-border-default)" }}>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 0, marginBottom: 12 }}>
                                Avalie cada dimensão cognitivo-funcional com base na sua observação.
                                Específicas para o perfil <strong>{selectedAluno.diagnostico}</strong>.
                            </p>
                            {dimensoesNEE.map((dim) => {
                                const val = dimensoesAvaliadas[dim.id] || { nivel: -1, observacao: "" };
                                const nivelColors: Record<number, string> = { 0: "#f87171", 1: "#fbbf24", 2: "#60a5fa", 3: "#34d399", 4: "#818cf8" };
                                return (
                                    <div key={dim.id} style={{
                                        padding: "14px 16px", borderRadius: 12, marginBottom: 10,
                                        background: val.nivel >= 0 ? "var(--color-accent-subtle)" : "var(--bg-primary)",
                                        border: val.nivel >= 0 ? "1.5px solid var(--color-accent-border)" : "1px solid var(--border-default)",
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 3 }}>{dim.dimensao}</div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>👁️ {dim.o_que_o_professor_observa}</div>
                                                <div style={{ fontSize: 11, color: "var(--color-accent)", marginTop: 3, fontWeight: 600 }}>💡 {dim.acao_pratica}</div>
                                            </div>
                                            <div style={{ display: "flex", gap: 3 }}>
                                                <AccessibleButtonGroup<number>
                                                    groupLabel={`Nível da dimensão ${dim.dimensao}`}
                                                    options={[0, 1, 2, 3, 4].map(n => ({
                                                        value: n,
                                                        label: String(n),
                                                        disabled: false,
                                                    }))}
                                                    selected={val.nivel >= 0 ? val.nivel : null}
                                                    onChange={(n) => setDimensoesAvaliadas(prev => ({
                                                        ...prev, [dim.id]: { ...prev[dim.id], nivel: n, observacao: prev[dim.id]?.observacao || "" }
                                                    }))}
                                                    containerStyle={{ display: "flex", gap: 3 }}
                                                    buttonStyle={(opt, isSelected) => ({
                                                        width: 30, height: 30, borderRadius: 8,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        cursor: "pointer", fontSize: 12, fontWeight: 800,
                                                        border: isSelected ? `2px solid ${nivelColors[opt.value]}` : "1px solid var(--border-default)",
                                                        background: isSelected ? `${nivelColors[opt.value]}15` : "transparent",
                                                        color: isSelected ? nivelColors[opt.value] : "var(--text-muted)",
                                                        transition: "all .15s",
                                                    })}
                                                />
                                            </div>
                                        </div>
                                        {val.nivel >= 0 && (
                                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontStyle: "italic" }}>
                                                Nível {val.nivel}: {dim.niveis_omnisfera?.[String(val.nivel)] || ""}
                                            </div>
                                        )}
                                        <textarea
                                            placeholder={dim.perguntas_professor?.[0] || "Observação..."}
                                            value={val.observacao}
                                            onChange={(e) => setDimensoesAvaliadas(prev => ({
                                                ...prev, [dim.id]: { ...prev[dim.id], nivel: prev[dim.id]?.nivel ?? -1, observacao: e.target.value }
                                            }))}
                                            rows={1}
                                            style={{
                                                width: "100%", padding: "6px 10px", borderRadius: 8, fontSize: 11,
                                                border: "1px solid var(--border-default)",
                                                background: "var(--bg-primary)",
                                                color: "var(--text-primary)", resize: "vertical", fontFamily: "inherit",
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* ─── Generate V3 Outputs ─────────────────────────────── */}
            {nivelIdentificado !== null && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        marginBottom: 12, paddingBottom: 8,
                        borderBottom: "1px solid var(--border-default)",
                    }}>
                        <Target size={18} style={{ color: "var(--color-accent)" }} />
                        <div>
                            <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary, #e2e8f0)" }}>
                                Relatórios IA (Opcionais)
                            </span>
                            <p style={{ fontSize: 11, color: "var(--text-muted, #64748b)", margin: "2px 0 0" }}>
                                Com o nível Omnisfera identificado, você pode gerar dois relatórios complementares para enriquecer o PEI.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                            <button onClick={gerarPerfil} disabled={gerandoPerfil} style={{
                                flex: 1, padding: "14px 16px", borderRadius: 12,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                cursor: gerandoPerfil ? "not-allowed" : "pointer",
                                fontSize: 13, fontWeight: 700, border: "none",
                                background: perfilGerado ? "var(--color-accent-bg)" : gerandoPerfil ? "var(--bg-tertiary)" : "linear-gradient(135deg, #7c3aed, #a855f7)",
                                color: perfilGerado ? "#a855f7" : "#fff",
                                boxShadow: perfilGerado ? "none" : "0 4px 16px var(--color-accent-strong)",
                            }}>
                                {gerandoPerfil ? <OmniLoader engine="red" size={16} /> : perfilGerado ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
                                {gerandoPerfil ? "Gerando..." : perfilGerado ? "✅ Perfil gerado — Regenerar" : "Gerar Perfil de Funcionamento"}
                            </button>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
                                Analisa dimensões cognitivo-funcionais do estudante
                            </span>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                            <button onClick={gerarEstrategias} disabled={gerandoEstrategias} style={{
                                flex: 1, padding: "14px 16px", borderRadius: 12,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                cursor: gerandoEstrategias ? "not-allowed" : "pointer",
                                fontSize: 13, fontWeight: 700, border: "none",
                                background: estrategiasGeradas ? "var(--color-success-bg)" : gerandoEstrategias ? "var(--bg-tertiary)" : "linear-gradient(135deg, #059669, #10b981)",
                                color: estrategiasGeradas ? "#10b981" : "#fff",
                                boxShadow: estrategiasGeradas ? "none" : "0 4px 16px var(--color-success-strong)",
                            }}>
                                {gerandoEstrategias ? <OmniLoader engine="red" size={16} /> : estrategiasGeradas ? <CheckCircle2 size={16} /> : <Target size={16} />}
                                {gerandoEstrategias ? "Gerando..." : estrategiasGeradas ? "✅ Estratégias geradas — Regenerar" : "Gerar Estratégias Práticas"}
                            </button>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
                                Sugere intervenções para dimensões com dificuldade
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Erro ao gerar perfil ─────────────────────────────── */}
            {perfilError && (
                <div style={{ padding: 12, marginBottom: 16, borderRadius: 10, background: "var(--color-error-bg)", border: "1px solid var(--color-error-subtle)", color: "var(--color-error)", fontSize: 13 }}>
                    <strong>Erro:</strong> {perfilError}
                </div>
            )}

            {/* ─── Perfil de Funcionamento Output ─────────────────── */}
            {perfilGerado && (
                <Card variant="default" className="mb-5" style={{ border: "1.5px solid var(--color-accent-strong)" }}>
                    <CardHeader className="pb-3" style={{ background: "var(--color-accent-subtle)" }}>
                        <CardTitle className="text-sm flex items-center gap-2 m-0 text-fuchsia-500">
                            <Sparkles size={16} />
                            Perfil de Funcionamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        {Boolean(perfilGerado.resumo_geral) && (
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 0, marginBottom: 12 }}>
                                {String(perfilGerado.resumo_geral)}
                            </p>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                            {Array.isArray(perfilGerado.pontos_fortes) && (
                                <div style={{ padding: 12, borderRadius: 10, background: "var(--color-success-subtle)", border: "1px solid var(--color-success-border)" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-success)", marginBottom: 6 }}>✅ Pontos Fortes</div>
                                    {(perfilGerado.pontos_fortes as string[]).map((p, i) => (
                                        <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>• {p}</div>
                                    ))}
                                </div>
                            )}
                            {Array.isArray(perfilGerado.areas_atencao) && (
                                <div style={{ padding: 12, borderRadius: 10, background: "var(--color-warning-subtle)", border: "1px solid var(--color-warning-border)" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-warning)", marginBottom: 6 }}>⚠️ Áreas de Atenção</div>
                                    {(perfilGerado.areas_atencao as string[]).map((a, i) => (
                                        <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>• {a}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {Array.isArray(perfilGerado.recomendacao_prioridade) && (
                            <div style={{ padding: 12, borderRadius: 10, background: "var(--color-info-subtle)", border: "1px solid var(--color-info-border)" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-info)", marginBottom: 6 }}>🎯 Prioridades</div>
                                {(perfilGerado.recomendacao_prioridade as string[]).map((r, i) => (
                                    <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>{i + 1}. {r}</div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ─── Estratégias Práticas Output ────────────────────── */}
            {estrategiasGeradas && (
                <Card variant="default" className="mb-5" style={{ border: "1.5px solid var(--color-success-strong)" }}>
                    <CardHeader className="pb-3" style={{ background: "var(--color-success-subtle)" }}>
                        <CardTitle className="text-sm flex items-center gap-2 m-0 text-emerald-500">
                            <Target size={16} />
                            Estratégias Práticas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        {Array.isArray(estrategiasGeradas.estrategias) && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                                {(estrategiasGeradas.estrategias as Array<Record<string, string>>).map((est, i) => (
                                    <div key={i} style={{
                                        padding: "12px 14px", borderRadius: 10,
                                        background: est.prioridade === "essencial" ? "var(--color-error-subtle)" : "var(--bg-primary)",
                                        border: est.prioridade === "essencial" ? "1px solid var(--color-error-border)" : "1px solid var(--border-default)",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase",
                                                background: est.prioridade === "essencial" ? "var(--color-error-bg)" : est.prioridade === "recomendada" ? "var(--color-warning-bg)" : "var(--color-muted-bg)",
                                                color: est.prioridade === "essencial" ? "#f87171" : est.prioridade === "recomendada" ? "#fbbf24" : "#94a3b8",
                                            }}>
                                                {est.prioridade || "sugerida"}</span>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
                                            👁️ {est.comportamento_observado}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--color-success)", fontWeight: 600, marginBottom: 3 }}>
                                            ✋ {est.acao_concreta}
                                        </div>
                                        {est.quando_usar && (
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>📍 {est.quando_usar}</div>
                                        )}
                                        {est.exemplo_pratico && (
                                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>
                                                💬 Exemplo: {est.exemplo_pratico}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {Array.isArray(estrategiasGeradas.o_que_evitar) && (
                            <div style={{ padding: 12, borderRadius: 10, background: "var(--color-error-subtle)", border: "1px solid var(--color-error-border)" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-error)", marginBottom: 6 }}>🚫 O que evitar</div>
                                {(estrategiasGeradas.o_que_evitar as string[]).map((e, i) => (
                                    <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>• {e}</div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ─── Processual Data Feed ──────────────────────────── */}
            {evolucaoProcessual.length > 0 && evolucaoProcessual[0]?.periodos?.length > 0 && (
                <Card variant="default" className="mb-5">
                    <button
                        onClick={() => setShowProcessual(!showProcessual)}
                        className="flex items-center gap-2 px-4 py-3 w-full cursor-pointer justify-between border-none"
                        style={{ background: "var(--color-success-subtle)" }}
                    >
                        <div className="omni-flex-row omni-gap-2">
                            <Activity size={16} style={{ color: "var(--color-success)" }} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-success)" }}>
                                Dados da Avaliação Processual
                            </span>
                            {evolucaoProcessual[0].tendencia && (
                                <span style={{
                                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                                    background: evolucaoProcessual[0].tendencia === "melhora" ? "var(--color-success-bg)" : evolucaoProcessual[0].tendencia === "regressao" ? "var(--color-error-bg)" : "var(--color-muted-bg)",
                                    color: evolucaoProcessual[0].tendencia === "melhora" ? "#10b981" : evolucaoProcessual[0].tendencia === "regressao" ? "#f87171" : "#94a3b8",
                                }}>
                                    {evolucaoProcessual[0].tendencia === "melhora" ? "↗ Progresso" : evolucaoProcessual[0].tendencia === "regressao" ? "↘ Atenção" : "→ Estável"}
                                </span>
                            )}
                            {evolucaoProcessual[0].media_mais_recente !== null && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                                    background: "var(--color-success-bg)", color: "var(--color-success)",
                                }}>Média: {evolucaoProcessual[0].media_mais_recente}</span>
                            )}
                        </div>
                        {showProcessual ? <ChevronUp size={14} style={{ color: "var(--color-success)" }} /> : <ChevronDown size={14} style={{ color: "var(--color-success)" }} />}
                    </button>
                    {showProcessual && (
                        <CardContent className="p-4" style={{ borderTop: "1px solid var(--omni-border-default)" }}>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 0, marginBottom: 12 }}>
                                Evolução registrada na Avaliação Processual — dados integrados automaticamente.
                            </p>
                            {evolucaoProcessual.map(evo => (
                                <div key={evo.disciplina} style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
                                        {evo.disciplina}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90, padding: "0 4px" }}>
                                        {evo.periodos.map((p, i) => {
                                            const val = p.media_nivel ?? 0;
                                            const height = Math.max((val / 4) * 70, 4);
                                            const nc = val >= 3 ? "#10b981" : val >= 2 ? "#3b82f6" : val >= 1 ? "#fbbf24" : "#f87171";
                                            return (
                                                <div key={p.bimestre} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: nc }}>{val}</span>
                                                    <div style={{
                                                        width: "100%", maxWidth: 36, height, borderRadius: 6,
                                                        background: `linear-gradient(180deg, ${nc}, ${nc}88)`,
                                                        transition: "height .3s ease",
                                                    }} />
                                                    <span style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center" }}>
                                                        {p.bimestre}º
                                                    </span>
                                                    {i > 0 && evo.periodos[i - 1].media_nivel !== null && p.media_nivel !== null && (
                                                        <span style={{
                                                            fontSize: 8, fontWeight: 700,
                                                            color: (p.media_nivel ?? 0) > (evo.periodos[i - 1].media_nivel ?? 0) ? "#10b981" : (p.media_nivel ?? 0) < (evo.periodos[i - 1].media_nivel ?? 0) ? "#f87171" : "#94a3b8",
                                                        }}>
                                                            {(p.media_nivel ?? 0) > (evo.periodos[i - 1].media_nivel ?? 0) ? "▲" : (p.media_nivel ?? 0) < (evo.periodos[i - 1].media_nivel ?? 0) ? "▼" : "="}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 4px" }}>
                                        {[0, 1, 2, 3, 4].map(n => (
                                            <span key={n} style={{ fontSize: 8, color: "var(--text-muted)", opacity: 0.5 }}>N{n}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <a href={`/avaliacao-processual${selectedAluno ? `?student=${selectedAluno.id}` : ""}`} style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                fontSize: 12, fontWeight: 700, color: "var(--color-success)", textDecoration: "none",
                                padding: "8px 14px", borderRadius: 8, background: "var(--color-success-subtle)",
                                border: "1px solid var(--color-success-border)",
                            }}>
                                <Activity size={12} /> Ver Avaliação Processual completa →
                            </a>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* ─── Diagnóstica vs Processual Comparison ─────────── */}
            {nivelIdentificado !== null && evolucaoProcessual.length > 0 && evolucaoProcessual[0]?.media_mais_recente !== null && (() => {
                const diagLevel = nivelIdentificado;
                const procLevel = evolucaoProcessual[0].media_mais_recente ?? 0;
                const delta = procLevel - diagLevel;
                const diagPct = Math.max((diagLevel / 4) * 100, 5);
                const procPct = Math.max((procLevel / 4) * 100, 5);
                const diagColor = diagLevel >= 3 ? "#10b981" : diagLevel >= 2 ? "#3b82f6" : diagLevel >= 1 ? "#fbbf24" : "#f87171";
                const procColor = procLevel >= 3 ? "#10b981" : procLevel >= 2 ? "#3b82f6" : procLevel >= 1 ? "#fbbf24" : "#f87171";
                return (
                    <Card variant="default" className="mb-5" style={{
                        border: `1.5px solid ${delta > 0 ? "var(--color-success-strong)" : delta < 0 ? "var(--color-error-border)" : "var(--color-muted-border)"}`,
                    }}>
                        <CardHeader className="pb-3" style={{
                            background: delta > 0 ? "var(--color-success-subtle)" : delta < 0 ? "var(--color-error-subtle)" : "var(--color-muted-subtle)",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <CardTitle className="text-sm flex items-center gap-2 m-0 text-(--text-primary)">
                                    <TrendingUp size={16} style={{ color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8" }} />
                                    Diagnóstica vs Processual
                                </CardTitle>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 6,
                                    background: delta > 0 ? "var(--color-success-bg)" : delta < 0 ? "var(--color-error-bg)" : "var(--color-muted-bg)",
                                    color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8",
                                }}>
                                    {delta > 0 ? `↗ +${delta.toFixed(1)}` : delta < 0 ? `↘ ${delta.toFixed(1)}` : "→ 0"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-4">
                            <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Diagnóstica Inicial</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: diagColor, lineHeight: 1 }}>{diagLevel}</div>
                                    <div style={{ height: 8, borderRadius: 4, marginTop: 8, background: "var(--bg-primary, var(--color-muted-subtle))", overflow: "hidden" }}>
                                        <div style={{ width: `${diagPct}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${diagColor}88, ${diagColor})`, transition: "width .5s ease" }} />
                                    </div>
                                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
                                        {ESCALA_OMNISFERA[diagLevel as 0 | 1 | 2 | 3 | 4]?.label || ""}
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 8px" }}>
                                    <div style={{ fontSize: 20, color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8" }}>
                                        {delta > 0 ? "▶" : delta < 0 ? "◀" : "▬"}
                                    </div>
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Processual Atual</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: procColor, lineHeight: 1 }}>{procLevel}</div>
                                    <div style={{ height: 8, borderRadius: 4, marginTop: 8, background: "var(--bg-primary, var(--color-muted-subtle))", overflow: "hidden" }}>
                                        <div style={{ width: `${procPct}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${procColor}88, ${procColor})`, transition: "width .5s ease" }} />
                                    </div>
                                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>Média mais recente</div>
                                </div>
                            </div>
                            <div style={{
                                marginTop: 12, padding: "8px 12px", borderRadius: 8, fontSize: 12,
                                background: delta > 0 ? "var(--color-success-subtle)" : delta < 0 ? "var(--color-error-subtle)" : "var(--color-muted-subtle)",
                                color: "var(--text-secondary)",
                            }}>
                                {delta > 0 ?
                                    `O estudante evoluiu ${delta.toFixed(1)} pontos desde a avaliação diagnóstica inicial. Continue com as estratégias atuais.` :
                                    delta < 0 ?
                                        `O estudante apresentou queda de ${Math.abs(delta).toFixed(1)} pontos. Considere revisar o PEI e as estratégias de intervenção.` :
                                        "O estudante mantém o mesmo nível da avaliação diagnóstica. Avalie se novas estratégias podem impulsionar a evolução."
                                }
                            </div>
                        </CardContent>
                    </Card>
                );
            })()}

            {/* No processual data - show link */}
            {evolucaoProcessual.length === 0 && nivelIdentificado !== null && (
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", borderRadius: 10, marginBottom: 20,
                    background: "var(--color-success-subtle)", border: "1px solid var(--color-success-border)",
                }}>
                    <span className="omni-text-sm omni-text-muted">
                        📊 Acompanhe a evolução deste estudante ao longo do ano
                    </span>
                    <a href={`/avaliacao-processual${selectedAluno ? `?student=${selectedAluno.id}` : ""}`} style={{
                        fontSize: 12, fontWeight: 700, color: "var(--color-success)", textDecoration: "none",
                    }}>Ir para Processual →</a>
                </div>
            )}
        </>
    );
}
