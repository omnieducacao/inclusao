"use client";

import { useState } from "react";
import { LinhaEscolha, Pilula } from "@/components/ferramenta/Mesa";
import { ONDE, LIMITES, type OndeMissao } from "@/lib/missoes";

export type Rascunho = { titulo: string; passos: string[]; meta: string; onde: OndeMissao; porque?: string };

/** Edita uma missão antes de aprovar (sugestão da IA ou missão nova). */
export function EditorMissao({ inicial, onAprovar, onDescartar, rotulo = "Aprovar a missão", salvando }: {
  inicial: Rascunho; onAprovar: (m: Rascunho) => void; onDescartar: () => void; rotulo?: string; salvando?: boolean;
}) {
  const [m, setM] = useState<Rascunho>({ ...inicial, passos: inicial.passos.length ? inicial.passos : [""] });
  const passo = (i: number, v: string) => setM({ ...m, passos: m.passos.map((p, j) => (j === i ? v : p)) });
  return (
    <div className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 10, padding: 16 }}>
      <label className="omni-campo" style={{ maxWidth: "none" }}>
        <span className="omni-campo__rotulo">Missão</span>
        <input className="omni-entrada" value={m.titulo} maxLength={LIMITES.titulo} onChange={(e) => setM({ ...m, titulo: e.target.value })} placeholder="Ex.: Leia a letra da sua música preferida" />
      </label>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 6 }}>
        <legend className="omni-campo__rotulo" style={{ marginBottom: 4 }}>Passos</legend>
        {m.passos.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span aria-hidden style={{ width: 22, flex: "none", textAlign: "center", font: "800 13px/1 var(--font-sans)", color: "var(--tinta-3)" }}>{i + 1}</span>
            <input className="omni-entrada" aria-label={`Passo ${i + 1}`} value={p} maxLength={LIMITES.passo} onChange={(e) => passo(i, e.target.value)} />
            {m.passos.length > 1 && (
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" aria-label={`Tirar o passo ${i + 1}`} onClick={() => setM({ ...m, passos: m.passos.filter((_, j) => j !== i) })}>×</button>
            )}
          </div>
        ))}
        {m.passos.length < LIMITES.passos && (
          <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ justifySelf: "start" }} onClick={() => setM({ ...m, passos: [...m.passos, ""] })}>+ Passo</button>
        )}
      </fieldset>
      <LinhaEscolha rotulo="Onde" valor={m.onde}>
        {ONDE.map((o) => <Pilula key={o} on={m.onde === o} onClick={() => setM({ ...m, onde: o })}>{o[0].toUpperCase() + o.slice(1)}</Pilula>)}
      </LinhaEscolha>
      <label className="omni-campo" style={{ maxWidth: "none" }}>
        <span className="omni-campo__rotulo">Meta do PEI que ela treina <span className="omni-campo__opcional">(só a escola vê)</span></span>
        <input className="omni-entrada" value={m.meta} maxLength={LIMITES.meta} onChange={(e) => setM({ ...m, meta: e.target.value })} />
      </label>
      {m.porque && <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>Por que a IA sugeriu: {m.porque}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" disabled={!m.titulo.trim() || salvando} onClick={() => onAprovar({ ...m, passos: m.passos.map((p) => p.trim()).filter(Boolean) })}>
          {salvando ? "Salvando…" : rotulo}
        </button>
        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={onDescartar}>Descartar</button>
      </div>
    </div>
  );
}
