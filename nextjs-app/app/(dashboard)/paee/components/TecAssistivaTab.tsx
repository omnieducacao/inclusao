"use client";
import { useConfirmar } from "@/components/Confirmar";
import { useState, useEffect } from "react";
import { Trash2, Edit2, CheckCircle2, AlertTriangle, Sparkles, Puzzle } from "lucide-react";
import type { StudentFull } from "../lib/paee-types";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { OmniLoader } from "@/components/OmniLoader";
export function TecAssistivaTab({
  student,
  peiData,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  peiData: Record<string, unknown>;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [dificuldade, setDificuldade] = useState("");
  const [sugestoes, setSugestoes] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  const contextoPei = (peiData.ia_sugestao as string) || "";

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_tecnologia_assistiva as string;
    const statusSalvo = paeeData.status_tecnologia_assistiva as string;
    const inputSalvo = paeeData.input_original_tecnologia_assistiva as { dificuldade?: string };
    if (conteudoSalvo) {
      setSugestoes(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
    if (inputSalvo?.dificuldade) {
      setDificuldade(inputSalvo.dificuldade);
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!dificuldade.trim()) {
      setErro("Descreva a dificuldade específica.");
      return;
    }
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/tecnologia-assistiva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dificuldade,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não conseguimos sugerir recursos. Tente de novo.");
      const sugestoesTexto = (data.sugestoes || "").trim();
      setSugestoes(sugestoesTexto);
      setStatus("revisao");

      // Atualização atômica do paeeData (mesmo padrão do PlanoHabilidadesTab)
      const novoPaeeData = {
        ...paeeData,
        conteudo_tecnologia_assistiva: sugestoesTexto,
        status_tecnologia_assistiva: "revisao",
        input_original_tecnologia_assistiva: { dificuldade },
      };
      onUpdate(novoPaeeData);


    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não conseguimos sugerir recursos. Tente de novo.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const { confirmar, dialogo } = useConfirmar();
  const limpar = async () => {
    const ok = await confirmar({
      titulo: "Descartar as sugestões de recursos?",
      texto: "O texto gerado e as observações desta parte serão apagados. Isso não pode ser desfeito.",
      acao: "Descartar",
      cancelar: "Manter",
      perigo: true,
    });
    if (!ok) return;
    setSugestoes("");
    setStatus("rascunho");
    setDificuldade("");
    setFeedback("");
    // uma atualização só (antes eram duas seguidas e a segunda desfazia a primeira)
    onUpdate({ ...paeeData, conteudo_tecnologia_assistiva: "", status_tecnologia_assistiva: "rascunho" });
  };

  return (
    <section className="omni-cartao" aria-labelledby="paee-tec-titulo">
      {dialogo}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Puzzle aria-hidden style={{ width: 22, height: 22, color: "var(--acao)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ display: "grid", gap: 6 }}>
          <h2 id="paee-tec-titulo" className="omni-cartao__titulo" style={{ margin: 0, font: "800 18px/24px var(--font-sans)" }}>Recursos de acessibilidade</h2>
          <p className="omni-cartao__texto" style={{ margin: 0 }}>
            Descreva a dificuldade e o assistente sugere recursos de tecnologia assistiva em 3 níveis (baixa, média e alta
            tecnologia) para dar mais autonomia e participação ao estudante. Cada sugestão diz para que serve, como usar na
            prática, os benefícios e onde encontrar.
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
          <label className="omni-campo">
            <span className="omni-campo__rotulo">Dificuldade específica</span>
            <input
              type="text"
              className="omni-entrada"
              style={{ maxWidth: "none" }}
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
              placeholder="Ex.: escrita, comunicação, mobilidade, organização…"
            />
          </label>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            className="omni-btn omni-btn--primario"
            style={{ justifySelf: "start" }}
            onClick={() => gerar()}
            disabled={loading || !dificuldade.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Buscando recursos…
              </>
            ) : (
              <>
                <Puzzle aria-hidden />
                Sugerir recursos
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
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Recursos sugeridos</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={sugestoes} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--primario"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_tecnologia_assistiva", "aprovado");
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
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Tecnologia Assistiva - ${student?.name || ""}`}
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
              placeholder="Ex.: mais recursos de baixa tecnologia, soluções mais práticas…"
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
            <div><div className="omni-aviso__titulo">Sugestões aprovadas e prontas para uso.</div></div>
            <span />
          </div>
          <div className="omni-resultado">
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Recursos sugeridos</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={sugestoes} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--secundario"
              onClick={() => {
                setStatus("revisao");
                updateField("status_tecnologia_assistiva", "revisao");
              }}
            >
              <Edit2 aria-hidden /> Editar de novo
            </button>
            <PdfDownloadButton
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
