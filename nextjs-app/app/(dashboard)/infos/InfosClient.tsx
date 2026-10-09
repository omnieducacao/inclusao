"use client";

/**
 * Central de inteligência (onda 14). Antes tinha dados errados: um "Duplo Fundo" que não existe,
 * a proibição de cobrança extra atribuída a um decreto de 2025 (é da LBI, de 2015), dificuldades de
 * aprendizagem e privações socioculturais como público da educação especial, e nomes de telas antigas.
 * Agora o conteúdo segue o site da Omnisfera (public/site), revisado em outubro de 2026 com os textos
 * oficiais, e a Central aponta para lá quando o assunto pede leitura longa.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ExternalLink, Check, X } from "lucide-react";
import { GLOSSARIO } from "@/lib/central/glossario";

const ABAS = [
  { id: "lei", nome: "A lei em 1 minuto" },
  { id: "glossario", nome: "Glossário" },
  { id: "linguagem", nome: "Como falar" },
  { id: "omnisfera", nome: "O ciclo na Omnisfera" },
  { id: "aprofundar", nome: "Para aprofundar" },
] as const;
type Aba = (typeof ABAS)[number]["id"];

const MUDANCAS: { tema: string; como: string }[] = [
  { tema: "Laudo", como: "A oferta do AEE e do profissional de apoio não depende de diagnóstico, laudo ou relatório de saúde (Decreto 12.686/2025). A Portaria MEC 421/2026 estende isso à matrícula e à escolarização." },
  { tema: "Estudo de caso", como: "Etapa inicial necessária, em quatro passos: demandas e barreiras; análise do contexto; potencialidades e apoios; estratégias e recursos (Decreto 12.686/2025)." },
  { tema: "PAEE e PEI", como: "Os dois são obrigatórios, individualizados, de atualização contínua e saem do estudo de caso (Decreto 12.773/2025). A Portaria 421/2026 permite um documento único e pede revisão anual." },
  { tema: "Professor(a) do AEE", como: "Formação para a docência e formação continuada mínima de 360 horas (Decreto 12.773/2025)." },
  { tema: "Profissional de apoio", como: "Nível médio e formação continuada mínima de 180 horas; a necessidade sai do estudo de caso. Não faz papel de professor (Decreto 12.773/2025 e Portaria 421/2026)." },
];

const MITOS: { mito: string; fato: string }[] = [
  { mito: "Sem laudo, a escola não é obrigada a fazer nada.", fato: "O AEE e o profissional de apoio não dependem de laudo (Decreto 12.686/2025, arts. 11 e 14). O que define os apoios é o estudo de caso feito pela escola." },
  { mito: "Se a família quer profissional de apoio, ela paga a diferença.", fato: "A LBI (art. 28, § 1º) proíbe cobrança adicional de qualquer natureza na escola privada. O STF confirmou na ADI 5357, em 2016." },
  { mito: "A turma já tem estudantes com deficiência demais; dá para recusar.", fato: "Não existe cota que permita recusar. Recusar, adiar ou cancelar matrícula por causa da deficiência é crime (Lei 7.853/1989, art. 8º)." },
  { mito: "Inclusão é assunto do AEE.", fato: "O PAEE e o PEI orientam o trabalho na sala comum. O AEE complementa e não substitui a classe comum (Decreto 12.686/2025, art. 8º)." },
];

const PREFIRA: { termo: string; porque: string }[] = [
  { termo: "Pessoa com deficiência / estudante com deficiência", porque: "Termo da Convenção da ONU e da LBI. A deficiência é um atributo, não a pessoa toda." },
  { termo: "Pessoa com autismo / pessoa autista", porque: "As duas formas são aceitas. Muitas pessoas autistas preferem \"autista\"; pergunte quando puder." },
  { termo: "Neurodivergente", porque: "Funcionamento neurológico diferente do mais comum, sem a ideia de doença." },
  { termo: "Surdo / pessoa surda", porque: "Termo identitário reconhecido pela comunidade surda." },
  { termo: "Típico / atípico", porque: "Substitui \"normal\" e \"anormal\"." },
  { termo: "Precisa de mais tempo para…", porque: "Descreva o que observa, em vez de rotular." },
];

const EVITE: { termo: string; porque: string }[] = [
  { termo: "Portador de deficiência", porque: "Deficiência não se carrega e se deixa em casa, como uma bolsa. A expressão foi superada." },
  { termo: "Aluno de inclusão", porque: "Separa um grupo dos demais. Todos fazem parte da escola inclusiva." },
  { termo: "Criança especial / aluno especial", porque: "Eufemismo que infantiliza. Use o nome do estudante." },
  { termo: "Surdo-mudo", porque: "Surdez não implica mudez; a Libras é uma língua." },
  { termo: "Doente, \"sofre de\", \"é vítima de\"", porque: "Deficiência não é doença, e nem toda pessoa vive sua condição como sofrimento." },
  { termo: "Atrasado, lento", porque: "Pejorativos. Descreva o que observa." },
  { termo: "\"Deu uma de João sem braço\", \"o pior cego é aquele que não quer ver\"", porque: "Usam a deficiência como metáfora de algo ruim." },
];

const CICLO: { passo: string; tela: string; href: string; faz: string }[] = [
  { passo: "Conhecer", tela: "Estudantes", href: "/estudantes", faz: "Cadastro e ficha do estudante: turma, situação do PEI e tudo o que já foi feito com ele." },
  { passo: "Estudo de caso e PEI", tela: "PEI", href: "/pei", faz: "Quatro etapas: estudo de caso, plano, professores e revisão. Nenhum laudo é exigido." },
  { passo: "Atendimento", tela: "PAEE", href: "/paee", faz: "O AEE em ciclos: avaliação e adaptação, desenvolvimento e consolidação, com metas do PEI." },
  { passo: "Sala de aula", tela: "PEI do professor e Hub de recursos", href: "/hub", faz: "Cada professor lê o PEI, dá ciência e cria material adaptado a partir do estudante." },
  { passo: "Registro", tela: "Diário de bordo", href: "/diario", faz: "O que aconteceu em cada atendimento, em poucos toques." },
  { passo: "Acompanhar", tela: "Avaliação e Evolução e dados", href: "/monitoramento", faz: "Avaliação diagnóstica e processual na escala de 0 a 4, e a evolução de cada estudante." },
];

const LEITURAS: { titulo: string; texto: string; href: string; min?: string }[] = [
  { titulo: "O que a lei garante", texto: "Da Constituição à Portaria MEC 421/2026, com linha do tempo.", href: "/lei", min: "14 min" },
  { titulo: "Deficiência, barreira e capacitismo", texto: "O modelo social, as barreiras e por que o laudo não é condição.", href: "/conceitos" },
  { titulo: "Conhecer o estudante", texto: "Como conduzir um estudo de caso, passo a passo.", href: "/conhecer-o-estudante", min: "12 min" },
  { titulo: "PEI, AEE e trabalho em rede", texto: "Quem faz o quê, e como o plano chega à sala.", href: "/pei-e-aee", min: "14 min" },
  { titulo: "Adaptar e avaliar", texto: "Adaptação de acesso e curricular, provas e devolutivas.", href: "/adaptar-e-avaliar", min: "12 min" },
  { titulo: "DUA e comunicação alternativa", texto: "Planejar para todos desde o início; CAA na prática.", href: "/dua-e-caa", min: "13 min" },
  { titulo: "Perfis de estudantes", texto: "Autismo, deficiência intelectual, dislexia e TDAH, altas habilidades, visual, surdez e física.", href: "/perfis" },
  { titulo: "Checklists", texto: "A inclusão em rotina, para imprimir.", href: "/checklists" },
  { titulo: "Leis e leituras", texto: "Os textos oficiais e as referências, com links.", href: "/fontes" },
  { titulo: "Na mídia", texto: "Reportagens e dados recentes.", href: "/na-midia" },
];

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function InfosClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const daUrl = params?.get("aba") as Aba | null;
  const aba: Aba = daUrl && ABAS.some((a) => a.id === daUrl) ? daUrl : "lei";
  const [busca, setBusca] = useState("");

  function ir(a: Aba) {
    const p = new URLSearchParams(params?.toString() || "");
    if (a === "lei") p.delete("aba"); else p.set("aba", a);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname || "/infos", { scroll: false });
  }

  const termos = useMemo(() => {
    const b = semAcento(busca.trim());
    return b ? GLOSSARIO.filter((g) => semAcento(`${g.t} ${g.d}`).includes(b)) : GLOSSARIO;
  }, [busca]);

  return (
    <div className="space-y-6">
      <div className="omni-abas" role="tablist" aria-label="Central de inteligência">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className="omni-aba" onClick={() => ir(a.id)}>{a.nome}</button>
        ))}
      </div>

      <div role="tabpanel" style={{ maxWidth: 980, display: "grid", gap: 28 }}>
        {aba === "lei" && (
          <>
            <section className="omni-cartao omni-cartao--plano space-y-3" aria-labelledby="lei-30s">
              <h2 id="lei-30s" className="omni-cartao__titulo" style={{ margin: 0 }}>O essencial</h2>
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, font: "400 16px/25px var(--font-sans)", color: "var(--tinta-2)" }}>
                <li>Todo estudante com deficiência, com autismo ou com altas habilidades/superdotação tem direito de estudar na <strong>classe comum</strong>, com os apoios de que precisa.</li>
                <li>A matrícula <strong>não pode ser recusada nem cobrada à parte</strong>, nem na escola privada (LBI, art. 28; STF, ADI 5357).</li>
                <li>O <strong>AEE</strong> (Atendimento Educacional Especializado) complementa ou suplementa a escolarização; não substitui a sala comum.</li>
                <li><strong>Nenhum laudo</strong> pode ser exigido para o AEE, o profissional de apoio, a matrícula ou a escolarização.</li>
                <li>Desde 2025, o <strong>estudo de caso</strong> é a porta de entrada, e o <strong>PAEE</strong> e o <strong>PEI</strong> são obrigatórios.</li>
              </ul>
              <p className="omni-apoio" style={{ margin: 0 }}>
                Quem é o público da educação especial, pelo Decreto 12.686/2025: estudantes com deficiência, com TEA (transtorno do espectro autista) e com altas habilidades ou superdotação. Estudantes com dislexia ou TDAH têm direito a acompanhamento na escola pela Lei 14.254/2021.
              </p>
            </section>

            <section style={{ display: "grid", gap: 12 }} aria-labelledby="lei-mudou">
              <h2 id="lei-mudou" style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>O que mudou em 2025 e 2026</h2>
              <p className="omni-apoio" style={{ margin: 0 }}>
                O Decreto 12.686, de 20 de outubro de 2025, criou a Política Nacional de Educação Especial Inclusiva e revogou o Decreto 7.611/2011. O Decreto 12.773, de 8 de dezembro de 2025, mudou vários pontos. A Portaria MEC 421/2026 regulamenta.
              </p>
              <div className="omni-tabela-caixa">
                <table className="omni-tabela">
                  <thead><tr><th scope="col">Tema</th><th scope="col">Como ficou</th></tr></thead>
                  <tbody>
                    {MUDANCAS.map((m) => (
                      <tr key={m.tema}><td style={{ whiteSpace: "nowrap", fontWeight: 700, color: "var(--tinta)" }}>{m.tema}</td><td>{m.como}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ display: "grid", gap: 12 }} aria-labelledby="lei-mitos">
              <h2 id="lei-mitos" style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>Frases que ainda circulam</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MITOS.map((m) => (
                  <div key={m.mito} className="omni-cartao omni-cartao--plano space-y-2">
                    <p style={{ margin: 0, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>&ldquo;{m.mito}&rdquo;</p>
                    <p style={{ margin: 0, font: "400 15px/23px var(--font-sans)", color: "var(--tinta-2)" }}>{m.fato}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="omni-aviso omni-aviso--info">
              <div>
                <div className="omni-aviso__texto">Texto formativo, atualizado em outubro de 2026 com os textos oficiais. Não é orientação jurídica.</div>
                <div className="omni-aviso__acoes"><a className="omni-btn omni-btn--secundario omni-btn--pequeno" href="/lei" target="_blank" rel="noopener">Ler a lei explicada <ExternalLink aria-hidden /></a></div>
              </div>
            </div>
          </>
        )}

        {aba === "glossario" && (
          <section style={{ display: "grid", gap: 16 }} aria-label="Glossário">
            <label className="omni-campo" style={{ maxWidth: 520 }}>
              <span className="omni-campo__rotulo">Buscar um termo ou sigla</span>
              <span style={{ position: "relative", display: "block" }}>
                <Search aria-hidden style={{ position: "absolute", left: 12, top: 12, width: 20, height: 20, color: "var(--tinta-3)" }} />
                <input className="omni-entrada" style={{ paddingLeft: 40 }} type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: PAEE, adaptação, CAA" />
              </span>
            </label>
            <p className="omni-apoio" style={{ margin: 0 }} aria-live="polite">{termos.length} de {GLOSSARIO.length} termos</p>
            <dl style={{ margin: 0, display: "grid", gap: 12 }}>
              {termos.map((g) => (
                <div key={g.t} className="omni-cartao omni-cartao--plano" style={{ padding: "14px 18px" }}>
                  <dt style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{g.t}</dt>
                  <dd style={{ margin: "4px 0 0", font: "400 15px/23px var(--font-sans)", color: "var(--tinta-2)" }}>{g.d}</dd>
                </div>
              ))}
            </dl>
            {termos.length === 0 && <p className="omni-apoio">Nenhum termo com essa busca.</p>}
          </section>
        )}

        {aba === "linguagem" && (
          <section style={{ display: "grid", gap: 16 }} aria-label="Como falar">
            <p className="omni-apoio" style={{ margin: 0, maxWidth: "65ch" }}>A regra geral: a pessoa vem antes da condição, e a condição é uma característica, não a identidade inteira.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <h2 style={{ margin: 0, display: "flex", gap: 8, alignItems: "center", font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>
                  <Check aria-hidden style={{ color: "var(--encontro-verde-forte)" }} /> Prefira
                </h2>
                {PREFIRA.map((p) => (
                  <div key={p.termo} className="omni-cartao omni-cartao--plano" style={{ padding: "12px 16px", borderLeft: "4px solid var(--encontro-verde)" }}>
                    <p style={{ margin: 0, font: "700 15px/21px var(--font-sans)", color: "var(--tinta)" }}>{p.termo}</p>
                    <p style={{ margin: "2px 0 0", font: "400 14px/21px var(--font-sans)", color: "var(--tinta-2)" }}>{p.porque}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <h2 style={{ margin: 0, display: "flex", gap: 8, alignItems: "center", font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>
                  <X aria-hidden style={{ color: "var(--encontro-vermelho-forte)" }} /> Evite
                </h2>
                {EVITE.map((p) => (
                  <div key={p.termo} className="omni-cartao omni-cartao--plano" style={{ padding: "12px 16px", borderLeft: "4px solid var(--encontro-vermelho)" }}>
                    <p style={{ margin: 0, font: "700 15px/21px var(--font-sans)", color: "var(--tinta)" }}>{p.termo}</p>
                    <p style={{ margin: "2px 0 0", font: "400 14px/21px var(--font-sans)", color: "var(--tinta-2)" }}>{p.porque}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {aba === "omnisfera" && (
          <section style={{ display: "grid", gap: 16 }} aria-label="O ciclo na Omnisfera">
            <p className="omni-apoio" style={{ margin: 0, maxWidth: "65ch" }}>O caminho de um estudante na Omnisfera, na ordem em que as coisas costumam acontecer. Cada passo abre a tela correspondente.</p>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {CICLO.map((c, i) => (
                <li key={c.passo}>
                  <Link href={c.href} className="omni-cartao omni-cartao--plano" style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "flex-start", textDecoration: "none", padding: "14px 18px" }}>
                    <span aria-hidden style={{ flex: "none", width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "16px 16px 16px 4px", background: "var(--acao-suave)", color: "var(--acao)", font: "800 14px/1 var(--font-sans)" }}>{i + 1}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{c.passo} <span style={{ fontWeight: 600, color: "var(--tinta-3)" }}>· {c.tela}</span></span>
                      <span style={{ display: "block", marginTop: 2, font: "400 15px/22px var(--font-sans)", color: "var(--tinta-2)" }}>{c.faz}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {aba === "aprofundar" && (
          <section style={{ display: "grid", gap: 16 }} aria-label="Para aprofundar">
            <p className="omni-apoio" style={{ margin: 0, maxWidth: "65ch" }}>A formação gratuita da Omnisfera, em linguagem de sala de aula. Abre em outra aba.</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {LEITURAS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener" className="omni-cartao omni-cartao--plano" style={{ display: "flex", flexDirection: "column", gap: 4, height: "100%", textDecoration: "none", padding: "14px 18px" }}>
                    <span style={{ display: "flex", justifyContent: "space-between", gap: 8, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
                      {l.titulo}
                      <ExternalLink aria-hidden style={{ width: 16, height: 16, flex: "none", color: "var(--tinta-3)" }} />
                    </span>
                    <span style={{ font: "400 14px/21px var(--font-sans)", color: "var(--tinta-2)" }}>{l.texto}</span>
                    {l.min && <span style={{ font: "600 12.5px/18px var(--font-sans)", color: "var(--tinta-3)" }}>{l.min} de leitura</span>}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
