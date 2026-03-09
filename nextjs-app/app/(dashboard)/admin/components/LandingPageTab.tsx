"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Globe, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

/**
 * Admin tab to enable/disable the public landing page.
 * Uses platform_config key "landing_page_enabled".
 */
export function LandingPageTab() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/platform-config?key=landing_page_enabled");
            if (res.ok) {
                const data = await res.json();
                setEnabled(data.value === "true" || data.value === true);
            }
        } catch {
            /* fallback */
        } finally {
            setLoading(false);
        }
    }

    async function toggleLandingPage() {
        const newValue = !enabled;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/platform-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "landing_page_enabled",
                    value: String(newValue),
                }),
            });
            if (res.ok) {
                setEnabled(newValue);
            } else {
                alert("Erro ao salvar configuração.");
            }
        } catch {
            alert("Erro ao salvar configuração.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-bold text-slate-900">Landing Page</h2>
            </div>

            <p className="text-sm text-slate-600 max-w-xl">
                Quando habilitada, visitantes que acessam a plataforma sem estar logados
                veem uma página institucional de divulgação antes do login.
            </p>

            {/* Toggle */}
            <div
                className="flex items-center justify-between p-5 rounded-2xl border transition-all"
                style={{
                    background: enabled
                        ? "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))"
                        : "#fafafa",
                    borderColor: enabled ? "#c7d2fe" : "#e2e8f0",
                }}
            >
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleLandingPage}
                        disabled={saving}
                        className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                        aria-label={enabled ? "Desabilitar landing page" : "Habilitar landing page"}
                    >
                        {enabled ? (
                            <ToggleRight className="w-10 h-10 text-indigo-500" />
                        ) : (
                            <ToggleLeft className="w-10 h-10 text-slate-400" />
                        )}
                    </button>
                    <div>
                        <p className="font-bold text-slate-900">
                            {enabled ? "Landing Page Ativa" : "Landing Page Desativada"}
                        </p>
                        <p className="text-xs text-slate-500">
                            {enabled
                                ? "Visitantes verão a página institucional antes do login."
                                : "Visitantes serão direcionados diretamente ao login."}
                        </p>
                    </div>
                </div>
                <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                        background: enabled ? "#dbeafe" : "#f1f5f9",
                        color: enabled ? "#3b82f6" : "#94a3b8",
                    }}
                >
                    {enabled ? "ON" : "OFF"}
                </span>
            </div>

            {/* Preview button */}
            <a
                href="/landing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)",
                }}
            >
                <ExternalLink className="w-4 h-4" />
                Visualizar Landing Page
            </a>

            {/* Info callout */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                <p className="text-xs text-sky-800 leading-relaxed">
                    <strong>Como funciona:</strong> Quando ativa, o middleware da plataforma
                    detecta visitantes sem sessão e redireciona para <code>/landing</code>.
                    A página exibe informações institucionais, módulos disponíveis, motores de IA
                    e um botão &quot;Entrar&quot; que leva ao login. Usuários já logados não são
                    afetados e veem o dashboard normalmente.
                </p>
            </div>
        </div>
    );
}
