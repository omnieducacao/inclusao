"use client";

import { useEffect } from "react";
import type { EngineId } from "@/lib/ai-engines";
import { getAvailableEngines, getDefaultEngine, type ModuleType } from "@/lib/engine-selector";

const ALL_ENGINES: { id: EngineId; label: string }[] = [
  { id: "red", label: "🔴 OmniRed" },
  { id: "blue", label: "🔵 OmniBlue" },
  { id: "green", label: "🟢 OmniGreen" },
  { id: "yellow", label: "🟡 OmniYellow" },
  { id: "orange", label: "🟠 OmniOrange" },
];

type Props = {
  value: EngineId;
  onChange: (e: EngineId) => void;
  compact?: boolean;
  module?: ModuleType; // Filtra opções baseado no módulo
};

export function EngineSelector({ value, onChange, compact, module }: Props) {
  // Se módulo especificado, filtra apenas os motores disponíveis
  const availableEngines = module
    ? ALL_ENGINES.filter((e) => getAvailableEngines(module).includes(e.id))
    : ALL_ENGINES;

  // Se o valor atual não estiver nas opções disponíveis, ajusta para o padrão do módulo
  const currentValue = availableEngines.some((e) => e.id === value)
    ? value
    : module
      ? getDefaultEngine(module)
      : availableEngines[0]?.id || "red";

  // Sincroniza o valor quando o módulo muda
  useEffect(() => {
    if (module && !availableEngines.some((e) => e.id === value)) {
      const defaultEngine = getDefaultEngine(module);
      onChange(defaultEngine);
    }
  }, [module, value, availableEngines, onChange]);

  return (
    <details className="rounded-lg border border-slate-200 bg-slate-50/50">
      <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-slate-700">
        🔧 Motor de IA
      </summary>
      <div className={`p-3 ${compact ? "flex flex-wrap gap-2" : "space-y-2"}`}>
        {availableEngines.map((e) => (
          <label
            key={e.id}
            className={`flex items-center gap-2 cursor-pointer ${
              compact ? "px-2 py-1 rounded" : "block"
            } ${currentValue === e.id ? "text-cyan-700 font-medium" : "text-slate-600"}`}
          >
            <input
              type="radio"
              name="engine_selector"
              value={e.id}
              checked={currentValue === e.id}
              onChange={() => onChange(e.id)}
              className="rounded-full border-slate-300 text-cyan-600"
            />
            <span className="text-sm">{e.label}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
