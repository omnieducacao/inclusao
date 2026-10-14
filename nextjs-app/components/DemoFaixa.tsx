"use client";

/**
 * Faixa da demonstração (onda 44): fica no topo enquanto o visitante navega pela Escola Demo.
 * Diz que os dados são fictícios e que nada é salvo, deixa trocar de papel, falar com a equipe ou sair.
 * Também avisa o servidor de cada módulo aberto (vai para o contato, na aba Contatos do admin).
 * Onda 50: quando o visitante tenta salvar algo, mostra um aviso único e amigável (em vez do erro de cada tela).
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
  const [bloqueado, setBloqueado] = useState(false);

  // Toda resposta 403 marcada pelo proxy como "demo" abre o aviso
  useEffect(() => {
    if (!session?.is_demo) return;
    const original = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await original(...args);
      if (res.status === 403 && res.headers.get("x-omni-demo") === "1") setBloqueado(true);
      return res;
    };
    return () => { window.fetch = original; };
  }, [session?.is_demo]);

  useEffect(() => {
    if (!bloqueado) return;
    const t = setTimeout(() => setBloqueado(false), 9000);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setBloqueado(false); };
    document.addEventListener("keydown", esc);
    return () => { clearTimeout(t); document.removeEventListener("keydown", esc); };
  }, [bloqueado]);

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
    <>
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
    <div role="status" aria-live="polite" style={{ position: "fixed", left: "50%", bottom: 24, transform: `translate(-50%, ${bloqueado ? "0" : "24px"})`, opacity: bloqueado ? 1 : 0, pointerEvents: bloqueado ? "auto" : "none", transition: "opacity .25s ease, transform .35s cubic-bezier(.2,.8,.2,1)", zIndex: 80, width: "min(560px, calc(100vw - 32px))", background: "var(--noite)", color: "var(--sobre-noite)", borderRadius: "16px 16px 16px 6px", boxShadow: "var(--sombra-3, 0 12px 32px rgba(0,0,0,.25))", padding: "16px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      {bloqueado && (
        <>
          <p style={{ margin: 0, flex: "1 1 260px", font: "500 15px/22px var(--font-sans)" }}>
            <strong style={{ fontWeight: 800 }}>Na demonstração nada é salvo.</strong> Para usar com os estudantes da sua escola, fale com a nossa equipe.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/contato" className="omni-btn omni-btn--pequeno" style={{ background: "var(--sobre-noite)", color: "var(--noite)" }}>Falar com a equipe</a>
            <button type="button" onClick={() => setBloqueado(false)} className="omni-btn omni-btn--pequeno" style={{ background: "transparent", color: "var(--sobre-noite)", border: "1px solid var(--sobre-noite-2)" }}>Entendi</button>
          </div>
        </>
      )}
    </div>
    </>
  );
}
