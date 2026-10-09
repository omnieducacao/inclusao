"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { History, RotateCcw, Clock, Loader2, ArrowLeftRight, ArrowLeft, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import type { PEIData } from "@/lib/pei";
import { useConfirmar } from "@/components/Confirmar";

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
    nasc: "Data de nascimento",
    serie: "Série",
    turma: "Turma",
    diagnostico: "Diagnóstico",
    historico: "Histórico",
    familia: "Família",
    hiperfoco: "Hiperfoco",
    nivel_alfabetizacao: "Nível de alfabetização",
    ia_sugestao: "Texto do PEI",
    consultoria_engine: "Motor de IA",
    ia_mapa_texto: "Mapa mental",
    outros_acesso: "Outros (acesso)",
    outros_ensino: "Outros (ensino)",
    monitoramento_data: "Data do acompanhamento",
    status_meta: "Situação da meta",
    parecer_geral: "Parecer geral",
    status_validacao_pei: "Validação do PEI",
    feedback_ajuste: "Pedido de ajuste",
    matricula: "Matrícula",
    orientacoes_especialistas: "Orientações dos especialistas",
};

const DIFF_ARRAY_LABELS: Record<string, string> = {
    potencias: "Potencialidades",
    rede_apoio: "Rede de apoio",
    estrategias_acesso: "Estratégias de acesso",
    estrategias_ensino: "Estratégias de ensino",
    estrategias_avaliacao: "Estratégias de avaliação",
    composicao_familiar_tags: "Composição familiar",
    proximos_passos_select: "Próximos passos",
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

/** Campos de lista: o diff mostra o que saiu e o que entrou (com "- " e "+ " na frente). */
const ehLista = (field: string) => field in DIFF_ARRAY_LABELS || field.startsWith("barreiras_");
const semSinal = (v: string) => v.replace(/^[-+] /, "");
const encurtar = (v: string) => (v.length > 200 ? v.substring(0, 200) + "…" : v);

const SELO_DIFF: Record<DiffItem["type"], { classe: string; texto: string }> = {
    added: { classe: "omni-estado--sucesso", texto: "Preenchido" },
    removed: { classe: "omni-estado--erro", texto: "Apagado" },
    changed: { classe: "omni-estado--atencao", texto: "Mudou" },
};

/**
 * PEIVersionHistory — lista as versões guardadas do PEI do estudante,
 * compara duas versões e volta o PEI para uma delas.
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
    void currentPeiData;
    const { confirmar, dialogo } = useConfirmar();
    const ids = useId();
    const [open, setOpen] = useState(false);
    const [versions, setVersions] = useState<VersionSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [restoring, setRestoring] = useState<number | null>(null);
    const [diffMode, setDiffMode] = useState<{ left: number; right: number } | null>(null);
    const [diffData, setDiffData] = useState<{ leftSnapshot: Record<string, unknown>; rightSnapshot: Record<string, unknown> } | null>(null);
    const [loadingDiff, setLoadingDiff] = useState(false);
    const [escolhaA, setEscolhaA] = useState<number>(0);
    const [escolhaB, setEscolhaB] = useState<number>(0);

    const fetchVersions = useCallback(async () => {
        setLoading(true);
        setErro(null);
        try {
            const res = await fetch(`/api/pei/versions?studentId=${studentId}`);
            if (res.ok) {
                const data = await res.json();
                const lista: VersionSummary[] = data.versions || [];
                setVersions(lista);
                setEscolhaA(Math.max(0, lista.length - 2));
                setEscolhaB(Math.max(0, lista.length - 1));
            } else {
                setErro("Não conseguimos abrir as versões agora. Tente de novo em instantes.");
            }
        } catch {
            setErro("Não conseguimos abrir as versões agora. Confira a internet e tente de novo.");
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
        const ok = await confirmar({
            titulo: "Voltar o PEI para esta versão?",
            texto: "O PEI atual vira uma versão nova no histórico antes de voltar, então nada se perde.",
            acao: "Voltar para esta versão",
            cancelar: "Manter o PEI atual",
        });
        if (!ok) return;
        setRestoring(index);
        setErro(null);
        try {
            const res = await fetch("/api/pei/versions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, versionIndex: index }),
            });
            if (res.ok) {
                onRestore?.();
                // A tela do PEI salva sozinha com o estado em memória: recarregar evita sobrescrever a versão restaurada.
                window.location.reload();
                return;
            }
            setErro("Não conseguimos voltar para essa versão. O PEI atual continua como estava.");
        } catch {
            setErro("Não conseguimos voltar para essa versão. Confira a internet e tente de novo.");
        }
        setRestoring(null);
    };

    const handleCompare = async (leftIdx: number, rightIdx: number) => {
        setLoadingDiff(true);
        setErro(null);
        setDiffMode({ left: leftIdx, right: rightIdx });
        try {
            const res = await fetch(`/api/pei/versions?studentId=${studentId}&compare=${leftIdx},${rightIdx}`);
            if (res.ok) {
                const data = await res.json();
                setDiffData({
                    leftSnapshot: data.left || {},
                    rightSnapshot: data.right || {},
                });
            } else {
                setErro("Não conseguimos comparar essas versões agora.");
            }
        } catch {
            setErro("Não conseguimos comparar essas versões agora. Confira a internet e tente de novo.");
        } finally {
            setLoadingDiff(false);
        }
    };

    const fmtDate = (iso: string) => {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
        const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        return `${dia} às ${hora}`;
    };

    const nomeVersao = (idx: number) => {
        const v = versions[idx];
        return v ? `Versão ${v.version}` : `Versão ${idx + 1}`;
    };

    const diffs = diffData ? computeDiff(diffData.leftSnapshot, diffData.rightSnapshot) : [];
    const sairDoDiff = () => { setDiffMode(null); setDiffData(null); };
    const idCorpo = `${ids}-corpo`;
    const idTitulo = `${ids}-titulo`;

    return (
        <section className="omni-cartao" aria-labelledby={idTitulo} style={{ marginTop: 24 }}>
            {dialogo}

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
                    <History size={20} aria-hidden style={{ color: "var(--tinta-2)", flex: "none", marginTop: 2 }} />
                    <div style={{ minWidth: 0 }}>
                        <h3 id={idTitulo} className="omni-cartao__titulo" style={{ font: "800 18px/24px var(--font-sans)", margin: 0 }}>
                            Versões anteriores do PEI
                        </h3>
                        <p className="omni-apoio" style={{ margin: "4px 0 0" }}>
                            Cada vez que o PEI é salvo, uma versão fica guardada (até 20). Você pode comparar duas versões ou voltar para uma delas.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="omni-btn omni-btn--secundario omni-btn--pequeno"
                    aria-expanded={open}
                    aria-controls={idCorpo}
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
                    {open ? "Esconder versões" : "Ver versões"}
                </button>
            </div>

            {open && (
                <div id={idCorpo} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {erro && (
                        <div className="omni-aviso omni-aviso--erro" role="alert">
                            <AlertTriangle className="omni-aviso__icone" aria-hidden />
                            <div>
                                <div className="omni-aviso__titulo">Algo não deu certo</div>
                                <div className="omni-aviso__texto">{erro}</div>
                            </div>
                            {!diffMode && (
                                <div className="omni-aviso__acoes">
                                    <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={() => void fetchVersions()}>
                                        Tentar de novo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Comparação */}
                    {diffMode && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={sairDoDiff}>
                                    <ArrowLeft size={16} aria-hidden />
                                    Voltar para a lista
                                </button>
                                <h4 style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)", margin: 0 }}>
                                    {nomeVersao(diffMode.left)} comparada com a {nomeVersao(diffMode.right).toLowerCase()}
                                </h4>
                            </div>

                            {loadingDiff ? (
                                <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                                    <Loader2 size={16} className="animate-spin" aria-hidden />
                                    Comparando as versões…
                                </p>
                            ) : diffs.length === 0 ? (
                                <div className="omni-vazio">
                                    <p className="omni-vazio__titulo">As duas versões são iguais</p>
                                    <p className="omni-vazio__texto">Nenhum campo mudou entre elas.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="omni-apoio" role="status" style={{ margin: 0 }}>
                                        {diffs.length === 1 ? "1 campo mudou" : `${diffs.length} campos mudaram`}
                                    </p>
                                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                                        {diffs.map((d) => {
                                            const lista = ehLista(d.field);
                                            const selo = SELO_DIFF[d.type];
                                            return (
                                                <li key={d.field} className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 8 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                        <span style={{ font: "700 15px/20px var(--font-sans)", color: "var(--tinta)" }}>{d.label}</span>
                                                        <span className={`omni-estado ${selo.classe}`}>{selo.texto}</span>
                                                    </div>
                                                    {d.oldValue && (
                                                        <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: "var(--tinta-2)", overflowWrap: "anywhere" }}>
                                                            <span className="omni-rotulo" style={{ marginRight: 6 }}>{lista ? "Saiu" : "Antes"}</span>
                                                            <del style={{ color: "var(--erro)" }}>{encurtar(semSinal(d.oldValue))}</del>
                                                        </p>
                                                    )}
                                                    {d.newValue && (
                                                        <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: "var(--tinta)", overflowWrap: "anywhere" }}>
                                                            <span className="omni-rotulo" style={{ marginRight: 6 }}>{lista ? "Entrou" : "Depois"}</span>
                                                            <ins style={{ color: "var(--sucesso)", textDecoration: "none" }}>{encurtar(semSinal(d.newValue))}</ins>
                                                        </p>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}

                    {/* Lista de versões */}
                    {!diffMode && (
                        <>
                            {loading && (
                                <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                                    <Loader2 size={16} className="animate-spin" aria-hidden />
                                    Carregando as versões…
                                </p>
                            )}

                            {!loading && !erro && versions.length === 0 && (
                                <div className="omni-vazio">
                                    <p className="omni-vazio__titulo">Ainda não há versões guardadas</p>
                                    <p className="omni-vazio__texto">A primeira versão aparece aqui quando o PEI for salvo.</p>
                                </div>
                            )}

                            {!loading && versions.length >= 2 && (
                                <div className="omni-cartao omni-cartao--plano" style={{ padding: 16 }}>
                                    <p className="omni-rotulo" style={{ margin: 0 }}>Comparar duas versões</p>
                                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                                        <label className="omni-campo" style={{ flex: "1 1 180px" }}>
                                            <span className="omni-campo__rotulo">De</span>
                                            <select className="omni-entrada" value={escolhaA} onChange={(e) => setEscolhaA(Number(e.target.value))}>
                                                {versions.map((v, i) => (
                                                    <option key={`a-${i}`} value={i}>Versão {v.version} · {fmtDate(v.timestamp)}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="omni-campo" style={{ flex: "1 1 180px" }}>
                                            <span className="omni-campo__rotulo">Para</span>
                                            <select className="omni-entrada" value={escolhaB} onChange={(e) => setEscolhaB(Number(e.target.value))}>
                                                {versions.map((v, i) => (
                                                    <option key={`b-${i}`} value={i}>Versão {v.version} · {fmtDate(v.timestamp)}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <button
                                            type="button"
                                            className="omni-btn omni-btn--secundario"
                                            disabled={escolhaA === escolhaB}
                                            onClick={() => handleCompare(Math.min(escolhaA, escolhaB), Math.max(escolhaA, escolhaB))}
                                        >
                                            <ArrowLeftRight size={16} aria-hidden />
                                            Comparar
                                        </button>
                                    </div>
                                    {escolhaA === escolhaB && (
                                        <p className="omni-campo__ajuda" style={{ margin: 0 }}>Escolha duas versões diferentes.</p>
                                    )}
                                </div>
                            )}

                            {!loading && versions.length > 0 && (
                                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                                    {[...versions].reverse().map((v, revIdx) => {
                                        const originalIdx = versions.length - 1 - revIdx;
                                        const canCompare = originalIdx > 0; // Can compare with previous
                                        const idRotulo = `${ids}-v-${originalIdx}`;
                                        return (
                                            <li
                                                key={`${v.version}-${originalIdx}`}
                                                aria-labelledby={idRotulo}
                                                style={{ border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", padding: 16, background: "var(--superficie)", display: "flex", flexDirection: "column", gap: 8 }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                                                    <div style={{ minWidth: 0 }}>
                                                        <p className="omni-rotulo" style={{ margin: 0 }}>
                                                            Versão {v.version}{revIdx === 0 ? " · mais recente" : ""}
                                                        </p>
                                                        <p id={idRotulo} style={{ margin: "2px 0 0", font: "700 15px/20px var(--font-sans)", color: "var(--tinta)" }}>
                                                            {v.label}
                                                        </p>
                                                        <p className="omni-apoio" style={{ margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                                                            <Clock size={14} aria-hidden />
                                                            <time dateTime={v.timestamp}>{fmtDate(v.timestamp)}</time>
                                                        </p>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                        {canCompare && (
                                                            <button
                                                                type="button"
                                                                className="omni-btn omni-btn--discreto omni-btn--pequeno"
                                                                onClick={() => handleCompare(originalIdx - 1, originalIdx)}
                                                                aria-label={`Comparar a versão ${v.version} com a anterior`}
                                                            >
                                                                <ArrowLeftRight size={16} aria-hidden />
                                                                Comparar com a anterior
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="omni-btn omni-btn--secundario omni-btn--pequeno"
                                                            onClick={() => handleRestore(originalIdx)}
                                                            disabled={restoring !== null}
                                                            aria-label={`Voltar o PEI para a versão ${v.version}`}
                                                        >
                                                            {restoring === originalIdx ? (
                                                                <Loader2 size={16} className="animate-spin" aria-hidden />
                                                            ) : (
                                                                <RotateCcw size={16} aria-hidden />
                                                            )}
                                                            {restoring === originalIdx ? "Voltando…" : "Voltar para esta versão"}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Prévia */}
                                                {(v.preview.diagnostico || v.preview.hiperfoco || v.preview.has_ia_sugestao || v.preview.has_mapa_mental) && (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14, lineHeight: "20px", color: "var(--tinta-2)" }}>
                                                        {v.preview.diagnostico && (
                                                            <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                <strong style={{ color: "var(--tinta)" }}>Diagnóstico:</strong> {v.preview.diagnostico}
                                                            </p>
                                                        )}
                                                        {v.preview.hiperfoco && (
                                                            <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                <strong style={{ color: "var(--tinta)" }}>Hiperfoco:</strong> {v.preview.hiperfoco}
                                                            </p>
                                                        )}
                                                        {(v.preview.has_ia_sugestao || v.preview.has_mapa_mental) && (
                                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                                                                {v.preview.has_ia_sugestao && <span className="omni-estado omni-estado--neutro">Com texto do PEI</span>}
                                                                {v.preview.has_mapa_mental && <span className="omni-estado omni-estado--neutro">Com mapa mental</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
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
