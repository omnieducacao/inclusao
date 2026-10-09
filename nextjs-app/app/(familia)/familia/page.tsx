"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Estudante = { id: string; name: string; grade: string | null; class_group: string | null };

/** Início da família (10/10/2026): os estudantes ligados à conta, no design system. */
export default function FamiliaInicioPage() {
  const [estudantes, setEstudantes] = useState<Estudante[] | null>(null);

  useEffect(() => {
    fetch("/api/familia/meus-estudantes")
      .then((r) => r.json())
      .then((d) => setEstudantes(d.estudantes || []))
      .catch(() => setEstudantes([]));
  }, []);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, font: "800 28px/34px var(--font-sans)", color: "var(--tinta)" }}>Meus estudantes</h1>
        <p className="omni-apoio" style={{ margin: "4px 0 0" }}>O plano de cada um, como estão indo e a conversa com a escola.</p>
      </div>

      {estudantes === null ? (
        <p className="omni-apoio" role="status">Carregando…</p>
      ) : estudantes.length === 0 ? (
        <div className="omni-vazio" style={{ textAlign: "center" }}>
          <p className="omni-vazio__titulo">Nenhum estudante ligado à sua conta</p>
          <p className="omni-vazio__texto">Fale com a escola para ligar o estudante ao seu acesso.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {estudantes.map((e) => (
            <li key={e.id}>
              <Link href={`/familia/estudante/${e.id}`} className="omni-cartao omni-cartao--plano" style={{ display: "flex", flexDirection: "row", gap: 14, alignItems: "center", textDecoration: "none", height: "100%" }}>
                <span className="omni-avatar" aria-hidden style={{ width: 48, height: 48, fontSize: 18 }}>{e.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", font: "800 17px/22px var(--font-sans)", color: "var(--tinta)" }}>{e.name}</span>
                  <span className="omni-apoio" style={{ display: "block" }}>{[e.grade, e.class_group && `Turma ${e.class_group}`].filter(Boolean).join(" · ") || "—"}</span>
                  <span style={{ display: "block", marginTop: 4, font: "700 14px/20px var(--font-sans)", color: "var(--acao)" }}>Abrir →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
