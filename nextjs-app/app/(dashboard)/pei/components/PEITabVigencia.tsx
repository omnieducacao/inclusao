"use client";

/**
 * Vigência e revisões do PEI (onda 2).
 * - "Tornar vigente" fecha o PEI: nova versão, data de início e data da próxima revisão.
 * - Os professores do estudante leem e dão ciência daquela versão (lista abaixo).
 * - Cada revisão é um registro curto: o que avançou, o que muda e a decisão.
 */
import React, { useEffect, useState } from "react";
import type { PEIData } from "@/lib/pei";
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
import { AlertTriangle, CheckCircle2, Clock, FileCheck2, History, Users } from "lucide-react";

type Props = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  currentStudentId: string | null;
  usuarioNome?: string;
  onSalvar: () => void | Promise<void>;
  saving: boolean;
};

type Ciencias = {
  versao: number;
  ciencias: Array<{ member_id: string; nome: string; created_at: string }>;
  pendentes: Array<{ member_id: string; nome: string }>;
};

const campo = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white";
const dataBR = (iso?: string) => (iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : "—");

export function PEITabVigencia({ peiData, updateField, currentStudentId, usuarioNome, onSalvar, saving }: Props) {
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

  useEffect(() => {
    if (!currentStudentId || vig.status === "rascunho") return;
    fetch(`/api/pei/ciencia?studentId=${encodeURIComponent(currentStudentId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCiencias(d))
      .catch(() => {});
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Vigência e revisões</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-[65ch]">
          Quando o PEI fica pronto, ele passa a valer: os professores do estudante leem e dão ciência, e a escola revisa no
          prazo combinado. A Portaria MEC 421/2026 pede ao menos uma revisão por ano.
        </p>
      </div>

      {/* Situação */}
      <div
        className={`p-4 rounded-xl border-2 flex flex-wrap items-center gap-4 ${
          vig.status === "vigente" ? (vencida ? "border-amber-300 bg-amber-50/60" : "border-emerald-200 bg-emerald-50/50") : "border-slate-200 bg-slate-50/60"
        }`}
      >
        {vig.status === "vigente" ? (
          vencida ? <AlertTriangle className="w-6 h-6 text-amber-600" /> : <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        ) : (
          <Clock className="w-6 h-6 text-slate-500" />
        )}
        <div className="min-w-0">
          <p className="font-semibold text-slate-800">
            {vig.status === "vigente" && `PEI vigente · versão ${vig.versao}`}
            {vig.status === "em_revisao" && `Em revisão · última versão vigente: ${vig.versao}`}
            {vig.status === "rascunho" && "Rascunho · o PEI ainda não está valendo"}
          </p>
          {vig.status !== "rascunho" && (
            <p className="text-sm text-slate-600">
              Desde {dataBR(vig.vigente_desde)} · próxima revisão {dataBR(vig.proxima_revisao)}
              {vencida && <strong className="text-amber-700"> · revisão atrasada</strong>}
            </p>
          )}
        </div>
      </div>

      {/* Fechar / publicar versão */}
      {vig.status !== "vigente" && (
        <div className="p-4 rounded-xl border border-slate-200 space-y-4">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-sky-600" /> Tornar o PEI vigente
          </h4>
          <ul className="text-sm space-y-1">
            <li className={ecOk ? "text-emerald-700" : "text-slate-500"}>
              {ecOk ? "✓" : "○"} Estudo de caso com os quatro passos
            </li>
            <li className={temPei ? "text-emerald-700" : "text-slate-500"}>
              {temPei ? "✓" : "○"} Texto do PEI gerado e revisado (aba Consultoria IA)
            </li>
            <li className={currentStudentId ? "text-emerald-700" : "text-slate-500"}>
              {currentStudentId ? "✓" : "○"} Estudante salvo na nuvem
            </li>
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <div>
              <label htmlFor="vig-per" className="block text-sm font-medium text-slate-700 mb-1">Revisar</label>
              <select id="vig-per" value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value as Periodicidade)} className={campo}>
                {PERIODICIDADES.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={!podeFechar || saving}
              onClick={tornarVigente}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white disabled:opacity-40"
            >
              Tornar vigente (versão {(vig.versao || 0) + 1})
            </button>
          </div>
        </div>
      )}

      {/* Ciência dos professores */}
      {vig.status !== "rascunho" && (
        <div className="p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" /> Ciência dos professores · versão {vig.versao}
          </h4>
          {!ciencias ? (
            <p className="text-sm text-slate-500">Carregando…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-emerald-700 mb-1">Deram ciência ({ciencias.ciencias.length})</p>
                {ciencias.ciencias.length === 0 ? (
                  <p className="text-slate-500">Ninguém ainda.</p>
                ) : (
                  <ul className="space-y-1">
                    {ciencias.ciencias.map((c) => (
                      <li key={c.member_id}>{c.nome} <span className="text-slate-500">· {dataBR(c.created_at)}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="font-medium text-amber-700 mb-1">Ainda não ({ciencias.pendentes.length})</p>
                {ciencias.pendentes.length === 0 ? (
                  <p className="text-slate-500">Todos os professores do estudante já leram.</p>
                ) : (
                  <ul className="space-y-1">
                    {ciencias.pendentes.map((c) => (
                      <li key={c.member_id}>{c.nome}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500">
            Os professores veem o PEI em “PEI - Professor” e clicam em “Li e estou ciente”. A lista considera quem tem o
            estudante no seu vínculo (turma ou um a um).
          </p>
        </div>
      )}

      {/* Revisões */}
      {vig.status === "vigente" && (
        <div className="p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" /> Registrar revisão
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="rev-av" className="block text-sm font-medium text-slate-700 mb-1">O que avançou</label>
              <textarea id="rev-av" rows={3} value={nova.avancos} onChange={(e) => setNova({ ...nova, avancos: e.target.value })} className={campo} />
            </div>
            <div>
              <label htmlFor="rev-aj" className="block text-sm font-medium text-slate-700 mb-1">O que precisa mudar</label>
              <textarea id="rev-aj" rows={3} value={nova.ajustes} onChange={(e) => setNova({ ...nova, ajustes: e.target.value })} className={campo} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <div>
              <label htmlFor="rev-dec" className="block text-sm font-medium text-slate-700 mb-1">Decisão</label>
              <select id="rev-dec" value={nova.decisao} onChange={(e) => setNova({ ...nova, decisao: e.target.value as Revisao["decisao"] })} className={campo}>
                {DECISOES_REVISAO.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={saving || !(nova.avancos || nova.ajustes)}
              onClick={registrarRevisao}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-600 text-white disabled:opacity-40"
            >
              Registrar revisão
            </button>
          </div>
          <p className="text-xs text-slate-500">
            “Manter” agenda a próxima revisão. “Ajustar” ou “Refazer o estudo de caso” deixam o PEI em revisão até ser
            tornado vigente de novo, numa nova versão.
          </p>
        </div>
      )}

      {revisoes.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-800">Histórico de revisões</h4>
          <ol className="space-y-2">
            {[...revisoes].reverse().map((r, i) => (
              <li key={`${r.data}-${i}`} className="p-3 rounded-lg border border-slate-200 text-sm">
                <p className="font-medium text-slate-800">
                  {dataBR(r.data)} · {DECISOES_REVISAO.find((d) => d.id === r.decisao)?.nome}
                  {r.autor && <span className="text-slate-500 font-normal"> · {r.autor}</span>}
                </p>
                {r.avancos && <p className="text-slate-600 mt-1"><strong>Avançou:</strong> {r.avancos}</p>}
                {r.ajustes && <p className="text-slate-600 mt-1"><strong>Muda:</strong> {r.ajustes}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
