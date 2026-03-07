"use client";

import { useState } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import type { StudentFull } from "../hub-types";

// ─── Estúdio Visual (Container) ──────────────────────────────────

export function EstudioVisual({
    student,
    hiperfoco: hiperfocoProp,
    onClose,
}: {
    student: StudentFull | null;
    hiperfoco?: string;
    onClose: () => void;
}) {
    const peiData = student?.pei_data || {};
    const hiperfoco = hiperfocoProp || (peiData.hiperfoco as string) || "";

    return (
        <div className="p-6 rounded-2xl bg-white space-y-6 shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Estúdio Visual &amp; CAA</h3>
                <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
                    Fechar
                </button>
            </div>
            <p className="text-sm text-slate-600">
                Gere ilustrações educacionais e pictogramas CAA. Usa OmniOrange (OpenAI) para imagens.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IlustracaoSection hiperfoco={hiperfoco} />
                <PictogramaCaaSection />
            </div>
        </div>
    );
}

// ─── Ilustração Section ──────────────────────────────────────────

function IlustracaoSection({ hiperfoco }: { hiperfoco: string }) {
    const [descricao, setDescricao] = useState("");
    const [usarHiperfoco, setUsarHiperfoco] = useState(!!hiperfoco);
    const [tema, setTema] = useState(hiperfoco);
    const [feedback, setFeedback] = useState("");

    const hub = useHubGenerate({
        endpoint: "/api/hub/estudio-imagem",
        engine: "yellow",
        validate: () => (!descricao.trim() && !usarHiperfoco) ? "Descreva a imagem ou use o hiperfoco." : null,
        extractResult: (data) => (data.image as string) || "",
    });
    const { loading, erro, validado, setValidado } = hub;
    const imagem = hub.resultado;

    const gerar = (refazer = false) => {
        const prompt = (usarHiperfoco && tema ? `Tema da ilustração: ${tema}. ` : "") + (descricao || "Ilustração educacional") + ". Context: Education.";
        hub.gerar({ tipo: "ilustracao", prompt, feedback: refazer ? feedback : undefined })
            .then(() => { if (refazer) setFeedback(""); });
    };

    return (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="font-medium text-slate-800">🖼️ Ilustração</h4>
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={usarHiperfoco} onChange={(e) => setUsarHiperfoco(e.target.checked)} />
                <span className="text-sm">Usar hiperfoco do estudante como tema da ilustração</span>
            </label>
            {usarHiperfoco && (
                <input
                    type="text"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Tema da ilustração (edite se quiser)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
            )}
            <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Sistema Solar simplificado com planetas coloridos..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <button
                type="button"
                onClick={() => gerar(false)}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
                {loading ? "Desenhando…" : "🎨 Gerar Imagem"}
            </button>
            {imagem && (
                <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagem} alt="Ilustração" className="max-w-full rounded-lg border" />
                    {validado && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-sm font-medium">
                            ✅ Imagem validada!
                        </div>
                    )}
                    {!validado && (
                        <div className="space-y-2">
                            <details className="border border-slate-200 rounded p-2">
                                <summary className="text-sm cursor-pointer text-slate-600">🔄 Refazer Cena</summary>
                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                    <input
                                        type="text"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Ajuste (ex: mais cores, menos detalhes)"
                                        className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
                                    />
                                    <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
                                        Refazer
                                    </button>
                                </div>
                            </details>
                            <button type="button" onClick={() => setValidado(true)} className="w-full px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                                ✅ Validar
                            </button>
                        </div>
                    )}
                </div>
            )}
            {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
    );
}

// ─── Pictograma CAA Section ──────────────────────────────────────

function PictogramaCaaSection() {
    const [conceito, setConceito] = useState("");
    const [feedback, setFeedback] = useState("");

    const hub = useHubGenerate({
        endpoint: "/api/hub/estudio-imagem",
        engine: "yellow",
        validate: () => !conceito.trim() ? "Informe o conceito." : null,
        extractResult: (data) => (data.image as string) || "",
    });
    const { loading, erro, validado, setValidado } = hub;
    const imagem = hub.resultado;

    const gerar = (refazer = false) => {
        hub.gerar({ tipo: "caa", prompt: conceito, feedback: refazer ? feedback : undefined })
            .then(() => { if (refazer) setFeedback(""); });
    };

    return (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="font-medium text-slate-800">🗣️ Símbolo CAA</h4>
            <input
                type="text"
                value={conceito}
                onChange={(e) => setConceito(e.target.value)}
                placeholder="Ex: Silêncio, Banheiro, Água..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <button
                type="button"
                onClick={() => gerar(false)}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
                {loading ? "Criando símbolo…" : "🧩 Gerar Pictograma"}
            </button>
            {imagem && (
                <div className="space-y-2">
                    <img src={imagem} alt="Pictograma CAA" className="max-w-[300px] rounded-lg border" />
                    {validado && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-sm font-medium">
                            ✅ Pictograma validado!
                        </div>
                    )}
                    {!validado && (
                        <div className="space-y-2">
                            <details className="border border-slate-200 rounded p-2">
                                <summary className="text-sm cursor-pointer text-slate-600">🔄 Refazer Picto</summary>
                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                    <input
                                        type="text"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Ajuste"
                                        className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
                                    />
                                    <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
                                        Refazer
                                    </button>
                                </div>
                            </details>
                            <button type="button" onClick={() => setValidado(true)} className="w-full px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                                ✅ Validar
                            </button>
                        </div>
                    )}
                </div>
            )}
            {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
    );
}
