"use client";

/**
 * Histórico de materiais do estudante no Hub (onda 3): tudo o que foi gerado com o PEI dele
 * como contexto fica guardado aqui, para reabrir, copiar e reaproveitar.
 */
import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Copy, History } from "lucide-react";

type Material = {
  id: string;
  tipoNome: string;
  descricao: string | null;
  criadoEm: string;
  autor: string | null;
  versaoPei: number | null;
  temConteudo: boolean;
};

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

export function HubHistoricoEstudante({ studentId, nome, atualizar }: { studentId: string; nome: string; atualizar?: number }) {
  const [lista, setLista] = useState<Material[] | null>(null);
  const [aberto, setAberto] = useState(false);
  const [lendo, setLendo] = useState<{ id: string; conteudo: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(() => {
    fetch(`/api/hub/historico?studentId=${encodeURIComponent(studentId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { materiais: [] }))
      .then((d) => setLista(d.materiais || []))
      .catch(() => setLista([]));
  }, [studentId]);

  useEffect(() => {
    carregar();
  }, [carregar, atualizar]);

  async function abrir(id: string) {
    if (lendo?.id === id) return setLendo(null);
    const r = await fetch(`/api/hub/historico/${id}`, { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    setLendo({ id, conteudo: d.conteudo || "" });
    setCopiado(false);
  }

  async function copiar() {
    if (!lendo) return;
    try {
      await navigator.clipboard.writeText(lendo.conteudo);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  if (!lista) return null;

  return (
    <div className="rounded-2xl border border-(--omni-border-default) bg-(--omni-bg-secondary)">
      <button
        type="button"
        onClick={() => {
          setAberto((v) => !v);
          if (!aberto) carregar();
        }}
        aria-expanded={aberto}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-(--omni-text-primary)">
          <History className="w-4 h-4" /> Materiais de {nome}
          <span className="text-xs font-normal text-(--omni-text-muted)">({lista.length})</span>
        </span>
        {aberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {aberto && (
        <div className="px-4 pb-4">
          {lista.length === 0 ? (
            <p className="text-sm text-(--omni-text-muted)">
              Nada gerado ainda. O que você criar ou adaptar para este estudante fica guardado aqui, junto com a versão do PEI usada.
            </p>
          ) : (
            <ul className="divide-y divide-(--omni-border-default)">
              {lista.map((m) => (
                <li key={m.id} className="py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-(--omni-text-primary)">{m.descricao || m.tipoNome}</p>
                      <p className="text-xs text-(--omni-text-muted)">
                        {m.tipoNome} · {quando(m.criadoEm)}
                        {m.autor ? ` · ${m.autor}` : ""}
                        {m.versaoPei ? ` · PEI v${m.versaoPei}` : ""}
                      </p>
                    </div>
                    {m.temConteudo && (
                      <button type="button" onClick={() => abrir(m.id)} className="text-sm px-2.5 py-1 rounded-lg border border-(--omni-border-default)">
                        {lendo?.id === m.id ? "Fechar" : "Abrir"}
                      </button>
                    )}
                  </div>
                  {lendo?.id === m.id && (
                    <div className="mt-2 space-y-2">
                      <div className="max-h-[50vh] overflow-auto rounded-xl p-3 bg-(--omni-bg-tertiary) text-sm whitespace-pre-wrap min-w-0">
                        {lendo.conteudo}
                      </div>
                      <button type="button" onClick={copiar} className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-lg border border-(--omni-border-default)">
                        <Copy className="w-3.5 h-3.5" /> {copiado ? "Copiado" : "Copiar texto"}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
