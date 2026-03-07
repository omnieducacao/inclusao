"use client";

import { useState, useEffect, type ReactNode } from "react";
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
  type HubToolWithHiperfocoProps, type EstruturaBncc, type ChecklistAdaptacao,
} from "../hub-types";

export function AdaptarAtividade({
  student,
  hiperfoco,
  engine,
  onEngineChange,
  onClose,
}: HubToolWithHiperfocoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [temImagemSeparada, setTemImagemSeparada] = useState(false);
  const [imagemSeparadaPreviewUrl, setImagemSeparadaPreviewUrl] = useState<string | null>(null);
  const [imagemSeparadaCropped, setImagemSeparadaCropped] = useState<File | null>(null);
  const [showImagemSeparadaCropper, setShowImagemSeparadaCropper] = useState(false);
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [tema, setTema] = useState("");
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Atividade");
  const [livroProfessor, setLivroProfessor] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [refazendo, setRefazendo] = useState(false);
  const [mapaImagensAdaptar, setMapaImagensAdaptar] = useState<Record<number, string>>({});
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

  const discData = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataRaw = componenteSel && discData?.porUnidade?.[unidadeSel];
  const unidadeData = unidadeDataRaw && typeof unidadeDataRaw === "object" && "objetos" in unidadeDataRaw ? unidadeDataRaw : null;

  const handleFileSelect = (f: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCroppedFile(null);
    setShowCropper(false);
    setFile(f);
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
      setShowCropper(true);
    }
  };

  const handleCropComplete = (blob: Blob, mime: string) => {
    const f = new File([blob], "questao.jpg", { type: mime });
    setCroppedFile(f);
    setShowCropper(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleImagemSeparadaCropComplete = (blob: Blob, mime: string) => {
    try {
      const f = new File([blob], "imagem_separada.jpg", { type: mime });
      // Fechar o cropper primeiro
      setShowImagemSeparadaCropper(false);
      // Limpar preview URL imediatamente
      if (imagemSeparadaPreviewUrl) {
        URL.revokeObjectURL(imagemSeparadaPreviewUrl);
        setImagemSeparadaPreviewUrl(null);
      }
      // Depois atualizar a imagem recortada
      setImagemSeparadaCropped(f);
    } catch (error) {
      console.error("Erro ao processar recorte de imagem separada:", error);
      setShowImagemSeparadaCropper(false);
    }
  };

  const imagemParaEnvio = croppedFile || file;
  // IMPORTANTE: imagemSeparadaParaEnvio deve ser APENAS imagemSeparadaCropped (não imagemSeparadaFile)
  // O fluxo é: questão recortada → imagem da questão recortada
  const imagemSeparadaParaEnvio = imagemSeparadaCropped;

  const gerar = async (usarModoProfundo = false) => {
    if (!imagemParaEnvio) {
      setErro("Selecione uma imagem.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    aiLoadingStart(engine || "green", "hub");
    try {
      const formData = new FormData();
      formData.append("file", imagemParaEnvio);
      if (temImagemSeparada && imagemSeparadaParaEnvio) {
        formData.append("file_separado", imagemSeparadaParaEnvio);
      }
      formData.append(
        "meta",
        JSON.stringify({
          materia: componenteSel || materia,
          tema: tema || undefined,
          tipo,
          livro_professor: livroProfessor,
          checklist,
          modo_profundo: usarModoProfundo || modoProfundo,
          engine,
          unidade_tematica: unidadeSel || undefined,
          objeto_conhecimento: objetoSel || undefined,
          estudante: student ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined } : { hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined },
        })
      );
      const res = await fetch("/api/hub/adaptar-atividade", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        console.error("Erro na API adaptar-atividade:", data);
        throw new Error(data.error || "Erro ao adaptar");
      }

      // Processar imagens se houver imagem separada
      const novoMapa: Record<number, string> = {};
      if (temImagemSeparada && imagemSeparadaParaEnvio) {
        try {
          const reader = new FileReader();
          await new Promise<void>((resolve, reject) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              novoMapa[2] = base64; // IMG_2 para imagem separada
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(imagemSeparadaParaEnvio);
          });
        } catch (err) {
          console.error("Erro ao processar imagem separada:", err);
        }
      }

      // Se houver IMG_1 no texto (imagem principal), processar também
      if (croppedFile && data.texto?.includes("[[IMG_1]]")) {
        try {
          const reader = new FileReader();
          await new Promise<void>((resolve, reject) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              novoMapa[1] = base64;
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(croppedFile);
          });
        } catch (err) {
          console.error("Erro ao processar imagem principal:", err);
        }
      }

      setMapaImagensAdaptar(novoMapa);
      setResultado({ analise: data.analise || "", texto: data.texto || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adaptar.");
    } finally {
      setLoading(false);
      setRefazendo(false);
      aiLoadingStop();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-linear-to-br from-cyan-50 to-white space-y-4 min-h-[200px] shadow-sm border border-slate-200/60">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Atividade (OCR + IA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <p className="text-sm text-slate-600">Tire foto da atividade. A IA extrai o texto e adapta com DUA.</p>
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
                {(discData?.unidades || []).map((u) => (
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
                {(unidadeData && typeof unidadeData === "object" && "objetos" in unidadeData ? unidadeData.objetos : []).map((o) => (
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
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                placeholder="Ex: 5º Ano (EFAI)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Imagem (PNG/JPG) *</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-100 file:text-cyan-800"
        />
        <p className="text-xs text-slate-500 mt-1">Máx. 4MB. Recorte a área da questão para melhor resultado.</p>
        {showCropper && previewUrl && (
          <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
            <ImageCropper
              src={previewUrl}
              caption="Recorte a área da questão ou atividade"
              onCropComplete={handleCropComplete}
            />
            <div className="mt-2 flex gap-4">
              <button type="button" onClick={() => { if (file) { setCroppedFile(file); setShowCropper(false); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }} className="text-sm text-slate-600 hover:text-slate-800">
                Usar imagem inteira
              </button>
              <button type="button" onClick={() => handleFileSelect(null)} className="text-sm text-slate-500 hover:text-slate-700">
                Cancelar
              </button>
            </div>
          </div>
        )}
        {croppedFile && !showCropper && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-emerald-600">✓ Recorte aplicado</span>
            <button type="button" onClick={() => { setCroppedFile(null); if (file) { setPreviewUrl(URL.createObjectURL(file)); setShowCropper(true); } }} className="text-sm text-cyan-600 hover:text-cyan-800">
              Refazer recorte
            </button>
          </div>
        )}
      </div>
      {croppedFile && !showCropper && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={temImagemSeparada}
              disabled={!croppedFile}
              onChange={(e) => {
                if (!croppedFile) {
                  alert("Por favor, primeiro recorte a questão antes de recortar a imagem separada.");
                  return;
                }
                setTemImagemSeparada(e.target.checked);
                if (e.target.checked) {
                  // IMPORTANTE: Usar APENAS a imagem já recortada (croppedFile) para o segundo recorte
                  // O fluxo é: foto completa → recortar questão → recortar imagem da questão recortada
                  if (!imagemSeparadaPreviewUrl && !showImagemSeparadaCropper) {
                    const url = URL.createObjectURL(croppedFile);
                    setImagemSeparadaPreviewUrl(url);
                    setShowImagemSeparadaCropper(true);
                  }
                } else {
                  setImagemSeparadaCropped(null);
                  if (imagemSeparadaPreviewUrl) {
                    URL.revokeObjectURL(imagemSeparadaPreviewUrl);
                    setImagemSeparadaPreviewUrl(null);
                  }
                  setShowImagemSeparadaCropper(false);
                }
              }}
            />
            <span className="text-sm font-medium text-slate-700">
              🖼️ Passo 2: Recortar Imagem (Opcional)
            </span>
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Se a questão tem imagem e você quer recortá-la separadamente para melhor qualidade, marque acima. A imagem da questão recortada será usada para recortar apenas a imagem.
          </p>
          {temImagemSeparada && (
            <div>
              {showImagemSeparadaCropper && imagemSeparadaPreviewUrl && (
                <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-white">
                  <ImageCropper
                    src={imagemSeparadaPreviewUrl}
                    caption="Recorte apenas a área da imagem na questão"
                    onCropComplete={handleImagemSeparadaCropComplete}
                  />
                  <div className="mt-2 flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Usar a imagem da questão recortada (croppedFile) como imagem separada inteira
                        if (croppedFile) {
                          setImagemSeparadaCropped(croppedFile);
                          setShowImagemSeparadaCropper(false);
                          if (imagemSeparadaPreviewUrl) {
                            URL.revokeObjectURL(imagemSeparadaPreviewUrl);
                            setImagemSeparadaPreviewUrl(null);
                          }
                        }
                      }}
                      className="text-sm text-slate-600 hover:text-slate-800"
                    >
                      Usar questão recortada inteira
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTemImagemSeparada(false);
                        setImagemSeparadaCropped(null);
                        if (imagemSeparadaPreviewUrl) {
                          URL.revokeObjectURL(imagemSeparadaPreviewUrl);
                          setImagemSeparadaPreviewUrl(null);
                        }
                        setShowImagemSeparadaCropper(false);
                      }}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {imagemSeparadaCropped && !showImagemSeparadaCropper && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-emerald-600">✓ Imagem separada recortada</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImagemSeparadaCropped(null);
                      // Usar APENAS croppedFile (questão recortada) para refazer o recorte da imagem
                      if (croppedFile) {
                        const url = URL.createObjectURL(croppedFile);
                        setImagemSeparadaPreviewUrl(url);
                        setShowImagemSeparadaCropper(true);
                      }
                    }}
                    className="text-sm text-cyan-600 hover:text-cyan-800"
                  >
                    Refazer recorte
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg">
            <option value="Atividade">Atividade</option>
            <option value="Tarefa">Tarefa</option>
            <option value="Exercício">Exercício</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={modoProfundo} onChange={(e) => setModoProfundo(e.target.checked)} />
          <span className="text-sm">Modo profundo (análise mais detalhada)</span>
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={livroProfessor} onChange={(e) => setLivroProfessor(e.target.checked)} />
        <span className="text-sm">É foto do Livro do Professor? (a IA removerá respostas)</span>
      </label>
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
        disabled={loading || !imagemParaEnvio}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Adaptando…" : "Adaptar atividade"}
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
              <span className="text-base font-semibold text-slate-800">Atividade Adaptada (DUA)</span>
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
                  texto={`${resultado.analise}\n\n---\n\n${resultado.texto}`}
                  titulo="Atividade Adaptada (DUA)"
                  filename={`Atividade_Adaptada_${new Date().toISOString().slice(0, 10)}.docx`}
                  mapaImagens={Object.keys(mapaImagensAdaptar).length > 0 ? mapaImagensAdaptar : undefined}
                  formatoInclusivo={formatoInclusivo}
                />
                <PdfDownloadButton
                  text={`${resultado.analise}\n\n---\n\n${resultado.texto}`}
                  filename={`Atividade_${new Date().toISOString().slice(0, 10)}.pdf`}
                  title="Atividade Adaptada (DUA)"
                  formatoInclusivo={formatoInclusivo}
                />
                <SalvarNoPlanoButton conteudo={`${resultado.analise}\n\n---\n\n${resultado.texto}`} tipo="Atividade Adaptada" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado.texto} mapaImagens={mapaImagensAdaptar} />
          </div>
        </div>
      )}
    </div>
  );
}
