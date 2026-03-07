"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { ImageCropper } from "@/components/ImageCropper";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { BookOpen } from "lucide-react";
import {
  COMPONENTES,
  type StudentFull, type EngineId, type EstruturaBncc, type ChecklistAdaptacao,
} from "../hub-types";

export function AdaptarProva({
  student,
  hiperfoco,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  hiperfoco: string;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [docxExtraido, setDocxExtraido] = useState<{ texto: string; imagens: { base64: string; contentType: string }[] } | null>(null);
  const [mapaQuestoes, setMapaQuestoes] = useState<Record<number, number>>({});
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [tema, setTema] = useState("");
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Prova");
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [refazendo, setRefazendo] = useState(false);
  const [formatoInclusivo, setFormatoInclusivo] = useState(false);

  const peiData = student?.pei_data || {};
  const serieAluno = student?.grade || "";

  useEffect(() => {
    if (serieAluno) {
      setSerie(serieAluno);
    }
  }, [serieAluno]);

  useEffect(() => {
    if (!serie?.trim()) return;
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || d || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => {
        setComponentes({});
        setEstruturaBncc(null);
      });
  }, [serie]);

  const discDataP = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataPRaw = componenteSel && discDataP?.porUnidade?.[unidadeSel];
  const unidadeDataP = unidadeDataPRaw && typeof unidadeDataPRaw === "object" && "objetos" in unidadeDataPRaw ? unidadeDataPRaw : null;

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
      setMapaQuestoes({});
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao extrair DOCX.");
    } finally {
      setExtracting(false);
    }
  };

  const gerar = async (usarModoProfundo = false) => {
    const texto = docxExtraido?.texto;
    if (!texto && !file) {
      setErro("Selecione um arquivo DOCX.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    aiLoadingStart(engine || "green", "hub");
    try {
      const questoesComImagem = [...new Set(Object.values(mapaQuestoes).filter((q) => q > 0))];
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append(
        "meta",
        JSON.stringify({
          materia: componenteSel || materia,
          tema: tema || undefined,
          tipo,
          checklist,
          engine,
          modo_profundo: usarModoProfundo || modoProfundo,
          unidade_tematica: unidadeSel || undefined,
          objeto_conhecimento: objetoSel || undefined,
          estudante: student ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined } : { hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined },
          texto: texto || undefined,
          questoes_com_imagem: questoesComImagem,
        })
      );
      const res = await fetch("/api/hub/adaptar-prova", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adaptar");
      setResultado({ analise: data.analise || "", texto: data.texto || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adaptar.");
    } finally {
      setLoading(false);
      setRefazendo(false);
      aiLoadingStop();
    }
  };

  // Mapear imagens extraídas do DOCX para as questões adaptadas
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

    // Primeiro, verificar se a IA já inseriu as tags
    const tagsExistentes = questoesComImagem.filter((q) => textoComImagensParaDocx.includes(`[[IMG_${q}]]`));

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
  const temDados = !!docxExtraido?.texto || !!file;

  return (
    <div className="p-6 rounded-2xl bg-linear-to-br from-cyan-50 to-white space-y-4 min-h-[200px] shadow-sm border border-slate-200/60">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Prova (DUA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">Transforme provas padrão em avaliações acessíveis.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select
                value={componenteSel}
                onChange={(e) => {
                  setComponenteSel(e.target.value);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {estruturaBncc?.disciplinas?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select
                value={unidadeSel}
                onChange={(e) => {
                  setUnidadeSel(e.target.value);
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!componenteSel}
              >
                <option value="">Todas</option>
                {(discDataP?.unidades || []).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select
                value={objetoSel}
                onChange={(e) => setObjetoSel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!unidadeSel}
              >
                <option value="">Todos</option>
                {(unidadeDataP && typeof unidadeDataP === "object" && "objetos" in unidadeDataP ? unidadeDataP.objetos : []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      {(!estruturaBncc || !estruturaBncc.disciplinas.length) && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                {(Object.keys(componentes).length ? Object.keys(componentes) : COMPONENTES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tema / Assunto
          <span className="text-xs text-slate-500 ml-2 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: Frações equivalentes (opcional)"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo DOCX *</label>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-100 file:text-cyan-800"
        />
        {extracting && <p className="text-sm text-amber-600 mt-1">Extraindo texto e imagens…</p>}
        {docxExtraido?.imagens?.length ? (
          <p className="text-sm text-emerald-600 mt-1">{docxExtraido.imagens.length} imagem(ns) encontrada(s).</p>
        ) : null}
      </div>
      {docxExtraido?.imagens?.length ? (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">Mapeamento de imagens</summary>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {docxExtraido.imagens.map((img, i) => (
              <div key={i} className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`data:${img.contentType};base64,${img.base64}`} alt="" className="max-w-[80px] max-h-[80px] object-contain border rounded" />
                <label className="text-xs text-slate-600">
                  Pertence à questão:
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={mapaQuestoes[i] ?? 0}
                    onChange={(e) => setMapaQuestoes((m) => ({ ...m, [i]: parseInt(e.target.value, 10) || 0 }))}
                    className="ml-1 w-14 px-2 py-1 border rounded text-sm"
                  />
                </label>
              </div>
            ))}
          </div>
        </details>
      ) : null}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg">
            <option value="Prova">Prova</option>
            <option value="Tarefa">Tarefa</option>
            <option value="Avaliação">Avaliação</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" checked={modoProfundo} onChange={(e) => setModoProfundo(e.target.checked)} />
          <span className="text-sm">Modo profundo (análise mais detalhada)</span>
        </label>
      </div>
      <details className="border border-slate-200 rounded-lg">
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">Checklist de adaptação (PEI)</summary>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            { k: "questoes_desafiadoras", l: "Questões mais desafiadoras" },
            { k: "compreende_instrucoes_complexas", l: "Compreende instruções complexas" },
            { k: "instrucoes_passo_a_passo", l: "Instruções passo a passo" },
            { k: "dividir_em_etapas", l: "Dividir em etapas" },
            { k: "paragrafos_curtos", l: "Parágrafos curtos" },
            { k: "dicas_apoio", l: "Dicas de apoio" },
            { k: "compreende_figuras_linguagem", l: "Compreende figuras de linguagem" },
            { k: "descricao_imagens", l: "Descrição de imagens" },
          ].map(({ k, l }) => (
            <label key={k} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!checklist[k as keyof ChecklistAdaptacao]}
                onChange={(e) => setChecklist((c) => ({ ...c, [k]: e.target.checked }))}
              />
              {l}
            </label>
          ))}
        </div>
      </details>
      <button
        type="button"
        onClick={() => gerar()}
        disabled={loading || !temDados}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Adaptando…" : "Adaptar prova"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ATIVIDADE VALIDADA E PRONTA PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefazendo(true);
                  gerar(true);
                }}
                disabled={refazendo}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm disabled:opacity-50"
              >
                {refazendo ? "Refazendo…" : "🔄 Refazer (+Profundo)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          {resultado.analise && (
            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-xs font-semibold text-slate-600 uppercase mb-3">Análise Pedagógica</div>
              <FormattedTextDisplay texto={resultado.analise} />
            </div>
          )}
          <div className="p-6 rounded-2xl bg-linear-to-br from-slate-50 to-white shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Prova Adaptada (DUA)</span>
              <span className="flex gap-2 items-center">
                <label className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors" title="Exporta com fonte OpenDyslexic, tamanho 14pt, espaçamento 1.5x e fundo creme (PDF)">
                  <input
                    type="checkbox"
                    checked={formatoInclusivo}
                    onChange={(e) => setFormatoInclusivo(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  ♿ Formato Inclusivo
                </label>
                <DocxDownloadButton
                  texto={`${resultado.analise}\n\n---\n\n${textoComImagensParaDocx}`}
                  titulo="Prova Adaptada (DUA)"
                  filename={`Prova_Adaptada_${new Date().toISOString().slice(0, 10)}.docx`}
                  mapaImagens={Object.keys(mapaImagensParaDocx).length > 0 ? mapaImagensParaDocx : undefined}
                  formatoInclusivo={formatoInclusivo}
                />
                <PdfDownloadButton
                  text={`${resultado.analise}\n\n---\n\n${textoComImagensParaDocx}`}
                  filename={`Prova_Adaptada_${new Date().toISOString().slice(0, 10)}.pdf`}
                  title="Prova Adaptada (DUA)"
                  formatoInclusivo={formatoInclusivo}
                />
                <SalvarNoPlanoButton conteudo={`${resultado.analise}\n\n---\n\n${textoComImagensParaDocx}`} tipo="Prova Adaptada" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs" />
              </span>
            </div>
            <FormattedTextDisplay texto={textoComImagensParaDocx} mapaImagens={Object.keys(mapaImagensParaDocx).length > 0 ? mapaImagensParaDocx : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
