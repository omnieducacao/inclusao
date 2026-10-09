"use client";

/**
 * Estudo de caso guiado (onda 2) — a porta de entrada do PEI, nos quatro passos do
 * Decreto 12.686/2025. Reaproveita os campos que o PEI já tinha (evidências, barreiras,
 * potencialidades, rede de apoio, estratégias) e acrescenta o que faltava: demandas,
 * contexto escolar, participantes, decisão sobre AEE e profissional de apoio, e a conclusão.
 */
import React, { useState } from "react";
import type { PEIData } from "@/lib/pei";
import {
  PASSOS_ESTUDO_CASO,
  PARTICIPANTES,
  passosConcluidos,
  hojeIso,
  type EstudoCaso,
  type SimNaoAvaliar,
} from "@/lib/estudo-caso";
import { PEITabEvidencias } from "./PEITabEvidencias";
import { PEITabMapeamento } from "./PEITabMapeamento";
import { PEITabRede } from "./PEITabRede";
import { PEITabPlano } from "./PEITabPlano";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Info } from "lucide-react";

type Props = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  toggleChecklist: (field: keyof PEIData, value: string) => void;
  hiperfoco: string;
  onIrParaPei: () => void;
};

const larga: React.CSSProperties = { maxWidth: "none" };
const tituloSecao: React.CSSProperties = { margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" };

function Escolha({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string;
  valor: SimNaoAvaliar | undefined;
  onChange: (v: SimNaoAvaliar) => void;
}) {
  const ops: Array<{ id: SimNaoAvaliar; nome: string }> = [
    { id: "sim", nome: "Sim" },
    { id: "nao", nome: "Não" },
    { id: "avaliar", nome: "Ainda avaliando" },
  ];
  return (
    <fieldset className="omni-escolhas">
      <legend>{rotulo}</legend>
      {ops.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={valor === o.id}
          className="omni-chip"
        >
          <Check className="omni-chip__marca" aria-hidden />
          {o.nome}
        </button>
      ))}
    </fieldset>
  );
}

export function PEITabEstudoCaso({ peiData, updateField, toggleChecklist, hiperfoco, onIrParaPei }: Props) {
  const [passo, setPasso] = useState<1 | 2 | 3 | 4>(1);
  const ec = (peiData.estudo_caso || {}) as EstudoCaso;
  const feitos = passosConcluidos(peiData as Record<string, unknown>);
  const todos = feitos[1] && feitos[2] && feitos[3] && feitos[4];

  const set = <K extends keyof EstudoCaso>(k: K, v: EstudoCaso[K]) =>
    updateField("estudo_caso", { ...ec, [k]: v } as PEIData["estudo_caso"]);

  const participantes = ec.participantes || [];
  const alternarParticipante = (p: string) =>
    set("participantes", participantes.includes(p) ? participantes.filter((x) => x !== p) : [...participantes, p]);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h3 style={tituloSecao}>Estudo de caso</h3>
        <p className="omni-apoio" style={{ margin: "4px 0 0", maxWidth: "65ch" }}>
          É a etapa que vem antes do PEI: a equipe conversa sobre o estudante e decide os apoios. O PEI sai das conclusões
          daqui. Se o estudante tem laudo, ele entra aqui e ajuda a equipe a entender o caso; só não pode ser condição para o apoio.
        </p>
      </div>

      {/* Quando e quem */}
      <section className="omni-cartao omni-cartao--plano grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)]" style={{ gap: 16 }} aria-label="Quando e quem">
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Data da conversa</span>
          <input id="ec-data" type="date" value={ec.data || ""} onChange={(e) => set("data", e.target.value)} className="omni-entrada" />
        </label>
        <fieldset className="omni-escolhas">
          <legend>Quem participou</legend>
          {PARTICIPANTES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => alternarParticipante(p)}
              aria-pressed={participantes.includes(p)}
              className="omni-chip"
            >
              <Check className="omni-chip__marca" aria-hidden />
              {p}
            </button>
          ))}
        </fieldset>
      </section>

      {/* Passos */}
      <ol className="omni-passos" aria-label="Passos do estudo de caso">
        {PASSOS_ESTUDO_CASO.map((p) => (
          <li key={p.id} style={{ display: "flex" }}>
            <button
              type="button"
              onClick={() => setPasso(p.id)}
              aria-current={passo === p.id ? "step" : undefined}
              className={`omni-passo ${feitos[p.id] ? "omni-passo--feito" : ""} ${passo === p.id ? "omni-passo--atual" : ""}`}
              style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit" }}
            >
              <span className="omni-passo__num" aria-hidden>
                {feitos[p.id] ? <Check size={14} /> : p.id}
              </span>
              <span style={{ display: "grid", minWidth: 0 }}>
                <span className="omni-passo__titulo">{p.titulo}</span>
                <span className="omni-passo__estado">
                  Passo {p.id}
                  {feitos[p.id] ? " · feito" : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="omni-aviso omni-aviso--info">
        <Info className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__texto">{PASSOS_ESTUDO_CASO[passo - 1].pergunta}</div>
        </div>
      </div>

      {passo === 1 && (
        <div style={{ display: "grid", gap: 24 }}>
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Demandas observadas</span>
            <textarea
              id="ec-demandas"
              rows={4}
              value={ec.demandas || ""}
              onChange={(e) => set("demandas", e.target.value)}
              placeholder="Ex.: não consegue concluir atividades escritas sem mediação; evita trabalhos em grupo; perde o foco depois de 10 minutos."
              className="omni-entrada"
            />
          </label>
          <PEITabEvidencias peiData={peiData} updateField={updateField} toggleChecklist={toggleChecklist} />
          <PEITabMapeamento peiData={peiData} updateField={updateField} hiperfoco={hiperfoco} secao="barreiras" />
        </div>
      )}

      {passo === 2 && (
        <div style={{ display: "grid", gap: 24 }}>
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Contexto escolar</span>
            <textarea
              id="ec-contexto"
              rows={4}
              value={ec.contexto_escolar || ""}
              onChange={(e) => set("contexto_escolar", e.target.value)}
              placeholder="Turma, rotina, relação com colegas e professores, o que já foi tentado e como funcionou."
              className="omni-entrada"
            />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            <label className="omni-campo" style={larga}>
              <span className="omni-campo__rotulo">Histórico</span>
              <textarea
                id="ec-historico"
                rows={4}
                value={(peiData.historico as string) || ""}
                onChange={(e) => updateField("historico", e.target.value)}
                placeholder="Trajetória escolar, mudanças, acompanhamentos anteriores."
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo" style={larga}>
              <span className="omni-campo__rotulo">Contexto familiar</span>
              <textarea
                id="ec-familia"
                rows={4}
                value={(peiData.familia as string) || ""}
                onChange={(e) => updateField("familia", e.target.value)}
                placeholder="Com quem mora, como a família acompanha a vida escolar."
                className="omni-entrada"
              />
            </label>
          </div>
          <PEITabRede peiData={peiData} updateField={updateField} />
        </div>
      )}

      {passo === 3 && (
        <div style={{ display: "grid", gap: 24 }}>
          <PEITabMapeamento peiData={peiData} updateField={updateField} hiperfoco={hiperfoco} secao="potencias" />
          <section className="omni-cartao" style={{ display: "grid", gap: 16, borderColor: "var(--acao)" }} aria-labelledby="ec-apoios-titulo">
            <h4 id="ec-apoios-titulo" className="omni-cartao__titulo" style={{ margin: 0 }}>Apoios definidos no estudo de caso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
              <Escolha
                rotulo="Precisa de Atendimento Educacional Especializado (AEE)?"
                valor={ec.necessita_aee}
                onChange={(v) => set("necessita_aee", v)}
              />
              <Escolha
                rotulo="Precisa de profissional de apoio escolar?"
                valor={ec.necessita_profissional_apoio}
                onChange={(v) => set("necessita_profissional_apoio", v)}
              />
            </div>
            <label className="omni-campo" style={larga}>
              <span className="omni-campo__rotulo">Por quê?</span>
              <textarea
                id="ec-just"
                rows={3}
                value={ec.justificativa_apoio || ""}
                onChange={(e) => set("justificativa_apoio", e.target.value)}
                placeholder="O que o estudo de caso mostra sobre a necessidade (ou não) desses apoios."
                className="omni-entrada"
                aria-describedby="ec-just-ajuda"
              />
              <span id="ec-just-ajuda" className="omni-campo__ajuda">
                Pelo Decreto 12.773/2025, é aqui que isso se decide, não no laudo.
              </span>
            </label>
          </section>
        </div>
      )}

      {passo === 4 && (
        <div style={{ display: "grid", gap: 24 }}>
          <PEITabPlano peiData={peiData} updateField={updateField} />
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Recursos</span>
            <textarea
              id="ec-recursos"
              rows={3}
              value={ec.recursos || ""}
              onChange={(e) => set("recursos", e.target.value)}
              placeholder="Materiais, tecnologia assistiva, espaços e pessoas que a escola vai mobilizar."
              className="omni-entrada"
            />
          </label>
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Conclusão da equipe</span>
            <textarea
              id="ec-conclusao"
              rows={4}
              value={ec.conclusao || ""}
              onChange={(e) => set("conclusao", e.target.value)}
              placeholder="Em poucas linhas: o que a equipe entendeu e o que o PEI precisa garantir."
              className="omni-entrada"
            />
          </label>
          <div className={`omni-aviso ${ec.concluido_em ? "omni-aviso--sucesso" : todos ? "omni-aviso--info" : "omni-aviso--atencao"}`} role="status">
            {ec.concluido_em ? <CheckCircle2 className="omni-aviso__icone" aria-hidden /> : <Info className="omni-aviso__icone" aria-hidden />}
            <div>
              <div className="omni-aviso__texto">
                {ec.concluido_em
                  ? `Estudo de caso concluído em ${new Date(`${ec.concluido_em}T12:00:00`).toLocaleDateString("pt-BR")}.`
                  : todos
                    ? "Os quatro passos têm o mínimo preenchido."
                    : "Complete os quatro passos para concluir."}
              </div>
              <div className="omni-aviso__acoes">
                <button
                  type="button"
                  disabled={!todos}
                  onClick={() => set("concluido_em", ec.concluido_em ? null : hojeIso())}
                  className={`omni-btn omni-btn--pequeno ${ec.concluido_em ? "omni-btn--secundario" : "omni-btn--primario"}`}
                >
                  {ec.concluido_em ? "Reabrir estudo de caso" : "Concluir estudo de caso"}
                </button>
                {ec.concluido_em && (
                  <button type="button" onClick={onIrParaPei} className="omni-btn omni-btn--primario omni-btn--pequeno">
                    Gerar o PEI a partir dele
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={passo === 1}
          onClick={() => setPasso((p) => (p > 1 ? ((p - 1) as 1 | 2 | 3 | 4) : p))}
          className="omni-btn omni-btn--secundario"
        >
          <ChevronLeft aria-hidden size={18} /> Passo anterior
        </button>
        <button
          type="button"
          disabled={passo === 4}
          onClick={() => setPasso((p) => (p < 4 ? ((p + 1) as 1 | 2 | 3 | 4) : p))}
          className="omni-btn omni-btn--secundario"
        >
          Próximo passo <ChevronRight aria-hidden size={18} />
        </button>
      </div>
      <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>O que você preenche aqui é salvo sozinho, junto com o PEI.</p>
    </div>
  );
}
