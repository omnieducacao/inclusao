"use client";

import { OmniLoader } from "@/components/OmniLoader";
import { useState, useEffect } from "react";
import { ExternalLink, Globe, ToggleLeft, ToggleRight, Info } from "lucide-react";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";

/**
 * Aba de administração: liga/desliga a página inicial pública (landing page).
 * Uses platform_config key "landing_page_enabled".
 */
export function LandingPageTab() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mensagem, setMensagem] = useState<Mensagem | null>(null);

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
        setMensagem(null);
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
                setMensagem({ tipo: "erro", texto: "Não foi possível salvar a configuração. Tente de novo." });
            }
        } catch {
            setMensagem({ tipo: "erro", texto: "Não foi possível salvar a configuração. Tente de novo." });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "48px 0", justifyContent: "center" }}>
                <OmniLoader size={20} /> Carregando…
            </p>
        );
    }

    return (
        <section className="omni-cartao" aria-labelledby="landing-titulo" style={{ gap: 16 }}>
            <h3 id="landing-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
                <Globe size={20} aria-hidden /> Página inicial pública
            </h3>

            <p className="omni-apoio" style={{ maxWidth: 640 }}>
                Quando ligada, quem abre omnisfera.net sem ter entrado vê a home de apresentação da
                Omnisfera, com a demonstração e o contato. Desligada, vê o conteúdo sobre inclusão.
            </p>

            <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />

            {/* Liga/desliga */}
            <div
                className={`omni-cartao ${enabled ? "" : "omni-cartao--plano"}`}
                style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: 20, borderColor: enabled ? "var(--acao)" : undefined }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        onClick={toggleLandingPage}
                        disabled={saving}
                        className="omni-btn omni-btn--discreto omni-btn--icone"
                        aria-label="Página inicial pública"
                        style={{ color: enabled ? "var(--acao)" : "var(--tinta-3)", width: 56, height: 56 }}
                    >
                        {saving ? (
                            <OmniLoader size={28} />
                        ) : enabled ? (
                            <ToggleRight size={40} aria-hidden />
                        ) : (
                            <ToggleLeft size={40} aria-hidden />
                        )}
                    </button>
                    <div>
                        <p style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
                            {enabled ? "Página inicial ligada" : "Página inicial desligada"}
                        </p>
                        <p className="omni-apoio" style={{ fontSize: 13 }}>
                            {enabled
                                ? "Visitantes veem a home de apresentação da Omnisfera."
                                : "Visitantes veem o conteúdo sobre inclusão (/inclusao)."}
                        </p>
                    </div>
                </div>
                <span className={`omni-estado ${enabled ? "omni-estado--sucesso" : "omni-estado--neutro"}`}>
                    {enabled ? "Ligada" : "Desligada"}
                </span>
            </div>

            {/* Ver a página */}
            <div>
                <a
                    href="/landing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="omni-btn omni-btn--secundario"
                >
                    <ExternalLink size={18} aria-hidden />
                    Ver a página inicial
                </a>
            </div>

            {/* Como funciona */}
            <div className="omni-aviso omni-aviso--info" style={{ maxWidth: "none" }}>
                <Info className="omni-aviso__icone" aria-hidden />
                <div>
                    <div className="omni-aviso__titulo">Como funciona</div>
                    <div className="omni-aviso__texto">
                        Quem ainda não entrou e abre o endereço principal vê a home de apresentação: o problema que a
                        Omnisfera resolve, os vídeos dos três papéis, os módulos, as perguntas frequentes e os botões
                        &quot;Ver a demonstração&quot; e &quot;Falar com a equipe&quot;. Desligada, o endereço principal leva ao
                        conteúdo sobre inclusão. Quem já entrou não é afetado e vê o painel normalmente.
                    </div>
                </div>
            </div>
        </section>
    );
}
