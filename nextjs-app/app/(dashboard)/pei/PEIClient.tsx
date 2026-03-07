"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { usePEIData, TABS, calcularProgresso, getTabStatus } from "@/hooks/usePEIData";
import type { TabId } from "@/hooks/usePEIData";
import { HelpTooltip } from "@/components/HelpTooltip";
import { PEIVersionHistory, createPEISnapshot } from "@/components/PEIVersionHistory";
import { DiagnosticConditionalFields, LBIComplianceChecklist } from "@/components/PEIDiagnosticFields";
import { PEIFase2Regentes } from "@/components/PEIFase2Regentes";
import { PEIPlanoEnsino } from "@/components/PEIPlanoEnsino";
import { PEIAvaliacaoDiagnostica } from "@/components/PEIAvaliacaoDiagnostica";
import { PEIConsolidacao } from "@/components/PEIConsolidacao";
import { DashboardTab } from "./components/PEIDashboardTab";
import { ConsultoriaTab } from "./components/PEIConsultoriaTab";
import { BNCCTab } from "./components/PEIBnccTab";

// Helper para validar e parsear respostas JSON
async function parseJsonResponse(res: Response, url?: string) {
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.error || `HTTP ${res.status}${url ? ` em ${url}` : ""}`);
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}${url ? ` em ${url}` : ""}`);
  }
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Resposta não é JSON${url ? ` de ${url}` : ""}`);
  }
  return res.json();
}
import { StudentSelector } from "@/components/StudentSelector";
import {
  SERIES,
  LISTA_ALFABETIZACAO,
  LISTAS_BARREIRAS,
  LISTA_POTENCIAS,
  LISTA_PROFISSIONAIS,
  LISTA_FAMILIA,
  LISTA_TECNOLOGIAS_ASSISTIVAS,
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
import { ResumoAnexosEstudante } from "@/components/ResumoAnexosEstudante";
import {
  Download,
  FileText,
  Sparkles,
  Pill,
  CheckCircle2,
  XCircle,
  User,
  Search,
  Users,
  Radar,
  Puzzle,
  RotateCw,
  ClipboardList,
  Bot,
  FileDown,
  Info,
  Settings,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Send,

  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { OnboardingPanel, OnboardingResetButton } from "@/components/OnboardingPanel";
import { OmniLoader } from "@/components/OmniLoader";
import { Users as UsersIcon, FileText as FileTextIcon, Sparkles as SparklesIcon, Send as SendIcon, Brain, ClipboardList as ClipboardListIcon } from "lucide-react";

function TransicaoAnoButton({ studentId, studentName }: { studentId: string; studentName?: string }) {
  const [loading, setLoading] = useState(false);
  const ano = new Date().getFullYear();
  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pei/relatorio-transicao?studentId=${encodeURIComponent(studentId)}&ano=${ano}`);
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Erro ao gerar relatório.");
        return;
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Transicao_${(studentName || "Estudante").toString().replace(/\s+/g, "_")}_${ano}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 disabled:opacity-60"
    >
      {loading ? <OmniLoader size={16} /> : <RotateCw className="w-4 h-4" />}
      Relatório Transição {ano}
    </button>
  );
}

type HabilidadeBncc = {
  disciplina: string;
  codigo: string;
  descricao?: string;
  habilidade_completa?: string;
  origem?: string;
};

// TabId and TABS imported from @/hooks/usePEIData

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
  // ─── Core PEI State (from extracted hook) ─────────────────────────
  const pei = usePEIData({ students, studentId, initialPeiData });
  const {
    activeTab, setActiveTab,
    peiData, setPeiData,
    saving, saved,
    selectedStudentId, setSelectedStudentId,
    jsonPending, setJsonPending,
    jsonFileName, setJsonFileName,
    erroGlobal, setErroGlobal,
    isLoadingRascunho, setIsLoadingRascunho,
    studentPendingId, setStudentPendingId,
    studentPendingName, setStudentPendingName,
    cloudLoadIdRef, skipNextFetchRef,
    updateField,
    toggleChecklist,
    addMedicamento,
    removeMedicamento,
    handleSave,
    handleUpdate,
    aplicarJson,
    currentStudentId,
    progresso,
    tabStatuses,
  } = pei;

  // ─── Local-only state ─────────────────────────────────────────────
  const [privacyConsentAccepted, setPrivacyConsentAccepted] = useState(false);
  const [schoolClasses, setSchoolClasses] = useState<Array<{ id: string; class_group: string; grade_id: string; grades?: { name?: string; label?: string } }>>([]);
  const [schoolGrades, setSchoolGrades] = useState<Array<{ id: string; name: string; label?: string }>>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check onboarding on mount
  useEffect(() => {
    if (!localStorage.getItem('onboarding_pei')) setShowOnboarding(true);
  }, []);

  // Fetch school classes and grades for turma dropdown
  useEffect(() => {
    Promise.all([
      fetch("/api/school/classes").then(r => r.json()).then(d => {
        setSchoolClasses(d.classes || []);
      }),
      fetch("/api/school/grades").then(r => r.json()).then(d => {
        setSchoolGrades(d.grades || []);
      }),
    ]).catch(() => { });
  }, []);

  // Compute available turmas for selected série
  const availableTurmas = React.useMemo(() => {
    const selectedSerie = peiData.serie || "";
    if (!selectedSerie || schoolGrades.length === 0 || schoolClasses.length === 0) return [];
    const extractNum = (s: string) => (s.match(/\d+/) || [""])[0];
    const normalizeGrade = (s: string) => s.replace(/[ºª°m\s]/gi, "").toLowerCase();
    const numSerie = extractNum(selectedSerie);
    const matchingGradeIds = schoolGrades
      .filter(g => {
        const numG = extractNum(g.name || g.label || "");
        return (numG && numSerie && numG === numSerie) ||
          normalizeGrade(g.name || g.label || "").includes(normalizeGrade(selectedSerie)) ||
          normalizeGrade(selectedSerie).includes(normalizeGrade(g.name || g.label || ""));
      })
      .map(g => g.id);
    const filtered = schoolClasses.filter(c => matchingGradeIds.includes(c.grade_id));
    const seen = new Set<string>();
    return filtered.filter(c => {
      if (seen.has(c.class_group)) return false;
      seen.add(c.class_group);
      return true;
    });
  }, [peiData.serie, schoolGrades, schoolClasses]);

  // ─── Local render helpers (use hook values) ────────────────────────

  function RenderProgresso() {
    const p = Math.max(0, Math.min(100, progresso));
    let barColor = '#FBBF24';
    if (p >= 50) barColor = '#60A5FA';
    if (p >= 100) barColor = '#34D399';

    return (
      <div className="mb-4">
        <div className="relative w-full h-2 rounded-full overflow-hidden shadow-inner bg-(--omni-border-default)">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{
              width: `${p}%`,
              backgroundColor: barColor,
              boxShadow: p > 0 ? `0 0 8px ${barColor}40` : 'none'
            }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  function SaveFeedback() {
    if (saving) {
      return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-2xl animate-slide-up">
          <OmniLoader size={20} />
          <span className="font-medium">Salvando...</span>
        </div>
      );
    }
    if (saved) {
      return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl animate-slide-up">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Salvo com sucesso!</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden bg-(--omni-bg-secondary) border border-(--omni-border-default)">
      {/* Onboarding Panel */}
      {showOnboarding && (
        <div className="px-6 pt-6">
          <OnboardingPanel
            moduleKey="pei"
            moduleTitle="Bem-vindo ao PEI"
            moduleSubtitle="Siga os passos para construir o Plano Educacional Individualizado"
            accentColor="#6366f1"
            accentColorLight="#818cf8"
            steps={[
              { icon: <User size={22} />, title: "Estudante", description: "Selecione e preencha dados iniciais, diagnóstico e contexto" },
              { icon: <Puzzle size={22} />, title: "Mapeamento", description: "Barreiras, potencialidades e hiperfoco do estudante" },
              { icon: <Sparkles size={22} />, title: "Consultoria IA", description: "A IA analisa e gera o PEI técnico para validação" },
              { icon: <Send size={22} />, title: "Enviar", description: "Envie para os professores regentes adaptarem" },
            ]}
            onStart={() => setShowOnboarding(false)}
          />
        </div>
      )}
      {/* Barra de Progresso Global */}
      <div className="px-6 pt-4 pb-2 bg-(--omni-bg-tertiary) border-b border-(--omni-border-default)">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-(--omni-text-secondary)">Progresso do PEI</span>
          </div>
          <span className="text-sm font-bold text-(--omni-text-primary)">{progresso}%</span>
        </div>
        <RenderProgresso />
      </div>

      {/* Mensagem de Erro Global */}
      {erroGlobal && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="shrink-0 w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-red-800 font-semibold text-sm">Erro ao processar</p>
            <p className="text-red-700 text-sm mt-1 wrap-break-word">{erroGlobal}</p>
          </div>
          <button
            onClick={() => setErroGlobal(null)}
            className="shrink-0 text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
            aria-label="Fechar erro"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navegação de Abas com Indicadores Visuais */}
      <div className="flex gap-1.5 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide bg-(--omni-bg-tertiary) border border-(--omni-border-default)">
        {TABS.map((t) => {
          const status = tabStatuses[t.id];
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`group relative px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[13px] font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-xl transition-all duration-200 ${isActive
                ? "shadow-sm bg-(--omni-bg-secondary) text-(--omni-text-primary)"
                : "text-(--omni-text-muted)"
                }`}
            >
              {/* Indicador de Status */}
              <div className={`w-2 h-2 rounded-full transition-all duration-200 shrink-0 ${status === "complete"
                ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                : status === "in-progress"
                  ? "bg-amber-500 shadow-sm shadow-amber-500/50"
                  : "bg-slate-300"
                }`} />

              <span className={isActive ? "font-bold" : ""}>{t.label}</span>

              {/* Tooltip de status */}
              {status === "complete" && (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Breadcrumb e Navegação Contextual */}
      <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-(--omni-bg-tertiary) border-b border-(--omni-border-default)">
        <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
          <Link href="/" className="text-slate-500 hover:text-sky-600 transition-colors">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium">PEI</span>
          <span className="text-slate-300">/</span>
          <span className="text-sky-600 font-semibold">{TABS.find(t => t.id === activeTab)?.label}</span>
        </div>
        {currentStudentId && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="hidden sm:inline">Estudante selecionado</span>
            <span className="sm:hidden">Selecionado</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto scroll-smooth">
        {activeTab === "inicio" && (
          <div className="space-y-4">
            {/* Título da aba com ícone */}
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Central de Fundamentos e Gestão</h3>
            </div>

            {/* Grid principal: 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Coluna Esquerda: Fundamentos */}
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    Fundamentos do PEI
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O PEI organiza o planejamento individualizado com foco em <strong>barreiras e apoios</strong>.
                    <strong>Equidade:</strong> ajustar acesso, ensino e avaliação, sem baixar expectativas.
                    Base: <strong>LBI (Lei 13.146/2015)</strong>, LDB.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-600" />
                    Como usar a Omnisfera
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <li><strong>Estudante:</strong> identificação + contexto + laudo (opcional)</li>
                    <li><strong>Evidências:</strong> o que foi observado e como aparece na rotina</li>
                    <li><strong>Mapeamento:</strong> barreiras + nível de apoio + potências</li>
                    <li><strong>Plano de Ação:</strong> acesso/ensino/avaliação</li>
                    <li><strong>Consultoria IA:</strong> gerar o documento técnico (validação do educador)</li>
                    <li><strong>Dashboard:</strong> KPIs + exportações + sincronização</li>
                  </ol>
                </div>

                <details className="rounded-lg border border-slate-200/60 p-3 bg-white">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-800 mb-2">
                    📘 PEI/PDI e a Prática Inclusiva — Amplie o conhecimento
                  </summary>
                  <div className="mt-2 text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p>
                      O <strong>Plano Educacional Individualizado (PEI)</strong>, também denominado <strong>Plano de Desenvolvimento Individual (PDI)</strong>, é um roteiro de intervenção pedagógica personalizado e flexível que norteia o processo de aprendizagem em sala comum para público-alvo da educação inclusiva. Tem o objetivo de <strong>remover obstáculos</strong> e <strong>promover a escolarização</strong>.
                    </p>
                    <p>
                      O PEI/PDI leva em conta as particularidades do(a) aluno(a), incluindo-o no repertório da classe que frequenta e tendo como referência a <strong>mesma matriz curricular</strong> do ano a ser cursado.
                    </p>
                    <p>
                      <strong>Caráter obrigatório:</strong> deve ser atualizado sistematicamente e compor a documentação escolar de alunos com deficiência, transtorno global do desenvolvimento e altas habilidades/superdotação. Respeita as orientações do laudo médico, quando houver.
                    </p>
                    <p>
                      <strong>Elaboração:</strong> pela equipe multidisciplinar da escola; discutido com a família e profissionais externos no início do ano letivo; replanejado ao final de cada unidade e/ou período de avaliação.
                    </p>
                    <div>
                      <p className="font-semibold mb-1 text-xs">Registros fundamentais:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                        <li>Identidade do aluno</li>
                        <li>Necessidades específicas (características mais recorrentes)</li>
                        <li>Dados sobre autonomia</li>
                        <li>Dados atualizados sobre atendimentos externos</li>
                        <li>Desenvolvimento escolar (leitura e raciocínio lógico-matemático)</li>
                        <li>Necessidades de material pedagógico e tecnologias assistivas</li>
                      </ul>
                    </div>
                    <p className="text-xs text-slate-500 italic mt-2">
                      A família deve acompanhar a elaboração do PEI/PDI e consentir formalmente, participando da análise das avaliações sistemáticas.
                    </p>
                  </div>
                </details>
              </div>

              {/* Coluna Direita: Gestão de Estudantes */}
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600" />
                    Gestão de Estudantes
                  </h4>

                  {/* Status do vínculo */}
                  {currentStudentId ? (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 mb-3">
                      <p className="text-xs font-medium text-emerald-800">✅ Estudante vinculado ao Supabase (nuvem)</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">student_id: {currentStudentId.slice(0, 8)}...</p>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 mb-3">
                      <p className="text-xs font-medium text-amber-800">📝 Modo rascunho (sem vínculo na nuvem)</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">Selecione um estudante ou carregue um backup JSON</p>
                    </div>
                  )}

                  {/* Seleção de Estudante */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selecione o estudante</label>
                    <StudentSelector
                      students={students}
                      currentId={studentPendingId || null}
                      placeholder="Selecione o estudante"
                      onChange={(id) => {
                        setErroGlobal(null);
                        if (id) {
                          // Verificar se o estudante está na lista primeiro
                          const studentFromList = students.find((s) => s.id === id);
                          if (!studentFromList) {
                            setErroGlobal("Estudante não encontrado na lista");
                            // O primeiro Passo é gerar a Análise Inicial do estudante usando a função &quot;Gerar PEI com IA&quot;, que utilizará os relatórios ou o questionário.le.log("Armazenando estudante como pendente:", studentFromList.name);
                            return;
                          }
                          // Apenas armazenar como pendente - não carregar ainda
                          setStudentPendingId(id);
                          setStudentPendingName(studentFromList.name);
                          // Limpar URL
                          const url = new URL(window.location.href);
                          url.searchParams.delete("student");
                          window.history.pushState({}, "", url.toString());
                        } else {
                          // Limpar dados quando nenhum estudante está selecionado
                          setStudentPendingId(null);
                          setStudentPendingName("");
                          setErroGlobal(null);
                          // Limpar URL
                          const url = new URL(window.location.href);
                          url.searchParams.delete("student");
                          window.history.pushState({}, "", url.toString());
                        }
                      }}
                    />
                    {studentPendingId && (
                      <div className="mt-2 space-y-1.5">
                        <div className="p-2 rounded bg-white border border-slate-200">
                          <p className="text-[10px] font-medium text-slate-700">Estudante selecionado ✅ ({studentPendingName})</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Clique no botão abaixo para carregar como rascunho.</p>
                          <p className="text-[9px] text-slate-400 mt-1">ID: {studentPendingId}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              // Usar o valor atual diretamente
                              const idToLoad = studentPendingId;
                              if (!idToLoad) {
                                alert("Nenhum estudante selecionado");
                                console.error("idToLoad está vazio!");
                                return;
                              }

                              setErroGlobal(null);
                              const studentFromList = students.find((s) => s.id === idToLoad);
                              if (!studentFromList) {
                                setErroGlobal("Estudante não encontrado na lista");
                                alert("Estudante não encontrado na lista");
                                return;
                              }

                              setIsLoadingRascunho(true);
                              try {
                                // Tentar primeiro a API principal
                                let apiUrl = `/api/students/${idToLoad}`;
                                let res = await fetch(apiUrl);

                                // Se falhar, tentar a rota alternativa que busca apenas pei_data
                                if (!res.ok) {
                                  apiUrl = `/api/students/${idToLoad}/pei-data`;
                                  res = await fetch(apiUrl);
                                }

                                if (!res.ok) {
                                  // Tentar ler a mensagem de erro
                                  let errorMessage = "Estudante não encontrado";
                                  try {
                                    const errorData = await res.json();
                                    errorMessage = errorData.error || `Erro HTTP ${res.status}`;
                                    console.error("Erro da API:", errorData);
                                  } catch (e) {
                                    console.error("Erro ao ler resposta de erro:", e);
                                  }

                                  console.error("❌ Não foi possível buscar o PEI:", {
                                    id: idToLoad,
                                    status: res.status,
                                    statusText: res.statusText,
                                    errorMessage
                                  });

                                  setErroGlobal(`Erro: ${errorMessage} (Status: ${res.status})`);
                                  alert(`Erro ao buscar PEI: ${errorMessage}\n\nID: ${idToLoad}\nStatus: ${res.status}\n\nO estudante pode não ter PEI salvo ainda.`);
                                  setIsLoadingRascunho(false);
                                  return;
                                }

                                const data = await res.json();

                                // A rota alternativa retorna { pei_data: ... }, a principal retorna { pei_data: ..., id: ..., name: ... }
                                // Pegar o pei_data de qualquer uma das rotas
                                const peiDataJson = data.pei_data;
                                if (peiDataJson && typeof peiDataJson === 'object') {
                                }

                                if (peiDataJson && typeof peiDataJson === 'object' && !Array.isArray(peiDataJson) && Object.keys(peiDataJson).length > 0) {
                                  const campos = Object.keys(peiDataJson);

                                  // Criar cópia profunda do JSON
                                  const jsonCopiado = JSON.parse(JSON.stringify(peiDataJson)) as PEIData;

                                  // *** CORREÇÃO: Aplicar diretamente em vez de usar jsonPending ***
                                  // O fluxo jsonPending → useEffect → setTimeout criava race condition
                                  // com o useEffect de fetch (que dispara ao mudar isLoadingRascunho)
                                  skipNextFetchRef.current = true;
                                  setPeiData(jsonCopiado);
                                  setSelectedStudentId(idToLoad);

                                  // Limpar estados de seleção
                                  setStudentPendingId(null);
                                  setStudentPendingName("");
                                  setIsLoadingRascunho(false);
                                  // Saved state is managed by the hook
                                  setErroGlobal(null);

                                  // Limpar parâmetro student da URL
                                  const url = new URL(window.location.href);
                                  url.searchParams.delete("student");
                                  window.history.pushState({}, "", url.toString());

                                } else {
                                  // Estudante encontrado mas sem pei_data
                                  setErroGlobal("Estudante encontrado mas sem dados de PEI salvos no Supabase");
                                  alert("Estudante encontrado mas sem dados de PEI salvos.\n\nPreencha o PEI e use o botão 'Criar Novo Estudante' no Dashboard para salvar.");
                                  setStudentPendingId(null);
                                  setStudentPendingName("");
                                  setIsLoadingRascunho(false);
                                }
                              } catch (err) {
                                console.error("❌ Erro ao carregar estudante:", err);
                                const errorMsg = err instanceof Error ? err.message : String(err);
                                setErroGlobal(`Erro ao carregar dados: ${errorMsg}`);
                                alert(`Erro ao carregar dados do estudante:\n\n${errorMsg}\n\nID: ${idToLoad}`);
                                setStudentPendingId(null);
                                setStudentPendingName("");
                                setIsLoadingRascunho(false);
                              }
                            }}
                            className="flex-1 px-2 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-lg hover:bg-sky-700"
                          >
                            📥 Carregar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStudentPendingId(null);
                              setStudentPendingName("");
                            }}
                            className="px-2 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                          >
                            🧹 Limpar
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <Link
                        href="/estudantes"
                        className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                      >
                        ← Estudantes
                      </Link>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      💡 <strong>Dica:</strong> Selecione um estudante e clique em <strong>Carregar</strong> para trabalhar como <strong>rascunho</strong> (sem vínculo com a nuvem). Use o botão "Criar Novo Estudante" abaixo para salvar como um novo estudante na nuvem quando estiver pronto.
                    </p>
                  </div>
                </div>

                {/* Backup Local: Upload JSON */}
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-sky-600" />
                    1) Carregar Backup Local (.JSON)
                  </h4>
                  <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                    ✅ Não comunica com Supabase. Envie o arquivo e clique em <strong>Carregar no formulário</strong>.
                  </p>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            const json = JSON.parse(ev.target?.result as string);
                            setJsonPending(json as PEIData);
                            setJsonFileName(file.name);
                          } catch (err) {
                            alert(`Erro ao ler JSON: ${err}`);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg bg-white mb-2"
                  />
                  {jsonPending && (
                    <div className="mt-2 space-y-1.5">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <p className="text-[10px] font-medium text-slate-700">Arquivo pronto ✅ ({jsonFileName})</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Clique no botão abaixo para aplicar os dados.</p>
                      </div>
                      <details className="text-[10px]">
                        <summary className="cursor-pointer text-slate-600 mb-0.5">👀 Prévia do backup</summary>
                        <div className="p-1.5 bg-slate-50 rounded text-[10px] font-mono mt-1">
                          {JSON.stringify({
                            nome: jsonPending.nome,
                            serie: jsonPending.serie,
                            turma: jsonPending.turma,
                            diagnostico: jsonPending.diagnostico,
                            tem_ia_sugestao: !!jsonPending.ia_sugestao,
                          }, null, 2)}
                        </div>
                      </details>
                      <div className="flex gap-1.5">
                        <button
                          onClick={aplicarJson}
                          className="flex-1 px-2 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-lg hover:bg-sky-700"
                        >
                          📥 Carregar
                        </button>
                        <button
                          onClick={() => {
                            setJsonPending(null);
                            setJsonFileName("");
                          }}
                          className="px-2 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                        >
                          🧹 Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Links rápidos PEI ↔ PAEE + Transição de ano */}
                {selectedStudentId && (
                  <div className="rounded-lg border border-slate-200/60 p-3 bg-white mb-3 space-y-2">
                    <a
                      href={`/paee?student=${selectedStudentId}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
                    >
                      <Puzzle className="w-4 h-4" />
                      Ver PAEE
                    </a>
                    <TransicaoAnoButton studentId={selectedStudentId} studentName={peiData.nome as string} />
                  </div>
                )}

                {/* Sincronização Cloud */}
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Omnisfera Cloud
                    {selectedStudentId && (
                      <PEIVersionHistory
                        studentId={selectedStudentId}
                        currentPeiData={peiData}
                        onRestore={() => window.location.reload()}
                      />
                    )}
                  </h4>

                  {selectedStudentId ? (
                    /* Estudante existente — atualizar */
                    <>
                      <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                        <strong>Atualiza os dados do PEI</strong> do estudante já salvo na nuvem.
                      </p>
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="w-full px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 mb-2"
                      >
                        {saving ? "Atualizando…" : "💾 Atualizar PEI"}
                      </button>
                    </>
                  ) : (
                    /* Novo estudante — criar */
                    <>
                      <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                        <strong>Cria um novo estudante</strong> no Supabase com todos os dados do PEI preenchidos.
                      </p>
                      <label className="flex items-start gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyConsentAccepted}
                          onChange={(e) => setPrivacyConsentAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-[10px] text-slate-600">
                          Li e aceito a{" "}
                          <Link href="/privacidade" target="_blank" className="text-sky-600 hover:underline">
                            Política de Privacidade
                          </Link>{" "}
                          para o cadastro deste estudante (LGPD).
                        </span>
                      </label>
                      <button
                        onClick={handleSave}
                        disabled={saving || !peiData.nome || !privacyConsentAccepted}
                        className="w-full px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-60 mb-2"
                      >
                        {saving ? "Criando estudante…" : "🔗 Criar Novo Estudante"}
                      </button>
                    </>
                  )}
                  {saved && (
                    <a
                      href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(peiData, null, 2))}`}
                      download={`PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`}
                      className="block w-full px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 text-center"
                    >
                      📂 BAIXAR BACKUP (.JSON)
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "estudante" && (
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
                <MedicamentosForm peiData={peiData} onAdd={addMedicamento} onRemove={removeMedicamento} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "evidencias" && (
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
        )}

        {activeTab === "rede" && (
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
        )}

        {activeTab === "mapeamento" && (
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
        )}

        {activeTab === "plano" && (
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
        )}

        {activeTab === "monitoramento" && (
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
        )}

        {activeTab === "bncc" && (
          <div className="space-y-6">
            {/* Título da aba com ícone */}
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">BNCC</h3>
            </div>
            <BNCCTab
              peiData={peiData}
              updateField={updateField}
              serie={peiData.serie || ""}
            />
          </div>
        )}

        {activeTab === "consultoria" && (
          <div className="space-y-6">
            {/* Título da aba com ícone */}
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Consultoria Pedagógica</h3>
            </div>
            <ConsultoriaTab
              peiData={peiData}
              updateField={updateField}
              serie={peiData.serie || ""}
            />
          </div>
        )}

        {activeTab === "regentes" && (
          <PEIFase2Regentes
            studentId={currentStudentId}
            studentName={peiData.nome || "Estudante"}
            studentGrade={peiData.serie || ""}
            studentClass={peiData.turma || ""}
            onSave={handleSave}
            onUpdate={handleUpdate}
            isEditing={!!selectedStudentId}
            saving={saving}
          />
        )}

        {activeTab === "consolidacao" && (
          <PEIConsolidacao
            studentId={currentStudentId}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardTab
            peiData={peiData}
            currentStudentId={currentStudentId}
            updateField={updateField}
            onSave={handleSave}
            onUpdate={handleUpdate}
            isEditing={!!selectedStudentId}
            saving={saving}
          />
        )}
      </div>

      {/* Resumo de Anexos do Estudante */}
      {peiData.nome && (
        <ResumoAnexosEstudante
          nomeEstudante={peiData.nome}
          temRelatorioPei={Boolean((peiData.ia_sugestao as string)?.trim())}
          temJornada={Boolean((peiData.ia_mapa_texto as string)?.trim())}
          nCiclosPae={0}
          pagina="PEI"
        />
      )}

    </div>
  );
}

// ==============================================================================
// COMPONENTE DASHBOARD TAB (movido para antes de ser usado)
// ==============================================================================

// DashboardTab + InteligenciaDoCaso + PeiExportButtons — extracted to ./components/PEIDashboardTab.tsx
// ConsultoriaTab + formatarTextoConsultoria — extracted to ./components/PEIConsultoriaTab.tsx
// BNCCTab — extracted to ./components/PEIBnccTab.tsx


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
      setErro("Selecione um arquivo (PDF ou imagem).");
      return;
    }
    setLoading(true);
    setErro(null);
    setExtraido(null);
    setModoRevisao(false);
    aiLoadingStart(engine || "orange", "pei");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("engine", engine);
      const res = await fetch("/api/pei/extrair-laudo", { method: "POST", body: formData });
      const data = await parseJsonResponse(res, "/api/pei/extrair-laudo");
      const resultado = {
        diagnostico: data.diagnostico || "",
        medicamentos: data.medicamentos || [],
      };
      setExtraido(resultado);
      // Preparar medicações para revisão
      if (resultado.medicamentos.length > 0) {
        setMedsRevisao(resultado.medicamentos.map((m: { nome: string; posologia?: string }) => ({ nome: m.nome || "", posologia: m.posologia || "", escola: false })));
        setModoRevisao(true);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao processar laudo.");
    } finally {
      setLoading(false);
      aiLoadingStop();
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
    <div className="space-y-3">
      {/* Layout 2 colunas [2, 1] como Streamlit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Coluna esquerda: Upload (2 colunas) */}
        <div className="md:col-span-2">
          <input
            type="file"
            accept=".pdf,application/pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              setFile(selectedFile || null);
              setExtraido(null);
              setErro(null);
              setModoRevisao(false);
              setMedsRevisao([]);
            }}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-100 file:text-sky-800 file:cursor-pointer hover:file:bg-sky-200"
          />
          {file && (
            <p className="text-xs text-emerald-600 mt-1">
              {file.type.includes("image") || file.name.match(/\.(jpg|jpeg|png|webp)$/i)
                ? "📷 Imagem selecionada — será feita leitura por IA (OCR)."
                : "📄 PDF selecionado."}
              {" "}Clique em &quot;Extrair Dados do Laudo&quot; para processar.
            </p>
          )}
        </div>
        {/* Coluna direita: Botão (1 coluna) */}
        <div className="flex items-start">
          <button
            type="button"
            onClick={extrair}
            disabled={loading || !file}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analisando…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                ✨ Extrair Dados do Laudo
              </>
            )}
          </button>
        </div>
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
        <div className="space-y-3 p-4 rounded-lg bg-white border-2 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">Dados extraídos ✅ (revise as medicações abaixo)</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Diagnóstico</div>
            <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{extraido.diagnostico || "—"}</p>
          </div>
          {extraido.medicamentos.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Medicamentos</div>
              <ul className="text-sm text-slate-700 list-disc list-inside bg-slate-50 p-2 rounded">
                {extraido.medicamentos.map((m, i) => (
                  <li key={i}>{m.nome}{m.posologia ? ` (${m.posologia})` : ""}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={aplicar}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
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
    <div className="p-4 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          checked={lista.length > 0}
          readOnly
          className="rounded"
        />
        <label className="text-sm font-medium text-slate-700">💊 O estudante faz uso contínuo de medicação?</label>
      </div>

      {/* Layout 3 colunas [3, 2, 2] como Streamlit */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3">
        <div className="md:col-span-3">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <input
            type="text"
            value={posologia}
            onChange={(e) => setPosologia(e.target.value)}
            placeholder="Posologia"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={escola}
              onChange={(e) => setEscola(e.target.checked)}
              className="rounded"
            />
            Na escola?
          </label>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (nome.trim()) {
            onAdd(nome.trim(), posologia.trim(), escola);
            setNome("");
            setPosologia("");
            setEscola(false);
          }
        }}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
      >
        Adicionar
      </button>
      {lista.length > 0 && (
        <>
          <hr className="my-3 border-slate-200" />
          <div className="space-y-2">
            {lista.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-200">
                <span className="text-sm text-slate-700">
                  💊 <strong>{m.nome || ""}</strong> ({m.posologia || ""}){m.escola ? " [NA ESCOLA]" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==============================================================================
// FUNÇÕES AUXILIARES DO DASHBOARD
// ==============================================================================

// Helper functions (calcularIdade, etc.) moved to PEIDashboardTab.tsx

function NivelSuporteRange({
  value,
  max,
  onChange,
  id,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  id: string;
}) {
  const thumbColor = value === 0 ? '#10b981' : value === 1 ? '#eab308' : value === 2 ? '#f97316' : '#ef4444';
  const rangeId = `range-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;

  useEffect(() => {
    const style = document.createElement('style');
    style.id = `style-${rangeId}`;
    style.textContent = `
      #${rangeId}::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${thumbColor};
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background 0.2s;
      }
      #${rangeId}::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${thumbColor};
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background 0.2s;
      }
      #${rangeId}::-webkit-slider-runnable-track {
        background: transparent;
        height: 8px;
      }
      #${rangeId}::-moz-range-track {
        background: transparent;
        height: 8px;
      }
    `;
    const existingStyle = document.getElementById(`style-${rangeId}`);
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);
    return () => {
      const styleEl = document.getElementById(`style-${rangeId}`);
      if (styleEl) styleEl.remove();
    };
  }, [thumbColor, rangeId]);

  // Calcular cor da barra baseada na posição do marcador
  let barColor = '#10b981'; // Verde (Autônomo - valor 0)
  if (value === 1) barColor = '#eab308'; // Amarelo (Monitorado)
  if (value === 2) barColor = '#f97316'; // Laranja (Substancial)
  if (value === 3) barColor = '#ef4444'; // Vermelho (Muito Substancial)

  return (
    <div className="relative">
      {/* Barra de fundo cinza */}
      <div
        className="absolute w-full h-2 rounded-lg pointer-events-none bg-slate-200"
      />
      {/* Barra inteira com a cor baseada na posição do marcador */}
      <div
        className="absolute w-full h-2 rounded-lg pointer-events-none transition-all duration-200"
        style={{
          background: barColor,
        }}
      />
      {/* Input range transparente sobre a barra colorida */}
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="relative w-full h-2 rounded-lg appearance-none cursor-pointer bg-transparent"
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
        id={rangeId}
      />
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

  return (
    <div className={`p-4 rounded-lg border-2 ${selecionadas.length > 0 ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200 bg-white"} transition-all`}>
      <h5 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <strong>{dominio}</strong>
        {selecionadas.length > 0 && (
          <span className="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {selecionadas.length} selecionada{selecionadas.length > 1 ? "s" : ""}
          </span>
        )}
      </h5>

      {/* Checkboxes para selecionar barreiras */}
      <div className="space-y-2 mb-4">
        {opcoes.map((b) => {
          const estaSelecionada = selecionadas.includes(b);
          return (
            <label
              key={b}
              className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${estaSelecionada
                ? "bg-emerald-50 border-2 border-emerald-300 shadow-sm"
                : "hover:bg-slate-50 border-2 border-transparent"
                }`}
            >
              <input
                type="checkbox"
                checked={estaSelecionada}
                onChange={(e) => {
                  const novas = e.target.checked
                    ? [...selecionadas, b]
                    : selecionadas.filter((item) => item !== b);
                  const novasBarreiras = { ...barreiras, [dominio]: novas };
                  updateField("barreiras_selecionadas", novasBarreiras);

                  // Remove nível de suporte se desmarcar
                  if (!e.target.checked) {
                    const chave = `${dominio}_${b}`;
                    const novosNiveis = { ...niveis };
                    delete novosNiveis[chave];
                    updateField("niveis_suporte", novosNiveis);
                  }
                }}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className={`text-sm ${estaSelecionada ? "text-emerald-900 font-medium" : "text-slate-700"}`}>
                {b}
              </span>
            </label>
          );
        })}
      </div>

      {/* Níveis de apoio por barreira selecionada */}
      {selecionadas.length > 0 && (
        <>
          <hr className="my-4 border-slate-300" />
          <h6 className="text-sm font-semibold text-slate-700 mb-2">Nível de apoio por barreira</h6>
          <p className="text-xs text-slate-500 mb-4">
            Escala: Autônomo (faz sozinho) → Monitorado → Substancial → Muito Substancial (suporte intenso/contínuo).
          </p>
          <p className="text-xs text-slate-400 mb-3">
            Autônomo: realiza sem mediação | Monitorado: precisa de checagens | Substancial: precisa de mediação frequente | Muito Substancial: precisa de suporte intenso/contínuo
          </p>
          <div className="space-y-4">
            {selecionadas.map((b) => {
              const chave = `${dominio}_${b}`;
              const nivelAtual = niveis[chave] || "Monitorado";
              const nivelIndex = NIVEIS_SUPORTE.indexOf(nivelAtual);
              return (
                <div key={b} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="mb-2">
                    <strong className="text-sm text-slate-800">{b}</strong>
                  </div>
                  <div className="space-y-2">
                    <NivelSuporteRange
                      value={nivelIndex}
                      max={NIVEIS_SUPORTE.length - 1}
                      onChange={(newIndex) => {
                        const novoNivel = NIVEIS_SUPORTE[newIndex];
                        updateField("niveis_suporte", { ...niveis, [chave]: novoNivel });
                      }}
                      id={chave}
                    />
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${nivelIndex === 0
                          ? "text-emerald-700 bg-emerald-100" // Verde
                          : nivelIndex === 1
                            ? "text-yellow-700 bg-yellow-100" // Amarelo
                            : nivelIndex === 2
                              ? "text-orange-700 bg-orange-100" // Laranja
                              : "text-red-700 bg-red-100" // Vermelho
                          }`}
                      >
                        {nivelAtual}
                      </span>
                      <div className="flex gap-1 text-[10px] text-slate-500">
                        {NIVEIS_SUPORTE.map((n, idx) => (
                          <span key={n} className={idx === nivelIndex ? "font-bold text-sky-600" : ""}>
                            {n.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {nivelAtual === "Autônomo" && "Realiza sem mediação"}
                      {nivelAtual === "Monitorado" && "Precisa de checagens"}
                      {nivelAtual === "Substancial" && "Precisa de mediação frequente"}
                      {nivelAtual === "Muito Substancial" && "Precisa de suporte intenso/contínuo"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Observações por domínio */}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-700 mb-1">Observações (opcional)</label>
        <textarea
          value={obs[dominio] || ""}
          onChange={(e) => updateField("observacoes_barreiras", { ...obs, [dominio]: e.target.value })}
          placeholder="Ex.: quando ocorre, gatilhos, o que ajuda, o que piora, estratégias que já funcionam..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}

// ==============================================================================
// BOTÃO "ENVIAR PARA PROFESSORES REGENTES"
// ==============================================================================

// EnviarParaProfessoresButton + DisciplinaStatusPanel — removed (not used in main PEI)
