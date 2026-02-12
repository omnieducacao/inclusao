"use client";

import React, { useEffect, useState } from "react";

// ─── Performance: Singleton cache ───
// Module-level cache shared across ALL LottieIcon instances
const jsonCache = new Map<string, any>();
const fetchPromises = new Map<string, Promise<any>>();
let lottieModule: any = null;
let lottieLoadPromise: Promise<any> | null = null;

function loadLottieLibrary(): Promise<any> {
  if (lottieModule) return Promise.resolve(lottieModule);
  if (lottieLoadPromise) return lottieLoadPromise;
  lottieLoadPromise = import("lottie-react")
    .then((mod) => { lottieModule = mod.default; return lottieModule; })
    .catch((err) => { console.warn(`[LottieIcon] Could not load lottie-react:`, err); return null; });
  return lottieLoadPromise;
}

function fetchAnimationJSON(animation: string): Promise<any> {
  if (jsonCache.has(animation)) return Promise.resolve(jsonCache.get(animation));
  if (fetchPromises.has(animation)) return fetchPromises.get(animation)!;
  const promise = fetch(`/lottie/${animation}.json`)
    .then((res) => { if (!res.ok) throw new Error(`Failed: ${animation}`); return res.json(); })
    .then((data) => { jsonCache.set(animation, data); fetchPromises.delete(animation); return data; })
    .catch((err) => { fetchPromises.delete(animation); throw err; });
  fetchPromises.set(animation, promise);
  return promise;
}

type LottieIconProps = {
  /**
   * Nome do arquivo JSON do Lottie (sem extensão)
   * Exemplo: "success-animation" para public/lottie/success-animation.json
   */
  animation: string;
  /**
   * Tamanho do ícone (width e height serão iguais)
   */
  size?: number;
  /**
   * Se deve fazer loop da animação
   */
  loop?: boolean;
  /**
   * Se deve autoplay da animação
   */
  autoplay?: boolean;
  /**
   * Velocidade da animação (1 = normal, 2 = 2x mais rápido, 0.5 = metade da velocidade)
   */
  speed?: number;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Estilo inline adicional
   */
  style?: React.CSSProperties;
  /**
   * Callback quando a animação é carregada
   */
  onLoad?: () => void;
  /**
   * Callback quando a animação completa (se não estiver em loop)
   */
  onComplete?: () => void;
};

/**
 * Componente wrapper para ícones Lottie animados
 * 
 * Uso:
 * ```tsx
 * <LottieIcon animation="success-check" size={48} />
 * ```
 * 
 * Requer que o arquivo JSON esteja em: public/lottie/success-check.json
 */
export function LottieIcon({
  animation,
  size = 48,
  loop = false,
  autoplay = true,
  speed = 1,
  className = "",
  style = {},
  onLoad,
  onComplete,
}: LottieIconProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [LottieComponent, setLottieComponent] = useState<any>(null);

  // Garantir que só renderiza no cliente e carregar Lottie dinamicamente (singleton)
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      loadLottieLibrary()
        .then((component) => {
          if (component) setLottieComponent(() => component);
          else setError("Failed to load Lottie library");
        });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    // Usar cache compartilhado para JSON
    fetchAnimationJSON(animation)
      .then((data) => {
        setAnimationData(data);
        onLoad?.();
      })
      .catch((err) => {
        console.warn(`[LottieIcon] Could not load animation "${animation}":`, err.message);
        setError(err.message);
      });
  }, [animation, onLoad, isMounted]);

  // Durante SSR ou antes de montar, retornar um placeholder vazio
  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  // Se Lottie ainda não foi carregado, mostrar loading
  if (!LottieComponent) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    // Fallback: mostrar um ícone estático ou mensagem de erro
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        <span className="text-xs text-slate-400" title={`Erro ao carregar: ${animation}`}>
          ⚠️
        </span>
      </div>
    );
  }

  if (!animationData) {
    // Loading state
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  try {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        {/* @ts-ignore - lottie-react type definitions may be incomplete */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {React.createElement(LottieComponent, {
          animationData,
          loop,
          autoplay,
          speed,
          style: { width: size, height: size },
          onComplete,
        })}
      </div>
    );
  } catch (err) {
    // Catch qualquer erro durante renderização do Lottie
    console.warn(`[LottieIcon] Error rendering animation "${animation}":`, err);
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        <span className="text-xs text-slate-400" title={`Erro ao renderizar: ${animation}`}>
          ⚠️
        </span>
      </div>
    );
  }
}

// Re-exportar tipos úteis
export type { LottieIconProps };
