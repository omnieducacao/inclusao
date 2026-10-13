"use client";

import React, { useState, useEffect } from "react";
import type { EngineId } from "@/lib/ai-engines";

// ─── Engine Metadata ──────────────────────────────────────────────────────────

// Onda 20: cores do símbolo Encontro (variáveis do design system) no lugar de hex fixos.
// As transparências usam color-mix, que aceita variáveis CSS.
const ENGINE_META: Record<string, { label: string; color: string; glow: string; forte: string }> = {
    red: { label: "OmniRed", color: "var(--encontro-vermelho)", glow: "color-mix(in srgb, var(--encontro-vermelho) 25%, transparent)", forte: "var(--encontro-vermelho-forte)" },
    blue: { label: "OmniBlue", color: "var(--encontro-azul)", glow: "color-mix(in srgb, var(--encontro-azul) 25%, transparent)", forte: "var(--encontro-azul-forte)" },
    green: { label: "OmniGreen", color: "var(--encontro-verde)", glow: "color-mix(in srgb, var(--encontro-verde) 25%, transparent)", forte: "var(--encontro-verde-forte)" },
    orange: { label: "OmniOrange", color: "var(--encontro-laranja)", glow: "color-mix(in srgb, var(--encontro-laranja) 25%, transparent)", forte: "var(--encontro-laranja-forte)" },
    yellow: { label: "OmniYellow", color: "var(--encontro-amarelo)", glow: "color-mix(in srgb, var(--encontro-amarelo) 25%, transparent)", forte: "var(--encontro-amarelo-forte)" },
    default: { label: "Omnisfera", color: "var(--tinta-3)", glow: "color-mix(in srgb, var(--tinta-3) 20%, transparent)", forte: "var(--tinta-2)" },
};

/** Cor com transparência (pct de 0 a 100), funciona com variáveis CSS */
const tom = (cor: string, pct: number) => `color-mix(in srgb, ${cor} ${pct}%, transparent)`;

// ─── Contextual Messages ──────────────────────────────────────────────────────

const DEFAULT_MESSAGES = [
    "Analisando o perfil pedagógico...",
    "Calibrando ao nível do estudante...",
    "Gerando adaptações individualizadas...",
    "Estruturando o documento...",
    "Verificando alinhamento com BNCC...",
];

const LOADING_MESSAGES = [
    "Carregando dados...",
    "Preparando informações...",
    "Organizando conteúdo...",
];

const MODULE_MESSAGES: Record<string, string[]> = {
    diagnostica: [
        "Criando questões...",
        "Analisando habilidades selecionadas...",
        "Calibrando questões ao nível Omnisfera...",
        "Gerando itens com distratores pedagógicos...",
        "Ajustando complexidade cognitiva...",
        "Finalizando a avaliação adaptada...",
    ],
    processual: [
        "Cruzando dados com avaliação anterior...",
        "Calculando evolução por habilidade...",
        "Gerando relatório de progresso...",
        "Identificando padrões de aprendizagem...",
    ],
    pei: [
        "Analisando barreiras e potencialidades...",
        "Gerando estratégias de acesso e ensino...",
        "Construindo o documento técnico...",
        "Alinhando com legislação inclusiva...",
        "Finalizando o PEI individualizado...",
    ],
    pei_regente: [
        "Cruzando PEI com plano de ensino...",
        "Gerando adaptações para sua disciplina...",
        "Construindo a Ponte Pedagógica...",
        "Alinhando objetivos individualizados...",
    ],
    hub: [
        "Criando atividade personalizada...",
        "Adaptando ao perfil do estudante...",
        "Gerando materiais pedagógicos...",
    ],
    hub_questoes: [
        "Criando questões...",
        "Selecionando habilidades BNCC...",
        "Gerando itens e distratores...",
        "Adaptando ao perfil do estudante...",
    ],
    plano_curso: [
        "Analisando habilidades BNCC...",
        "Gerando objetivos e metodologias...",
        "Sugerindo recursos e avaliações...",
    ],
    paee: [
        "Montando plano de atendimento...",
        "Gerando atividades especializadas...",
        "Estruturando o ciclo de atendimento...",
    ],
};

// ─── Global CSS injection (once, client-only) ────────────────────────────────

let stylesInjected = false;
function ensureStyles() {
    if (stylesInjected || typeof document === "undefined") return;
    stylesInjected = true;
    const style = document.createElement("style");
    style.textContent = `
        @keyframes omniSpin { to { transform: rotate(360deg); } }
        @keyframes omniPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes omniOrbit { to { transform: rotate(360deg); } }
        @keyframes omniFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
}

// ─── Spinner SVG (pure, no hooks) ─────────────────────────────────────────────

function OmniSpinner({ color, size }: { color: string; size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
            style={{ animation: "omniSpin 1.2s linear infinite", flexShrink: 0 }}
        >
            <circle cx="20" cy="20" r="17" style={{ stroke: tom(color, 15) }} strokeWidth="3" />
            <circle
                cx="20" cy="20" r="17"
                style={{ stroke: color }}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="80 26.7"
            />
            <circle
                cx="20" cy="20" r="3"
                style={{ fill: color, animation: "omniPulse 1.5s ease-in-out infinite" }}
            />
            <g style={{ animation: "omniOrbit 2s linear infinite", transformOrigin: "20px 20px" }}>
                <circle cx="20" cy="5" r="2" style={{ fill: color }} opacity="0.6" />
            </g>
        </svg>
    );
}

// ─── OmniLoader: Main export ──────────────────────────────────────────────────
// IMPORTANT: The "inline" variant renders NO hooks — just a pure SVG spinner.
// This is critical because inline loaders are often conditionally swapped with
// other elements like <Icon />. If we used hooks here, React would throw
// "Rendered more hooks than during the previous render" (#310).

interface OmniLoaderProps {
    engine?: EngineId | string;
    module?: string;
    message?: string;
    variant?: "inline" | "overlay" | "card";
    size?: number;
}

export function OmniLoader({
    engine = "default",
    module: moduleName,
    message,
    variant = "inline",
    size = 16,
}: OmniLoaderProps) {
    const meta = ENGINE_META[engine] || ENGINE_META.default;

    // ── Inline: PURE render, zero hooks ──
    if (variant === "inline") {
        // Inject styles lazily on first render (safe — runs during paint)
        if (typeof document !== "undefined") ensureStyles();
        return (
            <span role="status" aria-live="polite" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <OmniSpinner color={meta.color} size={size} />
                {message && <span style={{ fontSize: 13 }}>{message}</span>}
            </span>
        );
    }

    // ── Card & Overlay use hooks (always rendered unconditionally) ──
    return <OmniLoaderWithMessages engine={engine} moduleName={moduleName} message={message} variant={variant} size={size} meta={meta} />;
}

// ─── Card & Overlay (with hooks for message rotation) ─────────────────────────

function OmniLoaderWithMessages({
    engine,
    moduleName,
    message,
    variant,
    size,
    meta,
}: {
    engine: string;
    moduleName?: string;
    message?: string;
    variant: "card" | "overlay";
    size: number;
    meta: { label: string; color: string; glow: string; forte: string };
}) {
    const [msgIndex, setMsgIndex] = useState(0);
    const isNeutral = engine === "default";
    const messages = message ? [message] : (moduleName && MODULE_MESSAGES[moduleName]) || (isNeutral ? LOADING_MESSAGES : DEFAULT_MESSAGES);

    useEffect(() => {
        ensureStyles();
    }, []);

    useEffect(() => {
        if (message) return;
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [message, messages.length]);

    // ── Card ──
    if (variant === "card") {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 16, padding: "32px 20px",
                borderRadius: 16, textAlign: "center",
                background: tom(meta.color, 2),
                border: `1.5px solid ${tom(meta.color, 9)}`,
            }}>
                <OmniSpinner color={meta.color} size={32} />
                <div>
                    <div style={{
                        fontSize: 13, fontWeight: 700, color: meta.forte,
                        marginBottom: 4,
                    }}>
                        {isNeutral ? "Carregando..." : `${meta.label} processando`}
                    </div>
                    <div style={{
                        fontSize: 12, color: "var(--tinta-2)",
                        transition: "opacity .3s",
                        minHeight: 18,
                    }}>
                        {messages[msgIndex]}
                    </div>
                </div>
            </div>
        );
    }

    // ── Overlay ──
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
            background: "color-mix(in srgb, var(--noite) 85%, transparent)",
            backdropFilter: "blur(8px)",
        }}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
                padding: "40px 48px", borderRadius: 24,
                background: "var(--superficie)",
                border: `1.5px solid ${tom(meta.color, 19)}`,
                boxShadow: `0 0 60px ${meta.glow}, var(--sombra-2)`,
            }}>
                <OmniSpinner color={meta.color} size={48} />

                <div style={{ textAlign: "center" }}>
                    <div style={{
                        fontSize: 16, fontWeight: 800, color: meta.forte,
                        marginBottom: 8,
                        display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                    }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: meta.color, boxShadow: `0 0 8px ${meta.color}`,
                        }} />
                        {meta.label}
                    </div>
                    <div
                        key={msgIndex}
                        style={{
                            fontSize: 13, color: "var(--tinta-2)",
                            animation: "omniFadeIn .4s ease",
                            minHeight: 20,
                        }}
                    >
                        {messages[msgIndex]}
                    </div>
                </div>

                {/* Progress dots */}
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {messages.map((_, i) => (
                        <div key={i} style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: i === msgIndex ? meta.color : tom(meta.color, 19),
                            transition: "background .3s",
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
