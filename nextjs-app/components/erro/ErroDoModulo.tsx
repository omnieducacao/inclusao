"use client";

/** Onda 19: uma tela de erro só, no design system, para todos os módulos. A mensagem técnica fica no console. */
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

export function ErroDoModulo({ modulo, error, reset }: { modulo: string; error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    /* client-side */ console.error(`[Erro em ${modulo}]`, error);
  }, [error, modulo]);
  return (
    <div style={{ minHeight: "50vh", display: "grid", placeItems: "center", padding: "24px 16px" }}>
      <div className="omni-aviso omni-aviso--erro" role="alert" style={{ width: "100%" }}>
        <AlertTriangle className="omni-aviso__icone" aria-hidden style={{ width: 22, height: 22 }} />
        <div>
          <div className="omni-aviso__titulo">Não conseguimos abrir {modulo}</div>
          <div className="omni-aviso__texto">O que já foi salvo continua guardado. Tente de novo; se continuar, avise o suporte.</div>
          <div className="omni-aviso__acoes">
            <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={reset}><RotateCw aria-hidden /> Tentar de novo</button>
            <Link href="/" className="omni-btn omni-btn--secundario omni-btn--pequeno">Ir para o início</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
