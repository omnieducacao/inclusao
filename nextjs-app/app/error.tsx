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
        console.error("[GlobalError]", error);
    }, [error]);

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{
                background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 50%, var(--bg-primary) 100%)",
            }}
        >
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <span className="text-3xl">⚠️</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Algo deu errado
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Ocorreu um erro inesperado ao carregar a página. Tente recarregar.
                    </p>
                    {error?.message && (
                        <p className="mt-2 text-xs font-mono p-2 rounded-lg break-all" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}>
                            {error.message}
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all"
                    >
                        Tentar novamente
                    </button>
                    <a
                        href="/login"
                        className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
                        style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                    >
                        Ir para Login
                    </a>
                </div>
            </div>
        </div>
    );
}
