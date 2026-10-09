/**
 * Avaliação (onda 10): diagnóstica e processual viram uma tela só, com duas abas.
 * Antes eram dois itens de menu, com nomes e escalas diferentes, e a processual tinha um
 * aviso "Precisa fazer a diagnóstica? Ir para Diagnóstica →". As duas usam a escala 0–4.
 */
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ESCALA_OMNISFERA } from "@/lib/omnisfera-types";

export function CabecalhoAvaliacao({ atual }: { atual: "diagnostica" | "processual" }) {
  const abas = [
    { id: "diagnostica", href: "/avaliacao-diagnostica", nome: "Diagnóstica", ajuda: "No começo: onde o estudante está" },
    { id: "processual", href: "/avaliacao-processual", nome: "Processual", ajuda: "A cada período: como está evoluindo" },
  ] as const;
  return (
    <div className="space-y-4">
      <PageHero
        route="/avaliacao-diagnostica"
        title="Avaliação"
        desc="Diagnóstica no começo, processual a cada período, descritor por descritor: Matriz Omni no Fundamental e Matriz do ENEM no Médio. Escala de 0 a 4: quanto apoio o estudante precisa."
      />
      <nav className="omni-abas" aria-label="Tipo de avaliação">
        {abas.map((a) => (
          <Link key={a.id} href={a.href} className="omni-aba" aria-selected={a.id === atual} aria-current={a.id === atual ? "page" : undefined} style={{ textDecoration: "none" }}>
            {a.nome} <span className="omni-apoio" style={{ fontWeight: 400, fontSize: 13 }}>· {a.ajuda}</span>
          </Link>
        ))}
      </nav>
      <details style={{ border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", padding: "var(--space-3) var(--space-4)", background: "var(--superficie)" }}>
        <summary style={{ cursor: "pointer", font: "600 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>A escala de 0 a 4</summary>
        <ol style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "grid", gap: 6 }}>
          {([0, 1, 2, 3, 4] as const).map((n) => (
            <li key={n} style={{ display: "flex", gap: 10, font: "400 14px/20px var(--font-sans)" }}>
              <strong style={{ minWidth: 150, color: "var(--tinta)" }}>{n} · {ESCALA_OMNISFERA[n].label}</strong>
              <span style={{ color: "var(--tinta-2)" }}>{ESCALA_OMNISFERA[n].descricao}</span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
