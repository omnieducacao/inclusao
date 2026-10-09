"use client";

/**
 * Estudo de caso guiado (onda 2) — a porta de entrada do PEI, nos quatro passos do
 * Decreto 12.686/2025. Reaproveita os campos que o PEI já tinha (evidências, barreiras,
 * potencialidades, rede de apoio, estratégias) e acrescenta o que faltava: demandas,
 * contexto escolar, participantes, decisão sobre AEE e profissional de apoio, e a conclusão.
 */
import React, { useState } from "react";
import type { PEIData } from "@/lib/pei";
import {
  PASSOS_ESTUDO_CASO,
  PARTICIPANTES,
  passosConcluidos,
  hojeIso,
  type EstudoCaso,
  type SimNaoAvaliar,
} from "@/lib/estudo-caso";
import { PEITabEvidencias } from "./PEITabEvidencias";
import { PEITabMapeamento } from "./PEITabMapeamento";
import { PEITabRede } from "./PEITabRede";
import { PEITabPlano } from "./PEITabPlano";
import { CheckCircle2, ChevronLeft, ChevronRight, Info } from "lucide-react";

type Props = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  toggleChecklist: (field: keyof PEIData, value: string) => void;
  hiperfoco: string;
  onIrParaPei: () => void;
};

const campo = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white";

function Escolha({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string;
  valor: SimNaoAvaliar | undefined;
  onChange: (v: SimNaoAvaliar) => void;
}) {
  const ops: Array<{ id: SimNaoAvaliar; nome: string }> = [
    { id: "sim", nome: "Sim" },
    { id: "nao", nome: "Não" },
    { id: "avaliar", nome: "Ainda avaliando" },
  ];
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700 mb-1">{rotulo}</legend>
      <div className="flex flex-wrap gap-2">
        {ops.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={valor === o.id}
            className={`px-3 py-1.5 rounded-full text-sm border ${valor === o.id ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200"}`}
          >
            {o.nome}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function PEITabEstudoCaso({ peiData, updateField, toggleChecklist, hiperfoco, onIrParaPei }: Props) {
  const [passo, setPasso] = useState<1 | 2 | 3 | 4>(1);
  const ec = (peiData.estudo_caso || {}) as EstudoCaso;
  const feitos = passosConcluidos(peiData as Record<string, unknown>);
  const todos = feitos[1] && feitos[2] && feitos[3] && feitos[4];

  const set = <K extends keyof EstudoCaso>(k: K, v: EstudoCaso[K]) =>
    updateField("estudo_caso", { ...ec, [k]: v } as PEIData["estudo_caso"]);

  const participantes = ec.participantes || [];
  const alternarParticipante = (p: string) =>
    set("participantes", participantes.includes(p) ? participantes.filter((x) => x !== p) : [...participantes, p]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Estudo de caso</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-[65ch]">
          É a etapa que vem antes do PEI: a equipe conversa sobre o estudante e decide os apoios. O PEI sai das conclusões
          daqui. Nenhum laudo é exigido; o diagnóstico, se houver, é só mais uma informação.
        </p>
      </div>

      {/* Quando e quem */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
        <div>
          <label htmlFor="ec-data" className="block text-sm font-medium text-slate-700 mb-1">Data da conversa</label>
          <input id="ec-data" type="date" value={ec.data || ""} onChange={(e) => set("data", e.target.value)} className={campo} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Quem participou</p>
          <div className="flex flex-wrap gap-2">
            {PARTICIPANTES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => alternarParticipante(p)}
                aria-pressed={participantes.includes(p)}
                className={`px-3 py-1 rounded-full text-xs border ${participantes.includes(p) ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Passos */}
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-2" aria-label="Passos do estudo de caso">
        {PASSOS_ESTUDO_CASO.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setPasso(p.id)}
              aria-current={passo === p.id ? "step" : undefined}
              className={`w-full text-left p-3 rounded-xl border transition ${passo === p.id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                Passo {p.id}
                {feitos[p.id] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-label="concluído" />}
              </span>
              <span className="block text-sm font-semibold text-slate-800 mt-0.5">{p.titulo}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className="text-sm text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-sky-600" />
        {PASSOS_ESTUDO_CASO[passo - 1].pergunta}
      </p>

      {passo === 1 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="ec-demandas" className="block text-sm font-medium text-slate-700 mb-1">
              Demandas observadas
            </label>
            <textarea
              id="ec-demandas"
              rows={4}
              value={ec.demandas || ""}
              onChange={(e) => set("demandas", e.target.value)}
              placeholder="Ex.: não consegue concluir atividades escritas sem mediação; evita trabalhos em grupo; perde o foco depois de 10 minutos."
              className={campo}
            />
          </div>
          <PEITabEvidencias peiData={peiData} updateField={updateField} toggleChecklist={toggleChecklist} />
          <PEITabMapeamento peiData={peiData} updateField={updateField} hiperfoco={hiperfoco} secao="barreiras" />
        </div>
      )}

      {passo === 2 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="ec-contexto" className="block text-sm font-medium text-slate-700 mb-1">
              Contexto escolar
            </label>
            <textarea
              id="ec-contexto"
              rows={4}
              value={ec.contexto_escolar || ""}
              onChange={(e) => set("contexto_escolar", e.target.value)}
              placeholder="Turma, rotina, relação com colegas e professores, o que já foi tentado e como funcionou."
              className={campo}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ec-historico" className="block text-sm font-medium text-slate-700 mb-1">Histórico</label>
              <textarea
                id="ec-historico"
                rows={4}
                value={(peiData.historico as string) || ""}
                onChange={(e) => updateField("historico", e.target.value)}
                placeholder="Trajetória escolar, mudanças, acompanhamentos anteriores."
                className={campo}
              />
            </div>
            <div>
              <label htmlFor="ec-familia" className="block text-sm font-medium text-slate-700 mb-1">Contexto familiar</label>
              <textarea
                id="ec-familia"
                rows={4}
                value={(peiData.familia as string) || ""}
                onChange={(e) => updateField("familia", e.target.value)}
                placeholder="Com quem mora, como a família acompanha a vida escolar."
                className={campo}
              />
            </div>
          </div>
          <PEITabRede peiData={peiData} updateField={updateField} />
        </div>
      )}

      {passo === 3 && (
        <div className="space-y-6">
          <PEITabMapeamento peiData={peiData} updateField={updateField} hiperfoco={hiperfoco} secao="potencias" />
          <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/40 space-y-4">
            <h4 className="text-base font-semibold text-slate-800">Apoios definidos no estudo de caso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Escolha
                rotulo="Precisa de Atendimento Educacional Especializado (AEE)?"
                valor={ec.necessita_aee}
                onChange={(v) => set("necessita_aee", v)}
              />
              <Escolha
                rotulo="Precisa de profissional de apoio escolar?"
                valor={ec.necessita_profissional_apoio}
                onChange={(v) => set("necessita_profissional_apoio", v)}
              />
            </div>
            <div>
              <label htmlFor="ec-just" className="block text-sm font-medium text-slate-700 mb-1">Por quê?</label>
              <textarea
                id="ec-just"
                rows={3}
                value={ec.justificativa_apoio || ""}
                onChange={(e) => set("justificativa_apoio", e.target.value)}
                placeholder="O que no estudo de caso mostra a necessidade (ou não) desses apoios. Pelo Decreto 12.773/2025, é aqui que isso se decide, não no laudo."
                className={campo}
              />
            </div>
          </div>
        </div>
      )}

      {passo === 4 && (
        <div className="space-y-6">
          <PEITabPlano peiData={peiData} updateField={updateField} />
          <div>
            <label htmlFor="ec-recursos" className="block text-sm font-medium text-slate-700 mb-1">Recursos</label>
            <textarea
              id="ec-recursos"
              rows={3}
              value={ec.recursos || ""}
              onChange={(e) => set("recursos", e.target.value)}
              placeholder="Materiais, tecnologia assistiva, espaços e pessoas que a escola vai mobilizar."
              className={campo}
            />
          </div>
          <div>
            <label htmlFor="ec-conclusao" className="block text-sm font-medium text-slate-700 mb-1">Conclusão da equipe</label>
            <textarea
              id="ec-conclusao"
              rows={4}
              value={ec.conclusao || ""}
              onChange={(e) => set("conclusao", e.target.value)}
              placeholder="Em poucas linhas: o que a equipe entendeu e o que o PEI precisa garantir."
              className={campo}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            {ec.concluido_em ? (
              <p className="text-sm text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Estudo de caso concluído em{" "}
                {new Date(`${ec.concluido_em}T12:00:00`).toLocaleDateString("pt-BR")}.
              </p>
            ) : (
              <p className="text-sm text-slate-700">
                {todos ? "Os quatro passos têm o mínimo preenchido." : "Complete os quatro passos para concluir."}
              </p>
            )}
            <button
              type="button"
              disabled={!todos}
              onClick={() => set("concluido_em", ec.concluido_em ? null : hojeIso())}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white disabled:opacity-40"
            >
              {ec.concluido_em ? "Reabrir estudo de caso" : "Concluir estudo de caso"}
            </button>
            {ec.concluido_em && (
              <button type="button" onClick={onIrParaPei} className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-600 text-white">
                Gerar o PEI a partir dele
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          disabled={passo === 1}
          onClick={() => setPasso((p) => (p > 1 ? ((p - 1) as 1 | 2 | 3 | 4) : p))}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-slate-200 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Passo anterior
        </button>
        <button
          type="button"
          disabled={passo === 4}
          onClick={() => setPasso((p) => (p < 4 ? ((p + 1) as 1 | 2 | 3 | 4) : p))}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-slate-200 disabled:opacity-40"
        >
          Próximo passo <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-slate-500">O que você preenche aqui é salvo sozinho, junto com o PEI.</p>
    </div>
  );
}
