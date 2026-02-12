"use client";

import { useEffect } from "react";

export default function PGIError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[PGIError]", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center">
                    <span className="text-3xl">📝</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Erro no PGI
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Ocorreu um erro ao carregar o Plano de Gestão Inclusiva. Tente recarregar.
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
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-md transition-all"
                    >
                        Tentar novamente
                    </button>
                    <a
                        href="/"
                        className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Ir para Home
                    </a>
                </div>
            </div>
        </div>
    );
}
