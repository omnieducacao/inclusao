"use client";

/**
 * Onda 22: visual do design system — painel em omni-cartao, botões omni-btn, explicação e erro em omni-aviso,
 * números em cartões planos com omni-estado; cores só por variáveis e textos mais diretos.
 */
import { CarregandoLinha } from "@/components/brand/TelaCarregando";
import React, { useState } from "react";
import { Trash2, Search, ShieldCheck, AlertTriangle, CheckCircle2, Info } from "lucide-react";

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
            if (!res.ok) throw new Error(data.error || "Não deu para fazer a limpeza. Tente de novo.");
            setReport(data.report);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
        } finally {
            setLoading(false);
        }
    };

    const totalOrphans = report
        ? report.orphaned_pei_disciplinas + report.orphaned_avaliacoes +
        report.invalid_plano_refs_pei + report.invalid_plano_refs_aval
        : 0;

    return (
        <section className="omni-cartao" style={{ padding: 0, gap: 0, overflow: "hidden" }} aria-labelledby="limpeza-titulo">
            <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--borda)", background: "var(--superficie-2)" }}>
                <div className="flex items-center gap-3">
                    <ShieldCheck size={20} aria-hidden="true" style={{ color: "var(--sucesso)" }} />
                    <div>
                        <h2 id="limpeza-titulo" className="omni-cartao__titulo" style={{ fontSize: 18 }}>
                            Limpeza de dados
                        </h2>
                        <p className="omni-apoio">
                            Encontra e remove dados soltos ou inconsistentes.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6" style={{ padding: "var(--space-6)" }}>
                <div className="omni-aviso omni-aviso--info" style={{ maxWidth: "none" }}>
                    <Info className="omni-aviso__icone" aria-hidden="true" />
                    <div>
                        <p className="omni-aviso__titulo">O que a verificação procura no banco</p>
                        <ul className="omni-aviso__texto mt-2 space-y-1.5">
                            <li>• <strong>PEI (Plano Educacional Individualizado) por disciplina</strong> sem estudante</li>
                            <li>• <strong>Avaliações diagnósticas</strong> sem estudante</li>
                            <li>• <strong>Planos de ensino</strong> sem nenhuma disciplina</li>
                            <li>• <strong>Referências</strong> a planos de ensino que já foram apagados</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => runCleanup(true)}
                        disabled={loading}
                        aria-busy={loading}
                        className="omni-btn omni-btn--primario"
                    >
                        {loading ? <CarregandoLinha tamanho={16} /> : <Search aria-hidden="true" />}
                        Verificar (sem apagar)
                    </button>
                    {report && totalOrphans > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm(`Apagar ${totalOrphans} itens soltos? Não dá para desfazer.`)) {
                                    runCleanup(false);
                                }
                            }}
                            disabled={loading}
                            className="omni-btn omni-btn--perigo"
                        >
                            <Trash2 aria-hidden="true" />
                            Limpar {totalOrphans} itens
                        </button>
                    )}
                </div>

                {error && (
                    <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                        <AlertTriangle className="omni-aviso__icone" aria-hidden="true" />
                        <p className="omni-aviso__texto" style={{ marginTop: 0, color: "var(--tinta)" }}>{error}</p>
                    </div>
                )}

                {report && (
                    <div className="space-y-3" role="status">
                        <h3 className="omni-cartao__titulo" style={{ fontSize: 15 }}>
                            Relatório {report.cleaned ? "(limpeza feita)" : "(simulação)"}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "PEI por disciplina soltos", value: report.orphaned_pei_disciplinas },
                                { label: "Avaliações soltas", value: report.orphaned_avaliacoes },
                                { label: "Planos sem vínculo", value: report.unlinked_planos },
                                { label: "Referências inválidas", value: report.invalid_plano_refs_pei + report.invalid_plano_refs_aval },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="text-center"
                                    style={{
                                        padding: "var(--space-3)",
                                        borderRadius: "var(--o-radius-md)",
                                        background: item.value > 0 ? "var(--atencao-suave)" : "var(--sucesso-suave)",
                                    }}
                                >
                                    <div style={{ font: "800 24px/30px var(--font-sans)", color: item.value > 0 ? "var(--atencao)" : "var(--sucesso)" }}>
                                        {item.value}
                                    </div>
                                    <div className="omni-apoio mt-1" style={{ fontSize: 12, lineHeight: "16px" }}>
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {report.details.map((detail, i) => (
                                <div key={i} className="flex items-start gap-2 omni-apoio">
                                    {detail.startsWith("✅") ? (
                                        <CheckCircle2 size={14} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: "var(--sucesso)" }} />
                                    ) : detail.startsWith("⚠️") ? (
                                        <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: "var(--atencao)" }} />
                                    ) : detail.startsWith("🧹") ? (
                                        <Trash2 size={14} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: "var(--erro)" }} />
                                    ) : null}
                                    <span>{detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
