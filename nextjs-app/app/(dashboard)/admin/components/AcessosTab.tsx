"use client";

/**
 * Aba "Acessos" do admin (onda 57): logins das escolas e o caminho de cada visitante na demonstração.
 */
import { useEffect, useState } from "react";
import { OmniLoader } from "@/components/OmniLoader";
import { Bloco, Numeros, Periodo, quando } from "./PainelNumeros";

type Dados = {
  totais: { logins: number; pessoas: number; escolas: number; demonstracoes: number; minutosMedioDemo: number };
  escolas: { escola: string; logins: number; pessoas: number; ultimo: string }[];
  pessoas: { nome: string; escola: string; papel: string | null; logins: number; ultimo: string }[];
  demos: { nome: string; escola: string | null; email: string | null; entrada: string; papeis: string[]; telas: string[]; paginas: number; minutos: number }[];
};

const th: React.CSSProperties = { textAlign: "left", font: "700 12px/16px var(--font-mono)", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--tinta-2)", padding: "8px 10px", borderBottom: "1px solid var(--borda)", whiteSpace: "nowrap" };
const td: React.CSSProperties = { font: "400 14px/20px var(--font-sans)", color: "var(--tinta)", padding: "8px 10px", borderBottom: "1px solid var(--borda)", verticalAlign: "top" };

export function AcessosTab() {
  const [dias, setDias] = useState(30);
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setD(null); setErro("");
    fetch(`/api/admin/acessos?dias=${dias}`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setD(j);
    }).catch((e) => setErro(e instanceof Error && e.message ? e.message : "Não foi possível carregar."));
  }, [dias]);

  return (
    <section className="omni-cartao" aria-labelledby="acessos-titulo" style={{ gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <h3 id="acessos-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", margin: 0 }}>Acessos</h3>
        <Periodo dias={dias} onMudar={setDias} />
      </div>
      <p className="omni-apoio" style={{ margin: 0 }}>Quem entra na plataforma (escolas de verdade) e o que cada visitante fez na demonstração. Os registros começam na onda 57; antes disso não há dados.</p>
      {erro && <p role="alert" className="omni-apoio" style={{ color: "var(--color-error)" }}>{erro}</p>}
      {!d && !erro && <p className="omni-apoio" role="status" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", padding: "32px 0" }}><OmniLoader size={20} /> Carregando…</p>}
      {d && (
        <>
          <Numeros itens={[
            { rotulo: "Logins", valor: d.totais.logins },
            { rotulo: "Pessoas que entraram", valor: d.totais.pessoas },
            { rotulo: "Escolas ativas", valor: d.totais.escolas },
            { rotulo: "Visitas à demonstração", valor: d.totais.demonstracoes, nota: d.totais.demonstracoes ? `${d.totais.minutosMedioDemo} min em média` : undefined },
          ]} />

          <Bloco titulo="Demonstração: quem entrou e o que viu" ajuda="Tempo = da entrada até a última tela aberta. Telas na ordem em que foram abertas.">
            {!d.demos.length ? <p className="omni-apoio" style={{ margin: 0 }}>Ninguém entrou na demonstração neste período.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
                  <thead><tr><th style={th}>Quando</th><th style={th}>Quem</th><th style={th}>Papel</th><th style={th}>Telas</th><th style={th}>Tempo</th></tr></thead>
                  <tbody>{d.demos.map((x, i) => (
                    <tr key={i}>
                      <td style={{ ...td, whiteSpace: "nowrap" }}>{quando(x.entrada)}</td>
                      <td style={td}><strong>{x.nome}</strong>{x.escola ? <><br /><span className="omni-apoio">{x.escola}</span></> : null}</td>
                      <td style={td}>{x.papeis.join(" → ") || "—"}</td>
                      <td style={td}>{x.telas.join(", ") || "—"}<br /><span className="omni-apoio">{x.paginas} {x.paginas === 1 ? "tela aberta" : "telas abertas"}</span></td>
                      <td style={{ ...td, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{x.minutos < 1 ? "menos de 1 min" : `${x.minutos} min`}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </Bloco>

          <Bloco titulo="Escolas" ajuda="Último acesso de cada escola no período.">
            {!d.escolas.length ? <p className="omni-apoio" style={{ margin: 0 }}>Nenhum login neste período.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480 }}>
                  <thead><tr><th style={th}>Escola</th><th style={th}>Pessoas</th><th style={th}>Logins</th><th style={th}>Último acesso</th></tr></thead>
                  <tbody>{d.escolas.map((e) => (
                    <tr key={e.escola}><td style={td}>{e.escola}</td><td style={td}>{e.pessoas}</td><td style={td}>{e.logins}</td><td style={{ ...td, whiteSpace: "nowrap" }}>{quando(e.ultimo)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </Bloco>

          <Bloco titulo="Pessoas" ajuda="Quem entrou, com o papel na escola e o último acesso.">
            {!d.pessoas.length ? <p className="omni-apoio" style={{ margin: 0 }}>Nenhum login neste período.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
                  <thead><tr><th style={th}>Nome</th><th style={th}>Escola</th><th style={th}>Papel</th><th style={th}>Logins</th><th style={th}>Último acesso</th></tr></thead>
                  <tbody>{d.pessoas.map((p, i) => (
                    <tr key={i}><td style={td}>{p.nome}</td><td style={td}>{p.escola}</td><td style={td}>{p.papel || "—"}</td><td style={td}>{p.logins}</td><td style={{ ...td, whiteSpace: "nowrap" }}>{quando(p.ultimo)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </Bloco>
        </>
      )}
    </section>
  );
}
