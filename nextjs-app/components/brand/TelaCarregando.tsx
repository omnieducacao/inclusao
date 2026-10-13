"use client";

/**
 * Carregamento do design system (Omni.carregando).
 * Símbolo vivo + frases reais que trocam a cada 2,2 s; aparece só depois de 300 ms.
 * - "pagina": cobre a tela (troca de página, app/loading.tsx)
 * - "contido": cobre o bloco pai (que precisa de position: relative)
 * - "secao":  ocupa o lugar do conteúdo de uma aba, painel ou cartão (onda 22)
 */
import { useEffect, useState } from "react";
import SimboloOmnisfera, { type AnimacaoSimbolo } from "@/components/SimboloOmnisfera";

const PADRAO = ["Abrindo a Omnisfera…", "Buscando os estudantes…", "Organizando os PEIs…"];

export type VarianteCarregando = "pagina" | "contido" | "secao";

export default function TelaCarregando({
  mensagens = PADRAO,
  contido = false,
  variante,
  animacao,
}: {
  mensagens?: string[];
  /** compatibilidade: o mesmo que variante="contido" */
  contido?: boolean;
  variante?: VarianteCarregando;
  /** "gerando" quando é a IA trabalhando; sem valor, encontro e depois carregando */
  animacao?: AnimacaoSimbolo;
}) {
  const v: VarianteCarregando = variante ?? (contido ? "contido" : "pagina");
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
    if (animacao) return;
    const id = setTimeout(() => setTempo(1), 3000);
    return () => clearTimeout(id);
  }, [animacao]);

  return (
    <div className={`omni-carregando omni-carregando--atrasado omni-carregando--${v}`} role="status" aria-live="polite">
      <div className="omni-carregando__marca">
        <SimboloOmnisfera key={tempo} tamanho={v === "secao" ? 48 : 96} animacao={animacao ?? (tempo ? "carregando" : "encontro")} />
      </div>
      <p className="omni-carregando__texto">{mensagens[i % mensagens.length]}</p>
    </div>
  );
}

/**
 * Carregando na linha: dentro de botão, ao lado de um campo, num aviso curto.
 * Sem hooks próprios (pode trocar de lugar com um ícone sem erro do React).
 * Sem texto, é decorativo (o botão já diz o que está acontecendo).
 */
export function CarregandoLinha({ texto, tamanho = 16, gerando = false }: { texto?: string; tamanho?: number; gerando?: boolean }) {
  const simbolo = <SimboloOmnisfera tamanho={tamanho} animacao={gerando ? "gerando" : "carregando"} />;
  if (!texto) return <span className="omni-carregando-linha" aria-hidden="true">{simbolo}</span>;
  return (
    <span className="omni-carregando-linha" role="status" aria-live="polite">
      {simbolo}
      <span>{texto}</span>
    </span>
  );
}
