"use client";

import { useState, useCallback } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type Plano = { id: string; disciplina: string; ano_serie: string; bimestre?: string };

/**
 * Botão "Salvar no Plano" — persiste conteúdo do Hub em planos_ensino (4.4.2).
 * Exibe modal para escolher plano e chama POST /api/hub/salvar-no-plano.
 */
export function SalvarNoPlanoButton({
  conteudo,
  tipo,
  className = "omni-btn omni-btn--secundario omni-btn--pequeno",
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
  const focusTrapRef = useFocusTrap<HTMLDivElement>(aberto, { onEscape: () => !salvando && setAberto(false) });

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
        Salvar no plano de ensino
      </button>
      {aberto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: 16, background: "rgb(16 26 46 / .45)" }} onClick={() => !salvando && setAberto(false)}>
          <div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="salvar-plano-title"
           
            style={{ width: "min(460px, 100%)", display: "grid", gap: 14, padding: 24, borderRadius: "var(--o-radius-lg)", background: "var(--superficie)", boxShadow: "var(--sombra-2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="salvar-plano-title" style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>Salvar no plano de ensino</h3>
            {loading && <p className="omni-apoio" role="status" style={{ margin: 0 }}>Carregando os planos…</p>}
            {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}
            {sucesso && <div className="omni-aviso omni-aviso--sucesso" role="status"><div><div className="omni-aviso__texto">Salvo no plano.</div></div></div>}
            {!loading && planos.length === 0 && !erro && (
              <p className="omni-apoio" style={{ margin: 0 }}>Nenhum plano de ensino ainda. Crie um em Plano de ensino e volte aqui.</p>
            )}
            {!loading && planos.length > 0 && (
              <>
                <p className="omni-apoio" style={{ margin: 0 }}>Escolha o plano:</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                  {planos.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => salvar(p.id)}
                        disabled={salvando}
                        className="omni-btn omni-btn--secundario"
                        style={{ width: "100%", justifyContent: "flex-start", whiteSpace: "normal", textAlign: "left" }}
                      >
                        {p.disciplina} · {p.ano_serie}{p.bimestre ? ` · ${p.bimestre}` : ""}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setAberto(false)} disabled={salvando} className="omni-btn omni-btn--discreto">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
