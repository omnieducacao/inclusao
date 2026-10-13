"use client";

/**
 * Onda 22: visual do design system — escolha do motor em omni-segmentado (compacto) ou omni-caixa (lista),
 * sem classes de cor do Tailwind.
 */
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
      <fieldset
        className={compact ? "omni-segmentado" : "flex flex-col gap-2"}
        style={{ margin: 12, ...(compact ? {} : { border: 0, padding: 0 }) }}
      >
        <legend className="omni-so-leitor">Motor de IA</legend>
        {ENGINES.map((e) => (
          <label key={e.id} className={compact ? undefined : "omni-caixa"} style={compact ? undefined : { fontSize: 15 }}>
            <input
              type="radio"
              name="hub_engine"
              value={e.id}
              checked={value === e.id}
              onChange={() => onChange(e.id)}
            />
            <span>{e.label}</span>
          </label>
        ))}
      </fieldset>
    </details>
  );
}
