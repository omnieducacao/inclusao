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

export function InclusaoBrincarTool({ student, engine, onEngineChange, mesa }: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || "";
  const [tema, setTema] = useState("");
  const [feedback, setFeedback] = useState("");

  const hub = useHubGenerate({
    studentId: student?.id,
    endpoint: "/api/hub/inclusao-brincar",
    engine,
    validate: () => !tema.trim() ? "Diga o momento ou a brincadeira." : null,
  });
  const { loading, resultado, erro, setValidado } = hub;

  const gerar = (refazer = false) => {
    hub.gerar({
      tema,
      feedback: refazer ? feedback : undefined,
      engine,
      estudante: student ? { nome: student.name, hiperfoco, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 500) || undefined } : undefined,
    }).then(() => { if (refazer) setFeedback(""); });
  };
  const hoje = new Date().toISOString().slice(0, 10);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Momento" feita={Boolean(tema.trim())} resumo={tema}>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Momento ou brincadeira</span>
          <input className="omni-entrada" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: brincadeira de massinha" />
        </label>
        {hiperfoco && <p className="omni-apoio" style={{ margin: 0 }}>A IA parte do que a criança gosta: <strong>{hiperfoco}</strong>.</p>}
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
      gerar={{ rotulo: "Criar a brincadeira", onClick: () => gerar(false), desabilitado: !tema.trim(), carregando: loading, dica: "Sem forçar a interação: a criança entra pelo que gosta." }}
      vazio={{ titulo: "A brincadeira aparece aqui", texto: "Diga o momento. A IA cria uma brincadeira em que a criança é protagonista e a turma participa junto." }}
      resultado={resultado && (
        <ResultadoIA
          titulo="Inclusão no brincar"
          publico="professor"
          material={resultado}
          onRefazer={() => gerar(true)}
          refazendo={loading}
          ajuste={{ valor: feedback, onChange: setFeedback }}
          onDescartar={() => { hub.setResultado(null); setValidado(false); }}
          onRevisado={setValidado}
          acoes={(texto) => (
            <>
              <DocxDownloadButton texto={texto} titulo="Inclusão no Brincar" filename={`Inclusao_Brincar_${hoje}.docx`} />
              <PdfDownloadButton text={texto} filename={`Inclusao_Brincar_${hoje}.pdf`} title="Inclusão no Brincar" />
              <SalvarNoPlanoButton conteudo={texto} tipo="Inclusão no Brincar" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}
