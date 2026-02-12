"use client";

import { useEffect } from "react";

export default function MonitoramentoError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[MonitoramentoError]", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
                    <span className="text-3xl">📊</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Erro no Monitoramento
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Ocorreu um erro ao carregar o módulo de monitoramento. Tente recarregar.
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
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-md transition-all"
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
