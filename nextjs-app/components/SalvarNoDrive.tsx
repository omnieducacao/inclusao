"use client";

/**
 * Onda 92 · SCRUM-243: botão "Salvar no Drive" (PEI, PAEE e relatórios).
 * O Supabase continua sendo a fonte, cifrado. Aqui a pessoa entra numa conta Google (da escola ou dela) e
 * salva uma CÓPIA, como Google Doc, na pasta "Omnisfera". O token do Google fica só no navegador.
 * Proteções: aviso na primeira vez, regra da escola (desligado / só o domínio / qualquer) conferida no
 * servidor e registro na auditoria (quem, qual documento e o domínio da conta). Família não vê o botão.
 */
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { driveConfigurado, emailDaConta, pedirTokenGoogle, prepararGoogle, salvarNoDrive } from "@/lib/google-drive";
import { dominioDoEmail } from "@/lib/drive-politica";

export type RecursoDrive = "pei" | "paee" | "relatorio";
const CHAVE_AVISO = "omnisfera:aviso-drive-v1";

/** Logo do Google Drive (marca do Google, usada para indicar a integração). */
function LogoDrive() {
  return (
    <svg viewBox="0 0 87.3 78" width="18" height="16" aria-hidden="true" focusable="false">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

function avisoJaVisto(): boolean {
  try { return localStorage.getItem(CHAVE_AVISO) === "1"; } catch { return false; }
}
function marcarAviso() {
  try { localStorage.setItem(CHAVE_AVISO, "1"); } catch { /* sem armazenamento: mostra de novo na próxima */ }
}

type Estado =
  | { fase: "parado" }
  | { fase: "aviso" }
  | { fase: "salvando" }
  | { fase: "pronto"; link: string }
  | { fase: "erro"; msg: string };

export function SalvarNoDrive({
  gerarArquivo,
  recurso,
  recursoId,
  rotulo = "Salvar no Google Drive",
  className,
}: {
  /** Gera o Word (.docx) do documento. */
  gerarArquivo: () => Promise<{ blob: Blob; nome: string }>;
  recurso: RecursoDrive;
  recursoId?: string | null;
  rotulo?: string;
  className?: string;
}) {
  const [liberado, setLiberado] = useState(false);
  const [estado, setEstado] = useState<Estado>({ fase: "parado" });

  useEffect(() => {
    if (!driveConfigurado()) return;
    let vivo = true;
    fetch("/api/drive/politica")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { politica?: string } | null) => {
        if (vivo && d && d.politica !== "desligado") { setLiberado(true); prepararGoogle(); }
      })
      .catch(() => { /* sem regra, sem botão */ });
    return () => { vivo = false; };
  }, []);

  if (!liberado) return null;

  async function salvar() {
    setEstado({ fase: "salvando" });
    try {
      const token = await pedirTokenGoogle(); // primeiro, para a janela do Google abrir colada no clique
      const dominioConta = dominioDoEmail(await emailDaConta(token));
      const reg = await fetch("/api/drive/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso, recursoId: recursoId ?? undefined, dominioConta }),
      });
      const resposta = (await reg.json().catch(() => ({}))) as { ok?: boolean; motivo?: string; error?: string };
      if (!reg.ok || !resposta.ok) throw new Error(resposta.motivo || resposta.error || "A escola não permitiu salvar nesta conta.");
      const { blob, nome } = await gerarArquivo();
      const link = await salvarNoDrive(blob, nome, token);
      setEstado({ fase: "pronto", link });
    } catch (e) {
      setEstado({ fase: "erro", msg: e instanceof Error ? e.message : "Não foi possível salvar no Google Drive." });
    }
  }

  function clicar() {
    if (avisoJaVisto()) void salvar();
    else setEstado({ fase: "aviso" });
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
      <button
        type="button"
        className={className ?? "omni-btn omni-btn--secundario omni-btn--pequeno"}
        onClick={clicar}
        disabled={estado.fase === "salvando"}
      >
        <LogoDrive /> {estado.fase === "salvando" ? "Salvando no Google Drive…" : rotulo}
      </button>
      {estado.fase === "aviso" && (
        <div className="omni-aviso omni-aviso--atencao" role="alertdialog" aria-label="Antes de salvar no Drive" style={{ maxWidth: 360 }}>
          <div>
            <div className="omni-aviso__titulo">Este documento tem dados de saúde do estudante.</div>
            <p style={{ margin: "4px 0 10px" }}>Salve só numa conta que a escola autorizou. A cópia fica na pasta &quot;Omnisfera&quot; do Drive, e o salvamento fica registrado.</p>
            <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={() => { marcarAviso(); void salvar(); }}>
                Entendi, salvar
              </button>
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setEstado({ fase: "parado" })}>
                Cancelar
              </button>
            </span>
          </div>
        </div>
      )}
      {estado.fase === "pronto" && (
        <a href={estado.link} target="_blank" rel="noopener noreferrer" role="status" style={{ font: "400 13px/18px var(--font-sans)" }}>
          Salvo no Drive. Abrir <ExternalLink aria-hidden style={{ width: 12, height: 12, verticalAlign: "-1px" }} />
        </a>
      )}
      {estado.fase === "erro" && <span role="alert" className="omni-campo__erro">{estado.msg}</span>}
    </span>
  );
}
