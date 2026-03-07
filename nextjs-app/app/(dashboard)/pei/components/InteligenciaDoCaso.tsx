"use client";
import React, { useState, useEffect } from "react";
import { Download, FileText, Sparkles, CheckCircle2, XCircle, User, Users, Radar, Puzzle, RotateCw, ClipboardList, Bot, FileDown, Info, BookOpen, CheckCircle, AlertTriangle, TrendingUp, ExternalLink, Send, Pill } from "lucide-react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import type { EngineId } from "@/lib/ai-engines";
import type { PEIData } from "@/lib/pei";
import { OmniLoader } from "@/components/OmniLoader";

export function InteligenciaDoCaso({ peiData }: { peiData: PEIData }) {
  const [engine, setEngine] = useState<EngineId>("red");
  // Mapa Mental
  const [mapaLoading, setMapaLoading] = useState(false);
  const [mapaData, setMapaData] = useState<{ centro: string; ramos: { titulo: string; cor: string; icone: string; filhos: string[] }[] } | null>(null);
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

  if (!peiData.nome) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h4 className="text-base font-semibold text-slate-800">Inteligência do Caso</h4>
        </div>
        <div className="w-48">
          <EngineSelector value={engine} onChange={setEngine} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Card: Mapa Mental */}
        <button
          type="button"
          onClick={gerarMapa}
          disabled={mapaLoading}
          className="group rounded-xl border-2 border-dashed border-violet-200 hover:border-violet-400 bg-linear-to-r from-violet-50 to-white transition-all hover:shadow-md text-left disabled:opacity-60 px-4 py-3 flex items-center gap-3 h-[70px]"
        >
          <div className="text-2xl">🧠</div>
          <div>
            <h5 className="font-semibold text-xs text-slate-800 group-hover:text-violet-700 transition-colors">Mapa Mental</h5>
            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
              {mapaLoading ? "Gerando..." : "Perfil completo como mapa interativo"}
            </p>
          </div>
          {mapaLoading && <OmniLoader engine="yellow" size={16} />}
        </button>

        {/* Card: Resumo Família */}
        <button
          type="button"
          onClick={gerarResumo}
          disabled={resumoLoading}
          className="group rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-linear-to-r from-emerald-50 to-white transition-all hover:shadow-md text-left disabled:opacity-60 px-4 py-3 flex items-center gap-3 h-[70px]"
        >
          <div className="text-2xl">👨‍👩‍👧</div>
          <div>
            <h5 className="font-semibold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors">Resumo para Família</h5>
            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
              {resumoLoading ? "Preparando..." : "Linguagem sem jargão para reunião"}
            </p>
          </div>
          {resumoLoading && <OmniLoader engine="green" size={16} />}
        </button>

        {/* Card: FAQ */}
        <button
          type="button"
          onClick={gerarFaq}
          disabled={faqLoading}
          className="group rounded-xl border-2 border-dashed border-amber-200 hover:border-amber-400 bg-linear-to-r from-amber-50 to-white transition-all hover:shadow-md text-left disabled:opacity-60 px-4 py-3 flex items-center gap-3 h-[70px]"
        >
          <div className="text-2xl">❓</div>
          <div>
            <h5 className="font-semibold text-xs text-slate-800 group-hover:text-amber-700 transition-colors">FAQ do Caso</h5>
            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
              {faqLoading ? "Gerando..." : "Perguntas frequentes com respostas práticas"}
            </p>
          </div>
          {faqLoading && <OmniLoader engine="blue" size={16} />}
        </button>
      </div>

      {/* Erros */}
      {mapaErr && <p className="text-red-600 text-sm mb-3">❌ Mapa Mental: {mapaErr}</p>}
      {resumoErr && <p className="text-red-600 text-sm mb-3">❌ Resumo: {resumoErr}</p>}
      {faqErr && <p className="text-red-600 text-sm mb-3">❌ FAQ: {faqErr}</p>}

      {/* ====== RESULTADO: MAPA MENTAL ====== */}
      {mapaData && (
        <div className="mb-6 p-6 rounded-2xl bg-linear-to-br from-violet-50 to-slate-50 border border-violet-200">
          <h5 className="font-bold text-violet-800 text-lg mb-6 text-center">🧠 {mapaData.centro}</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mapaData.ramos.map((ramo, i) => (
              <div
                key={i}
                className="rounded-xl p-4 bg-white shadow-sm transition-all hover:shadow-md"
                style={{ borderLeft: `4px solid ${ramo.cor}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{ramo.icone}</span>
                  <span className="font-semibold text-sm" style={{ color: ramo.cor }}>{ramo.titulo}</span>
                </div>
                <ul className="space-y-1.5">
                  {ramo.filhos.map((filho, j) => (
                    <li key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ramo.cor }} />
                      {filho}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== RESULTADO: RESUMO FAMÍLIA ====== */}
      {resumoTexto && (
        <div className="mb-6 p-6 rounded-2xl bg-linear-to-br from-emerald-50 to-slate-50 border border-emerald-200">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-emerald-800 text-lg">👨‍👩‍👧 Resumo para Família</h5>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(resumoTexto)}
                className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                📋 Copiar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { jsPDF } = await import("jspdf");
                  const doc = new jsPDF({ unit: "mm", format: "a4" });
                  const safeText = (s: string) => s.replace(/[^\x00-\xFF\n]/g, (ch) => { const n = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); return n || ""; });
                  doc.setFontSize(14);
                  doc.setFont("helvetica", "bold");
                  doc.text("Resumo para Familia", 20, 20);
                  doc.setFontSize(10);
                  doc.setFont("helvetica", "normal");
                  doc.setTextColor(100, 116, 139);
                  doc.text(`Estudante: ${safeText(String(peiData.nome || "Estudante"))}  |  ${new Date().toLocaleDateString("pt-BR")}`, 20, 28);
                  doc.setTextColor(15, 23, 42);
                  doc.setFontSize(11);
                  const lines = doc.splitTextToSize(safeText(resumoTexto), 170);
                  let y = 36;
                  for (const line of lines) {
                    if (y > 275) { doc.addPage(); y = 20; }
                    doc.text(line, 20, y);
                    y += 5.5;
                  }
                  doc.save(`Resumo_Familia_${String(peiData.nome || "Estudante").replace(/\s+/g, "_")}.pdf`);
                }}
                className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                📥 Baixar PDF
              </button>
            </div>
          </div>
          <div className="prose prose-sm prose-emerald max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {resumoTexto}
          </div>
        </div>
      )}

      {/* ====== RESULTADO: FAQ ====== */}
      {faqData && (
        <div className="mb-6 p-6 rounded-2xl bg-linear-to-br from-amber-50 to-slate-50 border border-amber-200">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-bold text-amber-800 text-lg">❓ FAQ do Caso — {peiData.nome}</h5>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const txt = faqData.map((f, i) => `${i + 1}. ${f.pergunta}\n${f.resposta}`).join("\n\n");
                  navigator.clipboard.writeText(txt);
                }}
                className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
              >
                📋 Copiar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { jsPDF } = await import("jspdf");
                  const doc = new jsPDF({ unit: "mm", format: "a4" });
                  const safeText = (s: string) => s.replace(/[^\x00-\xFF\n]/g, (ch) => { const n = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); return n || ""; });
                  doc.setFontSize(14);
                  doc.setFont("helvetica", "bold");
                  doc.text("FAQ do Caso", 20, 20);
                  doc.setFontSize(10);
                  doc.setFont("helvetica", "normal");
                  doc.setTextColor(100, 116, 139);
                  doc.text(`Estudante: ${safeText(String(peiData.nome || "Estudante"))}  |  ${new Date().toLocaleDateString("pt-BR")}`, 20, 28);
                  doc.setTextColor(15, 23, 42);
                  let y = 38;
                  faqData.forEach((f, i) => {
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
                }}
                className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                📥 Baixar PDF
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {faqData.map((item, i) => (
              <div key={i} className="rounded-xl bg-white border border-amber-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-amber-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-800">{item.pergunta}</span>
                  <span className="text-slate-400 text-lg ml-2 shrink-0">{faqOpen === i ? "−" : "+"}</span>
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-3 text-sm text-slate-600 leading-relaxed border-t border-amber-100 pt-3">
                    {item.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


