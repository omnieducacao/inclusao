"use client";

import { useState, useEffect, useCallback } from "react";
import { History, RotateCcw, X, Clock, ChevronRight, Loader2 } from "lucide-react";

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

/**
 * PEIVersionHistory — a button + modal to view, browse, and restore
 * past versions of a student's PEI data.
 */
export function PEIVersionHistory({
    studentId,
    onRestore,
}: {
    studentId: string;
    onRestore?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [versions, setVersions] = useState<VersionSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState<number | null>(null);

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
        if (open) fetchVersions();
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
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in"
                        style={{ border: "1px solid rgba(226, 232, 240, 0.8)" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-slate-800">Histórico de Versões</h3>
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
                        <div className="max-h-[50vh] overflow-y-auto p-4">
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
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRestore(originalIdx)}
                                                        disabled={restoring !== null}
                                                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all disabled:opacity-50"
                                                    >
                                                        {restoring === originalIdx ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <RotateCcw className="w-3 h-3" />
                                                        )}
                                                        Restaurar
                                                    </button>
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
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center">
                            Máximo de 20 versões armazenadas · Restaurar substitui o PEI atual
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
