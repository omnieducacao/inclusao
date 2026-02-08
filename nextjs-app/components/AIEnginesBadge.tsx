"use client";

import { useEffect, useState } from "react";
import type { EngineId } from "@/lib/ai-engines";
import { ENGINE_NAMES } from "@/lib/ai-engines";
import { LottieIcon } from "./LottieIcon";

const ENGINE_COLORS: Record<EngineId, { bg: string; text: string; border: string }> = {
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  yellow: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

const ENGINE_SHORT_NAMES: Record<EngineId, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  yellow: "Yellow",
  orange: "Orange",
};

export function AIEnginesBadge() {
  const [availableEngines, setAvailableEngines] = useState<EngineId[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Buscar motores disponíveis da API
    fetch("/api/ai-engines/available")
      .then((res) => res.json())
      .then((data) => {
        if (data.available && Array.isArray(data.available)) {
          setAvailableEngines(data.available);
        }
      })
      .catch(console.error);
  }, []);

  if (availableEngines.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
      {/* Botão para minimizar/expandir */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="p-2 rounded-full bg-white border border-slate-200/60 shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title={isMinimized ? "Mostrar motores" : "Ocultar motores"}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <LottieIcon
            animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
            size={16}
            loop={true}
            className="transition-transform duration-300"
          />
        </div>
      </button>

      {/* Badges dos motores */}
      {!isMinimized && (
        <div className="flex flex-col gap-2 items-end animate-slide-up">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200/50 rounded-xl shadow-lg backdrop-blur-sm">
            {/* Ícone grande à esquerda */}
            <div className="flex-shrink-0">
              <div className="rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl"
                style={{ width: '64px', height: '64px', padding: '6px' }}
              >
                <LottieIcon
                  animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
                  size={52}
                  loop={true}
                  className="transition-transform duration-300"
                />
              </div>
            </div>
            {/* Badges dos codenomes à direita */}
            <div className="flex flex-col gap-1.5">
              {availableEngines.map((engine) => {
                const colors = ENGINE_COLORS[engine];
                return (
                  <span
                    key={engine}
                    className={`px-2 py-0.5 text-xs font-semibold rounded border ${colors.bg} ${colors.text} ${colors.border} whitespace-nowrap`}
                    title={ENGINE_NAMES[engine]}
                  >
                    {ENGINE_SHORT_NAMES[engine]}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
