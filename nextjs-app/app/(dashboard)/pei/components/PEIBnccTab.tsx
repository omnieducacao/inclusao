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
  Check,
  Info,
  AlertTriangle,
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
  const [sugerindoAtual, setSugerindoAtual] = useState(false);
  const [sugerindoAnteriores, setSugerindoAnteriores] = useState(false);
  const [motivoIAAtual, setMotivoIAAtual] = useState<string>("");
  const [motivoIAAnteriores, setMotivoIAAnteriores] = useState<string>("");
  const [erroSugestao, setErroSugestao] = useState<string>("");

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
      <div className="omni-aviso omni-aviso--atencao" role="status" style={{ maxWidth: "none" }}>
        <AlertTriangle className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__texto" style={{ marginTop: 0 }}>
            Escolha o <strong>ano ou série</strong> do estudante (ou a faixa de idade, na Educação Infantil) na aba{" "}
            <strong>Estudante</strong>.
          </div>
        </div>
      </div>
    );
  }

  if (nivel === "EI") {
    const idade = peiData.bncc_ei_idade || eiFaixas[0] || "";
    const campo = peiData.bncc_ei_campo || eiCampos[0] || "";
    const objetivosAtuais = peiData.bncc_ei_objetivos || [];

    return (
      <div style={{ display: "grid", gap: 16 }}>
        <p className="omni-apoio" style={{ margin: 0 }}>
          Educação Infantil: escolha a faixa de idade, o campo de experiência e os objetivos. A IA usa essas escolhas ao escrever o PEI.
        </p>
        {eiLoading ? (
          <p className="omni-apoio" role="status" style={{ margin: 0 }}>Carregando a BNCC da Educação Infantil...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="omni-campo" style={{ maxWidth: "none" }}>
              <label className="omni-campo__rotulo" htmlFor="bncc-ei-idade">Faixa de idade</label>
              <select
                id="bncc-ei-idade"
                className="omni-entrada"
                value={idade}
                onChange={(e) => updateField("bncc_ei_idade", e.target.value)}
              >
                {eiFaixas.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="omni-campo" style={{ maxWidth: "none" }}>
              <label className="omni-campo__rotulo" htmlFor="bncc-ei-campo">Campo de experiência</label>
              <select
                id="bncc-ei-campo"
                className="omni-entrada"
                value={campo}
                onChange={(e) => updateField("bncc_ei_campo", e.target.value)}
              >
                {eiCampos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="omni-campo" style={{ maxWidth: "none" }}>
          <label className="omni-campo__rotulo" htmlFor="bncc-ei-objetivos">Objetivos de aprendizagem</label>
          <select
            id="bncc-ei-objetivos"
            className="omni-entrada"
            multiple
            aria-describedby="bncc-ei-objetivos-ajuda"
            value={objetivosAtuais}
            onChange={(e) =>
              updateField(
                "bncc_ei_objetivos",
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            style={{ minHeight: 120 }}
          >
            {eiObjetivos.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <span id="bncc-ei-objetivos-ajuda" className="omni-campo__ajuda">Para escolher vários, segure Ctrl (ou Cmd, no Mac) enquanto clica.</span>
        </div>
        <div className="omni-aviso omni-aviso--info" role="note" style={{ maxWidth: "none" }}>
          <Info className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__texto" style={{ marginTop: 0 }}>
              Com os campos e objetivos escolhidos, siga para <strong>Texto do PEI</strong> para gerar o texto.
            </div>
          </div>
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
    setErroSugestao("");
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
      setErroSugestao("Não deu para a IA sugerir habilidades agora. Tente de novo em instantes ou marque as habilidades na lista.");
    } finally {
      if (tipo === "ano_atual") {
        setSugerindoAtual(false);
      } else {
        setSugerindoAnteriores(false);
      }
    }
  }

  if (blocosLoading) {
    return <p className="omni-apoio" role="status">Carregando as habilidades da BNCC...</p>;
  }

  if (!componentesAtual.length && !componentesAnt.length) {
    return (
      <div className="omni-aviso omni-aviso--atencao" role="status" style={{ maxWidth: "none" }}>
        <AlertTriangle className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__titulo">Nenhuma habilidade da BNCC para este ano ou série</div>
          <div className="omni-aviso__texto">Confira o ano ou série na aba Estudante. Se estiver certo, avise o suporte da Omnisfera.</div>
        </div>
      </div>
    );
  }

  const estiloDetalhe = { padding: 0, gap: 0 } as const;
  const estiloResumo = { cursor: "pointer", padding: "14px 16px", font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" } as const;
  const estiloResumoInterno = { cursor: "pointer", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, font: "700 14px/20px var(--font-sans)", color: "var(--tinta)" } as const;
  const estiloChipLongo = { borderRadius: "var(--o-radius-md)", alignItems: "flex-start", width: "100%", fontWeight: 400, padding: "8px 12px" } as const;

  function botaoAuxilioIA(tipo: "ano_atual" | "anos_anteriores", sugerindo: boolean) {
    return (
      <button
        type="button"
        onClick={() => sugerirHabilidadesIA(tipo)}
        disabled={sugerindo}
        aria-busy={sugerindo}
        className="omni-btn omni-btn--secundario omni-btn--pequeno"
      >
        {sugerindo ? (
          <>
            <OmniLoader size={12} />
            Sugerindo...
          </>
        ) : (
          <>
            <Sparkles style={{ width: 14, height: 14 }} aria-hidden />
            Sugestão da IA
          </>
        )}
      </button>
    );
  }

  function listaHabilidades(
    componentes: string[],
    fonte: Record<string, HabilidadeBncc[]>,
    origem: "ano_atual" | "anos_anteriores",
  ) {
    return componentes.map((disc) => {
      const habsDisciplina = fonte[disc] || [];
      const habsSelecionadas = habilidadesAtuais.filter((h) => h.disciplina === disc && h.origem === origem);
      const codigosSelecionados = new Set(habsSelecionadas.map(h => h.codigo));
      const sufixo = origem === "ano_atual" ? "ano" : "ant";

      return (
        <details key={disc} className="omni-cartao" style={{ ...estiloDetalhe, borderRadius: "var(--o-radius-md)" }}>
          <summary style={estiloResumoInterno}>
            <span>{disc}</span>
            <span className={`omni-estado ${habsSelecionadas.length > 0 ? "omni-estado--sucesso" : "omni-estado--neutro"}`}>
              {habsSelecionadas.length} marcada{habsSelecionadas.length !== 1 ? "s" : ""}
            </span>
          </summary>
          <fieldset style={{ border: 0, margin: 0, padding: 12, display: "grid", gap: 8, maxHeight: 300, overflowY: "auto" }}>
            <legend className="sr-only">{`Habilidades de ${disc}`}</legend>
            {habsDisciplina.map((h, i) => {
              const estaSelecionada = codigosSelecionados.has(h.codigo);
              return (
                <label key={`${disc}-${sufixo}-${i}`} className="omni-chip" style={estiloChipLongo}>
                  <input
                    type="checkbox"
                    checked={estaSelecionada}
                    onChange={(e) => {
                      const outras = habilidadesAtuais.filter((hab) => !(hab.disciplina === disc && hab.origem === origem && hab.codigo === h.codigo));
                      if (e.target.checked) {
                        const nova: HabilidadeBncc = {
                          disciplina: disc,
                          codigo: h.codigo,
                          descricao: h.descricao,
                          habilidade_completa: h.habilidade_completa || h.descricao,
                          origem,
                        };
                        updateField("habilidades_bncc_selecionadas", [...outras, nova]);
                      } else {
                        updateField("habilidades_bncc_selecionadas", outras);
                      }
                      updateField("habilidades_bncc_validadas", null);
                    }}
                  />
                  <Check className="omni-chip__marca" style={{ marginTop: 2 }} aria-hidden />
                  <span style={{ font: "400 14px/20px var(--font-sans)" }}>
                    <strong style={{ fontFamily: "var(--font-mono)", color: "var(--acao)", marginRight: 6 }}>{h.codigo}</strong>
                    {h.habilidade_completa || h.descricao}
                  </span>
                </label>
              );
            })}
          </fieldset>
        </details>
      );
    });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <p className="omni-apoio" style={{ margin: 0 }}>
        Escolha as habilidades do ano ou série do estudante. A IA usa só estas ao escrever o texto do PEI.
      </p>

      {erroSugestao && (
        <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
          <AlertTriangle className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__texto" style={{ marginTop: 0 }}>{erroSugestao}</div>
            <div className="omni-aviso__acoes">
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setErroSugestao("")}>
                Fechar aviso
              </button>
            </div>
          </div>
        </div>
      )}

      <details className="omni-cartao" style={estiloDetalhe} open={habilidadesAtuais.length > 0}>
        <summary style={estiloResumo}>
          Habilidades escolhidas ({habilidadesAtuais.length})
        </summary>
        <div style={{ padding: "0 16px 16px", display: "grid", gap: 12 }}>
          {habilidadesAtuais.length === 0 ? (
            <p className="omni-apoio" style={{ margin: 0 }}>
              Nenhuma habilidade escolhida. Marque nas listas abaixo ou peça uma sugestão da IA.
            </p>
          ) : (
            <>
              {(motivoIAAtual || motivoIAAnteriores) && (
                <div className="omni-aviso omni-aviso--info" role="note" style={{ maxWidth: "none" }}>
                  <Sparkles className="omni-aviso__icone" aria-hidden />
                  <div>
                    <div className="omni-aviso__titulo">Por que a IA escolheu estas habilidades</div>
                    {motivoIAAtual && <div className="omni-aviso__texto"><em>Ano atual:</em> {motivoIAAtual}</div>}
                    {motivoIAAnteriores && <div className="omni-aviso__texto"><em>Anos anteriores:</em> {motivoIAAnteriores}</div>}
                  </div>
                </div>
              )}
              <p className="omni-campo__ajuda" style={{ margin: 0 }}>Revise a lista. Use <strong>Remover</strong> para tirar uma habilidade ou <strong>Desmarcar todas</strong> para limpar.</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                {habilidadesAtuais.map((h, i) => (
                  <li key={`${h.disciplina}-${h.codigo}-${i}`} className="omni-cartao omni-cartao--plano" style={{ padding: "8px 12px", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, borderRadius: "var(--o-radius-md)" }}>
                    <div style={{ font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                      <strong style={{ color: "var(--tinta)" }}>{h.disciplina}</strong>
                      {" · "}
                      <strong style={{ fontFamily: "var(--font-mono)", color: "var(--acao)" }}>{h.codigo}</strong>
                      {" · "}
                      {h.habilidade_completa || h.descricao}
                    </div>
                    <button
                      type="button"
                      onClick={() => removerHabilidade(i)}
                      className="omni-btn omni-btn--discreto omni-btn--pequeno"
                      aria-label={`Remover ${h.codigo || "habilidade"}`}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
              <div>
                <button
                  type="button"
                  onClick={desmarcarTodas}
                  className="omni-btn omni-btn--secundario omni-btn--pequeno"
                >
                  Desmarcar todas
                </button>
              </div>
            </>
          )}
        </div>
      </details>

      {componentesAtual.length > 0 && (
        <details className="omni-cartao" style={estiloDetalhe} open>
          <summary style={estiloResumo}>
            Habilidades do ano ou série atual
          </summary>
          <div style={{ padding: "0 16px 16px", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p className="omni-campo__ajuda" style={{ margin: 0 }}>
                Marque as habilidades por {rotulo} (ano atual).
              </p>
              {botaoAuxilioIA("ano_atual", sugerindoAtual)}
            </div>
            {listaHabilidades(componentesAtual, anoAtual, "ano_atual")}
          </div>
        </details>
      )}

      {componentesAnt.length > 0 && (
        <details className="omni-cartao" style={estiloDetalhe}>
          <summary style={estiloResumo}>
            Habilidades de anos anteriores
          </summary>
          <div style={{ padding: "0 16px 16px", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p className="omni-campo__ajuda" style={{ margin: 0 }}>
                Habilidades de anos anteriores que merecem atenção.
              </p>
              {botaoAuxilioIA("anos_anteriores", sugerindoAnteriores)}
            </div>
            {listaHabilidades(componentesAnt, anosAnteriores, "anos_anteriores")}
          </div>
        </details>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={validarSelecao}
          disabled={habilidadesAtuais.length === 0}
          className="omni-btn omni-btn--primario"
        >
          Validar seleção
        </button>
        {peiData.habilidades_bncc_validadas && (
          <span className="omni-estado omni-estado--sucesso" role="status" style={{ whiteSpace: "normal" }}>
            <CheckCircle2 aria-hidden />
            {peiData.habilidades_bncc_validadas.length} habilidade(s) validada(s). A IA usa estas no texto do PEI.
          </span>
        )}
      </div>

      {habilidadesAtuais.length > 0 && !peiData.habilidades_bncc_validadas && (
        <p className="omni-apoio" style={{ margin: 0 }}>
          {habilidadesAtuais.length} habilidade(s) escolhida(s). Clique em <strong>Validar seleção</strong> para o professor confirmar.
        </p>
      )}

      <p className="omni-campo__ajuda" style={{ margin: 0 }}>
        Em <strong>Texto do PEI</strong>, a IA escreve a partir das habilidades confirmadas.
      </p>
    </div>
  );
}
