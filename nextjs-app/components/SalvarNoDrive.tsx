"use client";

/**
 * Onda 92 · SCRUM-243: botão "Salvar no Drive" (PEI, PAEE e relatórios).
 * O Supabase continua sendo a fonte, cifrado. Aqui a pessoa entra numa conta Google (da escola ou dela) e
 * salva uma CÓPIA, como Google Doc, na pasta "Omnisfera". O token do Google fica só no navegador.
 * Proteções: aviso na primeira vez, regra da escola (desligado / só o domínio / qualquer) conferida no
 * servidor e registro na auditoria (quem, qual documento e o domínio da conta). Família não vê o botão.
 */
import { useEffect, useState } from "react";
import { CloudUpload, ExternalLink } from "lucide-react";
import { driveConfigurado, emailDaConta, pedirTokenGoogle, prepararGoogle, salvarNoDrive } from "@/lib/google-drive";
import { dominioDoEmail } from "@/lib/drive-politica";

export type RecursoDrive = "pei" | "paee" | "relatorio";
const CHAVE_AVISO = "omnisfera:aviso-drive-v1";

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
  rotulo = "Salvar no Drive",
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
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        className={className ?? "omni-btn omni-btn--secundario omni-btn--pequeno"}
        onClick={clicar}
        disabled={estado.fase === "salvando"}
      >
        <CloudUpload aria-hidden /> {estado.fase === "salvando" ? "Salvando no Drive…" : rotulo}
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
