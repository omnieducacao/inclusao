"use client";

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

  const itens: string[] = [];
  if (temRelatorioPei) {
    itens.push("📄 Relatório PEI (Consultoria IA)");
  }
  if (temJornada) {
    itens.push("🎮 Jornada gamificada");
  }
  if (pagina === "PAEE" && nCiclosPae > 0) {
    itens.push(`📋 Ciclos PAEE (${nCiclosPae})`);
  }

  return (
    <div className="mt-6 border border-slate-200 rounded-lg bg-white">
      <button
            aria-label="Gerenciar anexos do estudante"
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">
            📎 O que está registrado para este estudante
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded">
            {isExpanded ? "Recolher" : "Expandir"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100">
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-slate-800">{nomeEstudante}</p>
            {itens.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum relatório ou jornada registrado ainda.</p>
            ) : (
              <ul className="space-y-1">
                {itens.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                    {item.includes("📄") && <FileText className="w-4 h-4 text-amber-600" />}
                    {item.includes("🎮") && <Map className="w-4 h-4 text-violet-600" />}
                    {item.includes("📋") && <ClipboardList className="w-4 h-4 text-slate-600" />}
                    <span>{item.replace(/^[📄🎮📋]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-slate-500 mt-3">
              Para apagar ou gerir, use a página <Link href="/estudantes" className="text-sky-600 hover:underline font-medium">Estudantes</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
