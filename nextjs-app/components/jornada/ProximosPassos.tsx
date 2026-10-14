"use client";

/**
 * "Próximo passo": o fim de cada módulo aponta para onde a jornada segue (lib/jornada.ts),
 * com o estudante já escolhido e só com os módulos que a pessoa pode abrir.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { proximosPassos, type EtapaId } from "@/lib/jornada";
import { usePermissoes } from "@/components/jornada/PermissoesProvider";

export function ProximosPassos({ atual, studentId, titulo = "Próximo passo" }: { atual: EtapaId; studentId?: string | null; titulo?: string }) {
  const pode = usePermissoes();
  const passos = proximosPassos(atual, pode, studentId);
  if (!passos.length) return null;
  return (
    <nav className="omni-cartao omni-cartao--plano" aria-label={titulo} style={{ display: "grid", gap: 10 }}>
      <p className="omni-rotulo" style={{ margin: 0 }}>{titulo}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
        {passos.map((p) => (
          <li key={p.id} style={{ minWidth: 0 }}>
            <Link
              href={p.href}
              className="omni-cartao"
              style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", textDecoration: "none", color: "var(--tinta)", padding: "12px 14px", height: "100%" }}
            >
              <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <span style={{ font: "700 15px/22px var(--font-sans)" }}>{p.titulo}</span>
                <span className="omni-apoio" style={{ fontSize: 14 }}>{p.resumo}</span>
              </span>
              <ArrowRight aria-hidden style={{ width: 18, height: 18, color: "var(--acao)" }} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
