"use client";

/**
 * Faixa da demonstração (onda 44): fica no topo enquanto o visitante navega pela Escola Demo.
 * Diz que os dados são fictícios e que nada é salvo, deixa trocar de papel, falar com a equipe ou sair.
 * Também avisa o servidor de cada módulo aberto (vai para o contato, na aba Contatos do admin).
 */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { SessionPayload } from "@/lib/session";

const PAPEIS = [
  { id: "aee", rotulo: "Professor(a) do AEE" },
  { id: "regente", rotulo: "Professor(a) regente" },
  { id: "coordenacao", rotulo: "Coordenação" },
];

export function DemoFaixa({ session }: { session: SessionPayload }) {
  const pathname = usePathname() || "/";
  const [trocando, setTrocando] = useState(false);

  useEffect(() => {
    if (!session?.is_demo) return;
    fetch("/api/demo/visita", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rota: pathname }) }).catch(() => {});
  }, [pathname, session?.is_demo]);

  if (!session?.is_demo) return null;

  async function trocar(papel: string) {
    if (papel === session.demo_papel) return;
    setTrocando(true);
    const res = await fetch("/api/demo/papel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ papel }) });
    const d = await res.json().catch(() => ({}));
    window.location.href = d.redirect || "/";
  }
  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/#omnisfera";
  }

  return (
    <div role="region" aria-label="Demonstração" style={{ position: "sticky", top: 0, zIndex: 60, background: "var(--noite)", color: "var(--sobre-noite)", borderBottom: "3px solid var(--encontro-verde)" }}>
      <div style={{ maxWidth: 1920, margin: "0 auto", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px 16px", flexWrap: "wrap" }}>
        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, font: "600 14px/20px var(--font-sans)" }}>
          <Sparkles aria-hidden style={{ width: 18, height: 18, flex: "none" }} />
          <span><strong style={{ fontWeight: 800 }}>Demonstração</strong> · escola e estudantes fictícios · nada do que você fizer é salvo</span>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, font: "600 13px/18px var(--font-sans)" }}>
            <span>Ver como</span>
            <select
              value={session.demo_papel || "aee"}
              onChange={(e) => trocar(e.target.value)}
              disabled={trocando}
              style={{ font: "600 14px/20px var(--font-sans)", padding: "6px 8px", borderRadius: 8, border: "1px solid var(--sobre-noite-2)", background: "transparent", color: "var(--sobre-noite)" }}
            >
              {PAPEIS.map((p) => <option key={p.id} value={p.id} style={{ color: "#101a2e" }}>{p.rotulo}</option>)}
            </select>
          </label>
          <a href="/contato" className="omni-btn omni-btn--pequeno" style={{ background: "var(--sobre-noite)", color: "var(--noite)" }}>Falar com a equipe</a>
          <button type="button" onClick={sair} className="omni-btn omni-btn--pequeno" style={{ background: "transparent", color: "var(--sobre-noite)", border: "1px solid var(--sobre-noite-2)" }}>Sair</button>
        </div>
      </div>
    </div>
  );
}
