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
import { Card, CardHeader, CardTitle, CardContent, Button } from "@omni/ds";

import { NivelSuporteRange } from "./NivelSuporteRange";
import { BarreirasDominio } from "./BarreirasDominio";
import { InteligenciaDoCaso } from "./InteligenciaDoCaso";
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
  dailyLogs,
}: {
  peiData: PEIData;
  currentStudentId: string | null;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  onSave: () => void;
  onUpdate: () => void;
  isEditing: boolean;
  saving: boolean;
  dailyLogs?: any[];
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
        <p className="text-blue-800 text-sm">Preencha os dados do estudante em Estudo de caso → Dados do estudante para ver o acompanhamento.</p>
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

  // Teste no ar (out/2026): o Acompanhamento repetia o que já está nas etapas (progresso em %, situação do PEI,
  // hiperfoco, rede de apoio, "DNA de suporte", lista de remédios, checklist LBI duas vezes). Ficou só o que
  // serve para revisar o PEI: alertas, metas, evolução, conferência com a LBI e o resumo para a família.
  const trintaDiasAtras = new Date(Date.now() - 30 * 86400000);
  const alertasDiario = (dailyLogs || []).filter((log) => log?.alerta_regente && log?.data_sessao && new Date(log.data_sessao) >= trintaDiasAtras);
  const titulo = { margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" } as const;
  const bloco = { padding: "var(--space-5)", border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", background: "var(--superficie)" } as const;

  return (
    <div className="space-y-5">
      {alertasDiario.length > 0 && (
        <div className="omni-aviso omni-aviso--atencao" role="status" style={{ maxWidth: "none" }}>
          <AlertTriangle className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__titulo">O AEE sinalizou {alertasDiario.length === 1 ? "um atendimento" : `${alertasDiario.length} atendimentos`} nos últimos 30 dias</div>
            <div className="omni-aviso__texto">Leia o diário antes de revisar o PEI.</div>
          </div>
          <div className="omni-aviso__acoes">
            {currentStudentId && <Link href={`/diario?student=${currentStudentId}`} className="omni-btn omni-btn--secundario omni-btn--pequeno">Abrir o diário</Link>}
          </div>
        </div>
      )}

      {alertaEscola && (
        <div className="omni-aviso omni-aviso--info" style={{ maxWidth: "none" }}>
          <Pill className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__titulo">Há medicação administrada na escola</div>
            <div className="omni-aviso__texto">Os detalhes estão em Estudo de caso → Dados do estudante.</div>
          </div>
          <span />
        </div>
      )}

      {/* Metas */}
      <section style={bloco} aria-labelledby="acomp-metas" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="acomp-metas" style={titulo}>Metas do PEI</h3>
          {peiData.status_meta && (
            <span className={`omni-estado omni-estado--${peiData.status_meta === "Concluído" ? "sucesso" : peiData.status_meta === "Em Progresso" ? "info" : "neutro"}`}>{peiData.status_meta}</span>
          )}
        </div>
        <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", font: "400 15px/23px var(--font-sans)" }}>
          <dt style={{ fontWeight: 700, color: "var(--tinta)" }}>Curto prazo</dt><dd style={{ margin: 0, color: "var(--tinta-2)" }}>{metas.Curto}</dd>
          <dt style={{ fontWeight: 700, color: "var(--tinta)" }}>Médio prazo</dt><dd style={{ margin: 0, color: "var(--tinta-2)" }}>{metas.Medio}</dd>
          <dt style={{ fontWeight: 700, color: "var(--tinta)" }}>Longo prazo</dt><dd style={{ margin: 0, color: "var(--tinta-2)" }}>{metas.Longo}</dd>
        </dl>
        {peiData.parecer_geral && <p className="omni-apoio" style={{ margin: 0 }}><strong>Parecer:</strong> {peiData.parecer_geral}</p>}
      </section>

      {/* Evolução na escala 0–4 (avaliação processual) */}
      <section style={bloco} aria-labelledby="acomp-evolucao" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="acomp-evolucao" style={titulo}>Evolução na escala de 0 a 4</h3>
          {currentStudentId && (
            <Link href={`/avaliacao-processual?student=${currentStudentId}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">Abrir avaliação processual</Link>
          )}
        </div>
        {evolucaoProcessualLoading ? (
          <p className="omni-apoio" style={{ margin: 0 }}>Carregando a evolução…</p>
        ) : evolucaoProcessual && evolucaoProcessual.resumo.total_registros > 0 ? (
          <ul className="flex flex-wrap gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {evolucaoProcessual.evolucao.map((e) => (
              <li key={e.disciplina} className={`omni-estado omni-estado--${e.tendencia === "melhora" ? "sucesso" : e.tendencia === "regressao" ? "atencao" : "neutro"}`}>
                {e.disciplina}{e.media_mais_recente != null ? ` · nível ${e.media_mais_recente}` : ""}
                {e.tendencia === "melhora" ? " · melhorando" : e.tendencia === "regressao" ? " · pede atenção" : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="omni-apoio" style={{ margin: 0 }}>Ainda não há avaliação processual deste estudante. Os professores registram a cada bimestre.</p>
        )}
      </section>

      {/* Conferência com a LBI */}
      <details style={bloco}>
        <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={titulo}>Conferência com a LBI</span>
          <span className={`omni-estado omni-estado--${lbiPct >= 80 ? "sucesso" : "atencao"}`}>{lbiChecks.filter((c) => c.ok).length} de {lbiChecks.length} itens</span>
          <span className="omni-apoio" style={{ fontSize: 14 }}>Lei Brasileira de Inclusão (Lei 13.146/2015)</span>
        </summary>
        <div style={{ marginTop: 12 }}>
          <LBIComplianceChecklist peiData={peiData} />
        </div>
      </details>

      <InteligenciaDoCaso
        peiData={peiData}
        studentId={currentStudentId}
        onResumoLiberado={(r) => updateField("resumo_familia" as keyof PEIData, (r ?? undefined) as never)}
      />
    </div>
  );
}

// ================================================================
// Sub-componente: Inteligência do Caso (Mapa Mental, Resumo, FAQ)
// ================================================================

