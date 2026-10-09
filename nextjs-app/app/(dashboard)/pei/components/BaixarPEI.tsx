"use client";

/**
 * Menu "Baixar" do PEI (onda 7). Antes eram cinco botões soltos no Dashboard
 * ("PDF Dados", "PDF Oficial (IA)", "Word", "JSON", "Atualizar PEI"), cada um com outro visual.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import type { PEIData } from "@/lib/pei";

type Formato = "pdf" | "oficial" | "docx" | "json";

const OPCOES: Array<{ id: Formato; nome: string; ajuda: string }> = [
  { id: "oficial", nome: "PEI oficial (PDF)", ajuda: "O documento para assinar e arquivar" },
  { id: "docx", nome: "PEI em Word", ajuda: "Para editar fora da Omnisfera" },
  { id: "pdf", nome: "Dados do PEI (PDF)", ajuda: "Todos os campos preenchidos" },
  { id: "json", nome: "Cópia de segurança (JSON)", ajuda: "Arquivo para guardar ou restaurar" },
];

function nomeArquivo(peiData: PEIData, ext: string) {
  return `PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}.${ext}`;
}

function baixarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export function BaixarPEI({ peiData }: { peiData: PEIData }) {
  const [aberto, setAberto] = useState(false);
  const [gerando, setGerando] = useState<Formato | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const caixa = useRef<HTMLDivElement | null>(null);
  const botao = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setAberto(false); botao.current?.focus(); } };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    caixa.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => { document.removeEventListener("mousedown", fora); document.removeEventListener("keydown", esc); };
  }, [aberto]);

  async function baixar(f: Formato) {
    setAberto(false); setErro(null); setGerando(f);
    try {
      if (f === "json") {
        baixarBlob(new Blob([JSON.stringify(peiData, null, 2)], { type: "application/json" }), nomeArquivo(peiData, "json"));
        return;
      }
      const rota = f === "oficial" ? "/api/pei/gerar-pdf-oficial" : f === "docx" ? "/api/pei/exportar" : "/api/pei/exportar-pdf";
      const corpo = f === "oficial" ? { peiData, engine: peiData.consultoria_engine || "red" } : { peiData };
      const res = await fetch(rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Não foi possível gerar o arquivo.");
      baixarBlob(await res.blob(), nomeArquivo(peiData, f === "docx" ? "docx" : "pdf"));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar o arquivo.");
    } finally {
      setGerando(null);
    }
  }

  return (
    <div ref={caixa} style={{ position: "relative" }}>
      <button
        ref={botao}
        type="button"
        className="omni-btn omni-btn--secundario omni-btn--pequeno"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        disabled={gerando !== null}
      >
        <Download aria-hidden /> {gerando ? "Gerando…" : "Baixar"} <ChevronDown aria-hidden />
      </button>
      {aberto && (
        <div role="menu" aria-label="Baixar o PEI" className="omni-menu-baixar"
          style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 40, minWidth: 280, padding: 6, background: "var(--superficie)", border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", boxShadow: "var(--sombra-2, 0 8px 24px rgb(0 0 0 / .12))" }}>
          {OPCOES.map((o) => (
            <button key={o.id} type="button" role="menuitem" onClick={() => baixar(o.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, background: "none", border: 0, cursor: "pointer", color: "var(--tinta)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--superficie-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ font: "700 15px/20px var(--font-sans)" }}>{o.nome}</span>
              <span style={{ font: "400 13px/18px var(--font-sans)", color: "var(--tinta-2)" }}>{o.ajuda}</span>
            </button>
          ))}
        </div>
      )}
      {erro && <p role="alert" className="omni-campo__erro" style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: 260 }}>{erro}</p>}
    </div>
  );
}
