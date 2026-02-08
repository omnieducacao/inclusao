/**
 * EXEMPLOS DE USO DO LottieIcon
 * 
 * Este arquivo mostra diferentes formas de usar o componente LottieIcon
 * Você pode deletar este arquivo depois de entender como usar
 */

"use client";

import { LottieIcon } from "./LottieIcon";
import { useState } from "react";

// ============================================================================
// EXEMPLO 1: Ícone Simples
// ============================================================================
export function Example1_SimpleIcon() {
  return (
    <div className="p-4">
      <LottieIcon animation="success-check" size={48} />
    </div>
  );
}

// ============================================================================
// EXEMPLO 2: Ícone com Loop (Loading)
// ============================================================================
export function Example2_LoadingIcon() {
  return (
    <div className="flex items-center gap-3 p-4">
      <LottieIcon animation="loading-spinner" size={32} loop={true} />
      <span className="text-slate-600">Carregando...</span>
    </div>
  );
}

// ============================================================================
// EXEMPLO 3: Ícone em Botão com Estado
// ============================================================================
export function Example3_ButtonWithState() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      onClick={() => setSaved(true)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
    >
      {saved ? (
        <>
          <LottieIcon animation="success-check" size={20} />
          <span>Salvo!</span>
        </>
      ) : (
        <span>Salvar</span>
      )}
    </button>
  );
}

// ============================================================================
// EXEMPLO 4: Ícone com Callback
// ============================================================================
export function Example4_WithCallback() {
  return (
    <LottieIcon
      animation="success-check"
      size={64}
      loop={false}
      onComplete={() => {
        console.log("Animação completa!");
        alert("Animação finalizada!");
      }}
    />
  );
}

// ============================================================================
// EXEMPLO 5: Ícone com Velocidade Customizada
// ============================================================================
export function Example5_CustomSpeed() {
  return (
    <div className="flex gap-4 p-4">
      <div className="text-center">
        <LottieIcon animation="loading-spinner" size={32} speed={0.5} loop={true} />
        <p className="text-xs mt-2">Lento (0.5x)</p>
      </div>
      <div className="text-center">
        <LottieIcon animation="loading-spinner" size={32} speed={1} loop={true} />
        <p className="text-xs mt-2">Normal (1x)</p>
      </div>
      <div className="text-center">
        <LottieIcon animation="loading-spinner" size={32} speed={2} loop={true} />
        <p className="text-xs mt-2">Rápido (2x)</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXEMPLO 6: Substituindo Ícone Estático
// ============================================================================
export function Example6_ReplaceStaticIcon() {
  // ANTES (com Lucide):
  // import { CheckCircle2 } from "lucide-react";
  // <CheckCircle2 className="w-6 h-6 text-green-600" />

  // DEPOIS (com Lottie):
  return (
    <div className="p-4">
      <LottieIcon animation="success-check" size={24} />
    </div>
  );
}

// ============================================================================
// EXEMPLO 7: Ícone com Estilos Customizados
// ============================================================================
export function Example7_CustomStyles() {
  return (
    <LottieIcon
      animation="success-check"
      size={48}
      className="rounded-full bg-green-100 p-2"
      style={{
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
}
