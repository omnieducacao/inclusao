"use client";

/**
 * Tela de carregar a página (design system: Carregamento).
 * Símbolo vivo + frases reais que trocam a cada 2,2 s; aparece só depois de 300 ms.
 */
import { useEffect, useState } from "react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";

const PADRAO = ["Abrindo a Omnisfera…", "Buscando os estudantes…", "Organizando os PEIs…"];

export default function TelaCarregando({ mensagens = PADRAO, contido = false }: { mensagens?: string[]; contido?: boolean }) {
  const [i, setI] = useState(0);
  const [tempo, setTempo] = useState(0);

  useEffect(() => {
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (parado || mensagens.length < 2) return;
    const id = setInterval(() => setI((k) => Math.min(k + 1, mensagens.length - 1)), 2200);
    return () => clearInterval(id);
  }, [mensagens]);

  // Passou de 3 s: o símbolo troca o "encontro" pelo "carregando"
  useEffect(() => {
    const id = setTimeout(() => setTempo(1), 3000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className={`omni-carregando omni-carregando--atrasado ${contido ? "omni-carregando--contido" : "omni-carregando--pagina"}`}
      role="status"
      aria-live="polite"
    >
      <div className="omni-carregando__marca">
        <SimboloOmnisfera key={tempo} tamanho={96} animacao={tempo ? "carregando" : "encontro"} />
      </div>
      <p className="omni-carregando__texto">{mensagens[i]}</p>
    </div>
  );
}
