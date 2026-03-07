"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { PEIData } from "@/lib/pei";
import { SERIES, LISTA_FAMILIA, detectarNivelEnsino } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import { DiagnosticConditionalFields } from "@/components/PEIDiagnosticFields";
import { LaudoPdfSection } from "../PEIClient";
import { User, Info, FileText, CheckCircle2, Pill } from "lucide-react";

type TabEstudanteProps = {
  peiData: PEIData;
  setPeiData: React.Dispatch<React.SetStateAction<PEIData>>;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  addMedicamento: (...args: unknown[]) => void;
  removeMedicamento: (i: number) => void;
  serie: string;
  schoolClasses: Array<{ id: string; class_group: string; grade_id: string; grades?: { name?: string; label?: string } }>;
  schoolGrades: Array<{ id: string; name: string; label?: string }>;
};

// MedicamentosForm inlined here since it's only used in this tab
function MedicamentosForm({
  medicamentos,
  onAdd,
  onRemove,
}: {
  medicamentos: Array<Record<string, unknown>>;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-2">
      {medicamentos.map((med, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 items-end">
          <input type="text" placeholder="Nome" value={String(med.nome || "")} readOnly className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
          <input type="text" placeholder="Posologia" value={String(med.posologia || "")} readOnly className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
          <button type="button" onClick={() => onRemove(i)} className="px-2 py-1 text-red-500 hover:text-red-700 text-sm">✕ Remover</button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-sm text-sky-600 hover:text-sky-800">+ Adicionar medicamento</button>
    </div>
  );
}

export function PEITabEstudante(props: TabEstudanteProps) {
  const { peiData, setPeiData, updateField, addMedicamento, removeMedicamento, serie, schoolClasses, schoolGrades } = props;

  // Compute available turmas based on selected serie
  const availableTurmas = useMemo(() => {
    if (!peiData.serie) return [] as typeof schoolClasses;
    const gradeMatch = schoolGrades.find((g) => g.name === peiData.serie || g.label === peiData.serie);
    if (!gradeMatch) return [] as typeof schoolClasses;
    return schoolClasses.filter((c) => c.grade_id === gradeMatch.id);
  }, [peiData.serie, schoolClasses, schoolGrades]);

  return (
          <div className="space-y-6 w-full">
            {/* Título da aba com ícone */}
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Dossiê do Estudante</h3>
            </div>

            {/* Identificação - ORDEM EXATA: Nome, Nascimento, Série/Ano, Turma, Matrícula/RA */}
            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-3">Identificação</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {/* Nome Completo - ocupa mais espaço */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                  <label className="flex text-sm font-semibold text-slate-700 mb-1.5 items-center gap-2">
                    Nome Completo
                    {peiData.nome && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </label>
                  <input
                    type="text"
                    value={peiData.nome || ""}
                    onChange={(e) => updateField("nome", e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-200 bg-white hover:border-slate-300"
                    placeholder="Digite o nome completo do estudante"
                  />
                </div>
                {/* Nascimento */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nascimento</label>
                  <input
                    type="date"
                    value={typeof peiData.nasc === "string" ? peiData.nasc.split("T")[0] : ""}
                    onChange={(e) => updateField("nasc", e.target.value || undefined)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                  />
                </div>
                {/* Série/Ano */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Série/Ano</label>
                  <select
                    value={peiData.serie || ""}
                    onChange={(e) => updateField("serie", e.target.value || null)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                  >
                    <option value="">Selecione...</option>
                    {SERIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {peiData.serie && (() => {
                    const nivel = detectarNivelEnsino(peiData.serie);
                    const segmentoInfo: Record<string, { nome: string; cor: string; emoji: string }> = {
                      EI: { nome: "EI — Educação Infantil", cor: "#4299e1", emoji: "👶" },
                      EFI: { nome: "EFAI — Ensino Fundamental Anos Iniciais", cor: "#48bb78", emoji: "📚" },
                      EFII: { nome: "EFAF — Ensino Fundamental Anos Finais", cor: "#ed8936", emoji: "🎓" },
                      EM: { nome: "EM — Ensino Médio / EJA", cor: "#9f7aea", emoji: "🎯" },
                    };
                    const seg = segmentoInfo[nivel];
                    if (!seg) return null;
                    return (
                      <div className="mt-2 px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2" style={{ backgroundColor: `${seg.cor}15`, color: seg.cor, border: `1px solid ${seg.cor}40` }}>
                        <span>{seg.emoji}</span>
                        <span>{seg.nome}</span>
                      </div>
                    );
                  })()}
                </div>
                {/* Turma */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Turma</label>
                  {availableTurmas.length > 0 ? (
                    <select
                      value={peiData.turma || ""}
                      onChange={(e) => updateField("turma", e.target.value || undefined)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                    >
                      <option value="">Selecione...</option>
                      {availableTurmas.map((c) => (
                        <option key={c.id} value={c.class_group}>{c.class_group}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={peiData.turma || ""}
                      onChange={(e) => updateField("turma", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                      placeholder={peiData.serie ? "Nenhuma turma cadastrada" : "Selecione a série primeiro"}
                    />
                  )}
                </div>
                {/* Matrícula / RA */}
                <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Matrícula / RA</label>
                  <input
                    type="text"
                    value={peiData.matricula || ""}
                    onChange={(e) => updateField("matricula", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                    placeholder="Ex: 2026-001234"
                  />
                </div>
              </div>

              {/* Badge do segmento + descrição (após Série/Ano) */}
              {peiData.serie && (() => {
                const nivel = detectarNivelEnsino(peiData.serie);
                const segmentoInfo: Record<string, { nome: string; cor: string; desc: string }> = {
                  EI: { nome: "EI — Educação Infantil", cor: "#4299e1", desc: "Foco: Campos de Experiência (BNCC) e rotina estruturante." },
                  EFI: { nome: "EFAI — Ensino Fundamental Anos Iniciais", cor: "#48bb78", desc: "Foco: alfabetização, numeracia e consolidação de habilidades basais." },
                  EFII: { nome: "EFAF — Ensino Fundamental Anos Finais", cor: "#ed8936", desc: "Foco: autonomia, funções executivas, organização e aprofundamento conceitual." },
                  EM: { nome: "EM — Ensino Médio / EJA", cor: "#9f7aea", desc: "Foco: projeto de vida, áreas do conhecimento e estratégias de estudo." },
                };
                const info = segmentoInfo[nivel] || { nome: "Selecione a Série/Ano", cor: "#718096", desc: "Aguardando seleção..." };
                return (
                  <div className="mt-3">
                    <span
                      className="inline-block px-3 py-1 rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: info.cor }}
                    >
                      {info.nome}
                    </span>
                    <p className="text-xs text-slate-600 mt-2">{info.desc}</p>
                  </div>
                );
              })()}
            </div>

            <hr />

            {/* Histórico & Contexto Familiar */}
            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-3">Histórico & Contexto Familiar</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Histórico Escolar</label>
                  <textarea
                    value={peiData.historico || ""}
                    onChange={(e) => updateField("historico", e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Dinâmica Familiar</label>
                  <textarea
                    value={peiData.familia || ""}
                    onChange={(e) => updateField("familia", e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Composição Familiar */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Quem convive com o estudante?
                </label>
                <p className="text-xs text-slate-500 mb-2">Incluímos Mãe 1 / Mãe 2 e Pai 1 / Pai 2 para famílias diversas.</p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const atual = peiData.composicao_familiar_tags || [];
                          if (!atual.includes(e.target.value)) {
                            updateField("composicao_familiar_tags", [...atual, e.target.value]);
                          }
                          e.target.value = "";
                        }
                      }}
                      className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                    >
                      <option value="">Selecione para adicionar...</option>
                      {LISTA_FAMILIA.filter((f) => !(peiData.composicao_familiar_tags || []).includes(f)).map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  {(Array.isArray(peiData.composicao_familiar_tags) ? peiData.composicao_familiar_tags : []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(Array.isArray(peiData.composicao_familiar_tags) ? peiData.composicao_familiar_tags : []).map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-sm border-2 border-sky-200 font-medium"
                        >
                          {f}
                          <button
                            type="button"
                            onClick={() => {
                              const atual = peiData.composicao_familiar_tags || [];
                              updateField("composicao_familiar_tags", atual.filter((item) => item !== f));
                            }}
                            className="text-sky-600 hover:text-sky-800 font-bold ml-1"
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

            <hr />

            {/* Laudo PDF + Extração IA - Layout 2 colunas [2, 1] como Streamlit */}
            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Laudo (PDF) + Extração Inteligente
              </h4>
              <LaudoPdfSection
                peiData={peiData}
                onDiagnostico={(v) => updateField("diagnostico", v)}
                onMedicamentos={(meds) => {
                  setPeiData((prev) => ({ ...prev, lista_medicamentos: meds }));
                }}
              />
            </div>

            <hr />

            {/* Contexto Clínico */}
            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-3">Contexto Clínico</h4>
              <div>
                <label className="flex text-sm font-semibold text-slate-700 mb-1 items-center gap-1.5">Diagnóstico <HelpTooltip fieldId="pei-diagnostico" /></label>
                <input
                  type="text"
                  value={peiData.diagnostico || ""}
                  onChange={(e) => updateField("diagnostico", e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                  placeholder="Nunca em materiais do estudante."
                />
                {/* Campos condicionais por diagnóstico */}
                <DiagnosticConditionalFields
                  peiData={peiData}
                  onUpdate={(key, value) => { updateField(key, value); }}
                />
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-sky-600" />
                  Medicações
                </h5>
                <MedicamentosForm medicamentos={Array.isArray(peiData.lista_medicamentos) ? peiData.lista_medicamentos : []} onAdd={addMedicamento} onRemove={removeMedicamento} />
              </div>
            </div>
          </div>

  );
}