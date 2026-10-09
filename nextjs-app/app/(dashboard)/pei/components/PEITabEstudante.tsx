"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { PEIData } from "@/lib/pei";
import { SERIES, LISTA_FAMILIA, detectarNivelEnsino } from "@/lib/pei";
import { HelpTooltip } from "@/components/HelpTooltip";
import { DiagnosticConditionalFields } from "@/components/PEIDiagnosticFields";
import { LaudoPdfSection } from "./PEILaudoSection";
import { User, FileText, CheckCircle2, Pill, Plus, X } from "lucide-react";

type TabEstudanteProps = {
  peiData: PEIData;
  setPeiData: React.Dispatch<React.SetStateAction<PEIData>>;
  updateField: <K extends keyof PEIData>(key: K, value: PEIData[K]) => void;
  addMedicamento: (...args: unknown[]) => void;
  removeMedicamento: (i: number) => void;
  serie: string;
  schoolClasses: Array<{ id: string; class_group: string; grade_id: string; grades?: { name?: string; label?: string } }>;
  schoolGrades: Array<{ id: string; name: string; label?: string }>;
};

const larga: React.CSSProperties = { maxWidth: "none" };
const tituloSecao: React.CSSProperties = { margin: 0, display: "flex", alignItems: "center", gap: 8, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" };
const iconeSecao: React.CSSProperties = { color: "var(--tinta-2)", flex: "none" };

// Segmento da série escolhida (sem cor própria: selo neutro do design system)
const SEGMENTOS: Record<string, { nome: string; desc: string }> = {
  EI: { nome: "EI — Educação Infantil", desc: "Foco: campos de experiência da BNCC (Base Nacional Comum Curricular) e rotina que dá segurança." },
  EFI: { nome: "EFAI — Ensino Fundamental Anos Iniciais", desc: "Foco: alfabetização, números e habilidades básicas." },
  EFII: { nome: "EFAF — Ensino Fundamental Anos Finais", desc: "Foco: autonomia, organização, planejamento e aprofundamento dos conteúdos." },
  EM: { nome: "EM — Ensino Médio / EJA (Educação de Jovens e Adultos)", desc: "Foco: projeto de vida, áreas do conhecimento e jeitos de estudar." },
};

// MedicamentosForm inlined here since it's only used in this tab
function MedicamentosForm({
  medicamentos,
  onAdd,
  onRemove,
}: {
  medicamentos: Array<Record<string, unknown>>;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {medicamentos.map((med, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" style={{ gap: 8, alignItems: "end" }}>
          <input type="text" aria-label={`Medicação ${i + 1}: nome`} placeholder="Nome" value={String(med.nome || "")} readOnly className="omni-entrada" style={{ background: "var(--superficie-2)" }} />
          <input type="text" aria-label={`Medicação ${i + 1}: como toma`} placeholder="Como toma" value={String(med.posologia || "")} readOnly className="omni-entrada" style={{ background: "var(--superficie-2)" }} />
          <button type="button" onClick={() => onRemove(i)} className="omni-btn omni-btn--discreto omni-btn--pequeno" aria-label={`Tirar a medicação ${String(med.nome || i + 1)}`}>
            <X aria-hidden size={16} /> Tirar
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="omni-btn omni-btn--secundario omni-btn--pequeno" style={{ justifySelf: "start" }}>
        <Plus aria-hidden size={16} /> Adicionar medicação
      </button>
    </div>
  );
}

export function PEITabEstudante(props: TabEstudanteProps) {
  const { peiData, setPeiData, updateField, addMedicamento, removeMedicamento, serie, schoolClasses, schoolGrades } = props;

  // Compute available turmas based on selected serie
  const availableTurmas = useMemo(() => {
    if (!peiData.serie) return [] as typeof schoolClasses;
    const gradeMatch = schoolGrades.find((g) => g.name === peiData.serie || g.label === peiData.serie);
    if (!gradeMatch) return [] as typeof schoolClasses;
    return schoolClasses.filter((c) => c.grade_id === gradeMatch.id);
  }, [peiData.serie, schoolClasses, schoolGrades]);

  const segmento = peiData.serie ? SEGMENTOS[detectarNivelEnsino(peiData.serie)] : undefined;
  const familia = Array.isArray(peiData.composicao_familiar_tags) ? peiData.composicao_familiar_tags : [];

  return (
    <div style={{ display: "grid", gap: 28, width: "100%" }}>
      {/* Título da aba */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <User aria-hidden size={20} style={{ color: "var(--acao)" }} />
        <h3 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Sobre o estudante</h3>
      </div>

      {/* Identificação - ORDEM EXATA: Nome, Nascimento, Série/Ano, Turma, Matrícula/RA */}
      <section style={{ display: "grid", gap: 14 }} aria-labelledby="est-ident-titulo">
        <h4 id="est-ident-titulo" style={tituloSecao}>Identificação</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6" style={{ gap: 16 }}>
          {/* Nome completo - ocupa mais espaço */}
          <label className="omni-campo col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2" style={larga}>
            <span className="omni-campo__rotulo" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Nome completo
              {peiData.nome && <CheckCircle2 aria-label="preenchido" size={14} style={{ color: "var(--sucesso)" }} />}
            </span>
            <input
              type="text"
              value={peiData.nome || ""}
              onChange={(e) => updateField("nome", e.target.value)}
              className="omni-entrada"
              placeholder="Nome completo do estudante"
              autoComplete="off"
            />
          </label>
          {/* Nascimento */}
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Nascimento</span>
            <input
              type="date"
              value={typeof peiData.nasc === "string" ? peiData.nasc.split("T")[0] : ""}
              onChange={(e) => updateField("nasc", e.target.value || undefined)}
              className="omni-entrada"
            />
          </label>
          {/* Série/Ano */}
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Série / ano</span>
            <select
              value={peiData.serie || ""}
              onChange={(e) => updateField("serie", e.target.value || null)}
              className="omni-entrada"
            >
              <option value="">Escolha…</option>
              {SERIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          {/* Turma */}
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Turma</span>
            {availableTurmas.length > 0 ? (
              <select
                value={peiData.turma || ""}
                onChange={(e) => updateField("turma", e.target.value || undefined)}
                className="omni-entrada"
              >
                <option value="">Escolha…</option>
                {availableTurmas.map((c) => (
                  <option key={c.id} value={c.class_group}>{c.class_group}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={peiData.turma || ""}
                onChange={(e) => updateField("turma", e.target.value)}
                className="omni-entrada"
                placeholder={peiData.serie ? "Nenhuma turma cadastrada" : "Escolha a série antes"}
              />
            )}
          </label>
          {/* Matrícula / RA */}
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Matrícula / RA</span>
            <input
              type="text"
              value={peiData.matricula || ""}
              onChange={(e) => updateField("matricula", e.target.value)}
              className="omni-entrada"
              placeholder="Ex.: 2026-001234"
              aria-describedby="est-ra-ajuda"
            />
            <span id="est-ra-ajuda" className="omni-campo__ajuda">RA: número de registro do estudante na rede.</span>
          </label>
        </div>

        {/* Selo do segmento + descrição (após Série/Ano) */}
        {segmento && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <span className="omni-estado omni-estado--info">{segmento.nome}</span>
            <span className="omni-apoio">{segmento.desc}</span>
          </div>
        )}
      </section>

      {/* Histórico & Contexto Familiar */}
      <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 16 }} aria-labelledby="est-historico-titulo">
        <h4 id="est-historico-titulo" style={tituloSecao}>Histórico e família</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Histórico escolar</span>
            <textarea
              value={peiData.historico || ""}
              onChange={(e) => updateField("historico", e.target.value)}
              rows={6}
              className="omni-entrada"
            />
          </label>
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Como é a família</span>
            <textarea
              value={peiData.familia || ""}
              onChange={(e) => updateField("familia", e.target.value)}
              rows={6}
              className="omni-entrada"
            />
          </label>
        </div>

        {/* Composição familiar */}
        <div style={{ display: "grid", gap: 10 }}>
          <label className="omni-campo" style={larga}>
            <span className="omni-campo__rotulo">Quem convive com o estudante?</span>
            <span id="est-familia-ajuda" className="omni-campo__ajuda">A lista inclui Mãe 1 / Mãe 2 e Pai 1 / Pai 2, para todo tipo de família.</span>
            <select
              value={""}
              onChange={(e) => {
                if (e.target.value) {
                  const atual = peiData.composicao_familiar_tags || [];
                  if (!atual.includes(e.target.value)) {
                    updateField("composicao_familiar_tags", [...atual, e.target.value]);
                  }
                  e.target.value = "";
                }
              }}
              className="omni-entrada"
              aria-describedby="est-familia-ajuda"
            >
              <option value="">Escolha para adicionar…</option>
              {LISTA_FAMILIA.filter((f) => !(peiData.composicao_familiar_tags || []).includes(f)).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          {familia.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Quem convive com o estudante">
              {familia.map((f) => (
                <li key={f} className="omni-estado omni-estado--info" style={{ paddingRight: 4 }}>
                  {f}
                  <button
                    type="button"
                    onClick={() => {
                      const atual = peiData.composicao_familiar_tags || [];
                      updateField("composicao_familiar_tags", atual.filter((item) => item !== f));
                    }}
                    className="omni-btn omni-btn--discreto omni-btn--icone"
                    style={{ minHeight: 24, minWidth: 24, padding: 2 }}
                    aria-label={`Tirar ${f}`}
                  >
                    <X aria-hidden size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Laudo PDF + leitura automática */}
      <section style={{ display: "grid", gap: 12 }} aria-labelledby="est-laudo-titulo">
        <h4 id="est-laudo-titulo" style={tituloSecao}>
          <FileText aria-hidden size={18} style={iconeSecao} />
          Laudo <span className="omni-campo__opcional">(se houver)</span>
        </h4>
        <LaudoPdfSection
          peiData={peiData}
          onDiagnostico={(v) => updateField("diagnostico", v)}
          onMedicamentos={(meds) => {
            setPeiData((prev) => ({ ...prev, lista_medicamentos: meds }));
          }}
        />
      </section>

      {/* Contexto clínico */}
      <section className="omni-cartao" style={{ display: "grid", gap: 20 }} aria-labelledby="est-clinico-titulo">
        <h4 id="est-clinico-titulo" style={tituloSecao}>Contexto clínico</h4>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="est-diagnostico" className="omni-campo__rotulo" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Diagnóstico <span className="omni-campo__opcional">(opcional)</span> <HelpTooltip fieldId="pei-diagnostico" />
          </label>
          <p id="est-diagnostico-ajuda" className="omni-campo__ajuda" style={{ margin: 0, maxWidth: "70ch" }}>
            Se o estudante tem laudo, registre o diagnóstico aqui: ele orienta o PEI junto com o estudo de caso. A lei só proíbe exigir o laudo para matrícula, AEE (Atendimento Educacional Especializado) ou profissional de apoio (Decreto 12.686/2025 e Portaria MEC 421/2026).
          </p>
          <input
            id="est-diagnostico"
            type="text"
            value={peiData.diagnostico || ""}
            onChange={(e) => updateField("diagnostico", e.target.value)}
            className="omni-entrada"
            placeholder="Nunca vai para materiais do estudante."
            aria-describedby="est-diagnostico-ajuda"
          />
          {/* Campos condicionais por diagnóstico */}
          <DiagnosticConditionalFields
            peiData={peiData}
            onUpdate={(key, value) => { updateField(key, value); }}
          />
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <h5 style={{ ...tituloSecao, fontSize: 15 }}>
            <Pill aria-hidden size={18} style={iconeSecao} />
            Medicações
          </h5>
          <MedicamentosForm medicamentos={Array.isArray(peiData.lista_medicamentos) ? peiData.lista_medicamentos : []} onAdd={addMedicamento} onRemove={removeMedicamento} />
        </div>
      </section>
    </div>
  );
}
