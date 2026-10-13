"use client";

/**
 * Onda 22: visual do design system — caixa em omni-cartao, selo omni-estado, ícones nas cores dos módulos,
 * sem emojis nem classes de cor do Tailwind; botão com aria-expanded.
 * PAEE = Plano de Atendimento Educacional Especializado.
 */

import { useState } from "react";
import Link from "next/link";
import { FileText, Map, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  nomeEstudante: string;
  temRelatorioPei: boolean;
  temJornada: boolean;
  nCiclosPae?: number;
  pagina?: "PEI" | "PAEE";
};

export function ResumoAnexosEstudante({
  nomeEstudante,
  temRelatorioPei,
  temJornada,
  nCiclosPae = 0,
  pagina = "PEI",
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const itens: { texto: string; Icone: typeof FileText; cor: string }[] = [];
  if (temRelatorioPei) {
    itens.push({ texto: "Texto do PEI", Icone: FileText, cor: "var(--modulo-pei)" });
  }
  if (temJornada) {
    itens.push({ texto: "Jornada gamificada", Icone: Map, cor: "var(--modulo-hub)" });
  }
  if (pagina === "PAEE" && nCiclosPae > 0) {
    itens.push({ texto: `Ciclos do PAEE (${nCiclosPae})`, Icone: ClipboardList, cor: "var(--modulo-paee)" });
  }

  return (
    <div className="omni-cartao mt-6" style={{ padding: 0, gap: 0 }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between text-left"
        style={{ padding: "var(--space-4)", background: "none", border: 0, font: "inherit", color: "var(--tinta)", cursor: "pointer", borderRadius: "inherit" }}
      >
        <span className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" aria-hidden="true" style={{ color: "var(--tinta-2)" }} />
          <span style={{ font: "700 15px/22px var(--font-sans)" }}>
            O que está registrado para este estudante
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="omni-estado omni-estado--neutro">
            {isExpanded ? "Recolher" : "Expandir"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" aria-hidden="true" style={{ color: "var(--tinta-3)" }} />
          ) : (
            <ChevronDown className="w-5 h-5" aria-hidden="true" style={{ color: "var(--tinta-3)" }} />
          )}
        </span>
      </button>

      {isExpanded && (
        <div style={{ padding: "0 var(--space-4) var(--space-4)", borderTop: "1px solid var(--borda)" }}>
          <div className="mt-4 space-y-2">
            <p className="omni-cartao__titulo" style={{ fontSize: 15 }}>{nomeEstudante}</p>
            {itens.length === 0 ? (
              <p className="omni-apoio">Ainda não há relatório nem jornada registrados.</p>
            ) : (
              <ul className="space-y-1">
                {itens.map(({ texto, Icone, cor }) => (
                  <li key={texto} className="omni-apoio flex items-center gap-2">
                    <Icone className="w-4 h-4" aria-hidden="true" style={{ color: cor }} />
                    <span>{texto}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="omni-apoio mt-3" style={{ fontSize: 13 }}>
              Para apagar ou organizar, use a página <Link href="/estudantes" style={{ color: "var(--acao)", fontWeight: 600 }} className="hover:underline">Estudantes</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
