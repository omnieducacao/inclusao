"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

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

  useEffect(() => {
    // Carregar o arquivo JSON do Lottie
    fetch(`/lottie/${animation}.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load animation: ${animation}`);
        }
        return res.json();
      })
      .then((data) => {
        setAnimationData(data);
        onLoad?.();
      })
      .catch((err) => {
        console.error(`Error loading Lottie animation "${animation}":`, err);
        setError(err.message);
      });
  }, [animation, onLoad]);

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

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* @ts-expect-error - lottie-react type definitions may be incomplete */}
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={{ width: size, height: size }}
        onComplete={onComplete}
      />
    </div>
  );
}

// Re-exportar tipos úteis
export type { LottieIconProps };
