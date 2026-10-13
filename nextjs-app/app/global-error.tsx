"use client";

/**
 * Onda 22: visual do design system.
 * Esta tela roda sem o layout (o CSS global pode não estar carregado), então os estilos ficam
 * inline, nas variáveis do design system com o valor do tema claro de reserva. Saíram o gradiente,
 * o emoji e as cores antigas; o desenho segue o omni-aviso de erro e o omni-btn.
 */
import { useEffect } from "react";

const FONTE = "var(--font-sans, 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif)";

const BOTAO = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    padding: "8px 16px",
    borderRadius: 10,
    fontFamily: FONTE,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: "20px",
    cursor: "pointer",
    textDecoration: "none",
} as const;

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        /* client-side */ console.error("[GlobalError - Root]", error);
    }, [error]);

    return (
        <html lang="pt-BR">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    padding: "24px 16px",
                    boxSizing: "border-box",
                    background: "var(--fundo, #f6f4f0)",
                    color: "var(--tinta, #1b2a4a)",
                    fontFamily: FONTE,
                    fontSize: 16,
                    lineHeight: "26px",
                }}
            >
                <main
                    role="alert"
                    style={{
                        width: "100%",
                        maxWidth: 560,
                        boxSizing: "border-box",
                        padding: 16,
                        borderRadius: 12,
                        border: "1px solid var(--erro, #b8322f)",
                        background: "var(--erro-suave, #fdeceb)",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                    }}
                >
                    <svg
                        aria-hidden="true"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flex: "none", marginTop: 2, color: "var(--erro, #b8322f)" }}
                    >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 17, lineHeight: "24px", fontWeight: 700 }}>
                            A Omnisfera não conseguiu abrir
                        </h1>
                        <p style={{ margin: "4px 0 0", fontSize: 15, lineHeight: "22px", color: "var(--tinta-2, #3d4a63)" }}>
                            O que já foi salvo continua guardado. Tente de novo; se continuar, avise o suporte.
                        </p>
                        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                            <button
                                type="button"
                                onClick={reset}
                                style={{
                                    ...BOTAO,
                                    border: "1px solid transparent",
                                    background: "var(--acao, #1d5f9f)",
                                    color: "var(--sobre-acao, #ffffff)",
                                }}
                            >
                                Tentar de novo
                            </button>
                            <a
                                href="/login"
                                style={{
                                    ...BOTAO,
                                    border: "1px solid var(--borda-forte, #8c8273)",
                                    background: "var(--superficie, #ffffff)",
                                    color: "var(--tinta, #1b2a4a)",
                                }}
                            >
                                Ir para o login
                            </a>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
