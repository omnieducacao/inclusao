"use client";

import React from "react";
import {
    CheckCircle2, Users, Sparkles, ClipboardList, BarChart3,
    Target, Zap, Calendar, Grid3X3, BookMarked,
} from "lucide-react";
import dynamic from "next/dynamic";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { PageHero } from "@/components/PageHero";
import { Card, CardHeader, CardTitle, CardContent } from "@omni/ds";
import type { Aluno } from "../types";

const GabaritoRespostasPanel = dynamic(() => import("./GabaritoRespostasPanel").then(mod => mod.GabaritoRespostasPanel));
const MatrizReferenciaPanel = dynamic(() => import("./MatrizReferenciaPanel").then(mod => mod.MatrizReferenciaPanel));
const ManualAplicacaoPanel = dynamic(() => import("./ManualAplicacaoPanel").then(mod => mod.ManualAplicacaoPanel));

type DiagStudentListProps = {
    alunos: Aluno[];
    professorName: string;
    showOnboarding: boolean;
    setShowOnboarding: (v: boolean) => void;
    activeTab: "estudantes" | "matriz" | "manual" | "gabarito";
    setActiveTab: (tab: "estudantes" | "matriz" | "manual" | "gabarito") => void;
    pendingCount: number;
    momentoDiagnostica: "inicio_ano" | "decorrer_ano";
    setMomentoDiagnostica: (v: "inicio_ano" | "decorrer_ano") => void;
    openAvaliacao: (aluno: Aluno, disc: string) => void;
};

export function DiagStudentList({
    alunos, professorName, showOnboarding, setShowOnboarding,
    activeTab, setActiveTab, pendingCount,
    momentoDiagnostica, setMomentoDiagnostica, openAvaliacao,
}: DiagStudentListProps) {
    return (
        <div>
            {/* Onboarding Panel */}
            {showOnboarding && (
                <OnboardingPanel
                    moduleKey="diagnostica"
                    moduleTitle="Bem-vindo à Avaliação Diagnóstica"
                    moduleSubtitle="Identifique o nível de cada estudante com questões adaptadas por IA"
                    accentColor="#2563eb"
                    accentColorLight="#3b82f6"
                    steps={[
                        { icon: <Users size={22} />, title: "Selecionar", description: "Estudante + disciplina + habilidades" },
                        { icon: <Sparkles size={22} />, title: "Gerar", description: "Questões adaptadas via IA" },
                        { icon: <ClipboardList size={22} />, title: "Aplicar", description: "Registrar respostas no gabarito" },
                        { icon: <BarChart3 size={22} />, title: "Relatório", description: "Ver análise e nível Omnisfera" },
                    ]}
                    onStart={() => setShowOnboarding(false)}
                />
            )}

            {/* Page header — unified PageHero */}
            <PageHero
                route="/avaliacao-diagnostica"
                title="Avaliação Diagnóstica"
                desc={`${professorName} · ${alunos.length} estudante${alunos.length !== 1 ? "s" : ""}`}
            />

            {/* Cross-link to Processual */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", borderRadius: 10, marginBottom: 20,
                background: "var(--color-success-subtle)", border: "1px solid var(--color-success-border)",
            }}>
                <span className="omni-text-sm omni-text-muted">
                    📊 Já fez a diagnóstica? Registre a evolução bimestral.
                </span>
                <a href="/avaliacao-processual" style={{
                    fontSize: 12, fontWeight: 700, color: "var(--color-success)", textDecoration: "none",
                }}>Ir para Processual →</a>
            </div>

            {/* ── Stepper: Jornada do Professor ── */}
            <div style={{
                display: "flex", alignItems: "center", gap: 0, marginBottom: 16,
                padding: "14px 20px", borderRadius: 12,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
            }}>
                {[
                    { num: 1, label: "Selecionar", sub: "Estudante + disciplina", color: "var(--color-primary)" },
                    { num: 2, label: "Gerar", sub: "Questões via IA", color: "var(--color-accent)" },
                    { num: 3, label: "Aplicar", sub: "Registrar respostas", color: "var(--color-warning)" },
                    { num: 4, label: "Relatório", sub: "Ver análise completa", color: "var(--color-success)" },
                ].map((step, i) => (
                    <React.Fragment key={step.num}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 800,
                                background: `${step.color}18`, color: step.color,
                                border: `1.5px solid ${step.color}40`,
                            }}>{step.num}</div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: step.color }}>{step.label}</div>
                                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{step.sub}</div>
                            </div>
                        </div>
                        {i < 3 && (
                            <div style={{ width: 24, height: 2, background: "var(--border-default)", flexShrink: 0 }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* AEE Alert for low-level students */}
            {alunos.filter(a => {
                const discs = a.disciplinas || [];
                return discs.some((d: { nivel_omnisfera?: number | null }) => d.nivel_omnisfera !== null && d.nivel_omnisfera !== undefined && d.nivel_omnisfera < 2);
            }).length > 0 && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                        borderRadius: 10, marginBottom: 16,
                        background: "var(--color-error-subtle)", border: "1px solid var(--color-error-border)",
                    }}>
                        <span style={{ fontSize: 16 }}>🚨</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-error)" }}>Atenção AEE</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {alunos.filter(a => (a.disciplinas || []).some((d: { nivel_omnisfera?: number | null }) => d.nivel_omnisfera !== null && d.nivel_omnisfera !== undefined && d.nivel_omnisfera < 2)).length} estudante(s)
                                com nível Omnisfera {'<'} 2. Considere revisar o PEI e estratégias de suporte.
                            </div>
                        </div>
                        <a href="/pei" style={{
                            fontSize: 11, fontWeight: 700, color: "var(--color-error)", textDecoration: "none",
                            padding: "4px 10px", borderRadius: 6,
                            background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)",
                        }}>Revisar PEI →</a>
                    </div>
                )}

            {/* ── Tab Bar ── */}
            <div style={{
                display: "flex", gap: 4, padding: 4, borderRadius: 12,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                marginBottom: 20,
            }}>
                {([
                    { key: "estudantes" as const, label: "Estudantes", icon: <Users size={14} /> },
                    { key: "gabarito" as const, label: "Respostas", icon: <ClipboardList size={14} />, badge: pendingCount },
                    { key: "matriz" as const, label: "Matriz de Referência", icon: <Grid3X3 size={14} /> },
                    { key: "manual" as const, label: "Manual de Aplicação", icon: <BookMarked size={14} /> },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: "10px 14px", borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            cursor: "pointer", fontSize: 13, fontWeight: 700,
                            border: "none", position: "relative",
                            background: activeTab === tab.key ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "transparent",
                            color: activeTab === tab.key ? "#fff" : "var(--text-muted, #94a3b8)",
                            transition: "all .2s",
                        }}
                    >
                        {tab.icon} {tab.label}
                        {'badge' in tab && (tab as { badge?: number }).badge != null && (tab as { badge?: number }).badge! > 0 && (
                            <span style={{
                                position: "absolute", top: 4, right: 8,
                                width: 18, height: 18, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 800,
                                background: "#ef4444", color: "var(--text-inverse)",
                            }}>{(tab as { badge?: number }).badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab: Matriz de Referência ── */}
            {activeTab === "matriz" && <MatrizReferenciaPanel />}

            {/* ── Tab: Manual de Aplicação ── */}
            {activeTab === "manual" && <ManualAplicacaoPanel />}

            {/* ── Tab: Gabarito / Respostas ── */}
            {activeTab === "gabarito" && <GabaritoRespostasPanel alunos={alunos} />}

            {/* ── Tab: Estudantes ── */}
            {activeTab === "estudantes" && (
                <>
                    {/* Seletor de momento — início do fluxo */}
                    <Card variant="default" className="mb-4" style={{ border: "1px solid var(--color-info-strong)" }}>
                        <CardHeader className="pb-3" style={{ background: "var(--color-info-subtle)" }}>
                            <CardTitle className="text-sm flex items-center gap-2 m-0 text-indigo-500">
                                <Calendar size={16} /> Momento da avaliação
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2.5 p-4">
                            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                                A avaliação diagnóstica verifica habilidades do <strong>ano anterior</strong>. No início do ano use a matriz de referência; no decorrer do ano você pode usar o plano de ensino que criou.
                            </p>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <label style={{
                                    flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                                    border: momentoDiagnostica === "inicio_ano" ? "2px solid #818cf8" : "1px solid var(--border-default)",
                                    background: momentoDiagnostica === "inicio_ano" ? "var(--color-info-bg)" : "transparent",
                                    display: "flex", alignItems: "flex-start", gap: 8,
                                }}>
                                    <input type="radio" name="momento" checked={momentoDiagnostica === "inicio_ano"} onChange={() => setMomentoDiagnostica("inicio_ano")} style={{ marginTop: 2, accentColor: "#818cf8" }} />
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Início do ano letivo</span>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Matriz de referência Omnisfera (habilidades do ano anterior)</div>
                                    </div>
                                </label>
                                <label style={{
                                    flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                                    border: momentoDiagnostica === "decorrer_ano" ? "2px solid #0ea5e9" : "1px solid var(--border-default)",
                                    background: momentoDiagnostica === "decorrer_ano" ? "var(--color-primary-bg)" : "transparent",
                                    display: "flex", alignItems: "flex-start", gap: 8,
                                }}>
                                    <input type="radio" name="momento" checked={momentoDiagnostica === "decorrer_ano"} onChange={() => setMomentoDiagnostica("decorrer_ano")} style={{ marginTop: 2, accentColor: "#0ea5e9" }} />
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>No decorrer do ano letivo</span>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Usar plano de ensino do professor (se houver)</div>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Empty state */}
                    {alunos.length === 0 && (
                        <Card variant="default" className="text-center px-5 py-10 border-dashed">
                            <Users size={48} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.3 }} />
                            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Nenhum estudante encontrado
                            </h3>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                                Estudantes em Fase 2 do PEI aparecerão aqui.
                            </p>
                        </Card>
                    )}

                    {/* Student cards */}
                    <div className="omni-flex-col omni-gap-3">
                        {alunos.map(aluno => {
                            const totalDisc = aluno.disciplinas.length;
                            const avaliadasCompletas = aluno.disciplinas.filter(d => d.avaliacao_status === "aplicada").length;

                            return (
                                <Card variant="default" key={aluno.id} className="mb-0 overflow-hidden">
                                    <div className="p-4 py-3 flex items-center justify-between border-b border-(--omni-border-default) bg-(--omni-surface-elevated)">
                                        <div className="omni-flex-row omni-gap-10">
                                            <div style={{
                                                width: 36, height: 36, borderRadius: "50%", display: "flex",
                                                alignItems: "center", justifyContent: "center",
                                                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                                                color: "var(--text-inverse)", fontSize: 12, fontWeight: 800,
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
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{
                                                fontSize: 12, fontWeight: 700,
                                                color: avaliadasCompletas === totalDisc && totalDisc > 0 ? "#10b981" : "var(--text-muted)",
                                            }}>
                                                {avaliadasCompletas}/{totalDisc}
                                            </span>
                                            <div className="omni-text-xs omni-text-muted">avaliações</div>
                                        </div>
                                    </div>

                                    {/* Discipline buttons */}
                                    <CardContent className="flex flex-wrap gap-2 p-4">
                                        {aluno.disciplinas.map(disc => {
                                            const applied = disc.avaliacao_status === "aplicada";
                                            const hasAvaliacao = disc.has_avaliacao;

                                            return (
                                                <button
                                                    key={disc.id}
                                                    onClick={() => openAvaliacao(aluno, disc.disciplina)}
                                                    style={{
                                                        padding: "8px 14px", borderRadius: 10,
                                                        display: "flex", alignItems: "center", gap: 6,
                                                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                                                        border: applied
                                                            ? "1.5px solid var(--color-success-strong)"
                                                            : hasAvaliacao
                                                                ? "1.5px solid var(--color-warning-strong)"
                                                                : "1px solid var(--border-default, var(--color-muted-border))",
                                                        background: applied
                                                            ? "var(--color-success-subtle)"
                                                            : hasAvaliacao
                                                                ? "var(--color-warning-subtle)"
                                                                : "var(--bg-primary)",
                                                        color: applied
                                                            ? "#10b981"
                                                            : hasAvaliacao
                                                                ? "#f59e0b"
                                                                : "var(--text-secondary, #cbd5e1)",
                                                        transition: "all .2s",
                                                    }}
                                                >
                                                    {applied ? <CheckCircle2 size={14} /> : hasAvaliacao ? <Target size={14} /> : <Zap size={14} />}
                                                    {disc.disciplina}
                                                    {disc.nivel_omnisfera !== null && (
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 4,
                                                            background: "var(--color-info-border)", color: "var(--color-info)",
                                                        }}>N{disc.nivel_omnisfera}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
