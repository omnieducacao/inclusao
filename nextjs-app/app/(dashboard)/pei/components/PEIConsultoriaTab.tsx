"use client";
import { useConfirmar } from "@/components/Confirmar";

import React, { useState, useEffect } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { OmniLoader } from "@/components/OmniLoader";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { detectarNivelEnsino } from "@/lib/pei";
import type { PEIData } from "@/lib/pei";
import type { EngineId } from "@/lib/ai-engines";
import {
  Sparkles,
  CheckCircle2,
  Info,
  AlertTriangle,
  Send,
  Circle,
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
  const { confirmar, dialogo } = useConfirmar();
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
      setErro("Informe a série em Estudo de caso → Dados do estudante.");
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
    red: "Red",
    blue: "Blue",
    green: "Green",
    yellow: "Yellow",
    orange: "Orange (reserva)",
  };

  // Onda 18: "O que a IA vai usar" com ícones e texto (antes eram emojis)
  const nEstrategias = estrategiasAcesso.length + estrategiasEnsino.length + estrategiasAvaliacao.length;
  const insumos: Array<{ ok: boolean; texto: string }> = [
    { ok: temDiagnostico, texto: `Diagnóstico: ${temDiagnostico ? "sim" : "não"}` },
    { ok: temHistorico, texto: `Histórico: ${temHistorico ? "sim" : "não"}` },
    { ok: temHiperfoco, texto: `Hiperfoco: ${temHiperfoco ? "sim" : "não"}` },
    { ok: potencias.length > 0, texto: `Potências: ${potencias.length}` },
    { ok: nBarreiras > 0, texto: `Barreiras: ${nBarreiras}` },
    { ok: redeApoio.length > 0, texto: `Rede de apoio: ${redeApoio.length}` },
    { ok: habValidadas.length > 0, texto: `Habilidades da BNCC: ${habValidadas.length || nHab}` },
    { ok: nEstrategias > 0, texto: `Estratégias: ${nEstrategias}` },
    { ok: medicamentos.length > 0, texto: `Medicamentos: ${medicamentos.length}` },
  ];
  const resumo: React.CSSProperties = { cursor: "pointer", font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" };
  const textoDetalhe: React.CSSProperties = { margin: "10px 0 0", display: "grid", gap: 6, font: "400 15px/22px var(--font-sans)", color: "var(--tinta-2)" };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {dialogo}
      {!serie ? (
        <div role="alert" aria-live="assertive" className="omni-aviso omni-aviso--atencao">
          <div>
            <div className="omni-aviso__texto">
              Informe a série do estudante em <strong>Estudo de caso → Dados do estudante</strong>. A IA escreve de um jeito para cada etapa de ensino.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Info box do segmento */}
          <div className="omni-aviso omni-aviso--info">
            <div>
              <div className="omni-aviso__titulo">A IA escreve para {segInfo.nome}</div>
              <div className="omni-aviso__texto">{segInfo.desc}</div>
            </div>
          </div>

          {/* Se ainda não tem texto ou voltou para rascunho: botões de geração */}
          {(!temTexto || statusValidacao === "rascunho") && (
            <>
              <details className="omni-opcoes-avancadas" style={{ border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", padding: "var(--space-3) var(--space-4)" }}>
                <summary style={{ cursor: "pointer", font: "600 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                  Opções avançadas · motor de IA: {engineNames[engine]}
                </summary>
                <p className="omni-apoio" style={{ margin: "8px 0" }}>Troque só se a geração falhar ou o texto não ficar bom. Orange é o reserva, usado quando os outros falham.</p>
                <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <legend className="omni-so-leitor">Motor de IA</legend>
                  {(["red", "blue", "green", "yellow", "orange"] as EngineId[]).map((e) => (
                    <label key={e} className="omni-caixa" style={{ font: "400 15px/22px var(--font-sans)" }}>
                      <input
                        type="radio"
                        name="engine"
                        value={e}
                        checked={engine === e}
                        onChange={() => setEngine(e)}
                      />
                      <span>{engineNames[e]}</span>
                    </label>
                  ))}
                </fieldset>
              </details>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => gerar(false)}
                    disabled={loading}
                    className="omni-btn omni-btn--primario"
                  >
                    {loading ? "Escrevendo o PEI…" : "Gerar o texto do PEI"}
                  </button>
                  <button
                    type="button"
                    onClick={() => gerar(true)}
                    disabled={loading}
                    className="omni-btn omni-btn--secundario"
                  >
                    {loading ? "Escrevendo…" : "Gerar guia prático para a sala"}
                  </button>
                </div>
                <div className="md:col-span-2">
                  <div className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 10 }}>
                    <p className="omni-rotulo" style={{ margin: 0 }}>O que a IA vai usar</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {insumos.map((x) => (
                        <li key={x.texto} style={{ display: "flex", alignItems: "center", gap: 6, font: "400 14px/20px var(--font-sans)", color: x.ok ? "var(--tinta)" : "var(--tinta-3)" }}>
                          {x.ok
                            ? <CheckCircle2 aria-hidden style={{ width: 16, height: 16, color: "var(--sucesso)", flex: "none" }} />
                            : <Circle aria-hidden style={{ width: 16, height: 16, color: "var(--tinta-3)", flex: "none" }} />}
                          <span>{x.texto}<span className="omni-so-leitor">{x.ok ? " (preenchido)" : " (vazio)"}</span></span>
                        </li>
                      ))}
                    </ul>
                    <p className="omni-campo__ajuda" style={{ margin: 0, paddingTop: 8, borderTop: "1px solid var(--borda)" }}>
                      Quanto mais completo o estudo de caso (etapa 1), mais preciso fica o texto.
                    </p>
                    {nHab > 0 && habValidadas.length === 0 && (
                      <div className="omni-aviso omni-aviso--atencao">
                        <div>
                          <div className="omni-aviso__texto">
                            Há habilidades escolhidas em <strong>Habilidades da BNCC</strong> que ainda não foram confirmadas. Confirme lá para a IA usar.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Se revisão/aprovado: mostrar texto e permitir aprovar/ajustar */}
          {temTexto && (statusValidacao === "revisao" || statusValidacao === "aprovado") && (
            <>
              <details className="omni-cartao" style={{ padding: "14px 16px" }}>
                <summary style={resumo}>Como a IA chegou a este texto</summary>
                <div style={textoDetalhe}>
                  <p style={{ margin: 0 }}>
                    <strong>Gerado por {engineNames[engine]}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>1. Dados do estudante:</strong> série <strong>{serie}</strong>, diagnóstico <strong>{peiData.diagnostico || "em observação"}</strong>.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>2. Barreiras:</strong> a IA considerou <strong>{nBarreiras}</strong> barreiras junto com a BNCC e o DUA (Desenho Universal para a Aprendizagem).
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>3. Exemplo de ponto de atenção:</strong> priorizou adaptações para reduzir o impacto de <strong>{exemploBarreira}</strong>.
                  </p>
                </div>
              </details>

              <details className="omni-cartao" style={{ padding: "14px 16px" }}>
                <summary style={resumo}>Cuidados que a IA segue</summary>
                <ul style={{ ...textoDetalhe, paddingLeft: 18 }}>
                  <li><strong>Remédios:</strong> não sugere dose nem medicação; só aponta o que merece atenção.</li>
                  <li><strong>Dados pessoais:</strong> evite colocar dados pessoais que não sejam necessários.</li>
                  <li><strong>Leis:</strong> as sugestões seguem a LBI (Lei Brasileira de Inclusão), o DUA e as adaptações razoáveis.</li>
                </ul>
              </details>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                  <h4 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Texto do PEI</h4>
                  {statusValidacao === "aprovado"
                    ? <span className="omni-estado omni-estado--sucesso">Revisado e aprovado</span>
                    : <span className="omni-estado omni-estado--info">Gerado com IA · revise antes de aprovar</span>}
                </div>
                {/* Onda 18: texto com títulos e listas formatados (antes "##" e "*" apareciam crus) */}
                <div
                  role="region"
                  aria-live="polite"
                  aria-label="Texto do PEI escrito pela IA"
                  className="omni-cartao omni-cartao--plano"
                  style={{ color: "var(--tinta)" }}
                >
                  <FormattedTextDisplay texto={(peiData.ia_sugestao || "").replace(/\[.*?\]/g, "")} />
                </div>
              </div>

              <p className="omni-apoio" style={{ margin: 0, paddingTop: 12, borderTop: "1px solid var(--borda)" }}>A IA pode errar. Leia tudo e ajuste o que não combina com o estudante antes de aprovar.</p>

              {statusValidacao === "revisao" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("status_validacao_pei", "aprovado");
                    }}
                    className="omni-btn omni-btn--primario"
                  >
                    Aprovar o texto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("status_validacao_pei", "ajustando");
                    }}
                    className="omni-btn omni-btn--secundario"
                  >
                    Pedir um ajuste à IA
                  </button>
                </div>
              )}

              {statusValidacao === "aprovado" && (
                <>
                  <p className="omni-apoio" style={{ margin: 0 }}>Próximo passo: tornar o PEI vigente (etapa 3).</p>
                  <label className="omni-campo" style={{ maxWidth: "none" }}>
                    <span className="omni-campo__rotulo">Editar o texto <span className="omni-campo__opcional">(opcional)</span></span>
                    <textarea
                      value={peiData.ia_sugestao || ""}
                      onChange={(e) => updateField("ia_sugestao", e.target.value)}
                      rows={12}
                      className="omni-entrada"
                      style={{ maxWidth: "none", minHeight: 320, lineHeight: "24px" }}
                    />
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <button
                      type="button"
                      onClick={async () => {
                        // Onda 5: apagar o texto do PEI pede confirmação
                        const ok = await confirmar({
                          titulo: "Apagar o texto do PEI e gerar de novo?",
                          texto: "O texto atual do PEI, com as suas edições, será apagado. Se quiser só mudar uma parte, use \"Gerar de novo com o ajuste\".",
                          acao: "Apagar e gerar de novo",
                          cancelar: "Manter o texto",
                          perigo: true,
                        });
                        if (!ok) return;
                        updateField("ia_sugestao", "");
                        updateField("status_validacao_pei", "rascunho");
                      }}
                      className="omni-btn omni-btn--perigo"
                    >
                      Apagar e gerar de novo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField("status_validacao_pei", "revisao");
                      }}
                      className="omni-btn omni-btn--secundario"
                    >
                      Voltar para a revisão
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Ajustando: caixa de ajuste + gerar novamente */}
          {statusValidacao === "ajustando" && (
            <section className="omni-cartao" style={{ display: "grid", gap: 12 }}>
              <label className="omni-campo" style={{ maxWidth: "none" }}>
                <span className="omni-campo__rotulo">O que a IA deve mudar no texto?</span>
                <textarea
                  value={feedbackAjuste}
                  onChange={(e) => setFeedbackAjuste(e.target.value)}
                  placeholder="Ex.: foque mais na alfabetização…"
                  rows={4}
                  className="omni-entrada"
                  style={{ maxWidth: "none" }}
                />
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => gerar(false, feedbackAjuste)}
                  disabled={loading}
                  className="omni-btn omni-btn--primario"
                >
                  {loading ? "Gerando…" : "Gerar de novo com o ajuste"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateField("status_validacao_pei", "revisao");
                    setFeedbackAjuste("");
                  }}
                  className="omni-btn omni-btn--secundario"
                >
                  Cancelar
                </button>
              </div>
            </section>
          )}

          {/* Se não tem texto ainda, mostrar textarea vazio */}
          {!temTexto && statusValidacao === "rascunho" && (
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Texto do PEI</span>
              <textarea
                value={peiData.ia_sugestao || ""}
                onChange={(e) => updateField("ia_sugestao", e.target.value)}
                rows={14}
                className="omni-entrada"
                style={{ maxWidth: "none" }}
                placeholder="Gere o texto com os botões acima, ou escreva aqui."
              />
            </label>
          )}
        </>
      )}
      {erro && (
        <div className="omni-aviso omni-aviso--erro" role="alert">
          <div><div className="omni-aviso__texto">{erro}</div></div>
        </div>
      )}
    </div>
  );
}


