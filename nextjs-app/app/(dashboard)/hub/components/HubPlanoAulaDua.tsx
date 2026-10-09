"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar, LinhaEscolha, Pilula } from "@/components/ferramenta/Mesa";
import { useBnccDaSerie, EscolhaComponente, EscolhaHabilidades, EscolhaMotor } from "./escolhas";
import { METODOLOGIAS, TECNICAS_ATIVAS, RECURSOS_DISPONIVEIS, type StudentFull, type EngineId, type MesaDaFerramenta } from "../hub-types";

const TAMANHOS = [15, 20, 25, 30, 35, 40];

export function PlanoAulaDua({ student, engine, onEngineChange, mesa }: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const [materia, setMateria] = useState("");
  const [assunto, setAssunto] = useState("");
  const [duracao, setDuracao] = useState(50);
  const [metodologia, setMetodologia] = useState("Aula Expositiva Dialogada");
  const [tecnicaAtiva, setTecnicaAtiva] = useState("");
  const [recursos, setRecursos] = useState<string[]>([]);
  const [qtdAlunos, setQtdAlunos] = useState(30);
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loadingMapa, setLoadingMapa] = useState(false);
  const [mapaHtml, setMapaHtml] = useState<string | null>(null);
  const [mapaErro, setMapaErro] = useState<string | null>(null);

  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "";
  const serieAluno = student?.grade || "";
  const { linhas, disciplinas, carregando } = useBnccDaSerie(serieAluno);
  const temBncc = habilidadesSel.length > 0;

  const hub = useHubGenerate({
    studentId: student?.id,
    endpoint: "/api/hub/plano-aula",
    engine,
    validate: () => (!assunto.trim() && !temBncc) ? "Escreva o assunto ou escolha uma habilidade da BNCC." : null,
  });
  const { loading, resultado, erro, setValidado, setResultado } = hub;

  const gerar = () => {
    setMapaHtml(null);
    hub.gerar({
      materia: materia || "Geral",
      assunto: assunto.trim() || undefined,
      duracao_minutos: duracao,
      metodologia,
      tecnica: metodologia === "Metodologia Ativa" && tecnicaAtiva ? tecnicaAtiva : undefined,
      qtd_alunos: qtdAlunos,
      recursos: recursos.length > 0 ? recursos : undefined,
      habilidades_bncc: temBncc ? habilidadesSel : undefined,
      estudante: student ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 500) || undefined } : undefined,
    });
  };

  async function gerarMapa(texto: string) {
    setLoadingMapa(true);
    setMapaErro(null);
    setMapaHtml(null);
    aiLoadingStart("blue", "hub");
    try {
      const res = await fetch("/api/hub/mapa-mental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student?.id || undefined,
          tipo: "html",
          materia: materia || "Geral",
          assunto: assunto || "Geral",
          plano_texto: texto,
          estudante: student ? { nome: student.name, hiperfoco } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setMapaHtml(data.html);
    } catch (e) {
      setMapaErro(e instanceof Error ? e.message : "Não deu para gerar o mapa mental.");
    } finally {
      setLoadingMapa(false);
      aiLoadingStop();
    }
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const pronto = Boolean(assunto.trim() || temBncc);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Conteúdo" feita={pronto} resumo={[materia, temBncc ? `${habilidadesSel.length} habilidade${habilidadesSel.length > 1 ? "s" : ""}` : "", assunto].filter(Boolean).join(" · ")}>
        {serieAluno && <p className="omni-apoio" style={{ margin: 0 }}>Ano: <strong>{serieAluno}</strong>, pela ficha do estudante.</p>}
        <EscolhaComponente disciplinas={disciplinas} valor={materia} onChange={setMateria} />
        <EscolhaHabilidades linhas={linhas} componente={materia} selecionadas={habilidadesSel} onChange={setHabilidadesSel} carregando={carregando} />
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Assunto {temBncc && <span className="omni-campo__opcional">(opcional)</span>}</span>
          <input className="omni-entrada" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex.: frações equivalentes" />
        </label>
        <Continuar para={2} />
      </Etapa>
      <Etapa n={2} titulo="Aula" feita resumo={`${duracao} min · ${qtdAlunos} estudantes`}>
        <LinhaEscolha rotulo="Duração" valor={String(duracao)}>
          <Pilula on={duracao === 50} onClick={() => setDuracao(50)}>1 aula (50 min)</Pilula>
          <Pilula on={duracao === 100} onClick={() => setDuracao(100)}>2 aulas (100 min)</Pilula>
        </LinhaEscolha>
        <LinhaEscolha rotulo="Estudantes" valor={String(qtdAlunos)}>
          {TAMANHOS.map((n) => <Pilula key={n} on={qtdAlunos === n} onClick={() => setQtdAlunos(n)}>{n}</Pilula>)}
        </LinhaEscolha>
        <LinhaEscolha rotulo="Metodologia" valor={metodologia}>
          {METODOLOGIAS.map((m) => <Pilula key={m} on={metodologia === m} onClick={() => { setMetodologia(m); if (m !== "Metodologia Ativa") setTecnicaAtiva(""); }}>{m}</Pilula>)}
        </LinhaEscolha>
        {metodologia === "Metodologia Ativa" && (
          <LinhaEscolha rotulo="Técnica" valor={tecnicaAtiva}>
            {TECNICAS_ATIVAS.map((t) => <Pilula key={t} on={tecnicaAtiva === t} onClick={() => setTecnicaAtiva(t)}>{t}</Pilula>)}
          </LinhaEscolha>
        )}
        <Continuar para={3} />
      </Etapa>
      <Etapa n={3} titulo="Recursos e ajustes" resumo={recursos.length ? `${recursos.length} recurso${recursos.length > 1 ? "s" : ""}` : ""} opcional>
        <fieldset className="omni-escolhas" style={{ gap: 6 }}>
          <legend className="omni-linha__rotulo" style={{ marginBottom: 8 }}>O que tem na sala</legend>
          {RECURSOS_DISPONIVEIS.map((r) => (
            <label key={r} className="omni-chip" style={{ fontSize: 13.5 }}>
              <input type="checkbox" checked={recursos.includes(r)} onChange={() => setRecursos((l) => l.includes(r) ? l.filter((x) => x !== r) : [...l, r])} />
              <Check className="omni-chip__marca" aria-hidden />
              {r}
            </label>
          ))}
        </fieldset>
        <EscolhaMotor valor={engine} onChange={onEngineChange} />
      </Etapa>
    </Etapas>
  );

  return (
    <MesaFerramenta
      {...mesa}
      painel={painel}
      erro={erro}
      gerar={{ rotulo: "Criar plano de aula", onClick: gerar, desabilitado: !pronto, carregando: loading, dica: "Desenho Universal para a Aprendizagem: a aula já nasce acessível para a turma toda." }}
      vazio={{ titulo: "O plano de aula aparece aqui", texto: "Escolha o conteúdo e como vai ser a aula. Você revisa antes de usar e pode pedir um mapa mental do conteúdo." }}
      resultado={resultado && (
        <>
          <ResultadoIA
            titulo="Plano de aula com DUA"
            publico="professor"
            material={resultado}
            onRefazer={gerar}
            refazendo={loading}
            onDescartar={() => { setResultado(null); setValidado(false); setMapaHtml(null); }}
            onRevisado={setValidado}
            acoes={(texto) => (
              <>
                <DocxDownloadButton texto={texto} titulo="Plano de Aula DUA" filename={`Plano_Aula_${hoje}.docx`} />
                <PdfDownloadButton text={texto} filename={`Plano_Aula_${hoje}.pdf`} title="Plano de Aula DUA" />
                <SalvarNoPlanoButton conteudo={texto} tipo="Plano de Aula DUA" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
                <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" disabled={loadingMapa} onClick={() => gerarMapa(texto)}>
                  {loadingMapa ? "Gerando o mapa…" : "Mapa mental"}
                </button>
              </>
            )}
          />
          {mapaErro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{mapaErro}</div></div></div>}
          {mapaHtml && (
            <section className="omni-cartao omni-cartao--plano" style={{ padding: 0, overflow: "hidden" }} aria-label="Mapa mental do conteúdo">
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--borda)" }}>
                <strong style={{ font: "700 15px/20px var(--font-sans)", color: "var(--tinta)" }}>Mapa mental do conteúdo</strong>
                <span style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => {
                    const url = URL.createObjectURL(new Blob([mapaHtml], { type: "text/html" }));
                    window.open(url, "_blank");
                    setTimeout(() => URL.revokeObjectURL(url), 60000);
                  }}>Abrir em outra aba</button>
                  <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setMapaHtml(null)}>Fechar</button>
                </span>
              </div>
              <iframe srcDoc={mapaHtml} title="Mapa mental" style={{ width: "100%", height: 600, border: 0 }} sandbox="allow-scripts" />
            </section>
          )}
        </>
      )}
    />
  );
}
