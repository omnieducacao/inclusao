"use client";
import React from "react";
import { NIVEIS_SUPORTE } from "@/lib/pei";

// Onda 18: régua do nível de apoio no design system (cor de ação, sem estilo injetado)
export function NivelSuporteRange({
  value,
  max,
  onChange,
  id,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  id: string;
}) {
  const rangeId = `range-${id.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const texto = NIVEIS_SUPORTE[value] ?? String(value);

  return (
    <input
      type="range"
      min={0}
      max={max}
      step={1}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      id={rangeId}
      aria-label="Nível de apoio"
      aria-valuetext={texto}
      style={{ width: "100%", accentColor: "var(--acao)", cursor: "pointer", minHeight: 24 }}
    />
  );
}
