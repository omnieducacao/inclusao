"use client";

import React, { useState } from "react";
import { Trash2, Search, ShieldCheck, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface CleanupReport {
    orphaned_pei_disciplinas: number;
    orphaned_avaliacoes: number;
    unlinked_planos: number;
    invalid_plano_refs_pei: number;
    invalid_plano_refs_aval: number;
    cleaned: boolean;
    details: string[];
}

export function DataCleanupPanel() {
    const [report, setReport] = useState<CleanupReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runCleanup = async (dryRun: boolean) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/cleanup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dryRun }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao executar limpeza");
            setReport(data.report);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    const totalOrphans = report
        ? report.orphaned_pei_disciplinas + report.orphaned_avaliacoes +
        report.invalid_plano_refs_pei + report.invalid_plano_refs_aval
        : 0;

    return (
        <div className="rounded-2xl overflow-hidden" style={{
            backgroundColor: "var(--bg-secondary, #0f172a)",
            border: "1px solid var(--border-default, rgba(148,163,184,.1))",
        }}>
            {/* Header */}
            <div className="px-6 py-4" style={{
                borderBottom: "1px solid var(--border-default, rgba(148,163,184,.1))",
                background: "var(--bg-tertiary, rgba(15,23,42,.6))",
            }}>
                <div className="flex items-center gap-3">
                    <ShieldCheck size={20} style={{ color: "#10b981" }} />
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary, #e2e8f0)" }}>
                            Limpeza de Dados
                        </h2>
                        <p className="text-xs" style={{ color: "var(--text-muted, #64748b)" }}>
                            Encontrar e remover dados órfãos ou inconsistentes
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Explanation */}
                <div className="p-4 rounded-xl" style={{
                    background: "rgba(59,130,246,.06)",
                    border: "1px solid rgba(59,130,246,.15)",
                }}>
                    <p className="text-sm" style={{ color: "var(--text-secondary, #94a3b8)", lineHeight: 1.7 }}>
                        O <strong>garbage collector</strong> verifica a integridade dos dados no banco:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <li>• <strong>PEI por disciplina</strong> sem estudante associado</li>
                        <li>• <strong>Avaliações diagnósticas</strong> sem estudante associado</li>
                        <li>• <strong>Planos de ensino</strong> sem vínculo com nenhuma disciplina</li>
                        <li>• <strong>Referências inválidas</strong> a planos de ensino removidos</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => runCleanup(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                            color: "#fff",
                            border: "none",
                            cursor: loading ? "wait" : "pointer",
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                        Verificar (sem apagar)
                    </button>
                    {report && totalOrphans > 0 && (
                        <button
                            onClick={() => {
                                if (confirm(`Limpar ${totalOrphans} itens órfãos? Esta ação não pode ser desfeita.`)) {
                                    runCleanup(false);
                                }
                            }}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                            style={{
                                background: "linear-gradient(135deg, #dc2626, #ef4444)",
                                color: "#fff",
                                border: "none",
                                cursor: loading ? "wait" : "pointer",
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            <Trash2 size={15} />
                            Limpar {totalOrphans} itens
                        </button>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 rounded-lg flex items-center gap-2" style={{
                        background: "rgba(239,68,68,.08)",
                        border: "1px solid rgba(239,68,68,.2)",
                    }}>
                        <AlertTriangle size={16} style={{ color: "#ef4444" }} />
                        <span className="text-sm" style={{ color: "#ef4444" }}>{error}</span>
                    </div>
                )}

                {/* Report */}
                {report && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            Relatório {report.cleaned ? "(Limpeza executada)" : "(Simulação)"}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "PEI Disciplinas órfãs", value: report.orphaned_pei_disciplinas },
                                { label: "Avaliações órfãs", value: report.orphaned_avaliacoes },
                                { label: "Planos sem vínculo", value: report.unlinked_planos },
                                { label: "Refs inválidas", value: report.invalid_plano_refs_pei + report.invalid_plano_refs_aval },
                            ].map((item) => (
                                <div key={item.label} className="p-3 rounded-lg text-center" style={{
                                    background: item.value > 0 ? "rgba(245,158,11,.08)" : "rgba(16,185,129,.06)",
                                    border: `1px solid ${item.value > 0 ? "rgba(245,158,11,.2)" : "rgba(16,185,129,.15)"}`,
                                }}>
                                    <div className="text-2xl font-black" style={{
                                        color: item.value > 0 ? "#f59e0b" : "#10b981",
                                    }}>
                                        {item.value}
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                            {report.details.map((detail, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm" style={{
                                    color: "var(--text-secondary)",
                                }}>
                                    {detail.startsWith("✅") ? (
                                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "#10b981" }} />
                                    ) : detail.startsWith("⚠️") ? (
                                        <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
                                    ) : detail.startsWith("🧹") ? (
                                        <Trash2 size={14} className="mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
                                    ) : null}
                                    <span>{detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
