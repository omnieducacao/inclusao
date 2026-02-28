"use client";

import { useState, useCallback } from "react";

type Plano = { id: string; disciplina: string; ano_serie: string; bimestre?: string };

/**
 * Botão "Salvar no Plano" — persiste conteúdo do Hub em planos_ensino (4.4.2).
 * Exibe modal para escolher plano e chama POST /api/hub/salvar-no-plano.
 */
export function SalvarNoPlanoButton({
  conteudo,
  tipo,
  className = "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm",
}: {
  conteudo: string;
  tipo?: string;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const abrir = useCallback(async () => {
    setAberto(true);
    setErro(null);
    setSucesso(false);
    setLoading(true);
    try {
      const res = await fetch("/api/plano-curso");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar planos");
      setPlanos(data.planos || []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  }, []);

  const salvar = async (planoId: string) => {
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch("/api/hub/salvar-no-plano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano_ensino_id: planoId, conteudo, tipo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setSucesso(true);
      setTimeout(() => {
        setAberto(false);
        setSucesso(false);
      }, 1500);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <button type="button" onClick={abrir} className={className}>
        Salvar no Plano
      </button>
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !salvando && setAberto(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Salvar no Plano de Ensino</h3>
            {loading && <p className="text-slate-600">Carregando planos…</p>}
            {erro && <p className="text-red-600 text-sm mb-3">{erro}</p>}
            {sucesso && <p className="text-emerald-600 text-sm mb-3">Salvo com sucesso!</p>}
            {!loading && planos.length === 0 && !erro && (
              <p className="text-slate-600 text-sm">Nenhum plano de curso encontrado. Crie um em Plano de Curso primeiro.</p>
            )}
            {!loading && planos.length > 0 && (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {planos.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => salvar(p.id)}
                      disabled={salvando}
                      className="w-full text-left px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {p.disciplina} — {p.ano_serie}
                      {p.bimestre ? ` (${p.bimestre})` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setAberto(false)} disabled={salvando} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
