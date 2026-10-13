"use client";

/**
 * Onda 22: visual do design system.
 * Saíram o gradiente, o emoji e as cores antigas (variáveis --bg e --text, Tailwind). Agora segue o
 * ErroDoModulo: omni-aviso de erro com omni-btn. A mensagem técnica fica só no console.
 */
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        /* client-side */ console.error("[GlobalError]", error);
    }, [error]);

    return (
        <main
            className="omni-base"
            style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--space-6) var(--space-4)", background: "var(--fundo)" }}
        >
            <div className="omni-aviso omni-aviso--erro" role="alert" style={{ width: "100%" }}>
                <AlertTriangle className="omni-aviso__icone" aria-hidden style={{ width: 22, height: 22 }} />
                <div>
                    <h1 className="omni-aviso__titulo" style={{ margin: 0 }}>Não conseguimos abrir esta página</h1>
                    <p className="omni-aviso__texto" style={{ margin: 0 }}>
                        O que já foi salvo continua guardado. Tente de novo; se continuar, avise o suporte.
                    </p>
                    <div className="omni-aviso__acoes">
                        <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={reset}>
                            <RotateCw aria-hidden /> Tentar de novo
                        </button>
                        <a href="/login" className="omni-btn omni-btn--secundario omni-btn--pequeno">Ir para o login</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
