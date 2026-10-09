"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

// Onda 18: no design system. A mensagem técnica fica só no console, não na tela.
export default function PEIError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        /* client-side */ console.error("[PEIError]", error);
    }, [error]);

    return (
        <div style={{ minHeight: "50vh", display: "grid", placeItems: "center", padding: "24px 16px" }}>
            <div className="omni-aviso omni-aviso--erro" role="alert" style={{ width: "100%" }}>
                <AlertTriangle className="omni-aviso__icone" aria-hidden style={{ width: 22, height: 22 }} />
                <div>
                    <div className="omni-aviso__titulo">Não conseguimos abrir o PEI</div>
                    <div className="omni-aviso__texto">O que já foi salvo continua guardado. Tente de novo.</div>
                    <div className="omni-aviso__acoes">
                        <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={reset}>
                            <RotateCw aria-hidden /> Tentar de novo
                        </button>
                        <Link href="/" className="omni-btn omni-btn--secundario omni-btn--pequeno">
                            Ir para o início
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
