"use client";

/**
 * Aba "Site e funil" do admin (onda 57): quem visita omnisfera.net, de onde vem, o que clica e
 * até onde chega (história da Beatriz, demonstração, contato, formação e certificado).
 * Medição própria, sem cookie e sem guardar IP: veja lib/site-eventos.ts.
 */
import { useEffect, useState } from "react";
import { OmniLoader } from "@/components/OmniLoader";
import { Barras, Bloco, Funil, Numeros, Periodo, PorDia } from "./PainelNumeros";

type Contagem = { chave: string; visitas: number; pessoas: number; rotulo?: string };
type Dados = {
  dias: number;
  totais: { pessoas: number; visitas: number; cliques: number; celular: number };
  porDia: { dia: string; visitas: number; pessoas: number }[];
  paginas: Contagem[]; origens: Contagem[]; cliques: Contagem[]; cenas: Contagem[];
  funil: { etapa: string; pessoas: number }[]; formacao: { etapa: string; pessoas: number }[];
};

const NOME_PAGINA: Record<string, string> = { "/": "Início", "/conheca/": "A semana da Beatriz", "/conheca": "A semana da Beatriz", "/formacao/": "Formação", "/sobre/": "Sobre a Omnisfera" };

export function SiteTab() {
  const [dias, setDias] = useState(30);
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setD(null); setErro("");
    fetch(`/api/admin/site?dias=${dias}`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setD(j);
    }).catch((e) => setErro(e instanceof Error && e.message ? e.message : "Não foi possível carregar."));
  }, [dias]);

  return (
    <section className="omni-cartao" aria-labelledby="site-titulo" style={{ gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <h3 id="site-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", margin: 0 }}>Site e funil</h3>
        <Periodo dias={dias} onMudar={setDias} />
      </div>
      <p className="omni-apoio" style={{ margin: 0 }}>
        Visitas a omnisfera.net medidas pela própria Omnisfera, sem cookie e sem guardar o endereço de internet de ninguém.
        &quot;Pessoas&quot; conta visitantes diferentes em cada dia. Robôs e testes automáticos ficam de fora.
      </p>
      {erro && <p role="alert" className="omni-apoio" style={{ color: "var(--color-error)" }}>{erro}</p>}
      {!d && !erro && <p className="omni-apoio" role="status" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", padding: "32px 0" }}><OmniLoader size={20} /> Carregando…</p>}
      {d && (
        <>
          <Numeros itens={[
            { rotulo: "Pessoas", valor: d.totais.pessoas, nota: `${d.totais.pessoas ? Math.round((d.totais.celular / d.totais.pessoas) * 100) : 0}% no celular` },
            { rotulo: "Páginas vistas", valor: d.totais.visitas },
            { rotulo: "Cliques nos botões", valor: d.totais.cliques },
            { rotulo: "Entraram na demonstração", valor: d.funil[4]?.pessoas ?? 0 },
          ]} />
          <Bloco titulo="Pessoas por dia"><PorDia dias={d.porDia} /></Bloco>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
            <Bloco titulo="Funil da venda" ajuda="Do primeiro clique ao pedido de contato. A porcentagem é sobre quem visitou o site.">
              <Funil etapas={d.funil} />
            </Bloco>
            <Bloco titulo="Funil da formação" ajuda="Quem abriu a formação, avançou nos temas e emitiu o certificado.">
              <Funil etapas={d.formacao} />
            </Bloco>
            <Bloco titulo="De onde vêm" ajuda="Links abertos direto do WhatsApp quase sempre chegam sem origem e entram em &quot;Direto ou WhatsApp&quot;.">
              <Barras itens={d.origens.map((o) => ({ rotulo: o.chave, valor: o.pessoas }))} />
            </Bloco>
            <Bloco titulo="Páginas mais vistas">
              <Barras itens={d.paginas.map((p) => ({ rotulo: NOME_PAGINA[p.chave] ? `${NOME_PAGINA[p.chave]} (${p.chave})` : p.chave, valor: p.pessoas, detalhe: `${p.visitas} vistas` }))} />
            </Bloco>
            <Bloco titulo="Botões clicados">
              <Barras itens={d.cliques.map((c) => ({ rotulo: c.rotulo || c.chave, valor: c.pessoas, detalhe: `${c.visitas} cliques` }))} />
            </Bloco>
            <Bloco titulo="A semana da Beatriz, cena a cena" ajuda="Quantas pessoas chegaram a cada cena da história. Onde cai muito, vale rever o texto.">
              <Barras itens={d.cenas.map((c) => ({ rotulo: c.rotulo || c.chave, valor: c.pessoas }))} vazio="Ninguém abriu a história neste período." />
            </Bloco>
          </div>
        </>
      )}
    </section>
  );
}
