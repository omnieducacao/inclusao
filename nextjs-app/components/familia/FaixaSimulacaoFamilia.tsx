"use client";

/** Faixa quando a coordenação está vendo a Omnisfera como um responsável (10/10/2026). Antes não havia como voltar. */
import { useState } from "react";
import { Eye, X } from "lucide-react";

export function FaixaSimulacaoFamilia({ nome }: { nome: string }) {
  const [saindo, setSaindo] = useState(false);
  async function voltar() {
    setSaindo(true);
    const r = await fetch("/api/simulate-family", { method: "DELETE" }).catch(() => null);
    if (r?.ok) window.location.href = "/gestao"; else setSaindo(false);
  }
  return (
    <div role="status" style={{ position: "sticky", top: 0, zIndex: 60, background: "var(--noite)", color: "var(--sobre-noite)", borderBottom: "3px solid var(--encontro-roxo)" }}>
      <div style={{ maxWidth: 1920, margin: "0 auto", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, font: "600 14px/20px var(--font-sans)" }}>
          <Eye aria-hidden style={{ width: 18, height: 18 }} />
          <span>Você está vendo a área da família como <strong style={{ color: "#fff" }}>{nome}</strong>. O que você enviar aqui fica registrado como dessa pessoa.</span>
        </p>
        <button type="button" onClick={voltar} disabled={saindo} className="omni-btn omni-btn--pequeno" style={{ background: "#fff", color: "var(--noite)" }}>
          <X aria-hidden /> Voltar para a minha conta
        </button>
      </div>
    </div>
  );
}
