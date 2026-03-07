"use client";

import { useState, useEffect } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { BookOpen } from "lucide-react";
import { COMPONENTES, type HubToolProps, type EstruturaBncc } from "../hub-types";


export function RoteiroIndividual({
  student,
  engine,
  onEngineChange,
  onClose,
}: HubToolProps) {
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [assunto, setAssunto] = useState("");
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);

  const temBnccPreenchida = habilidadesSel.length > 0;

  const hub = useHubGenerate({
    endpoint: "/api/hub/roteiro",
    engine,
    validate: () => (!assunto.trim() && !temBnccPreenchida) ? "Informe o assunto ou selecione habilidades BNCC." : null,
  });
  const { loading, resultado, erro, validado, setValidado, setResultado } = hub;

  const serieAluno = student?.grade || "";

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

  const discData = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataRaw = componenteSel && discData?.porUnidade?.[unidadeSel];
  const unidadeData = unidadeDataRaw && typeof unidadeDataRaw === "object" && "objetos" in unidadeDataRaw ? unidadeDataRaw : null;
  const habsDoObjeto = objetoSel && unidadeData && "porObjeto" in unidadeData ? unidadeData.porObjeto?.[objetoSel] : undefined;
  const todasHabilidades = habsDoObjeto
    ? habsDoObjeto.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
    : unidadeData
      ? Object.entries(unidadeData.porObjeto || {}).flatMap(([, habs]) =>
        (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
      )
      : discData
        ? Object.values(discData.porUnidade || {}).flatMap((v) =>
          Object.values(v.porObjeto || {}).flatMap((habList) =>
            (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
          )
        )
        : Object.entries(componentes).flatMap(([disc, habs]) =>
          (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`)
        );

  const gerar = () => {
    const peiData = student?.pei_data || {};
    hub.gerar({
      aluno: { nome: student?.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 500), hiperfoco: (peiData.hiperfoco as string) || "Geral" },
      materia,
      assunto: assunto.trim() || undefined,
      ano: serieAluno || serie || undefined,
      habilidades_bncc: habilidadesSel.length > 0 ? habilidadesSel : undefined,
      unidade_tematica: unidadeSel || undefined,
      objeto_conhecimento: objetoSel || undefined,
      engine,
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-linear-to-br from-cyan-50 to-white space-y-4 min-h-[200px] shadow-sm border border-slate-200/60">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Roteiro de Aula Individualizado</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Passo a passo de aula específico para o estudante, usando o hiperfoco.</p>
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
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente Curricular</label>
              <select
                value={componenteSel || materia}
                onChange={(e) => {
                  const val = e.target.value;
                  setComponenteSel(val);
                  setMateria(val);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
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
                {(discData?.unidades || []).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select value={objetoSel} onChange={(e) => setObjetoSel(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!unidadeSel}>
                <option value="">Todos</option>
                {(unidadeData && typeof unidadeData === "object" && "objetos" in unidadeData ? unidadeData.objetos : []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Habilidades BNCC (opcional)</label>
            <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]">
              {todasHabilidades.slice(0, 60).map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Componente Curricular (fallback se BNCC não disponível) */}
      {(!estruturaBncc || estruturaBncc.disciplinas.length === 0) && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Componente Curricular</label>
          <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
            {Object.keys(componentes).length ? Object.keys(componentes).map((c) => <option key={c} value={c}>{c}</option>) : COMPONENTES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Assunto
          {temBnccPreenchida ? (
            <span className="text-xs text-emerald-600 ml-2 font-normal">(opcional - BNCC já preenchida)</span>
          ) : (
            <span className="text-xs text-red-600 ml-2 font-normal">*</span>
          )}
        </label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder={temBnccPreenchida ? "Opcional quando BNCC está preenchida" : "Ex: Frações equivalentes"}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
        {temBnccPreenchida && habilidadesSel.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ {habilidadesSel.length} habilidade(s) BNCC selecionada(s)
          </p>
        )}
      </div>
      <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Gerando…" : "Gerar Roteiro"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ROTEIRO VALIDADO E PRONTO PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Roteiro
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
              <span className="text-base font-semibold text-slate-800">Roteiro Individual</span>
              <span className="flex gap-2">
                <DocxDownloadButton texto={resultado} titulo="Roteiro de Aula" filename={`Roteiro_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`} />
                <PdfDownloadButton text={resultado} filename={`Roteiro_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`} title="Roteiro de Aula" />
                <SalvarNoPlanoButton conteudo={resultado} tipo="Roteiro" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado} />
          </div>
        </div>
      )}
    </div>
  );
}

