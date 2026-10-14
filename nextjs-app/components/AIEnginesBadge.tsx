"use client";

import { useEffect, useState } from "react";
import type { EngineId } from "@/lib/ai-engines";
import { ENGINE_NAMES } from "@/lib/ai-engines";
import { Sparkles } from "lucide-react";
import { LottieIcon } from "./LottieIcon";

// Onda 20: cores do símbolo Encontro (tokens do design system) no lugar da paleta do Tailwind
const ENGINE_COLORS: Record<EngineId, { bg: string; text: string; dot: string }> = {
  red: { bg: "var(--encontro-vermelho-suave)", text: "var(--encontro-vermelho-forte)", dot: "var(--encontro-vermelho)" },
  blue: { bg: "var(--encontro-azul-suave)", text: "var(--encontro-azul-forte)", dot: "var(--encontro-azul)" },
  green: { bg: "var(--encontro-verde-suave)", text: "var(--encontro-verde-forte)", dot: "var(--encontro-verde)" },
  yellow: { bg: "var(--encontro-amarelo-suave)", text: "var(--encontro-amarelo-forte)", dot: "var(--encontro-amarelo)" },
  orange: { bg: "var(--encontro-laranja-suave)", text: "var(--encontro-laranja-forte)", dot: "var(--encontro-laranja)" },
};

const ENGINE_SHORT_NAMES: Record<EngineId, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  yellow: "Yellow",
  orange: "Orange",
};

export function AIEnginesBadge({ engines }: { engines?: EngineId[] } = {}) {
  const [availableEngines, setAvailableEngines] = useState<EngineId[]>(engines || []);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (engines && engines.length > 0) return; // Already provided via props
    fetch("/api/ai-engines/available")
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data) => {
        if (data?.available && Array.isArray(data.available)) {
          setAvailableEngines(data.available);
        }
      })
      .catch(console.error);
  }, [engines]);

  if (availableEngines.length === 0) {
    return null;
  }

  const caixa: React.CSSProperties = {
    background: "var(--superficie)",
    border: "1px solid var(--borda)",
    boxShadow: "var(--sombra-2)",
  };

  return (
    // Onda 37: no celular a pílula flutuante cobria botões do fim dos formulários
    <div className="omni-so-tela-grande" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 40, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
      {/* Painel aberto */}
      {isExpanded && (
        <div
          id="motores-ia-painel"
          style={{ ...caixa, padding: 16, maxWidth: "calc(100vw - 40px)", borderRadius: "var(--o-radius-lg) var(--o-radius-lg) var(--o-radius-xs) var(--o-radius-lg)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--encontro-roxo-suave)" }}>
              <LottieIcon
                animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
                size={24}
                className="transition-transform duration-300"
              />
            </div>
            <div>
              <p style={{ margin: 0, font: "700 14px/20px var(--font-sans)", color: "var(--tinta)" }}>Motores de inteligência artificial (IA)</p>
              <p style={{ margin: 0, font: "400 12px/16px var(--font-sans)", color: "var(--tinta-2)" }}>
                {availableEngines.length} {availableEngines.length === 1 ? "ativo" : "ativos"}
              </p>
            </div>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {availableEngines.map((engine) => {
              const colors = ENGINE_COLORS[engine];
              return (
                <li
                  key={engine}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: "var(--o-radius-pill)", background: colors.bg, color: colors.text, font: "700 12px/16px var(--font-sans)", whiteSpace: "nowrap" }}
                  title={ENGINE_NAMES[engine]}
                >
                  <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.dot }} />
                  Omni{ENGINE_SHORT_NAMES[engine]}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Botão: pílula quando fechado */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ ...caixa, display: "flex", alignItems: "center", gap: 8, minHeight: 40, padding: "8px 12px", borderRadius: "var(--o-radius-pill)", cursor: "pointer", color: "var(--tinta-2)" }}
        title={isExpanded ? "Ocultar motores de IA" : "Motores de IA ativos"}
        aria-label={isExpanded ? "Ocultar motores de inteligência artificial" : `Mostrar ${availableEngines.length} motores de inteligência artificial ativos`}
        aria-expanded={isExpanded}
        aria-controls="motores-ia-painel"
      >
        <span aria-hidden style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isExpanded ? (
            <LottieIcon
              animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
              size={18}
              className="transition-transform duration-300"
            />
          ) : (
            <Sparkles style={{ width: 16, height: 16, color: "var(--encontro-roxo-forte)" }} />
          )}
        </span>
        {!isExpanded && (
          <span aria-hidden style={{ font: "700 12px/16px var(--font-sans)", paddingRight: 2 }}>
            {availableEngines.length} IA
          </span>
        )}
      </button>
    </div>
  );
}
