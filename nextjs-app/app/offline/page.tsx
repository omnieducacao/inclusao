"use client";

/**
 * Onda 22: visual do design system.
 * Saíram o Button do @omni/ds e as cores antigas (hex, rgba, variáveis --bg e --text). Agora usa omni-base,
 * omni-aviso e omni-btn, com texto curto dizendo o que aconteceu e o que fazer.
 */
import React from "react";
import { WifiOff, RotateCw } from "lucide-react";

export default function OfflinePage() {
    return (
        <main
            className="omni-base"
            style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                padding: "var(--space-6) var(--space-4)",
                background: "var(--fundo)",
            }}
        >
            <div className="omni-aviso omni-aviso--atencao" role="status" style={{ width: "100%" }}>
                <WifiOff className="omni-aviso__icone" aria-hidden style={{ width: 22, height: 22 }} />
                <div>
                    <h1 className="omni-aviso__titulo" style={{ margin: 0 }}>Você está sem internet</h1>
                    <p className="omni-aviso__texto" style={{ margin: 0 }}>
                        A Omnisfera precisa de conexão para abrir esta página. O que já foi salvo continua guardado.
                        Confira o Wi-Fi ou os dados móveis e tente de novo.
                    </p>
                    <div className="omni-aviso__acoes">
                        <button
                            type="button"
                            className="omni-btn omni-btn--primario omni-btn--pequeno"
                            onClick={() => window.location.reload()}
                        >
                            <RotateCw aria-hidden /> Tentar de novo
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
