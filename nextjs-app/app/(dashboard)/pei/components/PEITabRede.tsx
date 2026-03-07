"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  LISTA_PROFISSIONAIS,
  LISTA_FAMILIA,
  LISTA_TECNOLOGIAS_ASSISTIVAS,
} from "@/lib/pei";
import { Users, Info, Puzzle, FileText, CheckCircle } from "lucide-react";

type TabRedeProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
};

export function PEITabRede(props: TabRedeProps) {
  const { peiData, updateField } = props;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Título da aba com ícone */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-sky-600" />
        <h3 className="text-lg font-semibold text-slate-800">Rede de Apoio</h3>
      </div>

      <p className="text-sm text-slate-600">
        Selecione os profissionais envolvidos e registre as orientações específicas de cada um.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Profissionais:</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={""}
              onChange={(e) => {
                if (e.target.value) {
                  const atual = peiData.rede_apoio || [];
                  if (!atual.includes(e.target.value)) {
                    updateField("rede_apoio", [...atual, e.target.value]);
                  }
                  e.target.value = "";
                }
              }}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="">Selecione para adicionar...</option>
              {LISTA_PROFISSIONAIS.filter((p) => !(peiData.rede_apoio || []).includes(p)).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {(Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : []).map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => {
                      const atual = peiData.rede_apoio || [];
                      updateField("rede_apoio", atual.filter((item) => item !== p));
                      // Remove orientações desse profissional também
                      const orientacoes = { ...(peiData.orientacoes_por_profissional || {}) };
                      delete orientacoes[p];
                      updateField("orientacoes_por_profissional", orientacoes);
                    }}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">Ao selecionar um profissional, um campo de observação individual aparece abaixo.</p>
      </div>

      <hr />

      {/* Acompanhante/Cuidador */}
      <div className="p-4 rounded-lg border border-slate-200/60 bg-amber-50/30">
        <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-600" />
          Acompanhante de cuidados
        </h4>
        <p className="text-xs text-slate-600 mb-3">Quando houver acompanhante/cuidador em sala (mediador, cuidador, etc.).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
            <input
              type="text"
              value={peiData.acompanhante_nome || ""}
              onChange={(e) => updateField("acompanhante_nome", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Ex.: Maria Silva"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Carga horária</label>
            <input
              type="text"
              value={peiData.acompanhante_carga_horaria || ""}
              onChange={(e) => updateField("acompanhante_carga_horaria", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Ex.: 4h/dia, 2x por semana"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">Orientações específicas</label>
          <textarea
            value={peiData.orientacoes_acompanhante || ""}
            onChange={(e) => updateField("orientacoes_acompanhante", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="Orientações para o acompanhante (ex.: como mediar, sinais de alerta, procedimentos)"
          />
        </div>
      </div>

      <hr />

      {/* Tecnologias assistivas */}
      <div className="p-4 rounded-lg border border-slate-200/60 bg-emerald-50/30">
        <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-emerald-600" />
          Tecnologias assistivas
        </h4>
        <p className="text-xs text-slate-600 mb-3">Recursos utilizados pelo estudante (CAA, leitor de tela, etc.).</p>
        <div className="flex flex-wrap gap-2">
          {LISTA_TECNOLOGIAS_ASSISTIVAS.map((ta) => {
            const lista = peiData.tecnologias_assistivas || [];
            const checked = lista.includes(ta);
            return (
              <label key={ta} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const nova = checked ? lista.filter((x) => x !== ta) : [...lista, ta];
                    updateField("tecnologias_assistivas", nova);
                  }}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span className="text-sm text-slate-700">{ta}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr />

      {/* Anotações gerais (expander) */}
      <details className="p-4 rounded-lg border border-slate-200/60 bg-white">
        <summary className="cursor-pointer font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          Anotações gerais (opcional)
        </summary>
        <div className="mt-3">
          <textarea
            value={peiData.orientacoes_especialistas || ""}
            onChange={(e) => updateField("orientacoes_especialistas", e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            placeholder="Use para observações gerais da equipe (ex.: acordos com a família, encaminhamentos, alinhamentos)."
          />
        </div>
      </details>

      <hr />

      {/* Orientações por profissional */}
      <div>
        <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600" />
          Orientações por profissional
        </h4>
        {(!peiData.rede_apoio || peiData.rede_apoio.length === 0) ? (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-blue-800 text-sm">Selecione ao menos um profissional para habilitar os campos de observação.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(peiData.rede_apoio || []).map((prof) => (
              <div key={prof} className="p-4 rounded-lg border border-slate-200/60 bg-white hover:border-sky-300 hover:shadow-sm transition-all">
                <h5 className="font-semibold text-slate-800 mb-3">{prof}</h5>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações / orientações</label>
                <textarea
                  value={(peiData.orientacoes_por_profissional || {})[prof] || ""}
                  onChange={(e) =>
                    updateField("orientacoes_por_profissional", {
                      ...(peiData.orientacoes_por_profissional || {}),
                      [prof]: e.target.value,
                    })
                  }
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3"
                  placeholder="Ex.: recomendações de intervenção, frequência, sinais de alerta, ajustes para sala de aula..."
                />

                {/* ─── Upload de Laudo / Relatório ─── */}
                <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-200/60 mb-3 space-y-2">
                  <label className="block text-xs font-semibold text-sky-700">
                    📄 Transcrever laudo / relatório (PDF ou imagem)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept=".pdf,application/pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      id={`laudo-upload-${prof}`}
                      className="hidden"
                      onChange={async (e) => {
                        const selectedFile = e.target.files?.[0];
                        if (!selectedFile) return;

                        // Indicar loading
                        const btn = document.getElementById(`laudo-btn-${prof}`) as HTMLButtonElement | null;
                        if (btn) { btn.disabled = true; btn.textContent = "⏳ Transcrevendo..."; }

                        try {
                          const fd = new FormData();
                          fd.append("file", selectedFile);
                          const res = await fetch("/api/pei/transcrever-laudo", { method: "POST", body: fd });
                          const data = await res.json();

                          if (!res.ok) {
                            alert(data.error || "Erro ao transcrever.");
                            return;
                          }

                          // Append transcription to textarea
                          const textoAtual = (peiData.orientacoes_por_profissional || {})[prof] || "";
                          const separador = textoAtual ? "\n\n--- LAUDO / RELATÓRIO TRANSCRITO ---\n\n" : "--- LAUDO / RELATÓRIO TRANSCRITO ---\n\n";
                          updateField("orientacoes_por_profissional", {
                            ...(peiData.orientacoes_por_profissional || {}),
                            [prof]: textoAtual + separador + data.transcricao,
                          });
                        } catch (err) {
                          alert(`Erro: ${err instanceof Error ? err.message : err}`);
                        } finally {
                          if (btn) { btn.disabled = false; btn.textContent = "📤 Enviar laudo/relatório"; }
                          // Reset file input
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      id={`laudo-btn-${prof}`}
                      type="button"
                      onClick={() => document.getElementById(`laudo-upload-${prof}`)?.click()}
                      className="px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      📤 Enviar laudo/relatório
                    </button>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG ou WebP</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateField("orientacoes_por_profissional", {
                        ...(peiData.orientacoes_por_profissional || {}),
                        [prof]: "",
                      });
                    }}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                  >
                    🧹 Limpar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const atual = peiData.rede_apoio || [];
                      updateField("rede_apoio", atual.filter((item) => item !== prof));
                      const orientacoes = { ...(peiData.orientacoes_por_profissional || {}) };
                      delete orientacoes[prof];
                      updateField("orientacoes_por_profissional", orientacoes);
                    }}
                    className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    🗑️ Remover profissional
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr />

      {/* Checklist de preenchimento */}
      {(Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : []).length > 0 && (
        <div>
          <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Checklist de preenchimento
          </h4>
          <div className="space-y-1">
            {(peiData.rede_apoio || []).map((p) => {
              const txt = ((peiData.orientacoes_por_profissional || {})[p] || "").trim();
              return (
                <p key={p} className="text-sm text-slate-700">
                  - <strong>{p}</strong>: {txt ? "✅ preenchido" : "⚠️ vazio"}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}