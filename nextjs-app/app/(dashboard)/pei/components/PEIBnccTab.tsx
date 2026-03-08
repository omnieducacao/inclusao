"use client";

import React, { useState, useEffect } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { OmniLoader } from "@/components/OmniLoader";
import { detectarNivelEnsino } from "@/lib/pei";
import type { PEIData } from "@/lib/pei";
import type { EngineId } from "@/lib/ai-engines";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type HabilidadeBncc = { codigo: string; descricao: string; habilidade_completa?: string; disciplina?: string; origem?: string };

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

export function BNCCTab({
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
    } else if (nivel === "EFI" || nivel === "EFII" || nivel === "EM") {
      setBlocosLoading(true);
      const url = (nivel === "EFI" || nivel === "EFII") ? `/api/bncc/ef?serie=${encodeURIComponent(serie)}` : "/api/bncc/em";
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [sugerindoAtual, setSugerindoAtual] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [sugerindoAnteriores, setSugerindoAnteriores] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [motivoIAAtual, setMotivoIAAtual] = useState<string>("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
          diagnostico: peiData.diagnostico || "",
          barreiras: Array.isArray(peiData.barreiras_selecionadas) ? peiData.barreiras_selecionadas : [],
          potencias: Array.isArray(peiData.potencias) ? peiData.potencias : [],
          hiperfoco: peiData.hiperfoco || "",
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
      /* client-side */ console.error("Erro ao sugerir habilidades:", error);
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
                    <OmniLoader size={12} />
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
                    <OmniLoader size={12} />
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


