"use client";

import { Printer } from "lucide-react";

/** Abre a impressão do navegador; lá a pessoa escolhe "Salvar como PDF". */
export function BotaoImprimir() {
  return (
    <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={() => window.print()}>
      <Printer aria-hidden /> Salvar em PDF ou imprimir
    </button>
  );
}
