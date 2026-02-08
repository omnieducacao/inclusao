"use client";

import React from "react";

type Props = {
  texto: string;
  titulo?: string;
  className?: string;
  mapaImagens?: Record<number, string>; // Base64 das imagens
};

const TAG_REGEX = /\[\[(?:IMG|GEN_IMG)[^\]]*?(\d+)\]\]/gi;

/**
 * Componente para exibir textos gerados pelo Hub com formatação bonita
 * Similar ao formato do Streamlit, com suporte a markdown básico e imagens
 */
export function FormattedTextDisplay({ texto, titulo, className = "", mapaImagens }: Props) {
  if (!texto) return null;

  // Processar o texto para criar elementos React formatados
  const processarTexto = (texto: string): React.ReactNode[] => {
    const linhas = texto.split("\n");
    const elementos: React.ReactNode[] = [];
    let listaAtual: string[] = [];
    let emLista = false;

    const finalizarLista = () => {
      if (listaAtual.length > 0) {
        elementos.push(
          <ul key={`lista-${elementos.length}`} className="list-disc list-inside space-y-1 my-3 ml-4 text-slate-700">
            {listaAtual.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{formatarLinhaComImagens(item)}</li>
            ))}
          </ul>
        );
        listaAtual = [];
        emLista = false;
      }
    };

    const formatarLinhaComImagens = (linha: string): React.ReactNode => {
      // Verificar se há tags de imagem na linha
      const matches = [...linha.matchAll(new RegExp(TAG_REGEX.source, "gi"))];
      
      if (matches.length === 0) {
        // Sem imagens, processar markdown normalmente
        return formatarLinha(linha);
      }

      // Processar linha com imagens
      const partes: React.ReactNode[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const num = parseInt(match[1], 10);
        const imgBase64 = mapaImagens?.[num];

        // Texto antes da tag
        if (match.index !== undefined && match.index > lastIndex) {
          const textoAntes = linha.slice(lastIndex, match.index);
          if (textoAntes.trim()) {
            partes.push(formatarLinha(textoAntes));
          }
        }

        // Imagem ou placeholder
        if (imgBase64) {
          partes.push(
            <div key={`img-${num}`} className="my-4 flex justify-center">
              <img
                src={`data:image/png;base64,${imgBase64}`}
                alt={`Imagem ${num}`}
                className="max-w-full h-auto rounded-lg shadow-md border border-slate-200"
                style={{ maxHeight: "400px" }}
              />
            </div>
          );
        } else {
          partes.push(
            <span key={`placeholder-${num}`} className="text-slate-400 italic text-sm">
              [Imagem {num}]
            </span>
          );
        }

        lastIndex = (match.index ?? 0) + match[0].length;
      }

      // Texto restante após a última tag
      if (lastIndex < linha.length) {
        const textoResto = linha.slice(lastIndex);
        if (textoResto.trim()) {
          partes.push(formatarLinha(textoResto));
        }
      }

      return <>{partes}</>;
    };

    const formatarLinha = (linha: string): React.ReactNode => {
      // Processar markdown básico
      let textoFormatado = linha
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>');

      // Processar links básicos
      textoFormatado = textoFormatado.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-600 hover:text-cyan-700 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');

      return <span dangerouslySetInnerHTML={{ __html: textoFormatado }} />;
    };

    linhas.forEach((linha, idx) => {
      const linhaTrim = linha.trim();

      // Verificar se a linha inteira é apenas uma tag de imagem
      const imgMatch = linhaTrim.match(new RegExp(`^${TAG_REGEX.source}$`, "i"));
      if (imgMatch) {
        finalizarLista();
        const num = parseInt(imgMatch[1], 10);
        const imgBase64 = mapaImagens?.[num];
        if (imgBase64) {
          elementos.push(
            <div key={`img-block-${idx}`} className="my-4 flex justify-center">
              <img
                src={`data:image/png;base64,${imgBase64}`}
                alt={`Imagem ${num}`}
                className="max-w-full h-auto rounded-lg shadow-md border border-slate-200"
                style={{ maxHeight: "400px" }}
              />
            </div>
          );
        } else {
          elementos.push(
            <div key={`placeholder-block-${idx}`} className="my-4 text-center text-slate-400 italic text-sm">
              [Imagem {num}]
            </div>
          );
        }
        return;
      }

      // Título nível 2 (##)
      if (linhaTrim.startsWith("## ") && !linhaTrim.startsWith("###")) {
        finalizarLista();
        const tituloTexto = linhaTrim.replace(/^##\s+/, "");
        elementos.push(
          <h2 key={`h2-${idx}`} className="text-xl font-bold text-slate-800 mt-6 mb-3 pt-4 border-t border-slate-200 first:border-t-0 first:pt-0">
            {tituloTexto}
          </h2>
        );
        return;
      }

      // Título nível 3 (###)
      if (linhaTrim.startsWith("### ")) {
        finalizarLista();
        const tituloTexto = linhaTrim.replace(/^###\s+/, "");
        elementos.push(
          <h3 key={`h3-${idx}`} className="text-lg font-semibold text-slate-800 mt-5 mb-2">
            {tituloTexto}
          </h3>
        );
        return;
      }

      // Título nível 4 (####)
      if (linhaTrim.startsWith("#### ")) {
        finalizarLista();
        const tituloTexto = linhaTrim.replace(/^####\s+/, "");
        elementos.push(
          <h4 key={`h4-${idx}`} className="text-base font-semibold text-slate-700 mt-4 mb-2">
            {tituloTexto}
          </h4>
        );
        return;
      }

      // Item de lista (- ou * ou •)
      if (/^[-*•]\s+/.test(linhaTrim) || /^\d+\.\s+/.test(linhaTrim)) {
        if (!emLista) {
          finalizarLista();
          emLista = true;
        }
        const itemTexto = linhaTrim.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
        listaAtual.push(itemTexto);
        return;
      }

      // Linha vazia
      if (linhaTrim === "") {
        finalizarLista();
        elementos.push(<br key={`br-${idx}`} />);
        return;
      }

      // Parágrafo normal (pode conter imagens)
      finalizarLista();
      elementos.push(
        <div key={`p-${idx}`} className="text-slate-700 leading-relaxed mb-3">
          {formatarLinhaComImagens(linhaTrim)}
        </div>
      );
    });

    // Finalizar lista se ainda houver itens
    finalizarLista();

    return elementos;
  };

  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      {titulo && (
        <div className="mb-4 pb-3 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">{titulo}</h3>
        </div>
      )}
      <div className="text-sm text-slate-700 leading-relaxed">
        {processarTexto(texto)}
      </div>
    </div>
  );
}
