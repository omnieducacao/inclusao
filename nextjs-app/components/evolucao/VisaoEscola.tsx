/**
 * Evolução e dados · visão da coordenação (onda 10).
 *
 * Antes, sem estudante escolhido, a tela só dizia "Selecione um estudante". Quem coordena
 * precisava abrir um por um para saber onde agir. Agora a tela abre com o retrato da escola
 * (ou do vínculo de quem está vendo): quantos PEIs estão vigentes, quantos estão com a revisão
 * vencida, quem ainda não tem PEI e quem está sem ciclo de AEE ativo. Cada número leva à lista.
 */
import Link from "next/link";
import type { SituacaoPei } from "@/lib/inicio";

export type LinhaVisao = {
  id: string;
  name: string;
  grade: string | null;
  class_group: string | null;
  pei: SituacaoPei;
  paeeAtivo: boolean;
};

type Grupo = { chave: string; titulo: string; tom: "erro" | "atencao" | "neutro" | "sucesso" | "info"; filtro: (l: LinhaVisao) => boolean; acao: string; href: (id: string) => string; modulo: "pei" | "paee" };

const GRUPOS: Grupo[] = [
  { chave: "vencida", titulo: "Revisão do PEI vencida", tom: "erro", filtro: (l) => l.pei.rotulo === "Revisão vencida", acao: "Revisar", href: (id) => `/pei?student=${id}&etapa=4`, modulo: "pei" },
  { chave: "chegando", titulo: "Revisão nos próximos 15 dias", tom: "atencao", filtro: (l) => l.pei.rotulo === "Revisão chegando", acao: "Abrir PEI", href: (id) => `/pei?student=${id}&etapa=4`, modulo: "pei" },
  { chave: "rascunho", titulo: "PEI em rascunho", tom: "atencao", filtro: (l) => l.pei.rotulo === "Rascunho" || l.pei.rotulo === "Em revisão", acao: "Continuar", href: (id) => `/pei?student=${id}`, modulo: "pei" },
  { chave: "sem", titulo: "Sem PEI", tom: "neutro", filtro: (l) => l.pei.rotulo === "Sem PEI", acao: "Começar", href: (id) => `/pei?student=${id}`, modulo: "pei" },
  { chave: "aee", titulo: "PEI vigente, sem ciclo de AEE ativo", tom: "info", filtro: (l) => l.pei.versao != null && !l.paeeAtivo, acao: "Abrir PAEE", href: (id) => `/paee?student=${id}`, modulo: "paee" },
];

/** podeAgir: quem não edita PEI/PAEE (ex.: professor) vê a ficha do estudante no lugar da ação */
export function VisaoEscola({ linhas, podeAgir = { pei: true, paee: true } }: { linhas: LinhaVisao[]; podeAgir?: { pei: boolean; paee: boolean } }) {
  const total = linhas.length;
  const vigentes = linhas.filter((l) => l.pei.versao != null && l.pei.rotulo !== "Em revisão").length;
  const pct = total ? Math.round((vigentes / total) * 100) : 0;

  return (
    <section aria-labelledby="visao-escola" className="space-y-5">
      <div>
        <h2 id="visao-escola" style={{ margin: 0, font: "800 22px/28px var(--font-sans)", color: "var(--tinta)" }}>Visão geral</h2>
        <p className="omni-apoio" style={{ margin: 0 }}>Os estudantes que você acompanha. Escolha um estudante abaixo para ver a evolução dele.</p>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ margin: 0 }}>
        {[
          { rotulo: "Estudantes", valor: String(total), nota: "no seu vínculo" },
          { rotulo: "PEI vigente", valor: `${vigentes}`, nota: `${pct}% dos estudantes` },
          { rotulo: "Revisão vencida", valor: String(linhas.filter(GRUPOS[0].filtro).length), nota: "pedem ação agora" },
          { rotulo: "Com ciclo de AEE ativo", valor: String(linhas.filter((l) => l.paeeAtivo).length), nota: "PAEE em andamento" },
        ].map((c) => (
          <div key={c.rotulo} className="omni-cartao omni-cartao--plano" style={{ padding: "var(--space-4)" }}>
            <dt className="omni-rotulo">{c.rotulo}</dt>
            <dd style={{ margin: "4px 0 0", font: "800 30px/36px var(--font-sans)", color: "var(--tinta)", fontVariantNumeric: "tabular-nums" }}>{c.valor}</dd>
            <dd className="omni-apoio" style={{ margin: 0, fontSize: 14 }}>{c.nota}</dd>
          </div>
        ))}
      </dl>

      {total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" style={{ marginTop: "var(--space-5)" }}>
          {GRUPOS.map((g) => {
            const lista = linhas.filter(g.filtro).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
            return (
              <details key={g.chave} className="omni-cartao omni-cartao--plano" open={lista.length > 0 && lista.length <= 6 && (g.tom === "erro" || g.tom === "atencao")}>
                <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, listStyle: "none" }}>
                  <span className={`omni-estado omni-estado--${g.tom}`} style={{ fontVariantNumeric: "tabular-nums" }}>{lista.length}</span>
                  <span style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{g.titulo}</span>
                </summary>
                {lista.length === 0 ? (
                  <p className="omni-apoio" style={{ marginBottom: 0 }}>Ninguém aqui.</p>
                ) : (
                  <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {lista.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-center justify-between gap-2" style={{ padding: "6px 0", borderTop: "1px solid var(--borda)" }}>
                        <span>
                          <Link href={`/monitoramento?student=${l.id}`} style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{l.name}</Link>
                          <span className="omni-apoio" style={{ fontSize: 14 }}> · {[l.grade, l.class_group].filter(Boolean).join(" ") || "sem turma"}</span>
                        </span>
                        {podeAgir[g.modulo]
                          ? <Link href={g.href(l.id)} className="omni-btn omni-btn--discreto omni-btn--pequeno">{g.acao}</Link>
                          : <Link href={`/estudantes/${l.id}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">Ver ficha</Link>}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
