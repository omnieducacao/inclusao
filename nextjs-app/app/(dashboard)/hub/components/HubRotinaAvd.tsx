"use client";

import { useState } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { RefreshCw } from "lucide-react";
import type { HubToolProps } from "../hub-types";

export function RotinaAvdTool({
    student,
    engine,
    onEngineChange,
    onClose,
}: HubToolProps) {
    const [rotinaDetalhada, setRotinaDetalhada] = useState("");
    const [topicoFoco, setTopicoFoco] = useState("");
    const [feedback, setFeedback] = useState("");

    const hub = useHubGenerate({

        studentId: student?.id,
        endpoint: "/api/hub/rotina-avd",
        engine,
        validate: () => !rotinaDetalhada.trim() ? "Descreva a rotina da turma." : null,
    });
    const { loading, resultado, erro, validado, setValidado } = hub;

    const gerar = (refazer = false) => {
        const peiData = student?.pei_data || {};
        hub.gerar({
            rotina_detalhada: rotinaDetalhada,
            topico_foco: topicoFoco || undefined,
            feedback: refazer ? feedback : undefined,
            engine,
            estudante: student ? { nome: student.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 300) } : undefined,
        }).then(() => { if (refazer) setFeedback(""); });
    };

    return (
        <div className="p-6 rounded-2xl bg-linear-to-br from-cyan-50 to-white space-y-4 min-h-[200px] shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Rotina &amp; Previsibilidade
                </h3>
                <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
            </div>
            <p className="text-sm text-slate-600">A rotina organiza o pensamento da criança. Use esta ferramenta para identificar pontos de estresse e criar estratégias de antecipação.</p>
            <EngineSelector value={engine} onChange={onEngineChange} />
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descreva a Rotina da Turma *</label>
                <textarea
                    value={rotinaDetalhada}
                    onChange={(e) => setRotinaDetalhada(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={"Ex:\n8:00 - Chegada e Acolhida\n8:30 - Roda de Conversa\n9:00 - Lanche\n..."}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ponto de Atenção (Opcional)</label>
                <input
                    type="text"
                    value={topicoFoco}
                    onChange={(e) => setTopicoFoco(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Transição para o parque"
                />
            </div>
            <button type="button" onClick={() => gerar(false)} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
                {loading ? "Analisando…" : "📝 ANALISAR E ADAPTAR ROTINA"}
            </button>
            {erro && <p className="text-red-600 text-sm">{erro}</p>}
            {resultado && (
              <ResultadoIA
                titulo="Rotina e AVD"
                publico="professor"
                material={resultado}
                onRefazer={() => gerar(true)}
                refazendo={loading}
                ajuste={{ valor: feedback, onChange: setFeedback }}
                onDescartar={() => { hub.setResultado(null); setValidado(false); }}
                onRevisado={setValidado}
                acoes={(texto) => (
                  <>
                    <DocxDownloadButton texto={texto} titulo="Rotina e AVD" filename={`Rotina_AVD_${new Date().toISOString().slice(0, 10)}.docx`} />
                    <PdfDownloadButton text={texto} filename={`Rotina_AVD_${new Date().toISOString().slice(0, 10)}.pdf`} title="Rotina e AVD" />
                    <SalvarNoPlanoButton conteudo={texto} tipo="Rotina e AVD" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
                  </>
                )}
              />
            )}
        </div>
    );
}
