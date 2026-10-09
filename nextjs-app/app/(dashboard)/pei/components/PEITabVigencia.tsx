"use client";

/**
 * Vigência e revisões do PEI (onda 2).
 * - "Tornar vigente" fecha o PEI: nova versão, data de início e data da próxima revisão.
 * - Os professores do estudante leem e dão ciência daquela versão (lista abaixo).
 * - Cada revisão é um registro curto: o que avançou, o que muda e a decisão.
 */
import React, { useEffect, useState } from "react";
import type { PEIData } from "@/lib/pei";
import { STATUS_META, PARECER_GERAL, PROXIMOS_PASSOS } from "@/lib/pei";
import {
  PERIODICIDADES,
  DECISOES_REVISAO,
  estudoCasoCompleto,
  hojeIso,
  somarMeses,
  revisaoVencida,
  type Periodicidade,
  type Revisao,
  type Vigencia,
  type EstudoCaso,
} from "@/lib/estudo-caso";
import { AlertTriangle, CheckCircle2, Circle, Clock, FileCheck2, History, Target, Users } from "lucide-react";

type Props = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  currentStudentId: string | null;
  usuarioNome?: string;
  onSalvar: () => void | Promise<void>;
  saving: boolean;
  /** Onda 7: o passo 3 mostra vigência e ciência; o passo 4, as revisões */
  parte?: "vigencia" | "revisao";
};

type Ciencias = {
  versao: number;
  ciencias: Array<{ member_id: string; nome: string; created_at: string }>;
  pendentes: Array<{ member_id: string; nome: string }>;
};

// Onda 18: no design system (omni-*). Títulos e ícones de seção com o mesmo estilo.
const tituloSecao: React.CSSProperties = { margin: 0, display: "flex", alignItems: "center", gap: 8, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" };
const iconeSecao: React.CSSProperties = { width: 18, height: 18, color: "var(--acao)", flex: "none" };
const largo: React.CSSProperties = { maxWidth: "none" };
const dataBR = (iso?: string) => (iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : "—");

export function PEITabVigencia({ peiData, updateField, currentStudentId, usuarioNome, onSalvar, saving, parte }: Props) {
  const mostraVigencia = parte !== "revisao";
  const mostraRevisao = parte !== "vigencia";
  const vig: Vigencia = (peiData.vigencia as Vigencia) || { status: "rascunho", versao: 0 };
  const revisoes = (peiData.revisoes as Revisao[]) || [];
  const ec = (peiData.estudo_caso || {}) as EstudoCaso;
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>(vig.periodicidade || "semestral");
  const [salvarDepois, setSalvarDepois] = useState(false);
  const [ciencias, setCiencias] = useState<Ciencias | null>(null);
  const [nova, setNova] = useState<Omit<Revisao, "data">>({ decisao: "manter", avancos: "", ajustes: "" });

  // Salva depois que o estado do PEI já tem a mudança (o salvar usa o PEI atual)
  useEffect(() => {
    if (!salvarDepois) return;
    setSalvarDepois(false);
    void onSalvar();
  }, [salvarDepois, onSalvar]);

  const [cienciasErro, setCienciasErro] = useState(false);
  useEffect(() => {
    if (!currentStudentId || vig.status === "rascunho") return;
    fetch(`/api/pei/ciencia?studentId=${encodeURIComponent(currentStudentId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { setCienciasErro(false); setCiencias(d); })
      .catch(() => setCienciasErro(true)); // onda 5: antes ficava em "Carregando…" para sempre
  }, [currentStudentId, vig.status, vig.versao]);

  const temPei = Boolean(String(peiData.ia_sugestao || "").trim());
  const ecOk = Boolean(ec.concluido_em) || estudoCasoCompleto(peiData as Record<string, unknown>);
  const podeFechar = Boolean(currentStudentId) && temPei && ecOk;
  const meses = PERIODICIDADES.find((p) => p.id === periodicidade)?.meses ?? 6;
  const vencida = revisaoVencida(vig);

  function tornarVigente() {
    const hoje = hojeIso();
    updateField("vigencia", {
      status: "vigente",
      versao: (vig.versao || 0) + 1,
      vigente_desde: hoje,
      proxima_revisao: somarMeses(hoje, meses),
      periodicidade,
      fechado_por: usuarioNome,
    });
    setSalvarDepois(true);
  }

  function registrarRevisao() {
    const hoje = hojeIso();
    const registro: Revisao = { ...nova, data: hoje, autor: usuarioNome };
    updateField("revisoes", [...revisoes, registro]);
    if (nova.decisao === "manter") {
      updateField("vigencia", { ...vig, proxima_revisao: somarMeses(hoje, meses), periodicidade });
    } else {
      updateField("vigencia", { ...vig, status: "em_revisao" });
      if (nova.decisao === "novo_estudo") updateField("estudo_caso", { ...ec, concluido_em: null });
    }
    setNova({ decisao: "manter", avancos: "", ajustes: "" });
    setSalvarDepois(true);
  }

  const passos: Array<{ ok: boolean; texto: string }> = [
    { ok: ecOk, texto: "Estudo de caso com os quatro passos" },
    { ok: temPei, texto: "Texto do PEI gerado e revisado (etapa 2 · Texto do PEI)" },
    { ok: Boolean(currentStudentId), texto: "Estudante cadastrado" },
  ];
  const tomSituacao = vig.status === "vigente" ? (vencida ? "omni-aviso--atencao" : "omni-aviso--sucesso") : "omni-aviso--info";
  const IconeSituacao = vig.status === "vigente" ? (vencida ? AlertTriangle : CheckCircle2) : Clock;
  const passosSelecionados = peiData.proximos_passos_select || [];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {!parte && (
        <div>
          <h3 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Vigência e revisões</h3>
          <p className="omni-apoio" style={{ margin: "4px 0 0", maxWidth: "65ch" }}>
            Quando o PEI fica pronto, ele passa a valer: os professores do estudante leem e dão ciência, e a escola revisa no
            prazo combinado. A Portaria MEC 421/2026 pede ao menos uma revisão por ano.
          </p>
        </div>
      )}

      {/* Situação */}
      <div className={`omni-aviso ${tomSituacao}`} role="status" style={{ maxWidth: "none" }}>
        <IconeSituacao className="omni-aviso__icone" aria-hidden style={{ width: 22, height: 22 }} />
        <div>
          <div className="omni-aviso__titulo">
            {vig.status === "vigente" && `PEI vigente · versão ${vig.versao}`}
            {vig.status === "em_revisao" && `Em revisão · última versão vigente: ${vig.versao}`}
            {vig.status === "rascunho" && "Rascunho · o PEI ainda não está valendo"}
          </div>
          {vig.status !== "rascunho" && (
            <div className="omni-aviso__texto">
              Desde {dataBR(vig.vigente_desde)} · próxima revisão {dataBR(vig.proxima_revisao)}
              {vencida && <strong> · revisão atrasada</strong>}
            </div>
          )}
        </div>
      </div>

      {/* Fechar / publicar versão */}
      {mostraVigencia && vig.status !== "vigente" && (
        <section className="omni-cartao" style={{ display: "grid", gap: 14 }} aria-labelledby="vig-fechar">
          <h4 id="vig-fechar" style={tituloSecao}>
            <FileCheck2 aria-hidden style={iconeSecao} /> Tornar o PEI vigente
          </h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {passos.map((p) => (
              <li key={p.texto} style={{ display: "flex", alignItems: "center", gap: 8, font: "400 15px/22px var(--font-sans)", color: p.ok ? "var(--tinta)" : "var(--tinta-3)" }}>
                {p.ok
                  ? <CheckCircle2 aria-hidden style={{ width: 18, height: 18, color: "var(--sucesso)", flex: "none" }} />
                  : <Circle aria-hidden style={{ width: 18, height: 18, color: "var(--tinta-3)", flex: "none" }} />}
                <span>{p.texto}<span className="omni-so-leitor">{p.ok ? " (feito)" : " (falta)"}</span></span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <label className="omni-campo" style={largo}>
              <span className="omni-campo__rotulo">Revisar</span>
              <select value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value as Periodicidade)} className="omni-entrada" style={largo}>
                {PERIODICIDADES.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </label>
            <button type="button" disabled={!podeFechar || saving} onClick={tornarVigente} className="omni-btn omni-btn--primario">
              Tornar vigente (versão {(vig.versao || 0) + 1})
            </button>
          </div>
        </section>
      )}

      {/* Ciência dos professores */}
      {mostraVigencia && vig.status !== "rascunho" && (
        <section className="omni-cartao" style={{ display: "grid", gap: 12 }} aria-labelledby="vig-ciencia">
          <h4 id="vig-ciencia" style={tituloSecao}>
            <Users aria-hidden style={iconeSecao} /> Ciência dos professores · versão {vig.versao}
          </h4>
          {cienciasErro ? (
            <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">Não conseguimos carregar quem já leu. Recarregue a página para tentar de novo.</div></div></div>
          ) : !ciencias ? (
            <p className="omni-apoio" role="status" style={{ margin: 0 }}>Carregando…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ display: "grid", gap: 6, alignContent: "start" }}>
                <span className="omni-estado omni-estado--sucesso" style={{ justifySelf: "start" }}>Deram ciência ({ciencias.ciencias.length})</span>
                {ciencias.ciencias.length === 0 ? (
                  <p className="omni-apoio" style={{ margin: 0 }}>Ninguém ainda.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4, color: "var(--tinta)" }}>
                    {ciencias.ciencias.map((c) => (
                      <li key={c.member_id}>{c.nome} <span style={{ color: "var(--tinta-3)" }}>· {dataBR(c.created_at)}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ display: "grid", gap: 6, alignContent: "start" }}>
                <span className="omni-estado omni-estado--atencao" style={{ justifySelf: "start" }}>Ainda não ({ciencias.pendentes.length})</span>
                {ciencias.pendentes.length === 0 ? (
                  <p className="omni-apoio" style={{ margin: 0 }}>Todos os professores do estudante já leram.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4, color: "var(--tinta)" }}>
                    {ciencias.pendentes.map((c) => (
                      <li key={c.member_id}>{c.nome}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <p className="omni-campo__ajuda" style={{ margin: 0 }}>
            Os professores veem o PEI em “PEI do professor” e clicam em “Li e estou ciente”. A lista considera quem tem o
            estudante no seu vínculo (turma ou um a um).
          </p>
        </section>
      )}

      {/* Revisões */}
      {mostraRevisao && vig.status !== "vigente" && parte === "revisao" && (
        <p className="omni-apoio" style={{ margin: 0 }}>A revisão começa quando o PEI estiver vigente (passo 3).</p>
      )}
      {mostraRevisao && vig.status === "vigente" && (
        <section className="omni-cartao" style={{ display: "grid", gap: 14 }} aria-labelledby="rev-registrar">
          <h4 id="rev-registrar" style={tituloSecao}>
            <History aria-hidden style={iconeSecao} /> Registrar revisão
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="omni-campo" style={largo}>
              <span className="omni-campo__rotulo">O que avançou</span>
              <textarea rows={3} value={nova.avancos} onChange={(e) => setNova({ ...nova, avancos: e.target.value })} className="omni-entrada" style={largo} />
            </label>
            <label className="omni-campo" style={largo}>
              <span className="omni-campo__rotulo">O que precisa mudar</span>
              <textarea rows={3} value={nova.ajustes} onChange={(e) => setNova({ ...nova, ajustes: e.target.value })} className="omni-entrada" style={largo} />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <label className="omni-campo" style={largo}>
              <span className="omni-campo__rotulo">Decisão</span>
              <select value={nova.decisao} onChange={(e) => setNova({ ...nova, decisao: e.target.value as Revisao["decisao"] })} className="omni-entrada" style={largo}>
                {DECISOES_REVISAO.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </label>
            <button type="button" disabled={saving || !(nova.avancos || nova.ajustes)} onClick={registrarRevisao} className="omni-btn omni-btn--primario">
              Registrar revisão
            </button>
          </div>
          <p className="omni-campo__ajuda" style={{ margin: 0 }}>
            “Manter” agenda a próxima revisão. “Ajustar” ou “Refazer o estudo de caso” deixam o PEI em revisão até ser
            tornado vigente de novo, numa nova versão.
          </p>
        </section>
      )}

      {mostraRevisao && revisoes.length > 0 && (
        <section style={{ display: "grid", gap: 10 }} aria-labelledby="rev-historico">
          <h4 id="rev-historico" style={tituloSecao}>Histórico de revisões</h4>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {[...revisoes].reverse().map((r, i) => (
              <li key={`${r.data}-${i}`} className="omni-cartao omni-cartao--plano" style={{ padding: "12px 14px", display: "grid", gap: 4 }}>
                <p style={{ margin: 0, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                  {dataBR(r.data)} · {DECISOES_REVISAO.find((d) => d.id === r.decisao)?.nome}
                  {r.autor && <span style={{ fontWeight: 400, color: "var(--tinta-3)" }}> · {r.autor}</span>}
                </p>
                {r.avancos && <p style={{ margin: 0, color: "var(--tinta-2)" }}><strong>Avançou:</strong> {r.avancos}</p>}
                {r.ajustes && <p style={{ margin: 0, color: "var(--tinta-2)" }}><strong>Muda:</strong> {r.ajustes}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Onda 18: "Situação das metas" (antes uma seção à parte) — mesmos campos de antes no PEI */}
      {mostraRevisao && (
        <section className="omni-cartao" style={{ display: "grid", gap: 14 }} aria-labelledby="rev-metas">
          <div>
            <h4 id="rev-metas" style={tituloSecao}>
              <Target aria-hidden style={iconeSecao} /> Situação das metas
            </h4>
            <p className="omni-apoio" style={{ margin: "4px 0 0", maxWidth: "65ch" }}>
              Como estão as metas do PEI e o que fazer em seguida. Fica salvo com o PEI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="omni-campo" style={largo}>
              <span className="omni-campo__rotulo">Data do acompanhamento</span>
              <input type="date" value={String(peiData.monitoramento_data || "").slice(0, 10)} onChange={(e) => updateField("monitoramento_data", e.target.value)} className="omni-entrada" style={largo} />
            </label>
            <label className="omni-campo" style={largo}>
              <span className="omni-campo__rotulo">Situação da meta</span>
              <select value={peiData.status_meta || ""} onChange={(e) => updateField("status_meta", e.target.value)} className="omni-entrada" style={largo}>
                <option value="">Escolha</option>
                {STATUS_META.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="omni-campo" style={largo}>
              <span className="omni-campo__rotulo">Parecer geral</span>
              <select value={peiData.parecer_geral || ""} onChange={(e) => updateField("parecer_geral", e.target.value)} className="omni-entrada" style={largo}>
                <option value="">Escolha</option>
                {PARECER_GERAL.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: 8 }}>
            <legend className="omni-campo__rotulo" style={{ padding: 0, marginBottom: 8 }}>Próximos passos</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PROXIMOS_PASSOS.map((p) => (
                <label key={p} className="omni-chip">
                  <input
                    type="checkbox"
                    checked={passosSelecionados.includes(p)}
                    onChange={(e) => {
                      const novas = e.target.checked ? [...passosSelecionados, p] : passosSelecionados.filter((item) => item !== p);
                      updateField("proximos_passos_select", novas);
                    }}
                  />
                  <CheckCircle2 className="omni-chip__marca" aria-hidden /> {p}
                </label>
              ))}
            </div>
          </fieldset>
        </section>
      )}
    </div>
  );
}
