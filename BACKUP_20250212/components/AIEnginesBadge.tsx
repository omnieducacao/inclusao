"use client";

import { useEffect, useState } from "react";
import type { EngineId } from "@/lib/ai-engines";
import { ENGINE_NAMES } from "@/lib/ai-engines";
import { LottieIcon } from "./LottieIcon";

const ENGINE_COLORS: Record<EngineId, { bg: string; text: string; dot: string }> = {
  red: { bg: "bg-red-50", text: "text-red-600", dot: "#ef4444" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", dot: "#3b82f6" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "#10b981" },
  yellow: { bg: "bg-amber-50", text: "text-amber-600", dot: "#f59e0b" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", dot: "#f97316" },
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
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
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
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2 items-end">
      {/* Expanded panel */}
      {isExpanded && (
        <div
          className="glass-strong rounded-2xl p-4 animate-fade-in-up"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(226,232,240,0.5)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <LottieIcon
                animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
                size={24}
                loop={true}
                className="transition-transform duration-300"
              />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700">Motores IA</p>
              <p className="text-[11px] text-slate-400">{availableEngines.length} ativos</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableEngines.map((engine) => {
              const colors = ENGINE_COLORS[engine];
              return (
                <span
                  key={engine}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg ${colors.bg} ${colors.text} whitespace-nowrap transition-all`}
                  title={ENGINE_NAMES[engine]}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
                  Omni{ENGINE_SHORT_NAMES[engine]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle button — pill when collapsed */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-2 px-3 py-2 rounded-full glass-strong transition-all duration-300 hover:scale-105"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '1px solid rgba(226,232,240,0.5)' }}
        title={isExpanded ? "Ocultar motores" : "Motores IA ativos"}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {isExpanded ? (
            <LottieIcon
              animation="wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch"
              size={18}
              loop={true}
              className="transition-transform duration-300"
            />
          ) : (
            <span className="text-[13px]">🤖</span>
          )}
        </div>
        {!isExpanded && (
          <span className="text-[11px] font-bold text-slate-500 pr-0.5">
            {availableEngines.length} IA
          </span>
        )}
      </button>
    </div>
  );
}
