"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  LISTAS_BARREIRAS,
  LISTA_POTENCIAS,
  LISTA_ALFABETIZACAO,
  NIVEIS_SUPORTE,
  ESTRATEGIAS_ACESSO,
  ESTRATEGIAS_ENSINO,
  ESTRATEGIAS_AVALIACAO,
} from "@/lib/pei";
import { Radar, Info, FileText, Settings } from "lucide-react";
import { BarreirasDominio, NivelSuporteRange } from "./PEIBarreiras";

type TabMapeamentoProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  hiperfoco: string;
};

export function PEITabMapeamento(props: TabMapeamentoProps) {
  const { peiData, updateField, hiperfoco } = props;

  return (
    <div className="space-y-6">
      {/* Título da aba com ícone */}
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-5 h-5 text-sky-600" />
        <h3 className="text-lg font-semibold text-slate-800">Mapeamento</h3>
      </div>

      <p className="text-sm text-slate-600">
        Mapeie forças, hiperfocos e barreiras. Para cada barreira selecionada, indique a intensidade de apoio necessária.
      </p>

      {/* Potencialidades e Hiperfoco */}
      <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50/30">
        <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          Potencialidades e Hiperfoco
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex text-sm font-medium text-slate-700 mb-1 items-center gap-1.5">Hiperfoco (se houver) <HelpTooltip fieldId="pei-hiperfoco" /></label>
            <input
              type="text"
              value={peiData.hiperfoco || ""}
              onChange={(e) => updateField("hiperfoco", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="Ex.: Dinossauros, Minecraft, Mapas, Carros, Desenho..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Potencialidades / Pontos fortes</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const atual = peiData.potencias || [];
                      if (!atual.includes(e.target.value)) {
                        updateField("potencias", [...atual, e.target.value]);
                      }
                      e.target.value = "";
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">Selecione para adicionar...</option>
                  {LISTA_POTENCIAS.filter((p) => !(peiData.potencias || []).includes(p)).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {(Array.isArray(peiData.potencias) ? peiData.potencias : []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Array.isArray(peiData.potencias) ? peiData.potencias : []).map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() => {
                          const atual = peiData.potencias || [];
                          updateField("potencias", atual.filter((item) => item !== p));
                        }}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* Barreiras e nível de apoio */}
      <div>
        <h4 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Settings className="w-4 h-4 text-sky-600" />
          Barreiras e nível de apoio
        </h4>
        <p className="text-sm text-slate-600 mb-4">
          Selecione as barreiras observadas e defina o nível de apoio para a rotina escolar (não é DUA).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <BarreirasDominio
              dominio="Funções Cognitivas"
              opcoes={LISTAS_BARREIRAS["Funções Cognitivas"] || []}
              peiData={peiData}
              updateField={updateField}
            />
            <BarreirasDominio
              dominio="Sensorial e Motor"
              opcoes={LISTAS_BARREIRAS["Sensorial e Motor"] || []}
              peiData={peiData}
              updateField={updateField}
            />
          </div>
          <div className="space-y-4">
            <BarreirasDominio
              dominio="Comunicação e Linguagem"
              opcoes={LISTAS_BARREIRAS["Comunicação e Linguagem"] || []}
              peiData={peiData}
              updateField={updateField}
            />
            <BarreirasDominio
              dominio="Acadêmico"
              opcoes={LISTAS_BARREIRAS["Acadêmico"] || []}
              peiData={peiData}
              updateField={updateField}
            />
          </div>
          <div className="space-y-4">
            <BarreirasDominio
              dominio="Socioemocional"
              opcoes={LISTAS_BARREIRAS["Socioemocional"] || []}
              peiData={peiData}
              updateField={updateField}
            />
          </div>
        </div>
      </div>

      <hr />

      {/* Resumo do Mapeamento */}
      <div>
        <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          Resumo do Mapeamento
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {peiData.hiperfoco ? (
              <div className="p-4 rounded-lg bg-linear-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-300 shadow-sm">
                <p className="text-sm font-semibold text-emerald-900">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  <strong>Hiperfoco:</strong> {peiData.hiperfoco}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-500">
                  <strong>Hiperfoco:</strong> não informado
                </p>
              </div>
            )}
            {(Array.isArray(peiData.potencias) ? peiData.potencias : []).length > 0 ? (
              <div className="p-4 rounded-lg bg-linear-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-300 shadow-sm">
                <p className="text-sm font-semibold text-emerald-900 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  <strong>Potencialidades:</strong>
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(peiData.potencias || []).map((p, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-emerald-200 text-emerald-900 rounded-full font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-500">
                  <strong>Potencialidades:</strong> não selecionadas
                </p>
              </div>
            )}
          </div>
          <div>
            {(() => {
              const barreiras = peiData.barreiras_selecionadas || {};
              const totalBar = Object.values(barreiras).reduce((acc, arr) => acc + (arr?.length || 0), 0);
              if (totalBar === 0) {
                return (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm text-slate-600">
                      <strong>Barreiras:</strong> nenhuma selecionada
                    </p>
                  </div>
                );
              }
              return (
                <div className="p-4 rounded-lg bg-linear-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 shadow-sm">
                  <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                    <strong>Barreiras selecionadas:</strong> {totalBar}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(barreiras).map(([dom, vals]) => {
                      if (!vals || vals.length === 0) return null;
                      return (
                        <div key={dom} className="p-2 rounded bg-white/60 border border-amber-200">
                          <p className="text-xs font-semibold text-amber-900 mb-1">{dom}:</p>
                          <div className="space-y-1">
                            {vals.map((b) => {
                              const chave = `${dom}_${b}`;
                              const nivel = (peiData.niveis_suporte || {})[chave] || "Monitorado";
                              return (
                                <p key={b} className="text-xs text-amber-800 ml-2 flex items-center gap-2">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  {b} → <span className="font-semibold text-amber-900">{nivel}</span>
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>

  );
}