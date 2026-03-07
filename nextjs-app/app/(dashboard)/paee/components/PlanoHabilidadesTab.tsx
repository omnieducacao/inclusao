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
export function PlanoHabilidadesTab({
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
  const [foco, setFoco] = useState("Funções Executivas");
  const [plano, setPlano] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false); // Flag para evitar sincronização durante geração

  const contextoPei = (peiData.ia_sugestao as string) || "";

  const focosDisponiveis = [
    "Funções Executivas",
    "Autonomia",
    "Coordenação Motora",
    "Comunicação",
    "Habilidades Sociais",
    "Leitura e Escrita",
    "Matemática",
    "Tecnologias Assistivas",
    "Organização e Planejamento",
  ];

  // Carregar estado salvo - sincronizar com paeeData (apenas quando paeeData mudar externamente)
  useEffect(() => {
    // Não sincronizar durante geração (evitar race condition)
    if (isGenerating) {
      return;
    }

    const conteudoSalvo = (paeeData.conteudo_plano_habilidades as string) || "";
    const statusSalvo = (paeeData.status_plano_habilidades as string) || "rascunho";
    const inputSalvo = (paeeData.input_original_plano_habilidades as { foco?: string }) || {};

    // Só atualizar se o conteúdo salvo for diferente E não estiver vazio
    if (conteudoSalvo && conteudoSalvo !== plano) {
      setPlano(conteudoSalvo);
    }

    if (statusSalvo && statusSalvo !== status) {
      setStatus((statusSalvo as typeof status) || "rascunho");
    }

    if (inputSalvo?.foco && inputSalvo.foco !== foco) {
      setFoco(inputSalvo.foco);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paeeData.conteudo_plano_habilidades, paeeData.status_plano_habilidades, paeeData.input_original_plano_habilidades, isGenerating]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    setIsGenerating(true); // Bloquear sincronização durante geração
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/plano-habilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focoTreino: foco,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();
      const planoTexto = (data.plano || "").trim();

      if (!planoTexto) {
        throw new Error("A IA retornou um plano vazio. Tente novamente.");
      }

      // Atualizar paeeData de forma atômica PRIMEIRO (antes de atualizar estado local)
      const novoPaeeData = {
        ...paeeData,
        conteudo_plano_habilidades: planoTexto,
        status_plano_habilidades: "revisao",
        input_original_plano_habilidades: { foco },
      };

      // Atualizar via onUpdate PRIMEIRO (isso atualiza o estado pai)
      onUpdate(novoPaeeData);

      // Depois atualizar estado local (para garantir sincronização)
      setPlano(planoTexto);
      setStatus("revisao");
      // Salvar no Supabase e aguardar
      if (student?.id) {
        try {
          const saveRes = await fetch(`/api/students/${student.id}/paee`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paee_data: novoPaeeData }),
          });

          if (!saveRes.ok) {
            console.error("Erro ao salvar plano no Supabase:", await saveRes.text());
          } else {
          }
        } catch (saveErr) {
          console.error("Erro ao salvar plano:", saveErr);
          // Não bloquear o fluxo, apenas logar o erro
        }
      }

    } catch (e) {
      console.error("Erro ao gerar plano:", e);
      setErro(e instanceof Error ? e.message : "Erro ao gerar plano");
    } finally {
      setLoading(false);
      setIsGenerating(false); // Liberar sincronização após geração
      aiLoadingStop();
    }
  };

  const limpar = () => {
    setPlano("");
    setStatus("rascunho");
    setFeedback("");
    updateField("conteudo_plano_habilidades", "");
    updateField("status_plano_habilidades", "rascunho");
  };

  return (
    <Card padding="none" className="p-6">
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
          <Target className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Plano de Habilidades</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-violet-700">Plano de Intervenção AEE:</strong> A IA cria um plano detalhado de intervenção
            a partir do foco de atendimento selecionado. O plano inclui 3 metas SMART (curto, médio e longo prazo) com estratégias
            de ensino, recursos necessários, frequência de intervenção e critérios de sucesso. Este plano orienta o trabalho do AEE.
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Foco do Atendimento</label>
            <select
              value={foco}
              onChange={(e) => setFoco(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              {focosDisponiveis.map((f: any) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Elaborando plano de intervenção...
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                📋 Gerar Plano
              </>
            )}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          {!plano || plano.trim() === "" ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ O plano foi gerado mas o conteúdo não está disponível.
                <br />
                <span className="text-xs">Status: {status} | Plano length: {plano?.length || 0} | Loading: {loading ? "sim" : "não"}</span>
                <br />
                <button
                  onClick={() => {
                    const conteudoSalvo = (paeeData.conteudo_plano_habilidades as string) || "";
                    if (conteudoSalvo) {
                      setPlano(conteudoSalvo);
                      setStatus("revisao");
                    }
                  }}
                  className="mt-2 px-3 py-1 bg-amber-600 text-white rounded text-xs"
                >
                  🔄 Tentar Recarregar do paeeData
                </button>
              </p>
            </div>
          ) : (
            <>
              <FormattedTextDisplay texto={plano} titulo="Plano de Habilidades Gerado" />
              <div className="text-xs text-slate-500">
                ✅ Plano carregado: {plano.length} caracteres
              </div>
            </>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_plano_habilidades", "aprovado");
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
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Plano de Habilidades - ${student?.name || ""}`}
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
              placeholder="Ex.: Incluir mais detalhes sobre estratégias de ensino, focar em recursos práticos..."
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
            <p className="text-sm font-semibold text-green-800">✅ Plano Validado e Pronto para Uso</p>
          </div>
          <FormattedTextDisplay texto={plano} titulo="Plano de Habilidades Final" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                updateField("status_plano_habilidades", "revisao");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ✏️ Editar Novamente
            </button>
            <PdfDownloadButton
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Plano de Habilidades - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
