/** Primeiros passos da escola no Início (onda 11 · design system: Passos). */
import Link from "next/link";
import type { PassoEscola } from "@/lib/primeiros-passos";

export function PrimeirosPassos({ passos }: { passos: PassoEscola[] }) {
  const feitos = passos.filter((p) => p.feito).length;
  const proximo = passos.find((p) => !p.feito);
  return (
    <section aria-labelledby="t-primeiros" className="omni-cartao" style={{ padding: "var(--space-5) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="omni-rotulo" style={{ margin: 0 }}>{feitos} de {passos.length} feitos</p>
          <h2 id="t-primeiros" style={{ margin: "2px 0 0", font: "800 22px/28px var(--font-sans)", color: "var(--tinta)" }}>Primeiros passos da escola</h2>
        </div>
        {proximo && <Link href={proximo.href} className="omni-btn omni-btn--primario">{proximo.acao}</Link>}
      </div>
      <ol className="omni-passos">
        {passos.map((p, i) => {
          const atual = p.id === proximo?.id;
          return (
            <li key={p.id} className={`omni-passo ${p.feito ? "omni-passo--feito" : ""} ${atual ? "omni-passo--atual" : ""}`} aria-current={atual ? "step" : undefined}>
              <span className="omni-passo__num" aria-hidden>{p.feito ? "✓" : i + 1}</span>
              <span>
                <Link href={p.href} className="omni-passo__titulo" style={{ color: "var(--tinta)", textDecoration: "none", display: "block" }}>{p.titulo}</Link>
                <span className="omni-passo__estado" style={{ display: "block" }}>{p.feito ? "Feito" : p.texto}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
