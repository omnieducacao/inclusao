"use client";

import { useState, useEffect } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { BookOpen } from "lucide-react";
import {
    COMPONENTES, METODOLOGIAS, TECNICAS_ATIVAS, RECURSOS_DISPONIVEIS,
    type HubToolProps, type EstruturaBncc,
} from "../hub-types";

export function PlanoAulaDua({
    student,
    engine,
    onEngineChange,
    onClose,
}: HubToolProps) {
    const [materia, setMateria] = useState("Língua Portuguesa");
    const [assunto, setAssunto] = useState("");
    const [serie, setSerie] = useState("");
    const [duracao, setDuracao] = useState(50);
    const [metodologia, setMetodologia] = useState("Aula Expositiva Dialogada");
    const [tecnicaAtiva, setTecnicaAtiva] = useState("");
    const [recursos, setRecursos] = useState<string[]>([]);
    const [qtdAlunos, setQtdAlunos] = useState(30);
    const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
    const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
    const [componenteSel, setComponenteSel] = useState("");
    const [unidadeSel, setUnidadeSel] = useState("");
    const [objetoSel, setObjetoSel] = useState("");
    const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
    const [loadingMapa, setLoadingMapa] = useState<"html" | null>(null);
    const [mapaHtml, setMapaHtml] = useState<string | null>(null);
    const [mapaErro, setMapaErro] = useState<string | null>(null);

    const peiData = student?.pei_data || {};
    const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "";
    const serieAluno = student?.grade || "";

    const temBnccPreenchida = habilidadesSel.length > 0;

    const hub = useHubGenerate({
        endpoint: "/api/hub/plano-aula",
        engine,
        validate: () => (!assunto.trim() && !temBnccPreenchida) ? "Informe o assunto ou selecione habilidades BNCC." : null,
    });
    const { loading, resultado, erro, validado, setValidado, setResultado } = hub;

    useEffect(() => {
        if (serieAluno) setSerie(serieAluno);
    }, [serieAluno]);

    useEffect(() => {
        if (!serie) return;
        Promise.all([
            fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
            fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
        ])
            .then(([d, e]) => {
                setComponentes(d.ano_atual || d || {});
                setEstruturaBncc(e.disciplinas ? e : null);
            })
            .catch(() => { setComponentes({}); setEstruturaBncc(null); });
    }, [serie]);

    const discDataP = estruturaBncc?.porDisciplina?.[componenteSel];
    const unidadeDataPRaw = componenteSel && discDataP?.porUnidade?.[unidadeSel];
    const unidadeDataP = unidadeDataPRaw && typeof unidadeDataPRaw === "object" && "objetos" in unidadeDataPRaw ? unidadeDataPRaw : null;
    const habsDoObjetoP = objetoSel && unidadeDataP && "porObjeto" in unidadeDataP ? unidadeDataP.porObjeto?.[objetoSel] : undefined;
    const todasHabilidadesPlano = habsDoObjetoP
        ? habsDoObjetoP.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
        : unidadeDataP
            ? Object.entries(unidadeDataP.porObjeto || {}).flatMap(([, habs]) => (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`))
            : discDataP
                ? Object.values(discDataP.porUnidade || {}).flatMap((v) => Object.values(v.porObjeto || {}).flatMap((habList) => (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)))
                : Object.entries(componentes).flatMap(([disc, habs]) => (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`));

    const gerar = () => hub.gerar({
        materia,
        assunto: assunto.trim() || undefined,
        duracao_minutos: duracao,
        metodologia,
        tecnica: metodologia === "Metodologia Ativa" && tecnicaAtiva ? tecnicaAtiva : undefined,
        qtd_alunos: qtdAlunos,
        recursos: recursos.length > 0 ? recursos : undefined,
        habilidades_bncc: habilidadesSel.length > 0 ? habilidadesSel : undefined,
        unidade_tematica: unidadeSel || undefined,
        objeto_conhecimento: objetoSel || undefined,
        estudante: student
            ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 500) || undefined }
            : undefined,
    });

    return (
        <div className="p-6 rounded-2xl bg-linear-to-br from-cyan-50 to-white space-y-4 min-h-[200px] shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Plano de Aula DUA</h3>
                <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
                    Fechar
                </button>
            </div>
            <EngineSelector value={engine} onChange={onEngineChange} />

            {/* Módulo BNCC - PRIMEIRO */}
            {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        BNCC: Componente Curricular, Unidade e Objeto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
                            <input type="text" value={serieAluno || ""} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Componente Curricular</label>
                            <select
                                value={componenteSel || materia}
                                onChange={(e) => { const val = e.target.value; setComponenteSel(val); setMateria(val); setUnidadeSel(""); setObjetoSel(""); }}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                                <option value="">Selecione...</option>
                                {estruturaBncc?.disciplinas?.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
                            <select value={unidadeSel} onChange={(e) => { setUnidadeSel(e.target.value); setObjetoSel(""); }} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!componenteSel}>
                                <option value="">Todas</option>
                                {(discDataP?.unidades || []).map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
                            <select value={objetoSel} onChange={(e) => setObjetoSel(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!unidadeSel}>
                                <option value="">Todos</option>
                                {(unidadeDataP && typeof unidadeDataP === "object" && "objetos" in unidadeDataP ? unidadeDataP.objetos : []).map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Habilidades BNCC (opcional)</label>
                        <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]">
                            {todasHabilidadesPlano.slice(0, 60).map((h, i) => <option key={i} value={h}>{h}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {/* Componente Curricular (fallback se BNCC não disponível) */}
            {(!estruturaBncc || estruturaBncc.disciplinas.length === 0) && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Componente Curricular</label>
                    <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                        {COMPONENTES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                </div>
            )}

            {/* Configuração Metodológica */}
            <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Configuração Metodológica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Metodologia</label>
                        <select value={metodologia} onChange={(e) => { setMetodologia(e.target.value); if (e.target.value !== "Metodologia Ativa") setTecnicaAtiva(""); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                            {METODOLOGIAS.map((m) => (<option key={m} value={m}>{m}</option>))}
                        </select>
                    </div>
                    <div>
                        {metodologia === "Metodologia Ativa" ? (
                            <>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Técnica Ativa</label>
                                <select value={tecnicaAtiva} onChange={(e) => setTecnicaAtiva(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                                    <option value="">Selecione uma técnica</option>
                                    {TECNICAS_ATIVAS.map((t) => (<option key={t} value={t}>{t}</option>))}
                                </select>
                            </>
                        ) : (
                            <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-xs text-slate-600"><strong>Metodologia selecionada:</strong> {metodologia}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Qtd Estudantes</label>
                    <input type="number" min={1} value={qtdAlunos} onChange={(e) => setQtdAlunos(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duração da aula</label>
                    <select value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                        <option value={50}>50 minutos (1 aula)</option>
                        <option value={100}>100 minutos (2 aulas)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Recursos Disponíveis</label>
                    <select multiple value={recursos} onChange={(e) => setRecursos(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[100px]">
                        {RECURSOS_DISPONIVEIS.map((r) => (<option key={r} value={r}>{r}</option>))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para múltipla seleção.</p>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Assunto / Tema
                    {temBnccPreenchida ? (
                        <span className="text-xs text-emerald-600 ml-2 font-normal">(opcional - BNCC já preenchida)</span>
                    ) : (
                        <span className="text-xs text-red-600 ml-2 font-normal">*</span>
                    )}
                </label>
                <input type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder={temBnccPreenchida ? "Opcional quando BNCC está preenchida" : "Ex: Frações equivalentes..."} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                {temBnccPreenchida && habilidadesSel.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">✓ {habilidadesSel.length} habilidade(s) BNCC selecionada(s)</p>
                )}
            </div>
            <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
                {loading ? "Gerando…" : "Gerar plano de aula"}
            </button>
            {erro && <div className="text-red-600 text-sm">{erro}</div>}
            {resultado && (
                <div className="space-y-4">
                    {validado && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
                            ✅ PLANO VALIDADO E PRONTO PARA USO
                        </div>
                    )}
                    {!validado && (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setValidado(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
                                ✅ Validar Plano
                            </button>
                            <button type="button" onClick={() => { setResultado(null); setValidado(false); }} className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm">
                                🗑️ Descartar
                            </button>
                        </div>
                    )}
                    <div className="p-6 rounded-2xl bg-linear-to-br from-slate-50 to-white shadow-sm border border-slate-200/60">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                            <span className="text-base font-semibold text-slate-800">Plano de Aula DUA</span>
                            <span className="flex gap-2 flex-wrap">
                                <>
                                    <DocxDownloadButton texto={resultado} titulo="Plano de Aula DUA" filename={`Plano_Aula_${new Date().toISOString().slice(0, 10)}.docx`} />
                                    <PdfDownloadButton text={resultado} filename={`Plano_Aula_${new Date().toISOString().slice(0, 10)}.pdf`} title="Plano de Aula DUA" />
                                    <SalvarNoPlanoButton conteudo={resultado} tipo="Plano de Aula DUA" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs" />
                                </>
                                <button
                                    type="button"
                                    disabled={!!loadingMapa}
                                    onClick={async () => {
                                        setLoadingMapa("html");
                                        setMapaErro(null);
                                        setMapaHtml(null);
                                        aiLoadingStart("blue", "hub");
                                        try {
                                            const res = await fetch("/api/hub/mapa-mental", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    tipo: "html",
                                                    materia: componenteSel || materia,
                                                    assunto: assunto || "Geral",
                                                    plano_texto: resultado,
                                                    estudante: student ? { nome: student.name, hiperfoco } : undefined,
                                                    unidade_tematica: unidadeSel || undefined,
                                                    objeto_conhecimento: objetoSel || undefined,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.error || "Erro");
                                            setMapaHtml(data.html);
                                        } catch (e) {
                                            setMapaErro(e instanceof Error ? e.message : "Erro ao gerar mapa mental.");
                                        } finally {
                                            setLoadingMapa(null);
                                            aiLoadingStop();
                                        }
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loadingMapa === "html" ? "Gerando…" : "🧠 Mapa Mental"}
                                </button>
                            </span>
                        </div>
                        {mapaErro && <div className="text-red-600 text-sm mb-3">{mapaErro}</div>}
                        {mapaHtml && (
                            <div className="mb-4 rounded-xl border border-indigo-200 overflow-hidden">
                                <div className="flex justify-between items-center px-4 py-2 bg-indigo-50 border-b border-indigo-200">
                                    <span className="text-sm font-medium text-indigo-800">🧠 Mapa Mental do Conteúdo</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const blob = new Blob([mapaHtml], { type: "text/html" });
                                                const url = URL.createObjectURL(blob);
                                                window.open(url, "_blank");
                                                setTimeout(() => URL.revokeObjectURL(url), 60000);
                                            }}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs hover:bg-indigo-200"
                                        >
                                            🔗 Abrir em nova aba
                                        </button>
                                        <button type="button" onClick={() => setMapaHtml(null)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200">
                                            ✕ Fechar
                                        </button>
                                    </div>
                                </div>
                                <iframe srcDoc={mapaHtml} title="Mapa Mental" className="w-full border-0 h-[600px]" sandbox="allow-scripts" />
                            </div>
                        )}
                        <FormattedTextDisplay texto={resultado} />
                    </div>
                </div>
            )}
        </div>
    );
}
