"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  LISTAS_BARREIRAS,
  LISTA_POTENCIAS,
  LISTA_ALFABETIZACAO,
  NIVEIS_SUPORTE,
  ESTRATEGIAS_ACESSO,
  ESTRATEGIAS_ENSINO,
  ESTRATEGIAS_AVALIACAO,
} from "@/lib/pei";
import { Radar, Info, FileText, Settings, X } from "lucide-react";
import { BarreirasDominio, NivelSuporteRange } from "./PEIBarreiras";

type TabMapeamentoProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  hiperfoco: string;
  /** Onda 2: o estudo de caso mostra partes do mapeamento em passos diferentes */
  secao?: "tudo" | "potencias" | "barreiras";
};

export function PEITabMapeamento(props: TabMapeamentoProps) {
  const { peiData, updateField, hiperfoco } = props;
  const secao = props.secao ?? "tudo";
  const mostrar = (parte: "potencias" | "barreiras" | "resumo") => secao === "tudo" || secao === parte;

  const potencias = Array.isArray(peiData.potencias) ? peiData.potencias : [];
  const tituloSecao = { font: "800 16px/22px var(--font-sans)", color: "var(--tinta)", margin: 0, display: "flex", alignItems: "center", gap: 8 } as const;
  const iconeSecao = { width: 18, height: 18, color: "var(--acao)" } as const;
  const divisor = <hr style={{ border: 0, borderTop: "1px solid var(--borda)", margin: 0 }} />;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {secao === "tudo" && (
        <div style={{ display: "grid", gap: 6 }}>
          <h3 style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Radar style={{ width: 20, height: 20, color: "var(--acao)" }} aria-hidden />
            Mapeamento
          </h3>
          <p className="omni-apoio" style={{ margin: 0 }}>
            Registre as forças, o hiperfoco e as barreiras do estudante. Para cada barreira marcada, diga quanto apoio é preciso.
          </p>
        </div>
      )}

      {mostrar("potencias") && (
        <section className="omni-cartao" aria-labelledby="mapeamento-potencias">
          <h4 id="mapeamento-potencias" style={tituloSecao}>
            <FileText style={iconeSecao} aria-hidden />
            Potencialidades e hiperfoco
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="omni-campo" style={{ maxWidth: "none" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label className="omni-campo__rotulo" htmlFor="mapeamento-hiperfoco">
                  Hiperfoco <span className="omni-campo__opcional">(se houver)</span>
                </label>
                <HelpTooltip fieldId="pei-hiperfoco" />
              </span>
              <input
                id="mapeamento-hiperfoco"
                type="text"
                className="omni-entrada"
                value={peiData.hiperfoco || ""}
                onChange={(e) => updateField("hiperfoco", e.target.value)}
                placeholder="Ex.: dinossauros, Minecraft, mapas, carros, desenho..."
              />
            </div>
            <div className="omni-campo" style={{ maxWidth: "none" }}>
              <label className="omni-campo__rotulo" htmlFor="mapeamento-potencias-select">Potencialidades e pontos fortes</label>
              <select
                id="mapeamento-potencias-select"
                className="omni-entrada"
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
              >
                <option value="">Escolha para adicionar...</option>
                {LISTA_POTENCIAS.filter((p) => !(peiData.potencias || []).includes(p)).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {potencias.length > 0 && (
                <ul aria-label="Potencialidades escolhidas" style={{ listStyle: "none", margin: "4px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {potencias.map((p) => (
                    <li key={p} className="omni-chip" style={{ cursor: "default", paddingRight: 6, background: "var(--acao-suave)", borderColor: "var(--acao)" }}>
                      {p}
                      <button
                        type="button"
                        className="omni-btn omni-btn--discreto omni-btn--pequeno omni-btn--icone"
                        style={{ minHeight: 24, width: 24, padding: 0 }}
                        aria-label={`Tirar ${p}`}
                        onClick={() => {
                          const atual = peiData.potencias || [];
                          updateField("potencias", atual.filter((item) => item !== p));
                        }}
                      >
                        <X style={{ width: 14, height: 14 }} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {secao === "tudo" && divisor}

      {mostrar("barreiras") && (
        <section style={{ display: "grid", gap: 12 }} aria-labelledby="mapeamento-barreiras">
          <div style={{ display: "grid", gap: 4 }}>
            <h4 id="mapeamento-barreiras" style={tituloSecao}>
              <Settings style={iconeSecao} aria-hidden />
              Barreiras e nível de apoio
            </h4>
            <p className="omni-apoio" style={{ margin: 0 }}>
              Marque as barreiras que você observa e diga quanto apoio o estudante precisa na rotina da escola.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
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
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
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
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <BarreirasDominio
                dominio="Socioemocional"
                opcoes={LISTAS_BARREIRAS["Socioemocional"] || []}
                peiData={peiData}
                updateField={updateField}
              />
            </div>
          </div>
        </section>
      )}

      {secao === "tudo" && divisor}

      {secao === "tudo" && (
        <section style={{ display: "grid", gap: 12 }} aria-labelledby="mapeamento-resumo">
          <h4 id="mapeamento-resumo" style={tituloSecao}>
            <FileText style={iconeSecao} aria-hidden />
            Resumo do mapeamento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 6 }}>
                <span className="omni-rotulo">Hiperfoco</span>
                {peiData.hiperfoco ? (
                  <span className="omni-cartao__titulo">{peiData.hiperfoco}</span>
                ) : (
                  <span className="omni-apoio">Não informado</span>
                )}
              </div>
              <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 6 }}>
                <span className="omni-rotulo">Potencialidades</span>
                {potencias.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(peiData.potencias || []).map((p, i) => (
                      <span key={i} className="omni-estado omni-estado--sucesso">{p}</span>
                    ))}
                  </div>
                ) : (
                  <span className="omni-apoio">Nenhuma escolhida</span>
                )}
              </div>
            </div>
            <div>
              {(() => {
                const barreiras = peiData.barreiras_selecionadas || {};
                const totalBar = Object.values(barreiras).reduce((acc, arr) => acc + (arr?.length || 0), 0);
                if (totalBar === 0) {
                  return (
                    <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 6 }}>
                      <span className="omni-rotulo">Barreiras</span>
                      <span className="omni-apoio">Nenhuma marcada</span>
                    </div>
                  );
                }
                return (
                  <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 10 }}>
                    <span className="omni-rotulo">Barreiras marcadas: {totalBar}</span>
                    {Object.entries(barreiras).map(([dom, vals]) => {
                      if (!vals || vals.length === 0) return null;
                      return (
                        <div key={dom} style={{ display: "grid", gap: 4 }}>
                          <span style={{ font: "700 14px/20px var(--font-sans)", color: "var(--tinta)" }}>{dom}</span>
                          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                            {vals.map((b) => {
                              const chave = `${dom}_${b}`;
                              const nivel = (peiData.niveis_suporte || {})[chave] || "Monitorado";
                              return (
                                <li key={b} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                                  {b}
                                  <span className="omni-estado omni-estado--atencao">{nivel}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
