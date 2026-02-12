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
                background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)",
            }}
        >
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Algo deu errado
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Ocorreu um erro inesperado ao carregar a página. Tente recarregar.
                    </p>
                    {error?.message && (
                        <p className="mt-2 text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded-lg break-all">
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
                        className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Ir para Login
                    </a>
                </div>
            </div>
        </div>
    );
}
