"use client";

import { SalvarNoDrive, type RecursoDrive } from "@/components/SalvarNoDrive";

type Props = {
  texto: string;
  titulo: string;
  filename: string;
  /** Mapa de número da questão -> base64 da imagem. Usado para DOCX com imagens. */
  mapaImagens?: Record<number, string>;
  /** Quando true, aplica formatação inclusiva (OpenDyslexic, 14pt, 1.5x espaçamento). */
  formatoInclusivo?: boolean;
  className?: string;
  children?: React.ReactNode;
  /** Onda 92: mostra também "Salvar no Drive" (PAEE, relatórios). */
  drive?: { recurso: RecursoDrive; recursoId?: string | null };
};

async function gerarDocx({ texto, titulo, filename, mapaImagens, formatoInclusivo }: Props): Promise<Blob> {
  const body: Record<string, unknown> = { texto, titulo, filename };
  if (mapaImagens && Object.keys(mapaImagens).length > 0) {
    const mapa: Record<string, string> = {};
    for (const [k, v] of Object.entries(mapaImagens)) {
      if (v) mapa[k] = v;
    }
    body.mapa_imagens = mapa;
  }
  if (formatoInclusivo) {
    body.formato_inclusivo = true;
  }
  const res = await fetch("/api/hub/gerar-docx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Erro ao gerar DOCX");
  return res.blob();
}

export function DocxDownloadButton(props: Props) {
  const { filename, className, children, drive } = props;

  async function handleClick() {
    try {
      const blob = await gerarDocx(props);
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

  const botao = (
    <button
      type="button"
      onClick={handleClick}
      className={className ?? "omni-btn omni-btn--secundario omni-btn--pequeno"}
    >
      {children ?? "Baixar em Word"}
    </button>
  );
  if (!drive) return botao;
  return (
    <>
      {botao}
      <SalvarNoDrive
        recurso={drive.recurso}
        recursoId={drive.recursoId}
        gerarArquivo={async () => ({ blob: await gerarDocx(props), nome: filename })}
      />
    </>
  );
}
