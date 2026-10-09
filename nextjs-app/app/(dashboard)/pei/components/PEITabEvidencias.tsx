"use client";

import type { PEIData } from "@/lib/pei";
import {
  LISTA_ALFABETIZACAO,
  EVIDENCIAS_PEDAGOGICO,
  EVIDENCIAS_COGNITIVO,
  EVIDENCIAS_COMPORTAMENTAL,
} from "@/lib/pei";
import { Search } from "lucide-react";

type TabEvidenciasProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  toggleChecklist: (field: keyof PEIData, value: string) => void;
};

export function PEITabEvidencias(props: TabEvidenciasProps) {
  const { peiData, updateField, toggleChecklist } = props;

  const grupos: Array<{ titulo: string; itens: readonly string[] }> = [
    { titulo: "Pedagógico", itens: EVIDENCIAS_PEDAGOGICO },
    { titulo: "Cognitivo", itens: EVIDENCIAS_COGNITIVO },
    { titulo: "Comportamental", itens: EVIDENCIAS_COMPORTAMENTAL },
  ];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Título da aba */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Search aria-hidden size={20} style={{ color: "var(--acao)" }} />
        <h3 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Evidências do dia a dia</h3>
      </div>

      <label className="omni-campo">
        <span className="omni-campo__rotulo">Hipótese de escrita</span>
        <select
          value={peiData.nivel_alfabetizacao || ""}
          onChange={(e) => updateField("nivel_alfabetizacao", e.target.value)}
          className="omni-entrada"
          aria-describedby="ajuda-hipotese-escrita"
        >
          {LISTA_ALFABETIZACAO.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <span id="ajuda-hipotese-escrita" className="omni-campo__ajuda">Em que ponto o estudante está na escrita (segundo Emilia Ferreiro).</span>
      </label>

      <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 16 }} aria-labelledby="titulo-evidencias">
        <div>
          <h4 id="titulo-evidencias" className="omni-cartao__titulo" style={{ margin: 0 }}>O que você observa na rotina</h4>
          <p className="omni-apoio" style={{ margin: "4px 0 0" }}>
            Marque o que aparece no dia a dia do estudante.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
          {grupos.map((g) => (
            <fieldset key={g.titulo} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "grid", gap: 10, alignContent: "start" }}>
              <legend className="omni-rotulo" style={{ padding: 0, marginBottom: 10 }}>{g.titulo}</legend>
              {g.itens.map((q) => (
                <label key={q} className="omni-caixa" style={{ fontSize: 15, lineHeight: "22px" }}>
                  <input
                    type="checkbox"
                    checked={!!(peiData.checklist_evidencias || {})[q]}
                    onChange={() => toggleChecklist(q, q)}
                  />
                  <span>{q}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      </section>

      <label className="omni-campo" style={{ maxWidth: "none" }}>
        <span className="omni-campo__rotulo">Observações rápidas <span className="omni-campo__opcional">(opcional)</span></span>
        <textarea
          value={peiData.orientacoes_especialistas || ""}
          onChange={(e) => updateField("orientacoes_especialistas", e.target.value)}
          rows={5}
          className="omni-entrada"
          placeholder="O que professores e especialistas observaram"
        />
      </label>
    </div>
  );
}
