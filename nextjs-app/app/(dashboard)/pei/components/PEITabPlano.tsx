"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  ESTRATEGIAS_ACESSO,
  ESTRATEGIAS_ENSINO,
  ESTRATEGIAS_AVALIACAO,
  STATUS_META,
  PARECER_GERAL,
  PROXIMOS_PASSOS,
} from "@/lib/pei";
import { Puzzle, Info } from "lucide-react";

type TabPlanoProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
};

export function PEITabPlano(props: TabPlanoProps) {
  const { peiData, updateField } = props;

  return (
          <div className="space-y-6">
            {/* Título da aba com ícone */}
            <div className="flex items-center gap-2 mb-4">
              <Puzzle className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Plano de Ação</h3>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-base font-semibold text-slate-800 mb-2">1) Acesso</h4>
                <label className="block text-xs text-slate-600 mb-2">Recursos de acesso</label>
                <div className="space-y-2 mb-3">
                  {ESTRATEGIAS_ACESSO.map((estr) => {
                    const selecionadas = peiData.estrategias_acesso || [];
                    const estaSelecionada = selecionadas.includes(estr);
                    return (
                      <label key={estr} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={estaSelecionada}
                          onChange={(e) => {
                            const novas = e.target.checked
                              ? [...selecionadas, estr]
                              : selecionadas.filter((item) => item !== estr);
                            updateField("estrategias_acesso", novas);
                          }}
                          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">{estr}</span>
                      </label>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={peiData.outros_acesso || ""}
                  onChange={(e) => updateField("outros_acesso", e.target.value)}
                  placeholder="Ex: Prova em local separado, fonte 18, papel pautado ampliado…"
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Personalizado (Acesso)</p>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-800 mb-2">2) Ensino (Metodologias)</h4>
                <label className="block text-xs text-slate-600 mb-2">Estratégias de ensino</label>
                <div className="space-y-2 mb-3">
                  {ESTRATEGIAS_ENSINO.map((estr) => {
                    const selecionadas = peiData.estrategias_ensino || [];
                    const estaSelecionada = selecionadas.includes(estr);
                    return (
                      <label key={estr} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={estaSelecionada}
                          onChange={(e) => {
                            const novas = e.target.checked
                              ? [...selecionadas, estr]
                              : selecionadas.filter((item) => item !== estr);
                            updateField("estrategias_ensino", novas);
                          }}
                          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">{estr}</span>
                      </label>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={peiData.outros_ensino || ""}
                  onChange={(e) => updateField("outros_ensino", e.target.value)}
                  placeholder="Ex: Sequência didática com apoio de imagens + exemplo resolvido…"
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Personalizado (Ensino)</p>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-800 mb-2">3) Avaliação (Formato)</h4>
                <label className="block text-xs text-slate-600 mb-2">Estratégias de avaliação</label>
                <div className="space-y-2">
                  {ESTRATEGIAS_AVALIACAO.map((estr) => {
                    const selecionadas = peiData.estrategias_avaliacao || [];
                    const estaSelecionada = selecionadas.includes(estr);
                    return (
                      <label key={estr} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={estaSelecionada}
                          onChange={(e) => {
                            const novas = e.target.checked
                              ? [...selecionadas, estr]
                              : selecionadas.filter((item) => item !== estr);
                            updateField("estrategias_avaliacao", novas);
                          }}
                          className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">{estr}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2">Dica: combine formato + acesso (tempo/ambiente) para reduzir barreiras.</p>
              </div>
            </div>

            <hr />

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                ✅ O plano de ação alimenta a Consultoria IA com contexto prático (o que você já pretende fazer).
              </p>
            </div>
          </div>

  );
}