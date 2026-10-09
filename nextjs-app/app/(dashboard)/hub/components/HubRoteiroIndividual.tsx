"use client";

import { useState } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar } from "@/components/ferramenta/Mesa";
import { useBnccDaSerie, EscolhaComponente, EscolhaHabilidades, EscolhaMotor } from "./escolhas";
import type { StudentFull, EngineId, MesaDaFerramenta } from "../hub-types";

export function RoteiroIndividual({ student, engine, onEngineChange, mesa }: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const [materia, setMateria] = useState("");
  const [assunto, setAssunto] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const serieAluno = student?.grade || "";
  const { linhas, disciplinas, carregando } = useBnccDaSerie(serieAluno);
  const temBncc = habilidadesSel.length > 0;

  const hub = useHubGenerate({
    studentId: student?.id,
    endpoint: "/api/hub/roteiro",
    engine,
    validate: () => (!assunto.trim() && !temBncc) ? "Escreva o assunto ou escolha uma habilidade da BNCC." : null,
  });
  const { loading, resultado, erro, setValidado, setResultado } = hub;

  const gerar = () => {
    const peiData = student?.pei_data || {};
    hub.gerar({
      aluno: { nome: student?.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 500), hiperfoco: (peiData.hiperfoco as string) || "Geral" },
      materia: materia || "Geral",
      assunto: assunto.trim() || undefined,
      ano: serieAluno || undefined,
      habilidades_bncc: temBncc ? habilidadesSel : undefined,
      engine,
    });
  };
  const hoje = new Date().toISOString().slice(0, 10);
  const nomeArquivo = (assunto || "Aula").replace(/\s+/g, "_").slice(0, 40);
  const pronto = Boolean(assunto.trim() || temBncc);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Aula" feita={pronto} resumo={[materia, temBncc ? `${habilidadesSel.length} habilidade${habilidadesSel.length > 1 ? "s" : ""}` : "", assunto].filter(Boolean).join(" · ")}>
        {serieAluno && <p className="omni-apoio" style={{ margin: 0 }}>Ano: <strong>{serieAluno}</strong>, pela ficha do estudante.</p>}
        <EscolhaComponente disciplinas={disciplinas} valor={materia} onChange={setMateria} />
        <EscolhaHabilidades linhas={linhas} componente={materia} selecionadas={habilidadesSel} onChange={setHabilidadesSel} carregando={carregando} />
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Assunto {temBncc && <span className="omni-campo__opcional">(opcional)</span>}</span>
          <input className="omni-entrada" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex.: frações equivalentes" />
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
      gerar={{ rotulo: "Criar roteiro", onClick: gerar, desabilitado: !pronto, carregando: loading, dica: "O passo a passo da aula pensado para o estudante, usando o que ele gosta." }}
      vazio={{ titulo: "O roteiro aparece aqui", texto: "Escolha o componente e a habilidade (ou escreva o assunto). Você revisa antes de usar." }}
      resultado={resultado && (
        <ResultadoIA
          titulo="Roteiro individual"
          publico="professor"
          material={resultado}
          onRefazer={() => gerar()}
          refazendo={loading}
          onDescartar={() => { setResultado(null); setValidado(false); }}
          onRevisado={setValidado}
          acoes={(texto) => (
            <>
              <DocxDownloadButton texto={texto} titulo="Roteiro de Aula" filename={`Roteiro_${nomeArquivo}_${hoje}.docx`} />
              <PdfDownloadButton text={texto} filename={`Roteiro_${nomeArquivo}_${hoje}.pdf`} title="Roteiro de Aula" />
              <SalvarNoPlanoButton conteudo={texto} tipo="Roteiro" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}
