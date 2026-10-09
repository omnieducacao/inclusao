"use client";

import { useState, useEffect } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar } from "@/components/ferramenta/Mesa";
import { useBnccDaSerie, EscolhaComponente, EscolhaMotor } from "./escolhas";
import type { StudentFull, EngineId, MesaDaFerramenta } from "../hub-types";

export function PapoDeMestre({ student, hiperfoco, engine, onEngineChange, mesa }: {
  student: StudentFull | null;
  hiperfoco: string;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const [materia, setMateria] = useState("");
  const [assunto, setAssunto] = useState("");
  const [temaTurma, setTemaTurma] = useState("");
  const [hiperfocoEditavel, setHiperfocoEditavel] = useState(hiperfoco === "Interesses gerais" ? "" : hiperfoco);
  const { disciplinas } = useBnccDaSerie(student?.grade || "");

  const hub = useHubGenerate({
    studentId: student?.id,
    endpoint: "/api/hub/papo-mestre",
    engine,
    validate: () => !assunto.trim() ? "Escreva o assunto da aula." : null,
  });
  const { loading, resultado, erro, setValidado, setResultado } = hub;

  useEffect(() => { setHiperfocoEditavel(hiperfoco === "Interesses gerais" ? "" : hiperfoco); }, [hiperfoco]);

  const gerar = () => hub.gerar({
    materia: materia || "Geral", assunto, engine, hiperfoco: hiperfocoEditavel || "Interesses gerais",
    tema_turma: temaTurma || undefined,
    nome_estudante: student?.name || "o estudante",
  });
  const hoje = new Date().toISOString().slice(0, 10);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Aula" feita={Boolean(assunto.trim())} resumo={[materia, assunto].filter(Boolean).join(" · ")}>
        <EscolhaComponente disciplinas={disciplinas} valor={materia} onChange={setMateria} />
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Assunto da aula</span>
          <input className="omni-entrada" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex.: frações, sistema solar" />
        </label>
        <Continuar para={2} />
      </Etapa>
      <Etapa n={2} titulo="Interesses" feita={Boolean(hiperfocoEditavel)} resumo={hiperfocoEditavel}>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">O que {student?.name?.split(" ")[0] || "o estudante"} gosta</span>
          <input className="omni-entrada" value={hiperfocoEditavel} onChange={(e) => setHiperfocoEditavel(e.target.value)} placeholder="Ex.: dinossauros, futebol" />
          <span className="omni-campo__ajuda">Vem do PEI. Pode mudar ou apagar.</span>
        </label>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">O que a turma gosta <span className="omni-campo__opcional">(opcional)</span></span>
          <input className="omni-entrada" value={temaTurma} onChange={(e) => setTemaTurma(e.target.value)} placeholder="Ex.: Minecraft, Copa do Mundo" />
        </label>
        <Continuar para={3} />
      </Etapa>
      <Etapa n={3} titulo="Ajustes" opcional>
        <EscolhaMotor valor={engine} onChange={onEngineChange} />
      </Etapa>
    </Etapas>
  );

  return (
    <MesaFerramenta
      {...mesa}
      painel={painel}
      erro={erro}
      gerar={{ rotulo: "Criar conexões", onClick: gerar, desabilitado: !assunto.trim(), carregando: loading, dica: "Ideias para ligar o conteúdo ao que o estudante gosta. É para você, não para entregar." }}
      vazio={{ titulo: "As conexões aparecem aqui", texto: "Diga o assunto da aula. A IA sugere jeitos de puxar o interesse do estudante para dentro do conteúdo." }}
      resultado={resultado && (
        <ResultadoIA
          titulo="Conexões com o interesse do estudante"
          publico="professor"
          material={resultado}
          onRefazer={() => gerar()}
          refazendo={loading}
          onDescartar={() => { setResultado(null); setValidado(false); }}
          onRevisado={setValidado}
          acoes={(texto) => (
            <>
              <DocxDownloadButton texto={texto} titulo="Papo de Mestre" filename={`Papo_Mestre_${hoje}.docx`} />
              <PdfDownloadButton text={texto} filename={`Papo_Mestre_${hoje}.pdf`} title="Papo de Mestre" />
              <SalvarNoPlanoButton conteudo={texto} tipo="Papo de Mestre" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}
