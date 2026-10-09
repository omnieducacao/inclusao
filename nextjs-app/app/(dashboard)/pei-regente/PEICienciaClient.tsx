"use client";

import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";

/**
 * PEI do professor: ler e dar ciência (onda 2; onda 13 vale também no modo completo).
 * A coordenação faz um PEI único; cada professor lê o PEI dos seus estudantes, leva as
 * estratégias para a sala e registra "Li e estou ciente" da versão vigente.
 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronUp, FileText, Wand2 } from "lucide-react";
import type { Vigencia } from "@/lib/estudo-caso";

type Item = {
  id: string;
  nome: string;
  serie: string | null;
  turma: string | null;
  vigencia: Vigencia;
  ciente: boolean;
  hiperfoco: string | null;
  potencias: string[];
  estrategias_acesso: string[];
  estrategias_ensino: string[];
  estrategias_avaliacao: string[];
  texto_pei: string;
};

const dataBR = (iso?: string) => (iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : "—");

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens?.length) return null;
  return (
    <div>
      <p className="omni-rotulo" style={{ margin: "0 0 6px" }}>{titulo}</p>
      <ul className="flex flex-wrap gap-1.5" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {itens.map((i) => (
          <li key={i} className="omni-estado omni-estado--neutro" style={{ whiteSpace: "normal" }}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

export function PEICienciaClient() {
  const [itens, setItens] = useState<Item[] | null>(null);
  const [podeDarCiencia, setPodeDarCiencia] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pei/meus-peis", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setItens(d.estudantes || []);
        setPodeDarCiencia(Boolean(d.podeDarCiencia));
      })
      .catch(() => setErro("Não foi possível carregar os PEIs."));
  }, []);

  async function darCiencia(id: string) {
    setEnviando(id);
    setErro(null);
    try {
      const r = await fetch("/api/pei/ciencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Erro ao registrar.");
      setItens((lista) => (lista || []).map((i) => (i.id === id ? { ...i, ciente: true } : i)));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao registrar.");
    } finally {
      setEnviando(null);
    }
  }

  if (!itens) {
    return <div className="omni-esqueleto" style={{ minHeight: 160, borderRadius: "var(--o-radius-lg)" }} />;
  }

  const pendentes = itens.filter((i) => !i.ciente && i.vigencia.status === "vigente").length;
  // Onda 13: quem ainda não leu vem primeiro
  const ordenados = [...itens].sort((a, b) => Number(a.ciente) - Number(b.ciente) || a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <div className="space-y-4">
      <div>
        <h2 style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>PEIs dos seus estudantes</h2>
        <p className="omni-apoio" style={{ margin: "2px 0 0", maxWidth: "65ch" }}>
          Leia o PEI, leve as estratégias para as suas aulas e registre que está ciente. Quando o PEI muda de versão, a leitura é pedida de novo.
        </p>
        {itens.length > 0 && (
          <p style={{ marginTop: 10 }}>
            <span className={`omni-estado omni-estado--${pendentes === 0 ? "sucesso" : "info"}`}>
              {pendentes === 0 ? "Você está em dia com todos os PEIs" : `${pendentes} ${pendentes === 1 ? "PEI aguarda" : "PEIs aguardam"} a sua leitura`}
            </span>
          </p>
        )}
      </div>

      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}

      {itens.length === 0 ? (
        <div className="omni-cartao omni-cartao--plano">
          <p className="omni-apoio" style={{ margin: 0 }}>Nenhum PEI vigente para os estudantes do seu vínculo ainda. Quando a coordenação tornar um PEI vigente, ele aparece aqui.</p>
        </div>
      ) : (
        <ul className="space-y-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ordenados.map((i) => {
            const isAberto = aberto === i.id;
            const podeMarcar = podeDarCiencia && i.vigencia.status === "vigente" && !i.ciente;
            return (
              <li key={i.id} className="omni-cartao omni-cartao--plano" style={{ padding: 0, overflow: "hidden" }}>
                <div className="flex flex-wrap items-center gap-3" style={{ padding: "var(--space-4) var(--space-5)" }}>
                  <div className="min-w-0 flex-1">
                    <p style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{i.nome}</p>
                    <p className="omni-apoio" style={{ margin: 0, fontSize: 14 }}>
                      {[i.serie, i.turma && `Turma ${i.turma}`].filter(Boolean).join(" · ")} · PEI versão {i.vigencia.versao} · desde {dataBR(i.vigencia.vigente_desde)}
                      {i.vigencia.status === "em_revisao" && " · em revisão pela coordenação"}
                    </p>
                  </div>
                  {i.ciente ? (
                    <span className="omni-estado omni-estado--sucesso"><CheckCircle2 aria-hidden /> Ciente</span>
                  ) : podeMarcar ? (
                    <span className="omni-estado omni-estado--info">Para ler</span>
                  ) : null}
                  <button type="button" onClick={() => setAberto(isAberto ? null : i.id)} aria-expanded={isAberto}
                    className={`omni-btn omni-btn--pequeno ${isAberto ? "omni-btn--discreto" : "omni-btn--secundario"}`}>
                    <FileText aria-hidden /> {isAberto ? "Fechar" : "Ler o PEI"} {isAberto ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
                  </button>
                </div>
                {isAberto && (
                  <div className="space-y-4" style={{ padding: "var(--space-4) var(--space-5) var(--space-5)", borderTop: "1px solid var(--borda)" }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {i.hiperfoco && (
                        <div>
                          <p className="omni-rotulo" style={{ margin: "0 0 4px" }}>Interesse do estudante</p>
                          <p style={{ margin: 0 }}>{i.hiperfoco}</p>
                        </div>
                      )}
                      <Lista titulo="Potencialidades" itens={i.potencias} />
                      <Lista titulo="Estratégias de acesso" itens={i.estrategias_acesso} />
                      <Lista titulo="Estratégias de ensino" itens={i.estrategias_ensino} />
                      <Lista titulo="Na avaliação" itens={i.estrategias_avaliacao} />
                    </div>
                    {i.texto_pei && (
                      <div className="min-w-0" style={{ maxHeight: "50vh", overflowY: "auto", padding: "var(--space-4)", borderRadius: "var(--o-radius-md)", background: "var(--superficie)", border: "1px solid var(--borda)", font: "400 15px/24px var(--font-sans)", color: "var(--tinta)" }}>
                        <FormattedTextDisplay texto={i.texto_pei} />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      {podeMarcar && (
                        <button type="button" disabled={enviando === i.id} onClick={() => darCiencia(i.id)} className="omni-btn omni-btn--primario">
                          {enviando === i.id ? "Registrando…" : "Li e estou ciente"}
                        </button>
                      )}
                      <Link href={`/hub?student=${i.id}`} className="omni-btn omni-btn--discreto">
                        <Wand2 aria-hidden /> Criar ou adaptar material para este estudante
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
