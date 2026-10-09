"use client";

import type { EngineId } from "@/lib/ai-engines";

const ENGINES: { id: EngineId; label: string }[] = [
  { id: "red", label: "Red (padrão)" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
];

type Props = {
  value: EngineId;
  onChange: (e: EngineId) => void;
  compact?: boolean;
};

export function EngineSelector({ value, onChange, compact }: Props) {
  return (
    <details style={{ border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", background: "var(--superficie)" }}>
      <summary style={{ padding: "8px 12px", cursor: "pointer", font: "600 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
        Opções avançadas · motor de IA: {ENGINES.find((e) => e.id === value)?.label || value}
      </summary>
      <div className={`p-3 ${compact ? "flex flex-wrap gap-2" : "space-y-2"}`}>
        {ENGINES.map((e) => (
          <label
            key={e.id}
            className={`flex items-center gap-2 cursor-pointer ${
              compact ? "px-2 py-1 rounded" : "block"
            } `}
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
