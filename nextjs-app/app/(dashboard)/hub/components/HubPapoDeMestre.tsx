"use client";

import { useState, useEffect } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { COMPONENTES, type HubToolWithHiperfocoProps } from "../hub-types";

export function PapoDeMestre({
    student,
    hiperfoco,
    engine,
    onEngineChange,
    onClose,
}: HubToolWithHiperfocoProps) {
    const [materia, setMateria] = useState("Língua Portuguesa");
    const [assunto, setAssunto] = useState("");
    const [temaTurma, setTemaTurma] = useState("");
    const [hiperfocoEditavel, setHiperfocoEditavel] = useState(hiperfoco);

    const hub = useHubGenerate({
        endpoint: "/api/hub/papo-mestre",
        engine,
        validate: () => !assunto.trim() ? "Informe o assunto da aula." : null,
    });
    const { loading, resultado, erro, validado, setValidado, setResultado } = hub;

    useEffect(() => {
        setHiperfocoEditavel(hiperfoco);
    }, [hiperfoco]);

    const gerar = () => hub.gerar({
        materia, assunto, engine, hiperfoco: hiperfocoEditavel,
        tema_turma: temaTurma || undefined,
        nome_estudante: student?.name || "o estudante",
    });

    return (
        <div className="p-6 rounded-2xl bg-linear-to-br from-cyan-50 to-white space-y-4 min-h-[200px] shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Papo de Mestre — Conexões para Engajamento</h3>
                <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
                    Fechar
                </button>
            </div>
            <p className="text-sm text-slate-600">
                Use o hiperfoco como ponte (estratégia DUA) para conectar o estudante ao conteúdo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Componente Curricular</label>
                    <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                        {COMPONENTES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assunto da aula *</label>
                    <input
                        type="text"
                        value={assunto}
                        onChange={(e) => setAssunto(e.target.value)}
                        placeholder="Ex: Frações, Sistema Solar..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hiperfoco do estudante</label>
                    <input
                        type="text"
                        value={hiperfocoEditavel}
                        onChange={(e) => setHiperfocoEditavel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                    <p className="text-xs text-slate-500 mt-1">Pré-preenchido com o hiperfoco do estudante. Você pode editar ou apagar se necessário.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Interesse da turma (DUA, opcional)</label>
                    <input
                        type="text"
                        value={temaTurma}
                        onChange={(e) => setTemaTurma(e.target.value)}
                        placeholder="Ex: Minecraft, Copa do Mundo..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={gerar}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
            >
                {loading ? "Gerando…" : "Criar conexões"}
            </button>
            {erro && <div className="text-red-600 text-sm">{erro}</div>}
            {resultado && (
                <div className="space-y-4">
                    {validado && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
                            ✅ CONEXÕES VALIDADAS E PRONTAS PARA USO
                        </div>
                    )}
                    {!validado && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setValidado(true)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                            >
                                ✅ Validar Conexões
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setResultado(null);
                                    setValidado(false);
                                }}
                                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
                            >
                                🗑️ Descartar
                            </button>
                        </div>
                    )}
                    <div className="p-6 rounded-2xl bg-linear-to-br from-slate-50 to-white shadow-sm border border-slate-200/60">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                            <span className="text-base font-semibold text-slate-800">Conexões para Engajamento</span>
                            <span className="flex gap-2">
                                <DocxDownloadButton texto={resultado} titulo="Papo de Mestre" filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.docx`} />
                                <PdfDownloadButton text={resultado} filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.pdf`} title="Papo de Mestre" />
                                <SalvarNoPlanoButton conteudo={resultado} tipo="Papo de Mestre" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs" />
                            </span>
                        </div>
                        <FormattedTextDisplay texto={resultado} />
                    </div>
                </div>
            )}
        </div>
    );
}
