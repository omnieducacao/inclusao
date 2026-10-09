"use client";

import { useState } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { ImageCropper } from "@/components/ImageCropper";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar, LinhaEscolha, Pilula, Soltar } from "@/components/ferramenta/Mesa";
import { useBnccDaSerie, EscolhaComponente, EscolhaChecklist, resumoChecklist, EscolhaMotor } from "./escolhas";
import type { StudentFull, EngineId, ChecklistAdaptacao, MesaDaFerramenta } from "../hub-types";

const TIPOS = ["Atividade", "Tarefa", "Exercício"];

export function AdaptarAtividade({
  student, hiperfoco, engine, onEngineChange, mesa,
}: {
  student: StudentFull | null;
  hiperfoco: string;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [temImagemSeparada, setTemImagemSeparada] = useState(false);
  const [imagemSeparadaPreviewUrl, setImagemSeparadaPreviewUrl] = useState<string | null>(null);
  const [imagemSeparadaCropped, setImagemSeparadaCropped] = useState<File | null>(null);
  const [showImagemSeparadaCropper, setShowImagemSeparadaCropper] = useState(false);
  const [componente, setComponente] = useState("");
  const [tema, setTema] = useState("");
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Atividade");
  const [livroProfessor, setLivroProfessor] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [refazendo, setRefazendo] = useState(false);
  const [mapaImagensAdaptar, setMapaImagensAdaptar] = useState<Record<number, string>>({});
  const [formatoInclusivo, setFormatoInclusivo] = useState(false);

  const peiData = student?.pei_data || {};
  const serieAluno = student?.grade || "";
  const { disciplinas } = useBnccDaSerie(serieAluno);

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
      /* client-side */ console.error("Erro ao processar recorte de imagem separada:", error);
      setShowImagemSeparadaCropper(false);
    }
  };

  const imagemParaEnvio = croppedFile || file;
  // IMPORTANTE: imagemSeparadaParaEnvio deve ser APENAS imagemSeparadaCropped (não imagemSeparadaFile)
  // O fluxo é: questão recortada → imagem da questão recortada
  const imagemSeparadaParaEnvio = imagemSeparadaCropped;

  const gerar = async (usarModoProfundo = false) => {
    if (!imagemParaEnvio) {
      setErro("Envie a foto da atividade.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
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
          materia: componente || "Geral",
          tema: tema || undefined,
          tipo,
          livro_professor: livroProfessor,
          checklist,
          modo_profundo: usarModoProfundo || modoProfundo,
          engine,
          student_id: student?.id || undefined,
          estudante: student ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined } : { hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined },
        })
      );
      const res = await fetch("/api/hub/adaptar-atividade", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        /* client-side */ console.error("Erro na API adaptar-atividade:", data);
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
          /* client-side */ console.error("Erro ao processar imagem separada:", err);
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
          /* client-side */ console.error("Erro ao processar imagem principal:", err);
        }
      }

      setMapaImagensAdaptar(novoMapa);
      setResultado({ analise: data.analise || "", texto: data.texto || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para adaptar agora. Tente de novo.");
    } finally {
      setLoading(false);
      setRefazendo(false);
      aiLoadingStop();
    }
  };

  function abrirRecorteDaFigura(ligar: boolean) {
    setTemImagemSeparada(ligar);
    if (ligar && croppedFile) {
      if (!imagemSeparadaPreviewUrl && !showImagemSeparadaCropper) {
        setImagemSeparadaPreviewUrl(URL.createObjectURL(croppedFile));
        setShowImagemSeparadaCropper(true);
      }
    } else {
      setImagemSeparadaCropped(null);
      if (imagemSeparadaPreviewUrl) URL.revokeObjectURL(imagemSeparadaPreviewUrl);
      setImagemSeparadaPreviewUrl(null);
      setShowImagemSeparadaCropper(false);
    }
  }

  const temImagens = Object.keys(mapaImagensAdaptar).length > 0;
  const hoje = new Date().toISOString().slice(0, 10);

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="Foto da atividade" feita={Boolean(imagemParaEnvio) && !showCropper} resumo={croppedFile ? "Recorte pronto" : file ? file.name : ""}>
        {!showCropper && (
          <Soltar
            aceita="image/png,image/jpeg,image/jpg"
            texto="Arraste a foto ou o print do livro, ou clique para escolher"
            dica="PNG ou JPG, até 4 MB. Depois você recorta só a questão."
            arquivos={croppedFile ? ["Recorte aplicado"] : file ? [file.name] : undefined}
            onArquivos={(l) => handleFileSelect(l[0] || null)}
          />
        )}
        {showCropper && previewUrl && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ImageCropper src={previewUrl} caption="Recorte a área da questão ou atividade" onCropComplete={handleCropComplete} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => { if (file) { setCroppedFile(file); setShowCropper(false); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}>Usar a foto inteira</button>
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => handleFileSelect(null)}>Cancelar</button>
            </div>
          </div>
        )}
        {croppedFile && !showCropper && (
          <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ alignSelf: "flex-start" }} onClick={() => { setCroppedFile(null); if (file) { setPreviewUrl(URL.createObjectURL(file)); setShowCropper(true); } }}>Refazer o recorte</button>
        )}
        <label className="omni-caixa" style={{ fontSize: 14 }}>
          <input type="checkbox" checked={livroProfessor} onChange={(e) => setLivroProfessor(e.target.checked)} />
          <span>É do livro do professor <span className="omni-apoio">(a IA tira as respostas em magenta ou azul)</span></span>
        </label>
        {croppedFile && !showCropper && (
          <label className="omni-caixa" style={{ fontSize: 14 }}>
            <input type="checkbox" checked={temImagemSeparada} onChange={(e) => abrirRecorteDaFigura(e.target.checked)} />
            <span>A questão tem uma figura: recortar só a figura <span className="omni-apoio">(sai com mais qualidade)</span></span>
          </label>
        )}
        {temImagemSeparada && showImagemSeparadaCropper && imagemSeparadaPreviewUrl && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ImageCropper src={imagemSeparadaPreviewUrl} caption="Recorte só a figura da questão" onCropComplete={handleImagemSeparadaCropComplete} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => { if (croppedFile) { setImagemSeparadaCropped(croppedFile); setShowImagemSeparadaCropper(false); if (imagemSeparadaPreviewUrl) URL.revokeObjectURL(imagemSeparadaPreviewUrl); setImagemSeparadaPreviewUrl(null); } }}>Usar a questão inteira</button>
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => abrirRecorteDaFigura(false)}>Cancelar</button>
            </div>
          </div>
        )}
        {imagemSeparadaCropped && !showImagemSeparadaCropper && (
          <p className="omni-apoio" style={{ margin: 0 }}>Figura recortada. <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => { setImagemSeparadaCropped(null); if (croppedFile) { setImagemSeparadaPreviewUrl(URL.createObjectURL(croppedFile)); setShowImagemSeparadaCropper(true); } }}>Refazer</button></p>
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
        rotulo: "Adaptar atividade",
        onClick: () => gerar(),
        desabilitado: !imagemParaEnvio || showCropper,
        carregando: loading && !refazendo,
        dica: "A IA lê a foto, mantém o objetivo da atividade e muda a forma.",
      }}
      vazio={{ titulo: "A atividade adaptada aparece aqui", texto: "Tire foto da atividade do livro ou do caderno. A versão adaptada sai com o perfil do estudante, e você revisa antes de imprimir." }}
      resultado={resultado && (
        <ResultadoIA
          titulo="Atividade adaptada"
          material={resultado.texto}
          notas={resultado.analise}
          mapaImagens={temImagens ? mapaImagensAdaptar : undefined}
          onRefazer={() => { setRefazendo(true); gerar(true); }}
          refazendo={refazendo}
          onDescartar={() => setResultado(null)}
          acoes={(texto) => (
            <>
              <label className="omni-apoio flex items-center gap-1.5 cursor-pointer" title="Fonte OpenDyslexic, 14 pt, espaçamento 1,5 e fundo creme">
                <input type="checkbox" checked={formatoInclusivo} onChange={(e) => setFormatoInclusivo(e.target.checked)} />
                Formato para leitura facilitada
              </label>
              <DocxDownloadButton texto={texto} titulo="Atividade adaptada" filename={`Atividade_Adaptada_${hoje}.docx`} mapaImagens={temImagens ? mapaImagensAdaptar : undefined} formatoInclusivo={formatoInclusivo} />
              <PdfDownloadButton text={texto} filename={`Atividade_Adaptada_${hoje}.pdf`} title="Atividade adaptada" formatoInclusivo={formatoInclusivo} />
              <SalvarNoPlanoButton conteudo={texto} tipo="Atividade Adaptada" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}
