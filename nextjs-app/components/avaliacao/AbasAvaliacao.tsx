"use client";

/** Abas Diagnóstica | Processual que levam junto o estudante (e o componente) escolhido na tela. */
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ABAS = [
  { id: "diagnostica", href: "/avaliacao-diagnostica", nome: "Diagnóstica", ajuda: "No começo: onde o estudante está" },
  { id: "processual", href: "/avaliacao-processual", nome: "Processual", ajuda: "A cada período: como está evoluindo" },
] as const;

export function AbasAvaliacao({ atual }: { atual: "diagnostica" | "processual" }) {
  const sp = useSearchParams();
  const q = new URLSearchParams();
  const student = sp?.get("student") || sp?.get("studentId");
  if (student) q.set("student", student);
  const disciplina = sp?.get("disciplina");
  if (disciplina) q.set("disciplina", disciplina);
  const sufixo = q.toString() ? `?${q}` : "";
  return (
    <nav className="omni-abas" aria-label="Tipo de avaliação">
      {ABAS.map((a) => (
        <Link key={a.id} href={`${a.href}${sufixo}`} className="omni-aba" aria-selected={a.id === atual} aria-current={a.id === atual ? "page" : undefined} style={{ textDecoration: "none" }}>
          {a.nome} <span className="omni-apoio" style={{ fontWeight: 400, fontSize: 13 }}>· {a.ajuda}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Guarda o estudante (e o componente) no endereço, sem recarregar: as abas e o "voltar" do navegador mantêm a escolha. */
export function guardarNoEndereco(student: string, disciplina?: string) {
  if (typeof window === "undefined") return;
  const u = new URL(window.location.href);
  if (student) u.searchParams.set("student", student); else u.searchParams.delete("student");
  u.searchParams.delete("studentId");
  if (disciplina) u.searchParams.set("disciplina", disciplina); else u.searchParams.delete("disciplina");
  window.history.replaceState(window.history.state, "", u.toString());
}
