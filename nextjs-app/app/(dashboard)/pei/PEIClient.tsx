"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import {
  SERIES,
  LISTA_ALFABETIZACAO,
  LISTAS_BARREIRAS,
  LISTA_POTENCIAS,
  LISTA_PROFISSIONAIS,
  LISTA_FAMILIA,
  EVIDENCIAS_PEDAGOGICO,
  EVIDENCIAS_COGNITIVO,
  EVIDENCIAS_COMPORTAMENTAL,
  ESTRATEGIAS_ACESSO,
  ESTRATEGIAS_ENSINO,
  ESTRATEGIAS_AVALIACAO,
  NIVEIS_SUPORTE,
  STATUS_META,
  PARECER_GERAL,
  PROXIMOS_PASSOS,
  detectarNivelEnsino,
} from "@/lib/pei";
import type { PEIData } from "@/lib/pei";
import type { EngineId } from "@/lib/ai-engines";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { peiDataToFullText } from "@/lib/pei-export";
import {
  Download,
  FileText,
  Loader2,
  Sparkles,
  Pill,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type HabilidadeBncc = {
  disciplina: string;
  codigo: string;
  descricao?: string;
  habilidade_completa?: string;
  origem?: string;
};

type TabId =
  | "inicio"
  | "estudante"
  | "evidencias"
  | "rede"
  | "mapeamento"
  | "plano"
  | "monitoramento"
  | "bncc"
  | "consultoria"
  | "dashboard";

const TABS: { id: TabId; label: string }[] = [
  { id: "inicio", label: "Início" },
  { id: "estudante", label: "Estudante" },
  { id: "evidencias", label: "Evidências" },
  { id: "rede", label: "Rede de Apoio" },
  { id: "mapeamento", label: "Mapeamento" },
  { id: "plano", label: "Plano de Ação" },
  { id: "monitoramento", label: "Monitoramento" },
  { id: "bncc", label: "BNCC" },
  { id: "consultoria", label: "Consultoria IA" },
  { id: "dashboard", label: "Dashboard" },
];

type Props = {
  students: { id: string; name: string }[];
  studentId: string | null;
  studentName: string | null;
  initialPeiData: Record<string, unknown>;
};

export function PEIClient({
  students,
  studentId,
  initialPeiData,
}: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [peiData, setPeiData] = useState<PEIData>(initialPeiData as PEIData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentStudentId = studentId || searchParams.get("student");

  function updateField<K extends keyof PEIData>(key: K, value: PEIData[K]) {
    setPeiData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleChecklist(key: string, label: string) {
    setPeiData((prev) => {
      const checklist = { ...(prev.checklist_evidencias || {}) };
      checklist[label] = !checklist[label];
      return { ...prev, checklist_evidencias: checklist };
    });
    setSaved(false);
  }

  function addMedicamento(nome: string, posologia: string, escola: boolean) {
    if (!nome.trim()) return;
    const lista = peiData.lista_medicamentos || [];
    if (lista.some((m) => (m.nome || "").toLowerCase() === nome.trim().toLowerCase())) return;
    setPeiData((prev) => ({
      ...prev,
      lista_medicamentos: [...(prev.lista_medicamentos || []), { nome: nome.trim(), posologia, escola }],
    }));
    setSaved(false);
  }

  function removeMedicamento(i: number) {
    setPeiData((prev) => {
      const lista = [...(prev.lista_medicamentos || [])];
      lista.splice(i, 1);
      return { ...prev, lista_medicamentos: lista };
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!currentStudentId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/students/${currentStudentId}/pei`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(peiData),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      console.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600">
          Nenhum estudante cadastrado. Crie um estudante em{" "}
          <Link href="/estudantes" className="text-sky-600 hover:underline">
            Estudantes
          </Link>{" "}
          ou no PEI do Streamlit.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Estudante</label>
          <StudentSelector students={students} currentId={currentStudentId} placeholder="Selecione o estudante" />
        </div>
        {currentStudentId && (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 disabled:opacity-60 mt-6"
            >
              {saving ? "Salvando…" : saved ? "Salvo ✓" : "Salvar PEI"}
            </button>
            <Link href="/estudantes" className="text-sm text-slate-500 hover:text-slate-700 mt-6">
              ← Estudantes
            </Link>
          </>
        )}
      </div>

      {!currentStudentId ? (
        <div className="p-8 text-center text-slate-500">Selecione um estudante para editar o PEI.</div>
      ) : (
        <>
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap ${
                  activeTab === t.id ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50/50" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {activeTab === "inicio" && (
              <div className="space-y-4 max-w-2xl">
                <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                  <h3 className="font-semibold text-slate-800">Fundamentos do PEI</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    O PEI organiza o planejamento individualizado com foco em barreiras e apoios. Equidade: ajustar
                    acesso, ensino e avaliação, sem baixar expectativas. Base: LBI (Lei 13.146/2015), LDB.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800">Como usar</h3>
                  <ol className="list-decimal list-inside text-sm text-slate-600 mt-2 space-y-1">
                    <li>Estudante: identificação + contexto</li>
                    <li>Evidências: o que foi observado</li>
                    <li>Mapeamento: barreiras + potências</li>
                    <li>Plano de Ação: acesso/ensino/avaliação</li>
                    <li>Consultoria IA: gerar documento técnico</li>
                    <li>Dashboard: exportações</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === "estudante" && (
              <div className="space-y-4 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
                    <input
                      type="text"
                      value={peiData.nome || ""}
                      onChange={(e) => updateField("nome", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nascimento</label>
                    <input
                      type="date"
                      value={typeof peiData.nasc === "string" ? peiData.nasc.split("T")[0] : ""}
                      onChange={(e) => updateField("nasc", e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Série/Ano</label>
                    <select
                      value={peiData.serie || ""}
                      onChange={(e) => updateField("serie", e.target.value || null)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">Selecione</option>
                      {SERIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Turma</label>
                    <input
                      type="text"
                      value={peiData.turma || ""}
                      onChange={(e) => updateField("turma", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="Ex: A"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula / RA</label>
                  <input
                    type="text"
                    value={peiData.matricula || ""}
                    onChange={(e) => updateField("matricula", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <hr />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Histórico Escolar</label>
                  <textarea
                    value={peiData.historico || ""}
                    onChange={(e) => updateField("historico", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dinâmica Familiar</label>
                  <textarea
                    value={peiData.familia || ""}
                    onChange={(e) => updateField("familia", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quem convive com o estudante?</label>
                  <select
                    multiple
                    value={peiData.composicao_familiar_tags || []}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                      updateField("composicao_familiar_tags", opts);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {LISTA_FAMILIA.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Ctrl+clique para múltipla seleção</p>
                </div>
                <hr />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contexto / Diagnóstico (equipe)</label>
                  <textarea
                    value={peiData.diagnostico || ""}
                    onChange={(e) => updateField("diagnostico", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Nunca em materiais do estudante."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interesses / Hiperfoco</label>
                  <input
                    type="text"
                    value={peiData.hiperfoco || ""}
                    onChange={(e) => updateField("hiperfoco", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ex: dinossauros, jogos, música"
                  />
                </div>
                <hr />
                <LaudoPdfSection
                  peiData={peiData}
                  onDiagnostico={(v) => updateField("diagnostico", v)}
                  onMedicamentos={(meds) => {
                    setPeiData((prev) => ({ ...prev, lista_medicamentos: meds }));
                    setSaved(false);
                  }}
                />
                <hr />
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Medicações</h4>
                  <MedicamentosForm peiData={peiData} onAdd={addMedicamento} onRemove={removeMedicamento} />
                </div>
              </div>
            )}

            {activeTab === "evidencias" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hipótese de Escrita (Emília Ferreiro)</label>
                  <select
                    value={peiData.nivel_alfabetizacao || ""}
                    onChange={(e) => updateField("nivel_alfabetizacao", e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {LISTA_ALFABETIZACAO.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <hr />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Pedagógico</h4>
                    {EVIDENCIAS_PEDAGOGICO.map((q) => (
                      <label key={q} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={!!(peiData.checklist_evidencias || {})[q]}
                          onChange={() => toggleChecklist("checklist_evidencias", q)}
                        />
                        <span className="text-sm">{q}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Cognitivo</h4>
                    {EVIDENCIAS_COGNITIVO.map((q) => (
                      <label key={q} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={!!(peiData.checklist_evidencias || {})[q]}
                          onChange={() => toggleChecklist("checklist_evidencias", q)}
                        />
                        <span className="text-sm">{q}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Comportamental</h4>
                    {EVIDENCIAS_COMPORTAMENTAL.map((q) => (
                      <label key={q} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={!!(peiData.checklist_evidencias || {})[q]}
                          onChange={() => toggleChecklist("checklist_evidencias", q)}
                        />
                        <span className="text-sm">{q}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações de especialistas</label>
                  <textarea
                    value={peiData.orientacoes_especialistas || ""}
                    onChange={(e) => updateField("orientacoes_especialistas", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {activeTab === "rede" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profissionais envolvidos</label>
                  <select
                    multiple
                    value={peiData.rede_apoio || []}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                      updateField("rede_apoio", opts);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {LISTA_PROFISSIONAIS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Ctrl+clique para múltipla seleção</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Orientações por profissional</label>
                  {(peiData.rede_apoio || []).map((prof) => (
                    <div key={prof} className="mb-4 p-4 rounded-lg border border-slate-200">
                      <h5 className="font-medium text-slate-800 mb-2">{prof}</h5>
                      <textarea
                        value={(peiData.orientacoes_por_profissional || {})[prof] || ""}
                        onChange={(e) =>
                          updateField("orientacoes_por_profissional", {
                            ...(peiData.orientacoes_por_profissional || {}),
                            [prof]: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="Orientações..."
                      />
                    </div>
                  ))}
                  {(!peiData.rede_apoio || peiData.rede_apoio.length === 0) && (
                    <p className="text-slate-500 text-sm">Selecione profissionais acima.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "mapeamento" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hiperfoco</label>
                    <input
                      type="text"
                      value={peiData.hiperfoco || ""}
                      onChange={(e) => updateField("hiperfoco", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Potencialidades</label>
                    <select
                      multiple
                      value={peiData.potencias || []}
                      onChange={(e) => {
                        const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                        updateField("potencias", opts);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      {LISTA_POTENCIAS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <hr />
                <h4 className="font-semibold text-slate-800">Barreiras e nível de apoio</h4>
                {Object.entries(LISTAS_BARREIRAS).map(([dominio, opcoes]) => (
                  <BarreirasDominio
                    key={dominio}
                    dominio={dominio}
                    opcoes={opcoes}
                    peiData={peiData}
                    updateField={updateField}
                  />
                ))}
              </div>
            )}

            {activeTab === "plano" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">1) Acesso (DUA)</h4>
                  <select
                    multiple
                    value={peiData.estrategias_acesso || []}
                    onChange={(e) => updateField("estrategias_acesso", Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {ESTRATEGIAS_ACESSO.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={peiData.outros_acesso || ""}
                    onChange={(e) => updateField("outros_acesso", e.target.value)}
                    placeholder="Personalizado"
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">2) Ensino</h4>
                  <select
                    multiple
                    value={peiData.estrategias_ensino || []}
                    onChange={(e) => updateField("estrategias_ensino", Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {ESTRATEGIAS_ENSINO.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={peiData.outros_ensino || ""}
                    onChange={(e) => updateField("outros_ensino", e.target.value)}
                    placeholder="Personalizado"
                    className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">3) Avaliação</h4>
                  <select
                    multiple
                    value={peiData.estrategias_avaliacao || []}
                    onChange={(e) => updateField("estrategias_avaliacao", Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {ESTRATEGIAS_AVALIACAO.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === "monitoramento" && (
              <div className="space-y-4 max-w-md">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ações Futuras</label>
                  <select
                    multiple
                    value={peiData.proximos_passos_select || []}
                    onChange={(e) => updateField("proximos_passos_select", Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {PROXIMOS_PASSOS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === "bncc" && (
              <BNCCTab
                peiData={peiData}
                updateField={updateField}
                serie={peiData.serie || ""}
              />
            )}

            {activeTab === "consultoria" && (
              <ConsultoriaTab
                peiData={peiData}
                updateField={updateField}
                serie={peiData.serie || ""}
              />
            )}

            {activeTab === "dashboard" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-medium text-slate-700">Exportar PEI completo:</span>
                  <PeiExportDocxButton peiData={peiData} />
                  <PdfDownloadButton
                    text={peiDataToFullText(peiData)}
                    filename={`PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.pdf`}
                    title={`PEI - ${peiData.nome || "Estudante"}`}
                    className="px-3 py-1.5 text-sm bg-cyan-100 text-cyan-800 rounded-lg hover:bg-cyan-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </PdfDownloadButton>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-2xl font-bold text-slate-800">{peiData.potencias?.length || 0}</div>
                    <div className="text-xs text-slate-500">Potencialidades</div>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-2xl font-bold text-slate-800">
                      {Object.values(peiData.barreiras_selecionadas || {}).reduce((a, v) => a + (v?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-slate-500">Barreiras</div>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-lg font-bold text-slate-800 truncate">{peiData.hiperfoco || "—"}</div>
                    <div className="text-xs text-slate-500">Hiperfoco</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jornada Gamificada (ia_mapa_texto)</label>
                  <textarea
                    value={peiData.ia_mapa_texto || ""}
                    onChange={(e) => updateField("ia_mapa_texto", e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PeiExportDocxButton({ peiData }: { peiData: PEIData }) {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/pei/exportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData }),
      });
      if (!res.ok) throw new Error("Erro ao gerar DOCX");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export PEI DOCX:", e);
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando…
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Baixar DOCX
        </>
      )}
    </button>
  );
}

function ConsultoriaTab({
  peiData,
  updateField,
  serie,
}: {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  serie: string;
}) {
  const [engine, setEngine] = useState<EngineId>((peiData.consultoria_engine as EngineId) || "red");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const gerar = async (modoPratico: boolean) => {
    if (!serie) {
      setErro("Selecione a Série/Ano na aba Estudante.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/pei/consultoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peiData,
          engine,
          modo_pratico: modoPratico,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar relatório.");
      updateField("ia_sugestao", data.texto || "");
      updateField("consultoria_engine", engine);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm">
        Documento técnico gerado pela IA. Escolha o motor e clique em Gerar.
      </p>
      <EngineSelector value={engine} onChange={(e) => setEngine(e)} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => gerar(false)}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Gerando…" : "✨ Gerar Estratégia Técnica"}
        </button>
        <button
          type="button"
          onClick={() => gerar(true)}
          disabled={loading}
          className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg disabled:opacity-50"
        >
          {loading ? "Gerando…" : "🧰 Gerar Guia Prático (Sala)"}
        </button>
      </div>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sugestão IA (consultoria)</label>
        <textarea
          value={peiData.ia_sugestao || ""}
          onChange={(e) => updateField("ia_sugestao", e.target.value)}
          rows={14}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
        />
      </div>
    </div>
  );
}

function BNCCTab({
  peiData,
  updateField,
  serie,
}: {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  serie: string;
}) {
  const nivel = detectarNivelEnsino(serie);

  // EI state
  const [eiFaixas, setEiFaixas] = useState<string[]>([]);
  const [eiCampos, setEiCampos] = useState<string[]>([]);
  const [eiObjetivos, setEiObjetivos] = useState<string[]>([]);
  const [eiLoading, setEiLoading] = useState(false);

  // EF/EM state
  const [blocos, setBlocos] = useState<{
    ano_atual: Record<string, HabilidadeBncc[]>;
    anos_anteriores: Record<string, HabilidadeBncc[]>;
  }>({ ano_atual: {}, anos_anteriores: {} });
  const [blocosLoading, setBlocosLoading] = useState(false);

  useEffect(() => {
    if (!serie) return;
    if (nivel === "EI") {
      setEiLoading(true);
      fetch("/api/bncc/ei")
        .then((r) => r.json())
        .then((d) => {
          setEiFaixas(d.faixas || []);
          setEiCampos(d.campos || []);
          setEiLoading(false);
        })
        .catch(() => setEiLoading(false));
    } else if (nivel === "EF" || nivel === "EM") {
      setBlocosLoading(true);
      const url = nivel === "EF" ? `/api/bncc/ef?serie=${encodeURIComponent(serie)}` : "/api/bncc/em";
      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          setBlocos({
            ano_atual: d.ano_atual || d || {},
            anos_anteriores: d.anos_anteriores || {},
          });
          setBlocosLoading(false);
        })
        .catch(() => setBlocosLoading(false));
    }
  }, [serie, nivel]);

  useEffect(() => {
    if (nivel === "EI") {
      const idade = peiData.bncc_ei_idade || eiFaixas[0] || "";
      const campo = peiData.bncc_ei_campo || eiCampos[0] || "";
      if (!idade || !campo) {
        setEiObjetivos([]);
        return;
      }
      fetch(`/api/bncc/ei?idade=${encodeURIComponent(idade)}&campo=${encodeURIComponent(campo)}`)
        .then((r) => r.json())
        .then((d) => setEiObjetivos(d.objetivos || []))
        .catch(() => setEiObjetivos([]));
    }
  }, [nivel, peiData.bncc_ei_idade, peiData.bncc_ei_campo, eiFaixas, eiCampos]);

  if (!serie) {
    return (
      <div className="text-amber-700 bg-amber-50 p-4 rounded-lg">
        Selecione a <strong>Série/Ano</strong> (ou faixa de idade para EI) na aba{" "}
        <strong>Estudante</strong>.
      </div>
    );
  }

  if (nivel === "EI") {
    const idade = peiData.bncc_ei_idade || eiFaixas[0] || "";
    const campo = peiData.bncc_ei_campo || eiCampos[0] || "";
    const objetivosAtuais = peiData.bncc_ei_objetivos || [];

    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Educação Infantil: selecione faixa de idade, campo de experiência e objetivos. A Consultoria IA usará estes dados.
        </p>
        {eiLoading ? (
          <p className="text-slate-500">Carregando BNCC EI...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Faixa de Idade</label>
              <select
                value={idade}
                onChange={(e) => updateField("bncc_ei_idade", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {eiFaixas.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campo de Experiência</label>
              <select
                value={campo}
                onChange={(e) => updateField("bncc_ei_campo", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {eiCampos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Objetivos de Aprendizagem</label>
          <select
            multiple
            value={objetivosAtuais}
            onChange={(e) =>
              updateField(
                "bncc_ei_objetivos",
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[120px]"
          >
            {eiObjetivos.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para selecionar vários.</p>
        </div>
        <div className="text-sky-700 bg-sky-50 p-3 rounded-lg text-sm">
          Com os campos e objetivos selecionados, siga para a aba <strong>Consultoria IA</strong> para gerar o relatório.
        </div>
      </div>
    );
  }

  // EF / EM
  const anoAtual = blocos.ano_atual || {};
  const anosAnteriores = blocos.anos_anteriores || {};
  const componentesAtual = Object.keys(anoAtual).sort();
  const componentesAnt = Object.keys(anosAnteriores).sort();
  const rotulo = nivel === "EM" ? "área de conhecimento" : "componente";
  const habilidadesAtuais = (peiData.habilidades_bncc_selecionadas || []) as HabilidadeBncc[];

  function opcaoLabel(h: HabilidadeBncc) {
    const c = h.codigo || "";
    const txt = h.habilidade_completa || h.descricao || "";
    return c ? `${c} — ${txt}` : txt;
  }

  function removerHabilidade(idx: number) {
    const lista = habilidadesAtuais.filter((_, i) => i !== idx);
    updateField("habilidades_bncc_selecionadas", lista);
    updateField("habilidades_bncc_validadas", null);
  }

  function desmarcarTodas() {
    updateField("habilidades_bncc_selecionadas", []);
    updateField("habilidades_bncc_validadas", null);
  }

  function validarSelecao() {
    if (habilidadesAtuais.length === 0) return;
    updateField("habilidades_bncc_validadas", [...habilidadesAtuais]);
  }

  if (blocosLoading) {
    return <p className="text-slate-500">Carregando habilidades BNCC...</p>;
  }

  if (!componentesAtual.length && !componentesAnt.length) {
    return (
      <div className="text-amber-700 bg-amber-50 p-4 rounded-lg">
        Nenhuma habilidade BNCC encontrada para esta série. Verifique se os arquivos bncc.csv (EF) ou bncc_em.csv (EM) existem em <code>data/</code>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Selecione as habilidades do ano/série do estudante. A Consultoria IA usará apenas estas para o relatório.
      </p>

      <details className="border border-slate-200 rounded-lg" open={habilidadesAtuais.length > 0}>
        <summary className="px-4 py-3 font-medium cursor-pointer bg-slate-50 rounded-t-lg">
          Habilidades selecionadas ({habilidadesAtuais.length})
        </summary>
        <div className="p-4 space-y-2">
          {habilidadesAtuais.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma habilidade selecionada. Marque nas listas abaixo ou use o botão de auxílio da IA.
            </p>
          ) : (
            <>
              {habilidadesAtuais.map((h, i) => (
                <div key={`${h.disciplina}-${h.codigo}-${i}`} className="flex justify-between items-start gap-2 py-2 border-b border-slate-100">
                  <div className="text-sm">
                    <strong>{h.disciplina}</strong> — <em>{h.codigo}</em> — {h.habilidade_completa || h.descricao}
                  </div>
                  <button
                    type="button"
                    onClick={() => removerHabilidade(i)}
                    className="text-red-600 text-sm whitespace-nowrap"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={desmarcarTodas}
                className="text-slate-600 text-sm"
              >
                Desmarcar todas
              </button>
            </>
          )}
        </div>
      </details>

      {componentesAtual.length > 0 && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-3 font-medium cursor-pointer bg-slate-50 rounded-t-lg">
            Habilidades do ano/série atual
          </summary>
          <div className="p-4 space-y-4">
            <p className="text-xs text-slate-500">
              Marque as habilidades por {rotulo} (ano atual).
            </p>
            {componentesAtual.map((disc) => (
              <div key={disc}>
                <label className="block text-sm font-medium text-slate-700 mb-2">{disc}</label>
                <select
                  multiple
                  value={habilidadesAtuais
                    .filter((h) => h.disciplina === disc && h.origem === "ano_atual")
                    .map((h) => opcaoLabel(h))}
                  onChange={(e) => {
                    const selecionados = Array.from(e.target.selectedOptions, (o) => o.value);
                    const habs = anoAtual[disc] || [];
                    const outras = habilidadesAtuais.filter((h) => !(h.disciplina === disc && h.origem === "ano_atual"));
                    const novas = habs
                      .filter((h) => selecionados.includes(opcaoLabel(h)))
                      .map((h) => ({
                        disciplina: disc,
                        codigo: h.codigo,
                        descricao: h.descricao,
                        habilidade_completa: h.habilidade_completa,
                        origem: "ano_atual" as const,
                      }));
                    updateField("habilidades_bncc_selecionadas", [...outras, ...novas]);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[80px] text-sm"
                >
                  {(anoAtual[disc] || []).map((h, i) => (
                    <option key={`${disc}-ano-${i}`} value={opcaoLabel(h)}>{opcaoLabel(h)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </details>
      )}

      {componentesAnt.length > 0 && (
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-3 font-medium cursor-pointer bg-slate-50 rounded-t-lg">
            Habilidades de anos anteriores
          </summary>
          <div className="p-4 space-y-4">
            <p className="text-xs text-slate-500">
              Habilidades de anos anteriores que merecem atenção.
            </p>
            {componentesAnt.map((disc) => (
              <div key={disc}>
                <label className="block text-sm font-medium text-slate-700 mb-2">{disc}</label>
                <select
                  multiple
                  value={habilidadesAtuais
                    .filter((h) => h.disciplina === disc && h.origem === "anos_anteriores")
                    .map((h) => opcaoLabel(h))}
                  onChange={(e) => {
                    const selecionados = Array.from(e.target.selectedOptions, (o) => o.value);
                    const habs = anosAnteriores[disc] || [];
                    const outras = habilidadesAtuais.filter((h) => !(h.disciplina === disc && h.origem === "anos_anteriores"));
                    const novas = habs
                      .filter((h) => selecionados.includes(opcaoLabel(h)))
                      .map((h) => ({
                        disciplina: disc,
                        codigo: h.codigo,
                        descricao: h.descricao,
                        habilidade_completa: h.habilidade_completa,
                        origem: "anos_anteriores" as const,
                      }));
                    updateField("habilidades_bncc_selecionadas", [...outras, ...novas]);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[80px] text-sm"
                >
                  {(anosAnteriores[disc] || []).map((h, i) => (
                    <option key={`${disc}-ant-${i}`} value={opcaoLabel(h)}>{opcaoLabel(h)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={validarSelecao}
          disabled={habilidadesAtuais.length === 0}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg disabled:opacity-50"
        >
          Validar seleção
        </button>
        {peiData.habilidades_bncc_validadas && (
          <span className="text-sm text-green-700">
            {peiData.habilidades_bncc_validadas.length} habilidade(s) validadas. A Consultoria IA usará estas no relatório.
          </span>
        )}
      </div>

      {habilidadesAtuais.length > 0 && !peiData.habilidades_bncc_validadas && (
        <p className="text-sm text-slate-600">
          {habilidadesAtuais.length} habilidade(s) selecionada(s). Clique em <strong>Validar seleção</strong> para o professor confirmar.
        </p>
      )}

      <p className="text-xs text-slate-500">
        Na aba <strong>Consultoria IA</strong>, o relatório será gerado com base nas habilidades validadas.
      </p>
    </div>
  );
}

function LaudoPdfSection({
  peiData,
  onDiagnostico,
  onMedicamentos,
}: {
  peiData: PEIData;
  onDiagnostico: (v: string) => void;
  onMedicamentos: (meds: { nome: string; posologia?: string; escola?: boolean }[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [engine, setEngine] = useState<EngineId>("orange"); // ChatGPT sempre para laudo médico
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [extraido, setExtraido] = useState<{ diagnostico: string; medicamentos: { nome: string; posologia?: string }[] } | null>(null);
  const [medsRevisao, setMedsRevisao] = useState<Array<{ nome: string; posologia: string; escola: boolean }>>([]);
  const [modoRevisao, setModoRevisao] = useState(false);

  async function extrair() {
    if (!file) {
      setErro("Selecione um arquivo PDF.");
      return;
    }
    setLoading(true);
    setErro(null);
    setExtraido(null);
    setModoRevisao(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("engine", engine);
      const res = await fetch("/api/pei/extrair-laudo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao extrair dados.");
      const resultado = {
        diagnostico: data.diagnostico || "",
        medicamentos: data.medicamentos || [],
      };
      setExtraido(resultado);
      // Preparar medicações para revisão
      if (resultado.medicamentos.length > 0) {
        setMedsRevisao(resultado.medicamentos.map((m) => ({ nome: m.nome || "", posologia: m.posologia || "", escola: false })));
        setModoRevisao(true);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao processar laudo.");
    } finally {
      setLoading(false);
    }
  }

  function aplicar() {
    if (!extraido) return;
    onDiagnostico(extraido.diagnostico);
    if (modoRevisao && medsRevisao.length > 0) {
      const existentes = peiData.lista_medicamentos || [];
      const novos = medsRevisao.filter((m) => m.nome && !existentes.some((e) => (e.nome || "").toLowerCase() === m.nome.toLowerCase()));
      onMedicamentos([...existentes, ...novos]);
    } else {
      const meds = extraido.medicamentos.map((m) => ({ ...m, escola: false }));
      const existentes = peiData.lista_medicamentos || [];
      const novos = meds.filter((m) => m.nome && !existentes.some((e) => (e.nome || "").toLowerCase() === (m.nome || "").toLowerCase()));
      onMedicamentos([...existentes, ...novos]);
    }
    setExtraido(null);
    setFile(null);
    setModoRevisao(false);
    setMedsRevisao([]);
  }

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      <div>
        <h4 className="font-medium text-slate-800 mb-1">Laudo médico/escolar (PDF) + Extração Inteligente</h4>
        <p className="text-sm text-slate-600">Anexe o laudo e use a IA para extrair diagnóstico e medicamentos.</p>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-600 mb-1">Arquivo PDF</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setExtraido(null);
              setErro(null);
              setModoRevisao(false);
              setMedsRevisao([]);
            }}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-100 file:text-sky-800 file:cursor-pointer hover:file:bg-sky-200"
          />
        </div>
        <button
          type="button"
          onClick={extrair}
          disabled={loading || !file}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analisando…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Extrair dados do laudo
            </>
          )}
        </button>
      </div>
      {erro && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{erro}</div>}
      
      {/* Revisão de medicações (como no Streamlit) */}
      {modoRevisao && medsRevisao.length > 0 && (
        <div className="p-4 rounded-lg bg-white border-2 border-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-amber-600" />
            <h5 className="font-semibold text-slate-800">Medicações encontradas no laudo (confirme antes de adicionar)</h5>
          </div>
          <div className="space-y-2">
            {medsRevisao.map((m, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-50 rounded">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={m.nome}
                    onChange={(e) => {
                      const novas = [...medsRevisao];
                      novas[i].nome = e.target.value;
                      setMedsRevisao(novas);
                    }}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                    placeholder="Nome do medicamento"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={m.posologia}
                    onChange={(e) => {
                      const novas = [...medsRevisao];
                      novas[i].posologia = e.target.value;
                      setMedsRevisao(novas);
                    }}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                    placeholder="Posologia"
                  />
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <label className="flex items-center gap-1 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={m.escola}
                      onChange={(e) => {
                        const novas = [...medsRevisao];
                        novas[i].escola = e.target.checked;
                        setMedsRevisao(novas);
                      }}
                      className="rounded"
                    />
                    Na escola?
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={aplicar}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Adicionar ao PEI
            </button>
            <button
              type="button"
              onClick={() => {
                setModoRevisao(false);
                setMedsRevisao([]);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      {/* Resultado da extração (sem revisão de meds) */}
      {extraido && !modoRevisao && (
        <div className="space-y-2 p-3 rounded-lg bg-white border border-slate-200">
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Diagnóstico</div>
            <p className="text-sm text-slate-700">{extraido.diagnostico || "—"}</p>
          </div>
          {extraido.medicamentos.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Medicamentos</div>
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {extraido.medicamentos.map((m, i) => (
                  <li key={i}>{m.nome}{m.posologia ? ` (${m.posologia})` : ""}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={aplicar}
            className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Aplicar ao PEI
          </button>
        </div>
      )}
    </div>
  );
}

function MedicamentosForm({
  peiData,
  onAdd,
  onRemove,
}: {
  peiData: PEIData;
  onAdd: (nome: string, posologia: string, escola: boolean) => void;
  onRemove: (i: number) => void;
}) {
  const [nome, setNome] = useState("");
  const [posologia, setPosologia] = useState("");
  const [escola, setEscola] = useState(false);
  const lista = peiData.lista_medicamentos || [];

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
        />
        <input
          type="text"
          value={posologia}
          onChange={(e) => setPosologia(e.target.value)}
          placeholder="Posologia"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
        />
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={escola} onChange={(e) => setEscola(e.target.checked)} />
          <span className="text-sm">Na escola?</span>
        </label>
        <button
          type="button"
          onClick={() => {
            onAdd(nome, posologia, escola);
            setNome("");
            setPosologia("");
          }}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm"
        >
          Adicionar
        </button>
      </div>
      <ul className="space-y-1">
        {lista.map((m, i) => (
          <li key={i} className="flex items-center justify-between py-2 border-b border-slate-100">
            <span>
              {m.nome} ({m.posologia || ""}){m.escola ? " [NA ESCOLA]" : ""}
            </span>
            <button type="button" onClick={() => onRemove(i)} className="text-red-600 text-sm">
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarreirasDominio({
  dominio,
  opcoes,
  peiData,
  updateField,
}: {
  dominio: string;
  opcoes: string[];
  peiData: PEIData;
  updateField: (k: keyof PEIData, v: unknown) => void;
}) {
  const barreiras = peiData.barreiras_selecionadas || {};
  const selecionadas = barreiras[dominio] || [];
  const niveis = peiData.niveis_suporte || {};
  const obs = peiData.observacoes_barreiras || {};

  function toggleBarreira(b: string) {
    const nova = selecionadas.includes(b) ? selecionadas.filter((x) => x !== b) : [...selecionadas, b];
    updateField("barreiras_selecionadas", { ...barreiras, [dominio]: nova });
  }

  return (
    <div className="mb-4 p-4 rounded-lg border border-slate-200">
      <h5 className="font-medium text-slate-800 mb-2">{dominio}</h5>
      <div className="space-y-2">
        {opcoes.map((b) => (
          <div key={b} className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selecionadas.includes(b)}
                onChange={() => toggleBarreira(b)}
              />
              <span className="text-sm">{b}</span>
            </label>
            {selecionadas.includes(b) && (
              <select
                value={niveis[`${dominio}_${b}`] || "Monitorado"}
                onChange={(e) =>
                  updateField("niveis_suporte", { ...niveis, [`${dominio}_${b}`]: e.target.value })
                }
                className="text-sm px-2 py-1 border rounded"
              >
                {NIVEIS_SUPORTE.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
      <textarea
        value={obs[dominio] || ""}
        onChange={(e) => updateField("observacoes_barreiras", { ...obs, [dominio]: e.target.value })}
        placeholder="Observações (opcional)"
        rows={2}
        className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
      />
    </div>
  );
}
