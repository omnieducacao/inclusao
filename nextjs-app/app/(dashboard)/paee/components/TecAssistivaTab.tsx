"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, Play, Pause, FileText, Download, Target, Calendar, CheckCircle2, ChevronDown, ChevronRight, MessageSquare, AlertTriangle, Users, BookOpen, Layout, Settings, Sparkles, Loader2, ArrowRight, Map, Search, Puzzle } from 'lucide-react';
import type { StudentFull } from "../lib/paee-types";
import type { CicloPAEE, MetaPei } from "@/lib/paee";
import { LottieIcon } from "@/components/LottieIcon";

import { Card, Input, Textarea, Button } from "@omni/ds";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { fmtDataIso, badgeStatus } from "@/lib/paee";
import { OmniLoader } from "@/components/OmniLoader";
export function TecAssistivaTab({
  student,
  peiData,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  peiData: Record<string, unknown>;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [dificuldade, setDificuldade] = useState("");
  const [sugestoes, setSugestoes] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  const contextoPei = (peiData.ia_sugestao as string) || "";

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_tecnologia_assistiva as string;
    const statusSalvo = paeeData.status_tecnologia_assistiva as string;
    const inputSalvo = paeeData.input_original_tecnologia_assistiva as { dificuldade?: string };
    if (conteudoSalvo) {
      setSugestoes(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
    if (inputSalvo?.dificuldade) {
      setDificuldade(inputSalvo.dificuldade);
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!dificuldade.trim()) {
      setErro("Por favor, descreva a dificuldade específica.");
      return;
    }
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/tecnologia-assistiva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dificuldade,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar sugestões");
      const sugestoesTexto = (data.sugestoes || "").trim();
      setSugestoes(sugestoesTexto);
      setStatus("revisao");

      // Atualização atômica do paeeData (mesmo padrão do PlanoHabilidadesTab)
      const novoPaeeData = {
        ...paeeData,
        conteudo_tecnologia_assistiva: sugestoesTexto,
        status_tecnologia_assistiva: "revisao",
        input_original_tecnologia_assistiva: { dificuldade },
      };
      onUpdate(novoPaeeData);


    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar sugestões");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const limpar = () => {
    setSugestoes("");
    setStatus("rascunho");
    setDificuldade("");
    setFeedback("");
    updateField("conteudo_tecnologia_assistiva", "");
    updateField("status_tecnologia_assistiva", "rascunho");
  };

  return (
    <Card padding="none" className="p-6">
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--module-primary-soft) to-(--module-primary)/10 flex items-center justify-center shrink-0">
          <Puzzle className="w-6 h-6 text-(--module-primary)" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Tecnologia Assistiva</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-(--module-primary)">Recursos de Tecnologia Assistiva:</strong> A IA sugere recursos em 3 níveis
            (Baixa, Média e Alta Tecnologia) para promover autonomia e participação do estudante. Cada sugestão inclui descrição,
            finalidade, como usar na prática, benefícios e onde encontrar/comprar. Esses recursos eliminam barreiras e ampliam
            as possibilidades de participação do estudante.
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dificuldade Específica</label>
            <Input
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
              placeholder="Ex: Dificuldade na escrita, comunicação, mobilidade, organização..."
              className="w-full"
            />
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <Button
            type="button"
            variant="primary"
            onClick={() => gerar()}
            disabled={loading || !dificuldade.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Buscando tecnologias assistivas...
              </>
            ) : (
              <>
                <Puzzle className="w-5 h-5" />
                🔧 Sugerir Recursos
              </>
            )}
          </Button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <FormattedTextDisplay texto={sugestoes} titulo="Sugestões de Tecnologia Assistiva Geradas" />
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              className="bg-green-600 text-white border-0 hover:bg-green-700"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_tecnologia_assistiva", "aprovado");
              }}
            >
              ✅ Validar e Finalizar
            </Button>
            <Button
              type="button"
              className="bg-amber-600 text-white border-0 hover:bg-amber-700"
              onClick={() => {
                setStatus("ajustando");
              }}
            >
              🔄 Solicitar Ajustes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={limpar}
            >
              🗑️ Descartar e Regenerar
            </Button>
            <PdfDownloadButton
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Tecnologia Assistiva - ${student?.name || ""}`}
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
              placeholder="Ex.: Incluir mais recursos de baixa tecnologia, focar em soluções práticas..."
              rows={4}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
            >
              {loading ? "Aplicando ajustes..." : "🔄 Gerar Novamente com Ajustes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
            >
              ↩️ Cancelar Ajustes
            </Button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Sugestões Validadas e Prontas para Uso</p>
          </div>
          <FormattedTextDisplay texto={sugestoes} titulo="Sugestões de Tecnologia Assistiva Final" />
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStatus("revisao");
                updateField("status_tecnologia_assistiva", "revisao");
              }}
            >
              ✏️ Editar Novamente
            </Button>
            <PdfDownloadButton
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
