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

type StudentFull = {
  id: string;
  name: string;
  grade?: string | null;
  class_group?: string | null;
  birth_date?: string | null;
  diagnosis?: string | null;
};

type Props = {
  students: { id: string; name: string }[];
  studentId: string | null;
  student: StudentFull | null;
  initialPeiData: Record<string, unknown>;
};

export function PEIClient({
  students,
  studentId,
  student,
  initialPeiData,
}: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [peiData, setPeiData] = useState<PEIData>(initialPeiData as PEIData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [integrating, setIntegrating] = useState(false);
  const [integrated, setIntegrated] = useState(false);

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

  async function handleIntegrar() {
    const nome = (peiData.nome || "").trim();
    if (!nome) {
      alert("Preencha o nome do estudante na aba 'Estudante' antes de integrar.");
      return;
    }

    setIntegrating(true);
    try {
      // Extrai dados básicos do peiData
      const nasc = peiData.nasc ? (typeof peiData.nasc === "string" ? peiData.nasc.split("T")[0] : peiData.nasc) : null;
      
      // Cria o estudante com todos os dados do PEI
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          grade: peiData.serie || null,
          class_group: peiData.turma || null,
          diagnosis: peiData.diagnostico || null,
          birth_date: nasc,
          pei_data: peiData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao integrar estudante");
      }

      const data = await res.json();
      setIntegrated(true);
      
      // Redireciona para o estudante criado
      setTimeout(() => {
        window.location.href = `/pei?student=${data.student.id}`;
      }, 1500);
    } catch (err) {
      console.error("Erro ao integrar:", err);
      alert(err instanceof Error ? err.message : "Erro ao integrar estudante na Omnisfera.");
    } finally {
      setIntegrating(false);
    }
  }

  const nomePreenchido = (peiData.nome || "").trim().length > 0;
  const podeIntegrar = !currentStudentId && nomePreenchido;

  // Calcular progresso do PEI (mesma lógica do Streamlit)
  function calcularProgresso(): number {
    const d = peiData;
    const _isFilled = (val: unknown): boolean => {
      if (val === null || val === undefined) return false;
      if (typeof val === "string") return val.trim().length > 0;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        return Object.keys(obj).length > 0 && Object.values(obj).some((v) => Boolean(v));
      }
      return Boolean(val);
    };

    const checkpoints = [
      {
        key: "ESTUDANTE",
        check: () => _isFilled(d.nome) && _isFilled(d.serie) && _isFilled(d.turma),
      },
      {
        key: "EVIDENCIAS",
        check: () => {
          const chk = (d.checklist_evidencias || {}) as Record<string, boolean>;
          return Object.values(chk).some(Boolean) || _isFilled(d.orientacoes_especialistas);
        },
      },
      {
        key: "REDE",
        check: () =>
          _isFilled(d.rede_apoio) ||
          _isFilled(d.orientacoes_gerais) ||
          _isFilled(d.orientacoes_por_profissional),
      },
      {
        key: "MAPEAMENTO",
        check: () => {
          const barreiras = (d.barreiras_selecionadas || {}) as Record<string, unknown[]>;
          const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
          return _isFilled(d.hiperfoco) || _isFilled(d.potencias) || nBar > 0;
        },
      },
      {
        key: "PLANO",
        check: () =>
          _isFilled(d.estrategias_acesso) ||
          _isFilled(d.estrategias_ensino) ||
          _isFilled(d.estrategias_avaliacao) ||
          _isFilled(d.outros_acesso) ||
          _isFilled(d.outros_ensino),
      },
      {
        key: "MONITORAMENTO",
        check: () => _isFilled(d.monitoramento_data) && _isFilled(d.status_meta),
      },
      {
        key: "IA",
        check: () => {
          const status = String(d.status_validacao_pei || "");
          return _isFilled(d.ia_sugestao) && (status === "revisao" || status === "aprovado");
        },
      },
      {
        key: "DASH",
        check: () => _isFilled(d.ia_sugestao),
      },
    ];

    const done = checkpoints.filter((cp) => cp.check()).length;
    return Math.max(0, Math.min(100, Math.round((done / checkpoints.length) * 100)));
  }

  const progresso = calcularProgresso();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Estudante</label>
          <StudentSelector students={students} currentId={currentStudentId} placeholder={currentStudentId ? "Estudante selecionado" : "Novo estudante — preencha o PEI abaixo"} />
        </div>
        {currentStudentId ? (
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
        ) : podeIntegrar ? (
          <button
            onClick={handleIntegrar}
            disabled={integrating}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60 mt-6"
          >
            {integrating ? "Integrando…" : integrated ? "Integrado ✓" : "🔗 Integrar na Omnisfera"}
          </button>
        ) : null}
      </div>

      {/* Barra de Progresso */}
      <div className="px-6 pt-4 pb-2">
        <div className="relative w-full h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progresso >= 100
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-red-400 to-orange-500"
            }`}
            style={{ width: `${Math.min(progresso, 100)}%` }}
          />
          {progresso > 0 && progresso < 100 && (
            <div
              className="absolute top-0 -mt-2 text-xs font-semibold text-slate-600 transition-all duration-500"
              style={{ left: `${Math.min(progresso, 100)}%`, transform: "translateX(-50%)" }}
            >
              ✨
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-500">Progresso do PEI</span>
          <span className="text-xs font-semibold text-slate-700">{progresso}%</span>
        </div>
      </div>

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
          <InicioTab
            currentStudentId={currentStudentId}
            peiData={peiData}
            onPeiDataChange={setPeiData}
            students={students}
          />
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
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Medicações</h4>
                  <MedicamentosForm peiData={peiData} onAdd={addMedicamento} onRemove={removeMedicamento} />
                </div>
              </div>
            )}

            {activeTab === "evidencias" && (
              <div className="space-y-4">
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
              <DashboardTab peiData={peiData} student={student} currentStudentId={currentStudentId} />
            )}
          </div>
    </div>
  );
}

function calcularIdade(nasc: string | undefined | null): string {
  if (!nasc) return "—";
  try {
    const nascDate = new Date(nasc);
    if (isNaN(nascDate.getTime())) return "—";
    const hoje = new Date();
    let anos = hoje.getFullYear() - nascDate.getFullYear();
    const mesDiff = hoje.getMonth() - nascDate.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascDate.getDate())) {
      anos--;
    }
    return anos > 0 ? `${anos} anos` : "Menos de 1 ano";
  } catch {
    return "—";
  }
}

function extrairMetasEstruturadas(textoIa: string | undefined): { Curto: string; Medio: string; Longo: string } {
  if (!textoIa) return { Curto: "Definir...", Medio: "Definir...", Longo: "Definir..." };
  const texto = textoIa.toLowerCase();
  const metas: { Curto: string; Medio: string; Longo: string } = { Curto: "Definir...", Medio: "Definir...", Longo: "Definir..." };
  
  // Tentar extrair metas por padrões comuns
  const curtoMatch = texto.match(/(?:curto|curto prazo|curto termo)[:\-]?\s*([^\.]+)/i);
  const medioMatch = texto.match(/(?:médio|medio|médio prazo|medio prazo|médio termo|medio termo)[:\-]?\s*([^\.]+)/i);
  const longoMatch = texto.match(/(?:longo|longo prazo|longo termo)[:\-]?\s*([^\.]+)/i);
  
  if (curtoMatch) metas.Curto = curtoMatch[1].trim().slice(0, 100);
  if (medioMatch) metas.Medio = medioMatch[1].trim().slice(0, 100);
  if (longoMatch) metas.Longo = longoMatch[1].trim().slice(0, 100);
  
  return metas;
}

function getHiperfocoEmoji(hiperfoco: string | undefined): string {
  if (!hiperfoco) return "🚀";
  const h = hiperfoco.toLowerCase();
  if (h.includes("dinossauro")) return "🦕";
  if (h.includes("minecraft")) return "🎮";
  if (h.includes("mapa")) return "🗺️";
  if (h.includes("carro")) return "🚗";
  if (h.includes("desenho")) return "✏️";
  return "🚀";
}

function calcularComplexidadePei(peiData: PEIData): { texto: string; bgCor: string; txtCor: string } {
  const barreiras = Object.values(peiData.barreiras_selecionadas || {}).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);
  if (barreiras === 0) return { texto: "BAIXA", bgCor: "#F0FDF4", txtCor: "#15803D" };
  if (barreiras <= 3) return { texto: "MODERADA", bgCor: "#FEF3C7", txtCor: "#D69E2E" };
  if (barreiras <= 6) return { texto: "ALTA", bgCor: "#FED7AA", txtCor: "#EA580C" };
  return { texto: "MUITO ALTA", bgCor: "#FEE2E2", txtCor: "#DC2626" };
}

function getProIcon(profissional: string): string {
  const icons: Record<string, string> = {
    "Fonoaudiólogo": "🗣️",
    "Psicólogo": "🧠",
    "Terapeuta Ocupacional": "🤲",
    "Fisioterapeuta": "🏃",
    "Neurologista": "🧬",
    "Psiquiatra": "💊",
    "Pediatra": "👨‍⚕️",
    "Oftalmologista": "👁️",
    "Ortopedista": "🦴",
  };
  return icons[profissional] || "👨‍⚕️";
}

function DashboardTab({
  peiData,
  student,
  currentStudentId,
}: {
  peiData: PEIData;
  student: StudentFull | null;
  currentStudentId: string | null;
}) {
  if (!peiData.nome) {
    return (
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
        Preencha o estudante na aba <strong>Estudante</strong> para visualizar o dashboard.
      </div>
    );
  }

  const idadeStr = calcularIdade(peiData.nasc || student?.birth_date);
  const serieTxt = peiData.serie || student?.grade || "-";
  const turmaTxt = peiData.turma || student?.class_group || "-";
  const matriculaTxt = peiData.matricula || peiData.ra || "-";
  const vinculoTxt = currentStudentId ? "Vinculado ao Supabase ✅" : "Rascunho (não sincronizado)";
  const initAvatar = (peiData.nome || "?")[0].toUpperCase();

  const nPot = (peiData.potencias || []).length;
  const barreiras = peiData.barreiras_selecionadas || {};
  const nBar = Object.values(barreiras).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);
  const hf = peiData.hiperfoco || "—";
  const hfEmoji = getHiperfocoEmoji(hf);
  const complexidade = calcularComplexidadePei(peiData);
  const metas = extrairMetasEstruturadas(peiData.ia_sugestao as string | undefined);
  const listaMeds = (peiData.lista_medicamentos || []) as Array<{ nome?: string; escola?: boolean }>;
  const alertaEscola = listaMeds.some((m) => m.escola);
  const redeApoio = (peiData.rede_apoio || []) as string[];

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold">
              {initAvatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{peiData.nome}</h1>
              <p className="text-blue-100 text-sm">
                {serieTxt} • Turma {turmaTxt} • Matrícula/RA: {matriculaTxt}
              </p>
              <p className="text-blue-200 text-xs mt-1">{vinculoTxt}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200 uppercase tracking-wide">IDADE</div>
            <div className="text-xl font-bold">{idadeStr}</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center h-36 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-3 relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#10B981 ${Math.min(nPot * 10, 100)}%, #E5E7EB 0%)`,
              }}
            />
            <div className="absolute inset-0 rounded-full bg-white m-2" />
            <div className="relative z-10 text-xl font-bold text-slate-800">{nPot}</div>
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Potencialidades</div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center h-36 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-3 relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${nBar > 5 ? "#EF4444" : "#F97316"} ${Math.min(nBar * 5, 100)}%, #E5E7EB 0%)`,
              }}
            />
            <div className="absolute inset-0 rounded-full bg-white m-2" />
            <div className="relative z-10 text-xl font-bold text-slate-800">{nBar}</div>
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Barreiras</div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center h-36 shadow-sm">
          <div className="text-4xl mb-2">{hfEmoji}</div>
          <div className="text-lg font-bold text-slate-800 truncate w-full text-center px-2">{hf}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Hiperfoco</div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center h-36 shadow-sm" style={{ backgroundColor: complexidade.bgCor, borderColor: complexidade.txtCor }}>
          <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-2">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-lg font-bold" style={{ color: complexidade.txtCor }}>
            {complexidade.texto}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: complexidade.txtCor }}>
            Nível de Atenção
          </div>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Farmacológico */}
        <div className={`rounded-xl border-l-4 p-5 shadow-sm ${alertaEscola ? "bg-red-50 border-red-400" : listaMeds.length > 0 ? "bg-orange-50 border-orange-400" : "bg-green-50 border-green-400"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💊</span>
            <h3 className="font-bold text-slate-800">Atenção Farmacológica</h3>
            {alertaEscola && <span className="text-red-600 animate-pulse">🚨</span>}
          </div>
          {listaMeds.length > 0 ? (
            <>
              <p className="text-sm text-slate-700 mb-2">
                <strong>Uso Contínuo:</strong> {listaMeds.map((m) => m.nome).filter(Boolean).join(", ")}
              </p>
              {alertaEscola && (
                <div className="mt-2 text-xs font-bold text-red-700">
                  🚨 ATENÇÃO: ADMINISTRAÇÃO NA ESCOLA NECESSÁRIA
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-600">Nenhuma medicação informada.</p>
          )}
        </div>

        {/* Card Metas */}
        <div className="rounded-xl border-l-4 border-yellow-400 bg-yellow-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏁</span>
            <h3 className="font-bold text-slate-800">Cronograma de Metas</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">🏁</span>
              <div>
                <strong>Curto:</strong> {metas.Curto}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🧗</span>
              <div>
                <strong>Médio:</strong> {metas.Medio}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🏔️</span>
              <div>
                <strong>Longo:</strong> {metas.Longo}
              </div>
            </div>
          </div>
        </div>

        {/* Card DNA do Estudante */}
        <div className="rounded-xl border-l-4 border-cyan-400 bg-cyan-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🧬</span>
            <h3 className="font-bold text-slate-800">DNA de Suporte</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(LISTAS_BARREIRAS).map(([area, lista]) => {
              const qtd = (barreiras[area] as string[] | undefined)?.length || 0;
              const val = Math.min(qtd * 20, 100);
              let color = "#3B82F6";
              if (val > 40) color = "#F97316";
              if (val > 70) color = "#EF4444";
              return (
                <div key={area} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{area}</span>
                    <span>{qtd} barreiras</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Rede de Apoio */}
        <div className="rounded-xl border-l-4 border-teal-400 bg-teal-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤝</span>
            <h3 className="font-bold text-slate-800">Rede de Apoio</h3>
          </div>
          {redeApoio.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {redeApoio.map((prof, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-slate-700 border border-slate-200 shadow-sm"
                >
                  {getProIcon(prof)} {prof}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 opacity-60">Sem rede cadastrada.</p>
          )}
        </div>
      </div>

      {/* Exportação */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="font-bold text-slate-800 mb-4">📤 Exportação e Sincronização</h3>
        <div className="flex flex-wrap gap-3">
          <PeiExportDocxButton peiData={peiData} />
          <PdfDownloadButton
            text={peiDataToFullText(peiData)}
            filename={`PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.pdf`}
            title={`PEI - ${peiData.nome || "Estudante"}`}
            className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-lg hover:bg-cyan-200 text-sm font-medium"
          >
            📥 Baixar PDF
          </PdfDownloadButton>
        </div>
      </div>
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
      className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 disabled:opacity-50"
    >
      {loading ? "Gerando…" : "📄 Baixar DOCX"}
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
      <EngineSelector value={engine} onChange={(e) => setEngine(e)} module="pei" />
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
      const url = nivel === "EF" 
        ? `/api/bncc/ef?serie=${encodeURIComponent(serie)}` 
        : `/api/bncc/em?serie=${encodeURIComponent(serie)}`;
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
  const [engine, setEngine] = useState<EngineId>("red");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [extraido, setExtraido] = useState<{ diagnostico: string; medicamentos: { nome: string; posologia?: string }[] } | null>(null);

  async function extrair() {
    if (!file) {
      setErro("Selecione um arquivo PDF.");
      return;
    }
    setLoading(true);
    setErro(null);
    setExtraido(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("engine", engine);
      const res = await fetch("/api/pei/extrair-laudo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao extrair dados.");
      setExtraido({
        diagnostico: data.diagnostico || "",
        medicamentos: data.medicamentos || [],
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao processar laudo.");
    } finally {
      setLoading(false);
    }
  }

  function aplicar() {
    if (!extraido) return;
    onDiagnostico(extraido.diagnostico);
    const meds = extraido.medicamentos.map((m) => ({ ...m, escola: false }));
    const existentes = peiData.lista_medicamentos || [];
    const novos = meds.filter((m) => !existentes.some((e) => (e.nome || "").toLowerCase() === (m.nome || "").toLowerCase()));
    onMedicamentos([...existentes, ...novos]);
    setExtraido(null);
    setFile(null);
  }

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
      <h4 className="font-medium text-slate-800">Laudo médico/escolar (PDF)</h4>
      <p className="text-sm text-slate-600">Anexe o laudo e use a IA para extrair diagnóstico e medicamentos.</p>
      <EngineSelector value={engine} onChange={setEngine} module="extrair_laudo" />
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Arquivo PDF</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setExtraido(null);
              setErro(null);
            }}
            className="block text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-100 file:text-sky-800"
          />
        </div>
        <button
          type="button"
          onClick={extrair}
          disabled={loading || !file}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {loading ? "Analisando…" : "Extrair dados do laudo"}
        </button>
      </div>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {extraido && (
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
            className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm"
          >
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

function InicioTab({
  currentStudentId,
  peiData,
  onPeiDataChange,
  students,
}: {
  currentStudentId: string | null;
  peiData: PEIData;
  onPeiDataChange: (data: PEIData) => void;
  students: { id: string; name: string }[];
}) {
  const [jsonPending, setJsonPending] = useState<Record<string, unknown> | null>(null);
  const [jsonFileName, setJsonFileName] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [showPeiInfo, setShowPeiInfo] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setJsonPending(parsed);
        setJsonFileName(file.name);
      } catch (err) {
        alert("Erro ao ler JSON: " + (err instanceof Error ? err.message : "Erro desconhecido"));
        setJsonPending(null);
        setJsonFileName("");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyJson = () => {
    if (!jsonPending) return;
    onPeiDataChange({ ...peiData, ...jsonPending } as PEIData);
    setJsonPending(null);
    setJsonFileName("");
    alert("Backup aplicado ao formulário ✅");
  };

  const handleSyncAll = async () => {
    if (!currentStudentId) {
      alert("Selecione um estudante primeiro ou integre um novo estudante.");
      return;
    }

    setSyncing(true);
    try {
      const nasc = peiData.nasc ? (typeof peiData.nasc === "string" ? peiData.nasc.split("T")[0] : peiData.nasc) : null;

      // Atualiza dados básicos do estudante
      const resStudent = await fetch(`/api/students/${currentStudentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: peiData.nome || null,
          grade: peiData.serie || null,
          class_group: peiData.turma || null,
          diagnosis: peiData.diagnostico || null,
          birth_date: nasc,
        }),
      });

      if (!resStudent.ok) throw new Error("Erro ao atualizar dados básicos");

      // Salva conteúdo completo do PEI
      const resPei = await fetch(`/api/students/${currentStudentId}/pei`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(peiData),
      });

      if (!resPei.ok) throw new Error("Erro ao salvar PEI completo");

      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
      alert("PEI completo salvo na nuvem com sucesso! ☁️");
    } catch (err) {
      alert("Erro na sincronização: " + (err instanceof Error ? err.message : "Erro desconhecido"));
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = JSON.stringify(peiData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, "-");
    const nomeClean = (peiData.nome || "Estudante").replace(/\s+/g, "_");
    link.download = `PEI_${nomeClean}_${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 max-w-6xl">
      {/* Coluna Esquerda: Fundamentos */}
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 mb-2">📘 Fundamentos do PEI</h3>
          <p className="text-sm text-slate-600">
            O <strong>PEI</strong> organiza o planejamento individualizado com foco em <strong>barreiras</strong> e{" "}
            <strong>apoios</strong>.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            A lógica é <strong>equidade</strong>: ajustar <strong>acesso, ensino e avaliação</strong>, sem baixar
            expectativas.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Base: <strong>LBI (Lei 13.146/2015)</strong>, LDB e diretrizes de Educação Especial na Perspectiva Inclusiva.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-2">ℹ️ Como usar a Omnisfera</h3>
          <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
            <li>
              <strong>Estudante:</strong> identificação + contexto + laudo (opcional)
            </li>
            <li>
              <strong>Evidências:</strong> o que foi observado e como aparece na rotina
            </li>
            <li>
              <strong>Mapeamento:</strong> barreiras + nível de apoio + potências
            </li>
            <li>
              <strong>Plano de Ação:</strong> acesso/ensino/avaliação
            </li>
            <li>
              <strong>Consultoria IA:</strong> gerar o documento técnico (validação do educador)
            </li>
            <li>
              <strong>Dashboard:</strong> KPIs + exportações + sincronização
            </li>
          </ol>
        </div>

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            📘 PEI/PDI e a Prática Inclusiva — Amplie o conhecimento
          </summary>
          <div className="mt-4 text-sm text-slate-600 space-y-3">
            <p>
              O <strong>Plano Educacional Individualizado (PEI)</strong>, também denominado{" "}
              <strong>Plano de Desenvolvimento Individual (PDI)</strong>, é um roteiro de intervenção pedagógica
              personalizado e flexível que norteia o processo de aprendizagem em sala comum para público-alvo da educação
              inclusiva. Tem o objetivo de <strong>remover obstáculos</strong> e <strong>promover a escolarização</strong>.
            </p>
            <p>
              O PEI/PDI leva em conta as particularidades do(a) aluno(a), incluindo-o no repertório da classe que frequenta
              e tendo como referência a <strong>mesma matriz curricular</strong> do ano a ser cursado.
            </p>
            <p>
              <strong>Caráter obrigatório:</strong> deve ser atualizado sistematicamente e compor a documentação escolar de
              alunos com deficiência, transtorno global do desenvolvimento e altas habilidades/superdotação. Respeita as
              orientações do laudo médico, quando houver.
            </p>
            <p>
              <strong>Elaboração:</strong> pela equipe multidisciplinar da escola; discutido com a família e profissionais
              externos no início do ano letivo; replanejado ao final de cada unidade e/ou período de avaliação.
            </p>
            <div className="mt-3">
              <strong>Registros fundamentais:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Identidade do aluno</li>
                <li>Necessidades específicas (características mais recorrentes)</li>
                <li>Dados sobre autonomia</li>
                <li>Dados atualizados sobre atendimentos externos</li>
                <li>Desenvolvimento escolar (leitura e raciocínio lógico-matemático)</li>
                <li>Necessidades de material pedagógico e tecnologias assistivas</li>
              </ul>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              A família deve acompanhar a elaboração do PEI/PDI e consentir formalmente, participando da análise das
              avaliações sistemáticas.
            </p>
          </div>
        </details>
      </div>

      {/* Coluna Direita: Gestão de Estudantes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800">👥 Gestão de Estudantes</h3>

        {/* Status vínculo */}
        {currentStudentId ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-sm font-semibold text-emerald-800">✅ Estudante vinculado ao Supabase (nuvem)</div>
            <div className="text-xs text-slate-500 mt-1">student_id: {currentStudentId.slice(0, 8)}...</div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-sm font-semibold text-amber-800">📝 Modo rascunho (sem vínculo na nuvem)</div>
          </div>
        )}

        {/* Backup Local */}
        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-2">1) Carregar Backup Local (.JSON)</h4>
          <p className="text-xs text-slate-500 mb-3">
            ✅ Não comunica com Supabase. Envie o arquivo e clique em <strong>Carregar no formulário</strong>.
          </p>

          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />

          {jsonPending && (
            <div className="mt-3 space-y-2">
              <div className="text-sm text-emerald-600">✅ Arquivo pronto ({jsonFileName})</div>
              <p className="text-xs text-slate-500">Agora clique no botão abaixo para aplicar os dados no formulário.</p>
              <details className="text-xs">
                <summary className="cursor-pointer text-slate-600">👀 Prévia do backup</summary>
                <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(
                    {
                      nome: jsonPending.nome,
                      serie: jsonPending.serie,
                      turma: jsonPending.turma,
                      diagnostico: jsonPending.diagnostico,
                      tem_ia_sugestao: !!jsonPending.ia_sugestao,
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyJson}
                  className="flex-1 px-3 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700"
                >
                  📥 Carregar no formulário
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJsonPending(null);
                    setJsonFileName("");
                  }}
                  className="px-3 py-2 border border-slate-200 text-sm rounded-lg hover:bg-slate-50"
                >
                  🧹 Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cloud Sync */}
        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-2">🌐 Omnisfera Cloud</h4>
          <p className="text-xs text-slate-500 mb-3">
            Sincroniza o cadastro e <strong>salva todo o conteúdo do PEI</strong> na nuvem (coluna pei_data).
          </p>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing || !currentStudentId}
            className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? "Sincronizando…" : "🔗 Sincronizar Tudo"}
          </button>

          {syncSuccess && (
            <div className="mt-3">
              <div className="text-sm text-emerald-600 mb-2">✅ Tudo salvo no Supabase!</div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
              >
                📂 BAIXAR BACKUP (.JSON)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
