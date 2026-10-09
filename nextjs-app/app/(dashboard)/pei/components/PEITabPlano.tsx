"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  ESTRATEGIAS_ACESSO,
  ESTRATEGIAS_ENSINO,
  ESTRATEGIAS_AVALIACAO,
  STATUS_META,
  PARECER_GERAL,
  PROXIMOS_PASSOS,
} from "@/lib/pei";
import { Puzzle, Info, Check } from "lucide-react";

type TabPlanoProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
};

// Onda 18: grupo de estratégias com chips do design system
function GrupoEstrategias({
  id,
  titulo,
  legenda,
  opcoes,
  selecionadas,
  onChange,
  children,
}: {
  id: string;
  titulo: string;
  legenda: string;
  opcoes: string[];
  selecionadas: string[];
  onChange: (novas: string[]) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="omni-cartao" aria-labelledby={`${id}-titulo`} style={{ gap: 12 }}>
      <h4 id={`${id}-titulo`} className="omni-cartao__titulo" style={{ margin: 0 }}>{titulo}</h4>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="omni-campo__rotulo" style={{ marginBottom: 6 }}>{legenda}</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {opcoes.map((estr) => (
            <label key={estr} className="omni-chip">
              <input
                type="checkbox"
                checked={selecionadas.includes(estr)}
                onChange={(e) => {
                  const novas = e.target.checked
                    ? [...selecionadas, estr]
                    : selecionadas.filter((item) => item !== estr);
                  onChange(novas);
                }}
              />
              <Check className="omni-chip__marca" aria-hidden />
              {estr}
            </label>
          ))}
        </div>
      </fieldset>
      {children}
    </section>
  );
}

export function PEITabPlano(props: TabPlanoProps) {
  const { peiData, updateField } = props;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <h3 style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <Puzzle style={{ width: 20, height: 20, color: "var(--acao)" }} aria-hidden />
        Plano de ação
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GrupoEstrategias
          id="plano-acesso"
          titulo="1. Acesso"
          legenda="Recursos de acesso"
          opcoes={ESTRATEGIAS_ACESSO}
          selecionadas={peiData.estrategias_acesso || []}
          onChange={(novas) => updateField("estrategias_acesso", novas)}
        >
          <div className="omni-campo" style={{ maxWidth: "none" }}>
            <label className="omni-campo__rotulo" htmlFor="plano-outros-acesso">
              Outro recurso de acesso <span className="omni-campo__opcional">(opcional)</span>
            </label>
            <input
              id="plano-outros-acesso"
              type="text"
              className="omni-entrada"
              value={peiData.outros_acesso || ""}
              onChange={(e) => updateField("outros_acesso", e.target.value)}
              placeholder="Ex.: prova em sala separada, letra tamanho 18, papel pautado ampliado…"
            />
          </div>
        </GrupoEstrategias>

        <GrupoEstrategias
          id="plano-ensino"
          titulo="2. Ensino (metodologias)"
          legenda="Estratégias de ensino"
          opcoes={ESTRATEGIAS_ENSINO}
          selecionadas={peiData.estrategias_ensino || []}
          onChange={(novas) => updateField("estrategias_ensino", novas)}
        >
          <div className="omni-campo" style={{ maxWidth: "none" }}>
            <label className="omni-campo__rotulo" htmlFor="plano-outros-ensino">
              Outra estratégia de ensino <span className="omni-campo__opcional">(opcional)</span>
            </label>
            <input
              id="plano-outros-ensino"
              type="text"
              className="omni-entrada"
              value={peiData.outros_ensino || ""}
              onChange={(e) => updateField("outros_ensino", e.target.value)}
              placeholder="Ex.: sequência de atividades com apoio de imagens e um exemplo resolvido…"
            />
          </div>
        </GrupoEstrategias>

        <GrupoEstrategias
          id="plano-avaliacao"
          titulo="3. Avaliação (formato)"
          legenda="Estratégias de avaliação"
          opcoes={ESTRATEGIAS_AVALIACAO}
          selecionadas={peiData.estrategias_avaliacao || []}
          onChange={(novas) => updateField("estrategias_avaliacao", novas)}
        >
          <p className="omni-campo__ajuda" style={{ margin: 0 }}>
            Dica: junte o formato da avaliação com o acesso (tempo e ambiente) para diminuir as barreiras.
          </p>
        </GrupoEstrategias>
      </div>

      <div className="omni-aviso omni-aviso--info" role="note" style={{ maxWidth: "none" }}>
        <Info className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__texto" style={{ marginTop: 0 }}>
            O plano de ação mostra à IA o que você já pretende fazer na prática.
          </div>
        </div>
      </div>
    </div>
  );
}
