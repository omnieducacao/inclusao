"use client";

/**
 * Tabela descritor × período: a diagnóstica e cada registro da processual, com o nível em selo.
 * Extraída de ProcessualOmni (onda 17) para ser usada também em "Evolução e dados" (onda 19).
 */
import { useId, type ReactNode } from "react";

type DescritorDiag = { codigo: string; descritor: string; nivel?: number | null };
export type DiagnosticaEvolucao = { disciplina: string; concluida_em: string | null; descritores: DescritorDiag[] };
type HabEvolucao = { codigo_omni?: string; codigo_bncc?: string; nivel_atual: number | null };
export type RegistroEvolucao = { id: string; bimestre: number; tipo_periodo: string; ano_letivo: number; habilidades: HabEvolucao[] };

export const NOME_PERIODO: Record<string, string> = { bimestral: "bimestre", trimestral: "trimestre", semestral: "semestre" };
export const tomDoNivel = (n: number | null | undefined) => (n == null ? "neutro" : n <= 1 ? "erro" : n === 2 ? "atencao" : "sucesso");

export function EvolucaoDescritores({ diag, registros, nivelTitulo = 2, acoes }: {
  diag: DiagnosticaEvolucao;
  registros: RegistroEvolucao[];
  /** nível do título (2 na processual; 3 quando a tabela fica dentro de outra seção) */
  nivelTitulo?: 2 | 3;
  /** ações ao lado do título (ex.: link "Registrar o período") */
  acoes?: ReactNode;
}) {
  const idTitulo = useId();
  const Titulo = nivelTitulo === 3 ? "h3" : "h2";
  const colunas = registros.map((r) => ({ chave: r.id, rotulo: `${r.bimestre}º ${NOME_PERIODO[r.tipo_periodo] || "período"} ${r.ano_letivo}`, mapa: new Map(r.habilidades.map((h) => [String(h.codigo_omni || h.codigo_bncc), h.nivel_atual])) }));
  return (
    <section style={{ display: "grid", gap: 8 }} aria-labelledby={idTitulo}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <Titulo id={idTitulo} style={{ margin: 0, font: nivelTitulo === 3 ? "800 16px/22px var(--font-sans)" : "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Evolução em {diag.disciplina}</Titulo>
        {acoes}
      </div>
      <p className="omni-apoio" style={{ margin: 0 }}>
        {diag.concluida_em ? `Da diagnóstica (${new Date(diag.concluida_em.length === 10 ? `${diag.concluida_em}T12:00:00` : diag.concluida_em).toLocaleDateString("pt-BR")}) até o último registro.` : "Da diagnóstica até o último registro."} Subir na escala = precisar de menos apoio.
      </p>
      <div className="omni-tabela-caixa">
        <table className="omni-tabela">
          <thead><tr><th>Descritor</th><th>Diagnóstica</th>{colunas.map((c) => <th key={c.chave}>{c.rotulo}</th>)}</tr></thead>
          <tbody>
            {diag.descritores.map((d) => {
              const ultimo = [...colunas].reverse().map((c) => c.mapa.get(d.codigo)).find((n) => typeof n === "number");
              const delta = typeof ultimo === "number" && typeof d.nivel === "number" ? ultimo - d.nivel : null;
              return (
                <tr key={d.codigo}>
                  <td><span style={{ fontWeight: 600 }}>{d.descritor}</span><span className="omni-tabela__sub">{d.codigo}{delta !== null && delta !== 0 ? ` · ${delta > 0 ? `subiu ${delta}` : `caiu ${-delta}`}` : ""}</span></td>
                  <td><span className={`omni-estado omni-estado--${tomDoNivel(d.nivel)}`}>{d.nivel ?? "—"}</span></td>
                  {colunas.map((c) => {
                    const n = c.mapa.get(d.codigo);
                    return <td key={c.chave}><span className={`omni-estado omni-estado--${tomDoNivel(n)}`}>{n ?? "—"}</span></td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
