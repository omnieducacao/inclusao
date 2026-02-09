"use client";

import { useAILoading } from "@/hooks/useAILoading";
import { useState, useEffect } from "react";
import Image from "next/image";

/* ── Frases rotativas por módulo ── */
const MODULE_PHRASES: Record<string, string[]> = {
    pei: [
        "Analisando barreiras de aprendizagem...",
        "Consultando habilidades BNCC...",
        "Elaborando objetivos individualizados...",
        "Construindo estratégias pedagógicas...",
        "Personalizando o plano educacional...",
        "Alinhando com práticas de DUA...",
    ],
    paee: [
        "Planejando ciclo de atendimento...",
        "Identificando tecnologias assistivas...",
        "Estruturando cronograma SMART...",
        "Elaborando documento de articulação...",
        "Analisando perfil para AEE...",
        "Cruzando dados com objetivos do PEI...",
    ],
    hub: [
        "Adaptando conteúdo com DUA...",
        "Criando material inclusivo...",
        "Personalizando para o perfil do estudante...",
        "Aplicando checklist pedagógico...",
        "Gerando recurso adaptado...",
        "Alinhando com as habilidades BNCC...",
    ],
    diario: [
        "Analisando padrões de engajamento...",
        "Identificando tendências de aprendizagem...",
        "Cruzando dados com objetivos...",
        "Gerando insights pedagógicos...",
        "Avaliando progressão longitudinal...",
        "Elaborando recomendações...",
    ],
    monitoramento: [
        "Consolidando dados do PEI e Diário...",
        "Avaliando rubricas de desenvolvimento...",
        "Analisando evidências de progresso...",
        "Calculando indicadores de evolução...",
    ],
    default: [
        "Processando solicitação...",
        "Analisando contexto pedagógico...",
        "Elaborando resposta educacional...",
        "Gerando conteúdo personalizado...",
        "Consultando base de conhecimento...",
        "Finalizando análise...",
    ],
};

/* ── Cores por motor ── */
const ENGINE_COLORS: Record<string, { gradient: string; name: string }> = {
    red: { gradient: "from-red-500 to-rose-600", name: "OmniRed" },
    blue: { gradient: "from-blue-500 to-cyan-600", name: "OmniBlue" },
    green: { gradient: "from-emerald-500 to-green-600", name: "OmniGreen" },
    yellow: { gradient: "from-amber-400 to-yellow-500", name: "OmniYellow" },
    orange: { gradient: "from-orange-500 to-amber-600", name: "OmniOrange" },
};

export function AILoadingOverlay() {
    const { state } = useAILoading();
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    const phrases = MODULE_PHRASES[state.module] || MODULE_PHRASES.default;
    const engineInfo = ENGINE_COLORS[state.engine] || { gradient: "from-blue-500 to-indigo-600", name: state.engine || "Omnisfera" };

    // Rotate phrases every 4 seconds
    useEffect(() => {
        if (!state.isLoading) return;
        setPhraseIndex(0);
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [state.isLoading, state.module, phrases.length]);

    // Smooth enter/exit
    useEffect(() => {
        if (state.isLoading) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [state.isLoading]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${state.isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
        >
            <div className="flex flex-col items-center gap-6 max-w-lg px-8">
                {/* Logo girando */}
                <div className="relative">
                    {/* Base logo (slow spin) */}
                    <div className="omni-logo-spin opacity-30">
                        <Image
                            src="/omni_icone.png"
                            alt=""
                            width={72}
                            height={72}
                            className="object-contain"
                        />
                    </div>
                    {/* Fast-spinning logo overlay */}
                    <div className="absolute inset-0 omni-logo-spin-fast">
                        <Image
                            src="/omni_icone.png"
                            alt=""
                            width={72}
                            height={72}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Nome do motor */}
                <div className="text-center">
                    <span
                        className={`inline-block text-lg font-bold bg-gradient-to-r ${engineInfo.gradient} bg-clip-text text-transparent`}
                    >
                        {engineInfo.name}
                    </span>
                    <span className="text-white/80 text-lg font-medium"> está trabalhando...</span>
                </div>

                {/* Frase rotativa */}
                <p
                    key={phraseIndex}
                    className="text-white/70 text-sm text-center animate-fade-in min-h-[20px]"
                >
                    {phrases[phraseIndex]}
                </p>

                {/* Estimativa */}
                <p className="text-white/40 text-xs">
                    Isso pode levar até 1-2 minutos
                </p>

                {/* Barra de progresso indeterminada */}
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${engineInfo.gradient} animate-indeterminate-bar`}
                    />
                </div>
            </div>
        </div>
    );
}
