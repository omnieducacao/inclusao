"use client";
import React, { useState } from "react";
import type { MetaPei } from "@/lib/paee";
const FREQUENCIAS = ["Diária", "Semanal", "Quinzenal", "Mensal", "Sob demanda"];
export function FormPlanejamento({
  metasPei,
  hiperfoco,
  onGerar,
}: {
  metasPei: MetaPei[];
  hiperfoco: string;
  onGerar: (form: {
    duracao: number;
    frequencia: string;
    dataInicio: string;
    dataFim: string;
    foco: string;
    descricao: string;
    metasSelecionadas: MetaPei[];
  }) => void;
}) {
  const [duracao, setDuracao] = useState(12);
  const [frequencia, setFrequencia] = useState("Semanal");
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 84);
    return d.toISOString().slice(0, 10);
  });
  const [foco, setFoco] = useState(hiperfoco);
  const [descricao, setDescricao] = useState("");
  const [metasSel, setMetasSel] = useState<Record<string, boolean>>(
    Object.fromEntries(metasPei.map((m: any) => [m.id, true]))
  );

  const metasSelecionadas = metasPei.filter((m: any) => metasSel[m.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metasSelecionadas.length === 0) return;
    onGerar({ duracao, frequencia, dataInicio, dataFim, foco, descricao, metasSelecionadas });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <fieldset className="omni-campo" style={{ border: 0, padding: 0, margin: 0, maxWidth: "none" }}>
        <legend className="omni-campo__rotulo">Metas do PEI</legend>
        {metasPei.length === 0 ? (
          <p className="omni-apoio" style={{ margin: 0 }}>O PEI ainda não tem metas. Escreva as metas no PEI para montar o ciclo.</p>
        ) : (
          <div style={{ display: "grid", gap: 8, maxHeight: 160, overflowY: "auto", padding: 8, border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", background: "var(--superficie)" }}>
            {metasPei.map((m: any) => (
              <label key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", color: "var(--tinta)", fontSize: 14, lineHeight: "20px" }}>
                <input
                  type="checkbox"
                  style={{ marginTop: 3 }}
                  checked={metasSel[m.id] ?? true}
                  onChange={(e) => setMetasSel((s: any) => ({ ...s, [m.id]: e.target.checked }))}
                />
                <span>{m.tipo}: {m.descricao.slice(0, 60)}…</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <label className="omni-campo">
        <span className="omni-campo__rotulo">Duração (semanas)</span>
        <input type="number" className="omni-entrada" style={{ maxWidth: "none" }} min={4} max={24} value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} />
      </label>
      <label className="omni-campo">
        <span className="omni-campo__rotulo">Frequência</span>
        <select className="omni-entrada" style={{ maxWidth: "none" }} value={frequencia} onChange={(e) => setFrequencia(e.target.value)}>
          {FREQUENCIAS.map((f: string) => (
            <option key={f} value={f}>{f.replace("_", " ")}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2" style={{ gap: 12 }}>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Início</span>
          <input type="date" className="omni-entrada" style={{ maxWidth: "none" }} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </label>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Fim</span>
          <input type="date" className="omni-entrada" style={{ maxWidth: "none" }} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </label>
      </div>
      <label className="omni-campo">
        <span className="omni-campo__rotulo">Foco principal</span>
        <input type="text" className="omni-entrada" style={{ maxWidth: "none" }} value={foco} onChange={(e) => setFoco(e.target.value)} />
      </label>
      <label className="omni-campo">
        <span className="omni-campo__rotulo">Descrição <span className="omni-campo__opcional">(opcional)</span></span>
        <textarea className="omni-entrada" style={{ maxWidth: "none" }} value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
      </label>
      <button type="submit" className="omni-btn omni-btn--primario" style={{ justifySelf: "start" }} disabled={metasSelecionadas.length === 0}>
        Ver prévia do ciclo
      </button>
    </form>
  );
}
