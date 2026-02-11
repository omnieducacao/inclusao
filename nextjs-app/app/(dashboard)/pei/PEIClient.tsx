"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { HelpTooltip } from "@/components/HelpTooltip";
import { PEIVersionHistory, createPEISnapshot } from "@/components/PEIVersionHistory";

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
  Loader2,
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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(studentId || searchParams?.get("student") || null);
  const [jsonPending, setJsonPending] = useState<PEIData | null>(null);
  const [jsonFileName, setJsonFileName] = useState<string>("");
  const [studentPendingId, setStudentPendingId] = useState<string | null>(null);
  const [studentPendingName, setStudentPendingName] = useState<string>("");
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);
  const [isLoadingRascunho, setIsLoadingRascunho] = useState(false);
  const { markDirty, markClean } = useUnsavedChanges();

  const currentStudentId = selectedStudentId;

  function updateField<K extends keyof PEIData>(key: K, value: PEIData[K]) {
    setPeiData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    markDirty();
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

  // ==============================================================================
  // FUNÇÕES DE PROGRESSO (equivalente ao Streamlit)
  // ==============================================================================
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

    if (key === "INICIO") {
      return _isFilled(d.nome);
    }

    if (key === "ESTUDANTE") {
      return _isFilled(d.nome) && _isFilled(d.serie) && _isFilled(d.turma);
    }

    if (key === "EVIDENCIAS") {
      const chk = d.checklist_evidencias || {};
      return Object.values(chk).some((v) => Boolean(v)) || _isFilled(d.orientacoes_especialistas);
    }

    if (key === "REDE") {
      return _isFilled(d.rede_apoio) || _isFilled(d.orientacoes_especialistas) || _isFilled(d.orientacoes_por_profissional);
    }

    if (key === "MAPEAMENTO") {
      const barreiras = d.barreiras_selecionadas || {};
      const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      return _isFilled(d.hiperfoco) || _isFilled(d.potencias) || nBar > 0;
    }

    if (key === "PLANO") {
      return _isFilled(d.estrategias_acesso) || _isFilled(d.estrategias_ensino) || _isFilled(d.estrategias_avaliacao) ||
        _isFilled(d.outros_acesso) || _isFilled(d.outros_ensino);
    }

    if (key === "MONITORAMENTO") {
      return _isFilled(d.monitoramento_data) && _isFilled(d.status_meta);
    }

    if (key === "IA") {
      return _isFilled(d.ia_sugestao) && (d.status_validacao_pei === "revisao" || d.status_validacao_pei === "aprovado");
    }

    if (key === "DASH") {
      return _isFilled(d.ia_sugestao);
    }

    return false;
  }

  function calcularProgresso(): number {
    const checkpoints = ["ESTUDANTE", "EVIDENCIAS", "REDE", "MAPEAMENTO", "PLANO", "MONITORAMENTO", "IA", "DASH"];
    const done = checkpoints.filter((k) => _abaOk(k)).length;
    const total = checkpoints.length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  function RenderProgresso() {
    const p = Math.max(0, Math.min(100, calcularProgresso()));
    // Cor única baseada no progresso (sem gradiente)
    let barColor = '#FBBF24'; // Amarelo (0-49%)
    if (p >= 50) barColor = '#60A5FA'; // Azul (50-99%)
    if (p >= 100) barColor = '#34D399'; // Verde (100%)

    return (
      <div className="mb-4">
        <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          {/* Barra de progresso com animação - cor única */}
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{
              width: `${p}%`,
              backgroundColor: barColor,
              boxShadow: p > 0 ? `0 0 8px ${barColor}40` : 'none'
            }}
          >
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSave() {
    // Criar um novo estudante com os dados do PEI
    if (!peiData.nome || !peiData.nome.toString().trim()) {
      alert("O nome do estudante é obrigatório. Preencha o campo 'Nome' na aba Estudante.");
      return;
    }

    setSaving(true);
    setErroGlobal(null);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: peiData.nome.toString().trim(),
          grade: peiData.serie || null,
          class_group: peiData.turma || null,
          diagnosis: peiData.diagnostico || null,
          pei_data: peiData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const novoEstudanteId = data.student?.id;

        if (novoEstudanteId) {
          // Atualizar o ID do estudante selecionado
          setSelectedStudentId(novoEstudanteId);
          // Atualizar a URL
          const url = new URL(window.location.href);
          url.searchParams.set("student", novoEstudanteId);
          window.history.pushState({}, "", url.toString());

          setSaved(true);
          markClean();
          setErroGlobal(null);
          // Auto-create version snapshot
          createPEISnapshot(novoEstudanteId, `Criação — ${new Date().toLocaleDateString("pt-BR")}`);
          setTimeout(() => setSaved(false), 3000);
          alert(`✅ Novo estudante "${peiData.nome}" criado e PEI salvo na nuvem com sucesso! ☁️`);
        } else {
          throw new Error("ID do estudante não retornado");
        }
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setErroGlobal(data.error || `Erro ao criar estudante (HTTP ${res.status})`);
          alert(`Erro ao criar estudante: ${data.error || `HTTP ${res.status}`}`);
        } else {
          setErroGlobal(`Erro ao criar estudante (HTTP ${res.status})`);
          alert(`Erro ao criar estudante: HTTP ${res.status}`);
        }
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro ao criar estudante";
      setErroGlobal(mensagem);
      console.error("Erro ao criar estudante:", err);
      alert(`Erro ao criar estudante: ${mensagem}`);
    } finally {
      setSaving(false);
    }
  }

  // Componente de feedback de salvamento
  function SaveFeedback() {
    if (saving) {
      return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-2xl animate-slide-up">
          <Loader2 className="w-5 h-5 animate-spin" />
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

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
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

  // Carregar dados do estudante quando selecionado (apenas se não for modo rascunho)
  useEffect(() => {
    // Não executar se estamos carregando como rascunho ou se temos studentPendingId
    if (isLoadingRascunho) {
      console.log("useEffect ignorado - isLoadingRascunho está ativo");
      return;
    }

    if (studentPendingId) {
      console.log("useEffect ignorado - studentPendingId está definido");
      return;
    }

    if (selectedStudentId && selectedStudentId !== studentId) {
      console.log("useEffect executando para selectedStudentId:", selectedStudentId);
      setErroGlobal(null);

      // Verificar se o estudante está na lista primeiro
      const studentFromList = students.find((s) => s.id === selectedStudentId);
      if (!studentFromList) {
        setErroGlobal(null); // Não mostrar erro, apenas não fazer nada
        return;
      }

      // Buscar dados do estudante selecionado
      const url = `/api/students/${selectedStudentId}`;
      fetch(url)
        .then(async (res) => {
          if (!res.ok) {
            // Estudante está na lista mas não foi encontrado na API
            // Isso é normal - pode não ter pei_data ainda
            setPeiData({} as PEIData);
            setSaved(false);
            setErroGlobal(null);
            return null;
          }
          try {
            return await parseJsonResponse(res, url);
          } catch (e) {
            // Erro ao parsear JSON
            setPeiData({} as PEIData);
            setSaved(false);
            setErroGlobal(null);
            return null;
          }
        })
        .then((data) => {
          if (!data) {
            // Já tratado acima
            return;
          }
          if (data.pei_data) {
            setPeiData(data.pei_data as PEIData);
            setSaved(false);
          } else {
            // Estudante encontrado mas sem pei_data
            setPeiData({} as PEIData);
            setSaved(false);
          }
          setErroGlobal(null);
        })
        .catch((err) => {
          // Erro de rede ou outro erro
          console.error("Erro ao carregar dados do estudante:", err);
          // Não mostrar erro se o estudante estiver na lista
          // Apenas limpar dados
          setPeiData({} as PEIData);
          setSaved(false);
          setErroGlobal(null);
        });
    }
  }, [selectedStudentId, studentId, students, studentPendingId, isLoadingRascunho]);

  // Debug: Monitorar mudanças em peiData
  useEffect(() => {
    console.log("🔍 peiData mudou. Campos:", Object.keys(peiData).length, "Chaves:", Object.keys(peiData).slice(0, 5));
  }, [peiData]);

  // Aplicar JSON pendente automaticamente quando jsonPending mudar
  useEffect(() => {
    if (jsonPending) {
      console.log("📥 jsonPending detectado, aplicando JSON...");
      console.log("Campos no jsonPending:", Object.keys(jsonPending).length);
      // Usar setTimeout para garantir que o estado foi atualizado
      setTimeout(() => {
        setPeiData(jsonPending);
        setSelectedStudentId(null); // JSON local não cria vínculo com nuvem
        setJsonPending(null);
        setJsonFileName("");
        setSaved(false);
        setErroGlobal(null);

        // Limpar parâmetro student da URL para modo rascunho
        const url = new URL(window.location.href);
        url.searchParams.delete("student");
        window.history.pushState({}, "", url.toString());

        console.log("✅ JSON aplicado! peiData deve ter", Object.keys(jsonPending).length, "campos agora");
      }, 0);
    }
  }, [jsonPending]);

  // Aplicar JSON pendente
  function aplicarJson() {
    if (jsonPending) {
      setPeiData(jsonPending);
      setSelectedStudentId(null); // JSON local não cria vínculo com nuvem
      setJsonPending(null);
      setJsonFileName("");
      setSaved(false);
      setErroGlobal(null);

      // Limpar parâmetro student da URL para modo rascunho
      const url = new URL(window.location.href);
      url.searchParams.delete("student");
      window.history.pushState({}, "", url.toString());
    }
  }

  // Função para verificar status de cada aba
  function getTabStatus(tabId: TabId): "complete" | "in-progress" | "empty" {
    const d = peiData;

    switch (tabId) {
      case "inicio":
        return _isFilled(d.nome) ? "complete" : "empty";
      case "estudante":
        return _isFilled(d.nome) && _isFilled(d.serie) && _isFilled(d.turma) ? "complete" : _isFilled(d.nome) ? "in-progress" : "empty";
      case "evidencias":
        const chk = d.checklist_evidencias || {};
        const hasEvidencias = Object.values(chk).some((v) => v === true);
        return hasEvidencias ? "complete" : "empty";
      case "rede":
        const rede = Array.isArray(d.rede_apoio) ? d.rede_apoio : [];
        return rede.length > 0 ? "complete" : "empty";
      case "mapeamento":
        const barreiras = d.barreiras_selecionadas || {};
        const hasBarreiras = Object.values(barreiras).some((arr) => Array.isArray(arr) && arr.length > 0);
        return hasBarreiras ? "complete" : "empty";
      case "plano":
        const temEstrategias = _isFilled(d.estrategias_acesso) || _isFilled(d.estrategias_ensino) || _isFilled(d.estrategias_avaliacao) ||
          _isFilled(d.outros_acesso) || _isFilled(d.outros_ensino);
        return temEstrategias ? "complete" : "empty";
      case "monitoramento":
        return _isFilled(d.parecer_geral) ? "complete" : "empty";
      case "bncc":
        const habs = Array.isArray(d.habilidades_bncc_selecionadas) ? d.habilidades_bncc_selecionadas : [];
        return habs.length > 0 ? "complete" : "empty";
      case "consultoria":
        return _isFilled(d.status_validacao_pei) && d.status_validacao_pei !== "rascunho" ? "complete" : "empty";
      case "dashboard":
        return calcularProgresso() >= 50 ? "complete" : calcularProgresso() > 0 ? "in-progress" : "empty";
      default:
        return "empty";
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ border: '1px solid rgba(226,232,240,0.6)' }}>
      {/* Barra de Progresso Global */}
      <div className="px-6 pt-4 pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-600">Progresso do PEI</span>
          </div>
          <span className="text-sm font-bold text-slate-700">{calcularProgresso()}%</span>
        </div>
        <RenderProgresso />
      </div>

      {/* Mensagem de Erro Global */}
      {erroGlobal && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-red-800 font-semibold text-sm">Erro ao processar</p>
            <p className="text-red-700 text-sm mt-1 break-words">{erroGlobal}</p>
          </div>
          <button
            onClick={() => setErroGlobal(null)}
            className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
            aria-label="Fechar erro"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navegação de Abas com Indicadores Visuais */}
      <div className="flex gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto scrollbar-hide" style={{ border: '1px solid rgba(226,232,240,0.6)' }}>
        {TABS.map((t) => {
          const status = getTabStatus(t.id);
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`group relative px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[13px] font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-xl transition-all duration-200 ${isActive
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
            >
              {/* Indicador de Status */}
              <div className={`w-2 h-2 rounded-full transition-all duration-200 flex-shrink-0 ${status === "complete"
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
      <div className="px-4 sm:px-6 py-3 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
          <div className="space-y-4 max-w-6xl mx-auto">
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
                        console.log("StudentSelector onChange chamado com id:", id);
                        setErroGlobal(null);
                        if (id) {
                          // Verificar se o estudante está na lista primeiro
                          const studentFromList = students.find((s) => s.id === id);
                          if (!studentFromList) {
                            setErroGlobal("Estudante não encontrado na lista");
                            console.error("Estudante não encontrado:", id);
                            return;
                          }
                          // Apenas armazenar como pendente - não carregar ainda
                          console.log("Armazenando estudante como pendente:", studentFromList.name);
                          setStudentPendingId(id);
                          setStudentPendingName(studentFromList.name);
                          // Limpar URL
                          const url = new URL(window.location.href);
                          url.searchParams.delete("student");
                          window.history.pushState({}, "", url.toString());
                        } else {
                          // Limpar dados quando nenhum estudante está selecionado
                          console.log("Limpando seleção de estudante");
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
                              console.log("=== BOTÃO CARREGAR CLICADO ===");
                              console.log("studentPendingId:", studentPendingId);
                              console.log("studentPendingName:", studentPendingName);

                              // Usar o valor atual diretamente
                              const idToLoad = studentPendingId;
                              console.log("idToLoad:", idToLoad);
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

                              console.log("Buscando JSON do PEI do Supabase para estudante:", idToLoad);
                              console.log("Estudante da lista:", studentFromList);
                              setIsLoadingRascunho(true);
                              try {
                                // Tentar primeiro a API principal
                                let apiUrl = `/api/students/${idToLoad}`;
                                console.log("Tentando API principal:", apiUrl);
                                let res = await fetch(apiUrl);
                                console.log("Resposta da API principal:", res.status, res.ok);

                                // Se falhar, tentar a rota alternativa que busca apenas pei_data
                                if (!res.ok) {
                                  console.log("API principal falhou, tentando rota alternativa...");
                                  apiUrl = `/api/students/${idToLoad}/pei-data`;
                                  res = await fetch(apiUrl);
                                  console.log("Resposta da API alternativa:", res.status, res.ok);
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
                                console.log("✅ Dados recebidos da API:", data);

                                // A rota alternativa retorna { pei_data: ... }, a principal retorna { pei_data: ..., id: ..., name: ... }
                                // Pegar o pei_data de qualquer uma das rotas
                                const peiDataJson = data.pei_data;
                                console.log("Tem pei_data?", !!peiDataJson);

                                if (peiDataJson && typeof peiDataJson === 'object' && !Array.isArray(peiDataJson)) {
                                  // Usar a MESMA lógica que funciona para JSON local
                                  // Colocar em jsonPending e usar aplicarJson()
                                  const campos = Object.keys(peiDataJson);
                                  console.log("✅ JSON encontrado no Supabase com", campos.length, "campos");
                                  console.log("Primeiros campos:", campos.slice(0, 10));

                                  // Criar cópia profunda do JSON (mesmo que FileReader faz)
                                  const jsonCopiado = JSON.parse(JSON.stringify(peiDataJson)) as PEIData;

                                  // Colocar em jsonPending (mesmo que o upload de arquivo faz)
                                  // O useEffect vai detectar e aplicar automaticamente
                                  setJsonPending(jsonCopiado);
                                  setJsonFileName(`PEI_${studentFromList.name}_do_Supabase.json`);

                                  // Limpar estados de seleção
                                  setStudentPendingId(null);
                                  setStudentPendingName("");
                                  setIsLoadingRascunho(false);

                                  console.log("✅ JSON colocado em jsonPending, useEffect vai aplicar automaticamente");
                                } else {
                                  // Estudante encontrado mas sem pei_data
                                  console.log("⚠️ Estudante encontrado mas sem pei_data no Supabase");
                                  console.log("pei_data recebido:", peiDataJson);
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

                {/* Sincronização Cloud */}
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Omnisfera Cloud
                    {selectedStudentId && (
                      <PEIVersionHistory
                        studentId={selectedStudentId}
                        onRestore={() => window.location.reload()}
                      />
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                    <strong>Cria um novo estudante</strong> no Supabase com todos os dados do PEI preenchidos. O estudante será salvo na nuvem junto com o PEI completo.
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving || !peiData.nome}
                    className="w-full px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-60 mb-2"
                  >
                    {saving ? "Criando estudante…" : "🔗 Criar Novo Estudante"}
                  </button>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
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
                      EI: { nome: "Educação Infantil", cor: "#4299e1", emoji: "👶" },
                      EFI: { nome: "Ensino Fundamental Anos Iniciais", cor: "#48bb78", emoji: "📚" },
                      EFII: { nome: "Ensino Fundamental Anos Finais", cor: "#ed8936", emoji: "🎓" },
                      EM: { nome: "Ensino Médio / EJA", cor: "#9f7aea", emoji: "🎯" },
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
                  <input
                    type="text"
                    value={peiData.turma || ""}
                    onChange={(e) => updateField("turma", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                    placeholder="Ex: A"
                  />
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
                  EI: { nome: "Educação Infantil", cor: "#4299e1", desc: "Foco: Campos de Experiência (BNCC) e rotina estruturante." },
                  EFI: { nome: "Ensino Fundamental Anos Iniciais (EFAI)", cor: "#48bb78", desc: "Foco: alfabetização, numeracia e consolidação de habilidades basais." },
                  EFII: { nome: "Ensino Fundamental Anos Finais (EFAF)", cor: "#ed8936", desc: "Foco: autonomia, funções executivas, organização e aprofundamento conceitual." },
                  EM: { nome: "Ensino Médio / EJA", cor: "#9f7aea", desc: "Foco: projeto de vida, áreas do conhecimento e estratégias de estudo." },
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
                  setSaved(false);
                }}
              />
            </div>

            <hr />

            {/* Contexto Clínico */}
            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-3">Contexto Clínico</h4>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">Diagnóstico <HelpTooltip fieldId="pei-diagnostico" /></label>
                <input
                  type="text"
                  value={peiData.diagnostico || ""}
                  onChange={(e) => updateField("diagnostico", e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
                  placeholder="Nunca em materiais do estudante."
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
          <div className="space-y-6 max-w-4xl">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">Hiperfoco (se houver) <HelpTooltip fieldId="pei-hiperfoco" /></label>
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
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-300 shadow-sm">
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
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-300 shadow-sm">
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
                      <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 shadow-sm">
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
          <div className="space-y-6 max-w-4xl">
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

        {activeTab === "dashboard" && (
          <DashboardTab
            peiData={peiData}
            currentStudentId={currentStudentId}
            updateField={updateField}
            onSave={handleSave}
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
function DashboardTab({
  peiData,
  currentStudentId,
  updateField,
  onSave,
  saving,
}: {
  peiData: PEIData;
  currentStudentId: string | null;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  onSave: () => void;
  saving: boolean;
}) {
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
  const colorPot = nPot > 0 ? "#38A169" : "#CBD5E0";
  const potPercent = Math.min(nPot * 10, 100);

  const barreiras = peiData.barreiras_selecionadas || {};
  const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  const colorBar = nBar > 5 ? "#E53E3E" : "#DD6B20";
  const barPercent = Math.min(nBar * 5, 100);

  const hf = peiData.hiperfoco || "-";
  const hfEmoji = getHiperfocoEmoji(peiData.hiperfoco);

  const [txtComp, bgComp, txtCompColor] = calcularComplexidadePei(peiData);

  const listaMeds = Array.isArray(peiData.lista_medicamentos) ? peiData.lista_medicamentos : [];
  const nomesMeds = listaMeds.map((m) => m.nome?.trim()).filter(Boolean).join(", ");
  const alertaEscola = listaMeds.some((m) => m.escola);

  const metas = extrairMetasEstruturadas(peiData.ia_sugestao);
  const compsInferidos = inferirComponentesImpactados(peiData);
  const rede = Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : [];

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
          padding: 25px;
          color: white;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(15, 82, 186, 0.15);
        }
        .apple-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.4);
          color: white;
          font-weight: 800;
          font-size: 1.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .metric-card {
          background: white;
          border-radius: 16px;
          padding: 15px;
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 140px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        .css-donut {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .css-donut::after {
          content: "";
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: white;
        }
        .d-val {
          position: relative;
          z-index: 10;
          font-weight: 800;
          font-size: 1.2rem;
          color: #2D3748;
        }
        .d-lbl {
          font-size: 0.75rem;
          font-weight: 700;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .comp-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .soft-card {
          border-radius: 12px;
          padding: 20px;
          min-height: 220px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.05);
          border-left: 5px solid;
          position: relative;
          overflow: hidden;
          z-index: 0;
        }
        .sc-orange { background-color: #FFF5F5; border-left-color: #DD6B20; }
        .sc-blue { background-color: #EBF8FF; border-left-color: #3182CE; }
        .sc-yellow { background-color: #FFFFF0; border-left-color: #D69E2E; }
        .sc-cyan { background-color: #E6FFFA; border-left-color: #0BC5EA; }
        .sc-green { background-color: #F0FFF4; border-left-color: #38A169; }
        .sc-head {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 0.95rem;
          margin-bottom: 15px;
          color: #2D3748;
        }
        .sc-body {
          font-size: 0.85rem;
          color: #4A5568;
          line-height: 1.5;
          flex-grow: 1;
        }
        .bg-icon {
          position: absolute;
          bottom: -10px;
          right: -10px;
          font-size: 5rem;
          opacity: 0.08;
          pointer-events: none;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding-bottom: 5px;
        }
        .dna-bar-container {
          margin-bottom: 15px;
        }
        .dna-bar-flex {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 3px;
          font-weight: 600;
          color: #4A5568;
        }
        .dna-bar-bg {
          width: 100%;
          height: 8px;
          background-color: #E2E8F0;
          border-radius: 4px;
          overflow: hidden;
        }
        .dna-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease;
        }
        .rede-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #2D3748;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          border: 1px solid #E2E8F0;
          margin: 0 5px 5px 0;
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

      {/* Exportação - Movido para antes dos cards */}
      <div className="mb-6">
        <h4 className="text-base font-semibold text-slate-800 mb-4">📤 Exportação e Sincronização</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-2">📄 PDF Oficial</p>
            <PeiExportPdfButton peiData={peiData} />
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
            <p className="text-xs text-slate-600 mb-2">☁️ Criar Novo Estudante</p>
            {peiData.nome ? (
              <button
                onClick={onSave}
                disabled={saving}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando estudante…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Criar Novo Estudante
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800">Preencha o nome do estudante na aba Estudante para criar</p>
              </div>
            )}
          </div>
        </div>
        {!peiData.ia_sugestao && (
          <p className="text-xs text-slate-500 mt-4">
            💡 Gere o Plano na aba <strong>Consultoria IA</strong> para incluir o planejamento pedagógico detalhado no documento.
          </p>
        )}
      </div>

      <hr className="my-6" />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="css-donut" style={{ background: `conic-gradient(${colorPot} ${potPercent}%, #F3F4F6 0)` }}>
            <div className="d-val">{nPot}</div>
          </div>
          <div className="d-lbl">Potencialidades</div>
        </div>
        <div className="metric-card">
          <div className="css-donut" style={{ background: `conic-gradient(${colorBar} ${barPercent}%, #F3F4F6 0)` }}>
            <div className="d-val">{nBar}</div>
          </div>
          <div className="d-lbl">Barreiras</div>
        </div>
        <div className="metric-card">
          <div className="text-4xl mb-2">{hfEmoji}</div>
          <div className="font-extrabold text-lg text-slate-800 my-2">{hf}</div>
          <div className="d-lbl">Hiperfoco</div>
        </div>
        <div className="metric-card" style={{ backgroundColor: bgComp, borderColor: txtCompColor }}>
          <div className="comp-icon-box">
            <AlertTriangle className="w-8 h-8" style={{ color: txtCompColor }} />
          </div>
          <div className="font-extrabold text-lg my-1" style={{ color: txtCompColor }}>{txtComp}</div>
          <div className="d-lbl" style={{ color: txtCompColor }}>Nível de Atenção (Execução)</div>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Medicação */}
          {listaMeds.length > 0 ? (
            <div className="soft-card sc-orange">
              <div className="sc-head">
                <Pill className="w-5 h-5" style={{ color: "#DD6B20" }} />
                Atenção Farmacológica
                {alertaEscola && <span className="pulse-alert">⚠️</span>}
              </div>
              <div className="sc-body">
                <strong>Uso Contínuo:</strong> {nomesMeds || "Medicação cadastrada."}
                {alertaEscola && (
                  <div className="mt-1 text-red-700 font-bold text-xs">🚨 ATENÇÃO: ADMINISTRAÇÃO NA ESCOLA NECESSÁRIA</div>
                )}
              </div>
              <div className="bg-icon">💊</div>
            </div>
          ) : (
            <div className="soft-card sc-green">
              <div className="sc-head">
                <CheckCircle2 className="w-5 h-5" style={{ color: "#38A169" }} />
                Medicação
              </div>
              <div className="sc-body">Nenhuma medicação informada.</div>
              <div className="bg-icon">✅</div>
            </div>
          )}

          {/* Cronograma de Metas */}
          <div className="soft-card sc-yellow">
            <div className="sc-head">
              <FileText className="w-5 h-5" style={{ color: "#D69E2E" }} />
              Cronograma de Metas
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
            </div>
            <div className="bg-icon">🏁</div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Radar Curricular */}
          {compsInferidos.length > 0 ? (
            <div className="soft-card sc-orange" style={{ borderLeftColor: "#FC8181", backgroundColor: "#FFF5F5" }}>
              <div className="sc-head">
                <Radar className="w-5 h-5" style={{ color: "#C53030" }} />
                Radar Curricular (Automático)
              </div>
              <div className="sc-body mb-2">
                Componentes que exigem maior flexibilização (baseado nas barreiras):
              </div>
              <div>
                {compsInferidos.map((c) => (
                  <span key={c} className="rede-chip" style={{ borderColor: "#FC8181", color: "#C53030" }}>
                    {c}
                  </span>
                ))}
              </div>
              <div className="bg-icon">🎯</div>
            </div>
          ) : (
            <div className="soft-card sc-blue">
              <div className="sc-head">
                <Radar className="w-5 h-5" style={{ color: "#3182CE" }} />
                Radar Curricular
              </div>
              <div className="sc-body">Nenhum componente específico marcado como crítico.</div>
              <div className="bg-icon">🎯</div>
            </div>
          )}

          {/* Rede de Apoio */}
          <div className="soft-card sc-cyan">
            <div className="sc-head">
              <Users className="w-5 h-5" style={{ color: "#0BC5EA" }} />
              Rede de Apoio
            </div>
            <div className="sc-body">
              {rede.length > 0 ? (
                rede.map((p) => (
                  <span key={p} className="rede-chip">
                    {getProIcon(p)} {p}
                  </span>
                ))
              ) : (
                <span className="opacity-60">Sem rede.</span>
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


      {/* Jornada Gamificada */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Jornada Gamificada (ia_mapa_texto)</label>
        <textarea
          value={peiData.ia_mapa_texto || ""}
          onChange={(e) => updateField("ia_mapa_texto", e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
        />
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
function InteligenciaDoCaso({ peiData }: { peiData: PEIData }) {
  const [engine, setEngine] = useState<EngineId>("red");
  // Mapa Mental
  const [mapaLoading, setMapaLoading] = useState(false);
  const [mapaData, setMapaData] = useState<{ centro: string; ramos: { titulo: string; cor: string; icone: string; filhos: string[] }[] } | null>(null);
  const [mapaErr, setMapaErr] = useState<string | null>(null);
  // Resumo Família
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoTexto, setResumoTexto] = useState<string | null>(null);
  const [resumoErr, setResumoErr] = useState<string | null>(null);
  // FAQ
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqData, setFaqData] = useState<{ pergunta: string; resposta: string }[] | null>(null);
  const [faqErr, setFaqErr] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const gerarMapa = async () => {
    setMapaLoading(true); setMapaErr(null); setMapaData(null);
    aiLoadingStart("yellow", "pei");
    try {
      const res = await fetch("/api/pei/mapa-mental", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData, engine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setMapaData(data.mapa);
    } catch (e) { setMapaErr(e instanceof Error ? e.message : "Erro"); }
    finally { setMapaLoading(false); aiLoadingStop(); }
  };

  const gerarResumo = async () => {
    setResumoLoading(true); setResumoErr(null); setResumoTexto(null);
    aiLoadingStart(engine || "blue", "pei");
    try {
      const res = await fetch("/api/pei/resumo-familia", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData, engine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResumoTexto(data.texto);
    } catch (e) { setResumoErr(e instanceof Error ? e.message : "Erro"); }
    finally { setResumoLoading(false); aiLoadingStop(); }
  };

  const gerarFaq = async () => {
    setFaqLoading(true); setFaqErr(null); setFaqData(null);
    aiLoadingStart(engine || "blue", "pei");
    try {
      const res = await fetch("/api/pei/faq-caso", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData, engine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setFaqData(data.faqs);
    } catch (e) { setFaqErr(e instanceof Error ? e.message : "Erro"); }
    finally { setFaqLoading(false); aiLoadingStop(); }
  };

  if (!peiData.nome) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h4 className="text-base font-semibold text-slate-800">Inteligência do Caso</h4>
        </div>
        <div className="w-48">
          <EngineSelector value={engine} onChange={setEngine} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card: Mapa Mental */}
        <button
          type="button"
          onClick={gerarMapa}
          disabled={mapaLoading}
          className="group p-5 rounded-2xl border-2 border-dashed border-violet-200 hover:border-violet-400 bg-gradient-to-br from-violet-50 to-white transition-all hover:shadow-lg text-left disabled:opacity-60"
        >
          <div className="text-3xl mb-3">🧠</div>
          <h5 className="font-semibold text-slate-800 mb-1 group-hover:text-violet-700 transition-colors">Mapa Mental</h5>
          <p className="text-xs text-slate-500">
            {mapaLoading ? "Gerando mapa mental..." : "Visualize o perfil completo como mapa interativo"}
          </p>
          {mapaLoading && <Loader2 className="w-4 h-4 animate-spin text-violet-500 mt-2" />}
        </button>

        {/* Card: Resumo Família */}
        <button
          type="button"
          onClick={gerarResumo}
          disabled={resumoLoading}
          className="group p-5 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-gradient-to-br from-emerald-50 to-white transition-all hover:shadow-lg text-left disabled:opacity-60"
        >
          <div className="text-3xl mb-3">👨‍👩‍👧</div>
          <h5 className="font-semibold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">Resumo para Família</h5>
          <p className="text-xs text-slate-500">
            {resumoLoading ? "Preparando resumo acolhedor..." : "Relatório com linguagem sem jargão para reunião"}
          </p>
          {resumoLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-500 mt-2" />}
        </button>

        {/* Card: FAQ */}
        <button
          type="button"
          onClick={gerarFaq}
          disabled={faqLoading}
          className="group p-5 rounded-2xl border-2 border-dashed border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-white transition-all hover:shadow-lg text-left disabled:opacity-60"
        >
          <div className="text-3xl mb-3">❓</div>
          <h5 className="font-semibold text-slate-800 mb-1 group-hover:text-amber-700 transition-colors">FAQ do Caso</h5>
          <p className="text-xs text-slate-500">
            {faqLoading ? "Gerando perguntas e respostas..." : "Perguntas frequentes com respostas práticas"}
          </p>
          {faqLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-500 mt-2" />}
        </button>
      </div>

      {/* Erros */}
      {mapaErr && <p className="text-red-600 text-sm mb-3">❌ Mapa Mental: {mapaErr}</p>}
      {resumoErr && <p className="text-red-600 text-sm mb-3">❌ Resumo: {resumoErr}</p>}
      {faqErr && <p className="text-red-600 text-sm mb-3">❌ FAQ: {faqErr}</p>}

      {/* ====== RESULTADO: MAPA MENTAL ====== */}
      {mapaData && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-slate-50 border border-violet-200">
          <h5 className="font-bold text-violet-800 text-lg mb-6 text-center">🧠 {mapaData.centro}</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mapaData.ramos.map((ramo, i) => (
              <div
                key={i}
                className="rounded-xl p-4 bg-white shadow-sm transition-all hover:shadow-md"
                style={{ borderLeft: `4px solid ${ramo.cor}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{ramo.icone}</span>
                  <span className="font-semibold text-sm" style={{ color: ramo.cor }}>{ramo.titulo}</span>
                </div>
                <ul className="space-y-1.5">
                  {ramo.filhos.map((filho, j) => (
                    <li key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ramo.cor }} />
                      {filho}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== RESULTADO: RESUMO FAMÍLIA ====== */}
      {resumoTexto && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-emerald-800 text-lg">👨‍👩‍👧 Resumo para Família</h5>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(resumoTexto)}
              className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              📋 Copiar
            </button>
          </div>
          <div className="prose prose-sm prose-emerald max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {resumoTexto}
          </div>
        </div>
      )}

      {/* ====== RESULTADO: FAQ ====== */}
      {faqData && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-slate-50 border border-amber-200">
          <h5 className="font-bold text-amber-800 text-lg mb-4">❓ FAQ do Caso — {peiData.nome}</h5>
          <div className="space-y-2">
            {faqData.map((item, i) => (
              <div key={i} className="rounded-xl bg-white border border-amber-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-amber-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-800">{item.pergunta}</span>
                  <span className="text-slate-400 text-lg ml-2 flex-shrink-0">{faqOpen === i ? "−" : "+"}</span>
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-3 text-sm text-slate-600 leading-relaxed border-t border-amber-100 pt-3">
                    {item.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PeiExportPdfButton({ peiData }: { peiData: PEIData }) {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/pei/exportar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert(err instanceof Error ? err.message : "Erro ao gerar PDF oficial");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Baixar PDF Oficial
        </>
      )}
    </button>
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

// Função para formatar texto da consultoria (simples, como no Streamlit)
function formatarTextoConsultoria(texto: string): React.ReactNode {
  if (!texto) return texto;

  // Remover markdown e melhorar formatação
  const textoLimpo = texto
    .replace(/^##+\s*/gm, '') // Remove ## headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **texto** mantendo apenas o texto
    .replace(/\*([^*]+)\*/g, '$1') // Remove *texto* mantendo apenas o texto
    .replace(/^###+\s*/gm, '') // Remove ### headers
    .replace(/^\*\s+/gm, '• ') // Converte * para bullet
    .replace(/\n{3,}/g, '\n\n') // Remove múltiplas quebras de linha
    .trim();

  // Retornar como texto pré-formatado simples
  return (
    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
      {textoLimpo}
    </div>
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
  const [feedbackAjuste, setFeedbackAjuste] = useState<string>(peiData.feedback_ajuste || "");

  const statusValidacao = peiData.status_validacao_pei || "rascunho";
  const temTexto = !!peiData.ia_sugestao;

  // Detectar segmento para exibir info box
  function detectarNivelEnsinoLocal(serieStr: string | null | undefined): string {
    if (!serieStr) return "";
    const s = serieStr.toLowerCase();
    if (s.includes("infantil")) return "EI";
    if (s.includes("1º ano") || s.includes("2º ano") || s.includes("3º ano") || s.includes("4º ano") || s.includes("5º ano")) return "EFI";
    if (s.includes("6º ano") || s.includes("7º ano") || s.includes("8º ano") || s.includes("9º ano")) return "EFII";
    if (s.includes("série") || s.includes("médio") || s.includes("eja")) return "EM";
    return "";
  }

  const nivel = detectarNivelEnsinoLocal(serie);
  const segmentoInfo: Record<string, { nome: string; cor: string; desc: string }> = {
    EI: { nome: "Educação Infantil", cor: "#4299e1", desc: "Foco: Campos de Experiência (BNCC) e rotina estruturante." },
    EFI: { nome: "Ensino Fundamental Anos Iniciais (EFAI)", cor: "#48bb78", desc: "Foco: alfabetização, numeracia e consolidação de habilidades basais." },
    EFII: { nome: "Ensino Fundamental Anos Finais (EFAF)", cor: "#ed8936", desc: "Foco: autonomia, funções executivas, organização e aprofundamento conceitual." },
    EM: { nome: "Ensino Médio / EJA", cor: "#9f7aea", desc: "Foco: projeto de vida, áreas do conhecimento e estratégias de estudo." },
  };
  const segInfo = segmentoInfo[nivel] || { nome: "Selecione a Série/Ano", cor: "#718096", desc: "Aguardando seleção..." };

  const gerar = async (modoPratico: boolean, feedback?: string) => {
    if (!serie) {
      setErro("Selecione a Série/Ano na aba Estudante.");
      return;
    }
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "pei");
    try {
      const res = await fetch("/api/pei/consultoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peiData,
          engine,
          modo_pratico: modoPratico,
          feedback: feedback || undefined,
        }),
      });
      const data = await parseJsonResponse(res, "/api/pei/consultoria");
      updateField("ia_sugestao", data.texto || "");
      updateField("consultoria_engine", engine);
      updateField("status_validacao_pei", "revisao");
      if (feedback) {
        updateField("feedback_ajuste", feedback);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  // Calcular estatísticas para info box e mini relatório
  const nBarreiras = Object.values(peiData.barreiras_selecionadas || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  const nHab = (Array.isArray(peiData.habilidades_bncc_selecionadas) ? peiData.habilidades_bncc_selecionadas : []).length;
  const habValidadas = Array.isArray(peiData.habilidades_bncc_validadas) ? peiData.habilidades_bncc_validadas : [];
  const redeApoio = Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : [];
  const potencias = Array.isArray(peiData.potencias) ? peiData.potencias : [];
  const estrategiasAcesso = Array.isArray(peiData.estrategias_acesso) ? peiData.estrategias_acesso : [];
  const estrategiasEnsino = Array.isArray(peiData.estrategias_ensino) ? peiData.estrategias_ensino : [];
  const estrategiasAvaliacao = Array.isArray(peiData.estrategias_avaliacao) ? peiData.estrategias_avaliacao : [];
  const medicamentos = Array.isArray(peiData.lista_medicamentos) ? peiData.lista_medicamentos : [];
  const temHiperfoco = Boolean(peiData.hiperfoco?.trim());
  const temDiagnostico = Boolean(peiData.diagnostico?.trim());
  const temHistorico = Boolean(peiData.historico?.trim());

  // Exemplo de barreira para transparência
  let exemploBarreira = "geral";
  for (const [area, lst] of Object.entries(peiData.barreiras_selecionadas || {})) {
    if (Array.isArray(lst) && lst.length > 0) {
      exemploBarreira = lst[0];
      break;
    }
  }

  const engineNames: Record<EngineId, string> = {
    red: "🔴 Red",
    blue: "🔵 Blue",
    green: "🟢 Green",
    yellow: "🟡 Yellow",
    orange: "🟠 Orange",
  };

  return (
    <div className="space-y-4">
      {!serie ? (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-amber-800 text-sm">
            ⚠️ Selecione a Série/Ano na aba <strong>Estudante</strong> para ativar o modo especialista.
          </p>
        </div>
      ) : (
        <>
          {/* Info box do segmento */}
          <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: "#F7FAFC", borderLeftColor: segInfo.cor }}>
            <p className="font-semibold mb-1" style={{ color: segInfo.cor }}>
              ℹ️ Modo Especialista: {segInfo.nome}
            </p>
            <p className="text-sm text-slate-600">{segInfo.desc}</p>
          </div>

          {/* Se ainda não tem texto ou voltou para rascunho: botões de geração */}
          {(!temTexto || statusValidacao === "rascunho") && (
            <>
              <details className="p-4 rounded-lg border border-slate-200/60 bg-white" open>
                <summary className="cursor-pointer font-semibold text-slate-700 mb-3">
                  🔧 Escolher motor de IA (Red, Blue, Green, Yellow ou Orange)
                </summary>
                <p className="text-xs text-slate-500 mb-3">Selecione qual IA gerará o relatório. Orange = fallback (GPT) se outros falharem.</p>
                <div className="flex flex-wrap gap-3">
                  {(["red", "blue", "green", "yellow", "orange"] as EngineId[]).map((e) => (
                    <label key={e} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="engine"
                        value={e}
                        checked={engine === e}
                        onChange={() => setEngine(e)}
                        className="w-4 h-4 text-sky-600"
                      />
                      <span className="text-sm text-slate-700">{engineNames[e]}</span>
                    </label>
                  ))}
                </div>
              </details>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => gerar(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50 hover:bg-cyan-700 transition-colors"
                  >
                    {loading ? "Gerando…" : "✨ Gerar Estratégia Técnica"}
                  </button>
                  <button
                    type="button"
                    onClick={() => gerar(true)}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg disabled:opacity-50 hover:bg-slate-300 transition-colors"
                  >
                    {loading ? "Gerando…" : "🧰 Gerar Guia Prático (Sala de Aula)"}
                  </button>
                </div>
                <div className="md:col-span-2">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-800 mb-3 font-semibold">
                      📊 Mini Relatório: Dados Inseridos no PEI
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className={temDiagnostico ? "text-emerald-600" : "text-slate-400"}>
                          {temDiagnostico ? "✅" : "⚪"}
                        </span>
                        <span>Diagnóstico: {temDiagnostico ? "Sim" : "Não"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={temHistorico ? "text-emerald-600" : "text-slate-400"}>
                          {temHistorico ? "✅" : "⚪"}
                        </span>
                        <span>Histórico: {temHistorico ? "Sim" : "Não"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={temHiperfoco ? "text-emerald-600" : "text-slate-400"}>
                          {temHiperfoco ? "✅" : "⚪"}
                        </span>
                        <span>Hiperfoco: {temHiperfoco ? "Sim" : "Não"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={potencias.length > 0 ? "text-emerald-600" : "text-slate-400"}>
                          {potencias.length > 0 ? "✅" : "⚪"}
                        </span>
                        <span>Potências: {potencias.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={nBarreiras > 0 ? "text-emerald-600" : "text-slate-400"}>
                          {nBarreiras > 0 ? "✅" : "⚪"}
                        </span>
                        <span>Barreiras: {nBarreiras}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={redeApoio.length > 0 ? "text-emerald-600" : "text-slate-400"}>
                          {redeApoio.length > 0 ? "✅" : "⚪"}
                        </span>
                        <span>Rede de Apoio: {redeApoio.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={habValidadas.length > 0 ? "text-emerald-600" : "text-slate-400"}>
                          {habValidadas.length > 0 ? "✅" : "⚪"}
                        </span>
                        <span>Habilidades BNCC: {habValidadas.length || nHab}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={estrategiasAcesso.length > 0 || estrategiasEnsino.length > 0 || estrategiasAvaliacao.length > 0 ? "text-emerald-600" : "text-slate-400"}>
                          {(estrategiasAcesso.length > 0 || estrategiasEnsino.length > 0 || estrategiasAvaliacao.length > 0) ? "✅" : "⚪"}
                        </span>
                        <span>Estratégias: {estrategiasAcesso.length + estrategiasEnsino.length + estrategiasAvaliacao.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={medicamentos.length > 0 ? "text-emerald-600" : "text-slate-400"}>
                          {medicamentos.length > 0 ? "✅" : "⚪"}
                        </span>
                        <span>Medicamentos: {medicamentos.length}</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-3 pt-2 border-t border-blue-200">
                      💡 Quanto mais completo o <strong>Mapeamento</strong> e o <strong>Plano de Ação</strong>, melhor a precisão do relatório.
                    </p>
                    {nHab > 0 && habValidadas.length === 0 && (
                      <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                        ⚠️ Há habilidades selecionadas na aba <strong>BNCC</strong> mas ainda não validadas. Clique em <strong>Validar seleção</strong> naquela aba.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Se revisão/aprovado: mostrar texto e permitir aprovar/ajustar */}
          {temTexto && (statusValidacao === "revisao" || statusValidacao === "aprovado") && (
            <>
              <details className="p-4 rounded-lg border border-slate-200/60 bg-white">
                <summary className="cursor-pointer font-semibold text-slate-700 mb-3">
                  🧠 Como a IA construiu este relatório (transparência)
                </summary>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <strong>Gerado por {engineNames[engine]}</strong>
                  </p>
                  <p>
                    <strong>1. Input do estudante:</strong> Série <strong>{serie}</strong>, diagnóstico <strong>{peiData.diagnostico || "em observação"}</strong>.
                  </p>
                  <p>
                    <strong>2. Barreiras ativas:</strong> detectei <strong>{nBarreiras}</strong> barreiras e cruzei isso com BNCC + DUA.
                  </p>
                  <p>
                    <strong>3. Ponto crítico exemplo:</strong> priorizei adaptações para reduzir impacto de <strong>{exemploBarreira}</strong>.
                  </p>
                </div>
              </details>

              <details className="p-4 rounded-lg border border-slate-200/60 bg-white">
                <summary className="cursor-pointer font-semibold text-slate-700 mb-3">
                  🛡️ Calibragem e segurança pedagógica
                </summary>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>- <strong>Farmacologia:</strong> não sugere dose/medicação; apenas sinaliza pontos de atenção.</p>
                  <p>- <strong>Dados sensíveis:</strong> evite inserir PII desnecessária.</p>
                  <p>- <strong>Normativa:</strong> sugestões buscam aderência à LBI/DUA e adaptações razoáveis.</p>
                </div>
              </details>

              <div>
                <h4 className="text-base font-semibold text-slate-800 mb-3">📝 Revisão do Plano</h4>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 mb-3">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                    {formatarTextoConsultoria((peiData.ia_sugestao || "").replace(/\[.*?\]/g, ""))}
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Responsabilidade do Educador:</strong> a IA pode errar. Valide e ajuste antes de aplicar.
                </p>
              </div>

              {statusValidacao === "revisao" && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      updateField("status_validacao_pei", "aprovado");
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    ✅ Aprovar Plano
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("status_validacao_pei", "ajustando");
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ❌ Solicitar Ajuste
                  </button>
                </div>
              )}

              {statusValidacao === "aprovado" && (
                <>
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-4">
                    <p className="text-emerald-800 font-semibold">Plano Validado ✅</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Edição Final Manual (opcional)</label>
                    <textarea
                      value={peiData.ia_sugestao || ""}
                      onChange={(e) => updateField("ia_sugestao", e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        updateField("ia_sugestao", "");
                        updateField("status_validacao_pei", "rascunho");
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      🔁 Regerar do Zero
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField("status_validacao_pei", "revisao");
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      🧹 Voltar para Revisão
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Ajustando: caixa de feedback + regerar */}
          {statusValidacao === "ajustando" && (
            <>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-amber-800 font-semibold mb-2">Descreva o ajuste desejado:</p>
                <textarea
                  value={feedbackAjuste}
                  onChange={(e) => setFeedbackAjuste(e.target.value)}
                  placeholder="Ex: Foque mais na alfabetização…"
                  rows={4}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => gerar(false, feedbackAjuste)}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50 hover:bg-cyan-700 transition-colors"
                >
                  {loading ? "Regerando…" : "Regerar com Ajustes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateField("status_validacao_pei", "revisao");
                    setFeedbackAjuste("");
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}

          {/* Se não tem texto ainda, mostrar textarea vazio */}
          {!temTexto && statusValidacao === "rascunho" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sugestão IA (consultoria)</label>
              <textarea
                value={peiData.ia_sugestao || ""}
                onChange={(e) => updateField("ia_sugestao", e.target.value)}
                rows={14}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
                placeholder="Gere o relatório usando os botões acima..."
              />
            </div>
          )}
        </>
      )}
      {erro && <p className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">{erro}</p>}
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
      const url = "/api/bncc/ei";
      fetch(url)
        .then((res) => parseJsonResponse(res, url))
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
        .then((res) => parseJsonResponse(res, url))
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
      const urlEi = `/api/bncc/ei?idade=${encodeURIComponent(idade)}&campo=${encodeURIComponent(campo)}`;
      fetch(urlEi)
        .then((res) => parseJsonResponse(res, urlEi))
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
  const habilidadesAtuais = (Array.isArray(peiData.habilidades_bncc_selecionadas) ? peiData.habilidades_bncc_selecionadas : []) as HabilidadeBncc[];
  const [sugerindoAtual, setSugerindoAtual] = useState(false);
  const [sugerindoAnteriores, setSugerindoAnteriores] = useState(false);
  const [motivoIAAtual, setMotivoIAAtual] = useState<string>("");
  const [motivoIAAnteriores, setMotivoIAAnteriores] = useState<string>("");

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
    setMotivoIAAtual("");
    setMotivoIAAnteriores("");
  }

  function validarSelecao() {
    if (habilidadesAtuais.length === 0) return;
    updateField("habilidades_bncc_validadas", [...habilidadesAtuais]);
  }

  async function sugerirHabilidadesIA(tipo: "ano_atual" | "anos_anteriores") {
    if (tipo === "ano_atual") {
      setSugerindoAtual(true);
    } else {
      setSugerindoAnteriores(true);
    }

    try {
      const habilidadesParaIA =
        tipo === "ano_atual"
          ? Object.entries(anoAtual).flatMap(([disc, habs]) =>
            (habs || []).map((h) => ({
              disciplina: disc,
              codigo: h.codigo,
              habilidade_completa: h.habilidade_completa || h.descricao,
            }))
          )
          : Object.entries(anosAnteriores).flatMap(([disc, habs]) =>
            (habs || []).map((h) => ({
              disciplina: disc,
              codigo: h.codigo,
              habilidade_completa: h.habilidade_completa || h.descricao,
            }))
          );

      const res = await fetch("/api/bncc/sugerir-habilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serie,
          tipo,
          habilidades: habilidadesParaIA,
        }),
      });

      const { codigos, motivo } = await parseJsonResponse(res, "/api/bncc/sugerir-habilidades");

      if (tipo === "ano_atual") {
        setMotivoIAAtual(motivo || "");
      } else {
        setMotivoIAAnteriores(motivo || "");
      }

      // Adicionar habilidades sugeridas
      const novas: HabilidadeBncc[] = [];
      const habilidadesFonte = tipo === "ano_atual" ? anoAtual : anosAnteriores;

      for (const [disc, habs] of Object.entries(habilidadesFonte)) {
        for (const h of habs || []) {
          if (codigos.includes((h.codigo || "").toUpperCase())) {
            novas.push({
              disciplina: disc,
              codigo: h.codigo,
              descricao: h.descricao,
              habilidade_completa: h.habilidade_completa || h.descricao,
              origem: tipo === "ano_atual" ? "ano_atual" : "anos_anteriores",
            });
          }
        }
      }

      // Manter habilidades de anos anteriores se estamos sugerindo ano atual
      const outras = tipo === "ano_atual" ? habilidadesAtuais.filter((h) => h.origem === "anos_anteriores") : [];
      updateField("habilidades_bncc_selecionadas", [...outras, ...novas]);
    } catch (error) {
      console.error("Erro ao sugerir habilidades:", error);
      alert(`Erro ao sugerir habilidades: ${error}`);
    } finally {
      if (tipo === "ano_atual") {
        setSugerindoAtual(false);
      } else {
        setSugerindoAnteriores(false);
      }
    }
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

      <details className="border-2 border-blue-200 rounded-lg bg-blue-50/30" open={habilidadesAtuais.length > 0}>
        <summary className="px-4 py-3 font-medium cursor-pointer bg-blue-100 rounded-t-lg">
          📋 Habilidades selecionadas ({habilidadesAtuais.length})
        </summary>
        <div className="p-4 space-y-3">
          {habilidadesAtuais.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma habilidade selecionada. Marque nas listas abaixo ou use o botão de auxílio da IA.
            </p>
          ) : (
            <>
              {(motivoIAAtual || motivoIAAnteriores) && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-xs font-medium text-purple-800 mb-1">Por que a IA escolheu estas habilidades:</p>
                  {motivoIAAtual && <p className="text-xs text-purple-700 mb-1"><em>Ano atual:</em> {motivoIAAtual}</p>}
                  {motivoIAAnteriores && <p className="text-xs text-purple-700"><em>Anos anteriores:</em> {motivoIAAnteriores}</p>}
                </div>
              )}
              <p className="text-xs text-slate-600">Revise a lista. Use <strong>Remover</strong> para tirar uma habilidade ou <strong>Desmarcar todas</strong> para limpar.</p>
              {habilidadesAtuais.map((h, i) => (
                <div key={`${h.disciplina}-${h.codigo}-${i}`} className="flex justify-between items-start gap-2 py-2 px-3 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="text-sm">
                    <strong className="text-slate-800">{h.disciplina}</strong> — <em className="text-sky-600">{h.codigo}</em> — <span className="text-slate-700">{h.habilidade_completa || h.descricao}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerHabilidade(i)}
                    className="text-red-600 hover:text-red-700 text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={desmarcarTodas}
                className="text-slate-600 hover:text-slate-700 text-sm px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Desmarcar todas
              </button>
            </>
          )}
        </div>
      </details>

      {componentesAtual.length > 0 && (
        <details className="border-2 border-emerald-200 rounded-lg bg-emerald-50/30" open>
          <summary className="px-4 py-3 font-medium cursor-pointer bg-emerald-100 rounded-t-lg">
            Habilidades do ano/série atual
          </summary>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs text-slate-600">
                Marque as habilidades por {rotulo} (ano atual).
              </p>
              <button
                type="button"
                onClick={() => sugerirHabilidadesIA("ano_atual")}
                disabled={sugerindoAtual}
                className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {sugerindoAtual ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sugerindo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    🤖 Auxílio IA
                  </>
                )}
              </button>
            </div>
            {componentesAtual.map((disc) => {
              const habsDisciplina = anoAtual[disc] || [];
              const habsSelecionadas = habilidadesAtuais.filter((h) => h.disciplina === disc && h.origem === "ano_atual");
              const codigosSelecionados = new Set(habsSelecionadas.map(h => h.codigo));

              return (
                <details key={disc} className="border border-slate-200 rounded-lg bg-white">
                  <summary className="px-3 py-2 font-medium cursor-pointer hover:bg-slate-50 rounded-t-lg flex items-center justify-between">
                    <span className="text-sm text-slate-800">{disc}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {habsSelecionadas.length} selecionada{habsSelecionadas.length !== 1 ? "s" : ""}
                    </span>
                  </summary>
                  <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                    {habsDisciplina.map((h, i) => {
                      const estaSelecionada = codigosSelecionados.has(h.codigo);
                      return (
                        <label
                          key={`${disc}-ano-${i}`}
                          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${estaSelecionada
                            ? "bg-emerald-50 border-2 border-emerald-300"
                            : "hover:bg-slate-50 border-2 border-transparent"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={estaSelecionada}
                            onChange={(e) => {
                              const outras = habilidadesAtuais.filter((hab) => !(hab.disciplina === disc && hab.origem === "ano_atual" && hab.codigo === h.codigo));
                              if (e.target.checked) {
                                const nova: HabilidadeBncc = {
                                  disciplina: disc,
                                  codigo: h.codigo,
                                  descricao: h.descricao,
                                  habilidade_completa: h.habilidade_completa || h.descricao,
                                  origem: "ano_atual",
                                };
                                updateField("habilidades_bncc_selecionadas", [...outras, nova]);
                              } else {
                                updateField("habilidades_bncc_selecionadas", outras);
                              }
                              updateField("habilidades_bncc_validadas", null);
                            }}
                            className="mt-0.5 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                          />
                          <div className="flex-1 text-xs">
                            <span className="font-semibold text-sky-600">{h.codigo}</span>
                            <span className="text-slate-700 ml-1">{h.habilidade_completa || h.descricao}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </details>
      )}

      {componentesAnt.length > 0 && (
        <details className="border-2 border-amber-200 rounded-lg bg-amber-50/30">
          <summary className="px-4 py-3 font-medium cursor-pointer bg-amber-100 rounded-t-lg">
            Habilidades de anos anteriores
          </summary>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs text-slate-600">
                Habilidades de anos anteriores que merecem atenção.
              </p>
              <button
                type="button"
                onClick={() => sugerirHabilidadesIA("anos_anteriores")}
                disabled={sugerindoAnteriores}
                className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {sugerindoAnteriores ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sugerindo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    🤖 Auxílio IA
                  </>
                )}
              </button>
            </div>
            {componentesAnt.map((disc) => {
              const habsDisciplina = anosAnteriores[disc] || [];
              const habsSelecionadas = habilidadesAtuais.filter((h) => h.disciplina === disc && h.origem === "anos_anteriores");
              const codigosSelecionados = new Set(habsSelecionadas.map(h => h.codigo));

              return (
                <details key={disc} className="border border-slate-200 rounded-lg bg-white">
                  <summary className="px-3 py-2 font-medium cursor-pointer hover:bg-slate-50 rounded-t-lg flex items-center justify-between">
                    <span className="text-sm text-slate-800">{disc}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {habsSelecionadas.length} selecionada{habsSelecionadas.length !== 1 ? "s" : ""}
                    </span>
                  </summary>
                  <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                    {habsDisciplina.map((h, i) => {
                      const estaSelecionada = codigosSelecionados.has(h.codigo);
                      return (
                        <label
                          key={`${disc}-ant-${i}`}
                          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${estaSelecionada
                            ? "bg-amber-50 border-2 border-amber-300"
                            : "hover:bg-slate-50 border-2 border-transparent"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={estaSelecionada}
                            onChange={(e) => {
                              const outras = habilidadesAtuais.filter((hab) => !(hab.disciplina === disc && hab.origem === "anos_anteriores" && hab.codigo === h.codigo));
                              if (e.target.checked) {
                                const nova: HabilidadeBncc = {
                                  disciplina: disc,
                                  codigo: h.codigo,
                                  descricao: h.descricao,
                                  habilidade_completa: h.habilidade_completa || h.descricao,
                                  origem: "anos_anteriores",
                                };
                                updateField("habilidades_bncc_selecionadas", [...outras, nova]);
                              } else {
                                updateField("habilidades_bncc_selecionadas", outras);
                              }
                              updateField("habilidades_bncc_validadas", null);
                            }}
                            className="mt-0.5 w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                          />
                          <div className="flex-1 text-xs">
                            <span className="font-semibold text-amber-600">{h.codigo}</span>
                            <span className="text-slate-700 ml-1">{h.habilidade_completa || h.descricao}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </details>
              );
            })}
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
            accept=".pdf,application/pdf"
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
            <p className="text-xs text-emerald-600 mt-1">Arquivo selecionado. Clique em "Extrair Dados do Laudo" para processar.</p>
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
function calcularIdade(dataNasc: string | Date | undefined): string {
  if (!dataNasc) return "";
  const hoje = new Date();
  const nasc = typeof dataNasc === "string" ? new Date(dataNasc) : dataNasc;
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mesDiff = hoje.getMonth() - nasc.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return `${idade} anos`;
}

function getHiperfocoEmoji(texto: string | undefined): string {
  if (!texto) return "🚀";
  const t = texto.toLowerCase();
  if (t.includes("jogo") || t.includes("game") || t.includes("minecraft") || t.includes("roblox")) return "🎮";
  if (t.includes("dino")) return "🦖";
  if (t.includes("fute") || t.includes("bola")) return "⚽";
  if (t.includes("desenho") || t.includes("arte")) return "🎨";
  if (t.includes("músic") || t.includes("music")) return "🎵";
  if (t.includes("anim") || t.includes("gato") || t.includes("cachorro")) return "🐾";
  if (t.includes("carro")) return "🏎️";
  if (t.includes("espaço") || t.includes("espaco")) return "🪐";
  return "🚀";
}

function calcularComplexidadePei(dados: PEIData): [string, string, string] {
  const barreiras = dados.barreiras_selecionadas || {};
  const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  const niveis = dados.niveis_suporte || {};
  const nSuporteAlto = Object.values(niveis).filter((v) => v === "Substancial" || v === "Muito Substancial").length;
  let recursos = 0;
  if (dados.rede_apoio && dados.rede_apoio.length > 0) recursos += 3;
  if (dados.lista_medicamentos && dados.lista_medicamentos.length > 0) recursos += 2;
  const saldo = nBar + nSuporteAlto - recursos;
  if (saldo <= 2) return ["FLUIDA", "#F0FFF4", "#276749"];
  if (saldo <= 7) return ["ATENÇÃO", "#FFFFF0", "#D69E2E"];
  return ["CRÍTICA", "#FFF5F5", "#C53030"];
}

function extrairMetasEstruturadas(texto: string | undefined): { Curto: string; Medio: string; Longo: string } {
  const metas = { Curto: "Definir...", Medio: "Definir...", Longo: "Definir..." };
  if (!texto) return metas;
  const regex = /METAS_SMART[\s\S]*?(\n\n|$)/i;
  const match = texto.match(regex);
  if (!match) return metas;
  const bloco = match[0];
  const linhas = bloco.split("\n");
  for (const l of linhas) {
    const lClean = l.replace(/^[\-\*]+/, "").trim();
    if (!lClean) continue;
    if (lClean.includes("Curto") || lClean.includes("2 meses")) {
      metas.Curto = lClean.split(":")[-1]?.trim() || lClean;
    } else if (lClean.includes("Médio") || lClean.includes("Semestre") || lClean.includes("Medio")) {
      metas.Medio = lClean.split(":")[-1]?.trim() || lClean;
    } else if (lClean.includes("Longo") || lClean.includes("Ano")) {
      metas.Longo = lClean.split(":")[-1]?.trim() || lClean;
    }
  }
  return metas;
}

function inferirComponentesImpactados(dados: PEIData): string[] {
  const barreiras = dados.barreiras_selecionadas || {};
  const serie = dados.serie || "";
  const nivel = detectarNivelEnsino(serie);
  // Detectar se é anos finais do fundamental (EFII)
  const serieLower = serie.toLowerCase();
  const isEFII = nivel === "EF" && (serieLower.includes("6º") || serieLower.includes("7º") || serieLower.includes("8º") || serieLower.includes("9º"));
  const impactados = new Set<string>();

  // Leitura
  if (barreiras["Acadêmico"] && barreiras["Acadêmico"].some((b: string) => b.includes("Leitora"))) {
    impactados.add("Língua Portuguesa");
    impactados.add(nivel === "EM" ? "História/Sociologia/Filosofia" : "História/Geografia");
  }

  // Matemática
  if (barreiras["Acadêmico"] && barreiras["Acadêmico"].some((b: string) => b.includes("Matemático"))) {
    impactados.add("Matemática");
    if (nivel === "EM") {
      impactados.add("Física/Química/Biologia");
    } else if (isEFII) {
      impactados.add("Ciências");
    }
  }

  // Cognitivas (transversal)
  if (barreiras["Funções Cognitivas"] && barreiras["Funções Cognitivas"].length > 0) {
    impactados.add("Todas as áreas");
  }

  return Array.from(impactados);
}

function getProIcon(nomeProfissional: string): string {
  const p = nomeProfissional.toLowerCase();
  if (p.includes("psic")) return "🧠";
  if (p.includes("fono")) return "🗣️";
  if (p.includes("terapeuta ocupacional") || p.includes("to")) return "🤲";
  if (p.includes("neuro")) return "🧬";
  if (p.includes("psiquiatra")) return "💊";
  if (p.includes("psicopedagogo")) return "📚";
  if (p.includes("professor") || p.includes("mediador")) return "👨‍🏫";
  if (p.includes("acompanhante") || p.includes("at")) return "🤝";
  if (p.includes("music")) return "🎵";
  if (p.includes("equo")) return "🐴";
  if (p.includes("oftalmo")) return "👁️";
  return "👤";
}

// Componente para range input com cores
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
