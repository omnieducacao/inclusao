"use client";

import { downloadPdfFromText } from "@/lib/pdf-download";

type Props = {
  text: string;
  filename: string;
  title?: string;
  /** Quando true, aplica formatação inclusiva (OpenDyslexic, 14pt, 1.5x espaçamento, fundo creme). */
  formatoInclusivo?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function PdfDownloadButton({ text, filename, title, formatoInclusivo, className, children }: Props) {
  return (
    <button
      type="button"
      onClick={() => downloadPdfFromText(text, filename, title, { formatoInclusivo })}
      className={className ?? "px-3 py-1.5 text-sm bg-cyan-100 text-cyan-800 rounded-lg hover:bg-cyan-200"}
    >
      {children ?? "📥 Baixar PDF"}
    </button>
  );
}
