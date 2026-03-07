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
import { gerarPdfJornada } from "@/lib/paee-pdf-export";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { fmtDataIso, badgeStatus } from "@/lib/paee";
import { OmniLoader } from "@/components/OmniLoader";
export function JornadaTab({
  student,
  ciclos,
  cicloAtivo,
  cicloSelecionadoPlanejamento,
  cicloSelecionadoExecucao,
  peiData,
  paeeData,
  onUpdate,
  engine,
  onEngineChange,
}: {
  student: StudentFull;
  ciclos: CicloPAEE[];
  cicloAtivo: CicloPAEE | null | undefined;
  cicloSelecionadoPlanejamento: CicloPAEE | null;
  cicloSelecionadoExecucao: CicloPAEE | null;
  peiData: Record<string, unknown>;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
}) {
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";

  // Opções de origem
  const opcoesOrigem = [
    { value: "ciclo", label: "Execução e Metas SMART (ciclo)" },
    { value: "barreiras", label: "Mapear Barreiras" },
    { value: "plano-habilidades", label: "Plano de Habilidades" },
    { value: "tecnologia-assistiva", label: "Tecnologia Assistiva" },
  ];

  const [origemSelecionada, setOrigemSelecionada] = useState("ciclo");
  const [estilo, setEstilo] = useState("");
  const [texto, setTexto] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "ajustando" | "aprovado">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [mapaMental, setMapaMental] = useState<string | null>(null);
  const [mapaLoading, setMapaLoading] = useState(false);
  const [mapaErro, setMapaErro] = useState<string | null>(null);
  const [usarHiperfocoTema, setUsarHiperfocoTema] = useState(true);
  const [temaMapa, setTemaMapa] = useState(hiperfoco);

  // Ciclo de execução para usar na jornada
  const cicloExecucao = cicloSelecionadoExecucao || (cicloAtivo?.tipo === "execucao_smart" ? cicloAtivo : ciclos.find((c: any) => c.tipo === "execucao_smart"));

  // Conteúdos das outras abas - verificar se estão disponíveis
  const conteudoBarreiras = (paeeData.conteudo_diagnostico_barreiras as string) || "";
  const conteudoPlano = (paeeData.conteudo_plano_habilidades as string) || "";
  const conteudoTec = (paeeData.conteudo_tecnologia_assistiva as string) || "";

  // Log para debug
  useEffect(() => {
  }, [conteudoBarreiras, conteudoPlano, conteudoTec]);

  // Chave única para esta jornada (por origem)
  const chaveJornada = origemSelecionada === "ciclo"
    ? `ciclo_${cicloExecucao?.ciclo_id || "preview"}`
    : origemSelecionada;

  // Carregar estado salvo
  useEffect(() => {
    const jornadas = (paeeData.jornadas_gamificadas || {}) as Record<string, {
      texto?: string;
      status?: string;
      feedback?: string;
      origem?: string;
      imagem_bytes?: string;
    }>;
    const estado = jornadas[chaveJornada];
    if (estado) {
      setTexto(estado.texto || "");
      setStatus((estado.status as typeof status) || "rascunho");
      setFeedback(estado.feedback || "");
      if (estado.imagem_bytes) {
        setMapaMental(estado.imagem_bytes);
      }
    }
  }, [paeeData, chaveJornada]);

  const updateField = (key: string, value: unknown) => {
    updateFields({ [key]: value });
  };

  const updateFields = (fields: Record<string, unknown>) => {
    const jornadas = (paeeData.jornadas_gamificadas || {}) as Record<string, unknown>;
    jornadas[chaveJornada] = { ...(jornadas[chaveJornada] as Record<string, unknown> || {}), ...fields };
    onUpdate({ ...paeeData, jornadas_gamificadas: jornadas });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const body: Record<string, unknown> = {
        origem: origemSelecionada,
        engine,
        estudante: {
          nome: student.name,
          serie: student.grade,
          hiperfoco,
          ia_sugestao: ((peiData.ia_sugestao as string) || "").slice(0, 1500) || undefined,
        },
      };

      if (estilo.trim()) {
        body.estilo = estilo;
      }

      if (feedbackAjuste || feedback) {
        body.feedback = feedbackAjuste || feedback;
      }

      if (origemSelecionada === "ciclo") {
        if (!cicloExecucao) {
          setErro("Selecione ou gere um ciclo na aba **Execução e Metas SMART** primeiro.");
          return;
        }
        body.ciclo = cicloExecucao;
      } else {
        let textoFonte = "";
        let nomeFonte = "";
        if (origemSelecionada === "barreiras") {
          textoFonte = conteudoBarreiras;
          nomeFonte = "Mapear Barreiras";
        } else if (origemSelecionada === "plano-habilidades") {
          textoFonte = conteudoPlano;
          nomeFonte = "Plano de Habilidades";
        } else if (origemSelecionada === "tecnologia-assistiva") {
          textoFonte = conteudoTec;
          nomeFonte = "Tecnologia Assistiva";
        }
        if (!textoFonte || !textoFonte.trim()) {
          console.error(`❌ Conteúdo não encontrado para ${nomeFonte}:`, {
            origem: origemSelecionada,
            conteudoPlano: conteudoPlano ? `${conteudoPlano.length} chars` : "vazio",
            conteudoBarreiras: conteudoBarreiras ? `${conteudoBarreiras.length} chars` : "vazio",
            conteudoTec: conteudoTec ? `${conteudoTec.length} chars` : "vazio",
          });
          setErro(`Gere o conteúdo na aba **${nomeFonte}** primeiro. O conteúdo precisa estar salvo e aprovado.`);
          return;
        }

        body.texto_fonte = textoFonte;
        body.nome_fonte = nomeFonte;
      }

      const res = await fetch("/api/paee/jornada-gamificada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar jornada.");
      setTexto(data.texto || "");
      setStatus("revisao");
      updateFields({ texto: data.texto, status: "revisao", origem: origemSelecionada });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const limpar = () => {
    setTexto("");
    setStatus("rascunho");
    setFeedback("");
    setMapaMental(null);
    updateFields({ texto: "", status: "rascunho", feedback: "", imagem_bytes: null });
  };

  const gerarMapaMental = async () => {
    setMapaLoading(true);
    setMapaErro(null);
    aiLoadingStart("yellow", "paee");
    try {
      const res = await fetch("/api/paee/mapa-mental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto,
          nome: student.name,
          hiperfoco: usarHiperfocoTema ? temaMapa : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar mapa mental.");
      setMapaMental(data.image || null);
      updateField("imagem_bytes", data.image);
    } catch (e) {
      setMapaErro(e instanceof Error ? e.message : "Erro ao gerar mapa mental.");
    } finally {
      setMapaLoading(false);
      aiLoadingStop();
    }
  };

  const downloadCSV = () => {
    const linhas = texto.split("\n").map((l) => l.trim() || "");
    const csvContent = linhas.map((l) => `"${l.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Jornada_${student.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMapaPNG = () => {
    if (!mapaMental) return;

    // Se for base64, converter para blob
    let blob: Blob;
    if (mapaMental.startsWith("data:image")) {
      const base64Data = mapaMental.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: "image/png" });
    } else {
      // Se for URL, fazer fetch
      fetch(mapaMental)
        .then((res) => res.blob())
        .then((b) => {
          const url = URL.createObjectURL(b);
          const a = document.createElement("a");
          a.href = url;
          a.download = `MapaMental_${student.name.replace(/\s+/g, "_")}.png`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error("Erro ao baixar mapa mental:", err);
          alert("Erro ao baixar imagem. Tente novamente.");
        });
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MapaMental_${student.name.replace(/\s+/g, "_")}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card padding="none" className="p-6">
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
          <Map className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Jornada Gamificada</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            <strong className="text-violet-700">Missão do(a) {student.name}:</strong> Transforme o planejamento do AEE em uma
            jornada gamificada motivadora para o estudante e a família. A IA cria um roteiro com linguagem de conquistas, missões
            e recompensas, sem incluir diagnósticos ou informações clínicas.
          </p>
          <div className="p-3 bg-linear-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg">
            <p className="text-sm text-violet-800">
              Cada aba do PAEE pode virar uma <strong>jornada gamificada</strong>. Escolha a <strong>origem</strong> na lista abaixo.
              ⚠️ O material gerado será entregue ao estudante — diagnósticos e dados clínicos não são incluídos.
            </p>
          </div>
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Gerar jornada a partir de:</label>
            <select
              value={origemSelecionada}
              onChange={(e) => setOrigemSelecionada(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {opcoesOrigem.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {origemSelecionada === "ciclo" && cicloExecucao && (
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-slate-700">Foco do ciclo</div>
                  <div className="text-slate-600">{cicloExecucao.config_ciclo?.foco_principal || "—"}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Período</div>
                  <div className="text-slate-600">
                    {cicloExecucao.config_ciclo?.data_inicio || "—"} → {cicloExecucao.config_ciclo?.data_fim || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Preferência de estilo (opcional)
            </label>
            <input
              type="text"
              value={estilo}
              onChange={(e) => setEstilo(e.target.value)}
              placeholder="Ex: super-heróis, exploração, futebol..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <EngineSelector value={engine} onChange={onEngineChange} />

          <p className="text-sm text-slate-600">
            <strong>Como funciona:</strong> O assistente transforma o conteúdo da aba escolhida em uma missão gamificada para o estudante e a família. O texto final não inclui diagnósticos — apenas desafios e conquistas.
          </p>

          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading || (origemSelecionada === "ciclo" && !cicloExecucao)}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? "⏳ Criando missão..." : "✨ Criar Roteiro Gamificado"}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Missão gerada! Revise abaixo e aprove ou solicite ajustes.</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-white">
            <h4 className="font-semibold text-slate-800 mb-2">Missão (prévia)</h4>
            <FormattedTextDisplay texto={texto} titulo="" />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Mapa mental do roteiro</div>
            <p className="text-xs text-slate-600">
              Gere um mapa mental visual a partir do roteiro gamificado. Estrutura: nó central → missões → etapas. O mapa não inclui informações clínicas.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={usarHiperfocoTema}
                  onChange={(e) => {
                    setUsarHiperfocoTema(e.target.checked);
                    if (e.target.checked) setTemaMapa(hiperfoco);
                  }}
                  className="rounded"
                />
                <span>Usar hiperfoco do estudante como tema do mapa mental (nó central)</span>
              </label>
              {usarHiperfocoTema && (
                <input
                  type="text"
                  value={temaMapa}
                  onChange={(e) => setTemaMapa(e.target.value)}
                  placeholder="Ex: dinossauros, espaço, música..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              )}
            </div>
            {mapaMental && (
              <div className="space-y-3">
                <div className="border-2 border-violet-200 rounded-lg p-2 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mapaMental}
                    alt="Mapa mental da jornada"
                    className="max-w-full rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={downloadMapaPNG}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
                >
                  📥 Baixar PNG do Mapa Mental
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={gerarMapaMental}
              disabled={mapaLoading || !texto.trim()}
              className="px-4 py-2 bg-violet-100 text-violet-800 rounded-lg text-sm hover:bg-violet-200 disabled:opacity-50 flex items-center gap-2"
            >
              {mapaLoading ? "⏳ Gerando ilustração..." : (
                <>
                  <Map className="w-4 h-4" />
                  Gerar mapa mental do roteiro
                </>
              )}
            </button>
            {mapaErro && <p className="text-red-600 text-sm">{mapaErro}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Aprovar Missão
            </button>
            <button
              type="button"
              onClick={() => setStatus("ajustando")}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              🔄 Solicitar Ajustes
            </button>
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800">⚠️ Descreva o que ajustar e regenere.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">O que ajustar?</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex: mais curto, linguagem infantil..."
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
              {loading ? "⏳ Reescrevendo..." : "🔄 Gerar Novamente com Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ↩️ Voltar
            </button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Missão aprovada! Edite se quiser e exporte em PDF ou CSV.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Edição final (opcional)</label>
            <textarea
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                updateField("texto", e.target.value);
              }}
              rows={12}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Mapa mental do roteiro</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={usarHiperfocoTema}
                  onChange={(e) => {
                    setUsarHiperfocoTema(e.target.checked);
                    if (e.target.checked) setTemaMapa(hiperfoco);
                  }}
                  className="rounded"
                />
                <span>Usar hiperfoco do estudante como tema do mapa mental (nó central)</span>
              </label>
              {usarHiperfocoTema && (
                <input
                  type="text"
                  value={temaMapa}
                  onChange={(e) => setTemaMapa(e.target.value)}
                  placeholder="Ex: dinossauros, espaço, música..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              )}
            </div>
            {mapaMental && (
              <div className="space-y-3">
                <div className="border-2 border-violet-200 rounded-lg p-2 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mapaMental}
                    alt="Mapa mental da jornada"
                    className="max-w-full rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={downloadMapaPNG}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
                >
                  📥 Baixar PNG do Mapa Mental
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={gerarMapaMental}
              disabled={mapaLoading || !texto.trim()}
              className="px-4 py-2 bg-violet-100 text-violet-800 rounded-lg text-sm hover:bg-violet-200 disabled:opacity-50 flex items-center gap-2"
            >
              {mapaLoading ? "⏳ Gerando ilustração..." : (
                <>
                  <Map className="w-4 h-4" />
                  Gerar mapa mental do roteiro
                </>
              )}
            </button>
            {mapaErro && <p className="text-red-600 text-sm">{mapaErro}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => gerarPdfJornada(texto, student.name)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2"
            >
              📄 Baixar PDF da Jornada
            </button>
            <button
              type="button"
              onClick={downloadCSV}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"
            >
              📊 Baixar CSV (importar no Sheets)
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
