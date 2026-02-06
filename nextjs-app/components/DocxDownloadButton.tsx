"use client";

type Props = {
  texto: string;
  titulo: string;
  filename: string;
  className?: string;
  children?: React.ReactNode;
};

export function DocxDownloadButton({ texto, titulo, filename, className, children }: Props) {
  async function handleClick() {
    try {
      const res = await fetch("/api/hub/gerar-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, titulo, filename }),
      });
      if (!res.ok) throw new Error("Erro ao gerar DOCX");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("DocxDownload:", e);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className ?? "px-3 py-1.5 text-sm bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"}
    >
      {children ?? "📄 Baixar DOCX"}
    </button>
  );
}
