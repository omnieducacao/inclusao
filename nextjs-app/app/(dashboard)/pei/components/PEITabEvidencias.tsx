"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  LISTA_ALFABETIZACAO,
  EVIDENCIAS_PEDAGOGICO,
  EVIDENCIAS_COGNITIVO,
  EVIDENCIAS_COMPORTAMENTAL,
} from "@/lib/pei";
import { Search, Info } from "lucide-react";

type TabEvidenciasProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  toggleChecklist: (field: keyof PEIData, value: string) => void;
};

export function PEITabEvidencias(props: TabEvidenciasProps) {
  const { peiData, updateField, toggleChecklist } = props;

  return (
          <div className="space-y-6">
            {/* Título da aba com ícone */}
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Coleta de Evidências</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hipótese de Escrita</label>
              <select
                value={peiData.nivel_alfabetizacao || ""}
                onChange={(e) => updateField("nivel_alfabetizacao", e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg"
              >
                {LISTA_ALFABETIZACAO.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Nível de apropriação do sistema de escrita (Emília Ferreiro).</p>
            </div>

            <hr />

            <div>
              <p className="text-sm text-slate-600 mb-4">
                Marque as evidências observadas na rotina do estudante (pedagógicas, cognitivas e comportamentais).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Pedagógico</h4>
                  <div className="space-y-2">
                    {EVIDENCIAS_PEDAGOGICO.map((q) => (
                      <label key={q} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(peiData.checklist_evidencias || {})[q]}
                          onChange={() => toggleChecklist(q, q)}
                          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">{q}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Cognitivo</h4>
                  <div className="space-y-2">
                    {EVIDENCIAS_COGNITIVO.map((q) => (
                      <label key={q} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(peiData.checklist_evidencias || {})[q]}
                          onChange={() => toggleChecklist(q, q)}
                          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">{q}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Comportamental</h4>
                  <div className="space-y-2">
                    {EVIDENCIAS_COMPORTAMENTAL.map((q) => (
                      <label key={q} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(peiData.checklist_evidencias || {})[q]}
                          onChange={() => toggleChecklist(q, q)}
                          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">{q}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-2">Observações rápidas</h4>
              <textarea
                value={peiData.orientacoes_especialistas || ""}
                onChange={(e) => updateField("orientacoes_especialistas", e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                placeholder="Registre observações de professores e especialistas (se houver)"
              />
            </div>
          </div>

  );
}