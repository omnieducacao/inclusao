"use client";
import React, { useState, useEffect } from "react";
import { Brain, Copy, HelpCircle, Plus, Minus, Download, FileText, Sparkles, CheckCircle2, XCircle, User, Users, Radar, Puzzle, RotateCw, ClipboardList, Bot, FileDown, Info, BookOpen, CheckCircle, AlertTriangle, TrendingUp, ExternalLink, Send, Pill } from "lucide-react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import type { EngineId } from "@/lib/ai-engines";
import type { PEIData } from "@/lib/pei";
import { OmniLoader } from "@/components/OmniLoader";

export function InteligenciaDoCaso({
  peiData,
  studentId,
  onResumoLiberado,
}: {
  peiData: PEIData;
  /** onda 5: para liberar o resumo à família */
  studentId?: string | null;
  onResumoLiberado?: (r: { texto: string; liberado_em: string } | null) => void;
}) {
  const liberado = (peiData as Record<string, unknown>).resumo_familia as { texto?: string; liberado_em?: string } | undefined;
  const [liberando, setLiberando] = useState(false);
  const [liberarMsg, setLiberarMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const liberarResumo = async (texto: string | null) => {
    if (!studentId) return;
    setLiberando(true); setLiberarMsg(null);
    try {
      const res = await fetch("/api/pei/resumo-familia/liberar", {
        method: texto ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, texto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não conseguimos salvar agora.");
      onResumoLiberado?.(data.resumo_familia ?? null);
      setLiberarMsg({ tipo: "ok", texto: texto ? "Resumo liberado. A família já pode ler na área dela." : "Resumo recolhido. A família deixou de ver." });
    } catch (e) {
      setLiberarMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Não conseguimos salvar agora." });
    } finally { setLiberando(false); }
  };
  const [engine, setEngine] = useState<EngineId>("red");
  // Mapa Mental
  const [mapaLoading, setMapaLoading] = useState(false);
  const [mapaData, setMapaData] = useState<{ centro: string; ramos: { titulo: string; cor: string; icone?: string; filhos: string[] }[] } | null>(null);
  const [mapaErr, setMapaErr] = useState<string | null>(null);
  // Resumo Família
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoTexto, setResumoTexto] = useState<string | null>(null);
  const [resumoErr, setResumoErr] = useState<string | null>(null);
  // FAQ
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqData, setFaqData] = useState<{ pergunta: string; resposta: string }[] | null>(null);
  const [faqErr, setFaqErr] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const gerarMapa = async () => {
    setMapaLoading(true); setMapaErr(null); setMapaData(null);
    aiLoadingStart("yellow", "pei");
    try {
      const res = await fetch("/api/pei/mapa-mental", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData, engine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setMapaData(data.mapa);
    } catch (e) { setMapaErr(e instanceof Error ? e.message : "Erro"); }
    finally { setMapaLoading(false); aiLoadingStop(); }
  };

  const gerarResumo = async () => {
    setResumoLoading(true); setResumoErr(null); setResumoTexto(null);
    aiLoadingStart(engine || "blue", "pei");
    try {
      const res = await fetch("/api/pei/resumo-familia", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData, engine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResumoTexto(data.texto);
    } catch (e) { setResumoErr(e instanceof Error ? e.message : "Erro"); }
    finally { setResumoLoading(false); aiLoadingStop(); }
  };

  const gerarFaq = async () => {
    setFaqLoading(true); setFaqErr(null); setFaqData(null);
    aiLoadingStart(engine || "blue", "pei");
    try {
      const res = await fetch("/api/pei/faq-caso", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData, engine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setFaqData(data.faqs);
    } catch (e) { setFaqErr(e instanceof Error ? e.message : "Erro"); }
    finally { setFaqLoading(false); aiLoadingStop(); }
  };

  // Onda 18: PDFs e cópia ficam como antes; só saíram do JSX para o layout ficar legível
  const [copiado, setCopiado] = useState<"resumo" | "faq" | null>(null);
  const copiar = (txt: string, qual: "resumo" | "faq") => {
    navigator.clipboard.writeText(txt).then(() => { setCopiado(qual); setTimeout(() => setCopiado(null), 2000); }).catch(() => {});
  };
  const baixarResumoPdf = async (resumo: string) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const safeText = (s: string) => s.replace(/[^\x00-\xFF\n]/g, (ch) => { const n = ch.normalize("NFD").replace(/[̀-ͯ]/g, ""); return n || ""; });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo para Familia", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Estudante: ${safeText(String(peiData.nome || "Estudante"))}  |  ${new Date().toLocaleDateString("pt-BR")}`, 20, 28);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(safeText(resumo), 170);
    let y = 36;
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 5.5;
    }
    doc.save(`Resumo_Familia_${String(peiData.nome || "Estudante").replace(/\s+/g, "_")}.pdf`);
  };
  const baixarFaqPdf = async (faqs: { pergunta: string; resposta: string }[]) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const safeText = (s: string) => s.replace(/[^\x00-\xFF\n]/g, (ch) => { const n = ch.normalize("NFD").replace(/[̀-ͯ]/g, ""); return n || ""; });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FAQ do Caso", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Estudante: ${safeText(String(peiData.nome || "Estudante"))}  |  ${new Date().toLocaleDateString("pt-BR")}`, 20, 28);
    doc.setTextColor(15, 23, 42);
    let y = 38;
    faqs.forEach((f, i) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const q = doc.splitTextToSize(safeText(`${i + 1}. ${f.pergunta}`), 170);
      for (const ql of q) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(ql, 20, y); y += 5.5;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const a = doc.splitTextToSize(safeText(f.resposta), 165);
      for (const al of a) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(al, 25, y); y += 5;
      }
      y += 4;
    });
    doc.save(`FAQ_${String(peiData.nome || "Estudante").replace(/\s+/g, "_")}.pdf`);
  };

  if (!peiData.nome) return null;

  const cartaoAcao: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", textAlign: "left", cursor: "pointer", width: "100%", color: "var(--tinta)" };
  const iconeAcao: React.CSSProperties = { width: 22, height: 22, color: "var(--acao)", flex: "none" };
  const tituloResultado: React.CSSProperties = { margin: 0, display: "flex", alignItems: "center", gap: 8, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" };
  const erroAviso = (titulo: string, msg: string) => (
    <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
      <AlertTriangle className="omni-aviso__icone" aria-hidden />
      <div><div className="omni-aviso__titulo">{titulo}</div><div className="omni-aviso__texto">{msg}</div></div>
    </div>
  );

  return (
    <section style={{ marginTop: 32, display: "grid", gap: 16 }} aria-labelledby="intel-caso-titulo">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h4 id="intel-caso-titulo" style={tituloResultado}>
          <Sparkles aria-hidden style={iconeAcao} /> Inteligência do caso
        </h4>
        <div style={{ width: 192 }}>
          <EngineSelector value={engine} onChange={setEngine} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button type="button" onClick={gerarMapa} disabled={mapaLoading} className="omni-cartao" style={cartaoAcao} aria-busy={mapaLoading}>
          <Brain aria-hidden style={iconeAcao} />
          <span style={{ display: "grid", gap: 2, flex: 1 }}>
            <strong style={{ font: "700 15px/20px var(--font-sans)" }}>Mapa mental</strong>
            <span className="omni-apoio" style={{ fontSize: 13, lineHeight: "18px" }}>{mapaLoading ? "Gerando…" : "O perfil do estudante num mapa"}</span>
          </span>
          {mapaLoading && <OmniLoader engine="yellow" size={16} />}
        </button>

        <button type="button" onClick={gerarResumo} disabled={resumoLoading} className="omni-cartao" style={cartaoAcao} aria-busy={resumoLoading}>
          <Users aria-hidden style={iconeAcao} />
          <span style={{ display: "grid", gap: 2, flex: 1 }}>
            <strong style={{ font: "700 15px/20px var(--font-sans)" }}>Resumo para a família</strong>
            <span className="omni-apoio" style={{ fontSize: 13, lineHeight: "18px" }}>{resumoLoading ? "Preparando…" : "Palavras simples, para a reunião"}</span>
          </span>
          {resumoLoading && <OmniLoader engine="green" size={16} />}
        </button>

        <button type="button" onClick={gerarFaq} disabled={faqLoading} className="omni-cartao" style={cartaoAcao} aria-busy={faqLoading}>
          <HelpCircle aria-hidden style={iconeAcao} />
          <span style={{ display: "grid", gap: 2, flex: 1 }}>
            <strong style={{ font: "700 15px/20px var(--font-sans)" }}>Perguntas sobre o caso</strong>
            <span className="omni-apoio" style={{ fontSize: 13, lineHeight: "18px" }}>{faqLoading ? "Gerando…" : "Perguntas comuns com respostas práticas"}</span>
          </span>
          {faqLoading && <OmniLoader engine="blue" size={16} />}
        </button>
      </div>

      {/* Erros */}
      {mapaErr && erroAviso("Não deu para gerar o mapa mental", mapaErr)}
      {resumoErr && erroAviso("Não deu para gerar o resumo", resumoErr)}
      {faqErr && erroAviso("Não deu para gerar as perguntas", faqErr)}

      {/* ====== RESULTADO: MAPA MENTAL ====== */}
      {mapaData && (
        <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 16 }} aria-labelledby="intel-mapa">
          <h5 id="intel-mapa" style={{ ...tituloResultado, justifyContent: "center", textAlign: "center" }}>
            <Brain aria-hidden style={iconeAcao} /> {mapaData.centro}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mapaData.ramos.map((ramo, i) => (
              <div key={i} className="omni-cartao" style={{ padding: 16, borderLeft: `4px solid ${ramo.cor || "var(--acao)"}`, display: "grid", gap: 8, alignContent: "start" }}>
                <strong style={{ font: "700 15px/20px var(--font-sans)", color: "var(--tinta)" }}>{ramo.titulo}</strong>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                  {ramo.filhos.map((filho, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                      <span aria-hidden style={{ marginTop: 7, width: 6, height: 6, borderRadius: "50%", flex: "none", backgroundColor: ramo.cor || "var(--acao)" }} />
                      {filho}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====== RESULTADO: RESUMO FAMÍLIA ====== */}
      {resumoTexto && (
        <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }} aria-labelledby="intel-resumo">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h5 id="intel-resumo" style={tituloResultado}><Users aria-hidden style={iconeAcao} /> Resumo para a família</h5>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => copiar(resumoTexto, "resumo")} className="omni-btn omni-btn--secundario omni-btn--pequeno">
                <Copy aria-hidden /> {copiado === "resumo" ? "Copiado" : "Copiar"}
              </button>
              <button type="button" onClick={() => baixarResumoPdf(resumoTexto)} className="omni-btn omni-btn--secundario omni-btn--pequeno">
                <Download aria-hidden /> Baixar PDF
              </button>
            </div>
          </div>
          {/* Onda 5: a coordenação revisa e libera; só então a família vê */}
          <label className="omni-campo" style={{ maxWidth: "none" }}>
            <span className="omni-campo__rotulo">Revise o texto antes de liberar</span>
            <textarea
              id="resumo-familia-texto"
              className="omni-entrada"
              style={{ maxWidth: "none", minHeight: 220 }}
              value={resumoTexto}
              onChange={(e) => setResumoTexto(e.target.value)}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <button type="button" className="omni-btn omni-btn--primario" disabled={liberando || !studentId} onClick={() => liberarResumo(resumoTexto)}>
              {liberando ? "Liberando…" : "Liberar para a família"}
            </button>
            {!studentId && <span className="omni-apoio">Salve o estudante antes de liberar.</span>}
          </div>
        </section>
      )}
      {liberado?.texto && !resumoTexto && (
        <div className="omni-aviso omni-aviso--sucesso" style={{ maxWidth: "none" }}>
          <CheckCircle2 className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__titulo">A família vê o resumo liberado em {liberado.liberado_em ? new Date(liberado.liberado_em).toLocaleDateString("pt-BR") : "—"}</div>
            <div className="omni-aviso__texto">Para trocar, gere um novo resumo, revise e libere de novo.</div>
            <div className="omni-aviso__acoes">
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" disabled={liberando} onClick={() => liberarResumo(null)}>Recolher o resumo</button>
            </div>
          </div>
          <span />
        </div>
      )}
      {liberarMsg && (
        <div className={`omni-aviso ${liberarMsg.tipo === "ok" ? "omni-aviso--sucesso" : "omni-aviso--erro"}`} role={liberarMsg.tipo === "erro" ? "alert" : "status"} style={{ maxWidth: "none" }}>
          {liberarMsg.tipo === "ok" ? <CheckCircle2 className="omni-aviso__icone" aria-hidden /> : <AlertTriangle className="omni-aviso__icone" aria-hidden />}
          <div><div className="omni-aviso__titulo">{liberarMsg.texto}</div></div>
          <span />
        </div>
      )}

      {/* ====== RESULTADO: FAQ ====== */}
      {faqData && (
        <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }} aria-labelledby="intel-faq">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h5 id="intel-faq" style={tituloResultado}><HelpCircle aria-hidden style={iconeAcao} /> Perguntas sobre o caso de {peiData.nome}</h5>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => copiar(faqData.map((f, i) => `${i + 1}. ${f.pergunta}\n${f.resposta}`).join("\n\n"), "faq")}
                className="omni-btn omni-btn--secundario omni-btn--pequeno"
              >
                <Copy aria-hidden /> {copiado === "faq" ? "Copiado" : "Copiar"}
              </button>
              <button type="button" onClick={() => baixarFaqPdf(faqData)} className="omni-btn omni-btn--secundario omni-btn--pequeno">
                <Download aria-hidden /> Baixar PDF
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {faqData.map((item, i) => (
              <div key={i} className="omni-cartao" style={{ padding: 0, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  aria-expanded={faqOpen === i}
                  aria-controls={`intel-faq-${i}`}
                  style={{ width: "100%", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, textAlign: "left", background: "transparent", border: 0, cursor: "pointer", font: "600 15px/22px var(--font-sans)", color: "var(--tinta)" }}
                >
                  <span>{item.pergunta}</span>
                  {faqOpen === i
                    ? <Minus aria-hidden style={{ width: 18, height: 18, color: "var(--tinta-3)", flex: "none" }} />
                    : <Plus aria-hidden style={{ width: 18, height: 18, color: "var(--tinta-3)", flex: "none" }} />}
                </button>
                {faqOpen === i && (
                  <div id={`intel-faq-${i}`} style={{ padding: "12px 16px", borderTop: "1px solid var(--borda)", font: "400 15px/24px var(--font-sans)", color: "var(--tinta-2)" }}>
                    {item.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}


