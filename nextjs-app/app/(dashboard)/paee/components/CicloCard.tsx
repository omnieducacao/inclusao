"use client";
import React from "react";
import type { CicloPAEE } from "@/lib/paee";
import { fmtDataIso, badgeStatus } from "@/lib/paee";
export function CicloCard({
  ciclo,
  onSalvar,
  saving,
  onLimpar,
}: {
  ciclo: CicloPAEE;
  onSalvar?: () => void;
  saving: boolean;
  onLimpar: () => void;
}) {
  const cfg = ciclo.config_ciclo || {};
  const [estado, tom] = badgeStatus(ciclo.status || "rascunho");
  const cron = ciclo.cronograma;
  const resumo: React.CSSProperties = { fontWeight: 700, color: "var(--tinta)", cursor: "pointer" };
  const item: React.CSSProperties = { padding: 10, borderRadius: "var(--o-radius-md)", background: "var(--superficie-2)", border: "1px solid var(--borda)" };
  const sub: React.CSSProperties = { margin: "4px 0 0", fontSize: 13, lineHeight: "18px", color: "var(--tinta-2)" };

  return (
    <div className="omni-cartao" style={{ padding: 0, gap: 0, overflow: "hidden" }}>
      <div style={{ padding: 16, borderBottom: "1px solid var(--borda)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{cfg.foco_principal || "Ciclo do AEE"}</div>
          <div className="omni-apoio">
            {fmtDataIso(cfg.data_inicio)} a {fmtDataIso(cfg.data_fim)}
            {cfg.duracao_semanas && ` · ${cfg.duracao_semanas} semanas`}
            {cfg.frequencia && ` · ${String(cfg.frequencia).replace("_", " ")}`}
          </div>
        </div>
        <span className={`omni-estado omni-estado--${tom}`}>{estado}</span>
      </div>
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <details open>
          <summary style={resumo}>Metas</summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20, listStyle: "disc", display: "grid", gap: 4, fontSize: 14, color: "var(--tinta-2)" }}>
            {(cfg.metas_selecionadas || []).map((m: any) => (
              <li key={m.id}>{m.tipo}: {m.descricao}</li>
            ))}
          </ul>
        </details>
        {cron && (cron.fases?.length > 0 || cron.semanas?.length > 0) && (
          <details>
            <summary style={resumo}>
              {ciclo.tipo === "planejamento_aee" ? "Cronograma por fases" : "Cronograma por semanas"}
            </summary>
            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
              {ciclo.tipo === "planejamento_aee" && cron.fases && cron.fases.length > 0 ? (
                <>
                  <p className="omni-apoio" style={{ margin: 0 }}>Visão geral em fases (documento de referência)</p>
                  {cron.fases.map((f: any, i: number) => (
                    <div key={i} style={item}>
                      <strong style={{ color: "var(--tinta)" }}>{f.nome}</strong>
                      <p style={sub}>{f.objetivo_geral}</p>
                      {f.descricao && <p style={sub}>{f.descricao}</p>}
                    </div>
                  ))}
                </>
              ) : cron.semanas && cron.semanas.length > 0 ? (
                <>
                  <p className="omni-apoio" style={{ margin: 0 }}>Planejamento semana a semana (guia prático)</p>
                  {cron.semanas.slice(0, 6).map((s: any) => (
                    <div key={s.numero} style={item}>
                      <strong style={{ color: "var(--tinta)" }}>Semana {s.numero}: {s.tema}</strong>
                      <p style={sub}>{s.objetivo}</p>
                      {s.atividades && s.atividades.length > 0 && (
                        <ul style={{ ...sub, paddingLeft: 18, listStyle: "disc" }}>
                          {s.atividades.slice(0, 3).map((a: any, idx: number) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {(cron.semanas?.length || 0) > 6 && (
                    <div className="omni-apoio">E mais {(cron.semanas?.length || 0) - 6} semanas</div>
                  )}
                </>
              ) : null}
            </div>
          </details>
        )}
      </div>
      {onSalvar && (
        <div style={{ padding: 16, borderTop: "1px solid var(--borda)", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" className="omni-btn omni-btn--primario" onClick={onSalvar} disabled={saving} aria-busy={saving}>
            {saving ? "Salvando…" : "Salvar ciclo"}
          </button>
          <button type="button" className="omni-btn omni-btn--discreto" onClick={onLimpar}>
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}
