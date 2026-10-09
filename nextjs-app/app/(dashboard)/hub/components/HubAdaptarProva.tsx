"use client";

import { useState } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar, LinhaEscolha, Pilula, Soltar } from "@/components/ferramenta/Mesa";
import { useBnccDaSerie, EscolhaComponente, EscolhaChecklist, resumoChecklist, EscolhaMotor } from "./escolhas";
import type { StudentFull, EngineId, ChecklistAdaptacao, MesaDaFerramenta } from "../hub-types";

const TIPOS = ["Prova", "Tarefa", "Avaliação"];

export function AdaptarProva({
  student, hiperfoco, engine, onEngineChange, mesa,
}: {
  student: StudentFull | null;
  hiperfoco: string;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [colado, setColado] = useState("");
  const [docxExtraido, setDocxExtraido] = useState<{ texto: string; imagens: { base64: string; contentType: string }[] } | null>(null);
  const [mapaQuestoes, setMapaQuestoes] = useState<Record<number, number>>({});
  const [componente, setComponente] = useState("");
  const [tema, setTema] = useState("");
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Prova");
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [refazendo, setRefazendo] = useState(false);
  const [formatoInclusivo, setFormatoInclusivo] = useState(false);

  const peiData = student?.pei_data || {};
  const serieAluno = student?.grade || "";
  const { disciplinas } = useBnccDaSerie(serieAluno);

  const handleFileChange = async (f: File | null) => {
    setFile(f);
    setDocxExtraido(null);
    setMapaQuestoes({});
    setResultado(null);
    if (!f) return;
    setExtracting(true);
    setErro(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/hub/extrair-docx", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao extrair");
      setDocxExtraido({ texto: data.texto, imagens: data.imagens || [] });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para ler o arquivo Word.");
    } finally {
      setExtracting(false);
    }
  };

  const textoProva = docxExtraido?.texto || (colado.trim().length > 20 ? colado.trim() : "");
  const temDados = Boolean(textoProva || file);

  const gerar = async (usarModoProfundo = false) => {
    if (!temDados) {
      setErro("Envie a prova em Word ou cole o texto dela.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    aiLoadingStart(engine || "green", "hub");
    try {
      const questoesComImagem = [...new Set(Object.values(mapaQuestoes).filter((q) => q > 0))];
      const formData = new FormData();
      if (file && !colado.trim()) formData.append("file", file);
      formData.append("meta", JSON.stringify({
        materia: componente || "Geral",
        tema: tema || undefined,
        tipo,
        checklist,
        engine,
        modo_profundo: usarModoProfundo || modoProfundo,
        student_id: student?.id || undefined,
        estudante: { nome: student?.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined },
        texto: textoProva || undefined,
        questoes_com_imagem: questoesComImagem,
      }));
      const res = await fetch("/api/hub/adaptar-prova", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adaptar");
      setResultado({ analise: data.analise || "", texto: data.texto || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para adaptar agora. Tente de novo.");
    } finally {
      setLoading(false);
      setRefazendo(false);
      aiLoadingStop();
    }
  };

  const { mapaImagensParaDocx, textoComImagensParaDocx } = imagensParaDocx(docxExtraido, mapaQuestoes, resultado);
  const temImagens = Object.keys(mapaImagensParaDocx).length > 0;
  const hoje = new Date().toISOString().slice(0, 10);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Prova" feita={temDados} resumo={file ? file.name : colado.trim() ? "Texto colado" : ""}>
        <Soltar
          aceita=".docx"
          texto="Arraste a prova em Word (.docx) ou clique para escolher"
          dica="As imagens da prova vêm junto"
          arquivos={file ? [file.name] : undefined}
          onArquivos={(l) => handleFileChange(l[0] || null)}
        />
        {extracting && <p className="omni-apoio" role="status" style={{ margin: 0 }}>Lendo o arquivo…</p>}
        {docxExtraido?.imagens?.length ? (
          <div className="omni-linha">
            <p className="omni-linha__rotulo">Cada imagem é de qual questão?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
              {docxExtraido.imagens.map((img, i) => (
                <label key={i} style={{ display: "flex", flexDirection: "column", gap: 4, font: "600 12.5px/16px var(--font-sans)", color: "var(--tinta-2)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`data:${img.contentType};base64,${img.base64}`} alt={`Imagem ${i + 1} da prova`} style={{ width: "100%", height: 64, objectFit: "contain", border: "1px solid var(--borda)", borderRadius: 8, background: "var(--superficie)" }} />
                  Questão
                  <input
                    className="omni-entrada"
                    style={{ minHeight: 36, padding: "4px 8px" }}
                    type="number" min={0} max={50}
                    value={mapaQuestoes[i] ?? 0}
                    onChange={(e) => setMapaQuestoes((m) => ({ ...m, [i]: parseInt(e.target.value, 10) || 0 }))}
                  />
                </label>
              ))}
            </div>
            <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>Deixe 0 na imagem que não deve ir para a versão adaptada.</p>
          </div>
        ) : null}
        {!file && (
          <label className="omni-campo">
            <span className="omni-campo__rotulo">ou cole o texto da prova</span>
            <textarea className="omni-entrada" rows={5} value={colado} onChange={(e) => setColado(e.target.value)} placeholder="1. Leia o texto e responda…" />
          </label>
        )}
        <LinhaEscolha rotulo="É uma" valor={tipo}>
          {TIPOS.map((t) => <Pilula key={t} on={tipo === t} onClick={() => setTipo(t)}>{t}</Pilula>)}
        </LinhaEscolha>
        <Continuar para={2} />
      </Etapa>

      <Etapa n={2} titulo="Conteúdo" feita={Boolean(componente)} resumo={[componente, tema].filter(Boolean).join(" · ")} opcional>
        {serieAluno && <p className="omni-apoio" style={{ margin: 0 }}>Ano: <strong>{serieAluno}</strong>, pela ficha do estudante.</p>}
        <EscolhaComponente disciplinas={disciplinas} valor={componente} onChange={setComponente} />
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Assunto <span className="omni-campo__opcional">(opcional)</span></span>
          <input className="omni-entrada" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: frações equivalentes" />
        </label>
        <Continuar para={3} />
      </Etapa>

      <Etapa n={3} titulo="Ajustes" resumo={resumoChecklist(checklist)} opcional>
        <EscolhaChecklist valor={checklist} onChange={setChecklist} />
        <label className="omni-caixa" style={{ fontSize: 14 }}>
          <input type="checkbox" checked={modoProfundo} onChange={(e) => setModoProfundo(e.target.checked)} />
          <span>Análise mais detalhada <span className="omni-apoio">(demora um pouco mais)</span></span>
        </label>
        <EscolhaMotor valor={engine} onChange={onEngineChange} />
      </Etapa>
    </Etapas>
  );

  return (
    <MesaFerramenta
      {...mesa}
      painel={painel}
      erro={erro}
      gerar={{
        rotulo: "Adaptar prova",
        onClick: () => gerar(),
        desabilitado: !temDados || extracting,
        carregando: loading && !refazendo,
        dica: "A IA mantém o que a prova cobra e muda só a forma de apresentar.",
      }}
      vazio={{ titulo: "A prova adaptada aparece aqui", texto: "Envie a prova que você já usa com a turma. A versão adaptada sai com o perfil do estudante, e você revisa antes de imprimir." }}
      resultado={resultado && (
        <ResultadoIA
          titulo="Prova adaptada"
          material={textoComImagensParaDocx}
          notas={resultado.analise}
          mapaImagens={temImagens ? mapaImagensParaDocx : undefined}
          onRefazer={() => { setRefazendo(true); gerar(true); }}
          refazendo={refazendo}
          onDescartar={() => setResultado(null)}
          acoes={(texto) => (
            <>
              <label className="omni-apoio flex items-center gap-1.5 cursor-pointer" title="Fonte OpenDyslexic, 14 pt, espaçamento 1,5 e fundo creme">
                <input type="checkbox" checked={formatoInclusivo} onChange={(e) => setFormatoInclusivo(e.target.checked)} />
                Formato para leitura facilitada
              </label>
              <DocxDownloadButton texto={texto} titulo="Prova adaptada" filename={`Prova_Adaptada_${hoje}.docx`} mapaImagens={temImagens ? mapaImagensParaDocx : undefined} formatoInclusivo={formatoInclusivo} />
              <PdfDownloadButton text={texto} filename={`Prova_Adaptada_${hoje}.pdf`} title="Prova adaptada" formatoInclusivo={formatoInclusivo} />
              <SalvarNoPlanoButton conteudo={texto} tipo="Prova Adaptada" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}

/** Liga as imagens do DOCX às questões da prova adaptada (insere [[IMG_N]] onde a IA não pôs). */
function imagensParaDocx(
  docxExtraido: { texto: string; imagens: { base64: string; contentType: string }[] } | null,
  mapaQuestoes: Record<number, number>,
  resultado: { analise: string; texto: string } | null,
) {
const mapaImagensParaDocx: Record<number, string> = {};
let textoComImagensParaDocx = resultado?.texto || "";

if (docxExtraido?.imagens?.length && resultado?.texto) {
  for (const [imgIdxStr, questao] of Object.entries(mapaQuestoes)) {
    if (questao > 0) {
      const idx = parseInt(imgIdxStr, 10);
      const img = docxExtraido.imagens[idx];
      // Garantir que a imagem existe e tem base64 válido
      if (img?.base64 && typeof img.base64 === "string" && img.base64.length > 0) {
        // Remover prefixo data: se existir
        const base64Clean = img.base64.replace(/^data:image\/\w+;base64,/, "");
        if (base64Clean.length > 0) {
          mapaImagensParaDocx[questao] = base64Clean;
        }
      }
    }
  }

  // Garantir que o texto tenha as tags [[IMG_N]] para as questões mapeadas
  // Se não tiver, adicionar após o número da questão
  textoComImagensParaDocx = resultado.texto;
  const questoesComImagem = Object.values(mapaQuestoes).filter((q) => q > 0);


  // Para questões sem tag, inserir de forma mais robusta
  for (const questao of questoesComImagem) {
    const tag = `[[IMG_${questao}]]`;
    // Verificar se a tag já existe no texto (com variações possíveis)
    const tagVariations = [
      tag,
      tag.replace(/\[\[/g, "[").replace(/\]\]/g, "]"),
      `IMG_${questao}`,
      `[Imagem ${questao}]`,
    ];
    const temTag = tagVariations.some((t) => textoComImagensParaDocx.includes(t));

    if (!temTag) {
      // Tentar encontrar a questão no texto — patterns com regex correto
      const patterns = [
        new RegExp(`(Questão\\s+${questao})\\b`, "gi"),
        new RegExp(`(\\b${questao}\\.)\\s`, "gi"),
        new RegExp(`(\\b${questao}\\))\\s`, "gi"),
      ];

      let inserido = false;
      for (const pattern of patterns) {
        const match = pattern.exec(textoComImagensParaDocx);
        if (match && match.index !== undefined) {
          // A partir da posição do match, encontrar o final do enunciado
          const inicio = match.index + match[0].length;
          const restoTexto = textoComImagensParaDocx.slice(inicio);

          // Procurar o ponto de inserção: logo antes das alternativas ou da próxima questão
          const altMatch = restoTexto.match(/\n\s*[a-eA-E]\s*\)/);
          const proxQuestaoMatch = restoTexto.match(/\n\s*(?:Questão\s+\d+|\d+\.|\d+\))/i);
          const quebraLinhaIdx = restoTexto.indexOf("\n");

          let posicaoRelativa: number;
          if (altMatch && altMatch.index !== undefined) {
            // Inserir logo antes das alternativas
            posicaoRelativa = altMatch.index;
          } else if (proxQuestaoMatch && proxQuestaoMatch.index !== undefined) {
            // Inserir antes da próxima questão
            posicaoRelativa = proxQuestaoMatch.index;
          } else if (quebraLinhaIdx >= 0) {
            // Inserir após a primeira linha do enunciado
            posicaoRelativa = quebraLinhaIdx;
          } else {
            posicaoRelativa = Math.min(restoTexto.length, 200);
          }

          const posicaoInsercao = inicio + posicaoRelativa;
          textoComImagensParaDocx = textoComImagensParaDocx.slice(0, posicaoInsercao) + `\n${tag}\n` + textoComImagensParaDocx.slice(posicaoInsercao);
          inserido = true;
          break;
        }
      }

      // Fallback: adicionar no final do texto (não no início!)
      if (!inserido) {
        textoComImagensParaDocx = `${textoComImagensParaDocx}\n\n${tag}`;
      }
    }
  }
}
  return { mapaImagensParaDocx, textoComImagensParaDocx };
}
