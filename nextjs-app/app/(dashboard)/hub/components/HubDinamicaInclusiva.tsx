"use client";

import { useState } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar, LinhaEscolha, Pilula } from "@/components/ferramenta/Mesa";
import { useBnccDaSerie, EscolhaComponente, EscolhaHabilidades, EscolhaMotor } from "./escolhas";
import type { StudentFull, EngineId, MesaDaFerramenta } from "../hub-types";

const TAMANHOS = [15, 20, 25, 30, 35, 40];

export function DinamicaInclusiva({ student, engine, onEngineChange, mesa }: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const [materia, setMateria] = useState("");
  const [assunto, setAssunto] = useState("");
  const [qtdAlunos, setQtdAlunos] = useState(25);
  const [caracteristicas, setCaracteristicas] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const serieAluno = student?.grade || "";
  const { linhas, disciplinas, carregando } = useBnccDaSerie(serieAluno);
  const temBncc = habilidadesSel.length > 0;

  const hub = useHubGenerate({
    studentId: student?.id,
    endpoint: "/api/hub/dinamica",
    engine,
    validate: () => (!assunto.trim() && !temBncc) ? "Escreva o assunto ou escolha uma habilidade da BNCC." : null,
  });
  const { loading, resultado, erro, setValidado, setResultado } = hub;

  const gerar = () => {
    const peiData = student?.pei_data || {};
    hub.gerar({
      aluno: { nome: student?.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 800) || undefined, hiperfoco: (peiData.hiperfoco as string) || "Geral" },
      materia: materia || "Geral",
      assunto: assunto.trim() || undefined,
      qtd_alunos: qtdAlunos,
      caracteristicas_turma: caracteristicas || undefined,
      ano: serieAluno || undefined,
      habilidades_bncc: temBncc ? habilidadesSel : undefined,
      engine,
    });
  };
  const hoje = new Date().toISOString().slice(0, 10);
  const nomeArquivo = (assunto || "Dinamica").replace(/\s+/g, "_").slice(0, 40);
  const pronto = Boolean(assunto.trim() || temBncc);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Conteúdo" feita={pronto} resumo={[materia, temBncc ? `${habilidadesSel.length} habilidade${habilidadesSel.length > 1 ? "s" : ""}` : "", assunto].filter(Boolean).join(" · ")}>
        {serieAluno && <p className="omni-apoio" style={{ margin: 0 }}>Ano: <strong>{serieAluno}</strong>, pela ficha do estudante.</p>}
        <EscolhaComponente disciplinas={disciplinas} valor={materia} onChange={setMateria} />
        <EscolhaHabilidades linhas={linhas} componente={materia} selecionadas={habilidadesSel} onChange={setHabilidadesSel} carregando={carregando} />
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Assunto {temBncc && <span className="omni-campo__opcional">(opcional)</span>}</span>
          <input className="omni-entrada" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex.: cadeia alimentar" />
        </label>
        <Continuar para={2} />
      </Etapa>
      <Etapa n={2} titulo="Turma" feita resumo={`${qtdAlunos} estudantes`}>
        <LinhaEscolha rotulo="Estudantes" valor={String(qtdAlunos)}>
          {TAMANHOS.map((n) => <Pilula key={n} on={qtdAlunos === n} onClick={() => setQtdAlunos(n)}>{n}</Pilula>)}
        </LinhaEscolha>
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Como é a turma <span className="omni-campo__opcional">(opcional)</span></span>
          <textarea className="omni-entrada" rows={3} value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} placeholder="Ex.: agitada depois do recreio, gosta de competir" />
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
      gerar={{ rotulo: "Criar dinâmica", onClick: gerar, desabilitado: !pronto, carregando: loading, dica: "Uma atividade em grupo em que todos participam, inclusive o estudante." }}
      vazio={{ titulo: "A dinâmica aparece aqui", texto: "Diga o conteúdo e o tamanho da turma. Você revisa antes de levar para a sala." }}
      resultado={resultado && (
        <ResultadoIA
          titulo="Dinâmica inclusiva"
          publico="professor"
          material={resultado}
          onRefazer={() => gerar()}
          refazendo={loading}
          onDescartar={() => { setResultado(null); setValidado(false); }}
          onRevisado={setValidado}
          acoes={(texto) => (
            <>
              <DocxDownloadButton texto={texto} titulo="Dinâmica Inclusiva" filename={`Dinamica_${nomeArquivo}_${hoje}.docx`} />
              <PdfDownloadButton text={texto} filename={`Dinamica_${nomeArquivo}_${hoje}.pdf`} title="Dinâmica Inclusiva" />
              <SalvarNoPlanoButton conteudo={texto} tipo="Dinâmica" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}
