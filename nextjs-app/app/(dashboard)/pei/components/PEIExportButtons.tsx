"use client";
import React, { useState, useEffect } from "react";
import { Download, FileText, Sparkles, CheckCircle2, XCircle, User, Users, Radar, Puzzle, RotateCw, ClipboardList, Bot, FileDown, Info, BookOpen, CheckCircle, AlertTriangle, TrendingUp, ExternalLink, Send, Pill } from "lucide-react";
import { peiDataToFullText } from "@/lib/pei-export";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { PEIData } from "@/lib/pei";
import { OmniLoader } from "@/components/OmniLoader";

export function PeiExportPdfButton({ peiData }: { peiData: PEIData }) {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/pei/exportar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      /* client-side */ console.error("Erro ao exportar PDF:", err);
      alert(err instanceof Error ? err.message : "Erro ao gerar PDF oficial");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <OmniLoader size={16} />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Baixar PDF Oficial
        </>
      )}
    </button>
  );
}

export function PeiExportPdfOficialButton({ peiData }: { peiData: PEIData }) {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/pei/gerar-pdf-oficial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData, engine: peiData.consultoria_engine || "red" }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar documento oficial");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEI_Oficial_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      /* client-side */ console.error("Erro ao gerar PDF oficial:", err);
      alert(err instanceof Error ? err.message : "Erro ao gerar documento oficial");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <OmniLoader size={16} />
          IA processando...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Gerar Documento Oficial
        </>
      )}
    </button>
  );
}

export function PeiExportDocxButton({ peiData }: { peiData: PEIData }) {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/pei/exportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peiData }),
      });
      if (!res.ok) throw new Error("Erro ao gerar DOCX");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      /* client-side */ console.error("Export PEI DOCX:", e);
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <>
          <OmniLoader size={16} />
          Gerando…
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Baixar DOCX
        </>
      )}
    </button>
  );
}

// Função para formatar texto da consultoria (simples, como no Streamlit)

