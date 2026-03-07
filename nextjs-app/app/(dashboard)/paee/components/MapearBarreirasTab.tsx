"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, Play, Pause, FileText, Download, Target, Calendar, CheckCircle2, ChevronDown, ChevronRight, MessageSquare, AlertTriangle, Users, BookOpen, Layout, Settings, Sparkles, Loader2, ArrowRight, Map, Search } from 'lucide-react';
import type { StudentFull } from "../lib/paee-types";
import type { CicloPAEE, MetaPei } from "@/lib/paee";
import { LottieIcon } from "@/components/LottieIcon";

import { Card, Textarea, Button } from "@omni/ds";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { fmtDataIso, badgeStatus } from "@/lib/paee";
import { OmniLoader } from "@/components/OmniLoader";
export function MapearBarreirasTab({
  student,
  peiData,
  diagnosis,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  peiData: Record<string, unknown>;
  diagnosis: string;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [observacoes, setObservacoes] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  const contextoPei = (peiData.ia_sugestao as string) || "";

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_diagnostico_barreiras as string;
    const statusSalvo = paeeData.status_diagnostico_barreiras as string;
    if (conteudoSalvo) {
      setDiagnostico(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!observacoes.trim()) {
      setErro("Por favor, descreva suas observações antes de analisar.");
      return;
    }
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/diagnostico-barreiras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observacoes,
          studentId: student?.id,
          studentName: student?.name || "",
          diagnosis,
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar diagnóstico");
      const diagnosticoTexto = (data.diagnostico || "").trim();
      setDiagnostico(diagnosticoTexto);
      setStatus("revisao");

      // Atualização atômica do paeeData (mesmo padrão do PlanoHabilidadesTab)
      const novoPaeeData = {
        ...paeeData,
        conteudo_diagnostico_barreiras: diagnosticoTexto,
        status_diagnostico_barreiras: "revisao",
        input_original_diagnostico_barreiras: feedbackAjuste ? { obs: observacoes } : undefined,
      };
      onUpdate(novoPaeeData);


    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar diagnóstico");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const limpar = () => {
    setDiagnostico("");
    setStatus("rascunho");
    setObservacoes("");
    setFeedback("");
    updateField("conteudo_diagnostico_barreiras", "");
    updateField("status_diagnostico_barreiras", "rascunho");
  };

  return (
    <Card padding="none" className="p-6">
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Mapear Barreiras</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-violet-700">Diagnóstico de Barreiras:</strong> Mapeie barreiras na aprendizagem (uso interno da equipe).
            O resultado ajuda a planejar estratégias; não será exposto ao estudante. A IA classifica as barreiras segundo a LBI
            (Lei Brasileira de Inclusão) em: <strong>Comunicacionais</strong>, <strong>Metodológicas</strong>,
            <strong> Atitudinais</strong>, <strong>Tecnológicas</strong> e <strong>Arquitetônicas</strong>.
          </p>
        </div>
      </div>

      {status !== "rascunho" && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={limpar}
        >
          Limpar / Abandonar
        </Button>
      )}

      {status === "rascunho" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Observações Iniciais do AEE
            </label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Exemplo: O estudante se recusa a escrever quando solicitado, demonstrando ansiedade e evitamento. Durante atividades de escrita, ele tenta sair da sala ou distrai os colegas. Quando consegue iniciar, abandona a tarefa após algumas linhas, dizendo que está cansado ou que não sabe fazer."
              rows={6}
              className="w-full"
            />
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <Button
            type="button"
            variant="primary"
            onClick={() => gerar()}
            disabled={loading || !observacoes.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Analisando barreiras...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                🔍 Analisar Barreiras
              </>
            )}
          </Button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <FormattedTextDisplay texto={diagnostico} titulo="Diagnóstico de Barreiras Gerado" />
          <div className="flex gap-3 flex-wrap">
            <Button
              type="button"
              className="bg-green-600 text-white border-0 hover:bg-green-700"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_diagnostico_barreiras", "aprovado");
              }}
            >
              Validar e Finalizar
            </Button>
            <Button
              type="button"
              className="bg-amber-600 text-white border-0 hover:bg-amber-700"
              onClick={() => {
                setStatus("ajustando");
              }}
            >
              Solicitar Ajustes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={limpar}
            >
              Descartar e Regenerar
            </Button>
            <PdfDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-2">✏️ Modo de Ajuste Ativo</p>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descreva os ajustes necessários:
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex.: Incluir mais detalhes sobre barreiras metodológicas, focar em estratégias práticas..."
              rows={4}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <OmniLoader engine={engine} size={16} />
                  Regerando...
                </>
              ) : (
                <>
                  Gerar Novamente com Ajustes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
            >
              Cancelar Ajustes
            </Button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Recurso Validado e Pronto para Uso</p>
          </div>
          <FormattedTextDisplay texto={diagnostico} titulo="Diagnóstico de Barreiras Final" />
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStatus("revisao");
                updateField("status_diagnostico_barreiras", "revisao");
              }}
            >
              ✏️ Editar Novamente
            </Button>
            <PdfDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
