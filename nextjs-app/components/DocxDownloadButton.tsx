"use client";

type Props = {
  texto: string;
  titulo: string;
  filename: string;
  /** Mapa de número da questão -> base64 da imagem. Usado para DOCX com imagens. */
  mapaImagens?: Record<number, string>;
  className?: string;
  children?: React.ReactNode;
};

export function DocxDownloadButton({ texto, titulo, filename, mapaImagens, className, children }: Props) {
  async function handleClick() {
    try {
      const body: Record<string, unknown> = { texto, titulo, filename };
      if (mapaImagens && Object.keys(mapaImagens).length > 0) {
        const mapa: Record<string, string> = {};
        for (const [k, v] of Object.entries(mapaImagens)) {
          if (v) mapa[k] = v;
        }
        body.mapa_imagens = mapa;
      }
      const res = await fetch("/api/hub/gerar-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
