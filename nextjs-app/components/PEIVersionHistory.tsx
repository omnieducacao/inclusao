"use client";

import { useState, useEffect, useCallback } from "react";
import { History, RotateCcw, X, Clock, ChevronRight, Loader2, ArrowLeftRight, ArrowLeft } from "lucide-react";
import type { PEIData } from "@/lib/pei";

type VersionSummary = {
    version: number;
    timestamp: string;
    label: string;
    preview: {
        diagnostico: string;
        hiperfoco: string;
        has_ia_sugestao: boolean;
        has_mapa_mental: boolean;
    };
};

/** Campos legíveis do PEI para comparação */
const DIFF_LABELS: Record<string, string> = {
    nome: "Nome",
    nasc: "Data de Nascimento",
    serie: "Série",
    turma: "Turma",
    diagnostico: "Diagnóstico",
    historico: "Histórico",
    familia: "Família",
    hiperfoco: "Hiperfoco",
    nivel_alfabetizacao: "Nível de Alfabetização",
    ia_sugestao: "Consultoria IA",
    consultoria_engine: "Engine Utilizado",
    ia_mapa_texto: "Mapa Mental IA",
    outros_acesso: "Outros (acesso)",
    outros_ensino: "Outros (ensino)",
    monitoramento_data: "Data Monitoramento",
    status_meta: "Status da Meta",
    parecer_geral: "Parecer Geral",
    status_validacao_pei: "Status Validação PEI",
    feedback_ajuste: "Feedback Ajuste",
    matricula: "Matrícula",
    orientacoes_especialistas: "Orientações Especialistas",
};

const DIFF_ARRAY_LABELS: Record<string, string> = {
    potencias: "Potencialidades",
    rede_apoio: "Rede de Apoio",
    estrategias_acesso: "Estratégias de Acesso",
    estrategias_ensino: "Estratégias de Ensino",
    estrategias_avaliacao: "Estratégias de Avaliação",
    composicao_familiar_tags: "Composição Familiar",
    proximos_passos_select: "Próximos Passos",
};

type DiffItem = {
    field: string;
    label: string;
    type: "changed" | "added" | "removed";
    oldValue?: string;
    newValue?: string;
};

/** Calcula diferenças entre duas versões do PEI. */
function computeDiff(oldData: Record<string, unknown>, newData: Record<string, unknown>): DiffItem[] {
    const diffs: DiffItem[] = [];

    // Campos de texto
    for (const [key, label] of Object.entries(DIFF_LABELS)) {
        const oldVal = String(oldData[key] || "").trim();
        const newVal = String(newData[key] || "").trim();
        if (oldVal !== newVal) {
            if (!oldVal && newVal) {
                diffs.push({ field: key, label, type: "added", newValue: newVal });
            } else if (oldVal && !newVal) {
                diffs.push({ field: key, label, type: "removed", oldValue: oldVal });
            } else {
                diffs.push({ field: key, label, type: "changed", oldValue: oldVal, newValue: newVal });
            }
        }
    }

    // Campos de array
    for (const [key, label] of Object.entries(DIFF_ARRAY_LABELS)) {
        const oldArr = Array.isArray(oldData[key]) ? (oldData[key] as string[]).sort() : [];
        const newArr = Array.isArray(newData[key]) ? (newData[key] as string[]).sort() : [];
        const added = newArr.filter(v => !oldArr.includes(v));
        const removed = oldArr.filter(v => !newArr.includes(v));
        if (added.length > 0 || removed.length > 0) {
            diffs.push({
                field: key,
                label,
                type: "changed",
                oldValue: removed.length > 0 ? `- ${removed.join(", ")}` : undefined,
                newValue: added.length > 0 ? `+ ${added.join(", ")}` : undefined,
            });
        }
    }

    // Barreiras
    const oldBarreiras = (oldData.barreiras_selecionadas || {}) as Record<string, string[]>;
    const newBarreiras = (newData.barreiras_selecionadas || {}) as Record<string, string[]>;
    const allDomains = new Set([...Object.keys(oldBarreiras), ...Object.keys(newBarreiras)]);
    for (const domain of allDomains) {
        const ob = (oldBarreiras[domain] || []).sort();
        const nb = (newBarreiras[domain] || []).sort();
        const a = nb.filter(v => !ob.includes(v));
        const r = ob.filter(v => !nb.includes(v));
        if (a.length > 0 || r.length > 0) {
            diffs.push({
                field: `barreiras_${domain}`,
                label: `Barreiras: ${domain}`,
                type: "changed",
                oldValue: r.length > 0 ? `- ${r.join(", ")}` : undefined,
                newValue: a.length > 0 ? `+ ${a.join(", ")}` : undefined,
            });
        }
    }

    // Medicações
    const oldMeds = Array.isArray(oldData.lista_medicamentos) ? oldData.lista_medicamentos as Array<{ nome: string }> : [];
    const newMeds = Array.isArray(newData.lista_medicamentos) ? newData.lista_medicamentos as Array<{ nome: string }> : [];
    const oldMedNames = oldMeds.map(m => m.nome);
    const newMedNames = newMeds.map(m => m.nome);
    if (JSON.stringify(oldMedNames.sort()) !== JSON.stringify(newMedNames.sort())) {
        diffs.push({
            field: "lista_medicamentos",
            label: "Medicações",
            type: "changed",
            oldValue: oldMedNames.join(", ") || "(nenhuma)",
            newValue: newMedNames.join(", ") || "(nenhuma)",
        });
    }

    return diffs;
}

/**
 * PEIVersionHistory — button + modal to view, browse, compare and restore
 * past versions of a student's PEI data.
 */
export function PEIVersionHistory({
    studentId,
    currentPeiData,
    onRestore,
}: {
    studentId: string;
    currentPeiData?: PEIData;
    onRestore?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [versions, setVersions] = useState<VersionSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState<number | null>(null);
    const [diffMode, setDiffMode] = useState<{ left: number; right: number } | null>(null);
    const [diffData, setDiffData] = useState<{ leftSnapshot: Record<string, unknown>; rightSnapshot: Record<string, unknown> } | null>(null);
    const [loadingDiff, setLoadingDiff] = useState(false);

    const fetchVersions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/pei/versions?studentId=${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data.versions || []);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        if (open) {
            fetchVersions();
            setDiffMode(null);
            setDiffData(null);
        }
    }, [open, fetchVersions]);

    const handleRestore = async (index: number) => {
        if (!confirm("Tem certeza que deseja restaurar esta versão? O PEI atual será substituído.")) return;
        setRestoring(index);
        try {
            const res = await fetch("/api/pei/versions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, versionIndex: index }),
            });
            if (res.ok) {
                setOpen(false);
                onRestore?.();
            }
        } catch {
            // ignore
        } finally {
            setRestoring(null);
        }
    };

    const handleCompare = async (leftIdx: number, rightIdx: number) => {
        setLoadingDiff(true);
        setDiffMode({ left: leftIdx, right: rightIdx });
        try {
            const res = await fetch(`/api/pei/versions?studentId=${studentId}&compare=${leftIdx},${rightIdx}`);
            if (res.ok) {
                const data = await res.json();
                setDiffData({
                    leftSnapshot: data.left || {},
                    rightSnapshot: data.right || {},
                });
            }
        } catch {
            // ignore
        } finally {
            setLoadingDiff(false);
        }
    };

    const fmtDate = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    const diffs = diffData ? computeDiff(diffData.leftSnapshot, diffData.rightSnapshot) : [];

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Histórico de versões do PEI"
            >
                <History className="w-3.5 h-3.5" />
                Histórico
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[9996] flex items-center justify-center"
                    style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setOpen(false);
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-fade-in"
                        style={{ border: "1px solid rgba(226, 232, 240, 0.8)" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                {diffMode ? (
                                    <button type="button" onClick={() => { setDiffMode(null); setDiffData(null); }} className="text-slate-400 hover:text-slate-600">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <History className="w-5 h-5 text-blue-500" />
                                )}
                                <h3 className="font-bold text-slate-800">
                                    {diffMode ? `Comparação: v${diffMode.left + 1} → v${diffMode.right + 1}` : "Histórico de Versões"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[60vh] overflow-y-auto p-4">
                            {/* Diff view */}
                            {diffMode && (
                                <>
                                    {loadingDiff ? (
                                        <div className="py-8 text-center text-sm text-slate-400">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                            Comparando versões...
                                        </div>
                                    ) : diffs.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <div className="text-2xl mb-2">✅</div>
                                            <div className="text-sm text-slate-500">Sem diferenças entre as versões.</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-xs text-slate-500 mb-3">
                                                {diffs.length} campo(s) alterado(s)
                                            </p>
                                            {diffs.map((d) => (
                                                <div key={d.field} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${d.type === "added" ? "bg-emerald-500" :
                                                                d.type === "removed" ? "bg-red-500" : "bg-amber-500"
                                                            }`} />
                                                        <span className="text-xs font-semibold text-slate-700">{d.label}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${d.type === "added" ? "bg-emerald-100 text-emerald-700" :
                                                                d.type === "removed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                                            }`}>
                                                            {d.type === "added" ? "Adicionado" : d.type === "removed" ? "Removido" : "Alterado"}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs space-y-1 pl-4">
                                                        {d.oldValue && (
                                                            <div className="flex gap-1">
                                                                <span className="text-red-500 font-mono flex-shrink-0">−</span>
                                                                <span className="text-red-700 line-through break-all">
                                                                    {d.oldValue.length > 200 ? d.oldValue.substring(0, 200) + "..." : d.oldValue}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {d.newValue && (
                                                            <div className="flex gap-1">
                                                                <span className="text-emerald-500 font-mono flex-shrink-0">+</span>
                                                                <span className="text-emerald-700 break-all">
                                                                    {d.newValue.length > 200 ? d.newValue.substring(0, 200) + "..." : d.newValue}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Version list */}
                            {!diffMode && (
                                <>
                                    {loading && (
                                        <div className="py-8 text-center text-sm text-slate-400">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                            Carregando versões...
                                        </div>
                                    )}

                                    {!loading && versions.length === 0 && (
                                        <div className="py-8 text-center">
                                            <div className="text-2xl mb-2">📝</div>
                                            <div className="text-sm text-slate-500">Nenhuma versão salva ainda.</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                As versões são criadas automaticamente ao salvar o PEI.
                                            </div>
                                        </div>
                                    )}

                                    {!loading && versions.length > 0 && (
                                        <div className="space-y-2">
                                            {[...versions].reverse().map((v, revIdx) => {
                                                const originalIdx = versions.length - 1 - revIdx;
                                                const canCompare = originalIdx > 0; // Can compare with previous
                                                return (
                                                    <div
                                                        key={v.version}
                                                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                                    v{v.version}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-800">{v.label}</div>
                                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {fmtDate(v.timestamp)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {canCompare && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCompare(originalIdx - 1, originalIdx)}
                                                                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-600 bg-amber-100 hover:bg-amber-200 rounded-lg transition-all"
                                                                        title="Comparar com versão anterior"
                                                                    >
                                                                        <ArrowLeftRight className="w-3 h-3" />
                                                                        Diff
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRestore(originalIdx)}
                                                                    disabled={restoring !== null}
                                                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all disabled:opacity-50"
                                                                >
                                                                    {restoring === originalIdx ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <RotateCcw className="w-3 h-3" />
                                                                    )}
                                                                    Restaurar
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Preview */}
                                                        {(v.preview.diagnostico || v.preview.hiperfoco) && (
                                                            <div className="mt-2 pl-9 text-[11px] text-slate-500 space-y-0.5">
                                                                {v.preview.diagnostico && (
                                                                    <div className="truncate">
                                                                        <ChevronRight className="w-3 h-3 inline text-slate-300" />{" "}
                                                                        Diag: {v.preview.diagnostico}
                                                                    </div>
                                                                )}
                                                                {v.preview.hiperfoco && (
                                                                    <div className="truncate">
                                                                        <ChevronRight className="w-3 h-3 inline text-slate-300" />{" "}
                                                                        Hiper: {v.preview.hiperfoco}
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-2 mt-1">
                                                                    {v.preview.has_ia_sugestao && (
                                                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-medium">
                                                                            IA
                                                                        </span>
                                                                    )}
                                                                    {v.preview.has_mapa_mental && (
                                                                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded text-[10px] font-medium">
                                                                            Mapa Mental
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center">
                            {diffMode
                                ? "Use ← para voltar à lista de versões"
                                : "Máximo de 20 versões armazenadas · Passe o mouse para Comparar ou Restaurar"
                            }
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * Utility: call this after saving PEI data to auto-create a version snapshot.
 */
export async function createPEISnapshot(
    studentId: string,
    label?: string
): Promise<boolean> {
    try {
        const res = await fetch("/api/pei/versions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, label }),
        });
        return res.ok;
    } catch {
        return false;
    }
}
