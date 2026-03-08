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
import { TransicaoAnoButton, LaudoPdfSection, MedicamentosForm } from "./components/PEILaudoSection";
import { NivelSuporteRange, BarreirasDominio } from "./components/PEIBarreiras";

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

// TransicaoAnoButton — extracted to ./components/PEILaudoSection.tsx


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
            dailyLogs={(initialStudent?.daily_logs as unknown[]) || []}
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

// LaudoPdfSection + MedicamentosForm — extracted to ./components/PEILaudoSection.tsx
// NivelSuporteRange + BarreirasDominio — extracted to ./components/PEIBarreiras.tsx
