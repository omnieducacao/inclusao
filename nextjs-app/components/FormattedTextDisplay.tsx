"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";

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
          <ul key={`lista-${elementos.length}`} style={{ margin: "4px 0 12px", paddingLeft: 22, listStyle: "disc", display: "grid", gap: 4, color: "var(--tinta)" }}>
            {listaAtual.map((item, idx) => (
              <li key={idx} style={{ lineHeight: 1.6 }}>{formatarLinhaComImagens(item)}</li>
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
            <div key={`img-${num}`} style={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${imgBase64}`}
                alt={`Imagem ${num}`}
                style={{ maxWidth: "100%", height: "auto", maxHeight: "400px", borderRadius: "var(--o-radius-md)", border: "1px solid var(--borda)" }}
              />
            </div>
          );
        } else {
          partes.push(
            <span key={`placeholder-${num}`} style={{ color: "var(--tinta-3)", fontStyle: "italic", fontSize: 14 }}>
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
        .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;color:var(--tinta)">$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:var(--superficie-2);padding:1px 5px;border-radius:6px;font-family:var(--font-mono);font-size:.9em">$1</code>');

      // Processar imagens markdown ![alt](url) ANTES de links
      textoFormatado = textoFormatado.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;border:1px solid var(--borda)" />'
      );

      // Processar links básicos [text](url) — excluindo imagens já processadas
      textoFormatado = textoFormatado.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--acao);font-weight:600;text-decoration:underline" target="_blank" rel="noopener noreferrer">$1</a>');

      const textoLimpo = DOMPurify.sanitize(textoFormatado, {
        ADD_TAGS: ['img'],
        ADD_ATTR: ['src', 'alt', 'style'],
      });
      return <span dangerouslySetInnerHTML={{ __html: textoLimpo }} />;
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
            <div key={`img-block-${idx}`} style={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
              <img
                src={`data:image/png;base64,${imgBase64}`}
                alt={`Imagem ${num}`}
                style={{ maxWidth: "100%", height: "auto", maxHeight: "400px", borderRadius: "var(--o-radius-md)", border: "1px solid var(--borda)" }}
              />
            </div>
          );
        } else {
          elementos.push(
            <div key={`placeholder-block-${idx}`} style={{ margin: "16px 0", textAlign: "center", color: "var(--tinta-3)", fontStyle: "italic", fontSize: 14 }}>
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
          <h2 key={`h2-${idx}`} style={{ font: "800 20px/28px var(--font-sans)", color: "var(--tinta)", margin: idx === 0 ? "0 0 10px" : "22px 0 10px", paddingTop: idx === 0 ? 0 : 14, borderTop: idx === 0 ? 0 : "1px solid var(--borda)", textWrap: "balance" }}>
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
          <h3 key={`h3-${idx}`} style={{ font: "700 18px/26px var(--font-sans)", color: "var(--tinta)", margin: "18px 0 8px" }}>
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
          <h4 key={`h4-${idx}`} style={{ font: "700 16px/24px var(--font-sans)", color: "var(--tinta-2)", margin: "14px 0 6px" }}>
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
        // linha vazia: o espaço já vem da margem dos parágrafos e títulos
        return;
      }

      // Parágrafo normal (pode conter imagens)
      finalizarLista();
      elementos.push(
        <div key={`p-${idx}`} style={{ color: "var(--tinta)", lineHeight: 1.65, marginBottom: 10 }}>
          {formatarLinhaComImagens(linhaTrim)}
        </div>
      );
    });

    // Finalizar lista se ainda houver itens
    finalizarLista();

    return elementos;
  };

  return (
    <div className={className} style={{ maxWidth: "75ch", minWidth: 0, overflowWrap: "anywhere" }}>
      {titulo && (
        <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--borda)" }}>
          <h3 style={{ margin: 0, font: "700 18px/26px var(--font-sans)", color: "var(--tinta)" }}>{titulo}</h3>
        </div>
      )}
      <div style={{ font: "400 15px/1.65 var(--font-sans)", color: "var(--tinta)" }}>
        {processarTexto(texto)}
      </div>
    </div>
  );
}
