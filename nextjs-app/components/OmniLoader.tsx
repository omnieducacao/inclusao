"use client";

import React, { useState, useEffect, useId } from "react";
import type { EngineId } from "@/lib/ai-engines";

// ─── Engine Metadata ──────────────────────────────────────────────────────────

const ENGINE_META: Record<string, { label: string; color: string; glow: string }> = {
    red: { label: "OmniRed", color: "#ef4444", glow: "rgba(239,68,68,.25)" },
    blue: { label: "OmniBlue", color: "#3b82f6", glow: "rgba(59,130,246,.25)" },
    green: { label: "OmniGreen", color: "#10b981", glow: "rgba(16,185,129,.25)" },
    orange: { label: "OmniOrange", color: "#f59e0b", glow: "rgba(245,158,11,.25)" },
    yellow: { label: "OmniYellow", color: "#eab308", glow: "rgba(234,179,8,.25)" },
};

// ─── Contextual Messages ──────────────────────────────────────────────────────

const DEFAULT_MESSAGES = [
    "Analisando o perfil pedagógico...",
    "Calibrando ao nível do estudante...",
    "Gerando adaptações individualizadas...",
    "Estruturando o documento...",
    "Verificando alinhamento com BNCC...",
];

const MODULE_MESSAGES: Record<string, string[]> = {
    diagnostica: [
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
    paee: [
        "Montando plano de atendimento...",
        "Gerando atividades especializadas...",
        "Estruturando o ciclo de atendimento...",
    ],
};

// ─── Global CSS injection (once) ──────────────────────────────────────────────

let stylesInjected = false;
function injectGlobalStyles() {
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

// ─── Variants ─────────────────────────────────────────────────────────────────

interface OmniLoaderProps {
    engine?: EngineId | string;
    module?: string;
    message?: string;
    variant?: "inline" | "overlay" | "card";
    size?: number;
}

export function OmniLoader({
    engine = "red",
    module: moduleName,
    message,
    variant = "inline",
    size = 16,
}: OmniLoaderProps) {
    const meta = ENGINE_META[engine] || ENGINE_META.red;
    const [msgIndex, setMsgIndex] = useState(0);
    const messages = message ? [message] : (moduleName && MODULE_MESSAGES[moduleName]) || DEFAULT_MESSAGES;

    useEffect(() => {
        injectGlobalStyles();
    }, []);

    useEffect(() => {
        if (variant === "inline" || message) return;
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [variant, message, messages.length]);

    // ── Inline: small spinner for buttons ──
    if (variant === "inline") {
        return (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <OmniSpinner color={meta.color} size={size} />
                {message && <span style={{ fontSize: 13 }}>{message}</span>}
            </span>
        );
    }

    // ── Card: inside a section ──
    if (variant === "card") {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 16, padding: "32px 20px",
                borderRadius: 16, textAlign: "center",
                background: `${meta.color}06`,
                border: `1.5px solid ${meta.color}18`,
            }}>
                <OmniSpinner color={meta.color} size={32} />
                <div>
                    <div style={{
                        fontSize: 13, fontWeight: 700, color: meta.color,
                        marginBottom: 4,
                    }}>
                        {meta.label} processando
                    </div>
                    <div style={{
                        fontSize: 12, color: "var(--text-muted, #94a3b8)",
                        transition: "opacity .3s",
                        minHeight: 18,
                    }}>
                        {messages[msgIndex]}
                    </div>
                </div>
            </div>
        );
    }

    // ── Overlay: full-section overlay ──
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
            background: "rgba(2,6,23,.85)",
            backdropFilter: "blur(8px)",
        }}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
                padding: "40px 48px", borderRadius: 24,
                background: "var(--bg-secondary, rgba(15,23,42,.9))",
                border: `1.5px solid ${meta.color}30`,
                boxShadow: `0 0 60px ${meta.glow}, 0 20px 40px rgba(0,0,0,.4)`,
            }}>
                <OmniSpinner color={meta.color} size={48} />

                <div style={{ textAlign: "center" }}>
                    <div style={{
                        fontSize: 16, fontWeight: 800, color: meta.color,
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
                            fontSize: 13, color: "var(--text-muted, #94a3b8)",
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
                            background: i === msgIndex ? meta.color : `${meta.color}30`,
                            transition: "background .3s",
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Spinner SVG (pure inline animation) ──────────────────────────────────────

function OmniSpinner({ color, size }: { color: string; size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            style={{ animation: "omniSpin 1.2s linear infinite" }}
        >
            {/* Outer ring */}
            <circle cx="20" cy="20" r="17" stroke={`${color}25`} strokeWidth="3" />
            {/* Animated arc */}
            <circle
                cx="20" cy="20" r="17"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="80 26.7"
            />
            {/* Center dot */}
            <circle
                cx="20" cy="20" r="3"
                fill={color}
                style={{ animation: "omniPulse 1.5s ease-in-out infinite" }}
            />
            {/* Orbiting dot */}
            <g style={{ animation: "omniOrbit 2s linear infinite", transformOrigin: "20px 20px" }}>
                <circle cx="20" cy="5" r="2" fill={color} opacity="0.6" />
            </g>
        </svg>
    );
}
