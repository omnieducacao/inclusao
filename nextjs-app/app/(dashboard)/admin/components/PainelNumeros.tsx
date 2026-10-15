"use client";

/** Peças pequenas dos painéis de números do admin (onda 57): período, cartões, barras e funil. */
import type { ReactNode } from "react";

export function Periodo({ dias, onMudar }: { dias: number; onMudar: (d: number) => void }) {
  return (
    <div role="group" aria-label="Período" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {[7, 30, 90].map((d) => (
        <button key={d} type="button" className="omni-chip" aria-pressed={dias === d} onClick={() => onMudar(d)}>Últimos {d} dias</button>
      ))}
    </div>
  );
}

export function Numeros({ itens }: { itens: { rotulo: string; valor: number | string; nota?: string }[] }) {
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
      {itens.map((i) => (
        <div key={i.rotulo} className="omni-cartao omni-cartao--plano" style={{ gap: 2, padding: "14px 16px" }}>
          <span style={{ font: "700 11px/16px var(--font-mono)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--tinta-2)" }}>{i.rotulo}</span>
          <strong style={{ font: "800 28px/34px var(--font-sans)", color: "var(--tinta)", fontVariantNumeric: "tabular-nums" }}>{i.valor}</strong>
          {i.nota && <span className="omni-apoio" style={{ fontSize: 13 }}>{i.nota}</span>}
        </div>
      ))}
    </div>
  );
}

export function Bloco({ titulo, ajuda, children }: { titulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <section className="omni-cartao omni-cartao--plano" style={{ gap: 12 }}>
      <div style={{ display: "grid", gap: 2 }}>
        <h4 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{titulo}</h4>
        {ajuda && <p className="omni-apoio" style={{ margin: 0, fontSize: 14 }}>{ajuda}</p>}
      </div>
      {children}
    </section>
  );
}

/** Lista com barra proporcional: rótulo à esquerda, número à direita. */
export function Barras({ itens, vazio = "Ainda sem dados neste período." }: { itens: { rotulo: string; valor: number; detalhe?: string }[]; vazio?: string }) {
  if (!itens.length) return <p className="omni-apoio" style={{ margin: 0 }}>{vazio}</p>;
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
      {itens.map((i) => (
        <li key={i.rotulo} style={{ display: "grid", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "500 14px/20px var(--font-sans)", color: "var(--tinta)" }}>
            <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{i.rotulo}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: "var(--tinta-2)" }}><strong style={{ color: "var(--tinta)" }}>{i.valor}</strong>{i.detalhe ? ` · ${i.detalhe}` : ""}</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--borda)" }}>
            <div style={{ width: `${(i.valor / max) * 100}%`, height: "100%", borderRadius: 99, background: "var(--acao)", minWidth: i.valor ? 4 : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Funil: cada etapa com a quantidade e quanto ela representa da primeira. */
export function Funil({ etapas }: { etapas: { etapa: string; pessoas: number }[] }) {
  const base = etapas[0]?.pessoas || 0;
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
      {etapas.map((e, i) => {
        const pct = base ? Math.round((e.pessoas / base) * 100) : 0;
        return (
          <li key={e.etapa} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "center", padding: "10px 14px", borderRadius: "var(--o-radius-sm)", background: `color-mix(in srgb, var(--acao) ${Math.max(6, 22 - i * 3)}%, transparent)` }}>
            <span style={{ font: "600 14px/20px var(--font-sans)", color: "var(--tinta)" }}>{e.etapa}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", font: "500 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
              <strong style={{ font: "800 18px/22px var(--font-sans)", color: "var(--tinta)" }}>{e.pessoas}</strong>{i > 0 && base ? ` · ${pct}%` : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Colunas por dia (visitas). */
export function PorDia({ dias }: { dias: { dia: string; pessoas: number; visitas: number }[] }) {
  const max = Math.max(1, ...dias.map((d) => d.pessoas));
  const fmt = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  return (
    <div>
      <div role="img" aria-label="Pessoas por dia" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, borderBottom: "1px solid var(--borda)" }}>
        {dias.map((d) => (
          <div key={d.dia} title={`${fmt(d.dia)}: ${d.pessoas} pessoas, ${d.visitas} visitas`} style={{ flex: 1, minWidth: 2, height: `${(d.pessoas / max) * 100}%`, minHeight: d.pessoas ? 3 : 0, background: "var(--acao)", borderRadius: "3px 3px 0 0" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", font: "500 12px/18px var(--font-mono)", color: "var(--tinta-2)", marginTop: 4 }}>
        <span>{dias[0] ? fmt(dias[0].dia) : ""}</span><span>máximo: {max} pessoas</span><span>{dias.length ? fmt(dias[dias.length - 1].dia) : ""}</span>
      </div>
    </div>
  );
}

export function quando(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
