"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { calcularProgresso, getTabStatus } from "@/hooks/usePEIData";
import type { TabId } from "@/hooks/usePEIData";
import { HelpTooltip } from "@/components/HelpTooltip";
import { DiagnosticConditionalFields, LBIComplianceChecklist } from "@/components/PEIDiagnosticFields";
import { PEIFase2Regentes } from "@/components/PEIFase2Regentes";
import { PEIPlanoEnsino } from "@/components/PEIPlanoEnsino";
import { PEIAvaliacaoDiagnostica } from "@/components/PEIAvaliacaoDiagnostica";
import { PEIConsolidacao } from "@/components/PEIConsolidacao";

import { NivelSuporteRange } from "./NivelSuporteRange";
import { BarreirasDominio } from "./BarreirasDominio";
import { InteligenciaDoCaso } from "./InteligenciaDoCaso";
import { PeiExportPdfButton, PeiExportPdfOficialButton, PeiExportDocxButton } from "./PEIExportButtons";
import {
  calcularIdade,
  getHiperfocoEmoji,
  calcularComplexidadePei,
  extrairMetasEstruturadas,
  inferirComponentesImpactados,
  getProIcon
} from "../lib/dashboard-helpers";

import { peiDataToFullText } from "@/lib/pei-export";
import { ResumoAnexosEstudante } from "@/components/ResumoAnexosEstudante";
import { EngineSelector } from "@/components/EngineSelector";
import { OmniLoader } from "@/components/OmniLoader";
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
import {
  Download,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  User,
  Users,
  Radar,
  Puzzle,
  RotateCw,
  ClipboardList,
  Bot,
  FileDown,
  Info,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Send,
  Pill,
} from "lucide-react";

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


export function DashboardTab({
  peiData,
  currentStudentId,
  updateField,
  onSave,
  onUpdate,
  isEditing,
  saving,
}: {
  peiData: PEIData;
  currentStudentId: string | null;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  onSave: () => void;
  onUpdate: () => void;
  isEditing: boolean;
  saving: boolean;
}) {
  const [showLbiChecklist, setShowLbiChecklist] = React.useState(false);

  // Evolução na escala Omnisfera (Avaliação Processual)
  type EvolucaoProcessual = {
    evolucao: Array<{
      disciplina: string;
      periodos: Array<{ bimestre: number; media_nivel: number | null }>;
      tendencia: "melhora" | "estavel" | "regressao" | "sem_dados";
      media_mais_recente: number | null;
    }>;
    resumo: { total_registros: number; media_geral: number | null; tendencia: string; disciplinas: string[] };
  };
  const [evolucaoProcessual, setEvolucaoProcessual] = React.useState<EvolucaoProcessual | null>(null);
  const [evolucaoProcessualLoading, setEvolucaoProcessualLoading] = React.useState(false);
  React.useEffect(() => {
    if (!currentStudentId) {
      setEvolucaoProcessual(null);
      return;
    }
    setEvolucaoProcessualLoading(true);
    fetch(`/api/avaliacao-processual/evolucao?studentId=${encodeURIComponent(currentStudentId)}`)
      .then((r) => r.json())
      .then((data) => {
        setEvolucaoProcessual({
          evolucao: data.evolucao || [],
          resumo: data.resumo || { total_registros: 0, media_geral: null, tendencia: "sem_dados", disciplinas: [] },
        });
      })
      .catch(() => setEvolucaoProcessual(null))
      .finally(() => setEvolucaoProcessualLoading(false));
  }, [currentStudentId]);

  if (!peiData.nome) {
    return (
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-blue-800 text-sm">Preencha o estudante na aba <strong>Estudante</strong> para visualizar o dashboard.</p>
      </div>
    );
  }

  const initAvatar = peiData.nome?.[0]?.toUpperCase() || "?";
  const idadeStr = calcularIdade(peiData.nasc);
  const serieTxt = peiData.serie || "-";
  const turmaTxt = peiData.turma || "-";
  const matriculaTxt = peiData.matricula || "-";
  const vinculoTxt = currentStudentId ? "Vinculado ao Supabase ✅" : "Rascunho (não sincronizado)";

  const nPot = (Array.isArray(peiData.potencias) ? peiData.potencias : []).length;

  const barreiras = peiData.barreiras_selecionadas || {};
  const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

  const hf = peiData.hiperfoco || "-";
  const hfEmoji = getHiperfocoEmoji(peiData.hiperfoco);

  const listaMeds = Array.isArray(peiData.lista_medicamentos) ? peiData.lista_medicamentos : [];
  const nomesMeds = listaMeds.map((m) => m.nome?.trim()).filter(Boolean).join(", ");
  const alertaEscola = listaMeds.some((m) => m.escola);

  const metas = extrairMetasEstruturadas(peiData.ia_sugestao);
  const compsInferidos = inferirComponentesImpactados(peiData);
  const rede = Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : [];

  // Dados enriquecidos para os cards
  const progresso = calcularProgresso();
  const progrColor = progresso >= 80 ? "#38A169" : progresso >= 50 ? "#D69E2E" : "#E53E3E";

  const diagTxt = (peiData.diagnostico || "Não informado").toString().slice(0, 60);
  const detalhesDiag = (peiData.detalhes_diagnostico || {}) as Record<string, string | string[]>;
  const detalhesFiltrados = Object.entries(detalhesDiag).filter(
    ([, v]) => v && (typeof v === "string" ? v.trim() : (v as string[]).length > 0)
  );
  const nDetalhes = detalhesFiltrados.length;

  const habBncc = peiData.habilidades_bncc_validadas || peiData.habilidades_bncc_selecionadas || [];
  const bnccEI = peiData.bncc_ei_objetivos || [];
  const nHabBncc = (Array.isArray(habBncc) ? habBncc.length : 0) + (Array.isArray(bnccEI) ? bnccEI.length : 0);
  const bnccColor = nHabBncc > 0 ? "#38A169" : "#CBD5E0";

  // LBI Compliance
  const lbiChecks = [
    { label: "Nome", ok: !!peiData.nome },
    { label: "Serie", ok: !!peiData.serie },
    { label: "Diagnostico", ok: !!peiData.diagnostico?.toString().trim() },
    { label: "Barreiras", ok: nBar > 0 },
    { label: "Estrategias", ok: (peiData.estrategias_acesso || []).length > 0 || (peiData.estrategias_ensino || []).length > 0 },
    { label: "BNCC", ok: nHabBncc > 0 },
    { label: "Rede apoio", ok: rede.length > 0 },
    { label: "Potencialidades", ok: nPot > 0 },
  ];
  const lbiOk = lbiChecks.filter(c => c.ok).length;
  const lbiPct = Math.round((lbiOk / lbiChecks.length) * 100);
  const lbiColor = lbiPct >= 75 ? "#38A169" : lbiPct >= 50 ? "#D69E2E" : "#E53E3E";

  const nEstratTotal = (peiData.estrategias_acesso || []).length + (peiData.estrategias_ensino || []).length + (peiData.estrategias_avaliacao || []).length;
  const nivelAlfab = peiData.nivel_alfabetizacao || "";

  function calcularProgresso(): number {
    function _isFilled(value: unknown): boolean {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        return Object.keys(obj).length > 0 && Object.values(obj).some((v) => _isFilled(v));
      }
      return true;
    }

    function _abaOk(key: string): boolean {
      const d = peiData;
      if (key === "ESTUDANTE") return _isFilled(d.nome) && _isFilled(d.serie) && _isFilled(d.turma);
      if (key === "EVIDENCIAS") {
        const chk = d.checklist_evidencias || {};
        return Object.values(chk).some((v) => Boolean(v)) || _isFilled(d.orientacoes_especialistas);
      }
      if (key === "REDE") return _isFilled(d.rede_apoio) || _isFilled(d.orientacoes_especialistas) || _isFilled(d.orientacoes_por_profissional);
      if (key === "MAPEAMENTO") {
        const barreiras = d.barreiras_selecionadas || {};
        const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        return _isFilled(d.hiperfoco) || _isFilled(d.potencias) || nBar > 0;
      }
      if (key === "PLANO") return _isFilled(d.estrategias_acesso) || _isFilled(d.estrategias_ensino) || _isFilled(d.estrategias_avaliacao) || _isFilled(d.outros_acesso) || _isFilled(d.outros_ensino);
      if (key === "MONITORAMENTO") return _isFilled(d.monitoramento_data) && _isFilled(d.status_meta);
      if (key === "IA") return _isFilled(d.ia_sugestao) && (d.status_validacao_pei === "revisao" || d.status_validacao_pei === "aprovado");
      if (key === "DASH") return _isFilled(d.ia_sugestao);
      return false;
    }

    const checkpoints = ["ESTUDANTE", "EVIDENCIAS", "REDE", "MAPEAMENTO", "PLANO", "MONITORAMENTO", "IA", "DASH"];
    const done = checkpoints.filter((k) => _abaOk(k)).length;
    const total = checkpoints.length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileDown className="w-5 h-5 text-sky-600" />
        <h3 className="text-lg font-semibold text-slate-800">Dashboard e Exportação</h3>
      </div>

      {/* CSS Customizado */}
      <style jsx>{`
        .dash-hero {
          background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%);
          border-radius: 16px;
          padding: 22px 25px;
          color: white;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 16px rgba(15, 82, 186, 0.2);
        }
        .apple-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.35);
          color: white;
          font-weight: 800;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }
        .metric-card {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 12px;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          height: 72px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(0,0,0,0.07);
        }
        .css-donut {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0;
          box-shadow: inset 0 0 2px rgba(0,0,0,0.06);
        }
        .css-donut::after {
          content: "";
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
        }
        .d-val {
          position: relative;
          z-index: 10;
          font-weight: 800;
          font-size: 1rem;
          color: #1e293b;
        }
        .d-lbl {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          text-align: center;
        }
        .soft-card {
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.06);
          border-left: 4px solid;
          position: relative;
          overflow: hidden;
          z-index: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .soft-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
        }
        .sc-orange { background: linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%); border-left-color: #DD6B20; }
        .sc-blue { background: linear-gradient(135deg, #EBF8FF 0%, #E0F2FE 100%); border-left-color: #3182CE; }
        .sc-yellow { background: linear-gradient(135deg, #FFFFF0 0%, #FEFCE8 100%); border-left-color: #D69E2E; }
        .sc-cyan { background: linear-gradient(135deg, #E6FFFA 0%, #ECFDF5 100%); border-left-color: #0BC5EA; }
        .sc-green { background: linear-gradient(135deg, #F0FFF4 0%, #ECFDF5 100%); border-left-color: #38A169; }
        .sc-head {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          font-size: 0.78rem;
          margin-bottom: 6px;
          color: #1e293b;
        }
        .sc-body {
          font-size: 0.75rem;
          color: #475569;
          line-height: 1.45;
        }
        .bg-icon {
          position: absolute;
          bottom: -10px;
          right: -10px;
          font-size: 4.5rem;
          opacity: 0.06;
          pointer-events: none;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 0.8rem;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          padding-bottom: 5px;
        }
        .dna-bar-container {
          margin-bottom: 12px;
        }
        .dna-bar-flex {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 2px;
          font-weight: 600;
          color: #475569;
        }
        .dna-bar-bg {
          width: 100%;
          height: 6px;
          background-color: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        .dna-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1s ease;
        }
        .rede-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: white;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #334155;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          margin: 0 4px 4px 0;
        }
        .pulse-alert {
          animation: pulse 2s infinite;
          color: #E53E3E;
          font-weight: bold;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Hero */}
      <div className="dash-hero">
        <div className="flex items-center gap-5">
          <div className="apple-avatar">{initAvatar}</div>
          <div className="text-white">
            <h1 className="text-2xl font-bold m-0 leading-tight">{peiData.nome}</h1>
            <p className="mt-1.5 mb-0 opacity-90">
              {serieTxt} • Turma {turmaTxt} • Matrícula/RA: {matriculaTxt}
            </p>
            <p className="mt-1.5 mb-0 opacity-80 text-sm">{vinculoTxt}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-85">IDADE</div>
          <div className="text-xl font-extrabold">{idadeStr}</div>
        </div>
      </div>

      {/* Compliance LBI - Checklist retrátil */}
      <details className="mb-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer select-none flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <span>📋</span>
          <span>Checklist Compliance LBI (Lei 13.146/2015)</span>
          <span className="ml-auto text-xs text-slate-400">clique para expandir</span>
        </summary>
        <div className="px-4 pb-4">
          <LBIComplianceChecklist peiData={peiData} />
        </div>
      </details>

      {/* Exportação - Movido para antes dos cards */}
      <div className="mb-6">
        <h4 className="text-base font-semibold text-slate-800 mb-4">📤 Exportação e Sincronização</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-2">📄 PDF Dados</p>
            <PeiExportPdfButton peiData={peiData} />
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">📋 PDF Oficial (IA)</p>
            <PeiExportPdfOficialButton peiData={peiData} />
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">📝 Word</p>
            <PeiExportDocxButton peiData={peiData} />
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">💾 JSON</p>
            <a
              href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(peiData, null, 2))}`}
              download={`PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.json`}
              className="block w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-center text-sm"
            >
              Baixar JSON
            </a>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-2">☁️ {isEditing ? "Atualizar PEI" : "Criar Novo Estudante"}</p>
            {peiData.nome ? (
              isEditing ? (
                <button
                  onClick={onUpdate}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <OmniLoader size={16} />
                      Atualizando…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Atualizar PEI
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <OmniLoader size={16} />
                      Criando estudante…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Criar Novo Estudante
                    </>
                  )}
                </button>
              )
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800">Preencha o nome do estudante na aba Estudante para salvar</p>
              </div>
            )}
          </div>
        </div>
        {!peiData.ia_sugestao && (
          <p className="text-xs text-slate-500 mt-4">
            💡 Gere o Plano na aba <strong>Consultoria IA</strong> para incluir o planejamento pedagógico detalhado no documento.
          </p>
        )}

        {/* Status de Envio — link para aba Regentes */}
        {(peiData as Record<string, unknown>).fase_pei === "fase_2" ? (
          <div className="mt-4 p-3 rounded-xl flex items-center gap-3" style={{
            background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.2)",
          }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-emerald-700">✅ PEI enviado aos Professores Regentes</span>
              <p className="text-xs text-slate-500 mt-0.5">Gerencie os vínculos na aba <strong>Regentes</strong>.</p>
            </div>
          </div>
        ) : currentStudentId && (
          <div className="mt-4 p-3 rounded-xl flex items-center gap-3" style={{
            background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.2)",
          }}>
            <Send className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-indigo-700 font-medium">PEI ainda não foi enviado aos professores regentes.</span>
              <p className="text-xs text-slate-500 mt-0.5">Vá até a aba <strong>Regentes</strong> para vincular.</p>
            </div>
          </div>
        )}
      </div>

      <hr className="my-6" />

      {/* KPIs — 4 Cards Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Progresso do PEI */}
        <div className="metric-card">
          <div className="css-donut" style={{ background: `conic-gradient(${progrColor} ${progresso}%, #F3F4F6 0)` }}>
            <div className="d-val text-[0.65rem]">{progresso}%</div>
          </div>
          <div className="min-w-0">
            <div className="d-lbl mt-0">Progresso do PEI</div>
            <div className="text-[10px]" style={{ color: progrColor }}>
              {progresso >= 100 ? "Completo ✅" : `${Math.round(progresso / 12.5)}/8 abas`}
            </div>
          </div>
        </div>

        {/* 2. Diagnóstico */}
        <div className="metric-card cursor-default">
          <div className="text-[1.2rem] min-w-6 text-center">🏥</div>
          <div className="min-w-0 overflow-hidden">
            <div
              className="font-bold text-[10px] text-slate-800 leading-snug line-clamp-2 wrap-break-word"
              title={String(peiData.diagnostico || "Não informado")}
            >
              {diagTxt}
            </div>
            <div className="d-lbl mt-px">Diagnóstico{nDetalhes > 0 ? ` • ${nDetalhes} det.` : ""}</div>
          </div>
        </div>

        {/* 3. Habilidades BNCC */}
        <div className="metric-card">
          <div className="css-donut" style={{ background: `conic-gradient(${bnccColor} ${Math.min(nHabBncc * 8, 100)}%, #F3F4F6 0)` }}>
            <div className="d-val text-[0.65rem]">{nHabBncc}</div>
          </div>
          <div className="min-w-0">
            <div className="d-lbl mt-0">Habilidades BNCC</div>
            {nHabBncc === 0 && <div className="text-[10px] text-amber-600">Selecione na aba BNCC</div>}
            {nHabBncc > 0 && <div className="text-[10px] text-emerald-600">{nHabBncc} selecionada{nHabBncc > 1 ? "s" : ""}</div>}
          </div>
        </div>

        {/* 4. Compliance LBI */}
        <div className="metric-card cursor-pointer" onClick={() => setShowLbiChecklist((v) => !v)}>
          <div className="css-donut" style={{ background: `conic-gradient(${lbiColor} ${lbiPct}%, #F3F4F6 0)` }}>
            <div className="d-val text-[0.6rem]">{lbiOk}/{lbiChecks.length}</div>
          </div>
          <div className="min-w-0">
            <div className="d-lbl mt-0">Compliance LBI</div>
            <div className="text-[10px] flex items-center gap-1" style={{ color: lbiColor }}>
              {lbiPct >= 75 ? "Conforme ✅" : lbiPct >= 50 ? "Parcial ⚠️" : "Pendente ❌"}
              <span className="text-slate-400 text-[9px]">{showLbiChecklist ? "▲" : "▼"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist LBI expandido (abaixo dos KPIs) */}
      {showLbiChecklist && (
        <div className="mt-2 p-4 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-bold text-slate-700">📋 Checklist Compliance LBI (Lei 13.146/2015)</h5>
            <button onClick={() => setShowLbiChecklist(false)} className="text-xs text-slate-400 hover:text-slate-600">Fechar ✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lbiChecks.map((c) => (
              <div key={c.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${c.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                <span>{c.ok ? "✅" : "❌"}</span>
                {c.label}
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 text-right">
            {lbiPct}% de conformidade • Clique no card para fechar
          </div>
        </div>
      )}

      {/* Evolução na escala Omnisfera (Avaliação Processual) */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50/80 to-white">
        <h4 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Evolução na escala Omnisfera
        </h4>
        <p className="text-xs text-slate-600 mb-3">
          Registros bimestrais por disciplina (escala 0–4). Para registrar ou editar, use o módulo Avaliação Processual.
        </p>
        {!currentStudentId ? (
          <p className="text-sm text-slate-500">Selecione um estudante para ver a evolução.</p>
        ) : evolucaoProcessualLoading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <OmniLoader size={16} />
            Carregando evolução...
          </div>
        ) : evolucaoProcessual && evolucaoProcessual.resumo.total_registros > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {evolucaoProcessual.evolucao.map((e) => (
                <div
                  key={e.disciplina}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm shadow-sm"
                >
                  <span className="font-medium text-slate-800">{e.disciplina}</span>
                  <span className="text-slate-500">
                    {e.periodos.length} bim.{e.media_mais_recente != null ? ` · Média: ${e.media_mais_recente}` : ""}
                  </span>
                  {e.tendencia === "melhora" && <span title="Tendência: melhora"><TrendingUp className="w-4 h-4 text-emerald-600" /></span>}
                  {e.tendencia === "regressao" && <span title="Tendência: atenção"><TrendingUp className="w-4 h-4 text-red-500 rotate-180" /></span>}
                </div>
              ))}
            </div>
            <Link
              href={`/avaliacao-processual?student=${currentStudentId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Avaliação Processual
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Nenhum registro de Avaliação Processual para este estudante.</p>
            <Link
              href={currentStudentId ? `/avaliacao-processual?student=${currentStudentId}` : "/avaliacao-processual"}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Avaliação Processual
            </Link>
          </div>
        )}
      </div>

      {/* Cards Principais — 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Medicação */}
          {listaMeds.length > 0 ? (
            <div className="soft-card sc-orange">
              <div className="sc-head">
                <Pill className="w-5 h-5 text-orange-600" />
                Atenção Farmacológica
                {alertaEscola && <span className="pulse-alert">⚠️</span>}
              </div>
              <div className="sc-body flex flex-col gap-2">
                {listaMeds.map((m, i) => (
                  <div key={i} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.7)", borderRadius: "8px", borderLeft: m.escola ? "3px solid #E53E3E" : "3px solid #DD6B20" }}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[0.82rem] text-slate-800">💊 {m.nome}</span>
                      {m.escola && <span className="text-[0.65rem] bg-red-100 text-red-700 px-1.5 py-px rounded-full font-bold">Escola</span>}
                    </div>
                    {m.posologia && <div className="text-xs text-slate-500 mt-0.5">Posologia: {m.posologia}</div>}
                    {m.escola && <div className="text-[0.72rem] text-red-600 font-semibold mt-[3px]">🚨 Administração na escola necessária</div>}
                  </div>
                ))}

                {/* Pontos de Atenção */}
                <div className="mt-1 px-2.5 py-2 bg-orange-50/60 rounded-lg">
                  <div className="font-bold text-[0.78rem] text-orange-800 mb-1">⚠️ Pontos de Atenção:</div>
                  <ul className="text-[0.72rem] text-amber-900 m-0 pl-4 leading-relaxed">
                    <li>Observar sinais de <strong>sonolência</strong> ou <strong>agitação incomum</strong> em sala</li>
                    <li>Monitorar mudanças de <strong>apetite</strong> e <strong>humor</strong> ao longo do dia</li>
                    {alertaEscola && <li><strong>Garantir horário correto</strong> de administração na escola</li>}
                    <li>Comunicar à família qualquer <strong>alteração comportamental</strong></li>
                    <li>Registrar observações no <strong>Diário de Bordo</strong></li>
                  </ul>
                </div>
              </div>
              <div className="bg-icon">💊</div>
            </div>
          ) : (
            <div className="soft-card sc-green">
              <div className="sc-head">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Medicação
              </div>
              <div className="sc-body">Nenhuma medicação informada.</div>
              <div className="bg-icon">✅</div>
            </div>
          )}

          {/* DNA do Estudante — Hiperfoco + Potencialidades + Nível Alfabetização */}
          <div className="soft-card sc-blue">
            <div className="sc-head">
              <Sparkles className="w-5 h-5 text-blue-600" />
              DNA do Estudante
            </div>
            <div className="sc-body">
              {hf !== "-" && (
                <div className="mb-2">
                  <span className="text-lg mr-1">{hfEmoji}</span>
                  <strong>Hiperfoco:</strong> {hf}
                </div>
              )}
              {nivelAlfab && nivelAlfab !== "Nao se aplica (Educacao Infantil)" && (
                <div className="mb-2">
                  <strong>Alfabetização:</strong> {nivelAlfab}
                </div>
              )}
              {nPot > 0 ? (
                <div>
                  <strong>Potencialidades ({nPot}):</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(peiData.potencias as string[] || []).slice(0, 5).map((p: string) => (
                      <span key={p} className="rede-chip" style={{ fontSize: "0.75rem", padding: "2px 8px", borderColor: "#3182CE", color: "#2B6CB0" }}>
                        {p}
                      </span>
                    ))}
                    {nPot > 5 && <span className="text-xs text-blue-500">+{nPot - 5} mais</span>}
                  </div>
                </div>
              ) : (
                <div className="opacity-60">Preencha potencialidades na aba Mapeamento</div>
              )}
            </div>
            <div className="bg-icon">🧬</div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cronograma de Metas + Status */}
          <div className="soft-card sc-yellow">
            <div className="sc-head">
              <FileText className="w-5 h-5 text-yellow-600" />
              Cronograma de Metas
              {peiData.status_meta && (
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                  background: peiData.status_meta === "Concluído" ? "#C6F6D5" : peiData.status_meta === "Em Progresso" ? "#FEFCBF" : "#FED7D7",
                  color: peiData.status_meta === "Concluído" ? "#276749" : peiData.status_meta === "Em Progresso" ? "#975A16" : "#9B2C2C",
                }}>{peiData.status_meta}</span>
              )}
            </div>
            <div className="sc-body">
              <div className="meta-row">
                <span className="text-xl">🏁</span>
                <strong>Curto:</strong> {metas.Curto}
              </div>
              <div className="meta-row">
                <span className="text-xl">🧗</span>
                <strong>Médio:</strong> {metas.Medio}
              </div>
              <div className="meta-row">
                <span className="text-xl">🏔️</span>
                <strong>Longo:</strong> {metas.Longo}
              </div>
              {peiData.parecer_geral && (
                <div className="mt-2 text-xs p-2 rounded bg-yellow-50 border border-yellow-200">
                  <strong>Parecer:</strong> {peiData.parecer_geral}
                </div>
              )}
            </div>
            <div className="bg-icon">🏁</div>
          </div>

          {/* Rede de Apoio + Estratégias */}
          <div className="soft-card sc-cyan">
            <div className="sc-head">
              <Users className="w-5 h-5 text-cyan-400" />
              Rede de Apoio & Estratégias
            </div>
            <div className="sc-body">
              {rede.length > 0 ? (
                <div className="mb-2">
                  {rede.map((p) => (
                    <span key={p} className="rede-chip">
                      {getProIcon(p)} {p}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mb-2 opacity-60">Sem rede cadastrada.</div>
              )}
              {nEstratTotal > 0 && (
                <div className="mt-2 pt-2 border-t border-cyan-200">
                  <strong className="text-xs">Estratégias selecionadas:</strong>
                  <div className="flex gap-3 mt-1">
                    {(peiData.estrategias_acesso || []).length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        🔓 Acesso: {(peiData.estrategias_acesso || []).length}
                      </span>
                    )}
                    {(peiData.estrategias_ensino || []).length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        📚 Ensino: {(peiData.estrategias_ensino || []).length}
                      </span>
                    )}
                    {(peiData.estrategias_avaliacao || []).length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        📝 Avaliação: {(peiData.estrategias_avaliacao || []).length}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {compsInferidos.length > 0 && (
                <div className="mt-2 pt-2 border-t border-cyan-200">
                  <strong className="text-xs text-red-600">Componentes críticos:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {compsInferidos.map((c) => (
                      <span key={c} className="rede-chip" style={{ borderColor: "#FC8181", color: "#C53030", fontSize: "0.75rem", padding: "2px 8px" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-icon">🤝</div>
          </div>
        </div>
      </div>

      {/* DNA de Suporte */}
      <div>
        <h4 className="text-base font-semibold text-slate-800 mb-4">🧬 DNA de Suporte</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(LISTAS_BARREIRAS).map((area) => {
            const qtd = (Array.isArray(barreiras[area]) ? barreiras[area] : []).length;
            const val = Math.min(qtd * 20, 100);
            let color = "#3182CE";
            if (val > 40) color = "#DD6B20";
            if (val > 70) color = "#E53E3E";
            return (
              <div key={area} className="dna-bar-container">
                <div className="dna-bar-flex">
                  <span>{area}</span>
                  <span>{qtd} barreiras</span>
                </div>
                <div className="dna-bar-bg">
                  <div className="dna-bar-fill" style={{ width: `${val}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🤖 INTELIGÊNCIA DO CASO                                      */}
      {/* ============================================================ */}
      <InteligenciaDoCaso peiData={peiData} />
    </div>
  );
}

// ================================================================
// Sub-componente: Inteligência do Caso (Mapa Mental, Resumo, FAQ)
// ================================================================

