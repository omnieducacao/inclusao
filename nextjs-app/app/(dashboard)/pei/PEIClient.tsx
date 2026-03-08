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
import { PEITabInicio } from "./components/PEITabInicio";
import { PEITabEstudante } from "./components/PEITabEstudante";
import { PEITabEvidencias } from "./components/PEITabEvidencias";
import { PEITabRede } from "./components/PEITabRede";
import { PEITabMapeamento } from "./components/PEITabMapeamento";
import { PEITabPlano } from "./components/PEITabPlano";
import { useStudentRealtime } from "@/hooks/useStudentRealtime";
import { PEITabMonitoramento } from "./components/PEITabMonitoramento";

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

export function TransicaoAnoButton({ studentId, studentName }: { studentId: string; studentName?: string }) {
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

import type { Student } from "@/lib/students";

type Props = {
  students: { id: string; name: string }[];
  studentId: string | null;
  studentName: string | null;
  initialPeiData: Record<string, unknown>;
  initialStudent?: Student | null;
  initialClasses: Array<{ id: string; class_group: string; grade_id: string; grades?: { name?: string; label?: string } }>;
  initialGrades: Array<{ id: string; name: string; label?: string }>;
};

export function PEIClient({
  students,
  studentId,
  studentName,
  initialPeiData,
  initialStudent,
  initialClasses,
  initialGrades,
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Use the pre-fetched static data passed from Server Component
  const schoolClasses = initialClasses || [];
  const schoolGrades = initialGrades || [];

  // Check onboarding on mount
  useEffect(() => {
    if (!localStorage.getItem('onboarding_pei')) setShowOnboarding(true);
  }, []);

  // Omni V5: Real-time Multi-User Subscription
  useStudentRealtime(currentStudentId);

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

  // ─── Computed values ─────────────────────────────────────────────
  const serie = (peiData.serie as string) || "";
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";

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
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-2xl animate-slide-up">
          <OmniLoader size={20} />
          <span className="font-medium">Salvando...</span>
        </div>
      );
    }
    if (saved) {
      return (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl animate-slide-up">
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
        <div role="alert" aria-live="assertive" className="mx-6 mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
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
          <PEITabInicio
            students={students}
            peiData={peiData} setPeiData={setPeiData}
            handleSave={handleSave} handleUpdate={handleUpdate}
            saving={saving} saved={saved}
            currentStudentId={currentStudentId}
            selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId}
            isLoadingRascunho={isLoadingRascunho} setIsLoadingRascunho={setIsLoadingRascunho}
            skipNextFetchRef={skipNextFetchRef}
            aplicarJson={aplicarJson}
            jsonPending={jsonPending} setJsonPending={setJsonPending}
            jsonFileName={jsonFileName} setJsonFileName={(v: string | null) => setJsonFileName(v ?? "")}
            studentPendingId={studentPendingId} setStudentPendingId={(v) => setStudentPendingId(v || "")}
            studentPendingName={studentPendingName} setStudentPendingName={(v) => setStudentPendingName(v || "")}
            serie={serie}
            showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding}
            privacyConsentAccepted={privacyConsentAccepted} setPrivacyConsentAccepted={setPrivacyConsentAccepted}
            progresso={progresso} tabStatuses={tabStatuses}
            erroGlobal={erroGlobal} setErroGlobal={setErroGlobal}
          />
        )}

        {activeTab === "estudante" && (
          <PEITabEstudante
            peiData={peiData} setPeiData={setPeiData}
            updateField={updateField}
            addMedicamento={() => addMedicamento("", "", false)} removeMedicamento={removeMedicamento}
            serie={serie}
            schoolClasses={schoolClasses} schoolGrades={schoolGrades}
          />
        )}

        {activeTab === "evidencias" && (
          <PEITabEvidencias
            peiData={peiData}
            updateField={updateField}
            toggleChecklist={toggleChecklist as (field: keyof import("@/lib/pei").PEIData, value: string) => void}
          />
        )}

        {activeTab === "rede" && (
          <PEITabRede peiData={peiData} updateField={updateField} />
        )}

        {activeTab === "mapeamento" && (
          <PEITabMapeamento peiData={peiData} updateField={updateField} hiperfoco={hiperfoco} />
        )}

        {activeTab === "plano" && (
          <PEITabPlano peiData={peiData} updateField={updateField} />
        )}

        {activeTab === "monitoramento" && (
          <PEITabMonitoramento peiData={peiData} updateField={updateField} />
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
              student={initialStudent}
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
            dailyLogs={(initialStudent?.daily_logs as any[]) || []}
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


export function LaudoPdfSection({
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

export function NivelSuporteRange({
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


export function BarreirasDominio({
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
