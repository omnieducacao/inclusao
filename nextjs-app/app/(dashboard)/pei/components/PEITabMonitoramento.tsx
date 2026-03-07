"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import { STATUS_META, PARECER_GERAL, PROXIMOS_PASSOS } from "@/lib/pei";
import { RotateCw, Info } from "lucide-react";

type TabMonitoramentoProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
};

export function PEITabMonitoramento(props: TabMonitoramentoProps) {
  const { peiData, updateField } = props;

  return (
          <div className="space-y-6">
            {/* Título da aba com ícone */}
            <div className="flex items-center gap-2 mb-4">
              <RotateCw className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Monitoramento</h3>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                ⚠️ Preencher esta aba principalmente na REVISÃO do PEI (ciclo de acompanhamento).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da Próxima Revisão</label>
                <input
                  type="date"
                  value={typeof peiData.monitoramento_data === "string" ? peiData.monitoramento_data.split("T")[0] : ""}
                  onChange={(e) => updateField("monitoramento_data", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status da Meta</label>
                <select
                  value={peiData.status_meta || ""}
                  onChange={(e) => updateField("status_meta", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  {STATUS_META.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parecer Geral</label>
                <select
                  value={peiData.parecer_geral || ""}
                  onChange={(e) => updateField("parecer_geral", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  {PARECER_GERAL.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ações Futuras</label>
              <div className="space-y-2">
                {PROXIMOS_PASSOS.map((p) => {
                  const selecionadas = peiData.proximos_passos_select || [];
                  const estaSelecionada = selecionadas.includes(p);
                  return (
                    <label key={p} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={estaSelecionada}
                        onChange={(e) => {
                          const novas = e.target.checked
                            ? [...selecionadas, p]
                            : selecionadas.filter((item) => item !== p);
                          updateField("proximos_passos_select", novas);
                        }}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                      <span className="text-sm text-slate-700">{p}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

  );
}