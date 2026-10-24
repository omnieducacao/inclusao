"use client";

/**
 * Onda 92 · SCRUM-243: a gestão escolhe onde a equipe pode salvar cópias no Google Drive.
 * desligado: ninguém salva · dominio: só contas do e-mail da escola · qualquer: qualquer conta, com aviso e registro.
 */
import { useEffect, useState } from "react";
import type { PoliticaDrive } from "@/lib/drive-politica";

const OPCOES: Array<{ id: PoliticaDrive; titulo: string; texto: string }> = [
  { id: "qualquer", titulo: "Qualquer conta Google", texto: "Da escola ou pessoal. Mostra um aviso na primeira vez e registra quem salvou." },
  { id: "dominio", titulo: "Só contas da escola", texto: "Aceita apenas e-mails do domínio que você informar." },
  { id: "desligado", titulo: "Desligado", texto: "O botão some. Os documentos ficam só na Omnisfera e no PDF ou Word baixado." },
];

export function RegraDriveEscola({ avisar }: { avisar: (m: { type: "ok" | "err"; text: string }) => void }) {
  const [politica, setPolitica] = useState<PoliticaDrive>("qualquer");
  const [dominio, setDominio] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/drive/politica")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { politica?: PoliticaDrive; dominio?: string } | null) => {
        if (!d) return;
        setPolitica(d.politica ?? "qualquer");
        setDominio(d.dominio ?? "");
      })
      .catch(() => { /* fica no padrão */ });
  }, []);

  async function salvar(nova: PoliticaDrive, novoDominio = dominio) {
    setSalvando(true);
    try {
      const corpo: Record<string, unknown> = { drive_salvar: nova };
      if (nova === "dominio") corpo.drive_dominio = novoDominio;
      const res = await fetch("/api/drive/politica", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { avisar({ type: "err", text: d.error || "Não foi possível salvar." }); return; }
      setPolitica(nova);
      avisar({ type: "ok", text: "Regra do Google Drive salva." });
    } catch {
      avisar({ type: "err", text: "Sem conexão. Tente de novo." });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="omni-campo__rotulo" style={{ marginBottom: 4 }}>Salvar cópias no Google Drive</legend>
      <p className="omni-apoio" style={{ margin: "0 0 8px" }}>
        PEI, PAEE e relatórios continuam guardados na Omnisfera. Aqui você decide se a equipe pode salvar uma cópia no Drive. A família não tem essa opção.
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {OPCOES.map((op) => (
          <label key={op.id} className="omni-tema" style={{ flexDirection: "row", gap: 12, padding: "var(--space-3)" }}>
            <input type="radio" name="drive-escola" value={op.id} checked={politica === op.id} disabled={salvando}
              onChange={() => (op.id === "dominio" && !dominio ? setPolitica("dominio") : salvar(op.id))} />
            <span>
              <span style={{ display: "block", font: "700 15px/20px var(--font-sans)" }}>{op.titulo}</span>
              <span className="omni-apoio" style={{ fontWeight: 400 }}>{op.texto}</span>
            </span>
          </label>
        ))}
      </div>
      {politica === "dominio" && (
        <form
          onSubmit={(e) => { e.preventDefault(); void salvar("dominio", dominio); }}
          style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 8 }}
        >
          <label className="omni-campo" style={{ flex: "1 1 220px" }}>
            <span className="omni-campo__rotulo">Domínio do e-mail da escola</span>
            <input className="omni-entrada" placeholder="escola.com.br" value={dominio} onChange={(e) => setDominio(e.target.value)} disabled={salvando} />
          </label>
          <button type="submit" className="omni-btn omni-btn--secundario omni-btn--pequeno" disabled={salvando || !dominio.trim()}>
            Salvar domínio
          </button>
        </form>
      )}
    </fieldset>
  );
}
