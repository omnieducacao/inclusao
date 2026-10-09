"use client";

/**
 * Onda 17: o que a avaliação diagnóstica mostrou, dentro do PEI. Os descritores com nível 0 a 2
 * são sugestão de meta: a IA do PEI já os recebe, e a coordenação vê de onde as metas vêm.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import { sugestoesDeMeta, type DescritorAvaliado } from "@/lib/matriz-avaliacao";

type Av = { disciplina: string; matriz: string; descritores: DescritorAvaliado[]; nivel: number | null; concluida_em: string | null };

export function ResumoDiagnostica({ studentId }: { studentId: string }) {
  const [avs, setAvs] = useState<Av[] | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch(`/api/avaliacao/diagnostica?studentId=${studentId}`)
      .then((r) => (r.ok ? r.json() : { avaliacoes: [] }))
      .then((d) => {
        if (!vivo) return;
        const vistos = new Set<string>();
        setAvs(((d.avaliacoes || []) as Av[]).filter((a) => a.matriz !== "legado" && a.concluida_em && !vistos.has(a.disciplina) && vistos.add(a.disciplina)));
      })
      .catch(() => vivo && setAvs([]));
    return () => { vivo = false; };
  }, [studentId]);

  if (!avs) return null;
  if (!avs.length) {
    return (
      <div className="omni-aviso omni-aviso--info" style={{ maxWidth: "none" }}><div>
        <div className="omni-aviso__texto">Ainda não há avaliação diagnóstica concluída. Com ela, as metas do PEI partem do que o estudante já faz em cada componente.</div>
        <div className="omni-aviso__acoes"><Link className="omni-btn omni-btn--secundario omni-btn--pequeno" href={`/avaliacao-diagnostica?student=${studentId}`}>Fazer a diagnóstica</Link></div>
      </div></div>
    );
  }
  const sugestoes = avs.flatMap((a) => sugestoesDeMeta(a.disciplina, a.descritores));
  return (
    <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 10 }} aria-labelledby="pei-diag-resumo">
      <h3 id="pei-diag-resumo" style={{ margin: 0, font: "800 17px/24px var(--font-sans)", color: "var(--tinta)" }}>O que a avaliação diagnóstica mostrou</h3>
      <p className="omni-apoio" style={{ margin: 0 }}>
        {avs.map((a) => `${a.disciplina}: nível ${a.nivel ?? "—"}`).join(" · ")}. {sugestoes.length ? "Os descritores abaixo pedem mais apoio e são o ponto de partida das metas; a IA do PEI já os considera." : "Nenhum descritor abaixo do nível 3."}
      </p>
      {sugestoes.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
          {sugestoes.slice(0, 10).map((s) => (
            <li key={`${s.componente}-${s.codigo}`} style={{ font: "400 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
              <strong>{s.componente}</strong> · {s.texto} <span className="omni-apoio">({s.nivel} · {ESCALA_OMNISFERA[s.nivel as NivelOmnisfera].label})</span>
            </li>
          ))}
        </ul>
      )}
      <Link className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ justifySelf: "start" }} href={`/avaliacao-diagnostica?student=${studentId}`}>Abrir a avaliação diagnóstica</Link>
    </section>
  );
}
