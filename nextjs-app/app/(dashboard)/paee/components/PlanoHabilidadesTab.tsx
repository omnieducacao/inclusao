"use client";
import { useConfirmar } from "@/components/Confirmar";
import { useState, useEffect } from "react";
import { Trash2, Edit2, CheckCircle2, AlertTriangle, Sparkles, Target } from "lucide-react";
import type { StudentFull } from "../lib/paee-types";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { OmniLoader } from "@/components/OmniLoader";
export function PlanoHabilidadesTab({
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
  const [foco, setFoco] = useState("Funções Executivas");
  const [plano, setPlano] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false); // Flag para evitar sincronização durante geração

  const contextoPei = (peiData.ia_sugestao as string) || "";

  const focosDisponiveis = [
    "Funções Executivas",
    "Autonomia",
    "Coordenação Motora",
    "Comunicação",
    "Habilidades Sociais",
    "Leitura e Escrita",
    "Matemática",
    "Tecnologias Assistivas",
    "Organização e Planejamento",
  ];

  // Carregar estado salvo - sincronizar com paeeData (apenas quando paeeData mudar externamente)
  useEffect(() => {
    // Não sincronizar durante geração (evitar race condition)
    if (isGenerating) {
      return;
    }

    const conteudoSalvo = (paeeData.conteudo_plano_habilidades as string) || "";
    const statusSalvo = (paeeData.status_plano_habilidades as string) || "rascunho";
    const inputSalvo = (paeeData.input_original_plano_habilidades as { foco?: string }) || {};

    // Só atualizar se o conteúdo salvo for diferente E não estiver vazio
    if (conteudoSalvo && conteudoSalvo !== plano) {
      setPlano(conteudoSalvo);
    }

    if (statusSalvo && statusSalvo !== status) {
      setStatus((statusSalvo as typeof status) || "rascunho");
    }

    if (inputSalvo?.foco && inputSalvo.foco !== foco) {
      setFoco(inputSalvo.foco);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paeeData.conteudo_plano_habilidades, paeeData.status_plano_habilidades, paeeData.input_original_plano_habilidades, isGenerating]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    setIsGenerating(true); // Bloquear sincronização durante geração
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/plano-habilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focoTreino: foco,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Não conseguimos gerar o plano (erro ${res.status}). Tente de novo.`);
      }

      const data = await res.json();
      const planoTexto = (data.plano || "").trim();

      if (!planoTexto) {
        throw new Error("O assistente devolveu um plano vazio. Tente de novo.");
      }

      // Atualizar paeeData de forma atômica PRIMEIRO (antes de atualizar estado local)
      const novoPaeeData = {
        ...paeeData,
        conteudo_plano_habilidades: planoTexto,
        status_plano_habilidades: "revisao",
        input_original_plano_habilidades: { foco },
      };

      // Atualizar via onUpdate PRIMEIRO (isso atualiza o estado pai)
      onUpdate(novoPaeeData);

      // Depois atualizar estado local (para garantir sincronização)
      setPlano(planoTexto);
      setStatus("revisao");


    } catch (e) {
      /* client-side */ console.error("Erro ao gerar plano:", e);
      setErro(e instanceof Error ? e.message : "Não conseguimos gerar o plano. Tente de novo.");
    } finally {
      setLoading(false);
      setIsGenerating(false); // Liberar sincronização após geração
      aiLoadingStop();
    }
  };

  const { confirmar, dialogo } = useConfirmar();
  const limpar = async () => {
    const ok = await confirmar({
      titulo: "Descartar o plano de habilidades?",
      texto: "O texto gerado e as observações desta parte serão apagados. Isso não pode ser desfeito.",
      acao: "Descartar",
      cancelar: "Manter",
      perigo: true,
    });
    if (!ok) return;
    setPlano("");
    setStatus("rascunho");
    setFeedback("");
    // uma atualização só (antes eram duas seguidas e a segunda desfazia a primeira)
    onUpdate({ ...paeeData, conteudo_plano_habilidades: "", status_plano_habilidades: "rascunho" });
  };

  return (
    <section className="omni-cartao" aria-labelledby="paee-plano-titulo">
      {dialogo}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Target aria-hidden style={{ width: 22, height: 22, color: "var(--acao)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ display: "grid", gap: 6 }}>
          <h2 id="paee-plano-titulo" className="omni-cartao__titulo" style={{ margin: 0, font: "800 18px/24px var(--font-sans)" }}>Plano de habilidades</h2>
          <p className="omni-cartao__texto" style={{ margin: 0 }}>
            Escolha o foco do atendimento e o assistente cria um plano de intervenção para o AEE, com 3 metas SMART
            (específicas, mensuráveis, alcançáveis, relevantes e com prazo) de curto, médio e longo prazo. O plano traz
            estratégias de ensino, recursos, frequência e critérios de sucesso.
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
            <span className="omni-campo__rotulo">Foco do atendimento</span>
            <select className="omni-entrada" style={{ maxWidth: "none" }} value={foco} onChange={(e) => setFoco(e.target.value)}>
              {focosDisponiveis.map((f: string) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            className="omni-btn omni-btn--primario"
            style={{ justifySelf: "start" }}
            onClick={() => gerar()}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <OmniLoader engine={engine} size={16} />
                Elaborando o plano…
              </>
            ) : (
              <>
                <Target aria-hidden />
                Gerar plano
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
          {!plano || plano.trim() === "" ? (
            <div className="omni-aviso omni-aviso--atencao" role="status">
              <AlertTriangle className="omni-aviso__icone" aria-hidden />
              <div>
                <div className="omni-aviso__texto">
                  O plano foi gerado, mas o texto não chegou. Toque em &ldquo;Descartar e gerar de novo&rdquo;; se acontecer outra vez, avise o suporte.
                </div>
              </div>
              <span />
            </div>
          ) : (
          <div className="omni-resultado">
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Plano de habilidades</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={plano} />
            </div>
          </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--primario"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_plano_habilidades", "aprovado");
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
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Plano de Habilidades - ${student?.name || ""}`}
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
              placeholder="Ex.: mais detalhes sobre estratégias de ensino, recursos mais práticos…"
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
            <div><div className="omni-aviso__titulo">Plano aprovado e pronto para uso.</div></div>
            <span />
          </div>
          <div className="omni-resultado">
            <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Plano de habilidades</h3>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={plano} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--secundario"
              onClick={() => {
                setStatus("revisao");
                updateField("status_plano_habilidades", "revisao");
              }}
            >
              <Edit2 aria-hidden /> Editar de novo
            </button>
            <PdfDownloadButton
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Plano de Habilidades - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
