"use client";

import type { EngineId } from "@/lib/ai-engines";

const ENGINES: { id: EngineId; label: string }[] = [
  { id: "red", label: "🔴 Red" },
  { id: "blue", label: "🔵 Blue" },
  { id: "green", label: "🟢 Green" },
];

type Props = {
  value: EngineId;
  onChange: (e: EngineId) => void;
  compact?: boolean;
};

export function EngineSelector({ value, onChange, compact }: Props) {
  return (
    <details className="rounded-lg border border-slate-200 bg-slate-50/50">
      <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-slate-700">
        🔧 Motor de IA (texto)
      </summary>
      <div className={`p-3 ${compact ? "flex flex-wrap gap-2" : "space-y-2"}`}>
        {ENGINES.map((e) => (
          <label
            key={e.id}
            className={`flex items-center gap-2 cursor-pointer ${
              compact ? "px-2 py-1 rounded" : "block"
            } ${value === e.id ? "text-cyan-700 font-medium" : "text-slate-600"}`}
          >
            <input
              type="radio"
              name="hub_engine"
              value={e.id}
              checked={value === e.id}
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
