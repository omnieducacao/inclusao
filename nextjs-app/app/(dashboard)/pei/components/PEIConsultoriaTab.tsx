"use client";

import React, { useState, useEffect } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { OmniLoader } from "@/components/OmniLoader";
import { detectarNivelEnsino } from "@/lib/pei";
import type { PEIData } from "@/lib/pei";
import type { EngineId } from "@/lib/ai-engines";
import {
  Sparkles,
  CheckCircle2,
  Info,
  AlertTriangle,
  Send,
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


import type { Student } from "@/lib/students";

export function ConsultoriaTab({
  peiData,
  updateField,
  serie,
  student,
}: {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  serie: string;
  student?: Student | null;
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
    EI: { nome: "EI — Educação Infantil", cor: "#4299e1", desc: "Foco: Campos de Experiência (BNCC) e rotina estruturante." },
    EFI: { nome: "EFAI — Ensino Fundamental Anos Iniciais", cor: "#48bb78", desc: "Foco: alfabetização, numeracia e consolidação de habilidades basais." },
    EFII: { nome: "EFAF — Ensino Fundamental Anos Finais", cor: "#ed8936", desc: "Foco: autonomia, funções executivas, organização e aprofundamento conceitual." },
    EM: { nome: "EM — Ensino Médio / EJA", cor: "#9f7aea", desc: "Foco: projeto de vida, áreas do conhecimento e estratégias de estudo." },
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
          studentId: student?.id || undefined,
          peiData,
          paeeData: student?.paee_data || undefined,
          dailyLogs: student?.daily_logs || undefined,
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
                      🔁 Gerar Novamente do Zero
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

          {/* Ajustando: caixa de feedback + gerar novamente */}
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
                  {loading ? "Gerando…" : "Gerar Novamente com Ajustes"}
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


