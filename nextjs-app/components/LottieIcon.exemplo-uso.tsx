/**
 * EXEMPLOS PRÁTICOS DE USO DOS SEUS ÍCONES LOTTIE
 * 
 * Este arquivo mostra como usar os ícones que você baixou
 * Você pode deletar este arquivo depois de entender como usar
 */

"use client";

import { LottieIcon } from "./LottieIcon";
import { useState } from "react";

// ============================================================================
// EXEMPLO 1: Botão de Salvar com Animação de Sucesso
// ============================================================================
export function BotaoSalvarComSucesso() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      onClick={() => {
        setSaved(true);
        // Simular salvamento
        setTimeout(() => setSaved(false), 2000);
      }}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
    >
      {saved ? (
        <>
          <LottieIcon 
            animation="wired-lineal-2462-fireworks-hover-burst" 
            size={20}
            loop={false}
          />
          <span>Salvo!</span>
        </>
      ) : (
        <span>Salvar</span>
      )}
    </button>
  );
}

// ============================================================================
// EXEMPLO 2: Card do Hub com Ícone Animado
// ============================================================================
export function CardHubComLottie() {
  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 hover:border-cyan-500 transition-all">
      <LottieIcon 
        animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch" 
        size={64}
        loop={true}
      />
      <h3 className="text-lg font-bold mt-4">Hub de Recursos</h3>
      <p className="text-slate-600 text-sm">Inteligência artificial para apoio</p>
    </div>
  );
}

// ============================================================================
// EXEMPLO 3: Loading State com Bulb
// ============================================================================
export function LoadingComBulb() {
  return (
    <div className="flex items-center gap-3 p-4">
      <LottieIcon 
        animation="wired-lineal-36-bulb-hover-blink" 
        size={32}
        loop={true}
      />
      <span className="text-slate-600">Gerando ideias...</span>
    </div>
  );
}

// ============================================================================
// EXEMPLO 4: Módulo Estudantes com Ícone
// ============================================================================
export function ModuloEstudantes() {
  return (
    <div className="flex items-center gap-4 p-6 bg-white rounded-xl border-2 border-slate-200">
      <LottieIcon 
        animation="wired-lineal-314-three-avatars-icon-calm-hover-jumping" 
        size={48}
        loop={true}
      />
      <div>
        <h2 className="text-xl font-bold">Estudantes</h2>
        <p className="text-slate-600">Gestão completa de estudantes</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXEMPLO 5: Sucesso com Fireworks
// ============================================================================
export function MensagemSucesso() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3">
      <LottieIcon 
        animation="wired-lineal-2462-fireworks-hover-burst" 
        size={32}
        loop={false}
        onComplete={() => setTimeout(() => setShow(false), 1000)}
      />
      <span className="font-medium">Operação concluída com sucesso!</span>
    </div>
  );
}

// ============================================================================
// EXEMPLO 6: Título de Página com Ícone
// ============================================================================
export function TituloPaginaComLottie() {
  return (
    <div className="flex items-center gap-4 mb-6">
      <LottieIcon 
        animation="wired-lineal-186-puzzle-hover-detach" 
        size={56}
        loop={true}
      />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Plano de Ação / PAEE</h1>
        <p className="text-slate-600">Plano de Atendimento Educacional Especializado</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXEMPLO 7: Gráfico de Crescimento
// ============================================================================
export function CardMonitoramento() {
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <LottieIcon 
          animation="wired-lineal-152-bar-chart-arrow-hover-growth" 
          size={48}
          loop={true}
        />
        <span className="text-2xl font-bold text-blue-600">+25%</span>
      </div>
      <h3 className="font-semibold text-slate-800">Evolução</h3>
      <p className="text-sm text-slate-600">Progresso dos estudantes</p>
    </div>
  );
}

// ============================================================================
// EXEMPLO 8: Botão de Enviar
// ============================================================================
export function BotaoEnviar() {
  const [sending, setSending] = useState(false);

  return (
    <button
      onClick={() => {
        setSending(true);
        setTimeout(() => setSending(false), 2000);
      }}
      disabled={sending}
      className="px-6 py-3 bg-cyan-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
    >
      {sending ? (
        <>
          <LottieIcon 
            animation="wired-lineal-143-paperplane-send-hover-wave" 
            size={20}
            loop={true}
          />
          <span>Enviando...</span>
        </>
      ) : (
        <>
          <LottieIcon 
            animation="wired-lineal-143-paperplane-send-hover-wave" 
            size={20}
            loop={false}
          />
          <span>Enviar</span>
        </>
      )}
    </button>
  );
}
