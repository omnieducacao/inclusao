"use client";
import { useConfirmar } from "@/components/Confirmar";
import { useState, useEffect } from "react";
import { Trash2, Edit2, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import type { StudentFull } from "../lib/paee-types";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { OmniLoader } from "@/components/OmniLoader";
export function MapearBarreirasTab({
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
  const [observacoes, setObservacoes] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  const contextoPei = (peiData.ia_sugestao as string) || "";

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_diagnostico_barreiras as string;
    const statusSalvo = paeeData.status_diagnostico_barreiras as string;
    if (conteudoSalvo) {
      setDiagnostico(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!observacoes.trim()) {
      setErro("Descreva suas observações antes de analisar.");
      return;
    }
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/diagnostico-barreiras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observacoes,
          studentId: student?.id,
          studentName: student?.name || "",
          diagnosis,
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não conseguimos mapear as barreiras. Tente de novo.");
      const diagnosticoTexto = (data.diagnostico || "").trim();
      setDiagnostico(diagnosticoTexto);
      setStatus("revisao");

      // Atualização atômica do paeeData (mesmo padrão do PlanoHabilidadesTab)
      const novoPaeeData = {
        ...paeeData,
        conteudo_diagnostico_barreiras: diagnosticoTexto,
        status_diagnostico_barreiras: "revisao",
        input_original_diagnostico_barreiras: feedbackAjuste ? { obs: observacoes } : undefined,
      };
      onUpdate(novoPaeeData);


    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não conseguimos mapear as barreiras. Tente de novo.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const { confirmar, dialogo } = useConfirmar();
  const limpar = async () => {
    const ok = await confirmar({
      titulo: "Descartar o mapeamento de barreiras?",
      texto: "O texto gerado e as observações desta parte serão apagados. Isso não pode ser desfeito.",
      acao: "Descartar",
      cancelar: "Manter",
      perigo: true,
    });
    if (!ok) return;
    setDiagnostico("");
    setStatus("rascunho");
    setObservacoes("");
    setFeedback("");
    // uma atualização só (antes eram duas seguidas e a segunda desfazia a primeira)
    onUpdate({ ...paeeData, conteudo_diagnostico_barreiras: "", status_diagnostico_barreiras: "rascunho" });
  };

  return (
    <section className="omni-cartao" aria-labelledby="paee-barreiras-titulo">
      {dialogo}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <AlertTriangle aria-hidden style={{ width: 22, height: 22, color: "var(--acao)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ display: "grid", gap: 6 }}>
          <h2 id="paee-barreiras-titulo" className="omni-cartao__titulo" style={{ margin: 0, font: "800 18px/24px var(--font-sans)" }}>Barreiras</h2>
          <p className="omni-cartao__texto" style={{ margin: 0 }}>
            Descreva o que você observa e o assistente mapeia as barreiras na aprendizagem. É material de uso interno da equipe e não aparece para o estudante.
            As barreiras são classificadas segundo a LBI (Lei Brasileira de Inclusão) em comunicacionais, metodológicas, atitudinais, tecnológicas e arquitetônicas.
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
            <span className="omni-campo__rotulo">Observações iniciais do AEE</span>
            <textarea
              className="omni-entrada"
              style={{ maxWidth: "none" }}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Exemplo: recusa-se a escrever quando solicitado, com sinais de ansiedade. Nas atividades de escrita, tenta sair da sala ou distrai os colegas. Quando começa, abandona a tarefa após algumas linhas e diz que não sabe fazer."
              rows={6}
            />
          </label>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            className="omni-btn omni-btn--primario"
            style={{ justifySelf: "start" }}
            onClick={() => gerar()}
            disabled={loading || !observacoes.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Analisando as barreiras…
              </>
            ) : (
              <>
                <AlertTriangle aria-hidden />
                Analisar barreiras
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
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Barreiras mapeadas</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={diagnostico} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--primario"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_diagnostico_barreiras", "aprovado");
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
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Diagnóstico de Barreiras - ${student?.name || ""}`}
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
              placeholder="Ex.: mais detalhes sobre barreiras metodológicas, estratégias mais práticas…"
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
            <div><div className="omni-aviso__titulo">Mapeamento aprovado e pronto para uso.</div></div>
            <span />
          </div>
          <div className="omni-resultado">
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Barreiras mapeadas</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={diagnostico} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--secundario"
              onClick={() => {
                setStatus("revisao");
                updateField("status_diagnostico_barreiras", "revisao");
              }}
            >
              <Edit2 aria-hidden /> Editar de novo
            </button>
            <PdfDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
