"use client";

/**
 * PEI do professor no modo completo (onda 13).
 * Antes abria direto no fluxo por disciplina (plano de ensino, diagnóstica, PEI da disciplina),
 * e a leitura/ciência do PEI vigente só existia no modo simplificado. Agora a tela começa pelo
 * que todo professor precisa fazer (ler e dar ciência) e a parte da disciplina fica na segunda aba.
 */
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export function AbasProfessor({ ciencia, disciplina }: { ciencia: ReactNode; disciplina: ReactNode }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const aba = params?.get("aba") === "disciplina" ? "disciplina" : "ciencia";
  function ir(a: "ciencia" | "disciplina") {
    const p = new URLSearchParams(params?.toString() || "");
    if (a === "ciencia") p.delete("aba"); else p.set("aba", a);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname || "/pei-regente", { scroll: false });
  }
  return (
    <div className="space-y-5">
      <div className="omni-abas" role="tablist" aria-label="PEI do professor">
        <button type="button" role="tab" aria-selected={aba === "ciencia"} className="omni-aba" onClick={() => ir("ciencia")}>Ler e dar ciência</button>
        <button type="button" role="tab" aria-selected={aba === "disciplina"} className="omni-aba" onClick={() => ir("disciplina")}>Minha disciplina</button>
      </div>
      <div role="tabpanel">{aba === "ciencia" ? ciencia : disciplina}</div>
    </div>
  );
}
