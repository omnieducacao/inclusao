"use client";

import { useState } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar } from "@/components/ferramenta/Mesa";
import { EscolhaMotor } from "./escolhas";
import type { StudentFull, EngineId, MesaDaFerramenta } from "../hub-types";

export function RotinaAvdTool({ student, engine, onEngineChange, mesa }: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const [rotinaDetalhada, setRotinaDetalhada] = useState("");
  const [topicoFoco, setTopicoFoco] = useState("");
  const [feedback, setFeedback] = useState("");

  const hub = useHubGenerate({
    studentId: student?.id,
    endpoint: "/api/hub/rotina-avd",
    engine,
    validate: () => !rotinaDetalhada.trim() ? "Descreva a rotina da turma." : null,
  });
  const { loading, resultado, erro, setValidado } = hub;

  const gerar = (refazer = false) => {
    const peiData = student?.pei_data || {};
    hub.gerar({
      rotina_detalhada: rotinaDetalhada,
      topico_foco: topicoFoco || undefined,
      feedback: refazer ? feedback : undefined,
      engine,
      estudante: student ? { nome: student.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 300) } : undefined,
    }).then(() => { if (refazer) setFeedback(""); });
  };
  const hoje = new Date().toISOString().slice(0, 10);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Rotina da turma" feita={Boolean(rotinaDetalhada.trim())} resumo={rotinaDetalhada.trim() ? `${rotinaDetalhada.trim().split("\n").length} momentos` : ""}>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Como é o dia, do começo ao fim</span>
          <textarea className="omni-entrada" rows={7} value={rotinaDetalhada} onChange={(e) => setRotinaDetalhada(e.target.value)} placeholder={"8:00 Chegada e acolhida\n8:30 Roda de conversa\n9:00 Lanche\n…"} />
        </label>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Momento que pede atenção <span className="omni-campo__opcional">(opcional)</span></span>
          <input className="omni-entrada" value={topicoFoco} onChange={(e) => setTopicoFoco(e.target.value)} placeholder="Ex.: a ida para o parque" />
        </label>
        <Continuar para={2} />
      </Etapa>
      <Etapa n={2} titulo="Ajustes" opcional>
        <EscolhaMotor valor={engine} onChange={onEngineChange} />
      </Etapa>
    </Etapas>
  );

  return (
    <MesaFerramenta
      {...mesa}
      painel={painel}
      erro={erro}
      gerar={{ rotulo: "Analisar a rotina", onClick: () => gerar(false), desabilitado: !rotinaDetalhada.trim(), carregando: loading, dica: "Aponta as transições difíceis e como antecipar cada uma." }}
      vazio={{ titulo: "A rotina adaptada aparece aqui", texto: "Escreva a rotina da turma. A IA aponta os momentos de estresse e sugere como deixar o dia previsível para a criança." }}
      resultado={resultado && (
        <ResultadoIA
          titulo="Rotina e AVD"
          publico="professor"
          material={resultado}
          onRefazer={() => gerar(true)}
          refazendo={loading}
          ajuste={{ valor: feedback, onChange: setFeedback }}
          onDescartar={() => { hub.setResultado(null); setValidado(false); }}
          onRevisado={setValidado}
          acoes={(texto) => (
            <>
              <DocxDownloadButton texto={texto} titulo="Rotina e AVD" filename={`Rotina_AVD_${hoje}.docx`} />
              <PdfDownloadButton text={texto} filename={`Rotina_AVD_${hoje}.pdf`} title="Rotina e AVD" />
              <SalvarNoPlanoButton conteudo={texto} tipo="Rotina e AVD" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}
