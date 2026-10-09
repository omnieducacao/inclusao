"use client";

/**
 * PEI - Professor no modo simplificado (onda 2).
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
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{titulo}</p>
      <ul className="flex flex-wrap gap-1.5">
        {itens.map((i) => (
          <li key={i} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">{i}</li>
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
    return <div className="rounded-2xl min-h-[160px] animate-pulse bg-(--omni-bg-secondary) border border-(--omni-border-default)" />;
  }

  const pendentes = itens.filter((i) => !i.ciente && i.vigencia.status === "vigente").length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 bg-(--omni-bg-secondary) border border-(--omni-border-default)">
        <h2 className="text-lg font-semibold text-(--omni-text-primary)">PEIs dos seus estudantes</h2>
        <p className="text-sm text-(--omni-text-muted) mt-1 max-w-[65ch]">
          A coordenação prepara o PEI de cada estudante. Leia, leve as estratégias para as suas aulas e registre que está
          ciente. Quando o PEI muda de versão, a ciência é pedida de novo.
        </p>
        {itens.length > 0 && (
          <p className="text-sm mt-3 font-medium text-(--omni-text-secondary)">
            {pendentes === 0 ? "Você está em dia com todos os PEIs." : `${pendentes} PEI(s) aguardando a sua leitura.`}
          </p>
        )}
      </div>

      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}

      {itens.length === 0 ? (
        <div className="rounded-2xl p-8 text-center bg-(--omni-bg-secondary) border border-(--omni-border-default)">
          <p className="text-(--omni-text-muted)">Nenhum PEI vigente para os estudantes do seu vínculo ainda.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {itens.map((i) => {
            const isAberto = aberto === i.id;
            return (
              <li key={i.id} className="rounded-2xl bg-(--omni-bg-secondary) border border-(--omni-border-default) overflow-hidden">
                <div className="p-4 flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-(--omni-text-primary)">{i.nome}</p>
                    <p className="text-xs text-(--omni-text-muted)">
                      {[i.serie, i.turma && `Turma ${i.turma}`].filter(Boolean).join(" · ")} · PEI versão {i.vigencia.versao} ·
                      desde {dataBR(i.vigencia.vigente_desde)}
                      {i.vigencia.status === "em_revisao" && " · em revisão pela coordenação"}
                    </p>
                  </div>
                  {i.ciente ? (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" /> Ciente
                    </span>
                  ) : podeDarCiencia && i.vigencia.status === "vigente" ? (
                    <button
                      type="button"
                      disabled={enviando === i.id || !isAberto}
                      title={isAberto ? undefined : "Abra e leia o PEI antes"}
                      onClick={() => darCiencia(i.id)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white disabled:opacity-40"
                    >
                      Li e estou ciente
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setAberto(isAberto ? null : i.id)}
                    aria-expanded={isAberto}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-(--omni-border-default)"
                  >
                    <FileText className="w-4 h-4" /> {isAberto ? "Fechar" : "Ler PEI"}
                    {isAberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {isAberto && (
                  <div className="px-4 pb-4 space-y-4 border-t border-(--omni-border-default) pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {i.hiperfoco && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Hiperfoco</p>
                          <p className="text-sm">{i.hiperfoco}</p>
                        </div>
                      )}
                      <Lista titulo="Potencialidades" itens={i.potencias} />
                      <Lista titulo="Acesso" itens={i.estrategias_acesso} />
                      <Lista titulo="Ensino" itens={i.estrategias_ensino} />
                      <Lista titulo="Avaliação" itens={i.estrategias_avaliacao} />
                    </div>
                    {i.texto_pei && (
                      <div className="max-h-[50vh] overflow-y-auto rounded-xl p-4 bg-(--omni-bg-tertiary) text-sm whitespace-pre-wrap leading-relaxed min-w-0">
                        {i.texto_pei}
                      </div>
                    )}
                    <Link
                      href={`/hub?student=${i.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700"
                    >
                      <Wand2 className="w-4 h-4" /> Criar ou adaptar material para este estudante
                    </Link>
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
