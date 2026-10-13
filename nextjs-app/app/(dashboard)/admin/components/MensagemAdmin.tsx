"use client";

/**
 * Mensagem curta do painel de administração (substitui as caixas nativas do navegador).
 * Uso: const [msg, setMsg] = useState<Mensagem | null>(null);
 *      <MensagemAdmin mensagem={msg} onFechar={() => setMsg(null)} />
 */
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export type Mensagem = { tipo: "sucesso" | "erro" | "info" | "atencao"; texto: string; titulo?: string };

const ICONES = { sucesso: CheckCircle2, erro: XCircle, info: Info, atencao: AlertTriangle };

export function MensagemAdmin({ mensagem, onFechar }: { mensagem: Mensagem | null; onFechar?: () => void }) {
  if (!mensagem) return null;
  const Icone = ICONES[mensagem.tipo];
  return (
    <div
      className={`omni-aviso omni-aviso--${mensagem.tipo}`}
      role={mensagem.tipo === "erro" ? "alert" : "status"}
      style={{ maxWidth: "none" }}
    >
      <Icone className="omni-aviso__icone" aria-hidden />
      <div>
        {mensagem.titulo && <div className="omni-aviso__titulo">{mensagem.titulo}</div>}
        <div className="omni-aviso__texto" style={{ marginTop: mensagem.titulo ? 2 : 0, color: "var(--tinta)" }}>{mensagem.texto}</div>
      </div>
      {onFechar ? (
        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno omni-btn--icone" onClick={onFechar} aria-label="Fechar mensagem">
          <X size={18} aria-hidden />
        </button>
      ) : <span />}
    </div>
  );
}
