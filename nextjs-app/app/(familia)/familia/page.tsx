"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, FileText, TrendingUp, Loader2 } from "lucide-react";

type Estudante = {
  id: string;
  name: string;
  grade: string | null;
  class_group: string | null;
};

export default function FamiliaDashboardPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/familia/meus-estudantes")
      .then((r) => r.json())
      .then((data) => {
        setEstudantes(data.estudantes || []);
      })
      .catch(() => setEstudantes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--omni-text-primary)]">Meus Estudantes</h1>
        <p className="text-[var(--omni-text-secondary)] mt-1">
          Acompanhe o PEI e a evolução dos estudantes vinculados a você.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-[var(--omni-text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin" />
          Carregando...
        </div>
      ) : estudantes.length === 0 ? (
        <div className="rounded-2xl bg-[var(--omni-bg-secondary)] p-8 text-center border border-[var(--omni-border-default)] shadow-sm">
          <Users className="w-12 h-12 text-[var(--omni-border-default)] mx-auto mb-4" />
          <p className="text-[var(--omni-text-secondary)] font-medium">Nenhum estudante vinculado</p>
          <p className="text-sm text-[var(--omni-text-muted)] mt-4">
            Entre em contato com a escola para cadastrar o vínculo e acessar o acompanhamento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estudantes.map((e) => (
            <Link
              key={e.id}
              href={`/familia/estudante/${e.id}`}
              className="block p-6 rounded-2xl bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)] hover:border-emerald-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-emerald-700">
                    {e.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--omni-text-primary)] truncate">{e.name}</h3>
                  <p className="text-sm text-[var(--omni-text-muted)] mt-0.5">
                    {e.grade || "—"} {e.class_group ? `• ${e.class_group}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[var(--omni-text-secondary)]">
                    <FileText className="w-4 h-4" />
                    <span className="text-s-xs">Ver PEI e evolução</span>
                    <TrendingUp className="w-4 h-4 ml-auto" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
