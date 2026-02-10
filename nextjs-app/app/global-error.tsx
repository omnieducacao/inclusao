"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[GlobalError - Root]", error);
    }, [error]);

    return (
        <html lang="pt-BR">
            <body
                style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)",
                    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
            >
                <div style={{ maxWidth: 420, width: "100%", textAlign: "center", padding: 24 }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            margin: "0 auto 24px",
                            borderRadius: 16,
                            background: "#fef2f2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                        }}
                    >
                        ⚠️
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                        Algo deu errado
                    </h2>
                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
                        Ocorreu um erro inesperado. Recarregue a página ou tente novamente.
                    </p>
                    {error?.message && (
                        <p
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                fontFamily: "monospace",
                                background: "#f8fafc",
                                padding: 8,
                                borderRadius: 8,
                                wordBreak: "break-all",
                                marginBottom: 24,
                            }}
                        >
                            {error.message}
                        </p>
                    )}
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button
                            onClick={reset}
                            style={{
                                padding: "10px 20px",
                                background: "linear-gradient(to right, #3b82f6, #6366f1)",
                                color: "white",
                                border: "none",
                                borderRadius: 12,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            }}
                        >
                            Tentar novamente
                        </button>
                        <a
                            href="/login"
                            style={{
                                padding: "10px 20px",
                                border: "1px solid #e2e8f0",
                                borderRadius: 12,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#475569",
                                textDecoration: "none",
                                background: "white",
                            }}
                        >
                            Ir para Login
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
