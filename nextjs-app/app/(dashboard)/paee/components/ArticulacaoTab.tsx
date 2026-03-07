"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, Play, Pause, FileText, Download, Target, Calendar, CheckCircle2, ChevronDown, ChevronRight, MessageSquare, AlertTriangle, Users, BookOpen, Layout, Settings, Sparkles, Loader2, ArrowRight, Map, Search } from 'lucide-react';
import type { StudentFull } from "../lib/paee-types";
import type { CicloPAEE, MetaPei } from "@/lib/paee";
import { getSupabase } from "@/lib/supabase";
import { LottieIcon } from "@/components/LottieIcon";

import { Card } from "@omni/ds";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { fmtDataIso, badgeStatus } from "@/lib/paee";
import { OmniLoader } from "@/components/OmniLoader";
export function ArticulacaoTab({
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
  const [frequencia, setFrequencia] = useState("2x/sem");
  const [turno, setTurno] = useState("Manhã");
  const [acoes, setAcoes] = useState("");
  const [documento, setDocumento] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_documento_articulacao as string;
    const statusSalvo = paeeData.status_documento_articulacao as string;
    const inputSalvo = paeeData.input_original_documento_articulacao as {
      freq?: string;
      turno?: string;
      acoes?: string;
    };
    if (conteudoSalvo) {
      setDocumento(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
    if (inputSalvo) {
      setFrequencia(inputSalvo.freq || "2x/sem");
      setTurno(inputSalvo.turno || "Manhã");
      setAcoes(inputSalvo.acoes || "");
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!acoes.trim()) {
      setErro("Por favor, descreva o trabalho desenvolvido no AEE.");
      return;
    }
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/documento-articulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frequencia: `${frequencia} (${turno})`,
          acoes,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei: ((peiData.ia_sugestao as string) || "").slice(0, 2000) || undefined,
          diagnosis: diagnosis || undefined,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar documento");
      const docTexto = (data.documento || "").trim();

      // Atualização atômica
      const novoPaeeData = {
        ...paeeData,
        conteudo_documento_articulacao: docTexto,
        status_documento_articulacao: "revisao",
        input_original_documento_articulacao: { freq: frequencia, turno, acoes },
      };
      onUpdate(novoPaeeData);
      setDocumento(docTexto);
      setStatus("revisao");

      // Salvar no Supabase
      if (student?.id) {
        try {
          const saveRes = await fetch(`/api/students/${student.id}/paee`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paee_data: novoPaeeData }),
          });
          if (!saveRes.ok) {
            console.error("Erro ao salvar articulação no Supabase:", await saveRes.text());
          }
        } catch (saveErr) {
          console.error("Erro ao salvar articulação:", saveErr);
        }
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar documento");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const limpar = () => {
    setDocumento("");
    setStatus("rascunho");
    setAcoes("");
    setFeedback("");
    updateField("conteudo_documento_articulacao", "");
    updateField("status_documento_articulacao", "rascunho");
  };

  return (
    <Card padding="none" className="p-6">
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Articulação</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-violet-700">Documento de Articulação AEE ↔ Sala Regular:</strong> A IA gera uma carta formal
            mas acolhedora que articula o trabalho desenvolvido no AEE com a sala regular. O documento inclui resumo das habilidades
            desenvolvidas, estratégias de generalização, orientações práticas, plano de ação conjunto e próximos passos.
            Este documento fortalece a colaboração entre AEE e sala de aula.
          </p>
        </div>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Limpar / Abandonar
        </button>
      )}

      {status === "rascunho" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Frequência no AEE</label>
              <select
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="1x/sem">1x/sem</option>
                <option value="2x/sem">2x/sem</option>
                <option value="3x/sem">3x/sem</option>
                <option value="Diário">Diário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Turno</label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Integral">Integral</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Trabalho Desenvolvido no AEE
            </label>
            <textarea
              value={acoes}
              onChange={(e) => setAcoes(e.target.value)}
              placeholder="Descreva as principais ações, estratégias e recursos utilizados no AEE..."
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading || !acoes.trim()}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Gerando documento...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                📄 Gerar Documento
              </>
            )}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <FormattedTextDisplay texto={documento} titulo="Documento de Articulação Gerado" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_documento_articulacao", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Validar e Finalizar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("ajustando");
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              🔄 Solicitar Ajustes
            </button>
            <button
              type="button"
              onClick={limpar}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              🗑️ Descartar e Regenerar
            </button>
            <PdfDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Documento de Articulação - ${student?.name || ""}`}
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
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex.: Incluir mais detalhes sobre estratégias de generalização, focar em orientações práticas..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Aplicando ajustes..." : "🔄 Gerar Novamente com Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ↩️ Cancelar Ajustes
            </button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Documento Validado e Pronto para Uso</p>
          </div>
          <FormattedTextDisplay texto={documento} titulo="Documento de Articulação Final" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                updateField("status_documento_articulacao", "revisao");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ✏️ Editar Novamente
            </button>
            <PdfDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Documento de Articulação - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
