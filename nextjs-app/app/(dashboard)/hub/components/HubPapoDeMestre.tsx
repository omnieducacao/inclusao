"use client";

import { useState, useEffect } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
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

        studentId: student?.id,
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
              <ResultadoIA
                titulo="Conexões com o interesse do estudante"
                publico="professor"
                material={resultado}
                onRefazer={() => gerar()}
                refazendo={loading}
                onDescartar={() => { setResultado(null); setValidado(false); }}
                onRevisado={setValidado}
                acoes={(texto) => (
                  <>
                    <DocxDownloadButton texto={texto} titulo="Papo de Mestre" filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.docx`} />
                    <PdfDownloadButton text={texto} filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.pdf`} title="Papo de Mestre" />
                    <SalvarNoPlanoButton conteudo={texto} tipo="Papo de Mestre" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
                  </>
                )}
              />
            )}
        </div>
    );
}
