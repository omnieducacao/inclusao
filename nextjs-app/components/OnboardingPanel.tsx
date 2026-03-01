"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, HelpCircle, X } from "lucide-react";

export interface OnboardingStep {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface OnboardingPanelProps {
    moduleKey: string;
    moduleTitle: string;
    moduleSubtitle: string;
    accentColor: string;
    accentColorLight: string;
    steps: OnboardingStep[];
    onStart?: () => void;
}

export function OnboardingPanel({
    moduleKey,
    moduleTitle,
    moduleSubtitle,
    accentColor,
    accentColorLight,
    steps,
    onStart,
}: OnboardingPanelProps) {
    const storageKey = `onboarding_${moduleKey}`;
    const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        const done = localStorage.getItem(storageKey);
        if (!done) {
            const timer = setTimeout(() => {
                setDismissed(false);
                requestAnimationFrame(() => setFadeIn(true));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [storageKey]);

    const dismiss = () => {
        setFadeIn(false);
        setTimeout(() => {
            localStorage.setItem(storageKey, "done");
            setDismissed(true);
            onStart?.();
        }, 300);
    };

    if (dismissed) return null;

    return (
        <div
            style={{
                opacity: fadeIn ? 1 : 0,
                transform: fadeIn ? "translateY(0)" : "translateY(12px)",
                transition: "all .4s cubic-bezier(.4,0,.2,1)",
                marginBottom: 24,
            }}
        >
            <div
                style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    border: `1.5px solid ${accentColorLight}`,
                    background: "var(--bg-secondary, rgba(15,23,42,.5))",
                    position: "relative",
                }}
            >
                {/* Gradient top bar */}
                <div style={{
                    height: 4,
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColorLight})`,
                }} />

                {/* Close button */}
                <button
                    onClick={dismiss}
                    style={{
                        position: "absolute", top: 14, right: 14,
                        width: 28, height: 28, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                        background: "var(--bg-tertiary, rgba(15,23,42,.3))",
                        color: "var(--text-muted, #94a3b8)", cursor: "pointer",
                        transition: "all .15s",
                    }}
                    title="Fechar guia"
                >
                    <X size={14} />
                </button>

                {/* Header */}
                <div style={{ padding: "24px 28px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: `linear-gradient(135deg, ${accentColor}, ${accentColorLight})`,
                            color: "#fff",
                        }}>
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <h3 style={{
                                margin: 0, fontSize: 17, fontWeight: 800,
                                color: "var(--text-primary, #e2e8f0)",
                            }}>
                                {moduleTitle}
                            </h3>
                            <p style={{
                                margin: 0, fontSize: 12,
                                color: "var(--text-muted, #94a3b8)",
                            }}>
                                {moduleSubtitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div style={{
                    display: "flex", gap: 0, padding: "20px 28px 24px",
                    overflowX: "auto",
                }}>
                    {steps.map((step, i) => (
                        <React.Fragment key={i}>
                            <div style={{
                                flex: 1, minWidth: 140,
                                display: "flex", flexDirection: "column", alignItems: "center",
                                textAlign: "center", gap: 8,
                            }}>
                                {/* Number circle + icon */}
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: `${accentColor}14`,
                                    border: `1.5px solid ${accentColor}30`,
                                    color: accentColor, position: "relative",
                                }}>
                                    {step.icon}
                                    <span style={{
                                        position: "absolute", top: -6, right: -6,
                                        width: 18, height: 18, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 10, fontWeight: 800,
                                        background: accentColor, color: "#fff",
                                    }}>{i + 1}</span>
                                </div>
                                <div style={{
                                    fontSize: 13, fontWeight: 700,
                                    color: "var(--text-primary, #e2e8f0)",
                                }}>
                                    {step.title}
                                </div>
                                <div style={{
                                    fontSize: 11, lineHeight: 1.4,
                                    color: "var(--text-muted, #94a3b8)",
                                    maxWidth: 150,
                                }}>
                                    {step.description}
                                </div>
                            </div>

                            {/* Connector */}
                            {i < steps.length - 1 && (
                                <div style={{
                                    display: "flex", alignItems: "center",
                                    padding: "0 2px", marginTop: 16,
                                }}>
                                    <ChevronRight size={16} style={{
                                        color: accentColor, opacity: 0.4,
                                    }} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* CTA */}
                <div style={{
                    padding: "0 28px 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted, #94a3b8)" }}>
                        Você pode rever este guia a qualquer momento
                    </span>
                    <button
                        onClick={dismiss}
                        style={{
                            padding: "10px 24px", borderRadius: 10,
                            border: "none", cursor: "pointer",
                            background: `linear-gradient(135deg, ${accentColor}, ${accentColorLight})`,
                            color: "#fff", fontSize: 13, fontWeight: 700,
                            display: "flex", alignItems: "center", gap: 6,
                            boxShadow: `0 4px 16px ${accentColor}30`,
                            transition: "all .2s",
                        }}
                    >
                        Começar <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Small button to re-show the onboarding panel.
 */
export function OnboardingResetButton({
    moduleKey,
    onReset,
}: {
    moduleKey: string;
    onReset: () => void;
}) {
    return (
        <button
            onClick={() => {
                localStorage.removeItem(`onboarding_${moduleKey}`);
                onReset();
            }}
            title="Ver guia novamente"
            style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 8,
                border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                background: "transparent",
                color: "var(--text-muted, #94a3b8)",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                transition: "all .15s",
            }}
        >
            <HelpCircle size={12} /> Guia
        </button>
    );
}
