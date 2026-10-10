"use client";
import { useConfirmar } from "@/components/Confirmar";
import React, { useState, useEffect } from "react";
import { Trash2, Edit2, FileText, Download, CheckCircle2, AlertTriangle, Sparkles, Loader2, Map, Info } from "lucide-react";
import type { StudentFull } from "../lib/paee-types";
import type { CicloPAEE } from "@/lib/paee";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { gerarPdfJornada } from "@/lib/paee-pdf-export";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { fmtDataIso } from "@/lib/paee";

export function JornadaTab({
  student,
  ciclos,
  cicloAtivo,
  cicloSelecionadoPlanejamento,
  cicloSelecionadoExecucao,
  peiData,
  paeeData,
  onUpdate,
  engine,
  onEngineChange,
}: {
  student: StudentFull;
  ciclos: CicloPAEE[];
  cicloAtivo: CicloPAEE | null | undefined;
  cicloSelecionadoPlanejamento: CicloPAEE | null;
  cicloSelecionadoExecucao: CicloPAEE | null;
  peiData: Record<string, unknown>;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
}) {
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";

  // Opções de origem
  const opcoesOrigem = [
    { value: "ciclo", label: "Execução e metas (ciclo)" },
    { value: "barreiras", label: "Barreiras" },
    { value: "plano-habilidades", label: "Plano de habilidades" },
    { value: "tecnologia-assistiva", label: "Recursos de acessibilidade" },
  ];

  const [origemSelecionada, setOrigemSelecionada] = useState("ciclo");
  const [estilo, setEstilo] = useState("");
  const [texto, setTexto] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "ajustando" | "aprovado">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [mapaMental, setMapaMental] = useState<string | null>(null);
  const [mapaLoading, setMapaLoading] = useState(false);
  const [mapaErro, setMapaErro] = useState<string | null>(null);
  const [usarHiperfocoTema, setUsarHiperfocoTema] = useState(true);
  const [temaMapa, setTemaMapa] = useState(hiperfoco);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);

  // Ciclo de execução para usar na jornada
  const cicloExecucao = cicloSelecionadoExecucao || (cicloAtivo?.tipo === "execucao_smart" ? cicloAtivo : ciclos.find((c: any) => c.tipo === "execucao_smart"));

  // Conteúdos das outras abas - verificar se estão disponíveis
  const conteudoBarreiras = (paeeData.conteudo_diagnostico_barreiras as string) || "";
  const conteudoPlano = (paeeData.conteudo_plano_habilidades as string) || "";
  const conteudoTec = (paeeData.conteudo_tecnologia_assistiva as string) || "";

  // Chave única para esta jornada (por origem)
  const chaveJornada = origemSelecionada === "ciclo"
    ? `ciclo_${cicloExecucao?.ciclo_id || "preview"}`
    : origemSelecionada;

  // Carregar estado salvo
  useEffect(() => {
    const jornadas = (paeeData.jornadas_gamificadas || {}) as Record<string, {
      texto?: string;
      status?: string;
      feedback?: string;
      origem?: string;
      imagem_bytes?: string;
    }>;
    const estado = jornadas[chaveJornada];
    if (estado) {
      setTexto(estado.texto || "");
      setStatus((estado.status as typeof status) || "rascunho");
      setFeedback(estado.feedback || "");
      if (estado.imagem_bytes) {
        setMapaMental(estado.imagem_bytes);
      }
    }
  }, [paeeData, chaveJornada]);

  const updateField = (key: string, value: unknown) => {
    updateFields({ [key]: value });
  };

  const updateFields = (fields: Record<string, unknown>) => {
    const jornadas = (paeeData.jornadas_gamificadas || {}) as Record<string, unknown>;
    jornadas[chaveJornada] = { ...(jornadas[chaveJornada] as Record<string, unknown> || {}), ...fields };
    onUpdate({ ...paeeData, jornadas_gamificadas: jornadas });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const body: Record<string, unknown> = {
        origem: origemSelecionada,
        engine,
        estudante: {
          nome: student.name,
          serie: student.grade,
          hiperfoco,
          ia_sugestao: ((peiData.ia_sugestao as string) || "").slice(0, 1500) || undefined,
        },
      };

      if (estilo.trim()) {
        body.estilo = estilo;
      }

      if (feedbackAjuste || feedback) {
        body.feedback = feedbackAjuste || feedback;
      }

      if (origemSelecionada === "ciclo") {
        if (!cicloExecucao) {
          setErro("Antes, gere ou escolha um ciclo em Atender → Execução e metas.");
          return;
        }
        body.ciclo = cicloExecucao;
      } else {
        let textoFonte = "";
        let nomeFonte = "";
        if (origemSelecionada === "barreiras") {
          textoFonte = conteudoBarreiras;
          nomeFonte = "Barreiras";
        } else if (origemSelecionada === "plano-habilidades") {
          textoFonte = conteudoPlano;
          nomeFonte = "Plano de habilidades";
        } else if (origemSelecionada === "tecnologia-assistiva") {
          textoFonte = conteudoTec;
          nomeFonte = "Recursos de acessibilidade";
        }
        if (!textoFonte || !textoFonte.trim()) {
          /* client-side */ console.error(`Conteúdo não encontrado para ${nomeFonte}:`, {
            origem: origemSelecionada,
            conteudoPlano: conteudoPlano ? `${conteudoPlano.length} chars` : "vazio",
            conteudoBarreiras: conteudoBarreiras ? `${conteudoBarreiras.length} chars` : "vazio",
            conteudoTec: conteudoTec ? `${conteudoTec.length} chars` : "vazio",
          });
          setErro(`Antes, gere e aprove o conteúdo em ${nomeFonte}.`);
          return;
        }

        body.texto_fonte = textoFonte;
        body.nome_fonte = nomeFonte;
      }

      const res = await fetch("/api/paee/jornada-gamificada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não conseguimos gerar a jornada. Tente de novo.");
      setTexto(data.texto || "");
      setStatus("revisao");
      updateFields({ texto: data.texto, status: "revisao", origem: origemSelecionada });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não conseguimos gerar a jornada. Tente de novo.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const { confirmar, dialogo } = useConfirmar();
  const limpar = async () => {
    const ok = await confirmar({
      titulo: "Descartar o roteiro da jornada?",
      texto: "O texto gerado e as observações desta parte serão apagados. Isso não pode ser desfeito.",
      acao: "Descartar",
      cancelar: "Manter",
      perigo: true,
    });
    if (!ok) return;
    setTexto("");
    setStatus("rascunho");
    setFeedback("");
    setMapaMental(null);
    updateFields({ texto: "", status: "rascunho", feedback: "", imagem_bytes: null });
  };

  const gerarMapaMental = async () => {
    setMapaLoading(true);
    setMapaErro(null);
    aiLoadingStart("yellow", "paee");
    try {
      const res = await fetch("/api/paee/mapa-mental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto,
          nome: student.name,
          hiperfoco: usarHiperfocoTema ? temaMapa : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não conseguimos gerar o mapa mental. Tente de novo.");
      setMapaMental(data.image || null);
      updateField("imagem_bytes", data.image);
    } catch (e) {
      setMapaErro(e instanceof Error ? e.message : "Não conseguimos gerar o mapa mental. Tente de novo.");
    } finally {
      setMapaLoading(false);
      aiLoadingStop();
    }
  };

  const downloadCSV = () => {
    const linhas = texto.split("\n").map((l) => l.trim() || "");
    const csvContent = linhas.map((l) => `"${l.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Jornada_${student.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMapaPNG = () => {
    if (!mapaMental) return;

    // Se for base64, converter para blob
    let blob: Blob;
    if (mapaMental.startsWith("data:image")) {
      const base64Data = mapaMental.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: "image/png" });
    } else {
      // Se for URL, fazer fetch
      fetch(mapaMental)
        .then((res) => res.blob())
        .then((b) => {
          const url = URL.createObjectURL(b);
          const a = document.createElement("a");
          a.href = url;
          a.download = `MapaMental_${student.name.replace(/\s+/g, "_")}.png`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          /* client-side */ console.error("Erro ao baixar mapa mental:", err);
          setErroArquivo("Não conseguimos baixar a imagem agora. Tente de novo.");
        });
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MapaMental_${student.name.replace(/\s+/g, "_")}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const baixarPdf = async () => {
    setErroArquivo(null);
    try {
      await gerarPdfJornada(texto, student.name);
    } catch (e) {
      setErroArquivo(e instanceof Error ? e.message : "Não conseguimos gerar o PDF agora. Tente de novo.");
    }
  };

  const tituloSecao: React.CSSProperties = { margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" };

  const avisoErro = (msg: string | null) =>
    msg ? (
      <div className="omni-aviso omni-aviso--erro" role="alert">
        <AlertTriangle className="omni-aviso__icone" aria-hidden />
        <div><div className="omni-aviso__titulo">{msg}</div></div>
        <span />
      </div>
    ) : null;

  const blocoMapaMental = (mostrarExplicacao: boolean) => (
    <div style={{ display: "grid", gap: 12 }}>
      <h4 style={tituloSecao}>Mapa mental do roteiro</h4>
      {mostrarExplicacao && (
        <p className="omni-apoio" style={{ margin: 0 }}>
          Gere um mapa mental a partir do roteiro: tema no centro, depois as missões e as etapas. O mapa não traz informações clínicas.
        </p>
      )}
      <label className="omni-chip" style={{ alignSelf: "flex-start" }}>
        <input
          type="checkbox"
          checked={usarHiperfocoTema}
          onChange={(e) => {
            setUsarHiperfocoTema(e.target.checked);
            if (e.target.checked) setTemaMapa(hiperfoco);
          }}
        />
        Usar o hiperfoco do estudante como tema central do mapa
      </label>
      {usarHiperfocoTema && (
        <label className="omni-campo">
          <span className="omni-campo__rotulo">Tema central do mapa</span>
          <input
            type="text"
            className="omni-entrada"
            style={{ maxWidth: "none" }}
            value={temaMapa}
            onChange={(e) => setTemaMapa(e.target.value)}
            placeholder="Ex.: dinossauros, espaço, música…"
          />
        </label>
      )}
      {mapaMental && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", padding: 8, background: "var(--superficie)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mapaMental} alt="Mapa mental da jornada" style={{ maxWidth: "100%", borderRadius: "var(--o-radius-md)" }} />
          </div>
          <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" style={{ justifySelf: "start" }} onClick={downloadMapaPNG}>
            <Download aria-hidden /> Baixar imagem do mapa
          </button>
        </div>
      )}
      <button
        type="button"
        className="omni-btn omni-btn--secundario"
        style={{ justifySelf: "start" }}
        onClick={gerarMapaMental}
        disabled={mapaLoading || !texto.trim()}
        aria-busy={mapaLoading}
      >
        {mapaLoading ? <Loader2 aria-hidden className="animate-spin" /> : <Map aria-hidden />}
        {mapaLoading ? "Gerando o mapa…" : "Gerar mapa mental do roteiro"}
      </button>
      {avisoErro(mapaErro)}
      {avisoErro(erroArquivo)}
    </div>
  );

  return (
    <section className="omni-cartao" aria-labelledby="paee-jornada-titulo">
      {dialogo}
      <div className="omni-aviso omni-aviso--info" role="status">
        <Info className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__texto">
            As missões que o estudante faz com a família ficam na ficha do estudante, em Missões.
          </div>
          <div className="omni-aviso__acoes">
            <a href={`/estudantes/${student.id}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">
              Abrir a ficha do estudante
            </a>
          </div>
        </div>
        <span />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Map aria-hidden style={{ width: 22, height: 22, color: "var(--acao)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ display: "grid", gap: 6 }}>
          <h2 id="paee-jornada-titulo" className="omni-cartao__titulo" style={{ margin: 0, font: "800 18px/24px var(--font-sans)" }}>Jornada do estudante</h2>
          <p className="omni-cartao__texto" style={{ margin: 0 }}>
            Transforme o planejamento do AEE em uma jornada com missões e conquistas para {student.name} e a família.
            O assistente escreve um roteiro com linguagem de jogo, sem diagnósticos nem informações clínicas.
          </p>
          <p className="omni-apoio" style={{ margin: 0 }}>
            Cada parte do PAEE pode virar uma jornada: escolha a origem abaixo. O material vai para o estudante, por isso não traz dados clínicos.
          </p>
        </div>
      </div>

      {status !== "rascunho" && (
        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ alignSelf: "flex-start" }} onClick={limpar}>
          <Trash2 aria-hidden /> Descartar roteiro
        </button>
      )}

      {status === "rascunho" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <label className="omni-campo">
            <span className="omni-campo__rotulo">Gerar a jornada a partir de</span>
            <select
              className="omni-entrada"
              style={{ maxWidth: "none" }}
              value={origemSelecionada}
              onChange={(e) => setOrigemSelecionada(e.target.value)}
            >
              {opcoesOrigem.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          {origemSelecionada === "ciclo" && cicloExecucao && (
            <div className="omni-cartao omni-cartao--plano" style={{ padding: 16 }}>
              <div className="grid grid-cols-2" style={{ gap: 16 }}>
                <div>
                  <div className="omni-rotulo">Foco do ciclo</div>
                  <div style={{ color: "var(--tinta)" }}>{cicloExecucao.config_ciclo?.foco_principal || "—"}</div>
                </div>
                <div>
                  <div className="omni-rotulo">Período</div>
                  <div style={{ color: "var(--tinta)" }}>
                    {fmtDataIso(cicloExecucao.config_ciclo?.data_inicio)} a {fmtDataIso(cicloExecucao.config_ciclo?.data_fim)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <label className="omni-campo">
            <span className="omni-campo__rotulo">Estilo da jornada <span className="omni-campo__opcional">(opcional)</span></span>
            <input
              type="text"
              className="omni-entrada"
              style={{ maxWidth: "none" }}
              value={estilo}
              onChange={(e) => setEstilo(e.target.value)}
              placeholder="Ex.: super-heróis, exploração, futebol…"
            />
          </label>

          <EngineSelector value={engine} onChange={onEngineChange} />

          <p className="omni-apoio" style={{ margin: 0 }}>
            O assistente transforma o conteúdo escolhido em missões para o estudante e a família. O texto final traz só desafios e conquistas, sem diagnósticos.
          </p>

          <button
            type="button"
            className="omni-btn omni-btn--primario"
            onClick={() => gerar()}
            disabled={loading || (origemSelecionada === "ciclo" && !cicloExecucao)}
            aria-busy={loading}
          >
            {loading ? <Loader2 aria-hidden className="animate-spin" /> : <Sparkles aria-hidden />}
            {loading ? "Criando o roteiro…" : "Criar roteiro da jornada"}
          </button>
          {avisoErro(erro)}
        </div>
      ) : status === "revisao" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="omni-aviso omni-aviso--sucesso" role="status">
            <CheckCircle2 className="omni-aviso__icone" aria-hidden />
            <div><div className="omni-aviso__titulo">Roteiro pronto. Leia e aprove, ou peça ajustes.</div></div>
            <span />
          </div>

          <div className="omni-resultado">
            <h4 style={tituloSecao}>Roteiro (prévia)</h4>
            <div className="omni-resultado__texto">
              <FormattedTextDisplay texto={texto} titulo="" />
            </div>
          </div>

          {blocoMapaMental(true)}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="omni-btn omni-btn--primario"
              onClick={() => {
                setStatus("aprovado");
                updateField("status", "aprovado");
              }}
            >
              <CheckCircle2 aria-hidden /> Aprovar roteiro
            </button>
            <button type="button" className="omni-btn omni-btn--secundario" onClick={() => setStatus("ajustando")}>
              <Edit2 aria-hidden /> Pedir ajustes
            </button>
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="omni-aviso omni-aviso--atencao" role="status">
            <AlertTriangle className="omni-aviso__icone" aria-hidden />
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
              placeholder="Ex.: mais curto, linguagem para crianças menores…"
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
              {loading ? <Loader2 aria-hidden className="animate-spin" /> : <Sparkles aria-hidden />}
              {loading ? "Reescrevendo…" : "Gerar de novo com os ajustes"}
            </button>
            <button
              type="button"
              className="omni-btn omni-btn--discreto"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
            >
              Voltar
            </button>
          </div>
          {avisoErro(erro)}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="omni-aviso omni-aviso--sucesso" role="status">
            <CheckCircle2 className="omni-aviso__icone" aria-hidden />
            <div><div className="omni-aviso__titulo">Roteiro aprovado. Edite se quiser e baixe em PDF ou planilha.</div></div>
            <span />
          </div>

          <label className="omni-campo">
            <span className="omni-campo__rotulo">Edição final <span className="omni-campo__opcional">(opcional)</span></span>
            <textarea
              className="omni-entrada"
              style={{ maxWidth: "none" }}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                updateField("texto", e.target.value);
              }}
              rows={12}
            />
          </label>

          {blocoMapaMental(false)}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="omni-btn omni-btn--primario" onClick={baixarPdf}>
              <FileText aria-hidden /> Baixar PDF da jornada
            </button>
            <button type="button" className="omni-btn omni-btn--secundario" onClick={downloadCSV}>
              <Download aria-hidden /> Baixar planilha (CSV)
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
