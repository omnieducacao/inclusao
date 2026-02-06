"use client";

import { downloadPdfFromText } from "@/lib/pdf-download";

type Props = {
  text: string;
  filename: string;
  title?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PdfDownloadButton({ text, filename, title, className, children }: Props) {
  return (
    <button
      type="button"
      onClick={() => downloadPdfFromText(text, filename, title)}
      className={className ?? "px-3 py-1.5 text-sm bg-cyan-100 text-cyan-800 rounded-lg hover:bg-cyan-200"}
    >
      {children ?? "📥 Baixar PDF"}
    </button>
  );
}
