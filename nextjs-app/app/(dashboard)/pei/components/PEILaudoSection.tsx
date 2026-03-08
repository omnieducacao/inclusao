"use client";

import { useState } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { OmniLoader } from "@/components/OmniLoader";
import { RotateCw, Sparkles, CheckCircle2, XCircle, Pill } from "lucide-react";
import type { PEIData } from "@/lib/pei";
import type { EngineId } from "@/lib/ai-engines";

// Helper para validar e parsear respostas JSON (duplicated from PEIClient for isolation)
async function parseJsonResponse(res: Response, url?: string) {
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            throw new Error(data.error || `HTTP ${res.status}${url ? ` em ${url}` : ""}`);
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}${url ? ` em ${url}` : ""}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Resposta não é JSON${url ? ` de ${url}` : ""}`);
    }
    return res.json();
}

// ─── TransicaoAnoButton ─────────────────────────────────────────────────────

export function TransicaoAnoButton({ studentId, studentName }: { studentId: string; studentName?: string }) {
    const [loading, setLoading] = useState(false);
    const ano = new Date().getFullYear();
    async function handleClick() {
        setLoading(true);
        try {
            const res = await fetch(`/api/pei/relatorio-transicao?studentId=${encodeURIComponent(studentId)}&ano=${ano}`);
            if (!res.ok) {
                const d = await res.json();
                alert(d.error || "Erro ao gerar relatório.");
                return;
            }
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Transicao_${(studentName || "Estudante").toString().replace(/\s+/g, "_")}_${ano}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { /* expected fallback */
            alert("Erro ao gerar relatório. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 disabled:opacity-60"
        >
            {loading ? <OmniLoader size={16} /> : <RotateCw className="w-4 h-4" />}
            Relatório Transição {ano}
        </button>
    );
}

// ─── LaudoPdfSection ────────────────────────────────────────────────────────

export function LaudoPdfSection({
    peiData,
    onDiagnostico,
    onMedicamentos,
}: {
    peiData: PEIData;
    onDiagnostico: (v: string) => void;
    onMedicamentos: (meds: { nome: string; posologia?: string; escola?: boolean }[]) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [engine, setEngine] = useState<EngineId>("orange");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [extraido, setExtraido] = useState<{ diagnostico: string; medicamentos: { nome: string; posologia?: string }[] } | null>(null);
    const [medsRevisao, setMedsRevisao] = useState<Array<{ nome: string; posologia: string; escola: boolean }>>([]);
    const [modoRevisao, setModoRevisao] = useState(false);

    async function extrair() {
        if (!file) {
            setErro("Selecione um arquivo (PDF ou imagem).");
            return;
        }
        setLoading(true);
        setErro(null);
        setExtraido(null);
        setModoRevisao(false);
        aiLoadingStart(engine || "orange", "pei");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("engine", engine);
            const res = await fetch("/api/pei/extrair-laudo", { method: "POST", body: formData });
            const data = await parseJsonResponse(res, "/api/pei/extrair-laudo");
            const resultado = {
                diagnostico: data.diagnostico || "",
                medicamentos: data.medicamentos || [],
            };
            setExtraido(resultado);
            if (resultado.medicamentos.length > 0) {
                setMedsRevisao(resultado.medicamentos.map((m: { nome: string; posologia?: string }) => ({ nome: m.nome || "", posologia: m.posologia || "", escola: false })));
                setModoRevisao(true);
            }
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao processar laudo.");
        } finally {
            setLoading(false);
            aiLoadingStop();
        }
    }

    function aplicar() {
        if (!extraido) return;
        onDiagnostico(extraido.diagnostico);
        if (modoRevisao && medsRevisao.length > 0) {
            const existentes = peiData.lista_medicamentos || [];
            const novos = medsRevisao.filter((m) => m.nome && !existentes.some((e) => (e.nome || "").toLowerCase() === m.nome.toLowerCase()));
            onMedicamentos([...existentes, ...novos]);
        } else {
            const meds = extraido.medicamentos.map((m) => ({ ...m, escola: false }));
            const existentes = peiData.lista_medicamentos || [];
            const novos = meds.filter((m) => m.nome && !existentes.some((e) => (e.nome || "").toLowerCase() === (m.nome || "").toLowerCase()));
            onMedicamentos([...existentes, ...novos]);
        }
        setExtraido(null);
        setFile(null);
        setModoRevisao(false);
        setMedsRevisao([]);
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                    <input
                        type="file"
                        accept=".pdf,application/pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            setFile(selectedFile || null);
                            setExtraido(null);
                            setErro(null);
                            setModoRevisao(false);
                            setMedsRevisao([]);
                        }}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-100 file:text-sky-800 file:cursor-pointer hover:file:bg-sky-200"
                    />
                    {file && (
                        <p className="text-xs text-emerald-600 mt-1">
                            {file.type.includes("image") || file.name.match(/\.(jpg|jpeg|png|webp)$/i)
                                ? "📷 Imagem selecionada — será feita leitura por IA (OCR)."
                                : "📄 PDF selecionado."}{" "}Clique em &quot;Extrair Dados do Laudo&quot; para processar.
                        </p>
                    )}
                </div>
                <div className="flex items-start">
                    <button
                        type="button"
                        onClick={extrair}
                        disabled={loading || !file}
                        className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Analisando…
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                ✨ Extrair Dados do Laudo
                            </>
                        )}
                    </button>
                </div>
            </div>
            {erro && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{erro}</div>}

            {modoRevisao && medsRevisao.length > 0 && (
                <div className="p-4 rounded-lg bg-white border-2 border-amber-200 space-y-3">
                    <div className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-amber-600" />
                        <h5 className="font-semibold text-slate-800">Medicações encontradas no laudo (confirme antes de adicionar)</h5>
                    </div>
                    <div className="space-y-2">
                        {medsRevisao.map((m, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-50 rounded">
                                <div className="col-span-5">
                                    <input type="text" value={m.nome} onChange={(e) => { const novas = [...medsRevisao]; novas[i].nome = e.target.value; setMedsRevisao(novas); }} className="w-full px-2 py-1 text-sm border border-slate-200 rounded" placeholder="Nome do medicamento" />
                                </div>
                                <div className="col-span-4">
                                    <input type="text" value={m.posologia} onChange={(e) => { const novas = [...medsRevisao]; novas[i].posologia = e.target.value; setMedsRevisao(novas); }} className="w-full px-2 py-1 text-sm border border-slate-200 rounded" placeholder="Posologia" />
                                </div>
                                <div className="col-span-3 flex items-center gap-2">
                                    <label className="flex items-center gap-1 text-sm text-slate-700">
                                        <input type="checkbox" checked={m.escola} onChange={(e) => { const novas = [...medsRevisao]; novas[i].escola = e.target.checked; setMedsRevisao(novas); }} className="rounded" /> Na escola?
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={aplicar} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Adicionar ao PEI
                        </button>
                        <button type="button" onClick={() => { setModoRevisao(false); setMedsRevisao([]); }} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Cancelar
                        </button>
                    </div>
                </div>
            )}

            {extraido && !modoRevisao && (
                <div className="space-y-3 p-4 rounded-lg bg-white border-2 border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-800">Dados extraídos ✅ (revise as medicações abaixo)</p>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Diagnóstico</div>
                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{extraido.diagnostico || "—"}</p>
                    </div>
                    {extraido.medicamentos.length > 0 && (
                        <div>
                            <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Medicamentos</div>
                            <ul className="text-sm text-slate-700 list-disc list-inside bg-slate-50 p-2 rounded">
                                {extraido.medicamentos.map((m, i) => (
                                    <li key={i}>{m.nome}{m.posologia ? ` (${m.posologia})` : ""}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <button type="button" onClick={aplicar} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Aplicar ao PEI
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── MedicamentosForm ───────────────────────────────────────────────────────

export function MedicamentosForm({
    peiData,
    onAdd,
    onRemove,
}: {
    peiData: PEIData;
    onAdd: (nome: string, posologia: string, escola: boolean) => void;
    onRemove: (i: number) => void;
}) {
    const [nome, setNome] = useState("");
    const [posologia, setPosologia] = useState("");
    const [escola, setEscola] = useState(false);
    const lista = peiData.lista_medicamentos || [];

    return (
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={lista.length > 0} readOnly className="rounded" />
                <label className="text-sm font-medium text-slate-700">💊 O estudante faz uso contínuo de medicação?</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3">
                <div className="md:col-span-3">
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="md:col-span-2">
                    <input type="text" value={posologia} onChange={(e) => setPosologia(e.target.value)} placeholder="Posologia" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={escola} onChange={(e) => setEscola(e.target.checked)} className="rounded" /> Na escola?
                    </label>
                </div>
            </div>
            <button type="button" onClick={() => { if (nome.trim()) { onAdd(nome.trim(), posologia.trim(), escola); setNome(""); setPosologia(""); setEscola(false); } }} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700">
                Adicionar
            </button>
            {lista.length > 0 && (
                <>
                    <hr className="my-3 border-slate-200" />
                    <div className="space-y-2">
                        {lista.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-200">
                                <span className="text-sm text-slate-700">💊 <strong>{m.nome || ""}</strong> ({m.posologia || ""}){m.escola ? " [NA ESCOLA]" : ""}</span>
                                <button type="button" onClick={() => onRemove(i)} className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">Excluir</button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
