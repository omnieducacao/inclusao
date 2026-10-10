"use client";
import { useConfirmar } from "@/components/Confirmar";
import { useState, useEffect } from "react";
import { Trash2, Edit2, CheckCircle2, AlertTriangle, Sparkles, Users } from "lucide-react";
import type { StudentFull } from "../lib/paee-types";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { OmniLoader } from "@/components/OmniLoader";
export function ArticulacaoTab({
  student,
  peiData,
  diagnosis,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  peiData: Record<string, unknown>;
  diagnosis: string;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [frequencia, setFrequencia] = useState("2x/sem");
  const [turno, setTurno] = useState("Manhã");
  const [acoes, setAcoes] = useState("");
  const [documento, setDocumento] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_documento_articulacao as string;
    const statusSalvo = paeeData.status_documento_articulacao as string;
    const inputSalvo = paeeData.input_original_documento_articulacao as {
      freq?: string;
      turno?: string;
      acoes?: string;
    };
    if (conteudoSalvo) {
      setDocumento(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
    if (inputSalvo) {
      setFrequencia(inputSalvo.freq || "2x/sem");
      setTurno(inputSalvo.turno || "Manhã");
      setAcoes(inputSalvo.acoes || "");
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!acoes.trim()) {
      setErro("Descreva o trabalho feito no AEE.");
      return;
    }
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/documento-articulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frequencia: `${frequencia} (${turno})`,
          acoes,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei: ((peiData.ia_sugestao as string) || "").slice(0, 2000) || undefined,
          diagnosis: diagnosis || undefined,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não conseguimos gerar a carta. Tente de novo.");
      const docTexto = (data.documento || "").trim();

      // Atualização atômica
      const novoPaeeData = {
        ...paeeData,
        conteudo_documento_articulacao: docTexto,
        status_documento_articulacao: "revisao",
        input_original_documento_articulacao: { freq: frequencia, turno, acoes },
      };
      onUpdate(novoPaeeData);
      setDocumento(docTexto);
      setStatus("revisao");

      // Onda 16: quem salva é o onUpdate do PAEE, que mostra "Salvo" ou o aviso de erro
      // (aqui havia um segundo salvamento que, se falhasse, só ia para o console).
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não conseguimos gerar a carta. Tente de novo.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const { confirmar, dialogo } = useConfirmar();
  const limpar = async () => {
    const ok = await confirmar({
      titulo: "Descartar a carta para o professor da sala?",
      texto: "O texto gerado e as observações desta parte serão apagados. Isso não pode ser desfeito.",
      acao: "Descartar",
      cancelar: "Manter",
      perigo: true,
    });
    if (!ok) return;
    setDocumento("");
    setStatus("rascunho");
    setAcoes("");
    setFeedback("");
    // uma atualização só (antes eram duas seguidas e a segunda desfazia a primeira)
    onUpdate({ ...paeeData, conteudo_documento_articulacao: "", status_documento_articulacao: "rascunho" });
  };

  return (
    <section className="omni-cartao" aria-labelledby="paee-articulacao-titulo">
      {dialogo}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Users aria-hidden style={{ width: 22, height: 22, color: "var(--acao)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ display: "grid", gap: 6 }}>
          <h2 id="paee-articulacao-titulo" className="omni-cartao__titulo" style={{ margin: 0, font: "800 18px/24px var(--font-sans)" }}>Com o professor da sala</h2>
          <p className="omni-cartao__texto" style={{ margin: 0 }}>
            O assistente escreve uma carta, formal e acolhedora, que liga o trabalho do AEE à sala de aula comum: habilidades
            desenvolvidas, como levá-las para a sala, orientações práticas, plano de ação conjunto e próximos passos.
          </p>
        </div>
      </div>

      {status !== "rascunho" && status !== "revisao" && (
        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ alignSelf: "flex-start" }} onClick={limpar}>
          <Trash2 aria-hidden /> Descartar
        </button>
      )}

      {status === "rascunho" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Frequência no AEE</span>
              <select className="omni-entrada" style={{ maxWidth: "none" }} value={frequencia} onChange={(e) => setFrequencia(e.target.value)}>
                <option value="1x/sem">1 vez por semana</option>
                <option value="2x/sem">2 vezes por semana</option>
                <option value="3x/sem">3 vezes por semana</option>
                <option value="Diário">Todos os dias</option>
              </select>
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Turno</span>
              <select className="omni-entrada" style={{ maxWidth: "none" }} value={turno} onChange={(e) => setTurno(e.target.value)}>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Integral">Integral</option>
              </select>
            </label>
          </div>
          <label className="omni-campo">
            <span className="omni-campo__rotulo">Trabalho feito no AEE</span>
            <textarea
              className="omni-entrada"
              style={{ maxWidth: "none" }}
              value={acoes}
              onChange={(e) => setAcoes(e.target.value)}
              placeholder="Descreva as principais ações, estratégias e recursos usados no AEE…"
              rows={6}
            />
          </label>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            className="omni-btn omni-btn--primario"
            style={{ justifySelf: "start" }}
            onClick={() => gerar()}
            disabled={loading || !acoes.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Escrevendo a carta…
              </>
            ) : (
              <>
                <Users aria-hidden />
                Gerar carta
              </>
            )}
          </button>
          {erro && (
            <div className="omni-aviso omni-aviso--erro" role="alert">
              <AlertTriangle className="omni-aviso__icone" aria-hidden />
              <div><div className="omni-aviso__titulo">{erro}</div></div>
              <span />
            </div>
          )}
        </div>
      ) : status === "revisao" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="omni-resultado">
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Carta para o professor da sala</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={documento} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--primario"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_documento_articulacao", "aprovado");
              }}
            >
              <CheckCircle2 aria-hidden /> Aprovar
            </button>
            <button type="button" className="omni-btn omni-btn--secundario" onClick={() => setStatus("ajustando")}>
              <Edit2 aria-hidden /> Pedir ajustes
            </button>
            <button type="button" className="omni-btn omni-btn--discreto" onClick={limpar}>
              <Trash2 aria-hidden /> Descartar e gerar de novo
            </button>
            <PdfDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Documento de Articulação - ${student?.name || ""}`}
            />
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="omni-aviso omni-aviso--atencao" role="status">
            <Edit2 className="omni-aviso__icone" aria-hidden />
            <div><div className="omni-aviso__titulo">Conte o que mudar e gere de novo.</div></div>
            <span />
          </div>
          <label className="omni-campo">
            <span className="omni-campo__rotulo">O que ajustar?</span>
            <textarea
              className="omni-entrada"
              style={{ maxWidth: "none" }}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex.: mais detalhes sobre como levar as habilidades para a sala, orientações mais práticas…"
              rows={4}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--primario"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              aria-busy={loading}
            >
              {loading ? <OmniLoader engine={engine} size={16} /> : <Sparkles aria-hidden />}
              {loading ? "Aplicando os ajustes…" : "Gerar de novo com os ajustes"}
            </button>
            <button
              type="button"
              className="omni-btn omni-btn--discreto"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
            >
              Cancelar ajustes
            </button>
          </div>
          {erro && (
            <div className="omni-aviso omni-aviso--erro" role="alert">
              <AlertTriangle className="omni-aviso__icone" aria-hidden />
              <div><div className="omni-aviso__titulo">{erro}</div></div>
              <span />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="omni-aviso omni-aviso--sucesso" role="status">
            <CheckCircle2 className="omni-aviso__icone" aria-hidden />
            <div><div className="omni-aviso__titulo">Carta aprovada e pronta para uso.</div></div>
            <span />
          </div>
          <div className="omni-resultado">
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Carta para o professor da sala</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={documento} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--secundario"
              onClick={() => {
                setStatus("revisao");
                updateField("status_documento_articulacao", "revisao");
              }}
            >
              <Edit2 aria-hidden /> Editar de novo
            </button>
            <PdfDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Documento de Articulação - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
