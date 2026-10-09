"use client";
import { useConfirmar } from "@/components/Confirmar";

import React from "react";
import type { PEIData } from "@/lib/pei";
import {
  LISTA_PROFISSIONAIS,
  LISTA_TECNOLOGIAS_ASSISTIVAS,
} from "@/lib/pei";
import { Users, Info, Puzzle, FileText, CheckCircle2, AlertCircle, Check, X, Trash2 } from "lucide-react";

type TabRedeProps = {
  peiData: PEIData;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
};

const tituloAba: React.CSSProperties = { margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" };
const tituloSecao: React.CSSProperties = { margin: 0, display: "flex", alignItems: "center", gap: 8, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" };
const iconeSecao: React.CSSProperties = { color: "var(--tinta-2)", flex: "none" };

export function PEITabRede(props: TabRedeProps) {
  const { peiData, updateField } = props;
  const { confirmar, dialogo } = useConfirmar();
  const rede = Array.isArray(peiData.rede_apoio) ? peiData.rede_apoio : [];

  const tirarDaRede = async (p: string) => {
    if (!(await confirmar({ titulo: `Tirar ${p} da rede de apoio?`, texto: "As orientações escritas para esse profissional também serão apagadas.", acao: "Tirar da rede", cancelar: "Manter", perigo: true }))) return;
    const atual = peiData.rede_apoio || [];
    updateField("rede_apoio", atual.filter((item) => item !== p));
    // Remove orientações desse profissional também
    const orientacoes = { ...(peiData.orientacoes_por_profissional || {}) };
    delete orientacoes[p];
    updateField("orientacoes_por_profissional", orientacoes);
  };

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 896 }}>
      {dialogo}
      {/* Título da aba */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Users aria-hidden size={20} style={{ color: "var(--acao)" }} />
          <h3 style={tituloAba}>Rede de apoio</h3>
        </div>
        <p className="omni-apoio" style={{ margin: "4px 0 0" }}>
          Escolha os profissionais que acompanham o estudante e escreva as orientações de cada um.
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label className="omni-campo" style={{ maxWidth: "none" }}>
          <span className="omni-campo__rotulo">Profissionais</span>
          <select
            value={""}
            onChange={(e) => {
              if (e.target.value) {
                const atual = peiData.rede_apoio || [];
                if (!atual.includes(e.target.value)) {
                  updateField("rede_apoio", [...atual, e.target.value]);
                }
                e.target.value = "";
              }
            }}
            className="omni-entrada"
            aria-describedby="rede-profissionais-ajuda"
          >
            <option value="">Escolha para adicionar…</option>
            {LISTA_PROFISSIONAIS.filter((p) => !(peiData.rede_apoio || []).includes(p)).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <span id="rede-profissionais-ajuda" className="omni-campo__ajuda">Cada profissional escolhido ganha um campo de orientações logo abaixo.</span>
        </label>
        {rede.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Profissionais na rede de apoio">
            {rede.map((p) => (
              <li key={p} className="omni-estado omni-estado--info" style={{ paddingRight: 4 }}>
                {p}
                <button
                  type="button"
                  onClick={() => tirarDaRede(p)}
                  className="omni-btn omni-btn--discreto omni-btn--icone"
                  style={{ minHeight: 24, minWidth: 24, padding: 2 }}
                  aria-label={`Tirar ${p} da rede`}
                >
                  <X aria-hidden size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Acompanhante/Cuidador */}
      <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 14 }} aria-labelledby="rede-acompanhante-titulo">
        <div>
          <h4 id="rede-acompanhante-titulo" style={tituloSecao}>
            <Users aria-hidden size={18} style={iconeSecao} />
            Acompanhante de cuidados
          </h4>
          <p className="omni-apoio" style={{ margin: "4px 0 0" }}>Quando há acompanhante ou cuidador em sala (mediador, cuidador etc.).</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
          <label className="omni-campo" style={{ maxWidth: "none" }}>
            <span className="omni-campo__rotulo">Nome</span>
            <input
              type="text"
              value={peiData.acompanhante_nome || ""}
              onChange={(e) => updateField("acompanhante_nome", e.target.value)}
              className="omni-entrada"
              placeholder="Ex.: Maria Silva"
            />
          </label>
          <label className="omni-campo" style={{ maxWidth: "none" }}>
            <span className="omni-campo__rotulo">Carga horária</span>
            <input
              type="text"
              value={peiData.acompanhante_carga_horaria || ""}
              onChange={(e) => updateField("acompanhante_carga_horaria", e.target.value)}
              className="omni-entrada"
              placeholder="Ex.: 4h por dia, 2 vezes por semana"
            />
          </label>
        </div>
        <label className="omni-campo" style={{ maxWidth: "none" }}>
          <span className="omni-campo__rotulo">Orientações para o acompanhante</span>
          <textarea
            value={peiData.orientacoes_acompanhante || ""}
            onChange={(e) => updateField("orientacoes_acompanhante", e.target.value)}
            rows={3}
            className="omni-entrada"
            placeholder="Como mediar, sinais de alerta, o que fazer em cada situação"
          />
        </label>
      </section>

      {/* Tecnologias assistivas */}
      <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 14 }} aria-labelledby="rede-ta-titulo">
        <div>
          <h4 id="rede-ta-titulo" style={tituloSecao}>
            <Puzzle aria-hidden size={18} style={iconeSecao} />
            Tecnologias assistivas
          </h4>
          <p className="omni-apoio" style={{ margin: "4px 0 0" }}>Recursos que o estudante usa (comunicação alternativa, leitor de tela etc.).</p>
        </div>
        <div className="omni-escolhas" role="group" aria-labelledby="rede-ta-titulo">
          {LISTA_TECNOLOGIAS_ASSISTIVAS.map((ta) => {
            const lista = peiData.tecnologias_assistivas || [];
            const checked = lista.includes(ta);
            return (
              <label key={ta} className="omni-chip">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const nova = checked ? lista.filter((x) => x !== ta) : [...lista, ta];
                    updateField("tecnologias_assistivas", nova);
                  }}
                />
                <Check className="omni-chip__marca" aria-hidden />
                {ta}
              </label>
            );
          })}
        </div>
      </section>

      {/* Anotações gerais (expander) */}
      <details className="omni-cartao">
        <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
          <FileText aria-hidden size={18} style={iconeSecao} />
          Anotações gerais <span className="omni-campo__opcional">(opcional)</span>
        </summary>
        <label className="omni-campo" style={{ maxWidth: "none", marginTop: 12 }}>
          <span className="omni-so-leitor">Anotações gerais</span>
          <textarea
            value={peiData.orientacoes_especialistas || ""}
            onChange={(e) => updateField("orientacoes_especialistas", e.target.value)}
            rows={5}
            className="omni-entrada"
            placeholder="Observações gerais da equipe (ex.: acordos com a família, encaminhamentos, combinados)."
          />
        </label>
      </details>

      {/* Orientações por profissional */}
      <section style={{ display: "grid", gap: 14 }} aria-labelledby="rede-orientacoes-titulo">
        <h4 id="rede-orientacoes-titulo" style={tituloSecao}>
          <Info aria-hidden size={18} style={iconeSecao} />
          Orientações por profissional
        </h4>
        <div className="omni-aviso omni-aviso--info" role="note">
          <Info className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__texto">O laudo, quando existir, é enviado na aba Estudante. Ele informa o estudo de caso; a lei não permite exigir laudo.</div>
          </div>
        </div>
        {rede.length === 0 ? (
          <div className="omni-vazio">
            <p className="omni-vazio__texto" style={{ margin: 0 }}>Escolha ao menos um profissional para escrever as orientações.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            {rede.map((prof) => (
              <div key={prof} className="omni-cartao" style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <h5 className="omni-cartao__titulo" style={{ margin: 0 }}>{prof}</h5>
                <label className="omni-campo" style={{ maxWidth: "none" }}>
                  <span className="omni-campo__rotulo">Orientações</span>
                  <textarea
                    value={(peiData.orientacoes_por_profissional || {})[prof] || ""}
                    onChange={(e) =>
                      updateField("orientacoes_por_profissional", {
                        ...(peiData.orientacoes_por_profissional || {}),
                        [prof]: e.target.value,
                      })
                    }
                    rows={5}
                    className="omni-entrada"
                    placeholder="Ex.: o que fazer, com que frequência, sinais de alerta, ajustes para a sala de aula…"
                  />
                </label>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!(await confirmar({ titulo: `Apagar as orientações de ${prof}?`, acao: "Apagar orientações", cancelar: "Manter", perigo: true }))) return;
                      updateField("orientacoes_por_profissional", {
                        ...(peiData.orientacoes_por_profissional || {}),
                        [prof]: "",
                      });
                    }}
                    className="omni-btn omni-btn--secundario omni-btn--pequeno"
                  >
                    <Trash2 aria-hidden size={16} /> Apagar orientações
                  </button>
                  <button
                    type="button"
                    onClick={() => tirarDaRede(prof)}
                    className="omni-btn omni-btn--perigo omni-btn--pequeno"
                  >
                    <X aria-hidden size={16} /> Tirar da rede
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* O que falta preencher */}
      {rede.length > 0 && (
        <section style={{ display: "grid", gap: 10 }} aria-labelledby="rede-conferir-titulo">
          <h4 id="rede-conferir-titulo" style={tituloSecao}>
            <CheckCircle2 aria-hidden size={18} style={iconeSecao} />
            O que já está preenchido
          </h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {(peiData.rede_apoio || []).map((p) => {
              const txt = ((peiData.orientacoes_por_profissional || {})[p] || "").trim();
              return (
                <li key={p} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, font: "400 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                  <strong>{p}</strong>
                  {txt ? (
                    <span className="omni-estado omni-estado--sucesso"><CheckCircle2 aria-hidden /> Preenchido</span>
                  ) : (
                    <span className="omni-estado omni-estado--atencao"><AlertCircle aria-hidden /> Vazio</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
